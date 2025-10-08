import re


stopwords = {
    "the", "is", "in", "at", "of", "a", "and", "to", "for", "on",
    "with", "as", "by", "an", "it", "that", "this", "are", "be",
    "was", "were", "am", "will", "would", "should", "can", "could",
    "have", "has", "had", "do", "does", "did", "but", "if", "or",
    "because", "about", "then", "there", "here", "when", "where",
    "how", "why", "who", "what"
}



def normalize_numbers(text):
    return re.sub(r"\b\d+(\.\d+)?\b", "<NUM>", text)

def normalize_urls(text):
    return re.sub(r"http\S+|www\.\S+", "<URL>", text)

def normalize(text):
    text = text.lower()
    text = normalize_urls(text)
    text = normalize_numbers(text)

   
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

    for c, e in contractions.items():
        text = re.sub(rf"\b{re.escape(c)}\b", e, text)

   
    text = re.sub(r"(?!<NUM>|<URL>)[^\w\s<>]", " ", text)

    # Collapse spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()




def tokenize(text, use_bigrams=False, min_len=2):
    """
    - Normalizes text
    - Removes stopwords
    - Filters very short tokens
    - Optional bigram support
    """
    words = normalize(text).split()
    words = [w for w in words if w not in stopwords and len(w) >= min_len]

    tokens = list(words)

    if use_bigrams:
        bigrams = [words[i] + "_" + words[i+1] for i in range(len(words)-1)]
        tokens.extend(bigrams)

    return tokens
