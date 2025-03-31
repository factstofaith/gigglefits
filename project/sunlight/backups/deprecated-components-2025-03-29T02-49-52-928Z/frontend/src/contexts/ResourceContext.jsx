/**
 * ResourceContext.jsx
 * -----------------------------------------------------------------------------
 * Context provider for managing admin resources across the application.
 * Centralizes the management of applications, datasets, releases, and tenants,
 * providing consistent state management and API interaction for admin operations.
 * 
 * @module contexts/ResourceContext
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import adminService from '@services/adminService';

/**
 * Context for admin resource management
 * Provides resource data and operations to components
 * @type {React.Context}
 */
const ResourceContext = createContext();

/**
 * Custom hook for accessing the resource context
 * Provides a convenient way to access admin resource state and operations
 * 
 * @function
 * @returns {Object} Resource context value
 * @throws {Error} If used outside of a ResourceProvider
 * 
 * @example
 * // Inside a component
 * function ApplicationsManager() {
  // Added display name
  ApplicationsManager.displayName = 'ApplicationsManager';

 *   const { 
 *     applications, 
 *     applicationLoading, 
 *     fetchApplications,
 *     createApplication
 *   } = useResource();
 *   
 *   // Component logic using resource context...
 * }
 */
export const useResource = () => {
  // Added display name
  useResource.displayName = 'useResource';

  // Added display name
  useResource.displayName = 'useResource';

  // Added display name
  useResource.displayName = 'useResource';

  // Added display name
  useResource.displayName = 'useResource';

  // Added display name
  useResource.displayName = 'useResource';


  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResource must be used within a ResourceProvider');
  }
  return context;
};

/**
 * Default admin service implementation
 * @type {Object}
 * @private
 */
const defaultAdminService = adminService;

/**
 * Provider component for admin resource management
 * Supports dependency injection for service implementations to facilitate testing
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} [props.adminService=defaultAdminService] - Admin service implementation
 * @returns {React.ReactElement} Provider component
 * 
 * @example
 * // Basic usage
 * function App() {
  // Added display name
  App.displayName = 'App';

 *   return (
 *     <ResourceProvider>
 *       <AdminDashboard />
 *     </ResourceProvider>
 *   );
 * }
 * 
 * // With custom service implementation for testing
 * function TestComponent({ mockAdminService }) {
  // Added display name
  TestComponent.displayName = 'TestComponent';

 *   return (
 *     <ResourceProvider adminService={mockAdminService}>
 *       <ComponentUnderTest />
 *     </ResourceProvider>
 *   );
 * }
 */
export const ResourceProvider = ({ children, adminService = defaultAdminService }) => {
  // Added display name
  ResourceProvider.displayName = 'ResourceProvider';

  // Added display name
  ResourceProvider.displayName = 'ResourceProvider';

  // Added display name
  ResourceProvider.displayName = 'ResourceProvider';

  // Added display name
  ResourceProvider.displayName = 'ResourceProvider';

  // Added display name
  ResourceProvider.displayName = 'ResourceProvider';


  /**
   * State for application resources
   * @type {[Array<Object>, Function]} Applications array and setter function
   */
  const [applications, setApplications] = useState([]);
  
  /**
   * State for dataset resources
   * @type {[Array<Object>, Function]} Datasets array and setter function
   */
  const [datasets, setDatasets] = useState([]);
  
  /**
   * State for release resources
   * @type {[Array<Object>, Function]} Releases array and setter function
   */
  const [releases, setReleases] = useState([]);
  
  /**
   * State for tenant resources
   * @type {[Array<Object>, Function]} Tenants array and setter function
   */
  const [tenants, setTenants] = useState([]);

  /**
   * Loading state for application operations
   * @type {[boolean, Function]} Application loading state and setter function
   */
  const [applicationLoading, setApplicationLoading] = useState(false);
  
  /**
   * Loading state for dataset operations
   * @type {[boolean, Function]} Dataset loading state and setter function
   */
  const [datasetLoading, setDatasetLoading] = useState(false);
  
  /**
   * Loading state for release operations
   * @type {[boolean, Function]} Release loading state and setter function
   */
  const [releaseLoading, setReleaseLoading] = useState(false);
  
  /**
   * Loading state for tenant operations
   * @type {[boolean, Function]} Tenant loading state and setter function
   */
  const [tenantLoading, setTenantLoading] = useState(false);

  /**
   * Error state for application operations
   * @type {[string|null, Function]} Application error message and setter function
   */
  const [applicationError, setApplicationError] = useState(null);
  
  /**
   * Error state for dataset operations
   * @type {[string|null, Function]} Dataset error message and setter function
   */
  const [datasetError, setDatasetError] = useState(null);
  
  /**
   * Error state for release operations
   * @type {[string|null, Function]} Release error message and setter function
   */
  const [releaseError, setReleaseError] = useState(null);
  
  /**
   * Error state for tenant operations
   * @type {[string|null, Function]} Tenant error message and setter function
   */
  const [tenantError, setTenantError] = useState(null);

  /**
   * State for the currently selected application
   * @type {[Object|null, Function]} Current application object and setter function
   */
  const [currentApplication, setCurrentApplication] = useState(null);
  
  /**
   * State for the currently selected dataset
   * @type {[Object|null, Function]} Current dataset object and setter function
   */
  const [currentDataset, setCurrentDataset] = useState(null);
  
  /**
   * State for the currently selected release
   * @type {[Object|null, Function]} Current release object and setter function
   */
  const [currentRelease, setCurrentRelease] = useState(null);
  
  /**
   * State for the currently selected tenant
   * @type {[Object|null, Function]} Current tenant object and setter function
   */
  const [currentTenant, setCurrentTenant] = useState(null);

  /**
   * State for applications associated with the current tenant
   * @type {[Array<Object>, Function]} Tenant applications array and setter function
   */
  const [tenantApplications, setTenantApplications] = useState([]);
  
  /**
   * State for datasets associated with the current tenant
   * @type {[Array<Object>, Function]} Tenant datasets array and setter function
   */
  const [tenantDatasets, setTenantDatasets] = useState([]);
  
  /**
   * Loading state for tenant resources operations
   * @type {[boolean, Function]} Tenant resources loading state and setter function
   */
  const [tenantResourcesLoading, setTenantResourcesLoading] = useState(false);
  
  /**
   * Error state for tenant resources operations
   * @type {[string|null, Function]} Tenant resources error message and setter function
   */
  const [tenantResourcesError, setTenantResourcesError] = useState(null);

  /**
   * Fetches all applications from the API
   * 
   * @function
   * @async
   * @returns {Promise<void>} Resolves when applications are loaded
   * 
   * @example
   * // Fetch all applications
   * await fetchApplications();
   */
  const fetchApplications = useCallback(async () => {
  // Added display name
  fetchApplications.displayName = 'fetchApplications';

    setApplicationLoading(true);
    setApplicationError(null);
    try {
      const data = await adminService.getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplicationError('Failed to fetch applications. Please try again.');
    } finally {
      setApplicationLoading(false);
    }
  }, []);

  /**
   * Fetches all datasets from the API
   * 
   * @function
   * @async
   * @returns {Promise<void>} Resolves when datasets are loaded
   * 
   * @example
   * // Fetch all datasets
   * await fetchDatasets();
   */
  const fetchDatasets = useCallback(async () => {
  // Added display name
  fetchDatasets.displayName = 'fetchDatasets';

    setDatasetLoading(true);
    setDatasetError(null);
    try {
      const data = await adminService.getDatasets();
      setDatasets(data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setDatasetError('Failed to fetch datasets. Please try again.');
    } finally {
      setDatasetLoading(false);
    }
  }, []);

  /**
   * Fetches all releases from the API
   * 
   * @function
   * @async
   * @returns {Promise<void>} Resolves when releases are loaded
   * 
   * @example
   * // Fetch all releases
   * await fetchReleases();
   */
  const fetchReleases = useCallback(async () => {
  // Added display name
  fetchReleases.displayName = 'fetchReleases';

    setReleaseLoading(true);
    setReleaseError(null);
    try {
      const data = await adminService.getReleases();
      setReleases(data);
    } catch (error) {
      console.error('Error fetching releases:', error);
      setReleaseError('Failed to fetch releases. Please try again.');
    } finally {
      setReleaseLoading(false);
    }
  }, []);

  /**
   * Fetches all tenants from the API
   * 
   * @function
   * @async
   * @returns {Promise<void>} Resolves when tenants are loaded
   * 
   * @example
   * // Fetch all tenants
   * await fetchTenants();
   */
  const fetchTenants = useCallback(async () => {
  // Added display name
  fetchTenants.displayName = 'fetchTenants';

    setTenantLoading(true);
    setTenantError(null);
    try {
      const data = await adminService.getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenantError('Failed to fetch tenants. Please try again.');
    } finally {
      setTenantLoading(false);
    }
  }, []);

  /**
   * Fetches all resource types in parallel
   * Loads applications, datasets, releases, and tenants in a single operation
   * 
   * @function
   * @async
   * @returns {Promise<void>} Resolves when all resources are loaded
   * 
   * @example
   * // Initialize admin dashboard by loading all resources
   * useEffect(() => {
   *   fetchAllResources();
   * }, [fetchAllResources]);
   */
  const fetchAllResources = useCallback(async () => {
  // Added display name
  fetchAllResources.displayName = 'fetchAllResources';

    await Promise.all([fetchApplications(), fetchDatasets(), fetchReleases(), fetchTenants()]);
  }, [fetchApplications, fetchDatasets, fetchReleases, fetchTenants]);

  /**
   * Fetches application details by ID
   * 
   * @function
   * @async
   * @param {string|number} id - Application ID to fetch
   * @returns {Promise<Object|null>} Application details or null if error
   * 
   * @example
   * // Fetch an application by ID
   * const appDetails = await fetchApplicationById('app-123');
   * if (appDetails) {
   * }
   */
  const fetchApplicationById = useCallback(async id => {
  // Added display name
  fetchApplicationById.displayName = 'fetchApplicationById';

    setApplicationLoading(true);
    setApplicationError(null);
    try {
      const data = await adminService.getApplicationById(id);
      setCurrentApplication(data);
      return data;
    } catch (error) {
      console.error(`Error fetching application with ID ${id}:`, error);
      setApplicationError(`Failed to fetch application details. Please try again.`);
      return null;
    } finally {
      setApplicationLoading(false);
    }
  }, []);

  /**
   * Fetches dataset details by ID
   * 
   * @function
   * @async
   * @param {string|number} id - Dataset ID to fetch
   * @returns {Promise<Object|null>} Dataset details or null if error
   * 
   * @example
   * // Fetch a dataset by ID
   * const datasetDetails = await fetchDatasetById('dataset-123');
   * if (datasetDetails) {
   * }
   */
  const fetchDatasetById = useCallback(async id => {
  // Added display name
  fetchDatasetById.displayName = 'fetchDatasetById';

    setDatasetLoading(true);
    setDatasetError(null);
    try {
      const data = await adminService.getDatasetById(id);
      setCurrentDataset(data);
      return data;
    } catch (error) {
      console.error(`Error fetching dataset with ID ${id}:`, error);
      setDatasetError(`Failed to fetch dataset details. Please try again.`);
      return null;
    } finally {
      setDatasetLoading(false);
    }
  }, []);

  /**
   * Fetches release details by ID
   * 
   * @function
   * @async
   * @param {string|number} id - Release ID to fetch
   * @returns {Promise<Object|null>} Release details or null if error
   * 
   * @example
   * // Fetch a release by ID
   * const releaseDetails = await fetchReleaseById('release-123');
   * if (releaseDetails) {
   * }
   */
  const fetchReleaseById = useCallback(async id => {
  // Added display name
  fetchReleaseById.displayName = 'fetchReleaseById';

    setReleaseLoading(true);
    setReleaseError(null);
    try {
      const data = await adminService.getReleaseById(id);
      setCurrentRelease(data);
      return data;
    } catch (error) {
      console.error(`Error fetching release with ID ${id}:`, error);
      setReleaseError(`Failed to fetch release details. Please try again.`);
      return null;
    } finally {
      setReleaseLoading(false);
    }
  }, []);

  /**
   * Fetches tenant details by ID
   * 
   * @function
   * @async
   * @param {string|number} id - Tenant ID to fetch
   * @returns {Promise<Object|null>} Tenant details or null if error
   * 
   * @example
   * // Fetch a tenant by ID
   * const tenantDetails = await fetchTenantById('tenant-123');
   * if (tenantDetails) {
   * }
   */
  const fetchTenantById = useCallback(async id => {
  // Added display name
  fetchTenantById.displayName = 'fetchTenantById';

    setTenantLoading(true);
    setTenantError(null);
    try {
      const data = await adminService.getTenantById(id);
      setCurrentTenant(data);
      return data;
    } catch (error) {
      console.error(`Error fetching tenant with ID ${id}:`, error);
      setTenantError(`Failed to fetch tenant details. Please try again.`);
      return null;
    } finally {
      setTenantLoading(false);
    }
  }, []);

  // Fetch tenant resources (applications and datasets)
  const fetchTenantResources = useCallback(async tenantId => {
  // Added display name
  fetchTenantResources.displayName = 'fetchTenantResources';

    setTenantResourcesLoading(true);
    setTenantResourcesError(null);
    try {
      const [tenantApps, tenantDatasets] = await Promise.all([
        adminService.getTenantApplications(tenantId),
        adminService.getTenantDatasets(tenantId),
      ]);

      setTenantApplications(tenantApps);
      setTenantDatasets(tenantDatasets);

      // Update the current tenant with fetched data
      setCurrentTenant(prev => ({
        ...prev,
        applications: tenantApps,
        datasets: tenantDatasets,
      }));

      return { applications: tenantApps, datasets: tenantDatasets };
    } catch (error) {
      console.error(`Error fetching resources for tenant with ID ${tenantId}:`, error);
      setTenantResourcesError('Failed to fetch tenant resources. Please try again.');
      return null;
    } finally {
      setTenantResourcesLoading(false);
    }
  }, []);

  // Create a new application
  const handleCreateApplication = useCallback(async applicationData => {
  // Added display name
  handleCreateApplication.displayName = 'handleCreateApplication';

    try {
      const newApplication = await adminService.createApplication(applicationData);
      setApplications(prev => [...prev, newApplication]);
      return newApplication;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }, []);

  // Update an existing application
  const handleUpdateApplication = useCallback(async (id, applicationData) => {
  // Added display name
  handleUpdateApplication.displayName = 'handleUpdateApplication';

    try {
      const updatedApplication = await adminService.updateApplication(
        id,
        applicationData
      );
      setApplications(prev => prev.map(app => (app.id === id ? updatedApplication : app)));
      return updatedApplication;
    } catch (error) {
      console.error(`Error updating application with ID ${id}:`, error);
      throw error;
    }
  }, []);

  // Delete an application
  const handleDeleteApplication = useCallback(async id => {
  // Added display name
  handleDeleteApplication.displayName = 'handleDeleteApplication';

    try {
      await adminService.deleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      return true;
    } catch (error) {
      console.error(`Error deleting application with ID ${id}:`, error);
      throw error;
    }
  }, []);

  // Create a new dataset
  const handleCreateDataset = useCallback(async datasetData => {
  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';

    try {
      const newDataset = await adminService.createDataset(datasetData);
      setDatasets(prev => [...prev, newDataset]);
      return newDataset;
    } catch (error) {
      console.error('Error creating dataset:', error);
      throw error;
    }
  }, []);

  // Update an existing dataset
  const handleUpdateDataset = useCallback(async (id, datasetData) => {
  // Added display name
  handleUpdateDataset.displayName = 'handleUpdateDataset';

    try {
      const updatedDataset = await adminService.updateDataset(id, datasetData);
      setDatasets(prev => prev.map(dataset => (dataset.id === id ? updatedDataset : dataset)));
      return updatedDataset;
    } catch (error) {
      console.error(`Error updating dataset with ID ${id}:`, error);
      throw error;
    }
  }, []);

  // Delete a dataset
  const handleDeleteDataset = useCallback(async id => {
  // Added display name
  handleDeleteDataset.displayName = 'handleDeleteDataset';

    try {
      await adminService.deleteDataset(id);
      setDatasets(prev => prev.filter(dataset => dataset.id !== id));
      return true;
    } catch (error) {
      console.error(`Error deleting dataset with ID ${id}:`, error);
      throw error;
    }
  }, []);

  // Create a new release
  const handleCreateRelease = useCallback(async releaseData => {
  // Added display name
  handleCreateRelease.displayName = 'handleCreateRelease';

    try {
      const newRelease = await adminService.createRelease(releaseData);
      setReleases(prev => [...prev, newRelease]);
      return newRelease;
    } catch (error) {
      console.error('Error creating release:', error);
      throw error;
    }
  }, []);

  // Update an existing release
  const handleUpdateRelease = useCallback(async (id, releaseData) => {
  // Added display name
  handleUpdateRelease.displayName = 'handleUpdateRelease';

    try {
      const updatedRelease = await adminService.updateRelease(id, releaseData);
      setReleases(prev => prev.map(release => (release.id === id ? updatedRelease : release)));
      return updatedRelease;
    } catch (error) {
      console.error(`Error updating release with ID ${id}:`, error);
      throw error;
    }
  }, []);

  // Delete a release
  const handleDeleteRelease = useCallback(async id => {
  // Added display name
  handleDeleteRelease.displayName = 'handleDeleteRelease';

    try {
      await adminService.deleteRelease(id);
      setReleases(prev => prev.filter(release => release.id !== id));
      return true;
    } catch (error) {
      console.error(`Error deleting release with ID ${id}:`, error);
      throw error;
    }
  }, []);

  // Execute a release
  const handleExecuteRelease = useCallback(async id => {
  // Added display name
  handleExecuteRelease.displayName = 'handleExecuteRelease';

    try {
      const executionResult = await adminService.executeRelease(id);
      return executionResult;
    } catch (error) {
      console.error(`Error executing release with ID ${id}:`, error);
      throw error;
    }
  }, []);

  // Create a new tenant
  const handleCreateTenant = useCallback(async tenantData => {
  // Added display name
  handleCreateTenant.displayName = 'handleCreateTenant';

    try {
      const newTenant = await adminService.createTenant(tenantData);
      setTenants(prev => [...prev, newTenant]);
      return newTenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }, []);

  // Update an existing tenant
  const handleUpdateTenant = useCallback(async (id, tenantData) => {
  // Added display name
  handleUpdateTenant.displayName = 'handleUpdateTenant';

    try {
      const updatedTenant = await adminService.updateTenant(id, tenantData);
      setTenants(prev => prev.map(tenant => (tenant.id === id ? updatedTenant : tenant)));
      return updatedTenant;
    } catch (error) {
      console.error(`Error updating tenant with ID ${id}:`, error);
      throw error;
    }
  }, []);

  // Delete a tenant
  const handleDeleteTenant = useCallback(async id => {
  // Added display name
  handleDeleteTenant.displayName = 'handleDeleteTenant';

    try {
      await adminService.deleteTenant(id);
      setTenants(prev => prev.filter(tenant => tenant.id !== id));
      return true;
    } catch (error) {
      console.error(`Error deleting tenant with ID ${id}:`, error);
      throw error;
    }
  }, []);

  // Handle application toggle for tenant
  const handleToggleApplication = useCallback(
    async (tenantId, applicationId, hasAccess) => {
  // Added display name
  handleToggleApplication.displayName = 'handleToggleApplication';

      try {
        if (hasAccess) {
          // Remove application
          await adminService.removeApplicationFromTenant(tenantId, applicationId);

          // Update UI
          setTenantApplications(prev => prev.filter(app => app.id !== applicationId));

          // Update current tenant
          setCurrentTenant(prev => ({
            ...prev,
            applications: prev.applications.filter(app => app.id !== applicationId),
          }));

          return true;
        } else {
          // Add application
          await adminService.addApplicationToTenant(tenantId, applicationId);

          // Find application details from our cached applications
          const appToAdd = applications.find(app => app.id === applicationId);

          // Update UI
          setTenantApplications(prev => [...prev, appToAdd]);

          // Update current tenant
          setCurrentTenant(prev => ({
            ...prev,
            applications: [...prev.applications, appToAdd],
          }));

          return appToAdd;
        }
      } catch (error) {
        console.error(`Error toggling application access for tenant ${tenantId}:`, error);
        throw error;
      }
    },
    [applications]
  );

  // Handle dataset toggle for tenant
  const handleToggleDataset = useCallback(
    async (tenantId, datasetId, hasAccess) => {
  // Added display name
  handleToggleDataset.displayName = 'handleToggleDataset';

      try {
        if (hasAccess) {
          // Remove dataset
          await adminService.removeDatasetFromTenant(tenantId, datasetId);

          // Update UI
          setTenantDatasets(prev => prev.filter(ds => ds.id !== datasetId));

          // Update current tenant
          setCurrentTenant(prev => ({
            ...prev,
            datasets: prev.datasets.filter(ds => ds.id !== datasetId),
          }));

          return true;
        } else {
          // Add dataset
          await adminService.addDatasetToTenant(tenantId, datasetId);

          // Find dataset details from our cached datasets
          const datasetToAdd = datasets.find(ds => ds.id === datasetId);

          // Update UI
          setTenantDatasets(prev => [...prev, datasetToAdd]);

          // Update current tenant
          setCurrentTenant(prev => ({
            ...prev,
            datasets: [...prev.datasets, datasetToAdd],
          }));

          return datasetToAdd;
        }
      } catch (error) {
        console.error(`Error toggling dataset access for tenant ${tenantId}:`, error);
        throw error;
      }
    },
    [datasets]
  );

  // Context value
  const value = {
    // Resources
    applications,
    datasets,
    releases,
    tenants,

    // Current resources
    currentApplication,
    currentDataset,
    currentRelease,
    currentTenant,

    // Loading states
    applicationLoading,
    datasetLoading,
    releaseLoading,
    tenantLoading,
    tenantResourcesLoading,

    // Error states
    applicationError,
    datasetError,
    releaseError,
    tenantError,
    tenantResourcesError,

    // Tenant resources
    tenantApplications,
    tenantDatasets,

    // Fetch methods
    fetchApplications,
    fetchDatasets,
    fetchReleases,
    fetchTenants,
    fetchAllResources,
    fetchApplicationById,
    fetchDatasetById,
    fetchReleaseById,
    fetchTenantById,
    fetchTenantResources,

    // CRUD methods
    createApplication: handleCreateApplication,
    updateApplication: handleUpdateApplication,
    deleteApplication: handleDeleteApplication,
    createDataset: handleCreateDataset,
    updateDataset: handleUpdateDataset,
    deleteDataset: handleDeleteDataset,
    createRelease: handleCreateRelease,
    updateRelease: handleUpdateRelease,
    deleteRelease: handleDeleteRelease,
    executeRelease: handleExecuteRelease,
    createTenant: handleCreateTenant,
    updateTenant: handleUpdateTenant,
    deleteTenant: handleDeleteTenant,

    // Tenant resource methods
    toggleApplication: handleToggleApplication,
    toggleDataset: handleToggleDataset,

    // Helper methods
    clearCurrentApplication: () => setCurrentApplication(null),
    clearCurrentDataset: () => setCurrentDataset(null),
    clearCurrentRelease: () => setCurrentRelease(null),
    clearCurrentTenant: () => setCurrentTenant(null),
  };

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
};

export default ResourceContext;
