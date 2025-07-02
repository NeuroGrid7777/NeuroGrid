from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging
from pathlib import Path

# Import database and auth
from database import connect_to_mongo, close_mongo_connection
from utils.rate_limiter import setup_rate_limiting

# Import routers
from routers.auth import router as auth_router
from routers.payments import router as payments_router
from routers.email import router as email_router
from routers.bookings import router as bookings_router
from routers.courses import router as courses_router

# Load environment variables
from dotenv import load_dotenv
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting NeuroGrid AI Backend...")
    await connect_to_mongo()
    logger.info("✅ NeuroGrid AI Backend initialized successfully!")
    yield
    # Shutdown
    logger.info("🔄 Shutting down NeuroGrid AI Backend...")
    await close_mongo_connection()
    logger.info("✅ NeuroGrid AI Backend shutdown complete!")

# Create the main app
app = FastAPI(
    title="NeuroGrid AI Backend",
    description="Advanced AI automation platform with neural intelligence capabilities",
    version="1.0.0",
    lifespan=lifespan
)

# Setup rate limiting
app = setup_rate_limiting(app)

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Add routers to the API router
api_router.include_router(auth_router)
api_router.include_router(payments_router)
api_router.include_router(email_router)
api_router.include_router(bookings_router)
api_router.include_router(courses_router)

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "NeuroGrid AI Backend",
        "version": "1.0.0",
        "neural_status": "active",
        "quantum_processing": "online"
    }

# Root endpoint
@api_router.get("/")
async def root():
    return {
        "message": "Welcome to NeuroGrid AI Backend! 🧠⚡",
        "description": "Neural Intelligence • Infinite Possibilities",
        "status": "online",
        "version": "1.0.0"
    }

# Include the API router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # In production, specify exact origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
