import logging
from pydantic import BaseModel


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ShortlistUpdate(BaseModel):
    shortlisted: bool
    shortlist_note: str = ""
class EditScore(BaseModel):
    score:str
    comment:str