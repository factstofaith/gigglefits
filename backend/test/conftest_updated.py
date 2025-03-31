"""
Pytest configuration and fixtures for the TAP Integration Platform.

This file contains fixtures and configuration for running tests with pytest.
It sets up the test environment, database connections, and common test fixtures.

Author: TAP Integration Platform Team
"""

import os
import sys
import pytest
import logging
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from unittest.mock import MagicMock, patch
from typing import Generator, Dict, Any

# Add the backend directory to sys.path
backend_dir = Path(__file__).parent.parent.absolute()
sys.path.insert(0, str(backend_dir))

# Import application components
from main import app
from db.base import Base
from core.config import get_settings
from core.auth import get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test")


# Environment setup
def pytest_configure(config):
    """Set up test environment variables."""
    os.environ['TEST_MODE'] = 'true'
    os.environ['TEST_DATABASE_URL'] = 'sqlite:///test_db.sqlite'
    os.environ['JWT_SECRET_KEY'] = 'test_secret_key_for_jwt_tokens'
    os.environ['TEST_ADMIN_EMAIL'] = 'admin@test.com'
    os.environ['TEST_ADMIN_PASSWORD'] = 'admin123'
    os.environ['TEST_USER_EMAIL'] = 'user@test.com'
    os.environ['TEST_USER_PASSWORD'] = 'user123'
    os.environ['TEST_MFA_SECRET'] = 'ABCDEFGHIJKLMNOP'
    os.environ['MOCK_EMAIL_SERVER'] = 'true'
    os.environ['TEST_OAUTH_MOCK'] = 'true'
    
    # OAuth test configuration
    os.environ['TEST_OFFICE365_CLIENT_ID'] = 'mock_office365_client_id'
    os.environ['TEST_OFFICE365_CLIENT_SECRET'] = 'mock_office365_client_secret'
    os.environ['TEST_GMAIL_CLIENT_ID'] = 'mock_gmail_client_id'
    os.environ['TEST_GMAIL_CLIENT_SECRET'] = 'mock_gmail_client_secret'
    os.environ['TEST_OAUTH_REDIRECT_URI'] = 'http://localhost:8000/api/invitations/oauth/{provider}/callback'


# Database fixtures
@pytest.fixture(scope="session")
def engine():
    """Create a SQLAlchemy engine for the test database."""
    db_url = os.environ.get('TEST_DATABASE_URL', 'sqlite:///test_db.sqlite')
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    yield engine
    
    # Clean up - drop all tables
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(engine) -> Generator[Session, None, None]:
    """Create a SQLAlchemy session for tests."""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture(scope="function")
def mock_db_session() -> MagicMock:
    """Create a mock database session for tests."""
    mock_session = MagicMock()
    return mock_session


# API test fixtures
@pytest.fixture(scope="function")
def test_client() -> TestClient:
    """Create a FastAPI TestClient for API tests."""
    return TestClient(app)


@pytest.fixture(scope="function")
def mock_current_user() -> Dict[str, Any]:
    """Mock the current user for tests requiring authentication."""
    return {
        "id": "test-user-id",
        "email": "test@example.com",
        "role": "admin",
        "tenant_id": "test-tenant-id",
        "is_active": True,
        "is_superuser": True
    }


@pytest.fixture(scope="function")
def auth_token() -> str:
    """Create an authentication token for tests."""
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJ0ZW5hbnRfaWQiOiJ0ZXN0LXRlbmFudC1pZCIsImlzX2FjdGl2ZSI6dHJ1ZSwiaXNfc3VwZXJ1c2VyIjp0cnVlLCJleHAiOjk5OTk5OTk5OTl9.tMEdhA0TNhxIqB2vLjbBATCGS6wYMVRg2TdKtpZ9kXA"


@pytest.fixture(scope="function")
def auth_headers(auth_token) -> Dict[str, str]:
    """Create authentication headers for tests."""
    return {"Authorization": f"Bearer {auth_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="function", autouse=True)
def mock_auth(monkeypatch):
    """Mock authentication for all tests.
    
    This fixture automatically applies to all tests to prevent authentication errors.
    It can be disabled for specific tests that need to test auth failures.
    """
    # Define a mock current user function
    async def mock_get_current_user():
        return {
            "id": "test-user-id",
            "email": "test@example.com",
            "role": "admin",
            "tenant_id": "test-tenant-id",
            "is_active": True,
            "is_superuser": True
        }
    
    # Apply the mock
    monkeypatch.setattr("core.auth.get_current_user", mock_get_current_user)


# Service mocking
@pytest.fixture(scope="function")
def mock_services():
    """Setup mock services and restore them after the test."""
    try:
        from mock_injector import inject_all_mocks
        logger.info("Injecting mock services for tests...")
        restore_mocks = inject_all_mocks()
        yield
    finally:
        try:
            logger.info("Restoring original services...")
            restore_mocks()
        except Exception as e:
            logger.error(f"Error restoring original services: {e}")


# Test data fixtures
@pytest.fixture(scope="function")
def test_tenant():
    """Create a test tenant for testing."""
    return {
        "id": "test-tenant-id",
        "name": "Test Tenant",
        "domain": "test.com",
        "status": "active"
    }


@pytest.fixture(scope="function")
def test_user():
    """Create a test user for testing."""
    return {
        "id": "test-user-id",
        "email": "test@example.com",
        "role": "admin",
        "tenant_id": "test-tenant-id",
        "is_active": True,
        "is_superuser": True
    }


@pytest.fixture(scope="function")
def test_integration():
    """Create a test integration for testing."""
    return {
        "id": "test-integration-id",
        "name": "Test Integration",
        "description": "Test integration description",
        "status": "active",
        "tenant_id": "test-tenant-id",
        "created_by": "test-user-id"
    }