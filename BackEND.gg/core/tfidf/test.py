from api.config.config_database import db
from .representation_tf import tfidfDocs, data
import math
def safe_str(val, fallback="Unknown"):
    if val is None:
        return fallback
    try:
        if math.isnan(val):
            return fallback
    except TypeError:
        pass
    return str(val)


def test_connection():
    collection = db["vectore_store"]
    collection.delete_many({})  # optional: clear previous data
    
    "Add 0.0 if will Nan"

    for i, vec in enumerate(tfidfDocs):
        image_field = str(data.loc[i, "image"]).strip('"')  # remove extra quotes

        doc = {
            "name": safe_str(data.loc[i, "name"]),
            "genre": safe_str(data.loc[i, "genre"]),
            "tags": safe_str(data.loc[i, "tags"]),
            "publisher": safe_str(data.loc[i, "publisher"]),
            "description": safe_str(data.loc[i, "description"]),
            "url": safe_str(data.loc[i, "url"]),
            "image": image_field,  # now it's clean
            "tfidf_vector": vec.tolist() if hasattr(vec, "tolist") else vec
        }

        collection.insert_one(doc)

print("💾 All TF-IDF vectors inserted into MongoDB collection 'game_vectors'.")
    



if __name__ == "__main__":
    test_connection()


# from bson import ObjectId
# from api.config.config_database import db
# import json

# def get_game_by_id(game_id: str):
#     collection = db["vectore_store"]
    
#     # Try to convert to ObjectId; fallback to string query if fails
#     try:
#         query_id = ObjectId(game_id)
#     except Exception:
#         query_id = game_id

#     doc = collection.find_one({"_id": query_id})
#     if not doc:
#         return None

#     # safe_game_dict helper
#     try:
#         genre = json.loads(doc.get("genre", "[]"))
#     except json.JSONDecodeError:
#         genre = []

#     try:
#         tags = json.loads(doc.get("tags", "[]"))
#     except json.JSONDecodeError:
#         tags = []

#     return {
#         "id": str(doc.get("_id", "")),
#         "name": doc.get("name", ""),
#         "publisher": doc.get("publisher", ""),
#         "genre": genre,
#         "tags": tags,
#         "description": doc.get("description", "No description available"),
#         "thumbnail": doc.get("image", "/placeholder.svg"),
#         "siteUrl": doc.get("url", "/"),
#     }

# # Example usage:
# game = get_game_by_id("68e81b4d967c07aa12681375")
# print(game)
