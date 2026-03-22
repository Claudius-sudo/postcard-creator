# Postcard Creator Backend

FastAPI backend for the postcard creator application.

## Features

- ✅ FastAPI with async support
- ✅ PostgreSQL integration using SQLAlchemy + asyncpg
- ✅ Pydantic models for validation
- ✅ File upload handling for images (PNG/JPG)
- ✅ CORS enabled for frontend communication
- ✅ Comprehensive error handling
- ✅ Production-ready structure

## Project Structure

```
backend/
├── main.py           # FastAPI application with all endpoints
├── models.py         # SQLAlchemy database models
├── schemas.py        # Pydantic validation schemas
├── database.py       # Database connection handling
├── requirements.txt  # Python dependencies
└── README.md         # This file
```

## Database Schema

### Users
- `id` (UUID, PK)
- `email` (String, unique)
- `name` (String)
- `created_at` (DateTime)

### Templates
- `id` (UUID, PK)
- `name` (String)
- `preview_url` (String)
- `config` (JSONB)
- `created_at` (DateTime)

### Postcards
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `template_id` (UUID, FK, nullable)
- `title` (String)
- `message` (Text)
- `image_url` (String)
- `status` (String: draft/ready/sent)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### Recipients
- `id` (UUID, PK)
- `postcard_id` (UUID, FK)
- `name` (String)
- `address_line1` (String)
- `address_line2` (String, nullable)
- `city` (String)
- `state` (String, nullable)
- `postal_code` (String)
- `country` (String)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/templates` | List all templates |
| GET | `/templates/{id}` | Get specific template |
| POST | `/postcards` | Create new postcard |
| GET | `/postcards` | List user's postcards |
| GET | `/postcards/{id}` | Get specific postcard |
| PUT | `/postcards/{id}` | Update postcard |
| DELETE | `/postcards/{id}` | Delete postcard |
| POST | `/upload` | Upload image file |
| POST | `/postcards/{id}/send` | Mark as sent |

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
export DATABASE_URL="postgresql+asyncpg://user:password@localhost/postcard_db"
export UPLOAD_DIR="/app/uploads"  # Optional, defaults to /app/uploads
```

### 3. Run the Application

Development:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Production:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Image Upload

- **Max file size**: 5MB
- **Allowed types**: PNG, JPG, JPEG
- **Storage**: Files are saved to `/app/uploads/` with UUID-based filenames
- **URL format**: `/uploads/{uuid}.{ext}`

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (deleted)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Notes

- The current implementation creates a default user for demo purposes. In production, integrate with proper authentication (OAuth2, JWT, etc.)
- CORS is currently configured to allow all origins (`["*"]`). Configure appropriately for production.
- Database tables are auto-created on startup via `init_db()`.
