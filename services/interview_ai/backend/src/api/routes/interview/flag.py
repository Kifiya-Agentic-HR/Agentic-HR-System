from fastapi import APIRouter, Depends, Request, Response, status
from bson import ObjectId
from typing import Dict
import logging
from src.api.models.schemas import FlagResponse, FlagRequest
from src.api.models.enums import EmailType
from src.api.db.dependencies import get_mongo_db, get_redis_client
from src.api.core.config import get_settings
from src.api.services.email import send_email_notification

router = APIRouter(prefix="/flag", tags=["chat"])
logger = logging.getLogger(__name__)
settings = get_settings()

@router.post("", response_model=FlagResponse)
async def flag(
    request: Request,
    response: Response,
    chat_request: FlagRequest,
    redis_client=Depends(get_redis_client),
    mongo_db=Depends(get_mongo_db)
) -> Dict:

    interview_id = chat_request.interview_id
    violations = chat_request.violations

    try:
        if not interview_id:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Missing interview ID"}

        # Get interview data
        interview = await mongo_db.interviews.find_one({"_id": ObjectId(interview_id)})
        if not interview:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Invalid interview ID"}

        if interview.get("interview_status", None) == "flagged":
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Interview already flagged"}

        # Flag interview
        mongo_db.interviews.update_one(
            {"_id": ObjectId(interview_id)},
            {"$set": {"interview_status": "flagged", "violations": violations}}
        )

        # Send email notification
        # get candidate email
        candidate_id = interview["candidate_id"]
        candidate = await mongo_db.candidates.find_one({"_id": ObjectId(candidate_id)})
        if candidate:
            email = candidate.get("email", None)
            if email:
                send_email_notification(
                        type=EmailType.interview_flagged,
                        to=email,
                        subject=f"Your interview has been flagged for violations. Please contact HR for more information."
                    )
            else:
                logger.error(f"Flag error: Candidate {candidate_id} has no email")
        else:
            logger.error(f"Flag error: Candidate {candidate_id} not found")

        return {"success": True, "error": None}
    
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return {"success": False, "error": str(e)}