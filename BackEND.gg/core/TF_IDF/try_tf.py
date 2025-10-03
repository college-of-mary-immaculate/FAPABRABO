import pandas as pd
import math
import re
from collections import Counter
import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.preprocess import tokenize
# ===== Load dataset =====
data = pd.read_csv("../FAPABRABO/BackEND.gg/core/scraper/datasets/all_games.csv")
# Use descriptions as documents
docs_description = data["description"].fillna("").tolist()

# ===== Tokenize all documents =====
bow_list = [tokenize(doc) for doc in docs_description]

# ===== Build vocabulary =====
wordSet = set(word for bow in bow_list for word in bow)

# ===== Create word count dictionaries =====
wordDicts = [Counter(bow) for bow in bow_list]

# ===== Functions: TF, IDF, TF-IDF =====
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

# ===== Compute TF, IDF, TF-IDF =====
print("📊 Computing TF-IDF... please wait.")
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

# ===== Search function =====
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
            "url": data.loc[i, "url"],
            "publisher": data.loc[i, "publisher"],
            "genre": data.loc[i, "genre"],
            "similarity": sim,
        }
        for idx, (i, sim) in enumerate(scores[:top_n])
    ]

    # Save to CSV if requested
    if save_csv:
        df_results = pd.DataFrame(results)
        df_results.to_csv("search_results.csv", index=False)
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
            print(f"{res['rank']}. {res['name']} | Genre: {res['genre']}  | Url: {res['url']} | Score: {res['similarity']:.4f}")
        print("------")
