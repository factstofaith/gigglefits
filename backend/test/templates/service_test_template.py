"""
Service Test Template

This template provides a standardized structure for service layer tests.
"""

import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

# Import the service to test
from modules.example.service import ExampleService

# Import the models
from modules.example.models import (
    ExampleModel,
    ExampleModelCreate,
    ExampleModelUpdate
)

# Import test adapters
from test.test_adapters import ServiceTestAdapter, BaseServiceTest


class TestExampleService:
    """
    Test suite for ExampleService.
    
    This class follows the AAA pattern:
    - Arrange: Set up test conditions
    - Act: Call the method being tested
    - Assert: Verify the results
    """
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry):
        """Set up test environment before each test."""
        # Create a service test adapter
        self.service_adapter = ServiceTestAdapter(registry=entity_registry, service_class=ExampleService)
        
        # Set up the service test with additional adapters if needed
        self.service_test = self.service_adapter.setup_service_test()
        
        # Get the service instance and DB session for convenience
        self.service = self.service_test.service_instance
        self.db = self.service_test.db_session
        
        # Register models with entity types
        self.service_adapter.register_model(ExampleModel, "Example")
        
        # Yield to the test
        yield
        
        # Reset after the test
        self.service_test.reset()
    
    def test_create_example(self):
        """Test creating a new example."""
        # Arrange
        example_create = ExampleModelCreate(
            name="Test Example",
            description="Test Description"
        )
        
        created_example = ExampleModel(
            id=1,
            name=example_create.name,
            description=example_create.description,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Mock DB interactions
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Mock query to check for existing example
        self.service_test.mock_db_query(ExampleModel, result=None)
        
        # Act
        result = self.service.create_example(example_create)
        
        # Assert
        assert result is not None
        assert result.name == example_create.name
        assert result.description == example_create.description
        self.service_test.assert_db_call_count("add", 1)
        self.service_test.assert_db_call_count("commit", 1)
    
    def test_get_example(self):
        """Test retrieving an example by ID."""
        # Arrange
        example_id = 1
        mock_example = ExampleModel(
            id=example_id,
            name="Test Example",
            description="Test Description",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Mock DB interactions
        self.service_test.mock_db_query(ExampleModel, result=mock_example)
        
        # Act
        result = self.service.get_example(example_id)
        
        # Assert
        assert result is not None
        assert result.id == example_id
        assert result.name == mock_example.name
        assert result.description == mock_example.description
    
    def test_update_example(self):
        """Test updating an example."""
        # Arrange
        example_id = 1
        mock_example = ExampleModel(
            id=example_id,
            name="Test Example",
            description="Test Description",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        update_data = ExampleModelUpdate(
            name="Updated Example",
            description="Updated Description"
        )
        
        # Mock DB interactions
        self.service_test.mock_db_query(ExampleModel, result=mock_example)
        self.db.commit.return_value = None
        
        # Act
        result = self.service.update_example(example_id, update_data)
        
        # Assert
        assert result is not None
        assert result.name == update_data.name
        assert result.description == update_data.description
        self.service_test.assert_db_call_count("commit", 1)
    
    def test_delete_example(self):
        """Test deleting an example."""
        # Arrange
        example_id = 1
        mock_example = ExampleModel(
            id=example_id,
            name="Test Example",
            description="Test Description",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Mock DB interactions
        self.service_test.mock_db_query(ExampleModel, result=mock_example)
        self.db.delete.return_value = None
        self.db.commit.return_value = None
        
        # Act
        result = self.service.delete_example(example_id)
        
        # Assert
        assert result is True
        self.service_test.assert_db_call_count("delete", 1)
        self.service_test.assert_db_call_count("commit", 1)
    
    def test_handle_error(self):
        """Test error handling."""
        # Arrange
        example_id = 1
        
        # Mock DB interactions to raise an exception
        self.service_test.mock_db_query(ExampleModel, result=None)
        
        # Act
        result = self.service.get_example(example_id)
        
        # Assert
        assert result is None
    
    def test_custom_business_logic(self):
        """Test custom business logic in the service."""
        # This is a placeholder for testing custom business logic
        # Arrange
        # ...
        
        # Act
        # ...
        
        # Assert
        # ...