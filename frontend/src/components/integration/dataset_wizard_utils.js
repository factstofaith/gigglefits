/**
 * Dataset Creation Wizard Utilities
 * 
 * This module provides utilities and helper functions for the dataset creation wizard.
 * It includes step configuration, navigation logic, validation schemas, and display
 * information for various dataset types, sources, and fields.
 * 
 * @module dataset_wizard_utils
 */

import * as Yup from 'yup';

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

/**
 * Configuration for the wizard steps
 */
export const WIZARD_STEPS = {
  BASIC_INFO: 'BASIC_INFO',
  SOURCE_SELECTION: 'SOURCE_SELECTION',
  SOURCE_CONFIG: 'SOURCE_CONFIG',
  SCHEMA_CONFIG: 'SCHEMA_CONFIG',
  PERMISSIONS: 'PERMISSIONS',
  REVIEW: 'REVIEW',
};

/**
 * Step index mapping for the wizard
 */
export const STEP_INDICES = {
  [WIZARD_STEPS.BASIC_INFO]: 0,
  [WIZARD_STEPS.SOURCE_SELECTION]: 1,
  [WIZARD_STEPS.SOURCE_CONFIG]: 2,
  [WIZARD_STEPS.SCHEMA_CONFIG]: 3,
  [WIZARD_STEPS.PERMISSIONS]: 4,
  [WIZARD_STEPS.REVIEW]: 5,
};

/**
 * Step labels for the wizard
 */
export const STEP_LABELS = {
  [WIZARD_STEPS.BASIC_INFO]: 'Basic Information',
  [WIZARD_STEPS.SOURCE_SELECTION]: 'Select Source',
  [WIZARD_STEPS.SOURCE_CONFIG]: 'Configure Source',
  [WIZARD_STEPS.SCHEMA_CONFIG]: 'Define Schema',
  [WIZARD_STEPS.PERMISSIONS]: 'Set Permissions',
  [WIZARD_STEPS.REVIEW]: 'Review & Create',
};

/**
 * Step descriptions for the wizard
 */
export const STEP_DESCRIPTIONS = {
  [WIZARD_STEPS.BASIC_INFO]: 'Provide basic information about your dataset',
  [WIZARD_STEPS.SOURCE_SELECTION]: 'Select the type of data source for your dataset',
  [WIZARD_STEPS.SOURCE_CONFIG]: 'Configure connection details for your data source',
  [WIZARD_STEPS.SCHEMA_CONFIG]: 'Define or discover the schema for your dataset',
  [WIZARD_STEPS.PERMISSIONS]: 'Set access permissions for your dataset',
  [WIZARD_STEPS.REVIEW]: 'Review your dataset configuration before creation',
};

/**
 * Determines the next step based on the current step and form data
 * @param {string} currentStep - The current step ID
 * @param {Object} formData - The current form data
 * @returns {string} The next step ID
 */
export const getNextStep = (currentStep, formData) => {
  switch (currentStep) {
    case WIZARD_STEPS.BASIC_INFO:
      return WIZARD_STEPS.SOURCE_SELECTION;
    case WIZARD_STEPS.SOURCE_SELECTION:
      return WIZARD_STEPS.SOURCE_CONFIG;
    case WIZARD_STEPS.SOURCE_CONFIG:
      return WIZARD_STEPS.SCHEMA_CONFIG;
    case WIZARD_STEPS.SCHEMA_CONFIG:
      return WIZARD_STEPS.PERMISSIONS;
    case WIZARD_STEPS.PERMISSIONS:
      return WIZARD_STEPS.REVIEW;
    case WIZARD_STEPS.REVIEW:
      return null; // End of wizard
    default:
      return WIZARD_STEPS.BASIC_INFO;
  }
};

/**
 * Determines the previous step based on the current step and form data
 * @param {string} currentStep - The current step ID
 * @param {Object} formData - The current form data
 * @returns {string} The previous step ID
 */
export const getPreviousStep = (currentStep, formData) => {
  switch (currentStep) {
    case WIZARD_STEPS.SOURCE_SELECTION:
      return WIZARD_STEPS.BASIC_INFO;
    case WIZARD_STEPS.SOURCE_CONFIG:
      return WIZARD_STEPS.SOURCE_SELECTION;
    case WIZARD_STEPS.SCHEMA_CONFIG:
      return WIZARD_STEPS.SOURCE_CONFIG;
    case WIZARD_STEPS.PERMISSIONS:
      return WIZARD_STEPS.SCHEMA_CONFIG;
    case WIZARD_STEPS.REVIEW:
      return WIZARD_STEPS.PERMISSIONS;
    case WIZARD_STEPS.BASIC_INFO:
    default:
      return null; // Beginning of wizard
  }
};

/**
 * Checks if the current step can be skipped based on form data
 * @param {string} step - The step ID to check
 * @param {Object} formData - The current form data
 * @returns {boolean} Whether the step can be skipped
 */
export const canSkipStep = (step, formData) => {
  // Currently no steps can be skipped in the dataset creation wizard
  return false;
};

/**
 * Basic information validation schema
 */
export const basicInfoSchema = Yup.object().shape({
  name: Yup.string()
    .required('Dataset name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .matches(/^[a-zA-Z0-9_\- ]+$/, 'Name can only contain letters, numbers, spaces, underscores, and hyphens'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  tags: Yup.array()
    .of(Yup.string().required())
    .min(1, 'At least one tag is required'),
  type: Yup.string()
    .oneOf(Object.values(DATASET_TYPES), 'Invalid dataset type')
    .required('Dataset type is required'),
});

/**
 * Source selection validation schema
 */
export const sourceSelectionSchema = Yup.object().shape({
  sourceType: Yup.string()
    .oneOf(Object.values(DATASET_SOURCE_TYPES), 'Invalid source type')
    .required('Source type is required'),
});

/**
 * Source configuration validation schema
 */
export const sourceConfigSchema = Yup.object().shape({
  // Base validation that applies to all source types
  config: Yup.object().required('Configuration is required'),
  // Specific validation will be added dynamically based on the selected source type
}).test('source-config-validation', null, function (value) {
  // Use the test context to access the full schema value
  const { sourceType } = this.parent;
  
  // Source-specific validation based on sourceType
  switch (sourceType) {
    case DATASET_SOURCE_TYPES.S3:
      return Yup.object().shape({
        config: Yup.object().shape({
          bucket: Yup.string().required('S3 bucket name is required'),
          region: Yup.string().required('AWS region is required'),
          path: Yup.string().required('S3 path is required'),
          accessKeyId: Yup.string().when('useIAMRole', {
            is: false,
            then: Yup.string().required('Access key ID is required when not using IAM role'),
          }),
          secretAccessKey: Yup.string().when('useIAMRole', {
            is: false,
            then: Yup.string().required('Secret access key is required when not using IAM role'),
          }),
          useIAMRole: Yup.boolean(),
        }),
      }).validate(value);
      
    case DATASET_SOURCE_TYPES.AZURE_BLOB:
      return Yup.object().shape({
        config: Yup.object().shape({
          storageAccount: Yup.string().required('Storage account is required'),
          containerName: Yup.string().required('Container name is required'),
          blobPath: Yup.string().required('Blob path is required'),
          connectionString: Yup.string().when('useManagedIdentity', {
            is: false,
            then: Yup.string().required('Connection string is required when not using managed identity'),
          }),
          useManagedIdentity: Yup.boolean(),
        }),
      }).validate(value);
      
    case DATASET_SOURCE_TYPES.SHAREPOINT:
      return Yup.object().shape({
        config: Yup.object().shape({
          siteUrl: Yup.string().required('SharePoint site URL is required').url('Must be a valid URL'),
          libraryName: Yup.string().required('Document library name is required'),
          folderPath: Yup.string(),
          tenantId: Yup.string().required('Tenant ID is required'),
          clientId: Yup.string().required('Client ID is required'),
          clientSecret: Yup.string().required('Client secret is required'),
        }),
      }).validate(value);
      
    case DATASET_SOURCE_TYPES.LOCAL_FILE:
      return Yup.object().shape({
        config: Yup.object().shape({
          filePath: Yup.string().required('File path is required'),
        }),
      }).validate(value);
      
    case DATASET_SOURCE_TYPES.API:
      return Yup.object().shape({
        config: Yup.object().shape({
          url: Yup.string().required('API URL is required').url('Must be a valid URL'),
          method: Yup.string().required('HTTP method is required').oneOf(['GET', 'POST', 'PUT', 'DELETE']),
          headers: Yup.array().of(
            Yup.object().shape({
              key: Yup.string().required('Header key is required'),
              value: Yup.string().required('Header value is required'),
            })
          ),
          queryParams: Yup.array().of(
            Yup.object().shape({
              key: Yup.string().required('Parameter key is required'),
              value: Yup.string().required('Parameter value is required'),
            })
          ),
          body: Yup.string(),
          authentication: Yup.object().shape({
            type: Yup.string().oneOf(['None', 'Basic', 'Bearer', 'OAuth2']),
            username: Yup.string().when('type', {
              is: 'Basic',
              then: Yup.string().required('Username is required for Basic authentication'),
            }),
            password: Yup.string().when('type', {
              is: 'Basic',
              then: Yup.string().required('Password is required for Basic authentication'),
            }),
            token: Yup.string().when('type', {
              is: 'Bearer',
              then: Yup.string().required('Token is required for Bearer authentication'),
            }),
            clientId: Yup.string().when('type', {
              is: 'OAuth2',
              then: Yup.string().required('Client ID is required for OAuth2 authentication'),
            }),
            clientSecret: Yup.string().when('type', {
              is: 'OAuth2',
              then: Yup.string().required('Client secret is required for OAuth2 authentication'),
            }),
            tokenUrl: Yup.string().when('type', {
              is: 'OAuth2',
              then: Yup.string().required('Token URL is required for OAuth2 authentication').url('Must be a valid URL'),
            }),
          }),
        }),
      }).validate(value);
      
    case DATASET_SOURCE_TYPES.DATABASE:
      return Yup.object().shape({
        config: Yup.object().shape({
          databaseType: Yup.string().required('Database type is required').oneOf(['MySQL', 'PostgreSQL', 'SQLServer', 'Oracle', 'MongoDB']),
          connectionString: Yup.string().required('Connection string is required'),
          query: Yup.string().required('Query is required'),
          username: Yup.string().required('Username is required'),
          password: Yup.string().required('Password is required'),
        }),
      }).validate(value);
      
    case DATASET_SOURCE_TYPES.WEBHOOK:
      return Yup.object().shape({
        config: Yup.object().shape({
          webhookUrl: Yup.string().required('Webhook URL is required'),
          secret: Yup.string().required('Webhook secret is required'),
          payloadFormat: Yup.string().required('Payload format is required').oneOf(['JSON', 'XML', 'Form']),
        }),
      }).validate(value);
      
    default:
      return true; // No source-specific validation if sourceType is not recognized
  }
});

/**
 * Schema configuration validation schema
 */
export const schemaConfigSchema = Yup.object().shape({
  schemaDefinitionMethod: Yup.string()
    .required('Schema definition method is required')
    .oneOf(['auto', 'manual', 'upload'], 'Invalid schema definition method'),
  schema: Yup.mixed().when('schemaDefinitionMethod', {
    is: 'manual',
    then: Yup.array().of(
      Yup.object().shape({
        name: Yup.string().required('Field name is required'),
        type: Yup.string().required('Field type is required').oneOf(Object.values(FIELD_TYPES)),
        description: Yup.string(),
        required: Yup.boolean(),
        defaultValue: Yup.mixed(),
        constraints: Yup.object(),
      })
    ).min(1, 'At least one field must be defined'),
  }),
  sampleData: Yup.string().when('schemaDefinitionMethod', {
    is: 'auto',
    then: Yup.string().required('Sample data is required for automatic schema discovery'),
  }),
  schemaFile: Yup.mixed().when('schemaDefinitionMethod', {
    is: 'upload',
    then: Yup.mixed().required('Schema file is required when uploading schema'),
  }),
});

/**
 * Permissions validation schema
 */
export const permissionsSchema = Yup.object().shape({
  accessLevel: Yup.string()
    .required('Access level is required')
    .oneOf(['private', 'public', 'shared'], 'Invalid access level'),
  sharedWith: Yup.array().when('accessLevel', {
    is: 'shared',
    then: Yup.array().of(
      Yup.object().shape({
        userId: Yup.string().required('User ID is required'),
        permission: Yup.string().required('Permission is required').oneOf(['read', 'write', 'admin']),
      })
    ).min(1, 'At least one user must be specified when sharing'),
  }),
});

/**
 * Review validation schema (validates all previous steps combined)
 */
export const reviewSchema = Yup.object().shape({
  // This is a combination of all previous schemas
  ...basicInfoSchema.fields,
  ...sourceSelectionSchema.fields,
  // Source config is dynamic based on source type, so we can't include it here
  // Other schemas will be conditionally applied based on the form data
});

/**
 * Get the validation schema for a specific step
 * @param {string} step - The step ID
 * @returns {Object} Yup validation schema for the step
 */
export const getValidationSchemaForStep = (step) => {
  switch (step) {
    case WIZARD_STEPS.BASIC_INFO:
      return basicInfoSchema;
    case WIZARD_STEPS.SOURCE_SELECTION:
      return sourceSelectionSchema;
    case WIZARD_STEPS.SOURCE_CONFIG:
      return sourceConfigSchema;
    case WIZARD_STEPS.SCHEMA_CONFIG:
      return schemaConfigSchema;
    case WIZARD_STEPS.PERMISSIONS:
      return permissionsSchema;
    case WIZARD_STEPS.REVIEW:
      return reviewSchema;
    default:
      return Yup.object(); // Empty schema for unknown steps
  }
};

/**
 * Check if a source type supports a particular dataset type
 * @param {string} sourceType - The source type
 * @param {string} datasetType - The dataset type
 * @returns {boolean} Whether the source type supports the dataset type
 */
export const isDatasetTypeSupported = (sourceType, datasetType) => {
  // Define compatibility between source types and dataset types
  const compatibility = {
    [DATASET_SOURCE_TYPES.S3]: [
      DATASET_TYPES.CSV, 
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML, 
      DATASET_TYPES.PARQUET, 
      DATASET_TYPES.EXCEL,
      DATASET_TYPES.AVRO,
      DATASET_TYPES.TEXT
    ],
    [DATASET_SOURCE_TYPES.AZURE_BLOB]: [
      DATASET_TYPES.CSV, 
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML, 
      DATASET_TYPES.PARQUET, 
      DATASET_TYPES.EXCEL,
      DATASET_TYPES.AVRO,
      DATASET_TYPES.TEXT
    ],
    [DATASET_SOURCE_TYPES.SHAREPOINT]: [
      DATASET_TYPES.CSV, 
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML, 
      DATASET_TYPES.EXCEL,
      DATASET_TYPES.TEXT
    ],
    [DATASET_SOURCE_TYPES.LOCAL_FILE]: [
      DATASET_TYPES.CSV, 
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML, 
      DATASET_TYPES.PARQUET, 
      DATASET_TYPES.EXCEL,
      DATASET_TYPES.AVRO,
      DATASET_TYPES.TEXT
    ],
    [DATASET_SOURCE_TYPES.API]: [
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML
    ],
    [DATASET_SOURCE_TYPES.DATABASE]: [
      DATASET_TYPES.JSON, 
      DATASET_TYPES.CSV
    ],
    [DATASET_SOURCE_TYPES.WEBHOOK]: [
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML
    ],
  };
  
  return compatibility[sourceType]?.includes(datasetType) || false;
};

/**
 * Get a list of supported dataset types for a given source type
 * @param {string} sourceType - The source type
 * @returns {Array} Array of supported dataset types
 */
export const getSupportedDatasetTypes = (sourceType) => {
  // Define compatibility between source types and dataset types
  const compatibility = {
    [DATASET_SOURCE_TYPES.S3]: [
      DATASET_TYPES.CSV, 
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML, 
      DATASET_TYPES.PARQUET, 
      DATASET_TYPES.EXCEL,
      DATASET_TYPES.AVRO,
      DATASET_TYPES.TEXT
    ],
    [DATASET_SOURCE_TYPES.AZURE_BLOB]: [
      DATASET_TYPES.CSV, 
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML, 
      DATASET_TYPES.PARQUET, 
      DATASET_TYPES.EXCEL,
      DATASET_TYPES.AVRO,
      DATASET_TYPES.TEXT
    ],
    [DATASET_SOURCE_TYPES.SHAREPOINT]: [
      DATASET_TYPES.CSV, 
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML, 
      DATASET_TYPES.EXCEL,
      DATASET_TYPES.TEXT
    ],
    [DATASET_SOURCE_TYPES.LOCAL_FILE]: [
      DATASET_TYPES.CSV, 
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML, 
      DATASET_TYPES.PARQUET, 
      DATASET_TYPES.EXCEL,
      DATASET_TYPES.AVRO,
      DATASET_TYPES.TEXT
    ],
    [DATASET_SOURCE_TYPES.API]: [
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML
    ],
    [DATASET_SOURCE_TYPES.DATABASE]: [
      DATASET_TYPES.JSON, 
      DATASET_TYPES.CSV
    ],
    [DATASET_SOURCE_TYPES.WEBHOOK]: [
      DATASET_TYPES.JSON, 
      DATASET_TYPES.XML
    ],
  };
  
  return compatibility[sourceType] || [];
};

/**
 * Get a list of data sources with display information
 * @returns {Array} Array of data source objects with id, name, description, and icon
 */
export const getDataSourceOptions = () => {
  return [
    {
      id: DATASET_SOURCE_TYPES.S3,
      name: 'Amazon S3',
      description: 'Connect to Amazon S3 bucket for scalable cloud storage',
      icon: 's3Icon',
      category: 'Cloud Storage'
    },
    {
      id: DATASET_SOURCE_TYPES.AZURE_BLOB,
      name: 'Azure Blob Storage',
      description: 'Connect to Microsoft Azure Blob Storage for cloud-based object storage',
      icon: 'azureBlobIcon',
      category: 'Cloud Storage'
    },
    {
      id: DATASET_SOURCE_TYPES.SHAREPOINT,
      name: 'SharePoint',
      description: 'Connect to Microsoft SharePoint for document management and collaboration',
      icon: 'sharepointIcon',
      category: 'Document Management'
    },
    {
      id: DATASET_SOURCE_TYPES.LOCAL_FILE,
      name: 'Local File',
      description: 'Upload file from your local system',
      icon: 'fileIcon',
      category: 'File Upload'
    },
    {
      id: DATASET_SOURCE_TYPES.API,
      name: 'API',
      description: 'Connect to external API endpoints for data retrieval',
      icon: 'apiIcon',
      category: 'Web Services'
    },
    {
      id: DATASET_SOURCE_TYPES.DATABASE,
      name: 'Database',
      description: 'Connect to SQL or NoSQL databases',
      icon: 'databaseIcon',
      category: 'Databases'
    },
    {
      id: DATASET_SOURCE_TYPES.WEBHOOK,
      name: 'Webhook',
      description: 'Set up webhooks to receive data from external systems',
      icon: 'webhookIcon',
      category: 'Web Services'
    },
  ];
};

/**
 * Get a list of dataset types with display information
 * @returns {Array} Array of dataset type objects with id, name, description, and icon
 */
export const getDatasetTypeOptions = () => {
  return [
    {
      id: DATASET_TYPES.CSV,
      name: 'CSV',
      description: 'Comma-separated values format for tabular data',
      icon: 'csvIcon',
      mimeTypes: ['text/csv', 'text/plain'],
      fileExtensions: ['.csv']
    },
    {
      id: DATASET_TYPES.JSON,
      name: 'JSON',
      description: 'JavaScript Object Notation format for structured data',
      icon: 'jsonIcon',
      mimeTypes: ['application/json'],
      fileExtensions: ['.json']
    },
    {
      id: DATASET_TYPES.XML,
      name: 'XML',
      description: 'Extensible Markup Language format for hierarchical data',
      icon: 'xmlIcon',
      mimeTypes: ['application/xml', 'text/xml'],
      fileExtensions: ['.xml']
    },
    {
      id: DATASET_TYPES.PARQUET,
      name: 'Parquet',
      description: 'Columnar storage format optimized for analytics',
      icon: 'parquetIcon',
      mimeTypes: ['application/vnd.apache.parquet'],
      fileExtensions: ['.parquet']
    },
    {
      id: DATASET_TYPES.EXCEL,
      name: 'Excel',
      description: 'Microsoft Excel spreadsheet format',
      icon: 'excelIcon',
      mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      fileExtensions: ['.xls', '.xlsx']
    },
    {
      id: DATASET_TYPES.AVRO,
      name: 'Avro',
      description: 'Apache Avro data serialization format',
      icon: 'avroIcon',
      mimeTypes: ['application/avro'],
      fileExtensions: ['.avro']
    },
    {
      id: DATASET_TYPES.TEXT,
      name: 'Text',
      description: 'Plain text format with custom parsing',
      icon: 'textIcon',
      mimeTypes: ['text/plain'],
      fileExtensions: ['.txt', '.text']
    },
    {
      id: DATASET_TYPES.CUSTOM,
      name: 'Custom',
      description: 'Custom data format with user-defined schema',
      icon: 'customIcon',
      mimeTypes: [],
      fileExtensions: []
    },
  ];
};

/**
 * Get a list of field types with display information
 * @returns {Array} Array of field type objects with id, name, description, and icon
 */
export const getFieldTypeOptions = () => {
  return [
    {
      id: FIELD_TYPES.STRING,
      name: 'String',
      description: 'Text data',
      icon: 'stringIcon',
    },
    {
      id: FIELD_TYPES.NUMBER,
      name: 'Number',
      description: 'Numeric data (floating-point)',
      icon: 'numberIcon',
    },
    {
      id: FIELD_TYPES.INTEGER,
      name: 'Integer',
      description: 'Whole number data',
      icon: 'integerIcon',
    },
    {
      id: FIELD_TYPES.BOOLEAN,
      name: 'Boolean',
      description: 'True/false value',
      icon: 'booleanIcon',
    },
    {
      id: FIELD_TYPES.DATE,
      name: 'Date',
      description: 'Date without time',
      icon: 'dateIcon',
    },
    {
      id: FIELD_TYPES.DATETIME,
      name: 'Date & Time',
      description: 'Date with time',
      icon: 'datetimeIcon',
    },
    {
      id: FIELD_TYPES.TIMESTAMP,
      name: 'Timestamp',
      description: 'Point in time (Unix timestamp)',
      icon: 'timestampIcon',
    },
    {
      id: FIELD_TYPES.OBJECT,
      name: 'Object',
      description: 'Nested structure with properties',
      icon: 'objectIcon',
    },
    {
      id: FIELD_TYPES.ARRAY,
      name: 'Array',
      description: 'List of values',
      icon: 'arrayIcon',
    },
    {
      id: FIELD_TYPES.ENUM,
      name: 'Enum',
      description: 'Value from a predefined set',
      icon: 'enumIcon',
    },
    {
      id: FIELD_TYPES.EMAIL,
      name: 'Email',
      description: 'Email address',
      icon: 'emailIcon',
    },
    {
      id: FIELD_TYPES.URI,
      name: 'URI',
      description: 'Web URL or URI',
      icon: 'uriIcon',
    },
    {
      id: FIELD_TYPES.UUID,
      name: 'UUID',
      description: 'Universally unique identifier',
      icon: 'uuidIcon',
    },
    {
      id: FIELD_TYPES.BINARY,
      name: 'Binary',
      description: 'Binary data',
      icon: 'binaryIcon',
    },
  ];
};

/**
 * Get the appropriate source configuration component based on source type
 * @param {string} sourceType - The source type
 * @returns {string} The component name to use for the source configuration
 */
export const getSourceConfigComponent = (sourceType) => {
  const componentMap = {
    [DATASET_SOURCE_TYPES.S3]: 'S3ConfigurationForm',
    [DATASET_SOURCE_TYPES.AZURE_BLOB]: 'AzureBlobConfigurationForm',
    [DATASET_SOURCE_TYPES.SHAREPOINT]: 'SharePointConfigurationForm',
    [DATASET_SOURCE_TYPES.LOCAL_FILE]: 'LocalFileConfigurationForm',
    [DATASET_SOURCE_TYPES.API]: 'ApiConfigurationForm',
    [DATASET_SOURCE_TYPES.DATABASE]: 'DatabaseConfigurationForm',
    [DATASET_SOURCE_TYPES.WEBHOOK]: 'WebhookConfigurationForm',
  };
  
  return componentMap[sourceType] || 'GenericConfigurationForm';
};

/**
 * Get initial values for the wizard form
 * @returns {Object} The initial form values
 */
export const getInitialValues = () => {
  return {
    // Basic info
    name: '',
    description: '',
    tags: [],
    type: DATASET_TYPES.CSV,
    
    // Source selection
    sourceType: '',
    
    // Source config (will be populated based on selected source type)
    config: {},
    
    // Schema config
    schemaDefinitionMethod: 'auto',
    schema: [],
    sampleData: '',
    schemaFile: null,
    
    // Permissions
    accessLevel: 'private',
    sharedWith: [],
  };
};

/**
 * Transform wizard form data to dataset model
 * @param {Object} formData - The wizard form data
 * @returns {Object} The dataset model object
 */
export const transformToDatasetModel = (formData) => {
  return {
    id: formData.id || crypto.randomUUID(), // Generate a new ID if not provided
    name: formData.name,
    description: formData.description,
    tags: formData.tags,
    type: formData.type,
    sourceType: formData.sourceType,
    sourceConfig: formData.config,
    schema: formData.schema,
    accessLevel: formData.accessLevel,
    sharedWith: formData.sharedWith,
    createdAt: formData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active',
  };
};

/**
 * Transform dataset model to wizard form data
 * @param {Object} dataset - The dataset model object
 * @returns {Object} The wizard form data
 */
export const transformToFormData = (dataset) => {
  return {
    id: dataset.id,
    name: dataset.name,
    description: dataset.description,
    tags: dataset.tags,
    type: dataset.type,
    sourceType: dataset.sourceType,
    config: dataset.sourceConfig,
    schemaDefinitionMethod: 'manual', // Assume manual when editing existing
    schema: dataset.schema,
    sampleData: '',
    schemaFile: null,
    accessLevel: dataset.accessLevel,
    sharedWith: dataset.sharedWith,
    createdAt: dataset.createdAt,
    updatedAt: dataset.updatedAt,
  };
};

export default {
  DATASET_SOURCE_TYPES,
  DATASET_TYPES,
  FIELD_TYPES,
  WIZARD_STEPS,
  STEP_INDICES,
  STEP_LABELS,
  STEP_DESCRIPTIONS,
  getNextStep,
  getPreviousStep,
  canSkipStep,
  getValidationSchemaForStep,
  isDatasetTypeSupported,
  getSupportedDatasetTypes,
  getDataSourceOptions,
  getDatasetTypeOptions,
  getFieldTypeOptions,
  getSourceConfigComponent,
  getInitialValues,
  transformToDatasetModel,
  transformToFormData,
};