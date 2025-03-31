// ComponentGenerator.js
// Utility to generate component files from templates with production-ready patterns

/**
 * Component types for generator
 * @typedef {'transformation' | 'filter' | 'mapping'} ComponentType
 */

/**
 * Configuration for a component generation
 * @typedef {Object} ComponentConfig
 * @property {string} name - The name of the component
 * @property {ComponentType} type - The type of component to generate
 * @property {string} description - Description of what the component does
 * @property {string} icon - Icon component to use
 * @property {Object} schema - JSON Schema for component configuration
 * @property {Object} initialConfig - Default configuration values
 * @property {string[]} dependencies - Additional dependencies needed
 * @property {Object} [options] - Additional options for the generator
 */

/**
 * Generates a transformation node component based on the configuration
 * @param {ComponentConfig} config Component configuration
 * @returns {string} Generated component code
 */
export function generateTransformationNode(config) {
  const {
    name,
    description,
    icon = 'TransformIcon',
    schema,
    initialConfig = {},
    dependencies = [],
  } = config;

  // Generate imports
  const baseImports = `import React from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ${icon} from '@mui/icons-material/${icon}';
import TransformationNodeTemplate from '../../accelerators/components/TransformationNodeTemplate';
import * as Yup from 'yup';`;

  // Generate additional imports based on dependencies
  const additionalImports = dependencies.map(dep => {
    if (dep.startsWith('@mui/')) {
      const depName = dep.split('/').pop();
      return `import ${depName} from '${dep}';`;
    }
    return `import ${dep} from '${dep}';`;
  }).join('\n');

  // Generate validation schema based on JSON schema
  const validationSchema = generateYupSchemaFromJsonSchema(schema);

  // Generate initial configuration
  const initialConfigStr = JSON.stringify(initialConfig, null, 2);

  // Generate config panel component
  const configPanelComponent = generateConfigPanel(name, schema);

  // Combine all parts into the final component
  return `${baseImports}
${additionalImports}

// Validation schema for ${name}
const validationSchema = ${validationSchema};

// Initial configuration
const initialConfig = ${initialConfigStr};

/**
 * Configuration panel for ${name}
 */
${configPanelComponent}

/**
 * ${name} - ${description}
 * 
 * A production-ready transformation node component for ${description.toLowerCase()}
 */
const ${name} = (props) => {
  return (
    <TransformationNodeTemplate
      title="${formatTitle(name)}"
      icon={${icon}}
      description="${description}"
      configPanel={${name}ConfigPanel}
      validationSchema={validationSchema}
      initialConfig={initialConfig}
      {...props}
    />
  );
};

${name}.propTypes = {
  /** Initial configuration for the component */
  initialConfig: PropTypes.object,
  /** Callback when configuration changes */
  onConfigChange: PropTypes.func,
  /** Whether the component is disabled */
  disabled: PropTypes.bool,
  /** Whether the component is read-only */
  readOnly: PropTypes.bool,
  /** Component ID */
  id: PropTypes.string,
  /** Test ID for testing */
  testId: PropTypes.string,
};

export default React.memo(${name});`;
}

/**
 * Generates a configuration panel component for a transformation node
 * @param {string} nodeName The name of the transformation node
 * @param {Object} schema JSON schema for the configuration
 * @returns {string} Generated configuration panel component code
 */
function generateConfigPanel(nodeName, schema) {
  const properties = schema.properties || {};
  const propertyNames = Object.keys(properties);
  
  // Generate form fields based on schema properties
  const formFields = propertyNames.map(propName => {
    const property = properties[propName];
    const fieldType = mapJsonTypeToFieldType(property.type, property.format);
    const fieldLabel = property.title || formatTitle(propName);
    const fieldDescription = property.description || '';
    const required = (schema.required || []).includes(propName);
    
    return generateFormField(propName, fieldType, fieldLabel, fieldDescription, required);
  }).join('\n    ');

  return `const ${nodeName}ConfigPanel = ({ config, onChange, validationState, disabled, readOnly }) => {
  // Handle changes to form fields
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ ...config, [name]: value });
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    ${formFields}
    </Box>
  );
};

${nodeName}ConfigPanel.propTypes = {
  /** Current configuration */
  config: PropTypes.object.isRequired,
  /** Callback when configuration changes */
  onChange: PropTypes.func.isRequired,
  /** Validation state with errors and warnings */
  validationState: PropTypes.shape({
    isValid: PropTypes.bool.isRequired,
    errors: PropTypes.object.isRequired,
    warnings: PropTypes.object.isRequired,
  }).isRequired,
  /** Whether the configuration panel is disabled */
  disabled: PropTypes.bool,
  /** Whether the configuration panel is read-only */
  readOnly: PropTypes.bool,
};`;
}

/**
 * Generates a form field based on property type
 * @param {string} name Property name
 * @param {string} type Field type
 * @param {string} label Field label
 * @param {string} description Field description
 * @param {boolean} required Whether the field is required
 * @returns {string} Generated form field code
 */
function generateFormField(name, type, label, description, required) {
  switch (type) {
    case 'text':
      return `<TextField
      name="${name}"
      label="${label}"
      value={config.${name} || ''}
      onChange={handleChange}
      error={Boolean(validationState.errors.${name})}
      helperText={validationState.errors.${name} || '${description}'}
      disabled={disabled}
      InputProps={{ readOnly }}
      fullWidth
      required={${required}}
    />`;
      
    case 'number':
      return `<TextField
      name="${name}"
      label="${label}"
      type="number"
      value={config.${name} || ''}
      onChange={handleChange}
      error={Boolean(validationState.errors.${name})}
      helperText={validationState.errors.${name} || '${description}'}
      disabled={disabled}
      InputProps={{ readOnly }}
      fullWidth
      required={${required}}
    />`;
      
    case 'select':
      return `<FormControl fullWidth error={Boolean(validationState.errors.${name})} required={${required}}>
      <InputLabel id="${name}-label">${label}</InputLabel>
      <Select
        labelId="${name}-label"
        name="${name}"
        value={config.${name} || ''}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
      >
        {/* Add options based on your schema enum values */}
        <MenuItem value="">-- Select ${label} --</MenuItem>
      </Select>
    </FormControl>`;
      
    case 'boolean':
      return `<FormControlLabel
      control={
        <Checkbox
          name="${name}"
          checked={Boolean(config.${name})}
          onChange={(e) => onChange({ ...config, ${name}: e.target.checked })}
          disabled={disabled || readOnly}
        />
      }
      label="${label}"
    />`;
      
    default:
      return `<TextField
      name="${name}"
      label="${label}"
      value={config.${name} || ''}
      onChange={handleChange}
      error={Boolean(validationState.errors.${name})}
      helperText={validationState.errors.${name} || '${description}'}
      disabled={disabled}
      InputProps={{ readOnly }}
      fullWidth
      required={${required}}
    />`;
  }
}

/**
 * Maps JSON schema type to field type
 * @param {string} jsonType JSON schema type
 * @param {string} format JSON schema format (optional)
 * @returns {string} Field type
 */
function mapJsonTypeToFieldType(jsonType, format) {
  if (jsonType === 'string') {
    if (format === 'date' || format === 'date-time') {
      return 'date';
    } else if (format === 'email') {
      return 'email';
    } else if (format === 'password') {
      return 'password';
    }
    return 'text';
  } else if (jsonType === 'number' || jsonType === 'integer') {
    return 'number';
  } else if (jsonType === 'boolean') {
    return 'boolean';
  } else if (jsonType === 'array') {
    return 'select';
  } else if (jsonType === 'object') {
    return 'object';
  }
  return 'text';
}

/**
 * Generates a Yup validation schema from a JSON schema
 * @param {Object} jsonSchema JSON schema
 * @returns {string} Yup validation schema code
 */
function generateYupSchemaFromJsonSchema(jsonSchema) {
  const properties = jsonSchema.properties || {};
  const required = jsonSchema.required || [];
  
  const schemaLines = Object.entries(properties).map(([propName, prop]) => {
    const isRequired = required.includes(propName);
    const type = prop.type;
    
    let yupType;
    let constraints = [];
    
    // Map JSON schema types to Yup types
    switch (type) {
      case 'string':
        yupType = 'string()';
        if (prop.minLength) constraints.push(`min(${prop.minLength}, '${propName} must be at least ${prop.minLength} characters')`);
        if (prop.maxLength) constraints.push(`max(${prop.maxLength}, '${propName} must be at most ${prop.maxLength} characters')`);
        if (prop.pattern) constraints.push(`matches(/${prop.pattern}/, '${propName} format is invalid')`);
        if (prop.format === 'email') constraints.push(`email('${propName} must be a valid email')`);
        break;
        
      case 'number':
      case 'integer':
        yupType = type === 'integer' ? 'number().integer()' : 'number()';
        if (prop.minimum !== undefined) constraints.push(`min(${prop.minimum}, '${propName} must be at least ${prop.minimum}')`);
        if (prop.maximum !== undefined) constraints.push(`max(${prop.maximum}, '${propName} must be at most ${prop.maximum}')`);
        break;
        
      case 'boolean':
        yupType = 'boolean()';
        break;
        
      case 'array':
        yupType = 'array()';
        if (prop.minItems) constraints.push(`min(${prop.minItems}, '${propName} must have at least ${prop.minItems} items')`);
        if (prop.maxItems) constraints.push(`max(${prop.maxItems}, '${propName} must have at most ${prop.maxItems} items')`);
        break;
        
      case 'object':
        yupType = 'object()';
        break;
        
      default:
        yupType = 'mixed()';
    }
    
    // Add required constraint if needed
    if (isRequired) {
      constraints.push(`required('${propName} is required')`);
    }
    
    // Build the schema line
    return `  ${propName}: Yup.${yupType}${constraints.length ? '.' + constraints.join('.') : ''}`;
  });
  
  return `Yup.object().shape({
${schemaLines.join(',\n')}
})`;
}

/**
 * Formats a camelCase or snake_case name into a title case string
 * @param {string} name The name to format
 * @returns {string} Formatted title
 */
function formatTitle(name) {
  // Handle camelCase
  const fromCamelCase = name.replace(/([A-Z])/g, ' $1');
  
  // Handle snake_case
  const fromSnakeCase = fromCamelCase.replace(/_/g, ' ');
  
  // Capitalize first letter of each word
  return fromSnakeCase
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generates a component file and writes it to the filesystem
 * @param {ComponentConfig} config Component configuration
 * @param {string} outputPath Output path for the generated file
 * @returns {Promise<void>}
 */
export async function generateComponentFile(config, outputPath) {
  let code;
  
  // Generate code based on component type
  switch (config.type) {
    case 'transformation':
      code = generateTransformationNode(config);
      break;
    case 'filter':
      // TODO: Implement filter node generator
      throw new Error('Filter node generator not implemented yet');
    case 'mapping':
      // TODO: Implement mapping node generator
      throw new Error('Mapping node generator not implemented yet');
    default:
      throw new Error(`Unknown component type: ${config.type}`);
  }
  
  // Write to file system (this would be implemented in a Node.js environment)
  console.log(`Generated component code for ${config.name}`);
  return code;
}

/**
 * Sample usage:
 * 
 * const dataTypeConverterConfig = {
 *   name: 'DataTypeConverter',
 *   type: 'transformation',
 *   description: 'Converts data from one type to another',
 *   icon: 'TransformIcon',
 *   schema: {
 *     type: 'object',
 *     required: ['inputType', 'outputType'],
 *     properties: {
 *       inputType: {
 *         type: 'string',
 *         title: 'Input Type',
 *         description: 'The data type of the input',
 *         enum: ['string', 'number', 'boolean', 'date']
 *       },
 *       outputType: {
 *         type: 'string',
 *         title: 'Output Type',
 *         description: 'The data type to convert to',
 *         enum: ['string', 'number', 'boolean', 'date']
 *       },
 *       formatString: {
 *         type: 'string',
 *         title: 'Format String',
 *         description: 'Format string for date conversion (if applicable)'
 *       }
 *     }
 *   },
 *   initialConfig: {
 *     inputType: 'string',
 *     outputType: 'number',
 *     formatString: ''
 *   },
 *   dependencies: ['@mui/material/Checkbox', '@mui/material/FormControlLabel']
 * };
 * 
 * generateComponentFile(dataTypeConverterConfig, '/components/DataTypeConverter.jsx');
 */