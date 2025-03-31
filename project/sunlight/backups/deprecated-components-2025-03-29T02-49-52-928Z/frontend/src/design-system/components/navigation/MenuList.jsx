/**
 * MenuList component
 * 
 * A design system wrapper around Material UI's MenuList component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiMenuList } from '@design-system';
;

const MenuList = React.forwardRef((props, ref) => {
  MenuList.displayName = 'MenuList';
  
  return <MuiMenuList ref={ref} {...props} />;
});

MenuList.propTypes = {
  children: PropTypes.node
};

export default MenuList;
