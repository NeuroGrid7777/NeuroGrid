from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi import Request, Response
import redis
import os

# Create limiter instance
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"]
)

# Optional: Use Redis for distributed rate limiting
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL:
    import redis
    redis_client = redis.from_url(REDIS_URL)
    limiter = Limiter(
        key_func=get_remote_address,
        storage_uri=REDIS_URL,
        default_limits=["100/minute"]
    )

def setup_rate_limiting(app):
    """Setup rate limiting for FastAPI app"""
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
    return app

# Custom rate limit exceeded response
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    response = Response(
        content=f"Rate limit exceeded: {exc.detail}",
        status_code=429,
        headers={"Retry-After": str(exc.retry_after)}
    )
    return response