from fastapi import APIRouter, HTTPException, status, Response
from app.schemas.job_schema import JobCreate, JobUpdate
from app.database.models.job_model import JobDocument
from app.database.models.application_model import  ApplicationDocument
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

# @router.put("/{job_id}", response_model=dict)
# async def update_job(response:Response ,job_id: str, job_update: JobUpdate):
#     try:
#         update_data = {k: v for k, v in job_update.dict().items() if v is not None}
#         if not update_data:
#             response.status_code = status.HTTP_400_BAD_REQUEST
#             return {
#                 "success": False,
#                 "error":"missing update fields provided"
#             }
#         updated_job = JobDocument.update_job(job_id, update_data)
#         if not updated_job:
#             response.status_code = status.HTTP_404_NOT_FOUND
#             return {
#                 "success": False,
#                 "error":"job not found or error occured when updated"
#             }
#         return {"success": True, "job": updated_job}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error updating job: {e}")
    
@router.patch("/{job_id}", response_model=dict)
async def update_job(response: Response, job_id: str, job_update: JobUpdate):
    try:
        # Get only provided fields excluding None values
        update_data = job_update.dict(exclude_unset=True)
        print("Received data:", update_data)

        if 'status' in update_data:
            update_data['job_status'] = update_data.pop('status')
        
        print("Processed update data:", update_data)
        
        if not update_data:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {
                "success": False,
                "error": "No update fields provided"
            }

        updated_job = JobDocument.update_job(job_id, update_data)
        
        if not updated_job:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {
                "success": False,
                "error": "Job not found or update failed"
            }

        return {"success": True, "job": updated_job}

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating job: {str(e)}"
        )

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
