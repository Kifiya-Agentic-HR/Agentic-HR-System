from database import database
from datetime import datetime
from bson import ObjectId
from pymongo import ReturnDocument
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
    def get_by_application_id(cls, application_id):
        # Find screening results using the application_id foreign key.
        application_id_obj = ObjectId(application_id) if not isinstance(application_id, ObjectId) else application_id
        result = cls.get_collection().find_one({"application_id": application_id_obj})
        if result:
            result["_id"] = str(result["_id"])
            result["application_id"] = str(result["application_id"])
        return result
