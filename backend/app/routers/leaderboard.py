from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from ..models import LeaderboardEntry as LeaderboardModel, SubmitScoreRequest
from ..db_models import LeaderboardEntry as LeaderboardDB, User
from ..database import get_db
from ..dependencies import get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[LeaderboardModel])
async def get_leaderboard(limit: int = 10, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LeaderboardDB).order_by(desc(LeaderboardDB.score)).limit(limit)
    )
    entries = result.scalars().all()
    
    # Calculate rank dynamically (simple index + 1 for now)
    # Ideally should use window functions but this is enough for list display
    response_entries = []
    for index, entry in enumerate(entries):
        rank = index + 1
        # Pydantic model expects snake_case internals but will output camelCase
        response_entries.append(LeaderboardModel(
            id=entry.id,
            user_id=entry.user_id,
            username=entry.username,
            score=entry.score,
            created_at=entry.created_at,
            rank=rank
        ))
    
    return response_entries

@router.post("", response_model=LeaderboardModel, status_code=status.HTTP_201_CREATED)
async def submit_score(
    request: SubmitScoreRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    entry = LeaderboardDB(
        id=str(uuid.uuid4()),
        user_id=request.userId,
        username=request.username,
        score=request.score,
        created_at=datetime.now()
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    
    # Calculate rank
    # Count how many scores are strictly greater
    rank_query = await db.execute(
        select(func.count(LeaderboardDB.id)).where(LeaderboardDB.score > request.score)
    )
    rank = rank_query.scalar_one() + 1
    
    return LeaderboardModel(
        id=entry.id,
        user_id=entry.user_id,
        username=entry.username,
        score=entry.score,
        created_at=entry.created_at,
        rank=rank
    )
