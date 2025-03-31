# Test Audit Results

## Overview

We've analyzed the current test suite to identify tests that need to be removed or refactored. This analysis is based on:

1. Tests that rely on Material UI components (which have been migrated to our design system)
2. Tests with outdated selectors or hardcoded class names
3. Tests that test implementation details rather than behavior
4. Tests with poor structure or flaky behavior

## Tests to Remove

### Design System Related Tests

The following tests are specific to Material UI components that have been migrated to our design system:

- `/src/tests/design-system/*.test.jsx` - All tests in this directory are specific to the Material UI migration process.
- `/src/tests/components/common/App.test.jsx` - Uses Material UI specific selectors and tests outdated implementation.
- `/src/tests/e2e/notification.e2e.js` - Uses Material UI class selectors like `.MuiAlert-standardInfo`.
- `/cypress/e2e/features/design-system.cy.js` - Specifically created for Material UI visual validation.

### Tests with Outdated Selectors

- `/src/tests/components/admin/ApplicationsManager.test.jsx` - Uses Material UI specific class names and outdated component structure.
- `/src/tests/components/admin/ApplicationsManager.test.js` - Legacy duplicate test file.

### Flaky or Poorly Structured Tests

- `/src/tests/contexts/NotificationContext.test.js` - Tests implementation details with tightly coupled expectations.
- `/src/tests/schema-discovery.test.jsx` - Has timing-dependent behavior that causes flaky results.

## Tests to Refactor

### Component Tests

The following component tests need to be refactored to work with our design system:

1. `/src/tests/components/common/ResourceLoader.test.jsx`
   - Currently well structured but needs updated selectors
   - Keep testing pattern but update to match new design system

2. `/src/tests/components/common/UserProfile.test.jsx`
   - Generally good, but relies on Material UI selectors
   - Update to use more semantic selectors

3. `/src/tests/components/common/VirtualizedDataTable.test.jsx`
   - Good test structure, but uses Material UI table components
   - Update to use design system Table components

4. `/src/tests/components/common/AuthModal.test.jsx`
   - Tests behavior properly, but needs selector updates
   - Improve auth flow testing

### Context Tests

The following context tests need improvements:

1. `/src/tests/contexts/EarningsContext.test.js`
   - Generally functional but lacks proper mocking
   - Update to use MSW for API mocking

2. `/src/tests/contexts/IntegrationContext.test.js`
   - Uses inconsistent patterns
   - Needs improved async testing

3. `/src/tests/contexts/ResourceContext.test.js`
   - Good approach but needs better error handling tests
   - Could benefit from more edge cases

4. `/src/tests/contexts/SettingsContext.test.js`
   - Simple tests that work but can be improved
   - Add tests for theme persistence

5. `/src/tests/contexts/UserContext.test.js`
   - Needs updated auth flow testing
   - Improve token handling tests

6. `/src/tests/contexts/WebhookContext.test.js`
   - Good but needs MSW pattern instead of mock implementations

### Service Tests

Service tests generally don't need structural changes but should be updated to use MSW:

1. `/src/tests/services/adminService.test.js`
   - Update from custom mocks to MSW

## Tests to Add

Based on our analysis, we need to add the following types of tests:

1. **Unit tests for design system components:**
   - Button, Typography, Card, Grid, etc.
   - Focus on behavior, accessibility, and props handling

2. **Integration tests for key features:**
   - Authentication flow
   - Form submission and validation
   - Data fetching and display
   - Error handling

3. **End-to-end tests for critical user journeys:**
   - User login and session management
   - Integration creation and configuration
   - Template management
   - Admin operations

4. **Accessibility tests:**
   - For all core components
   - For key pages
   - For interactive elements

## Key Findings

1. **Test isolation issues:** Many tests rely on global mocks or state from other tests
2. **Selector fragility:** Heavy use of class-based selectors that break with design changes
3. **Implementation testing:** Too many tests for implementation rather than behavior
4. **Inconsistent patterns:** Mixed approaches to testing similar functionality
5. **Limited coverage:** Critical user flows lack proper test coverage
6. **Accessibility gaps:** Limited accessibility testing

## Recommendations

1. **Remove outdated tests:** Delete tests identified for removal
2. **Standardize test setup:** Create consistent test utilities and helpers
3. **Improve API mocking:** Migrate to MSW v2 for all API mocking
4. **Focus on behavior:** Rewrite tests to focus on behavior, not implementation
5. **Improve selectors:** Use semantic selectors (roles, labels, etc.) instead of classes
6. **Add missing tests:** Systematically add tests for missing functionality

## Next Steps

1. Remove identified tests
2. Set up improved testing infrastructure
3. Create test utilities and helpers
4. Start rewriting critical tests
5. Gradually build out complete test coverage

## Test Cleanup Plan

1. Back up all test files before removal
2. Remove tests in small batches
3. Verify application builds after each removal
4. Update related configuration files
5. Document changes for team reference