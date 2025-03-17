from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from enum import Enum

class NotificationType(str, Enum):
    interview_scheduled = "interview_scheduled"
    interview_completed = "interview_completed"
    text = "text"
    application_received = "application_received"
    application_passed = "application_passed"
    interview_flagged = "interview_flagged"
    application_rejected = "application_rejected"
    interview_passed = "interview_passed"
    technical_scheduled = "technical_scheduled"
    technical_flagged = "technical_flagged"
    technical_completed = "technical_completed"

from typing import Literal
from pydantic import BaseModel, EmailStr

class BaseNotification(BaseModel):
    type: NotificationType
    subject: str
    to: EmailStr

class InterviewScheduledNotification(BaseNotification):
    type: Literal[NotificationType.interview_scheduled]
    interview_link: str
    name: str
    title: str  # Job title

class InterviewCompletedNotification(BaseNotification):
    type: Literal[NotificationType.interview_completed]
    name: str
    title: str  # Job title

class InterviewFlaggedNotification(BaseNotification):
    type: Literal[NotificationType.interview_flagged]

class TechnicalScheduledNotification(BaseNotification):
    type: Literal[NotificationType.technical_scheduled]
    technical_link: str
    name: str
    title: str  # Job title

class TechnicalCompletedNotification(BaseNotification):
    type: Literal[NotificationType.technical_completed]
    name: str
    title: str  # Job title

class TechnicalFlaggedNotification(BaseNotification):
    type: Literal[NotificationType.technical_flagged]


class TextNotification(BaseNotification):
    type: Literal[NotificationType.text]
    message: str

class ApplicationReceivedNotification(BaseNotification):
    type: Literal[NotificationType.application_received]
    name: str
    title: str  # Job title

class ApplicationPassedNotification(BaseNotification):
    type: Literal[NotificationType.application_passed]
    name: str
    title: str  # Job title

class ApplicationRejectedNotification(BaseNotification):
    type: Literal[NotificationType.application_rejected]
    name: str
    title: str  # Job title
    suggestion: Optional[str] = ""
    rejection_reason: Optional[str] = ". After careful consideration, we have decided to move forward with other candidates who more closely match our current needs. We appreciate your interest and encourage you to apply for future opportunities that align with your skills and experience."

NotificationUnion = Union[
    InterviewScheduledNotification,
    InterviewCompletedNotification,
    TextNotification,
    ApplicationReceivedNotification,
    InterviewFlaggedNotification,
    ApplicationPassedNotification,
    ApplicationRejectedNotification
]