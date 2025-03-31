/**
 * IconButton component
 * 
 * A design system wrapper around Material UI's IconButton component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiIconButton } from '@design-system';
;

const IconButton = React.forwardRef((props, ref) => {
  IconButton.displayName = 'IconButton';
  
  return <MuiIconButton ref={ref} {...props} />;
});

IconButton.propTypes = {
  children: PropTypes.node
};

export default IconButton;
