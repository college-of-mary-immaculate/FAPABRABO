import os
from fastapi import APIRouter, Query
from core.naivebayes.model import GenreClassifier

DATASET_PATH = os.getenv("DATASET_PATH", "core/scraper/datasets/all_games.csv")

router = APIRouter()

clf = GenreClassifier()
clf.train(DATASET_PATH)  # ensure train() stores description, url, image


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
        "siteUrl": g.get("url","/")}

# ----------------- Search endpoint -----------------
@router.get("/search")
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
