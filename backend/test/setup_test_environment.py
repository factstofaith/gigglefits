#!/usr/bin/env python
"""
Setup script for the isolated test environment.

This script:
1. Creates an isolated test database
2. Sets up required environment variables
3. Generates test data
4. Verifies the test environment is correctly configured

Author: TAP Integration Platform Team
Date: March 28, 2025
"""

import os
import sys
import sqlite3
import argparse
import logging
from pathlib import Path
from datetime import datetime, timedelta
import uuid
import json
import base64
import secrets

# Configure logging
log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
logging.basicConfig(level=logging.INFO, format=log_format)
logger = logging.getLogger('test_environment_setup')

# Add the parent directory to the path to make imports work
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Setup test environment')
    parser.add_argument('--db-path', default='test_db.sqlite', help='Path to test database file')
    parser.add_argument('--env-file', default='.test.env', help='Path to test environment file')
    parser.add_argument('--reset', action='store_true', help='Reset existing test environment')
    return parser.parse_args()


def create_test_database(db_path, reset=False):
    """Create or reset the test database"""
    db_path = Path(db_path)
    
    # Delete existing database if reset is requested
    if reset and db_path.exists():
        logger.info(f"Removing existing database at {db_path}")
        db_path.unlink()
    
    # Create the database file with SQLite
    logger.info(f"Creating test database at {db_path}")
    conn = sqlite3.connect(db_path)
    
    # Create tables (this is a minimal schema for testing)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL,
            client_company TEXT,
            created_at TIMESTAMP NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS invitations (
            id INTEGER PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            token TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            inviter_id INTEGER NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            client_company TEXT,
            accepted_at TIMESTAMP,
            user_id INTEGER,
            FOREIGN KEY (inviter_id) REFERENCES users (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mfa_configuration (
            id INTEGER PRIMARY KEY,
            user_id INTEGER UNIQUE NOT NULL,
            secret TEXT NOT NULL,
            enabled BOOLEAN NOT NULL DEFAULT 0,
            backup_codes TEXT,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS login_history (
            id INTEGER PRIMARY KEY,
            user_id INTEGER NOT NULL,
            login_time TIMESTAMP NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            success BOOLEAN NOT NULL,
            mfa_used BOOLEAN NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Test database schema created successfully")
    return db_path


def generate_test_data(db_path):
    """Generate test data for the database"""
    logger.info(f"Generating test data in {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Current timestamp
    now = datetime.now()
    
    # Create admin user
    admin_id = 1
    cursor.execute(
        "INSERT OR REPLACE INTO users (id, email, password_hash, full_name, role, client_company, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            admin_id,
            "admin@test.com",
            "$2b$12$1234567890123456789012.1234567890123456789012345678901234",  # hashed "admin123"
            "Admin Test",
            "ADMIN",
            "Test Company",
            now
        )
    )
    
    # Create regular user
    user_id = 2
    cursor.execute(
        "INSERT OR REPLACE INTO users (id, email, password_hash, full_name, role, client_company, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            user_id,
            "user@test.com",
            "$2b$12$1234567890123456789012.1234567890123456789012345678901234",  # hashed "user123"
            "Test User",
            "USER",
            "Client Company",
            now
        )
    )
    
    # Create user with MFA enabled
    mfa_user_id = 3
    cursor.execute(
        "INSERT OR REPLACE INTO users (id, email, password_hash, full_name, role, client_company, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (
            mfa_user_id,
            "mfa@test.com",
            "$2b$12$1234567890123456789012.1234567890123456789012345678901234",  # hashed "mfa123"
            "MFA Test",
            "USER",
            "Test Company",
            now
        )
    )
    
    # Set up MFA for mfa_user
    mfa_secret = "ABCDEFGHIJKLMNOP"
    backup_codes = json.dumps(["12345678", "23456789", "34567890", "45678901", "56789012"])
    cursor.execute(
        "INSERT OR REPLACE INTO mfa_configuration (user_id, secret, enabled, backup_codes, created_at) VALUES (?, ?, ?, ?, ?)",
        (
            mfa_user_id,
            mfa_secret,
            True,
            backup_codes,
            now
        )
    )
    
    # Create active invitation
    active_token = str(uuid.uuid4())
    cursor.execute(
        "INSERT OR REPLACE INTO invitations (email, token, role, inviter_id, expires_at, client_company) VALUES (?, ?, ?, ?, ?, ?)",
        (
            "newuser@test.com",
            active_token,
            "USER",
            admin_id,
            now + timedelta(days=7),
            "Test Client"
        )
    )
    
    # Create expired invitation
    expired_token = str(uuid.uuid4())
    cursor.execute(
        "INSERT OR REPLACE INTO invitations (email, token, role, inviter_id, expires_at, client_company) VALUES (?, ?, ?, ?, ?, ?)",
        (
            "expired@test.com",
            expired_token,
            "USER",
            admin_id,
            now - timedelta(days=1),
            "Test Client"
        )
    )
    
    # Create accepted invitation
    accepted_token = str(uuid.uuid4())
    cursor.execute(
        "INSERT OR REPLACE INTO invitations (email, token, role, inviter_id, expires_at, client_company, accepted_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (
            "accepted@test.com",
            accepted_token,
            "USER",
            admin_id,
            now + timedelta(days=7),
            "Accepted Client",
            now - timedelta(hours=2),
            user_id
        )
    )
    
    # Add some login history
    cursor.execute(
        "INSERT INTO login_history (user_id, login_time, ip_address, user_agent, success, mfa_used) VALUES (?, ?, ?, ?, ?, ?)",
        (
            admin_id,
            now - timedelta(days=1),
            "127.0.0.1",
            "Test User Agent",
            True,
            False
        )
    )
    
    cursor.execute(
        "INSERT INTO login_history (user_id, login_time, ip_address, user_agent, success, mfa_used) VALUES (?, ?, ?, ?, ?, ?)",
        (
            mfa_user_id,
            now - timedelta(hours=2),
            "127.0.0.1",
            "Test User Agent",
            True,
            True
        )
    )
    
    conn.commit()
    conn.close()
    logger.info("Test data generated successfully")
    
    # Return important data for environment variables
    return {
        "admin_id": admin_id,
        "user_id": user_id,
        "mfa_user_id": mfa_user_id,
        "active_token": active_token,
        "mfa_secret": mfa_secret
    }


def create_environment_file(env_path, db_path, test_data):
    """Create a .env file for the test environment"""
    logger.info(f"Creating test environment file at {env_path}")
    
    # Generate JWT secret key
    jwt_secret = secrets.token_hex(32)
    
    env_content = f"""# Test Environment Configuration
# Generated on {datetime.now().isoformat()}

# Test Mode
TEST_MODE=true

# Database
TEST_DATABASE_URL=sqlite:///{db_path}
SQLALCHEMY_TRACK_MODIFICATIONS=false

# Authentication
JWT_SECRET_KEY={jwt_secret}
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60

# Test User Credentials
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=admin123
TEST_USER_EMAIL=user@test.com
TEST_USER_PASSWORD=user123
TEST_MFA_USER_EMAIL=mfa@test.com
TEST_MFA_USER_PASSWORD=mfa123

# Test IDs
TEST_ADMIN_ID={test_data["admin_id"]}
TEST_USER_ID={test_data["user_id"]}
TEST_MFA_USER_ID={test_data["mfa_user_id"]}

# Test Tokens
TEST_ACTIVE_INVITATION_TOKEN={test_data["active_token"]}

# MFA Testing
TEST_MFA_SECRET={test_data["mfa_secret"]}
TEST_MFA_RECOVERY_CODES=12345678,23456789,34567890,45678901,56789012

# Email Testing
MOCK_EMAIL_SERVER=true
TEST_EMAIL_RECIPIENT=test@example.com

# OAuth Testing
TEST_OAUTH_MOCK=true
TEST_OFFICE365_CLIENT_ID=mock_office365_client_id
TEST_OFFICE365_CLIENT_SECRET=mock_office365_client_secret
TEST_GMAIL_CLIENT_ID=mock_gmail_client_id
TEST_GMAIL_CLIENT_SECRET=mock_gmail_client_secret
TEST_OAUTH_REDIRECT_URI=http://localhost:8000/api/invitations/oauth/{{provider}}/callback
"""
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    logger.info(f"Environment file created at {env_path}")


def verify_test_environment(db_path, env_path):
    """Verify the test environment is correctly configured"""
    logger.info("Verifying test environment")
    
    # Check database exists
    db_file = Path(db_path)
    if not db_file.exists():
        logger.error(f"Database file {db_path} does not exist")
        return False
    
    # Check environment file exists
    env_file = Path(env_path)
    if not env_file.exists():
        logger.error(f"Environment file {env_path} does not exist")
        return False
    
    # Try connecting to the database and run a simple query
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        conn.close()
        logger.info(f"Database connection successful, found {user_count} users")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return False
    
    logger.info("Test environment verification completed successfully")
    return True


def main():
    """Main function to set up the test environment"""
    args = parse_arguments()
    
    db_path = os.path.join(SCRIPT_DIR, args.db_path)
    env_path = os.path.join(SCRIPT_DIR, args.env_file)
    
    # Create or reset the test database
    create_test_database(db_path, args.reset)
    
    # Generate test data
    test_data = generate_test_data(db_path)
    
    # Create environment file
    create_environment_file(env_path, db_path, test_data)
    
    # Verify the test environment
    if verify_test_environment(db_path, env_path):
        logger.info("Test environment setup completed successfully")
        return 0
    else:
        logger.error("Test environment setup failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())