from src.config_local import Config
from fastapi import FastAPI, Form, UploadFile, File, HTTPException, status
from pydantic import BaseModel
import uuid
import os
from src.rabbitMQ.producer import publish_application
from src.models import JobDocument, ApplicationDocument
import aiofiles
import logging
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
import requests
from typing import Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Email notification service
email_server = os.getenv("NOTIFICATION_SERVICE_URL", "")


if not email_server:
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
        response.raise_for_status()
        return {"status": "success", "data": response.json()}
    except requests.exceptions.RequestException as e:
        return {"status": "error", "message": str(e)}

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobPostRequest(BaseModel):
    title: str
    description: str

@app.post("/job_post", status_code=status.HTTP_201_CREATED)
async def post_job(request: JobPostRequest):
    if not request.title.strip() or not request.description.strip():
        raise HTTPException(status_code=400, detail="Title and description cannot be empty")

    job_data = {"title": request.title, "description": request.description}

    try:
        job = JobDocument.create_job(job_data)
        return {"job_id": str(job.job_id), "message": "Job posted successfully"}
    except Exception as e:
        logger.error(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail="Failed to create job")

@app.get("/jobs")
def get_jobs():
    try:
        return JobDocument.get_all_jobs()
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch jobs")

@app.get("/jobs/{job_id}")
def get_job(job_id: str):  # Use str for MongoDB ObjectId
    try:
        if not ObjectId.is_valid(job_id):
            raise HTTPException(status_code=400, detail="Invalid job ID format")

        job = JobDocument.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except Exception as e:
        logger.error(f"Error fetching job {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch job")

@app.post("/jobs/{job_id}/apply", status_code=status.HTTP_201_CREATED)
async def submit_application(
    job_id: str,  # Use str for MongoDB ObjectId
    name: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...)
):
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job ID format")

    try:
        os.makedirs(Config.UPLOAD_DIR, exist_ok=True)
        file_uuid = uuid.uuid4()
        resume_filename = f"{file_uuid}_{resume.filename}"
        resume_path = os.path.join(Config.UPLOAD_DIR, resume_filename)

        # Save file
        async with aiofiles.open(resume_path, "wb") as f:
            await f.write(await resume.read())

        # Create application document
        application_data = {
            "job_id": job_id,
            "name": name,
            "email": email,
            "cv": resume_path
        }

        application = ApplicationDocument.create_application(application_data)
        application_id = str(application["_id"])

        logger.info(f"Application submitted successfully: {application_id}")

        # Send email notification
        if email_server:
            job = JobDocument.get_job_by_id(job_id)
            job_title = job["title"] if job else "Unknown Job"

            send_email_notification(
                email,
                "Application Received!",
                type="application_received",
                name=name,
                title=job_title
            )

        # Publish application to message queue
        await publish_application({
            "app_id": application_id,
            "resume_path": resume_path,
            "job_id": job_id
        })

        return {"app_id": application_id, "message": "Application submitted successfully"}

    except Exception as e:
        logger.error(f"Application submission failed: {e}")
        if os.path.exists(resume_path):
            os.remove(resume_path)  # Clean up file if submission fails
        raise HTTPException(status_code=500, detail="Failed to submit application")
