from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database.db import db

router = APIRouter(prefix="/api/admin", tags=["admin"])

class StatusUpdateRequest(BaseModel):
    status: str

@router.get("/stats")
def get_admin_stats():
    try:
        citizens = db.collection("citizens").stream()
        fraud_logs = db.collection("fraud_logs").stream()

        total_users = 0
        verified = 0
        pending = 0
        failed = 0
        
        for doc in citizens:
            total_users += 1
            data = doc.to_dict()
            status = data.get("verification_status", "Pending")
            if status == "Verified":
                verified += 1
            elif status == "Failed":
                failed += 1
            else:
                pending += 1

        unresolved_fraud = 0
        for doc in fraud_logs:
            data = doc.to_dict()
            if data.get("status") == "Unresolved":
                unresolved_fraud += 1

        return {
            "total_users": total_users,
            "verified_users": verified,
            "pending_verifications": pending,
            "failed_verifications": failed,
            "unresolved_fraud_alerts": unresolved_fraud
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/citizens")
def get_citizens():
    try:
        citizens_ref = db.collection("citizens").stream()
        results = []
        for doc in citizens_ref:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/citizens/{user_id}/status")
def update_citizen_status(user_id: str, request: StatusUpdateRequest):
    try:
        if request.status not in ["Verified", "Pending", "Failed"]:
            raise HTTPException(status_code=400, detail="Invalid verification status")
            
        doc_ref = db.collection("citizens").document(user_id)
        doc_ref.update({"verification_status": request.status})
        return {"status": "success", "message": f"User status updated to {request.status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fraud-alerts")
def get_fraud_alerts():
    try:
        alerts_ref = db.collection("fraud_logs").stream()
        results = []
        for doc in alerts_ref:
            data = doc.to_dict()
            data["id"] = doc.id
            results.append(data)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/fraud-alerts/{fraud_id}/status")
def update_fraud_status(fraud_id: str, request: StatusUpdateRequest):
    try:
        if request.status not in ["Resolved", "Unresolved"]:
            raise HTTPException(status_code=400, detail="Invalid fraud log status")
            
        doc_ref = db.collection("fraud_logs").document(fraud_id)
        doc_ref.update({"status": request.status})
        return {"status": "success", "message": f"Fraud alert status updated to {request.status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
