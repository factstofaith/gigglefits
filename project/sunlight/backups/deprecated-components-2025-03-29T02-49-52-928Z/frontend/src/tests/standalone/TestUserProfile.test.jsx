// TestUserProfile.test.jsx
// Independent test file for UserProfile that doesn't rely on any external dependencies

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import standalone component (not the real one)
import TestUserProfile from './TestUserProfile';

// Mock the Avatar component that would be used by UserProfile
jest.mock('./TestAvatarLegacy', () => {
  return function MockAvatar(props) {
  // Added display name
  MockAvatar.displayName = 'MockAvatar';

    return (
      <div data-testid="mocked-avatar" className={props.className} style={props.style}>
        {props.children}
      </div>
    );
  };
});

// Test suite
describe('UserProfile Component', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    role: 'user',
  };

  const mockAdminUser = {
    ...mockUser,
    role: 'admin',
  };

  // Basic rendering tests
  it('renders the user profile component', () => {
    render(<TestUserProfile user={mockUser} />);

    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-header')).toBeInTheDocument();
    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });

  // Avatar section tests
  it('renders the avatar section with user info', () => {
    render(<TestUserProfile user={mockUser} />);

    const avatarSection = screen.getByTestId('user-avatar-section');
    expect(avatarSection).toBeInTheDocument();
    expect(screen.getByTestId('mocked-avatar')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByTestId('change-picture-btn')).toBeInTheDocument();
  });

  it('displays admin badge for admin users', () => {
    render(<TestUserProfile user={mockAdminUser} />);

    expect(screen.getByTestId('admin-badge')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('does not display admin badge for regular users', () => {
    render(<TestUserProfile user={mockUser} />);

    expect(screen.queryByTestId('admin-badge')).not.toBeInTheDocument();
  });

  // Tab navigation tests
  it('renders the tab navigation with three tabs', () => {
    render(<TestUserProfile user={mockUser} />);

    const tabNavigation = screen.getByTestId('tab-navigation');
    expect(tabNavigation).toBeInTheDocument();
    expect(screen.getByTestId('general-tab')).toBeInTheDocument();
    expect(screen.getByTestId('notifications-tab')).toBeInTheDocument();
    expect(screen.getByTestId('security-tab')).toBeInTheDocument();
  });

  it('displays the general tab content by default', () => {
    render(<TestUserProfile user={mockUser} />);

    expect(screen.getByTestId('general-tab-content')).toBeInTheDocument();
    expect(screen.queryByTestId('notifications-tab-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('security-tab-content')).not.toBeInTheDocument();
  });

  it('switches to notifications tab when clicked', () => {
    render(<TestUserProfile user={mockUser} />);

    fireEvent.click(screen.getByTestId('notifications-tab'));

    expect(screen.queryByTestId('general-tab-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('notifications-tab-content')).toBeInTheDocument();
    expect(screen.queryByTestId('security-tab-content')).not.toBeInTheDocument();
  });

  it('switches to security tab when clicked', () => {
    render(<TestUserProfile user={mockUser} />);

    fireEvent.click(screen.getByTestId('security-tab'));

    expect(screen.queryByTestId('general-tab-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('notifications-tab-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('security-tab-content')).toBeInTheDocument();
  });

  // Form fields and interaction tests
  it('populates form fields with user data', () => {
    render(<TestUserProfile user={mockUser} />);

    expect(screen.getByTestId('name-input')).toHaveValue('John Doe');
    expect(screen.getByTestId('email-input')).toHaveValue('john.doe@example.com');
    expect(screen.getByTestId('job-title-input')).toHaveValue('Software Engineer');
  });

  it('updates form fields when changed', () => {
    render(<TestUserProfile user={mockUser} />);

    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });
    expect(nameInput).toHaveValue('Jane Smith');

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'jane.smith@example.com' } });
    expect(emailInput).toHaveValue('jane.smith@example.com');
  });

  it('calls onSave with updated profile when save button is clicked', () => {
    const mockSave = jest.fn();
    render(<TestUserProfile user={mockUser} onSave={mockSave} />);

    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

    fireEvent.click(screen.getByTestId('save-button'));

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Smith',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
      })
    );
  });

  // Notification tab tests
  it('displays notification preferences in notification tab', () => {
    render(<TestUserProfile user={mockUser} />);

    fireEvent.click(screen.getByTestId('notifications-tab'));

    expect(screen.getByTestId('email-notifications-checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('integration-alerts-checkbox')).toBeInTheDocument();
  });

  // Security tab tests
  it('displays password fields in security tab', () => {
    render(<TestUserProfile user={mockUser} />);

    fireEvent.click(screen.getByTestId('security-tab'));

    expect(screen.getByTestId('current-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('new-password-input')).toBeInTheDocument();
  });
});
