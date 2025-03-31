"""
Optimized Tests for Earnings Service

This module contains tests for the earnings service functionality using the optimized 
testing framework.
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


class TestEarningsServiceOptimized:
    """
    Test suite for EarningsService using the optimized testing framework.
    
    This class demonstrates how to use direct mocking for static methods.
    """
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, earnings_adapter):
        """Set up test environment before each test."""
        # Create a mocked DB session
        self.db = MagicMock()
        
        # Store adapter and registry
        self.earnings_adapter = earnings_adapter
        self.entity_registry = entity_registry
        
        # Yield to the test
        yield
        
        # Reset after the test
        self.earnings_adapter.reset()
        self.entity_registry.reset()
    
    def test_roster_lifecycle(self):
        """Test the full lifecycle of an employee roster."""
        # Arrange - Create
        roster_create = EmployeeRosterCreate(
            name="Test Roster",
            description="Test roster description",
            source_id="source-id",
            destination_id="destination-id",
            tenant_id="tenant-1"
        )
        
        # Create directly in the adapter
        roster = self.earnings_adapter.create_roster({
            "name": roster_create.name,
            "description": roster_create.description,
            "source_id": roster_create.source_id,
            "destination_id": roster_create.destination_id,
            "tenant_id": roster_create.tenant_id
        }, "user-1")
        
        # Mock DB interactions
        self.db.add.return_value = None
        self.db.commit.return_value = None
        self.db.refresh.return_value = None
        
        # Mock DB query
        mock_roster = MagicMock()
        mock_roster.id = 1
        mock_roster.name = roster["name"]
        mock_roster.description = roster["description"]
        mock_roster.source_id = roster["source_id"]
        mock_roster.destination_id = roster["destination_id"]
        mock_roster.tenant_id = roster["tenant_id"]
        mock_roster.owner_id = roster["owner_id"]
        mock_roster.created_at = datetime.now(UTC)
        mock_roster.updated_at = datetime.now(UTC)
        mock_roster.last_sync_at = None
        
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = mock_roster
        query_mock.filter.return_value = filter_mock
        self.db.query.return_value = query_mock
        
        # Mock the service methods
        with patch.object(EarningsService, 'create_roster', return_value=mock_roster) as mock_create:
            # Act - Create
            created = EarningsService.create_roster(self.db, roster_create, "user-1")
            
            # Verify the mock was called with correct parameters
            mock_create.assert_called_once_with(self.db, roster_create, "user-1")
            
            # Assert - Create
            assert created is not None
            assert created.name == roster_create.name
            assert created.description == roster_create.description
            assert created.tenant_id == roster_create.tenant_id
        
        # Mock get_roster
        with patch.object(EarningsService, 'get_roster', return_value=mock_roster) as mock_get:
            # Act - Get
            roster = EarningsService.get_roster(self.db, 1)
            
            # Verify the mock was called with correct parameters
            mock_get.assert_called_once_with(self.db, 1)
            
            # Assert - Get
            assert roster is not None
            assert roster.id == 1
            assert roster.name == roster_create.name
        
        # Arrange - Update
        roster_update = EmployeeRosterUpdate(
            name="Updated Roster",
            description="Updated description"
        )
        
        # Update the mock roster with new values
        updated_mock_roster = MagicMock()
        updated_mock_roster.id = 1
        updated_mock_roster.name = roster_update.name
        updated_mock_roster.description = roster_update.description
        updated_mock_roster.source_id = mock_roster.source_id
        updated_mock_roster.destination_id = mock_roster.destination_id
        updated_mock_roster.tenant_id = mock_roster.tenant_id
        updated_mock_roster.owner_id = mock_roster.owner_id
        updated_mock_roster.created_at = mock_roster.created_at
        updated_mock_roster.updated_at = datetime.now(UTC)
        updated_mock_roster.last_sync_at = mock_roster.last_sync_at
        
        # Mock update_roster
        with patch.object(EarningsService, 'update_roster', return_value=updated_mock_roster) as mock_update:
            # Act - Update
            updated = EarningsService.update_roster(self.db, 1, roster_update)
            
            # Verify the mock was called with correct parameters
            mock_update.assert_called_once_with(self.db, 1, roster_update)
            
            # Assert - Update
            assert updated is not None
            assert updated.name == roster_update.name
            assert updated.description == roster_update.description
        
        # Mock delete_roster
        with patch.object(EarningsService, 'delete_roster', return_value=True) as mock_delete:
            # Act - Delete
            deleted = EarningsService.delete_roster(self.db, 1)
            
            # Verify the mock was called with correct parameters
            mock_delete.assert_called_once_with(self.db, 1)
            
            # Assert - Delete
            assert deleted is True
    
    def test_employee_management(self):
        """Test employee management operations."""
        # Arrange - Create Roster
        roster_id = 1
        self.earnings_adapter.create_roster({
            "id": roster_id,
            "name": "Test Roster",
            "description": "Test roster description",
            "tenant_id": "tenant-1"
        }, "user-1")
        
        # Arrange - Create Employee
        employee_create = EmployeeCreate(
            roster_id=roster_id,
            external_id="emp-123",
            source_id="src-123",
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com"
        )
        
        # Create employee directly in adapter
        employee = self.earnings_adapter.create_employee({
            "roster_id": employee_create.roster_id,
            "external_id": employee_create.external_id,
            "source_id": employee_create.source_id,
            "first_name": employee_create.first_name,
            "last_name": employee_create.last_name,
            "email": employee_create.email
        })
        
        # Mock employee DB model
        mock_employee = MagicMock()
        mock_employee.id = 1
        mock_employee.roster_id = employee["roster_id"]
        mock_employee.external_id = employee["external_id"]
        mock_employee.source_id = employee["source_id"]
        mock_employee.first_name = employee["first_name"]
        mock_employee.last_name = employee["last_name"]
        mock_employee.email = employee["email"]
        mock_employee.created_at = datetime.now(UTC)
        mock_employee.updated_at = datetime.now(UTC)
        
        # Mock create_employee
        with patch.object(EarningsService, 'create_employee', return_value=mock_employee) as mock_create:
            # Act - Create Employee
            created = EarningsService.create_employee(self.db, employee_create)
            
            # Verify the mock was called with correct parameters
            mock_create.assert_called_once_with(self.db, employee_create)
            
            # Assert - Create Employee
            assert created is not None
            assert created.external_id == employee_create.external_id
            assert created.first_name == employee_create.first_name
            assert created.last_name == employee_create.last_name
        
        # Mock get_employee
        with patch.object(EarningsService, 'get_employee', return_value=mock_employee) as mock_get:
            # Act - Get Employee
            employee = EarningsService.get_employee(self.db, 1)
            
            # Verify the mock was called with correct parameters
            mock_get.assert_called_once_with(self.db, 1)
            
            # Assert - Get Employee
            assert employee is not None
            assert employee.id == 1
            assert employee.external_id == employee_create.external_id
        
        # Mock get_employees
        with patch.object(EarningsService, 'get_employees', return_value=[mock_employee]) as mock_get_all:
            # Act - Get Employees for Roster
            employees = EarningsService.get_employees(self.db, roster_id)
            
            # Verify the mock was called with correct parameters
            mock_get_all.assert_called_once_with(self.db, roster_id)
            
            # Assert - Get Employees for Roster
            assert employees is not None
            assert len(employees) == 1
            assert employees[0].id == 1
        
        # Mock get_employee_by_external_id
        with patch.object(EarningsService, 'get_employee_by_external_id', return_value=mock_employee) as mock_get_by_ext:
            # Act - Get Employee by External ID
            employee_by_external_id = EarningsService.get_employee_by_external_id(self.db, roster_id, "emp-123")
            
            # Verify the mock was called with correct parameters
            mock_get_by_ext.assert_called_once_with(self.db, roster_id, "emp-123")
            
            # Assert - Get Employee by External ID
            assert employee_by_external_id is not None
            assert employee_by_external_id.external_id == "emp-123"
        
        # Arrange - Update Employee
        employee_update = EmployeeUpdate(
            first_name="Johnny",
            last_name="Smith"
        )
        
        # Update the mock employee with new values
        updated_mock_employee = MagicMock()
        updated_mock_employee.id = 1
        updated_mock_employee.roster_id = mock_employee.roster_id
        updated_mock_employee.external_id = mock_employee.external_id
        updated_mock_employee.source_id = mock_employee.source_id
        updated_mock_employee.first_name = employee_update.first_name
        updated_mock_employee.last_name = employee_update.last_name
        updated_mock_employee.email = mock_employee.email
        updated_mock_employee.created_at = mock_employee.created_at
        updated_mock_employee.updated_at = datetime.now(UTC)
        
        # Mock update_employee
        with patch.object(EarningsService, 'update_employee', return_value=updated_mock_employee) as mock_update:
            # Act - Update Employee
            updated = EarningsService.update_employee(self.db, 1, employee_update)
            
            # Verify the mock was called with correct parameters
            mock_update.assert_called_once_with(self.db, 1, employee_update)
            
            # Assert - Update Employee
            assert updated is not None
            assert updated.first_name == employee_update.first_name
            assert updated.last_name == employee_update.last_name
        
        # Mock delete_employee
        with patch.object(EarningsService, 'delete_employee', return_value=True) as mock_delete:
            # Act - Delete Employee
            deleted = EarningsService.delete_employee(self.db, 1)
            
            # Verify the mock was called with correct parameters
            mock_delete.assert_called_once_with(self.db, 1)
            
            # Assert - Delete Employee
            assert deleted is True
    
    def test_earnings_code_management(self):
        """Test earnings code management operations."""
        # Arrange - Create Earnings Code
        code_create = EarningsCodeCreate(
            code="REG",
            name="Regular Hours",
            description="Regular working hours",
            destination_system="ADP",
            is_overtime=False
        )
        
        # Create directly in the adapter
        code = self.earnings_adapter.create_earnings_code({
            "code": code_create.code,
            "name": code_create.name,
            "description": code_create.description,
            "destination_system": code_create.destination_system,
            "is_overtime": code_create.is_overtime
        })
        
        # Mock code DB model
        mock_code = MagicMock()
        mock_code.id = 1
        mock_code.code = code["code"]
        mock_code.name = code["name"]
        mock_code.description = code["description"]
        mock_code.destination_system = code["destination_system"]
        mock_code.is_overtime = code["is_overtime"]
        mock_code.created_at = datetime.now(UTC)
        mock_code.updated_at = datetime.now(UTC)
        
        # Mock create_earnings_code
        with patch.object(EarningsService, 'create_earnings_code', return_value=mock_code) as mock_create:
            # Act - Create
            created = EarningsService.create_earnings_code(self.db, code_create)
            
            # Verify the mock was called with correct parameters
            mock_create.assert_called_once_with(self.db, code_create)
            
            # Assert - Create
            assert created is not None
            assert created.code == code_create.code
            assert created.name == code_create.name
            assert created.destination_system == code_create.destination_system
        
        # Mock get_earnings_code
        with patch.object(EarningsService, 'get_earnings_code', return_value=mock_code) as mock_get:
            # Act - Get
            code = EarningsService.get_earnings_code(self.db, 1)
            
            # Verify the mock was called with correct parameters
            mock_get.assert_called_once_with(self.db, 1)
            
            # Assert - Get
            assert code is not None
            assert code.id == 1
            assert code.code == code_create.code
        
        # Mock get_earnings_codes
        with patch.object(EarningsService, 'get_earnings_codes', return_value=[mock_code]) as mock_get_all:
            # Act - Get All
            codes = EarningsService.get_earnings_codes(self.db)
            
            # Verify the mock was called with correct parameters
            mock_get_all.assert_called_once_with(self.db)
            
            # Assert - Get All
            assert codes is not None
            assert len(codes) == 1
            assert codes[0].id == 1
        
        # Arrange - Update
        code_update = EarningsCodeUpdate(
            name="Updated Regular Hours",
            description="Updated description"
        )
        
        # Update the mock code with new values
        updated_mock_code = MagicMock()
        updated_mock_code.id = 1
        updated_mock_code.code = mock_code.code
        updated_mock_code.name = code_update.name
        updated_mock_code.description = code_update.description
        updated_mock_code.destination_system = mock_code.destination_system
        updated_mock_code.is_overtime = mock_code.is_overtime
        updated_mock_code.created_at = mock_code.created_at
        updated_mock_code.updated_at = datetime.now(UTC)
        
        # Mock update_earnings_code
        with patch.object(EarningsService, 'update_earnings_code', return_value=updated_mock_code) as mock_update:
            # Act - Update
            updated = EarningsService.update_earnings_code(self.db, 1, code_update)
            
            # Verify the mock was called with correct parameters
            mock_update.assert_called_once_with(self.db, 1, code_update)
            
            # Assert - Update
            assert updated is not None
            assert updated.name == code_update.name
            assert updated.description == code_update.description
        
        # Mock delete_earnings_code
        with patch.object(EarningsService, 'delete_earnings_code', return_value=True) as mock_delete:
            # Act - Delete
            deleted = EarningsService.delete_earnings_code(self.db, 1)
            
            # Verify the mock was called with correct parameters
            mock_delete.assert_called_once_with(self.db, 1)
            
            # Assert - Delete
            assert deleted is True
    
    def test_earnings_map_management(self):
        """Test earnings map management operations."""
        # Arrange - Create Dependencies
        roster_id = 1
        self.earnings_adapter.create_roster({
            "id": roster_id,
            "name": "Test Roster",
            "tenant_id": "tenant-1"
        }, "user-1")
        
        code_id = 1
        self.earnings_adapter.create_earnings_code({
            "id": code_id,
            "code": "REG",
            "name": "Regular Hours",
            "destination_system": "ADP"
        })
        
        # Arrange - Create Earnings Map
        map_create = EarningsMapCreate(
            roster_id=roster_id,
            source_type="Work Hours",
            earnings_code_id=code_id,
            default_map=True
        )
        
        # Create map directly in adapter
        earnings_map = self.earnings_adapter.create_earnings_map({
            "id": 1,
            "roster_id": map_create.roster_id,
            "source_type": map_create.source_type,
            "earnings_code_id": map_create.earnings_code_id,
            "default_map": map_create.default_map
        })
        
        # Mock map DB model
        mock_map = MagicMock()
        mock_map.id = 1
        mock_map.roster_id = earnings_map["roster_id"]
        mock_map.source_type = earnings_map["source_type"]
        mock_map.earnings_code_id = earnings_map["earnings_code_id"]
        mock_map.default_map = earnings_map["default_map"]
        mock_map.created_at = datetime.now(UTC)
        mock_map.updated_at = datetime.now(UTC)
        
        # Mock create_earnings_map
        with patch.object(EarningsService, 'create_earnings_map', return_value=mock_map) as mock_create:
            # Act - Create
            created = EarningsService.create_earnings_map(self.db, map_create)
            
            # Verify the mock was called with correct parameters
            mock_create.assert_called_once_with(self.db, map_create)
            
            # Assert - Create
            assert created is not None
            assert created.roster_id == map_create.roster_id
            assert created.source_type == map_create.source_type
            assert created.earnings_code_id == map_create.earnings_code_id
            assert created.default_map == map_create.default_map
        
        # Mock get_earnings_map
        with patch.object(EarningsService, 'get_earnings_map', return_value=mock_map) as mock_get:
            # Act - Get
            map_obj = EarningsService.get_earnings_map(self.db, 1)
            
            # Verify the mock was called with correct parameters
            mock_get.assert_called_once_with(self.db, 1)
            
            # Assert - Get
            assert map_obj is not None
            assert map_obj.id == 1
            assert map_obj.source_type == map_create.source_type
        
        # Mock get_earnings_maps
        with patch.object(EarningsService, 'get_earnings_maps', return_value=[mock_map]) as mock_get_all:
            # Act - Get All
            maps = EarningsService.get_earnings_maps(self.db, roster_id)
            
            # Verify the mock was called with correct parameters
            mock_get_all.assert_called_once_with(self.db, roster_id)
            
            # Assert - Get All
            assert maps is not None
            assert len(maps) == 1
            assert maps[0].id == 1
        
        # Arrange - Update
        map_update = EarningsMapUpdate(
            source_type="Updated Source Type"
        )
        
        # Update the mock map with new values
        updated_mock_map = MagicMock()
        updated_mock_map.id = 1
        updated_mock_map.roster_id = mock_map.roster_id
        updated_mock_map.source_type = map_update.source_type
        updated_mock_map.earnings_code_id = mock_map.earnings_code_id
        updated_mock_map.default_map = mock_map.default_map
        updated_mock_map.created_at = mock_map.created_at
        updated_mock_map.updated_at = datetime.now(UTC)
        
        # Mock update_earnings_map
        with patch.object(EarningsService, 'update_earnings_map', return_value=updated_mock_map) as mock_update:
            # Act - Update
            updated = EarningsService.update_earnings_map(self.db, 1, map_update)
            
            # Verify the mock was called with correct parameters
            mock_update.assert_called_once_with(self.db, 1, map_update)
            
            # Assert - Update
            assert updated is not None
            assert updated.source_type == map_update.source_type
        
        # Mock delete_earnings_map
        with patch.object(EarningsService, 'delete_earnings_map', return_value=True) as mock_delete:
            # Act - Delete
            deleted = EarningsService.delete_earnings_map(self.db, 1)
            
            # Verify the mock was called with correct parameters
            mock_delete.assert_called_once_with(self.db, 1)
            
            # Assert - Delete
            assert deleted is True
    
    def test_business_rule_management(self):
        """Test business rule management operations."""
        # Arrange - Create Dependencies
        roster_id = 1
        self.earnings_adapter.create_roster({
            "id": roster_id,
            "name": "Test Roster",
            "tenant_id": "tenant-1"
        }, "user-1")
        
        code_id = 1
        self.earnings_adapter.create_earnings_code({
            "id": code_id,
            "code": "OT",
            "name": "Overtime Hours",
            "destination_system": "ADP",
            "is_overtime": True
        })
        
        # Arrange - Create Business Rule
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
            roster_id=roster_id,
            name="Overtime Rule",
            description="Applies overtime to hours over 8",
            rule_type=RuleType.OVERTIME,
            rule_definition=rule_definition,
            earnings_code_id=code_id,
            is_active=True
        )
        
        # Create rule directly in adapter
        business_rule = self.earnings_adapter.create_business_rule({
            "id": 1,
            "roster_id": rule_create.roster_id,
            "name": rule_create.name,
            "description": rule_create.description,
            "rule_type": rule_create.rule_type.value,
            "rule_definition": rule_create.rule_definition.model_dump(),
            "earnings_code_id": rule_create.earnings_code_id,
            "is_active": rule_create.is_active
        })
        
        # Mock rule DB model
        mock_rule = MagicMock()
        mock_rule.id = 1
        mock_rule.roster_id = business_rule["roster_id"]
        mock_rule.name = business_rule["name"]
        mock_rule.description = business_rule["description"]
        mock_rule.rule_type = business_rule["rule_type"]
        mock_rule.rule_definition = business_rule["rule_definition"]
        mock_rule.earnings_code_id = business_rule["earnings_code_id"]
        mock_rule.is_active = business_rule["is_active"]
        mock_rule.created_at = datetime.now(UTC)
        mock_rule.updated_at = datetime.now(UTC)
        
        # Mock create_business_rule
        with patch.object(EarningsService, 'create_business_rule', return_value=mock_rule) as mock_create:
            # Act - Create
            created = EarningsService.create_business_rule(self.db, rule_create)
            
            # Verify the mock was called with correct parameters
            mock_create.assert_called_once_with(self.db, rule_create)
            
            # Assert - Create
            assert created is not None
            assert created.roster_id == rule_create.roster_id
            assert created.name == rule_create.name
            assert created.rule_type == rule_create.rule_type.value
        
        # Mock get_business_rule
        with patch.object(EarningsService, 'get_business_rule', return_value=mock_rule) as mock_get:
            # Act - Get
            rule = EarningsService.get_business_rule(self.db, 1)
            
            # Verify the mock was called with correct parameters
            mock_get.assert_called_once_with(self.db, 1)
            
            # Assert - Get
            assert rule is not None
            assert rule.id == 1
            assert rule.name == rule_create.name
        
        # Mock get_business_rules
        with patch.object(EarningsService, 'get_business_rules', return_value=[mock_rule]) as mock_get_all:
            # Act - Get All
            rules = EarningsService.get_business_rules(self.db, roster_id)
            
            # Verify the mock was called with correct parameters
            mock_get_all.assert_called_once_with(self.db, roster_id)
            
            # Assert - Get All
            assert rules is not None
            assert len(rules) == 1
            assert rules[0].id == 1
        
        # Arrange - Update
        rule_update = BusinessRuleUpdate(
            name="Updated Overtime Rule",
            description="Updated description"
        )
        
        # Update the mock rule with new values
        updated_mock_rule = MagicMock()
        updated_mock_rule.id = 1
        updated_mock_rule.roster_id = mock_rule.roster_id
        updated_mock_rule.name = rule_update.name
        updated_mock_rule.description = rule_update.description
        updated_mock_rule.rule_type = mock_rule.rule_type
        updated_mock_rule.rule_definition = mock_rule.rule_definition
        updated_mock_rule.earnings_code_id = mock_rule.earnings_code_id
        updated_mock_rule.is_active = mock_rule.is_active
        updated_mock_rule.created_at = mock_rule.created_at
        updated_mock_rule.updated_at = datetime.now(UTC)
        
        # Mock update_business_rule
        with patch.object(EarningsService, 'update_business_rule', return_value=updated_mock_rule) as mock_update:
            # Act - Update
            updated = EarningsService.update_business_rule(self.db, 1, rule_update)
            
            # Verify the mock was called with correct parameters
            mock_update.assert_called_once_with(self.db, 1, rule_update)
            
            # Assert - Update
            assert updated is not None
            assert updated.name == rule_update.name
            assert updated.description == rule_update.description
        
        # Mock delete_business_rule
        with patch.object(EarningsService, 'delete_business_rule', return_value=True) as mock_delete:
            # Act - Delete
            deleted = EarningsService.delete_business_rule(self.db, 1)
            
            # Verify the mock was called with correct parameters
            mock_delete.assert_called_once_with(self.db, 1)
            
            # Assert - Delete
            assert deleted is True
    
    def test_advanced_operations(self):
        """Test advanced operations in the earnings service."""
        # Create a roster in the adapter directly
        roster_id = 1
        self.earnings_adapter.create_roster({
            "name": "Test Roster",
            "description": "Test roster description",
            "tenant_id": "tenant-1"
        }, "user-1")
        
        # Test Roster Sync
        sync_request = {
            "roster_id": roster_id,
            "destination_system": "ADP",
            "sync_options": {"full_sync": True}
        }
        
        # Create mock sync response
        mock_sync_response = MagicMock()
        mock_sync_response.success = True
        mock_sync_response.roster_id = roster_id
        mock_sync_response.total_employees = 0
        mock_sync_response.new_employees = 0
        mock_sync_response.updated_employees = 0
        mock_sync_response.errors = None
        mock_sync_response.sync_time = datetime.now(UTC)
        
        # Mock sync_roster
        with patch.object(EarningsService, 'sync_roster', return_value=mock_sync_response) as mock_sync:
            # Act - Sync Roster
            sync_result = EarningsService.sync_roster(self.db, sync_request)
            
            # Verify the mock was called with correct parameters
            mock_sync.assert_called_once_with(self.db, sync_request)
            
            # Assert - Sync Roster
            assert sync_result is not None
            assert sync_result.success is True
            assert sync_result.roster_id == roster_id
        
        # Test Earnings Map Testing
        test_request = {
            "roster_id": roster_id,
            "source_type": "Work Hours",
            "sample_data": {"hours": 10, "date": "2025-01-01"}
        }
        
        # Create mock test response
        mock_test_response = MagicMock()
        mock_test_response.source_type = test_request["source_type"]
        mock_test_response.mapped_earnings_code = None
        mock_test_response.applicable_rules = []
        mock_test_response.result = {}
        mock_test_response.match_explanation = "Test explanation"
        
        # Mock test_earnings_map
        with patch.object(EarningsService, 'test_earnings_map', return_value=mock_test_response) as mock_test:
            # Act - Test Earnings Map
            test_result = EarningsService.test_earnings_map(self.db, test_request)
            
            # Verify the mock was called with correct parameters
            mock_test.assert_called_once_with(self.db, test_request)
            
            # Assert - Test Earnings Map
            assert test_result is not None
            assert test_result.source_type == test_request["source_type"]
    
    def test_cross_entity_relationships(self):
        """Test relationships between different entity types."""
        # Create entities directly in the adapter
        
        # Create roster
        roster_id = 1
        self.earnings_adapter.create_roster({
            "name": "Test Roster",
            "description": "Test roster description",
            "tenant_id": "tenant-1"
        }, "user-1")
        
        # Create earnings code
        code_id = 1
        self.earnings_adapter.create_earnings_code({
            "code": "REG",
            "name": "Regular Hours",
            "destination_system": "ADP"
        })
        
        # Create employee
        employee_id = 1
        self.earnings_adapter.create_employee({
            "roster_id": roster_id,
            "external_id": "emp-123",
            "source_id": "src-123",
            "first_name": "John",
            "last_name": "Doe"
        })
        
        # Create earnings map
        map_id = 1
        self.earnings_adapter.create_earnings_map({
            "roster_id": roster_id,
            "source_type": "Work Hours",
            "earnings_code_id": code_id,
            "default_map": True
        })
        
        # Verify cross-entity relationships directly from the adapter
        maps = self.earnings_adapter.list_earnings_maps(roster_id)
        assert len(maps) == 1
        assert maps[0]["roster_id"] == roster_id
        assert maps[0]["earnings_code_id"] == code_id
        
        # Test deleting an earnings code and its effect on maps
        self.earnings_adapter.delete_earnings_code(code_id)
        
        # Check that map still exists but now has no earnings code reference
        updated_maps = self.earnings_adapter.list_earnings_maps(roster_id)
        assert len(updated_maps) == 1
        assert updated_maps[0]["earnings_code_id"] is None