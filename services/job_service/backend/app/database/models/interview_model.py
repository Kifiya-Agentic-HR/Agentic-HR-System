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
    
    
class InterviewsDocument(BaseDocument):
    collection_name = "interviews"

    @classmethod
    def get_interview_by_app_id(cls, application_id):
        # Find screening results using the application_id foreign key.
        result = cls.get_collection().find_one({"application_id": application_id})
        if result:
            result["_id"] = str(result["_id"])
            result["application_id"] = str(result["application_id"])
        return result