import logging
from typing import  Literal
from pydantic import BaseModel


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    full_name: None
    email: None
    phone_number: str
    gender: Literal["Male", "Female", "Unknown"]
    disability: str = None
    cv_link: str
    date: str
    created_at: str
    source: Literal["web", "bulk"]