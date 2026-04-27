from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Standard MongoDB ID helper
from bson import ObjectId

class BookingCreate(BaseModel):
    mentor_email: str
    topic: str
    scheduled_at: datetime  # e.g., "2026-03-10T14:00:00"

class RedlineFeedback(BaseModel):
    asset_url: str  # Cloudinary URL of the design
    comment: str
    # Coordinates for visual "Redline" critique
    x_coord: float
    y_coord: float

class MentorshipSession(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    learner_email: str
    mentor_email: str
    status: str = "scheduled"  # scheduled, completed, cancelled
    scheduled_at: datetime
    feedback: List[RedlineFeedback] = []