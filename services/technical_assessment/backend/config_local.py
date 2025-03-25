import os

class Config:
    MONGODB_URL = os.getenv("MONGODB_URI", "mongodb://mongodb:27017/hr_db")
    UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/shared_volume")
    

    @classmethod
    def check_config(cls):
        assert cls.MONGODB_URL, "MongoDB URL is not set"
        assert cls.UPLOAD_DIR, "Upload directory is not set"

Config.check_config()