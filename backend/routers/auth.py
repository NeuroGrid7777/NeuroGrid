from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from datetime import timedelta, datetime
import uuid
from typing import Dict, Any

from models import UserCreate, UserLogin, Token, User, SuccessResponse, ErrorResponse
from auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from database import get_database
from utils.email import send_welcome_email, send_verification_email

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=SuccessResponse)
async def register_user(user_data: UserCreate) -> SuccessResponse:
    """Register a new user"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user_data.dict()
    user_dict["hashed_password"] = get_password_hash(user_data.password)
    del user_dict["password"]
    
    user_dict["id"] = str(uuid.uuid4())
    user_dict["created_at"] = user_dict["updated_at"] = datetime.utcnow()
    user_dict["is_active"] = True
    user_dict["is_verified"] = False
    user_dict["courses_enrolled"] = []
    
    result = await db.users.insert_one(user_dict)
    
    # Send welcome email (non-blocking)
    try:
        await send_welcome_email(user_data.email, user_data.full_name)
    except Exception as e:
        # Log error but don't fail registration
        print(f"Failed to send welcome email: {e}")
    
    return SuccessResponse(
        message="User registered successfully",
        data={"user_id": user_dict["id"]}
    )

@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin) -> Token:
    """Authenticate user and return access token"""
    user = await authenticate_user(user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=User)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)) -> User:
    """Get current user profile"""
    return current_user

@router.post("/forgot-password", response_model=SuccessResponse)
async def forgot_password(email: str) -> SuccessResponse:
    """Send password reset email"""
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if not user:
        # Don't reveal if email exists or not
        return SuccessResponse(
            message="If the email exists, a password reset link has been sent"
        )
    
    # Generate reset token (implement as needed)
    reset_token = str(uuid.uuid4())
    
    # Store reset token in database with expiration
    await db.password_resets.insert_one({
        "email": email,
        "token": reset_token,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(hours=1)
    })
    
    # Send reset email (implement email service)
    # await send_password_reset_email(email, reset_token)
    
    return SuccessResponse(
        message="If the email exists, a password reset link has been sent"
    )

@router.put("/update-profile", response_model=SuccessResponse)
async def update_user_profile(
    full_name: str,
    current_user: User = Depends(get_current_active_user)
) -> SuccessResponse:
    """Update user profile"""
    db = get_database()
    
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "full_name": full_name,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return SuccessResponse(message="Profile updated successfully")