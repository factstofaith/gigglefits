// InvitationForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import InvitationForm from '@components/admin/InvitationForm';
import { invitationService } from '@services/userManagementService';

// Mock the invitationService
jest.mock('../../../services/userManagementService', () => ({
  invitationService: {
    createInvitation: jest.fn()
  }
}));

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock setTimeout
jest.useFakeTimers();

// Helper function to render component with router
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
    
    // Set up default successful response
    invitationService.createInvitation.mockResolvedValue({
      success: true,
      invitation: {
        id: 'inv123',
        email: 'test@example.com',
        role: 'USER',
        status: 'PENDING'
      }
    });
  });

  test('renders invitation form correctly', () => {
    renderWithRouter(<InvitationForm />);
    
    // Check that the form title is displayed
    expect(screen.getByText('New Invitation')).toBeInTheDocument();
    
    // Check that form fields are displayed
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expiration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Custom Message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Send reminder/i)).toBeInTheDocument();
    
    // Check that action buttons are displayed
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Invitation/i })).toBeInTheDocument();
  });

  test('validates form fields on submission', async () => {
    renderWithRouter(<InvitationForm />);
    
    // Submit with empty email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: '' } });
    
    // Click submit button
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);
    
    // Check that validation error is displayed
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    
    // Check that invitationService was not called
    expect(invitationService.createInvitation).not.toHaveBeenCalled();
  });

  test('validates email format', async () => {
    renderWithRouter(<InvitationForm />);
    
    // Enter invalid email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Click submit button
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);
    
    // Check that validation error is displayed
    expect(await screen.findByText('Email is invalid')).toBeInTheDocument();
    
    // Check that invitationService was not called
    expect(invitationService.createInvitation).not.toHaveBeenCalled();
  });

  test('submits form successfully', async () => {
    renderWithRouter(<InvitationForm />);
    
    // Fill out form
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Select ADMIN role
    const adminRadio = screen.getByLabelText(/Admin/i);
    fireEvent.click(adminRadio);
    
    // Select expiration
    const expirationSelect = screen.getByLabelText(/Expiration/i);
    fireEvent.mouseDown(expirationSelect);
    const optionElement = await screen.findByText('72 hours');
    fireEvent.click(optionElement);
    
    // Add custom message
    const messageInput = screen.getByLabelText(/Custom Message/i);
    fireEvent.change(messageInput, { target: { value: 'Please join our platform' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);
    
    // Check that invitationService was called with correct data
    await waitFor(() => {
      expect(invitationService.createInvitation).toHaveBeenCalledWith({
        email: 'test@example.com',
        role: 'ADMIN',
        expiration_hours: 72,
        custom_message: 'Please join our platform',
        send_reminder: true
      });
    });
    
    // Check that success message is displayed
    expect(await screen.findByText('Invitation sent to test@example.com')).toBeInTheDocument();
    
    // Check that form is reset
    await waitFor(() => {
      expect(emailInput.value).toBe('');
    });
    
    // Fast-forward timer to trigger navigation
    jest.advanceTimersByTime(2000);
    
    // Check that navigation happened
    expect(mockNavigate).toHaveBeenCalledWith('/admin/invitations');
  });

  test('toggles send reminder checkbox', async () => {
    renderWithRouter(<InvitationForm />);
    
    // Find the checkbox (should be checked by default)
    const reminderCheckbox = screen.getByLabelText(/Send reminder/i);
    expect(reminderCheckbox).toBeChecked();
    
    // Uncheck it
    fireEvent.click(reminderCheckbox);
    expect(reminderCheckbox).not.toBeChecked();
    
    // Fill required fields
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);
    
    // Check that invitationService was called with send_reminder: false
    await waitFor(() => {
      expect(invitationService.createInvitation).toHaveBeenCalledWith(
        expect.objectContaining({
          send_reminder: false
        })
      );
    });
  });

  test('handles API error on submission', async () => {
    // Mock API error
    invitationService.createInvitation.mockRejectedValue({
      response: {
        data: {
          message: 'User with this email already exists'
        }
      }
    });
    
    renderWithRouter(<InvitationForm />);
    
    // Fill required fields
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);
    
    // Check that error message is displayed
    expect(await screen.findByText('User with this email already exists')).toBeInTheDocument();
    
    // Check that form data is not cleared
    expect(emailInput.value).toBe('existing@example.com');
  });

  test('navigates to invitation list on cancel', () => {
    renderWithRouter(<InvitationForm />);
    
    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    // Check that navigation happened
    expect(mockNavigate).toHaveBeenCalledWith('/admin/invitations');
  });

  test('clears field-specific errors when field is modified', async () => {
    renderWithRouter(<InvitationForm />);
    
    // Submit with empty email to trigger validation error
    const submitButton = screen.getByRole('button', { name: /Send Invitation/i });
    fireEvent.click(submitButton);
    
    // Check that error is displayed
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    
    // Now enter a valid email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Check that error is no longer displayed
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });
});