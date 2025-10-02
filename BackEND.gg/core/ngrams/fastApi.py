from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import csv
import os
from collections import Counter
from levenshtein import levenshtein_distance 
from model import NGrams
from typing import Optional


app = FastAPI()

# Allow frontend to fetch from backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or set ["http://localhost:5173"] for your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load NGrams model once
model = NGrams()
model.process_names("../scraper/datasets/all_games.csv")

@app.get("/suggest")
def suggest(q: str = Query(..., min_length=1), top_k: int = 5):
    suggestions = model.suggest_next(q, top_k=top_k)
    return {"input": q, "suggestions": suggestions}