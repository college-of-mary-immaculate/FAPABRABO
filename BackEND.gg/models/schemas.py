from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class GameBase(BaseModel):
    name: str
    description: Optional[str] = None
    genre: List[str] = []
    publisher: Optional[str] = None
    url: Optional[str] = None
    image: Optional[str] = None

class GameCreate(GameBase):
    pass

class Game(GameBase):
    id: int

    class Config:
        orm_mode = True