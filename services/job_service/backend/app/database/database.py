from pymongo import MongoClient, errors
import os
import logging
class Database:
    def __init__(self):
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/hr_db")
        try:
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            # Force a connection to check for errors
            self.client.server_info()
            logging.debug('the data base connected successfully')
            print("database connected")
        except errors.ServerSelectionTimeoutError as err:
            raise Exception(f"Could not connect to MongoDB: {err}")
        self.db = self.client.hr_db
        
        # Pre-load collections if desired
        self.jobs_collection = self.db["jobs"]
        self.applications_collection = self.db["applications"]
        self.candidates_collection = self.db["candidates"]
        self.interviews_collection = self.db["interviews"]
        self.screening_results_collection = self.db["screening_results"]

    def get_collection(self, name: str):
        return self.db[name]

database = Database()
