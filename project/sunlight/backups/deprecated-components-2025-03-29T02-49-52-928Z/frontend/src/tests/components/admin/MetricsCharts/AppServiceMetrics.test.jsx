import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppServiceMetrics from '@components/admin/MetricsCharts/AppServiceMetrics';
import { getAppServiceMetrics } from '@services/azureMonitorService';

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

describe('AppServiceMetrics', () => {
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
    responseTime: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Response Time', data: [150, 175] }]
    },
    requests: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: 'Requests', data: [100, 120] }]
    },
    errors: {
      labels: ['2023-01-01T00:00:00Z', '2023-01-01T01:00:00Z'],
      datasets: [{ label: '4xx Errors', data: [5, 8] }, { label: '5xx Errors', data: [1, 2] }]
    }
  };
  
  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Implement mock API for metrics fetching
    getAppServiceMetrics.mockImplementation((resourceId, metricName, timeRange) => {
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
    render(<AppServiceMetrics appServiceId="test-app-service-id&quot; appServiceName="Test App Service" />);
    
    // Check that all charts are rendered
    expect(screen.getByTestId('metric-chart-cpu-usage')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-memory-usage')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-http-response-time')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-request-count')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-http-errors')).toBeInTheDocument();
    
    // Check the app service name in the title
    expect(screen.getByText('Test App Service Metrics')).toBeInTheDocument();
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-cpu-usage').textContent).toBe('false');
    });
    
    // Verify API was called for each metric
    expect(getAppServiceMetrics).toHaveBeenCalledTimes(5);
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'cpu', '24h');
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'memory', '24h');
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'responseTime', '24h');
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'requests', '24h');
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'errors', '24h');
    
    // Check that data is passed to charts
    expect(screen.getByTestId('data-cpu-usage').textContent).toContain('CPU Usage');
    expect(screen.getByTestId('data-memory-usage').textContent).toContain('Memory Usage');
    expect(screen.getByTestId('data-http-response-time').textContent).toContain('Response Time');
    expect(screen.getByTestId('data-request-count').textContent).toContain('Requests');
    expect(screen.getByTestId('data-http-errors').textContent).toContain('4xx Errors');
  });
  
  it('should handle missing appServiceName', async () => {
    render(<AppServiceMetrics appServiceId="test-app-service-id&quot; />);
    
    // Check that generic title is used when no name is provided
    expect(screen.getByText("App Service Metrics')).toBeInTheDocument();
  });
  
  it('should handle API errors', async () => {
    // Mock API error
    getAppServiceMetrics.mockRejectedValue(new Error('API error'));
    
    render(<AppServiceMetrics appServiceId="test-app-service-id&quot; appServiceName="Test App Service" />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId('error-cpu-usage').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-cpu-usage').textContent).toContain('Failed to load');
  });
  
  it('should handle missing appServiceId', async () => {
    render(<AppServiceMetrics appServiceId="&quot; />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId("error-cpu-usage').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-cpu-usage').textContent).toContain('No App Service ID provided');
  });
  
  it('should refresh metrics when time range changes', async () => {
    render(<AppServiceMetrics appServiceId="test-app-service-id&quot; appServiceName="Test App Service" />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-cpu-usage').textContent).toBe('false');
    });
    
    // Clear API mock calls
    getAppServiceMetrics.mockClear();
    
    // Click refresh button on CPU chart
    await act(async () => {
      screen.getByTestId('refresh-btn-cpu-usage').click();
    });
    
    // Check that API was called with new time range
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'cpu', '1h');
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'memory', '1h');
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'responseTime', '1h');
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'requests', '1h');
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'errors', '1h');
    
    // Check that time range has been updated
    expect(screen.getByTestId('time-range-cpu-usage').textContent).toBe('1h');
  });
  
  it('should handle CSV download', async () => {
    render(<AppServiceMetrics appServiceId="test-app-service-id&quot; appServiceName="Test App Service" />);
    
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
      <AppServiceMetrics 
        appServiceId="test-app-service-id&quot; 
        appServiceName="Test App Service"
        initialTimeRange="7d&quot;
      />
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-cpu-usage').textContent).toBe('false');
    });
    
    // Check that API was called with custom time range
    expect(getAppServiceMetrics).toHaveBeenCalledWith('test-app-service-id', 'cpu', '7d');
    
    // Check that time range is displayed
    expect(screen.getByTestId('time-range-cpu-usage').textContent).toBe('7d');
  });
});