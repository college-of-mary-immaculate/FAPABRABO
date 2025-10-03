from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import csv
import os
import sys
from collections import Counter
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from core.ngrams.model import NGrams
from typing import Optional
from core.naivebayes.model import GenreClassifier


app = FastAPI()

# Allow frontend to fetch from backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or set ["http://localhost:5173"] for your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


datasets = "../scraper/datasets/all_games.csv"

# Load NGrams model once
model = NGrams()
model.process_names(datasets)

clf = GenreClassifier()
test_set = clf.train(datasets)   # train model on dataset

@app.get("/suggest")
def suggest(q: str = Query(..., min_length=1), top_k: int = 5):
    suggestions = model.suggest_next(q, top_k=top_k)
    return {"input": q, "suggestions": suggestions}


@app.get("/search")
def search(q: str = Query(..., min_length=1), top_k: int = 10):
    query = q.strip().lower()
    norm_query = clf.clean_genre(query)
    results = []

    # Check publisher
    for g in clf.games:
        if g.get("publisher") and g["publisher"].lower() in norm_query:
            results.append({
                "name": g["name"],
                "publisher": g["publisher"],
                "genre": g.get("genre", ""),
                "description": g.get("description", "")
            })
            if len(results) >= top_k:
                break

    # Check genre
    if len(results) < top_k:
        for g in clf.games:
            genre_clean = clf.clean_genre(g.get("genre", "").lower())
            if genre_clean and (genre_clean in norm_query or norm_query in genre_clean):
                results.append({
                    "name": g["name"],
                    "publisher": g.get("publisher", ""),
                    "genre": g.get("genre", ""),
                    "description": g.get("description", "")
                })
                if len(results) >= top_k:
                    break

    # Check title
    if len(results) < top_k:
        for g in clf.games:
            if g.get("name") and g["name"].lower() in norm_query:
                results.append({
                    "name": g["name"],
                    "publisher": g.get("publisher", ""),
                    "genre": g.get("genre", ""),
                    "description": g.get("description", "")
                })
                if len(results) >= top_k:
                    break

    # Check description
    if len(results) < top_k:
        for g in clf.games:
            if g.get("description") and g["description"].lower() in norm_query:
                results.append({
                    "name": g["name"],
                    "publisher": g.get("publisher", ""),
                    "genre": g.get("genre", ""),
                    "description": g.get("description", "")
                })
                if len(results) >= top_k:
                    break

    return {"query": q, "results": results[:top_k]}