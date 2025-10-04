from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import sys
from pathlib import Path

# ----------------- Fix module imports -----------------
core_path = Path(__file__).parent.parent  # points to "core" folder
sys.path.insert(0, str(core_path))

from model import NGrams
from naivebayes.model import GenreClassifier

# ----------------- FastAPI app -----------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Load models once -----------------
dataset_path = "../scraper/datasets/all_games.csv"

ngrams = NGrams()
ngrams.process_names(dataset_path)

clf = GenreClassifier()
clf.train(dataset_path)  # ensure train() stores description, url, image

# ----------------- Helper -----------------
def safe_game_dict(g):
    """Return all CSV fields safely for frontend."""
    return {
        "id": str(hash(g.get("name",""))),
        "name": g.get("name",""),
        "publisher": g.get("publisher",""),
        "genre": g.get("genre",""),
        "description": g.get("description","No description available"),
        "thumbnail": g.get("image","/placeholder.svg"),
        "siteUrl": g.get("url","/")
    }

# ----------------- Autocomplete endpoint -----------------
@app.get("/suggest")
def suggest(q: str = Query(..., min_length=1), top_k: int = 5):
    suggestions = ngrams.suggest_next(q, top_k=top_k)
    return {"input": q, "suggestions": suggestions}

# ----------------- Search endpoint -----------------
@app.get("/search")
def search(q: str = Query(..., min_length=1)):
    query = q.lower().strip()

    # 1️⃣ Partial title match
    title_matches = [safe_game_dict(g) for g in clf.games if g.get("name","").lower().find(query) != -1]
    if title_matches:
        return {"intent":"title","results":title_matches[:15],"probs": {g["name"]:1.0 for g in title_matches[:15]}}

    # 2️⃣ Publisher match
    publisher_matches = [safe_game_dict(g) for g in clf.games if g.get("publisher","").lower().find(query) != -1]
    if publisher_matches:
        return {"intent":"publisher","results":publisher_matches[:15],"probs": {g["publisher"]:1.0 for g in publisher_matches[:15]}}

    # 3️⃣ Fallback: Naive Bayes prediction
    predicted_label, probs = clf.predict(query)
    results = [
        safe_game_dict(g) for g in clf.games
        if g.get("genre","").lower().find(predicted_label.lower()) != -1
           or g.get("publisher","").lower().find(predicted_label.lower()) != -1
           or g.get("name","").lower().find(predicted_label.lower()) != -1
    ]

    return {"intent":"description","results":results[:15],"probs":probs}
