#!/usr/bin/env python3
"""
Script to create an admin user for development testing.
"""

import os
import sys
import uuid
import hashlib
import json
from datetime import datetime, timedelta

# Add the parent directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set the encryption key environment variable
os.environ["ENCRYPTION_KEY"] = "TAP_DEV_KEY_DO_NOT_USE_IN_PRODUCTION"

# Import required modules
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from db.base import get_db_context, engine
from db.models import User, UserRole, UserAccountStatus, AuthProvider, UserMFA
from utils.encryption.crypto import initialize_encryption

# Initialize encryption
initialize_encryption()

def create_admin_user(db: Session, email: str, username: str, password: str, name: str):
    """
    Create an admin user for development testing
    """
    # Check if bypass_mfa column exists, if not, add it
    try:
        db.execute(text("SELECT bypass_mfa FROM users LIMIT 1"))
        has_bypass_column = True
    except Exception:
        has_bypass_column = False
        print("Adding bypass_mfa column to users table...")
        db.execute(text("ALTER TABLE users ADD COLUMN bypass_mfa BOOLEAN DEFAULT 0"))
        db.commit()
        print("Column added successfully.")
    
    # Check if user already exists
    try:
        existing_user = db.query(User).filter(User.email == email).first()
    except Exception as e:
        print(f"Error querying user: {str(e)}")
        # Try direct SQL query
        result = db.execute(text("SELECT id, email, username FROM users WHERE email = :email"), {"email": email})
        user_row = result.fetchone()
        if user_row:
            print(f"Found user via direct SQL: {user_row}")
            # Update using direct SQL
            db.execute(
                text("UPDATE users SET role = :role WHERE email = :email"),
                {"role": UserRole.ADMIN.value, "email": email}
            )
            if has_bypass_column:
                db.execute(
                    text("UPDATE users SET bypass_mfa = 1 WHERE email = :email"),
                    {"email": email}
                )
            db.commit()
            print(f"Updated existing user to admin with MFA bypass")
            return {"id": user_row.id, "email": user_row.email, "username": user_row.username}
        existing_user = None
    
    if existing_user:
        print(f"User with email {email} already exists.")
        
        # Update the user to be an admin with MFA bypass
        existing_user.role = UserRole.ADMIN
        
        if has_bypass_column:
            # Use direct SQL to update the bypass_mfa flag
            db.execute(
                text("UPDATE users SET bypass_mfa = 1 WHERE id = :user_id"),
                {"user_id": existing_user.id}
            )
        
        # Check if user has MFA record
        mfa = db.query(UserMFA).filter(UserMFA.user_id == existing_user.id).first()
        if not mfa:
            mfa = UserMFA(
                user_id=existing_user.id,
                mfa_enabled=False,
                mfa_verified=False,
                created_at=datetime.utcnow()
            )
            db.add(mfa)
        
        db.commit()
        
        print(f"Updated existing user to admin with MFA bypass")
        return existing_user

    # Generate a user ID
    user_id = str(uuid.uuid4())
    
    # Create simple password hash (for development only!)
    # In production, use a secure password hashing algorithm
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    # Create user via direct SQL to bypass ORM issues
    current_time = datetime.utcnow().isoformat()
    
    # Insert user with direct SQL
    db.execute(
        text("""
        INSERT INTO users (
            id, username, email, name, role, hashed_password, 
            is_active, account_status, auth_provider, created_at
        ) VALUES (
            :id, :username, :email, :name, :role, :password,
            :is_active, :account_status, :auth_provider, :created_at
        )
        """),
        {
            "id": user_id,
            "username": username,
            "email": email,
            "name": name,
            "role": UserRole.ADMIN.value,
            "password": hashed_password,
            "is_active": 1,
            "account_status": UserAccountStatus.ACTIVE.value,
            "auth_provider": AuthProvider.LOCAL.value,
            "created_at": current_time
        }
    )
    
    if has_bypass_column:
        # Set bypass_mfa flag
        db.execute(
            text("UPDATE users SET bypass_mfa = 1 WHERE id = :user_id"),
            {"user_id": user_id}
        )
    
    # Create MFA record
    db.execute(
        text("""
        INSERT INTO user_mfa (
            id, user_id, mfa_enabled, mfa_verified, created_at
        ) VALUES (
            :id, :user_id, :enabled, :verified, :created_at
        )
        """),
        {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "enabled": 0,
            "verified": 0,
            "created_at": current_time
        }
    )
    
    # Commit changes
    db.commit()
    
    print(f"Created admin user: {username} (ID: {user_id})")
    print(f"MFA bypass is enabled for this user")
    
    return {"id": user_id, "email": email, "username": username}

if __name__ == "__main__":
    # Admin user details
    admin_email = "admin@tapplatform.dev"
    admin_username = "admin"
    admin_password = "Admin123!"
    admin_name = "TAP Admin"
    
    # Create admin user
    with get_db_context() as db:
        created_user = create_admin_user(db, admin_email, admin_username, admin_password, admin_name)
        print(f"Admin user created successfully!")
        print(f"Login with:")
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print(f"MFA bypass is enabled for this account")