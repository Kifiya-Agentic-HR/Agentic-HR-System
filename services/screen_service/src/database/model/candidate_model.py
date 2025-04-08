import logging
from src.database.database import database
from datetime import datetime
from bson import ObjectId
from pymongo import ReturnDocument, errors
logger = logging.getLogger(__name__)
class BaseDocument:
    """Base class for common database operations."""
    collection_name = ""
    
    @classmethod
    def get_collection(cls):
        return database.get_collection(cls.collection_name)
    
    
class CandidateDocument(BaseDocument):
    collection_name = "candidates"

    @classmethod
    def get_candidate_by_id(cls, candidate_id):
        try:
            candidate = cls.get_collection().find_one({"_id": ObjectId(candidate_id)})
            candidate["_id"] = str(candidate["_id"])
            return candidate
                
            
        except errors.PyMongoError as e:
        
            raise Exception(f"Error fetching candidate by id: {e} {candidate_id}")