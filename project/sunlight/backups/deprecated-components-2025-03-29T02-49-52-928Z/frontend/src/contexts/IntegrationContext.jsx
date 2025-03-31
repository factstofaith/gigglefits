/**
 * IntegrationContext.jsx
 * -----------------------------------------------------------------------------
 * Context provider for managing integration-related state and operations across
 * the application. Manages integration data, run history, and provides methods
 * for interacting with integration-related API endpoints.
 * 
 * @module contexts/IntegrationContext
 */

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import integrationService, {
  // Base integration methods
  getIntegrationById,
  getIntegrationHistory,
  runIntegration,
  deleteIntegration,
  getIntegrationRuns,
  
  // Flow methods
  getIntegrationFlow,
  saveIntegrationFlow,
  validateIntegrationFlow,
  
  // Field mapping methods
  getFieldMappings,
  createFieldMapping,
  updateFieldMapping,
  deleteFieldMapping,
  
  // Dataset methods
  getIntegrationDatasets,
  associateDataset,
  disassociateDataset,
  
  // Schedule methods
  getScheduleConfig,
  updateScheduleConfig,
  
  // Discovery methods
  discoverFields,
} from '../services/integrationService';

/**
 * Context for integration management
 * Provides integration data and operations to components
 * @type {React.Context}
 */
const IntegrationContext = createContext();

/**
 * Default service implementations for integration operations
 * @type {Object}
 * @private
 */
const defaultIntegrationService = {
  // Base integration methods
  getIntegrationById,
  getIntegrationHistory,
  runIntegration,
  deleteIntegration,
  getIntegrationRuns,
  
  // Flow methods
  getIntegrationFlow,
  saveIntegrationFlow,
  validateIntegrationFlow,
  
  // Field mapping methods
  getFieldMappings,
  createFieldMapping,
  updateFieldMapping,
  deleteFieldMapping,
  
  // Dataset methods
  getIntegrationDatasets,
  associateDataset,
  disassociateDataset,
  
  // Schedule methods
  getScheduleConfig,
  updateScheduleConfig,
  
  // Discovery methods
  discoverFields,
};

/**
 * Custom hook for accessing the integration context
 * Provides a convenient way to access integration state and operations
 * 
 * @function
 * @returns {Object} Integration context value
 * @throws {Error} If used outside of an IntegrationProvider
 * 
 * @example
 * // Inside a component
 * function IntegrationDetails() {
  // Added display name
  IntegrationDetails.displayName = 'IntegrationDetails';

 *   const { 
 *     integration, 
 *     loading, 
 *     errors, 
 *     fetchIntegration,
 *     runIntegration
 *   } = useIntegration();
 *   
 *   // Component logic using integration context...
 * }
 */
export const useIntegration = () => {
  // Added display name
  useIntegration.displayName = 'useIntegration';

  // Added display name
  useIntegration.displayName = 'useIntegration';

  // Added display name
  useIntegration.displayName = 'useIntegration';

  // Added display name
  useIntegration.displayName = 'useIntegration';

  // Added display name
  useIntegration.displayName = 'useIntegration';


  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error('useIntegration must be used within an IntegrationProvider');
  }
  return context;
};

/**
 * Provider component for integration-related state and operations
 * Supports dependency injection for service implementations to facilitate testing
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string|null} [props.initialIntegrationId=null] - Initial integration ID to load
 * @param {Object} [props.apiService=defaultIntegrationService] - Service implementation for API operations
 * @returns {React.ReactElement} Provider component
 * 
 * @example
 * // Basic usage
 * function App() {
  // Added display name
  App.displayName = 'App';

 *   return (
 *     <IntegrationProvider>
 *       <IntegrationList />
 *       <IntegrationDetails />
 *     </IntegrationProvider>
 *   );
 * }
 * 
 * // With initial integration ID
 * function IntegrationPage({ integrationId }) {
  // Added display name
  IntegrationPage.displayName = 'IntegrationPage';

 *   return (
 *     <IntegrationProvider initialIntegrationId={integrationId}>
 *       <IntegrationDetails />
 *       <RunHistory />
 *     </IntegrationProvider>
 *   );
 * }
 * 
 * // With custom service implementation for testing
 * function TestComponent({ mockService }) {
  // Added display name
  TestComponent.displayName = 'TestComponent';

 *   return (
 *     <IntegrationProvider apiService={mockService}>
 *       <ComponentUnderTest />
 *     </IntegrationProvider>
 *   );
 * }
 */
export const IntegrationProvider = ({ 
  children, 
  initialIntegrationId = null,
  apiService = defaultIntegrationService 
}) => {
  // Added display name
  IntegrationProvider.displayName = 'IntegrationProvider';

  // Added display name
  IntegrationProvider.displayName = 'IntegrationProvider';

  // Added display name
  IntegrationProvider.displayName = 'IntegrationProvider';

  // Added display name
  IntegrationProvider.displayName = 'IntegrationProvider';

  // Added display name
  IntegrationProvider.displayName = 'IntegrationProvider';


  /**
   * State for the currently selected integration ID
   * @type {[string|null, Function]} Integration ID and setter function
   */
  const [integrationId, setIntegrationId] = useState(initialIntegrationId);
  
  /**
   * State for the current integration details
   * @type {[Object|null, Function]} Integration object and setter function
   */
  const [integration, setIntegration] = useState(null);
  
  /**
   * State for integration history data
   * @type {[Array<Object>, Function]} History array and setter function
   */
  const [history, setHistory] = useState([]);
  
  /**
   * State for detailed integration run data
   * @type {[Array<Object>, Function]} Runs array and setter function
   */
  const [runs, setRuns] = useState([]);

  /**
   * State for integration flow data (nodes and edges)
   * @type {[Object, Function]} Flow data object and setter function
   */
  const [flowData, setFlowData] = useState({ nodes: [], edges: [] });

  /**
   * State for field mappings
   * @type {[Array<Object>, Function]} Field mappings array and setter function
   */
  const [fieldMappings, setFieldMappings] = useState([]);

  /**
   * State for associated datasets
   * @type {[Array<Object>, Function]} Datasets array and setter function
   */
  const [datasets, setDatasets] = useState([]);

  /**
   * State for schedule configuration
   * @type {[Object|null, Function]} Schedule config object and setter function
   */
  const [scheduleConfig, setScheduleConfig] = useState(null);

  /**
   * State for discovered fields from source/destination
   * @type {[Object, Function]} Discovered fields object and setter function
   */
  const [discoveredFields, setDiscoveredFields] = useState({
    source: null,
    destination: null
  });

  /**
   * State for flow validation results
   * @type {[Object|null, Function]} Validation result object and setter function
   */
  const [validationResults, setValidationResults] = useState(null);

  /**
   * Loading state for various operations
   * @type {[Object, Function]} Loading state object and setter function
   */
  const [loading, setLoading] = useState({
    integration: false,
    history: false,
    runs: false,
    running: false,
    deleting: false,
    flowData: false,
    fieldMappings: false,
    datasets: false,
    schedule: false,
    discovery: false,
    validation: false,
    saving: false
  });

  /**
   * Error state for various operations
   * @type {[Object, Function]} Error state object and setter function
   */
  const [errors, setErrors] = useState({
    integration: null,
    history: null,
    runs: null,
    run: null,
    delete: null,
    flowData: null,
    fieldMappings: null,
    datasets: null,
    schedule: null,
    discovery: null,
    validation: null,
    saving: null
  });

  /**
   * Fetches integration details by ID
   * 
   * @function
   * @async
   * @param {string} id - Integration ID to fetch
   * @returns {Promise<Object|null>} Integration details or null if error
   * 
   * @example
   * // Inside a component using integration context
   * const integrationDetails = await fetchIntegration('integration-123');
   * 
   * // Alternatively, set the ID and let the effect fetch data
   * setIntegrationId('integration-123');
   */
  const fetchIntegration = useCallback(async id => {
  // Added display name
  fetchIntegration.displayName = 'fetchIntegration';

    if (!id) return;

    try {
      setLoading(prev => ({ ...prev, integration: true }));
      setErrors(prev => ({ ...prev, integration: null }));

      const data = await apiService.getIntegrationById(id);
      setIntegration(data);
      return data;
    } catch (error) {
      console.error('Error fetching integration:', error);
      setErrors(prev => ({ ...prev, integration: 'Failed to load integration details' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, integration: false }));
    }
  }, [apiService]);

  /**
   * Fetches integration version history by ID
   * 
   * @function
   * @async
   * @param {string} id - Integration ID to fetch history for
   * @returns {Promise<Array<Object>|null>} History array or empty array if error
   * 
   * @example
   * // Get history for specific integration
   * const versionHistory = await fetchHistory('integration-123');
   */
  const fetchHistory = useCallback(async id => {
  // Added display name
  fetchHistory.displayName = 'fetchHistory';

    if (!id) return;

    try {
      setLoading(prev => ({ ...prev, history: true }));
      setErrors(prev => ({ ...prev, history: null }));

      const data = await apiService.getIntegrationHistory(id);
      setHistory(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching integration history:', error);
      setErrors(prev => ({ ...prev, history: 'Failed to load integration history' }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  }, [apiService]);

  /**
   * Fetches detailed integration run history
   * 
   * @function
   * @async
   * @param {string} id - Integration ID to fetch runs for
   * @param {number} [limit=10] - Maximum number of runs to retrieve
   * @returns {Promise<Array<Object>|null>} Run history array or empty array if error
   * 
   * @example
   * // Get last 5 runs for an integration
   * const recentRuns = await fetchRuns('integration-123', 5);
   * 
   * // Get default number of runs (10)
   * const runs = await fetchRuns('integration-123');
   */
  const fetchRuns = useCallback(async (id, limit = 10) => {
    if (!id) return;

    try {
      setLoading(prev => ({ ...prev, runs: true }));
      setErrors(prev => ({ ...prev, runs: null }));

      const data = await apiService.getIntegrationRuns(id, 0, limit);
      setRuns(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching integration runs:', error);
      setErrors(prev => ({ ...prev, runs: 'Failed to load detailed run history' }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, runs: false }));
    }
  }, [apiService]);

  /**
   * Executes the currently selected integration
   * Also refreshes the integration history after successful execution
   * 
   * @function
   * @async
   * @returns {Promise<Object|null>} Run result data or null if error
   * 
   * @example
   * // Execute the currently selected integration
   * const result = await runIntegration();
   * if (result) {
   * }
   */
  const runSelectedIntegration = useCallback(async () => {
  // Added display name
  runSelectedIntegration.displayName = 'runSelectedIntegration';

    if (!integrationId) return;

    try {
      setLoading(prev => ({ ...prev, running: true }));
      setErrors(prev => ({ ...prev, run: null }));

      const result = await apiService.runIntegration(integrationId);

      // Refresh history after running
      await fetchHistory(integrationId);

      return result;
    } catch (error) {
      console.error('Error running integration:', error);
      setErrors(prev => ({ ...prev, run: 'Failed to run integration' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, running: false }));
    }
  }, [integrationId, fetchHistory, apiService]);

  /**
   * Deletes the currently selected integration
   * Clears the integration state after successful deletion
   * 
   * @function
   * @async
   * @returns {Promise<boolean>} True if deletion was successful, otherwise false
   * 
   * @example
   * // Delete the currently selected integration
   * const success = await deleteIntegration();
   * if (success) {
   *   // Navigate away from the deleted integration
   *   navigate('/integrations');
   * }
   */
  const deleteSelectedIntegration = useCallback(async () => {
  // Added display name
  deleteSelectedIntegration.displayName = 'deleteSelectedIntegration';

    if (!integrationId) return;

    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      setErrors(prev => ({ ...prev, delete: null }));

      await apiService.deleteIntegration(integrationId);

      // Clear the state after successful deletion
      setIntegration(null);
      setIntegrationId(null);

      return true;
    } catch (error) {
      console.error('Error deleting integration:', error);
      setErrors(prev => ({ ...prev, delete: 'Failed to delete integration' }));
      return false;
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [integrationId, apiService]);

  /**
   * Fetches flow data for an integration
   * 
   * @function
   * @async
   * @param {string} id - Integration ID to fetch flow for
   * @returns {Promise<Object|null>} Flow data object or null if error
   */
  const fetchFlowData = useCallback(async id => {
  // Added display name
  fetchFlowData.displayName = 'fetchFlowData';

    if (!id) return null;

    try {
      setLoading(prev => ({ ...prev, flowData: true }));
      setErrors(prev => ({ ...prev, flowData: null }));

      const data = await apiService.getIntegrationFlow(id);
      setFlowData(data || { nodes: [], edges: [] });
      return data;
    } catch (error) {
      console.error('Error fetching integration flow:', error);
      setErrors(prev => ({ ...prev, flowData: 'Failed to load integration flow data' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, flowData: false }));
    }
  }, [apiService]);

  /**
   * Saves flow data for an integration
   * 
   * @function
   * @async
   * @param {Object} data - Flow data with nodes and edges
   * @returns {Promise<Object|null>} Saved flow data or null if error
   */
  const saveFlowData = useCallback(async data => {
  // Added display name
  saveFlowData.displayName = 'saveFlowData';

    if (!integrationId) return null;

    try {
      setLoading(prev => ({ ...prev, saving: true }));
      setErrors(prev => ({ ...prev, saving: null }));

      const savedData = await apiService.saveIntegrationFlow(integrationId, data);
      setFlowData(savedData);
      return savedData;
    } catch (error) {
      console.error('Error saving integration flow:', error);
      setErrors(prev => ({ ...prev, saving: 'Failed to save integration flow' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  }, [integrationId, apiService]);

  /**
   * Validates flow data
   * 
   * @function
   * @async
   * @param {Object} data - Flow data to validate
   * @returns {Promise<Object|null>} Validation results or null if error
   */
  const validateFlow = useCallback(async data => {
  // Added display name
  validateFlow.displayName = 'validateFlow';

    if (!integrationId) return null;
    
    const flowToValidate = data || flowData;

    try {
      setLoading(prev => ({ ...prev, validation: true }));
      setErrors(prev => ({ ...prev, validation: null }));

      const results = await apiService.validateIntegrationFlow(integrationId, flowToValidate);
      setValidationResults(results);
      return results;
    } catch (error) {
      console.error('Error validating integration flow:', error);
      setErrors(prev => ({ ...prev, validation: 'Failed to validate integration flow' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, validation: false }));
    }
  }, [integrationId, flowData, apiService]);

  /**
   * Fetches field mappings for an integration
   * 
   * @function
   * @async
   * @param {string} id - Integration ID to fetch mappings for
   * @returns {Promise<Array<Object>|null>} Field mappings or null if error
   */
  const fetchFieldMappings = useCallback(async id => {
  // Added display name
  fetchFieldMappings.displayName = 'fetchFieldMappings';

    if (!id) return null;

    try {
      setLoading(prev => ({ ...prev, fieldMappings: true }));
      setErrors(prev => ({ ...prev, fieldMappings: null }));

      const data = await apiService.getFieldMappings(id);
      setFieldMappings(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching field mappings:', error);
      setErrors(prev => ({ ...prev, fieldMappings: 'Failed to load field mappings' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, fieldMappings: false }));
    }
  }, [apiService]);

  /**
   * Creates a new field mapping
   * 
   * @function
   * @async
   * @param {Object} mappingData - Mapping data to create
   * @returns {Promise<Object|null>} Created mapping or null if error
   */
  const createMapping = useCallback(async mappingData => {
  // Added display name
  createMapping.displayName = 'createMapping';

    if (!integrationId) return null;

    try {
      setLoading(prev => ({ ...prev, fieldMappings: true }));
      setErrors(prev => ({ ...prev, fieldMappings: null }));

      const newMapping = await apiService.createFieldMapping(integrationId, mappingData);
      
      // Update mappings state
      setFieldMappings(prev => [...prev, newMapping]);
      
      return newMapping;
    } catch (error) {
      console.error('Error creating field mapping:', error);
      setErrors(prev => ({ ...prev, fieldMappings: 'Failed to create field mapping' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, fieldMappings: false }));
    }
  }, [integrationId, apiService]);

  /**
   * Updates an existing field mapping
   * 
   * @function
   * @async
   * @param {string} mappingId - ID of mapping to update
   * @param {Object} mappingData - Updated mapping data
   * @returns {Promise<Object|null>} Updated mapping or null if error
   */
  const updateMapping = useCallback(async (mappingId, mappingData) => {
  // Added display name
  updateMapping.displayName = 'updateMapping';

    if (!integrationId) return null;

    try {
      setLoading(prev => ({ ...prev, fieldMappings: true }));
      setErrors(prev => ({ ...prev, fieldMappings: null }));

      const updatedMapping = await apiService.updateFieldMapping(integrationId, mappingId, mappingData);
      
      // Update mappings state
      setFieldMappings(prev => 
        prev.map(mapping => mapping.id === mappingId ? updatedMapping : mapping)
      );
      
      return updatedMapping;
    } catch (error) {
      console.error('Error updating field mapping:', error);
      setErrors(prev => ({ ...prev, fieldMappings: 'Failed to update field mapping' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, fieldMappings: false }));
    }
  }, [integrationId, apiService]);

  /**
   * Deletes a field mapping
   * 
   * @function
   * @async
   * @param {string} mappingId - ID of mapping to delete
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  const deleteMapping = useCallback(async mappingId => {
  // Added display name
  deleteMapping.displayName = 'deleteMapping';

    if (!integrationId) return false;

    try {
      setLoading(prev => ({ ...prev, fieldMappings: true }));
      setErrors(prev => ({ ...prev, fieldMappings: null }));

      await apiService.deleteFieldMapping(integrationId, mappingId);
      
      // Update mappings state by removing the deleted mapping
      setFieldMappings(prev => prev.filter(mapping => mapping.id !== mappingId));
      
      return true;
    } catch (error) {
      console.error('Error deleting field mapping:', error);
      setErrors(prev => ({ ...prev, fieldMappings: 'Failed to delete field mapping' }));
      return false;
    } finally {
      setLoading(prev => ({ ...prev, fieldMappings: false }));
    }
  }, [integrationId, apiService]);

  /**
   * Fetches datasets associated with an integration
   * 
   * @function
   * @async
   * @param {string} id - Integration ID to fetch datasets for
   * @returns {Promise<Array<Object>|null>} Associated datasets or null if error
   */
  const fetchDatasets = useCallback(async id => {
  // Added display name
  fetchDatasets.displayName = 'fetchDatasets';

    if (!id) return null;

    try {
      setLoading(prev => ({ ...prev, datasets: true }));
      setErrors(prev => ({ ...prev, datasets: null }));

      const data = await apiService.getIntegrationDatasets(id);
      setDatasets(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching associated datasets:', error);
      setErrors(prev => ({ ...prev, datasets: 'Failed to load associated datasets' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, datasets: false }));
    }
  }, [apiService]);

  /**
   * Associates a dataset with the integration
   * 
   * @function
   * @async
   * @param {string} datasetId - Dataset ID to associate
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  const associateDatasetWithIntegration = useCallback(async datasetId => {
  // Added display name
  associateDatasetWithIntegration.displayName = 'associateDatasetWithIntegration';

    if (!integrationId) return false;

    try {
      setLoading(prev => ({ ...prev, datasets: true }));
      setErrors(prev => ({ ...prev, datasets: null }));

      await apiService.associateDataset(integrationId, datasetId);
      
      // Refresh datasets after association
      await fetchDatasets(integrationId);
      
      return true;
    } catch (error) {
      console.error('Error associating dataset:', error);
      setErrors(prev => ({ ...prev, datasets: 'Failed to associate dataset' }));
      return false;
    } finally {
      setLoading(prev => ({ ...prev, datasets: false }));
    }
  }, [integrationId, fetchDatasets, apiService]);

  /**
   * Removes dataset association from the integration
   * 
   * @function
   * @async
   * @param {string} datasetId - Dataset ID to disassociate
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  const disassociateDatasetFromIntegration = useCallback(async datasetId => {
  // Added display name
  disassociateDatasetFromIntegration.displayName = 'disassociateDatasetFromIntegration';

    if (!integrationId) return false;

    try {
      setLoading(prev => ({ ...prev, datasets: true }));
      setErrors(prev => ({ ...prev, datasets: null }));

      await apiService.disassociateDataset(integrationId, datasetId);
      
      // Refresh datasets after disassociation
      await fetchDatasets(integrationId);
      
      return true;
    } catch (error) {
      console.error('Error disassociating dataset:', error);
      setErrors(prev => ({ ...prev, datasets: 'Failed to remove dataset association' }));
      return false;
    } finally {
      setLoading(prev => ({ ...prev, datasets: false }));
    }
  }, [integrationId, fetchDatasets, apiService]);

  /**
   * Fetches schedule configuration for an integration
   * 
   * @function
   * @async
   * @param {string} id - Integration ID to fetch schedule for
   * @returns {Promise<Object|null>} Schedule configuration or null if error
   */
  const fetchScheduleConfig = useCallback(async id => {
  // Added display name
  fetchScheduleConfig.displayName = 'fetchScheduleConfig';

    if (!id) return null;

    try {
      setLoading(prev => ({ ...prev, schedule: true }));
      setErrors(prev => ({ ...prev, schedule: null }));

      const data = await apiService.getScheduleConfig(id);
      setScheduleConfig(data);
      return data;
    } catch (error) {
      console.error('Error fetching schedule configuration:', error);
      setErrors(prev => ({ ...prev, schedule: 'Failed to load schedule configuration' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, schedule: false }));
    }
  }, [apiService]);

  /**
   * Updates schedule configuration for an integration
   * 
   * @function
   * @async
   * @param {Object} config - Schedule configuration data
   * @returns {Promise<Object|null>} Updated schedule or null if error
   */
  const updateSchedule = useCallback(async config => {
  // Added display name
  updateSchedule.displayName = 'updateSchedule';

    if (!integrationId) return null;

    try {
      setLoading(prev => ({ ...prev, schedule: true }));
      setErrors(prev => ({ ...prev, schedule: null }));

      const updatedConfig = await apiService.updateScheduleConfig(integrationId, config);
      setScheduleConfig(updatedConfig);
      return updatedConfig;
    } catch (error) {
      console.error('Error updating schedule configuration:', error);
      setErrors(prev => ({ ...prev, schedule: 'Failed to update schedule configuration' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, schedule: false }));
    }
  }, [integrationId, apiService]);

  /**
   * Discovers fields from a source or destination
   * 
   * @function
   * @async
   * @param {string} sourceOrDest - Either 'source' or 'destination'
   * @returns {Promise<Object|null>} Discovered fields or null if error
   */
  const discoverIntegrationFields = useCallback(async sourceOrDest => {
  // Added display name
  discoverIntegrationFields.displayName = 'discoverIntegrationFields';

    if (!integrationId) return null;

    try {
      setLoading(prev => ({ ...prev, discovery: true }));
      setErrors(prev => ({ ...prev, discovery: null }));

      const fields = await apiService.discoverFields(integrationId, sourceOrDest);
      
      // Update the correct part of the discovered fields state
      setDiscoveredFields(prev => ({
        ...prev,
        [sourceOrDest]: fields
      }));
      
      return fields;
    } catch (error) {
      console.error(`Error discovering ${sourceOrDest} fields:`, error);
      setErrors(prev => ({ ...prev, discovery: `Failed to discover ${sourceOrDest} fields` }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, discovery: false }));
    }
  }, [integrationId, apiService]);

  /**
   * Effect to load integration data when ID changes
   * Automatically fetches integration details, history, runs, and additional data
   * when the integration ID is set, and clears data when ID is null
   */
  useEffect(() => {
    if (integrationId) {
      // Fetch primary data
      fetchIntegration(integrationId);
      fetchHistory(integrationId);
      fetchRuns(integrationId);
      
      // Fetch additional data
      fetchFlowData(integrationId);
      fetchFieldMappings(integrationId);
      fetchDatasets(integrationId);
      fetchScheduleConfig(integrationId);
    } else {
      // Clear all data if no integration is selected
      setIntegration(null);
      setHistory([]);
      setRuns([]);
      setFlowData({ nodes: [], edges: [] });
      setFieldMappings([]);
      setDatasets([]);
      setScheduleConfig(null);
      setDiscoveredFields({ source: null, destination: null });
      setValidationResults(null);
    }
  }, [
    integrationId, 
    fetchIntegration, 
    fetchHistory, 
    fetchRuns, 
    fetchFlowData, 
    fetchFieldMappings, 
    fetchDatasets, 
    fetchScheduleConfig
  ]);

  /**
   * Context value provided to consumers
   * Includes state, actions, and helper properties
   * @type {Object}
   */
  const value = {
    // Base state
    integrationId,
    integration,
    history,
    runs,
    loading,
    errors,

    // Extended state
    flowData,
    fieldMappings,
    datasets,
    scheduleConfig,
    discoveredFields,
    validationResults,

    // Base actions
    setIntegrationId,
    fetchIntegration,
    fetchHistory,
    fetchRuns,
    runIntegration: runSelectedIntegration,
    deleteIntegration: deleteSelectedIntegration,

    // Flow actions
    fetchFlowData,
    saveFlowData,
    validateFlow,

    // Field mapping actions
    fetchFieldMappings,
    createMapping,
    updateMapping,
    deleteMapping,

    // Dataset actions
    fetchDatasets,
    associateDataset: associateDatasetWithIntegration,
    disassociateDataset: disassociateDatasetFromIntegration,

    // Schedule actions
    fetchScheduleConfig,
    updateSchedule,

    // Discovery actions
    discoverFields: discoverIntegrationFields,

    // Helper properties
    /**
     * Indicates if any operation is currently loading
     * @type {boolean}
     */
    isLoading: Object.values(loading).some(Boolean),
    
    /**
     * Indicates if any operation has resulted in an error
     * @type {boolean}
     */
    hasError: Object.values(errors).some(error => error !== null),
    
    /**
     * Indicates if flow data is currently being saved
     * @type {boolean}
     */
    isSaving: loading.saving,
    
    /**
     * Indicates if flow validation is in progress
     * @type {boolean}
     */
    isValidating: loading.validation,
    
    /**
     * Indicates if field discovery is in progress
     * @type {boolean}
     */
    isDiscovering: loading.discovery,
    
    /**
     * Indicates if the currently selected integration has validation errors
     * @type {boolean}
     */
    hasValidationErrors: validationResults ? validationResults.errors.length > 0 : false
  };

  return <IntegrationContext.Provider value={value}>{children}</IntegrationContext.Provider>;
};

export default IntegrationContext;
