import csv
import os
from collections import Counter
from core.ngrams.levenshtein import levenshtein_distance  

class NGrams:
    def __init__(self):
        self.unigram_counts = Counter()
        self.bigram_counts  = Counter()
        self.trigram_counts = Counter()
        self.total_unigrams = 0
        self.vocab = set()   # store all tokens for auto-complete

    # ---------------------------------------------------------------
    def process_names(self, csv_path: str):
        """
        Build n-gram counts from the 'name' column of the CSV file.
        CSV header must contain: name,genre,description,publisher,url
        """
        if not os.path.exists(csv_path):
            raise FileNotFoundError(csv_path)

        game_names = []
        with open(csv_path, newline='', encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            print("CSV headers detected:", reader.fieldnames)
            for row in reader:
                name = (row.get("name") or "").strip().lower()
                if not name:
                    continue
                game_names.append(name)
                tokens = ["<s>"] + name.split() + ["<s/>"]
                self.unigram_counts.update(tokens)
                self.bigram_counts.update(zip(tokens[:-1], tokens[1:]))
                self.trigram_counts.update(zip(tokens[:-2], tokens[1:-1], tokens[2:]))
                self.vocab.update(t for t in name.split())

        self.total_unigrams = sum(self.unigram_counts.values())

        # Debug summary
        print(f"Loaded {len(game_names)} game names.")
        if game_names:
            print("Sample names:", game_names[:5])
        print(f"Bigram example count for ('silent','hill'): "
              f"{self.bigram_counts.get(('silent','hill'),0)}")

    # ---------------------------------------------------------------
    def unigram_prob(self, w):
        return self.unigram_counts[w] / self.total_unigrams if self.total_unigrams else 0

    def bigram_prob(self, w1, w2):
        c = self.unigram_counts[w1]
        return self.bigram_counts[(w1, w2)] / c if c else 0

    def trigram_prob(self, w1, w2, w3):
        c = self.bigram_counts[(w1, w2)]
        return self.trigram_counts[(w1, w2, w3)] / c if c else 0

    def interpolated_prob(self, w1, w2, w3, λ3=0.5, λ2=0.3, λ1=0.2):
        return (λ3*self.trigram_prob(w1, w2, w3)
                + λ2*self.bigram_prob(w2, w3)
                + λ1*self.unigram_prob(w3))

    # ---------------------------------------------------------------
    def autocomplete_token(self, token: str) -> str:
        """Return the closest vocab token to the given token using Levenshtein."""
        if token in self.vocab:
            return token
        best, best_dist = token, len(token)  # start with max reasonable distance
        for v in self.vocab:
            d = levenshtein_distance(token, v)
            if d < best_dist:
                best, best_dist = v, d
        return best

    def suggest_next(self, context: str, top_k: int = 5, return_corrected=False):
        """
        Suggest next tokens given current context.
        Does NOT compute probabilities; just returns candidates.
        """
        words = context.lower().strip().split()

        # Auto-correct the last word
        if words:
            corrected_last = self.autocomplete_token(words[-1])
            if corrected_last != words[-1]:
                print(f"[Auto-complete] '{words[-1]}' → '{corrected_last}'")
                words[-1] = corrected_last

        corrected_context = " ".join(words)

        # Determine context words
        if len(words) >= 2:
            w1, w2 = words[-2], words[-1]
        elif len(words) == 1:
            w1, w2 = "<s>", words[-1]
        else:
            w1, w2 = "<s>", "<s>"

        # Get candidates from trigram -> bigram -> unigram
        candidates = [c for a,b,c in self.trigram_counts if a == w1 and b == w2]
        if not candidates:
            candidates = [b for a,b in self.bigram_counts if a == w2]
        if not candidates:
            candidates = list(self.unigram_counts.keys())

        # Remove special tokens and limit top_k
        suggestions = [w for w in candidates if w not in ("<s>", "<s/>")][:top_k]

        return (corrected_context, suggestions) if return_corrected else suggestions

