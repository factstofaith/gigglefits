import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StorageMetrics from '@components/admin/MetricsCharts/StorageMetrics';
import { getStorageMetrics } from '@services/azureMonitorService';

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

describe('StorageMetrics', () => {
  // Sample mock data
  const mockMetricsData = {
    availability: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Availability (%)', data: [99.5, 100] }]
    },
    transactions: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Transactions', data: [12500, 13800] }]
    },
    latency: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Latency (ms)', data: [45, 42] }]
    },
    capacity: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Capacity (GB)', data: [256, 280] }]
    },
    ingress: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Ingress (MB)', data: [450, 520] }]
    },
    egress: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Egress (MB)', data: [680, 710] }]
    }
  };
  
  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Implement mock API for metrics fetching
    getStorageMetrics.mockImplementation((resourceId, metricName, timeRange) => {
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
    render(<StorageMetrics storageId="test-storage-id&quot; storageName="Test Storage Account" />);
    
    // Check that all charts are rendered
    expect(screen.getByTestId('metric-chart-availability')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-transactions')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-latency')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-capacity-usage')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-ingress-(data-in)')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-egress-(data-out)')).toBeInTheDocument();
    
    // Check the storage account name in the title
    expect(screen.getByText('Test Storage Account Metrics')).toBeInTheDocument();
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-availability').textContent).toBe('false');
    });
    
    // Verify API was called for each metric
    expect(getStorageMetrics).toHaveBeenCalledTimes(6);
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'availability', '24h');
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'transactions', '24h');
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'latency', '24h');
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'capacity', '24h');
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'ingress', '24h');
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'egress', '24h');
    
    // Check that data is passed to charts
    expect(screen.getByTestId('data-availability').textContent).toContain('Availability');
    expect(screen.getByTestId('data-transactions').textContent).toContain('Transactions');
    expect(screen.getByTestId('data-latency').textContent).toContain('Latency');
    expect(screen.getByTestId('data-capacity-usage').textContent).toContain('Capacity');
    expect(screen.getByTestId('data-ingress-(data-in)').textContent).toContain('Ingress');
    expect(screen.getByTestId('data-egress-(data-out)').textContent).toContain('Egress');
  });
  
  it('should handle missing storageName', async () => {
    render(<StorageMetrics storageId="test-storage-id&quot; />);
    
    // Check that generic title is used when no name is provided
    expect(screen.getByText("Storage Account Metrics')).toBeInTheDocument();
  });
  
  it('should handle API errors', async () => {
    // Mock API error
    getStorageMetrics.mockRejectedValue(new Error('API error'));
    
    render(<StorageMetrics storageId="test-storage-id&quot; storageName="Test Storage Account" />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId('error-availability').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-availability').textContent).toContain('Failed to load');
  });
  
  it('should handle missing storageId', async () => {
    render(<StorageMetrics storageId="&quot; />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId("error-availability').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-availability').textContent).toContain('No Storage Account ID provided');
  });
  
  it('should refresh metrics when time range changes', async () => {
    render(<StorageMetrics storageId="test-storage-id&quot; storageName="Test Storage Account" />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-availability').textContent).toBe('false');
    });
    
    // Clear API mock calls
    getStorageMetrics.mockClear();
    
    // Click refresh button on Availability chart
    await act(async () => {
      screen.getByTestId('refresh-btn-availability').click();
    });
    
    // Check that API was called with new time range
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'availability', '1h');
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'transactions', '1h');
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'latency', '1h');
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'capacity', '1h');
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'ingress', '1h');
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'egress', '1h');
    
    // Check that time range has been updated
    expect(screen.getByTestId('time-range-availability').textContent).toBe('1h');
  });
  
  it('should handle CSV download', async () => {
    render(<StorageMetrics storageId="test-storage-id&quot; storageName="Test Storage Account" />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-availability').textContent).toBe('false');
    });
    
    // Trigger CSV download
    await act(async () => {
      screen.getByTestId('download-btn-availability').click();
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
      <StorageMetrics 
        storageId="test-storage-id&quot; 
        storageName="Test Storage Account"
        initialTimeRange="7d&quot;
      />
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-availability').textContent).toBe('false');
    });
    
    // Check that API was called with custom time range
    expect(getStorageMetrics).toHaveBeenCalledWith('test-storage-id', 'availability', '7d');
    
    // Check that time range is displayed
    expect(screen.getByTestId('time-range-availability').textContent).toBe('7d');
  });
});