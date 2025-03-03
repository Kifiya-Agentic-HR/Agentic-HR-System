from fastapi import APIRouter, HTTPException, status
from schemas import JobCreate, JobUpdate
from app.database.models import JobDocument, ApplicationDocument
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=dict)
async def get_jobs():
    try:
        jobs = JobDocument.get_all_jobs()
        return {"success": True, "jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving jobs: {e}")

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_job(job: JobCreate):
    try:
        job_data = job.dict()
        if not job_data.get("postDate"):
            job_data["postDate"] = datetime.utcnow()
        new_job = JobDocument.create_job(job_data)
        if new_job is None:
            raise Exception("Job creation failed")
        return {"success": True, "job_id": str(new_job["_id"])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating job: {e}")

@router.get("/{job_id}", response_model=dict)
async def get_job(job_id: str):
    try:
        job = JobDocument.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"success": True, "job": job}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving job: {e}")

@router.put("/{job_id}", response_model=dict)
async def update_job(job_id: str, job_update: JobUpdate):
    try:
        update_data = {k: v for k, v in job_update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No update fields provided")
        updated_job = JobDocument.update_job(job_id, update_data)
        if not updated_job:
            raise HTTPException(status_code=404, detail="Job not found or update failed")
        return {"success": True, "job": updated_job}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating job: {e}")

#Get all applications for a specific job
@router.get("/{job_id}/applications", response_model=dict)
async def get_job_applications(job_id: str):
    try:
        job = JobDocument.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        applications = ApplicationDocument.get_applications_by_job(job_id)
        return {"success": True, "applications": applications}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving applications: {e}")
