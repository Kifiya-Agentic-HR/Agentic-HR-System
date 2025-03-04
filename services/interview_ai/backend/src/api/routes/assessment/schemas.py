# schemas.py
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal

class TechnicalAssessmentCreate(BaseModel):
    application_id: str
    no_of_questions: int = Field(default=2, ge=1)
    level: Literal['easy', 'medium', 'hard'] = 'medium'
    time_limit: Optional[int] = None
    assessment_reasoning: str = ""

class TechnicalAssessmentResponse(TechnicalAssessmentCreate):
    assessment_id: str
    status: Literal['scheduled', 'started', 'completed', 'expired', 'flagged']
    created_at: float
    result: Dict = {}
    snapshots: List[Dict] = []
    evaluation_reasoning: Optional[str] = None
    evidences: List[str] = []

class EvaluationRequest(BaseModel):
    problem_description: str
    user_code: str
    test_results: Dict
    snapshots: List[Dict]

class LLMEvaluation(BaseModel):
    decision: Literal['PASS', 'FAIL']
    reasoning: str
    score: int = Field(..., ge=0, le=100)
    improvement_suggestions: List[str]


class Question(BaseModel):
    qid: str
    title: str
    description: str
    level: str
    template_code: Dict[str, str]  # language -> code
    test_cases: List[Dict]  # {input: str, expected: str}

class SessionData(BaseModel):
    session_id: str
    assessment_id: str
    questions: List[str]  # qid list
    start_time: datetime
    time_remaining: int  # seconds

class SubmissionRequest(BaseModel):
    session_id: str
    code: str
    language: str  # 'python', 'javascript', etc.

class SubmissionResponse(BaseModel):
    failed_tests: List[int]
    passed: bool

class FlagRequest(BaseModel):
    assessment_id: str
    evidences: List[str]

class CompleteRequest(BaseModel):
    results: List[Dict]  # Detailed results per question