from fastapi import APIRouter, HTTPException, status, Response
from app.database.models.job_model import JobDocument
from app.database.models.application_model import  ApplicationDocument
from app.database.models.recommendation_model import RecommendationDocument
from datetime import datetime
from app.utils.publisher import publish_application
router = APIRouter()



@router.post("/", status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_recommendations(response: Response,job_id: str):
    try:
        job = JobDocument.get_job_by_id(job_id)
        if not job:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {
                "sucess": False,
                "error": f"job with id {job_id} not found"
            }
        applications = [application for application in ApplicationDocument.get_applications() if application['application_status'] != "hired" ]
        for application in applications:
            await publish_application({
                "job_description": str(job["description"]),
                "job_skills": str(job["skills"]),
                "application_id": str(application["_id"]),
                "resume_path": application["cv_link"],
                "from": "recommendation",
                "job_id": job_id,
            })
        response.status_code = status.HTTP_201_CREATED

        return {"success": True, "detail": "All the applicants data send to the screening service" }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating job: {e}")

@router.get("/{job_id}", response_model=dict)
async def get_recomendation_by_job_id(response: Response,job_id: str):
    try:
        recommended_applications = RecommendationDocument.get_recommendationsby_job_id(job_id)
        if not recommended_applications:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {
                "sucess": False,
                "error": f"recommended application with job_id {job_id} not found"
            }
        return {"success": True, "recommend applications": recommended_applications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving job: {e}")

