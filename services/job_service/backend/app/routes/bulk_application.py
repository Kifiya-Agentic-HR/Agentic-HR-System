import re
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile, status,Depends
import logging
import os
import requests
from app.utils.publisher import publish_application
from app.utils.cloud_storage import upload_file
from dotenv import load_dotenv
import google.generativeai as genai
from app.database.models import  ApplicationDocument, CandidateDocument, JobDocument, ScreeningResultDocument , InterviewsDocument
from app.utils.extract_applicant_information import extract_applicant_information

logger = logging.getLogger(__name__)


def validate_job_input(
    job_id: Optional[str] = Form(None),
    job_data: Optional[str] = Form(None),
    job_file: Optional[UploadFile] = File(None)
):
    if not any([job_id, job_data, job_file]):
        raise HTTPException(
            status_code=400,
            detail="At least one of 'job_id', 'job_data', or 'job_file' must be provided."
        )
    return {"job_id": job_id, "job_data": job_data, "job_file": job_file}

router = APIRouter()

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_bulk_application(
    response: Response,
    job_inputs: dict = Depends(validate_job_input),
    cvs: List[UploadFile] = File(...)
):
    job_id = job_inputs.get('job_id')
    job_data = job_inputs.get('job_data')
    job_file = job_inputs.get('job_file')


    if job_id:
        job = JobDocument.get_job_by_id(job_id)
        for cv in cvs:
            file_path = await upload_file(cv)
            extracted_info = extract_applicant_information(file_path)
            candidate_data = {
            "email": extracted_info["email"],
            "phone_number": extracted_info["phone_number"],
            "gender": extracted_info["gender"],
            "experience_years":extracted_info["experience_years"],
            "full_name":extracted_info["full_name"],
            "feedback": "",
            "disability": extracted_info['disability'],
            "skills":[]
        }
            logger.info(candidate_data)
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
                "email": extracted_info["email"],
                "full_name": extracted_info["full_name"],
                "phone_number": extracted_info["phone_number"],
                "gender": extracted_info["gender"],
                "disability": extracted_info["disability"],
                "cv_link": file_path,  # Store local path
                "experience_years": extracted_info["experience_years"],
                "candidate_id": candidate_id,
                "source":"bulk"
            }
            # Store in database
            new_application = ApplicationDocument.create_application(application_data)
            if not new_application:
                raise HTTPException(status_code=400, detail="Application creation failed")


            await publish_application({
                "job_description": str(job["description"]),
                "job_skills": str(job["skills"]),
                "application_id": new_application,
                "resume_path": file_path,
            })

            
        return {
            "success" :True,
            "error": None
        }

    # Validate CV file type
#     allowed_file_types = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
#     if cv.content_type not in allowed_file_types:
        
#             response.status_code=status.HTTP_400_BAD_REQUEST
#             return {
#                 "sucess": False,
#                 "error":"CV must be a PDF or DOCX file"
#             }
    
#     try:
#         # Save file locally and get file path
#         file_path = await upload_file(cv)
#         candidate_data = {
#             "email": email,
#             "phone_number": phone_number,
#             "gender": gender,
#             "experience_years":experience_years,
#             "full_name":full_name,
#             "feedback": "",
#             "disability": disability,
#             "skills":[]
#         }
        
#         try:
#             JobDocument.get_job_by_id(job_id)
#         except Exception as e:
#             response.status_code = status.HTTP_404_NOT_FOUND
#             return {
#                 "success": False,
#                 "error": f"Job with {job_id} is not found"

#             }
#         candidate_id = CandidateDocument.create_candidate(candidate_data)

#         app = ApplicationDocument.get_application_by_candidate_job(candidate_id , job_id)
#         if app:
#             response.status_code = status.HTTP_409_CONFLICT
        
#             return {
                  
#                 "sucess": False,
#                 "error" : f"application already exists"
#             }


#         # Prepare application data
#         application_data = {
#             "job_id": job_id,
#             "email": email,
#             "full_name": full_name,
#             "phone_number": phone_number,
#             "gender": gender,
#             "disability": disability,
#             "cv_link": file_path,  # Store local path
#             "experience_years": experience_years,
#             "candidate_id": candidate_id
#         }
#         # Store in database
#         new_application = ApplicationDocument.create_application(application_data)
#         if not new_application:
#             raise HTTPException(status_code=400, detail="Application creation failed")
        
#         # notify the user
#         try:
#             send_email_notification(
#                 email,
#                 "Thank you for applying!",
#                 type="application_received",
#                 name=full_name,
#                 title=JobDocument.get_job_by_id(job_id)['title']
#             )
#         except Exception as e:
#             logger.error(f"Error sending email notification: {str(e)}")

#         job = JobDocument.get_job_by_id(job_id)

#         await publish_application({
#             "job_description": str(job["description"]),
#             "job_skills": str(job["skills"]),
#             "application_id": new_application,
#             "resume_path": file_path,
#         })
        
#         return {"success": True, "application": new_application}
#     except Exception as e:
#         logging.error(f"Error creating application: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
    

# @router.get("/", status_code=status.HTTP_200_OK)
# async def get_applications():
#     try:
#         applications = ApplicationDocument.get_applications()
#         return list(applications)
#     except Exception as e:
#         logger.error(f"Error fetching applications: {str(e)}")

# @router.get("/{application_id}", response_model=dict)
# async def get_application(response: Response,application_id: str):
#     try:
#         application = ApplicationDocument.get_application_by_id(application_id)
#         candidate = CandidateDocument.get_candidate_by_id(application['candidate_id'])
#         screening = ScreeningResultDocument.get_by_application_id(application_id) 
#         interview = InterviewsDocument.get_interview_by_app_id(application_id)
#         if not application:
#             response.status_code = status.HTTP_404_NOT_FOUND
#             return {
#                 "success": False,
#                 "error": f"Application  with {application_id} is not found"

#             }
#         application_response = {
#             "_id":application_id,
#             "candidate": candidate,
#             "job_id": application['job_id'],
#             "cv_link": application['cv_link'],
#             "screening": screening,
#             "interview": interview
#         }
#         return {"success": True, "application": application_response}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error retrieving application: {e}")

# @router.patch("/{application_id}/reject", response_model=dict)
# async def reject_application(application_id: str):
#     """
#     Reject the application and generate rejection_reason and suggestion from Gemini
#     using screening and interview information.
#     """
#     try:
#         # Retrieve application details first
#         application = ApplicationDocument.get_application_by_id(application_id)
#         if not application:
#             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
#                                 detail=f"Application {application_id} not found.")
        
#         # Get candidate, job, screening, and interview data
#         candidate = CandidateDocument.get_candidate_by_id(application['candidate_id'])
#         job = JobDocument.get_job_by_id(application['job_id'])
#         screening = ScreeningResultDocument.get_by_application_id(application_id)
#         interview = InterviewsDocument.get_interview_by_app_id(application_id)
        
#         name = candidate['full_name']
#         title = job['title']
        
#         # Generate feedback using Gemini integration
#         rejection_reason, suggestion = generate_rejection_feedback(name, screening, interview, title)
        
#         # Update the application rejection status along with feedback info.
#         # This assumes that your ApplicationDocument.reject_application can be modified
#         # to accept rejection_reason and suggestion (or update them separately).
#         result = ApplicationDocument.reject_application(application_id)
#         if result:
#             # Send an email notification with the generated feedback
#             send_email_notification(
#                 candidate['email'],
#                 "Application Rejected",
#                 type="application_rejected",
#                 name=name,
#                 rejection_reason=rejection_reason,
#                 suggestion=suggestion,
#                 title=title
#             )
#             return {"success": True, "message": f"Application {application_id} rejected successfully."}
        
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
#                             detail=f"Application {application_id} not found.")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error rejecting application: {e}")


# @router.patch("/{application_id}/accept", response_model=dict)
# async def accept_application(application_id: str):
#     try:
#         # Attempt to accept (pass) the application.
#         result = ApplicationDocument.accept_application(application_id)
#         try:
#             application = ApplicationDocument.get_application_by_id(application_id)
#             job_id = application['job_id']
#             candidate_id = application['candidate_id']
#             job = JobDocument.get_job_by_id(job_id)
#             candidate = CandidateDocument.get_candidate_by_id(candidate_id)
#             name = candidate['full_name']
#             title = job['title']
#             send_email_notification(
#                 candidate['email'],
#                 "Congratulations! Your application has been accepted!",
#                 type="application_passed",
#                 name=name,
#                 title=title
#             )
            
#         except Exception as e:
#             logger.error("Error fetching job or candidate data to send the email" + str(e))

#         if result:
#             return {"success": True, "message": f"Application {application_id} accepted successfully."}
#         # In case no application was updated (optional error handling)
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application {application_id} not found.")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error accepting application: {e}")