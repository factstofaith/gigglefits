# User Invitation System

## Overview

The User Invitation System replaces self-registration with an admin-controlled invitation workflow, enhances security through Multi-Factor Authentication (MFA), and provides administrators with robust user management capabilities.

## Features

- **Invitation-Only Registration**: Admins can send invitations to users who can then create accounts.
- **Multi-Factor Authentication (MFA)**: TOTP-based MFA with QR code setup and recovery codes.
- **Enhanced User Profiles**: Additional fields for business-related information such as Zoho account and client company.
- **Comprehensive User Management**: Admins can list, view, edit, enable/disable, and delete users.
- **Office 365 Email Integration**: Configure and use Office 365 for sending invitation emails.
- **Login Tracking**: Track login attempts and maintain login history.

## Setup

The system setup is handled automatically during application startup if `SETUP_INVITATION_SYSTEM` is set to `true` in the configuration. You can also run the setup script manually:

```bash
python setup_invitation_system.py
```

## API Endpoints

### Invitation Endpoints

- `POST /api/admin/invitations` - Create new invitation
- `GET /api/admin/invitations` - List all invitations
- `GET /api/admin/invitations/{id}` - Get invitation details
- `DELETE /api/admin/invitations/{id}` - Cancel invitation
- `POST /api/admin/invitations/{id}/resend` - Resend invitation email
- `GET /api/invitations/verify/{token}` - Verify invitation token
- `POST /api/invitations/accept` - Accept invitation and create account

### MFA Endpoints

- `POST /api/users/mfa/enroll` - Begin MFA enrollment
- `POST /api/users/mfa/verify` - Verify MFA code
- `GET /api/users/mfa/status` - Get MFA status
- `GET /api/users/mfa/recovery-codes` - Get recovery codes
- `POST /api/users/mfa/recovery-codes/regenerate` - Regenerate recovery codes
- `POST /api/users/mfa/disable` - Disable MFA
- `POST /api/admin/users/{user_id}/mfa/reset` - Reset MFA for a user (admin only)

### User Management Endpoints

- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{user_id}` - Get user details
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile
- `PATCH /api/admin/users/{user_id}/status` - Update user status
- `DELETE /api/admin/users/{user_id}` - Delete user
- `GET /api/users/{user_id}/login-history` - Get login history

### Email Configuration Endpoints

- `GET /api/admin/email/config` - Get email configuration
- `PUT /api/admin/email/config` - Update email configuration
- `POST /api/admin/email/test` - Send test email

### MFA Settings Endpoints

- `GET /api/admin/mfa/settings` - Get MFA settings
- `PUT /api/admin/mfa/settings` - Update MFA settings

## Usage Examples

### Creating an Invitation

```python
# Python example using requests
import requests

response = requests.post(
    "http://localhost:8000/api/admin/invitations",
    json={
        "email": "newuser@example.com",
        "role": "USER",
        "expiration_hours": 48,
        "custom_message": "Welcome to our platform!"
    },
    headers={"Authorization": f"Bearer {access_token}"}
)
print(response.json())
```

### Accepting an Invitation

```python
# Python example using requests
import requests

response = requests.post(
    "http://localhost:8000/api/invitations/accept",
    json={
        "token": "invitation_token_here",
        "name": "John Smith",
        "password": "SecureP@ssw0rd",
        "client_company": "Acme Corporation",
        "zoho_account": "john.smith@acme.com",
        "contact_information": {
            "phone": "(123) 456-7890",
            "position": "IT Director",
            "department": "Information Technology"
        }
    }
)
print(response.json())
```

### Enrolling in MFA

```python
# Python example using requests
import requests

# Step 1: Begin enrollment
response = requests.post(
    "http://localhost:8000/api/users/mfa/enroll",
    headers={"Authorization": f"Bearer {access_token}"}
)
enrollment_data = response.json()
print(f"QR Code: {enrollment_data['qr_code']}")
print(f"Manual Entry Key: {enrollment_data['manual_entry_key']}")

# Step 2: Verify MFA code
response = requests.post(
    "http://localhost:8000/api/users/mfa/verify",
    json={"code": "123456"},  # Code from authenticator app
    headers={"Authorization": f"Bearer {access_token}"}
)
print(response.json())
```

## Security Considerations

- Invitation tokens are single-use and expire after a configurable time period.
- MFA secrets and recovery codes are stored securely.
- Rate limiting is applied to authentication endpoints.
- Login attempts are tracked and can be used to lock accounts.

## Troubleshooting

### Common Issues

1. **Invitation token invalid or expired**: Check that the token is correct and hasn't expired. Admins can resend invitations if needed.

2. **MFA verification failing**: Ensure the time on the authenticator app device is synchronized. Try using a recovery code if available.

3. **Email configuration issues**: Verify Office 365 credentials and connection settings. Use the test email functionality to verify configuration.

## Contributing

When adding features or making changes to the User Invitation System, please:

1. Update the database setup script if you're adding or modifying tables.
2. Add appropriate unit and integration tests.
3. Update this README if you're changing API endpoints or adding major features.