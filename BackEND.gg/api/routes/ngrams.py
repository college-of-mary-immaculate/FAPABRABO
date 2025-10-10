# api/routes/ngrams.py
from fastapi import APIRouter, Query

from core.ngrams.model import NGrams
import os
DATASET_PATH = os.getenv("DATASET_PATH", "datasets/all_games.csv")

router = APIRouter()

# Load NGrams model once
model = NGrams()
model.process_names(DATASET_PATH)

@router.get("/suggest")
def suggest(q: str = Query(..., min_length=1), top_k: int = 5):
    suggestions = model.search_suggestions(q, top_k=top_k)
    return {"input": q, "suggestions": suggestions}
