from pydantic import BaseModel, HttpUrl, Field, validator
from typing import List, Optional,Literal
from datetime import datetime

class ReviewModel(BaseModel):
    user_name: str = Field(..., min_length=2, description="The name of the reviewer")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: str = Field(..., min_length=5, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CourseModel(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str
    instructor: str
    category: str
    level: Literal["Beginner", "Intermediate", "Advanced"] = Field(
        default="Beginner", 
        description="The difficulty depth of the curriculum"
    )
    image_url: str = Field(..., description="The main display image hosted on Cloudinary")
    thumbnail_url: str 
    external_link: HttpUrl 
    skills_covered: List[str]
    
    # --- Added Review Block ---
    reviews: List[ReviewModel] = Field(default=[], description="List of user reviews for this course")
    
    @validator('image_url', 'thumbnail_url')
    def validate_cloudinary_url(cls, v):
        if "res.cloudinary.com" not in v:
            raise ValueError('Must be a valid Cloudinary URL')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Advanced Figma Prototypes",
                "category": "UI/UX",
                "image_url": "https://res.cloudinary.com/demo/image/upload/v12345/course_banner.jpg",
                "thumbnail_url": "https://res.cloudinary.com/demo/image/upload/w_200,c_fill/v12345/course_banner.jpg",
                "external_link": "https://www.coursera.org/example-course",
                "instructor": "Jane Doe",
                "description": "Master high-fidelity prototyping.",
                "skills_covered": ["Auto Layout", "Variables", "Prototyping"],
                "reviews": [
                    {
                        "user_name": "Sudheer",
                        "rating": 5,
                        "comment": "This course helped me master Figma components!",
                        "created_at": "2026-04-06T20:44:00"
                    }
                ]
            }
        }