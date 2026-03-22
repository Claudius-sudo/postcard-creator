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
from models import User, Template, Postcard, Recipient, PostcardStatus
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
)

# ============== Configuration ==============

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg"}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

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


# ============== Main Entry Point ==============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
