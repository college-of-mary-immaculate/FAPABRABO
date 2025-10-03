from model import NGrams


if __name__ == "__main__":
    model = NGrams()
    try:
        
        model.process_names("../scraper/datasets/all_games.csv" )

        print("Type a partial query (press Enter on empty line to quit):")
        while True:
            prefix = input("> ").strip()
            if not prefix:
                break
            suggestions = model.suggest_next(prefix, top_k=5)
            print("Suggestions:")
            for word, prob in suggestions:
                print(f"  {prefix} {word}   (p={prob:.4f})")
            print()
    except FileNotFoundError as e:
        print(f"Error: {e}")