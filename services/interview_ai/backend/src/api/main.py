from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes.interview import router as interview_router
from src.api.db.dependencies import setup_dependencies

def create_app():
    app = FastAPI(title="Interview API", version="1.0.0")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    setup_dependencies(app)
    app.include_router(interview_router)
    
    return app

app = create_app()