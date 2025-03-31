# Frontend Coding Standards

## Overview

This document outlines the coding standards and best practices for frontend development in the TAP Integration Platform. Following these standards ensures consistency, maintainability, and quality across the codebase.

## Code Organization

### Directory Structure

```
frontend/
├── src/
│   ├── assets/               # Static assets (images, icons, etc.)
│   ├── components/           # Reusable React components
│   │   ├── admin/            # Admin-related components
│   │   ├── common/           # Shared components used across the app
│   │   ├── earnings/         # Earnings-specific components
│   │   ├── integration/      # Integration-related components
│   │   └── ...
│   ├── contexts/             # React context providers
│   ├── design-system/        # Design system adapter and components
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page components (one per route)
│   ├── services/             # API service clients
│   ├── tests/                # Test utilities and setup
│   ├── utils/                # Utility functions and helpers
│   ├── App.jsx               # Main application component
│   ├── AppRoutes.jsx         # Application routes definition
│   ├── config.js             # Application configuration
│   ├── index.js              # Application entry point
│   └── theme.js              # Theme configuration
```

### Component Organization

Each component should be organized with the following structure:

```jsx
// Imports
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Component1, Component2 } from '../design-system/adapter';

// Component
function MyComponent({ prop1, prop2 }) {
  // State hooks
  const [state, setState] = useState(initialState);
  
  // Effect hooks
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup logic
    };
  }, [dependencies]);
  
  // Event handlers
  const handleEvent = () => {
    // Event handling logic
  };
  
  // Helper functions
  const helperFunction = (param) => {
    // Helper logic
    return result;
  };
  
  // Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}

// PropTypes
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

// Default props
MyComponent.defaultProps = {
  prop2: 0
};

// Display name
MyComponent.displayName = 'MyComponent';

// Export
export default MyComponent;
```

## Design System Integration

### Component Imports

Always import UI components through the design system adapter:

```jsx
// CORRECT
import { Button, Card, Typography } from '../design-system/adapter';

// INCORRECT
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
```

### Theme Access

Use the theme provider from the design system:

```jsx
// CORRECT
import { useTheme } from '../design-system/adapter';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <div style={{ color: theme.palette.primary.main }}>
      Themed content
    </div>
  );
}

// INCORRECT
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    color: '#1976d2'  // Hardcoded color
  }
});

function MyComponent() {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      Themed content
    </div>
  );
}
```

### Styling Approaches

Prefer these styling approaches in order of preference:

1. Styled components from the design system
2. The `sx` prop for inline styling
3. Styled components with emotion

```jsx
// APPROACH 1: Using design system styled components
import { Styled.Box } from '../design-system/adapter';

function MyComponent() {
  return (
    <Styled.Box
      padding={2}
      marginBottom={2}
      backgroundColor="primary.light"
    >
      Content
    </Styled.Box>
  );
}

// APPROACH 2: Using sx prop
import { Box } from '../design-system/adapter';

function MyComponent() {
  return (
    <Box
      sx={{
        padding: 2,
        marginBottom: 2,
        backgroundColor: 'primary.light'
      }}
    >
      Content
    </Box>
  );
}

// APPROACH 3: Using styled with emotion
import styled from '@emotion/styled';
import { Box } from '../design-system/adapter';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.light
}));

function MyComponent() {
  return (
    <StyledBox>
      Content
    </StyledBox>
  );
}
```

## React Best Practices

### Functional Components

Always use functional components with hooks instead of class components:

```jsx
// CORRECT
function MyComponent({ name }) {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Hello, {name}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// INCORRECT
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }
  
  render() {
    return (
      <div>
        <h1>Hello, {this.props.name}</h1>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}
```

### Hooks Rules

Follow the Rules of Hooks:

1. Only call hooks at the top level of your component
2. Only call hooks from React functional components or custom hooks
3. Don't call hooks inside loops, conditions, or nested functions

```jsx
// CORRECT
function MyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);
  
  return <div>{count}</div>;
}

// INCORRECT
function MyComponent() {
  const [count, setCount] = useState(0);
  
  if (count > 5) {
    // Error: Hook called inside a condition
    useEffect(() => {
      document.title = `High count: ${count}`;
    }, [count]);
  }
  
  return <div>{count}</div>;
}
```

### Custom Hooks

Extract common stateful logic into custom hooks:

```jsx
// Custom hook
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}

// Usage
function MyComponent() {
  const { width, height } = useWindowSize();
  
  return (
    <div>
      Window size: {width} x {height}
    </div>
  );
}
```

### State Management

Use the appropriate state management approach based on scope:

1. `useState` for component-local state
2. `useReducer` for complex component state
3. React Context for shared state
4. Custom hooks for reusable stateful logic

```jsx
// Local state with useState
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Complex state with useReducer
function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>Increment</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>Decrement</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

### Component Props

Always define prop types for your components:

```jsx
import PropTypes from 'prop-types';

function UserProfile({ name, email, isAdmin }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
      {isAdmin && <p>Administrator</p>}
    </div>
  );
}

UserProfile.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool
};

UserProfile.defaultProps = {
  isAdmin: false
};
```

### Performance Optimization

Use appropriate performance optimization techniques:

1. `React.memo` for pure functional components
2. `useCallback` for event handlers passed as props
3. `useMemo` for expensive calculations
4. Code splitting with `React.lazy` and `Suspense`

```jsx
// Memoized component
const MemoizedComponent = React.memo(function MyComponent({ value }) {
  return <div>{value}</div>;
});

// useCallback for stable event handlers
function ParentComponent() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return <ChildComponent onClick={handleClick} />;
}

// useMemo for expensive calculations
function DataProcessor({ data }) {
  const processedData = useMemo(() => {
    // Expensive calculation
    return data.map(item => expensiveTransformation(item));
  }, [data]);
  
  return <DataVisualization data={processedData} />;
}

// Code splitting with React.lazy
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

## JavaScript Conventions

### ESLint and Prettier

Follow the project's ESLint configuration and Prettier formatting:

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### Naming Conventions

1. **Components**: PascalCase (e.g., `UserProfile`)
2. **Functions**: camelCase (e.g., `fetchUserData`)
3. **Variables**: camelCase (e.g., `userData`)
4. **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
5. **Files**: PascalCase for components (e.g., `UserProfile.jsx`), camelCase for utilities (e.g., `apiClient.js`)

### Destructuring

Use object and array destructuring for cleaner code:

```jsx
// Object destructuring
function UserCard({ name, email, avatar }) {
  return (
    <div>
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}

// Array destructuring
function CounterState() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Async/Await

Prefer async/await over promise chains:

```jsx
// CORRECT
async function fetchUserData() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

// INCORRECT
function fetchUserData() {
  return fetch('/api/users')
    .then(response => response.json())
    .then(data => data)
    .catch(error => {
      console.error('Error fetching user data:', error);
      throw error;
    });
}
```

### String Literals

Use template literals for string interpolation:

```jsx
// CORRECT
const greeting = `Hello, ${user.name}!`;

// INCORRECT
const greeting = 'Hello, ' + user.name + '!';
```

## JSX Best Practices

### JSX String Literals

Use proper JSX string literals instead of HTML entities:

```jsx
// CORRECT
<Button label={'User\'s profile'} />

// INCORRECT
<Button label={'User&apos;s profile'} />
```

### Conditional Rendering

Use ternary operators for simple conditions and logical operators for simple flags:

```jsx
// Ternary operator for two alternatives
function UserStatus({ isActive }) {
  return (
    <span>{isActive ? 'Active' : 'Inactive'}</span>
  );
}

// Logical AND for conditional rendering
function AdminPanel({ isAdmin }) {
  return (
    <div>
      <h2>User Panel</h2>
      {isAdmin && <div>Admin Controls</div>}
    </div>
  );
}

// For complex conditions, extract to separate functions
function RenderUserContent({ user }) {
  const renderContent = () => {
    if (!user) {
      return <div>Please log in</div>;
    }
    
    if (user.isAdmin) {
      return <AdminDashboard user={user} />;
    }
    
    if (user.hasSubscription) {
      return <SubscriberContent user={user} />;
    }
    
    return <BasicContent user={user} />;
  };
  
  return (
    <div className="user-content">
      {renderContent()}
    </div>
  );
}
```

### Lists and Keys

Always use keys when rendering lists:

```jsx
// CORRECT
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}

// INCORRECT - missing keys
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li>{user.name}</li>
      ))}
    </ul>
  );
}

// INCORRECT - using index as key when list order can change
function UserList({ users }) {
  return (
    <ul>
      {users.map((user, index) => (
        <li key={index}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

### JSX Fragments

Use fragments to avoid unnecessary DOM elements:

```jsx
// CORRECT
function UserInfo({ user }) {
  return (
    <>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </>
  );
}

// INCORRECT
function UserInfo({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

## API Integration

### API Service Factory

Use the API service factory for consistent API integration:

```jsx
// api/apiServiceFactory.js
import axios from 'axios';
import { handleApiError } from '../utils/errorHandling';

const apiServiceFactory = (endpoint) => {
  const baseUrl = `${process.env.REACT_APP_API_URL}/api/v1/${endpoint}`;
  
  return {
    getAll: async (params = {}) => {
      try {
        const response = await axios.get(baseUrl, { params });
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    
    getById: async (id) => {
      try {
        const response = await axios.get(`${baseUrl}/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    
    create: async (data) => {
      try {
        const response = await axios.post(baseUrl, data);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    
    update: async (id, data) => {
      try {
        const response = await axios.put(`${baseUrl}/${id}`, data);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    },
    
    delete: async (id) => {
      try {
        const response = await axios.delete(`${baseUrl}/${id}`);
        return response.data;
      } catch (error) {
        handleApiError(error);
      }
    }
  };
};

export default apiServiceFactory;

// Usage
import apiServiceFactory from '../api/apiServiceFactory';

const userService = apiServiceFactory('users');
const integrationsService = apiServiceFactory('integrations');
```

### Data Fetching in Components

Use hooks for data fetching in components:

```jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await userService.getAll();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Custom Data Fetching Hook

Create reusable data fetching hooks:

```jsx
function useApiResource(apiFunction, initialData = null, dependencies = []) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await apiFunction();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, dependencies);
  
  return { data, loading, error, refetch: apiFunction };
}

// Usage
function UserList() {
  const { data: users, loading, error } = useApiResource(
    userService.getAll,
    []
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Testing

### Component Testing

Use React Testing Library for component tests:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

describe('Counter', () => {
  test('renders with initial count of 0', () => {
    render(<Counter />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });
  
  test('increments count when button is clicked', () => {
    render(<Counter />);
    fireEvent.click(screen.getByText('Increment'));
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

### Mocking API Calls

Use Jest mocks for API calls:

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import UserList from './UserList';
import userService from '../services/userService';

// Mock the service
jest.mock('../services/userService');

describe('UserList', () => {
  test('renders users from API', async () => {
    // Set up mock response
    userService.getAll.mockResolvedValue([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' }
    ]);
    
    render(<UserList />);
    
    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for users to be rendered
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });
  
  test('handles API error', async () => {
    // Set up mock error
    userService.getAll.mockRejectedValue(new Error('Failed to fetch'));
    
    render(<UserList />);
    
    // Wait for error to be rendered
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });
});
```

### Testing Context Providers

Wrap components with context providers in tests:

```jsx
import { render, screen } from '@testing-library/react';
import { UserContext } from '../contexts/UserContext';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  test('renders user information from context', () => {
    const mockUser = {
      id: '1',
      name: 'Alice',
      email: 'alice@example.com'
    };
    
    render(
      <UserContext.Provider value={mockUser}>
        <UserProfile />
      </UserContext.Provider>
    );
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });
});
```

## Accessibility

### Semantic HTML

Use semantic HTML elements:

```jsx
// CORRECT
function Article({ title, content, author }) {
  return (
    <article>
      <h1>{title}</h1>
      <p>{content}</p>
      <footer>
        <address>By {author}</address>
      </footer>
    </article>
  );
}

// INCORRECT
function Article({ title, content, author }) {
  return (
    <div>
      <div className="title">{title}</div>
      <div className="content">{content}</div>
      <div className="author">By {author}</div>
    </div>
  );
}
```

### ARIA Attributes

Add ARIA attributes when needed:

```jsx
function Tabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            id={`tab-${index}`}
            aria-selected={index === activeTab}
            aria-controls={`panel-${index}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>
      
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={index !== activeTab}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### Keyboard Navigation

Ensure keyboard navigation works properly:

```jsx
function NavigationMenu({ items }) {
  return (
    <nav>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <a
              href={item.url}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Handle link activation
                  window.location.href = item.url;
                }
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

### Focus Management

Implement proper focus management:

```jsx
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Save previous active element
      const previousActive = document.activeElement;
      
      // Focus the modal
      modalRef.current.focus();
      
      // Restore focus when modal closes
      return () => {
        previousActive.focus();
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      style={{ /* styles */ }}
    >
      <button
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </button>
      <div>{children}</div>
    </div>
  );
}
```

## Documentation

### Component Documentation

Document components with JSDoc:

```jsx
/**
 * A card component that displays user information
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - The user's name
 * @param {string} props.email - The user's email
 * @param {string} [props.avatar] - URL to the user's avatar image
 * @param {boolean} [props.isActive=false] - Whether the user is active
 * @param {function} [props.onClick] - Click handler for the card
 * @returns {React.Element} The rendered card component
 * 
 * @example
 * <UserCard
 *   name="John Doe"
 *   email="john@example.com"
 *   avatar="/images/john.jpg"
 *   isActive={true}
 *   onClick={() => console.log('Card clicked')}
 * />
 */
function UserCard({ name, email, avatar, isActive = false, onClick }) {
  return (
    <div className={`user-card ${isActive ? 'active' : ''}`} onClick={onClick}>
      {avatar && <img src={avatar} alt={`${name}'s avatar`} />}
      <div className="user-info">
        <h3>{name}</h3>
        <p>{email}</p>
        <span className="status">{isActive ? 'Active' : 'Inactive'}</span>
      </div>
    </div>
  );
}

UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func
};

export default UserCard;
```

### Utility Documentation

Document utility functions with JSDoc:

```jsx
/**
 * Formats a date in the user's locale
 * 
 * @param {Date|string|number} date - The date to format
 * @param {Object} [options] - Formatting options
 * @param {string} [options.format='medium'] - Format style ('short', 'medium', 'long', 'full')
 * @param {string} [options.locale] - Locale to use (defaults to browser locale)
 * @returns {string} The formatted date string
 * 
 * @example
 * // Returns "Jan 1, 2023"
 * formatDate(new Date(2023, 0, 1))
 * 
 * @example
 * // Returns "January 1, 2023"
 * formatDate(new Date(2023, 0, 1), { format: 'long' })
 */
export function formatDate(date, options = {}) {
  const {
    format = 'medium',
    locale = navigator.language
  } = options;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const formatOptions = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'long', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  return dateObj.toLocaleDateString(locale, formatOptions[format]);
}
```

## Performance

### Code Splitting

Use React.lazy and Suspense for code splitting:

```jsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Loading from './components/common/Loading';

// Lazy-loaded components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### Virtualization for Long Lists

Use virtualization for long lists:

```jsx
import { VirtualizedDataTable } from '../components/common/VirtualizedDataTable';

function UserList({ users }) {
  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'role', headerName: 'Role', width: 150 }
  ];
  
  return (
    <div style={{ height: 400, width: '100%' }}>
      <VirtualizedDataTable
        rows={users}
        columns={columns}
        rowHeight={40}
        headerHeight={50}
      />
    </div>
  );
}
```

### Debouncing and Throttling

Use debouncing or throttling for frequent events:

```jsx
import { useDebouncedCallback } from '../hooks/useDebounce';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // Debounce the search API call
  const debouncedSearch = useDebouncedCallback((searchQuery) => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }
    
    // Call search API
    searchService.search(searchQuery)
      .then(data => setResults(data))
      .catch(error => console.error('Search error:', error));
  }, 300);
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search..."
      />
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Memoization

Use memoization for expensive calculations:

```jsx
function DataVisualization({ data, filters }) {
  // Memoize expensive data processing
  const processedData = useMemo(() => {
    // Apply filters and transformations
    return data
      .filter(item => {
        // Apply filters
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          return item[key] === value;
        });
      })
      .map(item => {
        // Apply transformations
        return {
          ...item,
          formattedValue: formatNumber(item.value),
          normalizedValue: normalizeValue(item.value)
        };
      });
  }, [data, filters]);
  
  return (
    <div>
      <Chart data={processedData} />
      <DataTable data={processedData} />
    </div>
  );
}
```

## Conclusion

This document outlines the frontend coding standards for the TAP Integration Platform. Following these standards ensures consistency, maintainability, and quality across the codebase. For more comprehensive guidance, refer to the full development guide.