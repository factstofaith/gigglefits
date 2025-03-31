import React from 'react';

/**
 * Legacy wrapper for ListItemText component
 * This provides backward compatibility with Material UI's ListItemText component
 */
const ListItemText = ({ primary, secondary, ...props }) => {
  // Added display name
  ListItemText.displayName = 'ListItemText';

  // Added display name
  ListItemText.displayName = 'ListItemText';

  // Added display name
  ListItemText.displayName = 'ListItemText';

  // Added display name
  ListItemText.displayName = 'ListItemText';

  // Added display name
  ListItemText.displayName = 'ListItemText';


  const style = {
    flex: '1 1 auto',
    minWidth: 0,
    marginTop: '4px',
    marginBottom: '4px',
    ...props.style,
  };

  const primaryStyle = {
    fontSize: '1rem',
    lineHeight: '1.5',
    display: 'block',
    fontWeight: '400',
  };

  const secondaryStyle = {
    fontSize: '0.875rem',
    lineHeight: '1.43',
    display: 'block',
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '400',
  };

  return (
    <div style={style} {...props}>
      {primary && <div style={primaryStyle}>{primary}</div>}
      {secondary && <div style={secondaryStyle}>{secondary}</div>}
    </div>
  );
};

export default ListItemText;
