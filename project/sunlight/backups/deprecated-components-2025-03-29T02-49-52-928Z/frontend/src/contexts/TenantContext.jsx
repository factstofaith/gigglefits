/**
 * TenantContext.jsx
 * -----------------------------------------------------------------------------
 * Context provider for managing tenant state and operations across the application.
 * Manages tenant data, selection state, and provides methods for interacting
 * with tenant-related API endpoints.
 * 
 * @module contexts/TenantContext
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { createApiService } from '@utils/apiServiceFactory';

/**
 * API service for tenant operations
 * Configured with caching to optimize request performance
 * @type {Object}
 * @private
 */
const tenantApi = createApiService('/api', {
  enableCache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
});

/**
 * Local storage key for saving selected tenant
 * @type {string}
 * @private
 */
const SELECTED_TENANT_KEY = 'selected_tenant';

/**
 * Context for tenant management
 * Provides tenant data and operations to components
 * @type {React.Context}
 */
export const TenantContext = createContext();

/**
 * Provider component for tenant-related state and operations
 * Manages loading, selecting, and retrieving tenant data
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 * 
 * @example
 * // Usage in application root
 * function App() {
  // Added display name
  App.displayName = 'App';

 *   return (
 *     <TenantProvider>
 *       <Router>
 *         <AppRoutes />
 *       </Router>
 *     </TenantProvider>
 *   );
 * }
 */
export const TenantProvider = ({ children }) => {
  // Added display name
  TenantProvider.displayName = 'TenantProvider';

  // Added display name
  TenantProvider.displayName = 'TenantProvider';

  // Added display name
  TenantProvider.displayName = 'TenantProvider';

  // Added display name
  TenantProvider.displayName = 'TenantProvider';

  // Added display name
  TenantProvider.displayName = 'TenantProvider';


  /**
   * State to store the list of tenants
   * @type {[Array<Object>, Function]} Tenant array and setter function
   */
  const [tenants, setTenants] = useState([]);
  
  /**
   * State to store the currently selected tenant
   * @type {[Object|null, Function]} Selected tenant object and setter function
   */
  const [selectedTenant, setSelectedTenant] = useState(null);
  
  /**
   * Loading state indicator
   * @type {[boolean, Function]} Loading state and setter function
   */
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * Error state for API operations
   * @type {[Error|null, Function]} Error object and setter function
   */
  const [error, setError] = useState(null);

  /**
   * Loads tenants from the API
   * Fetches the list of tenants the user has access to and restores
   * the previously selected tenant from local storage if available.
   * 
   * @function
   * @async
   * @param {boolean} [forceRefresh=false] - Force API cache refresh
   * @returns {Promise<Array<Object>>} Array of tenant objects
   * 
   * @example
   * // Load tenants with cache
   * const tenants = await loadTenants();
   * 
   * // Force refresh from API, bypassing cache
   * const freshTenants = await loadTenants(true);
   */
  const loadTenants = useCallback(
    async (forceRefresh = false) => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch tenants from the API
        const tenantsData = await tenantApi.get(
          '/api/admin/tenants',
          {},
          {
            forceRefresh,
            showError: true,
          }
        );

        setTenants(tenantsData);

        // If no tenant is selected, try to restore from local storage
        if (!selectedTenant) {
          const savedTenantId = localStorage.getItem(SELECTED_TENANT_KEY);

          if (savedTenantId) {
            const savedTenant = tenantsData.find(tenant => tenant.id.toString() === savedTenantId);
            if (savedTenant) {
              setSelectedTenant(savedTenant);
            }
          }
        }

        return tenantsData;
      } catch (err) {
        setError(err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTenant]
  );

  /**
   * Sets the active tenant and persists the selection to local storage
   * 
   * @function
   * @param {Object|null} tenant - Tenant object to select, or null to clear selection
   * 
   * @example
   * // Select a tenant
   * selectTenant(tenantObject);
   * 
   * // Clear tenant selection
   * selectTenant(null);
   */
  const selectTenant = useCallback(tenant => {
  // Added display name
  selectTenant.displayName = 'selectTenant';

    setSelectedTenant(tenant);

    if (tenant) {
      localStorage.setItem(SELECTED_TENANT_KEY, tenant.id.toString());
    } else {
      localStorage.removeItem(SELECTED_TENANT_KEY);
    }
  }, []);

  /**
   * Fetches detailed information for a specific tenant
   * 
   * @function
   * @async
   * @param {string|number} tenantId - ID of the tenant to retrieve details for
   * @returns {Promise<Object>} Detailed tenant object
   * @throws {Error} If the API request fails
   * 
   * @example
   * try {
   *   const tenantDetails = await getTenantDetails('123');
   * } catch (error) {
   *   console.error('Failed to load tenant details:', error);
   * }
   */
  const getTenantDetails = useCallback(async tenantId => {
  // Added display name
  getTenantDetails.displayName = 'getTenantDetails';

    try {
      return await tenantApi.get(`/api/admin/tenants/${tenantId}`);
    } catch (err) {
      console.error(`Error fetching tenant details for ID ${tenantId}:`, err);
      throw err;
    }
  }, []);

  /**
   * Fetches applications associated with a specific tenant
   * 
   * @function
   * @async
   * @param {string|number} tenantId - ID of the tenant to retrieve applications for
   * @returns {Promise<Array<Object>>} Array of application objects
   * @throws {Error} If the API request fails
   * 
   * @example
   * try {
   *   const applications = await getTenantApplications('123');
   * } catch (error) {
   *   console.error('Failed to load tenant applications:', error);
   * }
   */
  const getTenantApplications = useCallback(async tenantId => {
  // Added display name
  getTenantApplications.displayName = 'getTenantApplications';

    try {
      return await tenantApi.get(`/api/admin/tenants/${tenantId}/applications`);
    } catch (err) {
      console.error(`Error fetching applications for tenant ID ${tenantId}:`, err);
      throw err;
    }
  }, []);

  /**
   * Fetches datasets associated with a specific tenant
   * 
   * @function
   * @async
   * @param {string|number} tenantId - ID of the tenant to retrieve datasets for
   * @returns {Promise<Array<Object>>} Array of dataset objects
   * @throws {Error} If the API request fails
   * 
   * @example
   * try {
   *   const datasets = await getTenantDatasets('123');
   * } catch (error) {
   *   console.error('Failed to load tenant datasets:', error);
   * }
   */
  const getTenantDatasets = useCallback(async tenantId => {
  // Added display name
  getTenantDatasets.displayName = 'getTenantDatasets';

    try {
      return await tenantApi.get(`/api/admin/tenants/${tenantId}/datasets`);
    } catch (err) {
      console.error(`Error fetching datasets for tenant ID ${tenantId}:`, err);
      throw err;
    }
  }, []);

  /**
   * Load tenants on component mount
   * This ensures tenant data is available when the application starts
   */
  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  /**
   * Context value provided to consumers
   * @type {Object}
   */
  const contextValue = {
    // State
    tenants,
    selectedTenant,
    isLoading,
    error,

    // Actions
    loadTenants,
    selectTenant,
    getTenantDetails,
    getTenantApplications,
    getTenantDatasets,
  };

  return <TenantContext.Provider value={contextValue}>{children}</TenantContext.Provider>;
};

/**
 * Custom hook for accessing the tenant context
 * Provides a convenient way to access tenant state and operations
 * 
 * @function
 * @returns {Object} Tenant context value
 * @throws {Error} If used outside of a TenantProvider
 * 
 * @example
 * // Inside a component
 * function TenantSelector() {
  // Added display name
  TenantSelector.displayName = 'TenantSelector';

 *   const { 
 *     tenants, 
 *     selectedTenant, 
 *     isLoading, 
 *     selectTenant, 
 *     loadTenants 
 *   } = useTenant();
 *   
 *   // Component logic using tenant context...
 * }
 */
export const useTenant = () => {
  // Added display name
  useTenant.displayName = 'useTenant';

  // Added display name
  useTenant.displayName = 'useTenant';

  // Added display name
  useTenant.displayName = 'useTenant';

  // Added display name
  useTenant.displayName = 'useTenant';

  // Added display name
  useTenant.displayName = 'useTenant';


  const context = React.useContext(TenantContext);

  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
};

export default TenantContext;
