from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    description: str
    salary_range: Optional[str] = None
    skills_required: List[str]
    job_type: str  # Full-time, Internship, Contract

class JobApplication(BaseModel):
    job_id: str
    learner_email: EmailStr
    resume_link: str  # Cloudinary URL
    cover_letter: Optional[str] = ""