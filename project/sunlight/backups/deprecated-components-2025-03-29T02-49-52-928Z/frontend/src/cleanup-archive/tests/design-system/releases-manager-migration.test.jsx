import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResourceContext } from '../../contexts/ResourceContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import ReleasesManagerRefactored from '../../components/admin/ReleasesManagerRefactored';

// Mock the useNotification hook
jest.mock('../../hooks/useNotification', () => ({
  __esModule: true,
  default: () => ({
    showToast: jest.fn(),
    addNotification: jest.fn(),
  }),
}));

// Mock the AdapterDateFns
jest.mock('@mui/x-date-pickers/AdapterDateFns', () => ({
  AdapterDateFns: class {},
}));

// Mock material icons
jest.mock('@mui/icons-material', () => ({
  Add: () => <span data-testid="add-icon" />,
  Edit: () => <span data-testid="edit-icon" />,
  Delete: () => <span data-testid="delete-icon" />,
  Search: () => <span data-testid="search-icon" />,
  Refresh: () => <span data-testid="refresh-icon" />,
  LocalShipping: () => <span data-testid="release-icon" />,
  Visibility: () => <span data-testid="visibility-icon" />,
  Apps: () => <span data-testid="apps-icon" />,
  Storage: () => <span data-testid="storage-icon" />,
  PlayArrow: () => <span data-testid="start-icon" />,
  Restore: () => <span data-testid="rollback-icon" />,
  ExpandMore: () => <span data-testid="expand-more-icon" />,
  Business: () => <span data-testid="tenant-icon" />,
  DateRange: () => <span data-testid="date-icon" />,
  Tag: () => <span data-testid="version-icon" />,
  Cancel: () => <span data-testid="cancel-icon" />,
  CheckCircle: () => <span data-testid="check-circle-icon" />,
  Save: () => <span data-testid="save-icon" />,
}));

// Mock data for tests
const mockReleases = [
  {
    id: 1,
    name: 'Spring 2025 Release',
    version: '1.0.0',
    description: 'Major update with new features',
    release_date: '2025-03-15T10:00:00',
    status: 'draft',
    items: [
      { item_id: 1, item_type: 'application', name: 'App 1', action: 'add' },
      { item_id: 2, item_type: 'dataset', name: 'Dataset 1', action: 'add' },
    ],
    tenants: [1, 2],
  },
  {
    id: 2,
    name: 'Summer 2025 Hotfix',
    version: '1.0.1',
    description: 'Critical bug fixes',
    release_date: '2025-06-20T14:00:00',
    status: 'scheduled',
    items: [{ item_id: 3, item_type: 'application', name: 'App 2', action: 'update' }],
    tenants: [1],
  },
];

const mockApplications = [
  { id: 1, name: 'Application 1' },
  { id: 2, name: 'Application 2' },
  { id: 3, name: 'Application 3' },
];

const mockDatasets = [
  { id: 1, name: 'Dataset 1' },
  { id: 2, name: 'Dataset 2' },
];

const mockTenants = [
  { id: 1, name: 'Tenant 1' },
  { id: 2, name: 'Tenant 2' },
  { id: 3, name: 'Tenant 3' },
];

// Mock resource context value
const mockResourceContextValue = {
  releases: mockReleases,
  applications: mockApplications,
  datasets: mockDatasets,
  tenants: mockTenants,
  releaseLoading: false,
  releaseError: null,
  fetchReleases: jest.fn(),
  fetchApplications: jest.fn(),
  fetchDatasets: jest.fn(),
  fetchTenants: jest.fn(),
  fetchReleaseById: jest.fn(),
  createRelease: jest.fn(),
  updateRelease: jest.fn(),
  deleteRelease: jest.fn(),
  executeRelease: jest.fn(),
  clearCurrentRelease: jest.fn(),
};

// Mock notification context value
const mockNotificationContextValue = {
  notifications: [],
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  clearAllNotifications: jest.fn(),
};

// Custom render function with providers
const renderReleasesManager = (props = {}) => {
  // Added display name
  renderReleasesManager.displayName = 'renderReleasesManager';

  // Added display name
  renderReleasesManager.displayName = 'renderReleasesManager';

  // Added display name
  renderReleasesManager.displayName = 'renderReleasesManager';

  // Added display name
  renderReleasesManager.displayName = 'renderReleasesManager';

  // Added display name
  renderReleasesManager.displayName = 'renderReleasesManager';


  return render(
    <NotificationContext.Provider value={mockNotificationContextValue}>
      <ResourceContext.Provider value={mockResourceContextValue}>
        <ReleasesManagerRefactored {...props} />
      </ResourceContext.Provider>
    </NotificationContext.Provider>
  );
};

describe('ReleasesManagerRefactored Component Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and action buttons', () => {
    renderReleasesManager();

    // Check title
    expect(screen.getByText('Manage Releases')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('New Release')).toBeInTheDocument();
  });

  it('renders the releases table with correct data', () => {
    renderReleasesManager();

    // Check table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Release Date')).toBeInTheDocument();

    // Check release data
    expect(screen.getByText('Spring 2025 Release')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();

    expect(screen.getByText('Summer 2025 Hotfix')).toBeInTheDocument();
    expect(screen.getByText('1.0.1')).toBeInTheDocument();
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('filters releases based on search input', () => {
    renderReleasesManager();

    // Get search input
    const searchInput = screen.getByPlaceholderText('Search releases...');

    // Search for 'Hotfix'
    fireEvent.change(searchInput, { target: { value: 'Hotfix' } });

    // Should show Summer release but not Spring release
    expect(screen.getByText('Summer 2025 Hotfix')).toBeInTheDocument();
    expect(screen.queryByText('Spring 2025 Release')).not.toBeInTheDocument();

    // Clear search to show all again
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Spring 2025 Release')).toBeInTheDocument();
    expect(screen.getByText('Summer 2025 Hotfix')).toBeInTheDocument();
  });

  it('calls refresh function when refresh button is clicked', () => {
    renderReleasesManager();

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockResourceContextValue.fetchReleases).toHaveBeenCalledTimes(2); // Once on mount, once on click
  });

  it('opens create dialog when New Release button is clicked', () => {
    renderReleasesManager();

    const newReleaseButton = screen.getByText('New Release');
    fireEvent.click(newReleaseButton);

    // Check dialog title
    expect(screen.getByText('Create New Release')).toBeInTheDocument();

    // Check form fields
    expect(screen.getByLabelText('Release Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Version')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  // Additional tests for verifying other functionality can be added here
});
