/**
 * Form Components with Validation
 * 
 * Reusable form components with built-in validation using Formik and Yup.
 */

import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { TextField, Checkbox, Select, MenuItem, FormControlLabel, Button, FormHelperText, FormControl, InputLabel } from '@mui/material';
import { createValidationSchema } from './validationHelpers';

/**
 * Text Field with validation
 * @param {Object} props - Component props
 * @returns {JSX.Element} Validated text field
 */
export const ValidatedTextField = ({ field, form, label, ...props }) => {
  const { name, value, onChange, onBlur } = field;
  const { errors, touched } = form;
  const errorText = touched[name] && errors[name];
  
  return (
    <TextField
      fullWidth
      id={name}
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={!!errorText}
      helperText={errorText}
      margin="normal"
      {...props}
    />
  );
};

/**
 * Select Field with validation
 * @param {Object} props - Component props
 * @returns {JSX.Element} Validated select field
 */
export const ValidatedSelect = ({ field, form, label, options, ...props }) => {
  const { name, value, onChange, onBlur } = field;
  const { errors, touched } = form;
  const errorText = touched[name] && errors[name];
  
  return (
    <FormControl fullWidth margin="normal" error={!!errorText}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {errorText && <FormHelperText>{errorText}</FormHelperText>}
    </FormControl>
  );
};

/**
 * Checkbox with validation
 * @param {Object} props - Component props
 * @returns {JSX.Element} Validated checkbox
 */
export const ValidatedCheckbox = ({ field, form, label, ...props }) => {
  const { name, value, onChange, onBlur } = field;
  const { errors, touched } = form;
  const errorText = touched[name] && errors[name];
  
  return (
    <FormControl error={!!errorText} margin="normal">
      <FormControlLabel
        control={
          <Checkbox
            id={name}
            name={name}
            checked={value}
            onChange={onChange}
            onBlur={onBlur}
            {...props}
          />
        }
        label={label}
      />
      {errorText && <FormHelperText>{errorText}</FormHelperText>}
    </FormControl>
  );
};

/**
 * Form component with built-in validation
 * @param {Object} props - Component props
 * @returns {JSX.Element} Validated form
 */
export const ValidatedForm = ({ 
  initialValues, 
  validationSchema, 
  onSubmit, 
  children, 
  submitLabel = 'Submit' 
}) => {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema ? 
        (typeof validationSchema === 'object' ? createValidationSchema(validationSchema) : validationSchema) : 
        undefined
      }
      onSubmit={onSubmit}
    >
      {formikProps => (
        <Form>
          {typeof children === 'function' ? children(formikProps) : children}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={formikProps.isSubmitting || !formikProps.isValid}
            sx={{ mt: 2 }}
          >
            {submitLabel}
          </Button>
        </Form>
      )}
    </Formik>
  );
};
