from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, TEXT
import os
from typing import List
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def connect_to_mongo():
    """Create database connection"""
    try:
        db.client = AsyncIOMotorClient(os.environ['MONGO_URL'])
        db.database = db.client[os.environ['DB_NAME']]
        
        # Test the connection
        await db.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes for better performance
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("Disconnected from MongoDB")

async def create_indexes():
    """Create database indexes for optimal performance"""
    try:
        # Users collection indexes
        user_indexes = [
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("created_at", ASCENDING)]),
            IndexModel([("is_active", ASCENDING)]),
        ]
        await db.database.users.create_indexes(user_indexes)
        
        # Courses collection indexes
        course_indexes = [
            IndexModel([("title", TEXT)]),
            IndexModel([("level", ASCENDING)]),
            IndexModel([("is_published", ASCENDING)]),
            IndexModel([("instructor_id", ASCENDING)]),
            IndexModel([("created_at", ASCENDING)]),
        ]
        await db.database.courses.create_indexes(course_indexes)
        
        # Course progress indexes
        progress_indexes = [
            IndexModel([("user_id", ASCENDING), ("course_id", ASCENDING)], unique=True),
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("course_id", ASCENDING)]),
        ]
        await db.database.course_progress.create_indexes(progress_indexes)
        
        # Bookings collection indexes
        booking_indexes = [
            IndexModel([("user_email", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("booking_type", ASCENDING)]),
            IndexModel([("preferred_date", ASCENDING)]),
            IndexModel([("created_at", ASCENDING)]),
        ]
        await db.database.bookings.create_indexes(booking_indexes)
        
        # Payments collection indexes
        payment_indexes = [
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("stripe_session_id", ASCENDING)], unique=True, sparse=True),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("payment_type", ASCENDING)]),
            IndexModel([("created_at", ASCENDING)]),
        ]
        await db.database.payments.create_indexes(payment_indexes)
        
        # Email captures indexes
        email_indexes = [
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("created_at", ASCENDING)]),
        ]
        await db.database.email_captures.create_indexes(email_indexes)
        
        # Neural Labs access indexes
        neural_indexes = [
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("package", ASCENDING)]),
            IndexModel([("is_active", ASCENDING)]),
            IndexModel([("expiry_date", ASCENDING)]),
        ]
        await db.database.neural_labs_access.create_indexes(neural_indexes)
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.warning(f"Error creating indexes: {e}")

def get_database():
    """Get database instance"""
    return db.database