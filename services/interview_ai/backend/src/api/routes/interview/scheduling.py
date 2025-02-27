from fastapi import APIRouter, Depends, Request, Response, status
from bson import ObjectId
from typing import Dict
from datetime import datetime
import logging
from src.api.models.schemas import ScheduleRequest, ScheduleResponse, SessionData
from src.api.db.dependencies import get_mongo_db, get_redis_client
from src.api.core.config import get_settings
from src.api.services.email import send_email_notification

router = APIRouter(prefix="/schedule", tags=["scheduling"])
logger = logging.getLogger(__name__)
settings = get_settings()

@router.post("", response_model=ScheduleResponse)
async def schedule_interview(
    request: Request,
    response: Response,
    schedule_request: ScheduleRequest,
    mongo_db=Depends(get_mongo_db),
    redis_client=Depends(get_redis_client),

) -> Dict:
    try:
        # Fetch application
        try:
            application = await mongo_db.applications.find_one(
                {"_id": ObjectId(schedule_request.application_id)}
            )
        except:
            application = None
            
        if not application:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Invalid application ID", "interview_id": None}

        # Get references
        job_id = application.get("job_id")
        candidate_id = application.get("candidate_id")
        if not job_id or not candidate_id:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Invalid application data", "interview_id": None}

        # Fetch job details
        job = await mongo_db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Job not found", "interview_id": None}

        # Fetch candidate details
        candidate = await mongo_db.candidates.find_one({"_id": ObjectId(candidate_id)})
        if not candidate:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Candidate not found", "interview_id": None}

        # Fetch parsed CV
        cv = await mongo_db.screeningresults.find_one({"application_id": ObjectId(schedule_request.application_id)})

        # Transform job skills
        transformed_skills = {}
        for skill_name, details in job.get("skills", {}).items():
            required_level = details.get("required_level", "").lower()
            if required_level == "advanced":
                required_level = "expert"
            if required_level not in ["expert", "intermediate", "beginner"]:
                return {"success": False, "error": f"Invalid skill level for {skill_name}", "interview_id": None}
            
            transformed_skills[skill_name] = {
                "required_level": required_level,
                "rating": 0,
                "questions_asked": 0,
                "weight": 10
            }

        # creating interview record
        interview_data = {
            "application_id": ObjectId(schedule_request.application_id),
            "candidate_id": ObjectId(candidate_id),
            "job_id": ObjectId(job_id),
            "interview_date": datetime.now(datetime.timezone.utc),
            "interview_status": "scheduled", # completed | scheduled | expired
            "skill_assessment": {},
            "score": 0,
            "conversation_history": [],
            "hiring_decision": "",
            "interview_reasoning": ""
        }
        
        interview_result = await mongo_db.interviews.insert_one(interview_data)
        interview_id = str(interview_result.inserted_id)

        # Create session data
        session_data = SessionData(
            interview_id=interview_id,
            candidate_id=str(candidate_id),
            job_id=str(job_id),
            user_info=cv.get("parsed_cv", ""),
            user_email=candidate.get("email", ""),
            name=candidate.get("full_name", ""),
            job_title=job.get("title", ""),
            role_info= f"Overview: {job.get('description', {}).get('summary', '')},\n\nResponsibilities: {job.get('description', {}).get('skills_requirement', '')}",
            skills=transformed_skills
        )

        # Store in Redis (1 day TTL)
        redis_client.setex(
            interview_id,
            86400,
            session_data.model_dump_json()
        )

        # Send confirmation email
        try:
            interview_link = f"{settings.FRONTEND_BASE_URL}/interview/{interview_id}"
            send_email_notification(
                to=candidate["email"],
                type="interview_scheduled",
                subject="Interview Scheduled",
                interview_link=interview_link,
                name=candidate.get("full_name", "User"),
                title=job.get("title", "Your Interview")
            )
        except Exception as e:
            logger.error(f"Email failed: {str(e)}")

        return {"success": True, "interview_id": interview_id, "error": None}

    except Exception as e:
        logger.error(f"Scheduling error: {str(e)}")
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {"success": False, "interview_id": None, "error": str(e)}