from api.config.config_database import db
from .representation_tf import tfidfDocs, data


def test_connection():
    collection = db["vectore_store"]
    collection.delete_many({})  # optional: clear previous data

    for i, vec in enumerate(tfidfDocs):
        image_field = str(data.loc[i, "image"]).strip('"')  # remove extra quotes

        doc = {
            "name": data.loc[i, "name"],
            "genre": data.loc[i, "genre"],
            "tags": data.loc[i, "tags"],
            "publisher": data.loc[i, "publisher"],
            "description": data.loc[i, "description"],
            "url": data.loc[i, "url"],
            "image": image_field,  # now it's clean
            "tfidf_vector": vec.tolist() if hasattr(vec, "tolist") else vec
        }

        collection.insert_one(doc)

print("💾 All TF-IDF vectors inserted into MongoDB collection 'game_vectors'.")
    



if __name__ == "__main__":
    test_connection()


# FAPABRABO\BackEND.gg\api> venv\Scripts\activate    