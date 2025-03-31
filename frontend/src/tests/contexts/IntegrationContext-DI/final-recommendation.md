# Dependency Injection Testing Pattern for IntegrationContext

## Overview

This document explains the recommended approach for testing context providers like IntegrationContext using dependency injection. This pattern has been successfully applied to UserContext, ResourceContext, WebhookContext, and now IntegrationContext.

## Key Concepts

1. **Dependency Injection**: The context component accepts external dependencies via props, making it easy to mock these dependencies in tests.

2. **Direct Mock Access**: By providing mock services directly to the context provider, we can verify interactions without complex module mocking.

3. **Consistent Testing Pattern**: Using a standardized approach with helper functions for all context providers.

4. **Context Value Capture**: Using callbacks to capture and expose context values for easier assertions.

## Implementation Details

### 1. Refactor Context Provider to Accept Dependencies

```javascript
// Before
import integrationService from '../services/integrationService';

export const IntegrationProvider = ({ children }) => {
  // Uses imported service directly
  // ...
};

// After
import integrationService from '../services/integrationService';

const defaultApiService = {
  getIntegrationById: integrationService.getIntegrationById,
  getIntegrationHistory: integrationService.getIntegrationHistory,
  runIntegration: integrationService.runIntegration,
  // Other methods...
};

export const IntegrationProvider = ({ 
  children, 
  apiService = defaultApiService 
}) => {
  // Uses injected service
  // ...
};
```

### 2. Create Mock Service for Testing

```javascript
// Create mock functions for each API service method used in the context
const createMockApiService = () => {
  return {
    getIntegrationById: jest.fn().mockResolvedValue(mockIntegration),
    getIntegrationHistory: jest.fn().mockResolvedValue(mockHistory),
    getIntegrationRuns: jest.fn().mockResolvedValue(mockRuns),
    runIntegration: jest.fn().mockResolvedValue({ success: true, runId: '4' }),
    deleteIntegration: jest.fn().mockResolvedValue(true)
  };
};
```

### 3. Create Context Rendering Helper

```javascript
// Helper function for simpler test setup with dependency injection
const renderWithIntegrationContext = (
  apiService = createMockApiService(),
  initialIntegrationId = null
) => {
  let contextValues = null;
  
  render(
    <IntegrationProvider 
      apiService={apiService} 
      initialIntegrationId={initialIntegrationId}
    >
      <TestComponent onContextLoad={(values) => {
        contextValues = values;
      }} />
    </IntegrationProvider>
  );
  
  // Helper to get the latest context values
  const getContextValues = () => contextValues;
  
  return {
    getContextValues,
    apiService
  };
};
```

### 4. Test Component that Captures Context Values

```javascript
const TestComponent = ({ onContextLoad = () => {} }) => {
  const context = useIntegration();
  
  // Call the callback with context values after render
  useEffect(() => {
    onContextLoad(context);
  }, [onContextLoad, context]);

  // Component JSX that renders context values
  // ...
};
```

### 5. Test Assertions Using Mock Service

```javascript
it('should fetch integration data explicitly', async () => {
  const mockApiService = createMockApiService();
  renderWithIntegrationContext(mockApiService);

  // Perform action (click button, etc.)
  fireEvent.click(screen.getByTestId('fetch-integration'));

  // Wait for UI to update
  await waitFor(() => {
    expect(screen.getByTestId('integration-name')).toHaveTextContent('Test Integration');
  });

  // Verify service call directly on the mock
  expect(mockApiService.getIntegrationById).toHaveBeenCalledWith('123');
});
```

## Benefits of This Approach

1. **Avoids Module-Level Mocking**: No need for complex jest.mock or jest.doMock setups

2. **Eliminates Race Conditions**: Tests are more reliable as there's no timing issue with when mocks are applied

3. **Provides Better Control**: Direct access to mock functions allows precise verification of calls and parameters

4. **Simplifies Test Setup**: Each test can create its own mock with specific behavior

5. **Improves Test Isolation**: Tests don't depend on module-level state that might be affected by other tests

6. **Makes Testing More Realistic**: Tests the component's behavior with explicit dependencies, closer to how it's actually used

7. **Enhances Readability**: Test code clearly shows what dependencies are being provided

## When to Use This Pattern

This pattern is most effective for testing:

1. Context providers that depend on external services
2. Components that create module-level singletons during import
3. Components that make API calls or use browser APIs
4. Any component where you want to verify interactions with external dependencies

## Example Test Cases

See the `IntegrationContext.test.js` file for a complete set of test cases using this pattern, including:

- Initialization with default values
- Loading and displaying data
- Handling errors
- Verifying API calls
- Testing complex interactions
- Simulating error conditions
- Accessing context values directly

## Recommended Practice

When creating a new context provider or refactoring an existing one:

1. Always design context providers to accept dependencies as props with sensible defaults
2. Document the expected interface of these dependencies
3. Create a test file that follows this dependency injection pattern
4. Include tests for initialization, data loading, error handling, and all public methods

By following this pattern consistently, we ensure that all context providers in the application are testable, maintainable, and robust.