from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"

class Position(BaseModel):
    x: int
    y: int

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    created_at: datetime = Field(alias="createdAt")
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    user: User
    token: str

class LeaderboardEntry(BaseModel):
    id: str
    user_id: str = Field(alias="userId")
    username: str
    score: int
    created_at: datetime = Field(alias="createdAt")
    rank: int

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class GameSession(BaseModel):
    id: str
    user_id: str = Field(alias="userId")
    username: str
    score: int
    is_active: bool = Field(alias="isActive")
    snake: Optional[List[Position]] = None
    food: Optional[Position] = None
    direction: Direction
    started_at: datetime = Field(alias="startedAt")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class CreateSessionRequest(BaseModel):
    userId: str # Request inputs usually stay as is, but we can map them in logic
    username: str

class UpdateSessionRequest(BaseModel):
    score: Optional[int] = None
    snake: Optional[List[Position]] = None
    food: Optional[Position] = None
    direction: Optional[Direction] = None
    is_active: Optional[bool] = Field(default=None, alias="isActive")

    model_config = ConfigDict(populate_by_name=True)

class EndSessionRequest(BaseModel):
    finalScore: int

class SubmitScoreRequest(BaseModel):
    userId: str
    username: str
    score: int
