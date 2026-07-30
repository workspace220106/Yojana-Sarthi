from fastapi import APIRouter, HTTPException

from schemas import ChatRequest, ChatResponse
from rag.rag_pipeline import RAGPipeline

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

pipeline = RAGPipeline()


@router.post("/", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Chat endpoint for Yojana Sarthi.
    """
    try:
        result = pipeline.ask(request.query)
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )