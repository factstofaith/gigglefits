import React from 'react';

/**
 * Legacy wrapper for Stack component
 * This provides backward compatibility with Material UI's Stack component
 */
const Stack = ({
  children,
  direction = 'column',
  spacing = 0,
  alignItems,
  justifyContent,
  ...props
}) => {
  // Added display name
  Stack.displayName = 'Stack';

  // Added display name
  Stack.displayName = 'Stack';

  // Added display name
  Stack.displayName = 'Stack';

  // Added display name
  Stack.displayName = 'Stack';

  // Added display name
  Stack.displayName = 'Stack';


  // Convert spacing to pixel value
  const spacingPixels = typeof spacing === 'number' ? spacing * 8 : spacing;

  const style = {
    display: 'flex',
    flexDirection: direction,
    gap: spacingPixels,
    alignItems,
    justifyContent,
    ...props.style,
  };

  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
};

export default Stack;
