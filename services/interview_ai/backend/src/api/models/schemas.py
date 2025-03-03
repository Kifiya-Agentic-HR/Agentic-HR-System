# models/schemas.py
from .enums import ChatState
from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Optional

class SessionData(BaseModel):
    interview_id: str
    candidate_id: str
    job_id: str
    user_info: str
    user_email: EmailStr
    name: str
    job_title: str
    role_info: str
    skills: Dict[str, dict]
    conversation_history: List[str] = Field(default_factory=list)
    user_answer: Optional[str] = ""

class ChatRequest(BaseModel):
    session_id: str
    user_answer: Optional[str] = ""

class ChatResponse(BaseModel):
    state: ChatState | None
    text: str
    success: bool
    error: str | None = None

class ScheduleRequest(BaseModel):
    application_id: str

class ScheduleResponse(BaseModel):
    success: bool
    interview_id: Optional[str]
    error: Optional[str]

class SessionResponse(BaseModel):
    interview_id: str
    session_id: str
    chat_history: Optional[List[str]] = []
    success: bool
    error: Optional[str]