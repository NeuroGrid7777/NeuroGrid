from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List, Optional
from datetime import datetime
import uuid

from models import (
    Course,
    CourseCreate,
    CourseLevel,
    Lesson,
    CourseProgress,
    LessonProgress,
    NeuralLabsAccess,
    User,
    SuccessResponse
)
from auth import get_current_active_user, get_instructor_user, get_admin_user
from database import get_database

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=List[Course])
async def get_published_courses() -> List[Course]:
    """Get all published courses"""
    db = get_database()
    
    courses = await db.courses.find(
        {"is_published": True}
    ).sort("created_at", -1).to_list(50)
    
    return [Course(**course) for course in courses]

@router.get("/{course_id}", response_model=Course)
async def get_course_details(course_id: str) -> Course:
    """Get course details by ID"""
    db = get_database()
    
    course = await db.courses.find_one({"id": course_id, "is_published": True})
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Get lessons for this course
    lessons = await db.lessons.find({"course_id": course_id}).sort("order", 1).to_list(100)
    course["lessons"] = [Lesson(**lesson) for lesson in lessons]
    
    return Course(**course)

@router.get("/{course_id}/access", response_model=dict)
async def check_course_access(
    course_id: str,
    current_user: User = Depends(get_current_active_user)
) -> dict:
    """Check if user has access to a course"""
    db = get_database()
    
    # Check if user has Neural Labs access for this course
    access = await db.neural_labs_access.find_one({
        "user_id": current_user.id,
        "package": course_id,
        "is_active": True
    })
    
    has_access = access is not None
    
    # Get progress if user has access
    progress = None
    if has_access:
        progress_data = await db.course_progress.find_one({
            "user_id": current_user.id,
            "course_id": course_id
        })
        if progress_data:
            progress = CourseProgress(**progress_data)
    
    return {
        "has_access": has_access,
        "progress": progress.dict() if progress else None,
        "access_details": access
    }

@router.post("/{course_id}/enroll", response_model=SuccessResponse)
async def enroll_in_course(
    course_id: str,
    current_user: User = Depends(get_current_active_user)
) -> SuccessResponse:
    """Enroll user in a course (requires payment)"""
    db = get_database()
    
    # Check if course exists
    course = await db.courses.find_one({"id": course_id, "is_published": True})
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if user already has access
    existing_access = await db.neural_labs_access.find_one({
        "user_id": current_user.id,
        "package": course_id,
        "is_active": True
    })
    
    if existing_access:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have access to this course"
        )
    
    # For now, redirect to payment
    return SuccessResponse(
        message="Please complete payment to access this course",
        data={
            "course_id": course_id,
            "payment_required": True,
            "price": course["price"]
        }
    )

@router.put("/{course_id}/lesson/{lesson_id}/progress", response_model=SuccessResponse)
async def update_lesson_progress(
    course_id: str,
    lesson_id: str,
    progress_percentage: int,
    completed: bool = False,
    current_user: User = Depends(get_current_active_user)
) -> SuccessResponse:
    """Update lesson progress"""
    db = get_database()
    
    # Check course access
    access = await db.neural_labs_access.find_one({
        "user_id": current_user.id,
        "package": course_id,
        "is_active": True
    })
    
    if not access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this course"
        )
    
    # Get or create course progress
    course_progress = await db.course_progress.find_one({
        "user_id": current_user.id,
        "course_id": course_id
    })
    
    if not course_progress:
        # Create new progress record
        course_progress = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "course_id": course_id,
            "enrollment_date": datetime.utcnow(),
            "progress_percentage": 0,
            "lessons_progress": [],
            "completed": False
        }
        await db.course_progress.insert_one(course_progress)
    
    # Update lesson progress
    lesson_progress = {
        "lesson_id": lesson_id,
        "completed": completed,
        "progress_percentage": progress_percentage,
        "completed_at": datetime.utcnow() if completed else None
    }
    
    # Update or add lesson progress
    await db.course_progress.update_one(
        {"user_id": current_user.id, "course_id": course_id},
        {
            "$pull": {"lessons_progress": {"lesson_id": lesson_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    await db.course_progress.update_one(
        {"user_id": current_user.id, "course_id": course_id},
        {"$push": {"lessons_progress": lesson_progress}}
    )
    
    # Calculate overall course progress
    await update_course_progress(current_user.id, course_id)
    
    return SuccessResponse(message="Progress updated successfully")

async def update_course_progress(user_id: str, course_id: str):
    """Calculate and update overall course progress"""
    db = get_database()
    
    # Get all lessons for the course
    lessons = await db.lessons.find({"course_id": course_id}).to_list(100)
    total_lessons = len(lessons)
    
    if total_lessons == 0:
        return
    
    # Get progress data
    progress_data = await db.course_progress.find_one({
        "user_id": user_id,
        "course_id": course_id
    })
    
    if not progress_data:
        return
    
    # Calculate completion percentage
    completed_lessons = sum(1 for lp in progress_data.get("lessons_progress", []) if lp.get("completed", False))
    progress_percentage = int((completed_lessons / total_lessons) * 100)
    is_completed = progress_percentage == 100
    
    # Update course progress
    update_data = {
        "progress_percentage": progress_percentage,
        "completed": is_completed,
        "updated_at": datetime.utcnow()
    }
    
    if is_completed and not progress_data.get("completed", False):
        update_data["completion_date"] = datetime.utcnow()
    
    await db.course_progress.update_one(
        {"user_id": user_id, "course_id": course_id},
        {"$set": update_data}
    )

@router.get("/my-courses", response_model=List[dict])
async def get_user_courses(
    current_user: User = Depends(get_current_active_user)
) -> List[dict]:
    """Get user's enrolled courses with progress"""
    db = get_database()
    
    # Get user's Neural Labs access
    access_records = await db.neural_labs_access.find({
        "user_id": current_user.id,
        "is_active": True
    }).to_list(50)
    
    user_courses = []
    for access in access_records:
        # Get course details
        course = await db.courses.find_one({"id": access["package"]})
        if not course:
            continue
        
        # Get progress
        progress = await db.course_progress.find_one({
            "user_id": current_user.id,
            "course_id": access["package"]
        })
        
        user_courses.append({
            "course": Course(**course),
            "access": access,
            "progress": CourseProgress(**progress) if progress else None
        })
    
    return user_courses

# Instructor/Admin routes
@router.post("/create", response_model=SuccessResponse)
async def create_course(
    course_data: CourseCreate,
    instructor: User = Depends(get_instructor_user)
) -> SuccessResponse:
    """Create a new course (instructor/admin only)"""
    db = get_database()
    
    # Create course
    course_dict = course_data.dict(exclude={"lessons"})
    course_dict.update({
        "id": str(uuid.uuid4()),
        "instructor_id": instructor.id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "enrollment_count": 0
    })
    
    await db.courses.insert_one(course_dict)
    
    # Create lessons
    for lesson_data in course_data.lessons:
        lesson_dict = lesson_data.dict()
        lesson_dict.update({
            "id": str(uuid.uuid4()),
            "course_id": course_dict["id"]
        })
        await db.lessons.insert_one(lesson_dict)
    
    return SuccessResponse(
        message="Course created successfully",
        data={"course_id": course_dict["id"]}
    )

@router.get("/admin/all", response_model=List[Course])
async def get_all_courses(
    admin: User = Depends(get_admin_user)
) -> List[Course]:
    """Get all courses including unpublished (admin only)"""
    db = get_database()
    
    courses = await db.courses.find({}).sort("created_at", -1).to_list(100)
    return [Course(**course) for course in courses]

@router.put("/{course_id}/publish", response_model=SuccessResponse)
async def publish_course(
    course_id: str,
    admin: User = Depends(get_admin_user)
) -> SuccessResponse:
    """Publish/unpublish a course (admin only)"""
    db = get_database()
    
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    new_status = not course.get("is_published", False)
    
    await db.courses.update_one(
        {"id": course_id},
        {
            "$set": {
                "is_published": new_status,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    status_text = "published" if new_status else "unpublished"
    return SuccessResponse(message=f"Course {status_text} successfully")