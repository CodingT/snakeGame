from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, leaderboard, sessions

app = FastAPI(
    title="Snake Game API",
    description="API for Snake Game with Auth, Leaderboard, and Spectator features.",
    version="1.0.0"
)

# Create tables on startup
from app.database import engine, Base
# Import models to ensure they are registered with Base
from app import db_models

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(sessions.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Snake Game API"}
