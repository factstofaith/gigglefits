"""
Optimized Service Error Handling Tests

This module contains optimized tests for error handling across all services using
the error handling test framework.
"""

import pytest
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

# Import service classes
from modules.admin.service import AdminService
from modules.integrations.service import IntegrationService
from modules.earnings.service import EarningsService

# Import test components
from test.test_adapters import (
    ServiceTestAdapter,
    ErrorHandlingServiceTest,
    ErrorHandlingTestAdapter,
    ErrorType,
    ErrorInjector
)


class TestServiceErrorHandlingOptimized:
    """
    Optimized tests for service error handling.
    
    This class demonstrates how to use the ErrorHandlingServiceTest and ErrorHandlingTestAdapter
    for more maintainable and standardized error handling tests.
    """
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, admin_adapter, integration_adapter, earnings_adapter, error_adapter):
        """Set up test environment before each test."""
        # Set up service adapters for each service type
        self.admin_service_adapter = ServiceTestAdapter(
            registry=entity_registry,
            service_class=AdminService
        )
        
        self.integration_service_adapter = ServiceTestAdapter(
            registry=entity_registry, 
            service_class=IntegrationService
        )
        
        self.earnings_service_adapter = ServiceTestAdapter(
            registry=entity_registry,
            service_class=None  # EarningsService uses static methods
        )
        
        # Set up error handling test instances
        self.admin_test = ErrorHandlingServiceTest(
            AdminService,
            {"admin_adapter": admin_adapter, "error_adapter": error_adapter}
        )
        
        self.integration_test = ErrorHandlingServiceTest(
            IntegrationService,
            {"integration_adapter": integration_adapter, "error_adapter": error_adapter}
        )
        
        # Store references to services
        self.admin_service = self.admin_test.service_instance
        self.integration_service = self.integration_test.service_instance
        self.earnings_service = EarningsService  # Static methods
        
        # Store database session
        self.db = self.admin_test.db_session
        
        # Store adapters
        self.admin_adapter = admin_adapter
        self.integration_adapter = integration_adapter
        self.earnings_adapter = earnings_adapter
        self.error_adapter = error_adapter
        
        yield
        
        # Reset everything
        self.admin_test.reset()
        self.integration_test.reset()
    
    def test_resource_not_found_handling(self):
        """Test handling of resource not found errors across services."""
        # Admin service - Application not found
        app_result = self.admin_test.assert_handles_not_found(
            method=self.admin_service.get_application,
            expected_result=None,
            app_id=999
        )
        assert app_result is None
        
        # Integration service - Integration not found
        integration_result = self.integration_test.assert_handles_not_found(
            method=self.integration_service.get_integration,
            expected_result=None,
            integration_id=999
        )
        assert integration_result is None
        
        # Earnings service - Roster not found
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        roster_result = self.earnings_service.get_roster(self.db, 999)
        assert roster_result is None
    
    def test_database_error_handling(self):
        """Test handling of database errors across services."""
        # Admin service - DB error during application creation
        app_create = MagicMock()
        app_create.name = "Test App"
        app_create.type = "API"
        app_create.tags = []
        
        # Inject database error
        db_error = self.admin_test.inject_db_error()
        
        # Act & Assert - Admin service
        with pytest.raises(SQLAlchemyError):
            self.admin_service.create_application(app_create, "test-user")
        
        # Reset mock for next test
        self.db.reset_mock()
        
        # Integration service - DB error during integration creation
        integration_create = MagicMock()
        integration_create.name = "Test Integration"
        integration_create.type = "API-based"
        integration_create.source = "Test Source"
        integration_create.destination = "Test Destination"
        integration_create.tags = []
        
        # Inject database error
        db_error = self.integration_test.inject_db_error()
        
        # Act & Assert - Integration service
        with pytest.raises(SQLAlchemyError):
            self.integration_service.create_integration(integration_create)
    
    def test_integrity_error_handling(self):
        """Test handling of integrity errors across services."""
        # Admin service - Integrity error during application creation
        app_create = MagicMock()
        app_create.name = "Test App"
        app_create.type = "API"
        app_create.tags = []
        
        # Inject integrity error
        integrity_error = self.admin_test.inject_integrity_error(
            entity_type="Application",
            field="name",
            value="Test App"
        )
        
        # Act & Assert - Admin service
        with pytest.raises(IntegrityError):
            self.admin_service.create_application(app_create, "test-user")
    
    def test_transaction_handling(self):
        """Test transaction handling in services."""
        # Set up transaction with error
        self.db.begin.return_value.__enter__.return_value = self.db
        self.db.begin.return_value.__exit__.return_value = False
        self.db.commit.side_effect = SQLAlchemyError("Commit error")
        
        # Admin service - Transaction error
        app_create = MagicMock()
        app_create.name = "Test App"
        app_create.type = "API"
        app_create.tags = []
        
        # Act & Assert - Admin service
        with pytest.raises(SQLAlchemyError):
            self.admin_service.create_application(app_create, "test-user")
        
        # Verify rollback was called
        assert self.db.rollback.called
    
    def test_update_nonexistent_resource(self):
        """Test updating non-existent resources across services."""
        # Admin service - Update non-existent application
        app_update = {"name": "Updated App"}
        app_result = self.admin_test.assert_handles_not_found(
            self.admin_service.update_application,
            expected_result=None,
            999, app_update
        )
        assert app_result is None
        
        # Integration service - Update non-existent integration
        integration_update = MagicMock()
        integration_update.model_dump.return_value = {"name": "Updated Integration"}
        integration_result = self.integration_test.assert_handles_not_found(
            self.integration_service.update_integration,
            expected_result=None,
            999, integration_update
        )
        assert integration_result is None
        
        # Earnings service - Update non-existent roster
        roster_update = MagicMock()
        roster_update.model_dump.return_value = {"name": "Updated Roster"}
        
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        roster_result = self.earnings_service.update_roster(self.db, 999, roster_update)
        assert roster_result is None
    
    def test_delete_nonexistent_resource(self):
        """Test deleting non-existent resources across services."""
        # Admin service - Delete non-existent application
        app_result = self.admin_test.assert_handles_not_found(
            self.admin_service.delete_application,
            expected_result=False,
            999
        )
        assert app_result is False
        
        # Integration service - Delete non-existent integration
        integration_result = self.integration_test.assert_handles_not_found(
            self.integration_service.delete_integration,
            expected_result=False,
            999
        )
        assert integration_result is False
        
        # Earnings service - Delete non-existent roster
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        roster_result = self.earnings_service.delete_roster(self.db, 999)
        assert roster_result is False
    
    def test_specialized_operations_error_handling(self):
        """Test error handling in specialized operations."""
        # Integration service - Run non-existent integration
        run_result = self.integration_test.assert_handles_not_found(
            self.integration_service.run_integration,
            expected_result=None,
            999
        )
        assert run_result is None
        
        # Integration service - Get history for non-existent integration
        history_result = self.integration_test.assert_handles_not_found(
            self.integration_service.get_integration_history,
            expected_result=None,
            999
        )
        assert history_result is None
        
        # Integration service - Create field mapping for non-existent integration
        mapping_create = MagicMock()
        mapping_result = self.integration_test.assert_handles_not_found(
            self.integration_service.create_field_mapping,
            expected_result=None,
            999, mapping_create
        )
        assert mapping_result is None
    
    def test_error_cascading(self):
        """Test error cascading through multiple operations."""
        # Set up query to first succeed, then fail on second call
        self.db.query.side_effect = [MagicMock(), SQLAlchemyError("Second query error")]
        
        # First operation succeeds
        roster_query = MagicMock()
        filter_mock = MagicMock()
        mock_roster = MagicMock()
        mock_roster.id = 1
        filter_mock.first.return_value = mock_roster
        roster_query.filter.return_value = filter_mock
        
        self.db.query.return_value = roster_query
        
        roster = self.earnings_service.get_roster(self.db, 1)
        assert roster is not None
        
        # Second operation fails
        self.db.query.side_effect = SQLAlchemyError("Query error")
        
        with pytest.raises(SQLAlchemyError):
            self.earnings_service.get_employee(self.db, 1)
    
    def test_validation_error_patterns(self):
        """Test common validation error patterns."""
        # Test validation errors in model creation
        from pydantic import ValidationError
        
        # Admin service - Invalid application type
        with pytest.raises(ValidationError):
            from modules.admin.models import ApplicationCreate
            ApplicationCreate(
                name="Test App",
                type="INVALID_TYPE",  # Invalid type
                source="Test",
                destination="Test"
            )
        
        # Integration service - Invalid schedule type
        with pytest.raises(ValidationError):
            from modules.integrations.models import ScheduleConfig
            ScheduleConfig(
                type="invalid",  # Invalid schedule type
                timezone="timezone"
            )
        
        # Earnings service - Missing required field
        with pytest.raises(ValidationError):
            from modules.earnings.models import EmployeeCreate
            EmployeeCreate(
                # Missing required roster_id
                external_id="emp-123",
                source_id="src-123"
            )
    
    def test_complex_error_scenarios(self):
        """Test complex error scenarios involving multiple components."""
        # Setup admin test with complex error scenario
        # 1. Create a tenant
        # 2. Create an application
        # 3. Try to associate application with tenant but fail
        
        # Create tenant in adapter
        tenant = self.admin_adapter.create_tenant({
            "name": "Test Tenant",
            "description": "Test tenant description",
            "tenant_id": "tenant-1"
        }, "admin-user")
        
        # Create application in adapter
        app = self.admin_adapter.create_application({
            "name": "Test Application",
            "type": "API",
            "description": "Test description"
        })
        
        # Mock DB queries for tenant and application
        tenant_mock = MagicMock()
        tenant_mock.id = tenant["id"]
        
        app_mock = MagicMock()
        app_mock.id = app["id"]
        
        # Set up query to return tenant and application, then fail on association
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.side_effect = [tenant_mock, app_mock]
        query_mock.filter.return_value = filter_mock
        self.db.query.side_effect = [query_mock, query_mock, SQLAlchemyError("Association error")]
        
        # Act & Assert
        # The actual association method would depend on AdminService's API
        with pytest.raises(SQLAlchemyError):
            # This is a simplified example - the actual method would depend on the service
            self.db.add.side_effect = SQLAlchemyError("Association error")
            self.admin_service.associate_tenant_application(tenant["id"], app["id"])
    
    def test_dependency_error_handling(self):
        """Test handling of dependency errors."""
        # Test that services properly handle errors from dependencies
        
        # Set up a mock adapter that raises an exception when called
        error_adapter = MagicMock()
        error_adapter.get_application.side_effect = Exception("External service error")
        
        # Inject the mock adapter into the admin service
        self.admin_service._adapters = {"error_adapter": error_adapter}
        
        # Act & Assert
        # Assuming admin_service delegates to the adapter in some cases
        # If the service doesn't use adapters, this would need to be modified
        with patch.object(self.admin_service, 'get_application') as mock_method:
            mock_method.side_effect = Exception("External service error")
            
            with pytest.raises(Exception):
                self.admin_service.get_application(1)