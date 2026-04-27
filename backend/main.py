import app.database as database
from fastapi import FastAPI
from app.database import connect_to_mongo, close_mongo_connection
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth,courses,mentorship,users,community,chat,profile,message,job  

app = FastAPI(title="CoDesign API")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/api/status")
async def get_status():
    return {
        "backend": "running",
        "database": database.mongo_status
    }

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(mentorship.router, prefix="/api", tags=["MentorShip"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(chat.router, prefix="/api")
app.include_router(message.router, prefix="/api") 
app.include_router(job.router, prefix="/api") 

app.include_router(profile.router, prefix="/api") 
app.include_router(community.router, prefix="/api") 