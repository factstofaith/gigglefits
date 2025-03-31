"""
Security monitoring and event tracking system.

This module provides utilities for monitoring security-related events,
tracking suspicious activities, and detecting potential security threats.
"""

import json
import logging
import time
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Set, Tuple
import ipaddress
import hashlib
from threading import Lock
import os
from pydantic import BaseModel, Field

# Get configuration from environment
from core.config import settings

# Setup logging
logger = logging.getLogger(__name__)

# Security monitoring logger - separate from application logs
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

# Add handlers if not already configured
if not security_logger.handlers:
    # Create security log file handler if LOG_SECURITY_FILE is set
    if hasattr(settings, 'LOG_SECURITY_FILE') and settings.LOG_SECURITY_FILE:
        log_dir = os.path.dirname(settings.LOG_SECURITY_FILE)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        # Create rotating file handler for security logs
        security_file_handler = logging.handlers.RotatingFileHandler(
            settings.LOG_SECURITY_FILE,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=10  # Keep 10 backup files
        )
        security_file_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        security_logger.addHandler(security_file_handler)
    else:
        # If no specific security log file is set, use the console
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s - SECURITY - %(levelname)s - %(message)s'
        ))
        security_logger.addHandler(console_handler)


class SecurityEventType(str, Enum):
    """Types of security events that can be monitored."""
    
    # Authentication events
    LOGIN_SUCCESS = "login.success"
    LOGIN_FAILURE = "login.failure"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password.change"
    PASSWORD_RESET = "password.reset"
    MFA_ENABLED = "mfa.enabled"
    MFA_DISABLED = "mfa.disabled"
    MFA_CHALLENGE = "mfa.challenge"
    MFA_SUCCESS = "mfa.success"
    MFA_FAILURE = "mfa.failure"
    ACCOUNT_LOCKED = "account.locked"
    ACCOUNT_UNLOCKED = "account.unlocked"
    
    # Access control events
    PERMISSION_GRANTED = "permission.granted"
    PERMISSION_REVOKED = "permission.revoked"
    ACCESS_DENIED = "access.denied"
    ELEVATION_ATTEMPT = "elevation.attempt"
    
    # API events
    RATE_LIMIT_EXCEEDED = "rate_limit.exceeded"
    API_KEY_CREATED = "api_key.created"
    API_KEY_REVOKED = "api_key.revoked"
    
    # Data access events
    SENSITIVE_DATA_ACCESS = "data.sensitive_access"
    UNUSUAL_DATA_ACCESS = "data.unusual_access"
    MASS_DATA_ACCESS = "data.mass_access"
    
    # System events
    CONFIG_CHANGE = "config.change"
    ENCRYPTION_KEY_ROTATION = "encryption.key_rotation"
    
    # Tenant events
    TENANT_CREATED = "tenant.created"
    TENANT_DELETED = "tenant.deleted"
    CROSS_TENANT_ACCESS = "tenant.cross_access"
    
    # Suspicious activities
    SUSPICIOUS_IP = "suspicious.ip"
    SUSPICIOUS_USER_AGENT = "suspicious.user_agent"
    SUSPICIOUS_LOCATION = "suspicious.location"
    SUSPICIOUS_LOGIN_TIME = "suspicious.login_time"
    BRUTE_FORCE_ATTEMPT = "suspicious.brute_force"
    
    # Integration security events
    INTEGRATION_CREDENTIALS_UPDATED = "integration.credentials_updated"
    WEBHOOK_SECRET_UPDATED = "webhook.secret_updated"
    STORAGE_ACCESS_KEY_UPDATED = "storage.access_key_updated"


class SecurityAlertLevel(str, Enum):
    """Alert levels for security events."""
    
    INFO = "info"           # Informational events, normal activity
    LOW = "low"             # Low priority alerts, potential issues
    MEDIUM = "medium"       # Medium priority alerts, unusual activity
    HIGH = "high"           # High priority alerts, suspicious activity
    CRITICAL = "critical"   # Critical alerts, immediate action required


class SecurityEventModel(BaseModel):
    """Model for security events."""
    
    event_type: SecurityEventType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    alert_level: SecurityAlertLevel = SecurityAlertLevel.INFO
    details: Dict[str, Any] = Field(default_factory=dict)
    event_id: str = ""
    
    def __init__(self, **data):
        super().__init__(**data)
        # Generate event ID if not provided
        if not self.event_id:
            self.event_id = self._generate_event_id()
    
    def _generate_event_id(self) -> str:
        """Generate a unique event ID based on event properties."""
        # Create a string with timestamp and other info
        base = (
            f"{self.timestamp.isoformat()}-"
            f"{self.event_type}-"
            f"{self.user_id or 'anon'}-"
            f"{self.ip_address or 'unknown'}"
        )
        # Create a hash of this string
        return hashlib.sha256(base.encode()).hexdigest()[:16]
    
    def to_log_entry(self) -> str:
        """Convert event to a formatted log entry."""
        return json.dumps({
            "event_id": self.event_id,
            "event_type": self.event_type,
            "timestamp": self.timestamp.isoformat(),
            "user_id": self.user_id,
            "tenant_id": self.tenant_id,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "alert_level": self.alert_level,
            "details": self.details
        })


# Security event tracking
class SecurityMonitor:
    """
    Security event monitoring and tracking system.
    
    This class provides functionality for:
    - Logging security events
    - Tracking login attempts and failures
    - Detecting suspicious activity
    - Generating security alerts
    """
    
    def __init__(self):
        """Initialize the security monitor."""
        # Track login failures by IP/username
        self.login_failures: Dict[str, List[datetime]] = {}
        
        # Track rate limit exceeded events by IP
        self.rate_limit_events: Dict[str, List[datetime]] = {}
        
        # Known malicious IPs
        self.known_malicious_ips: Set[str] = set()
        
        # Try to load malicious IPs from file if exists
        malicious_ips_file = getattr(settings, 'MALICIOUS_IPS_FILE', None)
        if malicious_ips_file and os.path.exists(malicious_ips_file):
            try:
                with open(malicious_ips_file, 'r') as f:
                    self.known_malicious_ips = set(line.strip() for line in f)
            except Exception as e:
                logger.error(f"Error loading malicious IPs file: {str(e)}")
        
        # Suspicious activities by user
        self.suspicious_activities: Dict[str, List[SecurityEventModel]] = {}
        
        # Lock for thread safety
        self.lock = Lock()
        
        # Activity baseline for users
        self.user_activity_baseline: Dict[str, Dict[str, Any]] = {}
        
        # Configure alert thresholds from settings or use defaults
        self.login_failure_threshold = getattr(settings, 'SECURITY_LOGIN_FAILURE_THRESHOLD', 5)
        self.login_failure_window_minutes = getattr(settings, 'SECURITY_LOGIN_FAILURE_WINDOW_MINUTES', 30)
        self.rate_limit_threshold = getattr(settings, 'SECURITY_RATE_LIMIT_THRESHOLD', 10)
        self.rate_limit_window_minutes = getattr(settings, 'SECURITY_RATE_LIMIT_WINDOW_MINUTES', 60)
        
        logger.info("Security monitoring system initialized")
    
    def log_event(self, event: SecurityEventModel) -> None:
        """
        Log a security event and take appropriate action based on event type.
        
        Args:
            event: The security event to log
        """
        # Log the event
        self._log_security_event(event)
        
        # Process event based on type
        self._process_security_event(event)
    
    def _log_security_event(self, event: SecurityEventModel) -> None:
        """
        Log a security event to the security log.
        
        Args:
            event: The security event to log
        """
        # Log to security logger based on alert level
        log_entry = event.to_log_entry()
        
        if event.alert_level == SecurityAlertLevel.CRITICAL:
            security_logger.critical(log_entry)
        elif event.alert_level == SecurityAlertLevel.HIGH:
            security_logger.error(log_entry)
        elif event.alert_level == SecurityAlertLevel.MEDIUM:
            security_logger.warning(log_entry)
        elif event.alert_level == SecurityAlertLevel.LOW:
            security_logger.info(log_entry)
        else:
            security_logger.debug(log_entry)
    
    def _process_security_event(self, event: SecurityEventModel) -> None:
        """
        Process a security event and take appropriate action.
        
        Args:
            event: The security event to process
        """
        # Handle login failures
        if event.event_type == SecurityEventType.LOGIN_FAILURE:
            self._handle_login_failure(event)
        
        # Handle rate limit exceeded
        elif event.event_type == SecurityEventType.RATE_LIMIT_EXCEEDED:
            self._handle_rate_limit_exceeded(event)
        
        # Handle suspicious IP
        elif event.ip_address and self._is_suspicious_ip(event.ip_address):
            self._handle_suspicious_ip(event)
        
        # Store event in user's suspicious activities if medium or higher alert
        if event.alert_level.value in [SecurityAlertLevel.MEDIUM, 
                                    SecurityAlertLevel.HIGH, 
                                    SecurityAlertLevel.CRITICAL] and event.user_id:
            self._add_suspicious_activity(event)
    
    def _handle_login_failure(self, event: SecurityEventModel) -> None:
        """
        Handle a login failure event.
        
        Args:
            event: The login failure event
        """
        # Skip if no IP or username
        if not event.ip_address or not event.user_id:
            return
            
        with self.lock:
            # Create key for tracking
            key = f"{event.ip_address}:{event.user_id}"
            
            # Initialize if not exists
            if key not in self.login_failures:
                self.login_failures[key] = []
            
            # Add current timestamp
            self.login_failures[key].append(datetime.utcnow())
            
            # Remove old failures outside window
            window_start = datetime.utcnow() - timedelta(minutes=self.login_failure_window_minutes)
            self.login_failures[key] = [
                ts for ts in self.login_failures[key] if ts >= window_start
            ]
            
            # Count failures in window
            failures_count = len(self.login_failures[key])
            
            # Check if threshold exceeded
            if failures_count >= self.login_failure_threshold:
                # Create brute force attempt event
                brute_force_event = SecurityEventModel(
                    event_type=SecurityEventType.BRUTE_FORCE_ATTEMPT,
                    user_id=event.user_id,
                    tenant_id=event.tenant_id,
                    ip_address=event.ip_address,
                    user_agent=event.user_agent,
                    alert_level=SecurityAlertLevel.HIGH,
                    details={
                        "failures_count": failures_count,
                        "window_minutes": self.login_failure_window_minutes,
                        "threshold": self.login_failure_threshold
                    }
                )
                
                # Log the brute force attempt
                self._log_security_event(brute_force_event)
    
    def _handle_rate_limit_exceeded(self, event: SecurityEventModel) -> None:
        """
        Handle a rate limit exceeded event.
        
        Args:
            event: The rate limit exceeded event
        """
        # Skip if no IP address
        if not event.ip_address:
            return
            
        with self.lock:
            # Initialize if not exists
            if event.ip_address not in self.rate_limit_events:
                self.rate_limit_events[event.ip_address] = []
            
            # Add current timestamp
            self.rate_limit_events[event.ip_address].append(datetime.utcnow())
            
            # Remove old events outside window
            window_start = datetime.utcnow() - timedelta(minutes=self.rate_limit_window_minutes)
            self.rate_limit_events[event.ip_address] = [
                ts for ts in self.rate_limit_events[event.ip_address] if ts >= window_start
            ]
            
            # Count rate limit events in window
            rate_limit_count = len(self.rate_limit_events[event.ip_address])
            
            # Check if threshold exceeded
            if rate_limit_count >= self.rate_limit_threshold:
                # Upgrade the alert level to high
                event.alert_level = SecurityAlertLevel.HIGH
                event.details["rate_limit_count"] = rate_limit_count
                event.details["window_minutes"] = self.rate_limit_window_minutes
                event.details["threshold"] = self.rate_limit_threshold
                
                # Re-log with higher alert level
                self._log_security_event(event)
    
    def _is_suspicious_ip(self, ip_address: str) -> bool:
        """
        Check if an IP address is suspicious.
        
        This checks:
        1. Known malicious IPs
        2. Private IPs where they shouldn't be
        3. Reserved IPs
        
        Args:
            ip_address: The IP address to check
            
        Returns:
            True if the IP is suspicious, False otherwise
        """
        # Check if IP is in known malicious list
        if ip_address in self.known_malicious_ips:
            return True
        
        try:
            # Parse the IP address
            ip = ipaddress.ip_address(ip_address)
            
            # Check if it's a private or reserved address accessing public endpoints
            if ip.is_private or ip.is_reserved:
                # Allow private IPs in development mode
                if not settings.DEBUG_MODE and not getattr(settings, 'ALLOW_PRIVATE_IPS', False):
                    return True
            
            # Add more checks as needed
            
            return False
        except ValueError:
            # Invalid IP address format
            return True
    
    def _handle_suspicious_ip(self, event: SecurityEventModel) -> None:
        """
        Handle an event from a suspicious IP.
        
        Args:
            event: The security event from a suspicious IP
        """
        # Create suspicious IP event
        suspicious_ip_event = SecurityEventModel(
            event_type=SecurityEventType.SUSPICIOUS_IP,
            user_id=event.user_id,
            tenant_id=event.tenant_id,
            ip_address=event.ip_address,
            user_agent=event.user_agent,
            alert_level=SecurityAlertLevel.MEDIUM,
            details={
                "original_event_type": event.event_type,
                "reason": "IP in malicious list" if event.ip_address in self.known_malicious_ips 
                           else "Private/Reserved IP"
            }
        )
        
        # Log the suspicious IP event
        self._log_security_event(suspicious_ip_event)
    
    def _add_suspicious_activity(self, event: SecurityEventModel) -> None:
        """
        Add an event to a user's suspicious activity list.
        
        Args:
            event: The security event to add
        """
        if not event.user_id:
            return
            
        with self.lock:
            # Initialize if not exists
            if event.user_id not in self.suspicious_activities:
                self.suspicious_activities[event.user_id] = []
            
            # Add the event
            self.suspicious_activities[event.user_id].append(event)
            
            # Keep only recent events (last 100)
            if len(self.suspicious_activities[event.user_id]) > 100:
                self.suspicious_activities[event.user_id] = \
                    self.suspicious_activities[event.user_id][-100:]
    
    def get_suspicious_activities(self, user_id: str, limit: int = 10) -> List[SecurityEventModel]:
        """
        Get recent suspicious activities for a user.
        
        Args:
            user_id: The user ID to get activities for
            limit: Maximum number of activities to return
            
        Returns:
            List of recent suspicious activities for the user
        """
        with self.lock:
            if user_id not in self.suspicious_activities:
                return []
            
            # Return most recent activities first
            return sorted(
                self.suspicious_activities[user_id],
                key=lambda e: e.timestamp,
                reverse=True
            )[:limit]
    
    def check_account_status(self, user_id: str, ip_address: Optional[str] = None) -> Tuple[bool, Optional[str]]:
        """
        Check if an account should be blocked based on suspicious activity.
        
        Args:
            user_id: The user ID to check
            ip_address: The IP address of the current request
            
        Returns:
            Tuple of (should_block, reason)
        """
        with self.lock:
            # Check for brute force attempts
            if ip_address:
                key = f"{ip_address}:{user_id}"
                if key in self.login_failures:
                    window_start = datetime.utcnow() - timedelta(minutes=self.login_failure_window_minutes)
                    failures = [ts for ts in self.login_failures[key] if ts >= window_start]
                    
                    if len(failures) >= self.login_failure_threshold:
                        return True, "Too many failed login attempts"
            
            # Check for suspicious activities
            if user_id in self.suspicious_activities:
                critical_count = sum(
                    1 for event in self.suspicious_activities[user_id]
                    if event.alert_level == SecurityAlertLevel.CRITICAL
                    and event.timestamp >= datetime.utcnow() - timedelta(hours=24)
                )
                
                high_count = sum(
                    1 for event in self.suspicious_activities[user_id]
                    if event.alert_level == SecurityAlertLevel.HIGH
                    and event.timestamp >= datetime.utcnow() - timedelta(hours=24)
                )
                
                # Block account with any critical events or too many high events
                if critical_count > 0:
                    return True, "Critical security alert detected"
                
                if high_count >= 5:
                    return True, "Multiple high security alerts detected"
            
            # No reason to block
            return False, None
    
    def update_user_baseline(self, user_id: str, activity_data: Dict[str, Any]) -> None:
        """
        Update activity baseline for a user.
        
        Args:
            user_id: The user ID to update baseline for
            activity_data: Activity data to update baseline with
        """
        with self.lock:
            if user_id not in self.user_activity_baseline:
                self.user_activity_baseline[user_id] = {}
            
            # Merge new data with existing baseline
            self.user_activity_baseline[user_id].update(activity_data)
    
    def check_unusual_activity(self, user_id: str, activity_type: str, 
                              activity_data: Dict[str, Any]) -> bool:
        """
        Check if activity is unusual compared to user's baseline.
        
        Args:
            user_id: The user ID to check activity for
            activity_type: Type of activity to check
            activity_data: Activity data to check
            
        Returns:
            True if activity is unusual, False otherwise
        """
        with self.lock:
            # If no baseline exists, it's not unusual (yet)
            if user_id not in self.user_activity_baseline:
                return False
            
            baseline = self.user_activity_baseline[user_id]
            
            # Check based on activity type
            if activity_type == "login_time":
                # Unusual login time detection
                if "usual_login_hours" in baseline:
                    usual_hours = baseline["usual_login_hours"]
                    current_hour = datetime.utcnow().hour
                    
                    # Consider unusual if user is logging in outside their usual hours
                    if current_hour not in usual_hours:
                        return True
            
            elif activity_type == "data_access":
                # Unusual data access detection
                if "usual_resource_types" in baseline and "resource_type" in activity_data:
                    usual_types = baseline["usual_resource_types"]
                    current_type = activity_data["resource_type"]
                    
                    # Consider unusual if user is accessing a resource type they don't usually access
                    if current_type not in usual_types:
                        return True
            
            # Add more checks as needed
            
            return False
    
    def add_malicious_ip(self, ip_address: str) -> None:
        """
        Add an IP address to the list of known malicious IPs.
        
        Args:
            ip_address: The IP address to add
        """
        with self.lock:
            self.known_malicious_ips.add(ip_address)


# Create a global instance for the application
security_monitor = SecurityMonitor()


# Utility functions for easier API

def log_security_event(
    event_type: SecurityEventType,
    user_id: Optional[str] = None,
    tenant_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    alert_level: SecurityAlertLevel = SecurityAlertLevel.INFO,
    details: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log a security event with the given parameters.
    
    Args:
        event_type: Type of security event
        user_id: ID of the user associated with the event
        tenant_id: ID of the tenant associated with the event
        ip_address: IP address associated with the event
        user_agent: User agent associated with the event
        resource_type: Type of resource associated with the event
        resource_id: ID of resource associated with the event
        alert_level: Alert level for the event
        details: Additional details about the event
    """
    event = SecurityEventModel(
        event_type=event_type,
        user_id=user_id,
        tenant_id=tenant_id,
        ip_address=ip_address,
        user_agent=user_agent,
        resource_type=resource_type,
        resource_id=resource_id,
        alert_level=alert_level,
        details=details or {}
    )
    
    security_monitor.log_event(event)


def check_account_status(user_id: str, ip_address: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """
    Check if an account should be blocked based on suspicious activity.
    
    Args:
        user_id: The user ID to check
        ip_address: The IP address of the current request
        
    Returns:
        Tuple of (should_block, reason)
    """
    return security_monitor.check_account_status(user_id, ip_address)


def get_suspicious_activities(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get recent suspicious activities for a user.
    
    Args:
        user_id: The user ID to get activities for
        limit: Maximum number of activities to return
        
    Returns:
        List of recent suspicious activities for the user as dictionaries
    """
    events = security_monitor.get_suspicious_activities(user_id, limit)
    return [json.loads(event.to_log_entry()) for event in events]


def update_user_baseline(user_id: str, activity_data: Dict[str, Any]) -> None:
    """
    Update activity baseline for a user.
    
    Args:
        user_id: The user ID to update baseline for
        activity_data: Activity data to update baseline with
    """
    security_monitor.update_user_baseline(user_id, activity_data)


def check_unusual_activity(user_id: str, activity_type: str, 
                          activity_data: Dict[str, Any]) -> bool:
    """
    Check if activity is unusual compared to user's baseline.
    
    Args:
        user_id: The user ID to check activity for
        activity_type: Type of activity to check
        activity_data: Activity data to check
        
    Returns:
        True if activity is unusual, False otherwise
    """
    return security_monitor.check_unusual_activity(user_id, activity_type, activity_data)


def add_malicious_ip(ip_address: str) -> None:
    """
    Add an IP address to the list of known malicious IPs.
    
    Args:
        ip_address: The IP address to add
    """
    security_monitor.add_malicious_ip(ip_address)