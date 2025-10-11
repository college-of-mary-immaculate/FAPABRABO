from fastapi import APIRouter
from core.tfidf.retrival_tf import docs  # your MongoDB documents

router = APIRouter()


# ✅ Games by publisher AND genre
@router.get("/publisher/{publisher_name}/{genre}")
def get_games_by_publisher_and_genre(publisher_name: str, genre: str):
    filtered_games = []

    for doc in docs:
        publisher = doc.get("publisher", "").lower()
        game_genre = doc.get("genre")

        # Match publisher
        if publisher != publisher_name.lower():
            continue

        # Normalize genre field
        if isinstance(game_genre, list):
            genre_match = any(genre.lower() in g.lower() for g in game_genre)
        elif isinstance(game_genre, str):
            genre_match = genre.lower() in game_genre.lower()
        else:
            genre_match = False

        if genre_match:
            filtered_games.append({
                "name": doc.get("name"),
                "genre": doc.get("genre"),
                "publisher": doc.get("publisher"),
                "description": doc.get("description"),
                "image": doc.get("image"),
                "url": doc.get("url")
            })

    return {"publisher": publisher_name, "genre": genre, "games": filtered_games}
