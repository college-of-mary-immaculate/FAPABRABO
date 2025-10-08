import pandas as pd
import math
import os
from collections import Counter
from .preprocess import tokenize   # your custom tokenizer handles contractions + stopwords

# ===== Load dataset =====
datasets = os.getenv("DATASET_PATH", "core/scraper/datasets/all_games.csv")
data = pd.read_csv(datasets)

# ===== Combine ideal columns =====
# Combine: genre + tags + publisher + description
data["combined_text"] = (
    data["genre"].fillna("").astype(str) + " " +
    data["tags"].fillna("").astype(str) + " " +
    data["publisher"].fillna("").astype(str) + " " +
    data["description"].fillna("").astype(str)
)

# ===== Use combined text as documents =====
docs_combined = data["combined_text"].fillna("").tolist()

# ===== Tokenize using preprocess.tokenize =====
bow_list = [tokenize(doc) for doc in docs_combined]

# ===== Vocabulary =====
wordSet = set(word for bow in bow_list for word in bow)

# ===== Word counts per document =====
wordDicts = [Counter(bow) for bow in bow_list]

# ===== TF, IDF, TF-IDF =====
def computeTF(wordDict, bow):
    bowCount = len(bow)
    return {w: (count / float(bowCount)) if bowCount > 0 else 0 for w, count in wordDict.items()}

def computeIDF(docWordDicts):
    idf = dict.fromkeys(wordSet, 0)
    N = len(docWordDicts)
    for doc in docWordDicts:
        for w in doc.keys():
            idf[w] += 1
    return {w: math.log10(N / float(cnt)) if cnt > 0 else 0 for w, cnt in idf.items()}

def computeTFIDF(tfBow, idfs):
    return {w: tfv * idfs.get(w, 0) for w, tfv in tfBow.items()}

print("📊 Computing TF-IDF (genre, tags, publisher, description)... please wait.")
tfList = [computeTF(wordDicts[i], bow_list[i]) for i in range(len(bow_list))]
idfs = computeIDF(wordDicts)
tfidfDocs = [computeTFIDF(tfList[i], idfs) for i in range(len(bow_list))]
print("✅ TF-IDF ready.")

# ===== Cosine Similarity =====
def cosine_similarity(doc_vec, query_vec):
    dot = sum(doc_vec.get(w, 0.0) * qv for w, qv in query_vec.items())
    norm_doc = math.sqrt(sum(v * v for v in doc_vec.values()))
    norm_query = math.sqrt(sum(v * v for v in query_vec.values()))
    return dot / (norm_doc * norm_query) if norm_doc and norm_query else 0.0


# ===== Search Function =====
def search(query, top_n=5, save_csv=False):
    q_tokens = tokenize(query)
    q_wd = Counter(q_tokens)
    q_tf = computeTF(q_wd, q_tokens)
    q_tfidf = computeTFIDF(q_tf, idfs)

    scores = [(i, cosine_similarity(doc_vec, q_tfidf)) for i, doc_vec in enumerate(tfidfDocs)]
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    results = [
        {
            "rank": idx + 1,
            "name": data.loc[i, "name"],
            "genre": data.loc[i, "genre"],
            "tags": data.loc[i, "tags"],
            "publisher": data.loc[i, "publisher"],
            "description": data.loc[i, "description"],
            "url": data.loc[i, "url"],
            "similarity": sim,
        }
        for idx, (i, sim) in enumerate(scores[:top_n])
    ]

    if save_csv:
        pd.DataFrame(results).to_csv("search_results.csv", index=False)
        print("💾 Results saved to search_results.csv")

    return results

# ===== Example usage =====
if __name__ == "__main__":
    while True:
        query_text = input("\n🔎 Enter search query (or 'exit' to quit): ")
        if query_text.lower() == "exit":
            break
        results = search(query_text, top_n=5, save_csv=True)
        print("\n📌 Top results:")
        for res in results:
            print(f"{res['rank']}. {res['name']} | Genre: {res['genre']} | Tags: {res['tags']} | Publisher: {res['publisher']} | Description: {res['description']} | Score: {res['similarity']:.4f}")
        print("------")


# https://www.freecodecamp.org/news/how-to-process-textual-data-using-tf-idf-in-python-cd2bbc0a94a3