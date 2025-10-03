from model import GenreClassifier

# --- MAIN EXECUTION -------------------------------------------------------
if __name__ == "__main__":
    DATA_FILE = "BackEND.gg/core/scraper/datasets/all_games.csv"

    clf = GenreClassifier()
    clf.train(DATA_FILE)

    query = input("Search for a game genre or publisher: ").strip().lower()
    norm_query = clf.clean_genre(query)

    # check publisher first
    found = False
    for g in clf.games:
        if g["publisher"].lower() == query:
            if not found:
                print(f"\nSuggested games from publisher: {query}")
                found = True
            print(f"- {g['name']} ({g['publisher']})")

    # check genre (normalized)
    if not found:
        for g in clf.games:
            if norm_query in clf.clean_genre(g["genre"].lower()):
                if not found:
                    print(f"\nSuggested games in genre: {norm_query}")
                    found = True
                print(f"- {g['name']} ({g['genre']})")

    if not found:
        print("\nNo games found for your search.")

