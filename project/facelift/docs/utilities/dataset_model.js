/**
 * Dataset models and utilities for the TAP Integration Platform
 * 
 * This file contains dataset types, constants, and utility functions
 * for working with datasets in the UI.
 */

/**
 * Dataset source types
 */
export const DATASET_SOURCE_TYPES = {
  S3: 's3',
  AZURE_BLOB: 'azureblob',
  SHAREPOINT: 'sharepoint',
  DATABASE: 'database',
  API: 'api',
  FILE: 'file',
  MANUAL: 'manual',
};

/**
 * Dataset types
 */
export const DATASET_TYPES = {
  CSV: 'csv',
  JSON: 'json',
  XML: 'xml',
  EXCEL: 'excel',
  PARQUET: 'parquet',
  AVRO: 'avro',
  DATABASE_TABLE: 'database_table',
  API_RESPONSE: 'api_response',
  CUSTOM: 'custom',
};

/**
 * Dataset status values
 */
export const DATASET_STATUSES = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  DEPRECATED: 'deprecated',
  ARCHIVED: 'archived',
  ERROR: 'error',
};

/**
 * Dataset field types
 */
export const DATASET_FIELD_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  OBJECT: 'object',
  ARRAY: 'array',
  BINARY: 'binary',
  NULL: 'null',
};

/**
 * Dataset association types
 */
export const DATASET_ASSOCIATION_TYPES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  REFERENCE: 'reference',
};

/**
 * Dataset model type definition
 * 
 * @typedef {Object} Dataset
 * @property {string} id - Unique identifier
 * @property {string} name - Dataset name
 * @property {string} [description] - Optional description
 * @property {string} type - Dataset type (from DATASET_TYPES)
 * @property {string} sourceType - Source type (from DATASET_SOURCE_TYPES)
 * @property {Object} sourceConfig - Source configuration
 * @property {string} [sourceConfig.connectionId] - Connection ID for external sources
 * @property {string} [sourceConfig.path] - Path for file-based sources
 * @property {string} [sourceConfig.query] - Query for database sources
 * @property {string} [sourceConfig.endpoint] - Endpoint for API sources
 * @property {Object} schema - Schema definition
 * @property {boolean} schema.autoDetect - Whether to auto-detect schema
 * @property {Array<DatasetField>} [schema.fields] - Field definitions
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {Object} createdBy - Creator info
 * @property {string} createdBy.id - Creator ID
 * @property {string} createdBy.name - Creator name
 * @property {Array<string>} tags - Tags for categorization
 * @property {Array<DatasetAssociation>} applicationAssociations - Associated applications
 * @property {string} status - Dataset status (from DATASET_STATUSES)
 * @property {number} [size] - Size in bytes
 * @property {number} [recordCount] - Number of records
 * @property {string} [lastSyncedAt] - Last sync timestamp
 */

/**
 * Dataset field model type definition
 * 
 * @typedef {Object} DatasetField
 * @property {string} name - Field name
 * @property {string} type - Field type (from DATASET_FIELD_TYPES)
 * @property {boolean} required - Whether the field is required
 * @property {*} [defaultValue] - Default value
 * @property {string} [description] - Field description
 */

/**
 * Dataset association model type definition
 * 
 * @typedef {Object} DatasetAssociation
 * @property {string} applicationId - Associated application ID
 * @property {string} applicationName - Associated application name
 * @property {string} associationType - Association type (from DATASET_ASSOCIATION_TYPES)
 * @property {string} createdAt - Creation timestamp
 */

/**
 * Create empty dataset object with default values
 * 
 * @returns {Dataset} New dataset object with default values
 */
export const createEmptyDataset = () => ({
  id: '',
  name: '',
  description: '',
  type: DATASET_TYPES.CSV,
  sourceType: DATASET_SOURCE_TYPES.FILE,
  sourceConfig: {
    connectionId: null,
    path: '',
    query: '',
    endpoint: '',
  },
  schema: {
    autoDetect: true,
    fields: [],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: {
    id: '',
    name: '',
  },
  tags: [],
  applicationAssociations: [],
  status: DATASET_STATUSES.DRAFT,
  size: 0,
  recordCount: 0,
});

/**
 * Create a new dataset field
 * 
 * @param {string} name - Field name
 * @param {string} type - Field type
 * @param {boolean} [required=false] - Whether the field is required
 * @param {*} [defaultValue=null] - Default value
 * @param {string} [description=''] - Field description
 * @returns {DatasetField} New dataset field
 */
export const createDatasetField = (
  name,
  type = DATASET_FIELD_TYPES.STRING,
  required = false,
  defaultValue = null,
  description = ''
) => ({
  name,
  type,
  required,
  defaultValue,
  description,
});

/**
 * Create a new dataset association
 * 
 * @param {string} applicationId - Application ID
 * @param {string} applicationName - Application name
 * @param {string} [associationType=DATASET_ASSOCIATION_TYPES.SECONDARY] - Association type
 * @returns {DatasetAssociation} New dataset association
 */
export const createDatasetAssociation = (
  applicationId,
  applicationName,
  associationType = DATASET_ASSOCIATION_TYPES.SECONDARY
) => ({
  applicationId,
  applicationName,
  associationType,
  createdAt: new Date().toISOString(),
});

/**
 * Get a human-readable name for a dataset type
 * 
 * @param {string} type - Dataset type
 * @returns {string} Human-readable name
 */
export const getDatasetTypeName = (type) => {
  const typeMap = {
    [DATASET_TYPES.CSV]: 'CSV File',
    [DATASET_TYPES.JSON]: 'JSON',
    [DATASET_TYPES.XML]: 'XML',
    [DATASET_TYPES.EXCEL]: 'Excel Spreadsheet',
    [DATASET_TYPES.PARQUET]: 'Parquet',
    [DATASET_TYPES.AVRO]: 'Avro',
    [DATASET_TYPES.DATABASE_TABLE]: 'Database Table',
    [DATASET_TYPES.API_RESPONSE]: 'API Response',
    [DATASET_TYPES.CUSTOM]: 'Custom Format',
  };
  
  return typeMap[type] || 'Unknown Type';
};

/**
 * Get a human-readable name for a source type
 * 
 * @param {string} sourceType - Source type
 * @returns {string} Human-readable name
 */
export const getSourceTypeName = (sourceType) => {
  const sourceTypeMap = {
    [DATASET_SOURCE_TYPES.S3]: 'Amazon S3',
    [DATASET_SOURCE_TYPES.AZURE_BLOB]: 'Azure Blob Storage',
    [DATASET_SOURCE_TYPES.SHAREPOINT]: 'SharePoint',
    [DATASET_SOURCE_TYPES.DATABASE]: 'Database',
    [DATASET_SOURCE_TYPES.API]: 'API',
    [DATASET_SOURCE_TYPES.FILE]: 'File Upload',
    [DATASET_SOURCE_TYPES.MANUAL]: 'Manual Entry',
  };
  
  return sourceTypeMap[sourceType] || 'Unknown Source';
};

/**
 * Get a color for a dataset status
 * 
 * @param {string} status - Dataset status
 * @returns {string} Color value for the status
 */
export const getDatasetStatusColor = (status) => {
  const statusColorMap = {
    [DATASET_STATUSES.ACTIVE]: '#4caf50', // green
    [DATASET_STATUSES.DRAFT]: '#2196f3', // blue
    [DATASET_STATUSES.DEPRECATED]: '#ff9800', // orange
    [DATASET_STATUSES.ARCHIVED]: '#9e9e9e', // grey
    [DATASET_STATUSES.ERROR]: '#f44336', // red
  };
  
  return statusColorMap[status] || '#9e9e9e';
};

/**
 * Get a human-readable file size string
 * 
 * @param {number} bytes - Size in bytes
 * @returns {string} Human-readable size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Checks if a dataset is associated with an application
 * 
 * @param {Dataset} dataset - Dataset to check
 * @param {string} applicationId - Application ID to check for
 * @returns {boolean} True if the dataset is associated with the application
 */
export const isDatasetAssociatedWithApplication = (dataset, applicationId) => {
  return dataset.applicationAssociations.some(assoc => assoc.applicationId === applicationId);
};

/**
 * Get the association type between a dataset and an application
 * 
 * @param {Dataset} dataset - Dataset to check
 * @param {string} applicationId - Application ID to check for
 * @returns {string|null} Association type or null if not associated
 */
export const getDatasetAssociationType = (dataset, applicationId) => {
  const association = dataset.applicationAssociations.find(
    assoc => assoc.applicationId === applicationId
  );
  
  return association ? association.associationType : null;
};

export default {
  DATASET_SOURCE_TYPES,
  DATASET_TYPES,
  DATASET_STATUSES,
  DATASET_FIELD_TYPES,
  DATASET_ASSOCIATION_TYPES,
  createEmptyDataset,
  createDatasetField,
  createDatasetAssociation,
  getDatasetTypeName,
  getSourceTypeName,
  getDatasetStatusColor,
  formatFileSize,
  isDatasetAssociatedWithApplication,
  getDatasetAssociationType,
};