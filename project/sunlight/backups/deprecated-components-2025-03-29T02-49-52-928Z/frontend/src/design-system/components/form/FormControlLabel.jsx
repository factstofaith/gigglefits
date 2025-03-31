/**
 * FormControlLabel component
 * 
 * A design system wrapper around Material UI's FormControlLabel component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiFormControlLabel } from '@design-system';
;

const FormControlLabel = React.forwardRef((props, ref) => {
  FormControlLabel.displayName = 'FormControlLabel';
  
  return <MuiFormControlLabel ref={ref} {...props} />;
});

FormControlLabel.propTypes = {
  children: PropTypes.node
};

export default FormControlLabel;
