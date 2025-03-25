from fastapi import APIRouter, HTTPException, status, Response
from schemas import QuestionCreate, QuestionUpdate, UserSubmissionCreate, UserSubmissionOut
from app.database.model import QuestionDocument, UserSubmissionDocument
from bson import ObjectId
from datetime import datetime

router = APIRouter()


from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status

@router.post("/", response_model=dict)
async def create_submission(submission: UserSubmissionCreate):
    try:
        # Validate question IDs format
        try:
            question_ids = [ObjectId(ans.question_id) for ans in submission.answers]
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more question IDs have invalid format"
            )


        

        

        # Create submission document
        submission_data = {
            "application_id": submission.application_id, 
            "submission_date": datetime.utcnow(),
            "answers": [{answer.question_id: answer.answer_code} for answer in submission.answers]
            
        }

        # Insert into database
        result = UserSubmissionDocument.create_submission(submission_data)
        result["_id"] = str(result["_id"])
        
        return {"success": True, "submission": result}

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Submission failed: {str(e)}"
        )