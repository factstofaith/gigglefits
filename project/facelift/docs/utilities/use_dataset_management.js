import { useState, useCallback, useEffect } from 'react';
import { 
  DATASET_TYPES, 
  DATASET_SOURCE_TYPES, 
  DATASET_STATUSES,
  createEmptyDataset,
} from './dataset_model';

/**
 * Custom hook for dataset management
 * 
 * Provides methods for fetching, creating, updating, and deleting datasets,
 * as well as managing dataset associations with applications.
 * 
 * @param {string} tenantId - ID of the current tenant
 * @returns {object} Dataset management methods and state
 */
const useDatasetManagement = (tenantId) => {
  const [datasets, setDatasets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch datasets for the current tenant
   */
  const fetchDatasets = useCallback(async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll use mock data
      const mockDatasets = [
        {
          id: 'ds1',
          name: 'Sales Data 2025',
          description: 'Quarterly sales data for all regions',
          type: DATASET_TYPES.CSV,
          sourceType: DATASET_SOURCE_TYPES.S3,
          sourceConfig: {
            connectionId: 'conn1',
            path: 'sales/quarterly/2025',
            query: '',
            endpoint: '',
          },
          schema: {
            autoDetect: false,
            fields: [
              {
                name: 'date',
                type: 'date',
                required: true,
                defaultValue: null,
                description: 'Date of sale',
              },
              {
                name: 'region',
                type: 'string',
                required: true,
                defaultValue: null,
                description: 'Sales region',
              },
              {
                name: 'product',
                type: 'string',
                required: true,
                defaultValue: null,
                description: 'Product name',
              },
              {
                name: 'amount',
                type: 'number',
                required: true,
                defaultValue: 0,
                description: 'Sale amount',
              },
            ],
          },
          createdAt: '2025-03-15T10:30:00Z',
          updatedAt: '2025-03-29T14:45:00Z',
          createdBy: {
            id: 'user1',
            name: 'John Doe',
          },
          tags: ['Sales', 'Quarterly', '2025'],
          applicationAssociations: [
            {
              applicationId: '1',
              applicationName: 'Sales Data Integration',
              associationType: 'primary',
              createdAt: '2025-03-16T08:20:00Z',
            },
            {
              applicationId: '2',
              applicationName: 'Customer Analytics Dashboard',
              associationType: 'secondary',
              createdAt: '2025-03-20T11:15:00Z',
            },
          ],
          status: DATASET_STATUSES.ACTIVE,
          size: 1048576, // 1MB
          recordCount: 5000,
          lastSyncedAt: '2025-03-29T14:45:00Z',
        },
        {
          id: 'ds2',
          name: 'Customer Profiles',
          description: 'Customer demographic and preference data',
          type: DATASET_TYPES.JSON,
          sourceType: DATASET_SOURCE_TYPES.API,
          sourceConfig: {
            connectionId: 'conn2',
            path: '',
            query: '',
            endpoint: 'https://api.example.com/customers',
          },
          schema: {
            autoDetect: true,
            fields: [],
          },
          createdAt: '2025-03-18T09:45:00Z',
          updatedAt: '2025-03-28T16:30:00Z',
          createdBy: {
            id: 'user2',
            name: 'Jane Smith',
          },
          tags: ['Customers', 'Demographics', 'API'],
          applicationAssociations: [
            {
              applicationId: '2',
              applicationName: 'Customer Analytics Dashboard',
              associationType: 'primary',
              createdAt: '2025-03-18T09:50:00Z',
            },
          ],
          status: DATASET_STATUSES.ACTIVE,
          size: 524288, // 512KB
          recordCount: 1000,
          lastSyncedAt: '2025-03-28T16:30:00Z',
        },
        {
          id: 'ds3',
          name: 'Employee Records',
          description: 'HR data for current employees',
          type: DATASET_TYPES.DATABASE_TABLE,
          sourceType: DATASET_SOURCE_TYPES.DATABASE,
          sourceConfig: {
            connectionId: 'conn3',
            path: '',
            query: 'SELECT * FROM employees',
            endpoint: '',
          },
          schema: {
            autoDetect: false,
            fields: [
              {
                name: 'employee_id',
                type: 'string',
                required: true,
                defaultValue: null,
                description: 'Employee ID',
              },
              {
                name: 'name',
                type: 'string',
                required: true,
                defaultValue: null,
                description: 'Employee name',
              },
              {
                name: 'department',
                type: 'string',
                required: true,
                defaultValue: null,
                description: 'Department',
              },
              {
                name: 'hire_date',
                type: 'date',
                required: true,
                defaultValue: null,
                description: 'Hire date',
              },
            ],
          },
          createdAt: '2025-03-10T08:00:00Z',
          updatedAt: '2025-03-25T16:20:00Z',
          createdBy: {
            id: 'user1',
            name: 'John Doe',
          },
          tags: ['HR', 'Employees', 'Database'],
          applicationAssociations: [
            {
              applicationId: '3',
              applicationName: 'HR Data Synchronization',
              associationType: 'primary',
              createdAt: '2025-03-10T08:30:00Z',
            },
          ],
          status: DATASET_STATUSES.DRAFT,
          size: 2097152, // 2MB
          recordCount: 500,
          lastSyncedAt: '2025-03-25T16:20:00Z',
        },
        {
          id: 'ds4',
          name: 'Marketing Campaigns',
          description: 'Marketing campaign performance metrics',
          type: DATASET_TYPES.EXCEL,
          sourceType: DATASET_SOURCE_TYPES.SHAREPOINT,
          sourceConfig: {
            connectionId: 'conn4',
            path: '/sites/marketing/documents/campaigns.xlsx',
            query: '',
            endpoint: '',
          },
          schema: {
            autoDetect: true,
            fields: [],
          },
          createdAt: '2025-03-22T11:30:00Z',
          updatedAt: '2025-03-27T09:15:00Z',
          createdBy: {
            id: 'user3',
            name: 'Alice Johnson',
          },
          tags: ['Marketing', 'Campaigns', 'Excel'],
          applicationAssociations: [],
          status: DATASET_STATUSES.DRAFT,
          size: 1572864, // 1.5MB
          recordCount: 200,
          lastSyncedAt: '2025-03-27T09:15:00Z',
        },
        {
          id: 'ds5',
          name: 'Product Catalog',
          description: 'Complete product catalog with pricing',
          type: DATASET_TYPES.XML,
          sourceType: DATASET_SOURCE_TYPES.AZURE_BLOB,
          sourceConfig: {
            connectionId: 'conn5',
            path: 'product-catalog/latest.xml',
            query: '',
            endpoint: '',
          },
          schema: {
            autoDetect: true,
            fields: [],
          },
          createdAt: '2025-03-05T14:20:00Z',
          updatedAt: '2025-03-26T10:45:00Z',
          createdBy: {
            id: 'user2',
            name: 'Jane Smith',
          },
          tags: ['Products', 'Catalog', 'XML'],
          applicationAssociations: [
            {
              applicationId: '1',
              applicationName: 'Sales Data Integration',
              associationType: 'secondary',
              createdAt: '2025-03-06T09:30:00Z',
            },
          ],
          status: DATASET_STATUSES.DEPRECATED,
          size: 5242880, // 5MB
          recordCount: 10000,
          lastSyncedAt: '2025-03-26T10:45:00Z',
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDatasets(mockDatasets);
    } catch (err) {
      setError(err.message || 'Failed to fetch datasets');
      console.error('Error fetching datasets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  /**
   * Create a new dataset
   * @param {object} datasetData - Data for the new dataset
   * @returns {Promise<object>} Created dataset
   */
  const createDataset = useCallback(async (datasetData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just add to our local state with a mock ID
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDataset = {
        ...datasetData,
        id: `ds_${Date.now()}`, // Generate a mock ID
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          id: 'current_user',
          name: 'Current User',
        },
      };
      
      setDatasets(prev => [...prev, newDataset]);
      return newDataset;
    } catch (err) {
      setError(err.message || 'Failed to create dataset');
      console.error('Error creating dataset:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an existing dataset
   * @param {object} datasetData - Updated dataset data
   * @returns {Promise<object>} Updated dataset
   */
  const updateDataset = useCallback(async (datasetData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just update our local state
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedDataset = {
        ...datasetData,
        updatedAt: new Date().toISOString(),
      };
      
      setDatasets(prev => 
        prev.map(ds => ds.id === updatedDataset.id ? updatedDataset : ds)
      );
      
      return updatedDataset;
    } catch (err) {
      setError(err.message || 'Failed to update dataset');
      console.error('Error updating dataset:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete a dataset
   * @param {string} datasetId - ID of the dataset to delete
   * @returns {Promise<void>} Promise resolving when the deletion is complete
   */
  const deleteDataset = useCallback(async (datasetId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just remove from our local state
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      setDatasets(prev => prev.filter(ds => ds.id !== datasetId));
    } catch (err) {
      setError(err.message || 'Failed to delete dataset');
      console.error('Error deleting dataset:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Associate a dataset with an application
   * @param {string} datasetId - Dataset ID
   * @param {string} applicationId - Application ID
   * @param {string} applicationName - Application name
   * @param {string} associationType - Type of association
   * @returns {Promise<object>} Updated dataset
   */
  const associateDatasetWithApplication = useCallback(async (
    datasetId,
    applicationId,
    applicationName,
    associationType
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just update our local state
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const dataset = datasets.find(ds => ds.id === datasetId);
      
      if (!dataset) {
        throw new Error(`Dataset with ID ${datasetId} not found`);
      }
      
      // Check if association already exists and update it, or create a new one
      const existingAssocIndex = dataset.applicationAssociations.findIndex(
        assoc => assoc.applicationId === applicationId
      );
      
      const updatedDataset = { ...dataset };
      
      if (existingAssocIndex >= 0) {
        // Update existing association
        updatedDataset.applicationAssociations = [
          ...dataset.applicationAssociations.slice(0, existingAssocIndex),
          {
            applicationId,
            applicationName,
            associationType,
            createdAt: dataset.applicationAssociations[existingAssocIndex].createdAt,
          },
          ...dataset.applicationAssociations.slice(existingAssocIndex + 1),
        ];
      } else {
        // Create new association
        updatedDataset.applicationAssociations = [
          ...dataset.applicationAssociations,
          {
            applicationId,
            applicationName,
            associationType,
            createdAt: new Date().toISOString(),
          },
        ];
      }
      
      updatedDataset.updatedAt = new Date().toISOString();
      
      setDatasets(prev => 
        prev.map(ds => ds.id === datasetId ? updatedDataset : ds)
      );
      
      return updatedDataset;
    } catch (err) {
      setError(err.message || 'Failed to associate dataset with application');
      console.error('Error associating dataset with application:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [datasets]);

  /**
   * Remove an association between a dataset and an application
   * @param {string} datasetId - Dataset ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<object>} Updated dataset
   */
  const removeDatasetApplicationAssociation = useCallback(async (
    datasetId,
    applicationId
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just update our local state
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const dataset = datasets.find(ds => ds.id === datasetId);
      
      if (!dataset) {
        throw new Error(`Dataset with ID ${datasetId} not found`);
      }
      
      const updatedDataset = {
        ...dataset,
        applicationAssociations: dataset.applicationAssociations.filter(
          assoc => assoc.applicationId !== applicationId
        ),
        updatedAt: new Date().toISOString(),
      };
      
      setDatasets(prev => 
        prev.map(ds => ds.id === datasetId ? updatedDataset : ds)
      );
      
      return updatedDataset;
    } catch (err) {
      setError(err.message || 'Failed to remove dataset application association');
      console.error('Error removing dataset application association:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [datasets]);

  /**
   * Get datasets associated with an application
   * @param {string} applicationId - Application ID
   * @returns {Array<object>} Associated datasets
   */
  const getDatasetsByApplication = useCallback((applicationId) => {
    return datasets.filter(dataset => 
      dataset.applicationAssociations.some(
        assoc => assoc.applicationId === applicationId
      )
    );
  }, [datasets]);

  /**
   * Fetch dataset schema preview
   * @param {string} datasetId - Dataset ID
   * @returns {Promise<object>} Schema preview data
   */
  const fetchDatasetSchemaPreview = useCallback(async (datasetId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call
      // For now, we'll just use the dataset's schema if it exists
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dataset = datasets.find(ds => ds.id === datasetId);
      
      if (!dataset) {
        throw new Error(`Dataset with ID ${datasetId} not found`);
      }
      
      if (dataset.schema.autoDetect && dataset.schema.fields.length === 0) {
        // Mock auto-detected schema
        const mockFields = [
          {
            name: 'id',
            type: 'string',
            required: true,
            defaultValue: null,
            description: 'Primary identifier',
          },
          {
            name: 'name',
            type: 'string',
            required: true,
            defaultValue: null,
            description: 'Name or title',
          },
          {
            name: 'created_at',
            type: 'datetime',
            required: true,
            defaultValue: null,
            description: 'Creation timestamp',
          },
          {
            name: 'value',
            type: 'number',
            required: false,
            defaultValue: 0,
            description: 'Numeric value',
          },
          {
            name: 'is_active',
            type: 'boolean',
            required: false,
            defaultValue: true,
            description: 'Active status',
          },
        ];
        
        return {
          fields: mockFields,
          sampleData: [
            {
              id: 'record1',
              name: 'Sample Record 1',
              created_at: '2025-03-15T10:30:00Z',
              value: 42.5,
              is_active: true,
            },
            {
              id: 'record2',
              name: 'Sample Record 2',
              created_at: '2025-03-16T08:45:00Z',
              value: 18.2,
              is_active: false,
            },
            {
              id: 'record3',
              name: 'Sample Record 3',
              created_at: '2025-03-17T14:20:00Z',
              value: 73.9,
              is_active: true,
            },
          ],
        };
      } else {
        // Use existing schema
        return {
          fields: dataset.schema.fields,
          sampleData: [],
        };
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dataset schema preview');
      console.error('Error fetching dataset schema preview:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [datasets]);

  // Load datasets when the tenant ID changes
  useEffect(() => {
    if (tenantId) {
      fetchDatasets();
    }
  }, [tenantId, fetchDatasets]);

  return {
    datasets,
    isLoading,
    error,
    fetchDatasets,
    createDataset,
    updateDataset,
    deleteDataset,
    associateDatasetWithApplication,
    removeDatasetApplicationAssociation,
    getDatasetsByApplication,
    fetchDatasetSchemaPreview,
  };
};

export default useDatasetManagement;