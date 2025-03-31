import React from 'react';

/**
 * Legacy wrapper for InputAdornment component
 * This provides backward compatibility with Material UI's InputAdornment component
 */
const InputAdornment = ({ position = 'start', children, ...props }) => {
  // Added display name
  InputAdornment.displayName = 'InputAdornment';

  // Added display name
  InputAdornment.displayName = 'InputAdornment';

  // Added display name
  InputAdornment.displayName = 'InputAdornment';

  // Added display name
  InputAdornment.displayName = 'InputAdornment';

  // Added display name
  InputAdornment.displayName = 'InputAdornment';


  // Simplified wrapper - in a real implementation, this would be more sophisticated
  const style = {
    display: 'flex',
    alignItems: 'center',
    ...(position === 'start' ? { marginRight: '8px' } : { marginLeft: '8px' }),
    ...props.style,
  };

  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
};

export default InputAdornment;
