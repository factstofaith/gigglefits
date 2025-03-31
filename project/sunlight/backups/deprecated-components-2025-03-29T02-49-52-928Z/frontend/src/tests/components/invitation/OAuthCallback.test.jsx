// OAuthCallback.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock userManagementService
const mockInvitationService = {
  completeOAuthAuthentication: jest.fn(),
};

jest.mock('../../../services/userManagementService', () => ({
  invitationService: mockInvitationService
}));

// Mock navigate, params, and location
const mockNavigate = jest.fn();
const mockLocation = { search: '?code=test_auth_code&state=test_invitation_token_randomstring' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ provider: 'office365' }),
  useLocation: () => mockLocation
}));

// Import component after mocks
import OAuthCallback from '@components/invitation/OAuthCallback';

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

describe('OAuthCallback Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockInvitationService.completeOAuthAuthentication.mockResolvedValue({
      data: {
        token: 'auth_token_12345',
        user: {
          id: 'user_123',
          email: 'user@example.com',
          full_name: 'Test User',
          role: 'USER'
        },
        requiresMFA: true
      }
    });
  });

  test('renders loading state initially', () => {
    renderWithRouter(<OAuthCallback />);
    
    // Should show loading state
    expect(screen.getByText(/Completing Authentication/i)).toBeInTheDocument();
    expect(screen.getByText(/Please wait while we complete your authentication/i)).toBeInTheDocument();
  });

  test('completes Office 365 authentication and redirects to MFA setup', async () => {
    renderWithRouter(<OAuthCallback />);
    
    // Should call the complete OAuth authentication API
    await waitFor(() => {
      expect(mockInvitationService.completeOAuthAuthentication).toHaveBeenCalledWith(
        'office365',
        'test_auth_code',
        'test_invitation_token',
        'test_invitation_token_randomstring'
      );
    });
    
    // Should store authentication token
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'auth_token_12345');
    
    // Should navigate to MFA setup
    expect(mockNavigate).toHaveBeenCalledWith('/mfa/setup');
  });

  test('completes authentication and redirects to welcome page when MFA not required', async () => {
    // Mock response with MFA not required
    mockInvitationService.completeOAuthAuthentication.mockResolvedValue({
      data: {
        token: 'auth_token_12345',
        user: {
          id: 'user_123',
          email: 'user@example.com',
          full_name: 'Test User',
          role: 'USER'
        },
        requiresMFA: false
      }
    });
    
    renderWithRouter(<OAuthCallback />);
    
    // Should call the complete OAuth authentication API
    await waitFor(() => {
      expect(mockInvitationService.completeOAuthAuthentication).toHaveBeenCalled();
    });
    
    // Should store authentication token
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'auth_token_12345');
    
    // Should navigate to welcome page
    expect(mockNavigate).toHaveBeenCalledWith('/welcome');
  });

  test('handles missing authorization code', async () => {
    // Setup location without code
    mockLocation.search = '?state=test_invitation_token_randomstring';
    
    renderWithRouter(<OAuthCallback />);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Authentication Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/No authorization code received/i)).toBeInTheDocument();
    });
    
    // Should show return to home link
    expect(screen.getByText(/Return to home page/i)).toBeInTheDocument();
  });

  test('handles missing state parameter', async () => {
    // Setup location without state
    mockLocation.search = '?code=test_auth_code';
    
    renderWithRouter(<OAuthCallback />);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Authentication Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid state parameter/i)).toBeInTheDocument();
    });
  });

  test('handles OAuth error response', async () => {
    // Setup location with error
    mockLocation.search = '?error=access_denied&error_description=User+denied+access';
    
    renderWithRouter(<OAuthCallback />);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Authentication Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/OAuth error: access_denied/i)).toBeInTheDocument();
    });
  });

  test('handles API error during authentication', async () => {
    // Setup API error
    mockInvitationService.completeOAuthAuthentication.mockRejectedValue({
      response: {
        data: { message: 'Failed to authenticate with OAuth provider' }
      }
    });
    
    renderWithRouter(<OAuthCallback />);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Authentication Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to authenticate with OAuth provider/i)).toBeInTheDocument();
    });
  });

  test('handles Gmail authentication', async () => {
    // Setup Gmail provider
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ provider: 'gmail' });
    
    renderWithRouter(<OAuthCallback />);
    
    // Should call the complete OAuth authentication API with Gmail provider
    await waitFor(() => {
      expect(mockInvitationService.completeOAuthAuthentication).toHaveBeenCalledWith(
        'gmail',
        'test_auth_code',
        'test_invitation_token',
        'test_invitation_token_randomstring'
      );
    });
  });
});