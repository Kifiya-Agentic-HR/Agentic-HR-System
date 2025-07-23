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
    
    
class ApplicationDocument(BaseDocument):
    collection_name = "applications"

   

    @classmethod
    def get_application_by_id(cls, application_id):
        try:
            application = cls.get_collection().find_one({"_id": ObjectId(application_id)})
            if application:
                application["_id"] = str(application["_id"])
                application["job_id"] = str(application["job_id"])
                print("application found{}")
            logger.info(f"no application found{application} {application_id}")
            return application
        except errors.PyMongoError as e:
            logger.exception(f"Error fetching application by id: {e} {application_id}")
            raise Exception(f"Error fetching application by id: {e} {application_id}")
