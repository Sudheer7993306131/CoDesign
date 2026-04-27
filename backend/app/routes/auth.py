from fastapi import APIRouter, HTTPException,Depends
import app.database as database
from app.database import get_db
from typing import Annotated

from app.models.user import UserCreate, UserLogin
from app.utils.security import hash_password, verify_password
from app.utils.jwt_handler import create_access_token

router = APIRouter()

@router.post("/register")
async def register(user: UserCreate):
    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    existing_user = await database.db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = hash_password(user.password)

    new_user = {
        "email": user.email,
        "password": hashed_pwd,
        "name": user.name,
        "role": user.role 
    }

    await database.db.users.insert_one(new_user)

    new_profile = {
        "email": user.email,
        "full_name": user.name,
        "interested_role": f"{user.role.capitalize()} @ CoDesign",
        "bio": "",
        "skills": [],
        "profile_image": f"https://ui-avatars.com/api/?name={user.name.replace(' ', '+')}&background=random&bold=true",
        "projects": [],
        "growth_posts": [],
        "followers": [],
        "following": [],
        "created_at": user.email 
    }

    await database.db.profiles.insert_one(new_profile)

    return {"message": f"User created and profile initialized successfully as a {user.role}"}

@router.post("/login")
async def login(user: UserLogin):

    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    db_user = await database.db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token_data = {
        "sub": db_user["email"],
        "role": db_user.get("role", "learner"), 
        "name": db_user.get("name")
    }
    
    token = create_access_token(token_data)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.get("role"),
        "name": db_user.get("name")
    }






@router.get("/directory")
async def get_categorized_users(
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None: raise HTTPException(status_code=500, detail="DB Error")

    pipeline = [
        {
            "$lookup": {
                "from": "profiles",
                "localField": "email",
                "foreignField": "email",
                "as": "profile_info"
            }
        },
        {
            "$project": {
                "_id": { "$toString": "$_id" },  
                "name": 1,
                "email": 1,
                "role": 1,
                "image": { "$arrayElemAt": ["$profile_info.profile_image", 0] }
            }
        }
    ]

    cursor = db["users"].aggregate(pipeline)
    users = await cursor.to_list(length=1000)

    categorized = {"mentors": [], "learners": []}
    for user in users:
        role = user.get("role", "learner").lower()
        if role == "mentor":
            categorized["mentors"].append(user)
        else:
            categorized["learners"].append(user)

    return categorized





@router.post("/sync-missing-profiles")
async def sync_missing_profiles(db: Annotated[dict, Depends(get_db)] = None):
    if db is None: 
        raise HTTPException(status_code=500, detail="DB Connection Error")

    all_users = await db["users"].find().to_list(length=1000)
    
    synced_count = 0
    already_existed = 0

    for user in all_users:
        email = user.get("email")
        
        # 2. Check if a profile already exists for this email
        existing_profile = await db["profiles"].find_one({"email": email})
        
        if not existing_profile:
            # 3. Create the missing profile with smart defaults
            new_profile = {
                "email": email,
                "full_name": user.get("name", "Designer"),
                "interested_role": f"{user.get('role', 'Learner').capitalize()} @ CoDesign",
                "bio": "New member of the CoDesign ecosystem.",
                "skills": [],
                "profile_image": f"https://ui-avatars.com/api/?name={user.get('name', 'User').replace(' ', '+')}&background=random&bold=true",
                "projects": [],
                "growth_posts": [],
                "followers": [],
                "following": []
            }
            await db["profiles"].insert_one(new_profile)
            synced_count += 1
        else:
            already_existed += 1

    return {
        "status": "Migration Complete",
        "new_profiles_created": synced_count,
        "profiles_already_present": already_existed
    }