from fastapi import APIRouter
from .scheduling import router as scheduling_router
from .sessions import router as sessions_router
from .chat import router as chat_router

router = APIRouter(prefix="/interview", tags=["interview"])
router.include_router(scheduling_router)
router.include_router(sessions_router)
router.include_router(chat_router)