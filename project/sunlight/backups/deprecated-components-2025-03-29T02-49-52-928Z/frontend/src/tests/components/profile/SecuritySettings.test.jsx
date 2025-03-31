// SecuritySettings.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SecuritySettings from '@components/profile/SecuritySettings';
import { userService } from '@services/userManagementService';

// Mock the UserContext
const mockUser = {
  id: 'user123',
  email: 'user@example.com',
  full_name: 'Test User',
  role: 'USER'
};

const mockFetchMfaStatus = jest.fn();
const mockDisableMfa = jest.fn();
const mockGetRecoveryCodes = jest.fn();
const mockRegenerateRecoveryCodes = jest.fn();
const mockClearMfaError = jest.fn();

// Mock MFA enabled state
let mockMfaEnabled = true;

jest.mock('../../../contexts/UserContext', () => ({
  useUser: () => ({
    user: mockUser,
    mfaEnabled: mockMfaEnabled,
    fetchMfaStatus: mockFetchMfaStatus,
    disableMfa: mockDisableMfa,
    getRecoveryCodes: mockGetRecoveryCodes,
    regenerateRecoveryCodes: mockRegenerateRecoveryCodes,
    mfaError: null,
    clearMfaError: mockClearMfaError
  })
}));

// Mock the userService
jest.mock('../../../services/userManagementService', () => ({
  userService: {
    getLoginHistory: jest.fn()
  }
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
});

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = jest.fn(() => 'mock-object-url');
URL.revokeObjectURL = jest.fn();

// Create a mock for document.createElement
const mockAnchorElement = {
  href: '',
  download: '',
  click: jest.fn(),
};
document.createElement = jest.fn((element) => {
  if (element === 'a') return mockAnchorElement;
  return document.createElement.original(element);
});
document.createElement.original = document.createElement;

// Helper to render the component with router
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

describe('SecuritySettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock login history response
    userService.getLoginHistory.mockResolvedValue({
      data: {
        history: [
          {
            timestamp: '2025-03-31T10:30:00.000Z',
            status: 'SUCCESS',
            ip_address: '192.168.1.1',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            location: 'New York, US'
          },
          {
            timestamp: '2025-03-30T08:15:00.000Z',
            status: 'FAILED',
            ip_address: '192.168.1.2',
            user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X)',
            location: 'Unknown'
          }
        ],
        total: 2
      }
    });
    
    // Set up mock recovery codes
    mockGetRecoveryCodes.mockResolvedValue({
      recoveryCodes: [
        '12345678', '23456789', '34567890', '45678901', '56789012', 
        '67890123', '78901234', '89012345', '90123456', '01234567'
      ]
    });
    
    // Set up mock recovery code regeneration
    mockRegenerateRecoveryCodes.mockResolvedValue({
      recoveryCodes: [
        'abcdefgh', 'bcdefghi', 'cdefghij', 'defghijk', 'efghijkl',
        'fghijklm', 'ghijklmn', 'hijklmno', 'ijklmnop', 'jklmnopq'
      ]
    });
    
    // Set default MFA status to enabled
    mockMfaEnabled = true;
  });

  test('renders security settings with MFA enabled', () => {
    renderWithRouter(<SecuritySettings />);
    
    // Check main heading is displayed
    expect(screen.getByText('Security Settings')).toBeInTheDocument();
    
    // Check MFA section
    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    
    // Check MFA actions are available
    expect(screen.getByRole('button', { name: /View Recovery Codes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Disable/i })).toBeInTheDocument();
    
    // Check recovery codes section is present
    expect(screen.getByText('Recovery Codes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Regenerate Codes/i })).toBeInTheDocument();
    
    // Check password section
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
    
    // Check login history section
    expect(screen.getByText('Recent Login Activity')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Full History/i })).toBeInTheDocument();
    
    // Verify login history is displayed
    expect(screen.getByText('Successful login')).toBeInTheDocument();
    expect(screen.getByText('Failed login attempt')).toBeInTheDocument();
  });

  test('renders security settings with MFA disabled', () => {
    // Set MFA to disabled for this test
    mockMfaEnabled = false;
    
    renderWithRouter(<SecuritySettings />);
    
    // Check MFA section shows disabled status
    expect(screen.getByText('Not Enabled')).toBeInTheDocument();
    
    // Check Enable button is shown instead of Disable/View Recovery Codes
    expect(screen.getByRole('button', { name: /Enable/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /View Recovery Codes/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Disable/i })).not.toBeInTheDocument();
    
    // Recovery codes section should not be visible
    expect(screen.queryByText('Recovery Codes')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Regenerate Codes/i })).not.toBeInTheDocument();
  });

  test('navigates to MFA setup when Enable button is clicked', () => {
    // Set MFA to disabled for this test
    mockMfaEnabled = false;
    
    // Mock useNavigate
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    renderWithRouter(<SecuritySettings />);
    
    // Click Enable button
    fireEvent.click(screen.getByRole('button', { name: /Enable/i }));
    
    // Check navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/mfa/setup');
  });

  test('displays recovery codes when View Recovery Codes is clicked', async () => {
    renderWithRouter(<SecuritySettings />);
    
    // Click View Recovery Codes button
    fireEvent.click(screen.getByRole('button', { name: /View Recovery Codes/i }));
    
    // Check that getRecoveryCodes was called
    expect(mockGetRecoveryCodes).toHaveBeenCalled();
    
    // Wait for recovery codes dialog to appear
    await waitFor(() => {
      expect(screen.getByText('Recovery Codes')).toBeInTheDocument();
    });
    
    // Check that recovery codes are displayed
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.getByText('23456789')).toBeInTheDocument();
    
    // Check action buttons
    expect(screen.getByRole('button', { name: /Copy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
  });

  test('copies recovery codes to clipboard when Copy button is clicked', async () => {
    renderWithRouter(<SecuritySettings />);
    
    // Click View Recovery Codes button
    fireEvent.click(screen.getByRole('button', { name: /View Recovery Codes/i }));
    
    // Wait for recovery codes dialog to appear
    await waitFor(() => {
      expect(screen.getByText('Recovery Codes')).toBeInTheDocument();
    });
    
    // Click Copy button
    fireEvent.click(screen.getByRole('button', { name: /Copy/i }));
    
    // Check that clipboard.writeText was called with the recovery codes
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '12345678\n23456789\n34567890\n45678901\n56789012\n67890123\n78901234\n89012345\n90123456\n01234567'
    );
    
    // Check that success message is shown
    expect(screen.getByText('Recovery codes copied to clipboard')).toBeInTheDocument();
  });

  test('downloads recovery codes when Download button is clicked', async () => {
    renderWithRouter(<SecuritySettings />);
    
    // Click View Recovery Codes button
    fireEvent.click(screen.getByRole('button', { name: /View Recovery Codes/i }));
    
    // Wait for recovery codes dialog to appear
    await waitFor(() => {
      expect(screen.getByText('Recovery Codes')).toBeInTheDocument();
    });
    
    // Click Download button
    fireEvent.click(screen.getByRole('button', { name: /Download/i }));
    
    // Check that URL.createObjectURL was called with a Blob
    expect(URL.createObjectURL).toHaveBeenCalled();
    
    // Check that anchor element was created and clicked
    expect(mockAnchorElement.download).toBe('mfa-recovery-codes.txt');
    expect(mockAnchorElement.href).toBe('mock-object-url');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    
    // Check that URL.revokeObjectURL was called
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-object-url');
    
    // Check that success message is shown
    expect(screen.getByText('Recovery codes downloaded')).toBeInTheDocument();
  });

  test('shows confirmation dialog when Regenerate Codes is clicked', async () => {
    renderWithRouter(<SecuritySettings />);
    
    // Click Regenerate Codes button
    fireEvent.click(screen.getByRole('button', { name: /Regenerate Codes/i }));
    
    // Check that confirmation dialog is shown
    expect(screen.getByText('Regenerate Recovery Codes')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to regenerate your recovery codes/i)).toBeInTheDocument();
    
    // Check dialog buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
  });

  test('regenerates recovery codes when confirmed', async () => {
    renderWithRouter(<SecuritySettings />);
    
    // Click Regenerate Codes button
    fireEvent.click(screen.getByRole('button', { name: /Regenerate Codes/i }));
    
    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Regenerate Recovery Codes')).toBeInTheDocument();
    });
    
    // Click confirm button
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    
    // Check that regenerateRecoveryCodes was called
    expect(mockRegenerateRecoveryCodes).toHaveBeenCalled();
    
    // Wait for recovery codes dialog to appear with new codes
    await waitFor(() => {
      expect(screen.getByText('Recovery Codes')).toBeInTheDocument();
      expect(screen.getByText('abcdefgh')).toBeInTheDocument(); // One of the new codes
    });
    
    // Check that success message is shown
    expect(screen.getByText('Recovery codes regenerated successfully')).toBeInTheDocument();
  });

  test('shows confirmation dialog when Disable is clicked', async () => {
    renderWithRouter(<SecuritySettings />);
    
    // Click Disable button
    fireEvent.click(screen.getByRole('button', { name: /Disable/i }));
    
    // Check that confirmation dialog is shown
    expect(screen.getByText('Disable Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to disable two-factor authentication/i)).toBeInTheDocument();
    
    // Check dialog buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
  });

  test('disables MFA when confirmed', async () => {
    renderWithRouter(<SecuritySettings />);
    
    // Click Disable button
    fireEvent.click(screen.getByRole('button', { name: /Disable/i }));
    
    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Disable Two-Factor Authentication')).toBeInTheDocument();
    });
    
    // Click confirm button
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));
    
    // Check that disableMfa was called
    expect(mockDisableMfa).toHaveBeenCalled();
    
    // Check that fetchMfaStatus was called to refresh the status
    expect(mockFetchMfaStatus).toHaveBeenCalled();
    
    // Check that success message is shown
    await waitFor(() => {
      expect(screen.getByText('Two-factor authentication disabled successfully')).toBeInTheDocument();
    });
  });

  test('closes confirmation dialog when Cancel is clicked', async () => {
    renderWithRouter(<SecuritySettings />);
    
    // Click Disable button to open confirmation dialog
    fireEvent.click(screen.getByRole('button', { name: /Disable/i }));
    
    // Wait for confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Disable Two-Factor Authentication')).toBeInTheDocument();
    });
    
    // Click cancel button
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Check that dialog is closed
    await waitFor(() => {
      expect(screen.queryByText('Disable Two-Factor Authentication')).not.toBeInTheDocument();
    });
    
    // Check that disableMfa was not called
    expect(mockDisableMfa).not.toHaveBeenCalled();
  });

  test('navigates to change password page when button is clicked', () => {
    // Mock useNavigate
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    renderWithRouter(<SecuritySettings />);
    
    // Click Change Password button
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    
    // Check navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/profile/change-password');
  });

  test('navigates to login history page when View Full History is clicked', () => {
    // Mock useNavigate
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    renderWithRouter(<SecuritySettings />);
    
    // Click View Full History button
    fireEvent.click(screen.getByRole('button', { name: /View Full History/i }));
    
    // Check navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/profile/login-history');
  });

  test('displays login history from API', async () => {
    renderWithRouter(<SecuritySettings />);
    
    // Check that getLoginHistory was called
    expect(userService.getLoginHistory).toHaveBeenCalledWith(mockUser.id, { limit: 5 });
    
    // Check that login history items are displayed
    expect(screen.getByText('Successful login')).toBeInTheDocument();
    expect(screen.getByText('Failed login attempt')).toBeInTheDocument();
    
    // Check IP addresses are displayed
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.2')).toBeInTheDocument();
  });

  test('handles empty login history', async () => {
    // Mock empty login history
    userService.getLoginHistory.mockResolvedValueOnce({
      data: {
        history: [],
        total: 0
      }
    });
    
    renderWithRouter(<SecuritySettings />);
    
    // Check that empty state message is displayed
    expect(screen.getByText('No recent login activity')).toBeInTheDocument();
  });
});