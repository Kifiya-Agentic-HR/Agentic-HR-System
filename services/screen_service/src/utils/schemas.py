from datetime import datetime
import logging
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ApplicationScore(BaseModel):
    application_id: str
    score: float
    created_at: Optional[datetime]
class RecommendationsResponse(BaseModel):
    job_id: str
    applications: List[ApplicationScore]
class RecommendationCreate(BaseModel):
    job_id: str
    application_id: str
    score: float





# class RecommendationsResponse(BaseModel):
#     id: str = Field(..., alias="_id")
#     applications: List[str] = []
