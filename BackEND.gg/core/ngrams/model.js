import fs from "fs";

class NGrams {
  constructor() {
    this.unigramCounts = new Map();
    this.bigramCounts  = new Map();        // "w1|w2"
    this.trigramCounts = new Map();        // "w1|w2|w3"
    this.quadgramCounts = new Map();       // "w1|w2|w3|w4"
    this.totalUnigrams = 0;
  }

  _inc(map, key) {
    map.set(key, (map.get(key) || 0) + 1);
  }

  process(filePath = "bitEngine/data/sentences/eng_sentences.txt") {
    if (!fs.existsSync(filePath)) {
      throw new Error(`${filePath} does not exist.`);
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      const tokens = ["<s>", ...line.split(/\s+/), "<s/>"];

      // 1-gram
      for (const t of tokens) this._inc(this.unigramCounts, t);

      // 2-gram
      for (let i = 0; i < tokens.length - 1; i++) {
        this._inc(this.bigramCounts, `${tokens[i]}|${tokens[i + 1]}`);
      }

      // 3-gram
      for (let i = 0; i < tokens.length - 2; i++) {
        this._inc(this.trigramCounts, `${tokens[i]}|${tokens[i + 1]}|${tokens[i + 2]}`);
      }

      // 4-gram
      for (let i = 0; i < tokens.length - 3; i++) {
        this._inc(this.quadgramCounts,
                  `${tokens[i]}|${tokens[i + 1]}|${tokens[i + 2]}|${tokens[i + 3]}`);
      }
    }

    this.totalUnigrams = [...this.unigramCounts.values()]
                            .reduce((a, b) => a + b, 0);
  }

  // Probabilities ---------------------------------------------------------
  unigramProb(w) {
    return (this.unigramCounts.get(w) || 0) / this.totalUnigrams;
  }

  bigramProb(w1, w2) {
    const c = this.unigramCounts.get(w1) || 0;
    if (!c) return 0;
    return (this.bigramCounts.get(`${w1}|${w2}`) || 0) / c;
  }

  trigramProb(w1, w2, w3) {
    const c = this.bigramCounts.get(`${w1}|${w2}`) || 0;
    if (!c) return 0;
    return (this.trigramCounts.get(`${w1}|${w2}|${w3}`) || 0) / c;
  }

  quadgramProb(w1, w2, w3, w4) {
    const c = this.trigramCounts.get(`${w1}|${w2}|${w3}`) || 0;
    if (!c) return 0;
    return (this.quadgramCounts.get(`${w1}|${w2}|${w3}|${w4}`) || 0) / c;
  }

  /**
   * Linear interpolation across 4/3/2/1 grams.
   */
  interpolatedProb4(w1, w2, w3, w4,
                    λ4 = 0.4, λ3 = 0.3, λ2 = 0.2, λ1 = 0.1) {
    const p4 = this.quadgramProb(w1, w2, w3, w4);
    const p3 = this.trigramProb(w2, w3, w4);
    const p2 = this.bigramProb(w3, w4);
    const p1 = this.unigramProb(w4);
    const p = λ4 * p4 + λ3 * p3 + λ2 * p2 + λ1 * p1;
    return { pInterp: p, p4, p3, p2, p1 };
  }

  // Helpers ---------------------------------------------------------------
  weightedChoice(choices) {
    const total = choices.reduce((a, [_, w]) => a + w, 0);
    let r = Math.random() * total;
    for (const [word, weight] of choices) {
      r -= weight;
      if (r <= 0) return word;
    }
    return choices[choices.length - 1][0];
  }

  /**
   * Auto-suggest the next word given up to the last three words.
   * `context` is a string like "how are you"
   */
  suggestNext(context, topK = 5) {
    const tokens = context.trim().split(/\s+/);
    const [w1, w2, w3] =
      tokens.length >= 3
        ? tokens.slice(-3)
        : tokens.length === 2
          ? ["<s>", ...tokens]
          : tokens.length === 1
            ? ["<s>", "<s>", tokens[0]]
            : ["<s>", "<s>", "<s>"];

    // candidate set: look at quadgram tails, fallback to lower orders
    let candidates = new Set();
    for (const key of this.quadgramCounts.keys()) {
      const [a, b, c, d] = key.split("|");
      if (a === w1 && b === w2 && c === w3) candidates.add(d);
    }
    if (!candidates.size) {
      for (const key of this.trigramCounts.keys()) {
        const [a, b, c] = key.split("|");
        if (b === w2 && c === w3) candidates.add(c);
      }
    }
    if (!candidates.size) {
      for (const key of this.bigramCounts.keys()) {
        const [a, b] = key.split("|");
        if (a === w3) candidates.add(b);
      }
    }
    if (!candidates.size) {
      candidates = new Set(this.unigramCounts.keys());
    }

    const scored = [];
    for (const w4 of candidates) {
      const { pInterp } = this.interpolatedProb4(w1, w2, w3, w4);
      scored.push([w4, pInterp]);
    }
    scored.sort((a, b) => b[1] - a[1]);
    return scored.slice(0, topK);
  }
}

export default NGrams;
