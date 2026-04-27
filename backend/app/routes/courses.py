from fastapi import APIRouter, HTTPException, Body, Depends, UploadFile, File, Form
from typing import List, Optional, Annotated
from bson import ObjectId
from bson.errors import InvalidId
from app.models.course import ReviewModel # Import the Review model we created
from app.database import get_db
from datetime import datetime
from app.config.cloudinary_config import upload_to_cloudinary # Import your helper

router = APIRouter()

def validate_object_id(id: str) -> ObjectId:
    try:
        return ObjectId(id)
    except InvalidId:
        raise HTTPException(
            status_code=400, 
            detail="Invalid ID format."
        )

@router.post("/")
async def add_course(
    title: str = Form(...),
    description: str = Form(...),
    instructor: str = Form(...),
    category: str = Form(...),
    level: str = Form(...),        # New Field: "Beginner", "Intermediate", or "Advanced"
    external_link: str = Form(...),
    skills_covered: str = Form(...), 
    image: UploadFile = File(...),   
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
        
    # 1. Upload to Cloudinary
    image_url = upload_to_cloudinary(image.file)
    
    if not image_url:
        raise HTTPException(status_code=500, detail="Cloudinary upload failed")

    # 2. Build the document for MongoDB
    new_course_data = {
        "title": title,
        "description": description,
        "instructor": instructor,
        "category": category,
        "level": level,             # Added to the document
        "external_link": external_link,
        "image_url": image_url,
        "skills_covered": [s.strip() for s in skills_covered.split(",")],
        "created_at": datetime.utcnow().isoformat()
    }

    # 3. Save to MongoDB
    result = await db["courses"].insert_one(new_course_data)
    return {"id": str(result.inserted_id), "image_url": image_url, "level": level}


    
@router.get("/")
async def list_courses(
    category: Optional[str] = None,
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")

    query = {"category": category} if category else {}
    cursor = db["courses"].find(query)
    courses = await cursor.to_list(length=100)
    
    for c in courses:
        c["_id"] = str(c["_id"])
    return courses

@router.get("/{id}")
async def show_course(
    id: str, 
    db: Annotated[dict, Depends(get_db)] = None
):
    oid = validate_object_id(id)
    course = await db["courses"].find_one({"_id": oid})
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    course["_id"] = str(course["_id"])
    return course



@router.post("/{id}/reviews")
async def add_review(
    id: str,
    review: ReviewModel, # FastAPI will validate this JSON body automatically
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    # 1. Validate the Course ID
    oid = validate_object_id(id)
    
    # 2. Prepare the review data
    # We convert the Pydantic model to a dict and add a server-side timestamp
    review_dict = review.dict()
    review_dict["created_at"] = datetime.utcnow()

    # 3. Update the Course document in MongoDB
    # $push adds the review_dict to the 'reviews' array field
    result = await db["courses"].update_one(
        {"_id": oid},
        {"$push": {"reviews": review_dict}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")

    return {
        "status": "success",
        "message": "Review added successfully",
        "review": review_dict
    }