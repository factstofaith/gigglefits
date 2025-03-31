/**
 * InputLabel component
 * 
 * A design system wrapper around Material UI's InputLabel component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiInputLabel } from '@design-system';
;

const InputLabel = React.forwardRef((props, ref) => {
  InputLabel.displayName = 'InputLabel';
  
  return <MuiInputLabel ref={ref} {...props} />;
});

InputLabel.propTypes = {
  children: PropTypes.node
};

export default InputLabel;
