from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from src.api.core.weaviate import get_weaviate_client

router = APIRouter(prefix="/retrieve", tags=["Retrieval"])

class RetrievalRequest(BaseModel):
    query: str
    tag: str
    limit: int = 3
    similarity_threshold: Optional[float] = 0.7

class DocumentResponse(BaseModel):
    id: str
    text: str
    file_name: str
    tag: str
    confidence: float
    metadata: dict

@router.post("/semantic-search", response_model=List[DocumentResponse])
async def semantic_search(request: RetrievalRequest):
    try:
        weaviate_client = get_weaviate_client()
        response = (
            weaviate_client.query
            .get("DocumentChunk", ["text", "file_name", "tag", "metadata"])
            .with_near_text({"concepts": [request.query], "certainty": request.similarity_threshold})
            .with_where({
                "path": ["tag"],
                "operator": "Equal",
                "valueText": request.tag
            })
            .with_limit(request.limit)
            .do()
        )
        
        results = response.get('data', {}).get('Get', {}).get('DocumentChunk', [])
        return [DocumentResponse(**item, confidence=item["_additional"]["certainty"]) for item in results]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )