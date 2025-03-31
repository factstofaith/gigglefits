import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormHelperText,
  Grid,
  Typography,
  Divider,
  Alert,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper
} from '@mui/material';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TransformationNodeTemplate from '../../../../accelerators/components/TransformationNodeTemplate';
import { useDataTransformation } from '../../../../accelerators/hooks';
import * as Yup from 'yup';

// Validation schema for DataCleansing
const validationSchema = Yup.object().shape({
  inputField: Yup.string().required('Input field is required'),
  outputField: Yup.string(),
  cleansingOperations: Yup.array().of(
    Yup.object().shape({
      type: Yup.string().required('Operation type is required').oneOf([
        'trim', 'replace', 'normalize', 'removeNonAlphanumeric', 'removeDiacritics',
        'removeHtml', 'removeEmojis', 'truncate', 'fixEncoding', 'mask',
        'removeExtraSpaces', 'standardizeLineEndings', 'titleCase', 'lowercase', 'uppercase'
      ], 'Invalid operation type'),
      pattern: Yup.string().when('type', {
        is: (type) => ['replace', 'mask'].includes(type),
        then: Yup.string().required('Pattern is required for this operation')
      }),
      replacement: Yup.string().when('type', {
        is: 'replace',
        then: Yup.string()
      }),
      maskChar: Yup.string().when('type', {
        is: 'mask',
        then: Yup.string().max(1, 'Mask character must be a single character').required('Mask character is required')
      }),
      maxLength: Yup.number().when('type', {
        is: 'truncate',
        then: Yup.number().min(1, 'Maximum length must be at least 1').required('Maximum length is required')
      }),
      useRegex: Yup.boolean().when('type', {
        is: 'replace',
        then: Yup.boolean()
      }),
      caseSensitive: Yup.boolean().when('type', {
        is: 'replace',
        then: Yup.boolean()
      })
    })
  ).min(1, 'At least one cleansing operation is required'),
  applyToNullValues: Yup.boolean(),
  treatEmptyAsNull: Yup.boolean(),
  nullReplacement: Yup.string(),
  validateEmail: Yup.boolean(),
  validateUrl: Yup.boolean(),
  validatePhone: Yup.boolean(),
  validatePostalCode: Yup.boolean(),
  region: Yup.string().when(['validatePhone', 'validatePostalCode'], {
    is: (validatePhone, validatePostalCode) => validatePhone || validatePostalCode,
    then: Yup.string().required('Region is required for phone or postal code validation')
  })
});

// Initial configuration
const initialConfig = {
  inputField: '',
  outputField: '',
  cleansingOperations: [
    {
      type: 'trim',
      id: '1'
    }
  ],
  applyToNullValues: false,
  treatEmptyAsNull: true,
  nullReplacement: '',
  validateEmail: false,
  validateUrl: false,
  validatePhone: false,
  validatePostalCode: false,
  region: 'US'
};

// Data cleansing operations available in the component
const CLEANSING_OPERATIONS = [
  { value: 'trim', label: 'Trim Whitespace', description: 'Remove whitespace from both ends of the text' },
  { value: 'replace', label: 'Replace Text', description: 'Replace occurrences of a pattern with replacement text' },
  { value: 'normalize', label: 'Normalize Text', description: 'Standardize text by normalizing whitespace and removing control characters' },
  { value: 'removeNonAlphanumeric', label: 'Remove Non-Alphanumeric', description: 'Remove all non-alphanumeric characters' },
  { value: 'removeDiacritics', label: 'Remove Diacritics', description: 'Remove diacritical marks (accents)' },
  { value: 'removeHtml', label: 'Remove HTML', description: 'Strip HTML/XML tags from text' },
  { value: 'removeEmojis', label: 'Remove Emojis', description: 'Remove emoji characters' },
  { value: 'truncate', label: 'Truncate', description: 'Limit text to a maximum length' },
  { value: 'fixEncoding', label: 'Fix Encoding', description: 'Fix common encoding issues' },
  { value: 'mask', label: 'Mask Sensitive Data', description: 'Replace part of the text with a mask character' },
  { value: 'removeExtraSpaces', label: 'Remove Extra Spaces', description: 'Replace multiple spaces with a single space' },
  { value: 'standardizeLineEndings', label: 'Standardize Line Endings', description: 'Convert all line endings to standard format' },
  { value: 'titleCase', label: 'Title Case', description: 'Convert text to title case (first letter of each word capitalized)' },
  { value: 'lowercase', label: 'Lowercase', description: 'Convert text to lowercase' },
  { value: 'uppercase', label: 'Uppercase', description: 'Convert text to uppercase' }
];

// Regions for phone and postal code validation
const REGIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'EU', label: 'European Union' },
  { value: 'IN', label: 'India' },
  { value: 'CN', label: 'China' },
  { value: 'JP', label: 'Japan' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' }
];

/**
 * Generates a unique ID for an operation
 * @returns {string} A unique ID
 */
const generateOperationId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
};

/**
 * Performs data cleansing operations
 * @param {any} input - The input value to cleanse
 * @param {object} config - Configuration for the data cleansing
 * @returns {string} - The cleansed text
 */
const performDataCleansing = (input, config) => {
  const { 
    cleansingOperations, 
    applyToNullValues,
    treatEmptyAsNull,
    nullReplacement,
    validateEmail,
    validateUrl,
    validatePhone,
    validatePostalCode,
    region
  } = config;

  // Handle null, undefined, or empty values
  if (input === null || input === undefined || 
      (treatEmptyAsNull && typeof input === 'string' && input.trim() === '')) {
    if (applyToNullValues && nullReplacement !== undefined) {
      return nullReplacement;
    }
    return input;
  }

  // Convert input to string if it's not already
  let result = String(input);

  // Apply each cleansing operation in sequence
  cleansingOperations.forEach(operation => {
    switch (operation.type) {
      case 'trim':
        result = result.trim();
        break;
        
      case 'replace':
        if (operation.useRegex) {
          const flags = operation.caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(operation.pattern, flags);
          result = result.replace(regex, operation.replacement || '');
        } else {
          if (operation.caseSensitive) {
            result = result.split(operation.pattern).join(operation.replacement || '');
          } else {
            const escapeRegExp = (string) => {
              return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            };
            const regex = new RegExp(escapeRegExp(operation.pattern), 'gi');
            result = result.replace(regex, operation.replacement || '');
          }
        }
        break;
        
      case 'normalize':
        // Normalize whitespace and remove control characters
        result = result
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
          .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
          .trim();
        break;
        
      case 'removeNonAlphanumeric':
        result = result.replace(/[^a-zA-Z0-9]/g, '');
        break;
        
      case 'removeDiacritics':
        // Remove diacritical marks (accents)
        result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        break;
        
      case 'removeHtml':
        // Strip HTML/XML tags
        result = result.replace(/<[^>]*>/g, '');
        break;
        
      case 'removeEmojis':
        // Remove emoji characters (basic implementation)
        result = result.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
        break;
        
      case 'truncate':
        // Limit text to a maximum length
        if (operation.maxLength && result.length > operation.maxLength) {
          result = result.substring(0, operation.maxLength);
        }
        break;
        
      case 'fixEncoding':
        // Fix common encoding issues
        result = result
          .replace(/Â/g, '') // Remove invisible character often from copy/paste
          .replace(/â€™/g, "'") // Smart single quote
          .replace(/â€œ|â€/g, '"') // Smart double quotes
          .replace(/â€"/g, '–') // Em dash
          .replace(/â€"/g, '-') // En dash
          .replace(/Â©/g, '©') // Copyright
          .replace(/Â®/g, '®') // Registered trademark
          .replace(/â„¢/g, '™'); // Trademark
        break;
        
      case 'mask':
        // Replace part of the text with a mask character
        if (operation.pattern && operation.maskChar) {
          const regex = new RegExp(operation.pattern);
          result = result.replace(regex, (match) => {
            return operation.maskChar.repeat(match.length);
          });
        }
        break;
        
      case 'removeExtraSpaces':
        // Replace multiple spaces with a single space
        result = result.replace(/\s+/g, ' ').trim();
        break;
        
      case 'standardizeLineEndings':
        // Convert all line endings to standard format (LF)
        result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        break;
        
      case 'titleCase':
        // Convert text to title case (first letter of each word capitalized)
        result = result.toLowerCase().replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
        break;
        
      case 'lowercase':
        // Convert text to lowercase
        result = result.toLowerCase();
        break;
        
      case 'uppercase':
        // Convert text to uppercase
        result = result.toUpperCase();
        break;
    }
  });

  // Apply validation if enabled
  if (validateEmail && !validateEmail(result)) {
    // Very simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) {
      result = '';
    }
  }

  if (validateUrl && !validateUrl(result)) {
    try {
      new URL(result);
    } catch (e) {
      result = '';
    }
  }

  if (validatePhone && !validatePhone(result, region)) {
    // Very simple phone validation based on region
    let regex;
    switch (region) {
      case 'US':
        regex = /^\+?1?\s*\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
        break;
      case 'UK':
        regex = /^\+?44\s?(\d{2,5})\s?(\d{3,4})\s?(\d{3,4})$/;
        break;
      default:
        regex = /^\+?[0-9]{7,15}$/;
    }
    if (!regex.test(result)) {
      result = '';
    }
  }

  if (validatePostalCode && !validatePostalCode(result, region)) {
    // Simple postal code validation based on region
    let regex;
    switch (region) {
      case 'US':
        regex = /^\d{5}(-\d{4})?$/;
        break;
      case 'CA':
        regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
        break;
      case 'UK':
        regex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
        break;
      default:
        regex = /^[A-Z0-9]{3,10}$/i;
    }
    if (!regex.test(result)) {
      result = '';
    }
  }

  return result;
};

/**
 * Simple helper functions for validation - these would be more comprehensive in a real implementation
 */
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

const validatePhone = (phone, region) => {
  let regex;
  switch (region) {
    case 'US':
      regex = /^\+?1?\s*\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
      break;
    case 'UK':
      regex = /^\+?44\s?(\d{2,5})\s?(\d{3,4})\s?(\d{3,4})$/;
      break;
    default:
      regex = /^\+?[0-9]{7,15}$/;
  }
  return regex.test(phone);
};

const validatePostalCode = (postalCode, region) => {
  let regex;
  switch (region) {
    case 'US':
      regex = /^\d{5}(-\d{4})?$/;
      break;
    case 'CA':
      regex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      break;
    case 'UK':
      regex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
      break;
    default:
      regex = /^[A-Z0-9]{3,10}$/i;
  }
  return regex.test(postalCode);
};

/**
 * Component for a single cleansing operation configuration
 */
const CleansingOperationConfig = ({ 
  operation, 
  onUpdateOperation, 
  onRemoveOperation, 
  validationState, 
  disabled, 
  readOnly 
}) => {
  // Handle changes to form fields
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    onUpdateOperation({ ...operation, [name]: value });
  }, [operation, onUpdateOperation]);

  // Handle checkbox changes
  const handleCheckboxChange = useCallback((event) => {
    const { name, checked } = event.target;
    onUpdateOperation({ ...operation, [name]: checked });
  }, [operation, onUpdateOperation]);

  // Get validation errors for this operation
  const operationErrors = useMemo(() => {
    if (!validationState.errors.cleansingOperations) return {};
    
    // Find errors related to this operation (based on index or id)
    const operationIndex = validationState.errors.cleansingOperations?.findIndex?.(
      err => err.id === operation.id
    );
    
    return operationIndex >= 0 ? 
      validationState.errors.cleansingOperations[operationIndex] || {} : 
      {};
  }, [validationState.errors.cleansingOperations, operation.id]);

  // Render appropriate fields based on operation type
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={10}>
          <FormControl 
            fullWidth 
            error={Boolean(operationErrors.type)}
            required
          >
            <InputLabel id={`operation-type-label-${operation.id}`}>Operation Type</InputLabel>
            <Select
              labelId={`operation-type-label-${operation.id}`}
              name="type"
              value={operation.type || ''}
              onChange={handleChange}
              disabled={disabled}
              readOnly={readOnly}
            >
              {CLEANSING_OPERATIONS.map(op => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {operationErrors.type || 
                (CLEANSING_OPERATIONS.find(op => op.value === operation.type)?.description || 
                'Select an operation type')}
            </FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={() => onRemoveOperation(operation.id)}
            disabled={disabled || readOnly}
            color="error"
            aria-label="Remove operation"
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
        
        {/* Additional fields based on operation type */}
        {operation.type === 'replace' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                name="pattern"
                label="Search Pattern"
                value={operation.pattern || ''}
                onChange={handleChange}
                error={Boolean(operationErrors.pattern)}
                helperText={operationErrors.pattern || 'Text or pattern to search for'}
                disabled={disabled}
                InputProps={{ readOnly }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="replacement"
                label="Replacement"
                value={operation.replacement || ''}
                onChange={handleChange}
                error={Boolean(operationErrors.replacement)}
                helperText={operationErrors.replacement || 'Text to replace with (leave empty to remove)'}
                disabled={disabled}
                InputProps={{ readOnly }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="useRegex"
                    checked={Boolean(operation.useRegex)}
                    onChange={handleCheckboxChange}
                    disabled={disabled || readOnly}
                  />
                }
                label="Use Regular Expression"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="caseSensitive"
                    checked={operation.caseSensitive !== false} // Default to true
                    onChange={handleCheckboxChange}
                    disabled={disabled || readOnly}
                  />
                }
                label="Case Sensitive"
              />
            </Grid>
          </>
        )}
        
        {operation.type === 'truncate' && (
          <Grid item xs={12}>
            <TextField
              name="maxLength"
              label="Maximum Length"
              type="number"
              value={operation.maxLength || ''}
              onChange={handleChange}
              error={Boolean(operationErrors.maxLength)}
              helperText={operationErrors.maxLength || 'Maximum number of characters to keep'}
              disabled={disabled}
              InputProps={{ readOnly }}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
          </Grid>
        )}
        
        {operation.type === 'mask' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                name="pattern"
                label="Pattern to Mask"
                value={operation.pattern || ''}
                onChange={handleChange}
                error={Boolean(operationErrors.pattern)}
                helperText={operationErrors.pattern || 'Regular expression pattern for text to mask'}
                disabled={disabled}
                InputProps={{ readOnly }}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="maskChar"
                label="Mask Character"
                value={operation.maskChar || ''}
                onChange={handleChange}
                error={Boolean(operationErrors.maskChar)}
                helperText={operationErrors.maskChar || 'Character to use for masking (e.g., *)'}
                disabled={disabled}
                InputProps={{ readOnly }}
                fullWidth
                required
                inputProps={{ maxLength: 1 }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
};

CleansingOperationConfig.propTypes = {
  /** Operation configuration */
  operation: PropTypes.object.isRequired,
  /** Callback when operation is updated */
  onUpdateOperation: PropTypes.func.isRequired,
  /** Callback when operation is removed */
  onRemoveOperation: PropTypes.func.isRequired,
  /** Validation state */
  validationState: PropTypes.shape({
    isValid: PropTypes.bool.isRequired,
    errors: PropTypes.object.isRequired,
    warnings: PropTypes.object.isRequired,
  }).isRequired,
  /** Whether the component is disabled */
  disabled: PropTypes.bool,
  /** Whether the component is read-only */
  readOnly: PropTypes.bool,
};

/**
 * Configuration panel for DataCleansing
 */
const DataCleansingConfigPanel = ({ 
  config, 
  onChange, 
  validationState, 
  disabled, 
  readOnly 
}) => {
  // Local state to manage the sample input text for the preview
  const [sampleInput, setSampleInput] = useState('  This Is SAMPLE text with HTML<b>tags</b> and extra   spaces!  ');
  
  // Handle changes to form fields
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    onChange({ ...config, [name]: value });
  }, [config, onChange]);

  // Handle checkbox changes
  const handleCheckboxChange = useCallback((event) => {
    const { name, checked } = event.target;
    onChange({ ...config, [name]: checked });
  }, [config, onChange]);

  // Handle updating an operation
  const handleUpdateOperation = useCallback((updatedOperation) => {
    const updatedOperations = config.cleansingOperations.map(op => 
      op.id === updatedOperation.id ? updatedOperation : op
    );
    onChange({ ...config, cleansingOperations: updatedOperations });
  }, [config, onChange]);

  // Handle removing an operation
  const handleRemoveOperation = useCallback((operationId) => {
    // Don't remove the last operation
    if (config.cleansingOperations.length <= 1) return;
    
    const updatedOperations = config.cleansingOperations.filter(op => op.id !== operationId);
    onChange({ ...config, cleansingOperations: updatedOperations });
  }, [config, onChange]);

  // Handle adding a new operation
  const handleAddOperation = useCallback(() => {
    const newOperation = {
      type: 'trim',
      id: generateOperationId()
    };
    onChange({ 
      ...config, 
      cleansingOperations: [...(config.cleansingOperations || []), newOperation] 
    });
  }, [config, onChange]);

  // Handle changing the sample input for the preview
  const handleSampleInputChange = useCallback((event) => {
    setSampleInput(event.target.value);
  }, []);

  // Show preview of data cleansing
  const cleansingTransform = useDataTransformation(performDataCleansing);
  
  const cleansingPreview = useMemo(() => {
    try {
      return performDataCleansing(sampleInput, config);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }, [sampleInput, config, cleansingTransform]);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            name="inputField"
            label="Input Field"
            value={config.inputField || ''}
            onChange={handleChange}
            error={Boolean(validationState.errors.inputField)}
            helperText={validationState.errors.inputField || 'Field to cleanse'}
            disabled={disabled}
            InputProps={{ readOnly }}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="outputField"
            label="Output Field (leave empty to overwrite)"
            value={config.outputField || ''}
            onChange={handleChange}
            error={Boolean(validationState.errors.outputField)}
            helperText={validationState.errors.outputField || 'Output field name (optional)'}
            disabled={disabled}
            InputProps={{ readOnly }}
            fullWidth
          />
        </Grid>
      </Grid>
      
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
        Cleansing Operations
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Operations are applied in sequence from top to bottom.
      </Typography>
      
      {/* List of operations */}
      {config.cleansingOperations?.map(operation => (
        <CleansingOperationConfig
          key={operation.id}
          operation={operation}
          onUpdateOperation={handleUpdateOperation}
          onRemoveOperation={handleRemoveOperation}
          validationState={validationState}
          disabled={disabled}
          readOnly={readOnly}
        />
      ))}
      
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddOperation}
        disabled={disabled || readOnly}
        variant="outlined"
        sx={{ alignSelf: 'flex-start', mb: 2 }}
      >
        Add Operation
      </Button>
      
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Null and Empty Value Handling
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                name="applyToNullValues"
                checked={Boolean(config.applyToNullValues)}
                onChange={handleCheckboxChange}
                disabled={disabled || readOnly}
              />
            }
            label="Apply to Null Values"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                name="treatEmptyAsNull"
                checked={config.treatEmptyAsNull !== false} // Default to true
                onChange={handleCheckboxChange}
                disabled={disabled || readOnly}
              />
            }
            label="Treat Empty String as Null"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="nullReplacement"
            label="Null Replacement Value"
            value={config.nullReplacement || ''}
            onChange={handleChange}
            error={Boolean(validationState.errors.nullReplacement)}
            helperText={validationState.errors.nullReplacement || 'Value to use when input is null (leave empty to keep as null)'}
            disabled={disabled || !config.applyToNullValues}
            InputProps={{ readOnly }}
            fullWidth
          />
        </Grid>
      </Grid>
      
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Validation Options
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <FormControlLabel
            control={
              <Switch
                name="validateEmail"
                checked={Boolean(config.validateEmail)}
                onChange={handleCheckboxChange}
                disabled={disabled || readOnly}
              />
            }
            label="Validate Email"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControlLabel
            control={
              <Switch
                name="validateUrl"
                checked={Boolean(config.validateUrl)}
                onChange={handleCheckboxChange}
                disabled={disabled || readOnly}
              />
            }
            label="Validate URL"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControlLabel
            control={
              <Switch
                name="validatePhone"
                checked={Boolean(config.validatePhone)}
                onChange={handleCheckboxChange}
                disabled={disabled || readOnly}
              />
            }
            label="Validate Phone"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControlLabel
            control={
              <Switch
                name="validatePostalCode"
                checked={Boolean(config.validatePostalCode)}
                onChange={handleCheckboxChange}
                disabled={disabled || readOnly}
              />
            }
            label="Validate Postal Code"
          />
        </Grid>
        
        {(config.validatePhone || config.validatePostalCode) && (
          <Grid item xs={12}>
            <FormControl 
              fullWidth 
              error={Boolean(validationState.errors.region)}
              required={config.validatePhone || config.validatePostalCode}
            >
              <InputLabel id="region-label">Region</InputLabel>
              <Select
                labelId="region-label"
                name="region"
                value={config.region || 'US'}
                onChange={handleChange}
                disabled={disabled}
                readOnly={readOnly}
              >
                {REGIONS.map(region => (
                  <MenuItem key={region.value} value={region.value}>
                    {region.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {validationState.errors.region || 'Region for phone or postal code validation'}
              </FormHelperText>
            </FormControl>
          </Grid>
        )}
      </Grid>
      
      <Divider sx={{ my: 1 }} />
      
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Cleansing Preview
        </Typography>
        
        <TextField
          label="Sample Input"
          value={sampleInput}
          onChange={handleSampleInputChange}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
        
        <Alert severity="info" sx={{ mb: 1 }}>
          Preview of data cleansing with {config.cleansingOperations?.length || 0} operation(s)
        </Alert>
        
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.100', 
          borderRadius: 1,
          fontFamily: 'monospace', 
          whiteSpace: 'pre-wrap',
          overflowX: 'auto',
          mb: 1
        }}>
          <Typography variant="body2" component="div">
            <strong>Input:</strong> "{sampleInput}"
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Output:</strong> "{cleansingPreview}"
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Applied operations: {config.cleansingOperations?.map(op => 
            CLEANSING_OPERATIONS.find(item => item.value === op.type)?.label
          ).join(' → ')}
        </Typography>
      </Box>
    </Box>
  );
};

DataCleansingConfigPanel.propTypes = {
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
};

/**
 * DataCleansing - Cleanses and standardizes text data
 * 
 * A production-ready transformation node component for cleansing and 
 * standardizing text data with multiple operations and validation.
 */
const DataCleansing = (props) => {
  return (
    <TransformationNodeTemplate
      title="Data Cleansing"
      icon={CleaningServicesIcon}
      description="Cleanses and standardizes text data"
      configPanel={DataCleansingConfigPanel}
      validationSchema={validationSchema}
      initialConfig={initialConfig}
      {...props}
    />
  );
};

DataCleansing.propTypes = {
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

export default React.memo(DataCleansing);