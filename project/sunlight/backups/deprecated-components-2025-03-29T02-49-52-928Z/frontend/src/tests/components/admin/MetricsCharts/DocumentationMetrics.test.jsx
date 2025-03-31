import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentationMetrics from '@components/admin/MetricsCharts/DocumentationMetrics';
import { 
  getDocumentationStats, 
  getTopSearchTerms, 
  getUserEngagementMetrics,
  getUsageByCategory
} from '@services/documentationAnalyticsService';

// Mock the services
jest.mock('../../../../services/documentationAnalyticsService');

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
        onClick={() => refreshCallback('day')}
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

describe('DocumentationMetrics', () => {
  // Sample mock data
  const mockStatsData = {
    total_views: 5280,
    unique_documents: 84,
    unique_users: 320,
    anonymous_views: 1240,
    feedback: {
      positive: 85,
      negative: 15
    },
    top_documents: [
      { title: 'Getting Started Guide', document_id: 'doc-001', views: 450 },
      { title: 'API Reference', document_id: 'doc-002', views: 380 },
      { title: 'Authentication Guide', document_id: 'doc-003', views: 310 },
      { title: 'Deployment Instructions', document_id: 'doc-004', views: 275 },
      { title: 'Troubleshooting', document_id: 'doc-005', views: 240 }
    ]
  };
  
  const mockSearchTermsData = [
    { term: 'api', count: 120 },
    { term: 'authentication', count: 95 },
    { term: 'deploy', count: 85 },
    { term: 'error', count: 75 },
    { term: 'configuration', count: 65 }
  ];
  
  const mockEngagementMetricsData = {
    avg_time_on_page: 125, // seconds
    bounce_rate: 35.8, // percentage
    device_breakdown: {
      desktop: 65,
      mobile: 25,
      tablet: 10
    },
    browser_breakdown: {
      chrome: 55,
      firefox: 20,
      safari: 15,
      edge: 8,
      other: 2
    }
  };
  
  const mockCategoryUsageData = [
    { category: 'API Documentation', views: 1250 },
    { category: 'Tutorials', views: 980 },
    { category: 'Guides', views: 850 },
    { category: 'Reference', views: 720 },
    { category: 'FAQ', views: 680 },
    { category: 'Troubleshooting', views: 520 },
    { category: 'Release Notes', views: 280 }
  ];
  
  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Implement mock API for metrics fetching
    getDocumentationStats.mockResolvedValue(mockStatsData);
    getTopSearchTerms.mockResolvedValue(mockSearchTermsData);
    getUserEngagementMetrics.mockResolvedValue(mockEngagementMetricsData);
    getUsageByCategory.mockResolvedValue(mockCategoryUsageData);
    
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
  
  it('should render all metric charts and stats', async () => {
    render(<DocumentationMetrics />);
    
    // Check title
    expect(screen.getByText('Documentation Usage Analytics')).toBeInTheDocument();
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-popular-documents').textContent).toBe('false');
    });
    
    // Check stats display
    expect(screen.getByText('5280')).toBeInTheDocument(); // Total Views
    expect(screen.getByText('84')).toBeInTheDocument(); // Unique Documents
    expect(screen.getByText('320')).toBeInTheDocument(); // Unique Users
    expect(screen.getByText('1240')).toBeInTheDocument(); // Anonymous Views
    
    // Check that all charts are rendered
    expect(screen.getByTestId('metric-chart-popular-documents')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-top-search-terms')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-documentation-by-category')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-documentation-feedback')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-device-breakdown')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-browser-breakdown')).toBeInTheDocument();
    
    // Verify API was called for each data source
    expect(getDocumentationStats).toHaveBeenCalledWith('week');
    expect(getTopSearchTerms).toHaveBeenCalledWith('week');
    expect(getUserEngagementMetrics).toHaveBeenCalledWith('week');
    expect(getUsageByCategory).toHaveBeenCalledWith('week');
  });
  
  it('should handle API errors', async () => {
    // Mock API error
    getDocumentationStats.mockRejectedValue(new Error('API error'));
    
    render(<DocumentationMetrics />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByTestId('error-popular-documents').textContent).not.toBe('no-error');
    });
    
    // Check that error message is displayed
    expect(screen.getByTestId('error-popular-documents').textContent).toContain('Failed to load');
  });
  
  it('should refresh metrics when time range changes', async () => {
    render(<DocumentationMetrics />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-popular-documents').textContent).toBe('false');
    });
    
    // Clear API mock calls
    getDocumentationStats.mockClear();
    getTopSearchTerms.mockClear();
    getUserEngagementMetrics.mockClear();
    getUsageByCategory.mockClear();
    
    // Click refresh button on popular documents chart
    await act(async () => {
      screen.getByTestId('refresh-btn-popular-documents').click();
    });
    
    // Check that API was called with new time range
    expect(getDocumentationStats).toHaveBeenCalledWith('day');
    expect(getTopSearchTerms).toHaveBeenCalledWith('day');
    expect(getUserEngagementMetrics).toHaveBeenCalledWith('day');
    expect(getUsageByCategory).toHaveBeenCalledWith('day');
    
    // Check that time range has been updated
    expect(screen.getByTestId('time-range-popular-documents').textContent).toBe('day');
  });
  
  it('should handle CSV download', async () => {
    render(<DocumentationMetrics />);
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-popular-documents').textContent).toBe('false');
    });
    
    // Trigger CSV download
    await act(async () => {
      screen.getByTestId('download-btn-popular-documents').click();
    });
    
    // Verify download link was created
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
  
  it('should initialize with custom time range', async () => {
    render(<DocumentationMetrics initialTimeRange="month&quot; />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId("loading-popular-documents').textContent).toBe('false');
    });
    
    // Check that API was called with custom time range
    expect(getDocumentationStats).toHaveBeenCalledWith('month');
    
    // Check that time range is displayed
    expect(screen.getByTestId('time-range-popular-documents').textContent).toBe('month');
  });
  
  it('should handle partial data', async () => {
    // Mock partial data (missing some properties)
    getDocumentationStats.mockResolvedValue({
      total_views: 3500,
      unique_documents: 50,
      unique_users: 180,
      anonymous_views: 800
      // Missing feedback and top_documents
    });
    
    render(<DocumentationMetrics />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-popular-documents').textContent).toBe('false');
    });
    
    // Check that basic stats are displayed
    expect(screen.getByText('3500')).toBeInTheDocument(); // Total Views
    expect(screen.getByText('50')).toBeInTheDocument(); // Unique Documents
    expect(screen.getByText('180')).toBeInTheDocument(); // Unique Users
    expect(screen.getByText('800')).toBeInTheDocument(); // Anonymous Views
    
    // Check that charts handle missing data gracefully
    expect(screen.getByTestId('data-popular-documents').textContent).toBe('');
    expect(screen.getByTestId('data-documentation-feedback').textContent).toBe('');
  });
});