import os
import shutil
from fastapi import HTTPException, UploadFile

# Set the directory for temporary file storage.
UPLOAD_DIR = 'temp'
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def upload_file(file: UploadFile) -> str:
    """
    Saves an uploaded file locally and returns its file path.
    
    Raises:
        HTTPException: If the file type is not allowed.
    """
    allowed_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF and DOCX allowed."
        )
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return file_path
