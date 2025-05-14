import re
from typing import Any, Dict
from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile, status
import logging
import os
import requests
from app.utils.publisher import publish_application
from app.utils.cloud_storage import upload_file
from dotenv import load_dotenv
import google.generativeai as genai
from app.database.models.job_model import   JobDocument
from app.database.models.application_model import ApplicationDocument
from app.database.models.candidate_model import CandidateDocument
from app.database.models.interview_model import InterviewsDocument
from app.database.models.screen_result_model import ScreeningResultDocument
from app.schemas.shortlist_schema import ShortlistUpdate, EditScore

logger = logging.getLogger(__name__)

email_server = os.getenv("NOTIFICATION_SERVICE_URL")

if email_server is None:
    logger.error("NOTIFICATION_SERVICE_URL environment variable not set")

BASE_URL = email_server.rstrip("/") + "/notify/email"

def send_email_notification(to: str, subject: str, type="application_received", **kwargs) -> Dict[str, Any]:
    """Send an email notification via the notification service."""
    
    payload = {
        "to": to,
        "subject": subject,
        **kwargs,
        "type": type
    }

    logger.info(f"Sending email notification to {to} with subject: {subject}")

    try:
        response = requests.post(BASE_URL, json=payload, timeout=10)
        logger.debug(response.json())
        response.raise_for_status()
        return {"status": "success", "data": response.json()}
    except requests.exceptions.RequestException as e:
        return {"status": "error", "message": str(e)}

load_dotenv()

# Load API key
gemini_api_key = os.getenv("GEMINI_API_KEY", "")
if not gemini_api_key: 
    raise ValueError("GEMINI_API_KEY is not set in the environment variables!")

# Configure Gemini AI
genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel("gemini-2.0-flash")

def generate_rejection_feedback(name: str, screening: dict, interview: dict, title: str) -> (str, str):
    """
    Generate a rejection reason and suggestion based on screening and interview data.
    Replace the dummy implementation with a call to your Gemini service.
    """
    context = f"Candidate: {name}, Position: {title}. "
    if screening:
        context += f"Screening Data: {screening}. "
    if interview:
        context += f"Interview Data: {interview}."
    
    # Fill in the prompts with the candidate context.
    REJECTION_REASON_PROMPT = f"""
Candidate Details: {context}  

Generate a **clear, professional rejection reason** explaining why the candidate is not the best fit for the role **based strictly on the provided screening and interview feedback**.  

- Keep it **short, direct, and evidence-based**.  
- **DO NOT** add disclaimers like "not enough context"—if details are missing, base the response only on what is provided.  
- Use a **formal hiring manager tone**.  
- No Markdown Formatting, just use plain text.
- **DO NOT** include introductions or generic statements—focus only on the reason.  
- Use a tone as if you are speaking directly to the CANDIDATE.
"""

    
    SUGGESTION_PROMPT = f"""
Candidate Details: {context}  

Provide **one or two specific, actionable suggestions** the candidate can follow to improve their future applications **based on the given feedback**.  

- Keep the advice **brief, practical, and constructive**.  
- **DO NOT** add disclaimers like "not enough context"—base the response on available details.  
- Use a **hiring manager's perspective** with a **positive, professional tone**.  
- Don't use markdown formatting. Just use plain text.  
- **DO NOT** include introductions or generic statements—focus only on the suggestions.  
- Use a tone as if you are speaking directly to the CANDIDATE.
"""

    
    rejection_reason = "Based on your screening performance, your current skill set does not fully meet our requirements."
    suggestion = "We suggest you further develop your technical skills and reapply in the future."
    
    try:
        # Generate rejection reason
        rejection_reason = model.generate_content(
            REJECTION_REASON_PROMPT,
            generation_config={
                "temperature": 0.1,
                "top_p": 0.95,
            }
        )
        rejection_reason = rejection_reason.text.strip()
    
        if not rejection_reason:
            raise ValueError("Gemini returned an empty response.")
    
        # Generate suggestion
        suggestion = model.generate_content(
            SUGGESTION_PROMPT,
            generation_config={
                "temperature": 0.1,
                "top_p": 0.95,
            }
        )
        suggestion = suggestion.text.strip()
    
        if not suggestion:
            raise ValueError("Gemini returned an empty response.")
    
        return rejection_reason, suggestion
    except Exception as e:
        logger.error(f"Failed to process GEMINI: {e.__str__()}")
        return rejection_reason, suggestion
    

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

    # Validate CV file size
    max_file_size = 5 * 1024 * 1024  # 5 MB
    if cv.file._file.tell() > max_file_size:
        response.status_code=status.HTTP_400_BAD_REQUEST
        return {
            "success": False,
            "error": "CV file size exceeds 5 MB"
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
            "candidate_id": candidate_id,
            "source": "web"

        }
        # Store in database
        new_application = ApplicationDocument.create_application(application_data)
        if not new_application:
            raise HTTPException(status_code=400, detail="Application creation failed")
        
        # notify the user
        try:
            send_email_notification(
                email,
                "Thank you for applying!",
                type="application_received",
                name=full_name,
                title=JobDocument.get_job_by_id(job_id)['title']
            )
        except Exception as e:
            logger.error(f"Error sending email notification: {str(e)}")

        job = JobDocument.get_job_by_id(job_id)

        await publish_application({
            "job_description": str(job["description"]),
            "job_skills": str(job["skills"]),
            "application_id": new_application,
            "resume_path": file_path,
            "from": "web",
            "job_id": job_id,
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
    """
    Reject the application and generate rejection_reason and suggestion from Gemini
    using screening and interview information.
    """
    try:
        # Retrieve application details first
        application = ApplicationDocument.get_application_by_id(application_id)
        if not application:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"Application {application_id} not found.")
        
        # Get candidate, job, screening, and interview data
        candidate = CandidateDocument.get_candidate_by_id(application['candidate_id'])
        job = JobDocument.get_job_by_id(application['job_id'])
        screening = ScreeningResultDocument.get_by_application_id(application_id)
        interview = InterviewsDocument.get_interview_by_app_id(application_id)
        
        name = candidate['full_name']
        title = job['title']
        
        # Generate feedback using Gemini integration
        rejection_reason, suggestion = generate_rejection_feedback(name, screening, interview, title)
        
        result = ApplicationDocument.reject_application(application_id)
        if result:
            # Send an email notification with the generated feedback
            send_email_notification(
                candidate['email'],
                "Application Rejected",
                type="application_rejected",
                name=name,
                rejection_reason=rejection_reason,
                suggestion=suggestion,
                title=title
            )
            return {"success": True, "message": f"Application {application_id} rejected successfully."}
        
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Application {application_id} not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rejecting application: {e}")



@router.patch("/{application_id}/accept", response_model=dict)
async def accept_application(application_id: str):
    try:
        # Attempt to accept (pass) the application.
        result = ApplicationDocument.accept_application(application_id)
        try:
            application = ApplicationDocument.get_application_by_id(application_id)
            job_id = application['job_id']
            candidate_id = application['candidate_id']
            job = JobDocument.get_job_by_id(job_id)
            candidate = CandidateDocument.get_candidate_by_id(candidate_id)
            name = candidate['full_name']
            title = job['title']
            send_email_notification(
                candidate['email'],
                "Congratulations! Your application has been accepted!",
                type="application_passed",
                name=name,
                title=title
            )
            
        except Exception as e:
            logger.error("Error fetching job or candidate data to send the email" + str(e))

        if result:
            return {"success": True, "message": f"Application {application_id} accepted successfully."}
        # In case no application was updated (optional error handling)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {application_id} not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accepting application: {e}")

@router.put("/{application_id}", response_model=dict)
async def update_shortlist(application_id: str, update: ShortlistUpdate):
    try:
        # Update the application record with shortlist status and note
        update_data = update.dict()
        current_user = update_data.get("user", "User")
        updated_app = ApplicationDocument.update_shortlist(application_id, update_data, current_user)
        if not updated_app:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Application {application_id} not found"
            )
        return {
            "success": True,
            "message": "Shortlist status updated successfully",
            "application": updated_app
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating shortlist status: {e}"
        )

@router.put("/edit_score/{application_id}", response_model=dict)
async def edit_score(response: Response, application_id : str, update: EditScore ):
    try:
        update_data = update.dict()
        # Update the application record with shortlist status and note
        screening_item = ScreeningResultDocument.edit_score(application_id, update_data)
        if not screening_item:
            response.status_code=status.HTTP_404_NOT_FOUND
            return {
                    "sucess": False,
                    "error":"Screening result with application id {application_id} not found"
                }
        response.status_code=status.HTTP_200_OK
        return {
            "success": True,
            "message": "score updated successfully",
            "updated score": screening_item
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating screening score: {e}"
        )
