# Finishline - Standardized Frontend Framework

This project provides a standardized, optimized frontend framework for the TAP Integration Platform.

## Overview

Finishline is a comprehensive set of tools, patterns, and components designed to eliminate technical debt and provide a modern, maintainable frontend architecture.

Key features:
- Component-driven architecture with functional React components
- Standardized state management using React Context API
- Custom hooks for reusable logic
- Performance optimizations (code splitting, lazy loading)
- Dual module format output (ESM and CJS)
- Comprehensive testing framework
- Accessibility compliance

## Architecture

The project follows a clean, layered architecture:

```
/project/finishline/
├── config/                    # Build configuration
│   ├── webpack.common.js      # Shared webpack config
│   ├── webpack.dev.js         # Development config
│   ├── webpack.prod.js        # Production config
│   ├── webpack.esm.js         # ESM module format config
│   └── webpack.cjs.js         # CJS module format config
├── src/
│   ├── components/            # UI components
│   │   ├── common/            # Shared components
│   │   ├── layout/            # Layout components
│   │   └── integration/       # Domain-specific components
│   ├── contexts/              # Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # API services
│   ├── utils/                 # Utility functions
│   ├── tests/                 # Test files
│   │   ├── templates/         # Test templates
│   │   ├── components/        # Component tests
│   │   └── e2e/              # End-to-end tests
│   ├── App.jsx                # Main application component
│   └── AppRoutes.jsx          # Routing configuration
└── scripts/                   # Build and utility scripts
```

## Testing Framework

Finishline includes a comprehensive testing framework with standardized patterns for different testing needs.

### Component Tests

The component testing framework provides utilities for testing React components with standardized patterns. It includes:

- Mock providers for all contexts
- Form testing utilities
- Accessibility testing helpers
- State management testing

Example component test:

```jsx
import { renderWithProviders, TestCaseBuilder } from '../../utils/testingFramework';
import YourComponent from '../../components/YourComponent';

describe('YourComponent', () => {
  test('renders correctly', () => {
    const { getByText } = renderWithProviders(<YourComponent />);
    expect(getByText('Expected Text')).toBeInTheDocument();
  });
  
  // Using test case builder for multiple test cases
  const testCases = new TestCaseBuilder()
    .addTestCase('shows success with valid input', {
      props: { initialValue: 'Valid' },
      act: async ({ user }) => {
        await user.click(screen.getByRole('button', { name: 'Validate' }));
      },
      assert: () => {
        expect(screen.getByText('Valid!')).toBeInTheDocument();
      }
    })
    .addTestCase('shows error with invalid input', {
      props: { initialValue: '' },
      act: async ({ user }) => {
        await user.click(screen.getByRole('button', { name: 'Validate' }));
      },
      assert: () => {
        expect(screen.getByText('Invalid input')).toBeInTheDocument();
      }
    });
  
  testCases.runTests((props) => renderWithProviders(<YourComponent {...props} />));
});
```

### Visual Regression Tests

The visual regression testing framework captures screenshots of components in different states and compares them with baseline images to detect visual changes.

Example visual regression test:

```jsx
import { VisualTesting, ComponentVisualState } from '../../utils/visualRegressionTesting';

describe('Button Visual Tests', () => {
  let visualTesting;
  
  beforeAll(async () => {
    visualTesting = new VisualTesting();
    await visualTesting.initialize();
  });
  
  afterAll(async () => {
    await visualTesting.cleanup();
  });
  
  test('renders all states correctly', async () => {
    const states = new ComponentVisualState()
      .addDefaultState({ variant: 'contained', color: 'primary' })
      .addHoverState({ variant: 'contained', color: 'primary' })
      .addDisabledState({ variant: 'contained', color: 'primary' })
      .getStates();
    
    const results = await visualTesting.testComponentStates(
      'Button', 
      'http://localhost:6006/iframe.html?id=components-button',
      states
    );
    
    Object.values(results).forEach(passed => expect(passed).toBe(true));
  });
});
```

### End-to-End Tests

The end-to-end testing framework tests complete user flows and interactions using a headless browser.

Example E2E test:

```jsx
import { E2ETesting, PageObject } from '../../utils/e2eTesting';

class LoginPage extends PageObject {
  constructor(e2e) {
    super(e2e, '/login');
    this.addSelectors({
      usernameInput: '[data-testid="username-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]'
    });
  }
  
  async login(username, password) {
    await this.fill('usernameInput', username);
    await this.fill('passwordInput', password);
    await this.click('loginButton');
  }
}

describe('Authentication Flow', () => {
  let e2e;
  let loginPage;
  
  beforeAll(async () => {
    e2e = new E2ETesting();
    await e2e.initialize();
    loginPage = new LoginPage(e2e);
  });
  
  afterAll(async () => {
    await e2e.cleanup();
  });
  
  test('successful login', async () => {
    await loginPage.navigate();
    await loginPage.login('testuser', 'password');
    await e2e.waitForNavigation();
    const url = await e2e.evaluate(() => window.location.pathname);
    expect(url).toBe('/dashboard');
  });
});
```

## Getting Started

1. Clone the repository
2. Install dependencies:
```
npm install
```

3. Run development server:
```
npm run dev
```

4. Build for production:
```
npm run build
```

5. Run tests:
```
npm test
```

## Testing Examples

The project includes example tests for different testing approaches:

- Component Tests: `src/tests/components/integration/IntegrationDetailView.test.jsx`
- Visual Regression Tests: `src/tests/components/integration/IntegrationDetailView.visual.js`
- End-to-End Tests: `src/tests/e2e/IntegrationWorkflow.e2e.js`

Test templates are available in the `src/tests/templates/` directory.