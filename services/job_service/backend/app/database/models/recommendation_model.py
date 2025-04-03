import logging
from app.database.database import database
from app.schemas.recommendations_schema import RecommedationsCreate
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
    

class RecommendationDocument(BaseDocument):
    collection_name = "recommendations"

    @classmethod
    def create_recommendation(cls, recomendation_data: RecommedationsCreate):
        data = {}
        data["job_id"] = recomendation_data.job_id
        data["applications"] = recomendation_data.applications
        data["created_at"] = datetime.utcnow()
            
        try:
            result = cls.get_collection().insert_one(data)
            logger.info(f"Inserted recommendation with id: {result.inserted_id}")
            return cls.get_collection().find_one({"_id": ObjectId(result.inserted_id)})
        except errors.PyMongoError as e:
            raise Exception(f"Error inserting job: {e}")

    @classmethod
    def get_recommendationsby_job_id(cls, job_id):
        try:
            recommendations = cls.get_collection().find({"job_id": job_id})
            result = []
            for recommendation in recommendations:
                recommendation["_id"] = str(recommendation["_id"])  # Convert _id to string
                result.append(recommendation)
            return result
        except errors.PyMongoError as e:
            raise Exception(f"Error fetching recommend applications by job_id: {e}")

