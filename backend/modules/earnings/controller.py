"""
Employee Earnings Mapping Controller

This module provides API endpoints for employee earnings mapping functionality.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session

from core.auth import get_current_user, get_current_active_user, get_user_with_permissions
from db.base import get_db
from db.models import User
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
from modules.earnings.service import EarningsService

# Create router for earnings module
router = APIRouter(
    prefix="/earnings",
    tags=["earnings"],
    dependencies=[Depends(get_current_active_user)]
)

# Employee Roster endpoints

@router.get("/rosters", response_model=List[EmployeeRoster])
def get_rosters(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tenant_id: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all employee rosters with optional tenant filtering.
    
    Limited to admin users or users with the specified tenant ID.
    """
    if current_user.role != "admin" and current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access rosters for this tenant"
        )
    
    if current_user.role != "admin":
        # Regular users can only see their tenant's rosters
        tenant_id = current_user.tenant_id
    
    return EarningsService.get_rosters(db, skip, limit, tenant_id)

@router.get("/rosters/{roster_id}", response_model=EmployeeRoster)
def get_roster(
    roster_id: int = Path(..., title="The ID of the roster to get"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific employee roster by ID.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    roster = EarningsService.get_roster(db, roster_id)
    if not roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this roster"
        )
    
    return roster

@router.post("/rosters", response_model=EmployeeRoster, status_code=status.HTTP_201_CREATED)
def create_roster(
    roster: EmployeeRosterCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new employee roster.
    
    Limited to admin users or users for their own tenant.
    """
    if current_user.role != "admin" and (
        roster.tenant_id is not None and 
        roster.tenant_id != current_user.tenant_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create rosters for other tenants"
        )
    
    # If tenant_id not specified for non-admin, set to user's tenant
    if current_user.role != "admin" and roster.tenant_id is None:
        roster.tenant_id = current_user.tenant_id
    
    return EarningsService.create_roster(db, roster, current_user.id)

@router.put("/rosters/{roster_id}", response_model=EmployeeRoster)
def update_roster(
    roster_id: int = Path(..., title="The ID of the roster to update"),
    roster: EmployeeRosterUpdate = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing employee roster.
    
    Limited to admin users or roster owners from the same tenant.
    """
    db_roster = EarningsService.get_roster(db, roster_id)
    if not db_roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and (
        db_roster.tenant_id != current_user.tenant_id or
        db_roster.owner_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this roster"
        )
    
    updated_roster = EarningsService.update_roster(db, roster_id, roster)
    if not updated_roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    return updated_roster

@router.delete("/rosters/{roster_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_roster(
    roster_id: int = Path(..., title="The ID of the roster to delete"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete an employee roster.
    
    Limited to admin users or roster owners from the same tenant.
    """
    db_roster = EarningsService.get_roster(db, roster_id)
    if not db_roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and (
        db_roster.tenant_id != current_user.tenant_id or
        db_roster.owner_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this roster"
        )
    
    result = EarningsService.delete_roster(db, roster_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    return None

# Employee endpoints

@router.get("/rosters/{roster_id}/employees", response_model=List[Employee])
def get_employees(
    roster_id: int = Path(..., title="The ID of the roster to get employees for"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all employees for a specific roster.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    roster = EarningsService.get_roster(db, roster_id)
    if not roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access employees for this roster"
        )
    
    return EarningsService.get_employees(db, roster_id, skip, limit)

@router.get("/employees/{employee_id}", response_model=Employee)
def get_employee(
    employee_id: int = Path(..., title="The ID of the employee to get"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific employee by ID.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    employee = EarningsService.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    roster = EarningsService.get_roster(db, employee.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this employee"
        )
    
    return employee

@router.post("/employees", response_model=Employee, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee: EmployeeCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new employee.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    roster = EarningsService.get_roster(db, employee.roster_id)
    if not roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create employees for this roster"
        )
    
    return EarningsService.create_employee(db, employee)

@router.post("/employees/bulk", response_model=List[Employee], status_code=status.HTTP_201_CREATED)
def bulk_create_employees(
    bulk_request: EmployeeBulkCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Bulk create employees for a roster.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    roster = EarningsService.get_roster(db, bulk_request.roster_id)
    if not roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create employees for this roster"
        )
    
    return EarningsService.bulk_create_employees(db, bulk_request)

@router.put("/employees/{employee_id}", response_model=Employee)
def update_employee(
    employee_id: int = Path(..., title="The ID of the employee to update"),
    employee: EmployeeUpdate = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing employee.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    db_employee = EarningsService.get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    roster = EarningsService.get_roster(db, db_employee.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this employee"
        )
    
    updated_employee = EarningsService.update_employee(db, employee_id, employee)
    if not updated_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return updated_employee

@router.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int = Path(..., title="The ID of the employee to delete"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete an employee.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    db_employee = EarningsService.get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    roster = EarningsService.get_roster(db, db_employee.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this employee"
        )
    
    result = EarningsService.delete_employee(db, employee_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    return None

# Employee Earnings endpoints

@router.get("/employees/{employee_id}/earnings", response_model=List[EmployeeEarnings])
def get_employee_earnings(
    employee_id: int = Path(..., title="The ID of the employee to get earnings for"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get earnings for a specific employee.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    employee = EarningsService.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    roster = EarningsService.get_roster(db, employee.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access earnings for this employee"
        )
    
    return EarningsService.get_employee_earnings(db, employee_id, skip, limit)

@router.post("/employees/earnings", response_model=EmployeeEarnings, status_code=status.HTTP_201_CREATED)
def create_employee_earnings(
    earnings: EmployeeEarningsCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new employee earnings record.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    employee = EarningsService.get_employee(db, earnings.employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    
    roster = EarningsService.get_roster(db, employee.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create earnings for this employee"
        )
    
    return EarningsService.create_employee_earnings(db, earnings)

@router.post("/employees/earnings/bulk", response_model=List[EmployeeEarnings], status_code=status.HTTP_201_CREATED)
def bulk_create_employee_earnings(
    bulk_request: EmployeeEarningsBulkCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Bulk create employee earnings records.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    # Verify access to all employees in the request
    for earnings in bulk_request.earnings:
        employee = EarningsService.get_employee(db, earnings.employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {earnings.employee_id} not found"
            )
        
        roster = EarningsService.get_roster(db, employee.roster_id)
        if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not authorized to create earnings for employee {earnings.employee_id}"
            )
    
    return EarningsService.bulk_create_employee_earnings(db, bulk_request)

# Earnings Codes endpoints

@router.get("/earnings-codes", response_model=List[EarningsCode])
def get_earnings_codes(
    destination_system: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all earnings codes with optional destination system filtering.
    """
    return EarningsService.get_earnings_codes(db, destination_system, skip, limit)

@router.get("/earnings-codes/{code_id}", response_model=EarningsCode)
def get_earnings_code(
    code_id: int = Path(..., title="The ID of the earnings code to get"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific earnings code by ID.
    """
    code = EarningsService.get_earnings_code(db, code_id)
    if not code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Earnings code not found"
        )
    
    return code

@router.post("/earnings-codes", response_model=EarningsCode, status_code=status.HTTP_201_CREATED)
def create_earnings_code(
    code: EarningsCodeCreate,
    current_user: User = Depends(get_user_with_permissions),
    db: Session = Depends(get_db)
):
    """
    Create a new earnings code.
    
    Limited to admin users.
    """
    return EarningsService.create_earnings_code(db, code)

@router.put("/earnings-codes/{code_id}", response_model=EarningsCode)
def update_earnings_code(
    code_id: int = Path(..., title="The ID of the earnings code to update"),
    code: EarningsCodeUpdate = None,
    current_user: User = Depends(get_user_with_permissions),
    db: Session = Depends(get_db)
):
    """
    Update an existing earnings code.
    
    Limited to admin users.
    """
    updated_code = EarningsService.update_earnings_code(db, code_id, code)
    if not updated_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Earnings code not found"
        )
    
    return updated_code

@router.delete("/earnings-codes/{code_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_earnings_code(
    code_id: int = Path(..., title="The ID of the earnings code to delete"),
    current_user: User = Depends(get_user_with_permissions),
    db: Session = Depends(get_db)
):
    """
    Delete an earnings code.
    
    Limited to admin users.
    """
    result = EarningsService.delete_earnings_code(db, code_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Earnings code not found"
        )
    
    return None

# Earnings Maps endpoints

@router.get("/rosters/{roster_id}/earnings-maps", response_model=List[EarningsMap])
def get_earnings_maps(
    roster_id: int = Path(..., title="The ID of the roster to get earnings maps for"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all earnings maps for a specific roster.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    roster = EarningsService.get_roster(db, roster_id)
    if not roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access earnings maps for this roster"
        )
    
    return EarningsService.get_earnings_maps(db, roster_id, skip, limit)

@router.get("/earnings-maps/{map_id}", response_model=EarningsMap)
def get_earnings_map(
    map_id: int = Path(..., title="The ID of the earnings map to get"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific earnings map by ID.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    earnings_map = EarningsService.get_earnings_map(db, map_id)
    if not earnings_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Earnings map not found"
        )
    
    roster = EarningsService.get_roster(db, earnings_map.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this earnings map"
        )
    
    return earnings_map

@router.post("/earnings-maps", response_model=EarningsMap, status_code=status.HTTP_201_CREATED)
def create_earnings_map(
    earnings_map: EarningsMapCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new earnings map.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    roster = EarningsService.get_roster(db, earnings_map.roster_id)
    if not roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create earnings maps for this roster"
        )
    
    # Verify the earnings code exists
    code = EarningsService.get_earnings_code(db, earnings_map.earnings_code_id)
    if not code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Earnings code not found"
        )
    
    return EarningsService.create_earnings_map(db, earnings_map)

@router.put("/earnings-maps/{map_id}", response_model=EarningsMap)
def update_earnings_map(
    map_id: int = Path(..., title="The ID of the earnings map to update"),
    earnings_map: EarningsMapUpdate = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing earnings map.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    db_map = EarningsService.get_earnings_map(db, map_id)
    if not db_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Earnings map not found"
        )
    
    roster = EarningsService.get_roster(db, db_map.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this earnings map"
        )
    
    # Verify the earnings code exists if being updated
    if earnings_map.earnings_code_id is not None:
        code = EarningsService.get_earnings_code(db, earnings_map.earnings_code_id)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Earnings code not found"
            )
    
    updated_map = EarningsService.update_earnings_map(db, map_id, earnings_map)
    if not updated_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Earnings map not found"
        )
    
    return updated_map

@router.delete("/earnings-maps/{map_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_earnings_map(
    map_id: int = Path(..., title="The ID of the earnings map to delete"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete an earnings map.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    db_map = EarningsService.get_earnings_map(db, map_id)
    if not db_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Earnings map not found"
        )
    
    roster = EarningsService.get_roster(db, db_map.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this earnings map"
        )
    
    result = EarningsService.delete_earnings_map(db, map_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Earnings map not found"
        )
    
    return None

# Business Rules endpoints

@router.get("/rosters/{roster_id}/business-rules", response_model=List[BusinessRule])
def get_business_rules(
    roster_id: int = Path(..., title="The ID of the roster to get business rules for"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all business rules for a specific roster.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    roster = EarningsService.get_roster(db, roster_id)
    if not roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access business rules for this roster"
        )
    
    return EarningsService.get_business_rules(db, roster_id, skip, limit)

@router.get("/business-rules/{rule_id}", response_model=BusinessRule)
def get_business_rule(
    rule_id: int = Path(..., title="The ID of the business rule to get"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific business rule by ID.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    rule = EarningsService.get_business_rule(db, rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business rule not found"
        )
    
    roster = EarningsService.get_roster(db, rule.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this business rule"
        )
    
    return rule

@router.post("/business-rules", response_model=BusinessRule, status_code=status.HTTP_201_CREATED)
def create_business_rule(
    rule: BusinessRuleCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new business rule.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    roster = EarningsService.get_roster(db, rule.roster_id)
    if not roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create business rules for this roster"
        )
    
    # Verify the earnings code exists if specified
    if rule.earnings_code_id is not None:
        code = EarningsService.get_earnings_code(db, rule.earnings_code_id)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Earnings code not found"
            )
    
    return EarningsService.create_business_rule(db, rule)

@router.put("/business-rules/{rule_id}", response_model=BusinessRule)
def update_business_rule(
    rule_id: int = Path(..., title="The ID of the business rule to update"),
    rule: BusinessRuleUpdate = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing business rule.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    db_rule = EarningsService.get_business_rule(db, rule_id)
    if not db_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business rule not found"
        )
    
    roster = EarningsService.get_roster(db, db_rule.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this business rule"
        )
    
    # Verify the earnings code exists if being updated
    if rule.earnings_code_id is not None:
        code = EarningsService.get_earnings_code(db, rule.earnings_code_id)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Earnings code not found"
            )
    
    updated_rule = EarningsService.update_business_rule(db, rule_id, rule)
    if not updated_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business rule not found"
        )
    
    return updated_rule

@router.delete("/business-rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_business_rule(
    rule_id: int = Path(..., title="The ID of the business rule to delete"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a business rule.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    db_rule = EarningsService.get_business_rule(db, rule_id)
    if not db_rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business rule not found"
        )
    
    roster = EarningsService.get_roster(db, db_rule.roster_id)
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this business rule"
        )
    
    result = EarningsService.delete_business_rule(db, rule_id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business rule not found"
        )
    
    return None

# Advanced operations

@router.post("/rosters/sync", response_model=RosterSyncResponse)
def sync_roster(
    sync_request: RosterSyncRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Sync employee roster from a destination system.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    roster = EarningsService.get_roster(db, sync_request.roster_id)
    if not roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to sync this roster"
        )
    
    return EarningsService.sync_roster(db, sync_request)

@router.post("/earnings-maps/test", response_model=EarningsMapTestResponse)
def test_earnings_map(
    test_request: EarningsMapTestRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test an earnings mapping with sample data.
    
    Limited to admin users or users with the same tenant ID as the roster.
    """
    roster = EarningsService.get_roster(db, test_request.roster_id)
    if not roster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Roster not found"
        )
    
    if current_user.role != "admin" and current_user.tenant_id != roster.tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to test earnings maps for this roster"
        )
    
    # Verify employee if specified
    if test_request.employee_id is not None:
        employee = EarningsService.get_employee(db, test_request.employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        if employee.roster_id != test_request.roster_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee does not belong to the specified roster"
            )
    
    return EarningsService.test_earnings_map(db, test_request)