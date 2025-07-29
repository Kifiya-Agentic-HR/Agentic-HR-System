import os
from dotenv import load_dotenv
load_dotenv()

# for local porting with venv
localmq = "amqp://guest:guest@localhost:5672/"
localmongo = "mongodb://localhost:27027/hr_db"

# with docker
mq = "amqp://guest:guest@rabbitmq:5672/"
mongo =  "mongodb://mongodb:27017/hr_db"
class Config:
    RABBITMQ_URL = os.getenv("RABBITMQ_URL", mq)
    MONGODB_URL = os.getenv("MONGODB_URI", mongo)
    QUEUE_NAME = os.getenv("QUEUE_NAME", "application_queue")
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/shared_volume")
    GEMINI_KEY = os.getenv("GEMINI_API_KEY", None)
    @classmethod
    def check_config(cls):
        assert cls.RABBITMQ_URL, "RabbitMQ URL is not set"
        assert cls.MONGODB_URL, "MongoDB URL is not set"
        assert cls.QUEUE_NAME, "Queue name is not set"
        assert cls.UPLOAD_DIR, "Upload directory is not set"

Config.check_config()
