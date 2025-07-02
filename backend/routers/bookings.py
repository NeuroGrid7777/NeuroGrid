from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta
import uuid

from models import (
    BookingCreate, 
    Booking, 
    BookingStatus, 
    BookingType,
    SuccessResponse,
    User
)
from auth import get_current_active_user, get_admin_user
from database import get_database
from utils.email import send_booking_confirmation

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/create", response_model=SuccessResponse)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_active_user)
) -> SuccessResponse:
    """Create a new consultation booking"""
    db = get_database()
    
    # Validate booking date is in the future
    if booking_data.preferred_date <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking date must be in the future"
        )
    
    # Check for existing pending/confirmed bookings for the same user
    existing_booking = await db.bookings.find_one({
        "user_id": current_user.id,
        "status": {"$in": [BookingStatus.PENDING, BookingStatus.CONFIRMED]}
    })
    
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have a pending or confirmed booking"
        )
    
    # Create booking record
    booking_dict = booking_data.dict()
    booking_dict.update({
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "user_email": current_user.email,
        "user_name": current_user.full_name,
        "status": BookingStatus.PENDING,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    await db.bookings.insert_one(booking_dict)
    
    # Send confirmation email
    try:
        await send_booking_confirmation(
            booking_dict["user_email"],
            booking_dict["user_name"],
            booking_dict["preferred_date"],
            booking_dict["booking_type"]
        )
    except Exception as e:
        print(f"Failed to send booking confirmation: {e}")
    
    return SuccessResponse(
        message="Booking request submitted successfully! We'll contact you within 24 hours.",
        data={"booking_id": booking_dict["id"]}
    )

@router.get("/my-bookings", response_model=List[Booking])
async def get_user_bookings(
    current_user: User = Depends(get_current_active_user)
) -> List[Booking]:
    """Get current user's bookings"""
    db = get_database()
    
    bookings = await db.bookings.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).to_list(50)
    
    return [Booking(**booking) for booking in bookings]

@router.put("/{booking_id}/cancel", response_model=SuccessResponse)
async def cancel_booking(
    booking_id: str,
    current_user: User = Depends(get_current_active_user)
) -> SuccessResponse:
    """Cancel a booking"""
    db = get_database()
    
    # Find booking
    booking = await db.bookings.find_one({"id": booking_id, "user_id": current_user.id})
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if booking can be cancelled
    if booking["status"] in [BookingStatus.CANCELLED, BookingStatus.COMPLETED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking cannot be cancelled"
        )
    
    # Update booking status
    await db.bookings.update_one(
        {"id": booking_id},
        {
            "$set": {
                "status": BookingStatus.CANCELLED,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return SuccessResponse(message="Booking cancelled successfully")

# Admin routes
@router.get("/admin/all", response_model=List[Booking])
async def get_all_bookings(
    status_filter: Optional[BookingStatus] = None,
    admin_user: User = Depends(get_admin_user)
) -> List[Booking]:
    """Get all bookings (admin only)"""
    db = get_database()
    
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    bookings = await db.bookings.find(query).sort("created_at", -1).to_list(100)
    return [Booking(**booking) for booking in bookings]

@router.put("/admin/{booking_id}/status", response_model=SuccessResponse)
async def update_booking_status(
    booking_id: str,
    new_status: BookingStatus,
    actual_date: Optional[datetime] = None,
    admin_user: User = Depends(get_admin_user)
) -> SuccessResponse:
    """Update booking status (admin only)"""
    db = get_database()
    
    update_data = {
        "status": new_status,
        "updated_at": datetime.utcnow()
    }
    
    if actual_date:
        update_data["actual_date"] = actual_date
    
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return SuccessResponse(message="Booking status updated successfully")

@router.get("/admin/analytics", response_model=dict)
async def get_booking_analytics(
    admin_user: User = Depends(get_admin_user)
) -> dict:
    """Get booking analytics (admin only)"""
    db = get_database()
    
    # Total bookings
    total_bookings = await db.bookings.count_documents({})
    
    # Bookings by status
    status_pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    status_counts = {}
    async for doc in db.bookings.aggregate(status_pipeline):
        status_counts[doc["_id"]] = doc["count"]
    
    # Bookings by type
    type_pipeline = [
        {"$group": {"_id": "$booking_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    type_counts = {}
    async for doc in db.bookings.aggregate(type_pipeline):
        type_counts[doc["_id"]] = doc["count"]
    
    # Recent bookings (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_bookings = await db.bookings.count_documents({
        "created_at": {"$gte": thirty_days_ago}
    })
    
    return {
        "total_bookings": total_bookings,
        "recent_bookings": recent_bookings,
        "by_status": status_counts,
        "by_type": type_counts
    }