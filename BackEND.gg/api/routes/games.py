from fastapi import APIRouter, HTTPException
from typing import List, Optional
from .models.schemas import Game, GameCreate

router = APIRouter()

# Mock database
fake_db = []

@router.get("/", response_model=List[Game])
async def list_games(limit: int = 10, offset: int = 0):
    return fake_db[offset:offset + limit]

@router.post("/", response_model=Game, status_code=201)
async def create_game(game: GameCreate):
    game_dict = game.dict()
    game_dict["id"] = len(fake_db) + 1
    fake_db.append(game_dict)
    return game_dict

@router.get("/{game_id}", response_model=Game)
async def get_game(game_id: int):
    if game_id > len(fake_db) or game_id < 1:
        raise HTTPException(status_code=404, detail="Game not found")
    return fake_db[game_id - 1]