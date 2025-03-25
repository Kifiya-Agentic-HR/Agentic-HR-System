from typing import List, Dict, Tuple, Optional, Literal, Any
from pydantic import BaseModel, Field, constr
from datetime import datetime

class QuestionBase(BaseModel):
    title: str
    description: str
    difficulty: Literal["Easy", "Medium", "Hard"]  
    input: List[List[Any]] 
    output: List[Any]
    additionl_exp: Optional[str] = ""
    answer_template: Dict[str, Any]  

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    title: str
    description: str
    difficulty: Literal["Easy", "Medium", "Hard"]  
    input: List[List[Any]] 
    output: List[Any]
    additionl_exp: Optional[str] = ""
    answer_template: Dict[str, Any]

class UserAnswer(BaseModel):
    question_id: str
    answer_code: Dict[str, Any]

class UserSubmissionCreate(BaseModel):
    application_id: str
    answers: List[UserAnswer]

class UserSubmissionOut(BaseModel):
    id: str
    user_id: str
    submission_date: datetime
    answers: List[Dict[str, Any]]