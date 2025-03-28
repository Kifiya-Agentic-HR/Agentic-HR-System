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
    
    
class ScreeningResultDocument(BaseDocument):
    collection_name = "screening_results"

    @classmethod
    def create_result(cls, result_data):
        # result_data should include: application_id, parsed_cv, score, reasoning, etc.
        result_data["created_at"] = datetime.utcnow()
        result = cls.get_collection().insert_one(result_data)
        return cls.get_collection().find_one({"_id": result.inserted_id})

    @classmethod
    def get_by_application_id(cls, application_id: str):
        # Find screening results using the application_id foreign key.
        result = cls.get_collection().find_one({"application_id": application_id})
        if result:
            result["_id"] = str(result["_id"])
            result["application_id"] = str(result["application_id"])
        return result
    @classmethod
    def edit_score(cls, application_id: str, update_data: dict):
        try:
            existing_doc = cls.get_collection().find_one({"application_id": application_id})
            logger.info(f"existing doc {existing_doc}")
            
            update_fields = {"score": update_data["score"], "comment": update_data["comment"]}
            
            if existing_doc and "score" in existing_doc:
                update_fields["old_score"] = existing_doc["score"]
            
            updated_result = cls.get_collection().find_one_and_update(
                {"application_id": application_id},
                {"$set": update_fields},
                return_document=ReturnDocument.AFTER
            )
            logger.info(f"updated result {updated_result}")

            if updated_result:
                updated_result["_id"] = str(updated_result["_id"])
                updated_result["application_id"] = str(updated_result["application_id"])

            return updated_result

        except errors.PyMongoError as e:
            raise Exception(f"Error updating screening result: {e}")
