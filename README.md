# Postcard Creator - DevOps Infrastructure

A full-stack postcard creation application with FastAPI backend, React frontend, and PostgreSQL database.

## Project Structure

```
postcard-creator/
├── backend/          # FastAPI application
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/         # Vite + React + TypeScript + Tailwind
│   ├── Dockerfile
│   ├── src/
│   │   ├── components/
│   │   │   ├── PostcardForm.tsx
│   │   │   └── PostcardList.tsx
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── database/         # Database initialization scripts
│   └── init/
│       └── 01_init.sql
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick Start

1. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

2. Start all services:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 5173 | Vite dev server with React |
| backend | 8000 | FastAPI application |
| postgres | 5432 | PostgreSQL database |

## Development

- Backend code changes auto-reload (uvicorn --reload)
- Frontend has hot module replacement (Vite HMR)
- Database persists in named volume `postgres_data`
- Image uploads persist in named volume `uploads_data`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| GET | `/postcards` | List all postcards |
| POST | `/postcards` | Create new postcard |
| GET | `/postcards/{id}` | Get postcard by ID |
| DELETE | `/postcards/{id}` | Delete postcard |

## Environment Variables

See `.env.example` for all available configuration options.
