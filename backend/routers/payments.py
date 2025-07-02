from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Optional
from datetime import datetime, timedelta
import os
import uuid

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, 
    CheckoutSessionResponse, 
    CheckoutStatusResponse, 
    CheckoutSessionRequest
)
from models import (
    PaymentCreate, 
    Payment, 
    PaymentStatus, 
    PaymentType,
    NeuralPackage,
    SuccessResponse
)
from auth import get_current_active_user
from database import get_database

router = APIRouter(prefix="/payments", tags=["payments"])

# Stripe integration
stripe_checkout = StripeCheckout(api_key=os.getenv("STRIPE_SECRET_KEY"))

# Predefined packages to prevent price manipulation
NEURAL_PACKAGES = {
    NeuralPackage.STARTER: {"price": 99.0, "name": "Neural Starter Package"},
    NeuralPackage.PROFESSIONAL: {"price": 299.0, "name": "Neural Professional Package"},
    NeuralPackage.ENTERPRISE: {"price": 599.0, "name": "Neural Enterprise Package"},
}

CONSULTATION_PRICE = 150.0  # Fixed consultation price

@router.post("/checkout/session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    request: Request,
    package_id: Optional[str] = None,
    payment_type: PaymentType = PaymentType.CONSULTATION,
    item_id: Optional[str] = None,
    current_user = Depends(get_current_active_user)
) -> CheckoutSessionResponse:
    """Create Stripe checkout session"""
    db = get_database()
    
    # Get origin URL from request headers
    origin_url = request.headers.get("origin", "http://localhost:3000")
    
    # Determine amount based on payment type (server-side only)
    if payment_type == PaymentType.CONSULTATION:
        amount = CONSULTATION_PRICE
        currency = "usd"
        item_name = "AI Consultation Session"
        actual_item_id = item_id or "consultation"
        
    elif payment_type == PaymentType.COURSE:
        if package_id not in NEURAL_PACKAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid package selected"
            )
        
        package_info = NEURAL_PACKAGES[package_id]
        amount = package_info["price"]
        currency = "usd"
        item_name = package_info["name"]
        actual_item_id = package_id
        
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment type"
        )
    
    # Create success and cancel URLs
    success_url = f"{origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/payment/cancel"
    
    # Prepare checkout request
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency=currency,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user.id,
            "user_email": current_user.email,
            "payment_type": payment_type,
            "item_id": actual_item_id,
            "item_name": item_name
        }
    )
    
    # Create Stripe checkout session
    try:
        session = await stripe_checkout.create_checkout_session(checkout_request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}"
        )
    
    # Store payment record in database
    payment_record = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "stripe_session_id": session.session_id,
        "amount": amount,
        "currency": currency,
        "payment_type": payment_type,
        "item_id": actual_item_id,
        "status": PaymentStatus.PENDING,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "metadata": {
            "item_name": item_name,
            "package_id": package_id
        }
    }
    
    await db.payments.insert_one(payment_record)
    
    return session

@router.get("/checkout/status/{session_id}", response_model=CheckoutStatusResponse)
async def get_checkout_status(
    session_id: str,
    current_user = Depends(get_current_active_user)
) -> CheckoutStatusResponse:
    """Get checkout session status and update database"""
    db = get_database()
    
    # Get payment record from database
    payment_record = await db.payments.find_one({"stripe_session_id": session_id})
    if not payment_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment session not found"
        )
    
    # Verify user owns this payment
    if payment_record["user_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this payment"
        )
    
    try:
        # Get status from Stripe
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update payment status in database if changed
        if checkout_status.payment_status == "paid" and payment_record["status"] != PaymentStatus.COMPLETED:
            # Update payment status
            await db.payments.update_one(
                {"stripe_session_id": session_id},
                {
                    "$set": {
                        "status": PaymentStatus.COMPLETED,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            # Grant access based on payment type
            await process_successful_payment(current_user.id, payment_record)
            
        elif checkout_status.status == "expired":
            await db.payments.update_one(
                {"stripe_session_id": session_id},
                {
                    "$set": {
                        "status": PaymentStatus.FAILED,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
        
        return checkout_status
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check payment status: {str(e)}"
        )

async def process_successful_payment(user_id: str, payment_record: dict):
    """Process successful payment and grant access"""
    db = get_database()
    
    if payment_record["payment_type"] == PaymentType.COURSE:
        # Grant Neural Labs access
        package_id = payment_record["item_id"]
        
        access_record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "package": package_id,
            "purchase_date": datetime.utcnow(),
            "expiry_date": None,  # Lifetime access for now
            "is_active": True
        }
        
        await db.neural_labs_access.insert_one(access_record)
        
        # Update user's enrolled courses
        await db.users.update_one(
            {"id": user_id},
            {"$addToSet": {"courses_enrolled": package_id}}
        )
        
    elif payment_record["payment_type"] == PaymentType.CONSULTATION:
        # Create consultation booking
        booking_record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "user_email": "",  # Will be filled from user data
            "user_name": "",   # Will be filled from user data
            "booking_type": "consultation",
            "status": "confirmed",
            "created_at": datetime.utcnow(),
            "payment_id": payment_record["id"]
        }
        
        await db.bookings.insert_one(booking_record)

@router.get("/packages", response_model=dict)
async def get_available_packages():
    """Get available Neural Labs packages"""
    return {
        "packages": [
            {
                "id": package_id,
                "name": info["name"],
                "price": info["price"],
                "currency": "USD",
                "features": get_package_features(package_id)
            }
            for package_id, info in NEURAL_PACKAGES.items()
        ]
    }

def get_package_features(package_id: str) -> list:
    """Get features for each package"""
    features_map = {
        NeuralPackage.STARTER: [
            "Basic AI Automation Course",
            "5 Neural Network Templates",
            "Community Access",
            "Email Support"
        ],
        NeuralPackage.PROFESSIONAL: [
            "Complete AI Automation Suite",
            "20+ Neural Network Templates",
            "1-on-1 Mentorship (2 sessions)",
            "Priority Support",
            "Advanced Workshops"
        ],
        NeuralPackage.ENTERPRISE: [
            "Full Neural Labs Access",
            "Unlimited Templates & Resources",
            "Weekly 1-on-1 Mentorship",
            "Custom AI Development",
            "24/7 Priority Support",
            "Enterprise Integration"
        ]
    }
    return features_map.get(package_id, [])

@router.get("/history", response_model=list)
async def get_payment_history(current_user = Depends(get_current_active_user)):
    """Get user's payment history"""
    db = get_database()
    
    payments = await db.payments.find(
        {"user_id": current_user.id}
    ).sort("created_at", -1).to_list(50)
    
    return [
        {
            "id": payment["id"],
            "amount": payment["amount"],
            "currency": payment["currency"],
            "status": payment["status"],
            "payment_type": payment["payment_type"],
            "item_name": payment.get("metadata", {}).get("item_name", ""),
            "created_at": payment["created_at"]
        }
        for payment in payments
    ]