from datetime import datetime
from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ============== Base Schemas ==============

class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ============== Auth Schemas ==============

class GoogleAuthRequest(BaseSchema):
    id_token: str = Field(..., description="Google ID token from OAuth flow")


class TokenResponse(BaseSchema):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserResponse"


# ============== User Schemas ==============

class UserBase(BaseSchema):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    pass


class UserResponse(BaseSchema):
    id: UUID
    google_id: str
    email: EmailStr
    name: str
    picture_url: Optional[str] = None
    created_at: datetime
    last_login: datetime
    is_active: bool
    credits_remaining: int


# ============== Template Schemas ==============

class TemplateBase(BaseSchema):
    name: str
    preview_url: Optional[str] = None
    config: dict = Field(default_factory=dict)


class TemplateCreate(TemplateBase):
    pass


class TemplateResponse(TemplateBase):
    id: UUID
    created_at: datetime


class TemplateListResponse(BaseSchema):
    templates: List[TemplateResponse]


# ============== Recipient Schemas ==============

class RecipientBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=255)
    address_line1: str = Field(..., min_length=1, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: str = Field(..., min_length=1, max_length=255)
    state: Optional[str] = Field(None, max_length=255)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: str = Field(..., min_length=1, max_length=100)


class RecipientCreate(RecipientBase):
    pass


class RecipientUpdate(RecipientBase):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address_line1: Optional[str] = Field(None, min_length=1, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=255)
    postal_code: Optional[str] = Field(None, min_length=1, max_length=20)
    country: Optional[str] = Field(None, min_length=1, max_length=100)


class RecipientResponse(RecipientBase):
    id: UUID
    postcard_id: UUID


# ============== Postcard Schemas ==============

class PostcardStatus:
    DRAFT = "draft"
    READY = "ready"
    SENT = "sent"


class PostcardBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=255)
    message: Optional[str] = None
    image_url: Optional[str] = None
    status: str = Field(default=PostcardStatus.DRAFT)


class PostcardCreate(BaseSchema):
    title: str = Field(..., min_length=1, max_length=255)
    message: Optional[str] = None
    image_url: Optional[str] = None
    template_id: Optional[UUID] = None
    recipient: Optional[RecipientCreate] = None


class PostcardUpdate(BaseSchema):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    message: Optional[str] = None
    image_url: Optional[str] = None
    template_id: Optional[UUID] = None
    recipient: Optional[RecipientUpdate] = None


class PostcardResponse(BaseSchema):
    id: UUID
    user_id: UUID
    template_id: Optional[UUID] = None
    title: str
    message: Optional[str] = None
    image_url: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    recipient: Optional[RecipientResponse] = None


class PostcardListResponse(BaseSchema):
    postcards: List[PostcardResponse]
    total: int


class PostcardSendResponse(BaseSchema):
    id: UUID
    status: str
    message: str


# ============== Reference Image Schemas ==============

class ReferenceImageType:
    CHARACTER = "character"
    SCENE = "scene"
    EVENT = "event"
    STYLE = "style"


class ReferenceImageCreate(BaseSchema):
    image_type: str = Field(..., pattern="^(character|scene|event|style)$")
    description: Optional[str] = None


class ReferenceImageResponse(BaseSchema):
    id: UUID
    postcard_id: UUID
    image_path: str
    image_type: str
    description: Optional[str] = None
    created_at: datetime


class ReferenceImageList(BaseSchema):
    reference_images: List[ReferenceImageResponse]
    total: int


# ============== Upload Schemas ==============

class UploadResponse(BaseSchema):
    filename: str
    url: str
    content_type: str
    size: int


# ============== Health Schemas ==============

class HealthResponse(BaseSchema):
    status: str
    version: str = "1.0.0"
    timestamp: datetime


# ============== Error Schemas ==============

class ErrorResponse(BaseSchema):
    detail: str
    error_code: Optional[str] = None


# ============== Credit Schemas ==============

class CreditResponse(BaseSchema):
    credits_remaining: int
    credits_used: int


# ============== API Usage Schemas ==============

class ApiUsageResponse(BaseSchema):
    id: UUID
    user_id: UUID
    endpoint: str
    tokens_used: int
    cost: Decimal
    created_at: datetime


class ApiUsageListResponse(BaseSchema):
    usage: List[ApiUsageResponse]
    total: int


# ============== Rate Limit Schemas ==============

class RateLimitResponse(BaseSchema):
    requests_count: int
    limit: int
    remaining: int
    window_start: datetime
    window_minutes: int
    resets_at: Optional[datetime] = None


# ============== Image Generation Schemas ==============

class ImageGenerateRequest(BaseSchema):
    prompt: str = Field(..., min_length=1, max_length=1000, description="Image generation prompt")
    width: Optional[int] = Field(default=1024, ge=256, le=2048)
    height: Optional[int] = Field(default=1024, ge=256, le=2048)
    postcard_id: Optional[UUID] = None


class ImageGenerateResponse(BaseSchema):
    image_url: str
    credits_remaining: int
    cost_credits: int
