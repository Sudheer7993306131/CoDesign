import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

client = None
db = None
mongo_status = "not connected"


async def connect_to_mongo():
    global client, db, mongo_status

    print("🔥 Trying to connect to MongoDB...")

    if not MONGODB_URL:
        print("❌ MONGODB_URL is None")
        mongo_status = "not connected"
        return

    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        await client.admin.command("ping")
        db = client["codesign_db"]
        mongo_status = "connected"
        print("✅ MongoDB Connected Successfully!")

    except Exception as e:
        mongo_status = "not connected"
        print("❌ MongoDB Connection Error:", e)


async def close_mongo_connection():
    global client, mongo_status
    if client:
        client.close()
        mongo_status = "not connected"


def get_mongo_debug_info():
    if not MONGODB_URL:
        return "URL NOT FOUND"
    return "URL LOADED"


def get_db():
    global db
    if db is None:
        # This helps catch if routes are called before the DB is connected
        print("⚠️ Warning: Attempted to access DB before connection was established.")
    return db