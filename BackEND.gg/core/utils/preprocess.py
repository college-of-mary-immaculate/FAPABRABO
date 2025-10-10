import re

stopwords = {
    "the", "is", "in", "at", "of", "a", "and", "to", "for", "on",
    "with", "as", "by", "an", "it", "that", "this", "are", "be",
    "was", "were", "am", "will", "would", "should", "can", "could",
    "have", "has", "had", "do", "does", "did", "but", "if", "or",
    "because", "about", "then", "there", "here", "when", "where",
    "how", "why", "who", "what", "your"
}

def normalize_numbers(text):
    return re.sub(r"\b\d+(\.\d+)?\b", "<NUM>", text)

def normalize_urls(text):
    return re.sub(r"http\S+|www\.\S+", "<URL>", text)


def normalize(text):
    text = text.lower()
    text = normalize_urls(text)
    text = normalize_numbers(text)

    # Preserve internal hyphens by converting them into underscores ( sci-fi → sci_fi)
    text = re.sub(r"(?<=\w)-(?=\w)", "_", text)

    
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

    genre_map = {
        r"\bmassively\s+multiplayer\s+online\s+role[-_\s]?playing\s?game(s)?\b": "mmorpg",
        r"\brole[-_\s]?playing\s?game(s)?\b": "rpg",
        r"\bfirst[-_\s]?person\s?shooter(s)?\b": "fps",
        r"\bthird[-_\s]?person\s?shooter(s)?\b": "tps",
        r"\breal[-_\s]?time\s?strategy\b": "rts",
        r"\bturn[-_\s]?based\s?strategy\b": "tbs",
        r"\bmassively\s+multiplayer\s?online\b": "mmo",
        r"\bmultiplayer\s?online\b": "mo",
        r"\bopen[-_\s]?world\b": "open_world",
        r"\bsurvival[-_\s]?horror\b": "survival_horror",
        r"\brogue[-_\s]?like\b": "roguelike",
        r"\brogue[-_\s]?lite\b": "roguelite",
        r"\baction[-_\s]?adventure\b": "action_adventure",
        r"\bplatform[-_\s]?game(s)?\b": "platformer",
        r"\bfighting\s?game(s)?\b": "fighting",
        r"\bracing\s?game(s)?\b": "racing",
        r"\bsports\s?game(s)?\b": "sports",
        r"\bpuzzle\s?game(s)?\b": "puzzle",
        r"\bstealth\s?game(s)?\b": "stealth",
        r"\bhack[-_\s]?and[-_\s]?slash\b": "hack_and_slash",
        r"\bbeat[-_\s]?em[-_\s]?up\b": "beat_em_up",
        r"\bconstruction\s?simulation\b": "construction_sim",
        r"\blife\s?simulation\b": "life_sim",
        r"\bvehicle\s?simulation\b": "vehicle_sim",
        r"\bsandbox\s?game(s)?\b": "sandbox",
        r"\bbattle\s?royale\b": "battle_royale",
        r"\bvisual\s?novel\b": "visual_novel",
        r"\bpoint[-_\s]?and[-_\s]?click\b": "point_and_click",
        r"\btower\s?defense\b": "tower_defense",
        r"\brhythm\s?game(s)?\b": "rhythm",
        r"\bhorror\s?game(s)?\b": "horror",
    }

    for pattern, repl in genre_map.items():
        text = re.sub(pattern, repl, text)

    # Remove unwanted symbols except underscores and placeholders
    text = re.sub(r"(?!<NUM>|<URL>)[^\w\s_<>]", " ", text)

    
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
        bigrams = [words[i] + "_" + words[i + 1] for i in range(len(words) - 1)]
        tokens.extend(bigrams)

    return tokens
