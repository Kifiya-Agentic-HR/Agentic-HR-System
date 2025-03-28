import os

class Config:
    RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
    MONGODB_URL = os.getenv("MONGODB_URI", "mongodb://mongodb:27017/hr_db")
    QUEUE_NAME = os.getenv("QUEUE_NAME", "application_queue")
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/shared_volume")
    CV_BUCKET = os.getenv("CV_BUCKET", "cv")
    MINIO_URL = os.getenv("MINIO_URL", None)
    MINIO_ROOT_USER = os.getenv("MINIO_ROOT_USER", None)
    MINIO_ROOT_PASSWORD = os.getenv("MINIO_ROOT_PASSWORD", None)
    GEMINI_KEY = os.getenv("GEMINI_API_KEY", None)


    @classmethod
    def check_config(cls):
        assert cls.RABBITMQ_URL, "RabbitMQ URL is not set"
        assert cls.MONGODB_URL, "MongoDB URL is not set"
        assert cls.QUEUE_NAME, "Queue name is not set"
        assert cls.UPLOAD_DIR, "Upload directory is not set"
        assert cls.MINIO_URL is not None, "MinIO URL is not set"
        assert cls.MINIO_ROOT_USER is not None, "MinIO root user is not set"
        assert cls.MINIO_ROOT_PASSWORD is not None, "MinIO root password is not set"

Config.check_config()