from pymongo import MongoClient, errors
import os
import logging
import time
from config_local import Config

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        mongo_uri = Config.MONGODB_URL
        if not mongo_uri:
            raise ValueError("Failed!")
        try:

            self.client = MongoClient(mongo_uri)
            logger.info('database connected successfully')
        except Exception as e:
            logger.error("faild to connect to the database")
        
        self.db = self.client.hr_db
        
        # Pre-load collections if desired
        self.jobs_collection = self.db["jobs"]
        self.applications_collection = self.db["applications"]
        self.candidates_collection = self.db["candidates"]
        self.interviews_collection = self.db["interviews"]
        self.screening_results_collection = self.db["screening_results"]

    def get_collection(self, name: str):
        return self.db[name]

# Create a single instance of the database to be used across the application
database = Database()