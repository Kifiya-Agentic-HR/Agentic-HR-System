from fastapi import APIRouter, Depends, Response
from bson import ObjectId
from .scheduling import router as scheduling_router
from .sessions import router as sessions_router
from .chat import router as chat_router
from .flag import router as flag_router
from src.api.db.dependencies import get_mongo_db, get_redis_client
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interview", tags=["interview"])
router.include_router(scheduling_router)
router.include_router(sessions_router)
router.include_router(chat_router)
router.include_router(flag_router)

# add  a get request
@router.get("/{interview_id}")
async def get_interview(interview_id: str,
                        response: Response,
                        mongo_db=Depends(get_mongo_db),
                            ):
    result = await mongo_db.interviews.find_one({"_id": ObjectId(interview_id)})
    if not result:
        response.status_code = 404
        return {"success": False, "status": "not found"}

    interview_date = result.get("interview_date")
    current_time = datetime.now(ZoneInfo("Etc/GMT-3"))

    
    status = result.get("interview_status", None)

    interview_date + timedelta(hours=72) < current_time


    if status == "scheduled":
        expiration_time = interview_date + timedelta(hours=72)
        if current_time > expiration_time:
            return {"success": True, "status": "expired"}
        else:
            return {"success": True, "status": "scheduled"}

    if status == "completed":
        return {"success": True, "status": "completed"}
    elif status == "flagged":
        return {"success": True, "status": "flagged"}
    elif status == "started":
        return {"success": True, "status": "started"}
    else:
        return {"success": False, "status": "not found"}