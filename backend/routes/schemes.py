from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from pathlib import Path
import re

router = APIRouter(prefix="/api/schemes", tags=["schemes"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
METADATA_PATH = BASE_DIR / "data" / "embeddings" / "chunks_metadata.json"

SCHEMES_DB = []

def load_schemes():
    global SCHEMES_DB
    if SCHEMES_DB:
        return
    try:
        if not METADATA_PATH.exists():
            print(f"Metadata file not found at {METADATA_PATH}, using empty list.")
            return

        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            chunks = json.load(f)

        unique_schemes = {}
        for c in chunks:
            title = c.get("title")
            if not title:
                continue

            if title not in unique_schemes:
                metadata = c.get("metadata", {})
                categories = metadata.get("categories", ["Other"])
                category = categories[0] if categories else "Other"

                unique_schemes[title] = {
                    "id": c.get("slug") or title.lower().replace(" ", "-"),
                    "name": title,
                    "category": category,
                    "benefit": "Financial Assistance / Subsidy",
                    "benefit_amount": 5000,
                    "eligibility": "VJNT/SC/ST/OBC category resident of Maharashtra.",
                    "age_min": 18,
                    "age_max": 65,
                    "income_max": 800000,
                    "occupation": "All",
                    "category_target": "All",
                    "priority": "Medium",
                    "documents": ["Aadhaar Card", "Income Certificate", "Caste Certificate"],
                    "details": "Click view details or refer to official department portal.",
                    "sections": {}
                }

            section = c.get("section")
            text = c.get("text", "")
            unique_schemes[title]["sections"][section] = text

            # Parse key details dynamically from sections
            if section == "Benefits":
                unique_schemes[title]["benefit"] = text[:120] + "..." if len(text) > 120 else text
                unique_schemes[title]["details"] = text
                # Try to find currency amount (e.g. ₹5,000 or Rs. 10000)
                amt_matches = re.findall(r'(?:₹|Rs\.?)\s*([\d,]+)', text)
                if amt_matches:
                    try:
                        unique_schemes[title]["benefit_amount"] = int(amt_matches[0].replace(",", ""))
                    except:
                        pass
            elif section == "Eligibility":
                unique_schemes[title]["eligibility"] = text[:150] + "..." if len(text) > 150 else text
                # Extract age limits
                age_matches = re.findall(r'(\d+)\s*(?:to|-)\s*(\d+)\s*years', text.lower())
                if age_matches:
                    unique_schemes[title]["age_min"] = int(age_matches[0][0])
                    unique_schemes[title]["age_max"] = int(age_matches[0][1])
                else:
                    age_min_match = re.findall(r'age\s*(?:above|of|at least)\s*(\d+)', text.lower())
                    if age_min_match:
                        unique_schemes[title]["age_min"] = int(age_min_match[0])
            elif section == "Documents Required":
                docs = [line.strip().replace("-", "").replace("*", "").replace("•", "").strip() 
                        for line in text.split("\n") 
                        if line.strip() and len(line.strip()) < 80]
                if docs:
                    unique_schemes[title]["documents"] = docs[:6]

        # Convert to list and sort by name
        SCHEMES_DB = sorted(list(unique_schemes.values()), key=lambda x: x["name"])
        print(f"Dynamically loaded {len(SCHEMES_DB)} schemes from database metadata.")
    except Exception as e:
        print("Error dynamically loading schemes:", e)

# Trigger loading on module import
load_schemes()

class CompareRequest(BaseModel):
    scheme_ids: List[str]

@router.get("/")
def get_all_schemes():
    # Reload if empty
    if not SCHEMES_DB:
        load_schemes()
    return SCHEMES_DB

@router.post("/compare")
def compare_schemes(request: CompareRequest):
    if not SCHEMES_DB:
        load_schemes()
    selected_schemes = [s for s in SCHEMES_DB if s["id"] in request.scheme_ids]
    if not selected_schemes:
        raise HTTPException(status_code=404, detail="No matching schemes found")
    return selected_schemes
