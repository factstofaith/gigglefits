import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import UserProfile from '@components/common/UserProfile';
import authService from '@services/authService';

// Mock authService
jest.mock('../../../services/authService', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock the dialog components
jest.mock('../../../design-system/legacy/DialogLegacy', () => {
  return ({ children, open, onClose }) =>
    open ? (
      <div role="dialog&quot; data-testid="mock-dialog">
        <button onClick={onClose} aria-label="Close dialog">
          Close
        </button>
        {children}
      </div>
    ) : null;
});

// Mock theme provider for legacy components that need theme context
jest.mock('../../../design-system/foundations/theme/ThemeProvider', () => {
  return {
    ThemeProvider: ({ children }) => <div data-testid="mock-theme-provider">{children}</div>,
  };
});

describe('UserProfile Component', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    phone: '555-1234',
    timezone: 'America/New_York',
    role: 'admin',
    notificationPreferences: {
      emailNotifications: true,
      integrationRunAlerts: true,
      integrationErrorAlerts: true,
      systemUpdates: false,
      weeklyDigest: true,
    },
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Default mock implementation
    authService.getCurrentUser.mockResolvedValue(mockUser);
  });

  it('renders loading state initially', () => {
    render(<UserProfile />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders user profile data after loading', async () => {
    render(<UserProfile />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify user data is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();

    // Admin badge should be shown
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows notification settings when clicking on Notifications tab', async () => {
    render(<UserProfile />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click on Notifications tab
    fireEvent.click(screen.getByText('Notifications'));

    // Verify notification settings are displayed
    expect(screen.getByText('Email Notification Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Integration Run Alerts')).toBeInTheDocument();
  });

  it('shows security settings when clicking on Security tab', async () => {
    render(<UserProfile />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Click on Security tab
    fireEvent.click(screen.getByText('Security'));

    // Verify security settings are displayed
    expect(screen.getByText('Password & Security')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<UserProfile />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Update a field
    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));

    // Verify saving state shows
    expect(screen.getByText('Saving...')).toBeInTheDocument();

    // Wait for save to complete
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    // Verify success message appears
    expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
  });

  it('shows error message when user data fails to load', async () => {
    // Mock error case
    authService.getCurrentUser.mockRejectedValue(new Error('Failed to load'));

    render(<UserProfile />);

    // Wait for loading to complete with error
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify error message
    expect(screen.getByText('Failed to load user profile data')).toBeInTheDocument();
  });
});
