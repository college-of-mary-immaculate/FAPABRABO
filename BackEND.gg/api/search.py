from fastapi import APIRouter, Query, HTTPException
from typing import List
from ..models.schemas import Game

router = APIRouter()

@router.get("/", response_model=List[Game])
async def search_games(
    q: str = Query(..., min_length=1),
    limit: int = 10
):
    # Here you would integrate with your existing search logic
    # This is just a mock implementation
    return [{"id": 1, "name": f"Game matching {q}", "genre": ["Action"]}]