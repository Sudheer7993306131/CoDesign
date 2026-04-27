from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime  # <--- ADD THIS LINE
import app.database as database
from app.models.chat import MessageModel, MessageCreate

router = APIRouter(prefix="/chat", tags=["Chat"])

def generate_room_id(email1: str, email2: str) -> str:
    # Ensures the room ID is identical regardless of who starts the chat
    return "_".join(sorted([email1.lower(), email2.lower()]))

@router.post("/send/{sender_email}")
async def send_message(sender_email: str, data: MessageCreate):
    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    room_id = generate_room_id(sender_email, data.receiver_email)
    
    new_message = {
        "room_id": room_id,
        "sender_email": sender_email,
        "receiver_email": data.receiver_email,
        "content": data.content,
        "timestamp": datetime.utcnow()
    }

    await database.db.messages.insert_one(new_message)
    return {"status": "success", "message": "Message sent"}

@router.get("/history/{user_email}/{peer_email}")
async def get_chat_history(user_email: str, peer_email: str):
    if database.db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    room_id = generate_room_id(user_email, peer_email)
    
    # Fetch messages for this room, sorted by time (oldest first)
    cursor = database.db.messages.find({"room_id": room_id}).sort("timestamp", 1)
    messages = await cursor.to_list(length=100)

    for msg in messages:
        msg["_id"] = str(msg["_id"])
        
    return messages