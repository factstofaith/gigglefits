"""
Tests for health check endpoints.

This module tests both the simple `/health` endpoint for container health checks
and the comprehensive `/api/health` endpoint for system monitoring.
"""

import unittest
import pytest
from fastapi.testclient import TestClient
from fastapi import status
from unittest.mock import patch, MagicMock

from main import app
from db.base import get_db


# Create a test client
client = TestClient(app)


# Mock database session for testing
def override_get_db():
    """Mock database session that works for health checks but doesn't use a real DB."""
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar.return_value = 1
    yield mock_db


# Apply database override to all tests in this module
app.dependency_overrides[get_db] = override_get_db


class TestHealthEndpoints(unittest.TestCase):
    """Test health check endpoints."""

    def test_container_health_check(self):
        """Test the simple `/health` endpoint used for container orchestration."""
        # Make request to the health endpoint
        response = client.get("/health")
        
        # Verify response is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify response content
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["message"], "Service is running")

    def test_api_health_check(self):
        """Test the comprehensive `/api/health` endpoint used for monitoring."""
        # Make request to the comprehensive health endpoint
        response = client.get("/api/health")
        
        # Verify response is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify essential response content
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertIn("version", data)
        self.assertIn("timestamp", data)
        self.assertIn("environment", data)
        self.assertIn("checks", data)
        
        # Verify application check
        self.assertIn("application", data["checks"])
        self.assertEqual(data["checks"]["application"]["status"], "ok")
        
        # Verify database check
        self.assertIn("database", data["checks"])
        self.assertEqual(data["checks"]["database"]["status"], "ok")
        self.assertEqual(data["checks"]["database"]["message"], "Database connection successful")

    @patch("psutil.virtual_memory")
    @patch("psutil.cpu_percent")
    def test_api_health_check_with_resources(self, mock_cpu_percent, mock_virtual_memory):
        """Test the system resources section of the health check."""
        # Mock psutil responses
        mock_memory = MagicMock()
        mock_memory.percent = 50.0  # 50% memory usage - healthy
        mock_virtual_memory.return_value = mock_memory
        mock_cpu_percent.return_value = 30.0  # 30% CPU usage - healthy
        
        # Make request to the comprehensive health endpoint
        response = client.get("/api/health")
        
        # Verify response is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify system resources check
        data = response.json()
        self.assertIn("system_resources", data["checks"])
        self.assertEqual(data["checks"]["system_resources"]["status"], "ok")
        self.assertEqual(data["checks"]["system_resources"]["memory_usage_percent"], 50.0)
        self.assertEqual(data["checks"]["system_resources"]["cpu_usage_percent"], 30.0)

    @patch("psutil.virtual_memory")
    def test_api_health_check_high_memory(self, mock_virtual_memory):
        """Test degraded status when memory usage is high."""
        # Mock high memory usage
        mock_memory = MagicMock()
        mock_memory.percent = 95.0  # 95% memory usage - warning
        mock_virtual_memory.return_value = mock_memory
        
        # Make request to the comprehensive health endpoint
        response = client.get("/api/health")
        
        # Verify response is still 200 OK but content indicates degraded
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify overall status is degraded
        data = response.json()
        self.assertEqual(data["status"], "degraded")
        
        # Verify system resources check shows warning
        self.assertEqual(data["checks"]["system_resources"]["status"], "warning")

    def test_api_health_check_db_failure(self):
        """Test error status when database connection fails."""
        # Override the DB dependency to simulate database failure
        mock_db = MagicMock()
        mock_db.execute.side_effect = Exception("Database connection error")
        
        with patch('main.get_db', return_value=mock_db):
            # Make request with patched DB that raises exception
            response = client.get("/api/health")
            
            # Verify error response
            self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
            
            data = response.json()
            self.assertEqual(data["status"], "error")
            self.assertIn("database", data["checks"])
            self.assertEqual(data["checks"]["database"]["status"], "error")
            self.assertIn("Database connection failed", data["checks"]["database"]["message"])


if __name__ == "__main__":
    unittest.main()