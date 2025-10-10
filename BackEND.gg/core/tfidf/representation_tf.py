import pandas as pd
import math
import os
from collections import Counter
from core.utils.preprocess import tokenize   # your custom tokenizer handles contractions + stopwords
from math import sqrt
# ===== Load dataset =====
datasets = os.getenv("DATASET_PATH", "datasets/all_games.csv")
data = pd.read_csv(datasets)

# ===== Combine ideal columns =====
# Combine: genre + tags + publisher + description 
data["combined_text"] = (
    data["name"].fillna("").astype(str) + " " +
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


# https://www.freecodecamp.org/news/how-to-process-textual-data-using-tf-idf-in-python-cd2bbc0a94a3