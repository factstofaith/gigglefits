import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatabaseMetrics from '@components/admin/MetricsCharts/DatabaseMetrics';
import { getDatabaseMetrics } from '@services/azureMonitorService';

// Mock the services
jest.mock('../../../../services/azureMonitorService');

// Mock MetricChart component
jest.mock('../../../../components/common/MetricChart', () => {
  const MockMetricChart = ({ 
    title, 
    data, 
    loading, 
    error, 
    refreshCallback, 
    initialTimeRange,
    onDownload
  }) => (
    <div data-testid={`metric-chart-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div data-testid={`title-${title.replace(/\s+/g, '-').toLowerCase()}`}>{title}</div>
      <div data-testid={`loading-${title.replace(/\s+/g, '-').toLowerCase()}`}>{loading.toString()}</div>
      <div data-testid={`error-${title.replace(/\s+/g, '-').toLowerCase()}`}>{error || 'no-error'}</div>
      <div data-testid={`data-${title.replace(/\s+/g, '-').toLowerCase()}`}>{JSON.stringify(data)}</div>
      <div data-testid={`time-range-${title.replace(/\s+/g, '-').toLowerCase()}`}>{initialTimeRange}</div>
      <button 
        data-testid={`refresh-btn-${title.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={() => refreshCallback('1h')}
      >
        Refresh
      </button>
      <button 
        data-testid={`download-btn-${title.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={() => onDownload('CSV', { 
          labels: ['2023-01-01T00:00:00Z'], 
          datasets: [{ label: 'Test', data: [123] }] 
        }, title)}
      >
        Download
      </button>
    </div>
  );
  
  return MockMetricChart;
});

describe('DatabaseMetrics', () => {
  // Sample mock data
  const mockMetricsData = {
    cpu: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'CPU Usage', data: [25, 50] }]
    },
    memory: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Memory Usage', data: [40, 45] }]
    },
    storage: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Storage Usage', data: [60, 65] }]
    },
    connections: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Active Connections', data: [150, 180] }]
    },
    queryPerformance: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Query Time (ms)', data: [25, 30] }]
    },
    iops: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'IOPS', data: [350, 380] }]
    }
  };
  
  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Implement mock API for metrics fetching
    getDatabaseMetrics.mockImplementation((resourceId, metricName, timeRange) => {
      return Promise.resolve(mockMetricsData[metricName]);
    });
    
    // Mock global URL and Blob objects
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock document operations for download
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.createElement = jest.fn().mockImplementation(() => ({
      href: '',
      download: '',
      click: jest.fn()
    }));
  });
  
  it('should render all metric charts', async () => {
    render(<DatabaseMetrics databaseId="test-database-id&quot; databaseName="Test Database" />);
    
    // Check that all charts are rendered
    expect(screen.getByTestId('metric-chart-cpu-usage')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-memory-usage')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-storage-usage')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-active-connections')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-query-performance')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-iops-(i/o-operations)')).toBeInTheDocument();
    
    // Check the database name in the title
    expect(screen.getByText('Test Database Metrics')).toBeInTheDocument();
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-cpu-usage').textContent).toBe('false');
    });
    
    // Verify API was called for each metric
    expect(getDatabaseMetrics).toHaveBeenCalledTimes(6);
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'cpu', '24h');
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'memory', '24h');
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'storage', '24h');
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'connections', '24h');
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'queryPerformance', '24h');
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'iops', '24h');
    
    // Check that data is passed to charts
    expect(screen.getByTestId('data-cpu-usage').textContent).toContain('CPU Usage');
    expect(screen.getByTestId('data-memory-usage').textContent).toContain('Memory Usage');
    expect(screen.getByTestId('data-storage-usage').textContent).toContain('Storage Usage');
    expect(screen.getByTestId('data-active-connections').textContent).toContain('Active Connections');
    expect(screen.getByTestId('data-query-performance').textContent).toContain('Query Time');
    expect(screen.getByTestId('data-iops-(i/o-operations)').textContent).toContain('IOPS');
  });
  
  it('should handle missing databaseName', async () => {
    render(<DatabaseMetrics databaseId="test-database-id&quot; />);
    
    // Check that generic title is used when no name is provided
    expect(screen.getByText("Database Metrics')).toBeInTheDocument();
  });
  
  it('should handle API errors', async () => {
    // Mock API error
    getDatabaseMetrics.mockRejectedValue(new Error('API error'));
    
    render(<DatabaseMetrics databaseId="test-database-id&quot; databaseName="Test Database" />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId('error-cpu-usage').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-cpu-usage').textContent).toContain('Failed to load');
  });
  
  it('should handle missing databaseId', async () => {
    render(<DatabaseMetrics databaseId="&quot; />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId("error-cpu-usage').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-cpu-usage').textContent).toContain('No Database ID provided');
  });
  
  it('should refresh metrics when time range changes', async () => {
    render(<DatabaseMetrics databaseId="test-database-id&quot; databaseName="Test Database" />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-cpu-usage').textContent).toBe('false');
    });
    
    // Clear API mock calls
    getDatabaseMetrics.mockClear();
    
    // Click refresh button on CPU chart
    await act(async () => {
      screen.getByTestId('refresh-btn-cpu-usage').click();
    });
    
    // Check that API was called with new time range
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'cpu', '1h');
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'memory', '1h');
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'storage', '1h');
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'connections', '1h');
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'queryPerformance', '1h');
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'iops', '1h');
    
    // Check that time range has been updated
    expect(screen.getByTestId('time-range-cpu-usage').textContent).toBe('1h');
  });
  
  it('should handle CSV download', async () => {
    render(<DatabaseMetrics databaseId="test-database-id&quot; databaseName="Test Database" />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-cpu-usage').textContent).toBe('false');
    });
    
    // Trigger CSV download
    await act(async () => {
      screen.getByTestId('download-btn-cpu-usage').click();
    });
    
    // Verify download link was created
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
  
  it('should initialize with custom time range', async () => {
    render(
      <DatabaseMetrics 
        databaseId="test-database-id&quot; 
        databaseName="Test Database"
        initialTimeRange="7d&quot;
      />
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-cpu-usage').textContent).toBe('false');
    });
    
    // Check that API was called with custom time range
    expect(getDatabaseMetrics).toHaveBeenCalledWith('test-database-id', 'cpu', '7d');
    
    // Check that time range is displayed
    expect(screen.getByTestId('time-range-cpu-usage').textContent).toBe('7d');
  });
});