from pymongo import MongoClient
import os

class Database:
    def __init__(self):
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/hr_db")
        self.client = MongoClient(mongo_uri)
        self.db = self.client.hr_db
        self.results_collection = self.db["screening_results"]
        self.job_collection = self.db["jobs"]
        self.applications_collection = self.db["applications"]

    def get_collection(self, name):
        return self.db[name]

# Create a single instance of the database to be used across the application
database = Database()
