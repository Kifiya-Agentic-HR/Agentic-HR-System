import weaviate
from fastapi import Depends
from functools import lru_cache
from src.api.core.config import settings

@lru_cache
def get_weaviate_client():
    client = weaviate.Client(
        url=settings.WEAVIATE_URL,
        additional_headers={"X-Text2Vec-Transformers": {}}
    )
    
    class_obj = {
        "class": "DocumentChunk",
        "vectorizer": "text2vec-transformers",
        "properties": [
            {"name": "text", "dataType": ["text"]},
            {"name": "file_name", "dataType": ["string"]},
            {"name": "tag", "dataType": ["string"]},
            {"name": "chunk_index", "dataType": ["int"]},
            {"name": "total_chunks", "dataType": ["int"]},
            {"name": "metadata", "dataType": ["object"]}
        ]
    }
    
    if not client.schema.contains(class_obj):
        client.schema.create_class(class_obj)
    
    return client