import os
import logging
import httpx
import uuid
from fastapi import HTTPException, UploadFile
from app.utils.config_local import Config as config
import json
import magic

# logging
logger = logging.getLogger(__name__)

# Constants
HR_UPLOAD_URL = config.UPLOAD_URL
HR_UPLOAD_USER = config.UPLOAD_USER
HR_UPLOAD_PASSWORD = config.UPLOAD_PASSWORD

async def upload_file(
    file: UploadFile,
    document_category: str = "other"
) -> str:
    """
    Uploads an incoming file to the Agentic HR HTTP API and returns its public URL.
    Raises HTTPException on invalid type or upload failure.
    """
    # 1. Validate MIME type
    allowed_types = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream" #docx
    }
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF and DOCX allowed."
        )
    
    
    # 2. Validate or coerce document_category
    valid_categories = {"resume", "contract", "id_document", "timesheet", "other"}
    if document_category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid document_category. Must be one of {valid_categories}."
        )

    # 3. Generate a random UUID4 for file_id
    file_id = str(uuid.uuid4()) 

    # 4. Construct the upload URL
    url = f"{HR_UPLOAD_URL}/api/hr-upload/upload/{file_id}"

    # 5. Perform the POST with Basic Auth and multipart/form-data
    try:
        async with httpx.AsyncClient(auth=(HR_UPLOAD_USER, HR_UPLOAD_PASSWORD)) as client:
            response = await client.post(
                url,
                headers={"x-document-category": document_category},
                files={"file": (file.filename, file.file, file.content_type)}
            )  # :contentReference[oaicite:1]{index=1}

    except httpx.HTTPError as e:
        logger.critical(f"Error connecting to upload service: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail=f"Error connecting to upload service: {str(e)}"
        )

    # 6. Handle non-200 responses
    if response.status_code != 200:
        logger.critical(f"Upload failed: {response.text}")
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Upload failed: {response.text}"
        )

    # 7. Parse and return the uploaded file URL
    data = response.json()
    file_url = data.get("file_url")
    if not file_url:
        logger.error(f"Unexpected response format: missing {file_url}")
        raise HTTPException(
            status_code=500,
            detail="Unexpected response format: missing 'file_url'"
        )

    return file_url
