import os
from fastapi import APIRouter, Query
from core.naivebayes.model import GenreClassifier

DATASET_PATH = os.getenv("DATASET_PATH", "core/scraper/datasets/all_games.csv")

router = APIRouter()

clf = GenreClassifier()
clf.train(DATASET_PATH)


# ----------------- Helper -----------------
def safe_game_dict(g):
    """Return all CSV fields safely for frontend."""
    return {
        "id": str(hash(g.get("name", ""))),
        "name": g.get("name", ""),
        "publisher": g.get("publisher", ""),
        "genre": g.get("genre", ""),
        "description": g.get("description", "No description available"),
        "thumbnail": g.get("image", "/placeholder.svg"),
        "siteUrl": g.get("url", "/"),
    }


# ----------------- Search endpoint -----------------
@router.get("/search")
def search(q: str = Query(..., min_length=1)):
    query = q.lower().strip()

    # 1️⃣ Exact/partial name match
    title_matches = [
        safe_game_dict(g)
        for g in clf.games
        if query in g.get("name", "").lower()
    ]
    if title_matches:
        return {
            "intent": "title",
            "results": title_matches[:15],
            "probs": {g["name"]: 1.0 for g in title_matches[:15]},
        }

    # 2️⃣ Publisher match
    publisher_matches = [
        safe_game_dict(g)
        for g in clf.games
        if query in g.get("publisher", "").lower()
    ]
    if publisher_matches:
        return {
            "intent": "publisher",
            "results": publisher_matches[:15],
            "probs": {g["publisher"]: 1.0 for g in publisher_matches[:15]},
        }

    # 3️⃣ Description-based match (e.g. character names, story, etc.)
    desc_matches = [
        safe_game_dict(g)
        for g in clf.games
        if query in g.get("description", "").lower()
    ]
    if desc_matches:
        return {
            "intent": "description",
            "results": desc_matches[:15],
            "probs": {g["name"]: 0.8 for g in desc_matches[:15]},
        }

    # 4️⃣ Fallback: Naive Bayes prediction
    predicted_label, probs = clf.predict(query)

    if predicted_label is None:
        return {
            "intent": "none",
            "results": [],
            "probs": {},
            "message": "No confident match found.",
        }

    # 5️⃣ Match games by predicted label (genre/publisher/name)
    results = [
        safe_game_dict(g)
        for g in clf.games
        if predicted_label.lower() in g.get("genre", "").lower()
        or predicted_label.lower() in g.get("publisher", "").lower()
        or predicted_label.lower() in g.get("name", "").lower()
        or predicted_label.lower() in g.get("description", "").lower()
    ]

    return {
        "intent": "ai_predicted",
        "results": results[:15],
        "probs": probs,
        "predicted_label": predicted_label,
    }
