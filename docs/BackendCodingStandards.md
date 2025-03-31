# Backend Coding Standards

## Overview

This document outlines the coding standards and best practices for backend development in the TAP Integration Platform. Following these standards ensures consistency, maintainability, and quality across the codebase.

## Code Organization

### Directory Structure

```
backend/
├── adapters/                # External service adapters
│   ├── __init__.py
│   ├── adapter_factory.py   # Factory for creating adapters
│   ├── api_adapter.py       # Base API adapter
│   ├── oauth_adapter.py     # OAuth integration
│   ├── s3_connector.py      # S3 storage connector
│   ├── azure_blob_connector.py  # Azure Blob storage connector
│   └── ...
├── core/                    # Core application modules
│   ├── __init__.py
│   ├── auth.py              # Authentication logic
│   ├── config.py            # Configuration management
│   └── config_factory.py    # Configuration factory
├── db/                      # Database models and migration
│   ├── __init__.py
│   ├── base.py              # Base database setup
│   ├── models.py            # SQLAlchemy models
│   ├── migrations/          # Database migrations
│   │   └── ...
│   ├── manage_db.py         # Database management script
│   └── seed_db.py           # Database seeding
├── modules/                 # Feature modules
│   ├── admin/               # Admin operations
│   │   ├── __init__.py
│   │   ├── controller.py    # API endpoints
│   │   ├── models.py        # Pydantic models
│   │   └── service.py       # Business logic
│   ├── earnings/            # Earnings management
│   ├── integrations/        # Integration logic
│   └── users/               # User management
├── utils/                   # Utility functions
│   ├── __init__.py
│   ├── credential_manager.py  # Credential management
│   ├── encryption/          # Encryption utilities
│   │   ├── __init__.py
│   │   ├── crypto.py        # Encryption implementation
│   │   └── model_encryption.py  # Model encryption
│   ├── helpers.py           # General helpers
│   ├── scheduler.py         # Task scheduling
│   └── security/            # Security utilities
│       ├── __init__.py
│       ├── auth_hooks.py    # Authentication hooks
│       └── monitoring.py    # Security monitoring
├── main.py                  # Application entry point
└── requirements.txt         # Dependencies
```

### Module Organization

Each module should be organized with the following structure:

```python
# File structure for a feature module (e.g., users)

# users/__init__.py
from fastapi import APIRouter
from .controller import router

# users/controller.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db.base import get_db
from core.auth import get_current_active_user
from .models import UserCreate, UserResponse
from .service import create_user, get_users

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=list[UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all users"""
    return get_users(db)

# users/models.py
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    
    class Config:
        orm_mode = True

# users/service.py
from sqlalchemy.orm import Session
from db.models import User
from .models import UserCreate
from core.auth import get_password_hash

def create_user(db: Session, user_data: UserCreate):
    """Create a new user"""
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Get all users with pagination"""
    return db.query(User).offset(skip).limit(limit).all()
```

## Python Style Guidelines

### Code Formatting

Follow PEP 8 style guidelines and use the project's linting configuration:

- Use 4 spaces for indentation
- Maximum line length of 88 characters (using Black formatter)
- Use appropriate whitespace
- Follow proper naming conventions

### Naming Conventions

1. **Modules**: lowercase with underscores (e.g., `user_service.py`)
2. **Classes**: CamelCase (e.g., `UserService`)
3. **Functions/Methods**: lowercase with underscores (e.g., `get_user_data`)
4. **Variables**: lowercase with underscores (e.g., `user_data`)
5. **Constants**: UPPERCASE with underscores (e.g., `MAX_LOGIN_ATTEMPTS`)
6. **Private attributes/methods**: prefixed with underscore (e.g., `_internal_method`)

### Type Hints

Use type hints for all function parameters and return types:

```python
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from db.models import User

def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """Get a user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_active_users(
    db: Session, 
    skip: int = 0, 
    limit: int = 100
) -> List[User]:
    """Get active users with pagination"""
    return db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()

def process_user_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Process user data"""
    # Processing logic
    return processed_data
```

### Docstrings

Use Google-style docstrings for all modules, classes, and functions:

```python
def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user in the database.
    
    Args:
        db: Database session
        user_data: User data for creation
        
    Returns:
        The created user object
        
    Raises:
        ValueError: If a user with the same username already exists
    """
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise ValueError(f"User with username '{user_data.username}' already exists")
        
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        id=str(uuid.uuid4()),
        username=user_data.username,
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

### Imports

Organize imports according to the following order:

1. Standard library imports
2. Third-party imports
3. Local application imports

Separate each group with a blank line:

```python
# Standard library imports
import os
import uuid
from datetime import datetime, timedelta
from typing import List, Optional, Dict

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

# Local application imports
from db.base import get_db
from db.models import User
from core.auth import get_current_active_user, get_password_hash
from .models import UserCreate, UserResponse
```

## FastAPI Best Practices

### API Architecture

1. **Resource-based URLs**: Use resource-based URLs for RESTful APIs
2. **HTTP Methods**: Use appropriate HTTP methods (GET, POST, PUT, DELETE)
3. **Status Codes**: Return appropriate HTTP status codes
4. **Response Models**: Define and use Pydantic models for responses
5. **Validation**: Use Pydantic models for request validation

```python
@router.get(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_404_NOT_FOUND: {"description": "User not found"},
        status.HTTP_401_UNAUTHORIZED: {"description": "Not authenticated"}
    }
)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user
```

### Dependency Injection

Use FastAPI's dependency injection system for common dependencies:

```python
# Define dependencies
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Get current user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
        
    return user

# Use dependencies in routes
@router.get("/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information"""
    return current_user
```

### Path Operation Configuration

Use path operation configuration for documentation and response models:

```python
@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
    description="Create a new user with the provided information",
    response_description="The created user",
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "User with this username already exists",
            "content": {
                "application/json": {
                    "example": {"detail": "User with username 'johndoe' already exists"}
                }
            }
        },
        status.HTTP_401_UNAUTHORIZED: {"description": "Not authenticated"},
        status.HTTP_403_FORBIDDEN: {"description": "Not enough permissions"}
    }
)
async def create_user_endpoint(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new user"""
    try:
        return create_user(db, user_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
```

### Error Handling

Implement consistent error handling:

```python
# Global exception handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Handle validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "loc": error["loc"],
            "msg": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Validation error",
            "errors": errors
        }
    )

# Custom exception class
class BusinessLogicException(Exception):
    """Exception for business logic errors"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

# Custom exception handler
@app.exception_handler(BusinessLogicException)
async def business_logic_exception_handler(request, exc):
    """Handle business logic exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.message
        }
    )

# Usage in service layer
def update_user(db: Session, user_id: str, user_data: UserUpdate) -> User:
    """Update a user in the database"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise BusinessLogicException(
            message=f"User with ID '{user_id}' not found",
            status_code=404
        )
        
    # Update user data
    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user
```

## Database Best Practices

### SQLAlchemy Models

Define SQLAlchemy models with appropriate relationships:

```python
from sqlalchemy import Column, String, Boolean, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from enum import Enum as PyEnum

from db.base import Base

class UserRole(str, PyEnum):
    ADMIN = "ADMIN"
    INTEGRATION_MANAGER = "INTEGRATION_MANAGER"
    DATA_MANAGER = "DATA_MANAGER"
    USER = "USER"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(UserRole), default=UserRole.USER)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    integrations = relationship("Integration", back_populates="owner")
    
    def __repr__(self):
        return f"<User {self.username}>"
```

### Migrations with Alembic

Use Alembic for database migrations:

```python
"""Add user roles

Revision ID: a1b2c3d4e5f6
Revises: 98765432abcd
Create Date: 2023-01-15 12:34:56.789012

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'a1b2c3d4e5f6'
down_revision = '98765432abcd'
branch_labels = None
depends_on = None

def upgrade():
    # Create enum type
    user_role = sa.Enum('ADMIN', 'INTEGRATION_MANAGER', 'DATA_MANAGER', 'USER', name='userrole')
    user_role.create(op.get_bind())
    
    # Add column
    op.add_column(
        'users', 
        sa.Column('role', user_role, nullable=False, server_default='USER')
    )
    
    # Add index
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)

def downgrade():
    # Remove index
    op.drop_index(op.f('ix_users_role'), table_name='users')
    
    # Remove column
    op.drop_column('users', 'role')
    
    # Drop enum type
    sa.Enum(name='userrole').drop(op.get_bind())
```

### Query Best Practices

Follow these best practices for database queries:

1. **Use Session Context Manager**:
```python
def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user"""
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        name=user_data.name,
        hashed_password=get_password_hash(user_data.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

2. **Optimize Queries**:
```python
# GOOD - Select only the columns you need
def get_user_emails(db: Session) -> List[str]:
    """Get all user emails"""
    return [user.email for user in db.query(User.email).all()]

# GOOD - Use joins for related data
def get_user_with_integrations(db: Session, user_id: str) -> User:
    """Get user with related integrations"""
    return db.query(User).options(
        selectinload(User.integrations)
    ).filter(User.id == user_id).first()
```

3. **Apply Pagination**:
```python
def get_users_paginated(
    db: Session, 
    skip: int = 0, 
    limit: int = 100
) -> List[User]:
    """Get users with pagination"""
    return db.query(User).offset(skip).limit(limit).all()
```

4. **Use Indexing**:
```python
class User(Base):
    __tablename__ = "users"
    
    # ...
    
    # Create indexes for frequently queried columns
    __table_args__ = (
        Index('ix_users_email_username', 'email', 'username'),
        Index('ix_users_role_active', 'role', 'is_active')
    )
```

5. **Bulk Operations**:
```python
def create_users_bulk(db: Session, user_data_list: List[UserCreate]) -> List[User]:
    """Create multiple users in bulk"""
    db_users = [
        User(
            username=user_data.username,
            email=user_data.email,
            name=user_data.name,
            hashed_password=get_password_hash(user_data.password)
        )
        for user_data in user_data_list
    ]
    db.add_all(db_users)
    db.commit()
    
    # Refresh objects
    for user in db_users:
        db.refresh(user)
        
    return db_users
```

### Data Validation

Use Pydantic for data validation:

```python
from pydantic import BaseModel, EmailStr, validator, constr

class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=50, regex=r'^[a-zA-Z0-9_-]+$')
    email: EmailStr
    name: str
    password: constr(min_length=8)
    
    @validator('username')
    def username_must_be_valid(cls, v):
        if ' ' in v:
            raise ValueError('Username cannot contain spaces')
        return v
    
    @validator('password')
    def password_must_be_strong(cls, v):
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v
```

## Authentication and Authorization

### JWT Authentication

Implement JWT-based authentication:

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Generate password hash"""
    return pwd_context.hash(password)

# Token creation
def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

# Token validation
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
        
    return user

# User authentication
def authenticate_user(db: Session, username: str, password: str):
    """Authenticate user with username and password"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user
```

### Role-Based Access Control (RBAC)

Implement role-based access control:

```python
from enum import Enum
from fastapi import Depends, HTTPException, status
from functools import wraps

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    INTEGRATION_MANAGER = "INTEGRATION_MANAGER"
    DATA_MANAGER = "DATA_MANAGER"
    USER = "USER"

def require_role(required_role: UserRole):
    """Decorator for requiring a specific role"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_active_user), **kwargs):
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new integration"""
    return create_integration_service(db, integration_data, current_user.id)
```

### Multi-Tenant Authorization

Implement tenant-based authorization:

```python
def require_tenant_access(tenant_id_param: str = "tenant_id"):
    """Decorator for requiring tenant access"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user: User = Depends(get_current_active_user), **kwargs):
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get users for a specific tenant"""
    return get_users_by_tenant(db, tenant_id)
```

## Security Best Practices

### Input Validation

Validate all inputs using Pydantic models:

```python
from pydantic import BaseModel, EmailStr, validator, constr, Field

class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=50, regex=r'^[a-zA-Z0-9_-]+$')
    email: EmailStr
    name: str
    password: constr(min_length=8)
    role: UserRole = Field(default=UserRole.USER)
    
    @validator('username')
    def username_must_be_valid(cls, v):
        if ' ' in v:
            raise ValueError('Username cannot contain spaces')
        return v
```

### Password Security

Implement secure password handling:

```python
from passlib.context import CryptContext

# Configure password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

# Password reset
def generate_password_reset_token(email: str) -> str:
    """Generate password reset token"""
    expires = datetime.utcnow() + timedelta(hours=24)
    token_data = {"sub": email, "exp": expires, "type": "password_reset"}
    return create_access_token(token_data)

def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify password reset token and return email"""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "password_reset":
            return None
        return payload.get("sub")
    except JWTError:
        return None
```

### Rate Limiting

Implement rate limiting for API endpoints:

```python
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for API rate limiting"""
    
    def __init__(self, app, requests_limit: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.client_requests = {}  # client_id -> [(timestamp, endpoint), ...]
        
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for some paths
        if request.url.path in ["/api/health", "/", "/api/docs", "/api/redoc"]:
            return await call_next(request)
            
        # Get client IP
        client_ip = request.client.host if request.client else "127.0.0.1"
        
        # Check rate limit
        is_limited, requests_remaining, reset_time = self._check_rate_limit(
            client_ip, request.url.path
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
        
    def _check_rate_limit(self, client_id: str, endpoint: str) -> tuple[bool, int, int]:
        """Check if a client is rate limited"""
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
    requests_limit=settings.RATE_LIMIT_REQUESTS,
    window_seconds=settings.RATE_LIMIT_WINDOW
)
```

### Secure Headers

Implement security headers middleware:

```python
@app.middleware("http")
async def add_security_headers(request, call_next):
    """Add security headers to all responses"""
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response
```

### Data Encryption

Implement data encryption for sensitive fields:

```python
from cryptography.fernet import Fernet

# Encryption key management
def get_encryption_key():
    """Get or generate encryption key"""
    key = settings.ENCRYPTION_KEY
    if not key:
        # For development only - production should use a secure stored key
        key = Fernet.generate_key()
    return key

# Initialize encryption
def initialize_encryption():
    """Initialize encryption system"""
    global _cipher
    _cipher = Fernet(get_encryption_key())

# Encrypt data
def encrypt_text(text: str) -> str:
    """Encrypt text data"""
    if not text:
        return None
    return _cipher.encrypt(text.encode()).decode()

# Decrypt data
def decrypt_text(encrypted_text: str) -> str:
    """Decrypt text data"""
    if not encrypted_text:
        return None
    return _cipher.decrypt(encrypted_text.encode()).decode()

# Model encryption mixin
class EncryptedMixin:
    """Mixin for SQLAlchemy models with encrypted fields"""
    
    # List of fields to encrypt
    _encrypted_fields = []
    
    def __setattr__(self, key, value):
        """Encrypt values before setting"""
        if key in self._encrypted_fields and value is not None:
            value = encrypt_text(value)
        super().__setattr__(key, value)
    
    def __getattribute__(self, key):
        """Decrypt values when getting"""
        # Get the attribute normally
        value = super().__getattribute__(key)
        
        # Check if it's an encrypted field
        if key in super().__getattribute__('_encrypted_fields') and value is not None:
            return decrypt_text(value)
            
        return value

# Example usage
class Credential(Base, EncryptedMixin):
    """Credential model with encrypted fields"""
    
    __tablename__ = "credentials"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    username = Column(String, nullable=True)
    password = Column(String, nullable=True)
    api_key = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define encrypted fields
    _encrypted_fields = ['password', 'api_key']
```

## Error Handling

### Global Exception Handlers

Implement global exception handlers:

```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "loc": error["loc"],
            "msg": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "message": "Validation error",
            "errors": errors
        }
    )

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Handle database errors"""
    logger.error(f"Database error: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "Database error occurred",
            "detail": str(exc) if settings.DEBUG_MODE else "An internal database error occurred"
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "message": "An unexpected error occurred",
            "detail": str(exc) if settings.DEBUG_MODE else "An internal server error occurred"
        }
    )
```

### Custom Exceptions

Define custom exceptions for domain-specific errors:

```python
class BaseAppException(Exception):
    """Base exception for application-specific errors"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class ResourceNotFoundException(BaseAppException):
    """Exception for resource not found errors"""
    def __init__(self, resource_type: str, resource_id: str):
        message = f"{resource_type} with ID '{resource_id}' not found"
        super().__init__(message, status_code=404)

class UnauthorizedException(BaseAppException):
    """Exception for authorization errors"""
    def __init__(self, message: str = "Unauthorized access"):
        super().__init__(message, status_code=401)

class ForbiddenException(BaseAppException):
    """Exception for forbidden access errors"""
    def __init__(self, message: str = "Access forbidden"):
        super().__init__(message, status_code=403)

class DuplicateResourceException(BaseAppException):
    """Exception for duplicate resource errors"""
    def __init__(self, resource_type: str, field: str, value: str):
        message = f"{resource_type} with {field} '{value}' already exists"
        super().__init__(message, status_code=409)

# Exception handlers
@app.exception_handler(BaseAppException)
async def app_exception_handler(request: Request, exc: BaseAppException):
    """Handle application-specific exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "message": exc.message
        }
    )

# Usage in service layer
def get_user_by_id(db: Session, user_id: str) -> User:
    """Get a user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ResourceNotFoundException("User", user_id)
    return user

def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user"""
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise DuplicateResourceException("User", "username", user_data.username)
        
    # Create user logic...
```

## Logging

### Logging Configuration

Configure logging based on environment:

```python
import logging
import logging.handlers
import os
import sys
from datetime import datetime

def configure_logging():
    """Configure logging based on settings"""
    log_level = getattr(logging, settings.LOG_LEVEL)
    
    # Create formatter
    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)8s] %(message)s (%(filename)s:%(lineno)s)"
    )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Clear existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    root_logger.addHandler(console_handler)
    
    # Add file handler if LOG_FILE is set
    if settings.LOG_FILE:
        # Create directory if it doesn't exist
        log_dir = os.path.dirname(settings.LOG_FILE)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
            
        # Use rotating file handler
        file_handler = logging.handlers.RotatingFileHandler(
            settings.LOG_FILE,
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(log_level)
        root_logger.addHandler(file_handler)
    
    # Set module-specific log levels
    for module, level in settings.MODULE_LOG_LEVELS.items():
        module_logger = logging.getLogger(module)
        module_logger.setLevel(getattr(logging, level))
    
    # Special debug settings
    if settings.DEBUG_MODE:
        # If in debug mode, enable more verbose logging for specific modules
        critical_modules = [
            "utils.integration_runner", 
            "adapters", 
            "modules.integrations.service"
        ]
        for module in critical_modules:
            module_logger = logging.getLogger(module)
            if module not in settings.MODULE_LOG_LEVELS:  # Don't override explicit settings
                module_logger.setLevel(logging.DEBUG)
    
    # Configure SQLAlchemy logging if enabled
    if settings.ENABLE_SQL_LOGGING:
        logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

### Structured Logging

Implement structured logging for better analysis:

```python
import json
import logging
import uuid
from contextvars import ContextVar
from datetime import datetime
from typing import Optional, Dict, Any

# Context variables for request tracking
request_id_var: ContextVar[str] = ContextVar('request_id', default='')
user_id_var: ContextVar[str] = ContextVar('user_id', default='')
tenant_id_var: ContextVar[str] = ContextVar('tenant_id', default='')

class StructuredLogger:
    """Structured logging helper"""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        
    def _get_context(self) -> Dict[str, Any]:
        """Get current context information"""
        return {
            "request_id": request_id_var.get() or None,
            "user_id": user_id_var.get() or None,
            "tenant_id": tenant_id_var.get() or None,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    def debug(self, message: str, **kwargs):
        """Log debug message with structured context"""
        context = self._get_context()
        context.update(kwargs)
        self.logger.debug(message, extra={"context": context})
        
    def info(self, message: str, **kwargs):
        """Log info message with structured context"""
        context = self._get_context()
        context.update(kwargs)
        self.logger.info(message, extra={"context": context})
        
    def warning(self, message: str, **kwargs):
        """Log warning message with structured context"""
        context = self._get_context()
        context.update(kwargs)
        self.logger.warning(message, extra={"context": context})
        
    def error(self, message: str, exc_info=None, **kwargs):
        """Log error message with structured context"""
        context = self._get_context()
        context.update(kwargs)
        self.logger.error(message, exc_info=exc_info, extra={"context": context})
        
    def critical(self, message: str, exc_info=None, **kwargs):
        """Log critical message with structured context"""
        context = self._get_context()
        context.update(kwargs)
        self.logger.critical(message, exc_info=exc_info, extra={"context": context})

# Request ID middleware
@app.middleware("http")
async def request_tracking_middleware(request: Request, call_next):
    """Add request tracking context"""
    # Generate or extract request ID
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request_id_var.set(request_id)
    
    # Extract user and tenant IDs if available
    try:
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if token:
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM],
                options={"verify_signature": False}  # Just decode for logging
            )
            user_id = payload.get("sub")
            tenant_id = payload.get("tenant_id")
            
            if user_id:
                user_id_var.set(user_id)
            if tenant_id:
                tenant_id_var.set(tenant_id)
    except Exception:
        # Ignore errors in extracting IDs
        pass
    
    # Process request
    response = await call_next(request)
    
    # Add request ID to response
    response.headers["X-Request-ID"] = request_id
    
    return response

# Usage
logger = StructuredLogger(__name__)

@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a user by ID"""
    logger.info(
        f"Getting user with ID '{user_id}'",
        operation="get_user",
        target_user_id=user_id
    )
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(
                f"User with ID '{user_id}' not found",
                operation="get_user",
                target_user_id=user_id
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        return user
    except Exception as e:
        logger.error(
            f"Error getting user with ID '{user_id}': {str(e)}",
            operation="get_user",
            target_user_id=user_id,
            exc_info=True
        )
        raise
```

## Testing

### Unit Tests

Write unit tests for core logic:

```python
import pytest
from sqlalchemy.orm import Session
from db.models import User, UserRole
from modules.users.service import create_user, get_user_by_id
from modules.users.models import UserCreate

def test_create_user(db_session: Session):
    """Test creating a user"""
    # Test data
    user_data = UserCreate(
        username="testuser",
        email="test@example.com",
        name="Test User",
        password="Password123",
        role=UserRole.USER
    )
    
    # Create user
    user = create_user(db_session, user_data)
    
    # Verify user was created
    assert user.id is not None
    assert user.username == "testuser"
    assert user.email == "test@example.com"
    assert user.name == "Test User"
    assert user.role == UserRole.USER
    
    # Verify password was hashed
    assert user.hashed_password != "Password123"
    
    # Verify user is in database
    db_user = get_user_by_id(db_session, user.id)
    assert db_user is not None
    assert db_user.username == "testuser"

def test_create_user_duplicate_username(db_session: Session):
    """Test creating a user with duplicate username"""
    # Create first user
    user_data1 = UserCreate(
        username="testuser",
        email="test1@example.com",
        name="Test User 1",
        password="Password123"
    )
    create_user(db_session, user_data1)
    
    # Try to create user with same username
    user_data2 = UserCreate(
        username="testuser",  # Same username
        email="test2@example.com",
        name="Test User 2",
        password="Password123"
    )
    
    # Should raise exception
    with pytest.raises(ValueError) as excinfo:
        create_user(db_session, user_data2)
        
    assert "already exists" in str(excinfo.value)
```

### API Tests

Write API tests with TestClient:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_user_api(db_session, admin_token):
    """Test create user API endpoint"""
    # Test data
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "name": "Test User",
        "password": "Password123",
        "role": "USER"
    }
    
    # Send request with admin token
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.post("/api/v1/users", json=user_data, headers=headers)
    
    # Verify response
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert data["role"] == "USER"
    assert "id" in data
    
    # Verify user was created in database
    user = db_session.query(User).filter(User.username == "testuser").first()
    assert user is not None
    assert user.email == "test@example.com"

def test_create_user_api_unauthorized():
    """Test create user API without token"""
    # Test data
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "name": "Test User",
        "password": "Password123"
    }
    
    # Send request without token
    response = client.post("/api/v1/users", json=user_data)
    
    # Verify unauthorized response
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
```

### Fixtures

Create useful test fixtures:

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db.base import Base, get_db
from core.auth import create_access_token
from main import app

@pytest.fixture
def db_engine():
    """Create a SQLAlchemy engine for testing"""
    # Use in-memory SQLite for tests
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    return engine

@pytest.fixture
def db_session(db_engine):
    """Create a SQLAlchemy session for testing"""
    Session = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = Session()
    
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client(db_session):
    """Create a FastAPI TestClient with DB session override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
        
    # Remove override after test
    app.dependency_overrides.clear()

@pytest.fixture
def admin_user(db_session):
    """Create an admin user for testing"""
    from db.models import User, UserRole
    from core.auth import get_password_hash
    import uuid
    
    admin = User(
        id=str(uuid.uuid4()),
        username="admin",
        email="admin@example.com",
        name="Admin User",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    
    return admin

@pytest.fixture
def admin_token(admin_user):
    """Create an admin JWT token for testing"""
    token_data = {
        "sub": admin_user.username,
        "role": admin_user.role.value
    }
    return create_access_token(token_data)
```

### Integration Tests

Write integration tests for complex functionality:

```python
def test_integration_workflow(client, db_session, admin_token):
    """Test complete integration workflow"""
    # Create a user
    user_data = {
        "username": "integrationuser",
        "email": "integration@example.com",
        "name": "Integration User",
        "password": "Password123",
        "role": "INTEGRATION_MANAGER"
    }
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    user_response = client.post("/api/v1/users", json=user_data, headers=headers)
    assert user_response.status_code == 201
    user_id = user_response.json()["id"]
    
    # Create integration
    integration_data = {
        "name": "Test Integration",
        "description": "Test integration description",
        "type": "FILE_TRANSFER",
        "schedule": "0 0 * * *"
    }
    
    integration_response = client.post(
        "/api/v1/integrations", 
        json=integration_data, 
        headers=headers
    )
    assert integration_response.status_code == 201
    integration_id = integration_response.json()["id"]
    
    # Configure source
    source_data = {
        "type": "FILE",
        "config": {
            "storage_type": "S3",
            "bucket": "test-bucket",
            "path": "test-path"
        }
    }
    
    source_response = client.post(
        f"/api/v1/integrations/{integration_id}/source", 
        json=source_data, 
        headers=headers
    )
    assert source_response.status_code == 201
    
    # Configure destination
    destination_data = {
        "type": "DATABASE",
        "config": {
            "connection_id": "test-connection",
            "table": "test_table"
        }
    }
    
    destination_response = client.post(
        f"/api/v1/integrations/{integration_id}/destination", 
        json=destination_data, 
        headers=headers
    )
    assert destination_response.status_code == 201
    
    # Run integration
    run_response = client.post(
        f"/api/v1/integrations/{integration_id}/run", 
        headers=headers
    )
    assert run_response.status_code == 202
    run_id = run_response.json()["run_id"]
    
    # Check run status
    status_response = client.get(
        f"/api/v1/integrations/{integration_id}/runs/{run_id}", 
        headers=headers
    )
    assert status_response.status_code == 200
    assert status_response.json()["status"] in ["queued", "running", "completed"]
```

## Documentation

### Function and Class Documentation

Use Google-style docstrings for all functions and classes:

```python
def process_data(
    data: Dict[str, Any], 
    options: Optional[Dict[str, Any]] = None,
    skip_validation: bool = False
) -> Dict[str, Any]:
    """Process the provided data with the given options.
    
    This function takes raw data and applies transformation and validation
    based on the provided options.
    
    Args:
        data: The raw data to process
        options: Optional configuration for processing
        skip_validation: Whether to skip validation step
        
    Returns:
        The processed data
        
    Raises:
        ValueError: If the data is invalid and validation is enabled
        KeyError: If required fields are missing from the data
        
    Examples:
        >>> process_data({"name": "Test"})
        {"name": "Test", "processed": True}
        
        >>> process_data({"name": "Test"}, {"transform": "uppercase"})
        {"name": "TEST", "processed": True}
    """
    if options is None:
        options = {}
        
    # Apply transformations
    transformed_data = apply_transformations(data, options)
    
    # Validate data
    if not skip_validation:
        validate_data(transformed_data)
        
    # Mark as processed
    transformed_data["processed"] = True
    
    return transformed_data
```

### API Documentation

Use FastAPI's built-in documentation features:

```python
@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
    description="""
    Create a new user with the provided information.
    
    The user will be created with the provided role, or as a regular USER
    if no role is specified. Only administrators can create users with
    elevated privileges.
    
    The password must meet the security requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    """,
    responses={
        status.HTTP_201_CREATED: {
            "description": "User created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "username": "johndoe",
                        "email": "john@example.com",
                        "name": "John Doe",
                        "is_active": True,
                        "role": "USER",
                        "created_at": "2023-01-01T12:00:00Z"
                    }
                }
            }
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Invalid input or conflict",
            "content": {
                "application/json": {
                    "example": {
                        "detail": "User with username 'johndoe' already exists"
                    }
                }
            }
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Not authenticated"
        },
        status.HTTP_403_FORBIDDEN: {
            "description": "Not enough permissions"
        }
    }
)
async def create_user_endpoint(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new user"""
    # Check permissions for creating users with elevated privileges
    if user_data.role != UserRole.USER and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create users with elevated privileges"
        )
        
    try:
        return create_user(db, user_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
```

## Conclusion

This document outlines the backend coding standards for the TAP Integration Platform. Following these standards ensures consistency, maintainability, and quality across the codebase. For more comprehensive guidance, refer to the full development guide.