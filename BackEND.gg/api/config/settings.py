from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB connection string
    DATABASE_URL: Optional[str] = None

    # JWT configs (if you plan to use)
    SECRET_KEY: str = "secret"
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env.example"  # environment file path


# Instantiate once
settings = Settings()
