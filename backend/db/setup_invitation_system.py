"""
Script to set up the User Invitation System database tables
"""

import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.base import Base
from db.models import (
    Invitation, UserMFA, UserLoginHistory, EmailConfiguration,
    EmailTemplate, MFASettings, InvitationStatus, UserAccountStatus, 
    AuthProvider
)

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get database URL from environment or use default for local development
DB_URL = os.environ.get('DATABASE_URL', 'sqlite:///./tap_local.db')

def setup_invitation_system():
    """Create all tables for the invitation system"""
    logger.info(f"Setting up invitation system tables using {DB_URL}")
    
    # Create engine and tables
    engine = create_engine(DB_URL)
    
    # Create tables for User Invitation System if they don't exist
    logger.info("Creating invitation system tables...")
    
    # This will create all tables that inherit from Base
    Base.metadata.create_all(engine, 
        tables=[
            Invitation.__table__,
            UserMFA.__table__, 
            UserLoginHistory.__table__,
            EmailConfiguration.__table__,
            EmailTemplate.__table__,
            MFASettings.__table__
        ]
    )
    
    # Add new columns to User table if not already present
    logger.info("Adding new user fields...")
    conn = engine.connect()
    
    # Check and add zoho_account column
    try:
        conn.execute("SELECT zoho_account FROM users LIMIT 1")
        logger.info("zoho_account column already exists")
    except Exception:
        try:
            conn.execute("ALTER TABLE users ADD COLUMN zoho_account VARCHAR(100)")
            logger.info("Added zoho_account column")
        except Exception as e:
            logger.warning(f"Could not add zoho_account column: {e}")
    
    # Check and add client_company column
    try:
        conn.execute("SELECT client_company FROM users LIMIT 1")
        logger.info("client_company column already exists")
    except Exception:
        try:
            conn.execute("ALTER TABLE users ADD COLUMN client_company VARCHAR(100)")
            logger.info("Added client_company column")
        except Exception as e:
            logger.warning(f"Could not add client_company column: {e}")
    
    # Check and add contact_information column
    try:
        conn.execute("SELECT contact_information FROM users LIMIT 1")
        logger.info("contact_information column already exists")
    except Exception:
        try:
            conn.execute("ALTER TABLE users ADD COLUMN contact_information JSON")
            logger.info("Added contact_information column")
        except Exception as e:
            logger.warning(f"Could not add contact_information column: {e}")
    
    # Check and add invite_id column
    try:
        conn.execute("SELECT invite_id FROM users LIMIT 1")
        logger.info("invite_id column already exists")
    except Exception:
        try:
            conn.execute("ALTER TABLE users ADD COLUMN invite_id VARCHAR(36)")
            logger.info("Added invite_id column")
        except Exception as e:
            logger.warning(f"Could not add invite_id column: {e}")
    
    # Check and add account_status column
    try:
        conn.execute("SELECT account_status FROM users LIMIT 1")
        logger.info("account_status column already exists")
    except Exception:
        try:
            conn.execute("ALTER TABLE users ADD COLUMN account_status VARCHAR(20) DEFAULT 'active'")
            logger.info("Added account_status column")
        except Exception as e:
            logger.warning(f"Could not add account_status column: {e}")
    
    # Check and add auth_provider column
    try:
        conn.execute("SELECT auth_provider FROM users LIMIT 1")
        logger.info("auth_provider column already exists")
    except Exception:
        try:
            conn.execute("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'local'")
            logger.info("Added auth_provider column")
        except Exception as e:
            logger.warning(f"Could not add auth_provider column: {e}")
    
    # Check and add last_login column
    try:
        conn.execute("SELECT last_login FROM users LIMIT 1")
        logger.info("last_login column already exists")
    except Exception:
        try:
            conn.execute("ALTER TABLE users ADD COLUMN last_login TIMESTAMP")
            logger.info("Added last_login column")
        except Exception as e:
            logger.warning(f"Could not add last_login column: {e}")
    
    # Check and add login_attempts column
    try:
        conn.execute("SELECT login_attempts FROM users LIMIT 1")
        logger.info("login_attempts column already exists")
    except Exception:
        try:
            conn.execute("ALTER TABLE users ADD COLUMN login_attempts INTEGER DEFAULT 0")
            logger.info("Added login_attempts column")
        except Exception as e:
            logger.warning(f"Could not add login_attempts column: {e}")
    
    conn.close()
    
    logger.info("User Invitation System database setup complete.")

if __name__ == "__main__":
    setup_invitation_system()