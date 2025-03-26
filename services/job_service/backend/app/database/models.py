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
    def create_job(cls, job_data):
        job_data["created_at"] = datetime.utcnow()
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
            "application_status":"pending",
            "shortlisted": False,
            "shortlist_note": "",
            "source": application_data["source"]

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
            return new_application["_id"]
        except errors.PyMongoError as e:
            raise Exception(f"Error creating application: {e}")

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
        
            raise Exception(f"Error fetching application by id: {e} {application_id}")
    @classmethod
    def get_application_by_candidate_job(cls, candidate_id , job_id):
        try:
            application = cls.get_collection().find_one({"candidate_id": candidate_id, "job_id": job_id})
            if application:
                application["_id"] = str(application["_id"])
                application["job_id"] = str(application["job_id"])
            return application
        except errors.PyMongoError as e:
        
            logger.error(f"Error fetching application by candidate_id")
    @classmethod
    def get_applications(cls):
        try:
            applications = cls.get_collection().find()
            
            applications = list(applications)
            for app in applications:
                app["_id"] = str(app["_id"])
                app["job_id"] = str(app["job_id"])
            return applications
        except errors.PyMongoError as e:
        
            raise Exception(f"Error fetching applications: {e}")

    @classmethod
    def get_applications_by_job(cls, job_id):
        try:
            logger.debug("GETTING APP BY JOB")
            applications_cursor = cls.get_collection().find({"job_id": job_id})
            applications = list(applications_cursor)
            for app in applications:
                logger.info("REACH APPS fetching candidate")
                app["_id"] = str(app["_id"])
                candidate = CandidateDocument.get_candidate_by_id(app['candidate_id'])
                screening = ScreeningResultDocument.get_by_application_id(app["_id"]) 
                interview = InterviewsDocument.get_interview_by_app_id(app["_id"])
                app["job_id"] = str(app["job_id"])
                app["candidate"] = candidate
                app['screening'] = screening
                app['interview'] = interview
                if app['screening']:
                    app['screening']['_id'] = str(app['screening']['_id'])
                if app['interview']:
                    app['interview']['_id'] = str(app['interview']['_id'])

            return applications
        except Exception as e:
            raise Exception(f"Error retrieving applications for job {job_id}: {e}")
    
    @classmethod
    def reject_application(cls, application_id):
        try:
            cls.get_collection().update_one(
                {"_id": ObjectId(application_id)},
                {"$set": {"application_status": "rejected"}}
            )
            return True
        except errors.PyMongoError as e:
            raise Exception(f"Error rejecting application: {e}")
    
    @classmethod
    def accept_application(cls, application_id):
        try:
            cls.get_collection().update_one(
                {"_id": ObjectId(application_id)},
                {"$set": {"application_status": "passed"}}
            )
            return True
        except errors.PyMongoError as e:
            raise Exception(f"Error accepting application: {e}")
    @classmethod
    def update_shortlist(cls, application_id, update_data):
        try:
            updated_application = cls.get_collection().find_one_and_update(
                {"_id": ObjectId(application_id)},
                {"$set": {
                    "shortlisted": update_data["shortlisted"],
                    "shortlist_note": update_data["shortlist_note"]
                }},
                return_document=ReturnDocument.AFTER
            )
            if updated_application:
                updated_application["_id"] = str(updated_application["_id"])
                # updated_application["job_id"] = str(updated_application["job_id"])
            return updated_application
        except errors.PyMongoError as e:
            raise Exception(f"Error updating shortlist: {e}")

        
class CandidateDocument(BaseDocument):
    collection_name = "candidates"

    @classmethod
    def create_candidate(cls, candidate_data):
        try:
            # Check if a candidate with the given email already exists.
            candidate = cls.get_collection().find_one({"email": candidate_data["email"]})
            if candidate:
                # Update candidate fields if needed.
                cls.get_collection().update_one(
                    {"_id": candidate["_id"]},
                    {"$set": candidate_data}
                )
                candidate["_id"] = str(candidate["_id"])
                return candidate["_id"]
                
            else:
                # Insert new candidate. The new document will have an autogenerated _id.
                result = cls.get_collection().insert_one(candidate_data)
                new_candidate = cls.get_collection().find_one({"_id": result.inserted_id})
                logger.info("Candidate created")
                new_candidate["_id"] = str(new_candidate["_id"])
                logger.info("Candidate created")

                return new_candidate["_id"]
            
        except errors.PyMongoError as e:
            raise Exception(f"Error creating/updating candidate: {e} {candidate_data}")
    @classmethod
    def get_candidate_by_id(cls, candidate_id):
        try:
            candidate = cls.get_collection().find_one({"_id": ObjectId(candidate_id)})
            candidate["_id"] = str(candidate["_id"])
            return candidate
                
            
        except errors.PyMongoError as e:
        
            raise Exception(f"Error fetching candidate by id: {e} {candidate_id}")
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
    def edit_score(cls, application_id: str, score: str, comment: str):
        try:
            # Find the existing document to check if 'score' exists
            existing_doc = cls.get_collection().find_one({"application_id": application_id})
            
            update_fields = {"score": score, "comment": comment}
            
            # If 'score' exists, move it to 'old_score'
            if existing_doc and "score" in existing_doc:
                update_fields["old_score"] = existing_doc["score"]
            
            # Update the document
            updated_result = cls.get_collection().find_one_and_update(
                {"application_id": application_id},
                {"$set": update_fields},
                return_document=ReturnDocument.AFTER
            )

            if updated_result:
                updated_result["_id"] = str(updated_result["_id"])
                updated_result["application_id"] = str(updated_result["application_id"])

            return updated_result

        except errors.PyMongoError as e:
            raise Exception(f"Error updating screening result: {e}")


class InterviewsDocument(BaseDocument):
    collection_name = "interviews"

    @classmethod
    def get_interview_by_app_id(cls, application_id):
        # Find screening results using the application_id foreign key.
        result = cls.get_collection().find_one({"application_id": application_id})
        if result:
            result["_id"] = str(result["_id"])
            result["application_id"] = str(result["application_id"])
        return result
