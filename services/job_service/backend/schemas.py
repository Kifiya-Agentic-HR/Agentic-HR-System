from datetime import datetime
import logging
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



class JobDescription(BaseModel):
    summary: str
    type: Literal["inperson", "remote"]
    commitment: Literal["full_time", "part_time", "internship"]
    qualification_level: Optional[str] = ""
    responsibilities: str
    location: str

class JobBase(BaseModel):
    title: str
    description: JobDescription
    job_status: Optional[str] = "open"
    post_date: Optional[datetime] = None
    skills: dict[str, dict[str, str]]

class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[JobDescription] = None
    status: Optional[str] = None
    postDate: Optional[datetime] = None
    skills: Optional[List[str]] = None

class JobResponse(JobBase):
    id: str = Field(..., alias="_id")
    applications: List[str] = []

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
