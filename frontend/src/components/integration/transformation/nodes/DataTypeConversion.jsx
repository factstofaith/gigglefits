import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Grid, Typography, Divider, Alert } from '@mui/material';
import TransformIcon from '@mui/icons-material/Transform';
import TransformationNodeTemplate from "@/components/TransformationNodeTemplate";
import { useDataTransformation } from "@/hooks/";
import * as Yup from 'yup';

// Validation schema for DataTypeConversion
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const validationSchema = Yup.object().shape({
  inputField: Yup.string().required('Input field is required'),
  outputField: Yup.string(),
  inputType: Yup.string().required('Input type is required'),
  outputType: Yup.string().required('Output type is required'),
  formatString: Yup.string().when(['inputType', 'outputType'], {
    is: (inputType, outputType) => inputType === 'date' || outputType === 'date' || inputType === 'datetime' || outputType === 'datetime',
    then: Yup.string().required('Format string is required when using date types'),
    otherwise: Yup.string()
  }),
  nullPlaceholder: Yup.string(),
  preserveOriginal: Yup.boolean(),
  errorHandling: Yup.string().oneOf(['fail', 'useDefault', 'keepOriginal'], 'Invalid error handling strategy')
});

// Initial configuration
const initialConfig = {
  inputField: '',
  outputField: '',
  inputType: 'string',
  outputType: 'string',
  formatString: '',
  nullPlaceholder: '',
  preserveOriginal: true,
  errorHandling: 'keepOriginal'
};

// Data types supported by the conversion node
const DATA_TYPES = [{
  value: 'string',
  label: 'String (Text)',
  description: 'Text data type'
}, {
  value: 'number',
  label: 'Number',
  description: 'Numeric data type (decimal or integer)'
}, {
  value: 'integer',
  label: 'Integer',
  description: 'Whole number without decimal places'
}, {
  value: 'float',
  label: 'Float',
  description: 'Decimal number'
}, {
  value: 'boolean',
  label: 'Boolean',
  description: 'True/False values'
}, {
  value: 'date',
  label: 'Date',
  description: 'Date without time information'
}, {
  value: 'datetime',
  label: 'DateTime',
  description: 'Date with time information'
}, {
  value: 'array',
  label: 'Array',
  description: 'List of values'
}, {
  value: 'object',
  label: 'Object',
  description: 'Key-value pairs'
}];

/**
 * Performs type conversion between compatible data types
 * @param {any} input - The input value to convert
 * @param {object} config - Configuration for the conversion
 * @returns {any} - The converted value
 */
const performTypeConversion = (input, config) => {
  const {
    inputType,
    outputType,
    formatString,
    nullPlaceholder,
    errorHandling
  } = config;

  // Handle null or undefined values
  if (input === null || input === undefined) {
    return nullPlaceholder || null;
  }
  try {
    // Input type to string conversion first (for consistency)
    let stringValue;
    switch (inputType) {
      case 'number':
      case 'integer':
      case 'float':
        stringValue = String(input);
        break;
      case 'boolean':
        stringValue = input ? 'true' : 'false';
        break;
      case 'date':
      case 'datetime':
        if (input instanceof Date) {
          stringValue = formatString ? new Intl.DateTimeFormat('en-US', JSON.parse(formatString)).format(input) : input.toISOString();
        } else {
          const date = new Date(input);
          stringValue = formatString ? new Intl.DateTimeFormat('en-US', JSON.parse(formatString)).format(date) : date.toISOString();
        }
        break;
      case 'array':
        stringValue = Array.isArray(input) ? JSON.stringify(input) : String(input);
        break;
      case 'object':
        stringValue = typeof input === 'object' ? JSON.stringify(input) : String(input);
        break;
      case 'string':
      default:
        stringValue = String(input);
    }

    // Now convert from string to target type
    switch (outputType) {
      case 'number':
        const num = Number(stringValue);
        if (isNaN(num)) throw new Error(`Cannot convert "${stringValue}" to number`);
        return num;
      case 'integer':
        const int = parseInt(stringValue, 10);
        if (isNaN(int)) throw new Error(`Cannot convert "${stringValue}" to integer`);
        return int;
      case 'float':
        const float = parseFloat(stringValue);
        if (isNaN(float)) throw new Error(`Cannot convert "${stringValue}" to float`);
        return float;
      case 'boolean':
        // Handle various boolean representations
        if (stringValue.toLowerCase() === 'true' || stringValue === '1' || stringValue === 'yes') {
          return true;
        } else if (stringValue.toLowerCase() === 'false' || stringValue === '0' || stringValue === 'no') {
          return false;
        }
        throw new Error(`Cannot convert "${stringValue}" to boolean`);
      case 'date':
      case 'datetime':
        const date = new Date(stringValue);
        if (isNaN(date.getTime())) throw new Error(`Cannot convert "${stringValue}" to date`);
        return date;
      case 'array':
        try {
          if (stringValue.trim().startsWith('[')) {
            return JSON.parse(stringValue);
          } else {
            // Convert comma-separated string to array
            return stringValue.split(',').map((item) => item.trim());
          }
        } catch {
          throw new Error(`Cannot convert "${stringValue}" to array`);
        }
      case 'object':
        try {
          if (stringValue.trim().startsWith('{')) {
            return JSON.parse(stringValue);
          } else {
            throw new Error('String is not in valid JSON object format');
          }
        } catch {
          throw new Error(`Cannot convert "${stringValue}" to object`);
        }
      case 'string':
      default:
        return stringValue;
    }
  } catch (error) {
    // Handle errors based on the configured strategy
    switch (errorHandling) {
      case 'fail':
        throw error;
      case 'useDefault':
        return getDefaultValueForType(outputType);
      case 'keepOriginal':
      default:
        return input;
    }
  }
};

/**
 * Get a default value for a given data type
 * @param {string} type - The data type
 * @returns {any} - A default value for the type
 */
const getDefaultValueForType = (type) => {
  switch (type) {
    case 'string':
      return '';
    case 'number':
    case 'integer':
    case 'float':
      return 0;
    case 'boolean':
      return false;
    case 'date':
    case 'datetime':
      return new Date();
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
};

/**
 * Configuration panel for DataTypeConversion
 */
const DataTypeConversionConfigPanel = ({
  config,
  onChange,
  validationState,
  disabled,
  readOnly
}) => {
  // Handle changes to form fields
  const handleChange = useCallback((event) => {
    const {
      name,
      value
    } = event.target;
    onChange({
      ...config,
      [name]: value
    });
  }, [config, onChange]);

  // Handle checkbox changes
  const handleCheckboxChange = useCallback((event) => {
    const {
      name,
      checked
    } = event.target;
    onChange({
      ...config,
      [name]: checked
    });
  }, [config, onChange]);

  // Determine if format string is required
  const isFormatStringRequired = useMemo(() => {
    return config.inputType === 'date' || config.inputType === 'datetime' || config.outputType === 'date' || config.outputType === 'datetime';
  }, [config.inputType, config.outputType]);

  // Get compatible output types for the selected input type
  const compatibleTypes = useMemo(() => {
    // For simplicity, all types are compatible in this implementation
    // In a real application, you might want to restrict certain conversions
    return DATA_TYPES;
  }, []);

  // Get format string placeholder text
  const getFormatPlaceholder = useCallback(() => {
    if (config.inputType === 'date' || config.outputType === 'date') {
      return '{"year": "numeric", "month": "long", "day": "numeric"}';
    } else if (config.inputType === 'datetime' || config.outputType === 'datetime') {
      return '{"year": "numeric", "month": "long", "day": "numeric", "hour": "numeric", "minute": "numeric"}';
    }
    return '';
  }, [config.inputType, config.outputType]);

  // Show preview of conversion if possible
  const conversionTransform = useDataTransformation(performTypeConversion);
  const handlePreviewConversion = useCallback(() => {
    if (!config.inputField) return 'Enter an input field';
    const sampleValues = {
      string: 'Hello World',
      number: 123.45,
      integer: 42,
      float: 3.14159,
      boolean: true,
      date: new Date('2025-04-01'),
      datetime: new Date('2025-04-01T14:30:00'),
      array: ['a', 'b', 'c'],
      object: {
        name: 'John',
        age: 30
      }
    };
    const sampleInput = sampleValues[config.inputType];
    try {
      return performTypeConversion(sampleInput, config);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }, [config, conversionTransform]);
  const conversionPreview = useMemo(() => {
    return handlePreviewConversion();
  }, [handlePreviewConversion]);
  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField name="inputField" label="Input Field" value={config.inputField || ''} onChange={handleChange} error={Boolean(validationState.errors.inputField)} helperText={validationState.errors.inputField || 'Field to convert'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth required />

        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="outputField" label="Output Field (leave empty to overwrite)" value={config.outputField || ''} onChange={handleChange} error={Boolean(validationState.errors.outputField)} helperText={validationState.errors.outputField || 'Output field name (optional)'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth />

        </Grid>
      </Grid>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={Boolean(validationState.errors.inputType)} required>
            <InputLabel id="inputType-label">Input Type</InputLabel>
            <Select labelId="inputType-label" name="inputType" value={config.inputType || ''} onChange={handleChange} disabled={disabled} readOnly={readOnly}>

              {DATA_TYPES.map((type) => <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>)}

            </Select>
            <FormHelperText>
              {validationState.errors.inputType || 'The source data type'}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={Boolean(validationState.errors.outputType)} required>
            <InputLabel id="outputType-label">Output Type</InputLabel>
            <Select labelId="outputType-label" name="outputType" value={config.outputType || ''} onChange={handleChange} disabled={disabled} readOnly={readOnly}>

              {compatibleTypes.map((type) => <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>)}

            </Select>
            <FormHelperText>
              {validationState.errors.outputType || 'The target data type'}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      
      {isFormatStringRequired && <TextField name="formatString" label="Format String" value={config.formatString || ''} onChange={handleChange} error={Boolean(validationState.errors.formatString)} helperText={validationState.errors.formatString || 'For date/time formatting (Intl.DateTimeFormat options JSON)'} disabled={disabled} InputProps={{
      readOnly
    }} fullWidth placeholder={getFormatPlaceholder()} required={isFormatStringRequired} />}


      
      <TextField name="nullPlaceholder" label="Null Placeholder" value={config.nullPlaceholder || ''} onChange={handleChange} error={Boolean(validationState.errors.nullPlaceholder)} helperText={validationState.errors.nullPlaceholder || 'Value to use when input is null (leave empty to keep as null)'} disabled={disabled} InputProps={{
      readOnly
    }} fullWidth />

      
      <FormControl fullWidth error={Boolean(validationState.errors.errorHandling)}>
        <InputLabel id="errorHandling-label">Error Handling</InputLabel>
        <Select labelId="errorHandling-label" name="errorHandling" value={config.errorHandling || 'keepOriginal'} onChange={handleChange} disabled={disabled} readOnly={readOnly}>

          <MenuItem value="fail">Fail on Error</MenuItem>
          <MenuItem value="useDefault">Use Default Value</MenuItem>
          <MenuItem value="keepOriginal">Keep Original Value</MenuItem>
        </Select>
        <FormHelperText>
          {validationState.errors.errorHandling || 'How to handle conversion errors'}
        </FormHelperText>
      </FormControl>
      
      <Divider sx={{
      my: 1
    }} />
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Conversion Preview
        </Typography>
        <Alert severity="info" sx={{
        mb: 1
      }}>
          Sample {config.inputType} → {config.outputType} conversion
        </Alert>
        <Box sx={{
        p: 1,
        bgcolor: 'grey.100',
        borderRadius: 1,
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        overflowX: 'auto'
      }}>
          {JSON.stringify(conversionPreview, null, 2)}
        </Box>
      </Box>
    </Box>;
};
DataTypeConversionConfigPanel.propTypes = {
  /** Current configuration */
  config: PropTypes.object.isRequired,
  /** Callback when configuration changes */
  onChange: PropTypes.func.isRequired,
  /** Validation state with errors and warnings */
  validationState: PropTypes.shape({
    isValid: PropTypes.bool.isRequired,
    errors: PropTypes.object.isRequired,
    warnings: PropTypes.object.isRequired
  }).isRequired,
  /** Whether the configuration panel is disabled */
  disabled: PropTypes.bool,
  /** Whether the configuration panel is read-only */
  readOnly: PropTypes.bool
};

/**
 * DataTypeConversion - Converts data from one type to another
 * 
 * A production-ready transformation node component for converting data between different types
 */
const DataTypeConversion = (props) => {
  return <TransformationNodeTemplate title="Data Type Conversion" icon={TransformIcon} description="Converts data from one type to another" configPanel={DataTypeConversionConfigPanel} validationSchema={validationSchema} initialConfig={initialConfig} {...props} />;
};
DataTypeConversion.propTypes = {
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
  testId: PropTypes.string
};
export default React.memo(DataTypeConversion);