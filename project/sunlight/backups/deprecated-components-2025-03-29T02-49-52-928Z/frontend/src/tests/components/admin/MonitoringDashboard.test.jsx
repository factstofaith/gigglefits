import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonitoringDashboard from '@components/admin/MonitoringDashboard';
import { NotificationContext } from '@contexts/NotificationContext';
import { AzureConfigContext } from '@contexts/AzureConfigContext';
import { MonitoringContext } from '@contexts/MonitoringContext';

// Mock the child components
jest.mock('../../../components/admin/AzureConfigurationPanel', () => {
  return function MockAzureConfigPanel() {
  // Added display name
  MockAzureConfigPanel.displayName = 'MockAzureConfigPanel';

    return <div data-testid="azure-config-panel">Azure Config Panel</div>;
  };
});

jest.mock('../../../components/admin/ResourceHealthCards', () => {
  return function MockResourceHealthCards() {
  // Added display name
  MockResourceHealthCards.displayName = 'MockResourceHealthCards';

    return <div data-testid="resource-health-cards">Resource Health Cards</div>;
  };
});

jest.mock('../../../components/admin/ErrorLogViewer', () => {
  return function MockErrorLogViewer() {
  // Added display name
  MockErrorLogViewer.displayName = 'MockErrorLogViewer';

    return <div data-testid="error-log-viewer">Error Log Viewer</div>;
  };
});

jest.mock('../../../components/admin/DocumentationAnalytics', () => {
  return function MockDocumentationAnalytics() {
  // Added display name
  MockDocumentationAnalytics.displayName = 'MockDocumentationAnalytics';

    return <div data-testid="documentation-analytics">Documentation Analytics</div>;
  };
});

jest.mock('../../../components/admin/AlertConfiguration', () => {
  return function MockAlertConfiguration() {
  // Added display name
  MockAlertConfiguration.displayName = 'MockAlertConfiguration';

    return <div data-testid="alert-configuration">Alert Configuration</div>;
  };
});

// Mock the service
jest.mock('../../../services/azureMonitorService', () => ({
  getAzureResources: jest.fn(() => Promise.resolve([])),
  getResourceHealth: jest.fn(() => Promise.resolve({})),
}));

// Create mock context values
const mockNotification = {
  showNotification: jest.fn(),
  showError: jest.fn()
};

const mockAzureConfig = {
  isConfigured: true,
  isConnected: true,
  discoverResources: jest.fn().mockResolvedValue({ success: true }),
  config: {
    subscription_id: 'test-subscription',
    resource_group: 'test-rg'
  }
};

const mockMonitoringContext = {
  refreshMetrics: jest.fn(),
  refreshResourceHealth: jest.fn(),
  loadAlerts: jest.fn(),
  metricsState: {
    loading: false,
    error: null,
    lastUpdated: new Date()
  },
  resourceHealthState: {
    loading: false,
    error: null,
    lastUpdated: new Date(),
    resources: []
  },
  alertsState: {
    loading: false,
    error: null,
    alerts: []
  },
  setTimeRange: jest.fn()
};

// Create wrapper component with providers
function renderWithProviders(ui) {
  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  return render(
    <NotificationContext.Provider value={mockNotification}>
      <AzureConfigContext.Provider value={mockAzureConfig}>
        <MonitoringContext.Provider value={mockMonitoringContext}>
          {ui}
        </MonitoringContext.Provider>
      </AzureConfigContext.Provider>
    </NotificationContext.Provider>
  );
}

describe('MonitoringDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with all tabs', () => {
    renderWithProviders(<MonitoringDashboard />);
    
    // Check if all tabs are rendered
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Metrics')).toBeInTheDocument();
    expect(screen.getByText('Error Logs')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('Alerts')).toBeInTheDocument();
  });

  test('switches between tabs correctly', async () => {
    renderWithProviders(<MonitoringDashboard />);
    
    // Config tab should be visible by default
    expect(screen.getByTestId('azure-config-panel')).toBeVisible();
    
    // Click on Resources tab
    fireEvent.click(screen.getByText('Resources'));
    await waitFor(() => {
      expect(screen.getByTestId('resource-health-cards')).toBeVisible();
    });
    
    // Click on Error Logs tab
    fireEvent.click(screen.getByText('Error Logs'));
    await waitFor(() => {
      expect(screen.getByTestId('error-log-viewer')).toBeVisible();
    });
    
    // Click on Documentation tab
    fireEvent.click(screen.getByText('Documentation'));
    await waitFor(() => {
      expect(screen.getByTestId('documentation-analytics')).toBeVisible();
    });
    
    // Click on Alerts tab
    fireEvent.click(screen.getByText('Alerts'));
    await waitFor(() => {
      expect(screen.getByTestId('alert-configuration')).toBeVisible();
    });
  });

  test('shows unconfigured state when Azure is not configured', () => {
    const unconfiguredAzureConfig = {
      ...mockAzureConfig,
      isConfigured: false,
      isConnected: false
    };
    
    render(
      <NotificationContext.Provider value={mockNotification}>
        <AzureConfigContext.Provider value={unconfiguredAzureConfig}>
          <MonitoringContext.Provider value={mockMonitoringContext}>
            <MonitoringDashboard />
          </MonitoringContext.Provider>
        </AzureConfigContext.Provider>
      </NotificationContext.Provider>
    );
    
    // Should show configuration message
    expect(screen.getByText(/Azure configuration is required/i)).toBeInTheDocument();
  });

  test('handles manual refresh correctly', async () => {
    renderWithProviders(<MonitoringDashboard />);
    
    // Click on Resources tab
    fireEvent.click(screen.getByText('Resources'));
    
    // Find and click refresh button
    const refreshButton = screen.getByLabelText(/refresh/i);
    fireEvent.click(refreshButton);
    
    // Verify refresh functions were called
    await waitFor(() => {
      expect(mockMonitoringContext.refreshResourceHealth).toHaveBeenCalled();
    });
  });

  test('displays error state correctly', () => {
    const errorMonitoringContext = {
      ...mockMonitoringContext,
      resourceHealthState: {
        ...mockMonitoringContext.resourceHealthState,
        error: 'Failed to fetch resources'
      }
    };
    
    render(
      <NotificationContext.Provider value={mockNotification}>
        <AzureConfigContext.Provider value={mockAzureConfig}>
          <MonitoringContext.Provider value={errorMonitoringContext}>
            <MonitoringDashboard />
          </MonitoringContext.Provider>
        </AzureConfigContext.Provider>
      </NotificationContext.Provider>
    );
    
    // Go to resources tab
    fireEvent.click(screen.getByText('Resources'));
    
    // Should show error message
    expect(screen.getByText(/Failed to fetch resources/i)).toBeInTheDocument();
  });

  test('displays loading state correctly', () => {
    const loadingMonitoringContext = {
      ...mockMonitoringContext,
      resourceHealthState: {
        ...mockMonitoringContext.resourceHealthState,
        loading: true
      }
    };
    
    render(
      <NotificationContext.Provider value={mockNotification}>
        <AzureConfigContext.Provider value={mockAzureConfig}>
          <MonitoringContext.Provider value={loadingMonitoringContext}>
            <MonitoringDashboard />
          </MonitoringContext.Provider>
        </AzureConfigContext.Provider>
      </NotificationContext.Provider>
    );
    
    // Go to resources tab
    fireEvent.click(screen.getByText('Resources'));
    
    // Should show loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});