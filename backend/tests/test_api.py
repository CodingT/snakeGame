import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from main import app
from app.database import Base, get_db
from app import db_models

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool, # Keep data in memory for same thread
)

TestingSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False, autoflush=False, autocommit=False
)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    import asyncio
    # Create tables
    async def init_models():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    asyncio.run(init_models())
    yield
    # Drop tables (optional for memory db)
    async def drop_models():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    asyncio.run(drop_models())

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Snake Game API"}

def test_auth_flow():
    # Signup
    response = client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert data["user"]["username"] == "testuser"
    token = data["token"]
    
    # Login
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "token" in response.json()
    
    # Get Me
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"

def test_leaderboard():
    # Helper to get token
    signup_res = client.post("/auth/signup", json={
        "username": "leaderboard_user",
        "email": "lb@example.com",
        "password": "password123"
    })
    # If already exists (module scope db), login
    if signup_res.status_code == 400:
        login_res = client.post("/auth/login", json={
            "email": "lb@example.com",
            "password": "password123"
        })
        token = login_res.json()["token"]
    else:
        token = signup_res.json()["token"]
        
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/leaderboard", json={
        "userId": "some-uid",
        "username": "leaderboard_user",
        "score": 100
    }, headers=headers)
    assert response.status_code == 201
    assert response.json()["score"] == 100
    
    # Get leaderboard
    response = client.get("/leaderboard")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["score"] == 100

def test_game_sessions():
    signup_res = client.post("/auth/signup", json={
        "username": "session_user",
        "email": "session@example.com",
        "password": "password123"
    })
    token = signup_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create Session
    response = client.post("/sessions", json={
        "userId": "user1",
        "username": "session_user"
    }, headers=headers)
    assert response.status_code == 201
    session_id = response.json()["id"]
    
    # Get all sessions
    response = client.get("/sessions")
    assert response.status_code == 200
    # Note: we might see sessions from other tests if DB isn't cleared between tests
    assert len(response.json()) > 0
    
    # Update Session
    response = client.patch(f"/sessions/{session_id}", json={
        "score": 50,
        "direction": "UP"
    }, headers=headers)
    assert response.status_code == 200
    assert response.json()["score"] == 50
    assert response.json()["direction"] == "UP"
    
    # End Session
    response = client.post(f"/sessions/{session_id}/end", json={
        "finalScore": 50
    }, headers=headers)
    assert response.status_code == 200
    
    # Check if removed from active
    response = client.get("/sessions")
    active_ids = [s["id"] for s in response.json()]
    assert session_id not in active_ids
