/**
 * Schema Inference Utility
 * 
 * Analyzes datasets and automatically infers schema structure with 
 * sophisticated data type detection. Provides confidence scoring 
 * for type inference and detailed field metadata.
 */

/**
 * Standard data types recognized by the schema inference
 * @type {Object}
 */
export const DATA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  TIME: 'time',
  ARRAY: 'array',
  OBJECT: 'object',
  NULL: 'null',
  UNKNOWN: 'unknown',
  EMAIL: 'email',
  URL: 'url',
  CURRENCY: 'currency',
  PERCENTAGE: 'percentage',
  IP_ADDRESS: 'ip_address',
  PHONE_NUMBER: 'phone_number',
  POSTAL_CODE: 'postal_code',
  ID: 'id'
};

/**
 * Confidence threshold for type inference
 * Values between 0 and 1
 * @type {Object}
 */
export const CONFIDENCE_THRESHOLD = {
  HIGH: 0.9,
  MEDIUM: 0.7,
  LOW: 0.5,
  MINIMUM: 0.3
};

/**
 * Regular expressions for pattern-based data type detection
 * @type {Object}
 */
const TYPE_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?:\/\/)?[\w.-]+(\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]+$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATE_US: /^\d{1,2}\/\d{1,2}\/\d{2,4}$/,
  DATE_EU: /^\d{1,2}\.\d{1,2}\.\d{2,4}$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
  DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T[0-9:.Z+-]+$/,
  CURRENCY: /^[$£€¥][ ]?[0-9,]+(\.[0-9]{2})?$/,
  PERCENTAGE: /^[0-9,.]+%$/,
  IP_ADDRESS: /^(\d{1,3}\.){3}\d{1,3}$/,
  PHONE_NUMBER: /^(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}$/,
  POSTAL_CODE: /^[A-Z0-9]{3,10}([ -][A-Z0-9]{3,10})?$/i,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  BOOLEAN_TEXT: /^(true|false|yes|no|y|n|1|0)$/i
};

/**
 * Infer schema from data array
 * 
 * @param {Array<Object>} data - Array of data objects
 * @param {Object} options - Configuration options
 * @param {number} options.sampleSize - Number of records to sample (default: all)
 * @param {number} options.confidenceThreshold - Minimum confidence threshold (default: 0.7)
 * @param {boolean} options.detectSpecialTypes - Whether to detect special types (default: true)
 * @param {boolean} options.includeStatistics - Whether to include field statistics (default: true)
 * @returns {Object} Inferred schema with field definitions
 */
export const inferSchema = (data, options = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { fields: [] };
  }

  const {
    sampleSize = data.length,
    confidenceThreshold = CONFIDENCE_THRESHOLD.MEDIUM,
    detectSpecialTypes = true,
    includeStatistics = true
  } = options;

  // Sample data if needed
  const sampleData = sampleSize < data.length 
    ? data.slice(0, sampleSize) 
    : data;

  // Get all unique field names across all records
  const fieldNames = new Set();
  sampleData.forEach(record => {
    Object.keys(record).forEach(key => {
      fieldNames.add(key);
    });
  });

  // Create schema for each field
  const fields = Array.from(fieldNames).map(fieldName => {
    // Extract all non-null values for this field
    const fieldValues = sampleData
      .map(record => record[fieldName])
      .filter(value => value !== null && value !== undefined);

    // Calculate field statistics
    const fieldStats = {
      count: sampleData.length,
      nonNullCount: fieldValues.length,
      nullPercentage: (1 - fieldValues.length / sampleData.length) * 100,
      uniqueCount: new Set(fieldValues.map(v => JSON.stringify(v))).size
    };

    // Determine cardinality type (high, medium, low)
    let cardinalityType = 'unknown';
    if (fieldStats.uniqueCount > 0) {
      const uniqueRatio = fieldStats.uniqueCount / fieldStats.nonNullCount;
      if (uniqueRatio > 0.9) {
        cardinalityType = 'high';
      } else if (uniqueRatio > 0.5) {
        cardinalityType = 'medium';
      } else {
        cardinalityType = 'low';
      }
    }

    // Detect types and confidence levels
    const typeResults = detectFieldType(fieldValues, detectSpecialTypes);
    
    // Find predominant type (highest confidence)
    const sortedTypes = Object.entries(typeResults)
      .sort((a, b) => b[1] - a[1]);
    
    const primaryType = sortedTypes.length > 0 ? sortedTypes[0][0] : DATA_TYPES.UNKNOWN;
    const confidence = sortedTypes.length > 0 ? sortedTypes[0][1] : 0;
    
    // Calculate additional field metrics specific to the detected type
    const typeSpecificStats = calculateTypeSpecificStats(fieldValues, primaryType);

    // Determine if this field might be a good candidate for a primary key
    const isPrimaryKeyCandidate = 
      fieldStats.uniqueCount === fieldStats.nonNullCount && 
      fieldStats.nonNullCount === fieldStats.count &&
      (primaryType === DATA_TYPES.ID || 
       cardinalityType === 'high' || 
       fieldName.toLowerCase().includes('id'));

    // Build field schema
    const fieldSchema = {
      name: fieldName,
      type: primaryType,
      confidence: confidence,
      required: fieldStats.nullPercentage === 0,
      nullable: fieldStats.nullPercentage > 0,
      cardinality: cardinalityType,
      isPrimaryKeyCandidate,
      alternativeTypes: sortedTypes
        .filter(([type, conf]) => type !== primaryType && conf >= confidenceThreshold)
        .map(([type, conf]) => ({ type, confidence: conf }))
    };

    // Include statistics if requested
    if (includeStatistics) {
      fieldSchema.statistics = {
        ...fieldStats,
        ...typeSpecificStats
      };
    }

    return fieldSchema;
  });

  return {
    fields,
    recordCount: data.length,
    sampledRecordCount: sampleData.length,
    generatedAt: new Date().toISOString(),
    hasCompleteSchema: fields.length > 0
  };
};

/**
 * Detect the type of a field based on its values
 * 
 * @param {Array<any>} values - Array of field values
 * @param {boolean} detectSpecialTypes - Whether to detect special types
 * @returns {Object} Map of type to confidence score (0-1)
 */
function detectFieldType(values, detectSpecialTypes) {
  if (!values || values.length === 0) {
    return { [DATA_TYPES.NULL]: 1 };
  }

  const typeDetectors = [
    // Basic types
    { type: DATA_TYPES.NULL, detector: isNull },
    { type: DATA_TYPES.BOOLEAN, detector: isBoolean },
    { type: DATA_TYPES.INTEGER, detector: isInteger },
    { type: DATA_TYPES.NUMBER, detector: isNumber },
    { type: DATA_TYPES.STRING, detector: isString },
    { type: DATA_TYPES.ARRAY, detector: isArray },
    { type: DATA_TYPES.OBJECT, detector: isObject }
  ];

  // Add special type detectors if enabled
  if (detectSpecialTypes) {
    typeDetectors.push(
      { type: DATA_TYPES.DATE, detector: isDate },
      { type: DATA_TYPES.DATETIME, detector: isDateTime },
      { type: DATA_TYPES.TIME, detector: isTime },
      { type: DATA_TYPES.EMAIL, detector: isEmail },
      { type: DATA_TYPES.URL, detector: isUrl },
      { type: DATA_TYPES.CURRENCY, detector: isCurrency },
      { type: DATA_TYPES.PERCENTAGE, detector: isPercentage },
      { type: DATA_TYPES.IP_ADDRESS, detector: isIpAddress },
      { type: DATA_TYPES.PHONE_NUMBER, detector: isPhoneNumber },
      { type: DATA_TYPES.POSTAL_CODE, detector: isPostalCode },
      { type: DATA_TYPES.ID, detector: isIdField }
    );
  }

  // Count occurrences of each type
  const typeCountMap = {};
  
  // Initialize all types with 0 count
  typeDetectors.forEach(({ type }) => {
    typeCountMap[type] = 0;
  });

  // Count type matches
  values.forEach(value => {
    typeDetectors.forEach(({ type, detector }) => {
      if (detector(value)) {
        typeCountMap[type]++;
      }
    });
  });

  // Convert counts to confidence scores
  const totalValues = values.length;
  const confidenceMap = {};
  
  Object.entries(typeCountMap).forEach(([type, count]) => {
    confidenceMap[type] = count / totalValues;
  });

  // Handle special case interactions between types
  
  // If we have high confidence for integer, zero out number to avoid redundancy
  if (confidenceMap[DATA_TYPES.INTEGER] > 0.9) {
    confidenceMap[DATA_TYPES.NUMBER] = 0;
  }
  
  // If we have special string types with high confidence, reduce generic string confidence
  const specialStringTypes = [
    DATA_TYPES.EMAIL, DATA_TYPES.URL, DATA_TYPES.DATE, DATA_TYPES.DATETIME, 
    DATA_TYPES.TIME, DATA_TYPES.CURRENCY, DATA_TYPES.PERCENTAGE, 
    DATA_TYPES.IP_ADDRESS, DATA_TYPES.PHONE_NUMBER, DATA_TYPES.POSTAL_CODE
  ];
  
  let highConfSpecialString = false;
  specialStringTypes.forEach(type => {
    if (confidenceMap[type] && confidenceMap[type] > 0.8) {
      highConfSpecialString = true;
    }
  });
  
  if (highConfSpecialString) {
    confidenceMap[DATA_TYPES.STRING] = Math.min(0.3, confidenceMap[DATA_TYPES.STRING] || 0);
  }

  return confidenceMap;
}

/**
 * Calculate additional statistics specific to the detected type
 * 
 * @param {Array<any>} values - Array of field values
 * @param {string} type - Detected field type
 * @returns {Object} Type-specific statistics
 */
function calculateTypeSpecificStats(values, type) {
  if (!values || values.length === 0) {
    return {};
  }

  const stats = {};

  switch (type) {
    case DATA_TYPES.NUMBER:
    case DATA_TYPES.INTEGER:
    case DATA_TYPES.CURRENCY:
    case DATA_TYPES.PERCENTAGE:
      // Filter non-numeric values and convert to numbers
      const numericValues = values
        .filter(val => typeof val === 'number' || 
          (typeof val === 'string' && !isNaN(parseFloat(val.replace(/[$%,]/g, ''))))
        )
        .map(val => typeof val === 'number' ? val : parseFloat(val.replace(/[$%,]/g, '')));
      
      if (numericValues.length > 0) {
        stats.min = Math.min(...numericValues);
        stats.max = Math.max(...numericValues);
        stats.sum = numericValues.reduce((sum, val) => sum + val, 0);
        stats.avg = stats.sum / numericValues.length;
        stats.median = calculateMedian(numericValues);
        stats.stdDev = calculateStdDev(numericValues, stats.avg);
      }
      break;

    case DATA_TYPES.STRING:
    case DATA_TYPES.EMAIL:
    case DATA_TYPES.URL:
      // Calculate string length statistics
      const stringLengths = values
        .filter(val => typeof val === 'string')
        .map(val => val.length);
      
      if (stringLengths.length > 0) {
        stats.minLength = Math.min(...stringLengths);
        stats.maxLength = Math.max(...stringLengths);
        stats.avgLength = stringLengths.reduce((sum, len) => sum + len, 0) / stringLengths.length;
      }
      break;

    case DATA_TYPES.DATE:
    case DATA_TYPES.DATETIME:
      // Calculate date range statistics
      try {
        const dates = values
          .filter(val => isDateLike(val))
          .map(val => new Date(val));
        
        if (dates.length > 0) {
          stats.minDate = new Date(Math.min(...dates)).toISOString();
          stats.maxDate = new Date(Math.max(...dates)).toISOString();
          stats.dateRange = Math.ceil((new Date(stats.maxDate) - new Date(stats.minDate)) / (1000 * 60 * 60 * 24));
        }
      } catch (e) {
        // Silently handle date parsing errors
      }
      break;

    case DATA_TYPES.ARRAY:
      // Calculate array length statistics
      const arrayLengths = values
        .filter(val => Array.isArray(val))
        .map(val => val.length);
      
      if (arrayLengths.length > 0) {
        stats.minItems = Math.min(...arrayLengths);
        stats.maxItems = Math.max(...arrayLengths);
        stats.avgItems = arrayLengths.reduce((sum, len) => sum + len, 0) / arrayLengths.length;
      }
      break;

    case DATA_TYPES.OBJECT:
      // Calculate object size statistics
      const objectSizes = values
        .filter(val => isObject(val))
        .map(val => Object.keys(val).length);
      
      if (objectSizes.length > 0) {
        stats.minProperties = Math.min(...objectSizes);
        stats.maxProperties = Math.max(...objectSizes);
        stats.avgProperties = objectSizes.reduce((sum, size) => sum + size, 0) / objectSizes.length;
      }
      break;
  }

  return stats;
}

// Type detection helper functions

function isNull(value) {
  return value === null || value === undefined;
}

function isBoolean(value) {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    return TYPE_PATTERNS.BOOLEAN_TEXT.test(value.trim().toLowerCase());
  }
  return false;
}

function isInteger(value) {
  if (Number.isInteger(value)) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return /^-?\d+$/.test(trimmed) && !isNaN(parseInt(trimmed, 10));
  }
  return false;
}

function isNumber(value) {
  if (typeof value === 'number') return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return !isNaN(parseFloat(trimmed)) && isFinite(trimmed);
  }
  return false;
}

function isString(value) {
  return typeof value === 'string';
}

function isArray(value) {
  return Array.isArray(value);
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDate(value) {
  if (value instanceof Date) return true;
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  return TYPE_PATTERNS.DATE_ISO.test(trimmed) || 
         TYPE_PATTERNS.DATE_US.test(trimmed) || 
         TYPE_PATTERNS.DATE_EU.test(trimmed);
}

function isTime(value) {
  if (typeof value !== 'string') return false;
  return TYPE_PATTERNS.TIME.test(value.trim());
}

function isDateTime(value) {
  if (value instanceof Date) return true;
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  // Check for ISO format
  if (TYPE_PATTERNS.DATETIME_ISO.test(trimmed)) return true;
  
  // Try parsing as a date and check if valid
  try {
    const date = new Date(trimmed);
    return !isNaN(date.getTime()) && 
           trimmed.includes(':') && // Has time component
           (trimmed.includes('-') || trimmed.includes('/')); // Has date component
  } catch (e) {
    return false;
  }
}

function isEmail(value) {
  if (typeof value !== 'string') return false;
  return TYPE_PATTERNS.EMAIL.test(value.trim());
}

function isUrl(value) {
  if (typeof value !== 'string') return false;
  return TYPE_PATTERNS.URL.test(value.trim());
}

function isCurrency(value) {
  if (typeof value !== 'string') return false;
  return TYPE_PATTERNS.CURRENCY.test(value.trim());
}

function isPercentage(value) {
  if (typeof value !== 'string') return false;
  return TYPE_PATTERNS.PERCENTAGE.test(value.trim());
}

function isIpAddress(value) {
  if (typeof value !== 'string') return false;
  return TYPE_PATTERNS.IP_ADDRESS.test(value.trim());
}

function isPhoneNumber(value) {
  if (typeof value !== 'string') return false;
  return TYPE_PATTERNS.PHONE_NUMBER.test(value.trim());
}

function isPostalCode(value) {
  if (typeof value !== 'string') return false;
  return TYPE_PATTERNS.POSTAL_CODE.test(value.trim());
}

function isIdField(value) {
  if (typeof value === 'number') {
    // Numeric IDs are typically integers
    return Number.isInteger(value);
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    
    // Check for UUID pattern
    if (TYPE_PATTERNS.UUID.test(trimmed)) return true;
    
    // Check for hexadecimal IDs
    if (/^[0-9a-f]{8,}$/i.test(trimmed)) return true;
    
    // Check for common ID patterns
    if (/^[A-Za-z0-9_-]{3,}$/.test(trimmed)) {
      // More likely to be an ID if it contains mixed case or underscores/hyphens
      if (/[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed)) return true;
      if (/_|-/.test(trimmed)) return true;
    }
  }
  
  return false;
}

function isDateLike(value) {
  if (value instanceof Date) return true;
  if (typeof value !== 'string') return false;
  
  try {
    const date = new Date(value);
    return !isNaN(date.getTime());
  } catch (e) {
    return false;
  }
}

// Utility functions for statistics

function calculateMedian(values) {
  if (!values || values.length === 0) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
}

function calculateStdDev(values, mean) {
  if (!values || values.length === 0) return null;
  if (values.length === 1) return 0;
  
  const squareDiffs = values.map(value => {
    const diff = value - mean;
    return diff * diff;
  });
  
  const avgSquareDiff = squareDiffs.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Converts a detected schema to a schema definition object
 * compatible with validation libraries (e.g., Ajv, Yup)
 * 
 * @param {Object} inferredSchema - Schema from inferSchema function
 * @param {Object} options - Configuration options
 * @param {boolean} options.requiredByDefault - Whether fields should be required by default
 * @param {string} options.format - Output schema format ('jsonSchema', 'yup', etc.)
 * @returns {Object} Schema definition
 */
export const convertToSchemaDefinition = (inferredSchema, options = {}) => {
  const {
    requiredByDefault = false,
    format = 'jsonSchema'
  } = options;

  if (!inferredSchema || !inferredSchema.fields) {
    return null;
  }

  switch (format) {
    case 'jsonSchema':
      return convertToJsonSchema(inferredSchema, requiredByDefault);
    // Add other formats as needed
    default:
      return convertToJsonSchema(inferredSchema, requiredByDefault);
  }
};

/**
 * Convert inferred schema to JSON Schema format
 */
function convertToJsonSchema(inferredSchema, requiredByDefault) {
  const properties = {};
  const required = [];

  inferredSchema.fields.forEach(field => {
    // Add to required array if needed
    if (field.required || (requiredByDefault && !field.nullable)) {
      required.push(field.name);
    }

    // Map field type to JSON Schema type
    let propertyDef = {};
    
    switch (field.type) {
      case DATA_TYPES.STRING:
      case DATA_TYPES.EMAIL:
      case DATA_TYPES.URL:
      case DATA_TYPES.ID:
      case DATA_TYPES.IP_ADDRESS:
      case DATA_TYPES.PHONE_NUMBER:
      case DATA_TYPES.POSTAL_CODE:
        propertyDef = { type: 'string' };
        
        // Add format for special string types
        if (field.type === DATA_TYPES.EMAIL) {
          propertyDef.format = 'email';
        } else if (field.type === DATA_TYPES.URL) {
          propertyDef.format = 'uri';
        } else if (field.type === DATA_TYPES.IP_ADDRESS) {
          propertyDef.format = 'ipv4';
        }
        
        // Add string constraints if available
        if (field.statistics) {
          if (field.statistics.minLength !== undefined) {
            propertyDef.minLength = field.statistics.minLength;
          }
          if (field.statistics.maxLength !== undefined) {
            propertyDef.maxLength = field.statistics.maxLength;
          }
        }
        break;
        
      case DATA_TYPES.NUMBER:
      case DATA_TYPES.CURRENCY:
      case DATA_TYPES.PERCENTAGE:
        propertyDef = { type: 'number' };
        
        // Add numeric constraints if available
        if (field.statistics) {
          if (field.statistics.min !== undefined) {
            propertyDef.minimum = field.statistics.min;
          }
          if (field.statistics.max !== undefined) {
            propertyDef.maximum = field.statistics.max;
          }
        }
        break;
        
      case DATA_TYPES.INTEGER:
        propertyDef = { type: 'integer' };
        
        // Add numeric constraints if available
        if (field.statistics) {
          if (field.statistics.min !== undefined) {
            propertyDef.minimum = field.statistics.min;
          }
          if (field.statistics.max !== undefined) {
            propertyDef.maximum = field.statistics.max;
          }
        }
        break;
        
      case DATA_TYPES.BOOLEAN:
        propertyDef = { type: 'boolean' };
        break;
        
      case DATA_TYPES.DATE:
      case DATA_TYPES.DATETIME:
        propertyDef = { 
          type: 'string',
          format: field.type === DATA_TYPES.DATE ? 'date' : 'date-time'
        };
        break;
        
      case DATA_TYPES.TIME:
        propertyDef = { 
          type: 'string',
          format: 'time'
        };
        break;
        
      case DATA_TYPES.ARRAY:
        propertyDef = { type: 'array' };
        break;
        
      case DATA_TYPES.OBJECT:
        propertyDef = { type: 'object' };
        break;
        
      default:
        propertyDef = { type: 'string' };
    }
    
    // Add additional metadata as JSON Schema custom keywords
    propertyDef['x-inferred-type'] = field.type;
    propertyDef['x-confidence'] = field.confidence;
    
    if (field.alternativeTypes && field.alternativeTypes.length > 0) {
      propertyDef['x-alternative-types'] = field.alternativeTypes;
    }
    
    if (field.isPrimaryKeyCandidate) {
      propertyDef['x-primary-key-candidate'] = true;
    }
    
    properties[field.name] = propertyDef;
  });

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
    additionalProperties: true,
    'x-generated-at': inferredSchema.generatedAt,
    'x-record-count': inferredSchema.recordCount,
    'x-sampled-record-count': inferredSchema.sampledRecordCount
  };
}

/**
 * Get a human-readable description of the inferred schema
 * 
 * @param {Object} inferredSchema - Schema from inferSchema function
 * @returns {string} Human-readable description
 */
export const getSchemaDescription = (inferredSchema) => {
  if (!inferredSchema || !inferredSchema.fields || inferredSchema.fields.length === 0) {
    return 'No schema available';
  }

  const { fields, recordCount, sampledRecordCount } = inferredSchema;

  let description = `Schema inferred from ${sampledRecordCount} of ${recordCount} records with ${fields.length} fields:\n\n`;

  fields.forEach(field => {
    const confidence = (field.confidence * 100).toFixed(1);
    const requiredStr = field.required ? 'required' : 'optional';
    const alternativeStr = field.alternativeTypes && field.alternativeTypes.length > 0
      ? ` (alternatives: ${field.alternativeTypes.map(alt => alt.type).join(', ')})`
      : '';
    
    description += `- ${field.name}: ${field.type} (${confidence}% confidence, ${requiredStr})${alternativeStr}\n`;
    
    if (field.statistics) {
      if (field.type === DATA_TYPES.NUMBER || field.type === DATA_TYPES.INTEGER) {
        description += `  Range: ${field.statistics.min} to ${field.statistics.max}, Avg: ${field.statistics.avg.toFixed(2)}\n`;
      } else if (field.type === DATA_TYPES.STRING) {
        description += `  Length: ${field.statistics.minLength} to ${field.statistics.maxLength} chars\n`;
      } else if (field.type === DATA_TYPES.DATE || field.type === DATA_TYPES.DATETIME) {
        description += `  Range: ${new Date(field.statistics.minDate).toLocaleDateString()} to ${new Date(field.statistics.maxDate).toLocaleDateString()}\n`;
      }
    }
  });

  return description;
}