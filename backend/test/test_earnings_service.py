"""
Tests for Earnings Service

This module contains tests for the earnings service functionality.
"""

import pytest
from datetime import datetime, UTC
from unittest.mock import MagicMock, patch

from modules.earnings.service import EarningsService
from modules.earnings.models import (
    EmployeeRosterCreate,
    EmployeeRosterUpdate,
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeBulkCreate,
    EmployeeEarningsCreate,
    EmployeeEarningsBulkCreate,
    EarningsCodeCreate,
    EarningsCodeUpdate,
    EarningsMapCreate,
    EarningsMapUpdate,
    BusinessRuleCreate,
    BusinessRuleUpdate,
    RuleType,
    ConditionExpression,
    ConditionOperator,
    BusinessRuleDefinition
)

from test_adapters.service_test_framework import ServiceTestAdapter, BaseServiceTest


class TestEarningsService:
    """Test suite for EarningsService."""
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, earnings_adapter):
        """Set up test environment before each test."""
        # Create a service test adapter
        self.service_adapter = ServiceTestAdapter(registry=entity_registry, service_class=EarningsService)
        
        # Set up the service test with the earnings adapter
        self.service_test = self.service_adapter.setup_service_test({"earnings_adapter": earnings_adapter})
        
        # Get the service instance and DB session for convenience
        self.service = self.service_test.service_instance
        self.db = self.service_test.db_session
        self.earnings_adapter = earnings_adapter
        
        # Yield to the test
        yield
        
        # Reset after the test
        self.service_test.reset()
    
    # Employee Roster Tests
    
    def test_create_roster(self):
        """Test creating a new employee roster."""
        # Arrange
        roster_create = EmployeeRosterCreate(
            name="Test Roster",
            description="Test roster description",
            source_id="source-id",
            destination_id="destination-id",
            tenant_id="tenant-1"
        )
        
        # Mock DB interactions
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Create entity in registry
        registry_roster = self.service_adapter.create_entity("EmployeeRoster", 
            id=1,
            name=roster_create.name,
            description=roster_create.description,
            source_id=roster_create.source_id,
            destination_id=roster_create.destination_id,
            tenant_id=roster_create.tenant_id,
            owner_id="user-1"
        )
        
        # Create mock roster DB model
        mock_roster = MagicMock()
        mock_roster.id = 1
        mock_roster.name = registry_roster["name"]
        mock_roster.description = registry_roster["description"]
        mock_roster.source_id = registry_roster["source_id"]
        mock_roster.destination_id = registry_roster["destination_id"]
        mock_roster.tenant_id = registry_roster["tenant_id"]
        mock_roster.owner_id = registry_roster["owner_id"]
        mock_roster.created_at = datetime.now(UTC)
        mock_roster.updated_at = datetime.now(UTC)
        mock_roster.last_sync_at = None
        
        # Act
        result = self.service.create_roster(roster_create, "user-1")
        
        # Assert
        assert result is not None
        assert result.name == roster_create.name
        assert result.description == roster_create.description
        assert result.source_id == roster_create.source_id
        assert result.tenant_id == roster_create.tenant_id
        assert self.db.add.called
        assert self.db.commit.called
    
    def test_update_roster(self):
        """Test updating an employee roster."""
        # Arrange
        roster_id = 1
        
        # Create roster entity in registry
        registry_roster = self.service_adapter.create_entity("EmployeeRoster", 
            id=roster_id,
            name="Test Roster",
            description="Test roster description",
            source_id="source-id",
            destination_id="destination-id",
            tenant_id="tenant-1",
            owner_id="user-1"
        )
        
        # Create mock roster DB model
        mock_roster = MagicMock()
        mock_roster.id = roster_id
        mock_roster.name = registry_roster["name"]
        mock_roster.description = registry_roster["description"]
        mock_roster.source_id = registry_roster["source_id"]
        mock_roster.destination_id = registry_roster["destination_id"]
        mock_roster.tenant_id = registry_roster["tenant_id"]
        mock_roster.owner_id = registry_roster["owner_id"]
        mock_roster.created_at = datetime.now(UTC)
        mock_roster.updated_at = datetime.now(UTC)
        mock_roster.last_sync_at = None
        
        # Mock DB query
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = mock_roster
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Update data
        roster_update = EmployeeRosterUpdate(
            name="Updated Roster",
            description="Updated description"
        )
        
        # Act
        result = self.service.update_roster(roster_id, roster_update)
        
        # Assert
        assert result is not None
        assert result.name == roster_update.name
        assert result.description == roster_update.description
        assert self.db.commit.called
    
    def test_delete_roster(self):
        """Test deleting an employee roster."""
        # Arrange
        roster_id = 1
        
        # Create roster entity in registry
        registry_roster = self.service_adapter.create_entity("EmployeeRoster", 
            id=roster_id,
            name="Test Roster",
            description="Test roster description",
            source_id="source-id",
            destination_id="destination-id",
            tenant_id="tenant-1",
            owner_id="user-1"
        )
        
        # Create mock roster DB model
        mock_roster = MagicMock()
        mock_roster.id = roster_id
        
        # Mock DB query
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = mock_roster
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Act
        result = self.service.delete_roster(roster_id)
        
        # Assert
        assert result is True
        assert self.db.delete.called
        assert self.db.commit.called
    
    # Employee Tests
    
    def test_create_employee(self):
        """Test creating a new employee."""
        # Arrange
        employee_create = EmployeeCreate(
            roster_id=1,
            external_id="emp-123",
            source_id="src-123",
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com"
        )
        
        # Mock DB interactions
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Create entity in registry
        registry_employee = self.service_adapter.create_entity("Employee", 
            id=1,
            roster_id=employee_create.roster_id,
            external_id=employee_create.external_id,
            source_id=employee_create.source_id,
            first_name=employee_create.first_name,
            last_name=employee_create.last_name,
            email=employee_create.email
        )
        
        # Create mock employee DB model
        mock_employee = MagicMock()
        mock_employee.id = 1
        mock_employee.roster_id = registry_employee["roster_id"]
        mock_employee.external_id = registry_employee["external_id"]
        mock_employee.source_id = registry_employee["source_id"]
        mock_employee.first_name = registry_employee["first_name"]
        mock_employee.last_name = registry_employee["last_name"]
        mock_employee.email = registry_employee["email"]
        mock_employee.created_at = datetime.now(UTC)
        mock_employee.updated_at = datetime.now(UTC)
        
        # Act
        result = self.service.create_employee(employee_create)
        
        # Assert
        assert result is not None
        assert result.external_id == employee_create.external_id
        assert result.first_name == employee_create.first_name
        assert result.last_name == employee_create.last_name
        assert self.db.add.called
        assert self.db.commit.called
    
    def test_bulk_create_employees(self):
        """Test bulk creating employees."""
        # Arrange
        roster_id = 1
        employees = [
            EmployeeCreate(
                roster_id=roster_id,
                external_id="emp-123",
                source_id="src-123",
                first_name="John",
                last_name="Doe",
                email="john.doe@example.com"
            ),
            EmployeeCreate(
                roster_id=roster_id,
                external_id="emp-456",
                source_id="src-456",
                first_name="Jane",
                last_name="Smith",
                email="jane.smith@example.com"
            )
        ]
        
        bulk_request = EmployeeBulkCreate(
            roster_id=roster_id,
            employees=employees
        )
        
        # Mock DB interactions
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Mock DB query to check for existing employees
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = None  # No existing employees
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Create mock employee DB models
        mock_employees = []
        for i, emp in enumerate(employees):
            mock_employee = MagicMock()
            mock_employee.id = i + 1
            mock_employee.roster_id = emp.roster_id
            mock_employee.external_id = emp.external_id
            mock_employee.source_id = emp.source_id
            mock_employee.first_name = emp.first_name
            mock_employee.last_name = emp.last_name
            mock_employee.email = emp.email
            mock_employee.created_at = datetime.now(UTC)
            mock_employee.updated_at = datetime.now(UTC)
            mock_employees.append(mock_employee)
        
        # Act
        result = self.service.bulk_create_employees(bulk_request)
        
        # Assert
        assert result is not None
        assert len(result) == 2
        assert self.db.commit.called
    
    # Earnings Code Tests
    
    def test_create_earnings_code(self):
        """Test creating a new earnings code."""
        # Arrange
        code_create = EarningsCodeCreate(
            code="REG",
            name="Regular Hours",
            description="Regular working hours",
            destination_system="ADP",
            is_overtime=False
        )
        
        # Mock DB interactions
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Create entity in registry
        registry_code = self.service_adapter.create_entity("EarningsCode", 
            id=1,
            code=code_create.code,
            name=code_create.name,
            description=code_create.description,
            destination_system=code_create.destination_system,
            is_overtime=code_create.is_overtime
        )
        
        # Create mock code DB model
        mock_code = MagicMock()
        mock_code.id = 1
        mock_code.code = registry_code["code"]
        mock_code.name = registry_code["name"]
        mock_code.description = registry_code["description"]
        mock_code.destination_system = registry_code["destination_system"]
        mock_code.is_overtime = registry_code["is_overtime"]
        mock_code.created_at = datetime.now(UTC)
        mock_code.updated_at = datetime.now(UTC)
        
        # Act
        result = self.service.create_earnings_code(code_create)
        
        # Assert
        assert result is not None
        assert result.code == code_create.code
        assert result.name == code_create.name
        assert result.destination_system == code_create.destination_system
        assert self.db.add.called
        assert self.db.commit.called
    
    # Earnings Map Tests
    
    def test_create_earnings_map(self):
        """Test creating a new earnings map."""
        # Arrange
        map_create = EarningsMapCreate(
            roster_id=1,
            source_type="Work Hours",
            earnings_code_id=1,
            default_map=True
        )
        
        # Mock DB interactions
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Mock DB query to check for existing default maps
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.all.return_value = []  # No existing default maps
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Create entity in registry
        registry_map = self.service_adapter.create_entity("EarningsMap", 
            id=1,
            roster_id=map_create.roster_id,
            source_type=map_create.source_type,
            earnings_code_id=map_create.earnings_code_id,
            default_map=map_create.default_map
        )
        
        # Create mock map DB model
        mock_map = MagicMock()
        mock_map.id = 1
        mock_map.roster_id = registry_map["roster_id"]
        mock_map.source_type = registry_map["source_type"]
        mock_map.earnings_code_id = registry_map["earnings_code_id"]
        mock_map.default_map = registry_map["default_map"]
        mock_map.created_at = datetime.now(UTC)
        mock_map.updated_at = datetime.now(UTC)
        
        # Act
        result = self.service.create_earnings_map(map_create)
        
        # Assert
        assert result is not None
        assert result.roster_id == map_create.roster_id
        assert result.source_type == map_create.source_type
        assert result.earnings_code_id == map_create.earnings_code_id
        assert result.default_map == map_create.default_map
        assert self.db.add.called
        assert self.db.commit.called
    
    # Business Rule Tests
    
    def test_create_business_rule(self):
        """Test creating a new business rule."""
        # Arrange
        rule_definition = BusinessRuleDefinition(
            conditions=[
                ConditionExpression(
                    field="hours",
                    operator=ConditionOperator.GREATER_THAN,
                    value=8
                )
            ],
            formula="hours * 1.5",
            description="Overtime rule for hours over 8"
        )
        
        rule_create = BusinessRuleCreate(
            roster_id=1,
            name="Overtime Rule",
            description="Applies overtime to hours over 8",
            rule_type=RuleType.OVERTIME,
            rule_definition=rule_definition,
            earnings_code_id=1,
            is_active=True
        )
        
        # Mock DB interactions
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Create entity in registry
        registry_rule = self.service_adapter.create_entity("BusinessRule", 
            id=1,
            roster_id=rule_create.roster_id,
            name=rule_create.name,
            description=rule_create.description,
            rule_type=rule_create.rule_type.value,
            rule_definition=rule_create.rule_definition.model_dump(),
            earnings_code_id=rule_create.earnings_code_id,
            is_active=rule_create.is_active
        )
        
        # Create mock rule DB model
        mock_rule = MagicMock()
        mock_rule.id = 1
        mock_rule.roster_id = registry_rule["roster_id"]
        mock_rule.name = registry_rule["name"]
        mock_rule.description = registry_rule["description"]
        mock_rule.rule_type = registry_rule["rule_type"]
        mock_rule.rule_definition = registry_rule["rule_definition"]
        mock_rule.earnings_code_id = registry_rule["earnings_code_id"]
        mock_rule.is_active = registry_rule["is_active"]
        mock_rule.created_at = datetime.now(UTC)
        mock_rule.updated_at = datetime.now(UTC)
        
        # Act
        result = self.service.create_business_rule(rule_create)
        
        # Assert
        assert result is not None
        assert result.roster_id == rule_create.roster_id
        assert result.name == rule_create.name
        assert result.rule_type == rule_create.rule_type.value
        assert self.db.add.called
        assert self.db.commit.called
    
    # Advanced Operations Tests
    
    def test_sync_roster(self):
        """Test syncing an employee roster."""
        # Arrange
        roster_id = 1
        sync_request = {
            "roster_id": roster_id,
            "destination_system": "ADP",
            "sync_options": {"full_sync": True}
        }
        
        # Create roster entity in registry
        registry_roster = self.service_adapter.create_entity("EmployeeRoster", 
            id=roster_id,
            name="Test Roster",
            description="Test roster description",
            source_id="source-id",
            destination_id="destination-id",
            tenant_id="tenant-1",
            owner_id="user-1"
        )
        
        # Act
        result = self.service.sync_roster(sync_request)
        
        # Assert
        assert result is not None
        assert result.success is True
        assert result.roster_id == roster_id
    
    def test_test_earnings_map(self):
        """Test testing an earnings map."""
        # Arrange
        test_request = {
            "roster_id": 1,
            "source_type": "Work Hours",
            "sample_data": {"hours": 10, "date": "2025-01-01"}
        }
        
        # Act
        result = self.service.test_earnings_map(test_request)
        
        # Assert
        assert result is not None
        assert result.source_type == test_request["source_type"]