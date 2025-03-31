// InvitationForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Create mock services
const mockUserManagementService = {
  createInvitation: jest.fn(),
  getUserList: jest.fn(),
  checkEmailExists: jest.fn(),
};

jest.mock('../../../services/userManagementService', () => ({
  __esModule: true,
  default: () => mockUserManagementService
}));

// Mock notification context
const mockNotify = jest.fn();
const mockNotificationContext = {
  notify: mockNotify,
};

jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => mockNotificationContext
}));

// Mock user context for admin check
const mockUserContext = {
  isAdmin: true,
  user: { id: 'admin123', name: 'Admin User', role: 'ADMIN' }
};

jest.mock('../../../contexts/UserContext', () => ({
  useUser: () => mockUserContext
}));

// Import component after mocks
import InvitationForm from '@components/invitation/InvitationForm';

// Helper to render the component
const renderWithRouter = (ui) => {
  // Added display name
  renderWithRouter.displayName = 'renderWithRouter';

  // Added display name
  renderWithRouter.displayName = 'renderWithRouter';

  // Added display name
  renderWithRouter.displayName = 'renderWithRouter';

  // Added display name
  renderWithRouter.displayName = 'renderWithRouter';

  // Added display name
  renderWithRouter.displayName = 'renderWithRouter';


  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('InvitationForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockUserManagementService.createInvitation.mockResolvedValue({
      success: true,
      data: {
        id: 'inv123',
        email: 'newuser@example.com',
        status: 'PENDING',
        role: 'USER',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      }
    });
    
    mockUserManagementService.checkEmailExists.mockResolvedValue({
      exists: false
    });
  });

  test('renders invitation form correctly', () => {
    renderWithRouter(<InvitationForm />);
    
    // Form title and elements
    expect(screen.getByText(/Invite New User/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expiration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Personal Message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Invitation/i })).toBeInTheDocument();
  });

  test('validates email format', async () => {
    renderWithRouter(<InvitationForm />);
    
    // Enter invalid email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    // Should show validation error
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    
    // Enter valid email
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.blur(emailInput);
    
    // Validation error should be gone
    expect(screen.queryByText(/Please enter a valid email address/i)).not.toBeInTheDocument();
  });

  test('checks if email already exists', async () => {
    // Setup mock to return that email exists
    mockUserManagementService.checkEmailExists.mockResolvedValue({
      exists: true
    });
    
    renderWithRouter(<InvitationForm />);
    
    // Enter email that already exists
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.blur(emailInput);
    
    // Should call check email service
    await waitFor(() => {
      expect(mockUserManagementService.checkEmailExists).toHaveBeenCalledWith('existing@example.com');
    });
    
    // Should show validation error
    expect(screen.getByText(/User with this email already exists/i)).toBeInTheDocument();
  });

  test('submits invitation successfully', async () => {
    renderWithRouter(<InvitationForm />);
    
    // Fill out the form
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    
    const roleSelect = screen.getByLabelText(/Role/i);
    fireEvent.change(roleSelect, { target: { value: 'USER' } });
    
    const expirationSelect = screen.getByLabelText(/Expiration/i);
    fireEvent.change(expirationSelect, { target: { value: '48' } });
    
    const messageInput = screen.getByLabelText(/Personal Message/i);
    fireEvent.change(messageInput, { target: { value: 'Welcome to our platform!' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);
    
    // Should call create invitation service
    await waitFor(() => {
      expect(mockUserManagementService.createInvitation).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        role: 'USER',
        expiration_hours: '48',
        custom_message: 'Welcome to our platform!'
      });
    });
    
    // Should show success notification
    expect(mockNotify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Invitation Sent'),
        message: expect.stringContaining('newuser@example.com'),
        type: 'success'
      })
    );
    
    // Form should be reset
    expect(emailInput.value).toBe('');
    expect(messageInput.value).toBe('');
  });

  test('handles submission errors', async () => {
    // Setup error response
    mockUserManagementService.createInvitation.mockResolvedValue({
      success: false,
      error: 'Failed to send invitation'
    });
    
    renderWithRouter(<InvitationForm />);
    
    // Fill out the form
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);
    
    // Should show error notification
    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Error'),
          message: expect.stringContaining('Failed to send invitation'),
          type: 'error'
        })
      );
    });
  });

  test('handles API connection errors', async () => {
    // Setup API error
    mockUserManagementService.createInvitation.mockRejectedValue(
      new Error('Network error')
    );
    
    renderWithRouter(<InvitationForm />);
    
    // Fill out the form
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);
    
    // Should show error notification
    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Error'),
          message: expect.stringContaining('Network error'),
          type: 'error'
        })
      );
    });
  });

  test('blocks non-admin users from using the form', () => {
    // Temporarily modify the mock to simulate non-admin user
    const originalIsAdmin = mockUserContext.isAdmin;
    mockUserContext.isAdmin = false;
    
    renderWithRouter(<InvitationForm />);
    
    // Should show access denied message
    expect(screen.getByText(/You don't have permission to access this feature/i)).toBeInTheDocument();
    expect(screen.queryByText(/Invite New User/i)).not.toBeInTheDocument();
    
    // Restore original value
    mockUserContext.isAdmin = originalIsAdmin;
  });

  test('disables submit button during form submission', async () => {
    // Setup delayed resolution
    mockUserManagementService.createInvitation.mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              id: 'inv123',
              email: 'newuser@example.com',
              status: 'PENDING'
            }
          });
        }, 100);
      });
    });
    
    renderWithRouter(<InvitationForm />);
    
    // Fill out the form
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);
    
    // Button should be disabled
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/Sending.../i);
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(mockUserManagementService.createInvitation).toHaveBeenCalled();
    });
    
    // Button should be enabled again
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent(/Send Invitation/i);
  });
});