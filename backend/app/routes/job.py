from fastapi import APIRouter, HTTPException, Depends, Body,Form,File,UploadFile,Body,Depends
from typing import Annotated
from datetime import datetime
from uuid import uuid4
from bson import ObjectId
from app.models.job import JobCreate,JobApplication
import app.database as database
from pydantic import BaseModel

from app.database import get_db

router = APIRouter(prefix="/jobs", tags=["Job Board"])


from bson import ObjectId

@router.patch("/update-status")
async def update_status(
    payload: dict = Body(...), 
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None: 
        raise HTTPException(status_code=500, detail="Database connection failed")

    # 1. Extract using EXACT keys from the frontend
    # We will send 'app_id' from React to keep it simple
    app_id_str = payload.get("app_id") 
    status = payload.get("new_status")

    if not app_id_str or not status:
        raise HTTPException(status_code=400, detail="Backend received empty ID or Status")

    try:
        # 2. Convert to ObjectId and update
        result = await db["applications"].update_one(
            {"_id": ObjectId(app_id_str)},
            {"$set": {"status": status}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="No application found with that ID")

        return {"status": "success"}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid ID format sent to server")


# --- POST A JOB (RECRUITERS ONLY) ---
@router.post("/post")
async def post_job(
    job: JobCreate,
    recruiter_email: str = Body(...),
    role: str = Body(...),
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None: raise HTTPException(status_code=500)

    # SECURITY GATE: Only recruiters can post
    if role.lower() != "recruiter":
        raise HTTPException(status_code=403, detail="Only Recruiters can post job opportunities.")

    job_doc = job.dict()
    job_doc["job_id"] = str(uuid4())
    job_doc["recruiter_email"] = recruiter_email
    job_doc["posted_at"] = datetime.utcnow().isoformat()
    job_doc["applicants_count"] = 0

    await db["jobs"].insert_one(job_doc)
    return {"message": "Job posted successfully", "job_id": job_doc["job_id"]}

# --- LIST ALL JOBS ---
@router.get("/all")
async def get_all_jobs(db: Annotated[dict, Depends(get_db)] = None):
    cursor = db["jobs"].find().sort("posted_at", -1)
    jobs = await cursor.to_list(length=100)
    for j in jobs: j["_id"] = str(j["_id"])
    return jobs

@router.post("/apply")
async def apply_to_job(
    application: JobApplication, 
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None: raise HTTPException(status_code=500, detail="Database Offline")

    # 1. Verify Job exists
    job = await db["jobs"].find_one({"job_id": application.job_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2. Check for existing application
    existing = await db["applications"].find_one({
        "job_id": application.job_id,
        "learner_email": application.learner_email
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this role.")

    # 3. Save application (Including the Resume Link and Pitch)
    app_doc = application.dict()
    app_doc["applied_at"] = datetime.utcnow().isoformat()
    app_doc["status"] = "pending"

    await db["applications"].insert_one(app_doc)

    # 4. Increment count for the Recruiter's view
    await db["jobs"].update_one(
        {"job_id": application.job_id},
        {"$inc": {"applicants_count": 1}}
    )

    return {"status": "success", "message": "Application submitted to " + job["company"]}

# --- VIEW APPLICATIONS (FOR RECRUITERS) ---
@router.get("/applications/{job_id}")
async def view_job_applicants(
    job_id: str,
    recruiter_email: str,
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None: raise HTTPException(status_code=500)

    # 1. Security: Verify requester is the job owner
    job = await db["jobs"].find_one({"job_id": job_id, "recruiter_email": recruiter_email})
    if not job:
        raise HTTPException(status_code=403, detail="Unauthorized access to applications")

    # 2. Fetch applications with all details
    cursor = db["applications"].find({"job_id": job_id}).sort("applied_at", -1)
    apps = await cursor.to_list(length=100)
    
    # 3. Sanitize for JSON output
    for a in apps:
        a["_id"] = str(a["_id"])
        
    return apps





@router.get("/my-applications/{learner_email}")
async def get_user_applications(
    learner_email: str,
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None: raise HTTPException(status_code=500)

    # We use an aggregation pipeline to join the application with the actual Job details
    pipeline = [
        { "$match": { "learner_email": learner_email.lower().strip() } },
        {
            "$lookup": {
                "from": "jobs",
                "localField": "job_id",
                "foreignField": "job_id",
                "as": "job_details"
            }
        },
        { "$unwind": "$job_details" }, # Flatten the job details array
        { "$sort": { "applied_at": -1 } } # Show newest applications first
    ]

    cursor = db["applications"].aggregate(pipeline)
    my_apps = await cursor.to_list(length=50)

    # Sanitize for JSON
    for app in my_apps:
        app["_id"] = str(app["_id"])
        app["job_details"]["_id"] = str(app["job_details"]["_id"])

    return my_apps



@router.get("/my-postings/{recruiter_email}")
async def get_recruiter_postings(recruiter_email: str, db: Annotated[dict, Depends(get_db)] = None):
    cursor = db["jobs"].find({"recruiter_email": recruiter_email.lower().strip()}).sort("posted_at", -1)
    my_jobs = await cursor.to_list(length=100)
    for j in my_jobs: j["_id"] = str(j["_id"])
    return my_jobs