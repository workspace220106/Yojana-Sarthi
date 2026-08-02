# TODO: Implement FastAPI application entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.chat import router as chat_router
from routes.verification import router as verification_router
from routes.schemes import router as schemes_router
from routes.speech import router as speech_router
from config import API_TITLE, API_VERSION

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description="Yojana Sarthi - AI Assistant for Government Schemes"
)

# Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Later replace "*" with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "message": "Yojana Sarthi Backend is running 🚀"
    }

# Register Routes
app.include_router(chat_router)
app.include_router(verification_router)
app.include_router(schemes_router)
app.include_router(speech_router)