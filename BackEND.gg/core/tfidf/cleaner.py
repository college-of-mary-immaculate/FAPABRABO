import math
from api.config.config_database import db

collection = db["vectore_store"]
print("Connected to collection:", collection.name)

# Retrieve all documents
docs = list(collection.find({}))
print(f"Total documents retrieved: {len(docs)}\n")

def find_invalid_floats(obj, path="root"):
    """
    Recursively find NaN or inf in dicts/lists/floats.
    Prints the path to the invalid float.
    """
    if isinstance(obj, dict):
        for k, v in obj.items():
            find_invalid_floats(v, path + f".{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            find_invalid_floats(v, path + f"[{i}]")
    elif isinstance(obj, float):
        if not math.isfinite(obj):
            print(f"⚠️ Invalid float at {path} -> {obj}")

# Scan all documents
for idx, doc in enumerate(docs):
    find_invalid_floats(doc, path=f"doc[{idx}]")
