import logging
from app.database.database import database
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
    def create_candidate(cls, candidate_data):
        try:
            # Check if a candidate with the given email already exists.
            candidate = cls.get_collection().find_one({"email": candidate_data["email"]})
            if candidate:
                # Update candidate fields if needed.
                cls.get_collection().update_one(
                    {"_id": candidate["_id"]},
                    {"$set": candidate_data}
                )
                candidate["_id"] = str(candidate["_id"])
                return candidate["_id"]
                
            else:
                # Insert new candidate. The new document will have an autogenerated _id.
                result = cls.get_collection().insert_one(candidate_data)
                new_candidate = cls.get_collection().find_one({"_id": result.inserted_id})
                logger.info("Candidate created")
                new_candidate["_id"] = str(new_candidate["_id"])
                logger.info("Candidate created")

                return new_candidate["_id"]
            
        except errors.PyMongoError as e:
            raise Exception(f"Error creating/updating candidate: {e} {candidate_data}")
    @classmethod
    def get_candidate_by_id(cls, candidate_id):
        try:
            candidate = cls.get_collection().find_one({"_id": ObjectId(candidate_id)})
            candidate["_id"] = str(candidate["_id"])
            return candidate
                
            
        except errors.PyMongoError as e:
        
            raise Exception(f"Error fetching candidate by id: {e} {candidate_id}")