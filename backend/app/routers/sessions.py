from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import (
    GameSession as SessionModel, CreateSessionRequest, UpdateSessionRequest, 
    EndSessionRequest, Position, Direction
)
from ..db_models import GameSession as SessionDB, User
from ..database import get_db
from ..dependencies import get_current_user
from datetime import datetime
from fastapi.encoders import jsonable_encoder
import uuid

router = APIRouter(prefix="/sessions", tags=["Game Sessions"])

@router.get("", response_model=List[SessionModel])
async def get_active_sessions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SessionDB).where(SessionDB.is_active == True))
    return result.scalars().all()

@router.post("", response_model=SessionModel, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: CreateSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    initial_snake = [
        {"x": 10, "y": 10},
        {"x": 9, "y": 10},
        {"x": 8, "y": 10}
    ]
    
    session = SessionDB(
        id=str(uuid.uuid4()),
        user_id=request.userId,
        username=request.username,
        score=0,
        is_active=True,
        snake=initial_snake, # SQLAlchemy JSON field handles list/dict
        food={"x": 15, "y": 15},
        direction="RIGHT",
        started_at=datetime.now()
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/{session_id}", response_model=SessionModel)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SessionDB).where(SessionDB.id == session_id))
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    return session

@router.patch("/{session_id}", response_model=SessionModel)
async def update_session(
    session_id: str,
    updates: UpdateSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(SessionDB).where(SessionDB.id == session_id))
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    update_data = updates.model_dump(exclude_unset=True, by_alias=True)
    
    # Manually map specific fields if needed or generic set
    # Note: alias mapping might produce 'isActive' but DB needs 'is_active'
    # Our Pydantic model is set to populate_by_name=True, but .model_dump() with by_alias=True uses alias
    # We should use default names (snake_case) for DB update, so by_alias=False (default is False)
    # But wait, our Pydantic input model `UpdateSessionRequest` uses snake_case keys `is_active` internally.
    # So `updates.model_dump(exclude_unset=True)` should give `is_active`.
    
    for key, value in update_data.items():
        if key == 'snake' and value:
             session.snake = [jsonable_encoder(p) for p in value]
        elif key == 'food' and value:
             session.food = jsonable_encoder(value)
        elif key == 'direction' and value: # Convert Enum to string
             session.direction = value.value if hasattr(value, 'value') else value
        else:
             setattr(session, key, value)
    
    await db.commit()
    await db.refresh(session)
    return session

@router.post("/{session_id}/end")
async def end_session(
    session_id: str,
    request: EndSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(SessionDB).where(SessionDB.id == session_id))
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    session.is_active = False
    session.score = request.finalScore
    await db.commit()
    
    return {"message": "Session ended"}
