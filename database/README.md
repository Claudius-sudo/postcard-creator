# Alembic Database Migrations

This directory contains Alembic migration scripts for database schema management.

## Setup

1. Install Alembic:
   ```bash
   pip install alembic
   ```

2. Initialize Alembic (if not already done):
   ```bash
   alembic init migrations
   ```

3. Configure `alembic.ini` with your database URL

## Common Commands

- Create a new migration:
  ```bash
  alembic revision --autogenerate -m "description"
  ```

- Apply migrations:
  ```bash
  alembic upgrade head
  ```

- Rollback one migration:
  ```bash
  alembic downgrade -1
  ```

- View current version:
  ```bash
  alembic current
  ```

## Migration Script

The initial schema is created by `/docker-entrypoint-initdb.d/01_init.sql` when the PostgreSQL container starts.

For future schema changes, use Alembic migrations.
