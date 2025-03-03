from .database import database
from datetime import datetime
from bson import ObjectId
from pymongo import ReturnDocument, errors
class BaseDocument:
    """Base class for common database operations."""
    collection_name = ""
    
    @classmethod
    def get_collection(cls):
        return database.get_collection(cls.collection_name)

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

class ApplicationDocument(BaseDocument):
    collection_name = "applications"

    @classmethod
    def create_application(cls, application_data):
        application_data.update({
            "date": datetime.utcnow(),
            
        })
        application_data = {
            "job_id":application_data["job_id"],
            "created_at": datetime.utcnow(),
            "candidate_id": application_data["candidate_id"],
            "cv_link": application_data["cv_link"],
            "application_status":"pending"


        }
        try:
            result = cls.get_collection().insert_one(application_data)
            new_application = cls.get_collection().find_one({"_id": result.inserted_id})
            
            # Update the corresponding job's applications array.
            # Here we assume job_id is stored as an ObjectId reference.
            database.get_collection("applications").update_one(
                {"_id": application_data["job_id"]},
                {"$push": {"applications": result.inserted_id}}
            )
            
            if new_application:
                new_application["_id"] = str(new_application["_id"])
                new_application["job_id"] = str(new_application["job_id"])
                print(new_application)
            return new_application
        except errors.PyMongoError as e:
            raise Exception(f"Error creating application: {e}")

    @classmethod
    def get_application_by_id(cls, application_id):
        try:
            application = cls.get_collection().find_one({"_id": ObjectId(application_id)})
            if application:
                application["_id"] = str(application["_id"])
                application["job_id"] = str(application["job_id"])
            return application
        except errors.PyMongoError as e:
            raise Exception(f"Error fetching application by id: {e}")

    @classmethod
    def get_applications_by_job(cls, job_id):
        try:
            # Convert the provided job_id to an ObjectId for querying.
            job_obj_id = ObjectId(job_id)
            applications_cursor = cls.get_collection().find({"job_id": job_obj_id})
            applications = list(applications_cursor)
            for app in applications:
                app["_id"] = str(app["_id"])
                app["job_id"] = str(app["job_id"])
            return applications
        except Exception as e:
            raise Exception(f"Error retrieving applications for job {job_id}: {e}")
class CandidateDocument(BaseDocument):
    collection_name = "candidates"

    @classmethod
    def create_candidate(cls, candidate_data):
        
        
            

        
        try:
            result = cls.get_collection().insert_one(candidate_data)
            new_candidate = cls.get_collection().find_one({"_id": result.inserted_id})
            
            
            if new_candidate:
                new_candidate["_id"] = str(new_candidate["_id"])
                print(new_candidate)
            return new_candidate["_id"]
        except errors.PyMongoError as e:
            raise Exception(f"Error creating application: {e}")