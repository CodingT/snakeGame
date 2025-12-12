from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from ..models import LoginRequest, SignupRequest, AuthResponse, User as UserModel
from ..db_models import User as UserDB
from ..database import get_db
from ..dependencies import create_access_token, get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserDB).where(UserDB.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    
    token = create_access_token(data={"sub": user.id})
    return {"user": user, "token": token}

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserDB).where(UserDB.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    new_user = UserDB(
        id=str(uuid.uuid4()),
        username=request.username,
        email=request.email,
        password_hash=get_password_hash(request.password)
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    token = create_access_token(data={"sub": new_user.id})
    return {"user": new_user, "token": token}

@router.post("/logout")
async def logout(current_user: UserDB = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserModel)
async def read_users_me(current_user: UserDB = Depends(get_current_user)):
    return current_user
