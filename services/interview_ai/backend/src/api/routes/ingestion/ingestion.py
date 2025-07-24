from fastapi import APIRouter, UploadFile, File, HTTPException, Form
import json
from pydantic import BaseModel
from typing import Dict, Optional
import uuid
from src.api.services.file_processor import process_file, chunk_text
from src.api.core.weaviate import get_weaviate_client
import logging

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/ingest", tags=["Ingestion"])

class IngestionMetadata(BaseModel):
    tag: str
    source: str
    author: Optional[str] = None
    custom_metadata: Dict = {}

@router.post("/documents", summary="Ingest document")
async def ingest_document(
    file: UploadFile = File(...),
    metadata: str = Form(...),  # Will receive JSON string
):
    try:
        # Parse metadata JSON string
        metadata_dict = json.loads(metadata)
        metadata_obj = IngestionMetadata(**metadata_dict)
        
        weaviate_client = await get_weaviate_client()
        file_content = await process_file(file)
        chunks = chunk_text(file_content)
        
        document_id = str(uuid.uuid4())
        results = []
        
        for i, chunk in enumerate(chunks):
            chunk_id = f"{document_id}_chunk{i}"
            data_object = {
                "text": chunk,
                "file_name": file.filename,
                "tag": metadata_obj.tag,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "metadata": {
                    **metadata_obj.custom_metadata,
                    "source": metadata_obj.source,
                    "author": metadata_obj.author,
                }
            }
            
            weaviate_client.data_object.create(
                data_object=data_object,
                class_name="DocumentChunk",
                uuid=chunk_id
            )
            results.append(chunk_id)
            
        return {
            "document_id": document_id,
            "chunk_ids": results,
            "total_chunks": len(chunks)
        }
        
    except Exception as e:
        logger.error(f"Document processing failed: {(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(e)}"
        )

@router.delete("/documents/{document_id}", summary="Delete document")
async def delete_document(document_id: str):
    try:
        weaviate_client = await get_weaviate_client()
        # Implementation for document deletion
        return {"message": "Document deletion scheduled"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Deletion failed: {str(e)}"
        )