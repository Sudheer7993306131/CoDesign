from pydantic import BaseModel, EmailStr, Field,ConfigDict
from typing import List, Optional
from datetime import datetime  
class ProfileBase(BaseModel):
    email: EmailStr
    full_name: str
    interested_role: str
    bio: Optional[str] = "Click edit to add your bio!"
    skills: List[str] = []

class ProfileCreate(BaseModel):
    email: EmailStr
    full_name: str
    interested_role: str
    bio: Optional[str] = ""
    skills: Optional[str] = ""  

class ProfileResponse(BaseModel):
    id: Optional[str] = Field(alias="_id")
    email: EmailStr
    full_name: str
    interested_role: str
    bio: Optional[str]
    skills: List[str]
    profile_image: Optional[str] = None
    projects: List = []
    growth_posts: List = []

    class Config:
        from_attributes = True
        populate_by_name = True





class PostResponse(BaseModel):
    id: str = Field(alias="_id")
    author_email: EmailStr
    title: str
    description: str
    technologies: List[str]
    attachments: List[str] = [] 
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)








