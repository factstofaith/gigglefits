"""
API Adapter for testing API endpoints
"""

from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from datetime import datetime, timezone
import uuid

from db.models import User
from core.auth import get_current_active_user

class APITestAdapter:
    """Test adapter for API endpoints and controller testing"""
    
    def __init__(self):
        """Initialize the API test adapter"""
        # Set up mock user for authentication
        self.mock_user = User(
            id="admin-123",
            username="admin",
            email="admin@example.com",
            name="Admin User",
            role="super_admin",
            tenant_id="tenant-123",
            is_active=True
        )
    
    async def mock_get_current_active_user(self):
        """Mock current user dependency"""
        return self.mock_user
    
    def setup_app(self, app: FastAPI, router, auth_dependency=None, other_dependencies=None):
        """Set up a FastAPI test app with authentication overrides"""
        # Include the router
        app.include_router(router)
        
        # Set up dependency overrides
        app.dependency_overrides = {}
        
        # Override get_current_active_user dependency
        app.dependency_overrides[get_current_active_user] = self.mock_get_current_active_user
        
        # Override auth dependency if provided
        if auth_dependency:
            app.dependency_overrides[auth_dependency] = self.mock_get_current_active_user
        
        # Add any other dependency overrides
        if other_dependencies:
            for dep_name, mock_func in other_dependencies.items():
                app.dependency_overrides[dep_name] = mock_func
        
        # Create a test client
        return TestClient(app)
    
    def get_mock_tenant(self, tenant_id=None, status="active", tier="standard"):
        """Get a mock tenant object for testing"""
        if not tenant_id:
            tenant_id = str(uuid.uuid4())
            
        created_at = datetime.now(timezone.utc)
        updated_at = datetime.now(timezone.utc)
        
        return {
            "id": tenant_id,
            "name": "Test Tenant",
            "description": "Test tenant for API tests",
            "status": status,
            "tier": tier,
            "settings": {"allowed_users": 5},
            "created_at": created_at,
            "updated_at": updated_at
        }
    
    def get_mock_application(self, app_id=1, status="active"):
        """Get a mock application object for testing"""
        created_at = datetime.now(timezone.utc)
        updated_at = datetime.now(timezone.utc)
        
        return {
            "id": app_id,
            "name": "Test App",
            "description": "Test application",
            "type": "api",
            "status": status,
            "created_at": created_at,
            "updated_at": updated_at,
            "created_by": "admin-123",
            "auth_type": "none",
            "logo_url": None,
            "documentation_url": None,
            "support_url": None,
            "is_public": False,
            "connection_parameters": []
        }
    
    def get_mock_dataset(self, dataset_id=1, status="active"):
        """Get a mock dataset object for testing"""
        created_at = datetime.now(timezone.utc)
        updated_at = datetime.now(timezone.utc)
        
        return {
            "id": dataset_id,
            "name": "Test Dataset",
            "description": "Test dataset",
            "status": status,
            "created_at": created_at,
            "updated_at": updated_at,
            "created_by": "admin-123",
            "source_application_id": None,
            "fields": [],
            "connection_parameters": [],
            "sample_data": None,
            "documentation_url": None,
            "is_public": False
        }
    
    def get_mock_webhook(self, webhook_id=1, status="active"):
        """Get a mock webhook object for testing"""
        created_at = datetime.now(timezone.utc)
        updated_at = datetime.now(timezone.utc)
        
        return {
            "id": webhook_id,
            "name": "Test Webhook",
            "url": "https://example.com/webhook",
            "description": "Test webhook",
            "status": status,
            "auth_type": "none",
            "auth_credentials": None,
            "headers": {"Content-Type": "application/json"},
            "events": ["integration.run.completed"],
            "filters": None,
            "integration_id": None,
            "tenant_id": "tenant-123",
            "secret_key": None,
            "is_secure": True,
            "timeout_seconds": 5,
            "retry_count": 3,
            "retry_interval_seconds": 60,
            "owner_id": "admin-123",
            "created_at": created_at,
            "updated_at": updated_at,
            "last_triggered_at": None
        }
    
    def get_mock_webhook_log(self, log_id=1, webhook_id=1, is_success=True):
        """Get a mock webhook log object for testing"""
        created_at = datetime.now(timezone.utc)
        completed_at = datetime.now(timezone.utc)
        
        return {
            "id": log_id,
            "webhook_id": webhook_id,
            "event_type": "integration.run.completed",
            "payload": {"integration_id": 1, "status": "completed"},
            "response_status_code": 200 if is_success else 500,
            "response_body": "OK" if is_success else "Internal Server Error",
            "is_success": is_success,
            "error_message": None if is_success else "Connection error",
            "attempt_count": 1,
            "created_at": created_at,
            "completed_at": completed_at
        }
    
    def get_mock_association(self, tenant_id, item_id, item_type="application"):
        """Get a mock association object for testing"""
        created_at = datetime.now(timezone.utc)
        
        if item_type == "application":
            return {
                "tenant_id": tenant_id,
                "application_id": item_id,
                "is_active": True,
                "granted_at": created_at,
                "granted_by": "admin-123"
            }
        else:  # dataset
            return {
                "tenant_id": tenant_id,
                "dataset_id": item_id,
                "is_active": True,
                "granted_at": created_at,
                "granted_by": "admin-123"
            }