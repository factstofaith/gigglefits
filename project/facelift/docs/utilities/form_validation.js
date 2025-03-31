import * as Yup from 'yup';

/**
 * Validation schema for application forms
 * Provides comprehensive validation rules for application creation and editing
 */
export const applicationValidationSchema = Yup.object().shape({
  // Basic information
  name: Yup.string()
    .required('Application name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(
      /^[a-zA-Z0-9_ -]+$/,
      'Name can only contain letters, numbers, spaces, underscores, and hyphens'
    ),
    
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
    
  type: Yup.string()
    .required('Application type is required'),
    
  tags: Yup.array()
    .of(Yup.string().max(30, 'Tag must be less than 30 characters'))
    .max(10, 'Maximum 10 tags allowed'),
    
  // Configuration
  config: Yup.object().shape({
    autoPublish: Yup.boolean(),
    
    requireApproval: Yup.boolean(),
    
    executionMode: Yup.string()
      .required('Execution mode is required')
      .oneOf(
        ['sequential', 'parallel', 'event_driven'],
        'Invalid execution mode'
      ),
      
    maxConcurrentRuns: Yup.number()
      .when('executionMode', {
        is: 'parallel',
        then: Yup.number()
          .required('Required for parallel execution')
          .min(1, 'Must be at least 1')
          .max(20, 'Must be at most 20')
          .integer('Must be a whole number'),
        otherwise: Yup.number().nullable(),
      }),
      
    timeout: Yup.number()
      .min(0, 'Timeout cannot be negative')
      .max(86400, 'Timeout cannot exceed 24 hours (86400 seconds)')
      .nullable()
      .transform((value) => (isNaN(value) ? null : value)),
      
    retryCount: Yup.number()
      .min(0, 'Retry count cannot be negative')
      .max(10, 'Retry count cannot exceed 10')
      .nullable()
      .transform((value) => (isNaN(value) ? null : value)),
      
    retryDelay: Yup.number()
      .min(0, 'Retry delay cannot be negative')
      .max(3600, 'Retry delay cannot exceed 1 hour (3600 seconds)')
      .nullable()
      .transform((value) => (isNaN(value) ? null : value)),
  }),
  
  // Permissions
  permissions: Yup.object().shape({
    visibleToAllUsers: Yup.boolean(),
    
    specificRoles: Yup.array()
      .when('visibleToAllUsers', {
        is: false,
        then: Yup.array()
          .min(1, 'At least one role must be selected')
          .required('Required when not visible to all users'),
        otherwise: Yup.array().nullable(),
      }),
      
    viewOnly: Yup.boolean(),
    
    requireExplicitGrant: Yup.boolean(),
  }),
  
  // Schedule settings
  schedule: Yup.object().shape({
    enabled: Yup.boolean(),
    
    cronExpression: Yup.string()
      .when('enabled', {
        is: true,
        then: Yup.string()
          .required('CRON expression is required when scheduling is enabled')
          .matches(
            /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
            'Invalid CRON expression format'
          ),
        otherwise: Yup.string().nullable(),
      }),
      
    timezone: Yup.string()
      .when('enabled', {
        is: true,
        then: Yup.string().required('Timezone is required when scheduling is enabled'),
        otherwise: Yup.string().nullable(),
      }),
  }),
  
  // Advanced settings
  advanced: Yup.object().shape({
    logLevel: Yup.string()
      .oneOf(['debug', 'info', 'warning', 'error'], 'Invalid log level'),
      
    notificationEmails: Yup.array()
      .of(Yup.string().email('Invalid email format')),
      
    customHeaders: Yup.array()
      .of(
        Yup.object().shape({
          key: Yup.string().required('Header key is required'),
          value: Yup.string().required('Header value is required'),
        })
      ),
  }),
});

/**
 * Validation schema for dataset forms
 * Provides comprehensive validation rules for dataset creation and editing
 */
export const datasetValidationSchema = Yup.object().shape({
  // Basic information
  name: Yup.string()
    .required('Dataset name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(
      /^[a-zA-Z0-9_ -]+$/,
      'Name can only contain letters, numbers, spaces, underscores, and hyphens'
    ),
    
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters'),
    
  type: Yup.string()
    .required('Dataset type is required'),
    
  applicationId: Yup.string()
    .nullable(),
    
  tags: Yup.array()
    .of(Yup.string().max(30, 'Tag must be less than 30 characters'))
    .max(10, 'Maximum 10 tags allowed'),
    
  // Configuration
  config: Yup.object().shape({
    // Source configuration
    source: Yup.object().shape({
      type: Yup.string()
        .required('Source type is required'),
        
      connectionId: Yup.string()
        .when('type', {
          is: (val) => ['s3', 'azureblob', 'database', 'api'].includes(val),
          then: Yup.string().required('Connection is required for this source type'),
          otherwise: Yup.string().nullable(),
        }),
        
      path: Yup.string()
        .when('type', {
          is: (val) => ['s3', 'azureblob', 'filesystem'].includes(val),
          then: Yup.string().required('Path is required for this source type'),
          otherwise: Yup.string().nullable(),
        }),
        
      query: Yup.string()
        .when('type', {
          is: 'database',
          then: Yup.string().required('Query is required for database sources'),
          otherwise: Yup.string().nullable(),
        }),
        
      endpoint: Yup.string()
        .when('type', {
          is: 'api',
          then: Yup.string()
            .required('Endpoint is required for API sources')
            .url('Must be a valid URL'),
          otherwise: Yup.string().nullable(),
        }),
    }),
    
    // Schema configuration
    schema: Yup.object().shape({
      autoDetect: Yup.boolean(),
      
      fields: Yup.array()
        .when('autoDetect', {
          is: false,
          then: Yup.array()
            .of(
              Yup.object().shape({
                name: Yup.string().required('Field name is required'),
                type: Yup.string().required('Field type is required'),
                required: Yup.boolean(),
                defaultValue: Yup.mixed(),
                description: Yup.string(),
              })
            )
            .min(1, 'At least one field must be defined when not using auto-detection'),
          otherwise: Yup.array().nullable(),
        }),
    }),
  }),
  
  // Permissions
  permissions: Yup.object().shape({
    visibleToAllUsers: Yup.boolean(),
    
    specificRoles: Yup.array()
      .when('visibleToAllUsers', {
        is: false,
        then: Yup.array()
          .min(1, 'At least one role must be selected')
          .required('Required when not visible to all users'),
        otherwise: Yup.array().nullable(),
      }),
      
    readOnly: Yup.boolean(),
  }),
});

/**
 * Generates initial values for application forms
 * @returns {Object} Initial form values
 */
export const getApplicationInitialValues = () => ({
  name: '',
  description: '',
  type: '',
  tags: [],
  config: {
    autoPublish: false,
    requireApproval: true,
    executionMode: 'sequential',
    maxConcurrentRuns: 1,
    timeout: null,
    retryCount: 0,
    retryDelay: 0,
  },
  permissions: {
    visibleToAllUsers: true,
    specificRoles: [],
    viewOnly: false,
    requireExplicitGrant: false,
  },
  schedule: {
    enabled: false,
    cronExpression: '',
    timezone: 'UTC',
  },
  advanced: {
    logLevel: 'info',
    notificationEmails: [],
    customHeaders: [],
  },
});

/**
 * Generates initial values for dataset forms
 * @returns {Object} Initial form values
 */
export const getDatasetInitialValues = () => ({
  name: '',
  description: '',
  type: '',
  applicationId: null,
  tags: [],
  config: {
    source: {
      type: '',
      connectionId: null,
      path: '',
      query: '',
      endpoint: '',
    },
    schema: {
      autoDetect: true,
      fields: [],
    },
  },
  permissions: {
    visibleToAllUsers: true,
    specificRoles: [],
    readOnly: false,
  },
});

/**
 * Helper function to check if a field has an error
 * @param {Object} formik - Formik instance
 * @param {string} fieldName - Name of the field to check
 * @returns {boolean} True if field has an error and has been touched
 */
export const hasFieldError = (formik, fieldName) => {
  const fieldError = getNestedFieldError(formik.errors, fieldName);
  const fieldTouched = getNestedFieldTouched(formik.touched, fieldName);
  return Boolean(fieldError && fieldTouched);
};

/**
 * Helper function to get an error message for a field
 * @param {Object} formik - Formik instance
 * @param {string} fieldName - Name of the field to check
 * @returns {string|null} Error message or null if no error
 */
export const getFieldErrorMessage = (formik, fieldName) => {
  if (hasFieldError(formik, fieldName)) {
    return getNestedFieldError(formik.errors, fieldName);
  }
  return null;
};

/**
 * Helper function to get error from nested field
 * @param {Object} errors - Formik errors object
 * @param {string} field - Dot-notation field path (e.g., "config.source.type")
 * @returns {string|undefined} Error message or undefined
 */
export const getNestedFieldError = (errors, field) => {
  const fieldPath = field.split('.');
  let current = errors;
  
  for (const path of fieldPath) {
    if (!current || !current[path]) return undefined;
    current = current[path];
  }
  
  return current;
};

/**
 * Helper function to check if nested field is touched
 * @param {Object} touched - Formik touched object
 * @param {string} field - Dot-notation field path (e.g., "config.source.type")
 * @returns {boolean} True if field has been touched
 */
export const getNestedFieldTouched = (touched, field) => {
  const fieldPath = field.split('.');
  let current = touched;
  
  for (const path of fieldPath) {
    if (!current || !current[path]) return false;
    current = current[path];
  }
  
  return current;
};

/**
 * Helper function to touch a nested field
 * @param {Object} formik - Formik instance
 * @param {string} field - Dot-notation field path (e.g., "config.source.type")
 */
export const touchNestedField = (formik, field) => {
  const fieldPath = field.split('.');
  
  if (fieldPath.length === 1) {
    formik.setFieldTouched(field, true);
  } else {
    // Handle nested fields
    let touchedObj = { ...formik.touched };
    let current = touchedObj;
    
    for (let i = 0; i < fieldPath.length - 1; i++) {
      const key = fieldPath[i];
      if (!current[key]) current[key] = {};
      current = current[key];
    }
    
    current[fieldPath[fieldPath.length - 1]] = true;
    formik.setTouched(touchedObj);
  }
};

/**
 * Helper function to validate specific fields
 * @param {Object} formik - Formik instance
 * @param {Array} fields - Array of field names to validate
 * @returns {Promise<boolean>} Promise resolving to true if all fields are valid
 */
export const validateFields = async (formik, fields) => {
  try {
    await formik.validateForm();
    
    // Check if any of the specified fields have errors
    const hasErrors = fields.some(field => hasFieldError(formik, field));
    
    // If fields haven't been touched, touch them to show validation errors
    fields.forEach(field => touchNestedField(formik, field));
    
    return !hasErrors;
  } catch (error) {
    return false;
  }
};

export default {
  applicationValidationSchema,
  datasetValidationSchema,
  getApplicationInitialValues,
  getDatasetInitialValues,
  hasFieldError,
  getFieldErrorMessage,
  getNestedFieldError,
  getNestedFieldTouched,
  touchNestedField,
  validateFields,
};