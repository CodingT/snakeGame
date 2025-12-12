"""
Integration tests for the Snake Game API.
These tests use a real SQLite database to verify end-to-end functionality.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from main import app
from app.database import Base, get_db
from app import db_models

# Use in-memory SQLite for integration testing
SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool,
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
    # Drop tables
    async def drop_models():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
    asyncio.run(drop_models())


class TestAuthFlow:
    """Test authentication endpoints"""
    
    def test_signup_success(self):
        """Test successful user signup"""
        response = client.post("/auth/signup", json={
            "username": "integration_user",
            "email": "integration@example.com",
            "password": "securepassword123"
        })
        assert response.status_code == 201
        data = response.json()
        assert "token" in data
        assert data["user"]["username"] == "integration_user"
        assert data["user"]["email"] == "integration@example.com"
    
    def test_signup_duplicate_email(self):
        """Test signup with duplicate email fails"""
        response = client.post("/auth/signup", json={
            "username": "another_user",
            "email": "integration@example.com",  # Already exists
            "password": "password"
        })
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()
    
    def test_login_success(self):
        """Test successful login"""
        response = client.post("/auth/login", json={
            "email": "integration@example.com",
            "password": "securepassword123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["email"] == "integration@example.com"
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = client.post("/auth/login", json={
            "email": "integration@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    def test_get_current_user(self):
        """Test getting current user info"""
        # Login first
        login_res = client.post("/auth/login", json={
            "email": "integration@example.com",
            "password": "securepassword123"
        })
        token = login_res.json()["token"]
        
        # Get current user
        response = client.get("/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        assert response.json()["email"] == "integration@example.com"


class TestLeaderboard:
    """Test leaderboard endpoints"""
    
    def test_submit_score(self):
        """Test submitting a score to leaderboard"""
        # Login first
        login_res = client.post("/auth/login", json={
            "email": "integration@example.com",
            "password": "securepassword123"
        })
        token = login_res.json()["token"]
        user_id = login_res.json()["user"]["id"]
        
        # Submit score
        response = client.post("/leaderboard", json={
            "userId": user_id,
            "username": "integration_user",
            "score": 250
        }, headers={"Authorization": f"Bearer {token}"})
        
        assert response.status_code == 201
        data = response.json()
        assert data["score"] == 250
        assert data["username"] == "integration_user"
        assert "rank" in data
    
    def test_get_leaderboard(self):
        """Test retrieving leaderboard"""
        response = client.get("/leaderboard?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify scores are sorted descending
        if len(data) > 1:
            assert data[0]["score"] >= data[1]["score"]
    
    def test_leaderboard_ranking(self):
        """Test that ranks are calculated correctly"""
        # Login
        login_res = client.post("/auth/login", json={
            "email": "integration@example.com",
            "password": "securepassword123"
        })
        token = login_res.json()["token"]
        user_id = login_res.json()["user"]["id"]
        
        # Submit multiple scores
        scores = [100, 500, 300]
        for score in scores:
            client.post("/leaderboard", json={
                "userId": user_id,
                "username": "integration_user",
                "score": score
            }, headers={"Authorization": f"Bearer {token}"})
        
        # Get leaderboard
        response = client.get("/leaderboard")
        data = response.json()
        
        # Verify ranks are sequential
        ranks = [entry["rank"] for entry in data]
        assert ranks == list(range(1, len(data) + 1))


class TestGameSessions:
    """Test game session endpoints"""
    
    def test_create_session(self):
        """Test creating a game session"""
        # Login
        login_res = client.post("/auth/login", json={
            "email": "integration@example.com",
            "password": "securepassword123"
        })
        token = login_res.json()["token"]
        user_id = login_res.json()["user"]["id"]
        
        # Create session
        response = client.post("/sessions", json={
            "userId": user_id,
            "username": "integration_user"
        }, headers={"Authorization": f"Bearer {token}"})
        
        assert response.status_code == 201
        data = response.json()
        assert data["userId"] == user_id
        assert data["isActive"] == True
        assert data["score"] == 0
        return data["id"]
    
    def test_get_active_sessions(self):
        """Test retrieving active sessions"""
        response = client.get("/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned sessions should be active
        for session in data:
            assert session["isActive"] == True
    
    def test_update_session(self):
        """Test updating a game session"""
        # Create session first
        session_id = self.test_create_session()
        
        # Login
        login_res = client.post("/auth/login", json={
            "email": "integration@example.com",
            "password": "securepassword123"
        })
        token = login_res.json()["token"]
        
        # Update session
        response = client.patch(f"/sessions/{session_id}", json={
            "score": 150,
            "direction": "LEFT"
        }, headers={"Authorization": f"Bearer {token}"})
        
        assert response.status_code == 200
        data = response.json()
        assert data["score"] == 150
        assert data["direction"] == "LEFT"
    
    def test_end_session(self):
        """Test ending a game session"""
        # Create session
        session_id = self.test_create_session()
        
        # Login
        login_res = client.post("/auth/login", json={
            "email": "integration@example.com",
            "password": "securepassword123"
        })
        token = login_res.json()["token"]
        
        # End session
        response = client.post(f"/sessions/{session_id}/end", json={
            "finalScore": 200
        }, headers={"Authorization": f"Bearer {token}"})
        
        assert response.status_code == 200
        
        # Verify session is no longer active
        active_sessions = client.get("/sessions").json()
        active_ids = [s["id"] for s in active_sessions]
        assert session_id not in active_ids


class TestEndToEndFlow:
    """Test complete user journey"""
    
    def test_complete_game_flow(self):
        """Test a complete game flow from signup to leaderboard"""
        # 1. Signup
        signup_res = client.post("/auth/signup", json={
            "username": "e2e_player",
            "email": "e2e@example.com",
            "password": "testpass"
        })
        assert signup_res.status_code == 201
        token = signup_res.json()["token"]
        user_id = signup_res.json()["user"]["id"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Create game session
        session_res = client.post("/sessions", json={
            "userId": user_id,
            "username": "e2e_player"
        }, headers=headers)
        assert session_res.status_code == 201
        session_id = session_res.json()["id"]
        
        # 3. Update session (simulate gameplay)
        update_res = client.patch(f"/sessions/{session_id}", json={
            "score": 75
        }, headers=headers)
        assert update_res.status_code == 200
        
        # 4. End session
        end_res = client.post(f"/sessions/{session_id}/end", json={
            "finalScore": 75
        }, headers=headers)
        assert end_res.status_code == 200
        
        # 5. Submit score to leaderboard
        score_res = client.post("/leaderboard", json={
            "userId": user_id,
            "username": "e2e_player",
            "score": 75
        }, headers=headers)
        assert score_res.status_code == 201
        
        # 6. Verify score appears in leaderboard
        lb_res = client.get("/leaderboard")
        leaderboard = lb_res.json()
        user_scores = [entry for entry in leaderboard if entry["username"] == "e2e_player"]
        assert len(user_scores) > 0
        assert any(entry["score"] == 75 for entry in user_scores)
