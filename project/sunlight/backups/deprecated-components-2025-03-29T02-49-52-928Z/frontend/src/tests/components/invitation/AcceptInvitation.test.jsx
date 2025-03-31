// AcceptInvitation.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

// Mock userManagementService
const mockInvitationService = {
  verifyInvitation: jest.fn(),
  acceptInvitation: jest.fn(),
  getOffice365AuthUrl: jest.fn(),
  getGmailAuthUrl: jest.fn(),
};

jest.mock('../../../services/userManagementService', () => ({
  invitationService: mockInvitationService
}));

// Mock navigate and params
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ token: 'valid-invitation-token' }),
}));

// Mock window.location.href
const originalLocation = window.location;
beforeAll(() => {
  delete window.location;
  window.location = { href: jest.fn() };
});

afterAll(() => {
  window.location = originalLocation;
});

// Import component after mocks
import AcceptInvitation from '@components/invitation/AcceptInvitation';

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

describe('AcceptInvitation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockInvitationService.verifyInvitation.mockResolvedValue({
      data: {
        email: 'invited@example.com',
        role: 'USER',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        inviter: 'Admin User'
      }
    });
    
    mockInvitationService.getOffice365AuthUrl.mockResolvedValue({
      data: {
        authUrl: 'https://login.microsoftonline.com/mock-auth-url'
      }
    });
    
    mockInvitationService.getGmailAuthUrl.mockResolvedValue({
      data: {
        authUrl: 'https://accounts.google.com/o/oauth2/auth/mock-auth-url'
      }
    });
  });

  test('renders loading state initially', () => {
    renderWithRouter(<AcceptInvitation />);
    
    // Should show loading state
    expect(screen.getByText(/Verifying Invitation/i)).toBeInTheDocument();
    expect(screen.getByText(/Please wait while we verify your invitation/i)).toBeInTheDocument();
  });

  test('displays authentication options after verification', async () => {
    renderWithRouter(<AcceptInvitation />);
    
    // Should verify the token
    expect(mockInvitationService.verifyInvitation).toHaveBeenCalledWith('valid-invitation-token');
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText(/You've been invited to join the TAP Integration Platform/i)).toBeInTheDocument();
    });
    
    // Should display invitation details
    expect(screen.getByText(/by Admin User/i)).toBeInTheDocument();
    
    // Authentication options should be present
    expect(screen.getByText(/Continue with Office 365/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with Gmail/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with Email/i)).toBeInTheDocument();
    
    // Should display expiration date
    expect(screen.getByText(/This invitation expires on:/i)).toBeInTheDocument();
  });

  test('handles invalid invitation token', async () => {
    // Setup invalid token response
    mockInvitationService.verifyInvitation.mockRejectedValue({
      response: {
        status: 404,
        data: { error: 'Invalid invitation' }
      }
    });
    
    renderWithRouter(<AcceptInvitation />);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid Invitation/i)).toBeInTheDocument();
    });
    
    // Should explain the error
    expect(screen.getByText(/invalid invitation/i, { exact: false })).toBeInTheDocument();
    
    // Should have a return to home button
    const homeButton = screen.getByText(/Return to Home/i);
    expect(homeButton).toBeInTheDocument();
  });

  test('handles expired invitation token', async () => {
    // Setup expired token response
    mockInvitationService.verifyInvitation.mockRejectedValue({
      response: {
        status: 410,
        data: { error: 'This invitation has expired' }
      }
    });
    
    renderWithRouter(<AcceptInvitation />);
    
    // Should show expiration message
    await waitFor(() => {
      expect(screen.getByText(/Invitation Expired/i)).toBeInTheDocument();
    });
    
    // Should explain the expiration
    expect(screen.getByText(/this invitation has expired/i, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/contact the administrator for a new invitation/i, { exact: false })).toBeInTheDocument();
    
    // Should have a return to home button
    const homeButton = screen.getByText(/Return to Home/i);
    expect(homeButton).toBeInTheDocument();
  });

  test('handles continue with Office 365 click', async () => {
    renderWithRouter(<AcceptInvitation />);
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText(/Continue with Office 365/i)).toBeInTheDocument();
    });
    
    // Click Office 365 button
    const office365Button = screen.getByRole('button', { name: /Office 365/i });
    fireEvent.click(office365Button);
    
    // Should call the Office 365 auth URL API
    expect(mockInvitationService.getOffice365AuthUrl).toHaveBeenCalledWith('valid-invitation-token');
    
    // Should redirect to Office 365 auth URL
    await waitFor(() => {
      expect(window.location.href).toBe('https://login.microsoftonline.com/mock-auth-url');
    });
  });

  test('handles continue with Gmail click', async () => {
    renderWithRouter(<AcceptInvitation />);
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText(/Continue with Gmail/i)).toBeInTheDocument();
    });
    
    // Click Gmail button
    const gmailButton = screen.getByRole('button', { name: /Gmail/i });
    fireEvent.click(gmailButton);
    
    // Should call the Gmail auth URL API
    expect(mockInvitationService.getGmailAuthUrl).toHaveBeenCalledWith('valid-invitation-token');
    
    // Should redirect to Gmail auth URL
    await waitFor(() => {
      expect(window.location.href).toBe('https://accounts.google.com/o/oauth2/auth/mock-auth-url');
    });
  });

  test('handles continue with Email click', async () => {
    renderWithRouter(<AcceptInvitation />);
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText(/Continue with Email/i)).toBeInTheDocument();
    });
    
    // Click Email button
    const emailButton = screen.getByRole('button', { name: /Email/i });
    fireEvent.click(emailButton);
    
    // Should store token in session storage
    expect(sessionStorage.getItem('invitationToken')).toBe('valid-invitation-token');
    
    // Should navigate to complete registration page
    expect(mockNavigate).toHaveBeenCalledWith('/invitation/complete');
  });

  test('handles error getting OAuth URL', async () => {
    // Setup error response
    mockInvitationService.getOffice365AuthUrl.mockRejectedValue({
      response: {
        data: { message: 'Failed to initiate Office 365 login' }
      }
    });
    
    renderWithRouter(<AcceptInvitation />);
    
    // Wait for verification to complete
    await waitFor(() => {
      expect(screen.getByText(/Continue with Office 365/i)).toBeInTheDocument();
    });
    
    // Click Office 365 button
    const office365Button = screen.getByRole('button', { name: /Office 365/i });
    fireEvent.click(office365Button);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to initiate Office 365 login/i)).toBeInTheDocument();
    });
    
    // Should not redirect
    expect(window.location.href).not.toBe('https://login.microsoftonline.com/mock-auth-url');
  });
});