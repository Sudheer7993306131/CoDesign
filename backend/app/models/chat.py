from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class MessageModel(BaseModel):
    room_id: str  # Format: "email1_email2" (alphabetically sorted)
    sender_email: str
    receiver_email: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MessageCreate(BaseModel):
    receiver_email: str
    content: str