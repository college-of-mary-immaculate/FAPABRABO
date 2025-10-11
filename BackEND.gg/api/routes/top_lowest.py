from collections import Counter
from fastapi import APIRouter
from api.config.config_database import db

router = APIRouter()

@router.get("/toplowest")
def get_top_25_publishers():
    # Connect to the collection
    collection = db["vectore_store"]
    docs = list(collection.find({}, {"publisher": 1, "image": 1}))  # fetch only needed fields

    # Count how many games per publisher
    publisher_counts = Counter(doc.get("publisher", "Unknown") for doc in docs)
    top_25_publishers = publisher_counts.most_common(25)

    response = []
    for rank, (publisher, count) in enumerate(top_25_publishers, start=1):
        # Find one sample doc to get the image
        sample_doc = next((d for d in docs if d.get("publisher") == publisher), None)
        image_url = (
            sample_doc.get("image")
            if sample_doc and sample_doc.get("image")
            else "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
        )

        response.append({
            "rank": rank,
            "publisher": publisher,
            "count": count,
            "image_url": image_url
        })

    return {"top_25_publishers": response}
