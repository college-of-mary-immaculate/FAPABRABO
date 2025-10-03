from typing import Optional
from pydantic_settings import BaseSettings
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import models  # import your beanie document models


class Settings(BaseSettings):
    # database configurations
    DATABASE_URL: Optional[str] = None

    # JWT
    secret_key: str = "secret"
    algorithm: str = "HS256"

    class Config:
        env_file = ".env.dev"  # load from .env.dev


async def initiate_database():
    client = AsyncIOMotorClient(Settings().DATABASE_URL)
    await init_beanie(
        database=client.get_default_database(),
        document_models=[models.User, models.Game]  # replace with your Beanie models
    )
