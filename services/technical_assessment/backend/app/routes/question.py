from fastapi import APIRouter, HTTPException, status, Response
from schemas import QuestionCreate, QuestionUpdate
from app.database.model import QuestionDocument
import logging
from bson import ObjectId
router = APIRouter()
logger = logging.getLogger(__name__)
@router.get("/", response_model=dict)
async def get_questions():
    try:
        questions = QuestionDocument.get_all_questions()
        return {"success": True, "questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving questions: {e}")

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_question(question: QuestionCreate):
    try:
        question_data = question.dict()
        new_question = QuestionDocument.create_Question(question_data)
        if new_question is None:
            raise Exception("Question creation failed")
        new_question['_id'] = str(new_question['_id'])
        return {"success": True, "question": new_question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating question: {e}")

@router.get("/generate_random_question", response_model=dict)
async def get_random_questions(response: Response,application_id):
    logger.info('----------------')
    try:
        logger.info("the data base is called")

        questions = QuestionDocument.get_random_questions(application_id)
        logger.info("question called")
        # if not questions or len(questions) != 3:
        #     response.status_code = status.HTTP_404_NOT_FOUND
        #     return {"success": False, "error": "Could not find questions for all difficulty levels"}
        
        # Convert ObjectIds to strings
        for q in questions:
            q['_id'] = str(q['_id'])
        
        return {"success": True, "questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting random questions: {e}")

@router.get("/{question_id}", response_model=dict)
async def get_question(response: Response, question_id: str):
    try:
        # Validate if question_id is a valid ObjectId
        if not ObjectId.is_valid(question_id):
            raise ValueError(f"'{question_id}' is not a valid ObjectId. It must be a 24-character hex string.")

        # Call the class method to fetch the question
        question = QuestionDocument.get_question_by_id(question_id)
        
        # If question is not found, return a 404 error
        if not question:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {
                "success": False,
                "error": f"Question with id {question_id} not found"
            }
        
        # Return the question if found
        return {"success": True, "question": question}
    
    except ValueError as e:
        # Handle invalid ObjectId format
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e))  # Return the error message
    except Exception as e:
        # Handle other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving question: {str(e)}"
        )
@router.put("/{question_id}", response_model=dict)
async def update_question(response:Response ,question_id: str, question_update: QuestionUpdate):
    try:
        update_data = {k: v for k, v in question_update.dict().items() if v is not None}
        if not update_data:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {
                "success": False,
                "error":"missing update fields provided"
            }
        updated_question = QuestionDocument.update_question(question_id, update_data)
        if not update_question:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {
                "success": False,
                "error":"question not found or error occured when updated"
            }
        return {"success": True, "question": updated_question}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating question: {e}")

