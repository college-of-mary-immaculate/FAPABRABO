import csv
import math
import random
import re
import ast
from collections import Counter

class GenreClassifier:
    STOPWORDS = {"a","an","the","and","or","but","if","while","for","to","of","at","by","from",
        "on","off","in","out","over","under","with","as","about","after","before","above","below",
        "up","down","into","again","further","then","once","here","there","when","where","why",
        "how","all","any","both","each","few","more","most","other","some","such","no","nor","not",
        "only","own","same","so","than","too","very","can","will","just","don","should","now",
        "is","am","are","was","were","be","been","being","have","has","had","having","do","does",
        "did","doing","this","that","these","those","he","she","it","they","them","his","her",
        "its","their","what","which","who","whom","because","until","wherever","whenever","ours",
        "yours","mine"}

    def __init__(self, alpha=1.0):
        self.alpha = alpha
        self.class_counts = Counter()
        self.word_counts = {}
        self.vocab_size = 0
        self.games = []  # keep full game info

    # --- Helpers -----------------------------------------------------------
    def normalize(self, text):
        text = text.lower()
        text = re.sub(r"[^a-z0-9 ]", " ", text)
        return [t for t in text.split() if t not in self.STOPWORDS]

    def clean_genre(self, g: str) -> str:
        """Normalize genre labels so 'Action Games' -> 'action'"""
        return g.lower().replace(" games", "").strip()

    # --- Training ----------------------------------------------------------
    def train(self, filepath, test_ratio=0.2):
        csv.field_size_limit(2**31 - 1)

        data = []
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            # clean headers
            reader.fieldnames = [h.strip().replace('\ufeff','').replace('"','') for h in reader.fieldnames]

            for row in reader:
                name = row.get("name","").strip()
                publisher = row.get("publisher","").strip()
                description = row.get("description","")
                genres = []

                # Parse genres
                try:
                    genres = ast.literal_eval(row.get("genre","[]"))
                    if isinstance(genres, str):
                        genres = [genres]
                except:
                    g = row.get("genre","").strip()
                    if g: genres = [g]

                # Clean genres
                genres = [self.clean_genre(g) for g in genres if g]

                # Save game info
                self.games.append({
                    "name": name,
                    "publisher": publisher,
                    "genre": ", ".join(genres) if genres else ""
                })

                # 🔑 Features: combine name + genre + publisher + description
                genre_text = " ".join(genres)
                text = f"{name} {genre_text} {publisher} {description}"

                # Add to dataset
                for g in genres:
                    if g:
                        data.append((text, g))
                if publisher:
                    data.append((text, publisher.lower()))

        # Shuffle + split
        random.shuffle(data)
        split = int(len(data) * test_ratio)
        test, train = data[:split], data[split:]

        vocab = set()
        word_counts = {}
        class_counts = Counter()

        for text, label in train:
            tokens = self.normalize(text)
            vocab.update(tokens)
            class_counts[label] += 1
            word_counts.setdefault(label, Counter()).update(tokens)

        self.class_counts = class_counts
        self.word_counts = word_counts
        self.vocab_size = len(vocab)
        return test

    # --- Prediction --------------------------------------------------------
    def predict(self, text):
        tokens = self.normalize(text)
        total_docs = sum(self.class_counts.values())
        log_probs = {}

        for label, doc_count in self.class_counts.items():
            total_words = sum(self.word_counts[label].values())
            log_prob = math.log(doc_count / total_docs)

            for token in tokens:
                count = self.word_counts[label].get(token, 0)
                prob = (count + self.alpha) / (total_words + self.alpha * self.vocab_size)
                log_prob += math.log(prob)

            log_probs[label] = log_prob

        max_log = max(log_probs.values())
        exp_scores = {g: math.exp(v - max_log) for g, v in log_probs.items()}
        total = sum(exp_scores.values())
        probs = {g: exp_scores[g]/total for g in exp_scores}

        best_label = max(probs, key=probs.get)
        return best_label, probs
