// UserProfile.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import UserProfile from '@components/profile/UserProfile';

// Mock the UserContext
const mockUpdateUserProfile = jest.fn();
const mockClearAuthError = jest.fn();
const mockUser = {
  id: 'user123',
  email: 'user@example.com',
  full_name: 'Test User',
  client_company: 'Test Company',
  zoho_account: 'test_zoho',
  position: 'Developer',
  department: 'Engineering',
  phone_number: '123-456-7890',
  address: '123 Test St',
  role: 'USER'
};

jest.mock('../../../contexts/UserContext', () => ({
  useUser: () => ({
    user: mockUser,
    updateUserProfile: mockUpdateUserProfile,
    authError: null,
    clearAuthError: mockClearAuthError,
    isLoading: false
  })
}));

// Mock URL.createObjectURL for image preview
URL.createObjectURL = jest.fn(() => 'mock-image-url');
URL.revokeObjectURL = jest.fn();

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

describe('UserProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user profile information correctly', () => {
    renderWithRouter(<UserProfile />);
    
    // Check if user information is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    
    // Check if profile tabs are rendered
    expect(screen.getByText('Personal Details')).toBeInTheDocument();
    expect(screen.getByText('Business Information')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    
    // Check if edit button is present
    expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
  });

  test('enables edit mode when Edit Profile button is clicked', () => {
    renderWithRouter(<UserProfile />);
    
    // Initially in view mode
    const editButton = screen.getByRole('button', { name: /Edit Profile/i });
    expect(editButton).toBeInTheDocument();
    
    // All fields should be disabled
    const fullNameField = screen.getByLabelText('Full Name');
    expect(fullNameField).toBeDisabled();
    
    // Click edit button
    fireEvent.click(editButton);
    
    // Should now show Save and Cancel buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    
    // Fields should be enabled
    expect(fullNameField).not.toBeDisabled();
  });

  test('pre-populates form fields with user data', () => {
    renderWithRouter(<UserProfile />);
    
    // Check if form fields are populated with user data
    expect(screen.getByLabelText('Full Name')).toHaveValue('Test User');
    expect(screen.getByLabelText('Email')).toHaveValue('user@example.com');
    
    // Switch to Business Information tab
    fireEvent.click(screen.getByText('Business Information'));
    
    // Check business information fields
    expect(screen.getByLabelText('Client Company')).toHaveValue('Test Company');
    expect(screen.getByLabelText('Zoho Account')).toHaveValue('test_zoho');
    expect(screen.getByLabelText('Position/Role')).toHaveValue('Developer');
    expect(screen.getByLabelText('Department')).toHaveValue('Engineering');
    
    // Switch to Contact Information tab
    fireEvent.click(screen.getByText('Contact Information'));
    
    // Check contact information fields
    expect(screen.getByLabelText('Phone Number')).toHaveValue('123-456-7890');
    expect(screen.getByLabelText('Address')).toHaveValue('123 Test St');
  });

  test('updates profile when Save button is clicked', async () => {
    renderWithRouter(<UserProfile />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    
    // Update full name
    const fullNameField = screen.getByLabelText('Full Name');
    fireEvent.change(fullNameField, { target: { value: 'Updated Name' } });
    
    // Switch to Business Information tab and update
    fireEvent.click(screen.getByText('Business Information'));
    const companyField = screen.getByLabelText('Client Company');
    fireEvent.change(companyField, { target: { value: 'Updated Company' } });
    
    // Save the changes
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    
    // Check if updateUserProfile was called with the correct data
    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'Updated Name',
          client_company: 'Updated Company'
        })
      );
    });
  });

  test('cancels edit mode without saving changes', () => {
    renderWithRouter(<UserProfile />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    
    // Update full name
    const fullNameField = screen.getByLabelText('Full Name');
    fireEvent.change(fullNameField, { target: { value: 'Changed Name' } });
    
    // Cancel edit mode
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Should return to view mode
    expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
    
    // Value should be reset to original
    expect(screen.getByLabelText('Full Name')).toHaveValue('Test User');
    
    // updateUserProfile should not be called
    expect(mockUpdateUserProfile).not.toHaveBeenCalled();
  });

  test('displays profile completeness correctly', () => {
    renderWithRouter(<UserProfile />);
    
    // Check if profile completeness indicator is present
    expect(screen.getByText(/Profile Completeness:/i)).toBeInTheDocument();
    
    // With all the fields filled, it should be near 100%
    expect(screen.getByText(/Profile Completeness: \d+%/i).textContent).toMatch(/Profile Completeness: [8-9]\d%|Profile Completeness: 100%/);
  });

  test('validates required fields before saving', async () => {
    renderWithRouter(<UserProfile />);
    
    // Enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    
    // Clear required fields
    const fullNameField = screen.getByLabelText('Full Name');
    fireEvent.change(fullNameField, { target: { value: '' } });
    
    // Switch to Business Information tab and clear required field
    fireEvent.click(screen.getByText('Business Information'));
    const companyField = screen.getByLabelText('Client Company');
    fireEvent.change(companyField, { target: { value: '' } });
    
    // Try to save
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Full name is required')).toBeInTheDocument();
      expect(screen.getByText('Client company is required')).toBeInTheDocument();
    });
    
    // updateUserProfile should not be called
    expect(mockUpdateUserProfile).not.toHaveBeenCalled();
  });

  test('navigates to security settings when button is clicked', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    renderWithRouter(<UserProfile />);
    
    // Click the security settings button
    fireEvent.click(screen.getByRole('button', { name: /Manage Security Settings/i }));
    
    // Should navigate to security settings
    expect(mockNavigate).toHaveBeenCalledWith('/profile/security');
  });
});