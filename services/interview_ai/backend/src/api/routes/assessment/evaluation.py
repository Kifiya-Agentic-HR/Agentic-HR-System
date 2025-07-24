import json
from fastapi import APIRouter, Depends, HTTPException
from backend.src.api.routes.assessment.schemas import EvaluationRequest, LLMEvaluation, TechnicalAssessmentCreate
from src.api.db.dependencies import get_mongo_db, get_redis_client
from pymongo.database import Database
from redis import Redis
import uuid
import time
from openai import OpenAI
import logging 

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/technical-assessment", tags=["technical_assessment"])

EVALUATION_PROMPT = """
You are a senior technical evaluator. Analyze this coding submission:

**Problem**: {problem_description}

**Code Submitted**:
`{language}
{user_code}
`

**Test Results**: {test_results}

**Coding Process Snapshots**: {snapshots}

Provide structured evaluation with:
1. PASS/FAIL decision based on code quality and test results
2. Technical score (0-100)
3. Detailed reasoning in bullet points
4. Improvement suggestions

Return JSON format:
{{
    "decision": "PASS|FAIL",
    "reasoning": "string",
    "score": "int",
    "improvement_suggestions": ["string"]
}}
"""

async def evaluate_with_llm(request: EvaluationRequest) -> LLMEvaluation:
    client = OpenAI()
    
    prompt = EVALUATION_PROMPT.format(
        problem_description=request.problem_description,
        language="python",  # Dynamic based on submission
        user_code=request.user_code,
        test_results=request.test_results,
        snapshots=request.snapshots
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=500
        )
    except Exception as e:
        logger.critical(f"OpenAI response failed {e}")
    
    try:
        evaluation = json.loads(response.choices[0].message.content)
        return LLMEvaluation(**evaluation)
    except Exception as e:
        logger.error(f"LLM evaluation failed: {(e)}")
        raise HTTPException(500, f"LLM evaluation failed: {str(e)}")

@router.post("/schedule")
async def schedule_assessment(
    assessment: TechnicalAssessmentCreate,
    db: Database = Depends(get_mongo_db)
):
    assessment_id = str(uuid.uuid4())
    time_limit = assessment.time_limit or 45 * assessment.no_of_questions
    
    doc = {
        **assessment.model_dump(),
        "assessment_id": assessment_id,
        "status": "scheduled",
        "created_at": time.time(),
        "time_limit": time_limit,
        "result": {},
        "snapshots": [],
        "evidences": []
    }
    
    db.technical_assessments.insert_one(doc)
    return {"assessment_id": assessment_id}

@router.post("/session/{assessment_id}")
async def start_session(
    assessment_id: str,
    db: Database = Depends(get_mongo_db),
    redis: Redis = Depends(get_redis_client)
):
    assessment = db.technical_assessments.find_one({"assessment_id": assessment_id})
    if not assessment or assessment["status"] != "scheduled":
        raise HTTPException(400, "Invalid assessment")
    
    session_id = str(uuid.uuid4())
    ttl = assessment["time_limit"] * 60 + 300  # 5 minutes buffer
    
    redis.setex(session_id, ttl, json.dumps({
        "assessment_id": assessment_id,
        "start_time": time.time(),
        "questions": []  # Your question selection logic
    }))
    
    db.technical_assessments.update_one(
        {"assessment_id": assessment_id},
        {"$set": {"status": "started"}}
    )
    
    return {"session_id": session_id}

@router.post("/snapshot/{session_id}")
async def save_snapshot(
    session_id: str,
    snapshot: dict,
    redis: Redis = Depends(get_redis_client),
    db: Database = Depends(get_mongo_db)
):
    session_data = redis.get(session_id)
    if not session_data:
        raise HTTPException(400, "Invalid session")
    
    assessment_id = json.loads(session_data)["assessment_id"]
    db.technical_assessments.update_one(
        {"assessment_id": assessment_id},
        {"$push": {"snapshots": {
            "timestamp": time.time(),
            "data": snapshot
        }}}
    )
    
    return {"success": True}

@router.post("/complete/{assessment_id}")
async def complete_assessment(
    assessment_id: str,
    results: dict,
    db: Database = Depends(get_mongo_db)
):
    assessment = db.technical_assessments.find_one({"assessment_id": assessment_id})
    if not assessment:
        raise HTTPException(404, "Assessment not found")
    
    # Trigger LLM evaluation
    evaluation_request = EvaluationRequest(
        problem_description=assessment["problem_description"],
        user_code=results["code"],
        test_results=results["tests"],
        snapshots=assessment["snapshots"]
    )
    
    evaluation = await evaluate_with_llm(evaluation_request)
    
    update_data = {
        "status": "completed",
        "result": results,
        "evaluation_reasoning": evaluation.reasoning,
        "score": evaluation.score
    }
    
    db.technical_assessments.update_one(
        {"assessment_id": assessment_id},
        {"$set": update_data}
    )
    
    return {"success": True, "evaluation": evaluation.dict()}
