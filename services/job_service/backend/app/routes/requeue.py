import logging
from typing import Dict, Any

from fastapi import APIRouter, Body, HTTPException, Request
from pydantic import BaseModel

from app.utils.publisher import publish_application
from app.database.models.screen_result_model import ScreeningResultDocument

logger = logging.getLogger(__name__)
router = APIRouter()


class RequeuePayload(BaseModel):
    id: str
    status: str
    error_message: str
    application_id: str
    original_message: Dict[str, Any]


@router.post("/requeue")
async def requeue(request: Request):
    """
    Receives a payload with a failed message and requeues the original message.
    
    """
    try:
        payload = await request.json()
        application_id = payload.get("applicationId", "null")

        screening_data = payload.get("screening", {})
        logger.info(screening_data)
        original_message = screening_data.get("original_message")

        if not application_id or not original_message:
            raise HTTPException(
                status_code=400,
                detail="Invalid payload: 'applicationId' and 'screening.original_message' are required.",
            )
        await publish_application(original_message)
        ScreeningResultDocument.delete_by_application_id(application_id)
        return {"status": "success", "message": "Original message has been requeued."}
    except Exception as e:
        logger.error(f"Failed to requeue message: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to requeue message")