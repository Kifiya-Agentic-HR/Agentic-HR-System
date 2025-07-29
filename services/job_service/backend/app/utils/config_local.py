import os
import logging

logger = logging.getLogger(__name__)

class Config:
    RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
    MONGODB_URL = os.getenv("MONGODB_URI", "mongodb://mongodb:27017/hr_db")
    QUEUE_NAME = os.getenv("QUEUE_NAME", "application_queue")
    UPLOAD_URL = os.getenv("UPLOAD_URL", None)
    UPLOAD_USER = os.getenv("UPLOAD_USER", None)
    UPLOAD_PASSWORD = os.getenv("UPLOAD_PASSWORD",  None)
 
    GEMINI_KEY = os.getenv("GEMINI_API_KEY", None)

    if not GEMINI_KEY:
        logger.error("Gemini_key not set")

    @classmethod
    def check_config(cls):
        try:
            assert cls.RABBITMQ_URL, "RabbitMQ URL is not set"
            assert cls.MONGODB_URL, "MongoDB URL is not set"
            assert cls.QUEUE_NAME, "Queue name is not set"
            assert cls.UPLOAD_URL is not None, "Upload URL is not set"
            assert cls.UPLOAD_USER is not None, "Upload user is not set"
            assert cls.UPLOAD_PASSWORD is not None, "Upload password is not set"
        except AssertionError as e:
            logger.error(f"Configuration error: {e}")
            raise

Config.check_config()