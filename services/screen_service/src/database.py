from pymongo import MongoClient
import os

class Database:
    def __init__(self):
        # Connect to the MongoDB instance (defaults to a local instance if no URI is provided)
        mongo_uri = os.getenv("MONGODB_URI", None)
        if not mongo_uri:
            raise ValueError("Failed!")
        self.client = MongoClient(mongo_uri)
        self.db = self.client.hr_db
        
        # Optionally, you can cache your collections here:
        self.screening_results_collection = self.db["screening_results"]

    def get_collection(self, name):
        return self.db[name]

# Create a single instance of the database to be used across the application
database = Database()
