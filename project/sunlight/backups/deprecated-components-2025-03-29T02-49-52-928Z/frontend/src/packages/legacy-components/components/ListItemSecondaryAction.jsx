import React from 'react';

/**
 * Legacy wrapper for ListItemSecondaryAction component
 * This provides backward compatibility with Material UI's ListItemSecondaryAction component
 */
const ListItemSecondaryAction = ({ children, ...props }) => {
  // Added display name
  ListItemSecondaryAction.displayName = 'ListItemSecondaryAction';

  // Added display name
  ListItemSecondaryAction.displayName = 'ListItemSecondaryAction';

  // Added display name
  ListItemSecondaryAction.displayName = 'ListItemSecondaryAction';

  // Added display name
  ListItemSecondaryAction.displayName = 'ListItemSecondaryAction';

  // Added display name
  ListItemSecondaryAction.displayName = 'ListItemSecondaryAction';


  const style = {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    ...props.style,
  };

  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
};

export default ListItemSecondaryAction;
