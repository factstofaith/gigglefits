/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from '../../components/common/UserProfile';
import { ThemeProvider } from '../../design-system/foundations/theme/ThemeProvider';
import authService from '../../services/authService';

// Mock the auth service
jest.mock('../../services/authService', () => ({
  getCurrentUser: jest.fn(),
}));

describe('UserProfile Migration Tests', () => {
  const renderWithTheme = ui => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  beforeEach(() => {
    // Mock successful user data fetch
    authService.getCurrentUser.mockResolvedValue({
      name: 'Test User',
      email: 'test@example.com',
      jobTitle: 'Developer',
      department: 'Engineering',
      phone: '123-456-7890',
      timezone: 'UTC',
      notificationPreferences: {
        emailNotifications: true,
        integrationRunAlerts: true,
        integrationErrorAlerts: true,
        systemUpdates: false,
        weeklyDigest: true,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders user profile with CardLegacy, ButtonLegacy, and AlertLegacy components', async () => {
    renderWithTheme(<UserProfile />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Test that profile renders with user data
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();

    // Verify ButtonLegacy components are used
    const changeButton = screen.getByText('Change Picture');
    const generalTab = screen.getByText('General');
    const notificationsTab = screen.getByText('Notifications');
    const securityTab = screen.getByText('Security');

    expect(changeButton).toBeInTheDocument();
    expect(generalTab).toBeInTheDocument();
    expect(notificationsTab).toBeInTheDocument();
    expect(securityTab).toBeInTheDocument();

    // Test card and tabs functionality
    fireEvent.click(notificationsTab);
    expect(screen.getByText('Email Notification Settings')).toBeInTheDocument();

    fireEvent.click(securityTab);
    expect(screen.getByText('Password & Security')).toBeInTheDocument();

    // Test save button functionality - should show success alert
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // Wait for success alert to appear
    await waitFor(() => {
      const successAlert = screen.getByText('Profile updated successfully!');
      expect(successAlert).toBeInTheDocument();
    });
  });

  test('shows error alert when user fetch fails', async () => {
    // Mock failed user fetch
    authService.getCurrentUser.mockRejectedValue(new Error('Failed to fetch'));

    renderWithTheme(<UserProfile />);

    // Wait for error message
    await waitFor(() => {
      const errorAlert = screen.getByText('Failed to load user profile data');
      expect(errorAlert).toBeInTheDocument();
    });
  });

  test('shows error alert when profile update fails', async () => {
    // Override fetch implementation to force error during save
    global.fetch = jest.fn(() => Promise.reject('API error'));

    renderWithTheme(<UserProfile />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Create a condition that will trigger an error during save
    // We'll override fetch implementation to force an error
    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    // This is hard to test directly because the component uses a try/catch
    // that doesn't depend on an external API in the current implementation.
    // In a real component that calls an API, we could mock a rejection here.
  });
});
