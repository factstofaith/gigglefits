/**
 * Mock Factory Example Test
 * 
 * This file demonstrates how to use the Mock Factory and test data generators
 * in tests.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import mockFactory from '../utils/mockFactory';

// Example component for demonstration
const UserList = ({ users, onUserClick }) => (
  <div>
    <h1>User List</h1>
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onUserClick(user)}>
          {user.name} ({user.email})
        </li>
      ))}
    </ul>
  </div>
);

// Example test demonstrating mock factory usage
describe('Mock Factory Example', () => {
  it('renders a list of users from mock factory', () => {
    // Use mock factory to create test data
    const users = mockFactory.createUserList(3);
    const handleUserClick = jest.fn();
    
    // Render component with mock data
    render(<UserList users={users} onUserClick={handleUserClick} />);
    
    // Verify component rendered correctly
    expect(screen.getByText('User List')).toBeInTheDocument();
    
    // All users should be displayed
    users.forEach(user => {
      expect(screen.getByText(`${user.name} (${user.email})`)).toBeInTheDocument();
    });
    
    // Test interaction
    fireEvent.click(screen.getByText(`${users[0].name} (${users[0].email})`));
    expect(handleUserClick).toHaveBeenCalledWith(users[0]);
  });
  
  it('works with context providers', () => {
    // Create a mock context
    const userContext = mockFactory.createUserContext({
      isAdmin: true
    });
    
    // Verify context data is correctly generated
    expect(userContext.isAuthenticated).toBe(true);
    expect(userContext.user.role).toBe('admin');
    expect(typeof userContext.login).toBe('function');
    
    // In a real test, you would use this with a context provider
    // Example:
    // render(
    //   <UserContext.Provider value={userContext}>
    //     <UserProfile />
    //   </UserContext.Provider>
    // );
  });
  
  it('works with integration flow data', () => {
    // Create a complex integration flow
    const flow = mockFactory.createComplexFlow();
    
    // Verify flow data structure
    expect(flow.nodes).toHaveLength(9); // Source, transform, destination, etc.
    expect(flow.edges).toHaveLength(9); // Connections between nodes
    
    // Check node types
    const nodeTypes = flow.nodes.map(node => node.data.nodeType);
    expect(nodeTypes).toContain('source');
    expect(nodeTypes).toContain('transform');
    expect(nodeTypes).toContain('destination');
    
    // In a real test, you would use this with a flow component
    // Example:
    // render(<IntegrationFlowCanvas nodes={flow.nodes} edges={flow.edges} />);
  });
  
  it('works with UI state data', () => {
    // Create form validation errors
    const validationState = mockFactory.createFormValidationErrors({
      email: true,
      password: true
    });
    
    // Verify validation state
    expect(validationState.isValid).toBe(false);
    expect(validationState.errors.email).toBe('Please enter a valid email address');
    expect(validationState.errors.password).toBe('Password must be at least 8 characters');
    
    // Create loading state
    const loadingState = mockFactory.createLoadingState(['form']);
    expect(typeof loadingState.isLoading).toBe('boolean');
    expect(typeof loadingState.componentLoading.form).toBe('boolean');
    
    // Create toast notifications
    const toast = mockFactory.createToast('success', 'Operation completed');
    expect(toast.type).toBe('success');
    expect(toast.message).toBe('Operation completed');
    
    // In a real test, you would use this with UI components
    // Example:
    // render(<Form errors={validationState.errors} />);
  });
  
  it('works with API response mocks', () => {
    // Create a success response
    const successResponse = mockFactory.createSuccessResponse({ id: 1, name: 'Test' });
    expect(successResponse.status).toBe(200);
    expect(successResponse.data.name).toBe('Test');
    
    // Create an error response
    const errorResponse = mockFactory.createErrorResponse(404, 'Not Found');
    expect(errorResponse.response.status).toBe(404);
    expect(errorResponse.response.data.error).toBe('Not Found');
    
    // In a real test, you would use this with API service mocks
    // Example:
    // axios.get.mockResolvedValue(successResponse);
  });
});