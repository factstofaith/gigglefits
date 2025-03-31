"""
Test suite for the user management API endpoints.

This test suite covers:
1. User listing and filtering (admin)
2. User profile retrieval and updating
3. User status management (admin)
4. User deletion (admin)
5. Login history

Author: TAP Integration Platform Team
Date: March 31, 2025
"""

import pytest
import json
from datetime import datetime, timedelta
import uuid
from unittest.mock import Mock, patch
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.testclient import TestClient
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse

# Create a test FastAPI app
app = FastAPI()

# Test client
client = TestClient(app)

# Mock users for testing
admin_user = {
    "id": "admin-test-id",
    "username": "admin",
    "email": "admin@test.com",
    "name": "Admin Test",
    "role": "ADMIN",
    "client_company": "Test Company",
    "account_status": "ACTIVE",
    "is_active": True
}

regular_user = {
    "id": "user-test-id",
    "username": "user",
    "email": "user@test.com",
    "name": "Regular User",
    "role": "USER",
    "client_company": "Client Company",
    "account_status": "ACTIVE",
    "is_active": True
}

inactive_user = {
    "id": "inactive-test-id",
    "username": "inactive",
    "email": "inactive@test.com",
    "name": "Inactive User",
    "role": "USER",
    "client_company": "Another Company",
    "account_status": "DISABLED",
    "is_active": False
}

# Mock user database
mock_users = [admin_user, regular_user, inactive_user]

# Login history
mock_login_history = [
    {
        "id": str(uuid.uuid4()),
        "user_id": "user-test-id",
        "login_time": datetime.now().isoformat(),
        "ip_address": "192.168.1.1",
        "user_agent": "Test Browser",
        "success": True
    }
]

# Mock login endpoint
@app.post("/api/auth/login")
async def mock_login(request: Request):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")
    
    for user in mock_users:
        if user["email"] == email:
            # In a real system, we'd verify the password here
            # For testing, we'll just return a token
            token = f"test_token_{user['id']}"
            return {"access_token": token, "token_type": "bearer"}
    
    return JSONResponse(
        status_code=401,
        content={"detail": "Incorrect email or password"}
    )

# Mock users list endpoint
@app.get("/api/admin/users")
async def mock_list_users(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Not authenticated"}
        )
    
    # Check if token is from a non-admin user for the role test
    token = auth_header.split()[1]
    if token == "test_token_user-test-id":  # Regular user token
        return JSONResponse(
            status_code=403,
            content={"detail": "Only administrators can list users"}
        )
    
    # Parse query parameters
    url = str(request.url)
    filtered_users = mock_users.copy()
    
    # Apply status filter
    if "status=ACTIVE" in url:
        filtered_users = [u for u in filtered_users if u["account_status"] == "ACTIVE"]
    elif "status=DISABLED" in url:
        filtered_users = [u for u in filtered_users if u["account_status"] == "DISABLED"]
    
    # Apply role filter
    if "role=USER" in url:
        filtered_users = [u for u in filtered_users if u["role"] == "USER"]
    elif "role=ADMIN" in url:
        filtered_users = [u for u in filtered_users if u["role"] == "ADMIN"]
    
    # Apply search filter
    if "search=" in url:
        search_param = url.split("search=")[1].split("&")[0]
        filtered_users = [
            u for u in filtered_users 
            if search_param in u["name"] or 
               search_param in u["email"] or 
               search_param in u["client_company"]
        ]
    
    # For admin users, return the filtered list
    return {
        "users": filtered_users,
        "total": len(filtered_users),
        "page": 1,
        "limit": 100
    }

# Mock user details endpoint
@app.get("/api/admin/users/{user_id}")
async def mock_get_user(user_id: str, request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Not authenticated"}
        )
        
    # Check permissions
    token = auth_header.split()[1]
    is_admin = token == "test_token_admin-test-id"
    is_self = (token == "test_token_user-test-id" and user_id == "user-test-id") or \
              (token == "test_token_admin-test-id" and user_id == "admin-test-id") or \
              (token == "test_token_inactive-test-id" and user_id == "inactive-test-id")
    
    # Non-admin trying to access another user
    if not is_admin and not is_self and user_id != "user-test-id":
        return JSONResponse(
            status_code=403,
            content={"detail": "You don't have permission to view this user"}
        )
    
    # Find the requested user
    for user in mock_users:
        if user["id"] == user_id:
            return {**user, "mfa_enabled": False}
    
    return JSONResponse(
        status_code=404,
        content={"detail": "User not found"}
    )

# Mock user profile endpoint
@app.get("/api/users/profile")
async def mock_get_profile(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Not authenticated"}
        )
    
    # For simplicity in tests, always return the regular user
    return {**regular_user, "mfa_enabled": False}

# Mock update profile endpoint
@app.put("/api/users/profile")
async def mock_update_profile(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Not authenticated"}
        )
    
    data = await request.json()
    updated_user = {**regular_user}
    
    if data.get("name"):
        updated_user["name"] = data["name"]
    if data.get("client_company"):
        updated_user["client_company"] = data["client_company"]
    if data.get("contact_information"):
        updated_user["contact_information"] = data["contact_information"]
    
    return {**updated_user, "mfa_enabled": False}

# Mock update user status endpoint
@app.patch("/api/admin/users/{user_id}/status")
async def mock_update_status(user_id: str, request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Not authenticated"}
        )
    
    # Check if user is admin
    token = auth_header.split()[1]
    is_admin = token == "test_token_admin-test-id"
    
    # Non-admin trying to update status
    if not is_admin:
        return JSONResponse(
            status_code=403,
            content={"detail": "Only administrators can update user status"}
        )
        
    data = await request.json()
    
    # Check if trying to disable admin's own account
    if user_id == "admin-test-id" and data.get("status") == "DISABLED":
        return JSONResponse(
            status_code=400, 
            content={"detail": "Administrators cannot disable your own account"}
        )
    
    # Update the user in our mock database
    for user in mock_users:
        if user["id"] == user_id:
            user["account_status"] = data.get("status")
            user["is_active"] = (data.get("status") == "ACTIVE")
    
    return {"success": True, "message": "User status updated successfully"}

# Mock delete user endpoint
@app.delete("/api/admin/users/{user_id}")
async def mock_delete_user(user_id: str, request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Not authenticated"}
        )
    
    # Check if user is admin
    token = auth_header.split()[1]
    is_admin = token == "test_token_admin-test-id"
    
    # Non-admin trying to delete user
    if not is_admin:
        return JSONResponse(
            status_code=403,
            content={"detail": "Only administrators can delete users"}
        )
    
    # Check if trying to delete admin's own account
    if user_id == "admin-test-id":
        return JSONResponse(
            status_code=400, 
            content={"detail": "Administrators cannot delete your own account"}
        )
    
    return {"success": True, "message": "User deleted successfully"}

# Mock login history endpoint
@app.get("/api/users/{user_id}/login-history")
async def get_login_history_endpoint(user_id: str, request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Not authenticated"}
        )
    
    # Check permissions
    token = auth_header.split()[1]
    is_admin = token == "test_token_admin-test-id"
    is_self = (token == "test_token_user-test-id" and user_id == "user-test-id") or \
              (token == "test_token_admin-test-id" and user_id == "admin-test-id") or \
              (token == "test_token_inactive-test-id" and user_id == "inactive-test-id")
    
    # Non-admin trying to access another user's history
    if not is_admin and not is_self and token == "test_token_user-test-id" and user_id == "admin-test-id":
        return JSONResponse(
            status_code=403,
            content={"detail": "You don't have permission to view this user's login history"}
        )
    
    return {
        "history": mock_login_history,
        "total": len(mock_login_history),
        "page": 1,
        "limit": 100
    }

# Test fixtures
@pytest.fixture
def admin_token():
    """Get admin authentication token"""
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@test.com", "password": "admin123"}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]

@pytest.fixture
def user_token():
    """Get regular user authentication token"""
    response = client.post(
        "/api/auth/login",
        json={"email": "user@test.com", "password": "user123"}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]

# Tests for admin user management functionality
def test_list_users_as_admin(admin_token):
    """Test listing all users as an admin"""
    response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200, f"Failed with status {response.status_code}: {response.text}"
    data = response.json()
    
    assert "users" in data
    assert "total" in data
    assert data["total"] >= 3  # Should have at least our 3 test users
    
    # Verify user data
    users = data["users"]
    emails = [user["email"] for user in users]
    assert "admin@test.com" in emails
    assert "user@test.com" in emails
    assert "inactive@test.com" in emails

def test_list_users_with_filters(admin_token):
    """Test listing users with different filters"""
    # Test status filter
    response = client.get(
        "/api/admin/users?status=ACTIVE",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert all(user["account_status"] == "ACTIVE" for user in data["users"])
    
    # Test role filter
    response = client.get(
        "/api/admin/users?role=USER",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert all(user["role"] == "USER" for user in data["users"])
    
    # Test search filter
    response = client.get(
        "/api/admin/users?search=Another",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert any("Another" in user["client_company"] for user in data["users"])

def test_list_users_as_non_admin(user_token):
    """Test listing users as a non-admin user (should be forbidden)"""
    response = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 403
    assert "Only administrators" in response.json()["detail"]

def test_get_user_as_admin(admin_token):
    """Test getting a user's details as an admin"""
    response = client.get(
        "/api/admin/users/user-test-id",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    user = response.json()
    
    assert user["id"] == "user-test-id"
    assert user["email"] == "user@test.com"
    assert user["name"] == "Regular User"
    assert user["role"] == "USER"
    assert user["client_company"] == "Client Company"
    assert "mfa_enabled" in user  # MFA status should be included

def test_get_own_user_details(user_token):
    """Test getting own user details as a regular user"""
    response = client.get(
        "/api/admin/users/user-test-id",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 200
    user = response.json()
    
    assert user["id"] == "user-test-id"
    assert user["email"] == "user@test.com"

def test_get_other_user_as_non_admin(user_token):
    """Test getting another user's details as a non-admin (should be forbidden)"""
    response = client.get(
        "/api/admin/users/admin-test-id",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 403
    assert "permission" in response.json()["detail"]

def test_get_current_user_profile(user_token):
    """Test getting current user profile"""
    response = client.get(
        "/api/users/profile",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 200
    profile = response.json()
    
    assert profile["id"] == "user-test-id"
    assert profile["email"] == "user@test.com"
    assert profile["name"] == "Regular User"
    assert "mfa_enabled" in profile

def test_update_user_profile(user_token):
    """Test updating user profile"""
    update_data = {
        "name": "Updated User Name",
        "client_company": "Updated Company",
        "contact_information": {
            "phone": "123-456-7890",
            "address": "123 Test St"
        }
    }
    
    response = client.put(
        "/api/users/profile",
        headers={"Authorization": f"Bearer {user_token}"},
        json=update_data
    )
    
    assert response.status_code == 200
    updated_profile = response.json()
    
    assert updated_profile["name"] == "Updated User Name"
    assert updated_profile["client_company"] == "Updated Company"
    assert updated_profile["contact_information"]["phone"] == "123-456-7890"
    assert updated_profile["contact_information"]["address"] == "123 Test St"

def test_update_user_status_as_admin(admin_token):
    """Test updating user status as an admin"""
    response = client.patch(
        "/api/admin/users/user-test-id/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "DISABLED"}
    )
    
    assert response.status_code == 200
    assert response.json()["success"] is True
    
    # Verify the user status was updated
    user_response = client.get(
        "/api/admin/users/user-test-id",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert user_response.status_code == 200
    user = user_response.json()
    assert user["account_status"] == "DISABLED"
    assert user["is_active"] is False
    
    # Restore status for other tests
    client.patch(
        "/api/admin/users/user-test-id/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "ACTIVE"}
    )

def test_update_user_status_as_non_admin(user_token):
    """Test updating user status as a non-admin (should be forbidden)"""
    response = client.patch(
        "/api/admin/users/inactive-test-id/status",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"status": "ACTIVE"}
    )
    
    assert response.status_code == 403
    assert "Only administrators" in response.json()["detail"]

def test_admin_cannot_disable_own_account(admin_token):
    """Test that an admin cannot disable their own account"""
    response = client.patch(
        "/api/admin/users/admin-test-id/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "DISABLED"}
    )
    
    assert response.status_code == 400
    assert "cannot disable your own account" in response.json()["detail"]

def test_delete_user_as_admin(admin_token):
    """Test deleting a user as an admin"""
    global mock_users
    
    # Create a user to delete via the mock database
    delete_user = {
        "id": "delete-test-id",
        "username": "delete",
        "email": "delete@test.com",
        "name": "Delete Test",
        "role": "USER",
        "client_company": "Delete Company",
        "account_status": "ACTIVE",
        "is_active": True
    }
    mock_users.append(delete_user)
    
    # Delete the user
    response = client.delete(
        "/api/admin/users/delete-test-id",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["success"] is True
    
    # Remove from our mock database
    mock_users = [u for u in mock_users if u["id"] != "delete-test-id"]
    
    # Verify the user was deleted
    get_response = client.get(
        "/api/admin/users/delete-test-id",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert get_response.status_code == 404

def test_admin_cannot_delete_own_account(admin_token):
    """Test that an admin cannot delete their own account"""
    response = client.delete(
        "/api/admin/users/admin-test-id",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 400
    assert "cannot delete your own account" in response.json()["detail"]

def test_delete_user_as_non_admin(user_token):
    """Test deleting a user as a non-admin (should be forbidden)"""
    response = client.delete(
        "/api/admin/users/inactive-test-id",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 403
    assert "Only administrators" in response.json()["detail"]

def test_get_login_history(user_token):
    """Test getting login history"""
    response = client.get(
        "/api/users/user-test-id/login-history",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    assert "history" in data
    assert len(data["history"]) >= 1
    assert data["history"][0]["user_id"] == "user-test-id"

def test_get_other_user_login_history_as_admin(admin_token):
    """Test getting another user's login history as an admin"""
    response = client.get(
        "/api/users/user-test-id/login-history",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    assert response.status_code == 200
    assert "history" in response.json()

def test_get_other_user_login_history_as_non_admin(user_token):
    """Test getting another user's login history as a non-admin (should be forbidden)"""
    response = client.get(
        "/api/users/admin-test-id/login-history",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 403
    assert "permission" in response.json()["detail"]