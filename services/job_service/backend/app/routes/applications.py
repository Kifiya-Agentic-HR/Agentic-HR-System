from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
import logging
from ..utils.cloud_storage import upload_file
from ..database.models import  ApplicationDocument, CandidateDocument

router = APIRouter()
@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_application(
    job_id: str = Form(...),
    email: str = Form(...),
    full_name: str = Form(...),
    phone_number: str = Form(...),
    gender: str = Form(...),
    disability: str = Form(None),
    cv: UploadFile = File(...),
    experience_years: str = Form(...) 
):
    """Create a new job application and save the CV locally."""
    try:
        # Save file locally and get file path
        file_path = await upload_file(cv)
        candidate_data = {
            "email": email,
            "phone_number": phone_number,
            "gender": gender,
            "experience_years":experience_years,
            "full_name":full_name,
            "feedback": "",
            "disability": disability,
            "skills":[]
        }
        candidate_id = CandidateDocument.create_candidate(candidate_data)

        # Prepare application data
        application_data = {
            "job_id": job_id,
            "email": email,
            "full_name": full_name,
            "phone_number": phone_number,
            "gender": gender,
            "disability": disability,
            "cv_link": file_path,  # Store local path
            "experience_years": experience_years,
            "candidate_id": candidate_id
        }
        # store candidate

        
        # Store in database
        new_application = ApplicationDocument.create_application(application_data)
        if not new_application:
            raise HTTPException(status_code=400, detail="Application creation failed")
        # await publish_application({
        #     "app_id": application_id,
        #     "resume_path": resume_path,
        #     "job_id": job_id
        # })
        return {"success": True, "application": new_application}
    except Exception as e:
        logging.error(f"Error creating application: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
