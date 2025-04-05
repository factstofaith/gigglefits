#!/usr/bin/env python
"""
Create Admin Account Script

This script creates an admin account with the option to bypass MFA.
It's particularly useful for creating test and development admin accounts
that don't need to go through MFA verification.
"""

import sys
import os
import argparse
from datetime import datetime
import uuid

# Add parent directory to path to import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.base import SessionLocal
from db.models import User, UserRole, UserAccountStatus, AuthProvider
from core.auth import get_password_hash

def create_admin_user(username, password, name, bypass_mfa=True):
    """Create an admin user with optional MFA bypass"""
    db = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            print(f"User {username} already exists.")
            return
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            username=username,
            email=username,
            name=name,
            role=UserRole.ADMIN,
            auth_provider=AuthProvider.LOCAL,
            hashed_password=get_password_hash(password),
            is_active=True,
            account_status=UserAccountStatus.ACTIVE,
            bypass_mfa=bypass_mfa,
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(user)
        db.commit()
        print(f"Admin user {username} created successfully.")
        print(f"MFA bypass: {bypass_mfa}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create admin user")
    parser.add_argument("--username", required=True, help="Admin username (email)")
    parser.add_argument("--password", required=True, help="Admin password")
    parser.add_argument("--name", required=True, help="Admin name")
    parser.add_argument("--bypass-mfa", action="store_true", help="Bypass MFA for this admin")
    
    args = parser.parse_args()
    create_admin_user(args.username, args.password, args.name, args.bypass_mfa)