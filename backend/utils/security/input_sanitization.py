"""
Input sanitization and validation utilities.

This module provides standardized utilities for input sanitization and validation
across the TAP Integration Platform. It defines common sanitization patterns,
validation functions, and security checks for user inputs.

Features:
- String sanitization for various contexts (HTML, SQL, path, etc.)
- Input validation for common data types
- File content validation
- Request parameter sanitization
- Detailed error handling and reporting
- Comprehensive logging

All utilities follow consistent patterns:
1. Operation ID tracking for correlated logging
2. Performance monitoring with threshold warnings
3. Thread safety when applicable
4. Detailed error handling with context
5. Comprehensive docstrings with examples
"""

import logging
import time
import traceback
import re
import os
import json
import uuid
from typing import Dict, Any, List, Optional, Set, Tuple, Union, Type, Callable
from threading import Lock
from datetime import datetime
from enum import Enum
import html
import urllib.parse
from pathlib import Path
import mimetypes
import hashlib
from io import BytesIO
import base64

from fastapi import Request, UploadFile, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field, ValidationError, field_validator
from pydantic_core import PydanticCustomError

# Setup logging
logger = logging.getLogger(__name__)

# Constants
SLOW_OPERATION_THRESHOLD_MS = 50  # Threshold for logging slow operations (milliseconds)


class SanitizationContext(str, Enum):
    """
    Sanitization context enum defining different contexts for sanitization.
    
    Different contexts require different sanitization rules based on how the
    data will be used. For example, HTML context requires different sanitization
    than a SQL context or a path context.
    """
    HTML = "html"
    SQL = "sql"
    JAVASCRIPT = "javascript"
    PATH = "path"
    SHELL = "shell"
    URL = "url"
    XML = "xml"
    JSON = "json"
    CSV = "csv"
    PLAIN_TEXT = "plain_text"


class ValidationType(str, Enum):
    """
    Validation type enum defining different types of validation.
    
    This enum defines the standard validation types available in the system.
    """
    EMAIL = "email"
    URL = "url"
    PHONE = "phone"
    DATE = "date"
    TIME = "time"
    DATETIME = "datetime"
    IP_ADDRESS = "ip_address"
    UUID = "uuid"
    NUMBER = "number"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    STRING = "string"
    ALPHA = "alpha"
    ALPHANUMERIC = "alphanumeric"
    FILE = "file"
    JSON = "json"
    XML = "xml"
    CSV = "csv"
    PASSWORD = "password"
    USERNAME = "username"
    TENANT_ID = "tenant_id"
    USER_ID = "user_id"


class StringSanitizer:
    """
    String sanitization utility.
    
    This class provides methods for sanitizing strings in various contexts,
    ensuring they are safe for use in different environments like HTML, SQL,
    shell commands, file paths, etc.
    """
    
    def __init__(self):
        """Initialize the string sanitizer."""
        # Thread safety for stateful operations
        self._lock = Lock()
        
        # Common regex patterns for validation
        self._patterns = {
            'email': re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'),
            'url': re.compile(r'^(https?|ftp)://[^\s/$.?#].[^\s]*$'),
            'phone': re.compile(r'^\+?[0-9]{7,15}$'),
            'date': re.compile(r'^\d{4}-\d{2}-\d{2}$'),
            'time': re.compile(r'^\d{2}:\d{2}(:\d{2})?$'),
            'datetime': re.compile(r'^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$'),
            'ip_address': re.compile(r'^(\d{1,3}\.){3}\d{1,3}$'),
            'uuid': re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
            'alpha': re.compile(r'^[a-zA-Z]+$'),
            'alphanumeric': re.compile(r'^[a-zA-Z0-9]+$')
        }
        
        # Dangerous patterns that should be escaped or removed
        self._dangerous_patterns = {
            'sql_injection': [
                re.compile(r'(\b(select|insert|update|delete|from|drop|alter|exec|union)\b)', re.IGNORECASE),
                re.compile(r'(--|\b(or|and)\b\s+\'[^\']*\'?\s*=\s*\'[^\']*\')', re.IGNORECASE)
            ],
            'xss': [
                re.compile(r'<script[^>]*>.*?</script>', re.IGNORECASE | re.DOTALL),
                re.compile(r'javascript:', re.IGNORECASE),
                re.compile(r'on\w+\s*=', re.IGNORECASE)
            ],
            'path_traversal': [
                re.compile(r'\.\./')
            ],
            'shell_injection': [
                re.compile(r'[;&|`]')
            ]
        }
    
    def sanitize(
        self,
        value: str,
        context: SanitizationContext = SanitizationContext.PLAIN_TEXT,
        operation_id: Optional[str] = None
    ) -> str:
        """
        Sanitize a string value based on the specified context.
        
        Args:
            value (str): The string value to sanitize
            context (SanitizationContext, optional): The context for sanitization.
                Defaults to SanitizationContext.PLAIN_TEXT.
            operation_id (Optional[str], optional): Correlation ID for logging.
                Defaults to None.
                
        Returns:
            str: The sanitized string
            
        Example:
            ```python
            from backend.utils.security.input_sanitization import StringSanitizer, SanitizationContext
            
            sanitizer = StringSanitizer()
            
            # Sanitize HTML input
            html_input = "<script>alert('XSS')</script>"
            safe_html = sanitizer.sanitize(html_input, SanitizationContext.HTML)
            
            # Sanitize SQL input
            sql_input = "Robert'); DROP TABLE Students;--"
            safe_sql = sanitizer.sanitize(sql_input, SanitizationContext.SQL)
            ```
        """
        op_id = operation_id or f"sanitize_{int(time.time() * 1000)}"
        start_time = time.time()
        
        if value is None:
            return ""
        
        if not isinstance(value, str):
            # Convert to string if not already
            try:
                value = str(value)
            except Exception as e:
                logger.error(f"[{op_id}] Error converting value to string: {str(e)}")
                return ""
        
        try:
            # Apply appropriate sanitization based on context
            if context == SanitizationContext.HTML:
                result = self._sanitize_html(value, op_id)
            elif context == SanitizationContext.SQL:
                result = self._sanitize_sql(value, op_id)
            elif context == SanitizationContext.JAVASCRIPT:
                result = self._sanitize_javascript(value, op_id)
            elif context == SanitizationContext.PATH:
                result = self._sanitize_path(value, op_id)
            elif context == SanitizationContext.SHELL:
                result = self._sanitize_shell(value, op_id)
            elif context == SanitizationContext.URL:
                result = self._sanitize_url(value, op_id)
            elif context == SanitizationContext.XML:
                result = self._sanitize_xml(value, op_id)
            elif context == SanitizationContext.JSON:
                result = self._sanitize_json(value, op_id)
            elif context == SanitizationContext.CSV:
                result = self._sanitize_csv(value, op_id)
            else:
                # Plain text - basic sanitization
                result = self._sanitize_plain_text(value, op_id)
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow string sanitization ({context}): {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] String sanitization ({context}) completed in {elapsed_ms}ms")
            
            return result
            
        except Exception as e:
            logger.error(f"[{op_id}] Error sanitizing string: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return empty string on error to be safe
            return ""
    
    def _sanitize_html(self, value: str, operation_id: str) -> str:
        """
        Sanitize a string for HTML context.
        
        Args:
            value (str): The string to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            str: The sanitized string
        """
        # Use the html module for HTML escaping
        return html.escape(value)
    
    def _sanitize_sql(self, value: str, operation_id: str) -> str:
        """
        Sanitize a string for SQL context.
        
        Args:
            value (str): The string to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            str: The sanitized string
        """
        # Replace single quotes with double single quotes
        # This is a basic sanitization - in production, always use parameterized queries
        sanitized = value.replace("'", "''")
        
        # Log if potentially dangerous SQL patterns were found
        for pattern in self._dangerous_patterns['sql_injection']:
            if pattern.search(value):
                logger.warning(f"[{operation_id}] Potentially dangerous SQL pattern detected: {value}")
                break
        
        return sanitized
    
    def _sanitize_javascript(self, value: str, operation_id: str) -> str:
        """
        Sanitize a string for JavaScript context.
        
        Args:
            value (str): The string to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            str: The sanitized string
        """
        # Escape special characters
        sanitized = json.dumps(value)[1:-1]  # Remove surrounding quotes
        
        # Log if potentially dangerous JavaScript patterns were found
        for pattern in self._dangerous_patterns['xss']:
            if pattern.search(value):
                logger.warning(f"[{operation_id}] Potentially dangerous JavaScript pattern detected: {value}")
                break
        
        return sanitized
    
    def _sanitize_path(self, value: str, operation_id: str) -> str:
        """
        Sanitize a string for file path context.
        
        Args:
            value (str): The string to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            str: The sanitized string
        """
        # Replace path traversal sequences
        sanitized = value.replace("..", "").replace("//", "/")
        
        # Remove any characters that could be problematic in paths
        sanitized = re.sub(r'[<>:"|?*]', "", sanitized)
        
        # Log if potentially dangerous path patterns were found
        for pattern in self._dangerous_patterns['path_traversal']:
            if pattern.search(value):
                logger.warning(f"[{operation_id}] Potentially dangerous path traversal pattern detected: {value}")
                break
        
        return sanitized
    
    def _sanitize_shell(self, value: str, operation_id: str) -> str:
        """
        Sanitize a string for shell command context.
        
        Args:
            value (str): The string to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            str: The sanitized string
        """
        # Replace characters that could be used for shell injection
        sanitized = re.sub(r'[;&|`]', "", value)
        
        # Log if potentially dangerous shell patterns were found
        for pattern in self._dangerous_patterns['shell_injection']:
            if pattern.search(value):
                logger.warning(f"[{operation_id}] Potentially dangerous shell pattern detected: {value}")
                break
        
        return sanitized
    
    def _sanitize_url(self, value: str, operation_id: str) -> str:
        """
        Sanitize a string for URL context.
        
        Args:
            value (str): The string to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            str: The sanitized string
        """
        # Use urllib for URL encoding
        sanitized = urllib.parse.quote(value)
        
        # Log if potentially dangerous URL patterns were found
        if "javascript:" in value.lower():
            logger.warning(f"[{operation_id}] Potentially dangerous JavaScript URL pattern detected: {value}")
        
        return sanitized
    
    def _sanitize_xml(self, value: str, operation_id: str) -> str:
        """
        Sanitize a string for XML context.
        
        Args:
            value (str): The string to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            str: The sanitized string
        """
        # Escape XML special characters
        sanitized = (value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&apos;"))
        
        return sanitized
    
    def _sanitize_json(self, value: str, operation_id: str) -> str:
        """
        Sanitize a string for JSON context.
        
        Args:
            value (str): The string to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            str: The sanitized string
        """
        # Use json module for escaping JSON strings
        sanitized = json.dumps(value)[1:-1]  # Remove surrounding quotes
        
        return sanitized
    
    def _sanitize_csv(self, value: str, operation_id: str) -> str:
        """
        Sanitize a string for CSV context.
        
        Args:
            value (str): The string to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            str: The sanitized string
        """
        # If value contains comma, newline, or double-quote, escape it
        if any(c in value for c in [',', '\n', '\r', '"']):
            # Escape double quotes by doubling them
            sanitized = value.replace('"', '""')
            # Wrap in double quotes
            sanitized = f'"{sanitized}"'
        else:
            sanitized = value
        
        return sanitized
    
    def _sanitize_plain_text(self, value: str, operation_id: str) -> str:
        """
        Sanitize a string for plain text context.
        
        Args:
            value (str): The string to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            str: The sanitized string
        """
        # For plain text, we just strip any control characters
        sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)
        
        return sanitized
    
    def validate(
        self,
        value: str,
        validation_type: ValidationType,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Validate a string based on the specified validation type.
        
        Args:
            value (str): The string value to validate
            validation_type (ValidationType): The type of validation to perform
            operation_id (Optional[str], optional): Correlation ID for logging.
                Defaults to None.
                
        Returns:
            bool: True if valid, False otherwise
            
        Example:
            ```python
            from backend.utils.security.input_sanitization import StringSanitizer, ValidationType
            
            sanitizer = StringSanitizer()
            
            # Validate an email address
            email = "user@example.com"
            is_valid = sanitizer.validate(email, ValidationType.EMAIL)
            
            # Validate a URL
            url = "https://example.com"
            is_valid = sanitizer.validate(url, ValidationType.URL)
            ```
        """
        op_id = operation_id or f"validate_{int(time.time() * 1000)}"
        start_time = time.time()
        
        if value is None:
            return False
        
        if not isinstance(value, str):
            # Convert to string if not already
            try:
                value = str(value)
            except Exception as e:
                logger.error(f"[{op_id}] Error converting value to string for validation: {str(e)}")
                return False
        
        try:
            # Apply validation based on type
            if validation_type == ValidationType.EMAIL:
                result = self._validate_email(value, op_id)
            elif validation_type == ValidationType.URL:
                result = self._validate_url(value, op_id)
            elif validation_type == ValidationType.PHONE:
                result = self._validate_phone(value, op_id)
            elif validation_type == ValidationType.DATE:
                result = self._validate_date(value, op_id)
            elif validation_type == ValidationType.TIME:
                result = self._validate_time(value, op_id)
            elif validation_type == ValidationType.DATETIME:
                result = self._validate_datetime(value, op_id)
            elif validation_type == ValidationType.IP_ADDRESS:
                result = self._validate_ip_address(value, op_id)
            elif validation_type == ValidationType.UUID:
                result = self._validate_uuid(value, op_id)
            elif validation_type == ValidationType.NUMBER:
                result = self._validate_number(value, op_id)
            elif validation_type == ValidationType.INTEGER:
                result = self._validate_integer(value, op_id)
            elif validation_type == ValidationType.BOOLEAN:
                result = self._validate_boolean(value, op_id)
            elif validation_type == ValidationType.ALPHA:
                result = self._validate_alpha(value, op_id)
            elif validation_type == ValidationType.ALPHANUMERIC:
                result = self._validate_alphanumeric(value, op_id)
            elif validation_type == ValidationType.PASSWORD:
                result = self._validate_password(value, op_id)
            elif validation_type == ValidationType.USERNAME:
                result = self._validate_username(value, op_id)
            elif validation_type == ValidationType.TENANT_ID:
                result = self._validate_tenant_id(value, op_id)
            elif validation_type == ValidationType.USER_ID:
                result = self._validate_user_id(value, op_id)
            else:
                # Default validation - non-empty string
                result = bool(value.strip())
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow string validation ({validation_type}): {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] String validation ({validation_type}) completed in {elapsed_ms}ms")
            
            return result
            
        except Exception as e:
            logger.error(f"[{op_id}] Error validating string: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return False
    
    def _validate_email(self, value: str, operation_id: str) -> bool:
        """
        Validate an email address.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        return bool(self._patterns['email'].match(value))
    
    def _validate_url(self, value: str, operation_id: str) -> bool:
        """
        Validate a URL.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        return bool(self._patterns['url'].match(value))
    
    def _validate_phone(self, value: str, operation_id: str) -> bool:
        """
        Validate a phone number.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        return bool(self._patterns['phone'].match(value))
    
    def _validate_date(self, value: str, operation_id: str) -> bool:
        """
        Validate a date string (YYYY-MM-DD).
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        if not self._patterns['date'].match(value):
            return False
        
        # Additional validation for valid date values
        try:
            year, month, day = map(int, value.split('-'))
            if not (1 <= month <= 12 and 1 <= day <= 31):
                return False
                
            # Additional checks for specific months
            if month in [4, 6, 9, 11] and day > 30:
                return False
            elif month == 2:
                # Leap year check
                is_leap_year = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
                if day > 29 or (not is_leap_year and day > 28):
                    return False
            
            return True
        except ValueError:
            return False
    
    def _validate_time(self, value: str, operation_id: str) -> bool:
        """
        Validate a time string (HH:MM or HH:MM:SS).
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        if not self._patterns['time'].match(value):
            return False
        
        # Additional validation for valid time values
        try:
            parts = value.split(':')
            if len(parts) < 2 or len(parts) > 3:
                return False
                
            hour, minute = int(parts[0]), int(parts[1])
            second = int(parts[2]) if len(parts) > 2 else 0
            
            return 0 <= hour < 24 and 0 <= minute < 60 and 0 <= second < 60
        except ValueError:
            return False
    
    def _validate_datetime(self, value: str, operation_id: str) -> bool:
        """
        Validate a datetime string.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        return bool(self._patterns['datetime'].match(value))
    
    def _validate_ip_address(self, value: str, operation_id: str) -> bool:
        """
        Validate an IP address.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        if not self._patterns['ip_address'].match(value):
            return False
        
        # Additional validation for valid IP ranges
        try:
            parts = value.split('.')
            return all(0 <= int(part) <= 255 for part in parts)
        except ValueError:
            return False
    
    def _validate_uuid(self, value: str, operation_id: str) -> bool:
        """
        Validate a UUID.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        return bool(self._patterns['uuid'].match(value))
    
    def _validate_number(self, value: str, operation_id: str) -> bool:
        """
        Validate a number string.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        try:
            float(value)
            return True
        except ValueError:
            return False
    
    def _validate_integer(self, value: str, operation_id: str) -> bool:
        """
        Validate an integer string.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        try:
            int(value)
            return True
        except ValueError:
            return False
    
    def _validate_boolean(self, value: str, operation_id: str) -> bool:
        """
        Validate a boolean string.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        return value.lower() in ('true', 'false', '1', '0', 'yes', 'no', 'y', 'n')
    
    def _validate_alpha(self, value: str, operation_id: str) -> bool:
        """
        Validate an alphabetic string.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        return bool(self._patterns['alpha'].match(value))
    
    def _validate_alphanumeric(self, value: str, operation_id: str) -> bool:
        """
        Validate an alphanumeric string.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        return bool(self._patterns['alphanumeric'].match(value))
    
    def _validate_password(self, value: str, operation_id: str) -> bool:
        """
        Validate a password string.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        # Password requirements:
        # - At least 8 characters
        # - Contains at least one uppercase letter
        # - Contains at least one lowercase letter
        # - Contains at least one digit
        # - Contains at least one special character
        if len(value) < 8:
            return False
            
        has_upper = any(c.isupper() for c in value)
        has_lower = any(c.islower() for c in value)
        has_digit = any(c.isdigit() for c in value)
        has_special = any(not c.isalnum() for c in value)
        
        return has_upper and has_lower and has_digit and has_special
    
    def _validate_username(self, value: str, operation_id: str) -> bool:
        """
        Validate a username string.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        # Username requirements:
        # - 3-20 characters
        # - Alphanumeric characters, dots, underscores, or hyphens
        # - Cannot start or end with a dot, underscore, or hyphen
        if len(value) < 3 or len(value) > 20:
            return False
            
        if value[0] in '._-' or value[-1] in '._-':
            return False
            
        return all(c.isalnum() or c in '._-' for c in value)
    
    def _validate_tenant_id(self, value: str, operation_id: str) -> bool:
        """
        Validate a tenant ID string.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        # Tenant ID requirements:
        # - UUID format or tenant-{uuid} format
        if self._patterns['uuid'].match(value):
            return True
            
        if value.startswith('tenant-'):
            tenant_id = value[7:]  # Remove 'tenant-' prefix
            return self._patterns['uuid'].match(tenant_id)
            
        return False
    
    def _validate_user_id(self, value: str, operation_id: str) -> bool:
        """
        Validate a user ID string.
        
        Args:
            value (str): The string to validate
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        # User ID requirements:
        # - UUID format or user-{uuid} format
        if self._patterns['uuid'].match(value):
            return True
            
        if value.startswith('user-'):
            user_id = value[5:]  # Remove 'user-' prefix
            return self._patterns['uuid'].match(user_id)
            
        return False


class FileValidator:
    """
    File validation utility.
    
    This class provides methods for validating files, including content type
    validation, file size validation, and security checks.
    """
    
    def __init__(self):
        """Initialize the file validator."""
        # Thread safety for stateful operations
        self._lock = Lock()
        
        # Map of allowed file extensions to MIME types
        self._allowed_mime_types = {
            # Images
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            
            # Documents
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            
            # Text
            'txt': 'text/plain',
            'csv': 'text/csv',
            'json': 'application/json',
            'xml': 'application/xml',
            'html': 'text/html',
            'htm': 'text/html',
            
            # Archives
            'zip': 'application/zip',
            'tar': 'application/x-tar',
            'gz': 'application/gzip',
            '7z': 'application/x-7z-compressed',
            
            # Audio
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            
            # Video
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'avi': 'video/x-msvideo',
        }
        
        # Map of file signatures (magic numbers)
        self._file_signatures = {
            # Images
            b'\xff\xd8\xff': 'jpg',                # JPEG
            b'\x89PNG\r\n\x1a\n': 'png',          # PNG
            b'GIF87a': 'gif',                      # GIF87a
            b'GIF89a': 'gif',                      # GIF89a
            
            # Documents
            b'%PDF': 'pdf',                        # PDF
            b'\xd0\xcf\x11\xe0': 'doc',            # MS Office
            b'PK\x03\x04': 'docx',                 # Office Open XML
            
            # Archives
            b'PK\x03\x04': 'zip',                  # ZIP
            b'\x1f\x8b\x08': 'gz',                 # GZIP
            b'7z\xbc\xaf\x27\x1c': '7z',           # 7-Zip
            
            # Audio
            b'ID3': 'mp3',                         # MP3
            b'RIFF': 'wav',                        # WAV
            b'OggS': 'ogg',                        # OGG
            
            # Video
            b'\x00\x00\x00\x18ftypmp42': 'mp4',    # MP4
        }
        
        # Default file size limits in bytes
        self._default_file_size_limits = {
            'image': 5 * 1024 * 1024,          # 5 MB
            'document': 10 * 1024 * 1024,      # 10 MB
            'text': 2 * 1024 * 1024,           # 2 MB
            'archive': 50 * 1024 * 1024,       # 50 MB
            'audio': 20 * 1024 * 1024,         # 20 MB
            'video': 100 * 1024 * 1024,        # 100 MB
            'default': 10 * 1024 * 1024,       # 10 MB
        }
    
    async def validate_file(
        self,
        file: UploadFile,
        allowed_extensions: Optional[List[str]] = None,
        max_size: Optional[int] = None,
        content_validation: bool = True,
        operation_id: Optional[str] = None
    ) -> bool:
        """
        Validate an uploaded file.
        
        Args:
            file (UploadFile): The file to validate
            allowed_extensions (Optional[List[str]], optional): List of allowed extensions.
                Defaults to None (all supported extensions).
            max_size (Optional[int], optional): Maximum file size in bytes.
                Defaults to None (type-specific default).
            content_validation (bool, optional): Whether to validate file content.
                Defaults to True.
            operation_id (Optional[str], optional): Correlation ID for logging.
                Defaults to None.
                
        Returns:
            bool: True if valid, False otherwise
            
        Example:
            ```python
            from fastapi import UploadFile, File, HTTPException
            from backend.utils.security.input_sanitization import FileValidator
            
            file_validator = FileValidator()
            
            @app.post("/upload")
            async def upload_file(file: UploadFile = File(...)):
                # Validate file
                is_valid = await file_validator.validate_file(
                    file,
                    allowed_extensions=["jpg", "png", "pdf"],
                    max_size=5 * 1024 * 1024  # 5 MB
                )
                
                if not is_valid:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid file. Only JPG, PNG, and PDF files under 5 MB are allowed."
                    )
                
                # Process file...
                return {"filename": file.filename}
            ```
        """
        op_id = operation_id or f"validate_file_{int(time.time() * 1000)}"
        start_time = time.time()
        
        if not file:
            logger.error(f"[{op_id}] No file provided")
            return False
        
        try:
            # Check filename and extension
            if not file.filename:
                logger.error(f"[{op_id}] File has no filename")
                return False
            
            # Get file extension
            filename = file.filename
            extension = filename.split('.')[-1].lower() if '.' in filename else None
            
            # Check if extension is allowed
            if allowed_extensions and (not extension or extension not in allowed_extensions):
                logger.warning(f"[{op_id}] File extension '{extension}' not allowed: {filename}")
                return False
            
            # Determine max size based on file type if not provided
            if max_size is None:
                if extension:
                    if extension in ['jpg', 'jpeg', 'png', 'gif', 'svg']:
                        max_size = self._default_file_size_limits['image']
                    elif extension in ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']:
                        max_size = self._default_file_size_limits['document']
                    elif extension in ['txt', 'csv', 'json', 'xml', 'html', 'htm']:
                        max_size = self._default_file_size_limits['text']
                    elif extension in ['zip', 'tar', 'gz', '7z']:
                        max_size = self._default_file_size_limits['archive']
                    elif extension in ['mp3', 'wav', 'ogg']:
                        max_size = self._default_file_size_limits['audio']
                    elif extension in ['mp4', 'webm', 'avi']:
                        max_size = self._default_file_size_limits['video']
                    else:
                        max_size = self._default_file_size_limits['default']
                else:
                    max_size = self._default_file_size_limits['default']
            
            # Check content type
            content_type = file.content_type
            if extension and extension in self._allowed_mime_types:
                expected_content_type = self._allowed_mime_types[extension]
                if content_type != expected_content_type:
                    logger.warning(
                        f"[{op_id}] Content type '{content_type}' doesn't match "
                        f"expected type '{expected_content_type}' for extension '{extension}'"
                    )
                    # Don't fail here, we'll check the file signature
            
            # Read file content for size and signature validation
            file_contents = await file.read(max_size + 1)  # Read one extra byte to check if file exceeds max size
            
            # Check file size
            if len(file_contents) > max_size:
                logger.warning(
                    f"[{op_id}] File size ({len(file_contents)} bytes) "
                    f"exceeds maximum size ({max_size} bytes): {filename}"
                )
                return False
            
            # Reset file position for future reads
            await file.seek(0)
            
            # Validate file content if requested
            if content_validation and extension:
                # Check file signature (magic numbers)
                is_valid_content = await self._validate_file_content(
                    file_contents, extension, op_id
                )
                if not is_valid_content:
                    logger.warning(f"[{op_id}] File content validation failed: {filename}")
                    return False
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow file validation: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] File validation completed in {elapsed_ms}ms")
            
            return True
            
        except Exception as e:
            logger.error(f"[{op_id}] Error validating file: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            return False
    
    async def _validate_file_content(
        self,
        file_contents: bytes,
        extension: str,
        operation_id: str
    ) -> bool:
        """
        Validate file content matches the expected file type.
        
        Args:
            file_contents (bytes): The file contents
            extension (str): The file extension
            operation_id (str): Correlation ID for logging
            
        Returns:
            bool: True if valid, False otherwise
        """
        # Check file signature if available
        for signature, sig_ext in self._file_signatures.items():
            if file_contents.startswith(signature) and sig_ext == extension:
                return True
        
        # If no signature match, perform format-specific validation
        if extension in ['jpg', 'jpeg', 'png', 'gif']:
            # Try to validate image format
            try:
                # We'd normally use PIL here, but for this example we'll just do basic checks
                if extension == 'jpg' or extension == 'jpeg':
                    return file_contents.startswith(b'\xff\xd8\xff')
                elif extension == 'png':
                    return file_contents.startswith(b'\x89PNG\r\n\x1a\n')
                elif extension == 'gif':
                    return file_contents.startswith(b'GIF87a') or file_contents.startswith(b'GIF89a')
                
                return False
            except Exception:
                return False
        elif extension == 'pdf':
            # Check PDF format
            return file_contents.startswith(b'%PDF')
        elif extension in ['json', 'txt', 'csv', 'xml', 'html', 'htm']:
            # For text files, check if content is valid UTF-8
            try:
                file_contents.decode('utf-8')
                
                # For JSON, try to parse
                if extension == 'json':
                    try:
                        json.loads(file_contents.decode('utf-8'))
                    except json.JSONDecodeError:
                        return False
                
                # For XML, check opening tag
                if extension == 'xml':
                    return b'<?xml' in file_contents[:100] or b'<' in file_contents[:100]
                
                # For HTML, check doctype or html tag
                if extension in ['html', 'htm']:
                    content_lower = file_contents.lower()
                    return (
                        b'<!doctype html>' in content_lower or
                        b'<html' in content_lower
                    )
                
                return True
            except UnicodeDecodeError:
                return False
        elif extension in ['zip', 'tar', 'gz', '7z']:
            # For archives, check signatures
            if extension == 'zip':
                return file_contents.startswith(b'PK\x03\x04')
            elif extension == 'gz':
                return file_contents.startswith(b'\x1f\x8b\x08')
            elif extension == '7z':
                return file_contents.startswith(b'7z\xbc\xaf\x27\x1c')
            
            return False
        
        # For other types, assume valid if we've gotten this far
        return True


class RequestSanitizer:
    """
    Request sanitization utility.
    
    This class provides methods for sanitizing and validating request data,
    including query parameters, path parameters, headers, and JSON bodies.
    """
    
    def __init__(self):
        """Initialize the request sanitizer."""
        # Thread safety for stateful operations
        self._lock = Lock()
        
        # Create sanitizer and validator instances
        self.string_sanitizer = StringSanitizer()
        self.file_validator = FileValidator()
    
    async def sanitize_request(
        self,
        request: Request,
        sanitize_headers: bool = True,
        sanitize_query_params: bool = True,
        sanitize_path_params: bool = True,
        sanitize_json_body: bool = True,
        operation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sanitize and validate a request, returning sanitized data.
        
        Args:
            request (Request): The request to sanitize
            sanitize_headers (bool, optional): Whether to sanitize headers.
                Defaults to True.
            sanitize_query_params (bool, optional): Whether to sanitize query parameters.
                Defaults to True.
            sanitize_path_params (bool, optional): Whether to sanitize path parameters.
                Defaults to True.
            sanitize_json_body (bool, optional): Whether to sanitize JSON body.
                Defaults to True.
            operation_id (Optional[str], optional): Correlation ID for logging.
                Defaults to None.
                
        Returns:
            Dict[str, Any]: Dictionary with sanitized request data
            
        Example:
            ```python
            from fastapi import Request
            from backend.utils.security.input_sanitization import RequestSanitizer
            
            request_sanitizer = RequestSanitizer()
            
            @app.post("/api/users")
            async def create_user(request: Request):
                # Sanitize request data
                sanitized_data = await request_sanitizer.sanitize_request(request)
                
                # Use sanitized data
                user_data = sanitized_data.get("body", {})
                return {"success": True, "user_id": "123"}
            ```
        """
        op_id = operation_id or f"sanitize_request_{int(time.time() * 1000)}"
        start_time = time.time()
        
        # Initialize result dictionary
        result = {
            "headers": {},
            "query_params": {},
            "path_params": {},
            "body": {}
        }
        
        try:
            # Sanitize headers if requested
            if sanitize_headers:
                sanitized_headers = {}
                for name, value in request.headers.items():
                    # Skip certain headers that shouldn't be modified
                    if name.lower() in ["content-type", "content-length", "authorization"]:
                        sanitized_headers[name] = value
                    else:
                        sanitized_headers[name] = self.string_sanitizer.sanitize(
                            value, SanitizationContext.PLAIN_TEXT, op_id
                        )
                result["headers"] = sanitized_headers
            
            # Sanitize query parameters if requested
            if sanitize_query_params:
                sanitized_query_params = {}
                for name, value in request.query_params.items():
                    sanitized_query_params[name] = self.string_sanitizer.sanitize(
                        value, SanitizationContext.PLAIN_TEXT, op_id
                    )
                result["query_params"] = sanitized_query_params
            
            # Sanitize path parameters if requested
            if sanitize_path_params:
                sanitized_path_params = {}
                for name, value in request.path_params.items():
                    sanitized_path_params[name] = self.string_sanitizer.sanitize(
                        value, SanitizationContext.PLAIN_TEXT, op_id
                    )
                result["path_params"] = sanitized_path_params
            
            # Sanitize JSON body if requested
            if sanitize_json_body:
                if request.headers.get("content-type", "").lower().startswith("application/json"):
                    try:
                        body = await request.json()
                        sanitized_body = self._sanitize_json_object(body, op_id)
                        result["body"] = sanitized_body
                    except json.JSONDecodeError:
                        logger.warning(f"[{op_id}] Invalid JSON body in request")
                        result["body"] = {}
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow request sanitization: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Request sanitization completed in {elapsed_ms}ms")
            
            return result
            
        except Exception as e:
            logger.error(f"[{op_id}] Error sanitizing request: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return empty result on error to be safe
            return result
    
    def _sanitize_json_object(
        self,
        obj: Any,
        operation_id: str
    ) -> Any:
        """
        Recursively sanitize a JSON object.
        
        Args:
            obj (Any): The object to sanitize
            operation_id (str): Correlation ID for logging
            
        Returns:
            Any: The sanitized object
        """
        if isinstance(obj, dict):
            sanitized_dict = {}
            for key, value in obj.items():
                # Sanitize the key
                sanitized_key = self.string_sanitizer.sanitize(
                    key, SanitizationContext.PLAIN_TEXT, operation_id
                )
                # Recursively sanitize the value
                sanitized_dict[sanitized_key] = self._sanitize_json_object(value, operation_id)
            return sanitized_dict
        elif isinstance(obj, list):
            return [self._sanitize_json_object(item, operation_id) for item in obj]
        elif isinstance(obj, str):
            return self.string_sanitizer.sanitize(
                obj, SanitizationContext.PLAIN_TEXT, operation_id
            )
        else:
            # For other types (numbers, booleans, null), return as is
            return obj


class ModelValidator:
    """
    Pydantic model validation utility.
    
    This class provides standardized validation functions for Pydantic models,
    including custom validation, error handling, and security checks.
    """
    
    def __init__(self):
        """Initialize the model validator."""
        # Thread safety for stateful operations
        self._lock = Lock()
    
    def validate_model(
        self,
        model_class: Type[BaseModel],
        data: Dict[str, Any],
        operation_id: Optional[str] = None
    ) -> Tuple[Optional[BaseModel], Optional[Dict[str, Any]]]:
        """
        Validate data against a Pydantic model.
        
        Args:
            model_class (Type[BaseModel]): The Pydantic model class
            data (Dict[str, Any]): The data to validate
            operation_id (Optional[str], optional): Correlation ID for logging.
                Defaults to None.
                
        Returns:
            Tuple[Optional[BaseModel], Optional[Dict[str, Any]]]: Tuple of
                (validated model, errors)
            
        Example:
            ```python
            from pydantic import BaseModel
            from backend.utils.security.input_sanitization import ModelValidator
            
            class UserCreate(BaseModel):
                username: str
                email: str
                password: str
                
            model_validator = ModelValidator()
            
            @app.post("/api/users")
            async def create_user(request: Request):
                # Get JSON data
                data = await request.json()
                
                # Validate against model
                user_model, errors = model_validator.validate_model(UserCreate, data)
                
                if errors:
                    return JSONResponse(
                        status_code=400,
                        content={"errors": errors}
                    )
                
                # Use validated model
                return {"success": True, "user": user_model.model_dump()}
            ```
        """
        op_id = operation_id or f"validate_model_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Validate data against model
            model_instance = model_class(**data)
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{op_id}] Slow model validation: {elapsed_ms}ms")
            else:
                logger.debug(f"[{op_id}] Model validation completed in {elapsed_ms}ms")
            
            return model_instance, None
            
        except ValidationError as e:
            # Format validation errors
            errors = {}
            for error in e.errors():
                # Get the field path (could be nested)
                field = ".".join(str(loc) for loc in error["loc"])
                message = error["msg"]
                errors[field] = message
            
            logger.warning(f"[{op_id}] Model validation errors: {errors}")
            return None, errors
            
        except Exception as e:
            logger.error(f"[{op_id}] Error validating model: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return generic error on exception
            return None, {"_error": str(e)}
    
    def validate_model_field(
        self,
        model_class: Type[BaseModel],
        field_name: str,
        value: Any,
        operation_id: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate a single field of a Pydantic model.
        
        Args:
            model_class (Type[BaseModel]): The Pydantic model class
            field_name (str): The field name to validate
            value (Any): The value to validate
            operation_id (Optional[str], optional): Correlation ID for logging.
                Defaults to None.
                
        Returns:
            Tuple[bool, Optional[str]]: Tuple of (is_valid, error_message)
            
        Example:
            ```python
            from backend.utils.security.input_sanitization import ModelValidator
            
            model_validator = ModelValidator()
            
            @app.patch("/api/users/{user_id}")
            async def update_user_email(user_id: str, email: str):
                # Validate email field
                is_valid, error = model_validator.validate_model_field(
                    UserUpdate, "email", email
                )
                
                if not is_valid:
                    return JSONResponse(
                        status_code=400,
                        content={"error": error}
                    )
                
                # Update user email
                return {"success": True}
            ```
        """
        op_id = operation_id or f"validate_field_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            # Check if field exists in model
            if field_name not in model_class.model_fields:
                logger.warning(f"[{op_id}] Field '{field_name}' not found in model {model_class.__name__}")
                return False, f"Field '{field_name}' does not exist in {model_class.__name__}"
            
            # Create a data dict with just the field to validate
            data = {field_name: value}
            
            # Try to validate just this field
            try:
                # Use model_validate to validate a subset of fields
                model_instance = model_class.model_validate(data, partial=True)
                
                # Log performance metrics
                elapsed_ms = int((time.time() - start_time) * 1000)
                if elapsed_ms > SLOW_OPERATION_THRESHOLD_MS:
                    logger.warning(f"[{op_id}] Slow field validation: {elapsed_ms}ms")
                else:
                    logger.debug(f"[{op_id}] Field validation completed in {elapsed_ms}ms")
                
                return True, None
                
            except ValidationError as e:
                # Extract error message for this field
                for error in e.errors():
                    if error["loc"][0] == field_name:
                        logger.warning(f"[{op_id}] Field validation error: {error['msg']}")
                        return False, error["msg"]
                
                # Generic error if specific error not found
                return False, "Validation error"
                
        except Exception as e:
            logger.error(f"[{op_id}] Error validating field: {str(e)}")
            logger.debug(f"[{op_id}] Traceback: {traceback.format_exc()}")
            # Return generic error on exception
            return False, f"Validation error: {str(e)}"


# Create global instances for app-wide use
string_sanitizer = StringSanitizer()
file_validator = FileValidator()
request_sanitizer = RequestSanitizer()
model_validator = ModelValidator()


# FastAPI dependency for request sanitization
async def sanitize_request(
    request: Request,
    sanitize_headers: bool = True,
    sanitize_query_params: bool = True,
    sanitize_path_params: bool = True,
    sanitize_json_body: bool = True,
    operation_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    FastAPI dependency for request sanitization.
    
    Args:
        request (Request): The request to sanitize
        sanitize_headers (bool, optional): Whether to sanitize headers.
            Defaults to True.
        sanitize_query_params (bool, optional): Whether to sanitize query parameters.
            Defaults to True.
        sanitize_path_params (bool, optional): Whether to sanitize path parameters.
            Defaults to True.
        sanitize_json_body (bool, optional): Whether to sanitize JSON body.
            Defaults to True.
        operation_id (Optional[str], optional): Correlation ID for logging.
            Defaults to None.
            
    Returns:
        Dict[str, Any]: Dictionary with sanitized request data
        
    Example:
        ```python
        from fastapi import APIRouter, Depends, Request
        from backend.utils.security.input_sanitization import sanitize_request
        
        router = APIRouter()
        
        @router.post("/users")
        async def create_user(
            sanitized_data: Dict[str, Any] = Depends(sanitize_request)
        ):
            # Use sanitized data
            user_data = sanitized_data.get("body", {})
            return {"success": True, "user_id": "123"}
        ```
    """
    op_id = operation_id or f"sanitize_dep_{int(time.time() * 1000)}"
    
    return await request_sanitizer.sanitize_request(
        request=request,
        sanitize_headers=sanitize_headers,
        sanitize_query_params=sanitize_query_params,
        sanitize_path_params=sanitize_path_params,
        sanitize_json_body=sanitize_json_body,
        operation_id=op_id
    )


# Helpers for common operations
def sanitize_string(
    value: str,
    context: SanitizationContext = SanitizationContext.PLAIN_TEXT,
    operation_id: Optional[str] = None
) -> str:
    """
    Sanitize a string value.
    
    This is a helper function that delegates to the global string sanitizer.
    
    Args:
        value (str): The string value to sanitize
        context (SanitizationContext, optional): The context for sanitization.
            Defaults to SanitizationContext.PLAIN_TEXT.
        operation_id (Optional[str], optional): Correlation ID for logging.
            Defaults to None.
            
    Returns:
        str: The sanitized string
        
    Example:
        ```python
        from backend.utils.security.input_sanitization import sanitize_string, SanitizationContext
        
        # Sanitize user input for HTML output
        user_comment = request.form.get("comment", "")
        safe_comment = sanitize_string(user_comment, SanitizationContext.HTML)
        ```
    """
    return string_sanitizer.sanitize(
        value=value,
        context=context,
        operation_id=operation_id
    )


def validate_string(
    value: str,
    validation_type: ValidationType,
    operation_id: Optional[str] = None
) -> bool:
    """
    Validate a string value.
    
    This is a helper function that delegates to the global string sanitizer.
    
    Args:
        value (str): The string value to validate
        validation_type (ValidationType): The type of validation to perform
        operation_id (Optional[str], optional): Correlation ID for logging.
            Defaults to None.
            
    Returns:
        bool: True if valid, False otherwise
        
    Example:
        ```python
        from backend.utils.security.input_sanitization import validate_string, ValidationType
        
        # Validate an email address
        email = request.form.get("email", "")
        if not validate_string(email, ValidationType.EMAIL):
            return {"error": "Invalid email address"}
        ```
    """
    return string_sanitizer.validate(
        value=value,
        validation_type=validation_type,
        operation_id=operation_id
    )