from fastapi import APIRouter
from core.tfidf.retrival_tf import docs  # your MongoDB documents

router = APIRouter()

@router.get("/publisher/{publisher_name}")
def get_games_by_publisher(publisher_name: str):
    # Filter all docs matching the publisher
    games = [
        {
            "name": doc.get("name"),
            "genre": doc.get("genre"),
            "publisher": doc.get("publisher"),
            "description": doc.get("description"),
            "image": doc.get("image"),
            "url": doc.get("url")
        }
        for doc in docs if doc.get("publisher", "").lower() == publisher_name.lower()
    ]
    return {"publisher": publisher_name, "games": games}

