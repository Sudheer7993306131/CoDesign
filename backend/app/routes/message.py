from fastapi import APIRouter, HTTPException, Depends, Body
from app.database import get_db
from datetime import datetime
from typing import Annotated
from uuid import uuid4

router = APIRouter(prefix="/messages", tags=["Mesages"])

# Helper function to ensure chat_id is ALWAYS identical for both routes
def generate_chat_id(email1: str, email2: str):
    participants = sorted([email1.lower().strip(), email2.lower().strip()])
    return f"{participants[0]}_{participants[1]}"

@router.post("/send")
async def send_message(
    sender_email: str = Body(...),
    receiver_email: str = Body(...),
    message: str = Body(...),
    sender_role: str = Body(...),
    db: Annotated[dict, Depends(get_db)] = None # Correctly injected
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    if sender_role.lower() != "learner":
        raise HTTPException(status_code=403, detail="Messaging restricted to Learners")

    try:
        # Use the helper to ensure ID consistency
        chat_id = generate_chat_id(sender_email, receiver_email)

        message_doc = {
            "message_id": str(uuid4()),
            "chat_id": chat_id,
            "sender": sender_email.lower().strip(),
            "receiver": receiver_email.lower().strip(),
            "text": message,
            "timestamp": datetime.utcnow().isoformat(),
            "is_read": False
        }

        # Ensure collection name is consistent (you used 'chat' in history, so use it here too)
        await db["chat"].insert_one(message_doc)
        
        message_doc["_id"] = str(message_doc["_id"])
        return {"status": "sent", "data": message_doc}

    except Exception as e:
        print(f"Chat Send Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to store message")


@router.get("/history/{user_a}/{user_b}")
async def get_chat_history(
    user_a: str, 
    user_b: str, 
    db: Annotated[dict, Depends(get_db)] = None
):
    if db is None:
        raise HTTPException(status_code=500, detail="Database dependency failed")

    # Use the same helper function
    chat_id = generate_chat_id(user_a, user_b)
    
    # Debugging prints to your terminal
    print(f"Fetching history for Chat ID: {chat_id}")

    # Query the 'chat' collection
    cursor = db["chat"].find({"chat_id": chat_id}).sort("timestamp", 1)
    chat_list = await cursor.to_list(length=100)
    
    for m in chat_list: 
        m["_id"] = str(m["_id"])
        
    return chat_list