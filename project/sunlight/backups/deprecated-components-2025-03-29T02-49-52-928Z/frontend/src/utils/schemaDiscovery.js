/**
 * schemaDiscovery.js
 * 
 * Utility for discovering and analyzing data schemas from various sources.
 * Provides functionality to automatically detect field types, identify relationships,
 * and generate schema definitions for use in the integration platform.
 */

/**
 * Infers the schema from sample data
 * 
 * @param {Array|Object} data - Sample data to analyze
 * @param {Object} options - Discovery options
 * @returns {Object} The discovered schema
 */
export const discoverSchema = (data, options = {}) => {
  // Added display name
  discoverSchema.displayName = 'discoverSchema';

  // Added display name
  discoverSchema.displayName = 'discoverSchema';

  // Added display name
  discoverSchema.displayName = 'discoverSchema';

  // Added display name
  discoverSchema.displayName = 'discoverSchema';

  // Added display name
  discoverSchema.displayName = 'discoverSchema';


  const defaultOptions = {
    sampleSize: 100,                // Maximum number of items to analyze
    typeInferenceThreshold: 0.7,    // Confidence threshold for type inference
    detectRelationships: true,      // Whether to detect relationships between fields
    inferRequired: true,            // Whether to infer if fields are required
    inferNullable: true,            // Whether to infer if fields allow null values
    inferDefaultValues: true,       // Whether to infer default values
    detectPrimaryKeys: true,        // Whether to detect primary keys
    detectForeignKeys: true,        // Whether to detect foreign keys
    maxDepth: 5,                    // Maximum depth for nested objects
    identifyArrayTypes: true,       // Whether to identify types within arrays
    useStrictNumberTypes: false,    // Whether to distinguish between integers and floats
    excludeFields: [],              // Fields to exclude from discovery
    includeFields: null,            // Only include these fields (null means all fields)
    fieldNameMapping: {}            // Map field names to different names
  };
  
  const config = { ...defaultOptions, ...options };
  
  // Handle different data formats
  if (!data) {
    return { fields: [], errors: ['No data provided'] };
  }
  
  // For array data, analyze the first n items according to sample size
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { fields: [], errors: ['Empty array provided'] };
    }
    
    // Limit to sample size
    const sampleData = data.slice(0, config.sampleSize);
    return discoverArraySchema(sampleData, config);
  }
  
  // For object data, analyze the object structure
  if (typeof data === 'object' && data !== null) {
    return discoverObjectSchema(data, config);
  }
  
  // For primitive types, create a simple schema
  return {
    fields: [],
    errors: [`Unsupported data type: ${typeof data}`]
  };
};

/**
 * Discovers schema for an array of objects
 * 
 * @param {Array} data - Array of data items
 * @param {Object} config - Discovery configuration
 * @returns {Object} The discovered schema
 */
const discoverArraySchema = (data, config) => {
  // Added display name
  discoverArraySchema.displayName = 'discoverArraySchema';

  // Added display name
  discoverArraySchema.displayName = 'discoverArraySchema';

  // Added display name
  discoverArraySchema.displayName = 'discoverArraySchema';

  // Added display name
  discoverArraySchema.displayName = 'discoverArraySchema';

  // Added display name
  discoverArraySchema.displayName = 'discoverArraySchema';


  // Initialize tracking for field types and metadata
  const fieldStats = {};
  const errors = [];
  
  // Process each data item
  data.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Item at index ${index} is not an object: ${typeof item}`);
      return;
    }
    
    // Process each field in the item
    Object.entries(item).forEach(([fieldName, value]) => {
      // Skip excluded fields
      if (config.excludeFields.includes(fieldName)) {
        return;
      }
      
      // Skip if we have includeFields and this field is not in it
      if (config.includeFields && !config.includeFields.includes(fieldName)) {
        return;
      }
      
      // Initialize field stats if first time seeing this field
      if (!fieldStats[fieldName]) {
        fieldStats[fieldName] = {
          name: fieldName,
          types: {},
          nullCount: 0,
          totalCount: 0,
          values: new Set(),
          uniqueValues: new Set()
        };
      }
      
      // Update field statistics
      const stats = fieldStats[fieldName];
      stats.totalCount++;
      
      if (value === null) {
        stats.nullCount++;
        return;
      }
      
      // Track the type
      const type = getValueType(value, config);
      if (!stats.types[type]) {
        stats.types[type] = 0;
      }
      stats.types[type]++;
      
      // Track values for analysis
      // For simple types store the actual value, for complex types store a placeholder
      const valueToStore = 
        ['string', 'number', 'boolean', 'null', 'undefined'].includes(type) 
          ? value 
          : `[${type}]`;
      
      stats.values.add(valueToStore);
      
      // For uniqueness detection, convert to string for comparison
      const stringValue = JSON.stringify(valueToStore);
      stats.uniqueValues.add(stringValue);
    });
  });
  
  // Analyze field statistics to determine schema
  const fields = Object.values(fieldStats).map(stats => {
    // Determine the most common type
    let primaryType = 'unknown';
    let maxCount = 0;
    
    Object.entries(stats.types).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        primaryType = type;
      }
    });
    
    // Calculate type confidence
    const typeConfidence = maxCount / stats.totalCount;
    
    // Determine if the field is required
    const isRequired = config.inferRequired && 
      stats.totalCount === data.length && 
      stats.nullCount === 0;
    
    // Determine if the field allows null values
    const isNullable = config.inferNullable && stats.nullCount > 0;
    
    // Check for potential primary key
    const isPrimaryKey = config.detectPrimaryKeys && 
      stats.uniqueValues.size === stats.totalCount &&
      stats.totalCount === data.length &&
      stats.nullCount === 0;
    
    // Get the mapped field name if available
    const mappedName = config.fieldNameMapping[stats.name] || stats.name;
    
    // Create field definition
    return {
      name: mappedName,
      type: primaryType,
      typeConfidence,
      required: isRequired,
      nullable: isNullable,
      isPrimaryKey,
      uniqueValues: stats.uniqueValues.size,
      samples: Array.from(stats.values).slice(0, 5), // Limit to 5 samples
      typeDetails: { ...stats.types }
    };
  });
  
  // Additional schema analysis
  let schemaAnalysis = {};
  
  // Detect relationships (foreign keys) if enabled
  if (config.detectForeignKeys && fields.length > 1) {
    schemaAnalysis.relationships = detectRelationships(fields, data);
  }
  
  // Detect potentially related fields (naming patterns)
  schemaAnalysis.relatedFields = detectRelatedFields(fields);
  
  // Final schema
  return {
    fields,
    errors,
    analysis: schemaAnalysis
  };
};

/**
 * Discovers schema for a single object
 * 
 * @param {Object} data - Object to analyze
 * @param {Object} config - Discovery configuration
 * @param {number} depth - Current recursion depth
 * @returns {Object} The discovered schema
 */
const discoverObjectSchema = (data, config, depth = 0) => {
  // Added display name
  discoverObjectSchema.displayName = 'discoverObjectSchema';

  // Added display name
  discoverObjectSchema.displayName = 'discoverObjectSchema';

  // Added display name
  discoverObjectSchema.displayName = 'discoverObjectSchema';

  // Added display name
  discoverObjectSchema.displayName = 'discoverObjectSchema';

  // Added display name
  discoverObjectSchema.displayName = 'discoverObjectSchema';


  // Prevent excessive recursion
  if (depth >= config.maxDepth) {
    return {
      fields: [{ name: '*', type: 'object', note: 'Max depth reached' }],
      errors: ['Maximum depth reached, nested fields truncated']
    };
  }
  
  const fields = [];
  const errors = [];
  
  // Process each field in the object
  Object.entries(data).forEach(([fieldName, value]) => {
    // Skip excluded fields
    if (config.excludeFields.includes(fieldName)) {
      return;
    }
    
    // Skip if we have includeFields and this field is not in it
    if (config.includeFields && !config.includeFields.includes(fieldName)) {
      return;
    }
    
    // Get the mapped field name if available
    const mappedName = config.fieldNameMapping[fieldName] || fieldName;
    
    // Get the base type
    const type = getValueType(value, config);
    
    // Create base field definition
    const field = {
      name: mappedName,
      type,
      required: config.inferRequired, // Assume required for single object analysis
      nullable: value === null
    };
    
    // For nested objects, recursively discover schema
    if (type === 'object' && value !== null) {
      const nestedSchema = discoverObjectSchema(value, config, depth + 1);
      field.fields = nestedSchema.fields;
      errors.push(...nestedSchema.errors.map(e => `${fieldName}: ${e}`));
    }
    
    // For arrays, analyze the items
    if (type === 'array' && config.identifyArrayTypes) {
      field.items = analyzeArrayItems(value, config, depth + 1);
    }
    
    fields.push(field);
  });
  
  return {
    fields,
    errors
  };
};

/**
 * Analyzes items in an array to determine their type
 * 
 * @param {Array} array - The array to analyze
 * @param {Object} config - Discovery configuration
 * @param {number} depth - Current recursion depth
 * @returns {Object} Type information for array items
 */
const analyzeArrayItems = (array, config, depth) => {
  // Added display name
  analyzeArrayItems.displayName = 'analyzeArrayItems';

  // Added display name
  analyzeArrayItems.displayName = 'analyzeArrayItems';

  // Added display name
  analyzeArrayItems.displayName = 'analyzeArrayItems';

  // Added display name
  analyzeArrayItems.displayName = 'analyzeArrayItems';

  // Added display name
  analyzeArrayItems.displayName = 'analyzeArrayItems';


  if (!Array.isArray(array) || array.length === 0) {
    return { type: 'unknown' };
  }
  
  // Count types in the array
  const typeCounts = {};
  let objectItems = [];
  
  array.slice(0, config.sampleSize).forEach(item => {
    const type = getValueType(item, config);
    
    if (!typeCounts[type]) {
      typeCounts[type] = 0;
    }
    typeCounts[type]++;
    
    // Collect object items for further analysis
    if (type === 'object' && item !== null) {
      objectItems.push(item);
    }
  });
  
  // Find the dominant type
  let primaryType = 'unknown';
  let maxCount = 0;
  
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      primaryType = type;
    }
  });
  
  // For arrays of objects, discover a common schema
  if (primaryType === 'object' && objectItems.length > 0 && depth < config.maxDepth) {
    const nestedSchema = discoverArraySchema(objectItems, {
      ...config,
      maxDepth: config.maxDepth - depth
    });
    
    return {
      type: 'object',
      fields: nestedSchema.fields
    };
  }
  
  // For arrays of primitive types
  return { type: primaryType };
};

/**
 * Gets the type of a value
 * 
 * @param {any} value - The value to analyze
 * @param {Object} config - Discovery configuration
 * @returns {string} The determined type
 */
const getValueType = (value, config) => {
  // Added display name
  getValueType.displayName = 'getValueType';

  // Added display name
  getValueType.displayName = 'getValueType';

  // Added display name
  getValueType.displayName = 'getValueType';

  // Added display name
  getValueType.displayName = 'getValueType';

  // Added display name
  getValueType.displayName = 'getValueType';


  if (value === null) {
    return 'null';
  }
  
  if (value === undefined) {
    return 'undefined';
  }
  
  const type = typeof value;
  
  if (type === 'number') {
    // Distinguish between integer and float if configured
    if (config.useStrictNumberTypes) {
      return Number.isInteger(value) ? 'integer' : 'float';
    }
    return 'number';
  }
  
  if (Array.isArray(value)) {
    return 'array';
  }
  
  if (type === 'object') {
    // Try to identify common object types
    if (value instanceof Date) {
      return 'date';
    }
    
    if (value instanceof RegExp) {
      return 'regex';
    }
    
    // Basic check for buffer or binary
    if (value.buffer && value.byteLength) {
      return 'binary';
    }
    
    return 'object';
  }
  
  return type;
};

/**
 * Detects relationships between fields
 * 
 * @param {Array} fields - Field definitions
 * @param {Array} data - Sample data
 * @returns {Array} Detected relationships
 */
const detectRelationships = (fields, data) => {
  // Added display name
  detectRelationships.displayName = 'detectRelationships';

  // Added display name
  detectRelationships.displayName = 'detectRelationships';

  // Added display name
  detectRelationships.displayName = 'detectRelationships';

  // Added display name
  detectRelationships.displayName = 'detectRelationships';

  // Added display name
  detectRelationships.displayName = 'detectRelationships';


  const relationships = [];
  const primaryKeys = fields.filter(f => f.isPrimaryKey);
  
  // No primary keys found, so can't establish relationships
  if (primaryKeys.length === 0) {
    return relationships;
  }
  
  // Look for fields that might reference primary keys
  primaryKeys.forEach(pk => {
    // Find potential foreign key fields
    fields.forEach(field => {
      // Skip self-references and non-matching types
      if (field.name === pk.name || field.type !== pk.type) {
        return;
      }
      
      // Look for naming patterns that suggest a relationship
      const isNameMatch = 
        field.name === `${pk.name}Id` ||
        field.name === `${pk.name}_id` ||
        field.name.endsWith(`_${pk.name}`) ||
        field.name === pk.name;
      
      if (!isNameMatch) {
        return;
      }
      
      // Check for value overlaps in the data
      let matchCount = 0;
      const pkValues = new Set();
      
      // Collect primary key values
      data.forEach(item => {
        if (item[pk.name] !== null && item[pk.name] !== undefined) {
          pkValues.add(JSON.stringify(item[pk.name]));
        }
      });
      
      // Check if foreign key values exist in primary key values
      data.forEach(item => {
        if (item[field.name] !== null && item[field.name] !== undefined) {
          const fkValue = JSON.stringify(item[field.name]);
          if (pkValues.has(fkValue)) {
            matchCount++;
          }
        }
      });
      
      // If many values match, suggest a relationship
      const matchRatio = matchCount / data.length;
      if (matchRatio > 0.5) {
        relationships.push({
          from: field.name,
          to: pk.name,
          confidence: matchRatio,
          relationship: 'many-to-one'
        });
      }
    });
  });
  
  return relationships;
};

/**
 * Detects related fields based on naming patterns
 * 
 * @param {Array} fields - Field definitions
 * @returns {Array} Groups of related fields
 */
const detectRelatedFields = (fields) => {
  // Added display name
  detectRelatedFields.displayName = 'detectRelatedFields';

  // Added display name
  detectRelatedFields.displayName = 'detectRelatedFields';

  // Added display name
  detectRelatedFields.displayName = 'detectRelatedFields';

  // Added display name
  detectRelatedFields.displayName = 'detectRelatedFields';

  // Added display name
  detectRelatedFields.displayName = 'detectRelatedFields';


  const relatedGroups = [];
  const prefixGroups = {};
  const suffixGroups = {};
  
  // Group by common prefixes and suffixes
  fields.forEach(field => {
    const parts = field.name.split(/[_\-.]/).filter(p => p.length > 0);
    if (parts.length > 1) {
      const prefix = parts[0].toLowerCase();
      const suffix = parts[parts.length - 1].toLowerCase();
      
      if (!prefixGroups[prefix]) {
        prefixGroups[prefix] = [];
      }
      prefixGroups[prefix].push(field.name);
      
      if (!suffixGroups[suffix]) {
        suffixGroups[suffix] = [];
      }
      suffixGroups[suffix].push(field.name);
    }
  });
  
  // Add prefix groups with multiple fields
  Object.entries(prefixGroups).forEach(([prefix, members]) => {
    if (members.length > 1) {
      relatedGroups.push({
        type: 'prefix',
        value: prefix,
        members
      });
    }
  });
  
  // Add suffix groups with multiple fields
  Object.entries(suffixGroups).forEach(([suffix, members]) => {
    if (members.length > 1) {
      relatedGroups.push({
        type: 'suffix',
        value: suffix,
        members
      });
    }
  });
  
  return relatedGroups;
};

/**
 * Formats a discovered schema into a standard schema definition
 * 
 * @param {Object} discoveredSchema - The schema discovered by discoverSchema
 * @param {Object} options - Formatting options
 * @returns {Object} Standardized schema definition
 */
export const formatSchema = (discoveredSchema, options = {}) => {
  // Added display name
  formatSchema.displayName = 'formatSchema';

  // Added display name
  formatSchema.displayName = 'formatSchema';

  // Added display name
  formatSchema.displayName = 'formatSchema';

  // Added display name
  formatSchema.displayName = 'formatSchema';

  // Added display name
  formatSchema.displayName = 'formatSchema';


  const defaultOptions = {
    format: 'standard',       // 'standard', 'json-schema', 'graphql', 'mongoose'
    includeConfidenceScores: false,
    includeAnalysis: false,
    simplifyTypes: true,      // Simplify types to basic set (string, number, boolean, object, array)
    includeExamples: true,
    includeOptional: true,    // Whether to include 'required' field
    excludeFields: []         // Fields to exclude from the output
  };
  
  const config = { ...defaultOptions, ...options };
  
  if (!discoveredSchema || !discoveredSchema.fields) {
    return { error: 'Invalid schema' };
  }
  
  // Handle different output formats
  switch (config.format) {
    case 'json-schema':
      return formatJsonSchema(discoveredSchema, config);
    case 'graphql':
      return formatGraphQLSchema(discoveredSchema, config);
    case 'mongoose':
      return formatMongooseSchema(discoveredSchema, config);
    case 'standard':
    default:
      return formatStandardSchema(discoveredSchema, config);
  }
};

/**
 * Formats schema in the standard TAP format
 * 
 * @param {Object} discoveredSchema - The discovered schema
 * @param {Object} config - Formatting configuration
 * @returns {Object} Formatted schema
 */
const formatStandardSchema = (discoveredSchema, config) => {
  // Added display name
  formatStandardSchema.displayName = 'formatStandardSchema';

  // Added display name
  formatStandardSchema.displayName = 'formatStandardSchema';

  // Added display name
  formatStandardSchema.displayName = 'formatStandardSchema';

  // Added display name
  formatStandardSchema.displayName = 'formatStandardSchema';

  // Added display name
  formatStandardSchema.displayName = 'formatStandardSchema';


  const fields = [];
  
  discoveredSchema.fields.forEach(field => {
    // Skip excluded fields
    if (config.excludeFields.includes(field.name)) {
      return;
    }
    
    // Simplify the type if configured
    let type = field.type;
    if (config.simplifyTypes) {
      type = simplifyType(type);
    }
    
    // Create the basic field definition
    const formattedField = {
      name: field.name,
      type,
      required: field.required
    };
    
    // Add nullable property if applicable
    if (field.nullable) {
      formattedField.nullable = true;
    }
    
    // Add confidence scores if requested
    if (config.includeConfidenceScores) {
      formattedField.typeConfidence = field.typeConfidence;
    }
    
    // Add example values if available and requested
    if (config.includeExamples && field.samples && field.samples.length > 0) {
      formattedField.examples = field.samples;
    }
    
    // Add nested fields for objects
    if (type === 'object' && field.fields) {
      formattedField.fields = field.fields.map(nestedField => {
        // Apply the same formatting to nested fields
        const formatted = {
          name: nestedField.name,
          type: config.simplifyTypes ? simplifyType(nestedField.type) : nestedField.type,
        };
        
        if (config.includeOptional) {
          formatted.required = nestedField.required;
        }
        
        return formatted;
      });
    }
    
    // Add item type for arrays
    if (type === 'array' && field.items) {
      formattedField.items = {
        type: config.simplifyTypes ? simplifyType(field.items.type) : field.items.type
      };
      
      // Include nested fields for arrays of objects
      if (field.items.type === 'object' && field.items.fields) {
        formattedField.items.fields = field.items.fields.map(nestedField => ({
          name: nestedField.name,
          type: config.simplifyTypes ? simplifyType(nestedField.type) : nestedField.type,
          required: nestedField.required
        }));
      }
    }
    
    fields.push(formattedField);
  });
  
  // Create the complete schema
  const schema = { fields };
  
  // Add analysis if requested
  if (config.includeAnalysis && discoveredSchema.analysis) {
    schema.analysis = discoveredSchema.analysis;
  }
  
  return schema;
};

/**
 * Formats schema in JSON Schema format
 * 
 * @param {Object} discoveredSchema - The discovered schema
 * @param {Object} config - Formatting configuration
 * @returns {Object} Formatted schema in JSON Schema format
 */
const formatJsonSchema = (discoveredSchema, config) => {
  // Added display name
  formatJsonSchema.displayName = 'formatJsonSchema';

  // Added display name
  formatJsonSchema.displayName = 'formatJsonSchema';

  // Added display name
  formatJsonSchema.displayName = 'formatJsonSchema';

  // Added display name
  formatJsonSchema.displayName = 'formatJsonSchema';

  // Added display name
  formatJsonSchema.displayName = 'formatJsonSchema';


  const properties = {};
  const required = [];
  
  discoveredSchema.fields.forEach(field => {
    // Skip excluded fields
    if (config.excludeFields.includes(field.name)) {
      return;
    }
    
    // Map field type to JSON Schema type
    const jsonSchemaType = mapTypeToJsonSchema(field.type);
    
    // Create property definition
    properties[field.name] = {
      type: field.nullable ? [jsonSchemaType, 'null'] : jsonSchemaType
    };
    
    // Add example if available
    if (config.includeExamples && field.samples && field.samples.length > 0) {
      properties[field.name].examples = field.samples;
    }
    
    // Handle nested objects
    if (jsonSchemaType === 'object' && field.fields) {
      properties[field.name].properties = {};
      const nestedRequired = [];
      
      field.fields.forEach(nestedField => {
        const nestedType = mapTypeToJsonSchema(nestedField.type);
        properties[field.name].properties[nestedField.name] = {
          type: nestedField.nullable ? [nestedType, 'null'] : nestedType
        };
        
        if (nestedField.required) {
          nestedRequired.push(nestedField.name);
        }
      });
      
      if (nestedRequired.length > 0) {
        properties[field.name].required = nestedRequired;
      }
    }
    
    // Handle arrays
    if (jsonSchemaType === 'array' && field.items) {
      properties[field.name].items = {
        type: mapTypeToJsonSchema(field.items.type)
      };
      
      // Handle arrays of objects
      if (field.items.type === 'object' && field.items.fields) {
        properties[field.name].items.properties = {};
        const nestedRequired = [];
        
        field.items.fields.forEach(nestedField => {
          const nestedType = mapTypeToJsonSchema(nestedField.type);
          properties[field.name].items.properties[nestedField.name] = {
            type: nestedField.nullable ? [nestedType, 'null'] : nestedType
          };
          
          if (nestedField.required) {
            nestedRequired.push(nestedField.name);
          }
        });
        
        if (nestedRequired.length > 0) {
          properties[field.name].items.required = nestedRequired;
        }
      }
    }
    
    // Add to required fields list if applicable
    if (field.required && config.includeOptional) {
      required.push(field.name);
    }
  });
  
  // Create the complete JSON Schema
  const jsonSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties
  };
  
  if (required.length > 0 && config.includeOptional) {
    jsonSchema.required = required;
  }
  
  return jsonSchema;
};

/**
 * Maps a discovered type to a JSON Schema type
 * 
 * @param {string} type - The discovered type
 * @returns {string} The corresponding JSON Schema type
 */
const mapTypeToJsonSchema = (type) => {
  // Added display name
  mapTypeToJsonSchema.displayName = 'mapTypeToJsonSchema';

  // Added display name
  mapTypeToJsonSchema.displayName = 'mapTypeToJsonSchema';

  // Added display name
  mapTypeToJsonSchema.displayName = 'mapTypeToJsonSchema';

  // Added display name
  mapTypeToJsonSchema.displayName = 'mapTypeToJsonSchema';

  // Added display name
  mapTypeToJsonSchema.displayName = 'mapTypeToJsonSchema';


  const typeMap = {
    string: 'string',
    number: 'number',
    integer: 'integer',
    float: 'number',
    boolean: 'boolean',
    object: 'object',
    array: 'array',
    date: 'string',
    regex: 'string',
    binary: 'string',
    null: 'null',
    undefined: 'null',
    unknown: 'string'
  };
  
  return typeMap[type] || 'string';
};

/**
 * Formats schema in GraphQL format
 * 
 * @param {Object} discoveredSchema - The discovered schema
 * @param {Object} config - Formatting configuration
 * @returns {string} Formatted schema in GraphQL format
 */
const formatGraphQLSchema = (discoveredSchema, config) => {
  // Added display name
  formatGraphQLSchema.displayName = 'formatGraphQLSchema';

  // Added display name
  formatGraphQLSchema.displayName = 'formatGraphQLSchema';

  // Added display name
  formatGraphQLSchema.displayName = 'formatGraphQLSchema';

  // Added display name
  formatGraphQLSchema.displayName = 'formatGraphQLSchema';

  // Added display name
  formatGraphQLSchema.displayName = 'formatGraphQLSchema';


  // Generate a type name from the first field name or use "EntityType"
  const typeName = discoveredSchema.fields.length > 0
    ? `${discoveredSchema.fields[0].name.charAt(0).toUpperCase()}${discoveredSchema.fields[0].name.slice(1)}Type`
    : 'EntityType';
  
  let schema = `type ${typeName} {\n`;
  
  discoveredSchema.fields.forEach(field => {
    // Skip excluded fields
    if (config.excludeFields.includes(field.name)) {
      return;
    }
    
    // Map field type to GraphQL type
    const graphqlType = mapTypeToGraphQL(field.type, field);
    
    // Add ! for required fields
    const requiredMark = field.required && !field.nullable ? '!' : '';
    
    // Add field to schema
    schema += `  ${field.name}: ${graphqlType}${requiredMark}\n`;
  });
  
  schema += '}';
  
  return schema;
};

/**
 * Maps a discovered type to a GraphQL type
 * 
 * @param {string} type - The discovered type
 * @param {Object} field - The field definition
 * @returns {string} The corresponding GraphQL type
 */
const mapTypeToGraphQL = (type, field) => {
  // Added display name
  mapTypeToGraphQL.displayName = 'mapTypeToGraphQL';

  // Added display name
  mapTypeToGraphQL.displayName = 'mapTypeToGraphQL';

  // Added display name
  mapTypeToGraphQL.displayName = 'mapTypeToGraphQL';

  // Added display name
  mapTypeToGraphQL.displayName = 'mapTypeToGraphQL';

  // Added display name
  mapTypeToGraphQL.displayName = 'mapTypeToGraphQL';


  const typeMap = {
    string: 'String',
    number: 'Float',
    integer: 'Int',
    float: 'Float',
    boolean: 'Boolean',
    object: 'JSON', // GraphQL doesn't have a native object type
    array: field.items ? `[${mapTypeToGraphQL(field.items.type)}]` : '[String]',
    date: 'DateTime', // Assumes a DateTime scalar type
    regex: 'String',
    binary: 'String',
    null: 'String',
    undefined: 'String',
    unknown: 'String'
  };
  
  return typeMap[type] || 'String';
};

/**
 * Formats schema in Mongoose schema format
 * 
 * @param {Object} discoveredSchema - The discovered schema
 * @param {Object} config - Formatting configuration
 * @returns {string} Formatted schema in Mongoose schema format
 */
const formatMongooseSchema = (discoveredSchema, config) => {
  // Added display name
  formatMongooseSchema.displayName = 'formatMongooseSchema';

  // Added display name
  formatMongooseSchema.displayName = 'formatMongooseSchema';

  // Added display name
  formatMongooseSchema.displayName = 'formatMongooseSchema';

  // Added display name
  formatMongooseSchema.displayName = 'formatMongooseSchema';

  // Added display name
  formatMongooseSchema.displayName = 'formatMongooseSchema';


  let schema = 'const mongoose = require(\'mongoose\');\n\n';
  schema += 'const schema = new mongoose.Schema({\n';
  
  discoveredSchema.fields.forEach(field => {
    // Skip excluded fields
    if (config.excludeFields.includes(field.name)) {
      return;
    }
    
    // Map field type to Mongoose type
    const mongooseType = mapTypeToMongoose(field.type, field);
    
    // Create field definition
    let fieldDef = `  ${field.name}: `;
    
    // Handle complex types
    if (typeof mongooseType === 'object') {
      fieldDef += JSON.stringify(mongooseType, null, 2).replace(/\n/g, '\n  ');
    } 
    // Handle simple types with required
    else if (field.required && config.includeOptional) {
      fieldDef += `{ type: ${mongooseType}, required: true }`;
    }
    // Handle simple types without required
    else {
      fieldDef += mongooseType;
    }
    
    schema += `${fieldDef},\n`;
  });
  
  schema += '});\n\n';
  schema += 'module.exports = mongoose.model(\'Entity\', schema);';
  
  return schema;
};

/**
 * Maps a discovered type to a Mongoose type
 * 
 * @param {string} type - The discovered type
 * @param {Object} field - The field definition
 * @returns {string|Object} The corresponding Mongoose type
 */
const mapTypeToMongoose = (type, field) => {
  // Added display name
  mapTypeToMongoose.displayName = 'mapTypeToMongoose';

  // Added display name
  mapTypeToMongoose.displayName = 'mapTypeToMongoose';

  // Added display name
  mapTypeToMongoose.displayName = 'mapTypeToMongoose';

  // Added display name
  mapTypeToMongoose.displayName = 'mapTypeToMongoose';

  // Added display name
  mapTypeToMongoose.displayName = 'mapTypeToMongoose';


  const typeMap = {
    string: 'String',
    number: 'Number',
    integer: 'Number',
    float: 'Number',
    boolean: 'Boolean',
    date: 'Date',
    binary: 'Buffer',
    null: 'Mixed',
    undefined: 'Mixed',
    unknown: 'Mixed'
  };
  
  // Handle arrays
  if (type === 'array') {
    if (field.items) {
      // Array of objects with defined schema
      if (field.items.type === 'object' && field.items.fields) {
        const subSchema = {};
        
        field.items.fields.forEach(nestedField => {
          const nestedType = mapTypeToMongoose(nestedField.type);
          
          if (nestedField.required && nestedField.type !== 'object' && nestedField.type !== 'array') {
            subSchema[nestedField.name] = { type: nestedType, required: true };
          } else {
            subSchema[nestedField.name] = nestedType;
          }
        });
        
        return [subSchema];
      }
      
      // Array of simple types
      return [typeMap[field.items.type] || 'Mixed'];
    }
    
    // Default array type if items not specified
    return [typeMap.mixed];
  }
  
  // Handle objects
  if (type === 'object' && field.fields) {
    const subSchema = {};
    
    field.fields.forEach(nestedField => {
      const nestedType = mapTypeToMongoose(nestedField.type);
      
      if (nestedField.required && nestedField.type !== 'object' && nestedField.type !== 'array') {
        subSchema[nestedField.name] = { type: nestedType, required: true };
      } else {
        subSchema[nestedField.name] = nestedType;
      }
    });
    
    return subSchema;
  }
  
  return typeMap[type] || 'Mixed';
};

/**
 * Simplifies a type to a base type
 * 
 * @param {string} type - The type to simplify
 * @returns {string} The simplified type
 */
const simplifyType = (type) => {
  // Added display name
  simplifyType.displayName = 'simplifyType';

  // Added display name
  simplifyType.displayName = 'simplifyType';

  // Added display name
  simplifyType.displayName = 'simplifyType';

  // Added display name
  simplifyType.displayName = 'simplifyType';

  // Added display name
  simplifyType.displayName = 'simplifyType';


  const typeMap = {
    string: 'string',
    number: 'number',
    integer: 'number',
    float: 'number',
    boolean: 'boolean',
    object: 'object',
    array: 'array',
    date: 'string',
    regex: 'string',
    binary: 'string',
    null: 'null',
    undefined: 'null',
    unknown: 'string'
  };
  
  return typeMap[type] || 'string';
};

/**
 * Fetch and discover schema from a REST API endpoint
 * 
 * @param {string} url - The API URL to fetch data from
 * @param {Object} options - Schema discovery options
 * @returns {Promise<Object>} The discovered schema
 */
export const discoverSchemaFromApi = async (url, options = {}) => {
  try {
    const response = await fetch(url, options.fetchOptions || {});
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return discoverSchema(data, options.discoveryOptions || {});
  } catch (error) {
    return {
      fields: [],
      errors: [`Failed to discover schema from API: ${error.message}`]
    };
  }
};

/**
 * Discover schema from a database connection
 * 
 * @param {Object} dbConfig - Database connection configuration
 * @param {Object} options - Schema discovery options
 * @returns {Promise<Object>} The discovered schema
 */
export const discoverSchemaFromDatabase = async (dbConfig, options = {}) => {
  // This is a placeholder that would be implemented with specific database adapters
  // For now, we'll return an error
  return {
    fields: [],
    errors: ['Database schema discovery not implemented']
  };
};

/**
 * Merges multiple schemas into a single unified schema
 * 
 * @param {Array} schemas - Array of schemas to merge
 * @param {Object} options - Merge options
 * @returns {Object} The merged schema
 */
export const mergeSchemas = (schemas, options = {}) => {
  // Added display name
  mergeSchemas.displayName = 'mergeSchemas';

  // Added display name
  mergeSchemas.displayName = 'mergeSchemas';

  // Added display name
  mergeSchemas.displayName = 'mergeSchemas';

  // Added display name
  mergeSchemas.displayName = 'mergeSchemas';

  // Added display name
  mergeSchemas.displayName = 'mergeSchemas';


  const defaultOptions = {
    mode: 'union',            // 'union', 'intersection', 'strict'
    resolveConflicts: 'first' // 'first', 'most_common', 'prompt'
  };
  
  const config = { ...defaultOptions, ...options };
  
  // Initialize result
  const mergedSchema = {
    fields: [],
    errors: []
  };
  
  // If no schemas to merge, return empty result
  if (!schemas || schemas.length === 0) {
    mergedSchema.errors.push('No schemas provided for merging');
    return mergedSchema;
  }
  
  // If only one schema, return it directly
  if (schemas.length === 1) {
    return schemas[0];
  }
  
  // Collect all field names across all schemas
  const allFieldNames = new Set();
  const fieldsByName = {};
  
  // First pass: collect all fields
  schemas.forEach(schema => {
    if (!schema || !schema.fields) {
      mergedSchema.errors.push('Invalid schema in merge operation');
      return;
    }
    
    schema.fields.forEach(field => {
      allFieldNames.add(field.name);
      
      if (!fieldsByName[field.name]) {
        fieldsByName[field.name] = [];
      }
      
      fieldsByName[field.name].push(field);
    });
  });
  
  // Second pass: merge fields according to the selected mode
  switch (config.mode) {
    case 'intersection':
      // Only include fields that appear in all schemas
      allFieldNames.forEach(fieldName => {
        if (fieldsByName[fieldName].length === schemas.length) {
          mergedSchema.fields.push(mergeField(fieldName, fieldsByName[fieldName], config));
        }
      });
      break;
      
    case 'strict':
      // Include all fields but mark conflicts as errors
      allFieldNames.forEach(fieldName => {
        const fields = fieldsByName[fieldName];
        
        // Check for conflicts in type
        const types = new Set(fields.map(f => f.type));
        if (types.size > 1) {
          mergedSchema.errors.push(`Type conflict for field '${fieldName}': ${Array.from(types).join(', ')}`);
        }
        
        mergedSchema.fields.push(mergeField(fieldName, fields, config));
      });
      break;
      
    case 'union':
    default:
      // Include all fields from all schemas
      allFieldNames.forEach(fieldName => {
        mergedSchema.fields.push(mergeField(fieldName, fieldsByName[fieldName], config));
      });
      break;
  }
  
  return mergedSchema;
};

/**
 * Merges multiple field definitions into one
 * 
 * @param {string} fieldName - The field name
 * @param {Array} fields - Array of field definitions
 * @param {Object} config - Merge configuration
 * @returns {Object} The merged field
 */
const mergeField = (fieldName, fields, config) => {
  // Added display name
  mergeField.displayName = 'mergeField';

  // Added display name
  mergeField.displayName = 'mergeField';

  // Added display name
  mergeField.displayName = 'mergeField';

  // Added display name
  mergeField.displayName = 'mergeField';

  // Added display name
  mergeField.displayName = 'mergeField';


  // If only one field, return it directly
  if (fields.length === 1) {
    return { ...fields[0] };
  }
  
  // Otherwise, resolve conflicts
  const typeCounts = {};
  fields.forEach(field => {
    if (!typeCounts[field.type]) {
      typeCounts[field.type] = 0;
    }
    typeCounts[field.type]++;
  });
  
  // Determine the merged type based on conflict resolution strategy
  let mergedType;
  switch (config.resolveConflicts) {
    case 'most_common':
      // Use the most common type
      let maxCount = 0;
      Object.entries(typeCounts).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mergedType = type;
        }
      });
      break;
      
    case 'first':
    default:
      // Use the type from the first schema
      mergedType = fields[0].type;
      break;
  }
  
  // Build the merged field
  const mergedField = {
    name: fieldName,
    type: mergedType,
    required: fields.some(f => f.required) // Required if any definition requires it
  };
  
  // Merge nested fields for objects
  if (mergedType === 'object') {
    const objectFields = fields.filter(f => f.type === 'object' && f.fields);
    
    if (objectFields.length > 0) {
      const nestedSchemas = objectFields.map(f => ({ fields: f.fields }));
      const nestedSchema = mergeSchemas(nestedSchemas, config);
      mergedField.fields = nestedSchema.fields;
    }
  }
  
  // Merge item definitions for arrays
  if (mergedType === 'array') {
    const arrayFields = fields.filter(f => f.type === 'array' && f.items);
    
    if (arrayFields.length > 0) {
      // Create a virtual schema for array items and merge them
      const itemSchemas = arrayFields.map(f => {
        if (f.items.type === 'object' && f.items.fields) {
          return { fields: f.items.fields };
        } else {
          return { fields: [{ name: 'value', type: f.items.type }] };
        }
      });
      
      const mergedItemSchema = mergeSchemas(itemSchemas, config);
      
      if (mergedItemSchema.fields.length === 1 && mergedItemSchema.fields[0].name === 'value') {
        // Simple array type
        mergedField.items = { type: mergedItemSchema.fields[0].type };
      } else {
        // Array of objects
        mergedField.items = {
          type: 'object',
          fields: mergedItemSchema.fields
        };
      }
    }
  }
  
  return mergedField;
};

export default {
  discoverSchema,
  formatSchema,
  discoverSchemaFromApi,
  discoverSchemaFromDatabase,
  mergeSchemas
};