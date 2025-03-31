# Testing Best Practices

## Overview

This document outlines the testing standards and best practices for the TAP Integration Platform. Following these standards ensures consistent, reliable, and maintainable tests across the codebase.

## Table of Contents

1. [General Testing Principles](#general-testing-principles)
2. [Test Categories](#test-categories)
3. [Frontend Testing](#frontend-testing)
   - [Unit Testing with Jest](#unit-testing-with-jest)
   - [Component Testing](#component-testing)
   - [Integration Testing](#integration-testing)
   - [End-to-End Testing with Cypress](#end-to-end-testing-with-cypress)
   - [Accessibility Testing](#accessibility-testing)
4. [Backend Testing](#backend-testing)
   - [Unit Testing with Pytest](#unit-testing-with-pytest)
   - [API Testing](#api-testing)
   - [Integration Testing](#backend-integration-testing)
   - [Database Testing](#database-testing)
5. [Test Organization](#test-organization)
6. [Test Coverage](#test-coverage)
7. [Test Data Management](#test-data-management)
8. [Mocking and Test Doubles](#mocking-and-test-doubles)
9. [Performance Testing](#performance-testing)
10. [Security Testing](#security-testing)
11. [Continuous Integration Testing](#continuous-integration-testing)
12. [Test Documentation](#test-documentation)

## General Testing Principles

### Test Pyramid

Follow the test pyramid approach:
- **Many unit tests**: Fast, focused, test individual functions/components in isolation
- **Some integration tests**: Test interactions between components
- **Few end-to-end tests**: Test complete user flows from UI to database

### Test Characteristics

All tests should be:
- **Independent**: Tests should not depend on each other
- **Repeatable**: Tests should yield the same results every time they run
- **Fast**: Tests should execute quickly to enable fast feedback
- **Focused**: Each test should focus on a specific behavior or use case
- **Readable**: Tests should be easy to understand
- **Maintainable**: Tests should be easy to update as the codebase evolves

### Test-Driven Development

Consider using Test-Driven Development (TDD) when appropriate:
1. Write a failing test for the functionality you want to implement
2. Write the minimal code to make the test pass
3. Refactor the code while keeping the test passing

## Test Categories

### Unit Tests

- Test a single function, class, or component in isolation
- Use mocks for external dependencies
- Fast execution (milliseconds)
- High test coverage (aim for 80%+)

### Integration Tests

- Test interactions between multiple components
- May use real or simulated external dependencies
- Medium execution time (seconds)
- Focus on key integration points

### End-to-End Tests

- Test complete user flows from UI to database
- Use a real or close-to-real environment
- Slower execution (seconds to minutes)
- Focus on critical user journeys

### Acceptance Tests

- Verify that the system meets business requirements
- Written in business language (using Gherkin/Cucumber)
- Focus on user stories and scenarios

### Performance Tests

- Test system performance under load
- Measure response times and resource usage
- Run in a production-like environment

### Security Tests

- Verify that the system is secure
- Test for common vulnerabilities
- Include authentication and authorization tests

## Frontend Testing

### Unit Testing with Jest

Use Jest for unit testing:

```jsx
// Function to test
function sumPositiveNumbers(a, b) {
  if (a < 0 || b < 0) {
    throw new Error('Both numbers must be positive');
  }
  return a + b;
}

// Unit test
describe('sumPositiveNumbers', () => {
  test('adds two positive numbers correctly', () => {
    expect(sumPositiveNumbers(1, 2)).toBe(3);
  });
  
  test('throws error for negative numbers', () => {
    expect(() => sumPositiveNumbers(-1, 2)).toThrow();
    expect(() => sumPositiveNumbers(1, -2)).toThrow();
  });
});
```

#### Jest Best Practices

1. **Test Structure**: Use describe blocks for grouping and test/it for individual tests
2. **Naming**: Use descriptive test names that explain the expected behavior
3. **Assertions**: Use specific matchers for better error messages
4. **Setup/Teardown**: Use beforeEach/afterEach for shared setup and cleanup
5. **Mock Cleanup**: Reset or restore mocks after each test

### Component Testing

Use React Testing Library for component tests:

```jsx
// Component to test
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Component test
import { render, screen, fireEvent } from '@testing-library/react';

describe('Counter', () => {
  test('renders with initial count of 0', () => {
    render(<Counter />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
  
  test('increments when button is clicked', () => {
    render(<Counter />);
    fireEvent.click(screen.getByText('Increment'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
```

#### React Testing Library Best Practices

1. **User-centric**: Test from the user's perspective
2. **Queries**: Prefer getByRole, getByLabelText, or getByText over testids when possible
3. **Async Testing**: Use waitFor or findBy* for asynchronous operations
4. **Events**: Use fireEvent or userEvent for simulating user interactions
5. **Context**: Provide necessary context providers in tests

```jsx
// Testing with context
function renderWithProviders(ui, { providerProps = {}, ...renderOptions } = {}) {
  return render(
    <ThemeProvider {...providerProps}>
      <UserContext.Provider value={{ user: { name: 'Test User' } }}>
        {ui}
      </UserContext.Provider>
    </ThemeProvider>,
    renderOptions
  );
}

test('renders user name from context', () => {
  renderWithProviders(<UserProfile />);
  expect(screen.getByText('Test User')).toBeInTheDocument();
});
```

### Integration Testing

Test interactions between components:

```jsx
// Integration test for form submission
test('form submission updates user profile', async () => {
  // Mock API response
  userService.updateProfile.mockResolvedValue({ success: true });
  
  render(<UserProfileForm />);
  
  // Fill out the form
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'New Name' }
  });
  
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'new.email@example.com' }
  });
  
  // Submit the form
  fireEvent.click(screen.getByText('Save'));
  
  // Wait for submission and verify API call
  await waitFor(() => {
    expect(userService.updateProfile).toHaveBeenCalledWith({
      name: 'New Name',
      email: 'new.email@example.com'
    });
  });
  
  // Verify success message appears
  expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
});
```

### End-to-End Testing with Cypress

Use Cypress for end-to-end testing:

```javascript
// cypress/e2e/login.cy.js
describe('Login Flow', () => {
  beforeEach(() => {
    // Reset database or API state if needed
    cy.visit('/login');
  });
  
  it('logs in successfully with valid credentials', () => {
    cy.get('[data-testid=username]').type('testuser');
    cy.get('[data-testid=password]').type('password123');
    cy.get('[data-testid=login-button]').click();
    
    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Verify user is logged in
    cy.get('[data-testid=user-profile]').should('contain', 'Test User');
  });
  
  it('shows error with invalid credentials', () => {
    cy.get('[data-testid=username]').type('testuser');
    cy.get('[data-testid=password]').type('wrongpassword');
    cy.get('[data-testid=login-button]').click();
    
    // Verify error message
    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('contain', 'Invalid username or password');
    
    // Verify we're still on the login page
    cy.url().should('include', '/login');
  });
});
```

#### Cypress Best Practices

1. **Custom Commands**: Create custom commands for common operations
```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('[data-testid=username]').type(username);
  cy.get('[data-testid=password]').type(password);
  cy.get('[data-testid=login-button]').click();
});

// Usage
cy.login('testuser', 'password123');
```

2. **Data Management**: Use API calls or database fixtures to set up test data
```javascript
// cypress/e2e/user-profile.cy.js
describe('User Profile', () => {
  beforeEach(() => {
    // Set up test data via API
    cy.request('POST', '/api/test/seed', {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
      }
    });
    
    // Log in user
    cy.login('testuser', 'password123');
    cy.visit('/profile');
  });
  
  it('displays user information correctly', () => {
    cy.get('[data-testid=user-name]').should('contain', 'Test User');
    cy.get('[data-testid=user-email]').should('contain', 'test@example.com');
  });
});
```

3. **Test Organization**: Organize tests by features or user flows
```
cypress/
├── e2e/
│   ├── auth/
│   │   ├── login.cy.js
│   │   ├── logout.cy.js
│   │   └── registration.cy.js
│   ├── users/
│   │   ├── profile.cy.js
│   │   └── settings.cy.js
│   └── integrations/
│       ├── create.cy.js
│       └── execute.cy.js
```

4. **Visual Testing**: Use Cypress for visual regression testing
```javascript
// cypress/e2e/visual/login.cy.js
describe('Login Page Visual', () => {
  it('looks correct', () => {
    cy.visit('/login');
    cy.matchImageSnapshot('login-page');
  });
});
```

### Accessibility Testing

Use Jest-Axe for accessibility testing:

```jsx
// src/tests/a11y/button.test.jsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from '../../components/Button';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should have proper ARIA attributes when disabled', async () => {
    const { container } = render(<Button disabled>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
```

## Backend Testing

### Unit Testing with Pytest

Use pytest for backend unit testing:

```python
# Function to test
def calculate_total(items):
    """Calculate total price of items."""
    if not items:
        return 0
    return sum(item.price for item in items)

# Unit test
def test_calculate_total():
    """Test calculate_total function."""
    # Test with empty list
    assert calculate_total([]) == 0
    
    # Test with items
    class Item:
        def __init__(self, price):
            self.price = price
    
    items = [Item(10), Item(20), Item(30)]
    assert calculate_total(items) == 60
```

#### Pytest Best Practices

1. **Test Discovery**: Use standard naming conventions (test_*.py or *_test.py)
2. **Fixtures**: Use fixtures for reusable setup and teardown
```python
@pytest.fixture
def user_fixture():
    """Create a test user."""
    user = User(
        username="testuser",
        email="test@example.com",
        name="Test User"
    )
    user.set_password("password123")
    return user

def test_user_authentication(user_fixture):
    """Test user authentication."""
    assert user_fixture.check_password("password123") is True
    assert user_fixture.check_password("wrongpassword") is False
```

3. **Parametrized Tests**: Use parametrize for testing multiple cases
```python
@pytest.mark.parametrize(
    "email,is_valid",
    [
        ("test@example.com", True),
        ("test.user@example.co.uk", True),
        ("invalid-email", False),
        ("@example.com", False),
    ],
)
def test_email_validation(email, is_valid):
    """Test email validation with multiple examples."""
    assert validate_email(email) is is_valid
```

4. **Test Categories**: Use markers to categorize tests
```python
@pytest.mark.unit
def test_unit_function():
    """Unit test example."""
    pass

@pytest.mark.integration
def test_integration_function():
    """Integration test example."""
    pass
```

5. **Assertion Messages**: Include meaningful messages in assertions
```python
def test_user_creation():
    """Test user creation."""
    user = create_user("testuser", "test@example.com", "password123")
    assert user.username == "testuser", "Username should match the input"
    assert user.email == "test@example.com", "Email should match the input"
    assert user.check_password("password123"), "Password should be set correctly"
```

### API Testing

Test FastAPI endpoints:

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    """Test main endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to TAP Integration Platform API"}

def test_create_user():
    """Test create user endpoint."""
    response = client.post(
        "/api/v1/users/",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123",
            "name": "Test User"
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "id" in data
```

#### API Testing Best Practices

1. **Test Setup**: Use fixtures for test dependencies
```python
@pytest.fixture
def authenticated_client():
    """Create a client with authentication."""
    # Create a test user
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123",
        "name": "Test User"
    }
    client.post("/api/v1/users/", json=user_data)
    
    # Log in and get token
    response = client.post(
        "/token",
        data={"username": "testuser", "password": "password123"},
    )
    token = response.json()["access_token"]
    
    # Create a client with the token
    auth_client = TestClient(app)
    auth_client.headers.update({"Authorization": f"Bearer {token}"})
    
    return auth_client

def test_protected_endpoint(authenticated_client):
    """Test protected endpoint."""
    response = authenticated_client.get("/api/v1/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
```

2. **Test Different Response Codes**: Test success and error cases
```python
def test_get_user():
    """Test get user endpoint."""
    # Test successful case
    response = client.get("/api/v1/users/123")
    assert response.status_code == 200
    
    # Test not found case
    response = client.get("/api/v1/users/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
    
    # Test unauthorized case
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
```

3. **Validate Response Schema**: Verify response structure
```python
def test_user_response_schema():
    """Test user response schema."""
    response = client.get("/api/v1/users/123")
    assert response.status_code == 200
    data = response.json()
    
    # Validate schema
    assert "id" in data
    assert "username" in data
    assert "email" in data
    assert "name" in data
    assert "role" in data
    assert "is_active" in data
    
    # Validate types
    assert isinstance(data["id"], str)
    assert isinstance(data["username"], str)
    assert isinstance(data["email"], str)
    assert isinstance(data["name"], str)
    assert isinstance(data["role"], str)
    assert isinstance(data["is_active"], bool)
```

### Backend Integration Testing

Test interactions between multiple components:

```python
def test_create_and_execute_integration(db_session, admin_user):
    """Test creating and executing an integration."""
    # Create an integration
    integration = create_integration(
        db_session,
        name="Test Integration",
        description="Test integration description",
        user_id=admin_user.id
    )
    
    # Configure source
    source_config = {
        "type": "FILE",
        "config": {
            "storage_type": "S3",
            "bucket": "test-bucket",
            "path": "test-path"
        }
    }
    source = configure_integration_source(db_session, integration.id, source_config)
    
    # Configure destination
    destination_config = {
        "type": "DATABASE",
        "config": {
            "connection_id": "test-connection",
            "table": "test_table"
        }
    }
    destination = configure_integration_destination(
        db_session, integration.id, destination_config
    )
    
    # Execute integration
    run = execute_integration(db_session, integration.id)
    
    # Verify run status
    assert run.status in ["queued", "running", "completed"]
    
    # Wait for completion and check results
    # (This would be more complex in a real test)
    run = get_integration_run(db_session, run.id)
    if run.status == "completed":
        assert run.success_count > 0
        assert run.error_count == 0
```

### Database Testing

Test database models and operations:

```python
def test_user_model(db_session):
    """Test User model operations."""
    # Create a user
    user = User(
        username="testuser",
        email="test@example.com",
        name="Test User",
        hashed_password="hashed_password"
    )
    db_session.add(user)
    db_session.commit()
    
    # Query the user
    db_user = db_session.query(User).filter(User.username == "testuser").first()
    assert db_user is not None
    assert db_user.username == "testuser"
    assert db_user.email == "test@example.com"
    assert db_user.name == "Test User"
    assert db_user.hashed_password == "hashed_password"
    
    # Update the user
    db_user.name = "Updated Name"
    db_session.commit()
    
    # Verify update
    updated_user = db_session.query(User).filter(User.id == user.id).first()
    assert updated_user.name == "Updated Name"
    
    # Delete the user
    db_session.delete(updated_user)
    db_session.commit()
    
    # Verify deletion
    deleted_user = db_session.query(User).filter(User.id == user.id).first()
    assert deleted_user is None
```

#### Database Testing Best Practices

1. **Test Database**: Use a separate test database or in-memory SQLite
```python
@pytest.fixture(scope="session")
def engine():
    """Create a SQLAlchemy engine for testing."""
    # Use in-memory SQLite for tests
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    return engine

@pytest.fixture
def db_session(engine):
    """Create a SQLAlchemy session for testing."""
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = Session()
    
    try:
        yield session
    finally:
        session.rollback()
        session.close()
```

2. **Test Data Setup**: Use fixtures to set up test data
```python
@pytest.fixture
def sample_users(db_session):
    """Create sample users for testing."""
    users = [
        User(
            username=f"user{i}",
            email=f"user{i}@example.com",
            name=f"User {i}",
            hashed_password=f"password{i}"
        )
        for i in range(5)
    ]
    db_session.add_all(users)
    db_session.commit()
    
    yield users
    
    # Clean up (will be handled by session rollback)
```

3. **Transaction Rollback**: Use transactions for isolation and cleanup
```python
def test_query_users(db_session, sample_users):
    """Test querying users."""
    # All tests run in a transaction that will be rolled back
    # No need for explicit cleanup
    
    users = db_session.query(User).all()
    assert len(users) == 5
    
    # Create a new user
    new_user = User(
        username="newuser",
        email="newuser@example.com",
        name="New User",
        hashed_password="newpassword"
    )
    db_session.add(new_user)
    db_session.commit()
    
    # Verify the new user is added
    users = db_session.query(User).all()
    assert len(users) == 6
```

## Test Organization

### Directory Structure

#### Frontend

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── tests/
│       ├── components/
│       │   ├── admin/
│       │   ├── common/
│       │   └── integration/
│       ├── pages/
│       ├── utils/
│       ├── integration/
│       ├── e2e/
│       └── a11y/
├── cypress/
│   ├── e2e/
│   ├── fixtures/
│   └── support/
└── jest.config.js
```

#### Backend

```
backend/
├── modules/
│   ├── admin/
│   ├── users/
│   └── integrations/
└── test/
    ├── conftest.py
    ├── modules/
    │   ├── admin/
    │   ├── users/
    │   └── integrations/
    ├── utils/
    ├── integration/
    └── e2e/
```

### Test File Naming

- **Frontend**: Use `.test.jsx` or `.test.js` suffix
- **Backend**: Use `test_*.py` prefix or `*_test.py` suffix

### Test Grouping

Group tests by feature, component, or module:

```javascript
// frontend/src/tests/components/admin/UserManagement.test.jsx
describe('UserManagement', () => {
  describe('User listing', () => {
    test('displays users correctly', () => {
      // ...
    });
    
    test('shows loading state initially', () => {
      // ...
    });
  });
  
  describe('User filtering', () => {
    test('filters users by name', () => {
      // ...
    });
    
    test('filters users by role', () => {
      // ...
    });
  });
  
  describe('User creation', () => {
    test('opens creation form when button is clicked', () => {
      // ...
    });
    
    test('validates form inputs', () => {
      // ...
    });
    
    test('submits form successfully', () => {
      // ...
    });
  });
});
```

## Test Coverage

### Coverage Goals

- **Unit tests**: 80% coverage for each module
- **Integration tests**: Cover all critical integration points
- **E2E tests**: Cover all critical user flows

### Measuring Coverage

#### Frontend

```bash
# Run tests with coverage
npm run test:coverage

# Generate coverage report
npm run test:coverage:html
```

#### Backend

```bash
# Run tests with coverage
pytest --cov=. --cov-report=xml --cov-report=html
```

### Code Coverage Reporting

Use CI/CD to track code coverage over time:

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      # Frontend tests
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
      - name: Install frontend dependencies
        run: cd frontend && npm ci
      - name: Run frontend tests with coverage
        run: cd frontend && npm run test:coverage
      
      # Backend tests
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install backend dependencies
        run: cd backend && pip install -r requirements.txt
      - name: Run backend tests with coverage
        run: cd backend && pytest --cov=. --cov-report=xml --cov-report=html
      
      # Upload coverage reports
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v1
```

## Test Data Management

### Test Fixtures

Use fixtures to create reusable test data:

#### Frontend

```javascript
// frontend/src/tests/fixtures/users.js
export const sampleUsers = [
  {
    id: 'user1',
    username: 'testuser1',
    email: 'user1@example.com',
    name: 'Test User 1',
    role: 'USER'
  },
  {
    id: 'user2',
    username: 'testuser2',
    email: 'user2@example.com',
    name: 'Test User 2',
    role: 'ADMIN'
  }
];

// Usage in tests
import { sampleUsers } from '../fixtures/users';

test('displays user list correctly', () => {
  // Mock API response
  userService.getUsers.mockResolvedValue(sampleUsers);
  
  render(<UserList />);
  
  // Verify users are displayed
  expect(screen.getByText('Test User 1')).toBeInTheDocument();
  expect(screen.getByText('Test User 2')).toBeInTheDocument();
});
```

#### Backend

```python
# backend/test/conftest.py
@pytest.fixture
def sample_users(db_session):
    """Create sample users for testing."""
    users = [
        User(
            id=f"user{i}",
            username=f"testuser{i}",
            email=f"user{i}@example.com",
            name=f"Test User {i}",
            hashed_password="password_hash",
            role=UserRole.USER if i % 2 == 0 else UserRole.ADMIN
        )
        for i in range(1, 3)
    ]
    db_session.add_all(users)
    db_session.commit()
    
    return users

# Usage in tests
def test_get_users(db_session, sample_users):
    """Test getting all users."""
    users = get_users(db_session)
    assert len(users) == 2
    assert users[0].username == "testuser1"
    assert users[1].username == "testuser2"
```

### Factory Pattern

Use factories to create test data with variations:

#### Frontend

```javascript
// frontend/src/tests/factories/user.js
export function createUser(overrides = {}) {
  return {
    id: 'user-id',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    is_active: true,
    ...overrides
  };
}

// Usage in tests
import { createUser } from '../factories/user';

test('displays admin badge for admin users', () => {
  const adminUser = createUser({ role: 'ADMIN' });
  
  render(<UserCard user={adminUser} />);
  
  expect(screen.getByText('Admin')).toBeInTheDocument();
});

test('does not display admin badge for regular users', () => {
  const regularUser = createUser({ role: 'USER' });
  
  render(<UserCard user={regularUser} />);
  
  expect(screen.queryByText('Admin')).not.toBeInTheDocument();
});
```

#### Backend

```python
# backend/test/factories.py
import uuid
from datetime import datetime

def create_user(db_session, **kwargs):
    """Create a user with default values that can be overridden."""
    defaults = {
        "id": str(uuid.uuid4()),
        "username": f"testuser_{uuid.uuid4().hex[:8]}",
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "name": "Test User",
        "hashed_password": "password_hash",
        "role": UserRole.USER,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    # Override defaults with provided values
    for key, value in kwargs.items():
        defaults[key] = value
    
    user = User(**defaults)
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    return user

# Usage in tests
def test_get_active_users(db_session):
    """Test getting only active users."""
    active_user = create_user(db_session)
    inactive_user = create_user(db_session, is_active=False)
    
    users = get_active_users(db_session)
    
    assert len(users) == 1
    assert users[0].id == active_user.id
```

## Mocking and Test Doubles

### Mocking APIs

#### Frontend

```javascript
// Mock API service
jest.mock('../../services/userService', () => ({
  getUsers: jest.fn(),
  getUser: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn()
}));

import userService from '../../services/userService';

test('loads users on mount', async () => {
  // Set up mock response
  userService.getUsers.mockResolvedValue([
    { id: 'user1', name: 'User 1' },
    { id: 'user2', name: 'User 2' }
  ]);
  
  render(<UserList />);
  
  // Verify loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Wait for users to be loaded
  await waitFor(() => {
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });
  
  // Verify API call
  expect(userService.getUsers).toHaveBeenCalledTimes(1);
});
```

#### Backend

```python
# Mock database models
@pytest.fixture
def mock_db_session(mocker):
    """Create a mock database session."""
    session = mocker.MagicMock()
    session.query.return_value = session
    session.filter.return_value = session
    session.first.return_value = None
    return session

def test_get_user_not_found(mock_db_session):
    """Test getting a user that doesn't exist."""
    mock_db_session.first.return_value = None
    
    with pytest.raises(ResourceNotFoundException):
        get_user_by_id(mock_db_session, "non-existent-id")
    
    # Verify query was called correctly
    mock_db_session.query.assert_called_once_with(User)
    mock_db_session.filter.assert_called_once()

# Mock external services
def test_send_email(mocker):
    """Test sending an email."""
    mock_email_client = mocker.patch('services.email.get_email_client')
    mock_client = mocker.MagicMock()
    mock_email_client.return_value = mock_client
    
    send_email("test@example.com", "Test Subject", "Test Body")
    
    # Verify email was sent
    mock_client.send.assert_called_once_with(
        to="test@example.com",
        subject="Test Subject",
        body="Test Body"
    )
```

### Mock Server

Use mock service worker (MSW) for frontend API mocking:

```javascript
// src/tests/mocks/handlers.js
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' }
      ])
    );
  }),
  
  rest.post('/api/users', (req, res, ctx) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Name and email are required' })
      );
    }
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-user-id',
        name,
        email
      })
    );
  })
];

// src/tests/mocks/server.js
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// src/tests/setup.js
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());
```

## Performance Testing

### Response Time Testing

```javascript
// cypress/e2e/performance/response-time.cy.js
describe('API Response Time', () => {
  it('loads dashboard within acceptable time', () => {
    cy.intercept('/api/dashboard/summary').as('dashboardData');
    
    // Start measuring
    cy.window().then((win) => {
      win.performance.mark('navigation-start');
    });
    
    cy.visit('/dashboard');
    
    // Wait for API response
    cy.wait('@dashboardData').then(({ response }) => {
      expect(response.statusCode).to.equal(200);
      
      // Check response time
      cy.window().then((win) => {
        win.performance.mark('api-response-end');
        win.performance.measure(
          'api-response-time',
          'navigation-start',
          'api-response-end'
        );
        
        const measure = win.performance.getEntriesByName('api-response-time')[0];
        expect(measure.duration).to.be.lessThan(1000); // 1 second max
      });
    });
    
    // Check time to interactive
    cy.get('[data-testid=dashboard-content]').should('be.visible').then(() => {
      cy.window().then((win) => {
        win.performance.mark('content-visible');
        win.performance.measure(
          'time-to-interactive',
          'navigation-start',
          'content-visible'
        );
        
        const measure = win.performance.getEntriesByName('time-to-interactive')[0];
        expect(measure.duration).to.be.lessThan(3000); // 3 seconds max
      });
    });
  });
});
```

### Load Testing

Use k6 for load testing:

```javascript
// load-tests/authentication.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
};

export default function () {
  const payload = JSON.stringify({
    username: `testuser_${__VU}`, // Virtual User number
    password: 'password123',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Login request
  const loginRes = http.post(
    'https://api.example.com/token',
    payload,
    params
  );
  
  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'has access token': (r) => r.json('access_token') !== undefined,
  });
  
  if (loginRes.status === 200) {
    const token = loginRes.json('access_token');
    
    // Make authenticated request
    const userRes = http.get(
      'https://api.example.com/api/v1/users/me',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    check(userRes, {
      'user request status is 200': (r) => r.status === 200,
      'has username': (r) => r.json('username') !== undefined,
    });
  }
  
  sleep(1);
}
```

## Security Testing

### Authentication Testing

```javascript
// cypress/e2e/security/authentication.cy.js
describe('Authentication Security', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  
  it('prevents access to protected pages without login', () => {
    // Try to access protected page
    cy.visit('/dashboard');
    
    // Should be redirected to login
    cy.url().should('include', '/login');
  });
  
  it('locks account after too many failed attempts', () => {
    // Try login with wrong password 5 times
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid=username]').type('testuser');
      cy.get('[data-testid=password]').type('wrongpassword');
      cy.get('[data-testid=login-button]').click();
      
      // Clear fields for next attempt
      cy.get('[data-testid=username]').clear();
      cy.get('[data-testid=password]').clear();
    }
    
    // Try again with correct password
    cy.get('[data-testid=username]').type('testuser');
    cy.get('[data-testid=password]').type('correctpassword');
    cy.get('[data-testid=login-button]').click();
    
    // Should see account locked message
    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('contain', 'Account locked');
  });
  
  it('JWT token is refreshed properly', () => {
    // Login
    cy.get('[data-testid=username]').type('testuser');
    cy.get('[data-testid=password]').type('password123');
    cy.get('[data-testid=login-button]').click();
    
    // Get initial token
    cy.window().then((win) => {
      const initialToken = win.localStorage.getItem('auth_token');
      expect(initialToken).to.not.be.null;
      
      // Wait for token refresh (mock time passing)
      cy.clock();
      cy.tick(14 * 60 * 1000); // 14 minutes
      
      // Visit another page to trigger token refresh
      cy.visit('/profile');
      
      // Check token was refreshed
      const newToken = win.localStorage.getItem('auth_token');
      expect(newToken).to.not.equal(initialToken);
    });
  });
});
```

### Authorization Testing

```javascript
// cypress/e2e/security/authorization.cy.js
describe('Authorization Security', () => {
  it('prevents regular users from accessing admin pages', () => {
    // Login as regular user
    cy.login('regularuser', 'password123');
    
    // Try to access admin page
    cy.visit('/admin/users');
    
    // Should be redirected or shown access denied
    cy.url().should('not.include', '/admin/users');
    cy.get('[data-testid=access-denied]').should('be.visible');
  });
  
  it('prevents users from accessing another tenant\'s data', () => {
    // Login as tenant1 user
    cy.login('tenant1user', 'password123');
    
    // Try to access tenant2's data
    cy.request({
      url: '/api/v1/tenants/tenant2/users',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(403);
    });
  });
  
  it('admin can access all tenants data', () => {
    // Login as admin
    cy.login('admin', 'password123');
    
    // Access tenant1's data
    cy.request('/api/v1/tenants/tenant1/users').then((response) => {
      expect(response.status).to.equal(200);
    });
    
    // Access tenant2's data
    cy.request('/api/v1/tenants/tenant2/users').then((response) => {
      expect(response.status).to.equal(200);
    });
  });
});
```

### Input Validation Testing

```javascript
// cypress/e2e/security/input-validation.cy.js
describe('Input Validation Security', () => {
  beforeEach(() => {
    cy.login('admin', 'password123');
    cy.visit('/admin/users/create');
  });
  
  it('validates email format', () => {
    // Try invalid email
    cy.get('[data-testid=name]').type('Test User');
    cy.get('[data-testid=email]').type('invalid-email');
    cy.get('[data-testid=username]').type('testuser');
    cy.get('[data-testid=password]').type('password123');
    cy.get('[data-testid=submit-button]').click();
    
    // Should show validation error
    cy.get('[data-testid=email-error]')
      .should('be.visible')
      .and('contain', 'Invalid email');
    
    // Form should not submit
    cy.url().should('include', '/admin/users/create');
  });
  
  it('prevents XSS attacks', () => {
    // Try XSS payload
    const xssPayload = '<script>alert("XSS")</script>';
    
    cy.get('[data-testid=name]').type(`Test User ${xssPayload}`);
    cy.get('[data-testid=email]').type('test@example.com');
    cy.get('[data-testid=username]').type('testuser');
    cy.get('[data-testid=password]').type('password123');
    cy.get('[data-testid=submit-button]').click();
    
    // Should create user
    cy.url().should('include', '/admin/users');
    
    // Open created user
    cy.contains('Test User').click();
    
    // XSS should be escaped
    cy.get('body').should('contain', xssPayload);
    cy.get('body').should('not.contain', 'XSS');
  });
  
  it('validates password strength', () => {
    // Try weak password
    cy.get('[data-testid=name]').type('Test User');
    cy.get('[data-testid=email]').type('test@example.com');
    cy.get('[data-testid=username]').type('testuser');
    cy.get('[data-testid=password]').type('weak');
    cy.get('[data-testid=submit-button]').click();
    
    // Should show validation error
    cy.get('[data-testid=password-error]')
      .should('be.visible')
      .and('contain', 'Password must be at least 8 characters');
    
    // Form should not submit
    cy.url().should('include', '/admin/users/create');
  });
});
```

## Continuous Integration Testing

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Lint check
        run: |
          cd frontend
          npm run lint
          
      - name: Type check
        run: |
          cd frontend
          npm run typecheck
          
      - name: Run unit tests
        run: |
          cd frontend
          npm run test:ci
          
      - name: Upload test coverage
        uses: codecov/codecov-action@v1
        with:
          file: ./frontend/coverage/coverage-final.json
          flags: frontend
  
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
          
      - name: Install dependencies
        run: |
          cd backend
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov
          
      - name: Run tests
        run: |
          cd backend
          pytest --cov=. --cov-report=xml
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          
      - name: Upload test coverage
        uses: codecov/codecov-action@v1
        with:
          file: ./backend/coverage.xml
          flags: backend
  
  e2e:
    runs-on: ubuntu-latest
    needs: [frontend, backend]
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Start backend and frontend
        run: |
          # Start backend and frontend services
          docker-compose up -d
          
      - name: Run E2E tests
        run: |
          cd frontend
          npm run cypress:run
          
      - name: Upload Cypress screenshots
        uses: actions/upload-artifact@v2
        if: failure()
        with:
          name: cypress-screenshots
          path: frontend/cypress/screenshots
          
      - name: Upload Cypress videos
        uses: actions/upload-artifact@v2
        with:
          name: cypress-videos
          path: frontend/cypress/videos
```

## Test Documentation

### Test Plan Documentation

Create a comprehensive test plan:

```markdown
# Test Plan for TAP Integration Platform

## 1. Introduction

This test plan outlines the testing approach for the TAP Integration Platform.

## 2. Test Scope

### In Scope
- User management functionality
- Integration creation and execution
- Authentication and authorization
- API endpoints
- UI components
- Performance under expected load

### Out of Scope
- Third-party service integrations (mocked)
- Penetration testing (separate security audit)

## 3. Test Types

### 3.1 Unit Testing
- Test individual functions and components
- Mock external dependencies
- Run on every PR and commit

### 3.2 Integration Testing
- Test interactions between components
- Test database operations
- Run on every PR and commit

### 3.3 End-to-End Testing
- Test complete user flows
- Use Cypress for browser-based testing
- Run on every PR to main branch

### 3.4 Performance Testing
- Test API response times
- Test UI rendering performance
- Run weekly and before releases

### 3.5 Accessibility Testing
- Test compliance with WCAG 2.1 AA
- Test screen reader compatibility
- Run on every PR to main branch

## 4. Test Environment

### 4.1 Development Environment
- Local development machines
- SQLite database for backend testing
- Jest for frontend testing
- Pytest for backend testing

### 4.2 CI Environment
- GitHub Actions
- PostgreSQL database for backend testing
- Headless Chrome for frontend testing
- Cypress for E2E testing

### 4.3 Staging Environment
- AWS infrastructure
- PostgreSQL database
- Real-world data (anonymized)
- Performance testing environment

## 5. Test Schedule

### 5.1 Daily Testing
- Unit tests
- Integration tests
- Code coverage reporting

### 5.2 Weekly Testing
- E2E tests
- Accessibility tests
- Performance baseline tests

### 5.3 Release Testing
- Full test suite
- Performance comparison tests
- Manual verification of critical paths

## 6. Roles and Responsibilities

### 6.1 Developers
- Write unit tests
- Write integration tests
- Fix failing tests

### 6.2 QA Engineers
- Write E2E tests
- Write performance tests
- Verify test coverage

### 6.3 DevOps
- Maintain test infrastructure
- Monitor test execution
- Optimize test performance

## 7. Deliverables

### 7.1 Test Reports
- Unit test coverage reports
- Integration test results
- E2E test videos and screenshots
- Performance test metrics

### 7.2 Test Documentation
- Test plans
- Test cases
- Test procedures
- Bug reports

## 8. Success Criteria

- 80% code coverage for unit tests
- All critical user flows covered by E2E tests
- No P1 or P2 bugs in released software
- Performance metrics within defined thresholds
```

### Test Case Documentation

Document critical test cases:

```markdown
# Test Case: User Creation and Management

## TC-001: Admin creates a new user

### Preconditions
- Admin user is logged in
- Admin has access to user management page

### Steps
1. Navigate to User Management page
2. Click "Add User" button
3. Fill in user details:
   - Name: Test User
   - Email: test@example.com
   - Username: testuser
   - Password: Password123
   - Role: User
4. Click "Create" button

### Expected Results
- User is created successfully
- Success message is displayed
- User appears in the user list
- User can log in with provided credentials

## TC-002: Admin edits an existing user

### Preconditions
- Admin user is logged in
- Test user exists in the system
- Admin has access to user management page

### Steps
1. Navigate to User Management page
2. Find test user in the list
3. Click "Edit" button
4. Change user name to "Updated User"
5. Change user role to "Admin"
6. Click "Save" button

### Expected Results
- User is updated successfully
- Success message is displayed
- User appears in the user list with updated information
- User has new role permissions

## TC-003: Admin deletes a user

### Preconditions
- Admin user is logged in
- Test user exists in the system
- Admin has access to user management page

### Steps
1. Navigate to User Management page
2. Find test user in the list
3. Click "Delete" button
4. Confirm deletion in the confirmation dialog

### Expected Results
- User is deleted successfully
- Success message is displayed
- User no longer appears in the user list
- User cannot log in with their credentials
```

### Test Reports

Generate comprehensive test reports:

```markdown
# Test Execution Report

## Summary

**Test Run ID**: TR-20250327-01
**Test Date**: March 27, 2025
**Environment**: Staging
**Build Version**: 1.0.0-rc.2
**Test Lead**: John Doe

## Test Results Summary

| Test Type | Total | Passed | Failed | Skipped | Success Rate |
|-----------|-------|--------|--------|---------|--------------|
| Unit      | 432   | 425    | 7      | 0       | 98.4%        |
| Integration | 127 | 124    | 3      | 0       | 97.6%        |
| E2E       | 45    | 43     | 2      | 0       | 95.6%        |
| Performance | 12  | 11     | 1      | 0       | 91.7%        |
| Accessibility | 32 | 30    | 2      | 0       | 93.8%        |
| **Total** | **648** | **633** | **15** | **0** | **97.7%** |

## Code Coverage

| Component | Line Coverage | Branch Coverage | Function Coverage |
|-----------|---------------|----------------|-------------------|
| Frontend  | 87.3%         | 78.2%          | 85.9%             |
| Backend   | 92.1%         | 84.5%          | 89.7%             |
| **Overall** | **89.7%**   | **81.4%**      | **87.8%**         |

## Failed Tests

### Unit Tests
1. **UserService.test.js**: `should update user profile` - Expected API call with correct parameters
2. **IntegrationValidator.test.js**: `should validate complex configurations` - Expected validation to fail for invalid config

### Integration Tests
1. **test_integration_execution.py**: `test_execution_with_large_dataset` - Timeout exceeded
2. **test_user_workflow.py**: `test_password_reset_flow` - Email service connection failed

### E2E Tests
1. **integration-creation.cy.js**: `should save integration draft` - Expected confirmation dialog not found
2. **admin-dashboard.cy.js**: `should display correct statistics` - Data mismatch in activity chart

## Performance Metrics

| Test Case | Target Time | Actual Time | Status |
|-----------|-------------|------------|--------|
| Dashboard Load | < 2.0s | 1.87s | PASS |
| User List (100 users) | < 1.0s | 0.92s | PASS |
| Integration Execution | < 5.0s | 7.23s | FAIL |
| Login Flow | < 1.0s | 0.78s | PASS |

## Recommendations

1. **Critical Issues**:
   - Fix integration execution performance issue (IN-345)
   - Resolve email service connection in password reset flow (US-127)

2. **Improvements**:
   - Add more test coverage for dashboard components (currently at 76%)
   - Implement more granular performance testing for integration execution

3. **Next Steps**:
   - Complete fixes for failed tests before release
   - Run full regression test suite after fixes
   - Review performance bottlenecks in integration execution
```

## Test Framework Standardization

### HTML Entity Handling

To ensure consistent handling of HTML entities across all test frameworks:

1. **Problem**: HTML entities like `&apos;`, `&quot;`, `&amp;` in JSX and string literals cause inconsistent parsing issues between Jest and Cypress.

2. **Solution**: Implement standardized transformation of HTML entities:

   #### Jest Implementation
   
   ```javascript
   // Jest Transformer (html-entity-transformer.js)
   const transformHtmlEntities = code => {
     return code
       .replace(/&apos;/g, "'")
       .replace(/&quot;/g, '"')
       .replace(/&amp;/g, '&')
       .replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>');
   };
   
   module.exports = {
     process(sourceText, sourcePath, options) {
       const transformedCode = transformHtmlEntities(sourceText);
       return { code: transformedCode };
     },
   };
   
   // Usage in jest.config.unified.js
   transform: {
     '^.+\\.(js|jsx)$': [
       '<rootDir>/src/tests/transformers/html-entity-transformer.js',
       ['babel-jest', { configFile: './babel.config.js' }]
     ],
   },
   ```
   
   #### Cypress Implementation
   
   ```javascript
   // Cypress HTML Entity Processor
   Cypress.on('test:before:run', (test) => {
     if (test.title.includes('&apos;') || test.title.includes('&quot;')) {
       test.title = test.title
         .replace(/&apos;/g, "'")
         .replace(/&quot;/g, '"')
         .replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>');
     }
   });
   
   // Webpack Loader for Cypress
   module.exports = function (source) {
     return source
       .replace(/&apos;/g, "'")
       .replace(/&quot;/g, '"')
       .replace(/&amp;/g, '&')
       .replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>');
   };
   ```

3. **Benefits**: 
   - Consistent behavior across all test environments
   - No need to manually escape HTML entities in tests
   - Prevents test failures due to inconsistent parsing

### Dependency Management

Properly managing dependencies in test environments is critical:

1. **Version Conflict Resolution**: Use the `resolutions` field in package.json to enforce consistent dependency versions:

   ```json
   "resolutions": {
     "react": "^18.2.0",
     "react-dom": "^18.2.0",
     "react-json-view/react": "^18.2.0",
     "react-json-view/react-dom": "^18.2.0",
     "react-textarea-autosize/react": "^18.2.0",
     "react-base16-styling/react": "^18.2.0"
   }
   ```

2. **Adapter Pattern**: Create adapter components for libraries with specific version requirements:

   ```jsx
   // Example adapter for react-json-view
   const ReactJsonAdapter = (props) => {
     // Component properties with defaults
     const { src, theme = "rjv-default", ...rest } = props;
     
     return (
       <ErrorBoundary fallback={<FallbackJsonViewer src={src} theme={theme} />}>
         <ReactJson src={src} theme={theme} {...rest} />
       </ErrorBoundary>
     );
   };
   ```

3. **Test Framework Alignment**: Ensure all test frameworks use the same dependency versions:

   ```javascript
   // Align Babel configuration
   module.exports = function(api) {
     const isTest = api.env('test');
     
     // Use same configuration for Jest and Cypress
     api.cache(true);
     
     return {
       presets: [
         ['@babel/preset-env', {
           targets: { node: 'current' }
         }],
         '@babel/preset-react'
       ],
       plugins: [
         ['module-resolver', {
           root: ['./src'],
           alias: require('./config/webpack.aliases')
         }]
       ]
     };
   };
   ```

## Conclusion

This document outlines the testing best practices for the TAP Integration Platform. Following these practices ensures consistent, reliable, and maintainable tests across the codebase. For more comprehensive guidance, refer to the full development guide.