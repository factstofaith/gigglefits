import React from 'react';
import { ListItem as MuiListItem } from '@mui/material';

/**
 * ListItem component for use within Lists
 * @param {Object} props - Component props
 * @returns {React.ReactElement} ListItem component
 */
const ListItem = (props) => {
  // Added display name
  ListItem.displayName = 'ListItem';

  // Added display name
  ListItem.displayName = 'ListItem';

  return <MuiListItem {...props} />;
};

export default ListItem;