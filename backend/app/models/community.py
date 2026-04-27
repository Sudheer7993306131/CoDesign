from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class CommunityBase(BaseModel):
    name: str = Field(..., example="UI/UX Masterminds")
    description: str = Field(..., example="A space for advanced design discussions.")
    category: str = Field(..., example="UI/UX")

class CommunityCreate(CommunityBase):
    pass

class CommunityDB(CommunityBase):
    id: str
    admin_email: str
    members: List[str] = []  # List of emails
    created_at: datetime = Field(default_factory=datetime.utcnow)




class CommunityMessageCreate(BaseModel):
    content: str = Field(..., example="Welcome to the UI/UX group!")

class CommunityMessageDB(BaseModel):
    id: str
    community_id: str
    sender_email: str
    sender_name: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)