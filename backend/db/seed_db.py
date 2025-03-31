"""
Database seeding script for development and testing

This script provides functions for seeding the database with initial data
for development, testing, and demonstration purposes.
"""

import sys
import os
from datetime import datetime, timedelta
import logging
import uuid
from pathlib import Path
from typing import Optional, Dict, Any

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Import database models
from db.base import Base, engine, SessionLocal, get_db_context
from db.models import (
    Integration, IntegrationType, IntegrationHealth, 
    FieldMapping, User, UserRole, UserAccountStatus, IntegrationRun, IntegrationRunStatus,
    Tag, Tenant, Application, ApplicationType, ApplicationStatus,
    Dataset, DatasetStatus
)
from core.auth import get_password_hash

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_database(config: Optional[Dict[str, Any]] = None):
    """
    Seed the database with initial data for development and testing.
    
    Args:
        config: Configuration object with database settings
    """
    logger.info("Seeding database with initial data...")
    
    # Configuration for database seeding
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    demo_password = os.environ.get("DEMO_PASSWORD", "demo123")
    tenant_count = int(os.environ.get("SEED_TENANT_COUNT", "1"))
    
    # Use the context manager to handle sessions
    with get_db_context() as db:
        # Check if data already exists
        user_count = db.query(User).count()
        if user_count > 0:
            logger.info("Database already contains data. Skipping basic seeding.")
            
            # Only continue if explicitly configured to overwrite
            if not os.environ.get("SEED_FORCE_OVERWRITE"):
                logger.info("Use SEED_FORCE_OVERWRITE=1 to force seeding")
                return
        
        logger.info("Preparing to seed database...")
        
        # Create or update demo tenant
        demo_tenant = db.query(Tenant).filter(Tenant.id == "demo-tenant").first()
        if not demo_tenant:
            demo_tenant = Tenant(
                id="demo-tenant",
                name="Demo Tenant",
                description="Demo tenant for development and testing",
                status="active",
                tier="standard",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(demo_tenant)
            db.commit()
            logger.info(f"Created demo tenant: {demo_tenant.name}")
        
        # Create or update admin user
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                id="admin",
                username="admin",
                email="admin@example.com",
                name="Admin User",
                role=UserRole.ADMIN,
                hashed_password=get_password_hash(admin_password),
                is_active=True,
                account_status=UserAccountStatus.ACTIVE,
                bypass_mfa=True,
                created_at=datetime.utcnow()
            )
            db.add(admin_user)
            db.commit()
            logger.info(f"Created admin user: {admin_user.username}")
            
        # Create or update ai-dev admin user
        ai_dev_user = db.query(User).filter(User.username == "ai-dev").first()
        if not ai_dev_user:
            ai_dev_user = User(
                id=str(uuid.uuid4()),
                username="ai-dev",
                email="ai-dev@example.com",
                name="AI Developer",
                role=UserRole.ADMIN,
                hashed_password=get_password_hash("TAPintoAI!"),
                is_active=True,
                account_status=UserAccountStatus.ACTIVE,
                bypass_mfa=True,
                created_at=datetime.utcnow()
            )
            db.add(ai_dev_user)
            db.commit()
            logger.info(f"Created ai-dev admin user: {ai_dev_user.username}")
        
        # Create or update demo user
        demo_user = db.query(User).filter(User.username == "demo").first()
        if not demo_user:
            demo_user = User(
                id="demo",
                username="demo",
                email="demo@example.com",
                name="Demo User",
                role=UserRole.USER,
                tenant_id=demo_tenant.id,
                hashed_password=get_password_hash(demo_password),
                is_active=True,
                account_status=UserAccountStatus.ACTIVE,
                created_at=datetime.utcnow()
            )
            db.add(demo_user)
            db.commit()
            logger.info(f"Created demo user: {demo_user.username}")
        
        # Create some tags
        hr_tag = Tag(name="HR")
        payroll_tag = Tag(name="Payroll")
        demo_tag = Tag(name="Demo")
        
        db.add_all([hr_tag, payroll_tag, demo_tag])
        db.commit()
        
        # Create some integrations
        now = datetime.utcnow()
        
        integration1 = Integration(
            name="Employee Demo",
            type=IntegrationType.API,
            source="Workday (HR)",
            destination="Kronos (Time)",
            description="Demo integration for HR data",
            tenant_id="demo-tenant",
            owner_id="demo",
            health=IntegrationHealth.HEALTHY,
            schedule={"type": "daily2am"},
            created_at=now - timedelta(days=7),
            updated_at=now - timedelta(days=2),
            last_run_at=now - timedelta(days=1),
            tags=[hr_tag, demo_tag]
        )
        
        integration2 = Integration(
            name="Time to Payroll",
            type=IntegrationType.API,
            source="7Shifts (Time)",
            destination="Paylocity (Payroll)",
            description="Integration for timesheet data",
            tenant_id="demo-tenant",
            owner_id="demo",
            health=IntegrationHealth.WARNING,
            schedule={"type": "weeklyFriday"},
            created_at=now - timedelta(days=10),
            updated_at=now - timedelta(days=3),
            last_run_at=now - timedelta(days=3),
            tags=[payroll_tag]
        )
        
        integration3 = Integration(
            name="File-based Blob Demo",
            type=IntegrationType.FILE,
            source="Azure Blob Container /employees",
            destination="Email: hr-dept@company.com",
            description="File-based integration demo",
            tenant_id="demo-tenant",
            owner_id="demo",
            health=IntegrationHealth.HEALTHY,
            schedule={"type": "daily6am"},
            azure_blob_config={
                "auth_method": "connectionString",
                "connection_string": "DefaultEndpointsProtocol=https;AccountName=demostore;AccountKey=xxxxxxxxxxx;EndpointSuffix=core.windows.net",
                "container_name": "employees",
                "file_pattern": "*.csv"
            },
            created_at=now - timedelta(days=5),
            updated_at=now - timedelta(days=1),
            last_run_at=now - timedelta(days=1),
            tags=[demo_tag]
        )
        
        db.add_all([integration1, integration2, integration3])
        db.commit()
        
        # Create some field mappings
        field_mapping1 = FieldMapping(
            integration_id=integration1.id,
            source_field="employee_id",
            destination_field="emp_id",
            transformation="direct",
            required=True,
            description="Employee ID mapping",
            created_at=now - timedelta(days=7),
            updated_at=now - timedelta(days=7)
        )
        
        field_mapping2 = FieldMapping(
            integration_id=integration1.id,
            source_field="first_name",
            destination_field="fname",
            transformation="direct",
            required=True,
            created_at=now - timedelta(days=7),
            updated_at=now - timedelta(days=7)
        )
        
        field_mapping3 = FieldMapping(
            integration_id=integration1.id,
            source_field="last_name",
            destination_field="lname",
            transformation="direct",
            required=True,
            created_at=now - timedelta(days=7),
            updated_at=now - timedelta(days=7)
        )
        
        field_mapping4 = FieldMapping(
            integration_id=integration2.id,
            source_field="employee_id",
            destination_field="employee_number",
            transformation="direct",
            required=True,
            created_at=now - timedelta(days=10),
            updated_at=now - timedelta(days=10)
        )
        
        field_mapping5 = FieldMapping(
            integration_id=integration2.id,
            source_field="hours_worked",
            destination_field="hours",
            transformation="direct",
            required=True,
            created_at=now - timedelta(days=10),
            updated_at=now - timedelta(days=10)
        )
        
        db.add_all([field_mapping1, field_mapping2, field_mapping3, field_mapping4, field_mapping5])
        db.commit()
        
        # Create some integration runs
        run1 = IntegrationRun(
            integration_id=integration1.id,
            status=IntegrationRunStatus.SUCCESS,
            start_time=now - timedelta(days=1, hours=2),
            end_time=now - timedelta(days=1, hours=1, minutes=55),
            records_processed=150
        )
        
        run2 = IntegrationRun(
            integration_id=integration1.id,
            status=IntegrationRunStatus.SUCCESS,
            start_time=now - timedelta(days=2, hours=2),
            end_time=now - timedelta(days=2, hours=1, minutes=56),
            records_processed=145
        )
        
        run3 = IntegrationRun(
            integration_id=integration2.id,
            status=IntegrationRunStatus.WARNING,
            start_time=now - timedelta(days=3, hours=2),
            end_time=now - timedelta(days=3, hours=1, minutes=59),
            records_processed=120,
            warnings=["5 records had missing fields"]
        )
        
        run4 = IntegrationRun(
            integration_id=integration3.id,
            status=IntegrationRunStatus.SUCCESS,
            start_time=now - timedelta(days=1, hours=6),
            end_time=now - timedelta(days=1, hours=5, minutes=58),
            records_processed=75
        )
        
        db.add_all([run1, run2, run3, run4])
        db.commit()
        
        logger.info("Database seeding completed successfully!")
    
        logger.info("Database seeding completed successfully!")

# Alias for backward compatibility
seed_db = seed_database

if __name__ == "__main__":
    # Create tables first
    Base.metadata.create_all(bind=engine)
    
    # Seed the database
    from core.config_factory import ConfigFactory, EnvironmentType
    
    # Determine environment
    environment = os.environ.get("APP_ENVIRONMENT", "development")
    try:
        env_type = EnvironmentType[environment.upper()]
        config = ConfigFactory.create_config(env_type)
        
        # Seed database
        seed_database(config)
    except ImportError:
        # Fallback if ConfigFactory is not available
        seed_database()