"""
Centralized error reporting and collection system.

This module provides utilities for centralized error reporting, collection,
and analysis, particularly useful in containerized environments where log
aggregation and error monitoring are essential.
"""

import os
import sys
import time
import uuid
import json
import logging
import threading
import traceback
from datetime import datetime
from typing import Dict, List, Any, Optional, Union, Set, Tuple, Type, Callable
from enum import Enum

# Setup logging
logger = logging.getLogger(__name__)

# Import structured logging if available
try:
    from utils.logging.errors import log_exception, get_error_logger
    from utils.logging.context import get_request_context
    structured_logging_available = True
except ImportError:
    structured_logging_available = False

# Error severity levels
class ErrorSeverity(Enum):
    """Severity levels for errors."""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"
    FATAL = "fatal"

# Error categories
class ErrorCategory(Enum):
    """Categories of errors for classification."""
    SYSTEM = "system"
    DATABASE = "database"
    NETWORK = "network"
    SECURITY = "security"
    VALIDATION = "validation"
    BUSINESS_LOGIC = "business_logic"
    EXTERNAL_SERVICE = "external_service"
    CONFIGURATION = "configuration"
    PERFORMANCE = "performance"
    RESOURCE = "resource"
    CONTAINER = "container"
    UNKNOWN = "unknown"

class ErrorRecord:
    """
    Represents a recorded error with context and metadata.
    
    This class encapsulates an error with its context, stacktrace,
    and other metadata for comprehensive error reporting.
    """
    
    def __init__(
        self,
        error_id: str,
        error_type: str,
        message: str,
        timestamp: float,
        severity: ErrorSeverity,
        category: ErrorCategory,
        traceback: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        container_id: Optional[str] = None,
        user_id: Optional[str] = None,
        source: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize an error record.
        
        Args:
            error_id: Unique identifier for this error
            error_type: Type/class of the error
            message: Error message
            timestamp: Unix timestamp when the error occurred
            severity: Error severity level
            category: Error category
            traceback: Exception traceback
            context: Additional context about the error
            request_id: ID of the request that caused the error
            container_id: ID of the container where the error occurred
            user_id: ID of the user affected by the error
            source: Source of the error (module, function, etc.)
            metadata: Additional metadata about the error
        """
        self.error_id = error_id
        self.error_type = error_type
        self.message = message
        self.timestamp = timestamp
        self.severity = severity
        self.category = category
        self.traceback = traceback
        self.context = context or {}
        self.request_id = request_id
        self.container_id = container_id
        self.user_id = user_id
        self.source = source
        self.metadata = metadata or {}
        
        # Initialize processing status
        self.processed = False
        self.processed_at = None
        self.process_result = None
    
    def mark_as_processed(self, result: Optional[Any] = None) -> None:
        """
        Mark this error as processed.
        
        Args:
            result: Optional result of processing
        """
        self.processed = True
        self.processed_at = time.time()
        self.process_result = result
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert error record to dictionary.
        
        Returns:
            Dictionary representation of the error record
        """
        return {
            "error_id": self.error_id,
            "error_type": self.error_type,
            "message": self.message,
            "timestamp": self.timestamp,
            "datetime": datetime.fromtimestamp(self.timestamp).isoformat(),
            "severity": self.severity.value,
            "category": self.category.value,
            "traceback": self.traceback,
            "context": self.context,
            "request_id": self.request_id,
            "container_id": self.container_id,
            "user_id": self.user_id,
            "source": self.source,
            "metadata": self.metadata,
            "processed": self.processed,
            "processed_at": self.processed_at,
            "process_result": self.process_result
        }
    
    def to_json(self) -> str:
        """
        Convert error record to JSON string.
        
        Returns:
            JSON string representation of the error record
        """
        return json.dumps(self.to_dict())
    
    @classmethod
    def from_exception(
        cls,
        exc: Exception,
        severity: ErrorSeverity = ErrorSeverity.ERROR,
        category: Optional[ErrorCategory] = None,
        context: Optional[Dict[str, Any]] = None,
        source: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        include_traceback: bool = True
    ) -> 'ErrorRecord':
        """
        Create an error record from an exception.
        
        Args:
            exc: Exception to record
            severity: Error severity level
            category: Error category (if None, determined from exception type)
            context: Additional context about the error
            source: Source of the error (module, function, etc.)
            metadata: Additional metadata about the error
            include_traceback: Whether to include traceback in the record
            
        Returns:
            Error record from the exception
        """
        # Generate error ID
        error_id = str(uuid.uuid4())
        
        # Get error type and message
        error_type = type(exc).__name__
        message = str(exc)
        
        # Get traceback if requested
        tb = None
        if include_traceback:
            tb = ''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))
        
        # Determine category if not provided
        if category is None:
            category = cls._categorize_exception(exc)
        
        # Get request context if available
        request_id = None
        user_id = None
        if structured_logging_available:
            request_ctx = get_request_context()
            request_id = request_ctx.get("request_id")
            user_id = request_ctx.get("user_id")
        
        # Get container ID if available
        container_id = os.environ.get("CONTAINER_ID", None)
        
        # Create context dictionary
        error_context = {}
        if context:
            error_context.update(context)
        
        # Determine source if not provided
        if source is None:
            try:
                frame = sys._getframe(1)
                module = frame.f_globals.get('__name__', '')
                function = frame.f_code.co_name
                source = f"{module}.{function}"
            except Exception:
                pass
        
        return cls(
            error_id=error_id,
            error_type=error_type,
            message=message,
            timestamp=time.time(),
            severity=severity,
            category=category,
            traceback=tb,
            context=error_context,
            request_id=request_id,
            container_id=container_id,
            user_id=user_id,
            source=source,
            metadata=metadata
        )
    
    @staticmethod
    def _categorize_exception(exc: Exception) -> ErrorCategory:
        """
        Categorize an exception based on its type.
        
        Args:
            exc: Exception to categorize
            
        Returns:
            Error category
        """
        exc_type = type(exc).__name__
        
        if exc_type in ('ConnectionError', 'ConnectTimeout', 'ReadTimeout', 'HTTPError'):
            return ErrorCategory.NETWORK
        elif exc_type in ('DatabaseError', 'IntegrityError', 'OperationalError'):
            return ErrorCategory.DATABASE
        elif exc_type in ('PermissionError', 'AuthenticationError', 'AuthorizationError'):
            return ErrorCategory.SECURITY
        elif exc_type in ('ValidationError', 'ValueError', 'TypeError'):
            return ErrorCategory.VALIDATION
        elif exc_type in ('ConfigurationError', 'EnvironmentError'):
            return ErrorCategory.CONFIGURATION
        elif exc_type in ('ContainerError', 'ResourceExhaustedError'):
            return ErrorCategory.CONTAINER
        elif exc_type in ('MemoryError', 'ResourceWarning', 'OutOfMemoryError'):
            return ErrorCategory.RESOURCE
        elif exc_type in ('ExternalServiceError', 'DependencyError'):
            return ErrorCategory.EXTERNAL_SERVICE
        elif exc_type in ('PerformanceError', 'TimeoutError'):
            return ErrorCategory.PERFORMANCE
        elif exc_type in ('SystemError', 'OSError'):
            return ErrorCategory.SYSTEM
        else:
            return ErrorCategory.UNKNOWN


class ErrorReporter:
    """
    Centralized error reporting and collection system.
    
    This class provides a centralized system for reporting, collecting,
    and processing errors throughout the application.
    """
    
    def __init__(
        self,
        max_errors: int = 1000,
        enable_logging: bool = True,
        enable_persistence: bool = False,
        error_log_path: Optional[str] = None
    ):
        """
        Initialize the error reporter.
        
        Args:
            max_errors: Maximum number of errors to keep in memory
            enable_logging: Whether to log errors to the logging system
            enable_persistence: Whether to persist errors to disk
            error_log_path: Path to error log file (if persistence enabled)
        """
        self.max_errors = max_errors
        self.enable_logging = enable_logging
        self.enable_persistence = enable_persistence
        self.error_log_path = error_log_path
        
        # Error storage
        self.errors: List[ErrorRecord] = []
        self.error_counts: Dict[str, int] = {}  # Counts by error type
        self.error_map: Dict[str, ErrorRecord] = {}  # Map of error ID to record
        
        # Error processors (functions to call on new errors)
        self.error_processors: List[Callable[[ErrorRecord], Any]] = []
        
        # Thread safety
        self._lock = threading.RLock()
        
        # Track some statistics
        self.total_errors = 0
        self.start_time = time.time()
        
        # Set up error log file if persistence enabled
        if enable_persistence and error_log_path:
            os.makedirs(os.path.dirname(error_log_path), exist_ok=True)
    
    def report_error(
        self,
        error_type: str,
        message: str,
        severity: ErrorSeverity = ErrorSeverity.ERROR,
        category: ErrorCategory = ErrorCategory.UNKNOWN,
        traceback: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        request_id: Optional[str] = None,
        source: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Report an error manually.
        
        Args:
            error_type: Type/class of the error
            message: Error message
            severity: Error severity level
            category: Error category
            traceback: Exception traceback
            context: Additional context about the error
            request_id: ID of the request that caused the error
            source: Source of the error (module, function, etc.)
            metadata: Additional metadata about the error
            
        Returns:
            Error ID of the recorded error
        """
        # Generate error ID
        error_id = str(uuid.uuid4())
        
        # Create error record
        error_record = ErrorRecord(
            error_id=error_id,
            error_type=error_type,
            message=message,
            timestamp=time.time(),
            severity=severity,
            category=category,
            traceback=traceback,
            context=context,
            request_id=request_id,
            container_id=os.environ.get("CONTAINER_ID"),
            user_id=None,  # Not available in manual reporting
            source=source,
            metadata=metadata
        )
        
        # Store and process the error
        self._store_error(error_record)
        
        return error_id
    
    def report_exception(
        self,
        exc: Exception,
        severity: ErrorSeverity = ErrorSeverity.ERROR,
        category: Optional[ErrorCategory] = None,
        context: Optional[Dict[str, Any]] = None,
        source: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Report an exception.
        
        Args:
            exc: Exception to report
            severity: Error severity level
            category: Error category (if None, determined from exception type)
            context: Additional context about the error
            source: Source of the error (module, function, etc.)
            metadata: Additional metadata about the error
            
        Returns:
            Error ID of the recorded error
        """
        # Create error record from exception
        error_record = ErrorRecord.from_exception(
            exc=exc,
            severity=severity,
            category=category,
            context=context,
            source=source,
            metadata=metadata
        )
        
        # Store and process the error
        self._store_error(error_record)
        
        return error_record.error_id
    
    def _store_error(self, error_record: ErrorRecord) -> None:
        """
        Store an error record and process it.
        
        Args:
            error_record: Error record to store
        """
        with self._lock:
            # Log the error if enabled
            if self.enable_logging:
                self._log_error(error_record)
            
            # Persist the error if enabled
            if self.enable_persistence and self.error_log_path:
                self._persist_error(error_record)
            
            # Add to in-memory storage
            self.errors.append(error_record)
            self.error_map[error_record.error_id] = error_record
            
            # Update error counts
            self.error_counts[error_record.error_type] = self.error_counts.get(error_record.error_type, 0) + 1
            self.total_errors += 1
            
            # Trim errors if we exceed max_errors
            if len(self.errors) > self.max_errors:
                # Remove oldest errors
                excess = len(self.errors) - self.max_errors
                removed = self.errors[:excess]
                self.errors = self.errors[excess:]
                
                # Update error map
                for error in removed:
                    if error.error_id in self.error_map:
                        del self.error_map[error.error_id]
        
        # Process the error (outside the lock to avoid deadlocks)
        self._process_error(error_record)
    
    def _log_error(self, error_record: ErrorRecord) -> None:
        """
        Log an error record to the logging system.
        
        Args:
            error_record: Error record to log
        """
        # Determine log level based on severity
        log_level = {
            ErrorSeverity.DEBUG: logging.DEBUG,
            ErrorSeverity.INFO: logging.INFO,
            ErrorSeverity.WARNING: logging.WARNING,
            ErrorSeverity.ERROR: logging.ERROR,
            ErrorSeverity.CRITICAL: logging.CRITICAL,
            ErrorSeverity.FATAL: logging.CRITICAL
        }.get(error_record.severity, logging.ERROR)
        
        # Create log message
        log_message = f"[{error_record.error_id}] {error_record.error_type}: {error_record.message}"
        
        # Use structured logging if available
        if structured_logging_available:
            error_logger = get_error_logger(__name__)
            error_logger.log_error(
                message=log_message,
                level=log_level,
                context={
                    "error_record": error_record.to_dict()
                }
            )
        else:
            # Fall back to basic logging
            logger.log(log_level, log_message)
            
            # Log traceback separately for critical/fatal errors
            if (log_level >= logging.ERROR and error_record.traceback and 
                    error_record.severity in (ErrorSeverity.CRITICAL, ErrorSeverity.FATAL)):
                logger.log(log_level, f"Traceback:\n{error_record.traceback}")
    
    def _persist_error(self, error_record: ErrorRecord) -> None:
        """
        Persist an error record to disk.
        
        Args:
            error_record: Error record to persist
        """
        if not self.error_log_path:
            return
        
        try:
            # Write error to log file as JSON
            with open(self.error_log_path, 'a') as f:
                f.write(error_record.to_json() + '\n')
        except Exception as e:
            logger.error(f"Error persisting error record: {e}")
    
    def _process_error(self, error_record: ErrorRecord) -> None:
        """
        Process an error record using registered processors.
        
        Args:
            error_record: Error record to process
        """
        for processor in self.error_processors:
            try:
                result = processor(error_record)
                error_record.mark_as_processed(result)
            except Exception as e:
                logger.error(f"Error in error processor: {e}")
    
    def register_processor(
        self,
        processor: Callable[[ErrorRecord], Any]
    ) -> None:
        """
        Register an error processor function.
        
        Args:
            processor: Function to call for each new error
        """
        with self._lock:
            self.error_processors.append(processor)
    
    def get_error(self, error_id: str) -> Optional[ErrorRecord]:
        """
        Get an error record by ID.
        
        Args:
            error_id: ID of the error to get
            
        Returns:
            Error record if found, None otherwise
        """
        with self._lock:
            return self.error_map.get(error_id)
    
    def get_errors(
        self,
        severity: Optional[ErrorSeverity] = None,
        category: Optional[ErrorCategory] = None,
        error_type: Optional[str] = None,
        limit: Optional[int] = None,
        since: Optional[float] = None
    ) -> List[ErrorRecord]:
        """
        Get filtered errors.
        
        Args:
            severity: Filter by severity level
            category: Filter by category
            error_type: Filter by error type
            limit: Maximum number of errors to return
            since: Only return errors after this timestamp
            
        Returns:
            List of matching error records
        """
        with self._lock:
            # Apply filters
            filtered_errors = self.errors
            
            if severity:
                filtered_errors = [e for e in filtered_errors if e.severity == severity]
            
            if category:
                filtered_errors = [e for e in filtered_errors if e.category == category]
            
            if error_type:
                filtered_errors = [e for e in filtered_errors if e.error_type == error_type]
            
            if since:
                filtered_errors = [e for e in filtered_errors if e.timestamp >= since]
            
            # Sort by timestamp (most recent first)
            filtered_errors = sorted(filtered_errors, key=lambda e: e.timestamp, reverse=True)
            
            # Apply limit if specified
            if limit:
                filtered_errors = filtered_errors[:limit]
            
            return filtered_errors
    
    def get_error_counts(
        self,
        by_severity: bool = False,
        by_category: bool = False,
        by_type: bool = True,
        since: Optional[float] = None
    ) -> Dict[str, int]:
        """
        Get error counts by different groupings.
        
        Args:
            by_severity: Group by severity level
            by_category: Group by category
            by_type: Group by error type
            since: Only count errors after this timestamp
            
        Returns:
            Dictionary of group keys to counts
        """
        with self._lock:
            # Filter by timestamp if specified
            errors = self.errors
            if since:
                errors = [e for e in errors if e.timestamp >= since]
            
            # Group by the specified dimension(s)
            counts = {}
            
            if by_severity:
                # Group by severity
                severity_counts = {}
                for e in errors:
                    severity_counts[e.severity.value] = severity_counts.get(e.severity.value, 0) + 1
                counts["by_severity"] = severity_counts
            
            if by_category:
                # Group by category
                category_counts = {}
                for e in errors:
                    category_counts[e.category.value] = category_counts.get(e.category.value, 0) + 1
                counts["by_category"] = category_counts
            
            if by_type:
                # Group by error type
                type_counts = {}
                for e in errors:
                    type_counts[e.error_type] = type_counts.get(e.error_type, 0) + 1
                counts["by_type"] = type_counts
            
            return counts
    
    def get_error_rate(
        self,
        window_seconds: int = 60,
        severity: Optional[ErrorSeverity] = None,
        category: Optional[ErrorCategory] = None
    ) -> float:
        """
        Get the error rate within a time window.
        
        Args:
            window_seconds: Time window in seconds
            severity: Filter by severity level
            category: Filter by category
            
        Returns:
            Error rate in errors per second
        """
        with self._lock:
            # Calculate window start time
            window_start = time.time() - window_seconds
            
            # Count errors in the window
            count = 0
            for e in self.errors:
                if e.timestamp >= window_start:
                    if severity and e.severity != severity:
                        continue
                    if category and e.category != category:
                        continue
                    count += 1
            
            # Calculate rate
            return count / window_seconds
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get error reporter statistics.
        
        Returns:
            Dictionary of error statistics
        """
        with self._lock:
            uptime = time.time() - self.start_time
            
            # Calculate error rates for different time windows
            error_rate_1m = self.get_error_rate(window_seconds=60)
            error_rate_5m = self.get_error_rate(window_seconds=300)
            error_rate_15m = self.get_error_rate(window_seconds=900)
            
            # Count errors by severity
            severity_counts = {}
            for severity in ErrorSeverity:
                severity_counts[severity.value] = len([e for e in self.errors if e.severity == severity])
            
            # Count errors by category
            category_counts = {}
            for category in ErrorCategory:
                category_counts[category.value] = len([e for e in self.errors if e.category == category])
            
            # Get top 10 error types
            error_types = sorted(
                self.error_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]
            
            return {
                "total_errors": self.total_errors,
                "current_errors": len(self.errors),
                "uptime_seconds": uptime,
                "errors_per_second": self.total_errors / uptime if uptime > 0 else 0,
                "error_rate_1m": error_rate_1m,
                "error_rate_5m": error_rate_5m,
                "error_rate_15m": error_rate_15m,
                "by_severity": severity_counts,
                "by_category": category_counts,
                "top_error_types": dict(error_types)
            }
    
    def clear_errors(self) -> int:
        """
        Clear all errors from memory.
        
        Returns:
            Number of errors cleared
        """
        with self._lock:
            count = len(self.errors)
            self.errors = []
            self.error_map = {}
            self.error_counts = {}
            return count
    
    def reset_stats(self) -> None:
        """Reset error statistics."""
        with self._lock:
            self.total_errors = len(self.errors)
            self.start_time = time.time()


# Create a singleton instance
_error_reporter = ErrorReporter()

# Expose singleton methods as module functions
report_error = _error_reporter.report_error
report_exception = _error_reporter.report_exception
register_processor = _error_reporter.register_processor
get_error = _error_reporter.get_error
get_errors = _error_reporter.get_errors
get_error_counts = _error_reporter.get_error_counts
get_error_rate = _error_reporter.get_error_rate
get_stats = _error_reporter.get_stats
clear_errors = _error_reporter.clear_errors
reset_stats = _error_reporter.reset_stats


def setup_error_reporting(
    max_errors: int = 1000,
    enable_logging: bool = True,
    enable_persistence: bool = False,
    error_log_path: Optional[str] = None
) -> None:
    """
    Set up the error reporting system.
    
    Args:
        max_errors: Maximum number of errors to keep in memory
        enable_logging: Whether to log errors to the logging system
        enable_persistence: Whether to persist errors to disk
        error_log_path: Path to error log file (if persistence enabled)
    """
    global _error_reporter
    _error_reporter = ErrorReporter(
        max_errors=max_errors,
        enable_logging=enable_logging,
        enable_persistence=enable_persistence,
        error_log_path=error_log_path
    )
    
    logger.info(f"Error reporting system initialized (max_errors={max_errors}, "
              f"enable_logging={enable_logging}, enable_persistence={enable_persistence})")
    
    # Register with signal handlers if available
    try:
        from utils.signal_handlers import register_shutdown_handler
        
        def log_error_stats():
            stats = get_stats()
            logger.info(f"Error statistics at shutdown: {json.dumps(stats)}")
        
        register_shutdown_handler("error_reporter", log_error_stats)
        logger.info("Registered error reporter shutdown handler")
    except ImportError:
        logger.warning("Could not register error reporter shutdown handler: signal_handlers module not found")
    except Exception as e:
        logger.error(f"Error registering error reporter shutdown handler: {e}")