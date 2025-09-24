import os
import random
from collections import Counter

class NGrams:
    def __init__(self):
        self.unigram_counts = Counter()
        self.bigram_counts  = Counter()
        self.trigram_counts = Counter()
        self.total_unigrams = 0

    # ------------------------------------------------------------------
    def process(self, file_path="BackEND.gg/data/ngrams/ngram_datasets.txt"):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"{file_path} does not exist.")

        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue

                tokens = ["<s>"] + line.split() + ["<s/>"]

                self.unigram_counts.update(tokens)
                self.bigram_counts.update(zip(tokens[:-1], tokens[1:]))
                self.trigram_counts.update(zip(tokens[:-2], tokens[1:-1], tokens[2:]))

        self.total_unigrams = sum(self.unigram_counts.values())

    # ------------------------------------------------------------------
    def unigram_prob(self, w):
        return self.unigram_counts[w] / self.total_unigrams

    def bigram_prob(self, w1, w2):
        c = self.unigram_counts[w1]
        return self.bigram_counts[(w1, w2)] / c if c else 0

    def trigram_prob(self, w1, w2, w3):
        c = self.bigram_counts[(w1, w2)]
        return self.trigram_counts[(w1, w2, w3)] / c if c else 0

    def interpolated_prob(self, w1, w2, w3, λ3=0.5, λ2=0.3, λ1=0.2):
        p_tri = self.trigram_prob(w1, w2, w3)
        p_bi  = self.bigram_prob(w2, w3)
        p_uni = self.unigram_prob(w3)
        return λ3 * p_tri + λ2 * p_bi + λ1 * p_uni

    # ------------------------------------------------------------------
    def suggest_next(self, context: str, top_k: int = 5):
        """
        Return the top_k most probable next words given the current context.
        context: last one or two words typed by the user.
        """
        tokens = context.strip().split()
        if len(tokens) >= 2:
            w1, w2 = tokens[-2], tokens[-1]
        elif len(tokens) == 1:
            w1, w2 = "<s>", tokens[-1]
        else:
            w1, w2 = "<s>", "<s>"

        # candidate set: first look at trigrams, then bigrams, then unigrams
        candidates = set()
        for a, b, c in self.trigram_counts:
            if a == w1 and b == w2:
                candidates.add(c)

        if not candidates:
            for a, b in self.bigram_counts:
                if a == w2:
                    candidates.add(b)

        if not candidates:
            candidates = set(self.unigram_counts.keys())

        # score and sort
        scored = []
        for w3 in candidates:
            p = self.interpolated_prob(w1, w2, w3)
            scored.append((w3, p))
        scored.sort(key=lambda x: x[1], reverse=True)

        # drop sentence-end tokens in output
        return [(w, p) for w, p in scored if w not in ("<s>", "<s/>")][:top_k]
