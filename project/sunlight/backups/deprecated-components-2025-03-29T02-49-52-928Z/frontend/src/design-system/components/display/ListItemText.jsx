/**
 * ListItemText component
 * 
 * A design system wrapper around Material UI's ListItemText component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiListItemText } from '@design-system';
;

const ListItemText = React.forwardRef((props, ref) => {
  ListItemText.displayName = 'ListItemText';
  
  return <MuiListItemText ref={ref} {...props} />;
});

ListItemText.propTypes = {
  children: PropTypes.node
};

export default ListItemText;
