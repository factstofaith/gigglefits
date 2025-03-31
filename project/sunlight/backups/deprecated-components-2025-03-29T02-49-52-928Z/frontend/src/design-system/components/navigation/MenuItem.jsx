/**
 * MenuItem component
 * 
 * A design system wrapper around Material UI's MenuItem component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiMenuItem } from '@design-system';
;

const MenuItem = React.forwardRef((props, ref) => {
  MenuItem.displayName = 'MenuItem';
  
  return <MuiMenuItem ref={ref} {...props} />;
});

MenuItem.propTypes = {
  children: PropTypes.node
};

export default MenuItem;
