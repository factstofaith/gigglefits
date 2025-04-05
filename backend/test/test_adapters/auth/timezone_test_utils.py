"""
Timezone test utilities.

This module provides comprehensive utilities for testing timezone handling throughout
the application. It ensures consistent timezone awareness in all datetime operations
to prevent timezone-related test failures.

The TimezoneTestUtilities class is the recommended way to handle all datetime
operations in tests, providing methods for:
1. Creating timezone-aware datetimes
2. Converting between timezones
3. Ensuring timezone awareness
4. Parsing datetime strings with timezone information
5. Comparing datetimes safely
"""

from datetime import datetime, timedelta, timezone
import pytz

class TimezoneTestUtilities:
    """Utilities for timezone-aware testing."""
    
    @staticmethod
    def create_datetime(year, month, day, hour=0, minute=0, second=0, tz_name="timezone"):
        """
        Create timezone-aware datetime in the specified timezone.
        
        Args:
            year: Year
            month: Month
            day: Day
            hour: Hour
            minute: Minute
            second: Second
            tz_name: Timezone name (e.g., "UTC", "America/New_York", "Asia/Tokyo")
            
        Returns:
            Timezone-aware datetime
        """
        tz = pytz.timezone(tz_name)
        naive_dt = datetime(year, month, day, hour, minute, second)
        return tz.localize(naive_dt)
    
    @staticmethod
    def create_datetime_with_offset(offset_hours=0, offset_minutes=0, 
                                    from_dt=None, tz_name="UTC"):
        """
        Create timezone-aware datetime with an offset from now or a specified datetime.
        
        Args:
            offset_hours: Hours offset (positive = future, negative = past)
            offset_minutes: Minutes offset (positive = future, negative = past)
            from_dt: Datetime to offset from (None = now)
            tz_name: Timezone name
            
        Returns:
            Timezone-aware datetime
        """
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
    
    @staticmethod
    def create_future_datetime(hours=1, minutes=0, tz_name="UTC"):
        """
        Create a timezone-aware datetime in the future.
        
        Args:
            hours: Hours in the future
            minutes: Minutes in the future
            tz_name: Timezone name
            
        Returns:
            Future timezone-aware datetime
        """
        return TimezoneTestUtilities.create_datetime_with_offset(
            offset_hours=hours, 
            offset_minutes=minutes,
            tz_name=tz_name
        )
    
    @staticmethod
    def create_past_datetime(hours=1, minutes=0, tz_name="UTC"):
        """
        Create a timezone-aware datetime in the past.
        
        Args:
            hours: Hours in the past
            minutes: Minutes in the past
            tz_name: Timezone name
            
        Returns:
            Past timezone-aware datetime
        """
        return TimezoneTestUtilities.create_datetime_with_offset(
            offset_hours=-hours,
            offset_minutes=-minutes,
            tz_name=tz_name
        )
    
    @staticmethod
    def utc_now():
        """
        Get current UTC time as timezone-aware datetime.
        
        Returns:
            Current UTC time
        """
        return datetime.now(timezone.utc)
    
    @staticmethod
    def ensure_timezone_aware(dt, default_tz_name="UTC"):
        """
        Ensure a datetime is timezone-aware, converting to the specified timezone if it's naive.
        
        Args:
            dt: Datetime to check
            default_tz_name: Default timezone to use if dt is naive
            
        Returns:
            Timezone-aware datetime
        """
        if dt is None:
            return None
            
        if dt.tzinfo is not None and dt.tzinfo.utcoffset(dt) is not None:
            return dt
            
        # Naive datetime, apply the default timezone
        tz = pytz.timezone(default_tz_name)
        return tz.localize(dt)
    
    @staticmethod
    def normalize_timezone(dt, target_tz_name="UTC"):
        """
        Normalize a datetime to the target timezone, ensuring it's timezone-aware first.
        
        Args:
            dt: Datetime to normalize
            target_tz_name: Target timezone name
            
        Returns:
            Normalized timezone-aware datetime
        """
        if dt is None:
            return None
            
        # Ensure dt is timezone-aware
        dt = TimezoneTestUtilities.ensure_timezone_aware(dt)
            
        # Convert to target timezone
        target_tz = pytz.timezone(target_tz_name)
        return dt.astimezone(target_tz)
    
    @staticmethod
    def parse_datetime(dt_string, default_tz_name="UTC"):
        """
        Parse a datetime string, ensuring the result is timezone-aware.
        
        Args:
            dt_string: Datetime string to parse
            default_tz_name: Default timezone if not specified in string
            
        Returns:
            Timezone-aware datetime
        """
        if dt_string is None or dt_string == "":
            return None
            
        # Try to parse with ISO format
        try:
            dt = datetime.fromisoformat(dt_string)
        except (ValueError, TypeError):
            try:
                # Try using dateutil parser as a fallback
                from dateutil import parser
                dt = parser.parse(dt_string)
            except (ValueError, ImportError):
                raise ValueError(f"Could not parse datetime string: {dt_string}")
        
        # Ensure timezone awareness
        return TimezoneTestUtilities.ensure_timezone_aware(dt, default_tz_name)
    
    @staticmethod
    def safe_compare(dt1, dt2):
        """
        Safely compare two datetimes, ensuring both are timezone-aware and in the same timezone.
        
        Args:
            dt1: First datetime
            dt2: Second datetime
            
        Returns:
            -1 if dt1 < dt2, 0 if dt1 == dt2, 1 if dt1 > dt2
        """
        if dt1 is None and dt2 is None:
            return 0
        if dt1 is None:
            return -1
        if dt2 is None:
            return 1
            
        # Ensure both datetimes are timezone-aware and in UTC
        dt1_utc = TimezoneTestUtilities.normalize_timezone(dt1, "UTC")
        dt2_utc = TimezoneTestUtilities.normalize_timezone(dt2, "UTC")
            
        if dt1_utc < dt2_utc:
            return -1
        elif dt1_utc > dt2_utc:
            return 1
        else:
            return 0
    
    @staticmethod
    def is_expired(dt):
        """
        Check if a datetime is in the past (expired).
        
        Args:
            dt: Datetime to check
            
        Returns:
            True if the datetime is in the past, False otherwise
        """
        if dt is None:
            return False
            
        # Ensure dt is timezone-aware and in UTC
        dt_utc = TimezoneTestUtilities.normalize_timezone(dt, "UTC")
        now_utc = TimezoneTestUtilities.utc_now()
            
        return dt_utc < now_utc
    
    @staticmethod
    def is_in_future(dt):
        """
        Check if a datetime is in the future.
        
        Args:
            dt: Datetime to check
            
        Returns:
            True if the datetime is in the future, False otherwise
        """
        if dt is None:
            return False
            
        # Ensure dt is timezone-aware and in UTC
        dt_utc = TimezoneTestUtilities.normalize_timezone(dt, "UTC")
        now_utc = TimezoneTestUtilities.utc_now()
            
        return dt_utc > now_utc
    
    @staticmethod
    def format_datetime(dt, fmt="%Y-%m-%dT%H:%M:%S%z"):
        """
        Format a datetime with timezone information.
        
        Args:
            dt: Datetime to format
            fmt: Format string
            
        Returns:
            Formatted datetime string
        """
        if dt is None:
            return None
            
        # Ensure dt is timezone-aware
        dt = TimezoneTestUtilities.ensure_timezone_aware(dt)
        
        return dt.strftime(fmt)


# Legacy functions - keep for backward compatibility but improved with TimezoneTestUtilities methods
def create_datetime_in_timezone(year, month, day, hour=0, minute=0, second=0, tz_name="UTC"):
    """Create timezone-aware datetime in the specified timezone."""
    return TimezoneTestUtilities.create_datetime(year, month, day, hour, minute, second, tz_name)

def create_future_datetime(days=1, hours=0, minutes=0, seconds=0, tz_name="UTC"):
    """Create a future datetime in the specified timezone."""
    # Use the improved implementation
    offset_hours = hours + (days * 24)
    offset_minutes = minutes + (seconds / 60)
    return TimezoneTestUtilities.create_datetime_with_offset(
        offset_hours=offset_hours,
        offset_minutes=offset_minutes,
        tz_name=tz_name
    )

def create_past_datetime(days=1, hours=0, minutes=0, seconds=0, tz_name="UTC"):
    """Create a past datetime in the specified timezone."""
    # Use the improved implementation
    offset_hours = -hours - (days * 24)
    offset_minutes = -minutes - (seconds / 60)
    return TimezoneTestUtilities.create_datetime_with_offset(
        offset_hours=offset_hours,
        offset_minutes=offset_minutes,
        tz_name=tz_name
    )

def create_invitation_with_timezone(invitation_adapter, email, role, expiration_hours, tz_name="UTC"):
    """Create invitation with expiration in the specified timezone."""
    # Use the improved implementations for consistency
    now = TimezoneTestUtilities.create_datetime_with_offset(tz_name=tz_name)
    expires_at = TimezoneTestUtilities.create_future_datetime(hours=expiration_hours, tz_name=tz_name)
    
    invitation_data = {
        "email": email,
        "role": role,
        "expiration_hours": expiration_hours,
        "custom_message": f"Test invitation with {tz_name} timezone"
    }
    
    # Let the adapter create the invitation
    invitation = invitation_adapter.create_invitation(
        email=email,
        role=role,
        created_by="admin-123",
        custom_message=f"Test invitation with {tz_name} timezone"
    )
    
    # Override the created_at and expires_at with timezone-aware datetimes
    invitation.created_at = now
    invitation.expires_at = expires_at
    
    # Ensure the invitation is properly updated in the registry
    invitation_adapter._update_entity("Invitation", invitation.id, invitation)
    
    return invitation

# Additional helper functions for common timezone operations
def get_utc_now():
    """Get current UTC time."""
    return TimezoneTestUtilities.utc_now()

def ensure_tz_aware(dt):
    """Ensure a datetime is timezone-aware."""
    return TimezoneTestUtilities.ensure_timezone_aware(dt)

def is_valid_expiration(expires_at):
    """Check if an expiration date is in the future."""
    return TimezoneTestUtilities.is_in_future(expires_at)