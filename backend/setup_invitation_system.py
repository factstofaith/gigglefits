#!/usr/bin/env python
"""
Setup script for the User Invitation System

This script sets up the necessary database tables and adds required dependencies
for the user invitation system.
"""

import os
import sys
import logging
from sqlalchemy import create_engine, inspect
from sqlalchemy.engine import reflection
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database URL from environment or use default SQLite database
DB_URL = os.environ.get('DATABASE_URL', 'sqlite:///./backend/tap_local.db')

def setup_database():
    """Setup the database tables for the user invitation system"""
    from db.base import Base
    from db.models import (
        User, UserRole, Invitation, UserMFA, UserLoginHistory, 
        EmailConfiguration, EmailTemplate, MFASettings,
        InvitationStatus, UserAccountStatus, AuthProvider
    )
    
    logger.info(f"Using database: {DB_URL}")
    
    # Create engine
    engine = create_engine(DB_URL)
    
    # Create inspector
    inspector = inspect(engine)
    
    # Check if tables exist
    existing_tables = inspector.get_table_names()
    logger.info(f"Existing tables: {existing_tables}")
    
    # Create missing tables
    tables_to_create = []
    
    # Check for Invitation table
    if 'invitations' not in existing_tables:
        logger.info("Creating 'invitations' table")
        tables_to_create.append(Invitation.__table__)
    
    # Check for UserMFA table
    if 'user_mfa' not in existing_tables:
        logger.info("Creating 'user_mfa' table")
        tables_to_create.append(UserMFA.__table__)
    
    # Check for UserLoginHistory table
    if 'user_login_history' not in existing_tables:
        logger.info("Creating 'user_login_history' table")
        tables_to_create.append(UserLoginHistory.__table__)
    
    # Check for EmailConfiguration table
    if 'email_configuration' not in existing_tables:
        logger.info("Creating 'email_configuration' table")
        tables_to_create.append(EmailConfiguration.__table__)
    
    # Check for EmailTemplate table
    if 'email_templates' not in existing_tables:
        logger.info("Creating 'email_templates' table")
        tables_to_create.append(EmailTemplate.__table__)
    
    # Check for MFASettings table
    if 'mfa_settings' not in existing_tables:
        logger.info("Creating 'mfa_settings' table")
        tables_to_create.append(MFASettings.__table__)
    
    # Create tables if needed
    if tables_to_create:
        Base.metadata.create_all(engine, tables=tables_to_create)
        logger.info("Created new tables")
    else:
        logger.info("All required tables already exist")
    
    # Add columns to existing tables
    add_columns_to_user_table(engine)
    
    # Create default MFA settings if not exist
    create_default_mfa_settings(engine)
    
    # Create default email templates
    create_default_email_templates(engine)
    
    logger.info("Database setup complete!")

def add_columns_to_user_table(engine):
    """Add new columns to user table if they don't exist"""
    inspector = inspect(engine)
    
    if 'users' not in inspector.get_table_names():
        logger.warning("Users table doesn't exist! Cannot add columns.")
        return
    
    # Get existing columns
    existing_columns = [col['name'] for col in inspector.get_columns('users')]
    logger.info(f"Existing user columns: {existing_columns}")
    
    # Define columns to add
    columns_to_add = {
        'zoho_account': 'VARCHAR(100)',
        'client_company': 'VARCHAR(100)',
        'contact_information': 'JSON',
        'invite_id': 'VARCHAR(36)',
        'account_status': 'VARCHAR(20)',
        'auth_provider': 'VARCHAR(20)',
        'last_login': 'TIMESTAMP',
        'login_attempts': 'INTEGER DEFAULT 0'
    }
    
    connection = engine.connect()
    
    # Add missing columns
    for column_name, column_type in columns_to_add.items():
        if column_name not in existing_columns:
            try:
                connection.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
                logger.info(f"Added column '{column_name}' to users table")
            except Exception as e:
                logger.error(f"Error adding column '{column_name}': {str(e)}")
    
    connection.close()

def create_default_mfa_settings(engine):
    """Create default MFA settings if they don't exist"""
    from db.models import MFASettings
    
    # Create session
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Check if default MFA settings exist
    default_settings = session.query(MFASettings).filter(MFASettings.tenant_id.is_(None)).first()
    
    if not default_settings:
        # Create default settings
        default_settings = MFASettings(
            enforcement_type="optional",
            grace_period_days=7,
            totp_enabled=True,
            email_enabled=False,
            sms_enabled=False,
            recovery_codes_enabled=True,
            recovery_codes_count=10,
            recovery_code_length=8
        )
        session.add(default_settings)
        session.commit()
        logger.info("Created default MFA settings")
    else:
        logger.info("Default MFA settings already exist")
    
    session.close()

def create_default_email_templates(engine):
    """Create default email templates if they don't exist"""
    from db.models import EmailTemplate
    
    # Create session
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Define default templates
    default_templates = [
        {
            'name': 'invitation_email',
            'subject': 'Invitation to TAP Integration Platform',
            'html_content': '''
                <html>
                <body>
                    <h1>You've been invited to join TAP Integration Platform</h1>
                    <p>Hello,</p>
                    <p>{{inviter_name}} has invited you to join the TAP Integration Platform.</p>
                    <p>Please click the button below to accept the invitation:</p>
                    <a href="{{invitation_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
                    <p>This invitation will expire on {{expiration_date}}.</p>
                    <p>If you have any questions, please contact the administrator.</p>
                    <p>Regards,<br>TAP Integration Platform Team</p>
                </body>
                </html>
            ''',
            'text_content': '''
                You've been invited to join TAP Integration Platform
                
                Hello,
                
                {{inviter_name}} has invited you to join the TAP Integration Platform.
                
                Please click the link below to accept the invitation:
                {{invitation_url}}
                
                This invitation will expire on {{expiration_date}}.
                
                If you have any questions, please contact the administrator.
                
                Regards,
                TAP Integration Platform Team
            '''
        },
        {
            'name': 'reset_mfa_email',
            'subject': 'MFA has been reset for your account',
            'html_content': '''
                <html>
                <body>
                    <h1>MFA has been reset for your account</h1>
                    <p>Hello {{user_name}},</p>
                    <p>The Multi-Factor Authentication (MFA) for your account has been reset by an administrator.</p>
                    <p>If you did not request this action, please contact the system administrator immediately.</p>
                    <p>You can re-enable MFA by visiting your account security settings:</p>
                    <a href="{{security_url}}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Security Settings</a>
                    <p>Regards,<br>TAP Integration Platform Team</p>
                </body>
                </html>
            ''',
            'text_content': '''
                MFA has been reset for your account
                
                Hello {{user_name}},
                
                The Multi-Factor Authentication (MFA) for your account has been reset by an administrator.
                
                If you did not request this action, please contact the system administrator immediately.
                
                You can re-enable MFA by visiting your account security settings:
                {{security_url}}
                
                Regards,
                TAP Integration Platform Team
            '''
        }
    ]
    
    # Add templates if they don't exist
    for template_data in default_templates:
        # Check if template exists
        existing_template = session.query(EmailTemplate).filter_by(
            name=template_data['name'],
            tenant_id=None
        ).first()
        
        if not existing_template:
            # Create template
            template = EmailTemplate(
                name=template_data['name'],
                subject=template_data['subject'],
                html_content=template_data['html_content'],
                text_content=template_data['text_content'],
                tenant_id=None
            )
            session.add(template)
            logger.info(f"Created default email template: {template_data['name']}")
    
    session.commit()
    session.close()

if __name__ == "__main__":
    try:
        setup_database()
    except Exception as e:
        logger.error(f"Error setting up database: {str(e)}")
        sys.exit(1)