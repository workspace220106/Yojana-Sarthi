import os
import uuid
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

CLIENT_ID = os.getenv("CASHFREE_CLIENT_ID")
CLIENT_SECRET = os.getenv("CASHFREE_CLIENT_SECRET")
ENV = os.getenv("CASHFREE_ENV", "sandbox")

BASE_URL = (
    "https://api.cashfree.com"
    if ENV == "production"
    else "https://sandbox.cashfree.com"
)

def get_digilocker_url(callback_url: str):
    """
    Generate a secure consent redirect URL for DigiLocker via Cashfree.
    """
    if not CLIENT_ID or not CLIENT_SECRET:
        raise ValueError("Cashfree Client ID or Client Secret is not configured.")

    endpoint = f"{BASE_URL}/verification/digilocker/url"
    verification_id = f"vid_{uuid.uuid4().hex[:12]}"
    
    headers = {
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET,
        "Content-Type": "application/json"
    }
    
    payload = {
        "verification_id": verification_id,
        "redirect_url": callback_url,
        "back_url": callback_url
    }
    
    response = requests.post(endpoint, json=payload, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Cashfree API Error: {response.text}")
        
    data = response.json()
    return {
        "verification_id": verification_id,
        "url": data.get("url"),
        "status": data.get("status")
    }

def get_digilocker_status(verification_id: str):
    """
    Retrieve verification status and extracted profile details / document PDFs from Cashfree.
    """
    if not CLIENT_ID or not CLIENT_SECRET:
        raise ValueError("Cashfree Client ID or Client Secret is not configured.")

    endpoint = f"{BASE_URL}/verification/digilocker/status/{verification_id}"
    
    headers = {
        "x-client-id": CLIENT_ID,
        "x-client-secret": CLIENT_SECRET
    }
    
    response = requests.get(endpoint, headers=headers)
    
    if response.status_code != 200:
        raise Exception(f"Cashfree API Error: {response.text}")
        
    return response.json()
