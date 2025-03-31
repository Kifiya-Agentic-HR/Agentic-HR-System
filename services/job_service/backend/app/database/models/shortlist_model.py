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
    
    
class ShortListDocument(BaseDocument):
    collection_name = "short_list"

    @classmethod
    def create_request(cls, job_id, hiring_manager_id):
        try:
            collection = cls.get_collection()
            
            # Check if a document with the same job_id exists
            existing_request = collection.find_one({"job_id": job_id})
            
            if existing_request:
                # Update hr_id if job_id exists
                collection.update_one(
                    {"job_id": job_id}, 
                    {"$set": {"hiring_manager_id": hiring_manager_id, "created_at": datetime.utcnow()}}
                )
                return existing_request

            else:
                # Create new entry
                data = {
                    "job_id": job_id,
                    "hiring_manager_id": hiring_manager_id,
                    "created_at": datetime.utcnow()
                }
                result = collection.insert_one(data)
                data["_id"] = str(result.inserted_id)
                return data

        except errors.PyMongoError as e:
            raise Exception(f"Error creating/updating shortlist request: {e}")

    @classmethod
    def get_request_by_hr_manager(cls, hiring_manager_id):
        # Find screening results using the application_id foreign key.
        try:
            result_data = cls.get_collection().find({"hiring_manager_id": hiring_manager_id})
            results = []
            if result_data:
                for result in result_data:
                    result["_id"] = str(result["_id"])
                    results.append(result)
            return results
        except errors.PyMongoError as e:    
            raise Exception(f"Error fetching shortlist request: {e}")
    @classmethod
    def delete_request(cls, short_list_id):
        try:
            # Check if the document exists before attempting to delete
            existing_request = cls.get_collection().find_one({"_id": ObjectId(short_list_id)})
            if not existing_request:
                raise Exception("Shortlist request does not exist.")
            cls.get_collection().delete_one({"_id": ObjectId(short_list_id)})
            return True
        except errors.PyMongoError as e:
            raise Exception(f"Error deleting shortlist request: {e}")
   
    @classmethod
    def get_request_by_job(cls, jobId):
        try:
            result = cls.get_collection().find_one({"job_id": jobId})
            if result:
                result["_id"] = str(result["_id"])
            return result
        except errors.PyMongoError as e:
            raise Exception(f"Error fetching shortlist request: {e}")