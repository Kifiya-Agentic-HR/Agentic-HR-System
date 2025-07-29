import logging
from typing import Dict, Any

from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel

from app.utils.publisher import publish_application
from database.models.screen_result_model import ScreeningResultDocument

logger = logging.getLogger(__name__)
router = APIRouter()


class RequeuePayload(BaseModel):
    id: str
    status: str
    error_message: str
    application_id: str
    original_message: Dict[str, Any]


@router.post("/requeue")
async def requeue(payload: RequeuePayload):
    """
    Receives a payload with a failed message and requeues the original message.
    """
    try:
        await publish_application(payload.original_message)
        ScreeningResultDocument.update_or_create_result(payload.application_id, payload.original_message)
        return {"status": "success", "message": "Original message has been requeued."}
    except Exception as e:
        logger.error(f"Failed to requeue message: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to requeue message: