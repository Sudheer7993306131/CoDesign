from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, Body # ✅ Added Body here
from typing import Annotated, Optional
from app.database import get_db
from sqlalchemy.orm import Session
from datetime import datetime  # ✅ Ensure this is here
from app.config.cloudinary_config import upload_to_cloudinary 
import os
from typing import List
import shutil
from uuid import uuid4


router = APIRouter(prefix="/profiles", tags=["Profile"])

@router.get("/{email}")
async def get_profile_by_email(
    email: str, 
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection not ready")

    # 1. First, check if a profile document exists
    profile = await db["profiles"].find_one({"email": email})
    
    if profile:
        profile["_id"] = str(profile["_id"])
        # Ensure likes/comments fields exist for older documents
        for post in profile.get("growth_posts", []):
            post.setdefault("likes", [])
            post.setdefault("comments", [])
        return profile

    # 2. If no profile, check if the user even exists in the Auth table
    user_auth = await db["users"].find_one({"email": email})
    
    if not user_auth:
        raise HTTPException(status_code=404, detail="Identity not found in CoDesign")

    # 3. Return a "Smart Default" based on their Auth registration
    # This allows Guests to see a page even if the user hasn't "Manage Profile" yet
    return {
        "_id": "guest_view_placeholder",
        "email": email,
        "full_name": user_auth.get("name", "Designer"),
        "interested_role": f"{user_auth.get('role', 'Member').capitalize()} @ CoDesign",
        "skills": [],
        "bio": "This member hasn't written a bio yet.",
        "profile_image": f"https://ui-avatars.com/api/?name={user_auth.get('name')}&background=random&bold=true",
        "projects": [],
        "growth_posts": []
    }

@router.put("/{email}/update")
async def update_profile(email: str, data: dict, db: Annotated[dict, Depends(get_db)] = None):
    # Sanitize and update the document
    update_data = {
        "full_name": data.get("full_name"),
        "interested_role": data.get("interested_role"),
        "bio": data.get("bio"),
        "profile_image": data.get("profile_image")
    }
    
    await db["profiles"].update_one({"email": email}, {"$set": update_data})
    
    # Return the updated profile
    updated_profile = await db["profiles"].find_one({"email": email})
    updated_profile["_id"] = str(updated_profile["_id"])
    return updated_profile

@router.post("/")
async def create_or_update_profile(
    email: str = Form(...),
    full_name: str = Form(...),
    interested_role: str = Form(...),
    bio: str = Form(""),
    skills: str = Form(""), 
    profile_image: Optional[UploadFile] = File(None), 
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")

    image_url = None
    if profile_image:
        image_url = upload_to_cloudinary(profile_image.file)
        if not image_url:
            raise HTTPException(status_code=500, detail="Cloudinary upload failed")

    profile_data = {
        "email": email,
        "full_name": full_name,
        "interested_role": interested_role,
        "bio": bio,
        "skills": [s.strip() for s in skills.split(",") if s.strip()],
    }

    if image_url:
        profile_data["profile_image"] = image_url

    result = await db["profiles"].find_one_and_update(
        {"email": email},
        {"$set": profile_data},
        upsert=True,
        return_document=True
    )

    result["_id"] = str(result["_id"])
    return result

@router.post("/posts/create")
async def create_post(
    title: str = Form(...),
    description: str = Form(...),
    author_email: str = Form(...),
    technologies: Optional[str] = Form(None), # Change to Optional
    files: Optional[List[UploadFile]] = File(None), # Change to Optional and list
    db: Annotated[dict, Depends(get_db)] = None 
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    # 1. Process technologies (String -> List)
    tech_list = []
    if technologies:
        tech_list = [tech.strip() for tech in technologies.split(",") if tech.strip()]

    # 2. Upload assets to Cloudinary
    file_urls = []
    if files:
        for file in files:
            try:
                url = upload_to_cloudinary(file.file)
                if url:
                    file_urls.append(url)
            except Exception as e:
                print(f"Error uploading {file.filename}: {e}")

    # 3. Construct the Post Document
    new_post = {
    "post_id": str(uuid4()),
    "title": title,
    "description": description,
    "author_email": author_email,
    "technologies": tech_list,
    "attachments": file_urls,
    "likes": [],      # Stores emails of users who liked
    "comments": [],   # Stores list of {user, text, created_at}
    "created_at": datetime.utcnow().isoformat()
}

    # 4. Persistence: Find user by email and PUSH to their growth_posts array
    update_result = await db["profiles"].find_one_and_update(
        {"email": author_email},
        {"$push": {"growth_posts": new_post}},
        return_document=True
    )

    if not update_result:
        # If user doesn't exist, we shouldn't allow posting
        raise HTTPException(
            status_code=404, 
            detail="User profile not found. Please sync your identity first."
        )

    # 5. Return the updated profile or success message
    update_result["_id"] = str(update_result["_id"])
    return {
        "message": "Post published to CoDesign ecosystem",
        "post": new_post
    }






@router.get("/feed/explore")
async def get_explore_feed(
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")

    # Aggregation Pipeline:
    # 1. Unwind the growth_posts array so each post becomes a separate document
    # 2. Sort by created_at in descending order
    pipeline = [
        {"$unwind": "$growth_posts"},
        {"$sort": {"growth_posts.created_at": -1}},
        {
            "$project": {
                "_id": 0,
                "author_name": "$full_name",
                "author_image": "$profile_image",
                "post": "$growth_posts"
            }
        }
    ]

    cursor = db["profiles"].aggregate(pipeline)
    feed = await cursor.to_list(length=100) # Retrieve latest 100 posts
    
    return feed




@router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: str, 
    user_email: str = Body(embed=True), 
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None: raise HTTPException(status_code=500, detail="DB Error")

    # Find the post to check if user already liked it
    profile = await db["profiles"].find_one({"growth_posts.post_id": post_id})
    if not profile: raise HTTPException(status_code=404, detail="Post not found")
    
    # Locate the specific post in the array
    post = next(p for p in profile["growth_posts"] if p["post_id"] == post_id)
    
    # Toggle Logic: If email exists -> remove it (unlike), else add it (like)
    if user_email in post.get("likes", []):
        action = "$pull"
    else:
        action = "$addToSet"

    await db["profiles"].update_one(
        {"growth_posts.post_id": post_id},
        {action: {"growth_posts.$.likes": user_email}}
    )
    return {"message": "Like toggled"}

@router.post("/posts/{post_id}/comment")
async def add_comment(
    post_id: str, 
    user_email: str = Form(...),
    text: str = Form(...),
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None: raise HTTPException(status_code=500, detail="DB Error")

    new_comment = {
        "comment_id": str(uuid4()),
        "user_email": user_email,
        "text": text,
        "created_at": datetime.utcnow().isoformat()
    }

    await db["profiles"].update_one(
        {"growth_posts.post_id": post_id},
        {"$push": {"growth_posts.$.comments": new_comment}}
    )
    return new_comment



@router.post("/projects/create")
async def create_project(
    title: str = Form(...),
    description: str = Form(...),
    author_email: str = Form(...),
    live_link: str = Form(None),
    repo_link: str = Form(None),
    technologies: str = Form(""), # Default to empty string to avoid 422
    files: Optional[List[UploadFile]] = File(None),
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None: raise HTTPException(status_code=500, detail="DB Error")

    # 1. Upload Project Cover/Screenshots safely
    image_urls = []
    if files: # CRITICAL: Check if files is not None before looping
        for file in files:
            url = upload_to_cloudinary(file.file)
            if url: image_urls.append(url)

    # 2. Construct Project Object
    new_project = {
        "project_id": str(uuid4()),
        "title": title,
        "description": description,
        "live_link": live_link,
        "repo_link": repo_link,
        "technologies": [t.strip() for t in technologies.split(",") if t.strip()],
        "images": image_urls,
        "likes": [],
        "created_at": datetime.utcnow().isoformat()
    }

    # 3. Push to Profile
    await db["profiles"].update_one(
        {"email": author_email},
        {"$push": {"projects": new_project}}
    )

    return new_project

@router.post("/projects/{project_id}/like")
async def toggle_project_like(
    project_id: str, 
    user_email: str = Body(embed=True), 
    db: Annotated[dict, Depends(get_db)] = None
):
    profile = await db["profiles"].find_one({"projects.project_id": project_id})
    project = next(p for p in profile["projects"] if p["project_id"] == project_id)
    
    action = "$pull" if user_email in project.get("likes", []) else "$addToSet"
    
    await db["profiles"].update_one(
        {"projects.project_id": project_id},
        {action: {"projects.$.likes": user_email}}
    )
    return {"status": "success"}





# Route for Post Deletion
@router.delete("/{email}/posts/{post_id}")
async def delete_post(email: str, post_id: str, db: Annotated[dict, Depends(get_db)] = None):
    await db["profiles"].update_one(
        {"email": email},
        {"$pull": {"growth_posts": {"post_id": post_id}}}
    )
    return {"status": "deleted"}

# Route for Project Deletion
@router.delete("/{email}/projects/{project_id}")
async def delete_project(email: str, project_id: str, db: Annotated[dict, Depends(get_db)] = None):
    await db["profiles"].update_one(
        {"email": email},
        {"$pull": {"projects": {"project_id": project_id}}}
    )
    return {"status": "deleted"}




@router.post("/{target_email}/follow")
async def toggle_follow(
    target_email: str, 
    current_user_email: str = Body(embed=True), 
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None: 
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    # 1. Prevent self-following
    if target_email == current_user_email:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    # 2. Verify BOTH profiles exist 
    # (Prevents ghost users from following or following non-existent users)
    target_profile = await db["profiles"].find_one({"email": target_email})
    current_profile = await db["profiles"].find_one({"email": current_user_email})
    
    if not target_profile:
        raise HTTPException(status_code=404, detail="Target profile not found")
    if not current_profile:
        raise HTTPException(status_code=404, detail="Your profile must be set up to follow others")

    # 3. Check current status
    # We use .get() to avoid KeyErrors if the fields don't exist yet
    is_following = current_user_email in target_profile.get("followers", [])

    if is_following:
        # --- UNFOLLOW LOGIC ---
        # We use a session or multiple updates. 
        # Note: In a high-traffic app, use a transaction here.
        await db["profiles"].update_one(
            {"email": target_email},
            {"$pull": {"followers": current_user_email}}
        )
        await db["profiles"].update_one(
            {"email": current_user_email},
            {"$pull": {"following": target_email}}
        )
        return {
            "status": "unfollowed", 
            "is_following": False,
            "target_followers_count": len(target_profile.get("followers", [])) - 1
        }
    else:
        # --- FOLLOW LOGIC ---
        # $addToSet is great because it's idempotent (won't add duplicates)
        await db["profiles"].update_one(
            {"email": target_email},
            {"$addToSet": {"followers": current_user_email}}
        )
        await db["profiles"].update_one(
            {"email": current_user_email},
            {"$addToSet": {"following": target_email}}
        )
        return {
            "status": "followed", 
            "is_following": True,
            "target_followers_count": len(target_profile.get("followers", [])) + 1
        }

@router.get("/{email}/network")
async def get_user_network(
    email: str, 
    db: Annotated[dict, Depends(get_db)] = None
):
    """
    Retrieves the list of followers and following with basic profile info 
    (Name and Image) for display in modals or lists.
    """
    if db is None: raise HTTPException(status_code=500, detail="DB Error")
    
    profile = await db["profiles"].find_one({"email": email})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Helper function to resolve email lists into profile summaries
    async def resolve_profiles(emails):
        if not emails: return []
        cursor = db["profiles"].find(
            {"email": {"$in": emails}},
            {"full_name": 1, "profile_image": 1, "email": 1, "interested_role": 1, "_id": 0}
        )
        return await cursor.to_list(length=len(emails))

    followers = await resolve_profiles(profile.get("followers", []))
    following = await resolve_profiles(profile.get("following", []))

    return {
        "followers": followers,
        "following": following,
        "followers_count": len(followers),
        "following_count": len(following)
    }




@router.get("/{email}/skills", response_model=List[str])
async def get_skills(email: str):
    db = get_db()
    profile = await db.profiles.find_one({"email": email})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile.get("skills", [])

# 2. BULK UPDATE SKILLS (Overwrites existing list)
@router.put("/{email}/skills")
async def update_skills(email: str, skills: List[str] = Body(..., embed=True)):
    db = get_db()
    result = await db.profiles.find_one_and_update(
        {"email": email},
        {"$set": {"skills": skills}},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.get("skills", [])

# 3. DELETE SPECIFIC SKILL
@router.delete("/{email}/skills/{skill_name}")
async def delete_skill(email: str, skill_name: str):
    db = get_db()
    result = await db.profiles.update_one(
        {"email": email},
        {"$pull": {"skills": skill_name}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"message": f"Skill '{skill_name}' removed"}