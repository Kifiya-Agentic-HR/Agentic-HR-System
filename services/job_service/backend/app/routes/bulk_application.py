import os
import zipfile
import tempfile
import logging
from typing import  Optional
from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile, status, Depends
from app.utils.publisher import publish_application
from app.utils.cloud_storage import upload_file
from app.database.models.job_model import JobDocument
from app.database.models.application_model import ApplicationDocument
from app.database.models.candidate_model import CandidateDocument
from app.utils.extract_applicant_information import extract_applicant_information
from app.utils.extract_job_requirement import extract_job_requirement
import magic
import re
logger = logging.getLogger(__name__)

def validate_job_input(
    job_id: Optional[str] = Form(None),
    job_file: Optional[UploadFile] = File(None)
):
    if not any([job_id, job_file]):
        raise HTTPException(
            status_code=400,
            detail="At least one of 'job_id', 'job_data', or 'job_file' must be provided."
        )
    return {"job_id": job_id, "job_file": job_file}

 

def contains_script_code(file_path: str) -> bool:
    """
    Checks if the file contains script code such as JavaScript, PHP, or other common scripting languages.
    Returns True if suspicious code is found, otherwise False.
    """
    # Patterns to look for
    script_patterns = [
        re.compile(rb"<script[\s>]", re.IGNORECASE),   # HTML/JS
        re.compile(rb"<\?php", re.IGNORECASE),         # PHP
        re.compile(rb"<\?=", re.IGNORECASE),           # PHP short tag
        re.compile(rb"<\? ", re.IGNORECASE),           # PHP short tag
        re.compile(rb"<%=", re.IGNORECASE),            # ASP
        re.compile(rb"<jsp:", re.IGNORECASE),          # JSP
        re.compile(rb"eval\s*\(", re.IGNORECASE),      # JS eval
        re.compile(rb"document\.write\s*\(", re.IGNORECASE), # JS document.write
        re.compile(rb"window\.location", re.IGNORECASE),     # JS window.location
        re.compile(rb"require\s*\(", re.IGNORECASE),   # Node.js require
        re.compile(rb"import\s+", re.IGNORECASE),      # ES6 import
    ]
    try:
        with open(file_path, "rb") as f:
            content = f.read()
            for pattern in script_patterns:
                if pattern.search(content):
                    return True
    except Exception:
        # If file can't be read, treat as suspicious
        return True
    return False

router = APIRouter()

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_bulk_application(
    
    response: Response,
    job_inputs: dict = Depends(validate_job_input),
    zipfolder: UploadFile = File(...),
    hr_id: str = Form(None),
):
    job_id = job_inputs.get("job_id")
    job_file = job_inputs.get("job_file")
    
    logger.info(f"Received job inputs: {job_inputs}")
    
    if job_id:
        job = JobDocument.get_job_by_id(job_id)
    elif job_file:

        allowed_file_types = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
                              "application/octet-stream", "application/msword","application/zip"}
        # if job_file.content_type not in allowed_file_types:
            
        #         response.status_code=status.HTTP_400_BAD_REQUEST
        #         return {
        #             "sucess": False,
        #             "error":"job file must be a PDF or DOCX file"
        #         }
        # additional checks using magic
        file_content = await job_file.read()
        mime = magic.from_buffer(file_content, mime=True)
        if mime not in allowed_file_types:
            response.status_code=status.HTTP_400_BAD_REQUEST
            return {
                    "success": False,
                    "error":"job file must be a PDF or DOCX file"
                }
        job_file.file.seek(0)
        try:
            file_path = await upload_file(job_file)
            extracted_job_requirement = extract_job_requirement(file_path)
            logger.info(extract_job_requirement)
            job = JobDocument.create_job(extracted_job_requirement, hr_id)
            job_id = str(job["_id"])
            job = JobDocument.get_job_by_id(job_id)
        except Exception as e:
            logger.critical(f"Error creating application: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
    else:
        response.status_code=status.HTTP_400_BAD_REQUEST
        return {
                    "sucess": False,
                    "error":"job source must be provided"
                }

    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    
    if not zipfolder.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a ZIP file.")
    try:
        failed_resumes = []
        with tempfile.TemporaryDirectory() as tmpdirname:
            zip_path = os.path.join(tmpdirname, zipfolder.filename)
            with open(zip_path, "wb") as f:
                content = await zipfolder.read()
                f.write(content)
            
            try:
                with zipfile.ZipFile(zip_path, "r") as zip_ref:
                    zip_ref.extractall(tmpdirname)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error extracting ZIP file: {str(e)}")
            
            resume_files = []
            for root, dirs, files in os.walk(tmpdirname):
                for file in files:
                    if file.lower().endswith((".pdf", ".docx", ".txt")):
                        file_path = os.path.join(root, file)
                        # resume_files.append(file_path)
                        resume_files.append({"filename": file,"path": file_path})
                        
                        
            if not resume_files:
                raise HTTPException(status_code=400, detail="No resume files found in the ZIP folder.")
            
            processed_count = 0
            errors = []
            allowed_file_types = {
                                "application/pdf",
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                "application/msword",
                                "application/octet-stream",  #DOCX 
                                 }
            
            for resume in resume_files:
                try:
                    if not os.path.exists(resume["path"]):
                        raise Exception(f"File not found: {resume['path']} for {resume['filename']}")

                    # if contains_script_code(file_path):
                        # raise Exception(f"File Contains script")
                    # remove due to false positives
                    
                    
                    # Determine MIME type
                    content_type = magic.from_file(resume["path"], mime=True)
                    if content_type not in allowed_file_types:
                        raise Exception(f"File type not allowed: {content_type}")

                    # if file_path.lower().endswith(".pdf"):
                    #     content_type = "application/pdf"
                    # elif file_path.lower().endswith(".docx"):
                    #     content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    # else:
                    #     content_type = "text/plain"
                    
                    with open(resume["path"], "rb") as f:
                        try:
                           upload_file_obj = UploadFile(
                            filename=os.path.basename(resume["path"]),
                            file=f,
                            headers={"content-type": content_type}  
                        )
                           f.seek(0)  # Reset file pointer
                        
                           cv_link = await upload_file(upload_file_obj)
                        except Exception as e:
                            failed_resumes.append(resume["filename"])
                            logger.critical(f"Failed to upload file {resume['filename']}: {str(e)}")
                            continue


                    # Extract information
                    extracted_info = extract_applicant_information(resume["path"])
                    # Create candidate
                    candidate_data = {
                        "email": extracted_info.get("email", "unknown@example.com"),
                        "phone_number": extracted_info.get("phone_number", "Unknown"),
                        "gender": extracted_info.get("gender", "Unknown"),
                        "experience_years": extracted_info.get("experience_years", "0"),
                        "full_name": extracted_info.get("full_name", "Unknown Candidate"),
                        "feedback": "",
                        "disability": extracted_info.get("disability", "Unknown"),
                        "skills": []
                    }
                    
                    candidate_id = CandidateDocument.create_candidate(candidate_data)
                    
                    # if ApplicationDocument.get_application_by_candidate_job(candidate_id, job_id):
                    #     errors.append(f"Duplicate application for {candidate_data['email']}")
                    #     continue

                    # Create application
                    application_data = {
                        "job_id": job_id,
                        "email": candidate_data["email"],
                        "full_name": candidate_data["full_name"],
                        "phone_number": candidate_data["phone_number"],
                        "gender": candidate_data["gender"],
                        "disability": candidate_data["disability"],
                        "cv_link": cv_link,
                        "experience_years": candidate_data["experience_years"],
                        "candidate_id": candidate_id,
                        "source": "bulk"
                    }
                    
                    new_application = ApplicationDocument.create_application(application_data)
                    if not new_application:
                        raise Exception("Application creation failed")

                    await publish_application({
                        "job_description": str(job["description"]),
                        "job_skills": str(job["skills"]),
                        "application_id": new_application,
                        "resume_path": cv_link,
                    })
                    
                    processed_count += 1

                except Exception as e:
                    logger.critical(f"Failed to process {resume['filename']}: {str(e)}", exc_info=True)
                    errors.append(f"{os.path.basename(resume['path'])}: {str(e)}")
                    continue
            
            return {
                "success": True if processed_count > 0 else False,
                "processed_count": processed_count,
                "resume_count": len(resume_files),
                "error_count": len(errors),
                "errors": errors,
                "failed_resumes": failed_resumes,
                "message": f"Processed {processed_count} resumes" + 
                        f" with {len(errors)} errors" if errors else ""
                        }
        
    except Exception as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return {
            "success": False,
            "error": "error occured during processing",
            "message": str(e)
        }


#Get all bulk applications for a specific job
@router.get("/{job_id}/applications", response_model=dict)
async def get_job_applications(response: Response,job_id: str):
    try:
        job = JobDocument.get_job_by_id(job_id)
        if not job:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {
                "sucess": False,
                "error": f"job application with id {job_id} not found"
            }
        
        applications = ApplicationDocument.get_applications_by_job(job_id)
        bulk_applications = []
        for app in applications:
            if app["source"] == "bulk":
                bulk_applications.append(app)

        return {"success": True, "applications": bulk_applications}
    except HTTPException:
        logger.error(HTTPException)
    except Exception as e:
        logger.error(f"Error retrieving applications: {e}")
        raise HTTPException(status_code=500, detail=f"Error retrieving applications: {e}")
