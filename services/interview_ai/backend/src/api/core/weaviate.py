import logging
import weaviate
from weaviate.connect import ConnectionParams
from weaviate.classes.init import AdditionalConfig, Timeout, Auth
from src.api.core.config import settings

_client = None
logger = logging.getLogger(__name__)

async def get_weaviate_client():
    global _client
    if _client is None:
        try:
            _client = weaviate.WeaviateAsyncClient(
                connection_params=ConnectionParams.from_params(
                    http_host=settings.WEAVIATE_HOST,
                    http_port=settings.WEAVIATE_PORT,
                    http_secure=False,
                    grpc_host=settings.WEAVIATE_HOST,
                    grpc_port=50051,
                    grpc_secure=False,
                ),
                additional_headers={"X-Text2Vec-Transformers": {}},
                additional_config=AdditionalConfig(
                    timeout=Timeout(init=30, query=60, insert=120),  # seconds
                ),
                skip_init_checks=False
            )

            # List existing collections (the new v4 "schema")
            existing_collections = await _client.collections.list_all()
            if "DocumentChunk" not in existing_collections:
                await _client.collections.create(
                    name="DocumentChunk",
                    vectorizer_config="text2vec-transformers",
                    properties=[
                        {"name": "text", "dataType": ["text"]},
                        {"name": "file_name", "dataType": ["string"]},
                        {"name": "tag", "dataType": ["string"]},
                        {"name": "chunk_index", "dataType": ["int"]},
                        {"name": "total_chunks", "dataType": ["int"]},
                        {"name": "metadata", "dataType": ["object"]}
                    ]
                )
        except Exception as e:
            logger.error(f"Failed to connect to Weaviate or create collection: {e}")
            raise
    return _client.connect()
