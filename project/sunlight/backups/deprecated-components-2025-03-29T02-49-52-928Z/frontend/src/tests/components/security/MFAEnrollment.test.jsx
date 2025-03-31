// MFAEnrollment.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock UserContext
const mockEnrollMfa = jest.fn();
const mockVerifyMfa = jest.fn();
const mockGetRecoveryCodes = jest.fn();
const mockClearMfaError = jest.fn();

jest.mock('../../../contexts/UserContext', () => ({
  useUser: () => ({
    enrollMfa: mockEnrollMfa,
    verifyMfa: mockVerifyMfa,
    getRecoveryCodes: mockGetRecoveryCodes,
    clearMfaError: mockClearMfaError,
    mfaEnabled: false,
    mfaError: null
  })
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
});

// Mock URL operations for downloading recovery codes
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement and related methods for download operation
const mockAnchorElement = {
  href: '',
  download: '',
  click: jest.fn(),
};
document.createElement = jest.fn().mockImplementation((tag) => {
  if (tag === 'a') return mockAnchorElement;
  return document.createElement(tag);
});
document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

// Import component after mocks
import MFAEnrollment from '@components/security/MFAEnrollment';

// Helper to render component
const renderWithRouter = (ui, props = {}) => {
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


  return render(
    <BrowserRouter>
      {React.cloneElement(ui, props)}
    </BrowserRouter>
  );
};

describe('MFAEnrollment Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock enrollment response
    mockEnrollMfa.mockResolvedValue({
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      secret: 'ABCDEFGHIJKLMNOP'
    });
    
    // Mock verification response
    mockVerifyMfa.mockResolvedValue({ success: true });
    
    // Mock recovery codes response
    mockGetRecoveryCodes.mockResolvedValue({
      recoveryCodes: [
        '12345678', '23456789', '34567890',
        '45678901', '56789012', '67890123',
        '78901234', '89012345', '90123456',
        '01234567'
      ]
    });
  });

  test('renders QR code and verification form initially', async () => {
    renderWithRouter(<MFAEnrollment />);
    
    // Should call enrollment API
    expect(mockEnrollMfa).toHaveBeenCalled();
    
    // Wait for QR code to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Set Up Authenticator App/i)).toBeInTheDocument();
    });
    
    // Should display QR code
    const qrCodeImage = screen.getByAltText(/QR Code for MFA setup/i);
    expect(qrCodeImage).toBeInTheDocument();
    expect(qrCodeImage.src).toContain('data:image/png;base64,');
    
    // Should display manual key
    expect(screen.getByText(/Or manually enter this key in your app:/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('ABCDEFGHIJKLMNOP')).toBeInTheDocument();
    
    // Should have copy button
    expect(screen.getByText(/Copy/i)).toBeInTheDocument();
    
    // Should have verification code field
    expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    
    // Should have verify button (disabled initially)
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    expect(verifyButton).toBeInTheDocument();
    expect(verifyButton).toBeDisabled();
  });

  test('enables verify button when 6 digits are entered', async () => {
    renderWithRouter(<MFAEnrollment />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
    
    // Verification button should be disabled initially
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    expect(verifyButton).toBeDisabled();
    
    // Enter verification code
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    // Button should be enabled
    expect(verifyButton).not.toBeDisabled();
  });

  test('rejects non-numeric verification codes', async () => {
    renderWithRouter(<MFAEnrollment />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
    
    // Enter non-numeric verification code
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: 'abcdef' } });
    
    // Input should be empty as non-numeric characters are rejected
    expect(codeInput.value).toBe('');
  });

  test('successfully verifies code and shows recovery codes', async () => {
    renderWithRouter(<MFAEnrollment />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
    
    // Enter verification code
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);
    
    // Should call verify API
    expect(mockVerifyMfa).toHaveBeenCalledWith('123456');
    
    // Should get recovery codes
    expect(mockGetRecoveryCodes).toHaveBeenCalled();
    
    // Should display recovery codes
    await waitFor(() => {
      expect(screen.getByText(/Save Your Recovery Codes/i)).toBeInTheDocument();
    });
    
    // All recovery codes should be displayed
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.getByText('23456789')).toBeInTheDocument();
    
    // Should have copy and download buttons
    expect(screen.getByText(/Copy to Clipboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Download as Text/i)).toBeInTheDocument();
    
    // Should have checkbox for confirming codes are saved
    const confirmCheckbox = screen.getByLabelText(/I have saved my recovery codes in a secure location/i);
    expect(confirmCheckbox).toBeInTheDocument();
    
    // Complete button should be disabled initially
    const completeButton = screen.getByRole('button', { name: /Complete Setup/i });
    expect(completeButton).toBeDisabled();
  });

  test('handles verification error', async () => {
    // Mock verification error
    mockVerifyMfa.mockRejectedValue({
      response: {
        data: { error: 'Invalid verification code' }
      }
    });
    
    renderWithRouter(<MFAEnrollment />);
    
    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
    
    // Enter verification code
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    
    // Click verify button
    const verifyButton = screen.getByRole('button', { name: /Verify/i });
    fireEvent.click(verifyButton);
    
    // Should call verify API
    expect(mockVerifyMfa).toHaveBeenCalledWith('123456');
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText(/invalid verification code/i, { exact: false })).toBeInTheDocument();
    });
    
    // Should not proceed to recovery codes
    expect(screen.queryByText(/Save Your Recovery Codes/i)).not.toBeInTheDocument();
  });

  test('copies recovery codes to clipboard', async () => {
    renderWithRouter(<MFAEnrollment />);
    
    // Wait for form to load and submit verification
    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
    
    // Enter verification code and submit
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    
    // Wait for recovery codes to appear
    await waitFor(() => {
      expect(screen.getByText(/Save Your Recovery Codes/i)).toBeInTheDocument();
    });
    
    // Click copy button
    fireEvent.click(screen.getByRole('button', { name: /Copy to Clipboard/i }));
    
    // Should call clipboard.writeText
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('12345678')
    );
  });

  test('downloads recovery codes as text file', async () => {
    renderWithRouter(<MFAEnrollment />);
    
    // Wait for form to load and submit verification
    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
    
    // Enter verification code and submit
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    
    // Wait for recovery codes to appear
    await waitFor(() => {
      expect(screen.getByText(/Save Your Recovery Codes/i)).toBeInTheDocument();
    });
    
    // Click download button
    fireEvent.click(screen.getByRole('button', { name: /Download as Text/i }));
    
    // Should create blob URL
    expect(URL.createObjectURL).toHaveBeenCalled();
    
    // Should set up anchor element
    expect(mockAnchorElement.download).toBe('mfa-recovery-codes.txt');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    
    // Should clean up
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  test('enables complete button when checkbox is checked', async () => {
    renderWithRouter(<MFAEnrollment />);
    
    // Wait for form to load and submit verification
    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
    
    // Enter verification code and submit
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    
    // Wait for recovery codes to appear
    await waitFor(() => {
      expect(screen.getByText(/Save Your Recovery Codes/i)).toBeInTheDocument();
    });
    
    // Complete button should be disabled initially
    const completeButton = screen.getByRole('button', { name: /Complete Setup/i });
    expect(completeButton).toBeDisabled();
    
    // Check the confirmation checkbox
    const confirmCheckbox = screen.getByLabelText(/I have saved my recovery codes in a secure location/i);
    fireEvent.click(confirmCheckbox);
    
    // Complete button should be enabled
    expect(completeButton).not.toBeDisabled();
  });

  test('calls onComplete callback when setup is complete', async () => {
    const mockOnComplete = jest.fn();
    renderWithRouter(<MFAEnrollment onComplete={mockOnComplete} />);
    
    // Wait for form to load and submit verification
    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
    
    // Enter verification code and submit
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    
    // Wait for recovery codes to appear
    await waitFor(() => {
      expect(screen.getByText(/Save Your Recovery Codes/i)).toBeInTheDocument();
    });
    
    // Check the confirmation checkbox
    const confirmCheckbox = screen.getByLabelText(/I have saved my recovery codes in a secure location/i);
    fireEvent.click(confirmCheckbox);
    
    // Click complete button
    const completeButton = screen.getByRole('button', { name: /Complete Setup/i });
    fireEvent.click(completeButton);
    
    // Should call onComplete callback
    expect(mockOnComplete).toHaveBeenCalled();
  });

  test('navigates to security settings when no onComplete is provided', async () => {
    renderWithRouter(<MFAEnrollment />);
    
    // Wait for form to load and submit verification
    await waitFor(() => {
      expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    });
    
    // Enter verification code and submit
    const codeInput = screen.getByLabelText(/Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));
    
    // Wait for recovery codes to appear
    await waitFor(() => {
      expect(screen.getByText(/Save Your Recovery Codes/i)).toBeInTheDocument();
    });
    
    // Check the confirmation checkbox
    const confirmCheckbox = screen.getByLabelText(/I have saved my recovery codes in a secure location/i);
    fireEvent.click(confirmCheckbox);
    
    // Click complete button
    const completeButton = screen.getByRole('button', { name: /Complete Setup/i });
    fireEvent.click(completeButton);
    
    // Should navigate to security settings
    expect(mockNavigate).toHaveBeenCalledWith('/profile/security');
  });

  test('redirects to security settings if MFA is already enabled', async () => {
    // Mock MFA already enabled
    jest.spyOn(require('../../../contexts/UserContext'), 'useUser').mockReturnValue({
      enrollMfa: mockEnrollMfa,
      verifyMfa: mockVerifyMfa,
      getRecoveryCodes: mockGetRecoveryCodes,
      clearMfaError: mockClearMfaError,
      mfaEnabled: true,
      mfaError: null
    });
    
    renderWithRouter(<MFAEnrollment />);
    
    // Should not call enrollment API
    expect(mockEnrollMfa).not.toHaveBeenCalled();
    
    // Should navigate to security settings
    expect(mockNavigate).toHaveBeenCalledWith('/profile/security');
  });

  test('displays MFA error from context if present', async () => {
    // Mock MFA error
    jest.spyOn(require('../../../contexts/UserContext'), 'useUser').mockReturnValue({
      enrollMfa: mockEnrollMfa,
      verifyMfa: mockVerifyMfa,
      getRecoveryCodes: mockGetRecoveryCodes,
      clearMfaError: mockClearMfaError,
      mfaEnabled: false,
      mfaError: 'Context-level MFA error'
    });
    
    renderWithRouter(<MFAEnrollment />);
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByText(/Set Up Two-Factor Authentication/i)).toBeInTheDocument();
    });
    
    // Should display error from context
    expect(screen.getByText(/Context-level MFA error/i)).toBeInTheDocument();
  });
});