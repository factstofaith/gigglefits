# Dependency Injection Testing Pattern for EarningsContext

## Overview

This document explains the recommended approach for testing the EarningsContext provider and hook using dependency injection. We've successfully applied this pattern to UserContext, ResourceContext, WebhookContext, IntegrationContext, and now EarningsContext.

## Key Concepts

1. **Dependency Injection**: The context component accepts external dependencies via props, making it easy to mock these dependencies in tests.

2. **Direct Mock Access**: By providing mock services directly to the context provider, we can verify interactions without complex module mocking.

3. **Context Value Capture**: Using callbacks to capture and expose context values for easier assertions.

4. **Defensive Programming**: Adding null/undefined checks for more robust error handling.

## Implementation Details

### 1. Refactor Context Provider to Accept Dependencies

```javascript
// Before
import { 
  getRosters, 
  getRosterById, 
  // ...other imports
} from '../services/earningsServiceRefactored';

export const EarningsProvider = ({ children }) => {
  // Uses imported service functions directly
  // ...
};

// After
import earningsService, {
  getRosters,
  getRosterById,
  // ...other imports
} from '../services/earningsService';

// Default service implementations
const defaultEarningsService = {
  getRosters,
  getRosterById,
  // ...other functions
};

export const EarningsProvider = ({ 
  children,
  apiService = defaultEarningsService 
}) => {
  // Uses injected service
  // ...
};
```

### 2. Create Mock Service for Testing

```javascript
// Create mock API service
const createMockApiService = () => {
  return {
    getRosters: jest.fn().mockResolvedValue(mockRosters),
    getRosterById: jest.fn().mockResolvedValue(mockRosterDetails),
    createRoster: jest.fn().mockResolvedValue({
      id: 3,
      name: 'New Roster',
      source_system: 'Workday',
      destination_system: 'ADP',
      employee_count: 0,
    }),
    // Other mock methods...
  };
};
```

### 3. Create Context Rendering Helper

```javascript
// Helper function for simpler test setup with dependency injection
const renderWithEarningsContext = (apiService = createMockApiService()) => {
  let contextValues = null;

  render(
    <EarningsProvider apiService={apiService}>
      <TestComponent
        onContextLoad={(values) => {
          contextValues = values;
        }}
      />
    </EarningsProvider>
  );

  // Helper to get the latest context values
  const getContextValues = () => contextValues;

  return {
    getContextValues,
    apiService,
  };
};
```

### 4. Test Component that Captures Context Values

```javascript
const TestComponent = ({ onContextLoad = () => {} }) => {
  const context = useEarnings();
  
  // Call the callback with context values after render
  useEffect(() => {
    onContextLoad(context);
  }, [onContextLoad, context]);

  // Component JSX for testing
  // ...
};
```

### 5. Test Assertions Using Mock Service

```javascript
it('should fetch rosters successfully', async () => {
  const { apiService } = renderWithEarningsContext();

  // Initial data fetch should happen automatically
  await waitFor(() => {
    expect(screen.getByTestId('rosters-count')).toHaveTextContent('2');
    expect(screen.getByTestId('loading-rosters')).toHaveTextContent('false');
  });

  // Ensure service was called
  expect(apiService.getRosters).toHaveBeenCalledTimes(1);
});
```

### 6. Direct Context Value Testing

```javascript
it('should directly expose context methods through getContextValues helper', async () => {
  const mockApiService = createMockApiService();
  const { getContextValues } = renderWithEarningsContext(mockApiService);

  // Wait for initial data to load
  await waitFor(() => {
    expect(screen.getByTestId('rosters-count')).toHaveTextContent('2');
    expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('3');
  });

  // Get current context values
  const contextValues = getContextValues();

  // Verify context has expected structure and values
  expect(contextValues.rosters).toHaveLength(2);
  expect(contextValues.earningsCodes).toHaveLength(3);
  expect(contextValues.selectedRosterId).toBeNull();
  expect(contextValues.employees).toHaveLength(0);
  expect(typeof contextValues.fetchRosters).toBe('function');
  expect(typeof contextValues.createRoster).toBe('function');
  expect(typeof contextValues.fetchEarningsCodes).toBe('function');
  expect(typeof contextValues.getDestinationSystems).toBe('function');
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

## Defensive Programming Practices

We've also implemented defensive programming practices in the EarningsContext provider to make it more robust:

1. **Default Value Handling**:
   ```javascript
   setRosters(data || []);
   ```

2. **Defensive State Updates**:
   ```javascript
   setEarningsCodes(prev => [...(prev || []), newCode]);
   ```

3. **Null/Undefined Checks**:
   ```javascript
   if (!rosterId) return [];
   ```

4. **Optional Chaining and Default Values**:
   ```javascript
   destination_system: roster.destination_system || '',
   ```

These practices help prevent common errors and make the context provider more robust against edge cases, especially during initialization or when API calls fail.

## When to Use This Pattern

This pattern is most effective for testing:

1. Context providers that depend on external services
2. Components that create module-level singletons
3. Components that make API calls
4. Any component where you want to verify interactions with external dependencies

## Recommended Practice

When creating a new context provider or refactoring an existing one:

1. Always design context providers to accept dependencies as props with sensible defaults
2. Include null/undefined checks and defensive coding practices
3. Create a test file that follows this dependency injection pattern
4. Include tests for initialization, data loading, error handling, and all public methods