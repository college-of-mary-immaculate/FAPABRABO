import math

def compute_tfidf_vector(text, idf_map):

    words = text.lower().split()
    tf = {}
    for w in words:
        tf[w] = tf.get(w, 0) + 1

    # Normalize term frequencies
    for w in tf:
        tf[w] = tf[w] / len(words)

    # Apply IDF
    tfidf = {w: tf[w] * idf_map.get(w, 0) for w in tf}
    return tfidf

def cosine_similarity_dict(v1, v2):
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
    if math.isnan(sim) or math.isinf(sim):
        return 0.0
    return round(sim, 6)




def rank_documents(query, docs):
    """Rank MongoDB documents using stored tfidf_vector fields."""
    # Build global IDF map from stored docs
    idf_map = {}
    for d in docs:
        vec = d.get("tfidf_vector", {})
        for w, val in vec.items():
            if val > 0:
                idf_map[w] = max(idf_map.get(w, 0), val)

    # Compute TF-IDF for query
    query_vec = compute_tfidf_vector(query, idf_map)

    # Compute cosine similarity between query and each document
    scored = []
    for d in docs:
        doc_vec = d.get("tfidf_vector", {})
        score = cosine_similarity_dict(query_vec, doc_vec)
        scored.append((d, score))

    # Rank by similarity
    ranked = sorted(scored, key=lambda x: x[1], reverse=True)
    return ranked[:25]
