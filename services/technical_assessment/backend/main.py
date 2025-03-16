from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  
from app.routes.question import router as question_router
from app.routes.sumbission import router as submission_router

app = FastAPI(title="Questions API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(question_router, prefix="/questions", tags=["Question"])
app.include_router(submission_router, prefix="/submision", tags=["Submission"])


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4455)
