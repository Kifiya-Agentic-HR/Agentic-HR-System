from src.database import database
from datetime import datetime
from bson import ObjectId
from pymongo import errors, ReturnDocument
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
class JobDocument(BaseDocument):
    collection_name = "jobs"

    @classmethod
    def create_job(cls, job_data):
        job_data["created_at"] = datetime.utcnow()
        try:
            result = cls.get_collection().insert_one(job_data)
            return cls.get_collection().find_one({"_id": result.inserted_id})
        except errors.PyMongoError as e:
            raise Exception(f"Error inserting job: {e}")

    @classmethod
    def get_job_by_id(cls, job_id):
        try:
            job = cls.get_collection().find_one({"_id": ObjectId(job_id)})
            if job:
                job["_id"] = str(job["_id"])
                job["applications"] = [str(app_id) for app_id in job.get("applications", [])]
            return job
        except errors.PyMongoError as e:
            raise Exception(f"Error fetching job by id: {e}")

    @classmethod
    def get_all_jobs(cls):
        try:
            jobs = list(cls.get_collection().find())
            for job in jobs:
                job["_id"] = str(job["_id"])
                job["applications"] = [str(app_id) for app_id in job.get("applications", [])]
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
