/**
 * Dataset Models and Types
 * 
 * This module defines the dataset data models, types, and helper functions.
 * It provides a centralized location for dataset-related constants and utilities.
 * 
 * @module dataset_model
 */

// Dataset Source Types
export const DATASET_SOURCE_TYPES = {
  S3: 'S3',
  AZURE_BLOB: 'AZURE_BLOB',
  SHAREPOINT: 'SHAREPOINT',
  LOCAL_FILE: 'LOCAL_FILE',
  API: 'API',
  DATABASE: 'DATABASE',
  WEBHOOK: 'WEBHOOK',
};

// Dataset Types
export const DATASET_TYPES = {
  CSV: 'CSV',
  JSON: 'JSON',
  XML: 'XML',
  PARQUET: 'PARQUET',
  EXCEL: 'EXCEL',
  AVRO: 'AVRO',
  TEXT: 'TEXT',
  CUSTOM: 'CUSTOM',
};

// Dataset Statuses
export const DATASET_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PROCESSING: 'processing',
  ERROR: 'error',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
};

// Field Types
export const FIELD_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  TIMESTAMP: 'timestamp',
  OBJECT: 'object',
  ARRAY: 'array',
  NULL: 'null',
  ENUM: 'enum',
  EMAIL: 'email',
  URI: 'uri',
  UUID: 'uuid',
  BINARY: 'binary',
};

// Dataset Association Types
export const ASSOCIATION_TYPES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  REFERENCE: 'reference',
};

/**
 * Create a new dataset object with default values
 * @param {Object} data - Partial dataset data
 * @returns {Object} Complete dataset object with defaults for missing properties
 */
export const createDataset = (data = {}) => {
  const now = new Date().toISOString();
  
  return {
    id: data.id || crypto.randomUUID(),
    name: data.name || '',
    description: data.description || '',
    tags: data.tags || [],
    type: data.type || DATASET_TYPES.CSV,
    sourceType: data.sourceType || DATASET_SOURCE_TYPES.LOCAL_FILE,
    sourceConfig: data.sourceConfig || {},
    schema: data.schema || [],
    recordCount: data.recordCount || 0,
    size: data.size || 0,
    lastUpdated: data.lastUpdated || now,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    status: data.status || DATASET_STATUSES.ACTIVE,
    accessLevel: data.accessLevel || 'private',
    sharedWith: data.sharedWith || [],
    associatedApplications: data.associatedApplications || [],
    lastSync: data.lastSync || null,
    additionalProperties: data.additionalProperties || {},
    metadata: data.metadata || {},
    owner: data.owner || null,
    version: data.version || 1,
  };
};

/**
 * Create a dataset association
 * @param {string} datasetId - The dataset ID
 * @param {string} applicationId - The application ID
 * @param {string} associationType - The association type (from ASSOCIATION_TYPES)
 * @param {Object} config - Optional configuration for the association
 * @returns {Object} The dataset association object
 */
export const createDatasetAssociation = (datasetId, applicationId, associationType, config = {}) => {
  return {
    id: crypto.randomUUID(),
    datasetId,
    applicationId,
    associationType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config,
  };
};

/**
 * Get a human-readable label for a dataset source type
 * @param {string} sourceType - The source type
 * @returns {string} Human-readable label
 */
export const getSourceTypeLabel = (sourceType) => {
  const labels = {
    [DATASET_SOURCE_TYPES.S3]: 'Amazon S3',
    [DATASET_SOURCE_TYPES.AZURE_BLOB]: 'Azure Blob Storage',
    [DATASET_SOURCE_TYPES.SHAREPOINT]: 'SharePoint',
    [DATASET_SOURCE_TYPES.LOCAL_FILE]: 'Local File',
    [DATASET_SOURCE_TYPES.API]: 'API',
    [DATASET_SOURCE_TYPES.DATABASE]: 'Database',
    [DATASET_SOURCE_TYPES.WEBHOOK]: 'Webhook',
  };
  
  return labels[sourceType] || sourceType;
};

/**
 * Get a human-readable label for a dataset type
 * @param {string} type - The dataset type
 * @returns {string} Human-readable label
 */
export const getDatasetTypeLabel = (type) => {
  const labels = {
    [DATASET_TYPES.CSV]: 'CSV',
    [DATASET_TYPES.JSON]: 'JSON',
    [DATASET_TYPES.XML]: 'XML',
    [DATASET_TYPES.PARQUET]: 'Parquet',
    [DATASET_TYPES.EXCEL]: 'Excel',
    [DATASET_TYPES.AVRO]: 'Avro',
    [DATASET_TYPES.TEXT]: 'Text',
    [DATASET_TYPES.CUSTOM]: 'Custom',
  };
  
  return labels[type] || type;
};

/**
 * Get a human-readable label for an association type
 * @param {string} associationType - The association type
 * @returns {string} Human-readable label
 */
export const getAssociationTypeLabel = (associationType) => {
  const labels = {
    [ASSOCIATION_TYPES.PRIMARY]: 'Primary',
    [ASSOCIATION_TYPES.SECONDARY]: 'Secondary',
    [ASSOCIATION_TYPES.REFERENCE]: 'Reference',
  };
  
  return labels[associationType] || associationType;
};

/**
 * Get the description for an association type
 * @param {string} associationType - The association type
 * @returns {string} Description of the association type
 */
export const getAssociationTypeDescription = (associationType) => {
  const descriptions = {
    [ASSOCIATION_TYPES.PRIMARY]: 'Main data source for the application',
    [ASSOCIATION_TYPES.SECONDARY]: 'Additional data source for the application',
    [ASSOCIATION_TYPES.REFERENCE]: 'Lookup data for the application',
  };
  
  return descriptions[associationType] || '';
};

/**
 * Get a human-readable formatted size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "1.5 MB")
 */
export const formatSize = (bytes) => {
  if (bytes === null || bytes === undefined || isNaN(bytes)) {
    return 'Unknown';
  }
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get a human-readable formatted record count
 * @param {number} count - Record count
 * @returns {string} Formatted count (e.g., "1.5k")
 */
export const formatRecordCount = (count) => {
  if (count === null || count === undefined || isNaN(count)) {
    return 'Unknown';
  }
  
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return (count / 1000).toFixed(1) + 'k';
  } else {
    return (count / 1000000).toFixed(1) + 'M';
  }
};

/**
 * Group datasets by source type
 * @param {Array} datasets - Array of dataset objects
 * @returns {Object} Object with source types as keys and arrays of datasets as values
 */
export const groupBySourceType = (datasets) => {
  return datasets.reduce((grouped, dataset) => {
    const sourceType = dataset.sourceType;
    if (!grouped[sourceType]) {
      grouped[sourceType] = [];
    }
    grouped[sourceType].push(dataset);
    return grouped;
  }, {});
};

/**
 * Group datasets by type
 * @param {Array} datasets - Array of dataset objects
 * @returns {Object} Object with dataset types as keys and arrays of datasets as values
 */
export const groupByType = (datasets) => {
  return datasets.reduce((grouped, dataset) => {
    const type = dataset.type;
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(dataset);
    return grouped;
  }, {});
};

/**
 * Filter datasets by search term
 * @param {Array} datasets - Array of dataset objects
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} Filtered array of datasets
 */
export const filterBySearchTerm = (datasets, searchTerm) => {
  if (!searchTerm) {
    return datasets;
  }
  
  const term = searchTerm.toLowerCase();
  
  return datasets.filter(dataset => {
    return (
      dataset.name.toLowerCase().includes(term) ||
      dataset.description.toLowerCase().includes(term) ||
      dataset.tags.some(tag => tag.toLowerCase().includes(term))
    );
  });
};

/**
 * Sort datasets by a specified field
 * @param {Array} datasets - Array of dataset objects
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array of datasets
 */
export const sortDatasets = (datasets, field, direction = 'asc') => {
  const sortedDatasets = [...datasets];
  
  sortedDatasets.sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];
    
    // Handle special cases for formatted values
    if (field === 'size') {
      aValue = a.size || 0;
      bValue = b.size || 0;
    } else if (field === 'recordCount') {
      aValue = a.recordCount || 0;
      bValue = b.recordCount || 0;
    }
    
    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const compare = aValue.localeCompare(bValue);
      return direction === 'asc' ? compare : -compare;
    }
    
    // Handle number comparison
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sortedDatasets;
};

/**
 * Get a mock dataset for testing
 * @param {string} id - Optional ID for the dataset
 * @returns {Object} A mock dataset object
 */
export const getMockDataset = (id) => {
  const datasetId = id || crypto.randomUUID();
  const now = new Date().toISOString();
  
  return {
    id: datasetId,
    name: `Sample Dataset ${datasetId.substring(0, 4)}`,
    description: 'This is a sample dataset for testing purposes',
    tags: ['sample', 'test', 'mock'],
    type: DATASET_TYPES.CSV,
    sourceType: DATASET_SOURCE_TYPES.LOCAL_FILE,
    sourceConfig: {
      filePath: '/sample/path/to/data.csv',
    },
    schema: [
      {
        name: 'id',
        type: FIELD_TYPES.STRING,
        description: 'Record identifier',
        required: true,
      },
      {
        name: 'name',
        type: FIELD_TYPES.STRING,
        description: 'Record name',
        required: true,
      },
      {
        name: 'value',
        type: FIELD_TYPES.NUMBER,
        description: 'Record value',
        required: false,
      },
      {
        name: 'date',
        type: FIELD_TYPES.DATE,
        description: 'Record date',
        required: false,
      },
    ],
    recordCount: Math.floor(Math.random() * 10000),
    size: Math.floor(Math.random() * 1000000),
    lastUpdated: now,
    createdAt: now,
    updatedAt: now,
    status: DATASET_STATUSES.ACTIVE,
    accessLevel: 'private',
    sharedWith: [],
    associatedApplications: [],
    lastSync: null,
    additionalProperties: {},
    metadata: {
      columns: 4,
      hasHeaders: true,
    },
    owner: 'user-123',
    version: 1,
  };
};

/**
 * Generate an array of mock datasets for testing
 * @param {number} count - Number of mock datasets to generate
 * @returns {Array} Array of mock dataset objects
 */
export const generateMockDatasets = (count = 5) => {
  const datasets = [];
  
  for (let i = 0; i < count; i++) {
    datasets.push(getMockDataset());
  }
  
  return datasets;
};

export default {
  DATASET_SOURCE_TYPES,
  DATASET_TYPES,
  DATASET_STATUSES,
  FIELD_TYPES,
  ASSOCIATION_TYPES,
  createDataset,
  createDatasetAssociation,
  getSourceTypeLabel,
  getDatasetTypeLabel,
  getAssociationTypeLabel,
  getAssociationTypeDescription,
  formatSize,
  formatRecordCount,
  groupBySourceType,
  groupByType,
  filterBySearchTerm,
  sortDatasets,
  getMockDataset,
  generateMockDatasets,
};