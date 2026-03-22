"""
Authentication middleware for Google OAuth and JWT handling.
"""
import os
import uuid
import secrets
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User, ApiUsage, RateLimit

# ============== Configuration ==============

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID_HERE")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# Rate limiting config
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
RATE_LIMIT_WINDOW_MINUTES = int(os.getenv("RATE_LIMIT_WINDOW_MINUTES", "60"))

# Image generation cost
IMAGE_GENERATION_CREDIT_COST = int(os.getenv("IMAGE_GENERATION_CREDIT_COST", "1"))

# ============== Security ==============

security = HTTPBearer()


# ============== JWT Functions ==============

def create_jwt_token(user_id: str) -> str:
    """Create a JWT token for a user."""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": str(user_id),
        "exp": expiration,
        "iat": datetime.utcnow(),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_jwt(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ============== Google OAuth ==============

async def verify_google_token(id_token_str: str) -> dict:
    """Verify a Google ID token and return user info."""
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        
        # Check issuer
        if idinfo.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token issuer",
            )
        
        return idinfo
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
        )


# ============== User Management ==============

async def get_or_create_user(
    db: AsyncSession,
    google_id: str,
    email: str,
    name: str,
    picture_url: Optional[str] = None
) -> User:
    """Get existing user or create a new one from Google data."""
    # Try to find user by google_id
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()
    
    if user:
        # Update last login and info
        user.last_login = datetime.utcnow()
        user.email = email
        user.name = name
        if picture_url:
            user.picture_url = picture_url
        await db.commit()
        await db.refresh(user)
        return user
    
    # Try to find by email (migration case)
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if user:
        # Update with Google info
        user.google_id = google_id
        user.last_login = datetime.utcnow()
        user.name = name
        if picture_url:
            user.picture_url = picture_url
        await db.commit()
        await db.refresh(user)
        return user
    
    # Create new user
    user = User(
        id=uuid.uuid4(),
        google_id=google_id,
        email=email,
        name=name,
        picture_url=picture_url,
        created_at=datetime.utcnow(),
        last_login=datetime.utcnow(),
        is_active=True,
        credits_remaining=10
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Create initial rate limit record
    rate_limit = RateLimit(
        user_id=user.id,
        requests_count=0,
        window_start=datetime.utcnow()
    )
    db.add(rate_limit)
    await db.commit()
    
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get the current authenticated user from JWT token."""
    token = credentials.credentials
    payload = verify_jwt(token)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )
    
    return user


# ============== Rate Limiting ==============

async def check_rate_limit(user: User, db: AsyncSession) -> bool:
    """Check if user has exceeded rate limits. Returns True if allowed."""
    result = await db.execute(select(RateLimit).where(RateLimit.user_id == user.id))
    rate_limit = result.scalar_one_or_none()
    
    if not rate_limit:
        # Create rate limit record if missing
        rate_limit = RateLimit(
            user_id=user.id,
            requests_count=1,
            window_start=datetime.utcnow()
        )
        db.add(rate_limit)
        await db.commit()
        return True
    
    now = datetime.utcnow()
    window_end = rate_limit.window_start + timedelta(minutes=RATE_LIMIT_WINDOW_MINUTES)
    
    # Reset window if expired
    if now > window_end:
        rate_limit.requests_count = 1
        rate_limit.window_start = now
        await db.commit()
        return True
    
    # Check limit
    if rate_limit.requests_count >= RATE_LIMIT_REQUESTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {int((window_end - now).total_seconds() / 60)} minutes.",
        )
    
    # Increment counter
    rate_limit.requests_count += 1
    await db.commit()
    return True


async def get_rate_limit_status(user: User, db: AsyncSession) -> dict:
    """Get current rate limit status for a user."""
    result = await db.execute(select(RateLimit).where(RateLimit.user_id == user.id))
    rate_limit = result.scalar_one_or_none()
    
    if not rate_limit:
        return {
            "requests_count": 0,
            "limit": RATE_LIMIT_REQUESTS,
            "remaining": RATE_LIMIT_REQUESTS,
            "window_start": datetime.utcnow(),
            "window_minutes": RATE_LIMIT_WINDOW_MINUTES
        }
    
    now = datetime.utcnow()
    window_end = rate_limit.window_start + timedelta(minutes=RATE_LIMIT_WINDOW_MINUTES)
    
    # Reset if window expired
    if now > window_end:
        return {
            "requests_count": 0,
            "limit": RATE_LIMIT_REQUESTS,
            "remaining": RATE_LIMIT_REQUESTS,
            "window_start": now,
            "window_minutes": RATE_LIMIT_WINDOW_MINUTES
        }
    
    remaining = max(0, RATE_LIMIT_REQUESTS - rate_limit.requests_count)
    
    return {
        "requests_count": rate_limit.requests_count,
        "limit": RATE_LIMIT_REQUESTS,
        "remaining": remaining,
        "window_start": rate_limit.window_start,
        "window_minutes": RATE_LIMIT_WINDOW_MINUTES,
        "resets_at": window_end
    }


# ============== Credits ==============

async def check_credits(user: User, required_credits: int = 1) -> bool:
    """Check if user has enough credits."""
    if user.credits_remaining < required_credits:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Required: {required_credits}, Available: {user.credits_remaining}",
        )
    return True


async def deduct_credits(
    user: User,
    db: AsyncSession,
    amount: int = IMAGE_GENERATION_CREDIT_COST,
    endpoint: str = "unknown",
    tokens_used: int = 0,
    cost: float = 0.0
) -> User:
    """Deduct credits from user and log usage."""
    if user.credits_remaining < amount:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Insufficient credits. Required: {amount}, Available: {user.credits_remaining}",
        )
    
    # Deduct credits
    user.credits_remaining -= amount
    await db.commit()
    await db.refresh(user)
    
    # Log API usage
    usage = ApiUsage(
        id=uuid.uuid4(),
        user_id=user.id,
        endpoint=endpoint,
        tokens_used=tokens_used,
        cost=cost,
        created_at=datetime.utcnow()
    )
    db.add(usage)
    await db.commit()
    
    return user


async def add_credits(user: User, db: AsyncSession, amount: int) -> User:
    """Add credits to a user (for admin/refill purposes)."""
    user.credits_remaining += amount
    await db.commit()
    await db.refresh(user)
    return user
