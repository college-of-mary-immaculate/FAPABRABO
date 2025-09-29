def levenshtein_distance(a: str, b: str) -> int:
    """Classic dynamic-programming edit distance."""
    if len(a) > len(b):
        a, b = b, a
    prev = list(range(len(a) + 1))
    for i, cb in enumerate(b, start=1):
        curr = [i]
        for j, ca in enumerate(a, start=1):
            insert = prev[j] + 1
            delete = curr[j - 1] + 1
            sub    = prev[j - 1] + (ca != cb)
            curr.append(min(insert, delete, sub))
        prev = curr
    return prev[-1]
