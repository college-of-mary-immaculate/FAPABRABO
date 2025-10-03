# api/app.py
from fastapi import FastAPI
from api.config.cors_config import CORSMiddleware
from api.routes.ngrams import router as ngrams_router

app = FastAPI(title="NLP Search Engine", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include ngrams router with prefix
app.include_router(ngrams_router, prefix="/api")

#FAPABRABO\BackEND.gg> python -m uvicorn api.main:app --reload --port 8000

