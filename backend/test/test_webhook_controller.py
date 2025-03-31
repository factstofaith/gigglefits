"""
Tests for the webhook-related endpoints in the admin controller

This test uses the APITestAdapter to set up a test FastAPI app with mocked authentication
and service dependencies.
"""

from fastapi import FastAPI, Depends
import unittest
from unittest.mock import patch, MagicMock
import uuid
from datetime import datetime

from modules.admin.controller import router, get_admin_service, require_super_admin
from modules.admin.service import AdminService
from modules.admin.models import Webhook, WebhookCreate, WebhookUpdate, WebhookStatus, WebhookEventType

from test_adapters.api_adapter import APITestAdapter

class TestWebhookController(unittest.TestCase):
    """Test cases for webhook-related endpoints"""
    
    def setUp(self):
        """Set up test data and API test adapter"""
        self.api_adapter = APITestAdapter()
        
        # Create a test app
        app = FastAPI()
        
        # Create a MagicMock for the admin service
        self.mock_admin_service = MagicMock(spec=AdminService)
        
        # Set up dependency overrides with our API adapter
        self.client = self.api_adapter.setup_app(
            app=app,
            router=router,
            auth_dependency=require_super_admin,
            other_dependencies={
                get_admin_service: lambda: self.mock_admin_service
            }
        )
        
        # Set up test IDs
        self.webhook_id = 1
        
        # Get mock data from the adapter
        self.webhook_data = self.api_adapter.get_mock_webhook(webhook_id=self.webhook_id)
        self.webhook_log = self.api_adapter.get_mock_webhook_log(log_id=1, webhook_id=self.webhook_id)
        
    def test_get_webhooks(self):
        """Test GET /api/admin/webhooks endpoint"""
        # Setup mock response
        self.mock_admin_service.get_webhooks.return_value = [self.webhook_data]
        
        # Make request
        response = self.client.get("/api/admin/webhooks")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_webhooks.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(len(response_data), 1)
        self.assertEqual(response_data[0]["id"], self.webhook_id)
    
    def test_get_webhook(self):
        """Test GET /api/admin/webhooks/{webhook_id} endpoint"""
        # Setup mock response
        self.mock_admin_service.get_webhook.return_value = self.webhook_data
        
        # Make request
        response = self.client.get(f"/api/admin/webhooks/{self.webhook_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_webhook.assert_called_once_with(self.webhook_id)
        
        response_data = response.json()
        self.assertEqual(response_data["id"], self.webhook_id)
    
    def test_get_webhook_not_found(self):
        """Test GET /api/admin/webhooks/{webhook_id} with non-existent webhook"""
        # Setup mock response
        self.mock_admin_service.get_webhook.return_value = None
        
        # Make request
        response = self.client.get("/api/admin/webhooks/999")
        
        # Assertions
        self.assertEqual(response.status_code, 404)
        self.mock_admin_service.get_webhook.assert_called_once_with(999)
    
    def test_create_webhook(self):
        """Test POST /api/admin/webhooks endpoint"""
        # Setup mock response
        self.mock_admin_service.create_webhook.return_value = self.webhook_data
        
        # Prepare data
        create_data = {
            "name": "New Webhook",
            "url": "https://example.com/webhook",
            "description": "New webhook via API",
            "auth_type": "none",
            "events": ["integration.run.completed"],
            "headers": {"Content-Type": "application/json"},
            "timeout_seconds": 5
        }
        
        # Make request
        response = self.client.post("/api/admin/webhooks", json=create_data)
        
        # Assertions
        self.assertEqual(response.status_code, 201)
        self.assertTrue(self.mock_admin_service.create_webhook.called)
        args, kwargs = self.mock_admin_service.create_webhook.call_args
        
        response_data = response.json()
        self.assertEqual(response_data["id"], self.webhook_id)
    
    def test_update_webhook(self):
        """Test PUT /api/admin/webhooks/{webhook_id} endpoint"""
        # Create updated webhook data
        updated_webhook = self.webhook_data.copy()
        updated_webhook["name"] = "Updated Name"
        updated_webhook["status"] = "inactive"
        
        # Setup mock response
        self.mock_admin_service.update_webhook.return_value = updated_webhook
        
        # Prepare update data
        update_data = {
            "name": "Updated Name",
            "status": "inactive"
        }
        
        # Make request
        response = self.client.put(f"/api/admin/webhooks/{self.webhook_id}", json=update_data)
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.update_webhook.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(response_data["name"], "Updated Name")
        self.assertEqual(response_data["status"], "inactive")
    
    def test_delete_webhook(self):
        """Test DELETE /api/admin/webhooks/{webhook_id} endpoint"""
        # Setup mock response
        self.mock_admin_service.delete_webhook.return_value = True
        
        # Make request
        response = self.client.delete(f"/api/admin/webhooks/{self.webhook_id}")
        
        # Assertions
        self.assertEqual(response.status_code, 204)
        self.mock_admin_service.delete_webhook.assert_called_once_with(self.webhook_id)
    
    def test_get_webhook_logs(self):
        """Test GET /api/admin/webhooks/{webhook_id}/logs endpoint"""
        # Setup mock response
        self.mock_admin_service.get_webhook.return_value = self.webhook_data
        self.mock_admin_service.get_webhook_logs.return_value = [self.webhook_log]
        
        # Make request
        response = self.client.get(f"/api/admin/webhooks/{self.webhook_id}/logs")
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.get_webhook_logs.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(len(response_data), 1)
        self.assertEqual(response_data[0]["webhook_id"], self.webhook_id)
    
    def test_test_webhook(self):
        """Test POST /api/admin/webhooks/test endpoint"""
        # Setup mock response
        test_response = {
            "success": True,
            "status_code": 200,
            "response_body": "OK",
            "error_message": None,
            "request_duration_ms": 150
        }
        self.mock_admin_service.test_webhook.return_value = test_response
        
        # Prepare test request data
        test_data = {
            "url": "https://example.com/webhook",
            "auth_type": "none",
            "payload": {"test": True},
            "event_type": "integration.run.completed"
        }
        
        # Make request
        response = self.client.post("/api/admin/webhooks/test", json=test_data)
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.test_webhook.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(response_data["success"], True)
        self.assertEqual(response_data["status_code"], 200)
    
    @patch('modules.admin.controller.WebhookTestRequest')
    def test_test_existing_webhook(self, mock_webhook_test_request):
        """Test POST /api/admin/webhooks/{webhook_id}/test endpoint"""
        # Create a mock for WebhookTestRequest class
        mock_request_instance = MagicMock()
        mock_webhook_test_request.return_value = mock_request_instance
        
        # Setup test response
        test_response = {
            "success": True,
            "status_code": 200,
            "response_body": "OK",
            "error_message": None,
            "request_duration_ms": 150
        }
        self.mock_admin_service.test_webhook.return_value = test_response
        
        # Create a model-like webhook object that can be accessed via attributes
        mock_webhook = MagicMock()
        mock_webhook.id = self.webhook_id
        mock_webhook.url = "https://example.com/webhook"
        mock_webhook.auth_type = "none"
        mock_webhook.auth_credentials = None
        mock_webhook.headers = {"Content-Type": "application/json"}
        mock_webhook.events = ["integration.run.completed"]
        mock_webhook.integration_id = 1
        
        self.mock_admin_service.get_webhook.return_value = mock_webhook
        
        # Prepare a payload
        payload = {
            "integration_id": 1,
            "timestamp": datetime.now().isoformat(),
            "event": "integration.run.completed",
            "test": True
        }
        
        # Make request with event_type parameter and payload
        response = self.client.post(
            f"/api/admin/webhooks/{self.webhook_id}/test?event_type=integration.run.completed", 
            json=payload
        )
        
        # Assertions
        self.assertEqual(response.status_code, 200)
        self.mock_admin_service.test_webhook.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(response_data["success"], True)
        self.assertEqual(response_data["status_code"], 200)
    
    def test_trigger_event(self):
        """Test POST /api/admin/events/trigger endpoint"""
        # Setup mock response
        self.mock_admin_service.trigger_webhooks.return_value = 2  # 2 webhooks triggered
        
        # Prepare event data
        event_data = {
            "integration_id": 1,
            "status": "completed",
            "timestamp": datetime.now().isoformat()
        }
        
        # Make request with query params
        response = self.client.post(
            "/api/admin/events/trigger?event_type=integration.run.completed",
            json=event_data
        )
        
        # Assertions
        self.assertEqual(response.status_code, 202)
        self.mock_admin_service.trigger_webhooks.assert_called_once()
        
        response_data = response.json()
        self.assertEqual(response_data["webhooks_triggered"], 2)
        self.assertEqual(response_data["event_type"], "integration.run.completed")

if __name__ == "__main__":
    unittest.main()