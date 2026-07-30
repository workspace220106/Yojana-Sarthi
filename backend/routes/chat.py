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
    print("Received request")
    print(request.query)

    try:
        print("Calling pipeline...")
        result = pipeline.ask(request.query)
        print("Pipeline finished!")

        return result

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )