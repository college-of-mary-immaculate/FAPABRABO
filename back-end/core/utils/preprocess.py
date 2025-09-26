import re

stopwords = {
    "the", "is", "in", "at", "of", "a", "and", "to", "for", "on",
    "with", "as", "by", "an", "it", "that", "this", "are", "be",
    "was", "were", "am", "will", "would", "should", "can", "could",
    "have", "has", "had", "do", "does", "did", "but", "if", "or",
    "because", "about", "then", "there", "here", "when", "where",
    "how", "why", "who", "what"
}

def char_escape(s):
    special_chars = ".^$*+?{}[]\\|()"
    return "".join("\\" + c if c in special_chars else c for c in s)

def normalize_numbers(text):
    def replace_number(match):
        num = float(match.group())
        if num >= 1000:
            return "<NUM_LARGE>"
        elif num >= 100:
            return "<NUM_MED>"
        else:
            return "<NUM_SMALL>"
    return re.sub(r"\b\d+(\.\d+)?\b", replace_number, text)

def normalize_urls(text):
    def replace_url(match):
        url = match.group()
        domain_match = re.search(r"https?://([^/]+)", url)
        if domain_match:
            domain = domain_match.group(1)
            return f"<DOMAIN:{domain}>"
        return "<URL>"
    return re.sub(r"http\S+|www\.\S+", replace_url, text)

def normalize(text):
    text = text.lower()
    text = normalize_urls(text)
    text = re.sub(r"@\w+", "<USER>", text)
    text = normalize_numbers(text)

    contractions = {
        "i'm": "i am", "you're": "you are", "he's": "he is", "she's": "she is",
        "it's": "it is", "we're": "we are", "they're": "they are",
        "i've": "i have", "you've": "you have", "we've": "we have",
        "they've": "they have", "don't": "do not", "can't": "cannot",
        "won't": "will not", "n't": " not", "'re": " are", "'s": " is",
        "'d": " would", "'ll": " will", "'ve": " have", "'m": " am"
    }
    for contraction, expanded in contractions.items():
        text = re.sub(rf"\b{re.escape(contraction)}\b", expanded, text)

    text = re.sub(r"[^\w\s<>:]", "", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()

def tokenize(text, use_bigrams=True):
    words = normalize(text).split()
    words = [w for w in words if w not in stopwords]
    tokens = list(words)

    if use_bigrams:
        for i in range(len(words) - 1):
            tokens.append(words[i] + "_" + words[i+1])

    return tokens
