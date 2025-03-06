from pymongo import MongoClient, errors
import logging
from config_local import Config

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        mongo_uri = Config.MONGODB_URL
        
        self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
                # Force a connection to check for errors
        self.client.server_info()
        logger.info("The database connected successfully.")

        self.db = self.client.hr_db
        
        # Pre-load collections if desired
        self.jobs_collection = self.db["jobs"]
        self.applications_collection = self.db["applications"]
        self.candidates_collection = self.db["candidates"]
        self.interviews_collection = self.db["interviews"]
    def get_collection(self, name: str):
        return self.db[name]

# Create a single instance of the database to be used across the application
database = Database()
