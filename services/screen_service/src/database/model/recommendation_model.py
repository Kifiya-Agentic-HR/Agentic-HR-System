import logging
from src.database.database import database
from src.utils.schemas import RecommendationCreate
from datetime import datetime
from bson import ObjectId
from pymongo import ReturnDocument, errors
from src.database.model.application_model import ApplicationDocument
from src.database.model.candidate_model import CandidateDocument
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
    def create_recommendation(cls, recomendation_data: RecommendationCreate):
        
        recomendation_data["created_at"] = datetime.utcnow()
        applicant = ApplicationDocument.get_application_by_id(recomendation_data['application_id'])
        candidate = CandidateDocument.get_candidate_by_id(applicant["candidate_id"])
        recomendation_data["full_name"] = candidate['full_name'] 
        recomendation_data['email'] = candidate['email']
        recomendation_data["cv_link"] = applicant['cv_link']
        try:
            result = cls.get_collection().insert_one(recomendation_data)
            return cls.get_collection().find_one({"_id": ObjectId(result.inserted_id)})
        except errors.PyMongoError as e:
            logger.error(f"Error fetching application by id: {str(e)}")
            raise Exception(f"Error inserting recommendation: {e}")

