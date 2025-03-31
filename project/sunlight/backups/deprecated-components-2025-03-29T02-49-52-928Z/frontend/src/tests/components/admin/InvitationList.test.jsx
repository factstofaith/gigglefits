// InvitationList.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import InvitationList from '@components/admin/InvitationList';
import { invitationService } from '@services/userManagementService';

// Mock the invitationService
jest.mock('../../../services/userManagementService', () => ({
  invitationService: {
    getInvitations: jest.fn(),
    resendInvitation: jest.fn(),
    cancelInvitation: jest.fn()
  }
}));

// Mock window.confirm
window.confirm = jest.fn();

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Helper function to render component with router
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

// Create mock invitation data
const createMockInvitations = (count) => {
  // Added display name
  createMockInvitations.displayName = 'createMockInvitations';

  // Added display name
  createMockInvitations.displayName = 'createMockInvitations';

  // Added display name
  createMockInvitations.displayName = 'createMockInvitations';

  // Added display name
  createMockInvitations.displayName = 'createMockInvitations';

  // Added display name
  createMockInvitations.displayName = 'createMockInvitations';


  const invitations = [];
  const statuses = ['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED'];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[i % statuses.length];
    const date = new Date();
    date.setDate(date.getDate() + (status === 'EXPIRED' ? -5 : 5));
    
    invitations.push({
      id: `inv${i + 1}`,
      email: `user${i + 1}@example.com`,
      status,
      created_by_name: 'Admin User',
      created_at: new Date().toISOString(),
      expires_at: date.toISOString()
    });
  }
  
  return invitations;
};

describe('InvitationList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock response
    invitationService.getInvitations.mockResolvedValue({
      data: createMockInvitations(10),
      total: 10
    });
    
    invitationService.resendInvitation.mockResolvedValue({ success: true });
    invitationService.cancelInvitation.mockResolvedValue({ success: true });
    
    window.confirm.mockReturnValue(true);
  });

  test('renders invitation list correctly', async () => {
    renderWithRouter(<InvitationList />);
    
    // Check component title
    expect(screen.getByText('Invitations')).toBeInTheDocument();
    
    // Check that invitationService.getInvitations was called
    expect(invitationService.getInvitations).toHaveBeenCalledWith({
      page: 1,
      limit: 10
    });
    
    // Check that search and filter controls are displayed
    expect(screen.getByPlaceholderText('Search by email...')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Invitation/i })).toBeInTheDocument();
    
    // Check that table headers are displayed
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created By')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Expires')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Wait for data to load and check first invitation
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
    
    // Check that status chips are displayed
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
    expect(screen.getByText('EXPIRED')).toBeInTheDocument();
    expect(screen.getByText('CANCELED')).toBeInTheDocument();
  });

  test('handles empty invitation list', async () => {
    // Mock empty response
    invitationService.getInvitations.mockResolvedValue({
      data: [],
      total: 0
    });
    
    renderWithRouter(<InvitationList />);
    
    // Check that empty state message is displayed
    await waitFor(() => {
      expect(screen.getByText('No invitations found')).toBeInTheDocument();
    });
  });

  test('navigates to create invitation form when New Invitation button is clicked', () => {
    renderWithRouter(<InvitationList />);
    
    // Click New Invitation button
    const newButton = screen.getByRole('button', { name: /New Invitation/i });
    fireEvent.click(newButton);
    
    // Check that navigation happened
    expect(mockNavigate).toHaveBeenCalledWith('/admin/invitations/new');
  });

  test('navigates to invitation details when View button is clicked', async () => {
    renderWithRouter(<InvitationList />);
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
    
    // Find the view button for the first invitation (using tooltip)
    const viewButtons = screen.getAllByTitle('View Details');
    fireEvent.click(viewButtons[0]);
    
    // Check that navigation happened
    expect(mockNavigate).toHaveBeenCalledWith('/admin/invitations/inv1');
  });

  test('resends invitation when Resend button is clicked', async () => {
    renderWithRouter(<InvitationList />);
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
    
    // Find the resend button for the first invitation (which is PENDING)
    const resendButtons = screen.getAllByTitle('Resend Invitation');
    fireEvent.click(resendButtons[0]);
    
    // Check that resendInvitation was called
    expect(invitationService.resendInvitation).toHaveBeenCalledWith('inv1');
    
    // Check that getInvitations was called again to refresh the list
    await waitFor(() => {
      expect(invitationService.getInvitations).toHaveBeenCalledTimes(2);
    });
  });

  test('cancels invitation when Cancel button is clicked and confirmed', async () => {
    renderWithRouter(<InvitationList />);
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
    
    // Find the cancel button for the first invitation (which is PENDING)
    const cancelButtons = screen.getAllByTitle('Cancel Invitation');
    fireEvent.click(cancelButtons[0]);
    
    // Check that confirm was called
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to cancel this invitation?');
    
    // Check that cancelInvitation was called
    expect(invitationService.cancelInvitation).toHaveBeenCalledWith('inv1');
    
    // Check that getInvitations was called again to refresh the list
    await waitFor(() => {
      expect(invitationService.getInvitations).toHaveBeenCalledTimes(2);
    });
  });

  test('does not cancel invitation when cancel confirmation is declined', async () => {
    // Mock user declining the confirmation
    window.confirm.mockReturnValue(false);
    
    renderWithRouter(<InvitationList />);
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
    
    // Find the cancel button for the first invitation
    const cancelButtons = screen.getAllByTitle('Cancel Invitation');
    fireEvent.click(cancelButtons[0]);
    
    // Check that confirm was called
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to cancel this invitation?');
    
    // Check that cancelInvitation was NOT called
    expect(invitationService.cancelInvitation).not.toHaveBeenCalled();
  });

  test('filters invitations by status', async () => {
    renderWithRouter(<InvitationList />);
    
    // Clear previous calls
    invitationService.getInvitations.mockClear();
    
    // Setup mock response for filtered data
    invitationService.getInvitations.mockResolvedValue({
      data: createMockInvitations(3).filter(inv => inv.status === 'PENDING'),
      total: 3
    });
    
    // Wait for component to render
    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
    });
    
    // Select PENDING status
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    const pendingOption = await screen.findByText('Pending');
    fireEvent.click(pendingOption);
    
    // Check that getInvitations was called with status filter
    await waitFor(() => {
      expect(invitationService.getInvitations).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PENDING'
        })
      );
    });
  });

  test('searches invitations by email', async () => {
    renderWithRouter(<InvitationList />);
    
    // Clear previous calls
    invitationService.getInvitations.mockClear();
    
    // Setup mock response for search results
    invitationService.getInvitations.mockResolvedValue({
      data: [createMockInvitations(1)[0]],
      total: 1
    });
    
    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search by email...');
    fireEvent.change(searchInput, { target: { value: 'user1@example.com' } });
    
    // Submit search form
    const searchButton = screen.getByRole('button', { name: '' });
    fireEvent.click(searchButton);
    
    // Check that getInvitations was called with search parameter
    await waitFor(() => {
      expect(invitationService.getInvitations).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          search: 'user1@example.com'
        })
      );
    });
  });

  test('refreshes invitation list when Refresh button is clicked', async () => {
    renderWithRouter(<InvitationList />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
    
    // Clear previous calls
    invitationService.getInvitations.mockClear();
    
    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshButton);
    
    // Check that getInvitations was called again
    expect(invitationService.getInvitations).toHaveBeenCalledTimes(1);
  });

  test('handles pagination correctly', async () => {
    renderWithRouter(<InvitationList />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
    
    // Clear previous calls
    invitationService.getInvitations.mockClear();
    
    // Change rows per page
    const rowsPerPageSelect = screen.getByLabelText('Rows per page:');
    fireEvent.mouseDown(rowsPerPageSelect);
    const option25 = await screen.findByText('25');
    fireEvent.click(option25);
    
    // Check that getInvitations was called with new limit
    await waitFor(() => {
      expect(invitationService.getInvitations).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 25
        })
      );
    });
  });

  test('handles API error when fetching invitations', async () => {
    // Mock API error
    invitationService.getInvitations.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter(<InvitationList />);
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load invitations. Please try again.')).toBeInTheDocument();
    });
  });

  test('handles error when resending invitation', async () => {
    // Mock API error for resend
    invitationService.resendInvitation.mockRejectedValue(new Error('Resend Error'));
    
    renderWithRouter(<InvitationList />);
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
    
    // Find and click the resend button
    const resendButtons = screen.getAllByTitle('Resend Invitation');
    fireEvent.click(resendButtons[0]);
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to resend invitation. Please try again.')).toBeInTheDocument();
    });
  });

  test('handles error when cancelling invitation', async () => {
    // Mock API error for cancel
    invitationService.cancelInvitation.mockRejectedValue(new Error('Cancel Error'));
    
    renderWithRouter(<InvitationList />);
    
    // Wait for invitations to load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    });
    
    // Find and click the cancel button
    const cancelButtons = screen.getAllByTitle('Cancel Invitation');
    fireEvent.click(cancelButtons[0]);
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to cancel invitation. Please try again.')).toBeInTheDocument();
    });
  });
});