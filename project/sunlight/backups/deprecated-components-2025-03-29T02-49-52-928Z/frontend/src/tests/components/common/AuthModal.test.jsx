// tests/components/common/AuthModal.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import authService from '@services/authService';

// Mock the Dialog components
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

jest.mock('../../../design-system/legacy/DialogTitleLegacy', () => {
  return ({ children }) => <div data-testid="mock-dialog-title">{children}</div>;
});

jest.mock('../../../design-system/legacy/DialogContentLegacy', () => {
  return ({ children }) => <div data-testid="mock-dialog-content">{children}</div>;
});

jest.mock('../../../design-system/legacy/DialogActionsLegacy', () => {
  return ({ children }) => <div data-testid="mock-dialog-actions">{children}</div>;
});

// Import AuthModal after mocks are set up
const AuthModal = require('../../../components/common/AuthModal').default;

// Mock the authService
jest.mock('../../../services/authService', () => ({
  login: jest.fn(),
  loginWithOffice365: jest.fn(),
  loginWithGmail: jest.fn(),
}));

// Mock the accessibilityUtils
jest.mock('../../../utils/accessibilityUtils', () => ({
  announceToScreenReader: jest.fn(),
  getFormControlProps: jest.fn().mockImplementation(() => ({
    inputProps: {},
    labelProps: {},
  })),
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Required when testing components that use navigate
const renderWithRouter = ui => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AuthModal', () => {
  const mockOnClose = jest.fn();
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    authService.login.mockResolvedValue({ username: 'testuser', role: 'user' });
    authService.loginWithOffice365.mockResolvedValue({ username: 'office365user', role: 'user' });
    authService.loginWithGmail.mockResolvedValue({ username: 'gmailuser', role: 'user' });
  });

  it('renders the login form by default', () => {
    renderWithRouter(
      <AuthModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
    );

    // Check that login components are visible
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByText('Register here')).toBeInTheDocument();
    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();

    // External auth providers should be visible
    expect(screen.getByText(/Or sign in with/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with Microsoft/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with Gmail/i })).toBeInTheDocument();
  });

  it('toggles between login and register modes', () => {
    renderWithRouter(
      <AuthModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
    );

    // Initially in login mode
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();

    // Click on register link
    fireEvent.click(screen.getByText('Register here'));

    // Now should be in register mode
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByText('Login here')).toBeInTheDocument();

    // Additional confirm password field should be visible
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();

    // Button text should change
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('handles standard login process', async () => {
    renderWithRouter(
      <AuthModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
    );

    // Fill in login form
    fireEvent.change(screen.getByLabelText(/Username or Email/i), {
      target: { value: 'testuser@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'testpassword' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Wait for login to complete
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('testuser@example.com', 'testpassword');
      expect(mockOnLoginSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles password mismatch in registration', async () => {
    renderWithRouter(
      <AuthModal
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
        initialMode="register&quot;
      />
    );

    // Fill in registration form with mismatched passwords
    fireEvent.change(screen.getByLabelText(/Username or Email/i), {
      target: { value: "newuser@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/^Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: 'password456' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  it('handles Office 365 login', async () => {
    renderWithRouter(
      <AuthModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
    );

    // Click on Office 365 login button
    fireEvent.click(screen.getByRole('button', { name: /Sign in with Microsoft/i }));

    // Wait for login to complete
    await waitFor(() => {
      expect(authService.loginWithOffice365).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles Gmail login', async () => {
    renderWithRouter(
      <AuthModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
    );

    // Click on Gmail login button
    fireEvent.click(screen.getByRole('button', { name: /Sign in with Gmail/i }));

    // Wait for login to complete
    await waitFor(() => {
      expect(authService.loginWithGmail).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles login errors', async () => {
    authService.login.mockRejectedValue(new Error('Invalid credentials'));

    renderWithRouter(
      <AuthModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
    );

    // Fill in login form
    fireEvent.change(screen.getByLabelText(/Username or Email/i), {
      target: { value: 'wronguser@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      expect(mockOnLoginSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('handles closing with close button', () => {
    renderWithRouter(
      <AuthModal isOpen={true} onClose={mockOnClose} onLoginSuccess={mockOnLoginSuccess} />
    );

    // Click close button
    fireEvent.click(screen.getByLabelText('Close dialog'));

    // Should call onClose
    expect(mockOnClose).toHaveBeenCalled();
  });
});
