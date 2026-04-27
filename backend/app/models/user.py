from pydantic import BaseModel, EmailStr , Field
from typing import Literal
from typing import Dict, List, Optional

class UserSkills(BaseModel):
    ui_design: int = 0
    ux_research: int = 0
    typography: int = 0
    branding: int = 0
    prototyping: int = 0

class UserProfileResponse(BaseModel):
    name: str
    email: EmailStr
    role: Literal["learner", "mentor","recruter","admin"] = Field(default="learner") 
    skills: UserSkills

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["learner", "mentor","recruter","admin"] 

class UserLogin(BaseModel):
    email: EmailStr
    password: str