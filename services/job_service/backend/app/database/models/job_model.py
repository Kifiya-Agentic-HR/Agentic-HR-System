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
    

class JobDocument(BaseDocument):
    collection_name = "jobs"

    @classmethod
    def create_job(cls, job_data, hr_id):
        job_data["created_at"] = datetime.utcnow()
        job_data["hr_id"] = hr_id
        if job_data.get("post_date", None):
            del job_data["post_date"]
            
        try:
            result = cls.get_collection().insert_one(job_data)
            return cls.get_collection().find_one({"_id": ObjectId(result.inserted_id)})
        except errors.PyMongoError as e:
            raise Exception(f"Error inserting job: {e}")

    @classmethod
    def get_job_by_id(cls, job_id):
        try:
            job = cls.get_collection().find_one({"_id": ObjectId(job_id)})
            if job:
                job["_id"] = str(job["_id"])
            return job
        except errors.PyMongoError as e:
            raise Exception(f"Error fetching job by id: {e}")

    @classmethod
    def get_all_jobs(cls):
        try:
            jobs = list(cls.get_collection().find())
            for job in jobs:
                job["_id"] = str(job["_id"])
            return jobs
        except errors.PyMongoError as e:
            raise Exception(f"Error fetching all jobs: {e}")

    @classmethod
    def update_job(cls, job_id, update_data):
        try:
            updated_job = cls.get_collection().find_one_and_update(
                {"_id": ObjectId(job_id)},
                {"$set": update_data},
                return_document=ReturnDocument.AFTER
            )
            if updated_job:
                updated_job["_id"] = str(updated_job["_id"])
            return updated_job
        except errors.PyMongoError as e:
            raise Exception(f"Error updating job: {e}")
