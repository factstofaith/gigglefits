# Testing Standards and Best Practices

This document outlines the standards and best practices for testing in the TAP Integration Platform frontend.

## Testing Philosophy

Our testing approach is based on these core principles:

1. **Confidence**: Tests should provide confidence that the code works as expected and will continue to work after changes.
2. **Maintainability**: Tests should be easy to understand and maintain.
3. **Speed**: The test suite should run quickly to provide fast feedback.
4. **Reliability**: Tests should be deterministic and not flaky.
5. **Value**: Tests should focus on behavior that matters to users and business requirements.

## Test Categories

### Unit Tests

Unit tests should test individual functions, components, or hooks in isolation.

**What to Test:**
- Component rendering without errors
- Props handling and conditional rendering
- Event handlers and user interactions
- State changes and side effects
- Edge cases and error handling
- Hooks behavior and state updates

**What Not to Test:**
- Implementation details (internal state structure)
- Third-party library behavior
- Browser/platform-specific behavior
- Styling (use visual tests instead)

### Integration Tests

Integration tests verify that multiple units work together correctly.

**What to Test:**
- Component interactions
- Context providers with consumers
- Form submissions and validation
- Data fetching and state updates
- Complex component hierarchies
- Modal and popup interactions

### End-to-End Tests

E2E tests verify that entire user flows work correctly from start to finish.

**What to Test:**
- Critical user journeys
- Authentication flows
- Complex business processes
- Cross-page navigation
- Error handling and recovery
- Real API interactions (when appropriate)

## Code Organization

### File Structure

```
src/
  components/
    Button/
      Button.jsx
      Button.test.jsx
      Button.stories.jsx
  hooks/
    useNotification/
      useNotification.js
      useNotification.test.js
  tests/
    __mocks__/           # Mock implementations
    e2e/                 # E2E tests (can also be in /cypress/e2e)
    integration/         # Complex integration tests
    utils/               # Test utilities
    fixtures/            # Test data
    templates/           # Test templates
```

### Naming Conventions

- Unit tests: `ComponentName.test.jsx`
- Integration tests: `ComponentName.integration.test.jsx`
- E2E tests: `featureName.cy.js`
- A11y tests: `ComponentName.a11y.test.jsx`
- Test fixtures: `ComponentName.fixture.js`
- Storybook stories: `ComponentName.stories.jsx`

## Testing Patterns

### Component Testing

1. **Basic rendering test**:
   ```jsx
   it('renders correctly', () => {
     render(<Button>Click me</Button>);
     expect(screen.getByRole('button')).toBeInTheDocument();
     expect(screen.getByText('Click me')).toBeInTheDocument();
   });
   ```

2. **Props testing**:
   ```jsx
   it('applies the correct variant styles', () => {
     render(<Button variant="primary">Primary</Button>);
     const button = screen.getByRole('button');
     expect(button).toHaveClass('btn-primary');
   });
   ```

3. **Event handling**:
   ```jsx
   it('calls onClick when clicked', async () => {
     const handleClick = jest.fn();
     render(<Button onClick={handleClick}>Click me</Button>);
     
     await userEvent.click(screen.getByRole('button'));
     expect(handleClick).toHaveBeenCalledTimes(1);
   });
   ```

4. **Conditional rendering**:
   ```jsx
   it('renders loading state when isLoading is true', () => {
     render(<Button isLoading>Click me</Button>);
     
     expect(screen.queryByText('Click me')).not.toBeInTheDocument();
     expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
   });
   ```

### Hook Testing

1. **Testing initial state**:
   ```jsx
   it('returns the correct initial state', () => {
     const { result } = renderHook(() => useCounter(0));
     expect(result.current.count).toBe(0);
   });
   ```

2. **Testing state updates**:
   ```jsx
   it('increments the counter', () => {
     const { result } = renderHook(() => useCounter(0));
     
     act(() => {
       result.current.increment();
     });
     
     expect(result.current.count).toBe(1);
   });
   ```

3. **Testing with props**:
   ```jsx
   it('uses the initialValue', () => {
     const { result, rerender } = renderHook(
       ({ initialValue }) => useCounter(initialValue),
       { initialProps: { initialValue: 5 } }
     );
     
     expect(result.current.count).toBe(5);
     
     rerender({ initialValue: 10 });
     act(() => {
       result.current.reset();
     });
     
     expect(result.current.count).toBe(10);
   });
   ```

### Context Testing

1. **Testing context provider**:
   ```jsx
   it('provides the theme value to consumers', () => {
     const TestComponent = () => {
       const { theme } = useTheme();
       return <div data-testid="theme-mode">{theme.mode}</div>;
     };
     
     render(
       <ThemeProvider initialMode="dark">
         <TestComponent />
       </ThemeProvider>
     );
     
     expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
   });
   ```

2. **Testing context updates**:
   ```jsx
   it('updates the theme mode', async () => {
     const TestComponent = () => {
       const { theme, toggleTheme } = useTheme();
       return (
         <div>
           <div data-testid="theme-mode">{theme.mode}</div>
           <button onClick={toggleTheme}>Toggle</button>
         </div>
       );
     };
     
     render(
       <ThemeProvider initialMode="light">
         <TestComponent />
       </ThemeProvider>
     );
     
     expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
     
     await userEvent.click(screen.getByRole('button'));
     expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
   });
   ```

### Asynchronous Testing

1. **Testing async functions**:
   ```jsx
   it('loads data when mounted', async () => {
     // Mock API response
     server.use(
       http.get('/api/data', () => {
         return HttpResponse.json({ name: 'Test Data' });
       })
     );
     
     render(<DataComponent />);
     
     // Assert loading state
     expect(screen.getByTestId('loading')).toBeInTheDocument();
     
     // Wait for data
     await waitFor(() => {
       expect(screen.getByText('Test Data')).toBeInTheDocument();
     });
     
     // Loading indicator should be gone
     expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
   });
   ```

2. **Testing error states**:
   ```jsx
   it('shows error message when API fails', async () => {
     // Mock API error
     server.use(
       http.get('/api/data', () => {
         return HttpResponse.error();
       })
     );
     
     render(<DataComponent />);
     
     // Wait for error message
     await waitFor(() => {
       expect(screen.getByText('Failed to load data')).toBeInTheDocument();
     });
     
     // Verify retry button is present
     expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
   });
   ```

## Best Practices

### General Best Practices

1. **Independent tests**: Each test should be independent and not rely on the state from other tests.
2. **Arrange-Act-Assert pattern**: Structure tests with clear setup, action, and verification.
3. **Descriptive test names**: Test names should describe the behavior being tested.
4. **Test behavior, not implementation**: Focus on what the code does, not how it does it.
5. **One assertion per test**: Generally, aim for one core assertion per test (but multiple related assertions are ok).
6. **Keep tests DRY but clear**: Balance between code reuse and readability.
7. **Use the most specific query**: When selecting elements, use the most specific query possible.

### React Testing Best Practices

1. **Use React Testing Library queries appropriately**:
   - Prefer queries in this order:
     1. `getByRole` - Most accessible and recommended
     2. `getByLabelText` - Good for form fields
     3. `getByPlaceholderText` - Less reliable
     4. `getByText` - Good for non-interactive elements
     5. `getByTestId` - Last resort when no other queries work

2. **Use proper assert matchers**:
   - `toBeInTheDocument()` for presence
   - `toHaveTextContent()` for text content
   - `toBeDisabled()` for disabled state
   - `toHaveClass()` for class-based styling
   - `toHaveStyle()` for inline styles

3. **Test user interactions realistically**:
   - Use `userEvent` instead of `fireEvent` when possible
   - Simulate actual user behaviors (click, type, tab)
   - Consider keyboard navigation

4. **Add data-testid only when necessary**:
   - Use semantic HTML and ARIA roles when possible
   - Add data-testid only when other selectors won't work
   - Be consistent with data-testid naming

5. **Write accessible components and tests**:
   - Test with screen readers in mind
   - Verify proper ARIA attributes
   - Test keyboard navigation

### E2E Testing Best Practices

1. **Focus on critical paths**: Test the most important user journeys.
2. **Use stable selectors**: Prefer data-testid for E2E tests.
3. **Set up test data properly**: Don't rely on existing data.
4. **Clean up after tests**: Restore the application to its initial state.
5. **Handle asynchronous operations**: Wait for elements, network requests, animations.
6. **Isolate tests**: Each test should be independent and self-contained.
7. **Avoid excessive assertions**: Focus on key outcomes, not every detail.

### Performance Testing Best Practices

1. **Measure render performance**: Use React Profiler to identify slow components.
2. **Test lazy loading**: Verify components load when needed.
3. **Check memoization**: Ensure memoized components don't re-render unnecessarily.
4. **Benchmark critical operations**: Measure and set thresholds for important operations.
5. **Watch bundle size**: Monitor the impact of new features on bundle size.

## Test Data Management

1. **Use fixtures for test data**:
   ```jsx
   // src/tests/fixtures/users.js
   export const users = [
     { id: 1, name: 'John Doe', email: 'john@example.com' },
     { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
   ];
   ```

2. **Use factories for generating test data**:
   ```jsx
   // src/tests/fixtures/factories.js
   export const createUser = (overrides = {}) => ({
     id: Math.floor(Math.random() * 1000),
     name: 'Test User',
     email: 'test@example.com',
     role: 'user',
     ...overrides
   });
   ```

3. **Mock external dependencies consistently**:
   ```jsx
   // src/tests/mocks/services.js
   export const mockUserService = {
     getUsers: jest.fn().mockResolvedValue([
       { id: 1, name: 'John' },
       { id: 2, name: 'Jane' }
     ]),
     getUser: jest.fn().mockImplementation((id) => 
       Promise.resolve({ id, name: `User ${id}` })
     )
   };
   ```

## Common Testing Scenarios

### Forms Testing

```jsx
it('submits the form with valid data', async () => {
  const handleSubmit = jest.fn();
  render(<LoginForm onSubmit={handleSubmit} />);
  
  // Fill out form
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'password123');
  
  // Submit form
  await userEvent.click(screen.getByRole('button', { name: /login/i }));
  
  // Check form submission
  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  });
});
```

### Modal Testing

```jsx
it('opens and closes the modal', async () => {
  render(<ModalExample />);
  
  // Modal should be closed initially
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  
  // Open modal
  await userEvent.click(screen.getByRole('button', { name: /open modal/i }));
  
  // Modal should be open
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  // Close modal
  await userEvent.click(screen.getByRole('button', { name: /close/i }));
  
  // Modal should be closed
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
});
```

### Routing Testing

```jsx
it('navigates to the correct route', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </MemoryRouter>
  );
  
  // Should start at home page
  expect(screen.getByText(/welcome to the home page/i)).toBeInTheDocument();
  
  // Click navigation link
  await userEvent.click(screen.getByRole('link', { name: /about/i }));
  
  // Should navigate to about page
  expect(screen.getByText(/about us/i)).toBeInTheDocument();
});
```

## Testing Complex Components

### Testing with Context

```jsx
it('uses the context value', () => {
  const wrapper = ({ children }) => (
    <UserContext.Provider value={{ user: { name: 'John' } }}>
      {children}
    </UserContext.Provider>
  );
  
  render(<ProfileComponent />, { wrapper });
  
  expect(screen.getByText(/john/i)).toBeInTheDocument();
});
```

### Testing with Redux

```jsx
it('displays data from Redux store', () => {
  const initialState = {
    products: {
      items: [
        { id: 1, name: 'Product 1', price: 10 }
      ],
      loading: false
    }
  };
  
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState
  });
  
  render(
    <Provider store={store}>
      <ProductList />
    </Provider>
  );
  
  expect(screen.getByText('Product 1')).toBeInTheDocument();
  expect(screen.getByText('$10')).toBeInTheDocument();
});
```

## Troubleshooting Common Issues

### Dealing with Async Operations

```jsx
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByTestId('loading'));

// Find element that appears asynchronously
const element = await screen.findByText('Async Content');
```

### Testing Portal Components

```jsx
it('renders in portal', () => {
  // Setup portal container
  const portalRoot = document.createElement('div');
  portalRoot.setAttribute('id', 'portal-root');
  document.body.appendChild(portalRoot);
  
  render(<PortalComponent />);
  
  // Look for content in the portal
  const portalContent = within(portalRoot).getByText('Portal Content');
  expect(portalContent).toBeInTheDocument();
  
  // Cleanup
  document.body.removeChild(portalRoot);
});
```

### Testing Canvas Elements

```jsx
it('renders canvas with correct properties', () => {
  const mockContext = {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
  };
  
  HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
  
  render(<CanvasComponent width={100} height={100} />);
  
  const canvas = screen.getByTestId('canvas');
  expect(canvas).toHaveAttribute('width', '100');
  expect(canvas).toHaveAttribute('height', '100');
  expect(mockContext.fillRect).toHaveBeenCalled();
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Cypress Documentation](https://docs.cypress.io/)
- [MSW Documentation](https://mswjs.io/docs/)