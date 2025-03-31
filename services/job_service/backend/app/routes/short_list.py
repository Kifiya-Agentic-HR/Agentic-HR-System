from fastapi import APIRouter, Body, HTTPException, status, Response
from app.database.models.shortlist_model import  ShortListDocument
from app.database.models.job_model import  JobDocument
from pydantic import BaseModel

class ShortListRequestBody(BaseModel):
    job_id: str
    hiring_manager_id: str


router = APIRouter()
@router.post("/{hiring_manager_id}", status_code=status.HTTP_201_CREATED, response_model=dict)
async def short_list_request(
    response: Response,
    hiring_manager_id: str,
    payload: ShortListRequestBody = Body(...)
):
    # Optionally check that the hiring_manager_id in the path matches the one in the body.
    if payload.hiring_manager_id != hiring_manager_id:
        raise HTTPException(status_code=400, detail="Mismatched hiring_manager_id between URL and body")

    job_id = payload.job_id

    try:
        if JobDocument.get_job_by_id(job_id) is None:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {"success": False, "error": f"job with job_id {job_id} not found"}
        short_list = ShortListDocument.create_request(job_id, hiring_manager_id)
        if short_list is None:
            response.status_code = status.HTTP_400_BAD_REQUEST
            return {"success": False, "error": "Short list request failed"}
        short_list['_id'] = str(short_list['_id'])
        return {"success": True, "short_list": short_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating short list request: {e}")


@router.get("/{hiring_manager_id}", response_model=dict)
async def get_short_list_requests(response: Response, hiring_manager_id: str):
    try:
        short_list = ShortListDocument.get_request_by_hr_manager(hiring_manager_id)
        response.status_code = status.HTTP_200_OK
        return {"success": True, "short_list": short_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving short list requests: {e}")

@router.delete("/{short_list_id}", response_model=dict)
async def delete_short_list_request(response: Response, short_list_id: str,):
    try:
        short_list = ShortListDocument.delete_request(short_list_id)
   
        if not short_list:
            response.status_code = status.HTTP_404_NOT_FOUND
            return {"success": False, "error": "The request does not exist"}
        return {"success": True, "short_list": short_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting short list request: {e}")

@router.get("/job/{job_id}", response_model=dict)
async def get_short_list_by_job(response: Response, job_id: str):
    try:
        short_list = ShortListDocument.get_request_by_job(job_id)
        return {"success": True, "short_list": short_list}
    except Exception as e:
        
        return {"success": False, "error": f"Error retrieving short list requests: {e}"}
