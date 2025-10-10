import math
def sanitize_dict(obj):
    """Recursively replace NaN/Inf with 0.0 in dicts/lists."""
    if isinstance(obj, dict):
        clean = {}
        for k, v in obj.items():
            if isinstance(v, (dict, list)):
                clean[k] = sanitize_dict(v)
            elif isinstance(v, (float, int)):
                clean[k] = 0.0 if not math.isfinite(v) else float(v)
            else:
                clean[k] = v
        return clean
    elif isinstance(obj, list):
        clean_list = []
        for v in obj:
            if isinstance(v, (dict, list)):
                clean_list.append(sanitize_dict(v))
            elif isinstance(v, (float, int)):
                clean_list.append(0.0 if not math.isfinite(v) else float(v))
            else:
                clean_list.append(v)
        return clean_list
    else:
        return obj


def compute_tfidf_vector(text, idf_map):
    """Compute a TF-IDF vector for a given text (no sklearn)."""
    words = text.lower().split()
    if not words:
        return {}

    tf = {}
    for w in words:
        tf[w] = tf.get(w, 0) + 1

    for w in tf:
        tf[w] = tf[w] / len(words)

    tfidf = {w: tf[w] * idf_map.get(w, 0) for w in tf}
    return sanitize_dict(tfidf)


def cosine_similarity_dict(v1, v2):
    """Compute cosine similarity safely between two sparse dicts."""
    if not v1 or not v2:
        return 0.0

    intersection = set(v1.keys()) & set(v2.keys())
    numerator = sum(v1[w] * v2[w] for w in intersection)
    sum1 = sum(v1[w] ** 2 for w in v1)
    sum2 = sum(v2[w] ** 2 for w in v2)
    denominator = math.sqrt(sum1) * math.sqrt(sum2)

    if denominator == 0:
        return 0.0

    sim = numerator / denominator
    return 0.0 if not math.isfinite(sim) else round(sim, 6)


def rank_documents(query, docs):
    """Rank MongoDB documents using stored tfidf_vector fields safely."""
    idf_map = {}
    for d in docs:
        vec = sanitize_dict(d.get("tfidf_vector", {}))
        for w, val in vec.items():
            if val > 0 and math.isfinite(val):
                idf_map[w] = max(idf_map.get(w, 0), val)

    query_vec = compute_tfidf_vector(query, idf_map)
    scored = []

    for d in docs:
        safe_doc = sanitize_dict(d)
        doc_vec = safe_doc.get("tfidf_vector", {}) or {}
        score = cosine_similarity_dict(query_vec, doc_vec)
        scored.append((safe_doc, float(score)))

    ranked = sorted(scored, key=lambda x: x[1], reverse=True)
    ranked = [(sanitize_dict(d), s) for d, s in ranked[:15]]

    return ranked
