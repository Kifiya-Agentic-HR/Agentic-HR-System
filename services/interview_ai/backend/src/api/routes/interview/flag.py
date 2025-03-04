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
    chat_request: FlagResponse,
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
        interview = mongo_db.interviews.find_one({"_id": ObjectId(interview_id)})
        if not interview:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Invalid interview ID"}

        # Flag interview
        mongo_db.interviews.update_one(
            {"_id": ObjectId(interview_id)},
            {"$set": {"status": "flagged", "violations": violations}}
        )

        # Send email notification
        if violations:
            send_email_notification(
                type=EmailType.interview_flagged,
                to=interview["candidate_email"],
                subject=f"Your interview has been flagged for violations. Please contact HR for more information."
            )

        return {"success": True, "error": None}
    
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return {"success": False, "error": str(e), "state": None, "text": ""}