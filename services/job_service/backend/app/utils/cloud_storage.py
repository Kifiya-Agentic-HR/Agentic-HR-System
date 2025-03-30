import os
import boto3
import logging
from fastapi import HTTPException, UploadFile
from botocore.client import Config
import botocore.exceptions
from app.utils.config_local import Config as config
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Retrieve configuration from environment variables
CV_BUCKET = config.CV_BUCKET
MINIO_URL = config.MINIO_URL
MINIO_ROOT_USER = config.MINIO_ROOT_USER
MINIO_ROOT_PASSWORD = config.MINIO_ROOT_PASSWORD

def random_file_name(file_name: str) -> str:
    """
    Generate a random file name to ensure uniqueness.
    """
    return f"{os.urandom(8).hex()}_{file_name}"

# Set up the boto3 client
s3_client = boto3.client(
    "s3",
    endpoint_url=MINIO_URL,
    aws_access_key_id=MINIO_ROOT_USER,
    aws_secret_access_key=MINIO_ROOT_PASSWORD,
    config=Config(signature_version="s3v4")
)

# Ensure the bucket exists; if not, create it.
try:
    s3_client.head_bucket(Bucket=CV_BUCKET)
except botocore.exceptions.ClientError:
    try:
        s3_client.create_bucket(Bucket=CV_BUCKET)
        logger.info("Bucket '%s' created.", CV_BUCKET)
        
        # Set bucket policy to allow public read
        bucket_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{CV_BUCKET}/*"
                }
            ]
        }
        s3_client.put_bucket_policy(
            Bucket=CV_BUCKET,
            Policy=json.dumps(bucket_policy)
        )
        logger.info("Public read access policy set for bucket '%s'.", CV_BUCKET)
    except Exception as e:
        logger.error("Failed to configure bucket: %s", e)
        logger.error("Failed to create bucket '%s': %s", CV_BUCKET, e)
        raise Exception(f"Bucket {CV_BUCKET} not found and could not be created.")
   
async def upload_file(file: UploadFile) -> str:
    """
    Uploads an incoming file to the S3-compatible object store and returns
    its public URL.

    Raises:
        HTTPException: If the file type is not allowed or upload fails.
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
    
    file_name = random_file_name(file.filename)  # Ensure unique names.
    
    try:
        # Upload the file object directly to the bucket with public-read ACL.
        s3_client.upload_fileobj(
            file.file,
            CV_BUCKET,
            file_name,
            ExtraArgs={'ACL': 'public-read'}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading file: {str(e)}"
        )
    
    # Construct the public URL of the uploaded file.
    public_url = f"{MINIO_URL}/{CV_BUCKET}/{file_name}"
    return public_url
