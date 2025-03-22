# Database Migrations

This directory will contain database migration scripts for the application.

In a real application, you would use a migration tool like Alembic to manage database schema changes.

## Migration Process

1. Create a new migration script
2. Apply the migration to update the database schema
3. Roll back the migration if needed

## Example Commands

```bash
# Create a new migration
alembic revision --autogenerate -m "Add user table"

# Apply migrations
alembic upgrade head

# Roll back one migration
alembic downgrade -1
```