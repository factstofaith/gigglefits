/**
 * Custom hook for dataset management
 * 
 * This hook provides state management and operations for datasets, including
 * fetching, creating, updating, and deleting datasets, as well as managing
 * dataset associations with applications.
 * 
 * @module use_dataset_management
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { createDataset, generateMockDatasets, DATASET_STATUSES } from './dataset_model';

/**
 * Custom hook for dataset management
 * @param {Object} options - Configuration options
 * @param {boolean} options.useMock - Whether to use mock data
 * @param {number} options.mockCount - Number of mock datasets to generate
 * @returns {Object} Dataset management state and operations
 */
export const useDatasetManagement = (options = {}) => {
  const { useMock = true, mockCount = 10 } = options;
  
  // State for datasets
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  
  // State for filtering and sorting
  const [filters, setFilters] = useState({
    searchTerm: '',
    sourceTypes: [],
    datasetTypes: [],
    tags: [],
    statuses: [],
  });
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  /**
   * Fetch datasets from API or generate mock data
   */
  const fetchDatasets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMock) {
        // Generate mock data
        const mockDatasets = generateMockDatasets(mockCount);
        setDatasets(mockDatasets);
      } else {
        // Call API
        const response = await fetch('/api/datasets');
        if (!response.ok) {
          throw new Error(`Failed to fetch datasets: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setDatasets(data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching datasets:', err);
    } finally {
      setLoading(false);
    }
  }, [useMock, mockCount]);
  
  /**
   * Create a new dataset
   * @param {Object} datasetData - Dataset data
   * @returns {Promise<Object>} The created dataset
   */
  const createDatasetRecord = useCallback(async (datasetData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMock) {
        // Create mock dataset
        const newDataset = createDataset({
          ...datasetData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        setDatasets(prevDatasets => [...prevDatasets, newDataset]);
        return newDataset;
      } else {
        // Call API
        const response = await fetch('/api/datasets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datasetData),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create dataset: ${response.status} ${response.statusText}`);
        }
        
        const newDataset = await response.json();
        setDatasets(prevDatasets => [...prevDatasets, newDataset]);
        return newDataset;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating dataset:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMock]);
  
  /**
   * Update an existing dataset
   * @param {string} datasetId - Dataset ID
   * @param {Object} datasetData - Updated dataset data
   * @returns {Promise<Object>} The updated dataset
   */
  const updateDataset = useCallback(async (datasetId, datasetData) => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMock) {
        // Update mock dataset
        const updatedDatasets = datasets.map(dataset => {
          if (dataset.id === datasetId) {
            return {
              ...dataset,
              ...datasetData,
              updatedAt: new Date().toISOString(),
            };
          }
          return dataset;
        });
        
        setDatasets(updatedDatasets);
        const updatedDataset = updatedDatasets.find(dataset => dataset.id === datasetId);
        return updatedDataset;
      } else {
        // Call API
        const response = await fetch(`/api/datasets/${datasetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datasetData),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update dataset: ${response.status} ${response.statusText}`);
        }
        
        const updatedDataset = await response.json();
        setDatasets(prevDatasets => 
          prevDatasets.map(dataset => 
            dataset.id === datasetId ? updatedDataset : dataset
          )
        );
        
        return updatedDataset;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating dataset:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [datasets, useMock]);
  
  /**
   * Delete a dataset
   * @param {string} datasetId - Dataset ID
   * @returns {Promise<boolean>} Success indicator
   */
  const deleteDataset = useCallback(async (datasetId) => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMock) {
        // Delete mock dataset
        setDatasets(prevDatasets => prevDatasets.filter(dataset => dataset.id !== datasetId));
        return true;
      } else {
        // Call API
        const response = await fetch(`/api/datasets/${datasetId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete dataset: ${response.status} ${response.statusText}`);
        }
        
        setDatasets(prevDatasets => prevDatasets.filter(dataset => dataset.id !== datasetId));
        return true;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting dataset:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMock]);
  
  /**
   * Get a dataset by ID
   * @param {string} datasetId - Dataset ID
   * @returns {Promise<Object>} The dataset
   */
  const getDatasetById = useCallback(async (datasetId) => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMock) {
        // Get mock dataset
        const dataset = datasets.find(dataset => dataset.id === datasetId);
        if (!dataset) {
          throw new Error(`Dataset not found: ${datasetId}`);
        }
        return dataset;
      } else {
        // Call API
        const response = await fetch(`/api/datasets/${datasetId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to get dataset: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      }
    } catch (err) {
      setError(err.message);
      console.error('Error getting dataset:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [datasets, useMock]);
  
  /**
   * Create a dataset association with an application
   * @param {string} datasetId - Dataset ID
   * @param {string} applicationId - Application ID
   * @param {string} associationType - Association type
   * @param {Object} config - Association configuration
   * @returns {Promise<Object>} The created association
   */
  const createDatasetAssociation = useCallback(async (datasetId, applicationId, associationType, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMock) {
        // Create mock association
        const association = {
          id: crypto.randomUUID(),
          datasetId,
          applicationId,
          associationType,
          config,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Update dataset with association
        setDatasets(prevDatasets => 
          prevDatasets.map(dataset => {
            if (dataset.id === datasetId) {
              return {
                ...dataset,
                associatedApplications: [
                  ...(dataset.associatedApplications || []),
                  { applicationId, associationType, config },
                ],
                updatedAt: new Date().toISOString(),
              };
            }
            return dataset;
          })
        );
        
        return association;
      } else {
        // Call API
        const response = await fetch('/api/dataset-associations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            datasetId,
            applicationId,
            associationType,
            config,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create dataset association: ${response.status} ${response.statusText}`);
        }
        
        const association = await response.json();
        
        // Update cached datasets with the new association
        setDatasets(prevDatasets => 
          prevDatasets.map(dataset => {
            if (dataset.id === datasetId) {
              return {
                ...dataset,
                associatedApplications: [
                  ...(dataset.associatedApplications || []),
                  { applicationId, associationType, config },
                ],
                updatedAt: new Date().toISOString(),
              };
            }
            return dataset;
          })
        );
        
        return association;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating dataset association:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMock]);
  
  /**
   * Remove a dataset association with an application
   * @param {string} datasetId - Dataset ID
   * @param {string} applicationId - Application ID
   * @returns {Promise<boolean>} Success indicator
   */
  const removeDatasetAssociation = useCallback(async (datasetId, applicationId) => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMock) {
        // Remove mock association
        setDatasets(prevDatasets => 
          prevDatasets.map(dataset => {
            if (dataset.id === datasetId) {
              return {
                ...dataset,
                associatedApplications: (dataset.associatedApplications || [])
                  .filter(assoc => assoc.applicationId !== applicationId),
                updatedAt: new Date().toISOString(),
              };
            }
            return dataset;
          })
        );
        
        return true;
      } else {
        // Call API
        const response = await fetch(`/api/dataset-associations/${datasetId}/${applicationId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to remove dataset association: ${response.status} ${response.statusText}`);
        }
        
        // Update cached datasets
        setDatasets(prevDatasets => 
          prevDatasets.map(dataset => {
            if (dataset.id === datasetId) {
              return {
                ...dataset,
                associatedApplications: (dataset.associatedApplications || [])
                  .filter(assoc => assoc.applicationId !== applicationId),
                updatedAt: new Date().toISOString(),
              };
            }
            return dataset;
          })
        );
        
        return true;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error removing dataset association:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMock]);
  
  /**
   * Update dataset filters
   * @param {Object} newFilters - New filter values
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters,
    }));
  }, []);
  
  /**
   * Update sort field and direction
   * @param {string} field - Field to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   */
  const updateSort = useCallback((field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  }, []);
  
  /**
   * Reset all filters and sorting to default values
   */
  const resetFiltersAndSort = useCallback(() => {
    setFilters({
      searchTerm: '',
      sourceTypes: [],
      datasetTypes: [],
      tags: [],
      statuses: [],
    });
    setSortField('name');
    setSortDirection('asc');
  }, []);
  
  /**
   * Apply filters to datasets
   * @param {Array} datasetsToFilter - Datasets to filter
   * @returns {Array} Filtered datasets
   */
  const applyFilters = useCallback((datasetsToFilter) => {
    let filtered = [...datasetsToFilter];
    
    // Apply search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(dataset => 
        dataset.name.toLowerCase().includes(term) ||
        dataset.description.toLowerCase().includes(term) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply source type filter
    if (filters.sourceTypes.length > 0) {
      filtered = filtered.filter(dataset => 
        filters.sourceTypes.includes(dataset.sourceType)
      );
    }
    
    // Apply dataset type filter
    if (filters.datasetTypes.length > 0) {
      filtered = filtered.filter(dataset => 
        filters.datasetTypes.includes(dataset.type)
      );
    }
    
    // Apply tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(dataset => 
        filters.tags.some(tag => dataset.tags.includes(tag))
      );
    }
    
    // Apply status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(dataset => 
        filters.statuses.includes(dataset.status)
      );
    }
    
    return filtered;
  }, [filters]);
  
  /**
   * Apply sorting to datasets
   * @param {Array} datasetsToSort - Datasets to sort
   * @returns {Array} Sorted datasets
   */
  const applySorting = useCallback((datasetsToSort) => {
    const sorted = [...datasetsToSort];
    
    sorted.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle special cases
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      // Handle number comparison
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      
      return 0;
    });
    
    return sorted;
  }, [sortField, sortDirection]);
  
  /**
   * Get all datasets with filters and sorting applied
   * @returns {Array} Filtered and sorted datasets
   */
  const getFilteredAndSortedDatasets = useCallback(() => {
    const filtered = applyFilters(datasets);
    return applySorting(filtered);
  }, [datasets, applyFilters, applySorting]);
  
  /**
   * Get datasets associated with an application
   * @param {string} applicationId - Application ID
   * @returns {Array} Datasets associated with the application
   */
  const getDatasetsByApplicationId = useCallback((applicationId) => {
    return datasets.filter(dataset => 
      (dataset.associatedApplications || []).some(assoc => 
        assoc.applicationId === applicationId
      )
    );
  }, [datasets]);
  
  /**
   * Get all unique tags from all datasets
   * @returns {Array} Array of unique tags
   */
  const getAllTags = useCallback(() => {
    const tagSet = new Set();
    
    datasets.forEach(dataset => {
      (dataset.tags || []).forEach(tag => {
        tagSet.add(tag);
      });
    });
    
    return Array.from(tagSet);
  }, [datasets]);
  
  /**
   * Archive a dataset
   * @param {string} datasetId - Dataset ID
   * @returns {Promise<Object>} The archived dataset
   */
  const archiveDataset = useCallback(async (datasetId) => {
    return updateDataset(datasetId, { status: DATASET_STATUSES.ARCHIVED });
  }, [updateDataset]);
  
  /**
   * Restore an archived dataset
   * @param {string} datasetId - Dataset ID
   * @returns {Promise<Object>} The restored dataset
   */
  const restoreDataset = useCallback(async (datasetId) => {
    return updateDataset(datasetId, { status: DATASET_STATUSES.ACTIVE });
  }, [updateDataset]);
  
  // Initial data fetch
  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);
  
  // Return state and operations
  return {
    // State
    datasets,
    loading,
    error,
    selectedDataset,
    filters,
    sortField,
    sortDirection,
    
    // Filtered and sorted datasets
    filteredDatasets: getFilteredAndSortedDatasets(),
    
    // Dataset operations
    fetchDatasets,
    createDataset: createDatasetRecord,
    updateDataset,
    deleteDataset,
    getDatasetById,
    createDatasetAssociation,
    removeDatasetAssociation,
    setSelectedDataset,
    
    // Filter and sort operations
    updateFilters,
    updateSort,
    resetFiltersAndSort,
    
    // Helper functions
    getDatasetsByApplicationId,
    getAllTags,
    archiveDataset,
    restoreDataset,
  };
};

export default useDatasetManagement;