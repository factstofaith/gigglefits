import React from 'react';

/**
 * Legacy wrapper for ListItemIcon component
 * This provides backward compatibility with Material UI's ListItemIcon component
 */
const ListItemIcon = ({ children, ...props }) => {
  // Added display name
  ListItemIcon.displayName = 'ListItemIcon';

  // Added display name
  ListItemIcon.displayName = 'ListItemIcon';

  // Added display name
  ListItemIcon.displayName = 'ListItemIcon';

  // Added display name
  ListItemIcon.displayName = 'ListItemIcon';

  // Added display name
  ListItemIcon.displayName = 'ListItemIcon';


  const style = {
    minWidth: '56px',
    display: 'flex',
    alignItems: 'center',
    ...props.style,
  };

  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
};

export default ListItemIcon;
