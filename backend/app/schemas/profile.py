from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class ProjectSchema(BaseModel):
    title: str
    description: str
    link: Optional[str] = None

class GrowthPostSchema(BaseModel):
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProfileBase(BaseModel):
    email: EmailStr  # Critical for matching with local storage data
    full_name: str
    interested_role: str
    skills: List[str]
    bio: Optional[str] = ""

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str = Field(alias="_id")
    projects: List[ProjectSchema] = []
    growth_posts: List[GrowthPostSchema] = []

    class Config:
        populate_by_name = True