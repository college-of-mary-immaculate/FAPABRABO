from model import GenreClassifier

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    DATA_FILE = "BackEND.gg/core/scraper/datasets/all_games.csv"

    clf = GenreClassifier()
    clf.train(DATA_FILE)  # train once on your dataset

    print("🎮 Game Search Engine (Naive Bayes)")
    print("Type 'quit' to exit.\n")

    while True:
        query = input("🔎 Search: ").strip()
        if query.lower() in ["quit", "exit"]:
            print("Goodbye 👋")
            break

        predicted_label, probs = clf.predict(query)

        print(f"\n📌 Predicted category: {predicted_label}")
        print("📊 Probabilities:")
        for label, p in sorted(probs.items(), key=lambda x: -x[1])[:20]:  # top 5
            print(f"  {label}: {p:.3f}")

        # Show matching games from dataset
        print("\n🎲 Matching games:")
        matches = [g for g in clf.games if predicted_label in g["genre"].lower() 
                   or predicted_label in g["publisher"].lower() 
                   or predicted_label in g["name"].lower()]
        if matches:
            for g in matches[:20]:  # show top 5
                print(f" - {g['name']} ({g['publisher']}) | {g['genre']}")
        else:
            print(" No direct matches found, try another query.")

        print("\n" + "-"*40 + "\n")
