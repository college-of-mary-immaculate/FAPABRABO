from model import GenreClassifier

if __name__ == "__main__":
    DATA_FILE = "../scraper/datasets/all_games.csv"   # path to your dataset

    clf = GenreClassifier()
    test_set = clf.train(DATA_FILE, test_ratio=0.2)

    # Evaluate on the held-out test set
    correct = sum(clf.predict(txt)[0] == label for txt, label in test_set)
    print(f"Validation Accuracy: {correct/len(test_set):.2%}")

    # Try a new description
    sample = "Fast-paced first-person shooter with online multiplayer and futuristic weapons."
    pred, probs = clf.predict(sample)
    print("\nSample prediction:")
    print("Predicted genre:", pred)
    for g, p in sorted(probs.items(), key=lambda x: x[1], reverse=True):
        print(f"  {g:<12} {p*100:5.2f}%")
