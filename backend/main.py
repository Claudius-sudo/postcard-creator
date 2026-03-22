import os
import uuid
from datetime import datetime
from typing import Optional, List
from pathlib import Path

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db, init_db
from models import User, Template, Postcard, Recipient, PostcardStatus, ReferenceImage, ReferenceImageType, ApiUsage
from schemas import (
    HealthResponse,
    TemplateResponse,
    TemplateListResponse,
    PostcardCreate,
    PostcardUpdate,
    PostcardResponse,
    PostcardListResponse,
    PostcardSendResponse,
    UploadResponse,
    RecipientCreate,
    RecipientUpdate,
    ErrorResponse,
    ReferenceImageCreate,
    ReferenceImageResponse,
    ReferenceImageList,
    GoogleAuthRequest,
    TokenResponse,
    UserResponse,
    CreditResponse,
    ApiUsageResponse,
    ApiUsageListResponse,
    RateLimitResponse,
    ImageGenerateRequest,
    ImageGenerateResponse,
)
from auth import (
    verify_google_token,
    get_or_create_user,
    create_jwt_token,
    get_current_user,
    check_rate_limit,
    get_rate_limit_status,
    check_credits,
    deduct_credits,
    JWT_EXPIRATION_HOURS,
)

# ============== Configuration ==============

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
REFERENCE_UPLOAD_DIR = Path(os.getenv("REFERENCE_UPLOAD_DIR", "/app/uploads/references"))
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_REFERENCE_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg"}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
REFERENCE_ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
REFERENCE_ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

# Ensure upload directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
REFERENCE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ============== FastAPI App ==============

app = FastAPI(
    title="Postcard Creator API",
    description="API for creating and managing postcards",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Startup Event ==============

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    await init_db()
    
    # Log JWT secret status (don't log the actual secret)
    from auth import JWT_SECRET_KEY
    if JWT_SECRET_KEY == "YOUR_GOOGLE_CLIENT_ID_HERE" or len(JWT_SECRET_KEY) < 32:
        print("WARNING: Using default/placeholder JWT_SECRET_KEY. Please set a secure JWT_SECRET_KEY in production.")
    else:
        print("JWT authentication configured successfully.")


# ============== Exception Handlers ==============

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred", "error_code": "INTERNAL_ERROR"},
    )


# ============== Health Endpoints ==============

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
    )


# ============== Auth Endpoints ==============

@app.post("/auth/google", response_model=TokenResponse, tags=["Authentication"])
async def google_auth(
    auth_data: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Exchange Google ID token for JWT access token.
    
    - Verifies the Google ID token
    - Creates or updates user in database
    - Returns JWT access token for API authentication
    """
    try:
        # Verify Google token
        google_info = await verify_google_token(auth_data.id_token)
        
        # Extract user info
        google_id = google_info.get("sub")
        email = google_info.get("email")
        name = google_info.get("name", email.split("@")[0] if email else "User")
        picture_url = google_info.get("picture")
        
        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google token: missing user information",
            )
        
        # Get or create user
        user = await get_or_create_user(
            db=db,
            google_id=google_id,
            email=email,
            name=name,
            picture_url=picture_url
        )
        
        # Create JWT token
        access_token = create_jwt_token(str(user.id))
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=JWT_EXPIRATION_HOURS * 3600,
            user=UserResponse.model_validate(user)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}",
        )


@app.get("/auth/me", response_model=UserResponse, tags=["Authentication"])
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user information.
    
    - Requires valid JWT token in Authorization header
    - Returns user profile including credits
    """
    return UserResponse.model_validate(current_user)


@app.get("/credits", response_model=CreditResponse, tags=["Credits"])
async def get_credits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current user's credit balance.
    
    - Requires valid JWT token
    - Returns remaining credits and usage stats
    """
    # Calculate credits used (starting from default 10)
    credits_used = 10 - current_user.credits_remaining
    
    return CreditResponse(
        credits_remaining=current_user.credits_remaining,
        credits_used=max(0, credits_used)
    )


@app.get("/rate-limit", response_model=RateLimitResponse, tags=["Rate Limiting"])
async def get_rate_limit(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current rate limit status.
    
    - Requires valid JWT token
    - Returns request count, limit, and reset time
    """
    rate_limit_info = await get_rate_limit_status(current_user, db)
    return RateLimitResponse(**rate_limit_info)


# ============== Image Generation Endpoints ==============

@app.post("/images/generate", response_model=ImageGenerateResponse, tags=["Image Generation"])
async def generate_image(
    request: ImageGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate an image using AI (protected endpoint).
    
    - Requires valid JWT token
    - Checks rate limits
    - Checks and deducts credits
    - Calls Nano Banana API for generation
    - Logs API usage
    """
    # Check rate limits
    await check_rate_limit(current_user, db)
    
    # Check credits (default cost: 1 credit)
    await check_credits(current_user, required_credits=1)
    
    try:
        # TODO: Integrate with Nano Banana API
        # For now, return a placeholder response
        # In production, this would call the actual image generation API
        
        # Placeholder: Simulate image generation
        # Replace this with actual Nano Banana API call
        
        # Deduct credits and log usage
        updated_user = await deduct_credits(
            user=current_user,
            db=db,
            amount=1,
            endpoint="/images/generate",
            tokens_used=0,  # Update based on actual API usage
            cost=0.0  # Update based on actual cost
        )
        
        # Placeholder image URL - replace with actual generated image URL
        placeholder_image_url = f"/generated/{uuid.uuid4()}.png"
        
        return ImageGenerateResponse(
            image_url=placeholder_image_url,
            credits_remaining=updated_user.credits_remaining,
            cost_credits=1
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image generation failed: {str(e)}",
        )


# ============== Template Endpoints ==============

@app.get("/templates", response_model=TemplateListResponse, tags=["Templates"])
async def list_templates(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    """List all available templates."""
    result = await db.execute(
        select(Template)
        .order_by(Template.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    templates = result.scalars().all()
    return TemplateListResponse(templates=templates)


@app.get("/templates/{template_id}", response_model=TemplateResponse, tags=["Templates"])
async def get_template(template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get a specific template by ID."""
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template with ID {template_id} not found",
        )
    
    return template


# ============== Postcard Endpoints ==============

@app.post("/postcards", response_model=PostcardResponse, status_code=status.HTTP_201_CREATED, tags=["Postcards"])
async def create_postcard(
    postcard_data: PostcardCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new postcard."""
    # For demo purposes, create or get a default user
    # In production, this would come from authentication
    user_result = await db.execute(select(User).limit(1))
    user = user_result.scalar_one_or_none()
    
    if not user:
        # Create a default user if none exists
        user = User(email="default@example.com", name="Default User")
        db.add(user)
        await db.flush()
    
    # Validate template if provided
    if postcard_data.template_id:
        template_result = await db.execute(
            select(Template).where(Template.id == postcard_data.template_id)
        )
        if not template_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template with ID {postcard_data.template_id} not found",
            )
    
    # Create postcard
    postcard = Postcard(
        user_id=user.id,
        template_id=postcard_data.template_id,
        title=postcard_data.title,
        message=postcard_data.message,
        image_url=postcard_data.image_url,
        status=PostcardStatus.DRAFT.value,
    )
    db.add(postcard)
    await db.flush()
    
    # Create recipient if provided
    if postcard_data.recipient:
        recipient = Recipient(
            postcard_id=postcard.id,
            name=postcard_data.recipient.name,
            address_line1=postcard_data.recipient.address_line1,
            address_line2=postcard_data.recipient.address_line2,
            city=postcard_data.recipient.city,
            state=postcard_data.recipient.state,
            postal_code=postcard_data.recipient.postal_code,
            country=postcard_data.recipient.country,
        )
        db.add(recipient)
    
    await db.commit()
    
    # Refresh with relationships
    result = await db.execute(
        select(Postcard)
        .options(selectinload(Postcard.recipient))
        .where(Postcard.id == postcard.id)
    )
    return result.scalar_one()


@app.get("/postcards", response_model=PostcardListResponse, tags=["Postcards"])
async def list_postcards(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    """List postcards for the current user."""
    # For demo purposes, get the first user
    # In production, this would be the authenticated user
    user_result = await db.execute(select(User).limit(1))
    user = user_result.scalar_one_or_none()
    
    if not user:
        return PostcardListResponse(postcards=[], total=0)
    
    # Build query
    query = select(Postcard).where(Postcard.user_id == user.id)
    
    if status_filter:
        query = query.where(Postcard.status == status_filter)
    
    # Get total count
    count_result = await db.execute(
        select(func.count()).select_from(query.subquery())
    )
    total = count_result.scalar()
    
    # Get paginated results with relationships
    result = await db.execute(
        query.options(selectinload(Postcard.recipient))
        .order_by(desc(Postcard.created_at))
        .offset(skip)
        .limit(limit)
    )
    postcards = result.scalars().all()
    
    return PostcardListResponse(postcards=postcards, total=total)


@app.get("/postcards/{postcard_id}", response_model=PostcardResponse, tags=["Postcards"])
async def get_postcard(postcard_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get a specific postcard by ID."""
    result = await db.execute(
        select(Postcard)
        .options(selectinload(Postcard.recipient))
        .where(Postcard.id == postcard_id)
    )
    postcard = result.scalar_one_or_none()
    
    if not postcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Postcard with ID {postcard_id} not found",
        )
    
    return postcard


@app.put("/postcards/{postcard_id}", response_model=PostcardResponse, tags=["Postcards"])
async def update_postcard(
    postcard_id: uuid.UUID,
    postcard_data: PostcardUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a postcard."""
    result = await db.execute(
        select(Postcard)
        .options(selectinload(Postcard.recipient))
        .where(Postcard.id == postcard_id)
    )
    postcard = result.scalar_one_or_none()
    
    if not postcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Postcard with ID {postcard_id} not found",
        )
    
    # Check if postcard can be updated
    if postcard.status == PostcardStatus.SENT.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update a postcard that has already been sent",
        )
    
    # Validate template if provided
    if postcard_data.template_id:
        template_result = await db.execute(
            select(Template).where(Template.id == postcard_data.template_id)
        )
        if not template_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Template with ID {postcard_data.template_id} not found",
            )
    
    # Update fields
    if postcard_data.title is not None:
        postcard.title = postcard_data.title
    if postcard_data.message is not None:
        postcard.message = postcard_data.message
    if postcard_data.image_url is not None:
        postcard.image_url = postcard_data.image_url
    if postcard_data.template_id is not None:
        postcard.template_id = postcard_data.template_id
    
    postcard.updated_at = datetime.utcnow()
    
    # Update recipient if provided
    if postcard_data.recipient:
        if postcard.recipient:
            # Update existing recipient
            if postcard_data.recipient.name is not None:
                postcard.recipient.name = postcard_data.recipient.name
            if postcard_data.recipient.address_line1 is not None:
                postcard.recipient.address_line1 = postcard_data.recipient.address_line1
            if postcard_data.recipient.address_line2 is not None:
                postcard.recipient.address_line2 = postcard_data.recipient.address_line2
            if postcard_data.recipient.city is not None:
                postcard.recipient.city = postcard_data.recipient.city
            if postcard_data.recipient.state is not None:
                postcard.recipient.state = postcard_data.recipient.state
            if postcard_data.recipient.postal_code is not None:
                postcard.recipient.postal_code = postcard_data.recipient.postal_code
            if postcard_data.recipient.country is not None:
                postcard.recipient.country = postcard_data.recipient.country
        else:
            # Create new recipient
            recipient = Recipient(
                postcard_id=postcard.id,
                name=postcard_data.recipient.name or "",
                address_line1=postcard_data.recipient.address_line1 or "",
                address_line2=postcard_data.recipient.address_line2,
                city=postcard_data.recipient.city or "",
                state=postcard_data.recipient.state,
                postal_code=postcard_data.recipient.postal_code or "",
                country=postcard_data.recipient.country or "",
            )
            db.add(recipient)
    
    await db.commit()
    await db.refresh(postcard)
    return postcard


@app.delete("/postcards/{postcard_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Postcards"])
async def delete_postcard(postcard_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Delete a postcard."""
    result = await db.execute(select(Postcard).where(Postcard.id == postcard_id))
    postcard = result.scalar_one_or_none()
    
    if not postcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Postcard with ID {postcard_id} not found",
        )
    
    await db.delete(postcard)
    await db.commit()
    return None


@app.post("/postcards/{postcard_id}/send", response_model=PostcardSendResponse, tags=["Postcards"])
async def send_postcard(postcard_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Mark a postcard as sent."""
    result = await db.execute(
        select(Postcard)
        .options(selectinload(Postcard.recipient))
        .where(Postcard.id == postcard_id)
    )
    postcard = result.scalar_one_or_none()
    
    if not postcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Postcard with ID {postcard_id} not found",
        )
    
    # Check if postcard can be sent
    if postcard.status == PostcardStatus.SENT.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Postcard has already been sent",
        )
    
    # Validate that recipient exists
    if not postcard.recipient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send postcard without recipient information",
        )
    
    # Update status
    postcard.status = PostcardStatus.SENT.value
    postcard.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(postcard)
    
    return PostcardSendResponse(
        id=postcard.id,
        status=postcard.status,
        message="Postcard marked as sent successfully",
    )


# ============== Upload Endpoints ==============

def get_file_extension(filename: str) -> str:
    """Extract file extension from filename."""
    return Path(filename).suffix.lower()


@app.post("/upload", response_model=UploadResponse, tags=["Upload"])
async def upload_image(
    file: UploadFile = File(...),
):
    """Upload an image file (PNG/JPG)."""
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )
    
    # Validate file extension
    file_ext = get_file_extension(file.filename)
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024 * 1024):.1f}MB",
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )
    
    # Construct URL (in production, this would be a proper URL)
    file_url = f"/uploads/{unique_filename}"
    
    return UploadResponse(
        filename=unique_filename,
        url=file_url,
        content_type=file.content_type,
        size=len(content),
    )


# ============== Reference Image Endpoints ==============

@app.post("/postcards/{postcard_id}/references", response_model=ReferenceImageResponse, status_code=status.HTTP_201_CREATED, tags=["Reference Images"])
async def upload_reference_image(
    postcard_id: uuid.UUID,
    image_type: str = Query(..., description="Type of reference image: character, scene, event, or style"),
    description: Optional[str] = Query(None, description="Optional description of the reference image"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a reference image for a postcard."""
    # Validate image type
    if image_type not in ["character", "scene", "event", "style"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image_type. Allowed values: character, scene, event, style",
        )
    
    # Check if postcard exists
    result = await db.execute(
        select(Postcard).where(Postcard.id == postcard_id)
    )
    postcard = result.scalar_one_or_none()
    
    if not postcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Postcard with ID {postcard_id} not found",
        )
    
    # Validate content type
    if file.content_type not in REFERENCE_ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed types: {', '.join(REFERENCE_ALLOWED_CONTENT_TYPES)}",
        )
    
    # Validate file extension
    file_ext = get_file_extension(file.filename)
    if file_ext not in REFERENCE_ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed: {', '.join(REFERENCE_ALLOWED_EXTENSIONS)}",
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if len(content) > MAX_REFERENCE_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_REFERENCE_FILE_SIZE / (1024 * 1024):.1f}MB",
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = REFERENCE_UPLOAD_DIR / unique_filename
    
    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )
    
    # Create database record
    reference_image = ReferenceImage(
        postcard_id=postcard_id,
        image_path=str(file_path),
        image_type=ReferenceImageType(image_type),
        description=description,
    )
    db.add(reference_image)
    await db.commit()
    await db.refresh(reference_image)
    
    return reference_image


@app.get("/postcards/{postcard_id}/references", response_model=ReferenceImageList, tags=["Reference Images"])
async def list_reference_images(
    postcard_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """List all reference images for a postcard."""
    # Check if postcard exists
    result = await db.execute(
        select(Postcard).where(Postcard.id == postcard_id)
    )
    postcard = result.scalar_one_or_none()
    
    if not postcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Postcard with ID {postcard_id} not found",
        )
    
    # Get reference images
    result = await db.execute(
        select(ReferenceImage).where(ReferenceImage.postcard_id == postcard_id)
    )
    reference_images = result.scalars().all()
    
    return ReferenceImageList(reference_images=reference_images, total=len(reference_images))


@app.get("/references/{reference_id}", response_model=ReferenceImageResponse, tags=["Reference Images"])
async def get_reference_image(
    reference_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single reference image by ID."""
    result = await db.execute(
        select(ReferenceImage).where(ReferenceImage.id == reference_id)
    )
    reference_image = result.scalar_one_or_none()
    
    if not reference_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reference image with ID {reference_id} not found",
        )
    
    return reference_image


@app.delete("/references/{reference_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Reference Images"])
async def delete_reference_image(
    reference_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a reference image."""
    result = await db.execute(
        select(ReferenceImage).where(ReferenceImage.id == reference_id)
    )
    reference_image = result.scalar_one_or_none()
    
    if not reference_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reference image with ID {reference_id} not found",
        )
    
    # Delete the file from disk
    try:
        file_path = Path(reference_image.image_path)
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Warning: Failed to delete file {reference_image.image_path}: {e}")
    
    await db.delete(reference_image)
    await db.commit()
    
    return None


# ============== Main Entry Point ==============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
