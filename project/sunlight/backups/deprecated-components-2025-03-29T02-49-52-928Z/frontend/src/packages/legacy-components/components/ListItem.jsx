import React from 'react';

/**
 * Legacy wrapper for ListItem component
 * This provides backward compatibility with Material UI's ListItem component
 */
const ListItem = ({ children, button, divider, ...props }) => {
  // Added display name
  ListItem.displayName = 'ListItem';

  // Added display name
  ListItem.displayName = 'ListItem';

  // Added display name
  ListItem.displayName = 'ListItem';

  // Added display name
  ListItem.displayName = 'ListItem';

  // Added display name
  ListItem.displayName = 'ListItem';


  const style = {
    display: 'flex',
    position: 'relative',
    padding: '8px 16px',
    alignItems: 'center',
    ...(button && {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
      },
    }),
    ...(divider && {
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    }),
    ...props.style,
  };

  return (
    <li style={style} {...props}>
      {children}
    </li>
  );
};

export default ListItem;
