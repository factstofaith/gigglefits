import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Grid, Typography, Divider, Alert, Switch, FormControlLabel } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import TransformationNodeTemplate from "@/components/TransformationNodeTemplate";
import { useDataTransformation } from "@/hooks/";
import * as Yup from 'yup';
import { Decimal } from 'decimal.js';

// Validation schema for NumericOperation
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const validationSchema = Yup.object().shape({
  inputField: Yup.string().required('Input field is required'),
  outputField: Yup.string(),
  operation: Yup.string().required('Operation is required').oneOf(['add', 'subtract', 'multiply', 'divide', 'modulo', 'power', 'round', 'floor', 'ceil', 'abs', 'negate', 'percentage', 'min', 'max', 'sqrt', 'log', 'exp'], 'Invalid operation'),
  operand: Yup.number().when('operation', {
    is: (op) => ['add', 'subtract', 'multiply', 'divide', 'modulo', 'power', 'percentage', 'min', 'max'].includes(op),
    then: Yup.number().required('Operand is required for this operation'),
    otherwise: Yup.number()
  }),
  precision: Yup.number().min(0, 'Precision must be non-negative').max(20, 'Precision must be at most 20'),
  roundingMode: Yup.string().oneOf(['round', 'floor', 'ceil'], 'Invalid rounding mode'),
  useHighPrecision: Yup.boolean(),
  nullValue: Yup.number(),
  handleErrors: Yup.string().oneOf(['error', 'null', 'fallback'], 'Invalid error handling strategy'),
  fallbackValue: Yup.number().when('handleErrors', {
    is: 'fallback',
    then: Yup.number().required('Fallback value is required when error handling is set to fallback'),
    otherwise: Yup.number()
  })
});

// Initial configuration
const initialConfig = {
  inputField: '',
  outputField: '',
  operation: 'add',
  operand: 0,
  precision: 2,
  roundingMode: 'round',
  useHighPrecision: true,
  nullValue: 0,
  handleErrors: 'error',
  fallbackValue: 0
};

// Numeric operations available in the component
const NUMERIC_OPERATIONS = [{
  value: 'add',
  label: 'Add',
  requiresOperand: true,
  description: 'Add a value to the input number'
}, {
  value: 'subtract',
  label: 'Subtract',
  requiresOperand: true,
  description: 'Subtract a value from the input number'
}, {
  value: 'multiply',
  label: 'Multiply',
  requiresOperand: true,
  description: 'Multiply the input number by a value'
}, {
  value: 'divide',
  label: 'Divide',
  requiresOperand: true,
  description: 'Divide the input number by a value'
}, {
  value: 'modulo',
  label: 'Modulo',
  requiresOperand: true,
  description: 'Get the remainder of division by a value'
}, {
  value: 'power',
  label: 'Power',
  requiresOperand: true,
  description: 'Raise the input number to a power'
}, {
  value: 'percentage',
  label: 'Percentage',
  requiresOperand: true,
  description: 'Calculate a percentage of the input number'
}, {
  value: 'round',
  label: 'Round',
  requiresOperand: false,
  description: 'Round to the nearest integer or decimal place'
}, {
  value: 'floor',
  label: 'Floor',
  requiresOperand: false,
  description: 'Round down to the nearest integer or decimal place'
}, {
  value: 'ceil',
  label: 'Ceiling',
  requiresOperand: false,
  description: 'Round up to the nearest integer or decimal place'
}, {
  value: 'abs',
  label: 'Absolute',
  requiresOperand: false,
  description: 'Get the absolute value'
}, {
  value: 'negate',
  label: 'Negate',
  requiresOperand: false,
  description: 'Change the sign of the value'
}, {
  value: 'min',
  label: 'Minimum',
  requiresOperand: true,
  description: 'Get the minimum of the input number and the operand'
}, {
  value: 'max',
  label: 'Maximum',
  requiresOperand: true,
  description: 'Get the maximum of the input number and the operand'
}, {
  value: 'sqrt',
  label: 'Square Root',
  requiresOperand: false,
  description: 'Calculate the square root of the input number'
}, {
  value: 'log',
  label: 'Logarithm',
  requiresOperand: false,
  description: 'Calculate the natural logarithm of the input number'
}, {
  value: 'exp',
  label: 'Exponential',
  requiresOperand: false,
  description: 'Calculate e raised to the power of the input number'
}];

/**
 * Performs numeric operations with high precision
 * @param {any} input - The input value to operate on
 * @param {object} config - Configuration for the numeric operation
 * @returns {number|null} - The result of the operation
 */
const performNumericOperation = (input, config) => {
  const {
    operation,
    operand,
    precision,
    roundingMode,
    useHighPrecision,
    nullValue,
    handleErrors,
    fallbackValue
  } = config;

  // Handle null, undefined, or non-numeric values
  if (input === null || input === undefined || isNaN(Number(input))) {
    return nullValue;
  }
  try {
    // Use Decimal.js for high precision if enabled, otherwise use native JavaScript
    let result;
    const inputValue = useHighPrecision ? new Decimal(input) : Number(input);
    const operandValue = useHighPrecision ? new Decimal(operand || 0) : Number(operand || 0);
    if (useHighPrecision) {
      // High precision operations with Decimal.js
      switch (operation) {
        case 'add':
          result = inputValue.plus(operandValue);
          break;
        case 'subtract':
          result = inputValue.minus(operandValue);
          break;
        case 'multiply':
          result = inputValue.times(operandValue);
          break;
        case 'divide':
          if (operandValue.isZero()) {
            throw new Error('Division by zero');
          }
          result = inputValue.dividedBy(operandValue);
          break;
        case 'modulo':
          if (operandValue.isZero()) {
            throw new Error('Modulo by zero');
          }
          result = inputValue.modulo(operandValue);
          break;
        case 'power':
          result = inputValue.pow(operandValue);
          break;
        case 'percentage':
          result = inputValue.times(operandValue).dividedBy(100);
          break;
        case 'round':
          result = inputValue.toDecimalPlaces(precision || 0, Decimal.ROUND_HALF_UP);
          break;
        case 'floor':
          result = inputValue.toDecimalPlaces(precision || 0, Decimal.ROUND_DOWN);
          break;
        case 'ceil':
          result = inputValue.toDecimalPlaces(precision || 0, Decimal.ROUND_UP);
          break;
        case 'abs':
          result = inputValue.abs();
          break;
        case 'negate':
          result = inputValue.negated();
          break;
        case 'min':
          result = Decimal.min(inputValue, operandValue);
          break;
        case 'max':
          result = Decimal.max(inputValue, operandValue);
          break;
        case 'sqrt':
          if (inputValue.isNegative()) {
            throw new Error('Cannot calculate square root of negative number');
          }
          result = inputValue.sqrt();
          break;
        case 'log':
          if (inputValue.isNegative() || inputValue.isZero()) {
            throw new Error('Cannot calculate logarithm of zero or negative number');
          }
          result = inputValue.ln();
          break;
        case 'exp':
          result = Decimal.exp(inputValue);
          break;
        default:
          result = inputValue;
      }

      // Apply final rounding based on precision and rounding mode
      switch (roundingMode) {
        case 'round':
          result = result.toDecimalPlaces(precision || 0, Decimal.ROUND_HALF_UP);
          break;
        case 'floor':
          result = result.toDecimalPlaces(precision || 0, Decimal.ROUND_DOWN);
          break;
        case 'ceil':
          result = result.toDecimalPlaces(precision || 0, Decimal.ROUND_UP);
          break;
        default:
          result = result.toDecimalPlaces(precision || 0);
      }

      // Convert back to number
      return result.toNumber();
    } else {
      // Standard JavaScript operations
      switch (operation) {
        case 'add':
          result = inputValue + operandValue;
          break;
        case 'subtract':
          result = inputValue - operandValue;
          break;
        case 'multiply':
          result = inputValue * operandValue;
          break;
        case 'divide':
          if (operandValue === 0) {
            throw new Error('Division by zero');
          }
          result = inputValue / operandValue;
          break;
        case 'modulo':
          if (operandValue === 0) {
            throw new Error('Modulo by zero');
          }
          result = inputValue % operandValue;
          break;
        case 'power':
          result = Math.pow(inputValue, operandValue);
          break;
        case 'percentage':
          result = inputValue * operandValue / 100;
          break;
        case 'round':
          const factor = Math.pow(10, precision || 0);
          result = Math.round(inputValue * factor) / factor;
          break;
        case 'floor':
          const floorFactor = Math.pow(10, precision || 0);
          result = Math.floor(inputValue * floorFactor) / floorFactor;
          break;
        case 'ceil':
          const ceilFactor = Math.pow(10, precision || 0);
          result = Math.ceil(inputValue * ceilFactor) / ceilFactor;
          break;
        case 'abs':
          result = Math.abs(inputValue);
          break;
        case 'negate':
          result = -inputValue;
          break;
        case 'min':
          result = Math.min(inputValue, operandValue);
          break;
        case 'max':
          result = Math.max(inputValue, operandValue);
          break;
        case 'sqrt':
          if (inputValue < 0) {
            throw new Error('Cannot calculate square root of negative number');
          }
          result = Math.sqrt(inputValue);
          break;
        case 'log':
          if (inputValue <= 0) {
            throw new Error('Cannot calculate logarithm of zero or negative number');
          }
          result = Math.log(inputValue);
          break;
        case 'exp':
          result = Math.exp(inputValue);
          break;
        default:
          result = inputValue;
      }

      // Apply final rounding based on precision and rounding mode
      if (precision !== undefined && precision >= 0) {
        const roundFactor = Math.pow(10, precision);
        switch (roundingMode) {
          case 'round':
            result = Math.round(result * roundFactor) / roundFactor;
            break;
          case 'floor':
            result = Math.floor(result * roundFactor) / roundFactor;
            break;
          case 'ceil':
            result = Math.ceil(result * roundFactor) / roundFactor;
            break;
        }
      }
      return result;
    }
  } catch (error) {
    // Handle errors based on the configured strategy
    switch (handleErrors) {
      case 'null':
        return null;
      case 'fallback':
        return fallbackValue;
      case 'error':
      default:
        throw error;
    }
  }
};

/**
 * Configuration panel for NumericOperation
 */
const NumericOperationConfigPanel = ({
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

    // Convert numeric values
    if (['operand', 'precision', 'nullValue', 'fallbackValue'].includes(name)) {
      onChange({
        ...config,
        [name]: value === '' ? '' : Number(value)
      });
    } else {
      onChange({
        ...config,
        [name]: value
      });
    }
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

  // Get the selected operation details
  const selectedOperation = useMemo(() => NUMERIC_OPERATIONS.find((op) => op.value === config.operation) || NUMERIC_OPERATIONS[0], [config.operation]);

  // Show preview of numeric operation
  const numericTransform = useDataTransformation(performNumericOperation);
  const handlePreviewCalculation = useCallback(() => {
    if (!config.inputField) return 'Enter an input field';

    // Sample input value
    const sampleInput = 123.456;
    try {
      const result = performNumericOperation(sampleInput, config);
      return result === null ? 'null' : String(result);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }, [config, numericTransform]);
  const calculationPreview = useMemo(() => {
    return handlePreviewCalculation();
  }, [handlePreviewCalculation]);
  return <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField name="inputField" label="Input Field" value={config.inputField || ''} onChange={handleChange} error={Boolean(validationState.errors.inputField)} helperText={validationState.errors.inputField || 'Field to perform calculation on'} disabled={disabled} InputProps={{
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
        <InputLabel id="operation-label">Numeric Operation</InputLabel>
        <Select labelId="operation-label" name="operation" value={config.operation || 'add'} onChange={handleChange} disabled={disabled} readOnly={readOnly}>

          {NUMERIC_OPERATIONS.map((operation) => <MenuItem key={operation.value} value={operation.value}>
              {operation.label}
            </MenuItem>)}

        </Select>
        <FormHelperText>
          {validationState.errors.operation || selectedOperation.description}
        </FormHelperText>
      </FormControl>
      
      {/* Operation-specific settings */}
      {selectedOperation.requiresOperand && <TextField name="operand" label="Operand" type="number" value={config.operand !== undefined ? config.operand : ''} onChange={handleChange} error={Boolean(validationState.errors.operand)} helperText={validationState.errors.operand || 'Value to use for the calculation'} disabled={disabled} InputProps={{
      readOnly
    }} fullWidth required />}


      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField name="precision" label="Decimal Precision" type="number" value={config.precision !== undefined ? config.precision : 2} onChange={handleChange} error={Boolean(validationState.errors.precision)} helperText={validationState.errors.precision || 'Number of decimal places'} disabled={disabled} InputProps={{
          readOnly
        }} inputProps={{
          min: 0,
          max: 20
        }} fullWidth />

        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={Boolean(validationState.errors.roundingMode)}>
            <InputLabel id="roundingMode-label">Rounding Mode</InputLabel>
            <Select labelId="roundingMode-label" name="roundingMode" value={config.roundingMode || 'round'} onChange={handleChange} disabled={disabled} readOnly={readOnly}>

              <MenuItem value="round">Round</MenuItem>
              <MenuItem value="floor">Floor (Round Down)</MenuItem>
              <MenuItem value="ceil">Ceiling (Round Up)</MenuItem>
            </Select>
            <FormHelperText>
              {validationState.errors.roundingMode || 'How to round decimal values'}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      
      <FormControlLabel control={<Switch name="useHighPrecision" checked={Boolean(config.useHighPrecision)} onChange={handleCheckboxChange} disabled={disabled || readOnly} />} label="Use High Precision Math (Decimal.js)" />

      
      <Divider sx={{
      my: 1
    }} />
      
      <Typography variant="subtitle2" gutterBottom>
        Error Handling
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={Boolean(validationState.errors.handleErrors)}>
            <InputLabel id="handleErrors-label">Error Handling</InputLabel>
            <Select labelId="handleErrors-label" name="handleErrors" value={config.handleErrors || 'error'} onChange={handleChange} disabled={disabled} readOnly={readOnly}>

              <MenuItem value="error">Throw Error</MenuItem>
              <MenuItem value="null">Return Null</MenuItem>
              <MenuItem value="fallback">Use Fallback Value</MenuItem>
            </Select>
            <FormHelperText>
              {validationState.errors.handleErrors || 'How to handle calculation errors'}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="nullValue" label="Null Value Replacement" type="number" value={config.nullValue !== undefined ? config.nullValue : 0} onChange={handleChange} error={Boolean(validationState.errors.nullValue)} helperText={validationState.errors.nullValue || 'Value to use when input is null/undefined/NaN'} disabled={disabled} InputProps={{
          readOnly
        }} fullWidth />

        </Grid>
      </Grid>
      
      {config.handleErrors === 'fallback' && <TextField name="fallbackValue" label="Fallback Value" type="number" value={config.fallbackValue !== undefined ? config.fallbackValue : 0} onChange={handleChange} error={Boolean(validationState.errors.fallbackValue)} helperText={validationState.errors.fallbackValue || 'Value to use when calculation fails'} disabled={disabled} InputProps={{
      readOnly
    }} fullWidth required />}


      
      <Divider sx={{
      my: 1
    }} />
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Calculation Preview
        </Typography>
        <Alert severity="info" sx={{
        mb: 1
      }}>
          Sample calculation with operation: {selectedOperation.label}
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
            <strong>Input:</strong> 123.456
            {selectedOperation.requiresOperand && <strong> {getOperationSymbol(config.operation)} {config.operand}</strong>}

          </Typography>
          <Typography variant="body2" component="div">
            <strong>Output:</strong> {calculationPreview}
          </Typography>
        </Box>
      </Box>
    </Box>;
};

/**
 * Get the mathematical symbol for an operation
 * @param {string} operation - The operation
 * @returns {string} - The symbol
 */
const getOperationSymbol = (operation) => {
  switch (operation) {
    case 'add':
      return '+';
    case 'subtract':
      return '-';
    case 'multiply':
      return '×';
    case 'divide':
      return '÷';
    case 'modulo':
      return '%';
    case 'power':
      return '^';
    case 'percentage':
      return '% of';
    case 'min':
      return 'min with';
    case 'max':
      return 'max with';
    default:
      return '';
  }
};
NumericOperationConfigPanel.propTypes = {
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
 * NumericOperation - Performs mathematical operations on numeric values
 * 
 * A production-ready transformation node component for performing various
 * mathematical operations with high precision and robust error handling.
 */
const NumericOperation = (props) => {
  return <TransformationNodeTemplate title="Numeric Operation" icon={CalculateIcon} description="Performs mathematical operations on numeric values" configPanel={NumericOperationConfigPanel} validationSchema={validationSchema} initialConfig={initialConfig} {...props} />;
};
NumericOperation.propTypes = {
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
export default React.memo(NumericOperation);