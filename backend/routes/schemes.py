from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/schemes", tags=["schemes"])

SCHEMES_DB = [
    {
        "id": "pm-kisan",
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "category": "Agriculture",
        "benefit": "₹6,000 / year (3 installments of ₹2,000)",
        "benefit_amount": 6000,
        "eligibility": "Small and marginal farmers holding cultivable land up to 2 hectares.",
        "age_min": 18,
        "age_max": 100,
        "income_max": None,
        "occupation": "Farmer / Agriculture",
        "category_target": "All",
        "priority": "High",
        "documents": ["Aadhaar Card", "Land holding records (7/12)", "Bank Account Details"],
        "details": "Direct income support of ₹6,000 per annum to all landholding farmer families across the country."
    },
    {
        "id": "mahadbt-post-matric",
        "name": "Post-Matric Scholarship Scheme (MahaDBT)",
        "category": "Education",
        "benefit": "100% Tuition Fees and Exam Fees Waiver",
        "benefit_amount": 25000,
        "eligibility": "Students belonging to SC/ST/OBC/EWS categories pursuing post-matric courses.",
        "age_min": 15,
        "age_max": 30,
        "income_max": 800000,
        "occupation": "Student",
        "category_target": ["SC", "ST", "OBC", "EWS"],
        "priority": "High",
        "documents": ["Aadhaar Card", "Caste Certificate", "Income Certificate", "Marksheet"],
        "details": "Provides financial assistance to students belonging to backward classes to complete their higher education."
    },
    {
        "id": "sanjay-gandhi-niradhar",
        "name": "Sanjay Gandhi Niradhar Anudan Yojana",
        "category": "Social Security",
        "benefit": "₹1,500 / month support",
        "benefit_amount": 18000,
        "eligibility": "Senior citizens, destitute persons, disabled, or widows with no source of income.",
        "age_min": 65,
        "age_max": 120,
        "income_max": 21000,
        "occupation": "Unemployed",
        "category_target": "All",
        "priority": "High",
        "documents": ["Aadhaar Card", "Age Proof Certificate", "Income Certificate", "Disability Certificate (if applicable)"],
        "details": "Financial assistance to destitute persons, senior citizens, and physically challenged individuals."
    },
    {
        "id": "asara-pension",
        "name": "Asara Pension Scheme",
        "category": "Social Security",
        "benefit": "₹2,016 / month assistance",
        "benefit_amount": 24192,
        "eligibility": "Old age citizens, widows, weavers, AIDS patients, and disabled persons.",
        "age_min": 57,
        "age_max": 120,
        "income_max": 150000,
        "occupation": "Other",
        "category_target": "All",
        "priority": "Medium",
        "documents": ["Aadhaar Card", "Age Certificate", "Death Certificate of husband (for widows)", "Weaver certificate (for weavers)"],
        "details": "Provides social security pensions to vulnerable sections to support daily livelihood needs."
    },
    {
        "id": "pm-awas-yojana",
        "name": "Pradhan Mantri Awas Yojana (PMAY)",
        "category": "Housing",
        "benefit": "Subsidy of up to ₹2.67 Lakhs on home loans",
        "benefit_amount": 267000,
        "eligibility": "Families without a pucca house, annual household income below limits.",
        "age_min": 18,
        "age_max": 70,
        "income_max": 1800000,
        "occupation": "All",
        "category_target": "All",
        "priority": "Medium",
        "documents": ["Aadhaar Card", "Income Certificate", "Affidavit of not owning a pucca house"],
        "details": "Provides affordable housing for urban and rural poor, with financial assistance and home loan interest subsidies."
    },
    {
        "id": "shravanbal-seva-state",
        "name": "Shravanbal Seva State Pension Yojana",
        "category": "Senior Citizen",
        "benefit": "₹1,000 / month pension",
        "benefit_amount": 12000,
        "eligibility": "Destitute senior citizens of Maharashtra aged 65 and above.",
        "age_min": 65,
        "age_max": 120,
        "income_max": 21000,
        "occupation": "Senior Citizen",
        "category_target": "All",
        "priority": "High",
        "documents": ["Aadhaar Card", "Age Proof", "Income Certificate", "Residence Certificate"],
        "details": "Direct state financial aid for destitute elderly citizens who are not covered under national programs."
    },
    {
        "id": "pm-mudra-yojana",
        "name": "Pradhan Mantri MUDRA Yojana (PMEGP)",
        "category": "Credit",
        "benefit": "Collateral-free business loans up to ₹10 Lakhs",
        "benefit_amount": 50000,
        "eligibility": "Non-corporate, non-farm small/micro enterprises.",
        "age_min": 18,
        "age_max": 65,
        "income_max": None,
        "occupation": "Self-Employed / Business",
        "category_target": "All",
        "priority": "Low",
        "documents": ["Aadhaar Card", "Business Proposal", "Proof of Identity & Address", "Quotation of machinery/assets"],
        "details": "Mudra loans are provided to micro-units and small businesses under Shishu, Kishor, and Tarun categories."
    },
    {
        "id": "phd-fellowship-scholarship",
        "name": "Dr. Ambedkar Post-Matric Fellowship",
        "category": "Education",
        "benefit": "Fellowship of ₹30,000 / year",
        "benefit_amount": 30000,
        "eligibility": "Post-graduate students enrolled in M.Phil/Ph.D. courses belonging to SC/OBC categories.",
        "age_min": 21,
        "age_max": 35,
        "income_max": 600000,
        "occupation": "Student",
        "category_target": ["SC", "OBC"],
        "priority": "Medium",
        "documents": ["Aadhaar Card", "Caste Certificate", "Income Certificate", "Admission Letter"],
        "details": "Financial assistance for advanced doctoral research to promote educational development."
    }
]

class CompareRequest(BaseModel):
    scheme_ids: List[str]

@router.get("/")
def get_all_schemes():
    return SCHEMES_DB

@router.post("/compare")
def compare_schemes(request: CompareRequest):
    selected_schemes = [s for s in SCHEMES_DB if s["id"] in request.scheme_ids]
    if not selected_schemes:
        raise HTTPException(status_code=404, detail="No matching schemes found")
    return selected_schemes
