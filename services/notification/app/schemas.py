from pydantic import BaseModel, EmailStr
from typing import Union
from enum import Enum

class NotificationType(str, Enum):
    interview_scheduled = "interview_scheduled"
    interview_completed = "interview_completed"
    text = "text"
    application_received = "application_received"
    interview_flagged = "interview_flagged"

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

class TextNotification(BaseNotification):
    type: Literal[NotificationType.text]
    message: str

class ApplicationReceivedNotification(BaseNotification):
    type: Literal[NotificationType.application_received]
    name: str
    title: str  # Job title


NotificationUnion = Union[
    InterviewScheduledNotification,
    InterviewCompletedNotification,
    TextNotification,
    ApplicationReceivedNotification,
    InterviewFlaggedNotification
]