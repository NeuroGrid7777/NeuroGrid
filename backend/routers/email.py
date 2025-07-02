from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
import uuid
import requests
import os

from models import EmailCapture, EmailCaptureResponse, SuccessResponse
from database import get_database
from utils.email import send_welcome_email
from utils.rate_limiter import limiter

router = APIRouter(prefix="/email", tags=["email"])

@router.post("/capture", response_model=EmailCaptureResponse)
@limiter.limit("5/minute")  # Rate limit to prevent spam
async def capture_email(request, email_data: EmailCapture) -> EmailCaptureResponse:
    """Capture email for newsletter signup"""
    db = get_database()
    
    try:
        # Check if email already exists
        existing_email = await db.email_captures.find_one({"email": email_data.email})
        
        if existing_email:
            return EmailCaptureResponse(
                success=True,
                message="You're already subscribed to our newsletter!"
            )
        
        # Create email capture record
        email_record = {
            "id": str(uuid.uuid4()),
            "email": email_data.email,
            "source": email_data.source,
            "newsletter_consent": email_data.newsletter_consent,
            "created_at": datetime.utcnow(),
            "ip_address": request.client.host if hasattr(request, 'client') else None
        }
        
        await db.email_captures.insert_one(email_record)
        
        # Add to ConvertKit (if configured)
        convertkit_success = await add_to_convertkit(email_data.email)
        
        # Send welcome email
        try:
            await send_welcome_email(email_data.email, "Neural Grid Explorer")
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
        
        return EmailCaptureResponse(
            success=True,
            message="Successfully subscribed! Welcome to NeuroGrid AI 🚀"
        )
        
    except Exception as e:
        print(f"Email capture error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process email signup"
        )

async def add_to_convertkit(email: str) -> bool:
    """Add email to ConvertKit mailing list"""
    convertkit_api_key = os.getenv("CONVERTKIT_API_KEY")
    convertkit_secret = os.getenv("CONVERTKIT_SECRET")
    
    if not convertkit_api_key or not convertkit_secret:
        print("ConvertKit credentials not configured")
        return False
    
    try:
        # ConvertKit API endpoint for adding subscribers
        url = f"https://api.convertkit.com/v3/forms/{convertkit_api_key}/subscribe"
        
        payload = {
            "api_key": convertkit_secret,
            "email": email,
            "tags": ["neurogrid_ai", "website_signup"]
        }
        
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code == 200:
            print(f"Successfully added {email} to ConvertKit")
            return True
        else:
            print(f"ConvertKit API error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"ConvertKit integration error: {e}")
        return False

@router.post("/unsubscribe", response_model=SuccessResponse)
async def unsubscribe_email(email: str) -> SuccessResponse:
    """Unsubscribe email from newsletter"""
    db = get_database()
    
    # Update email record to mark as unsubscribed
    await db.email_captures.update_one(
        {"email": email},
        {
            "$set": {
                "newsletter_consent": False,
                "unsubscribed_at": datetime.utcnow()
            }
        }
    )
    
    # Remove from ConvertKit (if configured)
    await remove_from_convertkit(email)
    
    return SuccessResponse(
        message="Successfully unsubscribed from newsletter"
    )

async def remove_from_convertkit(email: str) -> bool:
    """Remove email from ConvertKit"""
    convertkit_secret = os.getenv("CONVERTKIT_SECRET")
    
    if not convertkit_secret:
        return False
    
    try:
        url = "https://api.convertkit.com/v3/unsubscribe"
        payload = {
            "api_secret": convertkit_secret,
            "email": email
        }
        
        response = requests.put(url, json=payload, timeout=10)
        return response.status_code == 200
        
    except Exception as e:
        print(f"ConvertKit unsubscribe error: {e}")
        return False

@router.get("/analytics", response_model=dict)
async def get_email_analytics():
    """Get email capture analytics (admin only)"""
    db = get_database()
    
    # Get total captures
    total_captures = await db.email_captures.count_documents({})
    
    # Get captures by source
    pipeline = [
        {"$group": {"_id": "$source", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    by_source = []
    async for doc in db.email_captures.aggregate(pipeline):
        by_source.append({"source": doc["_id"], "count": doc["count"]})
    
    # Get recent captures (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_captures = await db.email_captures.count_documents({
        "created_at": {"$gte": thirty_days_ago}
    })
    
    return {
        "total_captures": total_captures,
        "recent_captures": recent_captures,
        "by_source": by_source
    }