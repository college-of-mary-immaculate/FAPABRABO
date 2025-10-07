from pymongo import MongoClient
from .settings import settings

client = MongoClient(settings.DATABASE_URL)
db = client.get_database("vectore_store")  # explicit name
