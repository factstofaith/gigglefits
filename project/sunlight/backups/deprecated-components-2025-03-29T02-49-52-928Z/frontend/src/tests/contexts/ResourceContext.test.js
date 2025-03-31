// tests/contexts/ResourceContext.test.js

import React, { useContext } from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { ResourceProvider, useResource } from '@contexts/ResourceContext';

// Create mock functions for all admin service methods
const mockGetApplications = jest.fn();
const mockGetApplicationById = jest.fn();
const mockCreateApplication = jest.fn();
const mockUpdateApplication = jest.fn();
const mockDeleteApplication = jest.fn();

const mockGetDatasets = jest.fn();
const mockGetDatasetById = jest.fn();
const mockCreateDataset = jest.fn();
const mockUpdateDataset = jest.fn();
const mockDeleteDataset = jest.fn();

const mockGetReleases = jest.fn();
const mockGetReleaseById = jest.fn();
const mockCreateRelease = jest.fn();
const mockUpdateRelease = jest.fn();
const mockDeleteRelease = jest.fn();
const mockExecuteRelease = jest.fn();

const mockGetTenants = jest.fn();
const mockGetTenantById = jest.fn();
const mockCreateTenant = jest.fn();
const mockUpdateTenant = jest.fn();
const mockDeleteTenant = jest.fn();

const mockGetTenantApplications = jest.fn();
const mockGetTenantDatasets = jest.fn();
const mockAddApplicationToTenant = jest.fn();
const mockRemoveApplicationFromTenant = jest.fn();
const mockAddDatasetToTenant = jest.fn();
const mockRemoveDatasetFromTenant = jest.fn();

// Create a mock admin service with our mock functions
const mockAdminService = {
  // Applications
  getApplications: mockGetApplications,
  getApplicationById: mockGetApplicationById,
  createApplication: mockCreateApplication,
  updateApplication: mockUpdateApplication,
  deleteApplication: mockDeleteApplication,

  // Datasets
  getDatasets: mockGetDatasets,
  getDatasetById: mockGetDatasetById,
  createDataset: mockCreateDataset,
  updateDataset: mockUpdateDataset,
  deleteDataset: mockDeleteDataset,

  // Releases
  getReleases: mockGetReleases,
  getReleaseById: mockGetReleaseById,
  createRelease: mockCreateRelease,
  updateRelease: mockUpdateRelease,
  deleteRelease: mockDeleteRelease,
  executeRelease: mockExecuteRelease,

  // Tenants
  getTenants: mockGetTenants,
  getTenantById: mockGetTenantById,
  createTenant: mockCreateTenant,
  updateTenant: mockUpdateTenant,
  deleteTenant: mockDeleteTenant,

  // Tenant resources
  getTenantApplications: mockGetTenantApplications,
  getTenantDatasets: mockGetTenantDatasets,
  addApplicationToTenant: mockAddApplicationToTenant,
  removeApplicationFromTenant: mockRemoveApplicationFromTenant,
  addDatasetToTenant: mockAddDatasetToTenant,
  removeDatasetFromTenant: mockRemoveDatasetFromTenant,
};

// Mock data
const mockApplications = [
  { id: 1, name: 'Application 1', status: 'active' },
  { id: 2, name: 'Application 2', status: 'inactive' },
];

const mockDatasets = [
  { id: 1, name: 'Dataset 1', type: 'customer' },
  { id: 2, name: 'Dataset 2', type: 'product' },
];

const mockReleases = [
  { id: 1, name: 'Release 1', status: 'draft', version: '1.0' },
  { id: 2, name: 'Release 2', status: 'active', version: '2.0' },
];

const mockTenants = [
  { id: 1, name: 'Tenant 1', status: 'active', domain: 'tenant1.example.com' },
  { id: 2, name: 'Tenant 2', status: 'trial', domain: 'tenant2.example.com' },
];

const mockTenantApplications = [{ id: 1, name: 'Application 1', status: 'active' }];

const mockTenantDatasets = [{ id: 1, name: 'Dataset 1', type: 'customer' }];

// Test component
const TestComponent = () => {
  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';


  const {
    applications,
    datasets,
    releases,
    tenants,
    applicationLoading,
    datasetLoading,
    releaseLoading,
    tenantLoading,
    applicationError,
    datasetError,
    releaseError,
    tenantError,
    fetchApplications,
    fetchDatasets,
    fetchReleases,
    fetchTenants,
    fetchTenantResources,
    createApplication,
    updateApplication,
    deleteApplication,
    createDataset,
    updateDataset,
    deleteDataset,
    createRelease,
    updateRelease,
    deleteRelease,
    executeRelease,
    createTenant,
    updateTenant,
    deleteTenant,
    toggleApplication,
    toggleDataset,
  } = useResource();

  return (
    <div>
      {/* Resource counts */}
      <div data-testid="applications-count">{applications.length}</div>
      <div data-testid="datasets-count">{datasets.length}</div>
      <div data-testid="releases-count">{releases.length}</div>
      <div data-testid="tenants-count">{tenants.length}</div>

      {/* Loading states */}
      <div data-testid="application-loading">{applicationLoading ? 'true' : 'false'}</div>
      <div data-testid="dataset-loading">{datasetLoading ? 'true' : 'false'}</div>
      <div data-testid="release-loading">{releaseLoading ? 'true' : 'false'}</div>
      <div data-testid="tenant-loading">{tenantLoading ? 'true' : 'false'}</div>

      {/* Error states */}
      <div data-testid="application-error">{applicationError || 'no-error'}</div>
      <div data-testid="dataset-error">{datasetError || 'no-error'}</div>
      <div data-testid="release-error">{releaseError || 'no-error'}</div>
      <div data-testid="tenant-error">{tenantError || 'no-error'}</div>

      {/* Action buttons */}
      <button data-testid="fetch-applications" onClick={fetchApplications}>
        Fetch Applications
      </button>
      <button data-testid="fetch-datasets" onClick={fetchDatasets}>
        Fetch Datasets
      </button>
      <button data-testid="fetch-releases" onClick={fetchReleases}>
        Fetch Releases
      </button>
      <button data-testid="fetch-tenants" onClick={fetchTenants}>
        Fetch Tenants
      </button>

      <button data-testid="fetch-tenant-resources" onClick={() => fetchTenantResources(1)}>
        Fetch Tenant Resources
      </button>

      <button
        data-testid="create-application"
        onClick={() => createApplication({ name: 'New App' })}
      >
        Create Application
      </button>

      <button
        data-testid="update-application"
        onClick={() => updateApplication(1, { name: 'Updated App' })}
      >
        Update Application
      </button>

      <button data-testid="delete-application" onClick={() => deleteApplication(1)}>
        Delete Application
      </button>

      <button data-testid="create-dataset" onClick={() => createDataset({ name: 'New Dataset' })}>
        Create Dataset
      </button>

      <button data-testid="toggle-application" onClick={() => toggleApplication(1, 1, false)}>
        Toggle Application
      </button>

      <button data-testid="toggle-dataset" onClick={() => toggleDataset(1, 1, false)}>
        Toggle Dataset
      </button>

      <button data-testid="execute-release" onClick={() => executeRelease(1)}>
        Execute Release
      </button>
    </div>
  );
};

describe('ResourceContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mock responses
    mockGetApplications.mockResolvedValue(mockApplications);
    mockGetDatasets.mockResolvedValue(mockDatasets);
    mockGetReleases.mockResolvedValue(mockReleases);
    mockGetTenants.mockResolvedValue(mockTenants);
    mockGetTenantApplications.mockResolvedValue(mockTenantApplications);
    mockGetTenantDatasets.mockResolvedValue(mockTenantDatasets);
    mockCreateApplication.mockResolvedValue({
      id: 3,
      name: 'New App',
      status: 'active',
    });
    mockUpdateApplication.mockResolvedValue({
      id: 1,
      name: 'Updated App',
      status: 'active',
    });
    mockDeleteApplication.mockResolvedValue(true);
    mockExecuteRelease.mockResolvedValue({ success: true });
    mockAddApplicationToTenant.mockResolvedValue(true);
    mockAddDatasetToTenant.mockResolvedValue(true);
  });
  
  // Helper to render with context and mock admin service
  const renderWithContext = () => {
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
      <ResourceProvider adminService={mockAdminService}>
        <TestComponent />
      </ResourceProvider>
    );
  };

  it('should load initial resource data', async () => {
    renderWithContext();

    // Initial state should have empty resources
    expect(screen.getByTestId('applications-count')).toHaveTextContent('0');
    expect(screen.getByTestId('datasets-count')).toHaveTextContent('0');
    expect(screen.getByTestId('releases-count')).toHaveTextContent('0');
    expect(screen.getByTestId('tenants-count')).toHaveTextContent('0');

    // Fetch applications
    fireEvent.click(screen.getByTestId('fetch-applications'));

    // Loading state should be true initially
    expect(screen.getByTestId('application-loading')).toHaveTextContent('true');

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('application-loading')).toHaveTextContent('false');
    });

    // Check if applications were loaded
    expect(screen.getByTestId('applications-count')).toHaveTextContent('2');

    // Verify the service was called
    expect(mockGetApplications).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when fetching resources', async () => {
    // Mock an error response
    mockGetDatasets.mockRejectedValue(new Error('Failed to fetch datasets'));

    renderWithContext();

    // Fetch datasets (which will fail)
    fireEvent.click(screen.getByTestId('fetch-datasets'));

    // Loading state should be true initially
    expect(screen.getByTestId('dataset-loading')).toHaveTextContent('true');

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('dataset-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('dataset-error')).not.toHaveTextContent('no-error');
    });

    // Dataset count should still be 0
    expect(screen.getByTestId('datasets-count')).toHaveTextContent('0');
  });

  it('should create an application successfully', async () => {
    renderWithContext();

    // First fetch applications to populate state
    fireEvent.click(screen.getByTestId('fetch-applications'));

    await waitFor(() => {
      expect(screen.getByTestId('applications-count')).toHaveTextContent('2');
    });

    // Create a new application
    fireEvent.click(screen.getByTestId('create-application'));

    // Wait for application to be created and added to state
    await waitFor(() => {
      expect(screen.getByTestId('applications-count')).toHaveTextContent('3');
    });

    // Verify the service was called with correct data
    expect(mockCreateApplication).toHaveBeenCalledWith({ name: 'New App' });
  });

  it('should update an application successfully', async () => {
    renderWithContext();

    // First fetch applications to populate state
    fireEvent.click(screen.getByTestId('fetch-applications'));

    await waitFor(() => {
      expect(screen.getByTestId('applications-count')).toHaveTextContent('2');
    });

    // Update an application
    fireEvent.click(screen.getByTestId('update-application'));

    // Wait for update to complete
    await waitFor(() => {
      // The count should still be 2
      expect(screen.getByTestId('applications-count')).toHaveTextContent('2');
    });

    // Verify the service was called with correct data
    expect(mockUpdateApplication).toHaveBeenCalledWith(1, {
      name: 'Updated App',
    });
  });

  it('should delete an application successfully', async () => {
    renderWithContext();

    // First fetch applications to populate state
    fireEvent.click(screen.getByTestId('fetch-applications'));

    await waitFor(() => {
      expect(screen.getByTestId('applications-count')).toHaveTextContent('2');
    });

    // Delete an application
    fireEvent.click(screen.getByTestId('delete-application'));

    // Wait for delete to complete
    await waitFor(() => {
      // The count should now be 1
      expect(screen.getByTestId('applications-count')).toHaveTextContent('1');
    });

    // Verify the service was called with correct ID
    expect(mockDeleteApplication).toHaveBeenCalledWith(1);
  });

  it('should fetch tenant resources successfully', async () => {
    renderWithContext();

    // Fetch tenant resources
    fireEvent.click(screen.getByTestId('fetch-tenant-resources'));

    // Wait for tenant resources to load
    await waitFor(() => {
      // Verify the services were called
      expect(mockGetTenantApplications).toHaveBeenCalledWith(1);
      expect(mockGetTenantDatasets).toHaveBeenCalledWith(1);
    });
  });

  it('should toggle application association successfully', async () => {
    renderWithContext();

    // First fetch applications to populate state
    fireEvent.click(screen.getByTestId('fetch-applications'));

    await waitFor(() => {
      expect(screen.getByTestId('applications-count')).toHaveTextContent('2');
    });

    // Toggle application association
    fireEvent.click(screen.getByTestId('toggle-application'));

    // Wait for toggle to complete
    await waitFor(() => {
      // Verify the service was called with correct parameters
      expect(mockAddApplicationToTenant).toHaveBeenCalledWith(1, 1);
    });
  });

  it('should execute a release successfully', async () => {
    renderWithContext();

    // Execute a release
    fireEvent.click(screen.getByTestId('execute-release'));

    // Wait for execution to complete
    await waitFor(() => {
      // Verify the service was called with correct ID
      expect(mockExecuteRelease).toHaveBeenCalledWith(1);
    });
  });
});
