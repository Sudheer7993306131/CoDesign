from fastapi import APIRouter, HTTPException, Query,Depends
from typing import List,Annotated
import app.database as database
from app.database import get_db

# 1. IMPORT THE MODEL (Ensure this matches your folder structure)
from app.models.user import UserProfileResponse 

router = APIRouter(prefix="/users", tags=["Skill Tracking & Discovery"])

@router.get("/{email}", response_model=UserProfileResponse)
async def get_user_profile(email: str):
    # Search MongoDB for the specific user 
    user = await database.db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Initialize skills if they don't exist to prevent Radar Chart errors 
    if "skills" not in user:
        user["skills"] = {
            "ui_design": 0, 
            "ux_research": 0, 
            "typography": 0, 
            "branding": 0, 
            "prototyping": 0
        }
        
    return user

@router.get("/search/by-skill")
async def search_users_by_skill(skill_name: str, min_score: int = 1):
    # Dynamic MongoDB query for specific skill disciplines [cite: 16, 22]
    query = {f"skills.{skill_name}": {"$gte": min_score}}
    
    # Limit results to 100 for performance [cite: 20]
    users = await database.db.users.find(query).to_list(100)
    
    results = []
    for u in users:
        results.append({
            "name": u["name"],
            "email": u["email"],
            "role": u["role"],
            "score": u["skills"].get(skill_name, 0)
        })
        
    return results



@router.get("/{email}", response_model=UserProfileResponse)
async def get_user_profile(email: str):
    user = await database.db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Ensure the role exists and matches your system
    if "role" not in user:
        user["role"] = "learner" 
        
    return user



@router.get("/directory")
async def get_categorized_users(
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    # Aggregation Pipeline: 
    # 1. Group by role
    # 2. Push only specific fields into an array
    pipeline = [
        {
            "$group": {
                "_id": "$role",
                "count": {"$sum": 1},
                "members": {
                    "$push": {
                        "name": "$name",
                        "email": "$email",
                        "role": "$role"
                    }
                }
            }
        }
    ]

    try:
        cursor = db["users"].aggregate(pipeline)
        results = await cursor.to_list(length=100)

        # Format the response into a clean object
        response = {
            "mentors": [],
            "learners": []
        }

        for category in results:
            role = str(category["_id"]).lower()
            if role == "mentor":
                response["mentors"] = category["members"]
            elif role == "learner":
                response["learners"] = category["members"]

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))