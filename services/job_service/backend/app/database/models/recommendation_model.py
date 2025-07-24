import logging
from app.database.database import database
from app.schemas.recommendations_schema import RecommendationCreate
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
            result = []
            seen = set()
            for recommendation in recommendations:
                if recommendation["application_id"] in seen:
                    continue
                
                seen.add(recommendation["application_id"])
                recommendation["_id"] = str(recommendation["_id"])  # Convert _id to string
                result.append(recommendation)
            logger.info(result)
            result = sorted(result, key=lambda x: x["score"], reverse=True)
            return result
        except errors.PyMongoError as e:
            logger.error(f"Error fetching recommend applications by job_id: {e}")
            raise Exception(f"Error fetching recommend applications by job_id: {e}")
    @classmethod
    def create_recommendation(cls, recomendation_data: RecommendationCreate):
        if not recomendation_data["application_id"]:
            result = cls.get_collection().insert_one(recomendation_data)
            return cls.get_collection().find_one({"_id": ObjectId(result.inserted_id)})

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
            logger.error(f"Error inserting recommendation: {e}")
            raise Exception(f"Error inserting recommendation: {e}")


