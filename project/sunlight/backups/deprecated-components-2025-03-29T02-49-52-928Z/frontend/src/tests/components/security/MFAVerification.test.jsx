// MFAVerification.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Create mock auth service
const mockAuthService = {
  verifyMFACode: jest.fn(),
  verifyRecoveryCode: jest.fn(),
  getCurrentUser: jest.fn(),
  getAuthToken: jest.fn(),
};

jest.mock('../../../services/authService', () => ({
  __esModule: true,
  default: () => mockAuthService
}));

// Mock the context
const mockSetUser = jest.fn();
const mockUserContext = {
  setUser: mockSetUser,
};

jest.mock('../../../contexts/UserContext', () => ({
  useUser: () => mockUserContext
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: {
      userId: '123',
      email: 'test@example.com',
      returnUrl: '/dashboard'
    }
  }),
}));

// Import component after mocks
import MFAVerification from '@components/security/MFAVerification';

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

describe('MFAVerification Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockAuthService.verifyMFACode.mockResolvedValue({
      success: true,
      data: {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          mfa_enabled: true
        }
      }
    });
    
    mockAuthService.verifyRecoveryCode.mockResolvedValue({
      success: true,
      data: {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
          mfa_enabled: true
        }
      }
    });
    
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      mfa_enabled: true
    });
  });

  test('renders MFA verification screen', () => {
    renderWithRouter(<MFAVerification />);
    
    // Should show verification form
    expect(screen.getByText(/Two-Factor Authentication/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter the 6-digit code from your authenticator app/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify/i })).toBeInTheDocument();
    expect(screen.getByText(/Lost your device/i)).toBeInTheDocument();
  });

  test('handles valid verification code submission', async () => {
    renderWithRouter(<MFAVerification />);
    
    // Enter verification code
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    // Submit verification
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(mockAuthService.verifyMFACode).toHaveBeenCalledWith(
        '123',
        '123456'
      );
    });
    
    // Should update user context
    expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
      id: '123',
      name: 'Test User',
      email: 'test@example.com'
    }));
    
    // Should navigate to return URL
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('handles invalid verification code', async () => {
    // Setup error response
    mockAuthService.verifyMFACode.mockResolvedValue({
      success: false,
      error: 'Invalid verification code'
    });
    
    renderWithRouter(<MFAVerification />);
    
    // Enter verification code
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '000000' } });
    
    // Submit verification
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid verification code/i)).toBeInTheDocument();
    });
    
    // Should not call setUser or navigate
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('switches to recovery code mode', async () => {
    renderWithRouter(<MFAVerification />);
    
    // Click on recovery code link
    const recoveryLink = screen.getByText(/Use a recovery code/i);
    fireEvent.click(recoveryLink);
    
    // Should show recovery code form
    await waitFor(() => {
      expect(screen.getByText(/Enter a recovery code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Recovery Code/i)).toBeInTheDocument();
    });
  });

  test('handles valid recovery code submission', async () => {
    renderWithRouter(<MFAVerification />);
    
    // Switch to recovery code mode
    const recoveryLink = screen.getByText(/Use a recovery code/i);
    fireEvent.click(recoveryLink);
    
    // Wait for recovery code form
    await waitFor(() => {
      expect(screen.getByLabelText(/Recovery Code/i)).toBeInTheDocument();
    });
    
    // Enter recovery code
    const recoveryInput = screen.getByLabelText(/Recovery Code/i);
    fireEvent.change(recoveryInput, { target: { value: 'ABCD-1234-EFGH-5678' } });
    
    // Submit recovery code
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(mockAuthService.verifyRecoveryCode).toHaveBeenCalledWith(
        '123',
        'ABCD-1234-EFGH-5678'
      );
    });
    
    // Should update user context
    expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({
      id: '123',
      name: 'Test User',
      email: 'test@example.com'
    }));
    
    // Should navigate to return URL
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('handles invalid recovery code', async () => {
    // Setup error response
    mockAuthService.verifyRecoveryCode.mockResolvedValue({
      success: false,
      error: 'Invalid recovery code'
    });
    
    renderWithRouter(<MFAVerification />);
    
    // Switch to recovery code mode
    const recoveryLink = screen.getByText(/Use a recovery code/i);
    fireEvent.click(recoveryLink);
    
    // Wait for recovery code form
    await waitFor(() => {
      expect(screen.getByLabelText(/Recovery Code/i)).toBeInTheDocument();
    });
    
    // Enter recovery code
    const recoveryInput = screen.getByLabelText(/Recovery Code/i);
    fireEvent.change(recoveryInput, { target: { value: 'INVALID-CODE' } });
    
    // Submit recovery code
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid recovery code/i)).toBeInTheDocument();
    });
    
    // Should not call setUser or navigate
    expect(mockSetUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('switches back to verification code mode', async () => {
    renderWithRouter(<MFAVerification />);
    
    // Switch to recovery code mode
    const recoveryLink = screen.getByText(/Use a recovery code/i);
    fireEvent.click(recoveryLink);
    
    // Wait for recovery code form
    await waitFor(() => {
      expect(screen.getByText(/Enter a recovery code/i)).toBeInTheDocument();
    });
    
    // Switch back to verification code mode
    const backLink = screen.getByText(/Back to verification code/i);
    fireEvent.click(backLink);
    
    // Should show verification form again
    await waitFor(() => {
      expect(screen.getByText(/Enter the 6-digit code from your authenticator app/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
  });

  test('handles API errors during verification', async () => {
    // Setup API error
    mockAuthService.verifyMFACode.mockRejectedValue(
      new Error('Failed to connect to server')
    );
    
    renderWithRouter(<MFAVerification />);
    
    // Enter verification code
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    // Submit verification
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Error during verification/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to connect to server/i)).toBeInTheDocument();
    });
  });
});