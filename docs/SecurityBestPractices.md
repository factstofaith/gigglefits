# Security Best Practices

## Overview

This document outlines the security standards and best practices for the TAP Integration Platform. Following these standards is critical to ensure the application's security and protect sensitive data.

## Table of Contents

1. [Security Principles](#security-principles)
2. [Authentication](#authentication)
3. [Authorization](#authorization)
4. [Data Protection](#data-protection)
5. [Input Validation](#input-validation)
6. [Output Encoding](#output-encoding)
7. [API Security](#api-security)
8. [File Upload Security](#file-upload-security)
9. [Dependency Management](#dependency-management)
10. [Logging and Monitoring](#logging-and-monitoring)
11. [Error Handling](#error-handling)
12. [Security Headers](#security-headers)
13. [Database Security](#database-security)
14. [Infrastructure Security](#infrastructure-security)
15. [Security Testing](#security-testing)
16. [Incident Response](#incident-response)

## Security Principles

### Defense in Depth

Implement multiple layers of security controls:
- Network security (firewalls, VPCs)
- Application security (authentication, authorization)
- Data security (encryption, access controls)
- Infrastructure security (secure configuration, updates)

### Least Privilege

- Grant only the minimum access necessary for a user, process, or system to function
- Regularly review and revoke unnecessary permissions
- Use role-based access control (RBAC) to manage permissions

### Secure by Default

- Start with secure defaults and only enable features as needed
- Disable unused features and services
- Ensure default configurations are secure

### Security During Development

- Consider security requirements from the beginning of the development process
- Include security reviews in code reviews
- Test for security vulnerabilities as part of the normal testing process

## Authentication

### Password Security

#### Password Storage

- Use bcrypt for password hashing
- Use a high cost factor (12+) for bcrypt
- Never store passwords in plaintext or use weak hashing algorithms (MD5, SHA1)

```python
# Backend password hashing with bcrypt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash of the password."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)
```

#### Password Policies

- Enforce strong password requirements:
  - Minimum length of 12 characters
  - Include a mix of uppercase, lowercase, numbers, and special characters
  - Check against common password lists
- Implement account lockout after failed attempts
- Enforce password expiration and history policies

```javascript
// Frontend password validation
function validatePassword(password) {
  const errors = [];
  
  // Check length
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include at least one uppercase letter');
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include at least one lowercase letter');
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    errors.push('Password must include at least one number');
  }
  
  // Check for special characters
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must include at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Multi-Factor Authentication (MFA)

- Implement MFA for all user accounts, especially administrative accounts
- Support TOTP-based authenticators (e.g., Google Authenticator, Authy)
- Provide backup recovery codes for account recovery

```python
# Backend MFA implementation with PyOTP
import pyotp
import qrcode
import io
import base64
from datetime import datetime

def generate_totp_secret():
    """Generate a new TOTP secret."""
    return pyotp.random_base32()

def get_totp_uri(user_email, secret, issuer="TAP Platform"):
    """Generate a TOTP URI for QR code generation."""
    return pyotp.totp.TOTP(secret).provisioning_uri(
        name=user_email,
        issuer_name=issuer
    )

def generate_qr_code(user_email, secret):
    """Generate a QR code for TOTP setup."""
    uri = get_totp_uri(user_email, secret)
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer)
    return base64.b64encode(buffer.getvalue()).decode()

def verify_totp_code(secret, code):
    """Verify a TOTP code."""
    totp = pyotp.TOTP(secret)
    return totp.verify(code)
```

### JWT Authentication

- Use short-lived JWT tokens (15-60 minutes)
- Implement token refresh mechanism
- Include only necessary claims in the token
- Use strong signing keys and algorithms

```python
# Backend JWT implementation
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Create JWT token
def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a new JWT token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Verify JWT token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Verify JWT token and get current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = get_user_by_username(username)
    if user is None:
        raise credentials_exception
        
    return user
```

### Session Management

- Use secure, HttpOnly cookies for session tokens
- Implement proper session timeout and renewal
- Provide session invalidation on logout
- Allow users to view and manage active sessions

```javascript
// Frontend session management
function initializeSession(token, user) {
  // Store token securely
  setSecureCookie('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 1800 // 30 minutes
  });
  
  // Store user info in memory
  sessionStorage.setItem('user', JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }));
  
  // Setup refresh timer
  setupTokenRefresh();
}

function setupTokenRefresh() {
  // Refresh token 1 minute before expiration
  const refreshTime = (30 - 1) * 60 * 1000; // 29 minutes
  
  setTimeout(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include' // Send cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        initializeSession(data.access_token, data.user);
      } else {
        // Force re-login if refresh fails
        logout();
      }
    } catch (error) {
      // Handle error
      console.error('Token refresh failed:', error);
      logout();
    }
  }, refreshTime);
}

function logout() {
  // Clear session data
  document.cookie = 'auth_token=; Max-Age=0; path=/; secure; HttpOnly; SameSite=Strict';
  sessionStorage.removeItem('user');
  
  // Redirect to login
  window.location.href = '/login';
}
```

## Authorization

### Role-Based Access Control (RBAC)

- Define clear roles with specific permissions
- Follow principle of least privilege
- Implement role checks at both frontend and backend
- Regularly audit role assignments

```python
# Backend RBAC implementation
from enum import Enum
from fastapi import Depends, HTTPException, status
from functools import wraps

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    INTEGRATION_MANAGER = "INTEGRATION_MANAGER"
    DATA_MANAGER = "DATA_MANAGER"
    USER = "USER"

def require_role(required_role: UserRole):
    """Decorator for requiring a specific role."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user = Depends(get_current_user), **kwargs):
            if current_user.role != required_role and current_user.role != UserRole.ADMIN:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Operation requires {required_role.value} role"
                )
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Usage
@router.post("/integrations/")
@require_role(UserRole.INTEGRATION_MANAGER)
async def create_integration(
    integration_data: IntegrationCreate,
    current_user = Depends(get_current_user)
):
    """Create a new integration."""
    # Implementation
```

### Multi-Tenant Authorization

- Implement data isolation between tenants
- Validate tenant context for all operations
- Include tenant ID in JWT tokens
- Apply tenant-level authorization checks

```python
# Backend multi-tenant authorization
def require_tenant_access(tenant_id_param: str = "tenant_id"):
    """Decorator for requiring tenant access."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user = Depends(get_current_user), **kwargs):
            tenant_id = kwargs.get(tenant_id_param)
            
            # Admins have access to all tenants
            if current_user.role == UserRole.ADMIN:
                return await func(*args, current_user=current_user, **kwargs)
                
            # Check if user belongs to the requested tenant
            if current_user.tenant_id != tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access to the requested tenant is forbidden"
                )
                
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Usage
@router.get("/tenants/{tenant_id}/users/")
@require_tenant_access()
async def get_tenant_users(
    tenant_id: str,
    current_user = Depends(get_current_user)
):
    """Get users for a specific tenant."""
    # Implementation
```

### API Endpoint Authorization

- Define authorization requirements for each endpoint
- Apply consistent authorization checks
- Document authorization requirements in API documentation
- Test authorization with different roles

```python
# Endpoint authorization matrix
"""
Authorization Matrix for API Endpoints

+--------------------------------+-----------+--------------------+---------------+--------+
| Endpoint                       | Admin     | Integration_Manager| Data_Manager  | User   |
+--------------------------------+-----------+--------------------+---------------+--------+
| /api/v1/users/                 | CRUD      | -                  | -             | -      |
| /api/v1/users/me               | Read      | Read               | Read          | Read   |
| /api/v1/tenants/               | CRUD      | -                  | -             | -      |
| /api/v1/integrations/          | CRUD      | CRUD               | Read          | Read   |
| /api/v1/integrations/{id}/run  | Execute   | Execute            | -             | -      |
| /api/v1/datasets/              | CRUD      | Read               | CRUD          | Read   |
+--------------------------------+-----------+--------------------+---------------+--------+

Legend:
- C: Create, R: Read, U: Update, D: Delete
- Execute: Can execute/run the resource
- -: No access
"""
```

## Data Protection

### Encryption at Rest

- Encrypt sensitive data in the database
- Use field-level encryption for PII and credentials
- Use strong encryption algorithms (e.g., AES-256)
- Properly manage encryption keys

```python
# Backend field-level encryption
from cryptography.fernet import Fernet

# Initialize encryption key
def get_encryption_key():
    """Get or generate encryption key."""
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        # For development only - production should use a secure stored key
        key = Fernet.generate_key()
    return key

# Initialize encryption
def initialize_encryption():
    """Initialize encryption system."""
    global _cipher
    _cipher = Fernet(get_encryption_key())

# Encrypt/decrypt functions
def encrypt_text(text: str) -> str:
    """Encrypt text data."""
    if not text:
        return None
    return _cipher.encrypt(text.encode()).decode()

def decrypt_text(encrypted_text: str) -> str:
    """Decrypt text data."""
    if not encrypted_text:
        return None
    return _cipher.decrypt(encrypted_text.encode()).decode()

# SQLAlchemy model with encrypted fields
class Credential(Base):
    """Credential model with encrypted fields."""
    __tablename__ = "credentials"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    api_key = Column(String, nullable=True)
    
    # Store original values temporarily during encryption/decryption
    _password = None
    _api_key = None
    
    @hybrid_property
    def get_password(self):
        """Get decrypted password."""
        if self._password:
            return self._password
        return decrypt_text(self.password) if self.password else None
    
    @get_password.setter
    def set_password(self, value):
        """Set encrypted password."""
        self._password = value
        self.password = encrypt_text(value) if value else None
    
    @hybrid_property
    def get_api_key(self):
        """Get decrypted API key."""
        if self._api_key:
            return self._api_key
        return decrypt_text(self.api_key) if self.api_key else None
    
    @get_api_key.setter
    def set_api_key(self, value):
        """Set encrypted API key."""
        self._api_key = value
        self.api_key = encrypt_text(value) if value else None
```

### Encryption in Transit

- Use HTTPS for all communications
- Use TLS 1.2+ with strong ciphers
- Implement HSTS (HTTP Strict Transport Security)
- Redirect HTTP to HTTPS

```python
# Backend HTTPS configuration for FastAPI
from fastapi import FastAPI
import uvicorn

app = FastAPI()

# Force HTTPS redirect
@app.middleware("http")
async def force_https(request, call_next):
    """Force HTTPS by redirecting HTTP requests."""
    if request.url.scheme == "http" and not is_development_environment():
        url = request.url.replace(scheme="https")
        return RedirectResponse(url=str(url), status_code=301)
    return await call_next(request)

# Run with HTTPS in production
if __name__ == "__main__":
    if is_production_environment():
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=443,
            ssl_keyfile="/path/to/key.pem",
            ssl_certfile="/path/to/cert.pem",
            ssl_ca_certs="/path/to/ca.pem"
        )
    else:
        uvicorn.run("main:app", host="0.0.0.0", port=8000)
```

### Secure Credential Storage

- Use a credential manager or secure vault (e.g., HashiCorp Vault, AWS Secrets Manager)
- Rotate credentials regularly
- Use environment variables for local development
- Never hardcode credentials in source code

```python
# Backend credential management
import os
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

class CredentialManager:
    """Secure credential management using Azure Key Vault."""
    
    def __init__(self):
        """Initialize credential manager."""
        self.keyvault_url = os.getenv("KEYVAULT_URL")
        self.credential = DefaultAzureCredential()
        self.client = None
        
        if self.keyvault_url:
            self.client = SecretClient(
                vault_url=self.keyvault_url,
                credential=self.credential
            )
    
    def get_credential(self, name: str) -> str:
        """Get a credential from the vault or environment."""
        # For production, use Key Vault
        if self.client:
            try:
                return self.client.get_secret(name).value
            except Exception as e:
                logger.error(f"Failed to get credential from Key Vault: {e}")
                # Fall back to environment variables
        
        # For development or as fallback, use environment variables
        env_name = name.upper().replace("-", "_")
        return os.getenv(env_name)
    
    def set_credential(self, name: str, value: str) -> bool:
        """Set a credential in the vault."""
        if not self.client:
            logger.error("Cannot set credential without Key Vault")
            return False
            
        try:
            self.client.set_secret(name, value)
            return True
        except Exception as e:
            logger.error(f"Failed to set credential in Key Vault: {e}")
            return False
```

### PII (Personally Identifiable Information) Handling

- Identify and classify all PII data
- Minimize collection and storage of PII
- Implement data retention policies
- Provide mechanisms for data export and deletion

```python
# PII identification and handling
class PII:
    """PII data classification and handling."""
    
    # Define PII fields
    PII_FIELDS = {
        "users": ["name", "email", "phone", "address"],
        "profiles": ["date_of_birth", "social_security_number", "tax_id"],
        "payment_info": ["credit_card_number", "bank_account_number"]
    }
    
    @staticmethod
    def is_pii_field(table: str, field: str) -> bool:
        """Check if a field contains PII."""
        return table in PII.PII_FIELDS and field in PII.PII_FIELDS[table]
    
    @staticmethod
    def mask_pii(value: str, field_type: str = None) -> str:
        """Mask PII data for display."""
        if not value:
            return value
            
        if field_type == "email":
            parts = value.split("@")
            if len(parts) == 2:
                username = parts[0]
                domain = parts[1]
                masked_username = username[0] + "*" * (len(username) - 2) + username[-1]
                return f"{masked_username}@{domain}"
        elif field_type == "phone":
            return "*" * (len(value) - 4) + value[-4:]
        elif field_type == "credit_card_number":
            return "*" * (len(value) - 4) + value[-4:]
        else:
            # Generic masking
            return value[0] + "*" * (len(value) - 2) + value[-1]
    
    @staticmethod
    def export_user_data(user_id: str) -> dict:
        """Export all user data for GDPR compliance."""
        # Implementation
        
    @staticmethod
    def delete_user_data(user_id: str) -> bool:
        """Delete all user data for GDPR compliance."""
        # Implementation
```

## Input Validation

### Request Validation

- Validate all inputs on the server side
- Use a schema validation library (e.g., Pydantic, Joi)
- Define strict schemas for all requests
- Implement custom validators for complex rules

```python
# Backend request validation with Pydantic
from pydantic import BaseModel, EmailStr, validator, constr, Field

class UserCreate(BaseModel):
    """User creation request model."""
    username: constr(min_length=3, max_length=50, regex=r'^[a-zA-Z0-9_-]+$')
    email: EmailStr
    name: str
    password: constr(min_length=12)
    
    @validator('username')
    def username_must_be_valid(cls, v):
        """Validate username format."""
        if ' ' in v:
            raise ValueError('Username cannot contain spaces')
        return v
    
    @validator('password')
    def password_must_be_strong(cls, v):
        """Validate password strength."""
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c in '!@#$%^&*()_-+=[]{}|;:,.<>?/~`' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v
```

### Input Sanitization

- Sanitize all inputs to prevent injection attacks
- Strip or encode dangerous characters
- Use prepared statements for SQL queries
- Validate input against a whitelist of allowed values

```python
# Input sanitization for SQL queries
from sqlalchemy import text
from sqlalchemy.orm import Session

def search_users(db: Session, search_term: str):
    """Search users with safe query parameters."""
    # BAD: Vulnerable to SQL injection
    # query = f"SELECT * FROM users WHERE username LIKE '%{search_term}%'"
    # return db.execute(query).fetchall()
    
    # GOOD: Use parameterized queries
    query = text("SELECT * FROM users WHERE username LIKE :search")
    return db.execute(query, {"search": f"%{search_term}%"}).fetchall()
```

### Content Security Policy (CSP)

- Implement a strict CSP to prevent XSS attacks
- Use nonces for inline scripts when necessary
- Monitor CSP violations
- Regularly review and update CSP

```python
# Backend CSP implementation
@app.middleware("http")
async def add_security_headers(request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    
    # Generate a random nonce for inline scripts
    nonce = base64.b64encode(os.urandom(16)).decode('utf-8')
    
    # Set Content Security Policy
    csp = (
        f"default-src 'self'; "
        f"script-src 'self' 'nonce-{nonce}'; "
        f"style-src 'self' 'unsafe-inline'; "
        f"img-src 'self' data:; "
        f"font-src 'self'; "
        f"connect-src 'self'; "
        f"frame-src 'none'; "
        f"object-src 'none'; "
        f"base-uri 'self'; "
        f"form-action 'self'; "
        f"frame-ancestors 'none'; "
        f"report-uri /api/csp-report"
    )
    
    response.headers["Content-Security-Policy"] = csp
    response.headers["X-Content-Security-Policy"] = csp
    
    # Add nonce to response for template engines
    response.headers["X-CSP-Nonce"] = nonce
    
    return response

# CSP violation reporting endpoint
@app.post("/api/csp-report")
async def csp_report(request: Request):
    """Log CSP violations."""
    report = await request.json()
    logger.warning(f"CSP Violation: {report}")
    return {"status": "logged"}
```

## Output Encoding

### HTML Encoding

- Encode all dynamic content rendered in HTML
- Use template engines with automatic encoding
- Apply context-specific encoding (HTML, JavaScript, CSS, URL)
- Never render raw HTML from user inputs

```javascript
// Frontend output encoding with React
// GOOD: React automatically escapes values
function UserProfile({ user }) {
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.bio}</p>
    </div>
  );
}

// BAD: Directly rendering HTML from user input
function UnsafeUserProfile({ user }) {
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <div dangerouslySetInnerHTML={{ __html: user.bio }} />
    </div>
  );
}
```

### JSON Encoding

- Properly serialize and encode JSON responses
- Handle special characters in JSON values
- Set proper content type headers
- Validate JSON structure before sending

```python
# Backend JSON encoding
from fastapi.responses import JSONResponse
from fastapi import HTTPException, status
import json

def sanitize_json_output(data):
    """Sanitize JSON output to prevent XSS in JSON responses."""
    if isinstance(data, dict):
        return {k: sanitize_json_output(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_json_output(v) for v in data]
    elif isinstance(data, str):
        # Escape potentially dangerous characters
        return data.replace("<", "&lt;").replace(">", "&gt;")
    else:
        return data

@app.get("/api/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by ID with sanitized output."""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Sanitize output
    sanitized_user = sanitize_json_output(user.dict())
    
    return JSONResponse(
        content=sanitized_user,
        headers={"Content-Type": "application/json; charset=utf-8"}
    )
```

### URL Encoding

- Encode all parameters in URLs
- Use URL-safe encoding for URL components
- Validate URLs before redirecting
- Use relative URLs where possible

```python
# Backend URL encoding
from urllib.parse import urlencode, urlparse, quote

def build_safe_url(base_url: str, params: dict) -> str:
    """Build a safe URL with encoded parameters."""
    # Validate base URL
    parsed = urlparse(base_url)
    if not parsed.netloc and not base_url.startswith('/'):
        raise ValueError("Invalid base URL")
    
    # Encode query parameters
    query = urlencode(params, doseq=True)
    
    # Combine with base URL
    if '?' in base_url:
        return f"{base_url}&{query}"
    else:
        return f"{base_url}?{query}"

def validate_redirect_url(url: str, allowed_hosts: list = None) -> bool:
    """Validate a redirect URL."""
    if not url:
        return False
    
    # Allow relative URLs
    if url.startswith('/') and not url.startswith('//'):
        return True
    
    # Validate against allowed hosts
    if allowed_hosts:
        parsed = urlparse(url)
        return parsed.netloc in allowed_hosts
    
    return False
```

## API Security

### Rate Limiting

- Implement rate limiting for API endpoints
- Set different limits for different endpoints
- Include rate limit headers in responses
- Implement retry-after for rate limited requests

```python
# Backend rate limiting
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for API rate limiting."""
    
    def __init__(self, app, requests_limit: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.client_requests = {}  # client_id -> [(timestamp, endpoint), ...]
        
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for some paths
        if request.url.path in ["/api/health", "/", "/api/docs", "/api/redoc"]:
            return await call_next(request)
            
        # Get client ID (IP or API key)
        client_id = self._get_client_id(request)
        
        # Check rate limit
        is_limited, requests_remaining, reset_time = self._check_rate_limit(
            client_id, request.url.path
        )
        
        if is_limited:
            # Return 429 Too Many Requests
            content = {
                "detail": f"Rate limit exceeded. Try again in {reset_time} seconds.",
                "status_code": 429
            }
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content=content,
                headers={
                    "Retry-After": str(reset_time),
                    "X-RateLimit-Limit": str(self.requests_limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_time)
                }
            )
            
        # Process the request normally
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.requests_limit)
        response.headers["X-RateLimit-Remaining"] = str(requests_remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)
        
        return response
        
    def _get_client_id(self, request: Request) -> str:
        """Get client ID for rate limiting."""
        # Try to get API key from header
        api_key = request.headers.get("X-API-Key")
        if api_key:
            return f"api_key:{api_key}"
        
        # Fall back to IP address
        return f"ip:{request.client.host}" if request.client else "unknown"
        
    def _check_rate_limit(self, client_id: str, endpoint: str) -> tuple:
        """Check if a client is rate limited."""
        now = time.time()
        
        # Initialize client record if not exists
        if client_id not in self.client_requests:
            self.client_requests[client_id] = []
        
        # Clean up old requests outside the window
        window_start = now - self.window_seconds
        self.client_requests[client_id] = [
            (timestamp, ep) for timestamp, ep in self.client_requests[client_id]
            if timestamp > window_start
        ]
        
        # Count requests in the current window
        request_count = len(self.client_requests[client_id])
        
        # Store current request
        self.client_requests[client_id].append((now, endpoint))
        
        # Check if limit exceeded
        is_limited = request_count >= self.requests_limit
        requests_remaining = max(0, self.requests_limit - request_count)
        
        # Calculate reset time
        if len(self.client_requests[client_id]) > 0:
            oldest = min(timestamp for timestamp, _ in self.client_requests[client_id])
            reset_time = int(oldest + self.window_seconds - now)
        else:
            reset_time = self.window_seconds
            
        return is_limited, requests_remaining, reset_time

# Add middleware to application
app.add_middleware(
    RateLimitMiddleware,
    requests_limit=100,
    window_seconds=60
)
```

### API Authentication

- Use JWT or API keys for authentication
- Implement proper token validation
- Set short token lifetimes and implement refresh
- Include API version in URLs

```python
# Backend API key authentication
from fastapi import Security, HTTPException, status
from fastapi.security.api_key import APIKeyHeader, APIKeyQuery

API_KEY_NAME = "X-API-Key"
API_KEY_QUERY = "api_key"

api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
api_key_query = APIKeyQuery(name=API_KEY_QUERY, auto_error=False)

async def get_api_key(
    api_key_header: str = Security(api_key_header),
    api_key_query: str = Security(api_key_query),
):
    """Get and validate API key from header or query parameter."""
    if api_key_header:
        return validate_api_key(api_key_header)
    elif api_key_query:
        return validate_api_key(api_key_query)
        
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="API key is missing",
        headers={"WWW-Authenticate": "ApiKey"},
    )

def validate_api_key(api_key: str):
    """Validate API key."""
    api_key_db = db.query(ApiKey).filter(ApiKey.key == api_key).first()
    
    if not api_key_db or not api_key_db.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "ApiKey"},
        )
        
    # Update last used timestamp
    api_key_db.last_used = datetime.utcnow()
    db.commit()
    
    return api_key_db

# Usage in API endpoints
@app.get("/api/v1/data", tags=["data"])
async def get_data(api_key = Depends(get_api_key)):
    """Get data with API key authentication."""
    # Implementation
```

### CORS (Cross-Origin Resource Sharing)

- Implement a strict CORS policy
- Only allow necessary origins
- Use specific origins instead of wildcards
- Limit allowed methods and headers

```python
# Backend CORS configuration
from fastapi.middleware.cors import CORSMiddleware

# Define allowed origins
origins = [
    "https://app.example.com",
    "https://admin.example.com",
    "http://localhost:3000"  # Development only
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
    max_age=3600  # 1 hour
)
```

### API Versioning

- Include version in URL path
- Maintain backward compatibility
- Document API changes between versions
- Implement deprecation notices

```python
# Backend API versioning
from fastapi import APIRouter, FastAPI

app = FastAPI()

# v1 API
v1_router = APIRouter(prefix="/api/v1")

@v1_router.get("/users")
async def get_users_v1():
    """Get all users (v1)."""
    # v1 implementation
    
# v2 API
v2_router = APIRouter(prefix="/api/v2")

@v2_router.get("/users")
async def get_users_v2():
    """Get all users (v2) with pagination."""
    # v2 implementation with pagination
    
# Add routers to app
app.include_router(v1_router)
app.include_router(v2_router)
```

## File Upload Security

### Upload Validation

- Validate file size and type
- Use content-type verification
- Scan uploads for malware
- Generate random filenames

```python
# Backend file upload validation
import os
import uuid
import magic
from fastapi import UploadFile, HTTPException, status

async def validate_and_save_file(
    file: UploadFile,
    allowed_types: list = None,
    max_size: int = 10 * 1024 * 1024  # 10MB
) -> str:
    """Validate and save uploaded file."""
    if allowed_types is None:
        allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    
    # Check file size
    await file.seek(0)
    contents = await file.read(max_size + 1)
    size = len(contents)
    
    if size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {max_size / 1024 / 1024}MB"
        )
    
    # Check file type using python-magic
    file_type = magic.from_buffer(contents, mime=True)
    if file_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type {file_type} not allowed. Allowed types: {', '.join(allowed_types)}"
        )
    
    # Generate secure filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    secure_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Save file
    upload_path = os.path.join(UPLOAD_DIR, secure_filename)
    with open(upload_path, "wb") as f:
        f.write(contents)
    
    return secure_filename
```

### Storing and Serving Uploads

- Store uploads outside the web root
- Use a CDN or separate storage service
- Set proper content-type headers
- Implement access controls for downloads

```python
# Backend file serving with access control
from fastapi import Depends, HTTPException, status
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

def verify_file_access(user, file_id):
    """Verify user has access to file."""
    file = db.query(File).filter(File.id == file_id).first()
    
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    # Check user has access to the file
    if file.user_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this file"
        )
    
    return file

@app.get("/api/v1/files/{file_id}")
async def get_file(
    file_id: str,
    current_user = Depends(get_current_user)
):
    """Get file with access control."""
    file = verify_file_access(current_user, file_id)
    
    # Log file access
    log_file_access(current_user.id, file_id)
    
    # Clean up temp file after response is sent
    def cleanup():
        pass
    
    return FileResponse(
        path=os.path.join(UPLOAD_DIR, file.filename),
        filename=file.original_filename,
        media_type=file.content_type,
        background=BackgroundTask(cleanup)
    )
```

### File Storage Integration

- Use secure cloud storage services
- Implement proper authentication for storage
- Set appropriate permissions on files
- Use temporary/signed URLs for downloads

```python
# Backend Azure Blob Storage integration
from azure.storage.blob import BlobServiceClient, BlobSasPermissions, generate_blob_sas
from datetime import datetime, timedelta

class SecureFileStorage:
    """Secure file storage using Azure Blob Storage."""
    
    def __init__(self):
        """Initialize file storage."""
        connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.container_name = os.getenv("AZURE_STORAGE_CONTAINER")
        
        self.blob_service_client = BlobServiceClient.from_connection_string(
            connection_string
        )
        self.container_client = self.blob_service_client.get_container_client(
            self.container_name
        )
    
    async def upload_file(self, file_data: bytes, file_name: str) -> str:
        """Upload file to secure storage."""
        # Generate secure blob name
        secure_name = f"{uuid.uuid4()}-{file_name}"
        
        # Create blob client
        blob_client = self.container_client.get_blob_client(secure_name)
        
        # Upload file
        await blob_client.upload_blob(file_data)
        
        return secure_name
    
    def generate_download_url(self, blob_name: str, expires_in_minutes: int = 15) -> str:
        """Generate temporary download URL."""
        # Create blob client
        blob_client = self.container_client.get_blob_client(blob_name)
        
        # Generate SAS token
        sas_token = generate_blob_sas(
            account_name=blob_client.account_name,
            container_name=self.container_name,
            blob_name=blob_name,
            account_key=os.getenv("AZURE_STORAGE_KEY"),
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(minutes=expires_in_minutes)
        )
        
        # Create URL with SAS token
        return f"{blob_client.url}?{sas_token}"
```

## Dependency Management

### Dependency Scanning

- Regularly scan for vulnerable dependencies
- Use automated tools (e.g., npm audit, safety)
- Set up alerts for new vulnerabilities
- Include dependency scanning in CI/CD

```bash
# Frontend dependency scanning
npm audit --audit-level=high

# Backend dependency scanning
pip install safety
safety check -r requirements.txt
```

### Dependency Updates

- Keep dependencies up to date
- Test updates thoroughly before deployment
- Pin version numbers for stability
- Use lockfiles to ensure consistent installations

```bash
# Frontend dependency updates
npm outdated
npm update

# Backend dependency updates
pip list --outdated
pip install -U <package>
```

### Dependency Pinning

- Pin dependencies to specific versions
- Use version ranges for minor/patch updates only
- Include checksums for package verification
- Use virtual environments and container images

```
# Backend dependency pinning in requirements.txt
fastapi==0.104.1
uvicorn==0.24.0
python-jose==3.3.0
python-multipart==0.0.6
pydantic==2.4.2
typing-extensions==4.8.0
requests==2.31.0

# Frontend dependency pinning in package.json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "axios": "1.3.4"
  }
}
```

## Logging and Monitoring

### Security Logging

- Log security-related events (login, logout, access changes)
- Include relevant context in logs
- Exclude sensitive information from logs
- Ensure logs are tamper-proof

```python
# Backend security logging
import logging
import json
from uuid import uuid4
from datetime import datetime

# Configure secure logger
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)

# Add secure handler
handler = logging.FileHandler("security.log")
handler.setFormatter(
    logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
)
security_logger.addHandler(handler)

def log_security_event(
    event_type: str,
    user_id: str = None,
    username: str = None,
    tenant_id: str = None,
    source_ip: str = None,
    resource_id: str = None,
    resource_type: str = None,
    outcome: str = "success",
    details: dict = None
):
    """Log security event with structured data."""
    event = {
        "event_id": str(uuid4()),
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "outcome": outcome
    }
    
    # Add optional fields if provided
    if user_id:
        event["user_id"] = user_id
    if username:
        event["username"] = username
    if tenant_id:
        event["tenant_id"] = tenant_id
    if source_ip:
        event["source_ip"] = source_ip
    if resource_id:
        event["resource_id"] = resource_id
    if resource_type:
        event["resource_type"] = resource_type
    if details:
        event["details"] = details
    
    # Log event
    security_logger.info(json.dumps(event))
    
    # Also log to central logging service if configured
    try:
        log_to_central_service(event)
    except Exception as e:
        logging.error(f"Failed to log to central service: {e}")

# Usage examples
def log_login_success(request, user_id, username, tenant_id=None):
    """Log successful login."""
    source_ip = request.client.host if request.client else None
    
    log_security_event(
        event_type="USER_LOGIN",
        user_id=user_id,
        username=username,
        tenant_id=tenant_id,
        source_ip=source_ip,
        outcome="success"
    )

def log_login_failure(request, username, reason, auth_method):
    """Log failed login attempt."""
    source_ip = request.client.host if request.client else None
    
    log_security_event(
        event_type="USER_LOGIN",
        username=username,
        source_ip=source_ip,
        outcome="failure",
        details={
            "reason": reason,
            "auth_method": auth_method
        }
    )

def log_permission_change(admin_user, target_user, old_role, new_role):
    """Log permission change."""
    log_security_event(
        event_type="PERMISSION_CHANGE",
        user_id=admin_user.id,
        username=admin_user.username,
        resource_id=target_user.id,
        resource_type="user",
        details={
            "target_username": target_user.username,
            "old_role": old_role,
            "new_role": new_role
        }
    )
```

### Security Monitoring

- Implement real-time security monitoring
- Set up alerts for suspicious activity
- Monitor for brute force attempts
- Track authorization failures

```python
# Backend security monitoring
class SecurityMonitor:
    """Security monitoring and alerting."""
    
    def __init__(self):
        """Initialize security monitor."""
        self.login_attempts = {}  # IP -> [timestamp, ...]
        self.suspicious_ips = set()
        self.authorization_failures = {}  # user_id -> [timestamp, ...]
    
    def check_brute_force(self, ip: str) -> bool:
        """Check for brute force login attempts."""
        now = datetime.utcnow()
        
        # Add attempt
        if ip not in self.login_attempts:
            self.login_attempts[ip] = []
        
        self.login_attempts[ip].append(now)
        
        # Clean up old attempts (older than 10 minutes)
        cutoff = now - timedelta(minutes=10)
        self.login_attempts[ip] = [
            t for t in self.login_attempts[ip] if t > cutoff
        ]
        
        # Check for too many attempts
        if len(self.login_attempts[ip]) >= 5:
            # Mark IP as suspicious
            self.suspicious_ips.add(ip)
            
            # Trigger alert
            self.trigger_alert(
                "BRUTE_FORCE_ATTEMPT",
                {
                    "ip": ip,
                    "attempts": len(self.login_attempts[ip]),
                    "window": "10 minutes"
                }
            )
            
            return True
        
        return False
    
    def check_authorization_failure(self, user_id: str) -> bool:
        """Check for repeated authorization failures."""
        now = datetime.utcnow()
        
        # Add failure
        if user_id not in self.authorization_failures:
            self.authorization_failures[user_id] = []
        
        self.authorization_failures[user_id].append(now)
        
        # Clean up old failures (older than 30 minutes)
        cutoff = now - timedelta(minutes=30)
        self.authorization_failures[user_id] = [
            t for t in self.authorization_failures[user_id] if t > cutoff
        ]
        
        # Check for too many failures
        if len(self.authorization_failures[user_id]) >= 10:
            # Trigger alert
            self.trigger_alert(
                "REPEATED_AUTH_FAILURE",
                {
                    "user_id": user_id,
                    "failures": len(self.authorization_failures[user_id]),
                    "window": "30 minutes"
                }
            )
            
            return True
        
        return False
    
    def trigger_alert(self, alert_type: str, details: dict):
        """Trigger security alert."""
        # Log alert
        logging.warning(f"SECURITY ALERT: {alert_type} - {details}")
        
        # Send notification
        try:
            send_security_alert(alert_type, details)
        except Exception as e:
            logging.error(f"Failed to send security alert: {e}")
```

### Audit Trails

- Maintain comprehensive audit trails
- Include who, what, when, where, and status information
- Make audit trails immutable
- Provide audit trail search and reporting

```python
# Backend audit trail
from sqlalchemy import Column, String, DateTime, JSON
from uuid import uuid4
from datetime import datetime

class AuditLog(Base):
    """Audit log model."""
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    details = Column(JSON, nullable=True)

def create_audit_log(
    db_session,
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: str = None,
    ip_address: str = None,
    details: dict = None
):
    """Create audit log entry."""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        details=details
    )
    
    db_session.add(audit_log)
    db_session.commit()
    
    return audit_log

# Usage
@app.put("/api/v1/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Update user role with audit logging."""
    # Check permissions
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update user roles"
        )
    
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Store original role for audit log
    original_role = user.role
    
    # Update role
    user.role = role_update.role
    db.commit()
    
    # Create audit log
    create_audit_log(
        db,
        user_id=current_user.id,
        action="UPDATE_USER_ROLE",
        resource_type="user",
        resource_id=user_id,
        ip_address=request.client.host if request.client else None,
        details={
            "old_role": original_role.value,
            "new_role": role_update.role.value
        }
    )
    
    return {"message": "User role updated successfully"}
```

## Error Handling

### Secure Error Handling

- Implement custom error pages
- Avoid exposing sensitive information in errors
- Log errors securely
- Provide different error details in development vs. production

```python
# Backend error handling
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

app = FastAPI()

# Configure error logger
error_logger = logging.getLogger("errors")
error_logger.setLevel(logging.ERROR)

# Custom exception class
class AppException(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, status_code: int, log_level: str = "error"):
        self.message = message
        self.status_code = status_code
        self.log_level = log_level
        super().__init__(self.message)

# Global exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.detail
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors."""
    # Log validation errors
    error_logger.warning(
        f"Validation error: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "client_ip": request.client.host if request.client else None
        }
    )
    
    # Create user-friendly error response
    errors = []
    for error in exc.errors():
        errors.append({
            "loc": error["loc"],
            "msg": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message": "Validation error",
            "errors": errors
        }
    )

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle application-specific exceptions."""
    # Log exception
    log_method = getattr(error_logger, exc.log_level)
    log_method(
        f"Application exception: {exc.message}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "client_ip": request.client.host if request.client else None,
            "status_code": exc.status_code
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.message
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions."""
    # Log exception
    error_logger.error(
        f"Unhandled exception: {str(exc)}",
        exc_info=True,
        extra={
            "path": request.url.path,
            "method": request.method,
            "client_ip": request.client.host if request.client else None
        }
    )
    
    # In production, return generic error
    if app.debug:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(exc),
                "traceback": traceback.format_exc()
            }
        )
    else:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "An internal server error occurred"
            }
        )
```

### Development vs. Production Errors

- Configure different error handling for different environments
- Show detailed errors in development
- Show generic errors in production
- Always log full error details

```python
# Configuration-based error detail level
def get_error_detail(error, environment):
    """Get appropriate error detail based on environment."""
    if environment == "development":
        # Return detailed error for development
        return {
            "message": str(error),
            "type": error.__class__.__name__,
            "traceback": traceback.format_exc()
        }
    else:
        # Return generic error for production
        if isinstance(error, AppException):
            # Return user-friendly message for app exceptions
            return {
                "message": error.message
            }
        else:
            # Return generic message for other exceptions
            return {
                "message": "An internal server error occurred"
            }
```

## Security Headers

### HTTP Security Headers

- Implement standard security headers
- Use a security header middleware
- Test headers with security scanners
- Regularly update header policies

```python
# Backend security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    
    # Content-Security-Policy
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self'; "
        "img-src 'self' data:; "
        "font-src 'self'; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "form-action 'self'; "
        "base-uri 'self'; "
        "object-src 'none';"
    )
    
    # X-Content-Type-Options
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # X-Frame-Options
    response.headers["X-Frame-Options"] = "DENY"
    
    # X-XSS-Protection
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    # Strict-Transport-Security
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    # Referrer-Policy
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Permissions-Policy
    response.headers["Permissions-Policy"] = (
        "camera=(), "
        "microphone=(), "
        "geolocation=(), "
        "interest-cohort=()"
    )
    
    return response
```

## Database Security

### SQL Injection Prevention

- Use ORM and parameterized queries
- Validate and sanitize all inputs
- Limit database privileges
- Implement query timeouts

```python
# Backend SQL injection prevention with SQLAlchemy
from sqlalchemy import text
from sqlalchemy.orm import Session

def safe_query(db: Session, user_input: str):
    """Safe query using parameterized query."""
    # BAD: Vulnerable to SQL injection
    # query = f"SELECT * FROM users WHERE username = '{user_input}'"
    # return db.execute(query).all()
    
    # GOOD: Parameterized query
    query = text("SELECT * FROM users WHERE username = :username")
    return db.execute(query, {"username": user_input}).all()
```

### Database Access Control

- Use least privilege principle for database users
- Implement row-level security
- Use separate database users for different components
- Rotate database credentials regularly

```sql
-- PostgreSQL row-level security example
-- Enable row-level security on table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Create policy for tenants
CREATE POLICY tenant_isolation ON tenants
  USING (tenant_id = current_setting('app.tenant_id')::text);

-- Create policy for users
CREATE POLICY user_tenant_isolation ON users
  USING (tenant_id = current_setting('app.tenant_id')::text);
```

### Database Encryption

- Encrypt sensitive columns
- Use database-level encryption
- Implement transparent data encryption
- Secure encryption keys separate from data

```python
# Backend database encryption with SQLAlchemy
from sqlalchemy import event
from sqlalchemy.ext.declarative import declared_attr
from cryptography.fernet import Fernet

# Encryption key manager
class EncryptionManager:
    """Manage encryption for sensitive data."""
    
    def __init__(self, key=None):
        """Initialize encryption manager."""
        if key:
            self.fernet = Fernet(key)
        else:
            # For development only, in production use a secure key store
            self.fernet = Fernet(Fernet.generate_key())
    
    def encrypt(self, text):
        """Encrypt text."""
        if not text:
            return None
        return self.fernet.encrypt(text.encode()).decode()
    
    def decrypt(self, encrypted_text):
        """Decrypt text."""
        if not encrypted_text:
            return None
        return self.fernet.decrypt(encrypted_text.encode()).decode()

# Global encryption manager
encryption_manager = EncryptionManager(os.getenv("ENCRYPTION_KEY"))

# Mixin for encrypted fields
class EncryptedType:
    """SQLAlchemy type for encrypted fields."""
    
    def __init__(self, type_):
        """Initialize encrypted type."""
        self.type = type_
    
    def process_bind_param(self, value, dialect):
        """Encrypt value before saving to database."""
        if value is not None:
            return encryption_manager.encrypt(str(value))
        return None
    
    def process_result_value(self, value, dialect):
        """Decrypt value when loading from database."""
        if value is not None:
            return encryption_manager.decrypt(value)
        return None

# Usage in model
class User(Base):
    """User model with encrypted fields."""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    username = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(EncryptedType(String))  # Encrypted phone number
    ssn = Column(EncryptedType(String))    # Encrypted SSN
```

## Infrastructure Security

### Containerization Security

- Use minimal base images
- Scan container images for vulnerabilities
- Run containers as non-root users
- Implement proper container isolation

```dockerfile
# Secure Dockerfile
FROM python:3.12-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Run application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Network Security

- Implement proper network segmentation
- Use VPC for cloud deployments
- Configure security groups and firewalls
- Limit open ports to the necessary minimum

```terraform
# Terraform network security configuration
resource "aws_security_group" "app_sg" {
  name        = "app-security-group"
  description = "Security group for application servers"
  vpc_id      = aws_vpc.main.id
  
  # Allow HTTP from load balancer security group only
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.lb_sg.id]
  }
  
  # Allow HTTPS from load balancer security group only
  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.lb_sg.id]
  }
  
  # Allow SSH from bastion host only
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }
  
  # Allow outbound internet access
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "app-security-group"
  }
}
```

### Secret Management

- Use a secret manager (e.g., HashiCorp Vault, AWS Secrets Manager)
- Avoid hardcoding secrets in code or config files
- Rotate secrets regularly
- Implement proper access controls for secrets

```python
# Backend secret management with Azure Key Vault
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

class SecretManager:
    """Secret management with Azure Key Vault."""
    
    def __init__(self):
        """Initialize secret manager."""
        vault_url = os.getenv("KEYVAULT_URL")
        self.client = SecretClient(
            vault_url=vault_url,
            credential=DefaultAzureCredential()
        )
    
    def get_secret(self, name):
        """Get secret from Key Vault."""
        try:
            return self.client.get_secret(name).value
        except Exception as e:
            logger.error(f"Failed to get secret {name}: {e}")
            # Fall back to environment variable in development
            if os.getenv("ENVIRONMENT") == "development":
                env_name = name.upper().replace("-", "_")
                return os.getenv(env_name)
            raise
    
    def set_secret(self, name, value):
        """Set secret in Key Vault."""
        try:
            self.client.set_secret(name, value)
            return True
        except Exception as e:
            logger.error(f"Failed to set secret {name}: {e}")
            return False
    
    def delete_secret(self, name):
        """Delete secret from Key Vault."""
        try:
            self.client.begin_delete_secret(name)
            return True
        except Exception as e:
            logger.error(f"Failed to delete secret {name}: {e}")
            return False
```

## Security Testing

### Vulnerability Scanning

- Regularly scan for vulnerabilities
- Use automated scanning tools
- Implement security scanning in CI/CD
- Address vulnerabilities based on risk

```yaml
# GitHub Action for vulnerability scanning
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # Run weekly on Sunday at midnight
    - cron: '0 0 * * 0'

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      # Frontend dependency scanning
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
          
      - name: Install frontend dependencies
        run: cd frontend && npm ci
        
      - name: Run npm audit
        run: cd frontend && npm audit --audit-level=high
      
      # Backend dependency scanning
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
          
      - name: Install backend dependencies
        run: cd backend && pip install -r requirements.txt
        
      - name: Install safety
        run: pip install safety
        
      - name: Run safety check
        run: cd backend && safety check -r requirements.txt
      
      # SAST scanning
      - name: Run Bandit
        uses: ljharb/bandit-action@master
        with:
          path: ./backend
          level: medium
          confidence: medium
          
      # Container scanning
      - name: Build container image
        run: docker build -t app:${{ github.sha }} .
        
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: app:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
          
      # Upload results
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v1
        with:
          sarif_file: 'trivy-results.sarif'
```

### Penetration Testing

- Conduct regular penetration tests
- Use both automated and manual testing
- Test authentication, authorization, and data protection
- Document and address findings

```markdown
# Penetration Testing Checklist

## Authentication Testing
- [ ] Test password policies
- [ ] Test account lockout
- [ ] Test password reset
- [ ] Test multi-factor authentication
- [ ] Test session management

## Authorization Testing
- [ ] Test role-based access control
- [ ] Test tenant isolation
- [ ] Test API endpoint authorization
- [ ] Test object-level permissions

## Input Validation Testing
- [ ] Test form validation
- [ ] Test API input validation
- [ ] Test file upload validation
- [ ] Test SQL injection protection
- [ ] Test XSS protection

## Output Encoding Testing
- [ ] Test HTML encoding
- [ ] Test JSON encoding
- [ ] Test URL encoding
- [ ] Test PDF/document generation

## Encryption Testing
- [ ] Test HTTPS configuration
- [ ] Test encryption at rest
- [ ] Test sensitive data protection
- [ ] Test key management

## API Security Testing
- [ ] Test rate limiting
- [ ] Test authentication/authorization
- [ ] Test input validation
- [ ] Test error handling

## Infrastructure Testing
- [ ] Test container security
- [ ] Test network security
- [ ] Test secret management
- [ ] Test logging and monitoring
```

### Security Code Reviews

- Include security in code reviews
- Use security code review checklists
- Train developers on security best practices
- Implement automated security checks

```markdown
# Security Code Review Checklist

## Authentication & Authorization
- [ ] Proper authentication checks
- [ ] Appropriate authorization controls
- [ ] Secure password handling
- [ ] Session management

## Input Validation
- [ ] All inputs are validated
- [ ] Input validation is comprehensive
- [ ] Whitelist approach is used
- [ ] Custom validators are secure

## Data Protection
- [ ] Sensitive data is encrypted
- [ ] No hardcoded secrets
- [ ] Proper key management
- [ ] Minimal data storage

## Output Encoding
- [ ] Proper HTML encoding
- [ ] Context-specific encoding
- [ ] Safe JSON handling
- [ ] Safe URL construction

## Error Handling
- [ ] No sensitive data in errors
- [ ] Appropriate error messages
- [ ] Secure error logging
- [ ] No debug information in production

## Logging
- [ ] No sensitive data in logs
- [ ] Appropriate log levels
- [ ] Secure log storage
- [ ] Audit logging for sensitive operations

## Dependencies
- [ ] No vulnerable dependencies
- [ ] Proper version pinning
- [ ] Necessary dependencies only
- [ ] Secure dependency sources
```

## Incident Response

### Security Incident Response Plan

- Define incident response procedures
- Assign roles and responsibilities
- Practice incident response
- Document incidents and lessons learned

```markdown
# Security Incident Response Plan

## 1. Preparation
- Security team contact information
- Incident classification criteria
- Communication channels
- Required tools and resources

## 2. Identification
- Monitoring systems
- Indicators of compromise
- Incident logging
- Initial assessment

## 3. Containment
- Isolate affected systems
- Block malicious activity
- Preserve evidence
- Temporary measures

## 4. Eradication
- Remove malicious code
- Fix vulnerabilities
- Apply security patches
- Verify systems are clean

## 5. Recovery
- Restore systems to normal operation
- Verify functionality
- Monitor for recurrence
- Implement additional controls

## 6. Lessons Learned
- Document incident
- Analyze root cause
- Update security controls
- Train staff on findings
```

### Reporting Security Issues

- Provide a security contact
- Implement a responsible disclosure policy
- Acknowledge and address reported issues
- Credit reporters when appropriate

```markdown
# Security Vulnerability Reporting

## How to Report
If you discover a security vulnerability, please report it to us by sending an email to security@example.com. Please include the following information:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any mitigations you've identified

## What to Expect
- We will acknowledge receipt of your report within 24 hours
- We will provide an initial assessment within 3 business days
- We will keep you informed of our progress
- We will notify you when the issue is resolved

## Responsible Disclosure
We ask that you:

- Allow us reasonable time to address the issue before disclosing it publicly
- Do not access or modify data belonging to others
- Do not disrupt our services
- Act in good faith

## Recognition
We believe in acknowledging the contributions of security researchers. With your permission, we will add your name to our security hall of fame.
```

## Conclusion

This document outlines the security standards and best practices for the TAP Integration Platform. Following these standards is critical to ensure the application's security and protect sensitive data. For more comprehensive guidance, refer to the full development guide.