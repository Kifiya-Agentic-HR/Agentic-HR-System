from fastapi import APIRouter, Depends, Request, Response, status
from bson import ObjectId
from typing import Dict
import logging
from src.api.models.schemas import ChatRequest, ChatResponse, SessionData
from src.api.db.dependencies import get_mongo_db, get_redis_client
from src.api.core.config import get_settings
from src.api.services.email import send_email_notification
from src.interview_ai import unified_interface

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger(__name__)
settings = get_settings()

def calculate_score(skills: dict) -> int:
    # Each skill has a rating out of 10
    return (sum(skill.get("rating", 0) for skill in skills.values()) / len(skills)) * 10 # Average score out of 100

@router.post("", response_model=ChatResponse)
async def process_chat(
    request: Request,
    response: Response,
    chat_request: ChatRequest,
    redis_client=Depends(get_redis_client),
    mongo_db=Depends(get_mongo_db)
) -> Dict:
    try:
        if not chat_request.session_id:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Missing session ID", "state": None, "text": ""}

        # Get session data
        session_json = redis_client.get(chat_request.session_id)
        if not session_json:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Invalid session ID", "state": None, "text": ""}

        session_data = SessionData.model_validate_json(session_json)

        # Update conversation history
        if chat_request.user_answer:
            session_data.conversation_history.append(f"User: {chat_request.user_answer}")
            session_data.user_answer = chat_request.user_answer

        # Process interview step
        interviewer_result = unified_interface.kickoff(
            session_data.model_dump(),
            max_conversation_history=settings.MAX_CONVERSATION_HISTORY
        )

        # Update conversation
        interviewer_text = interviewer_result.get("text", "")
        state = interviewer_result.get("state", "ongoing")
        session_data.conversation_history.append(f"Interviewer: {interviewer_text}")

        # Handle interview completion
        if state == "completed":
            try:
                await mongo_db.interviews.update_one(
                    {"_id": ObjectId(session_data.interview_id)},
                    {"$set": {
                        "interview_status": "done",
                        "skill_assessment": interviewer_result.get("skills", {}),
                        "conversation_history": session_data.conversation_history,
                        "hiring_decision": interviewer_result.get("hiring_decision", ""),
                        "interview_reasoning": interviewer_result.get("reasoning", ""),
                        "score": calculate_score(interviewer_result.get("skills", {}))
                    }}
                )
                redis_client.delete(chat_request.session_id)
                
                send_email_notification(
                    to=session_data.user_email,
                    type="interview_completed",
                    subject="Interview Completed",
                    name=session_data.name,
                    title=session_data.job_title
                )
            except Exception as e:
                logger.error(f"Completion error: {str(e)}")

        elif state == "ongoing":
            session_data.skills = interviewer_result.get("skills", {})

        # Update session data
        redis_client.setex(
            chat_request.session_id,
            86400,
            session_data.model_dump_json()
        )

        return {
            "success": True,
            "error": None,
            "state": state,
            "text": interviewer_text
        }

    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return {"success": False, "error": str(e), "state": None, "text": ""}