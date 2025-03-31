// DocumentationHub.test.jsx - Tests for DocumentationAnalytics component

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentationAnalytics from '@components/admin/DocumentationAnalytics';
import documentationAnalyticsService from '@services/documentationAnalyticsService';
import { NotificationContext } from '@contexts/NotificationContext';

// Mock the documentation analytics service
jest.mock('../../../services/documentationAnalyticsService');

// Mock the chart library
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

// Create mock data for tests
const mockStats = {
  total_views: 1250,
  unique_documents: 75,
  unique_users: 120,
  start_date: '2025-03-01T00:00:00Z',
  end_date: '2025-03-28T00:00:00Z',
  top_documents: [
    { document_id: 'doc1', title: 'Getting Started Guide', views: 250 },
    { document_id: 'doc2', title: 'API Reference', views: 180 },
    { document_id: 'doc3', title: 'Troubleshooting', views: 150 },
  ],
  feedback: {
    positive: 85,
    negative: 15,
  },
};

const mockSearchTerms = [
  { term: 'integration', count: 50 },
  { term: 'api', count: 40 },
  { term: 'authentication', count: 30 },
];

const mockCategoryUsage = [
  { category: 'API', views: 500, documents: 25 },
  { category: 'Tutorials', views: 350, documents: 15 },
  { category: 'Reference', views: 300, documents: 20 },
];

const mockEngagementMetrics = {
  average_session_duration: 245, // in seconds
  average_pages_per_session: 3.5,
  bounce_rate: 0.25,
  returning_users: 85,
  new_users: 35,
  device_breakdown: {
    Desktop: 70,
    Mobile: 25,
    Tablet: 5,
  },
  browser_breakdown: {
    Chrome: 60,
    Firefox: 20,
    Safari: 15,
    Edge: 5,
  },
};

// Mock notification context
const mockShowToast = jest.fn();
const mockNotificationContext = {
  showToast: mockShowToast,
};

// Helper function to set up component render with mocked context
const renderWithContext = (component) => {
  // Added display name
  renderWithContext.displayName = 'renderWithContext';

  // Added display name
  renderWithContext.displayName = 'renderWithContext';

  // Added display name
  renderWithContext.displayName = 'renderWithContext';

  // Added display name
  renderWithContext.displayName = 'renderWithContext';

  // Added display name
  renderWithContext.displayName = 'renderWithContext';


  return render(
    <NotificationContext.Provider value={mockNotificationContext}>
      {component}
    </NotificationContext.Provider>
  );
};

describe('DocumentationAnalytics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure the service mocks to return dummy data
    documentationAnalyticsService.getDocumentationStats.mockResolvedValue(mockStats);
    documentationAnalyticsService.getTopSearchTerms.mockResolvedValue(mockSearchTerms);
    documentationAnalyticsService.getUsageByCategory.mockResolvedValue(mockCategoryUsage);
    documentationAnalyticsService.getUserEngagementMetrics.mockResolvedValue(mockEngagementMetrics);
  });
  
  it('renders loading state initially', async () => {
    renderWithContext(<DocumentationAnalytics />);
    
    // Check for loading indicator
    expect(screen.getByText('Loading analytics data...')).toBeInTheDocument();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });
  });
  
  it('displays overview metrics correctly', async () => {
    renderWithContext(<DocumentationAnalytics />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('1250')).toBeInTheDocument();
    });
    
    // Check all overview metrics
    expect(screen.getByText('1250')).toBeInTheDocument(); // Total views
    expect(screen.getByText('75')).toBeInTheDocument(); // Unique documents
    expect(screen.getByText('120')).toBeInTheDocument(); // Unique users
    expect(screen.getByText('85%')).toBeInTheDocument(); // Positive feedback percentage
  });
  
  it('displays time period selector and can change time period', async () => {
    renderWithContext(<DocumentationAnalytics />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });
    
    // Check that time period selector exists
    expect(screen.getByLabelText('Time Period')).toBeInTheDocument();
    
    // Change time period to "month"
    await act(async () => {
      const select = screen.getByLabelText('Time Period');
      userEvent.click(select);
      const option = screen.getByRole('option', { name: /Last 30 Days/i });
      userEvent.click(option);
    });
    
    // Verify that the service was called with the new time period
    expect(documentationAnalyticsService.getDocumentationStats).toHaveBeenCalledWith('month');
    expect(documentationAnalyticsService.getTopSearchTerms).toHaveBeenCalledWith('month');
    expect(documentationAnalyticsService.getUsageByCategory).toHaveBeenCalledWith('month');
    expect(documentationAnalyticsService.getUserEngagementMetrics).toHaveBeenCalledWith('month');
  });
  
  it('displays tabs and allows switching between them', async () => {
    renderWithContext(<DocumentationAnalytics />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });
    
    // Check that all tabs are present
    expect(screen.getByRole('tab', { name: /Popular Documents/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Search Terms/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /User Engagement/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Categories/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Feedback/i })).toBeInTheDocument();
    
    // Default tab is "Popular Documents" - check initial content
    expect(screen.getByText('Most Viewed Documents')).toBeInTheDocument();
    expect(screen.getByText('Getting Started Guide')).toBeInTheDocument();
    
    // Switch to "Search Terms" tab
    await act(async () => {
      userEvent.click(screen.getByRole('tab', { name: /Search Terms/i }));
    });
    
    // Check that the content changed
    expect(screen.getByText('Popular Search Terms')).toBeInTheDocument();
    expect(screen.getByText('integration')).toBeInTheDocument();
    
    // Switch to "User Engagement" tab
    await act(async () => {
      userEvent.click(screen.getByRole('tab', { name: /User Engagement/i }));
    });
    
    // Check user engagement content
    expect(screen.getByText('User Engagement')).toBeInTheDocument();
    expect(screen.getByText(/Average Session Duration:/)).toBeInTheDocument();
    expect(screen.getByText('Device Breakdown')).toBeInTheDocument();
    
    // Switch to "Categories" tab
    await act(async () => {
      userEvent.click(screen.getByRole('tab', { name: /Categories/i }));
    });
    
    // Check categories content
    expect(screen.getByText('Category Engagement')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('Tutorials')).toBeInTheDocument();
    
    // Switch to "Feedback" tab
    await act(async () => {
      userEvent.click(screen.getByRole('tab', { name: /Feedback/i }));
    });
    
    // Check feedback content
    expect(screen.getByText('Feedback Summary')).toBeInTheDocument();
    expect(screen.getByText('Positive Feedback')).toBeInTheDocument();
    expect(screen.getByText('Negative Feedback')).toBeInTheDocument();
  });
  
  it('handles API errors gracefully', async () => {
    // Mock API error
    documentationAnalyticsService.getDocumentationStats.mockRejectedValue(new Error('API error'));
    
    renderWithContext(<DocumentationAnalytics />);
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load documentation analytics data/)).toBeInTheDocument();
    });
    
    // Verify error handling
    expect(mockShowToast).toHaveBeenCalledWith('Failed to load documentation analytics', 'error');
  });
  
  it('allows refreshing data via the refresh button', async () => {
    renderWithContext(<DocumentationAnalytics />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });
    
    // Clear the mock calls to check if they're called again
    documentationAnalyticsService.getDocumentationStats.mockClear();
    documentationAnalyticsService.getTopSearchTerms.mockClear();
    documentationAnalyticsService.getUsageByCategory.mockClear();
    documentationAnalyticsService.getUserEngagementMetrics.mockClear();
    
    // Click refresh button
    await act(async () => {
      userEvent.click(screen.getByRole('button', { name: /Refresh/i }));
    });
    
    // Verify services were called again
    expect(documentationAnalyticsService.getDocumentationStats).toHaveBeenCalledTimes(1);
    expect(documentationAnalyticsService.getTopSearchTerms).toHaveBeenCalledTimes(1);
    expect(documentationAnalyticsService.getUsageByCategory).toHaveBeenCalledTimes(1);
    expect(documentationAnalyticsService.getUserEngagementMetrics).toHaveBeenCalledTimes(1);
  });
  
  it('renders charts correctly', async () => {
    renderWithContext(<DocumentationAnalytics />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });
    
    // Check bar chart in "Popular Documents" tab
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    
    // Switch to "Categories" tab
    await act(async () => {
      userEvent.click(screen.getByRole('tab', { name: /Categories/i }));
    });
    
    // Check pie chart in "Categories" tab
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
  
  it('formats date ranges correctly', async () => {
    renderWithContext(<DocumentationAnalytics />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });
    
    // Extract and check date range text
    const dateRange = `Data from ${new Date('2025-03-01T00:00:00Z').toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})} to ${new Date('2025-03-28T00:00:00Z').toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})}`;
    expect(screen.getByText(dateRange, { exact: false })).toBeInTheDocument();
  });
  
  it('handles empty data gracefully', async () => {
    // Mock empty data
    documentationAnalyticsService.getDocumentationStats.mockResolvedValue({
      ...mockStats,
      top_documents: [],
      feedback: { positive: 0, negative: 0 }
    });
    documentationAnalyticsService.getTopSearchTerms.mockResolvedValue([]);
    documentationAnalyticsService.getUsageByCategory.mockResolvedValue([]);
    
    renderWithContext(<DocumentationAnalytics />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText('Loading analytics data...')).not.toBeInTheDocument();
    });
    
    // Check that we handle empty data well
    expect(screen.getByText('N/A')).toBeInTheDocument(); // For positive feedback percentage
  });
});