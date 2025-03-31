"""
Tests for the timezone utilities used throughout the test suite.

This file verifies that the TimezoneTestUtilities class correctly handles various
timezone operations and ensures timezone awareness throughout test fixtures.
"""

import pytest
from datetime import datetime, timedelta, timezone
import pytz

from test.test_adapters.auth import TimezoneTestUtilities
from test.test_adapters.auth.timezone_test_utils import (
    create_datetime_in_timezone,
    create_future_datetime,
    create_past_datetime,
    get_utc_now,
    ensure_tz_aware,
    is_valid_expiration
)


def test_create_datetime():
    """Test creating timezone-aware datetimes."""
    # Create datetime in UTC
    dt_utc = TimezoneTestUtilities.create_datetime(2025, 4, 15, 10, 30, 0, "UTC")
    assert dt_utc.tzinfo is not None
    assert dt_utc.year == 2025
    assert dt_utc.month == 4
    assert dt_utc.day == 15
    assert dt_utc.hour == 10
    assert dt_utc.minute == 30
    
    # Create datetime in Tokyo timezone
    dt_tokyo = TimezoneTestUtilities.create_datetime(2025, 4, 15, 10, 30, 0, "Asia/Tokyo")
    assert dt_tokyo.tzinfo is not None
    
    # Check that these are different times in absolute terms
    assert dt_utc != dt_tokyo


def test_create_datetime_with_offset():
    """Test creating datetimes with offsets."""
    # Create a datetime 2 hours in the future
    base_dt = TimezoneTestUtilities.utc_now()
    future_dt = TimezoneTestUtilities.create_datetime_with_offset(offset_hours=2)
    
    # Verify it's 2 hours ahead
    assert future_dt > base_dt
    diff = future_dt - base_dt
    assert int(diff.total_seconds() / 3600) == 2
    
    # Create a datetime 30 minutes in the past
    past_dt = TimezoneTestUtilities.create_datetime_with_offset(offset_hours=-0.5)
    
    # Verify it's 30 minutes behind
    assert past_dt < base_dt
    diff = base_dt - past_dt
    assert int(diff.total_seconds() / 60) == 30


def test_future_past_datetime():
    """Test creating future and past datetimes."""
    now = TimezoneTestUtilities.utc_now()
    
    # Test future datetime
    future = TimezoneTestUtilities.create_future_datetime(hours=3)
    assert future > now
    diff = future - now
    assert 2.9 <= diff.total_seconds() / 3600 <= 3.1  # Allow small variations due to test execution time
    
    # Test past datetime
    past = TimezoneTestUtilities.create_past_datetime(hours=2)
    assert past < now
    diff = now - past
    assert 1.9 <= diff.total_seconds() / 3600 <= 2.1  # Allow small variations


def test_ensure_timezone_aware():
    """Test ensuring datetimes are timezone-aware."""
    # Test with naive datetime
    naive_dt = datetime(2025, 4, 15, 10, 30, 0)
    assert naive_dt.tzinfo is None
    
    aware_dt = TimezoneTestUtilities.ensure_timezone_aware(naive_dt)
    assert aware_dt.tzinfo is not None
    
    # Test with already aware datetime
    tokyo_dt = datetime(2025, 4, 15, 10, 30, 0, tzinfo=pytz.timezone("Asia/Tokyo"))
    aware_tokyo = TimezoneTestUtilities.ensure_timezone_aware(tokyo_dt)
    assert aware_tokyo.tzinfo is not None
    assert aware_tokyo == tokyo_dt  # Should not change already aware datetime


def test_normalize_timezone():
    """Test normalizing datetimes to a target timezone."""
    # Create a datetime in Tokyo
    tokyo_dt = TimezoneTestUtilities.create_datetime(2025, 4, 15, 19, 30, 0, "Asia/Tokyo")
    
    # Normalize to UTC
    utc_dt = TimezoneTestUtilities.normalize_timezone(tokyo_dt, "UTC")
    
    # Check that the time has shifted but represents the same moment
    assert utc_dt != tokyo_dt  # Different representation
    assert utc_dt.hour != tokyo_dt.hour  # Different hour
    
    # Convert back to check they're the same moment
    tokyo_round_trip = TimezoneTestUtilities.normalize_timezone(utc_dt, "Asia/Tokyo")
    assert tokyo_round_trip.hour == tokyo_dt.hour
    assert tokyo_round_trip.minute == tokyo_dt.minute


def test_parse_datetime():
    """Test parsing datetime strings with timezone awareness."""
    # Test parsing ISO format
    dt_str = "2025-04-15T10:30:00+00:00"
    dt = TimezoneTestUtilities.parse_datetime(dt_str)
    assert dt.tzinfo is not None
    assert dt.year == 2025
    assert dt.month == 4
    assert dt.day == 15
    assert dt.hour == 10
    assert dt.minute == 30
    
    # Test parsing without timezone info
    dt_str_no_tz = "2025-04-15T10:30:00"
    dt_no_tz = TimezoneTestUtilities.parse_datetime(dt_str_no_tz)
    assert dt_no_tz.tzinfo is not None  # Should add UTC by default
    
    # Test with dateutil parser format
    dt_str_human = "April 15, 2025 10:30 AM"
    dt_human = TimezoneTestUtilities.parse_datetime(dt_str_human)
    assert dt_human.tzinfo is not None
    assert dt_human.year == 2025
    assert dt_human.month == 4
    assert dt_human.day == 15
    assert dt_human.hour == 10
    assert dt_human.minute == 30


def test_safe_compare():
    """Test safely comparing datetimes across timezones."""
    # Create datetimes in different timezones
    utc_dt = TimezoneTestUtilities.create_datetime(2025, 4, 15, 10, 30, 0, "UTC")
    tokyo_dt = TimezoneTestUtilities.create_datetime(2025, 4, 15, 19, 30, 0, "Asia/Tokyo")
    
    # These should be the same moment in time
    assert TimezoneTestUtilities.safe_compare(utc_dt, tokyo_dt) == 0
    
    # Later time in UTC
    utc_later = utc_dt + timedelta(hours=1)
    assert TimezoneTestUtilities.safe_compare(utc_later, tokyo_dt) == 1
    
    # Earlier time in UTC
    utc_earlier = utc_dt - timedelta(hours=1)
    assert TimezoneTestUtilities.safe_compare(utc_earlier, tokyo_dt) == -1


def test_is_expired():
    """Test checking if a datetime is expired (in the past)."""
    now = TimezoneTestUtilities.utc_now()
    
    # Test with past datetime
    past_dt = now - timedelta(hours=1)
    assert TimezoneTestUtilities.is_expired(past_dt) is True
    
    # Test with future datetime
    future_dt = now + timedelta(hours=1)
    assert TimezoneTestUtilities.is_expired(future_dt) is False
    
    # Test with mixed timezones
    tokyo_past = TimezoneTestUtilities.create_datetime_with_offset(
        offset_hours=-1,
        tz_name="Asia/Tokyo"
    )
    assert TimezoneTestUtilities.is_expired(tokyo_past) is True


def test_is_in_future():
    """Test checking if a datetime is in the future."""
    now = TimezoneTestUtilities.utc_now()
    
    # Test with future datetime
    future_dt = now + timedelta(hours=1)
    assert TimezoneTestUtilities.is_in_future(future_dt) is True
    
    # Test with past datetime
    past_dt = now - timedelta(hours=1)
    assert TimezoneTestUtilities.is_in_future(past_dt) is False
    
    # Test with mixed timezones
    tokyo_future = TimezoneTestUtilities.create_datetime_with_offset(
        offset_hours=1,
        tz_name="Asia/Tokyo"
    )
    assert TimezoneTestUtilities.is_in_future(tokyo_future) is True


def test_format_datetime():
    """Test formatting datetimes with timezone information."""
    dt = TimezoneTestUtilities.create_datetime(2025, 4, 15, 10, 30, 0, "UTC")
    
    # Test default format
    formatted = TimezoneTestUtilities.format_datetime(dt)
    assert "2025-04-15T10:30:00" in formatted
    assert "+0000" in formatted or "Z" in formatted  # Some timezone indicator
    
    # Test custom format
    custom = TimezoneTestUtilities.format_datetime(dt, "%Y/%m/%d %H:%M:%S")
    assert custom == "2025/04/15 10:30:00"


def test_legacy_functions():
    """Test the legacy functions for backward compatibility."""
    # Test create_datetime_in_timezone
    dt = create_datetime_in_timezone(2025, 4, 15, 10, 30, 0, "UTC")
    assert dt.tzinfo is not None
    assert dt.year == 2025
    
    # Test create_future_datetime
    future = create_future_datetime(days=1, hours=2)
    assert TimezoneTestUtilities.is_in_future(future) is True
    
    # Test create_past_datetime
    past = create_past_datetime(days=1, hours=2)
    assert TimezoneTestUtilities.is_expired(past) is True
    
    # Test new helper functions
    now = get_utc_now()
    assert now.tzinfo is not None
    
    naive = datetime(2025, 4, 15)
    aware = ensure_tz_aware(naive)
    assert aware.tzinfo is not None
    
    future = TimezoneTestUtilities.create_future_datetime(hours=1)
    assert is_valid_expiration(future) is True