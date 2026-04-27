from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from app.utils.jwt_handler import SECRET_KEY, ALGORITHM

security = HTTPBearer()

# 1. Get the full user data from the token
async def get_current_user(token=Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        # Return the whole dict: {"sub": "...", "role": "...", "name": "..."}
        return payload 
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid or expired token"
        )

# 2. Specific restriction for Mentors
async def require_mentor(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access denied: Only mentors can perform this action."
        )
    return current_user