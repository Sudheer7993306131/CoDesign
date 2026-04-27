from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from app.utils.jwt_handler import SECRET_KEY, ALGORITHM

security = HTTPBearer()

async def get_current_user(token=Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload 
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid or expired token"
        )

# MAKE SURE THIS FUNCTION IS WRITTEN EXACTLY LIKE THIS
async def require_mentor(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "mentor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access denied: Only mentors can perform this action."
        )
    return current_user

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):

    # bcrypt safety guard
    password = password[:72]

    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):

    plain_password = plain_password[:72]

    return pwd_context.verify(plain_password, hashed_password)