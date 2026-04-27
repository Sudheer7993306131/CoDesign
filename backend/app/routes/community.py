from fastapi import APIRouter, HTTPException
from bson import ObjectId
import app.database as database
from app.models.community import CommunityCreate, CommunityMessageCreate
from datetime import datetime

router = APIRouter(prefix="/communities", tags=["Communities"])

# --- MENTOR ACTIONS ---

@router.post("/create/{mentor_email}")
async def create_community(mentor_email: str, data: CommunityCreate):
    """
    Only a user with the 'mentor' role can call this.
    The mentor_email becomes the 'owner' of this community.
    """
    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # 1. Verify the user exists and is a Mentor
    user = await database.db.users.find_one({"email": mentor_email})
    if not user or user.get("role") != "mentor":
        raise HTTPException(
            status_code=403, 
            detail="Unauthorized: Only mentors can establish communities."
        )

    # 2. Prepare the community document
    new_community = {
        "name": data.name,
        "description": data.description,
        "category": data.category,
        "mentor_owner": mentor_email, # Renamed from admin_email for clarity
        "members": [mentor_email],    # Mentor is automatically the first member
        "created_at": datetime.utcnow()
    }

    result = await database.db.communities.insert_one(new_community)
    return {"id": str(result.inserted_id), "message": f"Community '{data.name}' created successfully"}

@router.delete("/delete/{community_id}/{mentor_email}")
async def delete_community(community_id: str, mentor_email: str):
    """Allows the mentor who created the community to delete it."""
    result = await database.db.communities.delete_one({
        "_id": ObjectId(community_id),
        "mentor_owner": mentor_email
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Community not found or unauthorized")
        
    return {"message": "Community disbanded successfully"}


# --- USER ACTIONS (Learners & Mentors) ---

@router.post("/{community_id}/join/{user_email}")
async def join_community(community_id: str, user_email: str):
    community = await database.db.communities.find_one({"_id": ObjectId(community_id)})
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    if user_email in community.get("members", []):
        raise HTTPException(status_code=400, detail="You are already a member")

    await database.db.communities.update_one(
        {"_id": ObjectId(community_id)},
        {"$push": {"members": user_email}}
    )
    return {"message": f"Welcome to {community['name']}!"}


@router.get("/")
async def get_all_communities():
    cursor = database.db.communities.find()
    communities = await cursor.to_list(length=100)
    for c in communities:
        c["id"] = str(c["_id"])
        del c["_id"]
    return communities


# --- MESSAGING ---

@router.post("/{community_id}/message/{sender_email}")
async def send_community_message(community_id: str, sender_email: str, data: CommunityMessageCreate):
    # Check membership
    is_member = await database.db.communities.find_one({
        "_id": ObjectId(community_id),
        "members": sender_email
    })
    
    if not is_member:
        raise HTTPException(status_code=403, detail="Join the community to participate in the chat")

    user = await database.db.users.find_one({"email": sender_email})
    
    message_doc = {
        "community_id": community_id,
        "sender_email": sender_email,
        "sender_name": user.get("name", "User"),
        "content": data.content,
        "timestamp": datetime.utcnow()
    }

    await database.db.community_messages.insert_one(message_doc)
    return {"status": "success"}

@router.get("/{community_id}/messages")
async def get_community_messages(community_id: str):
    cursor = database.db.community_messages.find({"community_id": community_id}).sort("timestamp", 1)
    messages = await cursor.to_list(length=100)
    for m in messages:
        m["id"] = str(m["_id"])
        del m["_id"]
    return messages


@router.get("/my-communities/{user_email}")
async def get_user_communities(user_email: str):
    """
    Returns all communities where the provided email is in the 'members' list.
    """
    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Search for any community where user_email exists in the 'members' array
    cursor = database.db.communities.find({"members": user_email})
    communities = await cursor.to_list(length=100)
    
    for c in communities:
        c["id"] = str(c["_id"])
        del c["_id"]
        
    return communities





@router.post("/{community_id}/leave/{user_email}")
async def leave_community(community_id: str, user_email: str):
    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # 1. Check if the community exists
    community = await database.db.communities.find_one({"_id": ObjectId(community_id)})
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")

    # 2. Prevent the Mentor (Owner) from leaving their own community 
    # (They should delete it instead)
    if community.get("mentor_owner") == user_email:
        raise HTTPException(
            status_code=400, 
            detail="Mentors cannot leave a community they own. Please disband the clan instead."
        )

    # 3. Remove the user from the members array
    result = await database.db.communities.update_one(
        {"_id": ObjectId(community_id)},
        {"$pull": {"members": user_email}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="You are not a member of this community")

    return {"message": f"Successfully left {community['name']}"}