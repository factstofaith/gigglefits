import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorLogViewer from '@components/admin/ErrorLogViewer';
import * as errorLogService from '@services/errorLogService';

// Mock the error log service
jest.mock('../../../services/errorLogService', () => ({
  getErrorLogs: jest.fn(),
  searchLogs: jest.fn(),
  exportLogsCSV: jest.fn(),
  exportLogsJSON: jest.fn(),
  getSeverityLevels: jest.fn(),
  getComponents: jest.fn(),
  getLogDetails: jest.fn(),
}));

// Mock data for tests
const mockLogs = {
  logs: [
    {
      id: 'log-1',
      severity: 'error',
      component: 'backend',
      message: 'Database connection failed',
      timestamp: new Date('2025-03-01T12:00:00.000Z'),
    },
    {
      id: 'log-2',
      severity: 'warning',
      component: 'frontend',
      message: 'API request timed out',
      timestamp: new Date('2025-03-01T12:30:00.000Z'),
    },
    {
      id: 'log-3',
      severity: 'critical',
      component: 'database',
      message: 'Out of memory error',
      timestamp: new Date('2025-03-01T13:00:00.000Z'),
    },
  ],
  total: 3,
  page: 0,
  page_size: 10,
  next_page: null,
  prev_page: null,
};

const mockSeverityLevels = ['critical', 'error', 'warning', 'info', 'debug', 'trace'];
const mockComponents = ['frontend', 'backend', 'database', 'api', 'authentication', 'storage'];

const mockLogDetail = {
  id: 'log-1',
  severity: 'error',
  component: 'backend',
  message: 'Database connection failed',
  timestamp: new Date('2025-03-01T12:00:00.000Z'),
  stack_trace: 'Error: Database connection failed\n  at connectToDatabase (database.js:42)\n  at initializeApp (app.js:15)',
  context: {
    request_id: 'req-12345',
    user_id: 'user-67890',
    tenant_id: 'tenant-1234',
  },
};

// Mock the Material UI dialog
jest.mock('@mui/material/Dialog', () => {
  return ({ children, open }) => (
    open ? <div data-testid="mock-dialog">{children}</div> : null
  );
});

describe('ErrorLogViewer Component', () => {
  beforeEach(() => {
    // Reset mocks and provide default implementations
    jest.clearAllMocks();
    errorLogService.getErrorLogs.mockResolvedValue(mockLogs);
    errorLogService.searchLogs.mockResolvedValue(mockLogs);
    errorLogService.getSeverityLevels.mockResolvedValue(mockSeverityLevels);
    errorLogService.getComponents.mockResolvedValue(mockComponents);
    errorLogService.getLogDetails.mockResolvedValue(mockLogDetail);
    errorLogService.exportLogsCSV.mockResolvedValue(true);
    errorLogService.exportLogsJSON.mockResolvedValue(true);
  });

  test('renders the error log viewer with initial logs', async () => {
    render(<ErrorLogViewer />);
    
    // Check that the component header is rendered
    expect(screen.getByText('Application Error Logs')).toBeInTheDocument();
    
    // Wait for logs to be loaded
    await waitFor(() => {
      expect(errorLogService.getErrorLogs).toHaveBeenCalledTimes(1);
      expect(errorLogService.getSeverityLevels).toHaveBeenCalledTimes(1);
      expect(errorLogService.getComponents).toHaveBeenCalledTimes(1);
    });
    
    // Check that logs are displayed
    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
      expect(screen.getByText('API request timed out')).toBeInTheDocument();
      expect(screen.getByText('Out of memory error')).toBeInTheDocument();
    });
  });

  test('shows and hides filters when filter button is clicked', async () => {
    render(<ErrorLogViewer />);
    
    // Check that filters are initially hidden
    expect(screen.queryByText('Status')).not.toBeInTheDocument();
    expect(screen.queryByText('Component')).not.toBeInTheDocument();
    
    // Click the filter button
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Check that filters are now visible
    await waitFor(() => {
      expect(screen.getByText('Severity')).toBeInTheDocument();
      expect(screen.getByText('Component')).toBeInTheDocument();
      expect(screen.getByText('Date Range')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
    
    // Click the filter button again
    fireEvent.click(screen.getByText('Hide Filters'));
    
    // Check that filters are hidden again
    await waitFor(() => {
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
    });
  });

  test('searches for logs when search is performed', async () => {
    render(<ErrorLogViewer />);
    
    // Click the filter button to show filters
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Wait for filters to be visible
    await waitFor(() => {
      expect(screen.getByText('Search')).toBeInTheDocument();
    });
    
    // Get the search input
    const searchInput = screen.getByPlaceholderText('Search message, component, ID...');
    
    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'database error' } });
    
    // Simulate pressing Enter
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    // Check that search was performed
    await waitFor(() => {
      expect(errorLogService.searchLogs).toHaveBeenCalledWith(
        'database error',
        expect.any(Number),
        expect.any(Number),
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  test('applies filters when "Apply Filters" button is clicked', async () => {
    render(<ErrorLogViewer />);
    
    // Click the filter button to show filters
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Wait for filters to be visible and loaded
    await waitFor(() => {
      expect(screen.getByText('Severity')).toBeInTheDocument();
      expect(screen.getByText('All Severities')).toBeInTheDocument();
    });
    
    // Select a severity filter
    fireEvent.mouseDown(screen.getByLabelText(/severity/i));
    fireEvent.click(screen.getByText('error'));
    
    // Click Apply Filters button
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Check that getErrorLogs was called with the filter
    await waitFor(() => {
      expect(errorLogService.getErrorLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'error',
        })
      );
    });
  });

  test('resets filters when "Reset" button is clicked', async () => {
    render(<ErrorLogViewer />);
    
    // Click the filter button to show filters
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Wait for filters to be visible
    await waitFor(() => {
      expect(screen.getByText('Severity')).toBeInTheDocument();
    });
    
    // Select a severity filter
    fireEvent.mouseDown(screen.getByLabelText(/severity/i));
    fireEvent.click(screen.getByText('error'));
    
    // Click Reset button
    fireEvent.click(screen.getByText('Reset'));
    
    // Check that getErrorLogs was called again with default parameters
    await waitFor(() => {
      expect(errorLogService.getErrorLogs).toHaveBeenCalledTimes(3); // Initial + after severity change + after reset
    });
  });

  test('exports logs in CSV format when export is clicked', async () => {
    render(<ErrorLogViewer />);
    
    // Wait for logs to be loaded
    await waitFor(() => {
      expect(errorLogService.getErrorLogs).toHaveBeenCalledTimes(1);
    });
    
    // Select CSV format (default)
    
    // Click Export button
    fireEvent.click(screen.getByText('Export'));
    
    // Check that exportLogsCSV was called
    await waitFor(() => {
      expect(errorLogService.exportLogsCSV).toHaveBeenCalled();
    });
  });

  test('exports logs in JSON format when selected and export is clicked', async () => {
    render(<ErrorLogViewer />);
    
    // Wait for logs to be loaded
    await waitFor(() => {
      expect(errorLogService.getErrorLogs).toHaveBeenCalledTimes(1);
    });
    
    // Select JSON format
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('JSON'));
    
    // Click Export button
    fireEvent.click(screen.getByText('Export'));
    
    // Check that exportLogsJSON was called
    await waitFor(() => {
      expect(errorLogService.exportLogsJSON).toHaveBeenCalled();
    });
  });

  test('shows log details when a log entry is clicked', async () => {
    render(<ErrorLogViewer />);
    
    // Wait for logs to be loaded
    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });
    
    // Click on a log entry
    fireEvent.click(screen.getByText('Database connection failed'));
    
    // Check that getLogDetails was called
    await waitFor(() => {
      expect(errorLogService.getLogDetails).toHaveBeenCalledWith('log-1');
    });
    
    // Check that the detail dialog is shown with stack trace
    await waitFor(() => {
      expect(screen.getByText('Error: Database connection failed')).toBeInTheDocument();
      expect(screen.getByText('at connectToDatabase (database.js:42)')).toBeInTheDocument();
    });
  });
});