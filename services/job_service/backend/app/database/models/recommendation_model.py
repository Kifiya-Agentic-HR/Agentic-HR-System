import logging
from app.database.database import database
from app.schemas.recommendations_schema import RecommedationsCreate
from datetime import datetime
from bson import ObjectId
from pymongo import ReturnDocument, errors
from app.database.models.application_model import ApplicationDocument
from app.database.models.candidate_model import CandidateDocument
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
    def get_recommendationsby_job_id(cls, job_id):
        try:
            recommendations = cls.get_collection().find({"job_id": job_id})
            logger.info("the recommended applicants are")
            logger.info(recommendations)
            result = []
            seen = set()
            for recommendation in recommendations:
                if recommendation["application_id"] in seen:
                    continue
                
                seen.add(recommendation["application_id"])
                recommendation["_id"] = str(recommendation["_id"])  # Convert _id to string
                result.append(recommendation)
            return result
        except errors.PyMongoError as e:
            raise Exception(f"Error fetching recommend applications by job_id: {e}")

