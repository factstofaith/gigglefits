import React from 'react';

/**
 * Legacy wrapper for CardContent component
 * This provides backward compatibility with Material UI's CardContent component
 */
const CardContent = ({ children, ...props }) => {
  // Added display name
  CardContent.displayName = 'CardContent';

  // Added display name
  CardContent.displayName = 'CardContent';

  // Added display name
  CardContent.displayName = 'CardContent';

  // Added display name
  CardContent.displayName = 'CardContent';

  // Added display name
  CardContent.displayName = 'CardContent';


  const style = {
    padding: '16px',
    ...props.style,
  };

  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
};

export default CardContent;
