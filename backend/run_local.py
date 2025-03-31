#!/usr/bin/env python
"""
Local development server for TAP Integration Platform.
This script sets up a SQLite database and starts the API server.
"""

import os
import sys
import logging
from pathlib import Path

# Add the current directory to the path
sys.path.append(str(Path(__file__).resolve().parent))

# Setup environment variables for local development
os.environ["APP_ENVIRONMENT"] = "development"
os.environ["DATABASE_URL"] = "sqlite:///tap_dev.db"
os.environ["DEBUG"] = "true"
os.environ["RELOAD"] = "true"
os.environ["CORS_ORIGINS"] = "http://localhost:3000"
os.environ["SECRET_KEY"] = "local_development_key_not_for_production"
os.environ["ADMIN_PASSWORD"] = "TAPintoAI!"
os.environ["DEMO_PASSWORD"] = "demo123"
os.environ["SEED_FORCE_OVERWRITE"] = "1"

# Import after setting environment variables
from db.base import Base, engine
from db.seed_db import seed_database
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

def setup_database():
    """Create database tables and seed initial data."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    logger.info("Seeding database...")
    seed_database()
    
    logger.info("Database setup completed!")

def main():
    """Main entry point for the local development server."""
    # Setup database
    setup_database()
    
    # Start API server
    logger.info("Starting API server...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()