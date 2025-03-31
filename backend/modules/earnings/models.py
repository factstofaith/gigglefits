"""
Employee Earnings Mapping Models

This module defines the Pydantic models for employee earnings mapping in the TAP platform.
"""

from enum import Enum
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator

class RuleType(str, Enum):
    """Types of business rules for earnings calculations"""
    OVERTIME = "overtime"
    PREMIUM = "premium"
    HOLIDAY = "holiday" 
    REGULAR = "regular"
    BONUS = "bonus"
    CUSTOM = "custom"

class ConditionOperator(str, Enum):
    """Operators for condition expressions in mapping rules"""
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    GREATER_EQUAL = "greater_equal"
    LESS_EQUAL = "less_equal"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    IN = "in"
    NOT_IN = "not_in"
    REGEX = "regex"

class EmployeeRosterBase(BaseModel):
    """Base model for employee roster data"""
    name: str
    source_id: Optional[str] = None
    destination_id: Optional[str] = None
    description: Optional[str] = None
    tenant_id: Optional[str] = None

class EmployeeRosterCreate(EmployeeRosterBase):
    """Model for creating a new employee roster"""
    pass

class EmployeeRosterUpdate(BaseModel):
    """Model for updating an employee roster"""
    name: Optional[str] = None
    source_id: Optional[str] = None
    destination_id: Optional[str] = None
    description: Optional[str] = None

class EmployeeRoster(EmployeeRosterBase):
    """Complete employee roster model with system fields"""
    id: int
    owner_id: Optional[str] = None
    last_sync_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True

class EmployeeBase(BaseModel):
    """Base model for employee data"""
    roster_id: int
    external_id: str
    source_id: str
    destination_id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

class EmployeeCreate(EmployeeBase):
    """Model for creating a new employee"""
    pass

class EmployeeBulkCreate(BaseModel):
    """Model for bulk creating employees"""
    roster_id: int
    employees: List[EmployeeCreate]

class EmployeeUpdate(BaseModel):
    """Model for updating an employee"""
    external_id: Optional[str] = None
    source_id: Optional[str] = None
    destination_id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

class Employee(EmployeeBase):
    """Complete employee model with system fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True

class EmployeeEarningsBase(BaseModel):
    """Base model for employee earnings data"""
    employee_id: int
    source_type: str
    amount: Optional[str] = None
    hours: Optional[str] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    attributes: Optional[Dict[str, Any]] = None

class EmployeeEarningsCreate(EmployeeEarningsBase):
    """Model for creating new employee earnings"""
    pass

class EmployeeEarningsBulkCreate(BaseModel):
    """Model for bulk creating employee earnings"""
    earnings: List[EmployeeEarningsCreate]

class EmployeeEarnings(EmployeeEarningsBase):
    """Complete employee earnings model with system fields"""
    id: int
    created_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True

class EarningsCodeBase(BaseModel):
    """Base model for earnings code data"""
    code: str
    name: str
    description: Optional[str] = None
    destination_system: str
    is_overtime: bool = False
    attributes: Optional[Dict[str, Any]] = None

class EarningsCodeCreate(EarningsCodeBase):
    """Model for creating a new earnings code"""
    pass

class EarningsCodeUpdate(BaseModel):
    """Model for updating an earnings code"""
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    is_overtime: Optional[bool] = None
    attributes: Optional[Dict[str, Any]] = None

class EarningsCode(EarningsCodeBase):
    """Complete earnings code model with system fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True

class ConditionExpression(BaseModel):
    """Condition expression for conditional mapping"""
    field: str
    operator: ConditionOperator
    value: Any

class EarningsMapBase(BaseModel):
    """Base model for earnings map data"""
    roster_id: int
    source_type: str
    earnings_code_id: int
    default_map: bool = False
    condition: Optional[Union[str, List[ConditionExpression]]] = None

    @field_validator('condition')
    @classmethod
    def validate_condition(cls, v):
        """Convert condition expression list to string format if needed"""
        if isinstance(v, list):
            # Convert to string format for storage
            # This is a simplified implementation
            return str(v)
        return v

class EarningsMapCreate(EarningsMapBase):
    """Model for creating a new earnings map"""
    pass

class EarningsMapUpdate(BaseModel):
    """Model for updating an earnings map"""
    source_type: Optional[str] = None
    earnings_code_id: Optional[int] = None
    default_map: Optional[bool] = None
    condition: Optional[Union[str, List[ConditionExpression]]] = None
    
    @field_validator('condition')
    @classmethod
    def validate_condition(cls, v):
        """Convert condition expression list to string format if needed"""
        if isinstance(v, list):
            # Convert to string format for storage
            return str(v)
        return v

class EarningsMap(EarningsMapBase):
    """Complete earnings map model with system fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True

class BusinessRuleDefinition(BaseModel):
    """Definition of a business rule for earnings calculations"""
    conditions: List[ConditionExpression]
    formula: str
    description: Optional[str] = None

class BusinessRuleBase(BaseModel):
    """Base model for business rule data"""
    roster_id: int
    name: str
    description: Optional[str] = None
    rule_type: RuleType
    rule_definition: BusinessRuleDefinition
    earnings_code_id: Optional[int] = None
    is_active: bool = True

class BusinessRuleCreate(BusinessRuleBase):
    """Model for creating a new business rule"""
    pass

class BusinessRuleUpdate(BaseModel):
    """Model for updating a business rule"""
    name: Optional[str] = None
    description: Optional[str] = None
    rule_type: Optional[RuleType] = None
    rule_definition: Optional[BusinessRuleDefinition] = None
    earnings_code_id: Optional[int] = None
    is_active: Optional[bool] = None

class BusinessRule(BusinessRuleBase):
    """Complete business rule model with system fields"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        """Pydantic config"""
        from_attributes = True

class RosterSyncRequest(BaseModel):
    """Request model for syncing a roster from a destination system"""
    roster_id: int
    source_system: Optional[str] = None
    destination_system: str
    sync_options: Optional[Dict[str, Any]] = None

class RosterSyncResponse(BaseModel):
    """Response model for roster sync operation"""
    success: bool
    roster_id: int
    total_employees: int
    new_employees: int
    updated_employees: int
    errors: Optional[List[str]] = None
    sync_time: datetime

class EarningsMapTestRequest(BaseModel):
    """Request model for testing an earnings map"""
    roster_id: int
    employee_id: Optional[int] = None
    source_type: str
    sample_data: Dict[str, Any]

class EarningsMapTestResponse(BaseModel):
    """Response model for testing an earnings map"""
    source_type: str
    mapped_earnings_code: Optional[EarningsCode] = None
    applicable_rules: List[BusinessRule] = []
    result: Dict[str, Any]
    match_explanation: str