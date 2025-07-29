import logging
from app.database.database import database
from datetime import datetime
from bson import ObjectId
from pymongo import ReturnDocument, errors

from app.database.models.candidate_model import CandidateDocument
from app.database.models.interview_model import InterviewsDocument
from app.database.models.screen_result_model import ScreeningResultDocument
logger = logging.getLogger(__name__)
class BaseDocument:
    """Base class for common database operations."""
    collection_name = ""
    
    @classmethod
    def get_collection(cls):
        return database.get_collection(cls.collection_name)
    
    
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
            "shortlist_comments": [],
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
            logger.error(f"Error creating application: {e}")
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
        
            logger.error(f"Error fetching application by id: {e} {application_id}")
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
        
            logger.error(f"Error fetching applications: {e}")
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
            logger.error(f"Error retrieving applications for job {job_id}: {e}")
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
            logger.error(f"Error rejecting application: {e}")
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
            logger.error(f"Error accepting application: {e}")
            raise Exception(f"Error accepting application: {e}")
    @classmethod
    def update_shortlist(cls, application_id, update_data, user="default_user"):
        """
        Updates the shortlist status of an application. If a shortlist note is provided,
        it appends a new comment (with the comment text, user, and a timestamp) to the
        'shortlist_comments' array. If no prior comments exist, MongoDB will create a new array.
        """
        try:
            note = update_data.get("shortlist_note", "").strip()
            if note:
                comment = {
                    "comment": note,
                    "user": user,
                    "timestamp": datetime.utcnow().isoformat()
                }
                update_query = {
                    "$set": {"shortlisted": update_data.get("shortlisted")},
                    "$push": {"shortlist_comments": comment}
                }
            else:
                update_query = {
                    "$set": {"shortlisted": update_data.get("shortlisted")}
                }
            updated_application = cls.get_collection().find_one_and_update(
                {"_id": ObjectId(application_id)},
                update_query,
                return_document=ReturnDocument.AFTER
            )
            if updated_application:
                updated_application["_id"] = str(updated_application["_id"])
            return updated_application
        except errors.PyMongoError as e:
            logger.error(f"Error updating shortlist: {e}")
            raise Exception(f"Error updating shortlist: {e}")