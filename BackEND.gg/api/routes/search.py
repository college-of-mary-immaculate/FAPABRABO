import os
import re
from fastapi import APIRouter, Query
from core.naivebayes.model import GenreClassifier

DATASET_PATH = os.getenv("DATASET_PATH", "core/scraper/datasets/all_games.csv")

router = APIRouter()

clf = GenreClassifier()
clf.train(DATASET_PATH)


# ----------------- Helper -----------------
def safe_game_dict(g):
    return {
        "id": str(hash(g.get("name", ""))),
        "name": g.get("name", ""),
        "publisher": g.get("publisher", ""),
        "genre": g.get("genre", ""),
        "tags": g.get("tags", ""),
        "description": g.get("description", "No description available"),
        "thumbnail": g.get("image", "/placeholder.svg"),
        "siteUrl": g.get("url", "/"),
    }


# ----------------- Search endpoint -----------------
@router.get("/search")
def search(q: str = Query(..., min_length=1)):
    query = q.lower().strip()
    normalized_query = re.sub(r"[^a-z0-9 ]", " ", query).replace(",", " ")
    normalized_query = re.sub(r"\s+", " ", normalized_query)

    def normalize_text(text: str):
        clean = re.sub(r"[^a-z0-9 ]", " ", text.lower())
        clean = re.sub(r"\s+", " ", clean)
        return clean.strip()

    def match(text):
        return normalized_query in normalize_text(text)

    # Check TAGS first (since "survival horror", "open world" etc. are tag-like)
    tag_matches = [safe_game_dict(g) for g in clf.games if match(g.get("tags", ""))]
    if tag_matches:
        return {
            "intent": "tags",
            "results": tag_matches[:15],
            "probs": {g["tags"]: 1.0 for g in tag_matches[:15]},
        }

    # Check GENRES (some CSVs store genre info instead of tags)
    genre_matches = [safe_game_dict(g) for g in clf.games if match(g.get("genre", ""))]
    if genre_matches:
        return {
            "intent": "genre",
            "results": genre_matches[:15],
            "probs": {g["genre"]: 1.0 for g in genre_matches[:15]},
        }

    # Title (must be strong match: exact or startswith)
    title_matches = [
        safe_game_dict(g)
        for g in clf.games
        if normalized_query == normalize_text(g.get("name", ""))  # exact
        or normalize_text(g.get("name", "")).startswith(normalized_query + " ")  # prefix
    ]
    if title_matches:
        return {
            "intent": "title",
            "results": title_matches[:15],
            "probs": {g["name"]: 1.0 for g in title_matches[:15]},
        }

    # Publisher
    publisher_matches = [safe_game_dict(g) for g in clf.games if match(g.get("publisher", ""))]
    if publisher_matches:
        return {
            "intent": "publisher",
            "results": publisher_matches[:15],
            "probs": {g["publisher"]: 1.0 for g in publisher_matches[:15]},
        }

    # Description
    desc_matches = [safe_game_dict(g) for g in clf.games if match(g.get("description", ""))]
    if desc_matches:
        return {
            "intent": "description",
            "results": desc_matches[:15],
            "probs": {g["name"]: 0.8 for g in desc_matches[:15]},
        }

    # AI fallback (Naive Bayes)
    predicted_label, probs = clf.predict(query)
    if not predicted_label:
        return {
            "intent": "none",
            "results": [],
            "probs": {},
            "message": "No confident match found.",
        }

    results = [
        safe_game_dict(g)
        for g in clf.games
        if match(g.get("genre", ""))
        or match(g.get("publisher", ""))
        or match(g.get("tags", ""))
        or match(g.get("name", ""))
        or match(g.get("description", ""))
    ]

    return {
        "intent": "ai_predicted",
        "results": results[:15],
        "probs": probs,
        "predicted_label": predicted_label,
    }
