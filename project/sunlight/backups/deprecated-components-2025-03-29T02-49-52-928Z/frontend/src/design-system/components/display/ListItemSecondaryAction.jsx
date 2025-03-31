/**
 * ListItemSecondaryAction component
 * 
 * A design system wrapper around Material UI's ListItemSecondaryAction component
 */
import React from 'react';
import PropTypes from 'prop-types';
import { MuiListItemSecondaryAction } from '@design-system';
;

const ListItemSecondaryAction = React.forwardRef((props, ref) => {
  ListItemSecondaryAction.displayName = 'ListItemSecondaryAction';
  
  return <MuiListItemSecondaryAction ref={ref} {...props} />;
});

ListItemSecondaryAction.propTypes = {
  children: PropTypes.node
};

export default ListItemSecondaryAction;
