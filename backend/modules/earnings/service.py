"""
Employee Earnings Mapping Service

This module provides services for managing employee rosters, earnings codes, and mappings.
"""
import logging

from typing import List, Optional, Dict, Any, Union, Tuple
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON, Table, Float, Sequence, UniqueConstraint, ForeignKeyConstraint, event
from sqlalchemy.orm import relationship, backref, validates, Session
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
import enum
import uuid

from db.base import Base
from utils.encryption.crypto import EncryptedString, EncryptedJSON
from utils.helpers import generate_uid
from utils.error_handling.exceptions import (
    ApplicationError,
    ValidationError,
    ResourceNotFoundError,
    DatabaseError
)
from utils.error_handling.handlers import with_error_logging
from modules.earnings.models import (
    EmployeeRoster, EmployeeRosterCreate, EmployeeRosterUpdate,
    Employee, EmployeeCreate, EmployeeUpdate, EmployeeBulkCreate,
    EmployeeEarnings, EmployeeEarningsCreate, EmployeeEarningsBulkCreate,
    EarningsCode, EarningsCodeCreate, EarningsCodeUpdate,
    EarningsMap, EarningsMapCreate, EarningsMapUpdate,
    BusinessRule, BusinessRuleCreate, BusinessRuleUpdate,
    RosterSyncRequest, RosterSyncResponse,
    EarningsMapTestRequest, EarningsMapTestResponse
)

# Setup logging
logger = logging.getLogger(__name__)
class EarningsService:
    """Service for employee earnings mapping operations"""
    
    @staticmethod
    def get_rosters(db: Session, skip: int = 0, limit: int = 100, tenant_id: Optional[str] = None) -> List[EmployeeRoster]:
        """Get all employee rosters with optional tenant filtering"""
        query = db.query(EmployeeRoster)
        if tenant_id:
            query = query.filter(EmployeeRoster.tenant_id == tenant_id)
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_roster(db: Session, roster_id: int) -> Optional[EmployeeRoster]:
        """Get a specific employee roster by ID"""
        return db.query(EmployeeRoster).filter(EmployeeRoster.id == roster_id).first()
    
    @staticmethod
    @with_error_logging
    def create_roster(db: Session, roster: EmployeeRosterCreate, owner_id: str) -> EmployeeRoster:
        """Create a new employee roster"""
        try:
            db_roster = EmployeeRoster(
                name=roster.name,
                source_id=roster.source_id,
                destination_id=roster.destination_id,
                description=roster.description,
                tenant_id=roster.tenant_id,
                owner_id=owner_id
            )
            db.add(db_roster)
            db.commit()
            db.refresh(db_roster)
            return db_roster
        except Exception as e:
            logger.error(f"Error in create_roster: {e}")
            raise ApplicationError(message=f"Error in create_roster", original_error=e)
    
    @staticmethod
    @with_error_logging
    def update_roster(db: Session, roster_id: int, roster: EmployeeRosterUpdate) -> Optional[EmployeeRoster]:
        """Update an existing employee roster"""
        try:
            db_roster = db.query(EmployeeRoster).filter(EmployeeRoster.id == roster_id).first()
            if not db_roster:
                raise ResourceNotFoundError(message=f"Roster with ID {roster_id} not found")
            
            update_data = roster.model_dump(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_roster, key, value)
            
            db_roster.updated_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(db_roster)
            return db_roster
        except Exception as e:
            logger.error(f"Error in update_roster: {e}")
            raise ApplicationError(message=f"Error updating roster", original_error=e)
    
    @staticmethod
    @with_error_logging
    def delete_roster(db: Session, roster_id: int) -> bool:
        """Delete an employee roster"""
        try:
            db_roster = db.query(EmployeeRoster).filter(EmployeeRoster.id == roster_id).first()
            if not db_roster:
                return False
            
            db.delete(db_roster)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Error in delete_roster: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error deleting roster", original_error=e)
    
    @staticmethod
    def get_employees(db: Session, roster_id: int, skip: int = 0, limit: int = 100) -> List[Employee]:
        """Get all employees for a specific roster"""
        return db.query(Employee).filter(Employee.roster_id == roster_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_employee(db: Session, employee_id: int) -> Optional[Employee]:
        """Get a specific employee by ID"""
        return db.query(Employee).filter(Employee.id == employee_id).first()
    
    @staticmethod
    def get_employee_by_external_id(db: Session, roster_id: int, external_id: str) -> Optional[Employee]:
        """Get a specific employee by external ID within a roster"""
        return db.query(Employee).filter(
            Employee.roster_id == roster_id, 
            Employee.external_id == external_id
        ).first()
    
    @staticmethod
    @with_error_logging
    def create_employee(db: Session, employee: EmployeeCreate):
        """Create a new employee"""
        try:
            db_employee = Employee(
                roster_id=employee.roster_id,
                external_id=employee.external_id,
                source_id=employee.source_id,
                destination_id=employee.destination_id,
                first_name=employee.first_name,
                last_name=employee.last_name,
                email=employee.email,
                attributes=employee.attributes
            )
            db.add(db_employee)
            db.commit()
            db.refresh(db_employee)
            return db_employee
        except Exception as e:
            logger.error(f"Error in create_employee: {e}")
            raise ApplicationError(message=f"Error in create_employee", original_error=e)
    
    @staticmethod
    def bulk_create_employees(db: Session, bulk_request: EmployeeBulkCreate) -> List[Employee]:
        """Bulk create employees for a roster"""
        new_employees = []
        for employee_data in bulk_request.employees:
            # Check if employee with external_id already exists
            existing = db.query(Employee).filter(
                Employee.roster_id == bulk_request.roster_id,
                Employee.external_id == employee_data.external_id
            ).first()
            
            if existing:
                # Update existing employee
                for key, value in employee_data.model_dump(exclude={'roster_id', 'external_id'}).items():
                    if value is not None:
                        setattr(existing, key, value)
                existing.updated_at = datetime.now(timezone.utc)
                new_employees.append(existing)
            else:
                # Create new employee
                db_employee = Employee(
                    roster_id=bulk_request.roster_id,
                    external_id=employee_data.external_id,
                    source_id=employee_data.source_id,
                    destination_id=employee_data.destination_id,
                    first_name=employee_data.first_name,
                    last_name=employee_data.last_name,
                    email=employee_data.email,
                    attributes=employee_data.attributes
                )
                db.add(db_employee)
                new_employees.append(db_employee)
        
        db.commit()
        for employee in new_employees:
            db.refresh(employee)
        
        return new_employees
    
    @staticmethod
    def update_employee(db: Session, employee_id: int, employee: EmployeeUpdate) -> Optional[Employee]:
        """Update an existing employee"""
        db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not db_employee:
            return None
        
        update_data = employee.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_employee, key, value)
        
        db_employee.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_employee)
        return db_employee
    
    @staticmethod
    @with_error_logging
    def delete_employee(db: Session, employee_id: int):
        """Delete an employee"""
        try:
            db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
            if not db_employee:
                return False
            
            db.delete(db_employee)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Error deleting employee: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error in delete_employee", original_error=e)
        
        # Employee Earnings
    
    @staticmethod
    def get_employee_earnings(db: Session, employee_id: int, skip: int = 0, limit: int = 100) -> List[EmployeeEarnings]:
        """Get earnings for a specific employee"""
        return db.query(EmployeeEarnings).filter(
            EmployeeEarnings.employee_id == employee_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    @with_error_logging
    def create_employee_earnings(db: Session, earnings: EmployeeEarningsCreate):
        """Create a new employee earnings record"""
        try:
            db_earnings = EmployeeEarnings(
                employee_id=earnings.employee_id,
                source_type=earnings.source_type,
                amount=earnings.amount,
                hours=earnings.hours,
                period_start=earnings.period_start,
                period_end=earnings.period_end,
                attributes=earnings.attributes
            )
            db.add(db_earnings)
            db.commit()
            db.refresh(db_earnings)
            return db_earnings
        except Exception as e:
            logger.error(f"Error in create_employee_earnings: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error in create_employee_earnings", original_error=e)
    
    @staticmethod
    def bulk_create_employee_earnings(db: Session, bulk_request: EmployeeEarningsBulkCreate) -> List[EmployeeEarnings]:
        """Bulk create employee earnings records"""
        new_earnings = []
        for earnings_data in bulk_request.earnings:
            db_earnings = EmployeeEarnings(
                employee_id=earnings_data.employee_id,
                source_type=earnings_data.source_type,
                amount=earnings_data.amount,
                hours=earnings_data.hours,
                period_start=earnings_data.period_start,
                period_end=earnings_data.period_end,
                attributes=earnings_data.attributes
            )
            db.add(db_earnings)
            new_earnings.append(db_earnings)
        
        db.commit()
        for earnings in new_earnings:
            db.refresh(earnings)
        
        return new_earnings
    
    # Earnings Codes
    
    @staticmethod
    def get_earnings_codes(db: Session, destination_system: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[EarningsCode]:
        """Get all earnings codes with optional destination system filtering"""
        query = db.query(EarningsCode)
        if destination_system:
            query = query.filter(EarningsCode.destination_system == destination_system)
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_earnings_code(db: Session, code_id: int) -> Optional[EarningsCode]:
        """Get a specific earnings code by ID"""
        return db.query(EarningsCode).filter(EarningsCode.id == code_id).first()
    
    @staticmethod
    @with_error_logging
    def create_earnings_code(db: Session, code: EarningsCodeCreate):
        """Create a new earnings code"""
        try:
            db_code = EarningsCode(
                code=code.code,
                name=code.name,
                description=code.description,
                destination_system=code.destination_system,
                is_overtime=code.is_overtime,
                attributes=code.attributes
            )
            db.add(db_code)
            db.commit()
            db.refresh(db_code)
            return db_code
        except Exception as e:
            logger.error(f"Error in create_earnings_code: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error in create_earnings_code", original_error=e)
    
    @staticmethod
    def update_earnings_code(db: Session, code_id: int, code: EarningsCodeUpdate) -> Optional[EarningsCode]:
        """Update an existing earnings code"""
        db_code = db.query(EarningsCode).filter(EarningsCode.id == code_id).first()
        if not db_code:
            return None
        
        update_data = code.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_code, key, value)
        
        db_code.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_code)
        return db_code
    
    @staticmethod
    @with_error_logging
    def delete_earnings_code(db: Session, code_id: int):
        """Delete an earnings code"""
        try:
            db_code = db.query(EarningsCode).filter(EarningsCode.id == code_id).first()
            if not db_code:
                return False
            
            db.delete(db_code)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Error in delete_earnings_code: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error in delete_earnings_code", original_error=e)
    
    @staticmethod
    def get_earnings_maps(db: Session, roster_id: int, skip: int = 0, limit: int = 100) -> List[EarningsMap]:
        """Get all earnings maps for a specific roster"""
        return db.query(EarningsMap).filter(
            EarningsMap.roster_id == roster_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_earnings_map(db: Session, map_id: int) -> Optional[EarningsMap]:
        """Get a specific earnings map by ID"""
        return db.query(EarningsMap).filter(EarningsMap.id == map_id).first()
    
    @staticmethod
    @with_error_logging
    def create_earnings_map(db: Session, earnings_map: EarningsMapCreate):
        """Create a new earnings map"""
        try:
            # If this is a default map, unset any existing defaults for the same source type
            if earnings_map.default_map:
                existing_defaults = db.query(EarningsMap).filter(
                    EarningsMap.roster_id == earnings_map.roster_id,
                    EarningsMap.source_type == earnings_map.source_type,
                    EarningsMap.default_map == True
                ).all()
                
                for existing in existing_defaults:
                    existing.default_map = False
            
            db_map = EarningsMap(
                roster_id=earnings_map.roster_id,
                source_type=earnings_map.source_type,
                earnings_code_id=earnings_map.earnings_code_id,
                default_map=earnings_map.default_map,
                condition=earnings_map.condition
            )
            db.add(db_map)
            db.commit()
            db.refresh(db_map)
            return db_map
        except Exception as e:
            logger.error(f"Error in create_earnings_map: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error in create_earnings_map", original_error=e)
    
    @staticmethod
    def update_earnings_map(db: Session, map_id: int, earnings_map: EarningsMapUpdate) -> Optional[EarningsMap]:
        """Update an existing earnings map"""
        db_map = db.query(EarningsMap).filter(EarningsMap.id == map_id).first()
        if not db_map:
            return None
        
        # If setting as default, unset any existing defaults
        if earnings_map.default_map and earnings_map.source_type:
            existing_defaults = db.query(EarningsMap).filter(
                EarningsMap.roster_id == db_map.roster_id,
                EarningsMap.source_type == earnings_map.source_type,
                EarningsMap.default_map == True,
                EarningsMap.id != map_id
            ).all()
            
            for existing in existing_defaults:
                existing.default_map = False
        elif earnings_map.default_map and not earnings_map.source_type:
            existing_defaults = db.query(EarningsMap).filter(
                EarningsMap.roster_id == db_map.roster_id,
                EarningsMap.source_type == db_map.source_type,
                EarningsMap.default_map == True,
                EarningsMap.id != map_id
            ).all()
            
            for existing in existing_defaults:
                existing.default_map = False
                
        update_data = earnings_map.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_map, key, value)
        
        db_map.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_map)
        return db_map
    
    @staticmethod
    @with_error_logging
    def delete_earnings_map(db: Session, map_id: int):
        """Delete an earnings map"""
        try:
            db_map = db.query(EarningsMap).filter(EarningsMap.id == map_id).first()
            if not db_map:
                return False
            
            db.delete(db_map)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Error in delete_earnings_map: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error in delete_earnings_map", original_error=e)
    
    @staticmethod
    def get_business_rules(db: Session, roster_id: int, skip: int = 0, limit: int = 100) -> List[BusinessRule]:
        """Get all business rules for a specific roster"""
        return db.query(BusinessRule).filter(
            BusinessRule.roster_id == roster_id
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_business_rule(db: Session, rule_id: int) -> Optional[BusinessRule]:
        """Get a specific business rule by ID"""
        return db.query(BusinessRule).filter(BusinessRule.id == rule_id).first()
    
    @staticmethod
    @with_error_logging
    def create_business_rule(db: Session, rule: BusinessRuleCreate):
        """Create a new business rule"""
        try:
            db_rule = BusinessRule(
                roster_id=rule.roster_id,
                name=rule.name,
                description=rule.description,
                rule_type=rule.rule_type.value,
                rule_definition=rule.rule_definition.model_dump(),
                earnings_code_id=rule.earnings_code_id,
                is_active=rule.is_active
            )
            db.add(db_rule)
            db.commit()
            db.refresh(db_rule)
            return db_rule
        except Exception as e:
            logger.error(f"Error in create_business_rule: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error in create_business_rule", original_error=e)
    
    @staticmethod
    def update_business_rule(db: Session, rule_id: int, rule: BusinessRuleUpdate) -> Optional[BusinessRule]:
        """Update an existing business rule"""
        db_rule = db.query(BusinessRule).filter(BusinessRule.id == rule_id).first()
        if not db_rule:
            return None
        
        update_data = rule.model_dump(exclude_unset=True)
        
        # Handle rule_definition specially
        if 'rule_definition' in update_data:
            update_data['rule_definition'] = update_data['rule_definition'].model_dump()
            
        # Handle rule_type conversion
        if 'rule_type' in update_data:
            update_data['rule_type'] = update_data['rule_type'].value
            
        for key, value in update_data.items():
            setattr(db_rule, key, value)
        
        db_rule.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_rule)
        return db_rule
    
    @staticmethod
    @with_error_logging
    def delete_business_rule(db: Session, rule_id: int):
        """Delete a business rule"""
        try:
            db_rule = db.query(BusinessRule).filter(BusinessRule.id == rule_id).first()
            if not db_rule:
                return False
            
            db.delete(db_rule)
            db.commit()
            return True
        except Exception as e:
            logger.error(f"Error in delete_business_rule: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error in delete_business_rule", original_error=e)
    
    @staticmethod
    @with_error_logging
    def sync_roster(db: Session, sync_request: RosterSyncRequest):
        """
        Sync employee roster from a destination system
        
        This is a placeholder implementation. In a real-world scenario, this would:
        1. Connect to the destination system API
        2. Fetch employee data
        3. Map to the local employee model
        4. Update existing employees or create new ones
        """
        try:
            # Placeholder implementation
            return RosterSyncResponse(
                success=True,
                roster_id=sync_request.roster_id,
                total_employees=0,
                new_employees=0,
                updated_employees=0,
                errors=None,
                sync_time=datetime.now(timezone.utc)
            )
        except Exception as e:
            logger.error(f"Error in sync_roster: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error in sync_roster", original_error=e)
    
    @staticmethod
    @with_error_logging
    def test_earnings_map(db: Session, test_request: EarningsMapTestRequest):
        """
        Test an earnings mapping with sample data
        
        This is a placeholder implementation. In a real-world scenario, this would:
        1. Find all earnings maps that match the source type
        2. Evaluate conditions against the sample data
        3. Find the matching earnings code
        4. Apply any business rules
        5. Return the results
        """
        try:
            # Placeholder implementation
            return EarningsMapTestResponse(
                source_type=test_request.source_type,
                mapped_earnings_code=None,
                applicable_rules=[],
                result={},
                match_explanation="This is a placeholder implementation. The actual mapping logic would be implemented here."
            )
        except Exception as e:
            logger.error(f"Error in test_earnings_map: {e}")
            db.rollback()
            raise ApplicationError(message=f"Error in test_earnings_map", original_error=e)
    
    @staticmethod
    @with_error_logging
    def evaluate_mapping_condition(condition: str, data: Dict[str, Any]):
        """
        Evaluate a mapping condition against the provided data
        
        This is a placeholder implementation. In a real-world scenario, this would:
        1. Parse the condition string into a structured format
        2. Evaluate the condition against the data
        3. Return True if the condition is met, False otherwise
        """
        try:
            # Placeholder implementation
            return True
        except Exception as e:
            logger.error(f"Error evaluating mapping condition: {e}")
            raise ApplicationError(message=f"Error evaluating mapping condition", original_error=e)