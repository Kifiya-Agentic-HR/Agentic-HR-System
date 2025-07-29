from app.logger import setup_logging
setup_logging()

from fastapi import FastAPI
from app.routes.jobs import router as job_router
from app.routes.applications import router as application_router
from app.routes.bulk_application import router as bulk_router
from app.routes.short_list import router as short_list_router
from app.routes.recommendations import router as recommendation_router
from app.routes.recommendations import router as requeue_router
from fastapi.middleware.cors import CORSMiddleware  


app = FastAPI(title="Jobs API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(job_router, prefix="/jobs", tags=["Jobs"])
app.include_router(application_router, prefix="/applications", tags=["Applications"])
app.include_router(bulk_router, prefix = '/bulk', tags = ["bulk"])
app.include_router(short_list_router, prefix="/short_list", tags=["short_list"])
app.include_router(recommendation_router, prefix="/recommendations", tags=["recommendations"])
app.include_router(requeue_router, prefix="/re", tags=["requeue"])
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
