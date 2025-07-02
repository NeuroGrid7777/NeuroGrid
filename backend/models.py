from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# User Models
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    INSTRUCTOR = "instructor"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_verified: bool = False
    subscription_status: Optional[str] = None
    courses_enrolled: List[str] = []

class UserInDB(User):
    hashed_password: str

# Auth Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

# Email Models
class EmailCapture(BaseModel):
    email: EmailStr
    source: str = "website"
    newsletter_consent: bool = True

class EmailCaptureResponse(BaseModel):
    message: str
    success: bool

# Course Models
class CourseLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class LessonBase(BaseModel):
    title: str
    description: str
    video_url: Optional[str] = None
    content: str
    duration_minutes: int = 0
    order: int

class Lesson(LessonBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str

class CourseBase(BaseModel):
    title: str
    description: str
    price: float
    level: CourseLevel
    thumbnail_url: Optional[str] = None
    is_published: bool = False

class CourseCreate(CourseBase):
    lessons: List[LessonBase] = []

class Course(CourseBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    instructor_id: str
    enrollment_count: int = 0
    lessons: List[Lesson] = []

# Progress Models
class LessonProgress(BaseModel):
    lesson_id: str
    completed: bool = False
    progress_percentage: int = 0
    completed_at: Optional[datetime] = None

class CourseProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    enrollment_date: datetime = Field(default_factory=datetime.utcnow)
    progress_percentage: int = 0
    lessons_progress: List[LessonProgress] = []
    completed: bool = False
    completion_date: Optional[datetime] = None

# Booking Models
class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class BookingType(str, Enum):
    CONSULTATION = "consultation"
    ONBOARDING = "onboarding"
    TRAINING = "training"

class BookingCreate(BaseModel):
    user_email: EmailStr
    user_name: str
    booking_type: BookingType
    preferred_date: datetime
    message: Optional[str] = None
    phone: Optional[str] = None

class Booking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    user_email: EmailStr
    user_name: str
    booking_type: BookingType
    preferred_date: datetime
    actual_date: Optional[datetime] = None
    status: BookingStatus = BookingStatus.PENDING
    message: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Payment Models
class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentType(str, Enum):
    COURSE = "course"
    CONSULTATION = "consultation"
    SUBSCRIPTION = "subscription"

class PaymentCreate(BaseModel):
    amount: float
    currency: str = "usd"
    payment_type: PaymentType
    item_id: str  # course_id, booking_id, etc.
    success_url: str
    cancel_url: str

class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    stripe_session_id: Optional[str] = None
    amount: float
    currency: str
    payment_type: PaymentType
    item_id: str
    status: PaymentStatus = PaymentStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = {}

# Neural Labs Models (Course Packages)
class NeuralPackage(str, Enum):
    STARTER = "starter"  # $99
    PROFESSIONAL = "professional"  # $299
    ENTERPRISE = "enterprise"  # $599

class NeuralLabsAccess(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    package: NeuralPackage
    purchase_date: datetime = Field(default_factory=datetime.utcnow)
    expiry_date: Optional[datetime] = None
    is_active: bool = True

# API Response Models
class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None