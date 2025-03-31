import React from 'react';
import { FormControl as MuiFormControl } from '@mui/material';

/**
 * FormControl component - wraps form elements to provide context for them
 * @param {Object} props - Component props
 * @returns {React.ReactElement} FormControl component
 */
const FormControl = (props) => {
  // Added display name
  FormControl.displayName = 'FormControl';

  // Added display name
  FormControl.displayName = 'FormControl';

  return <MuiFormControl {...props} />;
};

export default FormControl;