/**
 * @module schemaInference
 * @description Schema Inference Utility
 * 
 * Analyzes datasets and automatically infers schema structure with 
 * sophisticated data type detection. Provides confidence scoring 
 * for type inference and detailed field metadata.
 * 
 * @version 1.0.0
 * @example
 * // Simple schema inference
 * const schema = inferSchema(dataArray);
 * 
 * // Schema inference with options
 * const schema = inferSchema(dataArray, {
 *   sampleSize: 100,
 *   confidenceThreshold: 0.8,
 *   detectSpecialTypes: true
 * });
 */

// Maximum values to prevent performance issues with large datasets
const MAX_ARRAY_SIZE_FOR_SPREAD = 10000;
const MAX_SAMPLE_SIZE = 1000;
const MAX_STRING_LENGTH_FOR_COMPLEX_REGEX = 1000;

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
 * @private
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
 * Safely stringifies a value, handling circular references
 * 
 * @param {*} value - The value to stringify
 * @returns {string} String representation of the value
 * @private
 */
function safeStringify(value) {
  try {
    // Replace circular references with "[Circular]"
    const seen = new WeakSet();
    return JSON.stringify(value, (key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }
      return val;
    });
  } catch (error) {
    // Handle stringification errors
    console.warn('Schema inference: Error stringifying value', error);
    return String(value);
  }
}

/**
 * Safely gets min/max values without using spread operator which can cause stack overflow
 * 
 * @param {Array<number>} array - Array of numbers
 * @returns {Object} Object containing min and max values
 * @private
 */
function safeMinMax(array) {
  if (!array || array.length === 0) {
    return { min: undefined, max: undefined };
  }
  
  let min = array[0];
  let max = array[0];
  
  for (let i = 1; i < array.length; i++) {
    if (array[i] < min) min = array[i];
    if (array[i] > max) max = array[i];
  }
  
  return { min, max };
}

/**
 * Infer schema from data array
 * 
 * @param {Array<Object>} data - Array of data objects
 * @param {Object} [options={}] - Configuration options
 * @param {number} [options.sampleSize] - Number of records to sample (default: all, max: 1000)
 * @param {number} [options.confidenceThreshold=0.7] - Minimum confidence threshold (0-1)
 * @param {boolean} [options.detectSpecialTypes=true] - Whether to detect special types
 * @param {boolean} [options.includeStatistics=true] - Whether to include field statistics
 * @returns {Object} Inferred schema with field definitions
 * @throws {Error} If data format is invalid
 */
export const inferSchema = (data, options = {}) => {
  try {
    // Validate input data
    if (!data) {
      throw new Error('Data is required for schema inference');
    }
    
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array for schema inference');
    }
    
    if (data.length === 0) {
      return { 
        fields: [],
        recordCount: 0,
        sampledRecordCount: 0,
        generatedAt: new Date().toISOString(),
        hasCompleteSchema: false
      };
    }

    // Validate and extract options
    const {
      sampleSize = Math.min(data.length, MAX_SAMPLE_SIZE),
      confidenceThreshold = CONFIDENCE_THRESHOLD.MEDIUM,
      detectSpecialTypes = true,
      includeStatistics = true
    } = options;

    // Validate option values
    if (typeof sampleSize !== 'number' || sampleSize <= 0) {
      throw new Error('Sample size must be a positive number');
    }
    
    if (typeof confidenceThreshold !== 'number' || 
        confidenceThreshold < 0 || 
        confidenceThreshold > 1) {
      throw new Error('Confidence threshold must be a number between 0 and 1');
    }

    // Sample data if needed
    const effectiveSampleSize = Math.min(sampleSize, data.length, MAX_SAMPLE_SIZE);
    const sampleData = effectiveSampleSize < data.length 
      ? data.slice(0, effectiveSampleSize) 
      : data;

    // Get all unique field names across all records
    const fieldNames = new Set();
    try {
      sampleData.forEach(record => {
        if (record && typeof record === 'object' && !Array.isArray(record)) {
          Object.keys(record).forEach(key => {
            fieldNames.add(key);
          });
        }
      });
    } catch (error) {
      throw new Error(`Error extracting field names: ${error.message}`);
    }

    // Create schema for each field
    const fields = Array.from(fieldNames).map(fieldName => {
      try {
        // Extract all non-null values for this field
        const fieldValues = sampleData
          .map(record => record[fieldName])
          .filter(value => value !== null && value !== undefined);

        // Calculate field statistics
        const uniqueValues = new Set();
        fieldValues.forEach(value => {
          try {
            uniqueValues.add(safeStringify(value));
          } catch (error) {
            console.warn(`Schema inference: Error processing value for field ${fieldName}`, error);
          }
        });
        
        const fieldStats = {
          count: sampleData.length,
          nonNullCount: fieldValues.length,
          nullPercentage: (1 - fieldValues.length / sampleData.length) * 100,
          uniqueCount: uniqueValues.size
        };

        // Determine cardinality type (high, medium, low)
        let cardinalityType = 'unknown';
        if (fieldStats.uniqueCount > 0 && fieldStats.nonNullCount > 0) {
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
      } catch (error) {
        console.warn(`Schema inference: Error processing field ${fieldName}`, error);
        return {
          name: fieldName,
          type: DATA_TYPES.UNKNOWN,
          confidence: 0,
          required: false,
          nullable: true,
          error: error.message
        };
      }
    });

    return {
      fields,
      recordCount: data.length,
      sampledRecordCount: sampleData.length,
      generatedAt: new Date().toISOString(),
      hasCompleteSchema: fields.length > 0
    };
  } catch (error) {
    console.error('Schema inference failed:', error);
    throw new Error(`Schema inference failed: ${error.message}`);
  }
};

/**
 * Detect the type of a field based on its values
 * 
 * @param {Array<any>} values - Array of field values
 * @param {boolean} detectSpecialTypes - Whether to detect special types
 * @returns {Object} Map of type to confidence score (0-1)
 * @private
 */
function detectFieldType(values, detectSpecialTypes) {
  try {
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
        try {
          if (detector(value)) {
            typeCountMap[type]++;
          }
        } catch (error) {
          console.warn(`Schema inference: Error detecting type ${type} for value`, error);
        }
      });
    });

    // Convert counts to confidence scores
    const totalValues = values.length;
    const confidenceMap = {};
    
    Object.entries(typeCountMap).forEach(([type, count]) => {
      confidenceMap[type] = totalValues > 0 ? count / totalValues : 0;
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
  } catch (error) {
    console.error('Error in detectFieldType:', error);
    return { [DATA_TYPES.UNKNOWN]: 1 };
  }
}

/**
 * Calculate additional statistics specific to the detected type
 * 
 * @param {Array<any>} values - Array of field values
 * @param {string} type - Detected field type
 * @returns {Object} Type-specific statistics
 * @private
 */
function calculateTypeSpecificStats(values, type) {
  try {
    if (!values || values.length === 0) {
      return {};
    }

    const stats = {};

    switch (type) {
      case DATA_TYPES.NUMBER:
      case DATA_TYPES.INTEGER:
      case DATA_TYPES.CURRENCY:
      case DATA_TYPES.PERCENTAGE: {
        // Filter non-numeric values and convert to numbers
        const numericValues = [];
        
        for (const val of values) {
          try {
            if (typeof val === 'number') {
              // Skip NaN or Infinity values
              if (!isNaN(val) && isFinite(val)) {
                numericValues.push(val);
              }
            } else if (typeof val === 'string') {
              const cleaned = val.replace(/[$%,]/g, '');
              const num = parseFloat(cleaned);
              if (!isNaN(num) && isFinite(num)) {
                numericValues.push(num);
              }
            }
          } catch (error) {
            console.warn('Schema inference: Error processing numeric value', error);
          }
        }
        
        if (numericValues.length > 0) {
          const { min, max } = safeMinMax(numericValues);
          stats.min = min;
          stats.max = max;
          
          // Calculate sum and average
          let sum = 0;
          for (let i = 0; i < numericValues.length; i++) {
            sum += numericValues[i];
          }
          stats.sum = sum;
          stats.avg = sum / numericValues.length;
          
          // Calculate median
          stats.median = calculateMedian(numericValues);
          
          // Calculate standard deviation
          stats.stdDev = calculateStdDev(numericValues, stats.avg);
        }
        break;
      }

      case DATA_TYPES.STRING:
      case DATA_TYPES.EMAIL:
      case DATA_TYPES.URL: {
        // Calculate string length statistics
        const stringLengths = [];
        
        for (const val of values) {
          if (typeof val === 'string') {
            stringLengths.push(val.length);
          }
        }
        
        if (stringLengths.length > 0) {
          const { min, max } = safeMinMax(stringLengths);
          stats.minLength = min;
          stats.maxLength = max;
          
          let sum = 0;
          for (let i = 0; i < stringLengths.length; i++) {
            sum += stringLengths[i];
          }
          stats.avgLength = sum / stringLengths.length;
        }
        break;
      }

      case DATA_TYPES.DATE:
      case DATA_TYPES.DATETIME: {
        // Calculate date range statistics
        try {
          const dates = [];
          const timestamps = [];
          
          for (const val of values) {
            if (isDateLike(val)) {
              try {
                const date = new Date(val);
                if (!isNaN(date.getTime())) {
                  dates.push(date);
                  timestamps.push(date.getTime());
                }
              } catch (error) {
                // Skip invalid dates
              }
            }
          }
          
          if (dates.length > 0) {
            // Use timestamp array for min/max detection
            const { min, max } = safeMinMax(timestamps);
            stats.minDate = new Date(min).toISOString();
            stats.maxDate = new Date(max).toISOString();
            stats.dateRange = Math.ceil((max - min) / (1000 * 60 * 60 * 24));
          }
        } catch (error) {
          console.warn('Schema inference: Error calculating date statistics', error);
        }
        break;
      }

      case DATA_TYPES.ARRAY: {
        // Calculate array length statistics
        const arrayLengths = [];
        
        for (const val of values) {
          if (Array.isArray(val)) {
            arrayLengths.push(val.length);
          }
        }
        
        if (arrayLengths.length > 0) {
          const { min, max } = safeMinMax(arrayLengths);
          stats.minItems = min;
          stats.maxItems = max;
          
          let sum = 0;
          for (let i = 0; i < arrayLengths.length; i++) {
            sum += arrayLengths[i];
          }
          stats.avgItems = sum / arrayLengths.length;
        }
        break;
      }

      case DATA_TYPES.OBJECT: {
        // Calculate object size statistics
        const objectSizes = [];
        
        for (const val of values) {
          if (isObject(val)) {
            objectSizes.push(Object.keys(val).length);
          }
        }
        
        if (objectSizes.length > 0) {
          const { min, max } = safeMinMax(objectSizes);
          stats.minProperties = min;
          stats.maxProperties = max;
          
          let sum = 0;
          for (let i = 0; i < objectSizes.length; i++) {
            sum += objectSizes[i];
          }
          stats.avgProperties = sum / objectSizes.length;
        }
        break;
      }
    }

    return stats;
  } catch (error) {
    console.error('Error in calculateTypeSpecificStats:', error);
    return {};
  }
}

// Type detection helper functions

/**
 * Check if value is null or undefined
 * @param {*} value - Value to check
 * @returns {boolean} True if value is null or undefined
 * @private
 */
function isNull(value) {
  return value === null || value === undefined;
}

/**
 * Check if value is boolean
 * @param {*} value - Value to check
 * @returns {boolean} True if value is boolean
 * @private
 */
function isBoolean(value) {
  if (typeof value === 'boolean') return true;
  if (typeof value === 'string') {
    return TYPE_PATTERNS.BOOLEAN_TEXT.test(value.trim().toLowerCase());
  }
  return false;
}

/**
 * Check if value is integer
 * @param {*} value - Value to check
 * @returns {boolean} True if value is integer
 * @private
 */
function isInteger(value) {
  if (Number.isInteger(value)) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return /^-?\d+$/.test(trimmed) && !isNaN(parseInt(trimmed, 10));
  }
  return false;
}

/**
 * Check if value is number
 * @param {*} value - Value to check
 * @returns {boolean} True if value is number
 * @private
 */
function isNumber(value) {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const num = parseFloat(trimmed);
    return !isNaN(num) && isFinite(num) && /^-?\d*\.?\d+$/.test(trimmed);
  }
  return false;
}

/**
 * Check if value is string
 * @param {*} value - Value to check
 * @returns {boolean} True if value is string
 * @private
 */
function isString(value) {
  return typeof value === 'string';
}

/**
 * Check if value is array
 * @param {*} value - Value to check
 * @returns {boolean} True if value is array
 * @private
 */
function isArray(value) {
  return Array.isArray(value);
}

/**
 * Check if value is object
 * @param {*} value - Value to check
 * @returns {boolean} True if value is object
 * @private
 */
function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if value is date
 * @param {*} value - Value to check
 * @returns {boolean} True if value is date
 * @private
 */
function isDate(value) {
  if (value instanceof Date) return true;
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // For large strings, don't try complex regex
  if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
    return false;
  }
  
  return TYPE_PATTERNS.DATE_ISO.test(trimmed) || 
         TYPE_PATTERNS.DATE_US.test(trimmed) || 
         TYPE_PATTERNS.DATE_EU.test(trimmed);
}

/**
 * Check if value is time
 * @param {*} value - Value to check
 * @returns {boolean} True if value is time
 * @private
 */
function isTime(value) {
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // For large strings, don't try complex regex
  if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
    return false;
  }
  
  return TYPE_PATTERNS.TIME.test(trimmed);
}

/**
 * Check if value is datetime
 * @param {*} value - Value to check
 * @returns {boolean} True if value is datetime
 * @private
 */
function isDateTime(value) {
  if (value instanceof Date) return true;
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // For large strings, don't try complex regex
  if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
    return false;
  }
  
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

/**
 * Check if value is email
 * @param {*} value - Value to check
 * @returns {boolean} True if value is email
 * @private
 */
function isEmail(value) {
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // For large strings, don't try complex regex
  if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
    return false;
  }
  
  return TYPE_PATTERNS.EMAIL.test(trimmed);
}

/**
 * Check if value is URL
 * @param {*} value - Value to check
 * @returns {boolean} True if value is URL
 * @private
 */
function isUrl(value) {
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // For large strings, don't try complex regex
  if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
    return false;
  }
  
  return TYPE_PATTERNS.URL.test(trimmed);
}

/**
 * Check if value is currency
 * @param {*} value - Value to check
 * @returns {boolean} True if value is currency
 * @private
 */
function isCurrency(value) {
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // For large strings, don't try complex regex
  if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
    return false;
  }
  
  return TYPE_PATTERNS.CURRENCY.test(trimmed);
}

/**
 * Check if value is percentage
 * @param {*} value - Value to check
 * @returns {boolean} True if value is percentage
 * @private
 */
function isPercentage(value) {
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // For large strings, don't try complex regex
  if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
    return false;
  }
  
  return TYPE_PATTERNS.PERCENTAGE.test(trimmed);
}

/**
 * Check if value is IP address
 * @param {*} value - Value to check
 * @returns {boolean} True if value is IP address
 * @private
 */
function isIpAddress(value) {
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // For large strings, don't try complex regex
  if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
    return false;
  }
  
  // Basic regex test first
  if (!TYPE_PATTERNS.IP_ADDRESS.test(trimmed)) {
    return false;
  }
  
  // Validate each octet in range 0-255
  try {
    const octets = trimmed.split('.');
    for (let i = 0; i < octets.length; i++) {
      const octet = parseInt(octets[i], 10);
      if (octet < 0 || octet > 255) {
        return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if value is phone number
 * @param {*} value - Value to check
 * @returns {boolean} True if value is phone number
 * @private
 */
function isPhoneNumber(value) {
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // For large strings, don't try complex regex
  if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
    return false;
  }
  
  return TYPE_PATTERNS.PHONE_NUMBER.test(trimmed);
}

/**
 * Check if value is postal code
 * @param {*} value - Value to check
 * @returns {boolean} True if value is postal code
 * @private
 */
function isPostalCode(value) {
  if (typeof value !== 'string') return false;
  
  const trimmed = value.trim();
  
  // For large strings, don't try complex regex
  if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
    return false;
  }
  
  return TYPE_PATTERNS.POSTAL_CODE.test(trimmed);
}

/**
 * Check if value is ID field
 * @param {*} value - Value to check
 * @returns {boolean} True if value is ID field
 * @private
 */
function isIdField(value) {
  if (typeof value === 'number') {
    // Numeric IDs are typically integers
    return Number.isInteger(value);
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    
    // For large strings, don't try complex regex
    if (trimmed.length > MAX_STRING_LENGTH_FOR_COMPLEX_REGEX) {
      return false;
    }
    
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

/**
 * Check if value can be parsed as a date
 * @param {*} value - Value to check
 * @returns {boolean} True if value can be parsed as a date
 * @private
 */
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

/**
 * Calculate median value of an array
 * @param {Array<number>} values - Array of numbers
 * @returns {number|null} Median value or null if no values
 * @private
 */
function calculateMedian(values) {
  if (!values || values.length === 0) return null;
  
  // Sort the values
  const sortedValues = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  
  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
  }
  
  return sortedValues[middle];
}

/**
 * Calculate standard deviation
 * @param {Array<number>} values - Array of numbers
 * @param {number} mean - Mean value
 * @returns {number|null} Standard deviation or null if no values
 * @private
 */
function calculateStdDev(values, mean) {
  if (!values || values.length === 0) return null;
  if (values.length === 1) return 0;
  
  let sumSquaredDiffs = 0;
  for (let i = 0; i < values.length; i++) {
    const diff = values[i] - mean;
    sumSquaredDiffs += diff * diff;
  }
  
  const avgSquaredDiff = sumSquaredDiffs / values.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Converts a detected schema to a schema definition object
 * compatible with validation libraries (e.g., Ajv, Yup)
 * 
 * @param {Object} inferredSchema - Schema from inferSchema function
 * @param {Object} [options={}] - Configuration options
 * @param {boolean} [options.requiredByDefault=false] - Whether fields should be required by default
 * @param {string} [options.format='jsonSchema'] - Output schema format ('jsonSchema', 'yup', etc.)
 * @returns {Object|null} Schema definition or null if schema is invalid
 * @throws {Error} If schema format is not supported
 */
export const convertToSchemaDefinition = (inferredSchema, options = {}) => {
  try {
    if (!inferredSchema || !inferredSchema.fields) {
      return null;
    }

    const {
      requiredByDefault = false,
      format = 'jsonSchema'
    } = options;
    
    // Validate format
    const supportedFormats = ['jsonSchema'];
    if (!supportedFormats.includes(format)) {
      throw new Error(`Unsupported schema format: ${format}. Supported formats: ${supportedFormats.join(', ')}`);
    }

    switch (format) {
      case 'jsonSchema':
        return convertToJsonSchema(inferredSchema, requiredByDefault);
      default:
        // Should never reach here due to validation above
        return convertToJsonSchema(inferredSchema, requiredByDefault);
    }
  } catch (error) {
    console.error('Error converting schema definition:', error);
    throw new Error(`Error converting schema definition: ${error.message}`);
  }
};

/**
 * Convert inferred schema to JSON Schema format
 * 
 * @param {Object} inferredSchema - Inferred schema
 * @param {boolean} requiredByDefault - Whether fields should be required by default
 * @returns {Object} JSON Schema definition
 * @private
 */
function convertToJsonSchema(inferredSchema, requiredByDefault) {
  try {
    const properties = {};
    const required = [];

    inferredSchema.fields.forEach(field => {
      try {
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
      } catch (error) {
        console.warn(`Error processing field ${field.name} for JSON Schema:`, error);
        // Add a default string property if conversion fails
        properties[field.name] = { 
          type: 'string',
          'x-conversion-error': error.message 
        };
      }
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
  } catch (error) {
    console.error('Error converting to JSON Schema:', error);
    throw new Error(`Error converting to JSON Schema: ${error.message}`);
  }
}

/**
 * Get a human-readable description of the inferred schema
 * 
 * @param {Object} inferredSchema - Schema from inferSchema function
 * @returns {string} Human-readable description
 * @throws {Error} If schema is invalid
 */
export const getSchemaDescription = (inferredSchema) => {
  try {
    if (!inferredSchema || !inferredSchema.fields || inferredSchema.fields.length === 0) {
      return 'No schema available';
    }

    const { fields, recordCount, sampledRecordCount } = inferredSchema;

    let description = `Schema inferred from ${sampledRecordCount} of ${recordCount} records with ${fields.length} fields:\n\n`;

    fields.forEach(field => {
      try {
        const confidence = (field.confidence * 100).toFixed(1);
        const requiredStr = field.required ? 'required' : 'optional';
        
        let alternativeStr = '';
        if (field.alternativeTypes && field.alternativeTypes.length > 0) {
          alternativeStr = ` (alternatives: ${field.alternativeTypes.map(alt => alt.type).join(', ')})`;
        }
        
        description += `- ${field.name}: ${field.type} (${confidence}% confidence, ${requiredStr})${alternativeStr}\n`;
        
        // Add type-specific statistics if available
        if (field.statistics) {
          if (field.type === DATA_TYPES.NUMBER || field.type === DATA_TYPES.INTEGER) {
            if (field.statistics.min !== undefined && field.statistics.max !== undefined) {
              const avg = field.statistics.avg !== undefined ? `, Avg: ${field.statistics.avg.toFixed(2)}` : '';
              description += `  Range: ${field.statistics.min} to ${field.statistics.max}${avg}\n`;
            }
          } else if (field.type === DATA_TYPES.STRING) {
            if (field.statistics.minLength !== undefined && field.statistics.maxLength !== undefined) {
              description += `  Length: ${field.statistics.minLength} to ${field.statistics.maxLength} chars\n`;
            }
          } else if (field.type === DATA_TYPES.DATE || field.type === DATA_TYPES.DATETIME) {
            // Safe date formatting
            try {
              if (field.statistics.minDate && field.statistics.maxDate) {
                const minDate = new Date(field.statistics.minDate);
                const maxDate = new Date(field.statistics.maxDate);
                
                if (!isNaN(minDate.getTime()) && !isNaN(maxDate.getTime())) {
                  description += `  Range: ${minDate.toISOString().split('T')[0]} to ${maxDate.toISOString().split('T')[0]}\n`;
                }
              }
            } catch (error) {
              console.warn(`Error formatting date range for field ${field.name}:`, error);
            }
          }
        }
      } catch (error) {
        console.warn(`Error generating description for field ${field.name}:`, error);
        description += `- ${field.name}: Error generating description\n`;
      }
    });

    return description;
  } catch (error) {
    console.error('Error generating schema description:', error);
    throw new Error(`Error generating schema description: ${error.message}`);
  }
}