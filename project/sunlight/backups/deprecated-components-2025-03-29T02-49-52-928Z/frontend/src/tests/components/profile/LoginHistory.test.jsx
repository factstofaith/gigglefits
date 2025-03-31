// LoginHistory.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginHistory from '@components/profile/LoginHistory';
import { userService } from '@services/userManagementService';

// Mock the UserContext
const mockUser = {
  id: 'user123',
  email: 'user@example.com',
  full_name: 'Test User',
  role: 'USER'
};

jest.mock('../../../contexts/UserContext', () => ({
  useUser: () => ({
    user: mockUser
  })
}));

// Mock the userService
jest.mock('../../../services/userManagementService', () => ({
  userService: {
    getLoginHistory: jest.fn()
  }
}));

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

// Helper to generate mock login history data
const generateMockLoginHistory = (count, status = null) => {
  // Added display name
  generateMockLoginHistory.displayName = 'generateMockLoginHistory';

  // Added display name
  generateMockLoginHistory.displayName = 'generateMockLoginHistory';

  // Added display name
  generateMockLoginHistory.displayName = 'generateMockLoginHistory';

  // Added display name
  generateMockLoginHistory.displayName = 'generateMockLoginHistory';

  // Added display name
  generateMockLoginHistory.displayName = 'generateMockLoginHistory';


  const history = [];
  
  for (let i = 0; i < count; i++) {
    history.push({
      timestamp: `2025-03-${30 - i}T10:${i}0:00.000Z`,
      status: status || (i % 2 === 0 ? 'SUCCESS' : 'FAILED'),
      ip_address: `192.168.1.${i + 1}`,
      user_agent: `Mozilla/5.0 (${i % 2 === 0 ? 'Windows' : 'Mac'})`,
      location: i % 3 === 0 ? 'New York, US' : (i % 3 === 1 ? 'London, UK' : 'Unknown')
    });
  }
  
  return history;
};

describe('LoginHistory Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock login history response
    userService.getLoginHistory.mockResolvedValue({
      data: {
        history: generateMockLoginHistory(10),
        total: 25 // Total count larger than page size to test pagination
      }
    });
  });

  test('renders login history table with data', async () => {
    renderWithRouter(<LoginHistory />);
    
    // Check component title
    expect(screen.getByText('Login History')).toBeInTheDocument();
    
    // Check that getLoginHistory was called with correct parameters
    expect(userService.getLoginHistory).toHaveBeenCalledWith(mockUser.id, {
      page: 1,
      limit: 10
    });
    
    // Check table headers
    expect(screen.getByText('Date & Time')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('IP Address')).toBeInTheDocument();
    expect(screen.getByText('User Agent')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    
    // Check first row data (first item in mock data)
    await waitFor(() => {
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    });
    
    // Check status chips
    expect(screen.getAllByText('Successful').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
    
    // Check for pagination
    expect(screen.getByText('1–10 of 25')).toBeInTheDocument();
  });

  test('displays empty state when no login history', async () => {
    // Mock empty login history
    userService.getLoginHistory.mockResolvedValueOnce({
      data: {
        history: [],
        total: 0
      }
    });
    
    renderWithRouter(<LoginHistory />);
    
    // Check that empty state message is displayed
    await waitFor(() => {
      expect(screen.getByText('No login history found.')).toBeInTheDocument();
    });
  });

  test('handles pagination correctly', async () => {
    renderWithRouter(<LoginHistory />);
    
    // Initial call for first page
    expect(userService.getLoginHistory).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ page: 1, limit: 10 })
    );
    
    // Reset mock to track next call
    userService.getLoginHistory.mockClear();
    
    // Set up mock for second page
    userService.getLoginHistory.mockResolvedValueOnce({
      data: {
        history: generateMockLoginHistory(10, 'SUCCESS'), // Make these all successful
        total: 25
      }
    });
    
    // Click next page button
    const nextPageButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextPageButton);
    
    // Check that getLoginHistory was called with page 2
    await waitFor(() => {
      expect(userService.getLoginHistory).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ page: 2, limit: 10 })
      );
    });
    
    // Reset mock to track next call
    userService.getLoginHistory.mockClear();
    
    // Change rows per page
    userService.getLoginHistory.mockResolvedValueOnce({
      data: {
        history: generateMockLoginHistory(25), // More rows
        total: 25
      }
    });
    
    // Use select to change rows per page to 25
    const rowsPerPageSelect = screen.getByLabelText('Rows per page:');
    fireEvent.mouseDown(rowsPerPageSelect);
    
    // Wait for the dropdown to open and select 25
    const option25 = await screen.findByText('25');
    fireEvent.click(option25);
    
    // Check that getLoginHistory was called with new limit
    await waitFor(() => {
      expect(userService.getLoginHistory).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ page: 1, limit: 25 })
      );
    });
  });

  test('filters by status correctly', async () => {
    renderWithRouter(<LoginHistory />);
    
    // Reset mock to track filter call
    userService.getLoginHistory.mockClear();
    
    // Set up mock for filtered results
    userService.getLoginHistory.mockResolvedValueOnce({
      data: {
        history: generateMockLoginHistory(5, 'SUCCESS'), // All successful
        total: 15 // 15 successful entries total
      }
    });
    
    // Select successful status filter
    const statusSelect = screen.getByLabelText('Status');
    fireEvent.mouseDown(statusSelect);
    
    // Wait for the dropdown to open and select Successful
    const successOption = await screen.findByText('Successful');
    fireEvent.click(successOption);
    
    // Check that getLoginHistory was called with status filter
    await waitFor(() => {
      expect(userService.getLoginHistory).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ 
          status: 'SUCCESS',
          page: 1
        })
      );
    });
    
    // Reset mock to track filter call
    userService.getLoginHistory.mockClear();
    
    // Set up mock for failed status filter
    userService.getLoginHistory.mockResolvedValueOnce({
      data: {
        history: generateMockLoginHistory(3, 'FAILED'), // All failed
        total: 10 // 10 failed entries total
      }
    });
    
    // Select failed status filter
    fireEvent.mouseDown(statusSelect);
    const failedOption = await screen.findByText('Failed');
    fireEvent.click(failedOption);
    
    // Check that getLoginHistory was called with status filter
    await waitFor(() => {
      expect(userService.getLoginHistory).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ 
          status: 'FAILED',
          page: 1
        })
      );
    });
  });

  test('filters by date range correctly', async () => {
    renderWithRouter(<LoginHistory />);
    
    // Reset mock to track filter call
    userService.getLoginHistory.mockClear();
    
    // Set up mock for date filtered results
    userService.getLoginHistory.mockResolvedValueOnce({
      data: {
        history: generateMockLoginHistory(5),
        total: 5
      }
    });
    
    // Set from date
    const fromDateInput = screen.getByLabelText('From Date');
    fireEvent.change(fromDateInput, { target: { value: '2025-03-20' } });
    
    // Set to date
    const toDateInput = screen.getByLabelText('To Date');
    fireEvent.change(toDateInput, { target: { value: '2025-03-30' } });
    
    // Click refresh button to apply filters
    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshButton);
    
    // Check that getLoginHistory was called with date filters
    await waitFor(() => {
      expect(userService.getLoginHistory).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ 
          from_date: '2025-03-20',
          to_date: '2025-03-30',
          page: 1
        })
      );
    });
  });

  test('searches by IP address correctly', async () => {
    renderWithRouter(<LoginHistory />);
    
    // Reset mock to track search call
    userService.getLoginHistory.mockClear();
    
    // Set up mock for search results
    userService.getLoginHistory.mockResolvedValueOnce({
      data: {
        history: [
          {
            timestamp: '2025-03-30T10:00:00.000Z',
            status: 'SUCCESS',
            ip_address: '192.168.5.10',
            user_agent: 'Mozilla/5.0 (Windows)',
            location: 'New York, US'
          }
        ],
        total: 1
      }
    });
    
    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search by IP address');
    fireEvent.change(searchInput, { target: { value: '192.168.5.10' } });
    
    // Submit the search form
    const searchButton = screen.getByRole('button', { name: '' }); // Icon button without text
    fireEvent.click(searchButton);
    
    // Check that getLoginHistory was called with search parameter
    await waitFor(() => {
      expect(userService.getLoginHistory).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ 
          search: '192.168.5.10',
          page: 1
        })
      );
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API error
    userService.getLoginHistory.mockRejectedValueOnce(new Error('API Error'));
    
    renderWithRouter(<LoginHistory />);
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load login history. Please try again.')).toBeInTheDocument();
    });
  });

  test('refreshes data when refresh button is clicked', async () => {
    renderWithRouter(<LoginHistory />);
    
    // Initial call
    expect(userService.getLoginHistory).toHaveBeenCalledTimes(1);
    
    // Reset mock to track refresh call
    userService.getLoginHistory.mockClear();
    
    // Set up mock for refreshed data
    userService.getLoginHistory.mockResolvedValueOnce({
      data: {
        history: generateMockLoginHistory(10),
        total: 25
      }
    });
    
    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshButton);
    
    // Check that getLoginHistory was called again
    await waitFor(() => {
      expect(userService.getLoginHistory).toHaveBeenCalledTimes(1);
    });
  });
});