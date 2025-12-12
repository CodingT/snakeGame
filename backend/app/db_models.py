from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.sql import func
import uuid
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    username = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    username = Column(String, nullable=False)
    score = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Store game state as JSON
    snake = Column(JSON, nullable=True)
    food = Column(JSON, nullable=True)
    direction = Column(String, default="RIGHT")
    
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
