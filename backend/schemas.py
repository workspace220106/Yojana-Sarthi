from typing import List
from pydantic import BaseModel


class ChatRequest(BaseModel):
    query: str


class CitizenProfile(BaseModel):
    state: str
    district: str
    age: str
    gender: str
    occupation: str
    category: str
    annual_income: str
    education: str
    disability: str
    marital_status: str
    farmer_type: str
    other_attributes: List[str]


class EligibleScheme(BaseModel):
    scheme_name: str
    schemeCategory: str
    level: str
    details: str
    benefits: str
    eligibility: str
    documents: str
    application: str
    official_website: str
    passed_reasons: List[str]


class IneligibleScheme(BaseModel):
    scheme_name: str
    schemeCategory: str
    level: str
    details: str
    eligibility: str
    failed_reasons: List[str]


class Source(BaseModel):
    title: str
    department: str | None = None
    level: str | None = None
    beneficiaries: list | None = None
    categories: list | None = None
    score: float


class ChatResponse(BaseModel):
    citizen_profile: CitizenProfile
    eligible: List[EligibleScheme]
    ineligible: List[IneligibleScheme]

    query: str
    total_schemes: int
    sources: List[Source]

    error: str | None = None
    raw_response: str | None = None