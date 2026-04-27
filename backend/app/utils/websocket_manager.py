from fastapi import WebSocket
from typing import List, Dict

class ConnectionManager:
    def __init__(self):
        # Store active connections: { "email": websocket_object }
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_email: str):
        await websocket.accept()
        self.active_connections[user_email] = websocket

    def disconnect(self, user_email: str):
        if user_email in self.active_connections:
            del self.active_connections[user_email]

    async def broadcast(self, message: dict):
        # Send message to everyone online in the CoDesign community
        for connection in self.active_connections.values():
            await connection.send_json(message)

    async def send_personal_message(self, message: dict, user_email: str):
        # Direct message (useful for 1-on-1 Mentorship)
        if user_email in self.active_connections:
            await self.active_connections[user_email].send_json(message)

manager = ConnectionManager()