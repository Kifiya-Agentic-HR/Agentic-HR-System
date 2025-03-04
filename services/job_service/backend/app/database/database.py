from pymongo import MongoClient, errors
import os
import logging
import time

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        mongo_uri = os.getenv("MONGODB_URI", None)
        if not mongo_uri:
            raise ValueError("Database String Initialization Failed.")
        retry_attempts = 5
        attempt = 0

        while attempt < retry_attempts:
            try:
                self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
                # Force a connection to check for errors
                self.client.server_info()
                logger.info("The database connected successfully.")
                break
            except errors.ServerSelectionTimeoutError as err:
                attempt += 1
                logger.error(f"Attempt {attempt} of {retry_attempts} failed: {err}")
                if attempt == retry_attempts:
                    raise Exception(f"Could not connect to MongoDB after {retry_attempts} attempts: {err}")
                time.sleep(2)  # wait 2 seconds before retrying

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
