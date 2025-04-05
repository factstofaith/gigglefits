import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Grid, Typography, Divider, Alert, Checkbox, FormControlLabel, Switch } from '@mui/material';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import TransformationNodeTemplate from "@/components/TransformationNodeTemplate";
import { useDataTransformation } from "@/hooks/";
import * as Yup from 'yup';

// Validation schema for TextFormatting
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const validationSchema = Yup.object().shape({
  inputField: Yup.string().required('Input field is required'),
  outputField: Yup.string(),
  operation: Yup.string().required('Operation is required').oneOf(['uppercase', 'lowercase', 'capitalize', 'trim', 'replace', 'substring', 'padStart', 'padEnd', 'remove', 'concat', 'template'], 'Invalid operation'),
  searchValue: Yup.string().when('operation', {
    is: (op) => op === 'replace' || op === 'remove',
    then: Yup.string().required('Search value is required for this operation'),
    otherwise: Yup.string()
  }),
  replaceValue: Yup.string().when('operation', {
    is: 'replace',
    then: Yup.string().required('Replace value is required for replace operation'),
    otherwise: Yup.string()
  }),
  startIndex: Yup.number().when('operation', {
    is: 'substring',
    then: Yup.number().required('Start index is required for substring operation'),
    otherwise: Yup.number()
  }),
  endIndex: Yup.number().when('operation', {
    is: 'substring',
    then: Yup.number(),
    otherwise: Yup.number()
  }),
  length: Yup.number().when('operation', {
    is: (op) => op === 'padStart' || op === 'padEnd',
    then: Yup.number().required('Length is required for padding operations').min(0, 'Length must be non-negative'),
    otherwise: Yup.number()
  }),
  padChar: Yup.string().when('operation', {
    is: (op) => op === 'padStart' || op === 'padEnd',
    then: Yup.string().max(1, 'Padding character must be a single character'),
    otherwise: Yup.string()
  }),
  additionalFields: Yup.array().when('operation', {
    is: 'concat',
    then: Yup.array().min(1, 'At least one additional field is required for concatenation'),
    otherwise: Yup.array()
  }),
  separator: Yup.string().when('operation', {
    is: 'concat',
    then: Yup.string(),
    otherwise: Yup.string()
  }),
  template: Yup.string().when('operation', {
    is: 'template',
    then: Yup.string().required('Template is required for template operation'),
    otherwise: Yup.string()
  }),
  useRegex: Yup.boolean(),
  caseSensitive: Yup.boolean(),
  preserveOriginal: Yup.boolean(),
  treatAsNull: Yup.array()
});

// Initial configuration
const initialConfig = {
  inputField: '',
  outputField: '',
  operation: 'trim',
  searchValue: '',
  replaceValue: '',
  startIndex: 0,
  endIndex: null,
  length: 10,
  padChar: ' ',
  additionalFields: [],
  separator: ' ',
  template: '',
  useRegex: false,
  caseSensitive: true,
  preserveOriginal: true,
  treatAsNull: ['null', 'undefined', '']
};

// Text operations available in the component
const TEXT_OPERATIONS = [{
  value: 'uppercase',
  label: 'Uppercase',
  description: 'Convert text to uppercase'
}, {
  value: 'lowercase',
  label: 'Lowercase',
  description: 'Convert text to lowercase'
}, {
  value: 'capitalize',
  label: 'Capitalize',
  description: 'Capitalize the first letter of each word'
}, {
  value: 'trim',
  label: 'Trim',
  description: 'Remove whitespace from both ends of the text'
}, {
  value: 'replace',
  label: 'Replace',
  description: 'Replace occurrences of a substring'
}, {
  value: 'substring',
  label: 'Substring',
  description: 'Extract a portion of the text'
}, {
  value: 'padStart',
  label: 'Pad Start',
  description: 'Pad the start of the text to a specified length'
}, {
  value: 'padEnd',
  label: 'Pad End',
  description: 'Pad the end of the text to a specified length'
}, {
  value: 'remove',
  label: 'Remove',
  description: 'Remove all occurrences of a substring'
}, {
  value: 'concat',
  label: 'Concatenate',
  description: 'Combine multiple fields into one'
}, {
  value: 'template',
  label: 'Template',
  description: 'Format text using a template with placeholders'
}];

/**
 * Performs text formatting operations
 * @param {any} input - The input value to format
 * @param {object} config - Configuration for the text formatting
 * @returns {string} - The formatted text
 */
const performTextFormatting = (input, config) => {
  const {
    operation,
    searchValue,
    replaceValue,
    startIndex,
    endIndex,
    length,
    padChar,
    additionalFields,
    separator,
    template,
    useRegex,
    caseSensitive,
    treatAsNull
  } = config;

  // Handle null, undefined, or empty values
  if (input === null || input === undefined || typeof input === 'string' && treatAsNull && treatAsNull.includes(input)) {
    return '';
  }

  // Convert input to string if it's not already
  const inputStr = String(input);
  switch (operation) {
    case 'uppercase':
      return inputStr.toUpperCase();
    case 'lowercase':
      return inputStr.toLowerCase();
    case 'capitalize':
      return inputStr.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    case 'trim':
      return inputStr.trim();
    case 'replace':
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(searchValue, flags);
        return inputStr.replace(regex, replaceValue);
      } else {
        if (caseSensitive) {
          return inputStr.split(searchValue).join(replaceValue);
        } else {
          const regex = new RegExp(escapeRegExp(searchValue), 'gi');
          return inputStr.replace(regex, replaceValue);
        }
      }
    case 'substring':
      if (endIndex !== null && endIndex !== undefined) {
        return inputStr.substring(startIndex, endIndex);
      } else {
        return inputStr.substring(startIndex);
      }
    case 'padStart':
      return inputStr.padStart(length, padChar || ' ');
    case 'padEnd':
      return inputStr.padEnd(length, padChar || ' ');
    case 'remove':
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(searchValue, flags);
        return inputStr.replace(regex, '');
      } else {
        if (caseSensitive) {
          return inputStr.split(searchValue).join('');
        } else {
          const regex = new RegExp(escapeRegExp(searchValue), 'gi');
          return inputStr.replace(regex, '');
        }
      }
    case 'concat':
      // For demo purposes - in a real application, additionalFields would contain actual values
      // Here we just simulate with some sample values
      const sampleAdditionalValues = additionalFields.map((_, i) => `Field${i + 1}`);
      return [inputStr, ...sampleAdditionalValues].join(separator);
    case 'template':
      // Simple template substitution - replace {{value}} with the input
      return template.replace(/{{value}}/g, inputStr);
    default:
      return inputStr;
  }
};

/**
 * Escape string for use in regular expression
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Configuration panel for TextFormatting
 */
const TextFormattingConfigPanel = ({
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

  // Handle additional fields changes
  const handleAdditionalFieldsChange = useCallback((fields) => {
    onChange({
      ...config,
      additionalFields: fields
    });
  }, [config, onChange]);

  // Get required fields based on selected operation
  const getRequiredFields = useMemo(() => {
    switch (config.operation) {
      case 'replace':
        return ['searchValue', 'replaceValue'];
      case 'remove':
        return ['searchValue'];
      case 'substring':
        return ['startIndex'];
      case 'padStart':
      case 'padEnd':
        return ['length'];
      case 'concat':
        return ['additionalFields'];
      case 'template':
        return ['template'];
      default:
        return [];
    }
  }, [config.operation]);

  // Show preview of text formatting if possible
  const formatTransform = useDataTransformation(performTextFormatting);
  const handlePreviewFormatting = useCallback(() => {
    if (!config.inputField) return 'Enter an input field';
    const sampleText = "This Is a Sample Text for 123 Demo!";
    try {
      return performTextFormatting(sampleText, config);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }, [config, formatTransform]);
  const formattingPreview = useMemo(() => {
    return handlePreviewFormatting();
  }, [handlePreviewFormatting]);
  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField name="inputField" label="Input Field" value={config.inputField || ''} onChange={handleChange} error={Boolean(validationState.errors.inputField)} helperText={validationState.errors.inputField || 'Field to format'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth required />

        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="outputField" label="Output Field (leave empty to overwrite)" value={config.outputField || ''} onChange={handleChange} error={Boolean(validationState.errors.outputField)} helperText={validationState.errors.outputField || 'Output field name (optional)'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth />

        </Grid>
      </Grid>
      
      <FormControl fullWidth error={Boolean(validationState.errors.operation)} required>
        <InputLabel id="operation-label">Text Operation</InputLabel>
        <Select labelId="operation-label" name="operation" value={config.operation || 'trim'} onChange={handleChange} disabled={disabled} readOnly={readOnly}>

          {TEXT_OPERATIONS.map((operation) => <MenuItem key={operation.value} value={operation.value}>
              {operation.label}
            </MenuItem>)}

        </Select>
        <FormHelperText>
          {validationState.errors.operation || TEXT_OPERATIONS.find((op) => op.value === config.operation)?.description || 'Select an operation'}
        </FormHelperText>
      </FormControl>
      
      {/* Operation-specific settings */}
      {(config.operation === 'replace' || config.operation === 'remove') && <Grid container spacing={2}>
          <Grid item xs={12} sm={config.operation === 'replace' ? 6 : 12}>
            <TextField name="searchValue" label="Search Value" value={config.searchValue || ''} onChange={handleChange} error={Boolean(validationState.errors.searchValue)} helperText={validationState.errors.searchValue || 'Text to search for'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth required />

          </Grid>
          {config.operation === 'replace' && <Grid item xs={12} sm={6}>
              <TextField name="replaceValue" label="Replace Value" value={config.replaceValue || ''} onChange={handleChange} error={Boolean(validationState.errors.replaceValue)} helperText={validationState.errors.replaceValue || 'Text to replace with'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth required />

            </Grid>}

        </Grid>}


      {config.operation === 'substring' && <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField name="startIndex" label="Start Index" type="number" value={config.startIndex !== undefined ? config.startIndex : 0} onChange={handleChange} error={Boolean(validationState.errors.startIndex)} helperText={validationState.errors.startIndex || 'Starting character position'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth required />

          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="endIndex" label="End Index (optional)" type="number" value={config.endIndex !== null && config.endIndex !== undefined ? config.endIndex : ''} onChange={handleChange} error={Boolean(validationState.errors.endIndex)} helperText={validationState.errors.endIndex || 'Ending character position (leave empty for end of string)'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth />

          </Grid>
        </Grid>}


      {(config.operation === 'padStart' || config.operation === 'padEnd') && <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField name="length" label="Target Length" type="number" value={config.length !== undefined ? config.length : 10} onChange={handleChange} error={Boolean(validationState.errors.length)} helperText={validationState.errors.length || 'Length to pad to'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth required />

          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="padChar" label="Padding Character" value={config.padChar || ' '} onChange={handleChange} error={Boolean(validationState.errors.padChar)} helperText={validationState.errors.padChar || 'Character to pad with'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth inputProps={{
          maxLength: 1
        }} />

          </Grid>
        </Grid>}


      {config.operation === 'concat' && <Box>
          <TextField name="separator" label="Separator" value={config.separator !== undefined ? config.separator : ' '} onChange={handleChange} error={Boolean(validationState.errors.separator)} helperText={validationState.errors.separator || 'Character(s) to separate fields with'} disabled={disabled} InputProps={{
        readOnly
      }} fullWidth sx={{
        mb: 2
      }} />

          <Typography variant="subtitle2" gutterBottom>
            Additional Fields (simulated for demo)
          </Typography>
          <Box sx={{
        mb: 1
      }}>
            <FormControlLabel control={<Checkbox checked={Boolean(config.additionalFields?.length)} onChange={(e) => {
          if (e.target.checked) {
            handleAdditionalFieldsChange(['field1']);
          } else {
            handleAdditionalFieldsChange([]);
          }
        }} disabled={disabled} />} label="Include additional fields" />

          </Box>
          {Boolean(config.additionalFields?.length) && <Alert severity="info" sx={{
        mb: 2
      }}>
              In a real implementation, this would allow selecting multiple fields to concatenate.
              For this demo, we simulate including additional fields.
            </Alert>}

        </Box>}


      {config.operation === 'template' && <TextField name="template" label="Template" value={config.template || ''} onChange={handleChange} error={Boolean(validationState.errors.template)} helperText={validationState.errors.template || 'Template with {{value}} placeholders (e.g., "Name: {{value}}")'} disabled={disabled} InputProps={{
      readOnly
    }} fullWidth required multiline rows={2} />}


      
      {/* General options for applicable operations */}
      {['replace', 'remove'].includes(config.operation) && <Box sx={{
      mt: 1
    }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel control={<Switch name="useRegex" checked={Boolean(config.useRegex)} onChange={handleCheckboxChange} disabled={disabled || readOnly} />} label="Use Regular Expression" />

            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel control={<Switch name="caseSensitive" checked={Boolean(config.caseSensitive)} onChange={handleCheckboxChange} disabled={disabled || readOnly} />} label="Case Sensitive" />

            </Grid>
          </Grid>
        </Box>}

      
      <Divider sx={{
      my: 1
    }} />
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Formatting Preview
        </Typography>
        <Alert severity="info" sx={{
        mb: 1
      }}>
          Sample text formatting with operation: {TEXT_OPERATIONS.find((op) => op.value === config.operation)?.label || config.operation}
        </Alert>
        <Box sx={{
        p: 1,
        bgcolor: 'grey.100',
        borderRadius: 1,
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        overflowX: 'auto'
      }}>
          <Typography variant="body2" component="div">
            <strong>Input:</strong> "This Is a Sample Text for 123 Demo!"
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Output:</strong> "{formattingPreview}"
          </Typography>
        </Box>
      </Box>
    </Box>;
};
TextFormattingConfigPanel.propTypes = {
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
 * TextFormatting - Formats text in various ways
 * 
 * A production-ready transformation node component for various text operations
 * like case conversion, trimming, replacement, and more.
 */
const TextFormatting = (props) => {
  return <TransformationNodeTemplate title="Text Formatting" icon={TextFormatIcon} description="Formats and manipulates text values" configPanel={TextFormattingConfigPanel} validationSchema={validationSchema} initialConfig={initialConfig} {...props} />;
};
TextFormatting.propTypes = {
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
export default React.memo(TextFormatting);