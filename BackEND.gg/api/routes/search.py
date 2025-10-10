import os
from fastapi import APIRouter, Query
from core.naivebayes.model import GenreClassifier
from core.tfidf.retrival_tf import docs  # MongoDB TF-IDF documents
from core.utils.preprocess import tokenize  # your tokenizer
from math import sqrt

DATASET_PATH = os.getenv("DATASET_PATH", "datasets/all_games.csv")

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

# ----------------- TF-IDF Cosine Similarity -----------------
def cosine_similarity_tfidf(query_vector, doc_vector):
    common_terms = set(query_vector.keys()) & set(doc_vector.keys())
    numerator = sum(query_vector[t] * doc_vector[t] for t in common_terms)
    sum1 = sum(v ** 2 for v in query_vector.values())
    sum2 = sum(v ** 2 for v in doc_vector.values())
    denominator = sqrt(sum1) * sqrt(sum2)
    return numerator / denominator if denominator else 0

def rank_tfidf(query_tokens, docs, top_k=15):
    q_count = {}
    for t in query_tokens:
        q_count[t] = q_count.get(t, 0) + 1
    q_vector = {t: v / len(query_tokens) for t, v in q_count.items()}

    scored_docs = []
    for doc in docs:
        tfidf = doc.get("tfidf_vector", {})
        # Skip docs without a proper TF-IDF vector
        if not isinstance(tfidf, dict):
            continue
        score = cosine_similarity_tfidf(q_vector, tfidf)
        scored_docs.append((score, doc))

    scored_docs.sort(key=lambda x: x[0], reverse=True)
    return [d for score, d in scored_docs[:top_k] if score > 0]

# ----------------- Search endpoint -----------------
@router.get("/search")
def search(q: str = Query(..., min_length=1)):
    query = q.lower().strip()
    query_tokens = tokenize(query)

    # Retrieve all documents from MongoDB
    mongo_docs = list(docs)  # docs already imported from retrival_tf

    # 1️⃣ Title match
    title_matches = [
        g for g in mongo_docs
        if isinstance(g.get("name"), str) and query in g.get("name", "").lower()
    ]
    if title_matches:
        ranked = rank_tfidf(query_tokens, title_matches)
        return {
            "intent": "title",
            "results": [safe_game_dict(g) for g in ranked],
            "probs": {g["name"]: 1.0 for g in ranked},
        }

    # 2️⃣ Publisher match
    publisher_matches = [
        g for g in mongo_docs
        if isinstance(g.get("publisher"), str) and query in g.get("publisher", "").lower()
    ]
    if publisher_matches:
        ranked = rank_tfidf(query_tokens, publisher_matches)
        return {
            "intent": "publisher",
            "results": [safe_game_dict(g) for g in ranked],
            "probs": {g["publisher"]: 1.0 for g in ranked},
        }

    # 3️⃣ Description match
    desc_matches = [
        g for g in mongo_docs
        if isinstance(g.get("description"), str) and query in g.get("description", "").lower()
    ]
    if desc_matches:
        ranked = rank_tfidf(query_tokens, desc_matches)
        return {
            "intent": "description",
            "results": [safe_game_dict(g) for g in ranked],
            "probs": {g["name"]: 0.8 for g in ranked},
        }

    # 4️⃣ TF-IDF ranking fallback on all docs
    tfidf_results = rank_tfidf(query_tokens, mongo_docs)
    if tfidf_results:
        return {
            "intent": "tfidf",
            "results": [safe_game_dict(g) for g in tfidf_results],
            "probs": {g["name"]: 1.0 for g in tfidf_results},
        }

    # 5️⃣ Naive Bayes fallback
    predicted_label, probs = clf.predict(query)
    if predicted_label:
        results = [
            g for g in mongo_docs
            if predicted_label.lower() in (g.get("genre") or "").lower()
            or predicted_label.lower() in (g.get("publisher") or "").lower()
            or predicted_label.lower() in (g.get("name") or "").lower()
            or predicted_label.lower() in (g.get("description") or "").lower()
        ]
        ranked = rank_tfidf(query_tokens, results)
        return {
            "intent": "ai_predicted",
            "results": [safe_game_dict(g) for g in ranked],
            "probs": probs,
            "predicted_label": predicted_label,
        }

    # 6️⃣ No matches
    return {
        "intent": "none",
        "results": [],
        "probs": {},
        "message": "No confident match found.",
    }
