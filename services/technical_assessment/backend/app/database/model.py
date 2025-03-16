import logging
from app.database.database import database
from datetime import datetime
from bson import ObjectId
from pymongo import ReturnDocument, errors
import random
logger = logging.getLogger(__name__)

class BaseDocument:
    collection_name = ""
    
    @classmethod
    def get_collection(cls):
        return database.get_collection(cls.collection_name)

class QuestionDocument(BaseDocument):
    collection_name = "questions"

    @classmethod
    def create_Question(cls, question_data):
        question_data["created_at"] = datetime.utcnow()
        try:
            result = cls.get_collection().insert_one(question_data)
            return cls.get_collection().find_one({"_id": result.inserted_id})
        except errors.PyMongoError as e:
            raise Exception(f"Error inserting Question: {e}")
    @classmethod
    def get_question_by_id(cls, question_id):
        try:
            result = cls.get_collection().find_one({"_id": ObjectId(question_id)})
            if result:
                result["_id"] = str(result["_id"])
            return result
        except errors.PyMongoError as e:
            raise Exception (f"Error retrieving Question: {e}")
    @classmethod
    def get_all_questions(cls):
        try:
            questions = list(cls.get_collection().find())
            for question in questions:
                question["_id"] = str(question["_id"])
            return questions
        except errors.PyMongoError as e:
            raise Exception(f"Error fetching all question: {e}")

    @classmethod
    def get_random_questions(cls, application_id):
        try:
            questions = QuestionDocument.get_all_questions()
            easy = [question for question in questions if question["difficulty"] == "Easy"]
            medium =  [question for question in questions if question["difficulty"] == "Medium"]
            hard =  [question for question in questions if question["difficulty"] == "Hard"]
            logger.info(easy)
            num_easy = len(easy)
            num_medium = len(medium)
            num_hard = len(hard)
            interview_questions = []
            interview_questions.append(easy[random.randint(0,num_easy-1)])
            interview_questions.append(medium[random.randint(0,num_medium)-1])
            interview_questions.append(hard[random.randint(0,num_hard-1)])
            result = {
                "application_id": application_id,
                "questions": interview_questions
            }
            return result
        except Exception as e:
            raise Exception(f"Error getting random questions: {e}")


class UserSubmissionDocument(BaseDocument):
    collection_name = "technical_submissions"

    @classmethod
    def create_submission(cls, submission_data):
        try:
            result = cls.get_collection().insert_one(submission_data)
            return "success"
        except errors.PyMongoError as e:
            raise Exception(f"Error creating submission: {e}")
    @classmethod
    def get_submission_by_applicantId(cls, application_id):
        try:
            result = cls.get_collection().find_one({"_id" : ObjectId(application_id)})
            if result:
                result["application_id"] = str(result["applicatiion_id"])
            return result
        
        except errors.PyMongoError as e:
            raise Exception(f"Error fetching submission: {e}")
    