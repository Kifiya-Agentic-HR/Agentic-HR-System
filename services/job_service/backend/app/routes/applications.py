import re
from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile, status
import logging
from app.utils.publisher import publish_application
from app.utils.cloud_storage import upload_file
from app.database.models import  ApplicationDocument, CandidateDocument, JobDocument, ScreeningResultDocument , InterviewsDocument


logger = logging.getLogger(__name__)
router = APIRouter()
@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_application(
    response: Response,
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
    email_pattern = re.compile(r"^[\w\.-]+@([\w-]+\.)+[\w-]{2,}$")
    if not email_pattern.fullmatch(email):
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {
            "success": False,
            "error": "Invalid email format"
        }

    phone_pattern = re.compile(r"^\+?\d{7,15}$")
    if not phone_pattern.match(phone_number):
        response.status_code=status.HTTP_400_BAD_REQUEST
        return {
                "sucess": False,
                "error":"Invalid phone number format"
            }
        

    # Validate gender
    allowed_genders = {"Male", "Female"}
    if gender not in allowed_genders:

        response.status_code=status.HTTP_400_BAD_REQUEST
        return {
                "sucess": False,
                "error":"Gender must be 'Male' or 'Female'"
            }

    # Validate CV file type
    allowed_file_types = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    if cv.content_type not in allowed_file_types:
        
            response.status_code=status.HTTP_400_BAD_REQUEST
            return {
                "sucess": False,
                "error":"CV must be a PDF or DOCX file"
            }
    
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
        
        try:
            JobDocument.get_job_by_id(job_id)
        except Exception as e:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {
                "success": False,
                "error": f"Job with {job_id} is not found"

            }
        candidate_id = CandidateDocument.create_candidate(candidate_data)

        app = ApplicationDocument.get_application_by_candidate_job(candidate_id , job_id)
        if app:
            response.status_code = status.HTTP_409_CONFLICT
        
            return {
                  
                "sucess": False,
                "error" : f"application already exists"
            }


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
        # Store in database
        new_application = ApplicationDocument.create_application(application_data)
        if not new_application:
            raise HTTPException(status_code=400, detail="Application creation failed")
        job = JobDocument.get_job_by_id(job_id)
        
        await publish_application({
            "job_description": str(job["description"]),
            "job_skills": str(job["skills"]),
            "application_id": new_application,
            "resume_path": file_path,
        })
        return {"success": True, "application": new_application}
    except Exception as e:
        logging.error(f"Error creating application: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
    

@router.get("/", status_code=status.HTTP_200_OK)
async def get_applications():
    try:
        applications = ApplicationDocument.get_applications()
        return list(applications)
    except Exception as e:
        logger.error(f"Error fetching applications: {str(e)}")

@router.get("/{application_id}", response_model=dict)
async def get_application(response: Response,application_id: str):
    try:
        application = ApplicationDocument.get_application_by_id(application_id)
        candidate = CandidateDocument.get_candidate_by_id(application['candidate_id'])
        screening = ScreeningResultDocument.get_by_application_id(application_id) 
        interview = InterviewsDocument.get_interview_by_app_id(application_id)
        if not application:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {
                "success": False,
                "error": f"Application  with {application_id} is not found"

            }
        application_response = {
            "_id":application_id,
            "candidate": candidate,
            "job_id": application['job_id'],
            "cv_link": application['cv_link'],
            "screening": screening,
            "interview": interview
        }
        return {"success": True, "application": application_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving application: {e}")

@router.patch("/{application_id}/reject", response_model=dict)
async def reject_application(application_id: str):
    try:
        # Attempt to reject the application.
        result = ApplicationDocument.reject_application(application_id)
        if result:
            return {"success": True, "message": f"Application {application_id} rejected successfully."}
        # In case no application was updated (optional error handling)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {application_id} not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting application: {e}")


@router.patch("/{application_id}/accept", response_model=dict)
async def accept_application(application_id: str):
    try:
        # Attempt to accept (pass) the application.
        result = ApplicationDocument.accept_application(application_id)
        if result:
            return {"success": True, "message": f"Application {application_id} accepted successfully."}
        # In case no application was updated (optional error handling)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {application_id} not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accepting application: {e}")