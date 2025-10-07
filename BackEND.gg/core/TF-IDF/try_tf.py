import pandas as pd
import math
import re
from collections import Counter
from core.utils.preprocess import tokenize  # keep your custom tokenizer if needed

# ===== Load dataset =====
data = pd.read_csv("../scraper/datasets/all_games.csv")

# ===== Combine ideal columns =====
# Combine the fields: genre, tags, publisher, and description
data["combined_text"] = (
    data["genre"].fillna("").astype(str) + " " +
    data["tags"].fillna("").astype(str) + " " +
    data["publisher"].fillna("").astype(str) + " " +
    data["description"].fillna("").astype(str)
)

# ===== Use combined text as documents =====
docs_combined = data["combined_text"].fillna("").tolist()

# ===== Contractions dictionary =====
contractions = {
    "i'm": "i am", "you're": "you are", "he's": "he is", "she's": "she is",
    "it's": "it is", "we're": "we are", "they're": "they are",
    "i've": "i have", "you've": "you have", "we've": "we have",
    "they've": "they have", "don't": "do not", "can't": "cannot",
    "won't": "will not", "n't": " not", "'re": " are", "'s": " is",
    "'d": " would", "'ll": " will", "'ve": " have", "'m": " am",
    "ain't": "is not", "isn't": "is not", "aren't": "are not",
    "wasn't": "was not", "weren't": "were not", "haven't": "have not",
    "hasn't": "has not", "hadn't": "had not", "wouldn't": "would not",
    "shouldn't": "should not", "couldn't": "could not", "mustn't": "must not",
    "needn't": "need not", "daren't": "dare not", "shan't": "shall not",
    "he'd": "he would", "she'd": "she would", "it'd": "it would",
    "we'd": "we would", "they'd": "they would", "i'd": "i would",
    "who'd": "who would", "there'd": "there would",
    "he'll": "he will", "she'll": "she will", "it'll": "it will",
    "we'll": "we will", "they'll": "they will", "i'll": "i will",
    "who'll": "who will", "that'll": "that will",
    "who's": "who is", "what's": "what is", "where's": "where is",
    "when's": "when is", "why's": "why is", "how's": "how is",
    "who've": "who have", "would've": "would have", "should've": "should have",
    "could've": "could have", "must've": "must have", "might've": "might have",
    "let's": "let us", "y'all": "you all", "o'clock": "of the clock",
    "ma'am": "madam", "gonna": "going to", "wanna": "want to",
    "gotta": "got to", "innit": "is it not", "lemme": "let me",
    "gimme": "give me", "c'mon": "come on", "y'know": "you know",
    "'tis": "it is", "'twas": "it was"
}

# ===== Stopwords =====
stop_words = {
    "a","an","the","and","or","but","if","while","with","for","on","in",
    "to","from","of","at","by","is","am","are","was","were","be","been",
    "being","have","has","had","do","does","did","this","that","these",
    "those","it","its","as","so","than","too","very","can","will","just"
}

# ===== Preprocessing functions =====
def expand_contractions(text, contractions_map):
    pattern = re.compile(r'\b(' + '|'.join(re.escape(k) for k in contractions_map.keys()) + r')\b')
    return pattern.sub(lambda x: contractions_map[x.group()], text.lower())

def simple_tokenize(text):
    expanded = expand_contractions(text, contractions)
    tokens = re.findall(r"\b[a-zA-Z]+\b", expanded)
    return [word for word in tokens if word not in stop_words]

# ===== Tokenize all documents =====
bow_list = [simple_tokenize(doc) for doc in docs_combined]

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
    q_tokens = simple_tokenize(query)
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
            print(f"{res['rank']}. {res['name']} | Genre: {res['genre']} | Tags: {res['tags']} | Publisher: {res['publisher']} | Score: {res['similarity']:.4f}")
        print("------")
