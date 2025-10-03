import pandas as pd
import math
from preprocess import tokenize   # use your custom tokenizer

# Load dataset
data = pd.read_csv("BackEND.gg/core/scraper/datasets/all_games.csv")

# Use descriptions as documents
docs_description = data["description"].fillna("").tolist()

# Step 1: Tokenize into Bag of Words (using your preprocess.tokenize)
bow_list = [tokenize(doc) for doc in docs_description]

# Step 2: Build Vocabulary (all unique words across docs)
wordSet = set()
for bow in bow_list:
    wordSet = wordSet.union(set(bow))

# Step 3: Create word count dictionaries for each document
wordDicts = []
for bow in bow_list:
    wordDict = dict.fromkeys(wordSet, 0)
    for word in bow:
        if word in wordDict:
            wordDict[word] += 1
    wordDicts.append(wordDict)

# Step 4: Compute TF
def computeTF(wordDict, bow):
    tfDict = {}
    bowCount = len(bow)
    for word, count in wordDict.items():
        tfDict[word] = count / float(bowCount) if bowCount > 0 else 0
    return tfDict

tfList = [computeTF(wordDicts[i], bow_list[i]) for i in range(len(docs_description))]

print(tfList)

# Step 5: Compute IDF
def computeIDF(docList):
    idfDict = dict.fromkeys(docList[0].keys(), 0)
    N = len(docList)
    for doc in docList:
        for word, val in doc.items():
            if val > 0:
                idfDict[word] += 1
    for word, val in idfDict.items():
        idfDict[word] = math.log10(N / float(val)) if val > 0 else 0
    return idfDict

idfs = computeIDF(wordDicts)

# Step 6: Compute TF-IDF
def computeTFIDF(tfBow, idfs):
    tfidf = {}
    for word, val in tfBow.items():
        tfidf[word] = val * idfs[word]
    return tfidf

tfidfDocs = [computeTFIDF(tfList[i], idfs) for i in range(len(docs_description))]


# --- Retrieval Part---
def cosine_similarity(vec1, vec2):
    # dot product
    dot = sum(vec1[w] * vec2[w] for w in vec1 if w in vec2)
    
    # norm of vec1
    norm1 = math.sqrt(sum(v**2 for v in vec1.values()))
    
    # norm of vec2
    norm2 = math.sqrt(sum(v**2 for v in vec2.values()))
    
    return dot / (norm1 * norm2) if norm1 != 0 and norm2 != 0 else 0


# Step 7: Put into DataFrame
df_tfidf = pd.DataFrame(tfidfDocs)

# ---- Fix here: safely add metadata columns at the front ----
# Remove if they already exist (prevents ValueError)
for col in ["name", "genre", "publisher"]:
    if col in df_tfidf.columns:
        df_tfidf.drop(columns=[col], inplace=True)

# Insert metadata at the front
df_tfidf.insert(0, "name", data["name"])
df_tfidf.insert(1, "genre", data["genre"])
df_tfidf.insert(2, "publisher", data["publisher"])
# -----------------------------------------------------------

# Print sample
print(df_tfidf.head())

# Example: Check TF-IDF values for game 1
print("Top TF-IDF words for:", data.loc[0, "name"])
print(sorted(tfidfDocs[0].items(), key=lambda x: x[1], reverse=True)[:10])

# Optional: Save to CSV
df_tfidf.to_csv("tfidf_output.csv", index=False)
