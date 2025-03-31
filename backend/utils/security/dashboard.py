"""
Security dashboard API endpoints.

This module provides API endpoints for the security dashboard.
"""

import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from fastapi import Depends, HTTPException, Query, Request, APIRouter
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from db.base import get_db
from core.auth import get_current_active_user
from db.models import User, UserRole, UserLoginHistory
from .monitoring import (
    SecurityEventType, 
    SecurityAlertLevel,
    get_suspicious_activities,
    security_monitor
)

# Setup logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/security", tags=["security"])


class SecurityEventResponse(BaseModel):
    """Model for security event response."""
    
    event_id: str
    event_type: str
    timestamp: datetime
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    alert_level: str
    details: Dict[str, Any] = Field(default_factory=dict)


class SecurityAlertCountResponse(BaseModel):
    """Model for security alert count response."""
    
    total: int
    by_level: Dict[str, int]
    by_type: Dict[str, int]


class SecurityDashboardDataResponse(BaseModel):
    """Model for security dashboard data response."""
    
    alert_counts: SecurityAlertCountResponse
    recent_alerts: List[SecurityEventResponse]
    suspicious_ips: List[Dict[str, Any]]
    locked_accounts: List[Dict[str, Any]]


def _load_security_events(
    time_range: int = 24, 
    levels: Optional[List[str]] = None,
    event_types: Optional[List[str]] = None,
    limit: int = 1000
) -> List[Dict[str, Any]]:
    """
    Load security events from log file.
    
    This is a simple implementation that reads events from the security log file.
    In a production environment, you would likely use a database or log aggregation service.
    
    Args:
        time_range: Time range in hours
        levels: List of alert levels to include
        event_types: List of event types to include
        limit: Maximum number of events to return
        
    Returns:
        List of security events
    """
    events = []
    
    # Try to get security log file from settings
    from core.config import settings
    log_file = getattr(settings, 'LOG_SECURITY_FILE', None)
    
    if log_file and os.path.exists(log_file):
        try:
            # Calculate cutoff time
            cutoff_time = datetime.utcnow() - timedelta(hours=time_range)
            
            # Filter for specified levels
            level_filter = set(levels) if levels else None
            
            # Filter for specified event types
            type_filter = set(event_types) if event_types else None
            
            # Read events from log file
            with open(log_file, 'r') as f:
                for line in f:
                    try:
                        # Parse JSON from the log line
                        # The log format is typically timestamp - logger - level - message
                        # So we need to extract the JSON part from the message
                        json_start = line.find('{')
                        if json_start == -1:
                            continue
                        
                        json_data = json.loads(line[json_start:])
                        
                        # Parse timestamp
                        event_time = datetime.fromisoformat(json_data["timestamp"])
                        
                        # Skip if outside time range
                        if event_time < cutoff_time:
                            continue
                        
                        # Skip if not in specified levels
                        if level_filter and json_data["alert_level"] not in level_filter:
                            continue
                        
                        # Skip if not in specified event types
                        if type_filter and json_data["event_type"] not in type_filter:
                            continue
                        
                        events.append(json_data)
                        
                        # Stop if we reached the limit
                        if len(events) >= limit:
                            break
                    except Exception as e:
                        # Skip malformed lines
                        logger.error(f"Error parsing security log line: {str(e)}")
                        continue
        except Exception as e:
            logger.error(f"Error reading security log file: {str(e)}")
    
    # Sort by timestamp, most recent first
    return sorted(events, key=lambda e: e["timestamp"], reverse=True)


@router.get(
    "/dashboard", 
    response_model=SecurityDashboardDataResponse,
    summary="Get security dashboard data",
    description="Get aggregated security data for the dashboard"
)
async def get_security_dashboard(
    request: Request,
    time_range: int = Query(24, description="Time range in hours"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get security dashboard data.
    
    Args:
        request: The incoming request
        time_range: Time range in hours
        current_user: The authenticated user
        db: Database session
        
    Returns:
        Security dashboard data
    """
    # Only allow administrators
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Load security events
    events = _load_security_events(time_range=time_range)
    
    # Count alerts by level
    level_counts = {}
    for event in events:
        level = event["alert_level"]
        level_counts[level] = level_counts.get(level, 0) + 1
    
    # Count alerts by type
    type_counts = {}
    for event in events:
        event_type = event["event_type"]
        type_counts[event_type] = type_counts.get(event_type, 0) + 1
    
    # Get recent high/critical alerts
    high_alerts = [
        event for event in events 
        if event["alert_level"] in [SecurityAlertLevel.HIGH.value, SecurityAlertLevel.CRITICAL.value]
    ][:10]
    
    # Convert to response model
    alert_counts = SecurityAlertCountResponse(
        total=len(events),
        by_level=level_counts,
        by_type=type_counts
    )
    
    # Get suspicious IPs (IPs with multiple high/critical alerts)
    ip_alerts = {}
    for event in events:
        if event["ip_address"] and event["alert_level"] in [
            SecurityAlertLevel.HIGH.value, 
            SecurityAlertLevel.CRITICAL.value
        ]:
            ip = event["ip_address"]
            ip_alerts[ip] = ip_alerts.get(ip, 0) + 1
    
    suspicious_ips = [
        {"ip_address": ip, "alert_count": count}
        for ip, count in sorted(ip_alerts.items(), key=lambda x: x[1], reverse=True)
        if count >= 3  # IPs with 3+ high/critical alerts
    ][:10]
    
    # Get locked accounts
    locked_accounts = []
    try:
        # Query users with locked accounts
        locked_users = db.query(User).filter(User.account_status == "LOCKED").all()
        
        # Get recent login history for these users
        for user in locked_users:
            login_history = db.query(UserLoginHistory)\
                .filter(UserLoginHistory.user_id == user.id)\
                .order_by(UserLoginHistory.login_time.desc())\
                .limit(1)\
                .all()
            
            locked_accounts.append({
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "last_login_attempt": login_history[0].login_time if login_history else None,
                "ip_address": login_history[0].ip_address if login_history else None
            })
    except Exception as e:
        logger.error(f"Error getting locked accounts: {str(e)}")
    
    # Return dashboard data
    return SecurityDashboardDataResponse(
        alert_counts=alert_counts,
        recent_alerts=high_alerts,
        suspicious_ips=suspicious_ips,
        locked_accounts=locked_accounts
    )


@router.get(
    "/events", 
    response_model=List[SecurityEventResponse],
    summary="Get security events",
    description="Get security events with filtering options"
)
async def get_security_events(
    request: Request,
    time_range: int = Query(24, description="Time range in hours"),
    levels: Optional[List[str]] = Query(None, description="Alert levels to include"),
    event_types: Optional[List[str]] = Query(None, description="Event types to include"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    tenant_id: Optional[str] = Query(None, description="Filter by tenant ID"),
    ip_address: Optional[str] = Query(None, description="Filter by IP address"),
    limit: int = Query(100, description="Maximum number of events to return"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get security events with filtering options.
    
    Args:
        request: The incoming request
        time_range: Time range in hours
        levels: Alert levels to include
        event_types: Event types to include
        user_id: Filter by user ID
        tenant_id: Filter by tenant ID
        ip_address: Filter by IP address
        limit: Maximum number of events to return
        current_user: The authenticated user
        
    Returns:
        List of security events
    """
    # Only allow administrators
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Load security events
    events = _load_security_events(
        time_range=time_range,
        levels=levels,
        event_types=event_types,
        limit=limit * 10  # Load more than needed for filtering
    )
    
    # Apply additional filters
    filtered_events = events
    
    if user_id:
        filtered_events = [e for e in filtered_events if e.get("user_id") == user_id]
    
    if tenant_id:
        filtered_events = [e for e in filtered_events if e.get("tenant_id") == tenant_id]
    
    if ip_address:
        filtered_events = [e for e in filtered_events if e.get("ip_address") == ip_address]
    
    # Return limited number of events
    return filtered_events[:limit]


@router.get(
    "/user-activity/{user_id}", 
    response_model=List[SecurityEventResponse],
    summary="Get user security activity",
    description="Get security events for a specific user"
)
async def get_user_security_activity(
    request: Request,
    user_id: str,
    time_range: int = Query(168, description="Time range in hours (default 7 days)"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get security events for a specific user.
    
    Args:
        request: The incoming request
        user_id: User ID to get activity for
        time_range: Time range in hours
        current_user: The authenticated user
        
    Returns:
        List of security events for the user
    """
    # Only allow administrators or the user themselves
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Load security events for the user
    events = _load_security_events(time_range=time_range)
    user_events = [e for e in events if e.get("user_id") == user_id]
    
    return user_events


@router.get(
    "/suspicious-activities/{user_id}",
    response_model=List[SecurityEventResponse],
    summary="Get suspicious activities for a user",
    description="Get suspicious activities tracked for a specific user"
)
async def get_user_suspicious_activities(
    request: Request,
    user_id: str,
    limit: int = Query(10, description="Maximum number of activities to return"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get suspicious activities tracked for a specific user.
    
    Args:
        request: The incoming request
        user_id: User ID to get activities for
        limit: Maximum number of activities to return
        current_user: The authenticated user
        
    Returns:
        List of suspicious activities for the user
    """
    # Only allow administrators or the user themselves
    if current_user.role != UserRole.ADMIN and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get suspicious activities for the user
    activities = get_suspicious_activities(user_id, limit)
    
    return activities


@router.post(
    "/block-ip/{ip_address}",
    summary="Block an IP address",
    description="Add an IP address to the blocked list"
)
async def block_ip_address(
    request: Request,
    ip_address: str,
    current_user: User = Depends(get_current_active_user)
):
    """
    Block an IP address.
    
    Args:
        request: The incoming request
        ip_address: IP address to block
        current_user: The authenticated user
        
    Returns:
        Success message
    """
    # Only allow administrators
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Validate IP address format
    try:
        ip = ipaddress.ip_address(ip_address)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid IP address format")
    
    # Add to known malicious IPs
    security_monitor.add_malicious_ip(ip_address)
    
    # Log the action
    logger.info(f"IP address {ip_address} blocked by {current_user.username}")
    
    return {"message": f"IP address {ip_address} has been blocked"}


# Helper functions for the dashboard

def get_alert_summary(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Get summary of security alerts.
    
    Args:
        events: List of security events
        
    Returns:
        Summary of security alerts
    """
    # Count alerts by level
    level_counts = {}
    for event in events:
        level = event["alert_level"]
        level_counts[level] = level_counts.get(level, 0) + 1
    
    # Count alerts by type
    type_counts = {}
    for event in events:
        event_type = event["event_type"]
        type_counts[event_type] = type_counts.get(event_type, 0) + 1
    
    # Calculate trend (comparison with previous period)
    # For simplicity, this just compares the first and second halves of the time range
    mid_point = len(events) // 2
    first_half = events[:mid_point]
    second_half = events[mid_point:]
    
    first_half_count = len(first_half)
    second_half_count = len(second_half)
    
    if first_half_count > 0:
        trend_percentage = ((second_half_count - first_half_count) / first_half_count) * 100
    else:
        trend_percentage = 0
    
    return {
        "total": len(events),
        "by_level": level_counts,
        "by_type": type_counts,
        "trend": {
            "direction": "up" if trend_percentage > 0 else "down",
            "percentage": abs(trend_percentage)
        }
    }