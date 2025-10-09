import csv
import math
import random
import re
import ast
from collections import Counter


class GenreClassifier:
    STOPWORDS = {
        "a", "an", "the", "and", "or", "but", "if", "while", "for", "to", "of", "at", "by", "from",
        "on", "off", "in", "out", "over", "under", "with", "as", "about", "after", "before", "above", "below",
        "up", "down", "into", "again", "further", "then", "once", "here", "there", "when", "where", "why",
        "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
        "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", "don", "should", "now",
        "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
        "did", "doing", "this", "that", "these", "those", "he", "she", "it", "they", "them", "his", "her",
        "its", "their", "what", "which", "who", "whom", "because", "until", "wherever", "whenever", "ours",
        "yours", "mine"
    }

    def __init__(self, alpha=1.0, confidence_threshold=0.25, desc_weight=1.5, tag_weight=1.3):
        self.alpha = alpha
        self.confidence_threshold = confidence_threshold
        self.desc_weight = desc_weight   # how much description matters
        self.tag_weight = tag_weight     # how much tags matter
        self.class_counts = Counter()
        self.word_counts = {}
        self.vocab_size = 0
        self.games = []

    # --- Helpers -----------------------------------------------------------
    def normalize(self, text):
        text = text.lower()
        text = re.sub(r"[^a-z0-9 ]", " ", text)
        return [t for t in text.split() if t not in self.STOPWORDS]

    def clean_genre(self, g: str) -> str:
        """Normalize genre labels so 'Action Games' -> 'action'"""
        return g.lower().replace(" games", "").strip()

    def parse_list_field(self, raw_value):
        """Parse a CSV field that might contain list-like data (tags, genres, etc.)."""
        if not raw_value:
            return []
        text = raw_value.strip()

        # Normalize weird quotes
        text = text.replace("‘", "'").replace("’", "'").replace('"', "'")

        # Try parsing as a Python list or JSON-like string
        try:
            val = ast.literal_eval(text)
            if isinstance(val, str):
                return [val.lower().strip()]
            elif isinstance(val, (list, tuple, set)):
                return [str(v).lower().strip() for v in val if str(v).strip()]
        except Exception:
            pass

        # Fallback: split by commas, semicolons, or pipes
        parts = re.split(r"[,;|]", text)
        return [p.lower().strip() for p in parts if p.strip()]

    # --- Training ----------------------------------------------------------
    def train(self, filepath, test_ratio=0.2):
        csv.field_size_limit(2**31 - 1)
        data = []

        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            reader.fieldnames = [
                h.strip().replace('\ufeff', '').replace('"', '') for h in reader.fieldnames
            ]

            for row in reader:
                name = row.get("name", "").strip()
                publisher = row.get("publisher", "").strip()
                description = row.get("description", "").strip()
                url = row.get("url", "").strip()
                image = row.get("image", "").strip()

                # --- Parse genres and tags robustly ---
                genres = self.parse_list_field(row.get("genre", ""))
                genres = [self.clean_genre(g) for g in genres if g]

                tags = self.parse_list_field(row.get("tags", ""))

                # --- Store for search endpoint ---
                self.games.append({
                    "name": name,
                    "publisher": publisher,
                    "genre": ", ".join(genres),
                    "tags": ", ".join(tags),
                    "description": description,
                    "url": url,
                    "image": image
                })

                # --- Combine weighted text ---
                genre_text = " ".join(genres)
                tag_text = " ".join(tags) * int(self.tag_weight)
                combined_text = f"{name} {genre_text} {publisher} {tag_text} " + (description * int(self.desc_weight))

                for g in genres:
                    if g:
                        data.append((combined_text, g))
                if publisher:
                    data.append((combined_text, publisher.lower()))
                for t in tags:
                    data.append((combined_text, t))

        # Shuffle & split
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
        if not tokens:
            return None, {}

        vocab_tokens = set()
        for counts in self.word_counts.values():
            vocab_tokens.update(counts.keys())
        valid_tokens = [t for t in tokens if t in vocab_tokens]
        if len(valid_tokens) == 0:
            return None, {}

        total_docs = sum(self.class_counts.values())
        log_probs = {}

        for label, doc_count in self.class_counts.items():
            total_words = sum(self.word_counts[label].values())
            log_prob = math.log(doc_count / total_docs)

            for token in valid_tokens:
                count = self.word_counts[label].get(token, 0)
                prob = (count + self.alpha) / (total_words + self.alpha * self.vocab_size)
                log_prob += math.log(prob)

            log_probs[label] = log_prob

        max_log = max(log_probs.values())
        exp_scores = {g: math.exp(v - max_log) for g, v in log_probs.items()}
        total = sum(exp_scores.values())
        probs = {g: exp_scores[g] / total for g in exp_scores}

        best_label = max(probs, key=probs.get)
        confidence = probs[best_label]

        if confidence < self.confidence_threshold:
            return None, {}

        return best_label, probs
