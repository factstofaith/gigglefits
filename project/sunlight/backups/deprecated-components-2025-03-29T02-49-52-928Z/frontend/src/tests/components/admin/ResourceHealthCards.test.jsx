import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ResourceHealthCards from '@components/admin/ResourceHealthCards';
import { AzureConfigContext } from '@contexts/AzureConfigContext';
import { MonitoringContext } from '@contexts/MonitoringContext';
import { NotificationContext } from '@contexts/NotificationContext';
import * as azureMonitorService from '@services/azureMonitorService';

// Mock the service functions
jest.mock('../../../services/azureMonitorService', () => ({
  getResourceHealth: jest.fn()
}));

// Create mock test data
const mockResources = [
  {
    id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.Web/sites/test-app',
    name: 'test-app',
    type: 'Microsoft.Web/sites',
    status: 'Available',
    details: 'The resource is healthy',
    lastChecked: '2025-04-06T10:00:00Z'
  },
  {
    id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.Sql/servers/test-db',
    name: 'test-db',
    type: 'Microsoft.Sql/servers',
    status: 'Degraded',
    details: 'The resource is experiencing performance issues',
    lastChecked: '2025-04-06T10:05:00Z'
  },
  {
    id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.Storage/storageAccounts/teststorage',
    name: 'teststorage',
    type: 'Microsoft.Storage/storageAccounts',
    status: 'Unavailable',
    details: 'The resource is currently down',
    lastChecked: '2025-04-06T10:10:00Z'
  },
  {
    id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.KeyVault/vaults/test-kv',
    name: 'test-kv',
    type: 'Microsoft.KeyVault/vaults',
    status: 'Available',
    details: 'The resource is healthy',
    lastChecked: '2025-04-06T10:15:00Z'
  }
];

// Mock context values
const mockAzureConfig = {
  isConfigured: true,
  isConnected: true,
  config: {
    subscription_id: 'test-subscription',
    resource_group: 'test-rg'
  }
};

const mockMonitoringContext = {
  resourceHealthState: {
    resources: mockResources,
    loading: false,
    error: null,
    lastUpdated: new Date()
  },
  refreshResourceHealth: jest.fn()
};

const mockNotification = {
  showNotification: jest.fn(),
  showError: jest.fn()
};

// Create wrapper component with providers
function renderWithProviders(ui, contextOverrides = {}) {
  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  const monitoringValue = { 
    ...mockMonitoringContext,
    ...contextOverrides
  };
  
  return render(
    <NotificationContext.Provider value={mockNotification}>
      <AzureConfigContext.Provider value={mockAzureConfig}>
        <MonitoringContext.Provider value={monitoringValue}>
          {ui}
        </MonitoringContext.Provider>
      </AzureConfigContext.Provider>
    </NotificationContext.Provider>
  );
}

describe('ResourceHealthCards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading indicator when data is loading', () => {
    renderWithProviders(<ResourceHealthCards />, {
      resourceHealthState: {
        ...mockMonitoringContext.resourceHealthState,
        loading: true
      }
    });
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/Loading resource health data/i)).toBeInTheDocument();
  });

  test('renders error message when there is an error', () => {
    renderWithProviders(<ResourceHealthCards />, {
      resourceHealthState: {
        ...mockMonitoringContext.resourceHealthState,
        error: 'Failed to fetch resource health data'
      }
    });
    
    expect(screen.getByText(/Failed to fetch resource health data/i)).toBeInTheDocument();
  });

  test('renders placeholder when no resources are found', () => {
    renderWithProviders(<ResourceHealthCards />, {
      resourceHealthState: {
        ...mockMonitoringContext.resourceHealthState,
        resources: []
      }
    });
    
    expect(screen.getByText(/No resources found/i)).toBeInTheDocument();
  });

  test('renders resource cards with correct statuses and grouping', () => {
    renderWithProviders(<ResourceHealthCards />);
    
    // Check for resource types grouping headers
    expect(screen.getByText(/App Services/i)).toBeInTheDocument();
    expect(screen.getByText(/Databases/i)).toBeInTheDocument();
    expect(screen.getByText(/Storage Accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/Key Vaults/i)).toBeInTheDocument();
    
    // Check for resource names
    expect(screen.getByText('test-app')).toBeInTheDocument();
    expect(screen.getByText('test-db')).toBeInTheDocument();
    expect(screen.getByText('teststorage')).toBeInTheDocument();
    expect(screen.getByText('test-kv')).toBeInTheDocument();
    
    // Check for status labels
    const availableStatuses = screen.getAllByText('Available');
    expect(availableStatuses).toHaveLength(2);
    expect(screen.getByText('Degraded')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  test('renders status indicators with correct colors', () => {
    renderWithProviders(<ResourceHealthCards />);
    
    // Get all status indicators
    const statusIndicators = screen.getAllByTestId('status-indicator');
    
    // Check that we have the right number of indicators
    expect(statusIndicators).toHaveLength(4);
    
    // Check status indicator colors by finding the right card and verifying its status indicator
    const appCard = screen.getByText('test-app').closest('[data-testid="resource-card"]');
    const appStatusIndicator = appCard.querySelector('[data-testid="status-indicator"]');
    expect(appStatusIndicator).toHaveClass('success'); // Or whatever class is used for available status
    
    const dbCard = screen.getByText('test-db').closest('[data-testid="resource-card"]');
    const dbStatusIndicator = dbCard.querySelector('[data-testid="status-indicator"]');
    expect(dbStatusIndicator).toHaveClass('warning'); // Or whatever class is used for degraded status
    
    const storageCard = screen.getByText('teststorage').closest('[data-testid="resource-card"]');
    const storageStatusIndicator = storageCard.querySelector('[data-testid="status-indicator"]');
    expect(storageStatusIndicator).toHaveClass('error'); // Or whatever class is used for unavailable status
  });

  test('calls refresh function when refresh button is clicked', async () => {
    renderWithProviders(<ResourceHealthCards />);
    
    // Find refresh button
    const refreshButton = screen.getByLabelText(/refresh/i);
    
    // Click refresh button
    fireEvent.click(refreshButton);
    
    // Check if refresh function was called
    await waitFor(() => {
      expect(mockMonitoringContext.refreshResourceHealth).toHaveBeenCalled();
    });
  });

  test('displays last updated time correctly', () => {
    const lastUpdated = new Date('2025-04-06T10:30:00Z');
    renderWithProviders(<ResourceHealthCards />, {
      resourceHealthState: {
        ...mockMonitoringContext.resourceHealthState,
        lastUpdated
      }
    });
    
    // Format the date as it would appear in the component
    const formattedDate = lastUpdated.toLocaleTimeString();
    
    // Check if the formatted date is displayed
    expect(screen.getByText(new RegExp(`Last updated: ${formattedDate}`, 'i'))).toBeInTheDocument();
  });

  test('shows resource details when card is clicked', () => {
    renderWithProviders(<ResourceHealthCards />);
    
    // Find a resource card and click it
    const appCard = screen.getByText('test-app').closest('[data-testid="resource-card"]');
    fireEvent.click(appCard);
    
    // Check if details are shown
    expect(screen.getByText(/The resource is healthy/i)).toBeInTheDocument();
  });

  test('groups resources correctly by type', () => {
    // Add an additional app service to test grouping multiple resources of same type
    const resourcesWithExtra = [
      ...mockResources,
      {
        id: '/subscriptions/123/resourceGroups/test-rg/providers/Microsoft.Web/sites/test-app-2',
        name: 'test-app-2',
        type: 'Microsoft.Web/sites',
        status: 'Available',
        details: 'The resource is healthy',
        lastChecked: '2025-04-06T10:20:00Z'
      }
    ];
    
    renderWithProviders(<ResourceHealthCards />, {
      resourceHealthState: {
        ...mockMonitoringContext.resourceHealthState,
        resources: resourcesWithExtra
      }
    });
    
    // Find the App Services section
    const appServicesSection = screen.getByText(/App Services/i).closest('[data-testid="resource-group"]');
    
    // Check that the section contains both app services
    expect(appServicesSection).toContainElement(screen.getByText('test-app'));
    expect(appServicesSection).toContainElement(screen.getByText('test-app-2'));
    
    // Verify total resource count
    expect(screen.getAllByTestId('resource-card')).toHaveLength(5);
  });
});