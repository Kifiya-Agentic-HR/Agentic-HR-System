from fastapi import FastAPI
from app.routes.jobs import router as job_router
from app.routes.applications import router as application_router
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

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
