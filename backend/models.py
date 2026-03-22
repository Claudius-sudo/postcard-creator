import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON, Enum as SQLEnum, Integer, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum

from database import Base


class PostcardStatus(str, PyEnum):
    DRAFT = "draft"
    READY = "ready"
    SENT = "sent"


class ReferenceImageType(str, PyEnum):
    CHARACTER = "character"
    SCENE = "scene"
    EVENT = "event"
    STYLE = "style"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    picture_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    last_login = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    credits_remaining = Column(Integer, default=10, nullable=False)

    # Relationships
    postcards = relationship("Postcard", back_populates="user", cascade="all, delete-orphan")
    api_usage = relationship("ApiUsage", back_populates="user", cascade="all, delete-orphan")
    rate_limit = relationship("RateLimit", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    preview_url = Column(String(500), nullable=True)
    config = Column(JSONB, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    postcards = relationship("Postcard", back_populates="template")


class Postcard(Base):
    __tablename__ = "postcards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    status = Column(String(20), default=PostcardStatus.DRAFT.value, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="postcards")
    template = relationship("Template", back_populates="postcards")
    recipient = relationship("Recipient", back_populates="postcard", uselist=False, cascade="all, delete-orphan")
    reference_images = relationship("ReferenceImage", back_populates="postcard", cascade="all, delete-orphan")


class Recipient(Base):
    __tablename__ = "recipients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    postcard_id = Column(UUID(as_uuid=True), ForeignKey("postcards.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(255), nullable=False)
    state = Column(String(255), nullable=True)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False)

    # Relationships
    postcard = relationship("Postcard", back_populates="recipient")


class ReferenceImage(Base):
    __tablename__ = "reference_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    postcard_id = Column(UUID(as_uuid=True), ForeignKey("postcards.id", ondelete="CASCADE"), nullable=False, index=True)
    image_path = Column(String(500), nullable=False)
    image_type = Column(SQLEnum(ReferenceImageType), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    postcard = relationship("Postcard", back_populates="reference_images")


class ApiUsage(Base):
    __tablename__ = "api_usage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    endpoint = Column(String(255), nullable=False)
    tokens_used = Column(Integer, default=0, nullable=False)
    cost = Column(Numeric(10, 6), default=0.0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="api_usage")


class RateLimit(Base):
    __tablename__ = "rate_limits"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    requests_count = Column(Integer, default=0, nullable=False)
    window_start = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="rate_limit")
