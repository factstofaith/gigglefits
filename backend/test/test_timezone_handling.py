"""
Timezone handling tests.

This module tests the timezone handling in the invitation workflow.
"""

import pytest
import uuid
from datetime import datetime, timedelta, timezone
import pytz

# Add the backend directory to the path to import test adapters
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
from test_adapters.auth.invitation_adapter import InvitationAdapter, InvitationStatus
from test_adapters.auth.timezone_test_utils import (
    create_datetime_in_timezone,
    create_future_datetime,
    create_past_datetime,
    create_invitation_with_timezone
)
from test_adapters.mock_models import MockInvitation

# Create adapters for testing
invitation_adapter = InvitationAdapter()

# Test data
test_admin_id = "admin-test-123"

@pytest.fixture(autouse=True)
def reset_adapters():
    """Reset adapters before each test."""
    invitation_adapter.reset()
    yield

def test_invitation_creation_with_utc():
    """Test invitation creation with UTC timezone."""
    invitation = create_invitation_with_timezone(
        invitation_adapter=invitation_adapter,
        email="utc@example.com",
        role="USER",
        expiration_hours=24,
        tz_name="UTC"
    )
    
    # Verify timezone is set to UTC
    assert invitation.created_at.tzinfo is not None
    assert invitation.expires_at.tzinfo is not None
    
    # Verify invitation is valid
    assert invitation_adapter.is_valid(invitation.token)

def test_invitation_creation_with_tokyo_timezone():
    """Test invitation creation with Tokyo timezone."""
    invitation = create_invitation_with_timezone(
        invitation_adapter=invitation_adapter,
        email="tokyo@example.com",
        role="USER",
        expiration_hours=24,
        tz_name="Asia/Tokyo"
    )
    
    # Verify timezone is preserved (Tokyo is UTC+9)
    assert invitation.created_at.tzinfo is not None
    assert invitation.expires_at.tzinfo is not None
    assert invitation.created_at.utcoffset().total_seconds() == 9 * 3600
    
    # Verify invitation is valid
    assert invitation_adapter.is_valid(invitation.token)

def test_invitation_creation_with_new_york_timezone():
    """Test invitation creation with New York timezone."""
    invitation = create_invitation_with_timezone(
        invitation_adapter=invitation_adapter,
        email="newyork@example.com",
        role="USER",
        expiration_hours=24,
        tz_name="America/New_York"
    )
    
    # Verify timezone is preserved (New York is UTC-5 or UTC-4 depending on DST)
    assert invitation.created_at.tzinfo is not None
    assert invitation.expires_at.tzinfo is not None
    
    # Offset will be between -5 and -4 hours
    offset_hours = invitation.created_at.utcoffset().total_seconds() / 3600
    assert -5 <= offset_hours <= -4
    
    # Verify invitation is valid
    assert invitation_adapter.is_valid(invitation.token)

def test_invitation_expiration():
    """Test invitation expiration with different timezones."""
    # Create invitation that expired 1 hour ago in Tokyo timezone
    tokyo_invitation = create_invitation_with_timezone(
        invitation_adapter=invitation_adapter,
        email="expired_tokyo@example.com",
        role="USER",
        expiration_hours=-1,  # Negative hours make it in the past
        tz_name="Asia/Tokyo"
    )
    
    # Create invitation that expired 1 hour ago in New York timezone
    ny_invitation = create_invitation_with_timezone(
        invitation_adapter=invitation_adapter,
        email="expired_ny@example.com",
        role="USER",
        expiration_hours=-1,
        tz_name="America/New_York"
    )
    
    # Verify both invitations are expired
    assert not invitation_adapter.is_valid(tokyo_invitation.token)
    assert not invitation_adapter.is_valid(ny_invitation.token)
    
    # Try to accept the expired invitations
    tokyo_result = invitation_adapter.accept_invitation(
        token=tokyo_invitation.token,
        user_data={"name": "Tokyo User", "password": "password123"}
    )
    assert "error" in tokyo_result
    assert "expired" in tokyo_result["error"].lower()
    
    ny_result = invitation_adapter.accept_invitation(
        token=ny_invitation.token,
        user_data={"name": "New York User", "password": "password123"}
    )
    assert "error" in ny_result
    assert "expired" in ny_result["error"].lower()

def test_invitation_future_expiration():
    """Test invitation future expiration with different timezones."""
    # Create invitation that expires in 1 day in Tokyo timezone
    tokyo_invitation = create_invitation_with_timezone(
        invitation_adapter=invitation_adapter,
        email="valid_tokyo@example.com",
        role="USER",
        expiration_hours=24,
        tz_name="Asia/Tokyo"
    )
    
    # Create invitation that expires in 1 day in New York timezone
    ny_invitation = create_invitation_with_timezone(
        invitation_adapter=invitation_adapter,
        email="valid_ny@example.com",
        role="USER",
        expiration_hours=24,
        tz_name="America/New_York"
    )
    
    # Verify both invitations are valid
    assert invitation_adapter.is_valid(tokyo_invitation.token)
    assert invitation_adapter.is_valid(ny_invitation.token)
    
    # Accept the invitations
    tokyo_user = invitation_adapter.accept_invitation(
        token=tokyo_invitation.token,
        user_data={"name": "Valid Tokyo User", "password": "password123"}
    )
    assert hasattr(tokyo_user, "id")
    assert tokyo_user.email == "valid_tokyo@example.com"
    
    ny_user = invitation_adapter.accept_invitation(
        token=ny_invitation.token,
        user_data={"name": "Valid New York User", "password": "password123"}
    )
    assert hasattr(ny_user, "id")
    assert ny_user.email == "valid_ny@example.com"

def test_dst_transition():
    """Test invitation across Daylight Saving Time transition."""
    # This test is more conceptual since we can't easily simulate DST transitions
    # in a test environment, but we can check timezone handling
    
    # Create dates just before and after a DST transition (e.g., March or November)
    # For this example, we'll use Europe/London which has DST changes
    
    # Create invitation that spans a potential DST transition
    invitation = create_invitation_with_timezone(
        invitation_adapter=invitation_adapter,
        email="dst@example.com",
        role="USER",
        expiration_hours=24 * 30,  # 30 days, likely to span a DST transition
        tz_name="Europe/London"
    )
    
    # Verify invitation is valid 
    assert invitation_adapter.is_valid(invitation.token)
    
    # Accept the invitation
    user = invitation_adapter.accept_invitation(
        token=invitation.token,
        user_data={"name": "DST User", "password": "password123"}
    )
    assert hasattr(user, "id")
    assert user.email == "dst@example.com"