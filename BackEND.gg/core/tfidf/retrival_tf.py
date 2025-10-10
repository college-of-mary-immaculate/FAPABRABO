from api.config.config_database import db

# Connect to the MongoDB collection
collection = db["vectore_store"]
print("Connected to collection:", collection.name)

# Retrieve all documents
docs = list(collection.find({}))
print(f"Total documents retrieved: {len(docs)}\n")

# Preview the first document
if docs:
    first_doc = docs[0]
    print("First document preview:")
    print("Name:", first_doc.get("name"))
    print("Publisher:", first_doc.get("publisher"))
    print("Genre:", first_doc.get("genre"))
    print("Description snippet:", first_doc.get("description", "")[:150], "...")
    print("URL:", first_doc.get("url"))
    print("Image:", first_doc.get("image"))
    print("TF-IDF vector keys:", list(first_doc.get("tfidf_vector", {}).keys())[:10], "…")
