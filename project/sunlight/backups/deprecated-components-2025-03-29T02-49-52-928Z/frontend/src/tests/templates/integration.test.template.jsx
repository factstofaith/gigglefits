// src/tests/templates/integration.test.template.jsx
import React from 'react';
import { render, screen, waitFor } from '../utils/test-utils';
import { setupUserEvent } from '../utils/user-event-setup';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Import components to test
// import { Component } from '@components/path/to/Component';

/**
 * Template for an integration test suite
 * 
 * How to use this template:
 * 1. Copy this file to the appropriate location
 * 2. Rename the file to match your component (e.g., LoginFlow.integration.test.jsx)
 * 3. Replace "Component" with your component name
 * 4. Uncomment the import statement and adjust the path
 * 5. Add your test cases
 * 6. Remove these instructions and other comments as needed
 */
describe('Component Integration', () => {
  // Test data loading from API
  it('loads and displays data from API', async () => {
    // Mock API response
    server.use(
      http.get('/api/example', () => {
        return HttpResponse.json([
          { id: 1, name: 'Example 1' },
          { id: 2, name: 'Example 2' },
        ]);
      })
    );
    
    render(<Component />);
    
    // Check for loading state
    // expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Example 1')).toBeInTheDocument();
      expect(screen.getByText('Example 2')).toBeInTheDocument();
    });
    
    // Loading indicator should be gone
    // expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  // Test error handling
  it('handles API errors gracefully', async () => {
    // Mock API error
    server.use(
      http.get('/api/example', () => {
        return HttpResponse.error();
      })
    );
    
    render(<Component />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
    
    // Check for retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  // Test form submission
  it('submits form data to API', async () => {
    const user = setupUserEvent();
    
    // Mock API for form submission
    const mockSubmit = jest.fn();
    server.use(
      http.post('/api/example', async ({ request }) => {
        const data = await request.json();
        mockSubmit(data);
        return HttpResponse.json({ success: true });
      })
    );
    
    render(<Component />);
    
    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'Test Name');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Check that form data was submitted correctly
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'Test Name',
        email: 'test@example.com',
      });
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });

  // Test component integration with context
  it('interacts with context correctly', async () => {
    const user = setupUserEvent();
    
    // Create a wrapper with context if needed
    const wrapper = ({ children }) => (
      <ExampleContext.Provider value={{ initialState: 'test' }}>
        {children}
      </ExampleContext.Provider>
    );
    
    render(<Component />, { wrapper });
    
    // Verify component uses context value
    expect(screen.getByText(/test/i)).toBeInTheDocument();
    
    // Interact with component to update context
    await user.click(screen.getByRole('button', { name: /update/i }));
    
    // Verify context was updated
    expect(screen.getByText(/updated/i)).toBeInTheDocument();
  });
});