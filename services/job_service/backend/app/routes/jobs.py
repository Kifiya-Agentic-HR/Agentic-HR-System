from fastapi import APIRouter, HTTPException, status, Response
from schemas import JobCreate, JobUpdate
from app.database.models import JobDocument, ApplicationDocument, ShortListDocument
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
async def create_job(job: JobCreate, hr_id: str):
    try:
        job_data = job.dict()
        if not job_data.get("post_date"):
            job_data["post_date"] = datetime.utcnow()
        new_job = JobDocument.create_job(job_data, hr_id)
        if new_job is None:
            raise Exception("Job creation failed")
        new_job['_id'] = str(new_job['_id'])
        return {"success": True, "job": new_job}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating job: {e}")

@router.get("/{job_id}", response_model=dict)
async def get_job(response: Response,job_id: str):
    try:
        job = JobDocument.get_job_by_id(job_id)
        if not job:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {
                "sucess": False,
                "error": f"job application with id {job_id} not found"
            }
        return {"success": True, "job": job}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving job: {e}")

@router.put("/{job_id}", response_model=dict)
async def update_job(response:Response ,job_id: str, job_update: JobUpdate):
    try:
        update_data = {k: v for k, v in job_update.dict().items() if v is not None}
        if not update_data:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {
                "success": False,
                "error":"missing update fields provided"
            }
        updated_job = JobDocument.update_job(job_id, update_data)
        if not updated_job:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {
                "success": False,
                "error":"job not found or error occured when updated"
            }
        return {"success": True, "job": updated_job}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating job: {e}")

#Get all applications for a specific job
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
        return {"success": True, "applications": applications}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving applications: {e}")
    


@router.post("/short_list_request/{hr_manager_id}", status_code=status.HTTP_201_CREATED, response_model=dict)
async def short_list_request(response: Response, job_id: str, hr_manager_id: str):
    try:
        short_list = ShortListDocument.create_request(job_id, hr_manager_id)
        if short_list is None:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Short list request failed"}
        short_list['_id'] = str(short_list['_id'])
        return {"success": True, "short_list": short_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating short list request: {e}")
    


@router.get("/short_list_request/{hr_manager_id}", response_model=dict)
async def get_short_list_requests(response: Response, hr_manager_id: str):
    try:
        short_list = ShortListDocument.get_request_by_hr_manager(hr_manager_id)
        response.status_code = status.HTTP_200_OK
        return {"success": True, "short_list": short_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving short list requests: {e}")

@router.delete("/short_list_request/", response_model=dict)
async def delete_short_list_request(response: Response, hr_manager_id: str, job_id: str):
    try:
        short_list = ShortListDocument.delete_request(hr_manager_id, job_id)
   
        if not short_list:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {"success": False, "error": "The request does not exist"}
        return {"success": True, "short_list": short_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting short list request: {e}")