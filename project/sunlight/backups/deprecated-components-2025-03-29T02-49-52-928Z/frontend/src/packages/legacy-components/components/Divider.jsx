/**
 * @component Divider
 * @description A wrapper around a basic divider element that maintains
 * backward compatibility with Material UI's Divider API.
 *
 * This component serves as a bridge during the migration from Material UI to our custom design system,
 * allowing gradual adoption of the new design system without breaking existing code.
 */

import React from 'react';

const Divider = ({
  orientation = 'horizontal',
  variant = 'fullWidth',
  light = false,
  flexItem = false,
  absolute = false,
  sx,
  className,
  ...rest
}) => {
  // Added display name
  Divider.displayName = 'Divider';

  // Added display name
  Divider.displayName = 'Divider';

  // Added display name
  Divider.displayName = 'Divider';

  // Added display name
  Divider.displayName = 'Divider';

  // Added display name
  Divider.displayName = 'Divider';


  // Prepare style based on orientation and other props
  const baseStyle = {
    margin: '8px 0',
    border: 'none',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    flexShrink: 0,
    ...(light && { borderColor: 'rgba(0, 0, 0, 0.08)' }),
    ...(variant === 'inset' && { marginLeft: '72px' }),
    ...(variant === 'middle' && { marginLeft: '16px', marginRight: '16px' }),
    ...(orientation === 'vertical' && {
      height: 'auto',
      margin: '0 8px',
      borderTop: 'none',
      borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
    }),
    ...(flexItem && { alignSelf: 'stretch', height: 'auto' }),
    ...(absolute && { position: 'absolute', top: 0, left: 0, right: 0 }),
    ...sx,
  };

  return (
    <hr className={`ds-divider ds-divider-legacy ${className || ''}`} style={baseStyle} {...rest} />
  );
};

export default Divider;
