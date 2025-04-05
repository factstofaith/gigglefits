"""
Timezone utilities for production use.

This module provides comprehensive utilities for handling timezones throughout
the application. It ensures consistent timezone awareness in all datetime operations
to prevent timezone-related issues in production.

The TimezoneUtilities class provides methods for:
1. Creating timezone-aware datetimes
2. Converting between timezones
3. Ensuring timezone awareness
4. Parsing datetime strings with timezone information
5. Comparing datetimes safely

Features:
- Consistent timezone handling across the application
- Prevention of naive datetime usage
- Safe conversion between different timezones
- Proper datetime string parsing and formatting
- Timezone-aware comparisons
- Comprehensive error handling
- Performance monitoring for timezone operations

Usage Examples:
    from backend.utils.timezone_utilities import TimezoneUtilities

    # Create a timezone-aware datetime
    dt = TimezoneUtilities.create_datetime(2023, 1, 1, 12, 0, 0, "America/New_York")
    
    # Get current UTC time
    now_utc = TimezoneUtilities.utc_now()
    
    # Convert between timezones
    tokyo_time = TimezoneUtilities.convert_timezone(now_utc, "UTC", "Asia/Tokyo")
    
    # Parse a datetime string
    dt = TimezoneUtilities.parse_datetime("2023-01-01T12:00:00-05:00")
    
    # Check if a datetime is in the future
    is_future = TimezoneUtilities.is_in_future(dt)
    
    # Format a datetime with timezone information
    formatted = TimezoneUtilities.format_datetime(dt, "%Y-%m-%d %H:%M:%S %Z")
"""

import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Tuple, Any, List, Dict, Literal, TypeVar, cast, overload
import pytz
from dateutil import parser as dateutil_parser

# Set up logging
logger = logging.getLogger(__name__)

# Type variables and constants
T = TypeVar('T')
TimeUnit = Literal['seconds', 'minutes', 'hours', 'days']
DEFAULT_TIMEOUT = 10.0  # seconds


class TimezoneError(Exception):
    """
    Base exception for timezone-related errors.
    
    Attributes:
        message (str): Error message
        original_error (Optional[Exception]): Original exception that caused this error
        tz_name (Optional[str]): Timezone name related to the error
    """
    def __init__(self, message: str, original_error: Optional[Exception] = None, tz_name: Optional[str] = None):
        self.message = message
        self.original_error = original_error
        self.tz_name = tz_name
        super().__init__(message)


class TimezoneParsingError(TimezoneError):
    """
    Exception raised when datetime string parsing fails.
    
    Attributes:
        message (str): Error message
        original_error (Optional[Exception]): Original exception that caused this error
        dt_string (Optional[str]): Datetime string that failed to parse
    """
    def __init__(self, message: str, original_error: Optional[Exception] = None, dt_string: Optional[str] = None):
        self.dt_string = dt_string
        super().__init__(message, original_error)


class TimezoneConversionError(TimezoneError):
    """
    Exception raised when timezone conversion fails.
    
    Attributes:
        message (str): Error message
        original_error (Optional[Exception]): Original exception that caused this error
        from_tz (Optional[str]): Source timezone name
        to_tz (Optional[str]): Target timezone name
    """
    def __init__(self, message: str, original_error: Optional[Exception] = None, 
                 from_tz: Optional[str] = None, to_tz: Optional[str] = None):
        self.from_tz = from_tz
        self.to_tz = to_tz
        super().__init__(message, original_error)


class TimezoneValidationError(TimezoneError):
    """
    Exception raised when timezone validation fails.
    
    Attributes:
        message (str): Error message
        original_error (Optional[Exception]): Original exception that caused this error
        tz_name (Optional[str]): Invalid timezone name
    """
    def __init__(self, message: str, original_error: Optional[Exception] = None, tz_name: Optional[str] = None):
        super().__init__(message, original_error, tz_name)


class TimezoneUtilities:
    """
    Utilities for timezone operations in production code.
    
    This class provides comprehensive utilities for handling timezones consistently
    throughout the application, ensuring all datetime operations are timezone-aware
    and correctly handled to prevent timezone-related issues in production.
    
    All methods are implemented as static methods for easy access without instantiation.
    Each method includes robust error handling and detailed logging for diagnostics.
    
    Performance metrics are collected for key operations to help identify potential
    bottlenecks in timezone processing.
    """
    
    # Class constants
    DEFAULT_TIMEZONE = "UTC"
    ISO_FORMAT = "%Y-%m-%dT%H:%M:%S%z"
    HUMAN_READABLE_FORMAT = "%Y-%m-%d %H:%M:%S %Z"
    
    # Performance thresholds for logging warnings (milliseconds)
    SLOW_OPERATION_THRESHOLD_MS = 50
    
    @staticmethod
    def create_datetime(
        year: int, 
        month: int, 
        day: int, 
        hour: int = 0, 
        minute: int = 0, 
        second: int = 0, 
        microsecond: int = 0,
        tz_name: str = DEFAULT_TIMEZONE
    ) -> datetime:
        """
        Create timezone-aware datetime in the specified timezone.
        
        Args:
            year (int): Year (e.g., 2023)
            month (int): Month (1-12)
            day (int): Day (1-31, depending on month)
            hour (int, optional): Hour (0-23). Defaults to 0.
            minute (int, optional): Minute (0-59). Defaults to 0.
            second (int, optional): Second (0-59). Defaults to 0.
            microsecond (int, optional): Microsecond (0-999999). Defaults to 0.
            tz_name (str, optional): Timezone name (e.g., "UTC", "America/New_York", "Asia/Tokyo"). 
                                   Defaults to "UTC".
            
        Returns:
            datetime: Timezone-aware datetime object
            
        Raises:
            TimezoneValidationError: If the timezone name is invalid
            TimezoneError: If datetime creation fails for any other reason
            
        Examples:
            >>> dt = TimezoneUtilities.create_datetime(2023, 1, 1, 12, 30, 0, tz_name="UTC")
            >>> dt.isoformat()
            '2023-01-01T12:30:00+00:00'
            
            >>> dt = TimezoneUtilities.create_datetime(2023, 1, 1, 12, 30, 0, tz_name="America/New_York")
            >>> dt.isoformat()
            '2023-01-01T12:30:00-05:00'
        """
        operation_id = f"create_datetime_{int(time.time() * 1000)}"
        start_time = time.time()
        
        # Input validation
        if not isinstance(year, int) or year < 1:
            raise ValueError(f"Invalid year: {year}")
        if not isinstance(month, int) or month < 1 or month > 12:
            raise ValueError(f"Invalid month: {month}")
        if not isinstance(day, int) or day < 1 or day > 31:
            raise ValueError(f"Invalid day: {day}")
        if not isinstance(hour, int) or hour < 0 or hour > 23:
            raise ValueError(f"Invalid hour: {hour}")
        if not isinstance(minute, int) or minute < 0 or minute > 59:
            raise ValueError(f"Invalid minute: {minute}")
        if not isinstance(second, int) or second < 0 or second > 59:
            raise ValueError(f"Invalid second: {second}")
        if not isinstance(microsecond, int) or microsecond < 0 or microsecond > 999999:
            raise ValueError(f"Invalid microsecond: {microsecond}")
        if not isinstance(tz_name, str) or not tz_name:
            raise ValueError(f"Invalid timezone name: {tz_name}")
            
        logger.debug(f"[{operation_id}] Creating datetime for {year}-{month:02d}-{day:02d} {hour:02d}:{minute:02d}:{second:02d} in timezone {tz_name}")
        
        try:
            # Validate timezone
            try:
                tz = pytz.timezone(tz_name)
            except pytz.exceptions.UnknownTimeZoneError as e:
                error_msg = f"Unknown timezone: {tz_name}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise TimezoneValidationError(error_msg, e, tz_name) from e
            
            # Create naive datetime
            try:
                naive_dt = datetime(year, month, day, hour, minute, second, microsecond)
            except ValueError as e:
                error_msg = f"Invalid datetime values: {e}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise TimezoneError(error_msg, e) from e
            
            # Localize to timezone
            aware_dt = tz.localize(naive_dt)
            
            # Log performance metrics
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > TimezoneUtilities.SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow datetime creation: {elapsed_ms}ms")
            else:
                logger.debug(f"[{operation_id}] Created datetime in {elapsed_ms}ms")
                
            return aware_dt
            
        except (TimezoneValidationError, TimezoneError):
            # Re-raise specialized exceptions
            raise
        except Exception as e:
            error_msg = f"Error creating datetime: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneError(error_msg, e) from e
    
    @staticmethod
    def create_datetime_with_offset(
        offset_hours: float = 0, 
        offset_minutes: float = 0, 
        from_dt: Optional[datetime] = None, 
        tz_name: str = DEFAULT_TIMEZONE
    ) -> datetime:
        """
        Create timezone-aware datetime with an offset from now or a specified datetime.
        
        Args:
            offset_hours: Hours offset (positive = future, negative = past)
            offset_minutes: Minutes offset (positive = future, negative = past)
            from_dt: Datetime to offset from (None = now)
            tz_name: Timezone name
            
        Returns:
            Timezone-aware datetime
            
        Raises:
            TimezoneError: If the timezone name is invalid or offset cannot be applied
        """
        try:
            tz = pytz.timezone(tz_name)
            
            if from_dt is None:
                # Use current time in the specified timezone
                base_dt = datetime.now(tz)
            else:
                # Convert the provided datetime to the specified timezone
                if from_dt.tzinfo is None:
                    # Naive datetime, assume UTC
                    from_dt = from_dt.replace(tzinfo=timezone.utc)
                base_dt = from_dt.astimezone(tz)
            
            # Apply offset
            offset = timedelta(hours=offset_hours, minutes=offset_minutes)
            return base_dt + offset
            
        except pytz.exceptions.UnknownTimeZoneError as e:
            logger.error(f"Unknown timezone: {tz_name}")
            raise TimezoneError(f"Unknown timezone: {tz_name}") from e
        except ValueError as e:
            logger.error(f"Invalid offset values: {e}")
            raise TimezoneError(f"Invalid offset values: {e}") from e
        except Exception as e:
            logger.error(f"Error creating datetime with offset: {e}")
            raise TimezoneError(f"Error creating datetime with offset: {e}") from e
    
    @staticmethod
    def create_future_datetime(
        hours: float = 1, 
        minutes: float = 0, 
        days: float = 0,
        tz_name: str = DEFAULT_TIMEZONE
    ) -> datetime:
        """
        Create a timezone-aware datetime in the future.
        
        Args:
            hours: Hours in the future
            minutes: Minutes in the future
            days: Days in the future
            tz_name: Timezone name
            
        Returns:
            Future timezone-aware datetime
            
        Raises:
            TimezoneError: If the timezone name is invalid or offset cannot be applied
        """
        try:
            total_hours = hours + (days * 24)
            return TimezoneUtilities.create_datetime_with_offset(
                offset_hours=total_hours, 
                offset_minutes=minutes,
                tz_name=tz_name
            )
        except TimezoneError:
            # Re-raise the original error
            raise
        except Exception as e:
            logger.error(f"Error creating future datetime: {e}")
            raise TimezoneError(f"Error creating future datetime: {e}") from e
    
    @staticmethod
    def create_past_datetime(
        hours: float = 1, 
        minutes: float = 0, 
        days: float = 0,
        tz_name: str = DEFAULT_TIMEZONE
    ) -> datetime:
        """
        Create a timezone-aware datetime in the past.
        
        Args:
            hours: Hours in the past
            minutes: Minutes in the past
            days: Days in the past
            tz_name: Timezone name
            
        Returns:
            Past timezone-aware datetime
            
        Raises:
            TimezoneError: If the timezone name is invalid or offset cannot be applied
        """
        try:
            total_hours = hours + (days * 24)
            return TimezoneUtilities.create_datetime_with_offset(
                offset_hours=-total_hours,
                offset_minutes=-minutes,
                tz_name=tz_name
            )
        except TimezoneError:
            # Re-raise the original error
            raise
        except Exception as e:
            logger.error(f"Error creating past datetime: {e}")
            raise TimezoneError(f"Error creating past datetime: {e}") from e
    
    @staticmethod
    def utc_now() -> datetime:
        """
        Get current UTC time as timezone-aware datetime.
        
        This method ensures that the current time is always returned with 
        timezone information set to UTC, which helps prevent timezone-related bugs.
        It uses the built-in timezone.utc from the datetime module for maximum
        reliability.
        
        Returns:
            datetime: Current UTC time as a timezone-aware datetime object
            
        Examples:
            >>> now = TimezoneUtilities.utc_now()
            >>> now.tzinfo
            datetime.timezone.utc
        """
        operation_id = f"utc_now_{int(time.time() * 1000)}"
        start_time = time.time()
        
        now = datetime.now(timezone.utc)
        
        # Log performance for monitoring
        elapsed_ms = int((time.time() - start_time) * 1000)
        logger.debug(f"[{operation_id}] Got UTC now in {elapsed_ms}ms: {now.isoformat()}")
        
        return now
    
    @staticmethod
    def ensure_timezone_aware(
        dt: Optional[datetime], 
        default_tz_name: str = DEFAULT_TIMEZONE
    ) -> Optional[datetime]:
        """
        Ensure a datetime is timezone-aware, converting to the specified timezone if it's naive.
        
        Args:
            dt: Datetime to check
            default_tz_name: Default timezone to use if dt is naive
            
        Returns:
            Timezone-aware datetime or None if dt is None
            
        Raises:
            TimezoneError: If the timezone name is invalid
        """
        if dt is None:
            return None
        
        try:
            if dt.tzinfo is not None and dt.tzinfo.utcoffset(dt) is not None:
                return dt
                
            # Naive datetime, apply the default timezone
            tz = pytz.timezone(default_tz_name)
            return tz.localize(dt)
            
        except pytz.exceptions.UnknownTimeZoneError as e:
            logger.error(f"Unknown timezone: {default_tz_name}")
            raise TimezoneError(f"Unknown timezone: {default_tz_name}") from e
        except Exception as e:
            logger.error(f"Error ensuring timezone awareness: {e}")
            raise TimezoneError(f"Error ensuring timezone awareness: {e}") from e
    
    @staticmethod
    def normalize_timezone(
        dt: Optional[datetime], 
        target_tz_name: str = DEFAULT_TIMEZONE
    ) -> Optional[datetime]:
        """
        Normalize a datetime to the target timezone, ensuring it's timezone-aware first.
        
        Args:
            dt: Datetime to normalize
            target_tz_name: Target timezone name
            
        Returns:
            Normalized timezone-aware datetime or None if dt is None
            
        Raises:
            TimezoneError: If the timezone name is invalid or conversion fails
        """
        if dt is None:
            return None
            
        try:
            # Ensure dt is timezone-aware
            dt = TimezoneUtilities.ensure_timezone_aware(dt)
                
            # Convert to target timezone
            target_tz = pytz.timezone(target_tz_name)
            return dt.astimezone(target_tz)
            
        except TimezoneError:
            # Re-raise the original error
            raise
        except pytz.exceptions.UnknownTimeZoneError as e:
            logger.error(f"Unknown timezone: {target_tz_name}")
            raise TimezoneError(f"Unknown timezone: {target_tz_name}") from e
        except Exception as e:
            logger.error(f"Error normalizing timezone: {e}")
            raise TimezoneConversionError(f"Error normalizing timezone: {e}") from e
    
    @staticmethod
    def parse_datetime(
        dt_string: Optional[str], 
        default_tz_name: str = DEFAULT_TIMEZONE,
        raise_on_error: bool = True,
        formats: Optional[List[str]] = None
    ) -> Optional[datetime]:
        """
        Parse a datetime string, ensuring the result is timezone-aware.
        
        This method handles a variety of datetime string formats, with fallbacks
        to ensure robust parsing:
        1. First tries datetime.fromisoformat() for ISO format strings
        2. Then tries specific formats if provided
        3. Finally tries dateutil.parser for more flexible parsing
        
        Args:
            dt_string (Optional[str]): Datetime string to parse (e.g. "2023-01-01T12:30:45+00:00")
            default_tz_name (str, optional): Default timezone if not specified in string. 
                                           Defaults to DEFAULT_TIMEZONE.
            raise_on_error (bool, optional): Whether to raise an exception on error. 
                                           Defaults to True.
            formats (Optional[List[str]], optional): List of format strings to try (e.g. "%Y-%m-%d"). 
                                                    Defaults to None.
            
        Returns:
            Optional[datetime]: Timezone-aware datetime or None if dt_string is None/empty 
                              or parsing fails and raise_on_error is False
            
        Raises:
            TimezoneParsingError: If the datetime string cannot be parsed and raise_on_error is True
            TimezoneError: If ensuring timezone awareness fails
            
        Examples:
            >>> dt = TimezoneUtilities.parse_datetime("2023-01-01T12:30:45Z")
            >>> dt.isoformat()
            '2023-01-01T12:30:45+00:00'
            
            >>> dt = TimezoneUtilities.parse_datetime("2023-01-01 12:30:45")
            >>> dt.tzinfo  # Will use default timezone (UTC)
            datetime.timezone.utc
            
            >>> dt = TimezoneUtilities.parse_datetime("Invalid date", raise_on_error=False)
            >>> dt is None
            True
        """
        operation_id = f"parse_datetime_{int(time.time() * 1000)}"
        start_time = time.time()
        
        # Handle empty input
        if dt_string is None or dt_string == "":
            logger.debug(f"[{operation_id}] Empty datetime string provided")
            return None
        
        if not isinstance(dt_string, str):
            error_msg = f"Expected string but got {type(dt_string).__name__}: {dt_string}"
            logger.error(f"[{operation_id}] {error_msg}")
            if raise_on_error:
                raise TypeError(error_msg)
            return None
        
        logger.debug(f"[{operation_id}] Parsing datetime string: {dt_string}")
        
        # Try to parse with various methods
        dt = None
        errors = []
        
        # Method 1: ISO format parsing
        try:
            dt = datetime.fromisoformat(dt_string)
            logger.debug(f"[{operation_id}] Successfully parsed with fromisoformat")
        except (ValueError, TypeError) as e:
            errors.append(f"ISO format parsing failed: {str(e)}")
        
        # Method 2: Try specific formats if provided
        if dt is None and formats:
            for fmt in formats:
                try:
                    dt = datetime.strptime(dt_string, fmt)
                    logger.debug(f"[{operation_id}] Successfully parsed with format: {fmt}")
                    break
                except (ValueError, TypeError) as e:
                    errors.append(f"Format '{fmt}' parsing failed: {str(e)}")
        
        # Method 3: Use dateutil parser as a fallback
        if dt is None:
            try:
                dt = dateutil_parser.parse(dt_string)
                logger.debug(f"[{operation_id}] Successfully parsed with dateutil.parser")
            except (ValueError, TypeError) as e:
                errors.append(f"dateutil parsing failed: {str(e)}")
                
                # All parsing methods failed
                if raise_on_error:
                    error_msg = f"Could not parse datetime string: {dt_string}. Errors: {'; '.join(errors)}"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise TimezoneParsingError(error_msg, e, dt_string) from e
                else:
                    logger.warning(f"[{operation_id}] Failed to parse datetime string: {dt_string}")
                    return None
        
        try:
            # Ensure timezone awareness
            result = TimezoneUtilities.ensure_timezone_aware(dt, default_tz_name)
            
            # Log performance
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > TimezoneUtilities.SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow datetime parsing: {elapsed_ms}ms")
            else:
                logger.debug(f"[{operation_id}] Parsed datetime in {elapsed_ms}ms: {result.isoformat() if result else None}")
                
            return result
            
        except TimezoneError as e:
            if raise_on_error:
                logger.error(f"[{operation_id}] {str(e)}")
                raise
            logger.warning(f"[{operation_id}] Error ensuring timezone awareness: {e}")
            return None
    
    @staticmethod
    def safe_compare(
        dt1: Optional[datetime], 
        dt2: Optional[datetime],
        allow_none: bool = True
    ) -> int:
        """
        Safely compare two datetimes, ensuring both are timezone-aware and in the same timezone.
        
        This method:
        1. Handles None values by default (None is considered "less than" a datetime)
        2. Ensures both datetimes are converted to UTC for proper comparison
        3. Provides detailed logging for diagnostic purposes
        
        Args:
            dt1 (Optional[datetime]): First datetime to compare
            dt2 (Optional[datetime]): Second datetime to compare
            allow_none (bool, optional): Whether to allow None values. Defaults to True.
                If False, a TypeError will be raised when None is provided.
            
        Returns:
            int: -1 if dt1 < dt2, 0 if dt1 == dt2, 1 if dt1 > dt2
            
        Raises:
            TimezoneError: If timezone conversion fails
            TypeError: If either datetime is None and allow_none is False
            
        Examples:
            >>> dt1 = TimezoneUtilities.utc_now()
            >>> dt2 = dt1 + timedelta(days=1)
            >>> TimezoneUtilities.safe_compare(dt1, dt2)
            -1
            
            >>> TimezoneUtilities.safe_compare(dt2, dt1)
            1
            
            >>> TimezoneUtilities.safe_compare(dt1, dt1)
            0
            
            >>> TimezoneUtilities.safe_compare(None, dt1)
            -1
            
            >>> TimezoneUtilities.safe_compare(dt1, None)
            1
            
            >>> TimezoneUtilities.safe_compare(None, None)
            0
        """
        operation_id = f"safe_compare_{int(time.time() * 1000)}"
        start_time = time.time()
        
        logger.debug(f"[{operation_id}] Comparing datetimes: {dt1} and {dt2}")
        
        # Handle None values
        if not allow_none and (dt1 is None or dt2 is None):
            error_msg = "Cannot compare with None when allow_none is False"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TypeError(error_msg)
            
        if dt1 is None and dt2 is None:
            logger.debug(f"[{operation_id}] Both datetimes are None, returning 0")
            return 0
        if dt1 is None:
            logger.debug(f"[{operation_id}] First datetime is None, returning -1")
            return -1
        if dt2 is None:
            logger.debug(f"[{operation_id}] Second datetime is None, returning 1")
            return 1
            
        try:
            # Ensure both datetimes are timezone-aware and in UTC
            dt1_utc = TimezoneUtilities.normalize_timezone(dt1, "UTC")
            dt2_utc = TimezoneUtilities.normalize_timezone(dt2, "UTC")
            
            # Get the result
            result = 0
            if dt1_utc < dt2_utc:
                result = -1
            elif dt1_utc > dt2_utc:
                result = 1
                
            # Log performance and result
            elapsed_ms = int((time.time() - start_time) * 1000)
            dt1_iso = dt1_utc.isoformat() if dt1_utc else "None"
            dt2_iso = dt2_utc.isoformat() if dt2_utc else "None"
            if elapsed_ms > TimezoneUtilities.SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow datetime comparison: {elapsed_ms}ms")
            
            logger.debug(f"[{operation_id}] Comparison result: {result} in {elapsed_ms}ms ({dt1_iso} vs {dt2_iso})")
            return result
            
        except TimezoneError:
            # Re-raise the original error
            raise
        except Exception as e:
            error_msg = f"Error comparing datetimes: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneError(error_msg, e) from e
    
    @staticmethod
    def is_expired(dt: Optional[datetime], grace_seconds: float = 0) -> bool:
        """
        Check if a datetime is in the past (expired).
        
        This method:
        1. Handles None values (returns False)
        2. Ensures the datetime is timezone-aware by converting to UTC
        3. Compares against the current UTC time
        4. Supports an optional grace period in seconds
        
        Args:
            dt (Optional[datetime]): Datetime to check for expiration
            grace_seconds (float, optional): Grace period in seconds. Defaults to 0.
                A positive value means the datetime must be further in the past
                by this many seconds to be considered expired.
            
        Returns:
            bool: True if the datetime is in the past (expired), False otherwise
            
        Raises:
            TimezoneError: If timezone conversion fails
            ValueError: If grace_seconds is negative
            
        Examples:
            >>> past_dt = TimezoneUtilities.utc_now() - timedelta(days=1)
            >>> TimezoneUtilities.is_expired(past_dt)
            True
            
            >>> future_dt = TimezoneUtilities.utc_now() + timedelta(days=1)
            >>> TimezoneUtilities.is_expired(future_dt)
            False
            
            >>> almost_expired = TimezoneUtilities.utc_now() - timedelta(seconds=30)
            >>> TimezoneUtilities.is_expired(almost_expired, grace_seconds=60)
            False  # Not expired yet with 60 second grace period
            
            >>> TimezoneUtilities.is_expired(None)
            False
        """
        operation_id = f"is_expired_{int(time.time() * 1000)}"
        start_time = time.time()
        
        # Validate input
        if grace_seconds < 0:
            error_msg = f"Grace period cannot be negative: {grace_seconds}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise ValueError(error_msg)
        
        logger.debug(f"[{operation_id}] Checking if datetime is expired: {dt}, grace period: {grace_seconds}s")
        
        if dt is None:
            logger.debug(f"[{operation_id}] Datetime is None, returning False")
            return False
            
        try:
            # Ensure dt is timezone-aware and in UTC
            dt_utc = TimezoneUtilities.normalize_timezone(dt, "UTC")
            now_utc = TimezoneUtilities.utc_now()
            
            # Apply grace period if specified
            threshold = now_utc
            if grace_seconds > 0:
                threshold = now_utc - timedelta(seconds=grace_seconds)
                logger.debug(f"[{operation_id}] Using threshold with grace period: {threshold.isoformat()}")
                
            # Check if expired
            is_expired = dt_utc < threshold
            
            # Log result
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > TimezoneUtilities.SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow expiration check: {elapsed_ms}ms")
                
            dt_iso = dt_utc.isoformat() if dt_utc else "None"
            now_iso = now_utc.isoformat()
            logger.debug(f"[{operation_id}] Expiration check result: {is_expired} in {elapsed_ms}ms (dt: {dt_iso}, now: {now_iso})")
                
            return is_expired
            
        except TimezoneError:
            # Re-raise the original error
            raise
        except Exception as e:
            error_msg = f"Error checking expiration: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneError(error_msg, e) from e
    
    @staticmethod
    def is_in_future(dt: Optional[datetime], threshold_seconds: float = 0) -> bool:
        """
        Check if a datetime is in the future.
        
        This method:
        1. Handles None values (returns False)
        2. Ensures the datetime is timezone-aware by converting to UTC
        3. Compares against the current UTC time
        4. Supports an optional threshold in seconds
        
        Args:
            dt (Optional[datetime]): Datetime to check if it's in the future
            threshold_seconds (float, optional): Threshold in seconds. Defaults to 0.
                A positive value means the datetime must be further in the future
                by this many seconds to be considered in the future.
            
        Returns:
            bool: True if the datetime is in the future, False otherwise
            
        Raises:
            TimezoneError: If timezone conversion fails
            ValueError: If threshold_seconds is negative
            
        Examples:
            >>> future_dt = TimezoneUtilities.utc_now() + timedelta(days=1)
            >>> TimezoneUtilities.is_in_future(future_dt)
            True
            
            >>> past_dt = TimezoneUtilities.utc_now() - timedelta(days=1)
            >>> TimezoneUtilities.is_in_future(past_dt)
            False
            
            >>> nearly_future = TimezoneUtilities.utc_now() + timedelta(seconds=30)
            >>> TimezoneUtilities.is_in_future(nearly_future, threshold_seconds=60)
            False  # Not far enough in the future with 60 second threshold
            
            >>> TimezoneUtilities.is_in_future(None)
            False
        """
        operation_id = f"is_in_future_{int(time.time() * 1000)}"
        start_time = time.time()
        
        # Validate input
        if threshold_seconds < 0:
            error_msg = f"Threshold cannot be negative: {threshold_seconds}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise ValueError(error_msg)
        
        logger.debug(f"[{operation_id}] Checking if datetime is in future: {dt}, threshold: {threshold_seconds}s")
        
        if dt is None:
            logger.debug(f"[{operation_id}] Datetime is None, returning False")
            return False
            
        try:
            # Ensure dt is timezone-aware and in UTC
            dt_utc = TimezoneUtilities.normalize_timezone(dt, "UTC")
            now_utc = TimezoneUtilities.utc_now()
            
            # Apply threshold if specified
            threshold = now_utc
            if threshold_seconds > 0:
                threshold = now_utc + timedelta(seconds=threshold_seconds)
                logger.debug(f"[{operation_id}] Using threshold with buffer: {threshold.isoformat()}")
                
            # Check if in future
            is_future = dt_utc > threshold
            
            # Log result
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > TimezoneUtilities.SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow future check: {elapsed_ms}ms")
                
            dt_iso = dt_utc.isoformat() if dt_utc else "None"
            now_iso = now_utc.isoformat()
            logger.debug(f"[{operation_id}] Future check result: {is_future} in {elapsed_ms}ms (dt: {dt_iso}, now: {now_iso})")
                
            return is_future
            
        except TimezoneError:
            # Re-raise the original error
            raise
        except Exception as e:
            error_msg = f"Error checking future datetime: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneError(error_msg, e) from e
    
    @staticmethod
    def format_datetime(
        dt: Optional[datetime], 
        fmt: str = ISO_FORMAT,
        default_tz_name: str = DEFAULT_TIMEZONE
    ) -> Optional[str]:
        """
        Format a datetime with timezone information.
        
        This method:
        1. Handles None values (returns None)
        2. Ensures the datetime is timezone-aware
        3. Formats the datetime using the specified format string
        4. Supports various format patterns including ISO format and human-readable formats
        
        Args:
            dt (Optional[datetime]): Datetime to format
            fmt (str, optional): Format string. Defaults to ISO_FORMAT.
                Example formats:
                - ISO_FORMAT: "%Y-%m-%dT%H:%M:%S%z" (e.g., "2023-01-01T12:30:00+00:00")
                - HUMAN_READABLE_FORMAT: "%Y-%m-%d %H:%M:%S %Z" (e.g., "2023-01-01 12:30:00 UTC")
            default_tz_name (str, optional): Default timezone to use if dt is naive.
                Defaults to DEFAULT_TIMEZONE.
            
        Returns:
            Optional[str]: Formatted datetime string or None if dt is None
            
        Raises:
            TimezoneError: If ensuring timezone awareness fails or formatting fails
            
        Examples:
            >>> dt = TimezoneUtilities.create_datetime(2023, 1, 1, 12, 30, 0, "UTC")
            >>> TimezoneUtilities.format_datetime(dt)
            '2023-01-01T12:30:00+00:00'
            
            >>> TimezoneUtilities.format_datetime(dt, "%Y-%m-%d %H:%M:%S %Z")
            '2023-01-01 12:30:00 UTC'
            
            >>> TimezoneUtilities.format_datetime(None)
            None
        """
        operation_id = f"format_datetime_{int(time.time() * 1000)}"
        start_time = time.time()
        
        logger.debug(f"[{operation_id}] Formatting datetime: {dt}, format: {fmt}")
        
        if dt is None:
            logger.debug(f"[{operation_id}] Datetime is None, returning None")
            return None
        
        # Validate format string
        if not isinstance(fmt, str) or not fmt:
            error_msg = f"Invalid format string: {fmt}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise ValueError(error_msg)
            
        try:
            # Ensure dt is timezone-aware
            dt = TimezoneUtilities.ensure_timezone_aware(dt, default_tz_name)
            
            # Format the datetime
            result = dt.strftime(fmt)
            
            # Log performance
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > TimezoneUtilities.SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow datetime formatting: {elapsed_ms}ms")
            
            logger.debug(f"[{operation_id}] Formatted datetime in {elapsed_ms}ms: {result}")
            return result
            
        except TimezoneError:
            # Re-raise the original error
            raise
        except Exception as e:
            error_msg = f"Error formatting datetime: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneError(error_msg, e) from e
    
    @staticmethod
    def get_available_timezones(region_filter: Optional[str] = None) -> List[str]:
        """
        Get a list of all available timezone names, optionally filtered by region.
        
        This method returns a list of all available timezone names from the pytz library.
        You can optionally filter the timezones by region (e.g., "America", "Europe", "Asia").
        
        Args:
            region_filter (Optional[str], optional): Region prefix to filter timezones.
                For example, "America" will return all timezones starting with "America/".
                Defaults to None (no filtering).
            
        Returns:
            List[str]: List of timezone names
            
        Examples:
            >>> # Get all available timezones
            >>> all_tz = TimezoneUtilities.get_available_timezones()
            >>> "UTC" in all_tz
            True
            >>> "America/New_York" in all_tz
            True
            
            >>> # Get timezones in Europe
            >>> europe_tz = TimezoneUtilities.get_available_timezones("Europe")
            >>> "Europe/London" in europe_tz
            True
            >>> "America/New_York" in europe_tz
            False
        """
        operation_id = f"get_available_timezones_{int(time.time() * 1000)}"
        start_time = time.time()
        
        logger.debug(f"[{operation_id}] Getting available timezones with filter: {region_filter}")
        
        try:
            # Get all timezones
            all_timezones = pytz.all_timezones
            
            # Apply filtering if specified
            if region_filter:
                if not isinstance(region_filter, str):
                    error_msg = f"Region filter must be a string, got {type(region_filter).__name__}"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise TypeError(error_msg)
                    
                filtered_timezones = [tz for tz in all_timezones if tz.startswith(f"{region_filter}/")]
                
                # Log result count
                elapsed_ms = int((time.time() - start_time) * 1000)
                logger.debug(f"[{operation_id}] Found {len(filtered_timezones)} timezones matching filter '{region_filter}' in {elapsed_ms}ms")
                
                return filtered_timezones
            
            # Log result for all timezones
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.debug(f"[{operation_id}] Found {len(all_timezones)} total timezones in {elapsed_ms}ms")
            
            return all_timezones
            
        except Exception as e:
            error_msg = f"Error getting available timezones: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneError(error_msg, e) from e
    
    @staticmethod
    def validate_timezone(tz_name: str, raise_error: bool = False) -> bool:
        """
        Validate that a timezone name is valid.
        
        This method checks if a given timezone name is valid by attempting to
        create a pytz timezone object with it. It includes proper error handling
        and logging for diagnostic purposes.
        
        Args:
            tz_name (str): Timezone name to validate (e.g., "UTC", "America/New_York")
            raise_error (bool, optional): Whether to raise an exception if the timezone
                is invalid. Defaults to False.
            
        Returns:
            bool: True if the timezone is valid, False otherwise (if raise_error is False)
            
        Raises:
            TimezoneValidationError: If the timezone is invalid and raise_error is True
            
        Examples:
            >>> TimezoneUtilities.validate_timezone("UTC")
            True
            
            >>> TimezoneUtilities.validate_timezone("America/New_York")
            True
            
            >>> TimezoneUtilities.validate_timezone("Invalid/Timezone")
            False
            
            >>> TimezoneUtilities.validate_timezone("Invalid/Timezone", raise_error=True)
            Raises TimezoneValidationError
        """
        operation_id = f"validate_timezone_{int(time.time() * 1000)}"
        start_time = time.time()
        
        if not isinstance(tz_name, str) or not tz_name:
            error_msg = f"Invalid timezone name: {tz_name}"
            logger.error(f"[{operation_id}] {error_msg}")
            if raise_error:
                raise TimezoneValidationError(error_msg, tz_name=tz_name)
            return False
        
        logger.debug(f"[{operation_id}] Validating timezone: {tz_name}")
        
        try:
            # Attempt to create timezone object
            pytz.timezone(tz_name)
            
            # Log success
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.debug(f"[{operation_id}] Timezone '{tz_name}' is valid (verified in {elapsed_ms}ms)")
            
            return True
            
        except pytz.exceptions.UnknownTimeZoneError as e:
            # Log failure
            elapsed_ms = int((time.time() - start_time) * 1000)
            error_msg = f"Unknown timezone: {tz_name}"
            logger.warning(f"[{operation_id}] {error_msg} (validated in {elapsed_ms}ms)")
            
            if raise_error:
                raise TimezoneValidationError(error_msg, e, tz_name) from e
                
            return False
            
        except Exception as e:
            # Handle unexpected errors
            error_msg = f"Error validating timezone: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            
            if raise_error:
                raise TimezoneError(error_msg, e) from e
                
            return False
    
    @staticmethod
    def get_current_timezone_offset(tz_name: str, 
                                   at_datetime: Optional[datetime] = None,
                                   include_seconds: bool = False) -> Union[Tuple[int, int], Tuple[int, int, int]]:
        """
        Get the current UTC offset for a timezone in hours and minutes (and optionally seconds).
        
        This method calculates the offset from UTC for a specified timezone, either
        at the current time or at a specified datetime. It handles timezone validation,
        provides proper error messages, and includes detailed logging.
        
        Args:
            tz_name (str): Timezone name (e.g., "UTC", "America/New_York")
            at_datetime (Optional[datetime], optional): Datetime at which to calculate the offset.
                Useful for handling daylight saving time changes. Defaults to None (current time).
            include_seconds (bool, optional): Whether to include seconds in the return value.
                Defaults to False.
            
        Returns:
            Union[Tuple[int, int], Tuple[int, int, int]]: 
                If include_seconds is False: Tuple of (hours_offset, minutes_offset)
                If include_seconds is True: Tuple of (hours_offset, minutes_offset, seconds_offset)
            
        Raises:
            TimezoneValidationError: If the timezone name is invalid
            TimezoneError: If offset calculation fails for any other reason
            
        Examples:
            >>> # Get current offset for New York (result varies by time of year due to DST)
            >>> hours, minutes = TimezoneUtilities.get_current_timezone_offset("America/New_York")
            >>> # During Eastern Standard Time (EST)
            >>> (hours, minutes)  # Example output during non-DST
            (-5, 0)
            >>> # During Eastern Daylight Time (EDT)
            >>> (hours, minutes)  # Example output during DST
            (-4, 0)
            
            >>> # With seconds precision
            >>> hours, minutes, seconds = TimezoneUtilities.get_current_timezone_offset(
            ...     "America/New_York", include_seconds=True)
            >>> (hours, minutes, seconds)
            (-5, 0, 0)
            
            >>> # Get offset at a specific datetime
            >>> winter_date = TimezoneUtilities.create_datetime(2023, 1, 1, 12, 0, 0, "UTC")
            >>> hours, minutes = TimezoneUtilities.get_current_timezone_offset(
            ...     "America/New_York", at_datetime=winter_date)
            >>> (hours, minutes)
            (-5, 0)
        """
        operation_id = f"get_timezone_offset_{int(time.time() * 1000)}"
        start_time = time.time()
        
        logger.debug(f"[{operation_id}] Getting timezone offset for: {tz_name}, at_datetime: {at_datetime}")
        
        try:
            # Validate timezone
            if not TimezoneUtilities.validate_timezone(tz_name):
                error_msg = f"Unknown timezone: {tz_name}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise TimezoneValidationError(error_msg, tz_name=tz_name)
                
            # Create timezone object
            tz = pytz.timezone(tz_name)
            
            # Get datetime in the timezone
            if at_datetime is None:
                # Use current time
                dt = datetime.now(tz)
            else:
                # Use specified time
                if at_datetime.tzinfo is None:
                    # If naive, assume UTC
                    at_datetime = at_datetime.replace(tzinfo=timezone.utc)
                # Convert to target timezone
                dt = at_datetime.astimezone(tz)
            
            # Calculate offset
            offset_seconds = dt.utcoffset().total_seconds()
            
            hours = int(offset_seconds // 3600)
            minutes = int((offset_seconds % 3600) // 60)
            seconds = int(offset_seconds % 60)
            
            # Log result
            elapsed_ms = int((time.time() - start_time) * 1000)
            offset_str = f"{hours:+d}:{minutes:02d}" + (f":{seconds:02d}" if include_seconds else "")
            logger.debug(f"[{operation_id}] Timezone '{tz_name}' offset is {offset_str} (calculated in {elapsed_ms}ms)")
            
            # Return result based on include_seconds flag
            if include_seconds:
                return hours, minutes, seconds
            else:
                return hours, minutes
                
        except TimezoneValidationError:
            # Re-raise specialized error
            raise
        except pytz.exceptions.UnknownTimeZoneError as e:
            error_msg = f"Unknown timezone: {tz_name}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneValidationError(error_msg, e, tz_name) from e
        except Exception as e:
            error_msg = f"Error getting timezone offset: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneError(error_msg, e) from e
    
    @staticmethod
    def convert_timezone(
        dt: datetime, 
        from_tz: str, 
        to_tz: str,
        prefer_dst: Optional[bool] = None
    ) -> datetime:
        """
        Convert a datetime from one timezone to another.
        
        This method:
        1. Validates both source and target timezone names
        2. Properly handles naive datetimes by localizing them to the source timezone
        3. Safely converts between timezones with detailed error reporting
        4. Properly handles ambiguous times during DST transitions
        
        Args:
            dt (datetime): Datetime to convert
            from_tz (str): Source timezone name (e.g., "UTC", "America/New_York")
            to_tz (str): Target timezone name (e.g., "UTC", "Europe/London")
            prefer_dst (Optional[bool], optional): Preference for handling ambiguous times
                during DST transitions. None means use system default, True means prefer
                daylight saving time, False means prefer standard time. Defaults to None.
            
        Returns:
            datetime: Converted timezone-aware datetime
            
        Raises:
            TimezoneValidationError: If either timezone name is invalid
            TimezoneConversionError: If the conversion fails for any other reason
            ValueError: If dt is not a valid datetime object
            
        Examples:
            >>> # Convert from UTC to Tokyo
            >>> utc_dt = TimezoneUtilities.create_datetime(2023, 1, 1, 12, 0, 0, "UTC")
            >>> tokyo_dt = TimezoneUtilities.convert_timezone(utc_dt, "UTC", "Asia/Tokyo")
            >>> tokyo_dt.hour  # 21 (UTC+9)
            21
            
            >>> # Convert a naive datetime
            >>> naive_dt = datetime(2023, 1, 1, 12, 0, 0)  # No timezone info
            >>> est_dt = TimezoneUtilities.convert_timezone(naive_dt, "America/New_York", "UTC")
            >>> est_dt.hour  # 17 (EST is UTC-5)
            17
        """
        operation_id = f"convert_timezone_{int(time.time() * 1000)}"
        start_time = time.time()
        
        # Input validation
        if not isinstance(dt, datetime):
            error_msg = f"Expected datetime object, got {type(dt).__name__}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise ValueError(error_msg)
            
        logger.debug(f"[{operation_id}] Converting datetime {dt.isoformat() if hasattr(dt, 'isoformat') else dt} " + 
                    f"from '{from_tz}' to '{to_tz}'")
                    
        try:
            # Validate timezones
            if not TimezoneUtilities.validate_timezone(from_tz):
                error_msg = f"Unknown source timezone: {from_tz}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise TimezoneValidationError(error_msg, tz_name=from_tz)
                
            if not TimezoneUtilities.validate_timezone(to_tz):
                error_msg = f"Unknown target timezone: {to_tz}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise TimezoneValidationError(error_msg, tz_name=to_tz)
                
            # Get timezone objects
            source_tz = pytz.timezone(from_tz)
            target_tz = pytz.timezone(to_tz)
            
            # Ensure the datetime is aware and in the source timezone
            if dt.tzinfo is None:
                # Handle naive datetime, localize to source timezone
                try:
                    # Handle ambiguous times during DST transitions
                    if prefer_dst is not None:
                        dt = source_tz.localize(dt, is_dst=prefer_dst)
                    else:
                        dt = source_tz.localize(dt)
                except pytz.exceptions.AmbiguousTimeError as e:
                    # This happens during DST fall-back transition when a time occurs twice
                    logger.warning(f"[{operation_id}] Ambiguous time during DST transition: {dt}. Using is_dst=True.")
                    dt = source_tz.localize(dt, is_dst=True)
                except pytz.exceptions.NonExistentTimeError as e:
                    # This happens during DST spring-forward transition when a time is skipped
                    logger.warning(f"[{operation_id}] Non-existent time during DST transition: {dt}. Adjusting forward.")
                    # Adjust forward by 1 hour to a valid time
                    dt = source_tz.localize(dt + timedelta(hours=1))
            else:
                # Already aware, convert to source timezone
                dt = dt.astimezone(source_tz)
                
            # Convert to target timezone
            result = dt.astimezone(target_tz)
            
            # Log result
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > TimezoneUtilities.SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow timezone conversion: {elapsed_ms}ms")
                
            logger.debug(f"[{operation_id}] Converted {dt.isoformat()} to {result.isoformat()} in {elapsed_ms}ms")
            
            return result
            
        except (TimezoneValidationError, ValueError):
            # Re-raise these specific errors
            raise
        except pytz.exceptions.UnknownTimeZoneError as e:
            # This shouldn't happen due to the validation above, but just in case
            error_msg = f"Unknown timezone: {from_tz} or {to_tz}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneValidationError(error_msg, e, tz_name=from_tz if "from_tz" in str(e) else to_tz) from e
        except Exception as e:
            error_msg = f"Error converting timezone: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneConversionError(error_msg, e, from_tz=from_tz, to_tz=to_tz) from e
    
    @staticmethod
    def datetime_diff(
        dt1: datetime, 
        dt2: datetime, 
        unit: TimeUnit = 'seconds',
        abs_value: bool = False
    ) -> float:
        """
        Get the difference between two datetimes in the specified unit.
        
        This method:
        1. Ensures both datetimes are timezone-aware and normalized to UTC
        2. Calculates the difference between them in the requested unit
        3. Handles timezone conversion and provides detailed error reporting
        4. Optionally returns the absolute value of the difference
        
        Args:
            dt1 (datetime): First datetime
            dt2 (datetime): Second datetime
            unit (TimeUnit, optional): Unit of difference. Defaults to 'seconds'.
                Valid values are 'seconds', 'minutes', 'hours', 'days'.
            abs_value (bool, optional): Whether to return the absolute value of the difference.
                Defaults to False.
            
        Returns:
            float: Difference in the specified unit
                If abs_value is False: positive if dt1 > dt2, negative if dt1 < dt2
                If abs_value is True: always positive
            
        Raises:
            TimezoneError: If timezone conversion fails
            ValueError: If dt1 or dt2 is not a valid datetime object or if the unit is invalid
            
        Examples:
            >>> dt1 = TimezoneUtilities.create_datetime(2023, 1, 1, 12, 0, 0, "UTC")
            >>> dt2 = TimezoneUtilities.create_datetime(2023, 1, 1, 10, 0, 0, "UTC")
            
            >>> # Difference in hours
            >>> TimezoneUtilities.datetime_diff(dt1, dt2, 'hours')
            2.0
            
            >>> # Difference in minutes
            >>> TimezoneUtilities.datetime_diff(dt1, dt2, 'minutes')
            120.0
            
            >>> # Negative difference
            >>> TimezoneUtilities.datetime_diff(dt2, dt1, 'hours')  # dt2 < dt1
            -2.0
            
            >>> # Absolute value
            >>> TimezoneUtilities.datetime_diff(dt2, dt1, 'hours', abs_value=True)
            2.0
            
            >>> # Different timezones
            >>> dt3 = TimezoneUtilities.create_datetime(2023, 1, 1, 17, 0, 0, "America/New_York")  # Same time as dt1 in UTC
            >>> TimezoneUtilities.datetime_diff(dt1, dt3, 'hours')  # Should be 0
            0.0
        """
        operation_id = f"datetime_diff_{int(time.time() * 1000)}"
        start_time = time.time()
        
        # Input validation
        if not isinstance(dt1, datetime):
            error_msg = f"First argument must be a datetime object, got {type(dt1).__name__}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise ValueError(error_msg)
            
        if not isinstance(dt2, datetime):
            error_msg = f"Second argument must be a datetime object, got {type(dt2).__name__}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise ValueError(error_msg)
            
        valid_units = ['seconds', 'minutes', 'hours', 'days']
        if unit not in valid_units:
            error_msg = f"Invalid time difference unit: {unit}. Use {', '.join(valid_units)}."
            logger.error(f"[{operation_id}] {error_msg}")
            raise ValueError(error_msg)
            
        logger.debug(f"[{operation_id}] Calculating difference between {dt1} and {dt2} in {unit}" +
                     f"{' (absolute value)' if abs_value else ''}")
        
        try:
            # Ensure both datetimes are timezone-aware and in UTC
            dt1_utc = TimezoneUtilities.normalize_timezone(dt1, "UTC")
            dt2_utc = TimezoneUtilities.normalize_timezone(dt2, "UTC")
            
            # Calculate the difference in seconds
            diff_seconds = (dt1_utc - dt2_utc).total_seconds()
            
            # Convert to the requested unit
            result = 0.0
            if unit == 'seconds':
                result = diff_seconds
            elif unit == 'minutes':
                result = diff_seconds / 60
            elif unit == 'hours':
                result = diff_seconds / 3600
            elif unit == 'days':
                result = diff_seconds / (3600 * 24)
                
            # Get absolute value if requested
            if abs_value:
                result = abs(result)
                
            # Log result
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > TimezoneUtilities.SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow datetime difference calculation: {elapsed_ms}ms")
                
            dt1_iso = dt1_utc.isoformat() if dt1_utc else str(dt1)
            dt2_iso = dt2_utc.isoformat() if dt2_utc else str(dt2)
            logger.debug(f"[{operation_id}] Difference is {result} {unit} between {dt1_iso} and {dt2_iso} (calculated in {elapsed_ms}ms)")
            
            return result
            
        except TimezoneError:
            # Re-raise the original error
            raise
        except Exception as e:
            error_msg = f"Error calculating datetime difference: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneError(error_msg, e) from e
    
    @staticmethod
    def add_timezone_info(
        data: Any, 
        timezone_field: str = 'timezone', 
        tz_name: str = DEFAULT_TIMEZONE,
        include_abbreviation: bool = True,
        include_utc_now: bool = False,
        reference_datetime: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Add timezone information to a data dictionary.
        
        This method:
        1. Creates a copy of the input data to avoid modifying the original
        2. Adds timezone name, offset, and optionally abbreviation and current time
        3. Provides detailed error handling and logging
        
        Args:
            data (Any): Dictionary-like object to augment
            timezone_field (str, optional): Field name prefix to store timezone info.
                Defaults to 'timezone'.
            tz_name (str, optional): Timezone name to use. Defaults to DEFAULT_TIMEZONE.
            include_abbreviation (bool, optional): Whether to include the timezone
                abbreviation (e.g., EST, PST). Defaults to True.
            include_utc_now (bool, optional): Whether to include the current UTC time.
                Defaults to False.
            reference_datetime (Optional[datetime], optional): Reference datetime for
                calculating the timezone offset. Defaults to None (current time).
            
        Returns:
            Dict[str, Any]: Dictionary with added timezone information
            
        Raises:
            TimezoneValidationError: If the timezone name is invalid
            TimezoneError: If getting timezone info fails for any other reason
            ValueError: If the input data cannot be converted to a dictionary
            
        Examples:
            >>> # Basic usage
            >>> data = {"user_id": 123}
            >>> result = TimezoneUtilities.add_timezone_info(data, tz_name="America/New_York")
            >>> result["timezone"]  # America/New_York
            'America/New_York'
            >>> "timezone_offset" in result
            True
            >>> "timezone_abbreviation" in result
            True
            
            >>> # Custom field prefix
            >>> result = TimezoneUtilities.add_timezone_info(data, timezone_field="tz", tz_name="UTC")
            >>> result["tz"]  # UTC
            'UTC'
            >>> result["tz_offset"]  # +00:00
            '+00:00'
            
            >>> # Include current time
            >>> result = TimezoneUtilities.add_timezone_info(data, include_utc_now=True)
            >>> "timezone_utc_now" in result
            True
        """
        operation_id = f"add_timezone_info_{int(time.time() * 1000)}"
        start_time = time.time()
        
        logger.debug(f"[{operation_id}] Adding timezone info for {tz_name} to data")
        
        try:
            # Validate timezone
            if not TimezoneUtilities.validate_timezone(tz_name):
                error_msg = f"Unknown timezone: {tz_name}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise TimezoneValidationError(error_msg, tz_name=tz_name)
                
            # Create a copy of the data
            if isinstance(data, dict):
                result = data.copy()
            else:
                try:
                    # Try to convert to dict
                    result = dict(data)
                except (TypeError, ValueError) as e:
                    error_msg = f"Cannot convert data to dictionary: {e}"
                    logger.error(f"[{operation_id}] {error_msg}")
                    raise ValueError(error_msg) from e
                
            # Add timezone information
            result[timezone_field] = tz_name
            
            # Add current offset
            hours, minutes = TimezoneUtilities.get_current_timezone_offset(
                tz_name, 
                at_datetime=reference_datetime
            )
            offset_str = f"{hours:+03d}:{minutes:02d}"
            result[f"{timezone_field}_offset"] = offset_str
            
            # Add timezone abbreviation if requested
            if include_abbreviation:
                abbreviation = TimezoneUtilities.get_timezone_abbreviation(tz_name)
                result[f"{timezone_field}_abbreviation"] = abbreviation
                
            # Add current UTC time if requested
            if include_utc_now:
                utc_now = TimezoneUtilities.utc_now()
                result[f"{timezone_field}_utc_now"] = utc_now.isoformat()
                
            # Log performance
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > TimezoneUtilities.SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow timezone info addition: {elapsed_ms}ms")
                
            logger.debug(f"[{operation_id}] Added timezone info in {elapsed_ms}ms")
            
            return result
            
        except (TimezoneValidationError, ValueError):
            # Re-raise these specific errors
            raise
        except TimezoneError:
            # Re-raise the original error
            raise
        except Exception as e:
            error_msg = f"Error adding timezone info: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneError(error_msg, e) from e
    
    @staticmethod
    def get_timezone_abbreviation(
        tz_name: str, 
        at_datetime: Optional[datetime] = None
    ) -> str:
        """
        Get the abbreviation for a timezone (e.g., EST, PST, GMT).
        
        This method returns the abbreviation for a timezone, which may vary depending
        on the time of year due to daylight saving time. For example, "America/New_York"
        may return "EST" during standard time or "EDT" during daylight saving time.
        
        Args:
            tz_name (str): Timezone name (e.g., "UTC", "America/New_York")
            at_datetime (Optional[datetime], optional): Datetime at which to get the
                abbreviation. Useful for handling daylight saving time changes.
                Defaults to None (current time).
            
        Returns:
            str: Timezone abbreviation (e.g., "UTC", "EST", "EDT", "PST")
            
        Raises:
            TimezoneValidationError: If the timezone name is invalid
            TimezoneError: If getting the abbreviation fails for any other reason
            
        Examples:
            >>> # Get abbreviation for UTC
            >>> TimezoneUtilities.get_timezone_abbreviation("UTC")
            'UTC'
            
            >>> # Get abbreviation for New York (result varies by time of year)
            >>> # During Eastern Standard Time
            >>> TimezoneUtilities.get_timezone_abbreviation("America/New_York")  # Example output during non-DST
            'EST'
            >>> # During Eastern Daylight Time
            >>> TimezoneUtilities.get_timezone_abbreviation("America/New_York")  # Example output during DST
            'EDT'
            
            >>> # Get abbreviation at a specific time
            >>> winter_date = TimezoneUtilities.create_datetime(2023, 1, 1, 12, 0, 0, "UTC")
            >>> TimezoneUtilities.get_timezone_abbreviation("America/New_York", winter_date)
            'EST'
        """
        operation_id = f"get_timezone_abbreviation_{int(time.time() * 1000)}"
        start_time = time.time()
        
        logger.debug(f"[{operation_id}] Getting abbreviation for timezone: {tz_name}, at_datetime: {at_datetime}")
        
        try:
            # Validate timezone
            if not TimezoneUtilities.validate_timezone(tz_name):
                error_msg = f"Unknown timezone: {tz_name}"
                logger.error(f"[{operation_id}] {error_msg}")
                raise TimezoneValidationError(error_msg, tz_name=tz_name)
                
            # Create timezone object
            tz = pytz.timezone(tz_name)
            
            # Get datetime in the timezone
            if at_datetime is None:
                # Use current time
                dt = datetime.now(tz)
            else:
                # Use specified time
                if at_datetime.tzinfo is None:
                    # If naive, assume UTC
                    at_datetime = at_datetime.replace(tzinfo=timezone.utc)
                # Convert to target timezone
                dt = at_datetime.astimezone(tz)
            
            # Get the abbreviation
            abbreviation = dt.strftime('%Z')
            
            # Log result
            elapsed_ms = int((time.time() - start_time) * 1000)
            if elapsed_ms > TimezoneUtilities.SLOW_OPERATION_THRESHOLD_MS:
                logger.warning(f"[{operation_id}] Slow timezone abbreviation lookup: {elapsed_ms}ms")
                
            logger.debug(f"[{operation_id}] Timezone '{tz_name}' abbreviation is '{abbreviation}' (retrieved in {elapsed_ms}ms)")
            
            return abbreviation
            
        except TimezoneValidationError:
            # Re-raise specialized error
            raise
        except pytz.exceptions.UnknownTimeZoneError as e:
            error_msg = f"Unknown timezone: {tz_name}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneValidationError(error_msg, e, tz_name) from e
        except Exception as e:
            error_msg = f"Error getting timezone abbreviation: {e}"
            logger.error(f"[{operation_id}] {error_msg}")
            raise TimezoneError(error_msg, e) from e