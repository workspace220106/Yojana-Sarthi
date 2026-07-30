from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.cashfree import get_digilocker_url, get_digilocker_status

router = APIRouter(prefix="/api/verification", tags=["verification"])

class URLRequest(BaseModel):
    redirect_url: str

@router.post("/digilocker/url")
def create_url(request: URLRequest):
    try:
        result = get_digilocker_url(request.redirect_url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/digilocker/status/{verification_id}")
def get_status(verification_id: str):
    try:
        result = get_digilocker_status(verification_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
