"""
Security monitoring and event tracking system.

This module provides comprehensive utilities for monitoring security-related events,
tracking suspicious activities, and detecting potential security threats in the
application. It implements a robust security logging framework with appropriate
alert levels and detailed event tracking.

Features:
- Detailed security event logging with categorized event types
- Multiple alert levels for proper prioritization of security events
- IP address analysis for detecting suspicious activities
- User activity baseline tracking for anomaly detection
- Brute force attempt detection and prevention
- Rate limit monitoring and enforcement
- Suspicious IP tracking and blacklisting
- Multi-tenant security isolation
- Detailed security event and alert models
- Comprehensive error handling with detailed context

The SecurityMonitor class serves as the central component for security monitoring,
while utility functions provide easy access to common security operations.

Usage examples:
    # Log a security event
    log_security_event(
        event_type=SecurityEventType.LOGIN_SUCCESS,
        user_id="user123",
        ip_address="192.168.1.1",
        alert_level=SecurityAlertLevel.INFO,
        details={"browser": "Chrome", "location": "New York"}
    )

    # Check if an account should be blocked due to suspicious activity
    should_block, reason = check_account_status("user123", "192.168.1.1")
    if should_block:
        # Lock the account
        
    # Get suspicious activities for a user
    activities = get_suspicious_activities("user123")
    
    # Check if activity is unusual for a user
    is_unusual = check_unusual_activity(
        "user123", 
        "login_time", 
        {"hour": 3, "location": "Unknown"}
    )
"""

import json
import logging
import time
import traceback
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Dict, List, Optional, Any, Set, Tuple, Union, cast
import ipaddress
import hashlib
from threading import Lock
import os
import uuid
from pydantic import BaseModel, Field, validator

# Get configuration from environment
from core.config import settings

# Setup logging
logger = logging.getLogger(__name__)

# Security monitoring logger - separate from application logs
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

# Constants
SLOW_OPERATION_THRESHOLD_MS = 50  # Threshold for logging slow operations (milliseconds)

# Add handlers if not already configured
if not security_logger.handlers:
    # Create security log file handler if LOG_SECURITY_FILE is set
    if hasattr(settings, 'LOG_SECURITY_FILE') and settings.LOG_SECURITY_FILE:
        try:
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
        except (PermissionError, OSError) as e:
            # Fallback to console logging if we can't write to the log file
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter(
                '%(asctime)s - SECURITY - %(levelname)s - %(message)s'
            ))
            security_logger.addHandler(console_handler)
            security_logger.warning(f"Could not create security log file {settings.LOG_SECURITY_FILE}: {str(e)}. Falling back to console logging.")
    else:
        # If no specific security log file is set, use the console
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s - SECURITY - %(levelname)s - %(message)s'
        ))
        security_logger.addHandler(console_handler)


class SecurityEventType(str, Enum):
    """
    Types of security events that can be monitored.
    
    This enum defines all the security event types that can be logged and monitored
    by the security system. Events are organized into categories for easier management
    and analysis. The string values are formatted as dot-notation category hierarchies.
    
    Categories:
    - Authentication: Events related to user authentication
    - Access Control: Events related to permissions and access control
    - API: Events related to API usage
    - Data Access: Events related to accessing sensitive data
    - System: Events related to system configuration
    - Tenant: Events related to multi-tenant operations
    - Suspicious: Events indicating potentially malicious activity
    - Integration: Events related to third-party integrations
    
    Usage:
        log_security_event(
            event_type=SecurityEventType.LOGIN_SUCCESS,
            user_id="user123",
            details={"browser": "Chrome"}
        )
    """
    
    # Authentication events
    LOGIN_SUCCESS = "login.success"         # Successful user login
    LOGIN_FAILURE = "login.failure"         # Failed login attempt
    LOGOUT = "logout"                       # User logout
    PASSWORD_CHANGE = "password.change"     # User changed their password
    PASSWORD_RESET = "password.reset"       # Password reset was initiated
    MFA_ENABLED = "mfa.enabled"             # Multi-factor authentication enabled
    MFA_DISABLED = "mfa.disabled"           # Multi-factor authentication disabled
    MFA_CHALLENGE = "mfa.challenge"         # MFA challenge sent to user
    MFA_SUCCESS = "mfa.success"             # Successful MFA verification
    MFA_FAILURE = "mfa.failure"             # Failed MFA verification
    ACCOUNT_LOCKED = "account.locked"       # User account locked
    ACCOUNT_UNLOCKED = "account.unlocked"   # User account unlocked
    
    # Access control events
    PERMISSION_GRANTED = "permission.granted"  # Permission granted to a user
    PERMISSION_REVOKED = "permission.revoked"  # Permission revoked from a user
    ACCESS_DENIED = "access.denied"            # Access to a resource denied
    ELEVATION_ATTEMPT = "elevation.attempt"    # Attempt to elevate privileges
    
    # API events
    RATE_LIMIT_EXCEEDED = "rate_limit.exceeded"  # API rate limit exceeded
    API_KEY_CREATED = "api_key.created"          # New API key created
    API_KEY_REVOKED = "api_key.revoked"          # API key revoked or deleted
    
    # Data access events
    SENSITIVE_DATA_ACCESS = "data.sensitive_access"  # Access to sensitive data
    UNUSUAL_DATA_ACCESS = "data.unusual_access"      # Unusual patterns of data access
    MASS_DATA_ACCESS = "data.mass_access"            # Large volume of data accessed
    
    # System events
    CONFIG_CHANGE = "config.change"                    # System configuration changed
    ENCRYPTION_KEY_ROTATION = "encryption.key_rotation"  # Encryption keys rotated
    
    # Tenant events
    TENANT_CREATED = "tenant.created"            # New tenant created
    TENANT_DELETED = "tenant.deleted"            # Tenant deleted
    CROSS_TENANT_ACCESS = "tenant.cross_access"  # Cross-tenant access detected
    
    # Suspicious activities
    SUSPICIOUS_IP = "suspicious.ip"                # Activity from suspicious IP
    SUSPICIOUS_USER_AGENT = "suspicious.user_agent"  # Unusual user agent detected
    SUSPICIOUS_LOCATION = "suspicious.location"      # Activity from unusual location
    SUSPICIOUS_LOGIN_TIME = "suspicious.login_time"  # Login at unusual time
    BRUTE_FORCE_ATTEMPT = "suspicious.brute_force"   # Brute force attack detected
    
    # Integration security events
    INTEGRATION_CREDENTIALS_UPDATED = "integration.credentials_updated"  # Integration credentials changed
    WEBHOOK_SECRET_UPDATED = "webhook.secret_updated"                    # Webhook secret changed
    STORAGE_ACCESS_KEY_UPDATED = "storage.access_key_updated"            # Storage access key updated


class SecurityAlertLevel(str, Enum):
    """
    Alert levels for security events.
    
    This enum defines the severity levels for security events, ranging from
    informational to critical. These levels help prioritize security alerts
    and determine appropriate response actions.
    
    Levels:
    - INFO: Routine events with no security concern
    - LOW: Minor issues that should be monitored
    - MEDIUM: Issues that require attention but aren't urgent
    - HIGH: Serious security issues that need prompt attention
    - CRITICAL: Severe security events requiring immediate action
    
    Usage:
        log_security_event(
            event_type=SecurityEventType.BRUTE_FORCE_ATTEMPT,
            alert_level=SecurityAlertLevel.HIGH,
            details={"attempts": 10}
        )
    """
    
    INFO = "info"           # Informational events, normal activity
    LOW = "low"             # Low priority alerts, potential issues
    MEDIUM = "medium"       # Medium priority alerts, unusual activity
    HIGH = "high"           # High priority alerts, suspicious activity
    CRITICAL = "critical"   # Critical alerts, immediate action required


class SecurityEventModel(BaseModel):
    """
    Model for security events.
    
    This model represents security events in the system, capturing all relevant
    information for security monitoring, auditing, and analysis. It includes
    fields for identifying the event type, user, tenant, IP address, and other
    contextual information.
    
    The model automatically generates a unique event ID if one is not provided,
    and provides methods for converting the event to different formats for logging
    and analysis.
    
    Attributes:
        event_type (SecurityEventType): Type of security event
        timestamp (datetime): Time when the event occurred
        user_id (Optional[str]): ID of the user associated with the event
        tenant_id (Optional[str]): ID of the tenant associated with the event
        ip_address (Optional[str]): IP address from which the event originated
        user_agent (Optional[str]): User agent string from the request
        resource_type (Optional[str]): Type of resource involved in the event
        resource_id (Optional[str]): ID of the resource involved in the event
        alert_level (SecurityAlertLevel): Severity level of the event
        details (Dict[str, Any]): Additional details about the event
        event_id (str): Unique identifier for the event
        operation_id (Optional[str]): ID for correlating related operations
    
    Methods:
        to_log_entry: Converts the event to a JSON string for logging
        to_dict: Converts the event to a dictionary for processing
    
    Example:
        event = SecurityEventModel(
            event_type=SecurityEventType.LOGIN_SUCCESS,
            user_id="user123",
            ip_address="192.168.1.1",
            details={"browser": "Chrome"}
        )
        log_entry = event.to_log_entry()
    """
    
    event_type: SecurityEventType
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    alert_level: SecurityAlertLevel = SecurityAlertLevel.INFO
    details: Dict[str, Any] = Field(default_factory=dict)
    event_id: str = ""
    operation_id: Optional[str] = None
    
    class Config:
        """Configuration for the Pydantic model."""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    @validator('timestamp')
    def ensure_timezone(cls, v):
        """Ensure the timestamp has timezone information."""
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v
    
    def __init__(self, **data):
        super().__init__(**data)
        # Generate event ID if not provided
        if not self.event_id:
            self.event_id = self._generate_event_id()
        
        # Ensure operation_id is properly set
        if not self.operation_id and 'operation_id' in self.details:
            self.operation_id = self.details['operation_id']
        elif self.operation_id and 'operation_id' not in self.details:
            self.details['operation_id'] = self.operation_id
        elif not self.operation_id:
            self.operation_id = f"security_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
            self.details['operation_id'] = self.operation_id
    
    def _generate_event_id(self) -> str:
        """
        Generate a unique event ID based on event properties.
        
        Returns:
            str: A 16-character hexadecimal string uniquely identifying the event
        """
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
        """
        Convert event to a formatted log entry.
        
        Returns:
            str: JSON-formatted string representation of the event
        """
        return json.dumps(self.to_dict())
        
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert event to a dictionary.
        
        Returns:
            Dict[str, Any]: Dictionary representation of the event
        """
        return {
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
            "operation_id": self.operation_id,
            "details": self.details
        }


# Security event tracking
class SecurityMonitor:
    """
    Security event monitoring and tracking system.
    
    This class provides comprehensive security monitoring capabilities for the application,
    including event logging, suspicious activity detection, and security alerting. It
    maintains state for tracking patterns of security events over time, which is essential
    for detecting threats like brute force attacks.
    
    Key features:
    - Logging and tracking of security events
    - Detection of suspicious activities like brute force attempts
    - Monitoring of login failures and rate limit exceedances
    - Tracking of known malicious IP addresses
    - User activity baseline monitoring for anomaly detection
    - Thread-safe operations for concurrent environments
    
    The monitor is designed to balance security with performance, providing
    detailed security information while minimizing impact on application speed.
    
    Attributes:
        login_failures (Dict[str, List[datetime]]): Tracks login failures by IP/username
        rate_limit_events (Dict[str, List[datetime]]): Tracks rate limit events by IP
        known_malicious_ips (Set[str]): Set of known malicious IP addresses
        suspicious_activities (Dict[str, List[SecurityEventModel]]): Security events by user
        user_activity_baseline (Dict[str, Dict[str, Any]]): User activity patterns
        login_failure_threshold (int): Number of failures before triggering alerts
        login_failure_window_minutes (int): Time window for counting failures
        rate_limit_threshold (int): Number of rate limit events before escalation
        rate_limit_window_minutes (int): Time window for counting rate limit events
    
    Thread Safety:
        All methods that access shared state use a lock to ensure thread safety.
    """
    
    def __init__(self):
        """
        Initialize the security monitoring system.
        
        This constructor sets up the internal data structures and configurations
        needed for security monitoring. It loads configuration from environment
        settings when available and falls back to sensible defaults otherwise.
        
        It also attempts to load known malicious IP addresses from a file if
        configured, providing a way to maintain a blacklist of malicious IPs.
        """
        operation_id = f"security_monitor_init_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
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
                        self.known_malicious_ips = set(line.strip() for line in f if line.strip())
                    logger.info(f"[{operation_id}] Loaded {len(self.known_malicious_ips)} malicious IPs from {malicious_ips_file}")
                except Exception as e:
                    logger.error(f"[{operation_id}] Error loading malicious IPs file: {str(e)}")
                    logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
            
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
            
            # Configure max suspicious activities per user
            self.max_suspicious_activities = getattr(settings, 'SECURITY_MAX_SUSPICIOUS_ACTIVITIES', 100)
            
            # Log initialization success and configuration
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.info(f"[{operation_id}] Security monitoring system initialized in {elapsed_ms}ms")
            logger.debug(f"[{operation_id}] Configuration: login_failure_threshold={self.login_failure_threshold}, " +
                        f"login_failure_window_minutes={self.login_failure_window_minutes}, " +
                        f"rate_limit_threshold={self.rate_limit_threshold}, " +
                        f"rate_limit_window_minutes={self.rate_limit_window_minutes}")
            
        except Exception as e:
            logger.error(f"[{operation_id}] Error initializing security monitor: {str(e)}")
            logger.error(f"[{operation_id}] Traceback: {traceback.format_exc()}")
            raise
    
    def log_event(self, event: SecurityEventModel) -> bool:
        """
        Log a security event and take appropriate action based on event type.
        
        This method serves as the main entry point for logging security events.
        It logs the event to the security log and processes it based on its type,
        potentially triggering additional security actions if needed.
        
        Args:
            event (SecurityEventModel): The security event to log
            
        Returns:
            bool: True if the event was logged successfully, False otherwise
            
        Example:
            ```python
            event = SecurityEventModel(
                event_type=SecurityEventType.LOGIN_FAILURE,
                user_id="user123",
                ip_address="192.168.1.1",
                alert_level=SecurityAlertLevel.MEDIUM,
                details={"reason": "Invalid password"}
            )
            security_monitor.log_event(event)
            ```
        """
        operation_id = event.operation_id or f"log_event_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            logger.debug(f"[{operation_id}] Processing security event type: {event.event_type}")
            
            # Log the event
            self._log_security_event(event)
            
            # Process event based on type
            self._process_security_event(event)
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow security event processing: {elapsed_ms}ms")
            else:
                logger.debug(f"[{operation_id}] Security event processed in {elapsed_ms}ms")
                
            return True
            
        except Exception as e:
            logger.error(f"[{operation_id}] Error logging security event: {str(e)}")
            logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
            return False
    
    def _log_security_event(self, event: SecurityEventModel) -> None:
        """
        Log a security event to the security log.
        
        This internal method handles the actual logging of security events to the
        security logger. It uses the event's alert level to determine the appropriate
        log level (critical, error, warning, info, debug).
        
        Args:
            event (SecurityEventModel): The security event to log
            
        Raises:
            ValueError: If the event has an invalid alert level
            
        Note:
            This method is intended for internal use by the SecurityMonitor class.
            External code should use the log_event method instead.
        """
        operation_id = event.operation_id or f"log_security_event_{int(time.time() * 1000)}"
        
        try:
            # Validate event
            if not isinstance(event, SecurityEventModel):
                logger.error(f"[{operation_id}] Invalid event type: {type(event).__name__}")
                raise ValueError(f"Expected SecurityEventModel, got {type(event).__name__}")
                
            # Convert event to log entry
            log_entry = event.to_log_entry()
            
            # Log to security logger based on alert level
            if event.alert_level == SecurityAlertLevel.CRITICAL:
                security_logger.critical(log_entry)
                # Also log to application logger for critical events
                logger.critical(f"[{operation_id}] CRITICAL SECURITY EVENT: {event.event_type} " +
                               f"User: {event.user_id}, IP: {event.ip_address}")
            elif event.alert_level == SecurityAlertLevel.HIGH:
                security_logger.error(log_entry)
                # Also log to application logger for high priority events
                logger.error(f"[{operation_id}] HIGH SECURITY ALERT: {event.event_type}")
            elif event.alert_level == SecurityAlertLevel.MEDIUM:
                security_logger.warning(log_entry)
            elif event.alert_level == SecurityAlertLevel.LOW:
                security_logger.info(log_entry)
            elif event.alert_level == SecurityAlertLevel.INFO:
                security_logger.debug(log_entry)
            else:
                # Handle unknown alert level
                logger.warning(f"[{operation_id}] Unknown alert level: {event.alert_level}, using INFO")
                security_logger.info(log_entry)
                
        except Exception as e:
            logger.error(f"[{operation_id}] Error in _log_security_event: {str(e)}")
            logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
            # Re-raise to allow parent method to handle
            raise
    
    def _process_security_event(self, event: SecurityEventModel) -> None:
        """
        Process a security event and take appropriate action.
        
        This internal method handles event-specific processing based on the event type.
        For certain event types like login failures or rate limit exceedances, it will
        trigger additional security responses. It also identifies suspicious IP addresses
        and tracks medium to critical events in the suspicious activities log.
        
        Args:
            event (SecurityEventModel): The security event to process
            
        Raises:
            ValueError: If the event is not a valid SecurityEventModel
            
        Note:
            This method is intended for internal use by the SecurityMonitor class.
            External code should use the log_event method instead.
        """
        operation_id = event.operation_id or f"process_event_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate event
            if not isinstance(event, SecurityEventModel):
                logger.error(f"[{operation_id}] Invalid event type: {type(event).__name__}")
                raise ValueError(f"Expected SecurityEventModel, got {type(event).__name__}")
                
            logger.debug(f"[{operation_id}] Processing event type: {event.event_type}")
                
            # Handle specific event types
            event_processed = False
            
            # Handle login failures
            if event.event_type == SecurityEventType.LOGIN_FAILURE:
                self._handle_login_failure(event)
                event_processed = True
            
            # Handle rate limit exceeded
            elif event.event_type == SecurityEventType.RATE_LIMIT_EXCEEDED:
                self._handle_rate_limit_exceeded(event)
                event_processed = True
            
            # Handle suspicious IP
            if event.ip_address and self._is_suspicious_ip(event.ip_address):
                self._handle_suspicious_ip(event)
                event_processed = True
            
            # Store event in user's suspicious activities if medium or higher alert
            if event.alert_level in [SecurityAlertLevel.MEDIUM, 
                                     SecurityAlertLevel.HIGH, 
                                     SecurityAlertLevel.CRITICAL] and event.user_id:
                self._add_suspicious_activity(event)
                event_processed = True
                
            # Log processing status
            if not event_processed:
                logger.debug(f"[{operation_id}] No special processing needed for event type: {event.event_type}")
                
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow security event processing: {elapsed_ms}ms")
            else:
                logger.debug(f"[{operation_id}] Security event processed in {elapsed_ms}ms")
                
        except Exception as e:
            logger.error(f"[{operation_id}] Error processing security event: {str(e)}")
            logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
            # Re-raise to allow parent method to handle
            raise
    
    def _handle_login_failure(self, event: SecurityEventModel) -> bool:
        """
        Handle a login failure event.
        
        This method processes login failure events by tracking consecutive failures
        from the same IP and username combination. When the number of failures exceeds
        a defined threshold within a specific time window, it triggers a brute force
        attempt alert.
        
        Args:
            event (SecurityEventModel): The login failure event to process
            
        Returns:
            bool: True if a brute force attempt was detected, False otherwise
            
        Raises:
            ValueError: If the event is invalid or missing required fields
            
        Note:
            This method uses a lock to ensure thread safety when modifying shared state.
        """
        operation_id = event.operation_id or f"handle_login_failure_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate event type
            if event.event_type != SecurityEventType.LOGIN_FAILURE:
                logger.error(f"[{operation_id}] Invalid event type: {event.event_type}")
                raise ValueError(f"Expected LOGIN_FAILURE event, got {event.event_type}")
                
            # Skip if no IP or username/user_id (need both to track)
            if not event.ip_address:
                logger.debug(f"[{operation_id}] Skipping login failure handling - missing IP address")
                return False
                
            if not event.details.get("username") and not event.user_id:
                logger.debug(f"[{operation_id}] Skipping login failure handling - missing username/user_id")
                return False
                
            # Get username from details or user_id
            username = event.details.get("username") or event.user_id
            
            logger.debug(f"[{operation_id}] Processing login failure for username '{username}' " +
                        f"from IP {event.ip_address}")
            
            brute_force_detected = False
            
            with self.lock:
                # Create key for tracking
                key = f"{event.ip_address}:{username}"
                
                # Initialize if not exists
                if key not in self.login_failures:
                    self.login_failures[key] = []
                
                # Add current timestamp with timezone
                current_time = datetime.now(timezone.utc)
                self.login_failures[key].append(current_time)
                
                # Remove old failures outside window
                window_start = current_time - timedelta(minutes=self.login_failure_window_minutes)
                self.login_failures[key] = [
                    ts for ts in self.login_failures[key] if ts >= window_start
                ]
                
                # Count failures in window
                failures_count = len(self.login_failures[key])
                
                # Log the current failure count
                logger.debug(f"[{operation_id}] Login failures for {key}: {failures_count} " +
                           f"in the last {self.login_failure_window_minutes} minutes " +
                           f"(threshold: {self.login_failure_threshold})")
                
                # Check if threshold exceeded
                if failures_count >= self.login_failure_threshold:
                    logger.warning(f"[{operation_id}] Brute force threshold exceeded for " +
                                  f"username '{username}' from IP {event.ip_address}: " +
                                  f"{failures_count} failures in {self.login_failure_window_minutes} minutes")
                    
                    # Calculate escalated alert level based on severity
                    alert_level = SecurityAlertLevel.HIGH
                    if failures_count >= self.login_failure_threshold * 2:
                        alert_level = SecurityAlertLevel.CRITICAL
                    
                    # Create brute force attempt event
                    brute_force_event = SecurityEventModel(
                        event_type=SecurityEventType.BRUTE_FORCE_ATTEMPT,
                        user_id=event.user_id,
                        tenant_id=event.tenant_id,
                        ip_address=event.ip_address,
                        user_agent=event.user_agent,
                        alert_level=alert_level,
                        operation_id=operation_id,
                        details={
                            "username": username,
                            "failures_count": failures_count,
                            "window_minutes": self.login_failure_window_minutes,
                            "threshold": self.login_failure_threshold,
                            "first_failure": self.login_failures[key][0].isoformat(),
                            "latest_failure": current_time.isoformat(),
                            "original_event_id": event.event_id
                        }
                    )
                    
                    # Log the brute force attempt
                    self._log_security_event(brute_force_event)
                    brute_force_detected = True
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow login failure handling: {elapsed_ms}ms")
            else:
                logger.debug(f"[{operation_id}] Login failure handled in {elapsed_ms}ms")
            
            return brute_force_detected
            
        except Exception as e:
            logger.error(f"[{operation_id}] Error handling login failure: {str(e)}")
            logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
            # Don't re-raise, we don't want to block other processing for an internal error
            return False
    
    def _handle_rate_limit_exceeded(self, event: SecurityEventModel) -> bool:
        """
        Handle a rate limit exceeded event.
        
        This method processes rate limit exceeded events by tracking consecutive events
        from the same IP address. When the number of events exceeds a defined threshold 
        within a specific time window, it escalates the alert level and re-logs the event 
        with additional details.
        
        Args:
            event (SecurityEventModel): The rate limit exceeded event to process
            
        Returns:
            bool: True if threshold was exceeded and alert was escalated, False otherwise
            
        Raises:
            ValueError: If the event is invalid or missing required fields
            
        Note:
            This method uses a lock to ensure thread safety when modifying shared state.
        """
        operation_id = event.operation_id or f"handle_rate_limit_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate event type
            if event.event_type != SecurityEventType.RATE_LIMIT_EXCEEDED:
                logger.error(f"[{operation_id}] Invalid event type: {event.event_type}")
                raise ValueError(f"Expected RATE_LIMIT_EXCEEDED event, got {event.event_type}")
                
            # Skip if no IP address
            if not event.ip_address:
                logger.debug(f"[{operation_id}] Skipping rate limit handling - missing IP address")
                return False
            
            logger.debug(f"[{operation_id}] Processing rate limit event from IP {event.ip_address}")
            
            threshold_exceeded = False
            
            with self.lock:
                # Initialize if not exists
                if event.ip_address not in self.rate_limit_events:
                    self.rate_limit_events[event.ip_address] = []
                
                # Add current timestamp with timezone
                current_time = datetime.now(timezone.utc)
                self.rate_limit_events[event.ip_address].append(current_time)
                
                # Remove old events outside window
                window_start = current_time - timedelta(minutes=self.rate_limit_window_minutes)
                self.rate_limit_events[event.ip_address] = [
                    ts for ts in self.rate_limit_events[event.ip_address] if ts >= window_start
                ]
                
                # Count rate limit events in window
                rate_limit_count = len(self.rate_limit_events[event.ip_address])
                
                # Log the current event count
                logger.debug(f"[{operation_id}] Rate limit events for {event.ip_address}: {rate_limit_count} " +
                           f"in the last {self.rate_limit_window_minutes} minutes " +
                           f"(threshold: {self.rate_limit_threshold})")
                
                # Check if threshold exceeded
                if rate_limit_count >= self.rate_limit_threshold:
                    logger.warning(f"[{operation_id}] Rate limit threshold exceeded for " +
                                  f"IP {event.ip_address}: {rate_limit_count} events " +
                                  f"in {self.rate_limit_window_minutes} minutes")
                    
                    # Calculate escalated alert level based on severity
                    if rate_limit_count >= self.rate_limit_threshold * 2:
                        event.alert_level = SecurityAlertLevel.CRITICAL
                        logger.error(f"[{operation_id}] CRITICAL rate limit violation from {event.ip_address}")
                    else:
                        event.alert_level = SecurityAlertLevel.HIGH
                    
                    # Add additional context to the event details
                    event.details["rate_limit_count"] = rate_limit_count
                    event.details["window_minutes"] = self.rate_limit_window_minutes
                    event.details["threshold"] = self.rate_limit_threshold
                    event.details["first_event"] = self.rate_limit_events[event.ip_address][0].isoformat()
                    event.details["latest_event"] = current_time.isoformat()
                    event.details["operation_id"] = operation_id
                    
                    # Re-log with higher alert level
                    self._log_security_event(event)
                    threshold_exceeded = True
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow rate limit handling: {elapsed_ms}ms")
            else:
                logger.debug(f"[{operation_id}] Rate limit handling completed in {elapsed_ms}ms")
            
            return threshold_exceeded
            
        except Exception as e:
            logger.error(f"[{operation_id}] Error handling rate limit event: {str(e)}")
            logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
            # Don't re-raise, we don't want to block other processing for an internal error
            return False
    
    def _is_suspicious_ip(self, ip_address: str, operation_id: Optional[str] = None) -> bool:
        """
        Check if an IP address is suspicious based on various criteria.
        
        This method evaluates an IP address against several security criteria to determine
        if it should be considered suspicious:
        
        1. Known malicious IPs from the maintained blacklist
        2. Private IPs where they shouldn't be (e.g., accessing public endpoints)
        3. Reserved IPs that should not be making normal requests
        4. Improperly formatted IP addresses
        
        Args:
            ip_address (str): The IP address to check
            operation_id (Optional[str]): Operation ID for logging correlation
            
        Returns:
            bool: True if the IP is suspicious, False otherwise
            
        Note:
            In development mode (settings.DEBUG_MODE) or when ALLOW_PRIVATE_IPS is set,
            private IP addresses are not considered suspicious.
        """
        op_id = operation_id or f"check_ip_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not ip_address or not isinstance(ip_address, str):
                logger.error(f"[{op_id}] Invalid IP address provided: {ip_address}")
                return True
                
            # Track reason for classification
            reason = None
            
            # Check if IP is in known malicious list
            if ip_address in self.known_malicious_ips:
                reason = "in_malicious_list"
                logger.debug(f"[{op_id}] IP {ip_address} found in known malicious list")
                return True
            
            try:
                # Parse the IP address
                ip = ipaddress.ip_address(ip_address)
                
                # Check if it's a private or reserved address accessing public endpoints
                if ip.is_private:
                    # Allow private IPs in development mode or when explicitly allowed
                    if not settings.DEBUG_MODE and not getattr(settings, 'ALLOW_PRIVATE_IPS', False):
                        reason = "private_ip"
                        logger.debug(f"[{op_id}] Private IP {ip_address} detected in production mode")
                        return True
                
                if ip.is_reserved:
                    # Reserved IPs should generally not be making requests
                    if not settings.DEBUG_MODE:
                        reason = "reserved_ip"
                        logger.debug(f"[{op_id}] Reserved IP {ip_address} detected")
                        return True
                
                # Additional checks for other suspicious patterns
                # Check for known VPN/proxy/TOR exit node IPs if enabled
                if hasattr(settings, 'CHECK_PROXY_IPS') and settings.CHECK_PROXY_IPS:
                    # This would call an external service or check against a local database
                    # Implementation would depend on specific requirements
                    pass
                
                logger.debug(f"[{op_id}] IP {ip_address} passed all security checks")
                return False
                
            except ValueError:
                # Invalid IP address format
                reason = "invalid_format"
                logger.warning(f"[{op_id}] Invalid IP address format: {ip_address}")
                return True
                
        except Exception as e:
            logger.error(f"[{op_id}] Error checking suspicious IP {ip_address}: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return True
        finally:
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow IP check operation: {elapsed_ms}ms")
            elif reason:
                logger.debug(f"[{op_id}] IP {ip_address} classified as suspicious: {reason} ({elapsed_ms}ms)")
            else:
                logger.debug(f"[{op_id}] IP check completed in {elapsed_ms}ms")
    
    def _handle_suspicious_ip(self, event: SecurityEventModel) -> bool:
        """
        Handle an event from a suspicious IP address.
        
        This method processes events from IP addresses that have been identified as suspicious.
        It creates a new security event with the SUSPICIOUS_IP event type and appropriate
        alert level based on the nature of the suspicion. The method also includes relevant
        details from the original event for context.
        
        Args:
            event (SecurityEventModel): The security event from a suspicious IP
            
        Returns:
            bool: True if the suspicious IP was processed successfully, False otherwise
            
        Note:
            The alert level escalation is based on the following criteria:
            - Known malicious IPs trigger HIGH alert level
            - Other suspicious characteristics trigger MEDIUM alert level
            - If the original event already has a higher alert level, that level is preserved
        """
        operation_id = event.operation_id or f"handle_suspicious_ip_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not event.ip_address:
                logger.debug(f"[{operation_id}] Skipping suspicious IP handling - no IP address")
                return False
                
            # Determine reason for suspicion
            reason = "Unknown"
            alert_level = SecurityAlertLevel.MEDIUM
            
            if event.ip_address in self.known_malicious_ips:
                reason = "IP in known malicious list"
                alert_level = SecurityAlertLevel.HIGH
            elif hasattr(settings, 'ALLOW_PRIVATE_IPS') and not settings.ALLOW_PRIVATE_IPS:
                try:
                    ip = ipaddress.ip_address(event.ip_address)
                    if ip.is_private:
                        reason = "Private IP address"
                    elif ip.is_reserved:
                        reason = "Reserved IP address"
                except ValueError:
                    reason = "Invalid IP address format"
            
            # If the original event has a higher alert level, maintain it
            if event.alert_level in [SecurityAlertLevel.HIGH, SecurityAlertLevel.CRITICAL]:
                alert_level = event.alert_level
            
            logger.debug(f"[{operation_id}] Creating suspicious IP event for {event.ip_address}: {reason}")
            
            # Create suspicious IP event
            suspicious_ip_event = SecurityEventModel(
                event_type=SecurityEventType.SUSPICIOUS_IP,
                user_id=event.user_id,
                tenant_id=event.tenant_id,
                ip_address=event.ip_address,
                user_agent=event.user_agent,
                alert_level=alert_level,
                operation_id=operation_id,
                details={
                    "original_event_type": event.event_type,
                    "original_event_id": event.event_id,
                    "reason": reason,
                    "detection_time": datetime.now(timezone.utc).isoformat(),
                    "source_details": event.details.get("source", "Unknown")
                }
            )
            
            # Log the suspicious IP event
            self._log_security_event(suspicious_ip_event)
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow suspicious IP handling: {elapsed_ms}ms")
            else:
                logger.debug(f"[{operation_id}] Suspicious IP handling completed in {elapsed_ms}ms")
            
            return True
            
        except Exception as e:
            logger.error(f"[{operation_id}] Error handling suspicious IP: {str(e)}")
            logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
            return False
    
    def _add_suspicious_activity(self, event: SecurityEventModel) -> bool:
        """
        Add an event to a user's suspicious activity tracking list.
        
        This method adds a security event to the user's suspicious activity history,
        which is used for pattern detection and account security status determination.
        It enforces a maximum number of events per user to prevent memory issues,
        keeping only the most recent events.
        
        Args:
            event (SecurityEventModel): The security event to add to the user's history
            
        Returns:
            bool: True if the event was successfully added, False otherwise
            
        Note:
            This method is thread-safe and uses a lock to ensure data consistency
            when accessed by multiple threads. It automatically initializes the
            suspicious activity list for new users.
        """
        operation_id = event.operation_id or f"add_suspicious_activity_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not event.user_id:
                logger.debug(f"[{operation_id}] Skipping suspicious activity tracking - missing user_id")
                return False
                
            logger.debug(f"[{operation_id}] Adding {event.event_type} event to suspicious activities for user {event.user_id}")
            
            with self.lock:
                # Initialize if not exists
                if event.user_id not in self.suspicious_activities:
                    logger.debug(f"[{operation_id}] Initializing suspicious activities list for user {event.user_id}")
                    self.suspicious_activities[event.user_id] = []
                
                # Add the event
                self.suspicious_activities[event.user_id].append(event)
                
                # Keep only recent events (limit to max_suspicious_activities)
                max_events = self.max_suspicious_activities
                if len(self.suspicious_activities[event.user_id]) > max_events:
                    # Keep the most recent events
                    self.suspicious_activities[event.user_id] = \
                        sorted(self.suspicious_activities[event.user_id], 
                              key=lambda e: e.timestamp, 
                              reverse=True)[:max_events]
                    
                    logger.debug(f"[{operation_id}] Trimmed suspicious activities for user {event.user_id} to {max_events} events")
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow suspicious activity tracking: {elapsed_ms}ms")
            else:
                logger.debug(f"[{operation_id}] Suspicious activity added in {elapsed_ms}ms")
            
            return True
            
        except Exception as e:
            logger.error(f"[{operation_id}] Error adding suspicious activity: {str(e)}")
            logger.debug(f"[{operation_id}] Traceback: {traceback.format_exc()}")
            return False
    
    def get_suspicious_activities(self, user_id: str, limit: int = 10, 
                              operation_id: Optional[str] = None) -> List[SecurityEventModel]:
        """
        Retrieve recent suspicious activities for a specific user.
        
        This method fetches the most recent suspicious security events associated with 
        a given user, sorted by timestamp in descending order (newest first). It provides
        a way to monitor and analyze suspicious patterns of activity for a user.
        
        Args:
            user_id (str): The ID of the user to get activities for
            limit (int, optional): Maximum number of activities to return. Defaults to 10.
            operation_id (Optional[str], optional): Operation ID for logging correlation
            
        Returns:
            List[SecurityEventModel]: List of recent suspicious activities for the user,
                sorted by timestamp (newest first), limited to the specified count
                
        Note:
            If no activities exist for the user, an empty list is returned.
            This method is thread-safe and uses a lock to ensure data consistency.
            
        Example:
            ```python
            # Get the 5 most recent suspicious activities for a user
            activities = security_monitor.get_suspicious_activities("user123", limit=5)
            for activity in activities:
                print(f"{activity.timestamp}: {activity.event_type} - {activity.alert_level}")
            ```
        """
        op_id = operation_id or f"get_suspicious_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate inputs
            if not user_id:
                logger.error(f"[{op_id}] Invalid user_id provided: {user_id}")
                return []
                
            # Ensure limit is reasonable
            if not isinstance(limit, int) or limit < 1:
                logger.warning(f"[{op_id}] Invalid limit provided: {limit}, using default of 10")
                limit = 10
            elif limit > 100:
                logger.warning(f"[{op_id}] Excessive limit provided: {limit}, capping at 100")
                limit = 100
                
            logger.debug(f"[{op_id}] Retrieving up to {limit} suspicious activities for user {user_id}")
            
            with self.lock:
                # Check if user has any recorded suspicious activities
                if user_id not in self.suspicious_activities:
                    logger.debug(f"[{op_id}] No suspicious activities found for user {user_id}")
                    return []
                
                # Get activities and sort by timestamp (newest first)
                activities = sorted(
                    self.suspicious_activities[user_id],
                    key=lambda e: e.timestamp,
                    reverse=True
                )[:limit]
                
                logger.debug(f"[{op_id}] Found {len(activities)} suspicious activities for user {user_id}")
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow suspicious activity retrieval: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Retrieved suspicious activities in {elapsed_ms}ms")
            
            return activities
            
        except Exception as e:
            logger.error(f"[{op_id}] Error retrieving suspicious activities: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return []
    
    def check_account_status(self, user_id: str, ip_address: Optional[str] = None,
                            operation_id: Optional[str] = None) -> Tuple[bool, Optional[str]]:
        """
        Check if an account should be blocked based on suspicious activity patterns.
        
        This method evaluates the security status of a user account by analyzing:
        1. Recent login failures from the given IP address
        2. Critical security events in the last 24 hours
        3. High-severity security events in the last 24 hours
        4. Other suspicious patterns in user activity
        
        It returns whether the account should be blocked and the reason if applicable.
        
        Args:
            user_id (str): The ID of the user account to check
            ip_address (Optional[str], optional): The IP address of the current request
            operation_id (Optional[str], optional): Operation ID for logging correlation
            
        Returns:
            Tuple[bool, Optional[str]]: A tuple containing:
                - bool: True if the account should be blocked, False otherwise
                - Optional[str]: The reason for blocking, or None if not blocked
                
        Example:
            ```python
            should_block, reason = security_monitor.check_account_status("user123", "192.168.1.1")
            if should_block:
                # Block the account
                user_service.lock_account("user123", reason=reason)
                # Log the action
                log_security_event(
                    event_type=SecurityEventType.ACCOUNT_LOCKED,
                    user_id="user123",
                    details={"reason": reason}
                )
            ```
        """
        op_id = operation_id or f"check_account_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate inputs
            if not user_id:
                logger.error(f"[{op_id}] Invalid user_id provided: {user_id}")
                return False, "Invalid user ID"
                
            logger.debug(f"[{op_id}] Checking account status for user {user_id}" + 
                        (f" from IP {ip_address}" if ip_address else ""))
            
            should_block = False
            reason = None
            
            with self.lock:
                # Check for brute force attempts from the current IP
                if ip_address:
                    key = f"{ip_address}:{user_id}"
                    if key in self.login_failures:
                        window_start = datetime.now(timezone.utc) - timedelta(minutes=self.login_failure_window_minutes)
                        failures = [ts for ts in self.login_failures[key] if ts >= window_start]
                        
                        failures_count = len(failures)
                        if failures_count >= self.login_failure_threshold:
                            should_block = True
                            reason = f"Too many failed login attempts ({failures_count} in {self.login_failure_window_minutes} minutes)"
                            logger.warning(f"[{op_id}] Account {user_id} should be blocked: {reason}")
                
                # If we haven't decided to block based on brute force, check for suspicious activities
                if not should_block and user_id in self.suspicious_activities:
                    # Define the window for checking recent events
                    recent_window = datetime.now(timezone.utc) - timedelta(hours=24)
                    
                    # Count critical events in the last 24 hours
                    critical_count = sum(
                        1 for event in self.suspicious_activities[user_id]
                        if event.alert_level == SecurityAlertLevel.CRITICAL
                        and event.timestamp >= recent_window
                    )
                    
                    # Count high severity events in the last 24 hours
                    high_count = sum(
                        1 for event in self.suspicious_activities[user_id]
                        if event.alert_level == SecurityAlertLevel.HIGH
                        and event.timestamp >= recent_window
                    )
                    
                    # Block account with any critical events
                    if critical_count > 0:
                        should_block = True
                        reason = f"Critical security alert detected ({critical_count} in last 24 hours)"
                        logger.warning(f"[{op_id}] Account {user_id} should be blocked: {reason}")
                    # Block account with multiple high severity events
                    elif high_count >= 5:
                        should_block = True
                        reason = f"Multiple high security alerts detected ({high_count} in last 24 hours)"
                        logger.warning(f"[{op_id}] Account {user_id} should be blocked: {reason}")
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow account status check: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Account status check completed in {elapsed_ms}ms")
            
            if not should_block:
                logger.debug(f"[{op_id}] Account {user_id} is in good standing")
                
            return should_block, reason
            
        except Exception as e:
            logger.error(f"[{op_id}] Error checking account status: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # In case of error, don't block by default
            return False, None
    
    def update_user_baseline(self, user_id: str, activity_data: Dict[str, Any],
                          operation_id: Optional[str] = None) -> bool:
        """
        Update the activity baseline for a user to establish normal behavior patterns.
        
        This method updates or initializes a user's activity baseline with new data.
        The baseline is used to detect anomalous user behavior by comparing current
        activities with established patterns. The baseline can include information like
        usual login times, typical IP addresses, common resource access patterns, etc.
        
        Args:
            user_id (str): The ID of the user to update baseline for
            activity_data (Dict[str, Any]): Activity data to update baseline with
            operation_id (Optional[str], optional): Operation ID for logging correlation
            
        Returns:
            bool: True if the baseline was successfully updated, False otherwise
            
        Note:
            This method is thread-safe and uses a lock to ensure data consistency
            when accessed by multiple threads. It automatically initializes a new
            baseline for users that don't have one yet.
            
        Example:
            ```python
            # Update user's typical login hour pattern
            security_monitor.update_user_baseline(
                "user123", 
                {
                    "usual_login_hours": [9, 10, 11, 12, 13, 14, 15, 16, 17],
                    "usual_locations": ["New York", "Boston"]
                }
            )
            ```
        """
        op_id = operation_id or f"update_baseline_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate inputs
            if not user_id:
                logger.error(f"[{op_id}] Invalid user_id provided: {user_id}")
                return False
                
            if not activity_data or not isinstance(activity_data, dict):
                logger.error(f"[{op_id}] Invalid activity_data provided for user {user_id}")
                return False
                
            logger.debug(f"[{op_id}] Updating activity baseline for user {user_id}")
            
            # Validate specific activity data types if needed
            if "usual_login_hours" in activity_data and not isinstance(activity_data["usual_login_hours"], list):
                logger.warning(f"[{op_id}] Invalid usual_login_hours format: expected list")
                # Don't return early, we might have other valid data to update
            
            with self.lock:
                # Initialize if not exists
                if user_id not in self.user_activity_baseline:
                    logger.debug(f"[{op_id}] Creating new baseline for user {user_id}")
                    self.user_activity_baseline[user_id] = {}
                
                # Merge new data with existing baseline
                for key, value in activity_data.items():
                    if value is not None:  # Skip None values
                        self.user_activity_baseline[user_id][key] = value
                        logger.debug(f"[{op_id}] Updated {key} for user {user_id}")
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow baseline update: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Baseline updated in {elapsed_ms}ms")
            
            return True
            
        except Exception as e:
            logger.error(f"[{op_id}] Error updating user baseline: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return False
    
    def check_unusual_activity(self, user_id: str, activity_type: str, 
                              activity_data: Dict[str, Any],
                              operation_id: Optional[str] = None) -> Tuple[bool, Optional[str]]:
        """
        Check if a user activity is unusual compared to their established baseline.
        
        This method compares current user activity against their established baseline
        to detect anomalies or suspicious behavior. It supports different types of
        activity checks like login times, locations, resource access patterns, etc.
        
        Args:
            user_id (str): The ID of the user to check activity for
            activity_type (str): Type of activity to check (e.g., "login_time", "data_access")
            activity_data (Dict[str, Any]): Data about the current activity to evaluate
            operation_id (Optional[str], optional): Operation ID for logging correlation
            
        Returns:
            Tuple[bool, Optional[str]]: A tuple containing:
                - bool: True if activity is unusual, False otherwise
                - Optional[str]: The reason why the activity is unusual, or None if normal
                
        Supported activity types:
            - "login_time": Checks if user is logging in at unusual hours
            - "data_access": Checks if user is accessing unusual resource types
            - "location": Checks if user is accessing from unusual location
            - "access_pattern": Checks for unusual access patterns or frequencies
            
        Example:
            ```python
            is_unusual, reason = security_monitor.check_unusual_activity(
                "user123",
                "login_time",
                {"hour": 3, "minute": 45}
            )
            if is_unusual:
                log_security_event(
                    event_type=SecurityEventType.SUSPICIOUS_LOGIN_TIME,
                    user_id="user123",
                    alert_level=SecurityAlertLevel.MEDIUM,
                    details={"reason": reason}
                )
            ```
        """
        op_id = operation_id or f"check_unusual_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate inputs
            if not user_id:
                logger.error(f"[{op_id}] Invalid user_id provided: {user_id}")
                return False, "Invalid user ID"
                
            if not activity_type or not isinstance(activity_type, str):
                logger.error(f"[{op_id}] Invalid activity_type provided: {activity_type}")
                return False, "Invalid activity type"
                
            if not activity_data or not isinstance(activity_data, dict):
                logger.error(f"[{op_id}] Invalid activity_data provided for activity type {activity_type}")
                return False, "Invalid activity data"
                
            logger.debug(f"[{op_id}] Checking for unusual {activity_type} activity for user {user_id}")
            
            with self.lock:
                # If no baseline exists for this user, it's not unusual (yet)
                if user_id not in self.user_activity_baseline:
                    logger.debug(f"[{op_id}] No baseline exists for user {user_id}, cannot determine if unusual")
                    return False, None
                
                baseline = self.user_activity_baseline[user_id]
                
                # Check based on activity type
                if activity_type == "login_time":
                    # Unusual login time detection
                    if "usual_login_hours" in baseline:
                        usual_hours = baseline["usual_login_hours"]
                        
                        # Get current hour from data or current time
                        current_hour = activity_data.get("hour")
                        if current_hour is None:
                            current_hour = datetime.now(timezone.utc).hour
                        
                        # Consider unusual if user is logging in outside their usual hours
                        if current_hour not in usual_hours:
                            reason = f"Login at {current_hour}:00 outside usual hours {usual_hours}"
                            logger.info(f"[{op_id}] Unusual login time detected for user {user_id}: {reason}")
                            return True, reason
                
                elif activity_type == "data_access":
                    # Unusual data access detection
                    if "usual_resource_types" in baseline and "resource_type" in activity_data:
                        usual_types = baseline["usual_resource_types"]
                        current_type = activity_data["resource_type"]
                        
                        # Consider unusual if user is accessing a resource type they don't usually access
                        if current_type not in usual_types:
                            reason = f"Access to unusual resource type {current_type}"
                            logger.info(f"[{op_id}] Unusual resource access detected for user {user_id}: {reason}")
                            return True, reason
                
                elif activity_type == "location":
                    # Unusual access location detection
                    if "usual_locations" in baseline and "location" in activity_data:
                        usual_locations = baseline["usual_locations"]
                        current_location = activity_data["location"]
                        
                        if current_location not in usual_locations:
                            reason = f"Access from unusual location {current_location}"
                            logger.info(f"[{op_id}] Unusual location detected for user {user_id}: {reason}")
                            return True, reason
                
                elif activity_type == "access_pattern":
                    # Unusual access pattern detection (e.g., frequency, volume)
                    if "usual_access_count" in baseline and "access_count" in activity_data:
                        usual_count = baseline["usual_access_count"]
                        current_count = activity_data["access_count"]
                        threshold = baseline.get("access_count_threshold", 2.0)  # Default 2x usual
                        
                        if current_count > usual_count * threshold:
                            reason = f"Unusual access volume: {current_count} vs usual {usual_count}"
                            logger.info(f"[{op_id}] Unusual access pattern detected for user {user_id}: {reason}")
                            return True, reason
                
                else:
                    logger.warning(f"[{op_id}] Unsupported activity type: {activity_type}")
                
                logger.debug(f"[{op_id}] Activity appears normal for user {user_id}")
                
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow unusual activity check: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Unusual activity check completed in {elapsed_ms}ms")
            
            return False, None
            
        except Exception as e:
            logger.error(f"[{op_id}] Error checking for unusual activity: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Don't flag as unusual in case of error
            return False, None
    
    def add_malicious_ip(self, ip_address: str, 
                      operation_id: Optional[str] = None,
                      persist: bool = False) -> bool:
        """
        Add an IP address to the list of known malicious IPs.
        
        This method adds an IP address to the internal blacklist of known malicious IPs.
        These IPs will be flagged as suspicious in all subsequent security checks.
        Optionally, the IP can be persisted to the malicious IPs file if configured.
        
        Args:
            ip_address (str): The IP address to add to the malicious list
            operation_id (Optional[str], optional): Operation ID for logging correlation
            persist (bool, optional): Whether to persist the IP to the malicious IPs file.
                Defaults to False.
                
        Returns:
            bool: True if the IP was successfully added, False otherwise
            
        Note:
            This method is thread-safe and uses a lock to ensure data consistency.
            When persist=True, the IP address will be written to the file specified by
            the MALICIOUS_IPS_FILE setting, if configured.
            
        Example:
            ```python
            # Add a malicious IP and persist it to the file for future runs
            success = security_monitor.add_malicious_ip("192.168.1.100", persist=True)
            if success:
                log_security_event(
                    event_type=SecurityEventType.SUSPICIOUS_IP,
                    ip_address="192.168.1.100",
                    alert_level=SecurityAlertLevel.HIGH,
                    details={"reason": "Manually added to blacklist"}
                )
            ```
        """
        op_id = operation_id or f"add_malicious_ip_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate input
            if not ip_address or not isinstance(ip_address, str):
                logger.error(f"[{op_id}] Invalid IP address provided: {ip_address}")
                return False
                
            # Validate IP format
            try:
                _ = ipaddress.ip_address(ip_address)
            except ValueError:
                logger.error(f"[{op_id}] Malformed IP address: {ip_address}")
                return False
                
            logger.info(f"[{op_id}] Adding IP {ip_address} to known malicious IPs list")
            
            with self.lock:
                # Add to in-memory set
                was_added = ip_address not in self.known_malicious_ips
                self.known_malicious_ips.add(ip_address)
                
                # Persist to file if requested and configured
                if persist and hasattr(settings, 'MALICIOUS_IPS_FILE') and settings.MALICIOUS_IPS_FILE:
                    try:
                        # Create directory if it doesn't exist
                        malicious_ips_file = settings.MALICIOUS_IPS_FILE
                        log_dir = os.path.dirname(malicious_ips_file)
                        if log_dir and not os.path.exists(log_dir):
                            os.makedirs(log_dir)
                            
                        # Append to file
                        with open(malicious_ips_file, 'a+') as f:
                            f.seek(0)  # Go to beginning of file
                            existing_ips = {line.strip() for line in f if line.strip()}
                            
                            # Only append if not already in file
                            if ip_address not in existing_ips:
                                f.seek(0, 2)  # Go to end of file
                                f.write(f"{ip_address}\n")
                                logger.info(f"[{op_id}] IP {ip_address} persisted to malicious IPs file")
                            else:
                                logger.debug(f"[{op_id}] IP {ip_address} already in malicious IPs file")
                    except Exception as e:
                        logger.error(f"[{op_id}] Error persisting malicious IP: {str(e)}")
                        logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
                        # Continue anyway, as we've added it to memory
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow malicious IP addition: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Malicious IP added in {elapsed_ms}ms")
            
            return True
            
        except Exception as e:
            logger.error(f"[{op_id}] Error adding malicious IP: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return False


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
    details: Optional[Dict[str, Any]] = None,
    operation_id: Optional[str] = None
) -> bool:
    """
    Log a security event with the given parameters.
    
    This is a utility function that provides an easy-to-use interface for logging
    security events. It creates a SecurityEventModel with the provided parameters
    and delegates to the global SecurityMonitor instance for processing.
    
    Args:
        event_type (SecurityEventType): Type of security event to log
        user_id (Optional[str], optional): ID of the user associated with the event
        tenant_id (Optional[str], optional): ID of the tenant associated with the event
        ip_address (Optional[str], optional): IP address associated with the event
        user_agent (Optional[str], optional): User agent string from the request
        resource_type (Optional[str], optional): Type of resource involved in the event
        resource_id (Optional[str], optional): ID of resource involved in the event
        alert_level (SecurityAlertLevel, optional): Severity level for the event.
            Defaults to SecurityAlertLevel.INFO.
        details (Optional[Dict[str, Any]], optional): Additional details about the event
        operation_id (Optional[str], optional): ID for correlating related operations
            
    Returns:
        bool: True if the event was logged successfully, False otherwise
        
    Example:
        ```python
        # Log a successful login
        log_security_event(
            event_type=SecurityEventType.LOGIN_SUCCESS,
            user_id="user123",
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            details={"auth_method": "password", "session_id": "abc123"}
        )
        
        # Log a security critical event
        log_security_event(
            event_type=SecurityEventType.SUSPICIOUS_IP,
            ip_address="10.0.0.1",
            alert_level=SecurityAlertLevel.CRITICAL,
            details={"reason": "Known attack source"}
        )
        ```
    """
    try:
        op_id = operation_id or f"log_event_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        
        # Create and validate event model
        event = SecurityEventModel(
            event_type=event_type,
            user_id=user_id,
            tenant_id=tenant_id,
            ip_address=ip_address,
            user_agent=user_agent,
            resource_type=resource_type,
            resource_id=resource_id,
            alert_level=alert_level,
            operation_id=op_id,
            details=details or {}
        )
        
        # Delegate to the security monitor
        return security_monitor.log_event(event)
        
    except Exception as e:
        logger.error(f"Error creating security event: {str(e)}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return False


def check_account_status(user_id: str, ip_address: Optional[str] = None,
                   operation_id: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """
    Check if an account should be blocked based on suspicious activity patterns.
    
    This utility function delegates to the global SecurityMonitor instance to
    evaluate the security status of a user account based on recent security events
    and suspicious activity patterns. It's commonly used during authentication and
    authorization flows to determine if an account should be prevented from logging
    in or performing certain actions.
    
    Args:
        user_id (str): The ID of the user account to check
        ip_address (Optional[str], optional): The IP address of the current request
        operation_id (Optional[str], optional): Operation ID for logging correlation
            
    Returns:
        Tuple[bool, Optional[str]]: A tuple containing:
            - bool: True if the account should be blocked, False otherwise
            - Optional[str]: The reason for blocking, or None if not blocked
            
    Example:
        ```python
        # During login process
        should_block, reason = check_account_status("user123", request.client_ip)
        if should_block:
            # Block the login attempt
            raise SecurityException(f"Account blocked: {reason}")
            
        # Before sensitive operations
        should_block, reason = check_account_status("user123", request.client_ip)
        if should_block:
            # Block the operation
            raise PermissionDenied(f"Account security issue: {reason}")
        ```
    """
    try:
        op_id = operation_id or f"check_account_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        return security_monitor.check_account_status(user_id, ip_address, op_id)
    except Exception as e:
        logger.error(f"Error checking account status: {str(e)}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        # In case of error, don't block by default
        return False, None


def get_suspicious_activities(user_id: str, limit: int = 10, 
                      operation_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Get recent suspicious activities for a user as dictionary objects.
    
    This utility function retrieves suspicious activities for a user and converts
    them to dictionary format for easier use in APIs and other contexts. It delegates
    to the global SecurityMonitor instance for the actual data retrieval.
    
    Args:
        user_id (str): The ID of the user to get activities for
        limit (int, optional): Maximum number of activities to return. Defaults to 10.
        operation_id (Optional[str], optional): Operation ID for logging correlation
            
    Returns:
        List[Dict[str, Any]]: List of recent suspicious activities as dictionaries,
            sorted by timestamp (newest first), limited to the specified count.
            Each dictionary contains all the fields from SecurityEventModel.
            
    Example:
        ```python
        # Get suspicious activities for display in admin panel
        activities = get_suspicious_activities("user123", limit=5)
        for activity in activities:
            print(f"{activity['timestamp']}: {activity['event_type']} - {activity['alert_level']}")
            print(f"Details: {activity['details']}")
        ```
    """
    try:
        op_id = operation_id or f"get_suspicious_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        events = security_monitor.get_suspicious_activities(user_id, limit, op_id)
        return [json.loads(event.to_log_entry()) for event in events]
    except Exception as e:
        logger.error(f"Error getting suspicious activities: {str(e)}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return []


def update_user_baseline(user_id: str, activity_data: Dict[str, Any],
                    operation_id: Optional[str] = None) -> bool:
    """
    Update the activity baseline for a user to establish normal behavior patterns.
    
    This utility function delegates to the global SecurityMonitor instance to update
    a user's activity baseline with new data. The baseline is used to detect anomalous
    behavior by comparing current activities against these established patterns.
    
    Args:
        user_id (str): The ID of the user to update baseline for
        activity_data (Dict[str, Any]): Activity data to update baseline with
        operation_id (Optional[str], optional): Operation ID for logging correlation
            
    Returns:
        bool: True if the baseline was successfully updated, False otherwise
            
    Example:
        ```python
        # Update user's typical login times after normal login
        update_user_baseline(
            "user123",
            {
                "usual_login_hours": [9, 10, 11, 12, 13, 14, 15, 16, 17],
                "usual_locations": ["New York", "Remote Office"]
            }
        )
        
        # Update user's typical data access patterns
        update_user_baseline(
            "user123",
            {
                "usual_resource_types": ["customer_record", "invoice", "product"],
                "usual_access_count": 25,  # Average daily accesses
                "access_count_threshold": 2.5  # Flag if 2.5x normal
            }
        )
        ```
    """
    try:
        op_id = operation_id or f"update_baseline_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        return security_monitor.update_user_baseline(user_id, activity_data, op_id)
    except Exception as e:
        logger.error(f"Error updating user baseline: {str(e)}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return False


def check_unusual_activity(user_id: str, activity_type: str, activity_data: Dict[str, Any],
                    operation_id: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    """
    Check if a user activity is unusual compared to their established baseline.
    
    This utility function compares current user activity against their established
    baseline to detect anomalies or suspicious behavior. It delegates to the global
    SecurityMonitor instance for the actual comparison logic.
    
    Args:
        user_id (str): The ID of the user to check activity for
        activity_type (str): Type of activity to check (e.g., "login_time", "data_access")
        activity_data (Dict[str, Any]): Data about the current activity to evaluate
        operation_id (Optional[str], optional): Operation ID for logging correlation
            
    Returns:
        Tuple[bool, Optional[str]]: A tuple containing:
            - bool: True if activity is unusual, False otherwise
            - Optional[str]: The reason why the activity is unusual, or None if normal
            
    Supported activity types:
        - "login_time": Checks if user is logging in at unusual hours
        - "data_access": Checks if user is accessing unusual resource types
        - "location": Checks if user is accessing from unusual location
        - "access_pattern": Checks for unusual access patterns or frequencies
            
    Example:
        ```python
        # Check if login time is unusual
        is_unusual, reason = check_unusual_activity(
            "user123",
            "login_time",
            {"hour": 3}  # 3 AM login
        )
        if is_unusual:
            # Log the unusual activity
            log_security_event(
                event_type=SecurityEventType.SUSPICIOUS_LOGIN_TIME,
                user_id="user123",
                alert_level=SecurityAlertLevel.MEDIUM,
                details={"reason": reason, "login_hour": 3}
            )
        ```
    """
    try:
        op_id = operation_id or f"check_unusual_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        return security_monitor.check_unusual_activity(user_id, activity_type, activity_data, op_id)
    except Exception as e:
        logger.error(f"Error checking unusual activity: {str(e)}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return False, None


def add_malicious_ip(ip_address: str, persist: bool = False,
                operation_id: Optional[str] = None) -> bool:
    """
    Add an IP address to the list of known malicious IPs.
    
    This utility function adds an IP address to the internal blacklist of known
    malicious IPs maintained by the SecurityMonitor. It delegates to the global
    SecurityMonitor instance for the actual implementation.
    
    Args:
        ip_address (str): The IP address to add to the malicious list
        persist (bool, optional): Whether to persist the IP to the malicious IPs file.
            Defaults to False.
        operation_id (Optional[str], optional): Operation ID for logging correlation
            
    Returns:
        bool: True if the IP was successfully added, False otherwise
            
    Example:
        ```python
        # Add a malicious IP and persist it to disk
        success = add_malicious_ip("192.168.1.100", persist=True)
        if success:
            # Log the action
            log_security_event(
                event_type=SecurityEventType.SUSPICIOUS_IP,
                ip_address="192.168.1.100",
                alert_level=SecurityAlertLevel.HIGH,
                details={"reason": "Manual addition to blacklist", "persisted": True}
            )
        ```
    """
    try:
        op_id = operation_id or f"add_malicious_ip_{int(time.time() * 1000)}_{uuid.uuid4().hex[:6]}"
        return security_monitor.add_malicious_ip(ip_address, op_id, persist)
    except Exception as e:
        logger.error(f"Error adding malicious IP: {str(e)}")
        logger.debug(f"Traceback: {traceback.format_exc()}")
        return False