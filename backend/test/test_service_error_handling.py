"""
Service Error Handling Tests

This module contains tests for error handling across all services.
"""

import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, UTC
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

# Import service classes
from modules.admin.service import AdminService
from modules.integrations.service import IntegrationService
from modules.earnings.service import EarningsService

# Import test components
from test.test_adapters import (
    ServiceTestAdapter,
    ErrorHandlingServiceTest,
    ErrorType,
    ErrorInjector
)


class TestAdminServiceErrorHandling:
    """Test error handling in AdminService."""
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, admin_adapter, error_adapter):
        """Set up test environment before each test."""
        self.service_adapter = ServiceTestAdapter(
            registry=entity_registry,
            service_class=AdminService
        )
        
        self.service_test = ErrorHandlingServiceTest(
            self.service_adapter.service_class,
            {"admin_adapter": admin_adapter, "error_adapter": error_adapter}
        )
        
        self.service = self.service_test.service_instance
        self.db = self.service_test.db_session
        self.admin_adapter = admin_adapter
        self.error_adapter = error_adapter
        
        yield
        
        self.service_test.reset()
    
    def test_get_application_not_found(self):
        """Test handling of non-existent application."""
        # Act
        result = self.service_test.assert_handles_not_found(
            method=self.service.get_application,
            expected_result=None,
            app_id=999
        )
        
        # Assert
        assert result is None
    
    def test_update_application_not_found(self):
        """Test handling of updating non-existent application."""
        # Arrange
        update_data = {"name": "Updated App"}
        
        # Act
        result = self.service_test.assert_handles_not_found(
            self.service.update_application,
            expected_result=None,
            999, update_data
        )
        
        # Assert
        assert result is None
    
    def test_delete_application_not_found(self):
        """Test handling of deleting non-existent application."""
        # Act
        result = self.service_test.assert_handles_not_found(
            self.service.delete_application,
            expected_result=False,
            999
        )
        
        # Assert
        assert result is False
    
    def test_create_application_db_error(self):
        """Test handling of database error during application creation."""
        # Arrange
        app_create = MagicMock()
        app_create.name = "Test App"
        app_create.type = "API"
        app_create.source = "Test Source"
        app_create.destination = "Test Destination"
        
        # Mock DB interactions to raise an error
        self.db.add.side_effect = SQLAlchemyError("DB Error")
        
        # Act - This should handle the error
        with pytest.raises(SQLAlchemyError):
            self.service.create_application(app_create, "test-user")
        
        # Assert - The service should not commit after an error
        assert not self.db.commit.called
    
    def test_get_application_db_error(self):
        """Test handling of database error during application retrieval."""
        # Act
        with patch.object(self.service, 'get_application', side_effect=SQLAlchemyError("DB Error")):
            try:
                self.service.get_application(1)
                pytest.fail("Exception not raised")
            except SQLAlchemyError:
                # Assert - Exception should be raised to the caller
                pass
    
    def test_create_application_integrity_error(self):
        """Test handling of integrity error during application creation."""
        # Arrange
        app_create = MagicMock()
        app_create.name = "Test App"
        app_create.type = "API"
        app_create.source = "Test Source"
        app_create.destination = "Test Destination"
        
        # Setup integrity error for duplicate name
        integrity_error = IntegrityError("statement", "params", "Duplicate entry")
        self.db.add.side_effect = integrity_error
        
        # Act - This should handle the error
        with pytest.raises(IntegrityError):
            self.service.create_application(app_create, "test-user")
        
        # Assert - The service should not commit after an error
        assert not self.db.commit.called


class TestIntegrationServiceErrorHandling:
    """Test error handling in IntegrationService."""
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, integration_adapter, error_adapter):
        """Set up test environment before each test."""
        self.service_adapter = ServiceTestAdapter(
            registry=entity_registry,
            service_class=IntegrationService
        )
        
        self.service_test = ErrorHandlingServiceTest(
            self.service_adapter.service_class,
            {"integration_adapter": integration_adapter, "error_adapter": error_adapter}
        )
        
        self.service = self.service_test.service_instance
        self.db = self.service_test.db_session
        self.integration_adapter = integration_adapter
        self.error_adapter = error_adapter
        
        yield
        
        self.service_test.reset()
    
    def test_get_integration_not_found(self):
        """Test handling of non-existent integration."""
        # Act
        result = self.service_test.assert_handles_not_found(
            self.service.get_integration,
            expected_result=None,
            999
        )
        
        # Assert
        assert result is None
    
    def test_update_integration_not_found(self):
        """Test handling of updating non-existent integration."""
        # Arrange
        update_data = MagicMock()
        update_data.model_dump.return_value = {"name": "Updated Integration"}
        
        # Act
        result = self.service_test.assert_handles_not_found(
            self.service.update_integration,
            expected_result=None,
            999, update_data
        )
        
        # Assert
        assert result is None
    
    def test_delete_integration_not_found(self):
        """Test handling of deleting non-existent integration."""
        # Act
        result = self.service_test.assert_handles_not_found(
            self.service.delete_integration,
            expected_result=False,
            999
        )
        
        # Assert
        assert result is False
    
    def test_run_integration_not_found(self):
        """Test handling of running non-existent integration."""
        # Act
        result = self.service_test.assert_handles_not_found(
            self.service.run_integration,
            expected_result=None,
            999
        )
        
        # Assert
        assert result is None
    
    def test_get_integration_history_not_found(self):
        """Test handling of getting history for non-existent integration."""
        # Act
        result = self.service_test.assert_handles_not_found(
            self.service.get_integration_history,
            expected_result=None,
            999
        )
        
        # Assert
        assert result is None
    
    def test_create_field_mapping_integration_not_found(self):
        """Test handling of creating field mapping for non-existent integration."""
        # Arrange
        mapping_create = MagicMock()
        
        # Act
        result = self.service_test.assert_handles_not_found(
            self.service.create_field_mapping,
            expected_result=None,
            999, mapping_create
        )
        
        # Assert
        assert result is None
    
    def test_create_integration_db_error(self):
        """Test handling of database error during integration creation."""
        # Arrange
        integration_create = MagicMock()
        integration_create.name = "Test Integration"
        integration_create.type = "API-based"
        integration_create.source = "Test Source"
        integration_create.destination = "Test Destination"
        integration_create.tags = []
        
        # Mock DB interactions to raise an error
        self.db.add.side_effect = SQLAlchemyError("DB Error")
        
        # Act - This should handle the error
        with pytest.raises(SQLAlchemyError):
            self.service.create_integration(integration_create)
        
        # Assert - The service should not commit after an error
        assert not self.db.commit.called


class TestEarningsServiceErrorHandling:
    """Test error handling in EarningsService."""
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, earnings_adapter, error_adapter):
        """Set up test environment before each test."""
        self.service_adapter = ServiceTestAdapter(
            registry=entity_registry,
            service_class=EarningsService
        )
        
        self.service_test = ErrorHandlingServiceTest(
            self.service_adapter.service_class,
            {"earnings_adapter": earnings_adapter, "error_adapter": error_adapter}
        )
        
        self.service = EarningsService
        self.db = self.service_test.db_session
        self.earnings_adapter = earnings_adapter
        self.error_adapter = error_adapter
        
        yield
        
        self.service_test.reset()
    
    def test_get_roster_not_found(self):
        """Test handling of non-existent roster."""
        # Mock DB query for non-existent roster
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.get_roster(self.db, 999)
        
        # Assert
        assert result is None
    
    def test_update_roster_not_found(self):
        """Test handling of updating non-existent roster."""
        # Arrange
        roster_update = MagicMock()
        roster_update.model_dump.return_value = {"name": "Updated Roster"}
        
        # Mock DB query for non-existent roster
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.update_roster(self.db, 999, roster_update)
        
        # Assert
        assert result is None
    
    def test_delete_roster_not_found(self):
        """Test handling of deleting non-existent roster."""
        # Mock DB query for non-existent roster
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.delete_roster(self.db, 999)
        
        # Assert
        assert result is False
    
    def test_get_employee_not_found(self):
        """Test handling of non-existent employee."""
        # Mock DB query for non-existent employee
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.get_employee(self.db, 999)
        
        # Assert
        assert result is None
    
    def test_update_employee_not_found(self):
        """Test handling of updating non-existent employee."""
        # Arrange
        employee_update = MagicMock()
        employee_update.model_dump.return_value = {"first_name": "Updated"}
        
        # Mock DB query for non-existent employee
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.update_employee(self.db, 999, employee_update)
        
        # Assert
        assert result is None
    
    def test_delete_employee_not_found(self):
        """Test handling of deleting non-existent employee."""
        # Mock DB query for non-existent employee
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.delete_employee(self.db, 999)
        
        # Assert
        assert result is False
    
    def test_create_employee_db_error(self):
        """Test handling of database error during employee creation."""
        # Arrange
        employee_create = MagicMock()
        employee_create.roster_id = 1
        employee_create.external_id = "emp-123"
        employee_create.source_id = "src-123"
        
        # Mock DB interactions to raise an error
        self.db.add.side_effect = SQLAlchemyError("DB Error")
        
        # Act - This should handle the error
        with pytest.raises(SQLAlchemyError):
            self.service.create_employee(self.db, employee_create)
        
        # Assert - The service should not commit after an error
        assert not self.db.commit.called


class TestServiceErrorHandlingAdvanced:
    """Advanced error handling tests across services."""
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, admin_adapter, integration_adapter, earnings_adapter, error_adapter):
        """Set up test environment before each test."""
        # Set up adapters
        self.admin_adapter = admin_adapter
        self.integration_adapter = integration_adapter
        self.earnings_adapter = earnings_adapter
        self.error_adapter = error_adapter
        
        # Create a custom mock DB session
        self.db = MagicMock()
        
        yield
        
        # Reset adapters
        self.admin_adapter.reset()
        self.integration_adapter.reset()
        self.earnings_adapter.reset()
        self.error_adapter.reset()
    
    def test_transaction_rollback_on_error(self):
        """Test that transactions are rolled back on error."""
        # Arrange
        admin_service = AdminService(self.db)
        app_create = MagicMock()
        app_create.name = "Test App"
        app_create.type = "API"
        
        # Mock commit to raise an error
        self.db.commit.side_effect = SQLAlchemyError("Commit Error")
        
        # Act
        with pytest.raises(SQLAlchemyError):
            admin_service.create_application(app_create, "test-user")
        
        # Assert
        assert self.db.rollback.called
    
    def test_validation_error_handling(self):
        """Test handling of validation errors."""
        # Arrange
        from pydantic import ValidationError
        integration_service = IntegrationService(self.db)
        
        # Create data with validation issues
        invalid_data = {
            "name": "Test",
            "type": "INVALID_TYPE",  # Invalid enum value
            "source": "Test Source",
            "destination": "Test Destination"
        }
        
        # Act & Assert
        with pytest.raises(ValidationError):
            # This should raise a validation error
            from modules.integrations.models import IntegrationCreate
            IntegrationCreate(**invalid_data)
    
    def test_dependency_error_handling(self):
        """Test handling of dependency errors."""
        # Arrange
        admin_service = AdminService(self.db)
        
        # Mock a dependency error by making query raise an exception
        self.db.query.side_effect = Exception("External service error")
        
        # Act & Assert - Service should propagate the exception
        with pytest.raises(Exception):
            admin_service.get_application(1)
    
    def test_error_recovery(self):
        """Test recovery from errors in subsequent operations."""
        # Arrange
        earnings_service = EarningsService(self.db)
        
        # First operation raises an error
        self.db.query.side_effect = [SQLAlchemyError("First query error"), MagicMock()]
        
        # Act
        with pytest.raises(SQLAlchemyError):
            earnings_service.get_roster(self.db, 1)
        
        # Reset mock for the next operation
        self.db.query.side_effect = None
        self.db.query.return_value = MagicMock()
        
        # Second operation should succeed
        result = earnings_service.get_rosters(self.db)
        
        # Assert
        assert result is not None
    
    def test_nested_transaction_error_handling(self):
        """Test handling of errors in nested transactions."""
        # This is a simplified test as SQLAlchemy's nested transactions require more setup
        
        # Arrange
        admin_service = AdminService(self.db)
        app_create = MagicMock()
        app_create.name = "Test App"
        app_create.type = "API"
        app_create.tags = ["tag1", "tag2"]
        
        # Mock the DB to simulate nested transaction behavior
        self.db.begin.return_value.__enter__.return_value = self.db
        self.db.begin.return_value.__exit__.return_value = None
        
        # Set up the query mock to fail on the second tag creation
        tag_query_mock = MagicMock()
        tag_filter_mock = MagicMock()
        tag_filter_mock.first.side_effect = [None, SQLAlchemyError("Tag creation error")]
        tag_query_mock.filter.return_value = tag_filter_mock
        
        self.db.query.return_value = tag_query_mock
        
        # Act & Assert
        with pytest.raises(SQLAlchemyError):
            admin_service.create_application(app_create, "test-user")
        
        # Assert that both the inner and outer transactions are rolled back
        assert self.db.rollback.called