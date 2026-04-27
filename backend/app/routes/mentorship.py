# app/routes/mentorship.py
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
import app.database as database
from datetime import datetime  # <--- Add this line

router = APIRouter(prefix="/mentorship", tags=["Mentorship"])

@router.post("/request")
async def request_mentor(mentor_email: str, learner_email: str):
    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # 1. Check if a request already exists between these two
    existing_request = await database.db.mentorships.find_one({
        "mentor_email": mentor_email,
        "learner_email": learner_email
    })

    if existing_request:
        raise HTTPException(status_code=400, detail="Request already sent to this mentor")

    # 2. Create the request document
    request_doc = {
        "mentor_email": mentor_email,
        "learner_email": learner_email,
        "status": "pending",
        "requested_at": datetime.utcnow().isoformat() 
    }

    await database.db.mentorships.insert_one(request_doc)
    
    return {"message": f"Successfully requested mentorship from {mentor_email}"}    

@router.post("/accept/{request_id}")
async def accept_learner(request_id: str):
    # 2. Update status to 'accepted'
    result = await database.db.mentorships.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "accepted"}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"message": "You are now mentoring this student!"}


@router.get("/mentors")
async def get_available_mentors():
    """
    Retrieves all users registered as mentors.
    Used by learners to browse and send mentorship requests.
    """
    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # 1. Fetch only users where role is 'mentor'
    # 2. Exclude password for security
    cursor = database.db.users.find(
        {"role": "mentor"}, 
        {"password": 0}
    )
    
    mentors = await cursor.to_list(length=100)

    # 3. Format the data for the Frontend
    for m in mentors:
        m["id"] = str(m["_id"])  # Convert ObjectId to string
        del m["_id"]             # Remove the original BSON object
        
        # Ensure a 'skills' dictionary exists to prevent frontend crashes
        if "skills" not in m:
            m["skills"] = {}

    return mentors


@router.get("/requests/{mentor_email}")
async def get_mentor_requests(mentor_email: str):
    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # 1. Search for all requests where this person is the mentor
    # We want to see 'pending' ones first
    cursor = database.db.mentorships.find({"mentor_email": mentor_email})
    requests = await cursor.to_list(length=100)

    # 2. Format for frontend
    for req in requests:
        req["_id"] = str(req["_id"])
    
    return requests









@router.get("/my-mentors/{learner_email}")
async def get_my_accepted_mentors(learner_email: str):
    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # 1. Find all accepted mentorship records for this learner
    cursor = database.db.mentorships.find({
        "learner_email": learner_email,
        "status": "accepted"
    })
    accepted_records = await cursor.to_list(length=100)

    if not accepted_records:
        return []

    # 2. Extract mentor emails to fetch their full profiles
    mentor_emails = [record["mentor_email"] for record in accepted_records]

    # 3. Fetch mentor details from the users collection
    # We use $in to get all matching users in one query
    mentor_profiles_cursor = database.db.users.find(
        {"email": {"$in": mentor_emails}},
        {"password": 0} # Security: hide passwords
    )
    
    mentor_profiles = await mentor_profiles_cursor.to_list(length=100)

    # 4. Format for Frontend
    for profile in mentor_profiles:
        profile["id"] = str(profile["_id"])
        del profile["_id"]
        if "skills" not in profile:
            profile["skills"] = {}

    return mentor_profiles