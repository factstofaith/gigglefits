/**
 * Divider component
 * 
 * A design system wrapper around Material UI's Divider component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiDivider } from '@design-system';
;

const Divider = React.forwardRef((props, ref) => {
  Divider.displayName = 'Divider';
  
  return <MuiDivider ref={ref} {...props} />;
});

Divider.propTypes = {
  children: PropTypes.node
};

export default Divider;
