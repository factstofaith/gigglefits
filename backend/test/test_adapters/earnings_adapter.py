"""
Earnings Test Adapter

This module provides a test adapter for earnings functionality, implementing the BaseTestAdapter pattern.
"""

import uuid
from datetime import datetime, UTC
from typing import Dict, List, Optional, Any, Union

from .entity_registry import BaseTestAdapter, EntityAction


class EarningsTestAdapter(BaseTestAdapter):
    """Test adapter for earnings functionality."""
    
    def __init__(self, registry=None):
        """Initialize the adapter with an entity registry."""
        super().__init__(registry)
        self.rosters = {}
        self.employees = {}
        self.employee_earnings = {}
        self.earnings_codes = {}
        self.earnings_maps = {}
        self.business_rules = {}
        
        # Register listeners for relevant entity types
        self.registry.register_listener("Employee", self._handle_entity_change)
        self.registry.register_listener("EarningsCode", self._handle_entity_change)
    
    def reset(self):
        """Reset the adapter state."""
        self.rosters = {}
        self.employees = {}
        self.employee_earnings = {}
        self.earnings_codes = {}
        self.earnings_maps = {}
        self.business_rules = {}
    
    # Roster methods
    def create_roster(self, roster_data: Dict[str, Any], owner_id: str) -> Dict[str, Any]:
        """Create a new employee roster."""
        roster_id = len(self.rosters) + 1
        
        # Create timestamps
        now = datetime.now(UTC)
        
        # Create the roster
        roster = {
            "id": roster_id,
            "created_at": now,
            "updated_at": now,
            "last_sync_at": None,
            "owner_id": owner_id,
            **roster_data
        }
        
        self.rosters[roster_id] = roster
        
        # Register the entity with the registry
        self._register_entity("EmployeeRoster", str(roster_id), roster)
        
        return roster
    
    def get_roster(self, roster_id: int) -> Optional[Dict[str, Any]]:
        """Get an employee roster by ID."""
        return self.rosters.get(roster_id)
    
    def update_roster(self, roster_id: int, roster_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an employee roster."""
        if roster_id not in self.rosters:
            return None
        
        # Update the roster
        roster = self.rosters[roster_id]
        roster.update({
            "updated_at": datetime.now(UTC),
            **roster_data
        })
        
        # Update the entity in the registry
        self._update_entity("EmployeeRoster", str(roster_id), roster)
        
        return roster
    
    def delete_roster(self, roster_id: int) -> bool:
        """Delete an employee roster."""
        if roster_id not in self.rosters:
            return False
        
        # Delete related employees
        employees_to_delete = []
        for employee_id, employee in self.employees.items():
            if employee["roster_id"] == roster_id:
                employees_to_delete.append(employee_id)
        
        for employee_id in employees_to_delete:
            self.delete_employee(employee_id)
        
        # Delete related earnings maps
        maps_to_delete = []
        for map_id, earnings_map in self.earnings_maps.items():
            if earnings_map["roster_id"] == roster_id:
                maps_to_delete.append(map_id)
        
        for map_id in maps_to_delete:
            self.delete_earnings_map(map_id)
        
        # Delete related business rules
        rules_to_delete = []
        for rule_id, rule in self.business_rules.items():
            if rule["roster_id"] == roster_id:
                rules_to_delete.append(rule_id)
        
        for rule_id in rules_to_delete:
            self.delete_business_rule(rule_id)
        
        # Delete the roster
        del self.rosters[roster_id]
        
        # Delete the entity from the registry
        self._delete_entity("EmployeeRoster", str(roster_id))
        
        return True
    
    def list_rosters(self, tenant_id=None) -> List[Dict[str, Any]]:
        """List all employee rosters with optional tenant filtering."""
        if tenant_id:
            return [r for r in self.rosters.values() if r.get("tenant_id") == tenant_id]
        return list(self.rosters.values())
    
    # Employee methods
    def create_employee(self, employee_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new employee."""
        employee_id = len(self.employees) + 1
        
        # Create timestamps
        now = datetime.now(UTC)
        
        # Create the employee
        employee = {
            "id": employee_id,
            "created_at": now,
            "updated_at": now,
            **employee_data
        }
        
        self.employees[employee_id] = employee
        
        # Register the entity with the registry
        self._register_entity("Employee", str(employee_id), employee)
        
        return employee
    
    def bulk_create_employees(self, roster_id: int, employees_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Bulk create employees for a roster."""
        created_employees = []
        
        for employee_data in employees_data:
            # Check if employee with the same external_id exists in this roster
            existing_employee = None
            for emp in self.employees.values():
                if (emp["roster_id"] == roster_id and 
                    emp.get("external_id") == employee_data.get("external_id")):
                    existing_employee = emp
                    break
            
            if existing_employee:
                # Update existing employee
                employee_id = existing_employee["id"]
                existing_employee.update({
                    "updated_at": datetime.now(UTC),
                    **{k: v for k, v in employee_data.items() if k != "roster_id" and k != "external_id"}
                })
                
                # Update the entity in the registry
                self._update_entity("Employee", str(employee_id), existing_employee)
                
                created_employees.append(existing_employee)
            else:
                # Create new employee
                employee = self.create_employee({
                    "roster_id": roster_id,
                    **employee_data
                })
                created_employees.append(employee)
        
        return created_employees
    
    def get_employee(self, employee_id: int) -> Optional[Dict[str, Any]]:
        """Get an employee by ID."""
        return self.employees.get(employee_id)
    
    def get_employee_by_external_id(self, roster_id: int, external_id: str) -> Optional[Dict[str, Any]]:
        """Get an employee by external ID within a roster."""
        for employee in self.employees.values():
            if (employee["roster_id"] == roster_id and 
                employee.get("external_id") == external_id):
                return employee
        return None
    
    def update_employee(self, employee_id: int, employee_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an employee."""
        if employee_id not in self.employees:
            return None
        
        # Update the employee
        employee = self.employees[employee_id]
        employee.update({
            "updated_at": datetime.now(UTC),
            **employee_data
        })
        
        # Update the entity in the registry
        self._update_entity("Employee", str(employee_id), employee)
        
        return employee
    
    def delete_employee(self, employee_id: int) -> bool:
        """Delete an employee."""
        if employee_id not in self.employees:
            return False
        
        # Delete related earnings records
        earnings_to_delete = []
        for earnings_id, earnings in self.employee_earnings.items():
            if earnings["employee_id"] == employee_id:
                earnings_to_delete.append(earnings_id)
        
        for earnings_id in earnings_to_delete:
            del self.employee_earnings[earnings_id]
            self._delete_entity("EmployeeEarnings", str(earnings_id))
        
        # Delete the employee
        del self.employees[employee_id]
        
        # Delete the entity from the registry
        self._delete_entity("Employee", str(employee_id))
        
        return True
    
    def list_employees(self, roster_id: int) -> List[Dict[str, Any]]:
        """List all employees for a specific roster."""
        return [e for e in self.employees.values() if e["roster_id"] == roster_id]
    
    # Employee Earnings methods
    def create_employee_earnings(self, earnings_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new employee earnings record."""
        earnings_id = len(self.employee_earnings) + 1
        
        # Create timestamp
        now = datetime.now(UTC)
        
        # Create the earnings record
        earnings = {
            "id": earnings_id,
            "created_at": now,
            **earnings_data
        }
        
        self.employee_earnings[earnings_id] = earnings
        
        # Register the entity with the registry
        self._register_entity("EmployeeEarnings", str(earnings_id), earnings)
        
        return earnings
    
    def bulk_create_employee_earnings(self, earnings_data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Bulk create employee earnings records."""
        created_earnings = []
        
        for earnings_data in earnings_data_list:
            earnings = self.create_employee_earnings(earnings_data)
            created_earnings.append(earnings)
        
        return created_earnings
    
    def get_employee_earnings(self, employee_id: int) -> List[Dict[str, Any]]:
        """Get earnings for a specific employee."""
        return [e for e in self.employee_earnings.values() if e["employee_id"] == employee_id]
    
    # Earnings Code methods
    def create_earnings_code(self, code_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new earnings code."""
        code_id = len(self.earnings_codes) + 1
        
        # Create timestamps
        now = datetime.now(UTC)
        
        # Create the earnings code
        code = {
            "id": code_id,
            "created_at": now,
            "updated_at": now,
            **code_data
        }
        
        self.earnings_codes[code_id] = code
        
        # Register the entity with the registry
        self._register_entity("EarningsCode", str(code_id), code)
        
        return code
    
    def get_earnings_code(self, code_id: int) -> Optional[Dict[str, Any]]:
        """Get an earnings code by ID."""
        return self.earnings_codes.get(code_id)
    
    def update_earnings_code(self, code_id: int, code_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an earnings code."""
        if code_id not in self.earnings_codes:
            return None
        
        # Update the earnings code
        code = self.earnings_codes[code_id]
        code.update({
            "updated_at": datetime.now(UTC),
            **code_data
        })
        
        # Update the entity in the registry
        self._update_entity("EarningsCode", str(code_id), code)
        
        return code
    
    def delete_earnings_code(self, code_id: int) -> bool:
        """Delete an earnings code."""
        if code_id not in self.earnings_codes:
            return False
        
        # Remove references from earnings maps
        for map_id, earnings_map in self.earnings_maps.items():
            if earnings_map["earnings_code_id"] == code_id:
                # Just remove the reference, don't delete the map
                earnings_map["earnings_code_id"] = None
                self._update_entity("EarningsMap", str(map_id), earnings_map)
        
        # Remove references from business rules
        for rule_id, rule in self.business_rules.items():
            if rule.get("earnings_code_id") == code_id:
                # Just remove the reference, don't delete the rule
                rule["earnings_code_id"] = None
                self._update_entity("BusinessRule", str(rule_id), rule)
        
        # Delete the earnings code
        del self.earnings_codes[code_id]
        
        # Delete the entity from the registry
        self._delete_entity("EarningsCode", str(code_id))
        
        return True
    
    def list_earnings_codes(self, destination_system=None) -> List[Dict[str, Any]]:
        """List all earnings codes with optional destination system filtering."""
        if destination_system:
            return [c for c in self.earnings_codes.values() if c.get("destination_system") == destination_system]
        return list(self.earnings_codes.values())
    
    # Earnings Map methods
    def create_earnings_map(self, map_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new earnings map."""
        map_id = len(self.earnings_maps) + 1
        
        # Create timestamps
        now = datetime.now(UTC)
        
        # If this is a default map, unset any existing defaults for the same source type
        if map_data.get("default_map", False):
            for existing_map in self.earnings_maps.values():
                if (existing_map["roster_id"] == map_data["roster_id"] and
                    existing_map["source_type"] == map_data["source_type"] and
                    existing_map.get("default_map", False)):
                    existing_map["default_map"] = False
                    self._update_entity("EarningsMap", str(existing_map["id"]), existing_map)
        
        # Create the earnings map
        earnings_map = {
            "id": map_id,
            "created_at": now,
            "updated_at": now,
            **map_data
        }
        
        self.earnings_maps[map_id] = earnings_map
        
        # Register the entity with the registry
        self._register_entity("EarningsMap", str(map_id), earnings_map)
        
        return earnings_map
    
    def get_earnings_map(self, map_id: int) -> Optional[Dict[str, Any]]:
        """Get an earnings map by ID."""
        return self.earnings_maps.get(map_id)
    
    def update_earnings_map(self, map_id: int, map_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an earnings map."""
        if map_id not in self.earnings_maps:
            return None
        
        earnings_map = self.earnings_maps[map_id]
        
        # If setting as default, unset any existing defaults
        if map_data.get("default_map", False):
            source_type = map_data.get("source_type", earnings_map["source_type"])
            for existing_map in self.earnings_maps.values():
                if (existing_map["id"] != map_id and
                    existing_map["roster_id"] == earnings_map["roster_id"] and
                    existing_map["source_type"] == source_type and
                    existing_map.get("default_map", False)):
                    existing_map["default_map"] = False
                    self._update_entity("EarningsMap", str(existing_map["id"]), existing_map)
        
        # Update the earnings map
        earnings_map.update({
            "updated_at": datetime.now(UTC),
            **map_data
        })
        
        # Update the entity in the registry
        self._update_entity("EarningsMap", str(map_id), earnings_map)
        
        return earnings_map
    
    def delete_earnings_map(self, map_id: int) -> bool:
        """Delete an earnings map."""
        if map_id not in self.earnings_maps:
            return False
        
        # Delete the earnings map
        del self.earnings_maps[map_id]
        
        # Delete the entity from the registry
        self._delete_entity("EarningsMap", str(map_id))
        
        return True
    
    def list_earnings_maps(self, roster_id: int) -> List[Dict[str, Any]]:
        """List all earnings maps for a specific roster."""
        return [m for m in self.earnings_maps.values() if m["roster_id"] == roster_id]
    
    # Business Rule methods
    def create_business_rule(self, rule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new business rule."""
        rule_id = len(self.business_rules) + 1
        
        # Create timestamps
        now = datetime.now(UTC)
        
        # Create the business rule
        rule = {
            "id": rule_id,
            "created_at": now,
            "updated_at": now,
            **rule_data
        }
        
        self.business_rules[rule_id] = rule
        
        # Register the entity with the registry
        self._register_entity("BusinessRule", str(rule_id), rule)
        
        return rule
    
    def get_business_rule(self, rule_id: int) -> Optional[Dict[str, Any]]:
        """Get a business rule by ID."""
        return self.business_rules.get(rule_id)
    
    def update_business_rule(self, rule_id: int, rule_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a business rule."""
        if rule_id not in self.business_rules:
            return None
        
        # Update the business rule
        rule = self.business_rules[rule_id]
        rule.update({
            "updated_at": datetime.now(UTC),
            **rule_data
        })
        
        # Update the entity in the registry
        self._update_entity("BusinessRule", str(rule_id), rule)
        
        return rule
    
    def delete_business_rule(self, rule_id: int) -> bool:
        """Delete a business rule."""
        if rule_id not in self.business_rules:
            return False
        
        # Delete the business rule
        del self.business_rules[rule_id]
        
        # Delete the entity from the registry
        self._delete_entity("BusinessRule", str(rule_id))
        
        return True
    
    def list_business_rules(self, roster_id: int) -> List[Dict[str, Any]]:
        """List all business rules for a specific roster."""
        return [r for r in self.business_rules.values() if r["roster_id"] == roster_id]
    
    # Advanced operations
    def sync_roster(self, roster_id: int, destination_system: str) -> Dict[str, Any]:
        """Simulate syncing a roster with a destination system."""
        if roster_id not in self.rosters:
            return {
                "success": False,
                "roster_id": roster_id,
                "total_employees": 0,
                "new_employees": 0,
                "updated_employees": 0,
                "errors": ["Roster not found"],
                "sync_time": datetime.now(UTC)
            }
        
        # Update the roster's last_sync_at
        self.rosters[roster_id]["last_sync_at"] = datetime.now(UTC)
        self._update_entity("EmployeeRoster", str(roster_id), self.rosters[roster_id])
        
        # Simulate a successful sync
        return {
            "success": True,
            "roster_id": roster_id,
            "total_employees": len(self.list_employees(roster_id)),
            "new_employees": 0,
            "updated_employees": 0,
            "errors": None,
            "sync_time": datetime.now(UTC)
        }
    
    def test_earnings_map(self, roster_id: int, source_type: str, sample_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate testing an earnings map with sample data."""
        # Find applicable maps
        applicable_maps = [
            m for m in self.earnings_maps.values() 
            if m["roster_id"] == roster_id and m["source_type"] == source_type
        ]
        
        if not applicable_maps:
            return {
                "source_type": source_type,
                "mapped_earnings_code": None,
                "applicable_rules": [],
                "result": {},
                "match_explanation": "No applicable earnings maps found for this source type."
            }
        
        # Find default map
        default_map = None
        for m in applicable_maps:
            if m.get("default_map", False):
                default_map = m
                break
        
        # Get the earnings code for the default map
        mapped_code = None
        if default_map and "earnings_code_id" in default_map:
            mapped_code = self.earnings_codes.get(default_map["earnings_code_id"])
        
        # Find applicable business rules
        applicable_rules = [
            r for r in self.business_rules.values()
            if r["roster_id"] == roster_id and r.get("is_active", True)
        ]
        
        return {
            "source_type": source_type,
            "mapped_earnings_code": mapped_code,
            "applicable_rules": applicable_rules,
            "result": sample_data,
            "match_explanation": "Default mapping applied."
        }
    
    def _handle_entity_change(self, entity_type: str, entity_id: str, entity: Any, action: str) -> None:
        """
        Handle entity changes from the registry.
        
        This method is called when entities are changed in the registry.
        """
        # Handle Employee entity changes
        if entity_type == "Employee" and action == EntityAction.DELETE:
            employee_id = int(entity_id)
            if employee_id in self.employees:
                self.delete_employee(employee_id)
        
        # Handle EarningsCode entity changes
        if entity_type == "EarningsCode":
            code_id = int(entity_id)
            if action == EntityAction.CREATE:
                if code_id not in self.earnings_codes:
                    self.earnings_codes[code_id] = entity
            elif action == EntityAction.UPDATE:
                if code_id in self.earnings_codes:
                    self.earnings_codes[code_id].update(entity)
            elif action == EntityAction.DELETE:
                if code_id in self.earnings_codes:
                    self.delete_earnings_code(code_id)