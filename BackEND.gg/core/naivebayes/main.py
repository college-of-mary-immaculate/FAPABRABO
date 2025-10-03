from model import GenreClassifier
from model import GenreClassifier

# --- MAIN EXECUTION -------------------------------------------------------
if __name__ == "__main__":
    DATA_FILE = "BackEND.gg/core/scraper/datasets/all_games.csv"

    clf = GenreClassifier()
    clf.train(DATA_FILE)

    query = input("Search for a game genre, publisher, title, or description: ").strip().lower()
    norm_query = clf.clean_genre(query)

    found = False

    # --- Publisher match ---------------------------------------------------
    for g in clf.games:
        if g["publisher"] and g["publisher"].lower() in norm_query:
            if not found:
                print(f"\nSuggested games from publisher matching: {g['publisher']}")
                found = True
            print(f"- {g['name']} ({g['publisher']})")

    # --- Genre match -------------------------------------------------------
    if not found:
        for g in clf.games:
            genre_clean = clf.clean_genre(g["genre"].lower())
            if genre_clean and (genre_clean in norm_query or norm_query in genre_clean):
                if not found:
                    print(f"\nSuggested games in genre matching: {genre_clean}")
                    found = True
                print(f"- {g['name']} ({g['genre']})")

    # --- Title match -------------------------------------------------------
    if not found:
        for g in clf.games:
            if g["name"] and g["name"].lower() in norm_query:
                if not found:
                    print(f"\nSuggested games with title matching: {g['name']}")
                    found = True
                print(f"- {g['name']} ({g['publisher']})")

    # --- Description match -------------------------------------------------
    if not found:
        for g in clf.games:
            if g.get("description") and g["description"].lower() in norm_query:
                if not found:
                    print(f"\nSuggested games from description matching your query")
                    found = True
                print(f"- {g['name']} ({g['publisher']})")

    # --- No results --------------------------------------------------------
    if not found:
        print("\nNo games found for your search.")
