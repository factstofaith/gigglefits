// useSchemaManagement.js
// Production-ready hook for managing data schemas with inference, validation,
// and optimization capabilities.

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

/**
 * @typedef {Object} SchemaField
 * @property {string} name - Field name
 * @property {string} type - Field data type
 * @property {string} [format] - Field format (e.g., date-time, email)
 * @property {boolean} [required] - Whether the field is required
 * @property {any} [defaultValue] - Default value for the field
 * @property {string} [description] - Field description
 * @property {Object} [metadata] - Additional metadata
 * @property {number} [confidence] - Confidence level for inferred types (0-1)
 */

/**
 * @typedef {Object} Schema
 * @property {string} name - Schema name
 * @property {SchemaField[]} fields - Schema fields
 * @property {string} [description] - Schema description
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} SchemaOptions
 * @property {number} sampleSize - Number of records to use for inference
 * @property {number} confidenceThreshold - Minimum confidence for type inference
 * @property {boolean} inferRequired - Whether to infer required fields
 * @property {boolean} inferDefaultValues - Whether to infer default values
 * @property {string[]} ignoredFields - Fields to ignore during inference
 * @property {Object} customTypeDetectors - Custom type detection functions
 * @property {Function} onSchemaChange - Callback when schema changes
 */

/**
 * Hook for managing data schemas with production-ready features
 * 
 * @param {Object[]} [data=[]] - Sample data for schema inference
 * @param {Schema} [initialSchema=null] - Initial schema definition
 * @param {SchemaOptions} [options={}] - Configuration options
 * @returns {Object} Schema management interface
 */
export default function useSchemaManagement(data = [], initialSchema = null, options = {}) {
  // Default options
  const config = {
    sampleSize: 100,
    confidenceThreshold: 0.7,
    inferRequired: true,
    inferDefaultValues: true,
    ignoredFields: [],
    customTypeDetectors: {},
    onSchemaChange: null,
    ...options
  };
  
  // State for schema
  const [schema, setSchema] = useState(initialSchema || { name: '', fields: [], description: '' });
  
  // State for schema operations
  const [inferenceState, setInferenceState] = useState({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null
  });
  
  // Refs for internal state
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);
  const cachedInferenceRef = useRef({});
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      
      // Abort any ongoing operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // Run initial schema inference if no schema provided
  useEffect(() => {
    if (!initialSchema && data.length > 0) {
      inferSchema(data);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  
  /**
   * Infers a schema from sample data
   * @param {Object[]} sampleData - Data to analyze for schema inference
   * @returns {Promise<Schema>} Inferred schema
   */
  const inferSchema = useCallback(async (sampleData = data) => {
    if (!sampleData || !Array.isArray(sampleData) || sampleData.length === 0) {
      return schema;
    }
    
    // Create abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setInferenceState({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null
    });
    
    try {
      // Limit sample size
      const limitedSample = sampleData.slice(0, config.sampleSize);
      
      // Check cache
      const cacheKey = getCacheKey(limitedSample);
      if (cachedInferenceRef.current[cacheKey]) {
        const cachedSchema = cachedInferenceRef.current[cacheKey];
        
        if (isMounted.current) {
          setSchema(cachedSchema);
          setInferenceState({
            isLoading: false,
            isSuccess: true,
            isError: false,
            error: null
          });
        }
        
        if (typeof config.onSchemaChange === 'function') {
          config.onSchemaChange(cachedSchema);
        }
        
        return cachedSchema;
      }
      
      // Analyze fields from all records
      const fieldAnalysis = {};
      
      // First pass: collect all field names and analyze types
      for (const record of limitedSample) {
        if (signal.aborted) break;
        
        Object.entries(record).forEach(([fieldName, value]) => {
          // Skip ignored fields
          if (config.ignoredFields.includes(fieldName)) {
            return;
          }
          
          if (!fieldAnalysis[fieldName]) {
            fieldAnalysis[fieldName] = {
              name: fieldName,
              values: [],
              types: {},
              nullCount: 0,
              totalCount: 0
            };
          }
          
          // Track values for analysis
          fieldAnalysis[fieldName].values.push(value);
          fieldAnalysis[fieldName].totalCount++;
          
          // Handle null/undefined values
          if (value === null || value === undefined) {
            fieldAnalysis[fieldName].nullCount++;
            return;
          }
          
          // Determine type
          const detectedType = detectType(value, fieldName, config.customTypeDetectors);
          
          // Update type counts
          if (!fieldAnalysis[fieldName].types[detectedType.type]) {
            fieldAnalysis[fieldName].types[detectedType.type] = {
              count: 0,
              formats: {}
            };
          }
          
          fieldAnalysis[fieldName].types[detectedType.type].count++;
          
          // Track formats if available
          if (detectedType.format) {
            if (!fieldAnalysis[fieldName].types[detectedType.type].formats[detectedType.format]) {
              fieldAnalysis[fieldName].types[detectedType.type].formats[detectedType.format] = 0;
            }
            
            fieldAnalysis[fieldName].types[detectedType.type].formats[detectedType.format]++;
          }
        });
      }
      
      // Build schema from analysis
      const inferredFields = [];
      
      Object.values(fieldAnalysis).forEach(field => {
        // Find dominant type
        let dominantType = '';
        let dominantTypeCount = 0;
        let dominantFormat = '';
        let dominantFormatCount = 0;
        
        Object.entries(field.types).forEach(([type, info]) => {
          if (info.count > dominantTypeCount) {
            dominantType = type;
            dominantTypeCount = info.count;
            
            // Reset format when type changes
            dominantFormat = '';
            dominantFormatCount = 0;
            
            // Find dominant format for this type
            Object.entries(info.formats).forEach(([format, count]) => {
              if (count > dominantFormatCount) {
                dominantFormat = format;
                dominantFormatCount = count;
              }
            });
          }
        });
        
        // Calculate confidence
        const confidence = dominantTypeCount / (field.totalCount - field.nullCount);
        
        // Determine if field is required
        const isRequired = config.inferRequired 
          ? field.nullCount === 0 
          : false;
        
        // Determine default value
        let defaultValue = undefined;
        if (config.inferDefaultValues && field.values.length > 0) {
          const nonNullValues = field.values.filter(v => v !== null && v !== undefined);
          if (nonNullValues.length > 0) {
            // Use most common value as default
            const valueCounts = {};
            let mostCommonValue = nonNullValues[0];
            let mostCommonCount = 0;
            
            for (const value of nonNullValues) {
              const valueStr = String(value);
              valueCounts[valueStr] = (valueCounts[valueStr] || 0) + 1;
              
              if (valueCounts[valueStr] > mostCommonCount) {
                mostCommonValue = value;
                mostCommonCount = valueCounts[valueStr];
              }
            }
            
            // Only set default if it appears in at least 50% of the records
            if (mostCommonCount / nonNullValues.length >= 0.5) {
              defaultValue = mostCommonValue;
            }
          }
        }
        
        // Add field to schema if confidence meets threshold
        if (confidence >= config.confidenceThreshold) {
          inferredFields.push({
            name: field.name,
            type: dominantType,
            format: dominantFormat || undefined,
            required: isRequired,
            defaultValue,
            confidence,
            metadata: {
              totalCount: field.totalCount,
              nullCount: field.nullCount,
              typeDistribution: field.types
            }
          });
        }
      });
      
      // Create schema
      const inferredSchema = {
        name: schema.name || 'Inferred Schema',
        fields: inferredFields,
        description: schema.description || `Auto-inferred schema from ${limitedSample.length} records`,
        metadata: {
          inferredAt: new Date().toISOString(),
          sampleSize: limitedSample.length,
          totalRecords: sampleData.length,
          confidenceThreshold: config.confidenceThreshold
        }
      };
      
      // Cache inference result
      cachedInferenceRef.current[cacheKey] = inferredSchema;
      
      // Update state if component is still mounted
      if (isMounted.current) {
        setSchema(inferredSchema);
        setInferenceState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null
        });
      }
      
      // Notify schema change
      if (typeof config.onSchemaChange === 'function') {
        config.onSchemaChange(inferredSchema);
      }
      
      return inferredSchema;
    } catch (error) {
      if (isMounted.current) {
        setInferenceState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error
        });
      }
      
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [
    data,
    schema,
    config.sampleSize,
    config.confidenceThreshold,
    config.inferRequired,
    config.inferDefaultValues,
    config.ignoredFields,
    config.customTypeDetectors,
    config.onSchemaChange
  ]);
  
  /**
   * Updates the schema
   * @param {Function|Schema} updater - Schema updater function or new schema
   */
  const updateSchema = useCallback((updater) => {
    setSchema(prevSchema => {
      const newSchema = typeof updater === 'function'
        ? updater(prevSchema)
        : updater;
      
      // Notify schema change
      if (typeof config.onSchemaChange === 'function') {
        config.onSchemaChange(newSchema);
      }
      
      return newSchema;
    });
  }, [config.onSchemaChange]);
  
  /**
   * Adds a field to the schema
   * @param {SchemaField} field - Field to add
   */
  const addField = useCallback((field) => {
    updateSchema(prevSchema => ({
      ...prevSchema,
      fields: [...prevSchema.fields, field]
    }));
  }, [updateSchema]);
  
  /**
   * Updates a field in the schema
   * @param {string} fieldName - Name of the field to update
   * @param {Object|Function} update - Field updates or updater function
   */
  const updateField = useCallback((fieldName, update) => {
    updateSchema(prevSchema => ({
      ...prevSchema,
      fields: prevSchema.fields.map(field => {
        if (field.name === fieldName) {
          return typeof update === 'function'
            ? update(field)
            : { ...field, ...update };
        }
        return field;
      })
    }));
  }, [updateSchema]);
  
  /**
   * Removes a field from the schema
   * @param {string} fieldName - Name of the field to remove
   */
  const removeField = useCallback((fieldName) => {
    updateSchema(prevSchema => ({
      ...prevSchema,
      fields: prevSchema.fields.filter(field => field.name !== fieldName)
    }));
  }, [updateSchema]);
  
  /**
   * Validates data against the schema
   * @param {Object|Object[]} dataToValidate - Data to validate
   * @returns {Object} Validation result
   */
  const validateData = useCallback((dataToValidate) => {
    // Handle array of objects
    if (Array.isArray(dataToValidate)) {
      const results = dataToValidate.map((item, index) => {
        const itemResult = validateSingleRecord(item, schema.fields);
        return { index, ...itemResult };
      });
      
      const invalidResults = results.filter(result => !result.isValid);
      
      return {
        isValid: invalidResults.length === 0,
        errors: invalidResults,
        validCount: results.length - invalidResults.length,
        invalidCount: invalidResults.length,
        totalCount: results.length
      };
    }
    
    // Handle single object
    return validateSingleRecord(dataToValidate, schema.fields);
  }, [schema.fields]);
  
  /**
   * Exports the schema to various formats
   * @param {string} format - Export format ('json', 'jsonSchema', etc.)
   * @returns {Object|string} Exported schema
   */
  const exportSchema = useCallback((format = 'json') => {
    switch (format) {
      case 'json':
        return JSON.stringify(schema, null, 2);
        
      case 'jsonSchema':
        return JSON.stringify(convertToJsonSchema(schema), null, 2);
        
      case 'object':
        return { ...schema };
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }, [schema]);
  
  /**
   * Imports a schema from various formats
   * @param {Object|string} importedSchema - Schema to import
   * @param {string} format - Import format ('json', 'jsonSchema', etc.)
   */
  const importSchema = useCallback((importedSchema, format = 'json') => {
    try {
      let parsedSchema;
      
      switch (format) {
        case 'json':
          parsedSchema = typeof importedSchema === 'string'
            ? JSON.parse(importedSchema)
            : importedSchema;
          break;
          
        case 'jsonSchema':
          parsedSchema = convertFromJsonSchema(
            typeof importedSchema === 'string' 
              ? JSON.parse(importedSchema) 
              : importedSchema
          );
          break;
          
        default:
          throw new Error(`Unsupported import format: ${format}`);
      }
      
      updateSchema(parsedSchema);
      
      return parsedSchema;
    } catch (error) {
      throw new Error(`Failed to import schema: ${error.message}`);
    }
  }, [updateSchema]);
  
  /**
   * Merges two schemas together
   * @param {Schema} schemaA - First schema
   * @param {Schema} schemaB - Second schema
   * @returns {Schema} Merged schema
   */
  const mergeSchemas = useCallback((schemaA, schemaB) => {
    const mergedFields = [...schemaA.fields];
    const fieldNames = new Set(mergedFields.map(field => field.name));
    
    // Add fields from schemaB that don't exist in schemaA
    schemaB.fields.forEach(field => {
      if (!fieldNames.has(field.name)) {
        mergedFields.push(field);
        fieldNames.add(field.name);
      }
    });
    
    const mergedSchema = {
      name: `${schemaA.name} + ${schemaB.name}`,
      fields: mergedFields,
      description: `Merged schema from ${schemaA.name} and ${schemaB.name}`,
      metadata: {
        merged: true,
        sources: [
          schemaA.name || 'Schema A',
          schemaB.name || 'Schema B'
        ],
        mergedAt: new Date().toISOString()
      }
    };
    
    return mergedSchema;
  }, []);
  
  /**
   * Generates a cache key for input data
   * @param {any} input - Input data
   * @returns {string} Cache key
   */
  const getCacheKey = (input) => {
    try {
      return JSON.stringify(input).slice(0, 100);
    } catch (error) {
      // If input can't be stringified, return a unique identifier
      return `non-serializable-${Date.now()}`;
    }
  };
  
  /**
   * Detects the type of a value
   * @param {any} value - Value to analyze
   * @param {string} fieldName - Field name
   * @param {Object} customDetectors - Custom type detectors
   * @returns {Object} Detected type information
   */
  const detectType = (value, fieldName, customDetectors = {}) => {
    // Check custom detectors first
    if (customDetectors[fieldName] && typeof customDetectors[fieldName] === 'function') {
      const customType = customDetectors[fieldName](value);
      if (customType) {
        return customType;
      }
    }
    
    // Standard type detection
    const type = typeof value;
    
    if (value === null || value === undefined) {
      return { type: 'null' };
    }
    
    if (type === 'string') {
      // Check if it's a date
      if (!isNaN(Date.parse(value))) {
        // ISO date format check
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return { type: 'string', format: 'date-time' };
        }
        
        // Date only format check
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return { type: 'string', format: 'date' };
        }
      }
      
      // Email format check
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return { type: 'string', format: 'email' };
      }
      
      // URL format check
      if (/^(http|https):\/\/[^\s/$.?#].[^\s]*$/.test(value)) {
        return { type: 'string', format: 'uri' };
      }
      
      return { type: 'string' };
    }
    
    if (type === 'number') {
      // Check if it's an integer
      if (Number.isInteger(value)) {
        return { type: 'integer' };
      }
      
      return { type: 'number' };
    }
    
    if (type === 'boolean') {
      return { type: 'boolean' };
    }
    
    if (Array.isArray(value)) {
      return { type: 'array' };
    }
    
    if (type === 'object') {
      return { type: 'object' };
    }
    
    return { type };
  };
  
  /**
   * Validates a single record against schema fields
   * @param {Object} record - Record to validate
   * @param {SchemaField[]} fields - Schema fields
   * @returns {Object} Validation result
   */
  const validateSingleRecord = (record, fields) => {
    if (!record || typeof record !== 'object') {
      return {
        isValid: false,
        errors: { _record: 'Record must be an object' }
      };
    }
    
    const errors = {};
    
    // Check required fields
    fields.forEach(field => {
      if (field.required && (record[field.name] === undefined || record[field.name] === null)) {
        errors[field.name] = `${field.name} is required`;
        return;
      }
      
      if (record[field.name] === undefined || record[field.name] === null) {
        return; // Skip validation for null/undefined values
      }
      
      // Validate type
      const valueType = typeof record[field.name];
      
      switch (field.type) {
        case 'string':
          if (valueType !== 'string') {
            errors[field.name] = `${field.name} must be a string`;
          } else if (field.format) {
            // Validate format
            switch (field.format) {
              case 'date-time':
                if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(record[field.name])) {
                  errors[field.name] = `${field.name} must be a valid ISO date-time`;
                }
                break;
                
              case 'date':
                if (!/^\d{4}-\d{2}-\d{2}$/.test(record[field.name])) {
                  errors[field.name] = `${field.name} must be a valid date (YYYY-MM-DD)`;
                }
                break;
                
              case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record[field.name])) {
                  errors[field.name] = `${field.name} must be a valid email address`;
                }
                break;
                
              case 'uri':
                if (!/^(http|https):\/\/[^\s/$.?#].[^\s]*$/.test(record[field.name])) {
                  errors[field.name] = `${field.name} must be a valid URL`;
                }
                break;
            }
          }
          break;
          
        case 'number':
          if (valueType !== 'number' || isNaN(record[field.name])) {
            errors[field.name] = `${field.name} must be a number`;
          }
          break;
          
        case 'integer':
          if (!Number.isInteger(record[field.name])) {
            errors[field.name] = `${field.name} must be an integer`;
          }
          break;
          
        case 'boolean':
          if (valueType !== 'boolean') {
            errors[field.name] = `${field.name} must be a boolean`;
          }
          break;
          
        case 'array':
          if (!Array.isArray(record[field.name])) {
            errors[field.name] = `${field.name} must be an array`;
          }
          break;
          
        case 'object':
          if (valueType !== 'object' || Array.isArray(record[field.name])) {
            errors[field.name] = `${field.name} must be an object`;
          }
          break;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  /**
   * Converts schema to JSON Schema format
   * @param {Schema} schemaToConvert - Schema to convert
   * @returns {Object} JSON Schema
   */
  const convertToJsonSchema = (schemaToConvert) => {
    const required = schemaToConvert.fields
      .filter(field => field.required)
      .map(field => field.name);
      
    const properties = {};
    
    schemaToConvert.fields.forEach(field => {
      const property = {
        type: field.type,
        description: field.description || undefined
      };
      
      if (field.format) {
        property.format = field.format;
      }
      
      if (field.defaultValue !== undefined) {
        property.default = field.defaultValue;
      }
      
      properties[field.name] = property;
    });
    
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: schemaToConvert.name,
      description: schemaToConvert.description,
      type: 'object',
      required,
      properties
    };
  };
  
  /**
   * Converts JSON Schema to internal schema format
   * @param {Object} jsonSchema - JSON Schema to convert
   * @returns {Schema} Converted schema
   */
  const convertFromJsonSchema = (jsonSchema) => {
    const fields = [];
    const required = jsonSchema.required || [];
    
    Object.entries(jsonSchema.properties || {}).forEach(([name, property]) => {
      fields.push({
        name,
        type: property.type,
        format: property.format,
        required: required.includes(name),
        defaultValue: property.default,
        description: property.description
      });
    });
    
    return {
      name: jsonSchema.title || 'Imported Schema',
      fields,
      description: jsonSchema.description || '',
      metadata: {
        imported: true,
        importedAt: new Date().toISOString(),
        source: 'JSON Schema'
      }
    };
  };
  
  // Return public API
  return {
    // Schema state
    schema,
    fields: schema.fields,
    inferenceState,
    isLoading: inferenceState.isLoading,
    
    // Schema operations
    inferSchema,
    updateSchema,
    addField,
    updateField,
    removeField,
    
    // Validation
    validateData,
    
    // Import/Export
    exportSchema,
    importSchema,
    
    // Advanced operations
    mergeSchemas
  };
}