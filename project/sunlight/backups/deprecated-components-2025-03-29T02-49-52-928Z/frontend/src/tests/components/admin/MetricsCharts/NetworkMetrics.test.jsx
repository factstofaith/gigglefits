import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NetworkMetrics from '@components/admin/MetricsCharts/NetworkMetrics';
import { getNetworkMetrics } from '@services/azureMonitorService';

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

describe('NetworkMetrics', () => {
  // Sample mock data
  const mockMetricsData = {
    throughput: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [
        { label: 'Inbound', data: [250, 320] },
        { label: 'Outbound', data: [180, 210] }
      ]
    },
    latency: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Latency (ms)', data: [12, 14] }]
    },
    packetLoss: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Packet Loss (%)', data: [0.5, 0.3] }]
    },
    connections: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Active Connections', data: [1250, 1320] }]
    },
    securityEvents: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [
        { label: 'DDoS Protection', data: [2, 0] },
        { label: 'Firewall Blocks', data: [15, 12] },
        { label: 'NSG Blocks', data: [8, 6] }
      ]
    },
    dataTransfer: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [
        { label: 'Inbound (GB)', data: [45, 52] },
        { label: 'Outbound (GB)', data: [68, 71] }
      ]
    }
  };
  
  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Implement mock API for metrics fetching
    getNetworkMetrics.mockImplementation((resourceId, metricName, timeRange) => {
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
    render(<NetworkMetrics networkId="test-network-id&quot; networkName="Test Virtual Network" />);
    
    // Check that all charts are rendered
    expect(screen.getByTestId('metric-chart-throughput')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-latency')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-packet-loss')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-active-connections')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-security-events')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-data-transfer')).toBeInTheDocument();
    
    // Check the network name in the title
    expect(screen.getByText('Test Virtual Network Metrics')).toBeInTheDocument();
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-throughput').textContent).toBe('false');
    });
    
    // Verify API was called for each metric
    expect(getNetworkMetrics).toHaveBeenCalledTimes(6);
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'throughput', '24h');
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'latency', '24h');
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'packetLoss', '24h');
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'connections', '24h');
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'securityEvents', '24h');
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'dataTransfer', '24h');
    
    // Check that data is passed to charts
    expect(screen.getByTestId('data-throughput').textContent).toContain('Inbound');
    expect(screen.getByTestId('data-latency').textContent).toContain('Latency');
    expect(screen.getByTestId('data-packet-loss').textContent).toContain('Packet Loss');
    expect(screen.getByTestId('data-active-connections').textContent).toContain('Active Connections');
    expect(screen.getByTestId('data-security-events').textContent).toContain('DDoS Protection');
    expect(screen.getByTestId('data-data-transfer').textContent).toContain('Inbound (GB)');
  });
  
  it('should handle missing networkName', async () => {
    render(<NetworkMetrics networkId="test-network-id&quot; />);
    
    // Check that generic title is used when no name is provided
    expect(screen.getByText("Network Metrics')).toBeInTheDocument();
  });
  
  it('should handle API errors', async () => {
    // Mock API error
    getNetworkMetrics.mockRejectedValue(new Error('API error'));
    
    render(<NetworkMetrics networkId="test-network-id&quot; networkName="Test Virtual Network" />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId('error-throughput').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-throughput').textContent).toContain('Failed to load');
  });
  
  it('should handle missing networkId', async () => {
    render(<NetworkMetrics networkId="&quot; />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId("error-throughput').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-throughput').textContent).toContain('No Network resource ID provided');
  });
  
  it('should refresh metrics when time range changes', async () => {
    render(<NetworkMetrics networkId="test-network-id&quot; networkName="Test Virtual Network" />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-throughput').textContent).toBe('false');
    });
    
    // Clear API mock calls
    getNetworkMetrics.mockClear();
    
    // Click refresh button on throughput chart
    await act(async () => {
      screen.getByTestId('refresh-btn-throughput').click();
    });
    
    // Check that API was called with new time range
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'throughput', '1h');
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'latency', '1h');
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'packetLoss', '1h');
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'connections', '1h');
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'securityEvents', '1h');
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'dataTransfer', '1h');
    
    // Check that time range has been updated
    expect(screen.getByTestId('time-range-throughput').textContent).toBe('1h');
  });
  
  it('should handle CSV download', async () => {
    render(<NetworkMetrics networkId="test-network-id&quot; networkName="Test Virtual Network" />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-throughput').textContent).toBe('false');
    });
    
    // Trigger CSV download
    await act(async () => {
      screen.getByTestId('download-btn-throughput').click();
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
      <NetworkMetrics 
        networkId="test-network-id&quot; 
        networkName="Test Virtual Network"
        initialTimeRange="7d&quot;
      />
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-throughput').textContent).toBe('false');
    });
    
    // Check that API was called with custom time range
    expect(getNetworkMetrics).toHaveBeenCalledWith('test-network-id', 'throughput', '7d');
    
    // Check that time range is displayed
    expect(screen.getByTestId('time-range-throughput').textContent).toBe('7d');
  });
});