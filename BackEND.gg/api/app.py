# api/app.py
from fastapi import FastAPI
from api.config.cors_config import CORSMiddleware
from api.routes.ngrams import router as ngrams_router
from api.routes.search import router as search_router

app = FastAPI(title="NLP Search Engine", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ngrams_router)
app.include_router(search_router)

#FAPABRABO\BackEND.gg> python -m uvicorn api.main:app --reload --port 8000

