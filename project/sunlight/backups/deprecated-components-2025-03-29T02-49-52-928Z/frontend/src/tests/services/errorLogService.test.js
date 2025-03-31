import axios from 'axios';
import {
  getErrorLogs,
  searchLogs,
  getLogDetails,
  exportLogsCSV,
  exportLogsJSON,
  getSeverityLevels,
  getComponents
} from '../../services/errorLogService';

// Mock axios
jest.mock('axios');

// Mock the auth service for token management
jest.mock('../../services/authService', () => ({
  getAuthToken: jest.fn().mockResolvedValue('test-token'),
  refreshToken: jest.fn().mockResolvedValue(true),
  logout: jest.fn()
}));

// Mock the notification helper
jest.mock('../../utils/notificationHelper', () => ({
  createNotificationManager: jest.fn().mockReturnValue({
    showToast: jest.fn()
  })
}));

describe('Error Log Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a spy for URL.createObjectURL when testing export functions
    global.URL.createObjectURL = jest.fn();
    
    // Mock document.createElement and related functions for export tests
    document.createElement = jest.fn().mockReturnValue({
      setAttribute: jest.fn(),
      style: {},
      click: jest.fn(),
    });
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  describe('getErrorLogs', () => {
    test('fetches error logs with default parameters', async () => {
      const mockResponse = {
        data: {
          logs: [
            { id: 'log-1', severity: 'error', component: 'backend', message: 'Test error', timestamp: '2025-03-01T12:00:00.000Z' }
          ],
          total: 1,
          page: 0,
          page_size: 10
        }
      };
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getErrorLogs();
      
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    test('fetches error logs with custom parameters', async () => {
      const mockResponse = {
        data: {
          logs: [
            { id: 'log-1', severity: 'error', component: 'backend', message: 'Test error', timestamp: '2025-03-01T12:00:00.000Z' }
          ],
          total: 1,
          page: 0,
          page_size: 10
        }
      };
      
      const params = {
        severity: 'error',
        component: 'backend',
        skip: 10,
        limit: 20
      };
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getErrorLogs(params);
      
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs', { params });
      expect(result).toEqual(mockResponse.data);
    });

    test('handles error when fetching logs fails', async () => {
      const errorMessage = 'Network error';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(getErrorLogs()).rejects.toThrow();
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs', { params: {} });
    });
  });

  describe('searchLogs', () => {
    test('searches logs with query string', async () => {
      const mockResponse = {
        data: {
          logs: [
            { id: 'log-1', severity: 'error', component: 'backend', message: 'Test error', timestamp: '2025-03-01T12:00:00.000Z' }
          ],
          total: 1,
          page: 0,
          page_size: 10
        }
      };
      
      const searchQuery = 'error message';
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await searchLogs(searchQuery);
      
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/search', {
        params: { query: searchQuery }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('searches logs with additional filters', async () => {
      const mockResponse = {
        data: {
          logs: [
            { id: 'log-1', severity: 'error', component: 'backend', message: 'Test error', timestamp: '2025-03-01T12:00:00.000Z' }
          ],
          total: 1,
          page: 0,
          page_size: 10
        }
      };
      
      const searchQuery = 'error message';
      const params = {
        severity: 'error',
        component: 'backend',
        skip: 10,
        limit: 20
      };
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await searchLogs(searchQuery, params);
      
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/search', {
        params: { query: searchQuery, ...params }
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('handles error when searching logs fails', async () => {
      const errorMessage = 'Network error';
      const searchQuery = 'error message';
      
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(searchLogs(searchQuery)).rejects.toThrow();
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/search', {
        params: { query: searchQuery }
      });
    });
  });

  describe('getLogDetails', () => {
    test('fetches details for a specific log', async () => {
      const logId = 'log-123';
      const mockResponse = {
        data: {
          id: logId,
          severity: 'error',
          component: 'backend',
          message: 'Test error',
          timestamp: '2025-03-01T12:00:00.000Z',
          stack_trace: 'Error stack trace',
          context: { request_id: 'req-123' }
        }
      };
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getLogDetails(logId);
      
      expect(axios.get).toHaveBeenCalledWith(`/api/admin/monitoring/error-logs/${logId}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('handles error when fetching log details fails', async () => {
      const logId = 'log-123';
      const errorMessage = 'Network error';
      
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(getLogDetails(logId)).rejects.toThrow();
      expect(axios.get).toHaveBeenCalledWith(`/api/admin/monitoring/error-logs/${logId}`);
    });
  });

  describe('getSeverityLevels', () => {
    test('fetches available severity levels', async () => {
      const mockResponse = {
        data: ['critical', 'error', 'warning', 'info', 'debug', 'trace']
      };
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getSeverityLevels();
      
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/severity-levels');
      expect(result).toEqual(mockResponse.data);
    });

    test('handles error when fetching severity levels fails', async () => {
      const errorMessage = 'Network error';
      
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(getSeverityLevels()).rejects.toThrow();
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/severity-levels');
    });
  });

  describe('getComponents', () => {
    test('fetches available component names', async () => {
      const mockResponse = {
        data: ['frontend', 'backend', 'database', 'api', 'authentication', 'storage']
      };
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      const result = await getComponents();
      
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/components');
      expect(result).toEqual(mockResponse.data);
    });

    test('handles error when fetching components fails', async () => {
      const errorMessage = 'Network error';
      
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      await expect(getComponents()).rejects.toThrow();
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/components');
    });
  });

  describe('exportLogsCSV', () => {
    test('exports logs to CSV', async () => {
      const mockResponse = {
        data: 'id,severity,component,message,timestamp\nlog-1,error,backend,"Test error",2025-03-01T12:00:00.000Z',
        headers: {
          'content-type': 'text/csv',
          'content-disposition': 'attachment; filename=error_logs_export_20250301.csv'
        }
      };
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      // Create a Blob constructor mock
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        options
      }));
      
      await exportLogsCSV();
      
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/export', {
        params: { format: 'csv' },
        responseType: 'blob'
      });
      
      // Check that the download was triggered
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    test('exports logs to CSV with filters', async () => {
      const mockResponse = {
        data: 'id,severity,component,message,timestamp\nlog-1,error,backend,"Test error",2025-03-01T12:00:00.000Z',
        headers: {
          'content-type': 'text/csv',
          'content-disposition': 'attachment; filename=error_logs_export_20250301.csv'
        }
      };
      
      const params = {
        severity: 'error',
        component: 'backend'
      };
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      // Create a Blob constructor mock
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        options
      }));
      
      await exportLogsCSV(params);
      
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/export', {
        params: { format: 'csv', ...params },
        responseType: 'blob'
      });
    });
  });

  describe('exportLogsJSON', () => {
    test('exports logs to JSON', async () => {
      const mockResponse = {
        data: '[{"id":"log-1","severity":"error","component":"backend","message":"Test error","timestamp":"2025-03-01T12:00:00.000Z"}]',
        headers: {
          'content-type': 'application/json',
          'content-disposition': 'attachment; filename=error_logs_export_20250301.json'
        }
      };
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      // Create a Blob constructor mock
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        options
      }));
      
      await exportLogsJSON();
      
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/export', {
        params: { format: 'json' },
        responseType: 'blob'
      });
      
      // Check that the download was triggered
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    test('exports logs to JSON with filters', async () => {
      const mockResponse = {
        data: '[{"id":"log-1","severity":"error","component":"backend","message":"Test error","timestamp":"2025-03-01T12:00:00.000Z"}]',
        headers: {
          'content-type': 'application/json',
          'content-disposition': 'attachment; filename=error_logs_export_20250301.json'
        }
      };
      
      const params = {
        severity: 'error',
        component: 'backend'
      };
      
      axios.get.mockResolvedValueOnce(mockResponse);
      
      // Create a Blob constructor mock
      global.Blob = jest.fn().mockImplementation((content, options) => ({
        content,
        options
      }));
      
      await exportLogsJSON(params);
      
      expect(axios.get).toHaveBeenCalledWith('/api/admin/monitoring/error-logs/export', {
        params: { format: 'json', ...params },
        responseType: 'blob'
      });
    });
  });
});