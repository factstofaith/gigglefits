# Testing Infrastructure Implementation Plan

## Phase 1: Clean-up and Setup

### 1. Remove Outdated Tests (Week 1)

1. Audit existing tests for:
   - Tests that reference old design system (Material UI)
   - Tests with hardcoded selectors
   - Tests dependent on specific implementations
   - Tests with poor assertions or flaky behavior

2. Create documentation of removed tests and what replacements will be needed

3. Remove tests in batches by category:
   - Design system specific tests
   - End-to-end tests with outdated selectors
   - Deprecated component tests

### 2. Jest Configuration Optimization (Week 1)

1. Update Jest configuration:
   ```javascript
   // jest.config.js
   module.exports = {
     collectCoverageFrom: [
       'src/**/*.{js,jsx}',
       '!src/**/*.stories.{js,jsx}',
       '!src/tests/**',
       '!src/**/index.{js,jsx}',
       '!src/mocks/**',
     ],
     coverageThreshold: {
       global: {
         statements: 70,
         branches: 70,
         functions: 70,
         lines: 70,
       },
     },
     testEnvironment: 'jsdom',
     transform: {
       '^.+\\.(js|jsx)$': 'babel-jest',
     },
     transformIgnorePatterns: ['/node_modules/(?!axios)'],
     moduleNameMapper: {
       '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
       '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/src/tests/mocks/fileMock.js',
     },
     setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.js'],
     testMatch: [
       '<rootDir>/src/**/*.test.{js,jsx}',
       '<rootDir>/src/**/*.spec.{js,jsx}',
       '<rootDir>/src/**/*.integration.test.{js,jsx}',
     ],
   };
   ```

2. Create specialized test scripts in package.json:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch",
     "test:coverage": "jest --coverage",
     "test:unit": "jest --testMatch='**/*.test.{js,jsx}'",
     "test:integration": "jest --testMatch='**/*.integration.test.{js,jsx}'",
     "test:a11y": "jest --testMatch='**/*.a11y.test.{js,jsx}'",
     "test:ci": "jest --ci --coverage",
     "cypress": "cypress open",
     "cypress:run": "cypress run",
     "cypress:ci": "start-server-and-test start http://localhost:3000 cypress:run"
   }
   ```

### 3. MSW v2 Installation and Setup (Week 1)

1. Update MSW to version 2:
   ```bash
   npm install msw@latest --save-dev
   ```

2. Create standardized API mocking setup:
   ```javascript
   // src/tests/mocks/handlers.js
   import { http, HttpResponse } from 'msw'

   export const handlers = [
     http.get('/api/users', () => {
       return HttpResponse.json([
         { id: 1, name: 'John' },
         { id: 2, name: 'Jane' },
       ])
     }),
   ]
   ```

3. Configure MSW browser and node setup:
   ```javascript
   // src/tests/mocks/browser.js
   import { setupWorker } from 'msw/browser'
   import { handlers } from './handlers'

   export const worker = setupWorker(...handlers)
   ```

   ```javascript
   // src/tests/mocks/server.js
   import { setupServer } from 'msw/node'
   import { handlers } from './handlers'

   export const server = setupServer(...handlers)
   ```

4. Update setupTests.js to use new MSW:
   ```javascript
   // src/tests/setupTests.js
   import { server } from './mocks/server'

   beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
   afterEach(() => server.resetHandlers())
   afterAll(() => server.close())
   ```

### 4. Testing Utilities Creation (Week 2)

1. Create render utility with common providers:
   ```javascript
   // src/tests/utils/test-utils.jsx
   import React from 'react'
   import { render } from '@testing-library/react'
   import { BrowserRouter } from 'react-router-dom'
   import { ThemeProvider } from '../../design-system/foundations/theme'

   const AllProviders = ({ children }) => {
     return (
       <BrowserRouter>
         <ThemeProvider initialMode="light">
           {children}
         </ThemeProvider>
       </BrowserRouter>
     )
   }

   const customRender = (ui, options) =>
     render(ui, { wrapper: AllProviders, ...options })

   // re-export everything
   export * from '@testing-library/react'

   // override render method
   export { customRender as render }
   ```

2. Create user interaction utility:
   ```javascript
   // src/tests/utils/user-event-setup.js
   import userEvent from '@testing-library/user-event'

   export function setupUserEvent() {
     return userEvent.setup({
       advanceTimers: jest.advanceTimersByTime,
     })
   }
   ```

3. Create accessibility testing utility:
   ```javascript
   // src/tests/utils/a11y-utils.js
   import { axe } from 'jest-axe'
   import { render } from './test-utils'

   export async function testA11y(ui, options) {
     const { container } = render(ui, options)
     const results = await axe(container)
     expect(results).toHaveNoViolations()
     return container
   }
   ```

### 5. Storybook Installation and Configuration (Week 2)

1. Install Storybook:
   ```bash
   npx storybook init
   ```

2. Configure Storybook with design system theme:
   ```javascript
   // .storybook/preview.js
   import { ThemeProvider } from '../src/design-system/foundations/theme'

   export const decorators = [
     (Story) => (
       <ThemeProvider initialMode="light">
         <Story />
       </ThemeProvider>
     ),
   ]

   export const parameters = {
     actions: { argTypesRegex: '^on[A-Z].*' },
     controls: {
       matchers: {
         color: /(background|color)$/i,
         date: /Date$/,
       },
     },
   }
   ```

3. Configure Storybook for a11y testing:
   ```bash
   npm install @storybook/addon-a11y --save-dev
   ```

   ```javascript
   // .storybook/main.js
   module.exports = {
     stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
     addons: [
       '@storybook/addon-links',
       '@storybook/addon-essentials',
       '@storybook/preset-create-react-app',
       '@storybook/addon-a11y',
     ],
   }
   ```

### 6. Create Testing Templates (Week 2)

1. Component unit test template:
   ```javascript
   // src/tests/templates/component.test.template.jsx
   import React from 'react'
   import { render, screen } from '../utils/test-utils'
   import userEvent from '@testing-library/user-event'
   import Component from '../../components/Component'

   describe('Component', () => {
     it('renders correctly', () => {
       render(<Component />)
       // Add assertions here
     })

     it('handles user interactions', async () => {
       const user = userEvent.setup()
       render(<Component />)
       // Add interactions and assertions here
     })

     it('renders in different states', () => {
       // Test various props and states
     })
   })
   ```

2. Hook test template:
   ```javascript
   // src/tests/templates/hook.test.template.js
   import { renderHook, act } from '@testing-library/react'
   import { useHook } from '../../hooks/useHook'

   describe('useHook', () => {
     it('returns the correct initial state', () => {
       const { result } = renderHook(() => useHook())
       // Add assertions here
     })

     it('updates state correctly', () => {
       const { result } = renderHook(() => useHook())
       act(() => {
         // Call hook methods
       })
       // Add assertions here
     })
   })
   ```

3. Integration test template:
   ```javascript
   // src/tests/templates/integration.test.template.jsx
   import React from 'react'
   import { render, screen, waitFor } from '../utils/test-utils'
   import userEvent from '@testing-library/user-event'
   import Component from '../../components/Component'
   import { server } from '../mocks/server'
   import { http, HttpResponse } from 'msw'

   describe('Component Integration', () => {
     it('loads and displays data from API', async () => {
       // Setup mock data
       server.use(
         http.get('/api/data', () => {
           return HttpResponse.json({ data: 'mocked data' })
         })
       )

       render(<Component />)
       
       // Assert loading state
       expect(screen.getByTestId('loading')).toBeInTheDocument()
       
       // Wait for data
       await waitFor(() => {
         expect(screen.getByText('mocked data')).toBeInTheDocument()
       })
     })
   })
   ```

4. E2E test template:
   ```javascript
   // cypress/e2e/templates/e2e.template.cy.js
   describe('Feature', () => {
     beforeEach(() => {
       cy.visit('/')
       // Setup any test data or authentication
     })

     it('completes the main user flow', () => {
       // Interact with the UI
       cy.get('[data-testid="button"]').click()
       
       // Assert expected results
       cy.get('[data-testid="result"]').should('contain', 'Expected result')
     })
   })
   ```

## Phase 2: Integration and Configuration

### 1. Cypress-axe Integration (Week 3)

1. Install Cypress-axe:
   ```bash
   npm install cypress-axe --save-dev
   ```

2. Configure Cypress for a11y testing:
   ```javascript
   // cypress/support/e2e.js
   import 'cypress-axe'
   ```

3. Create a11y command:
   ```javascript
   // cypress/support/commands.js
   Cypress.Commands.add('checkA11y', (context, options) => {
     cy.checkA11y(context, options)
   })
   ```

4. Add a11y testing template:
   ```javascript
   // cypress/e2e/templates/a11y.template.cy.js
   describe('Accessibility', () => {
     beforeEach(() => {
       cy.visit('/')
       cy.injectAxe()
     })

     it('has no detectable a11y violations on load', () => {
       cy.checkA11y()
     })

     it('has no a11y violations after user interaction', () => {
       // Interact with the page
       cy.get('[data-testid="button"]').click()
       
       // Check for a11y violations
       cy.checkA11y()
     })
   })
   ```

### 2. Lighthouse CI Setup (Week 3)

1. Install Lighthouse CI:
   ```bash
   npm install -g @lhci/cli
   npm install --save-dev @lhci/cli
   ```

2. Create Lighthouse CI configuration:
   ```javascript
   // lighthouserc.js
   module.exports = {
     ci: {
       collect: {
         startServerCommand: 'npm run start',
         url: ['http://localhost:3000'],
         numberOfRuns: 3,
       },
       upload: {
         target: 'temporary-public-storage',
       },
       assert: {
         preset: 'lighthouse:recommended',
         assertions: {
           'categories:performance': ['warn', { minScore: 0.8 }],
           'categories:accessibility': ['error', { minScore: 0.9 }],
           'categories:best-practices': ['warn', { minScore: 0.9 }],
           'categories:seo': ['warn', { minScore: 0.9 }],
         },
       },
     },
   }
   ```

3. Add Lighthouse CI to package.json:
   ```json
   "scripts": {
     "lighthouse": "lhci autorun",
     "lighthouse:ci": "lhci autorun --upload.target=temporary-public-storage"
   }
   ```

### 3. Coverage Configuration (Week 3)

1. Update Jest coverage configuration:
   ```javascript
   // jest.config.js (add to existing config)
   module.exports = {
     // ...
     coverageReporters: ['text', 'lcov', 'clover'],
     collectCoverageFrom: [
       'src/**/*.{js,jsx}',
       '!src/**/*.stories.{js,jsx}',
       '!src/tests/**',
       '!src/**/index.{js,jsx}',
       '!src/mocks/**',
     ],
     coverageThreshold: {
       global: {
         statements: 70,
         branches: 70,
         functions: 70,
         lines: 70,
       },
     },
   }
   ```

2. Create coverage report script:
   ```json
   "scripts": {
     "test:coverage": "jest --coverage",
     "test:coverage:html": "jest --coverage --coverageReporters='html'"
   }
   ```

### 4. CI Pipeline Integration (Week 4)

1. Create GitHub Actions workflow:
   ```yaml
   # .github/workflows/test.yml
   name: Test

   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

   jobs:
     test:
       runs-on: ubuntu-latest

       steps:
       - uses: actions/checkout@v3
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: 16
           cache: 'npm'
       - name: Install dependencies
         run: npm ci
       - name: Run linter
         run: npm run lint
       - name: Run type checks
         run: npm run typecheck
       - name: Run tests
         run: npm run test:ci
       - name: Upload coverage
         uses: codecov/codecov-action@v3
       
     e2e:
       runs-on: ubuntu-latest
       needs: test
       
       steps:
       - uses: actions/checkout@v3
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: 16
           cache: 'npm'
       - name: Install dependencies
         run: npm ci
       - name: Run Cypress
         run: npm run cypress:ci
       
     lighthouse:
       runs-on: ubuntu-latest
       needs: test
       
       steps:
       - uses: actions/checkout@v3
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: 16
           cache: 'npm'
       - name: Install dependencies
         run: npm ci
       - name: Run Lighthouse CI
         run: npm run lighthouse:ci
   ```

## Phase 3: Documentation and Best Practices

### 1. Create Testing Guidelines (Week 4)

1. Component testing guidelines:
   - What to test
   - How to structure tests
   - How to test different component types
   - Do's and don'ts

2. E2E testing guidelines:
   - Which user flows to prioritize
   - How to write stable tests
   - Setting up test data
   - Handling authentication

3. Testing standards:
   - Naming conventions
   - Organization
   - Assertions best practices
   - Performance considerations

### 2. Create Testing Checklist (Week 4)

Checklist for new components:
1. [ ] Has unit tests for rendering
2. [ ] Has tests for all props
3. [ ] Has tests for user interactions
4. [ ] Has accessibility tests
5. [ ] Has Storybook stories
6. [ ] Has snapshot tests (optional)
7. [ ] Meets coverage thresholds

Checklist for features:
1. [ ] Has integration tests for main flows
2. [ ] Has error state tests
3. [ ] Has accessibility tests
4. [ ] Has E2E tests for critical paths
5. [ ] Has performance benchmarks (if applicable)

### 3. Knowledge Sharing Sessions (Week 5)

1. Session 1: Testing Strategy and Tools
2. Session 2: Writing Effective Unit Tests
3. Session 3: Integration and E2E Testing
4. Session 4: Performance and Accessibility Testing

## Timeline and Milestones

Week 1:
- Remove outdated tests
- Update Jest configuration
- Install and configure MSW v2

Week 2:
- Create testing utilities
- Install and configure Storybook
- Create test templates

Week 3:
- Set up Cypress-axe
- Configure Lighthouse CI
- Configure code coverage

Week 4:
- Set up CI pipeline
- Create testing guidelines
- Create testing checklists

Week 5:
- Knowledge sharing sessions
- Address feedback
- Start implementing new tests

## Success Metrics

1. Test coverage: 80% overall code coverage
2. Test reliability: <5% flaky tests
3. Build performance: <10 minutes for full test suite
4. Developer experience: Positive feedback from developer survey
5. Accessibility: 90+ score on Lighthouse for all key pages
6. Documentation: Complete testing guidelines and examples