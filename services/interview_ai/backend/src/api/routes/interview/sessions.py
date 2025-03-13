from fastapi import APIRouter, Depends, Request, Response, status
from uuid import uuid4
from bson import ObjectId
from datetime import datetime
import logging
from typing import Dict
from src.api.models.schemas import SessionRequest, SessionResponse, SessionData
from src.api.db.dependencies import get_mongo_db, get_redis_client
from src.api.core.config import get_settings

router = APIRouter(prefix="/session", tags=["sessions"])
logger = logging.getLogger(__name__)
settings = get_settings()

def transform_skills(job_skills: dict) -> dict:
    transformed = {}
    for skill_name, details in job_skills.items():
        required_level = details.get("required_level", "").lower()
        if required_level == "advanced":
            required_level = "expert"
        transformed[skill_name] = {
            "required_level": required_level,
            "rating": 0,
            "questions_asked": 0,
        }
    return transformed

@router.post("/", response_model=SessionResponse)
async def manage_session(
    request: Request,
    response: Response,
    session_request: SessionRequest,
    mongo_db=Depends(get_mongo_db),
    redis_client=Depends(get_redis_client)
) -> Dict:
    
    interview_id = session_request.interview_id

    if not interview_id or not isinstance(interview_id, str):
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {
            "success": False,
            "error": "Invalid interview ID",
            "interview_id": interview_id,
            "session_id": None,
            "chat_history": []
        }

    try:
        # Try to get existing session first
        existing_session_id = redis_client.get(f"interview:{interview_id}")
        if existing_session_id:
            session_data = redis_client.get(existing_session_id.decode())
            if session_data:
                try:
                    parsed_data = SessionData.model_validate_json(session_data)
                    logger.info(f"-"*300)
                    logger.info(f"Session data found SKills part: {parsed_data.skills}")
                    response.status_code = status.HTTP_200_OK
                    return {
                        "success": True,
                        "interview_id": interview_id,
                        "session_id": existing_session_id.decode(),
                        "chat_history": parsed_data.conversation_history,
                        "error": None
                    }
                except Exception as e:
                    logger.error(f"Session data corruption: {str(e)}")
                    redis_client.delete(f"interview:{interview_id}")
                    redis_client.delete(existing_session_id.decode())

        # Proceed with new session creation
        try:
            interview_obj_id = ObjectId(interview_id)
        except Exception as e:
            logger.error(f"Invalid interview ID: {interview_id}")
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {
                "success": False,
                "error": "Invalid interview ID format",
                "interview_id": interview_id,
                "session_id": None,
                "chat_history": []
            }

        # Fetch interview data
        interview_data = await mongo_db.interviews.find_one({"_id": interview_obj_id})
        if not interview_data:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {
                "success": False,
                "error": "Interview not found. Please schedule an interview first.",
                "interview_id": interview_id,
                "session_id": None,
                "chat_history": []
            }

        # Fetch related data
        try:
            # Get candidate data
            candidate = await mongo_db.candidates.find_one(
                {"_id": ObjectId(interview_data["candidate_id"])}
            )
            if not candidate:
                response.status_code = status.HTTP_400_BAD_REQUEST
                return {
                    "success": False,
                    "error": "Candidate not found. Please contact the HR team.",
                    "interview_id": interview_id,
                    "session_id": None,
                    "chat_history": []
                }

            # Get job data
            job = await mongo_db.jobs.find_one(
                {"_id": ObjectId(interview_data["job_id"])}
            )

            if not job:
                response.status_code = status.HTTP_400_BAD_REQUEST
                return {
                    "success": False,
                    "error": "Job not found. Please contact the HR team.",
                    "interview_id": interview_id,
                    "session_id": None,
                    "chat_history": []
                }

            cv = await mongo_db.screening_results.find_one({"application_id": interview_data["application_id"]})
            parsed_cv = ""
            if not cv:
                parsed_cv = ""
            else:
                parsed_cv = cv.get("parsed_cv", "")

            # Transform skills
            transformed_skills = transform_skills(job.get("skills", {}))

            print("------ PRINT EVERYTHING ---------")
            print("CANDIDATE:",candidate)
            print("job:",job)
            print("parsed_cv",parsed_cv)
            print("Skills", transformed_skills)
            print("------ PRINT EVERYTHING ---------")

            # Create session data
            session = SessionData(
                interview_id=interview_id,
                candidate_id=str(interview_data["candidate_id"]),
                job_id=str(interview_data["job_id"]),
                user_info=parsed_cv,
                user_email=candidate.get("email", ""),
                name=candidate.get("full_name", ""),
                job_title=job.get("title", ""),
                role_info= f"Overview: {job.get('description', {}).get('summary', '')},\n\nResponsibilities: {job.get('description', {}).get('skills_requirement', '')}",
                skills=transformed_skills,
                conversation_history=interview_data.get("conversation_history", [])
            )

            # Store in Redis
            session_id = str(uuid4())
            redis_client.setex(
                session_id, 
                86400, 
                session.model_dump_json()
            )
            redis_client.setex(
                f"interview:{interview_id}",
                86400,
                session_id
            )
            response.status_code = status.HTTP_200_OK
            return {
                "success": True,
                "interview_id": interview_id,
                "session_id": session_id,
                "chat_history": session.conversation_history,
                "error": None
            }

        except Exception as e:
            logger.error(f"Session creation failed: {e.with_traceback()}")
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {
                "success": False,
                "error": str(e),
                "interview_id": interview_id,
                "session_id": None,
                "chat_history": []
            }

    except Exception as e:
        logger.error(f"Session management error: {str(e)}")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {
            "success": False,
            "error": str(e),
            "interview_id": interview_id,
            "session_id": None,
            "chat_history": []
        }