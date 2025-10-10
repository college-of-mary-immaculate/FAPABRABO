import os
import re
from fastapi import APIRouter, Query
from core.naivebayes.model import GenreClassifier
from core.tfidf.consine import rank_documents
from core.tfidf.retrival_tf import docs  # MongoDB docs with tfidf_vector


DATASET_PATH = os.getenv("DATASET_PATH", "datasets/all_games.csv")

router = APIRouter()

clf = GenreClassifier()
clf.train(DATASET_PATH)


# ----------------- Helper -----------------
def safe_game_dict(g):
    """Normalize MongoDB document to a clean, frontend-safe format."""
    if not isinstance(g, dict):
        return {}
    return {
        "id": str(g.get("_id", "")),
        "name": g.get("name", "Unknown Game"),
        "publisher": g.get("publisher", "Unknown Publisher"),
        "genre": normalize_text(g.get("genre", "")),
        "tags": g.get("tags", ""),
        "description": g.get("description", "No description available."),
        "thumbnail": g.get("image", "/placeholder.svg"),
        "siteUrl": g.get("url", "#"),
    }


def normalize_text(text: str):
    clean = re.sub(r"[^a-z0-9 ]", " ", str(text).lower())
    clean = re.sub(r"\s+", " ", clean)
    return clean.strip()


def match_field(field_value: str, query: str):
    return query in normalize_text(field_value)




# ----------------- SEARCH ENDPOINT -----------------
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
    

    # --- 1️⃣ TAGS ---
    tag_matches = [g for g in docs if match_field(g.get("tags", ""), query)]
    if tag_matches:
        ranked_docs = rank_documents(query, tag_matches)
        if ranked_docs:
            return {
                "intent": "tfidf_ranked_tags",
                "results": [safe_game_dict(d) for d, _ in ranked_docs],
                "probs": {safe_game_dict(d)["name"]: round(s, 4) for d, s in ranked_docs},
            }

    # --- 2️⃣ GENRE ---
    genre_matches = [g for g in docs if match_field(g.get("genre", ""), query)]
    if genre_matches:
        ranked_docs = rank_documents(query, genre_matches)
        if ranked_docs:
            return {
                "intent": "tfidf_ranked_genre",
                "results": [safe_game_dict(d) for d, _ in ranked_docs],
                "probs": {safe_game_dict(d)["name"]: round(s, 4) for d, s in ranked_docs},
            }

    # --- 3️⃣ TITLE ---
    title_matches = [
        g for g in docs
        if normalize_text(g.get("name", "")) == query
        or normalize_text(g.get("name", "")).startswith(query + " ")
    ]
    if title_matches:
        ranked_docs = rank_documents(query, title_matches)
        if ranked_docs:
            return {
                "intent": "tfidf_ranked_title",
                "results": [safe_game_dict(d) for d, _ in ranked_docs],
                "probs": {safe_game_dict(d)["name"]: round(s, 4) for d, s in ranked_docs},
            }

    # --- 4️⃣ PUBLISHER ---
    publisher_matches = [g for g in docs if match_field(g.get("publisher", ""), query)]
    if publisher_matches:
        ranked_docs = rank_documents(query, publisher_matches)
        if ranked_docs:
            return {
                "intent": "tfidf_ranked_publisher",
                "results": [safe_game_dict(d) for d, _ in ranked_docs],
                "probs": {safe_game_dict(d)["name"]: round(s, 4) for d, s in ranked_docs},
            }

    # --- 5️⃣ DESCRIPTION ---
    desc_matches = [g for g in docs if match_field(g.get("description", ""), query)]
    if desc_matches:
        ranked_docs = rank_documents(query, desc_matches)
        if ranked_docs:
            return {
                "intent": "tfidf_ranked_description",
                "results": [safe_game_dict(d) for d, _ in ranked_docs],
                "probs": {safe_game_dict(d)["name"]: round(s, 4) for d, s in ranked_docs},
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
