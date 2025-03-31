/**
 * @component CircularProgress
 * @description A wrapper around the design system CircularProgress component that maintains
 * backward compatibility with Material UI's CircularProgress API.
 *
 * This component serves as a bridge during the migration from Material UI to our custom design system,
 * allowing gradual adoption of the new design system without breaking existing code.
 */

import React from 'react';
import { CircularProgress } from '@design-system/components/feedback';

const CircularProgress = ({
  color = 'primary',
  size = 40,
  thickness = 3.6,
  variant = 'indeterminate',
  value = 0,
  valueBuffer,
  disableShrink = false,
  sx,
  ...rest
}) => {
  // Added display name
  CircularProgress.displayName = 'CircularProgress';

  // Added display name
  CircularProgress.displayName = 'CircularProgress';

  // Added display name
  CircularProgress.displayName = 'CircularProgress';

  // Added display name
  CircularProgress.displayName = 'CircularProgress';

  // Added display name
  CircularProgress.displayName = 'CircularProgress';


  // Map Material UI props to design system props
  return (
    <CircularProgress
      color={color}
      size={size}
      thickness={thickness}
      variant={variant}
      value={value}
      valueBuffer={valueBuffer}
      disableShrink={disableShrink}
      className="ds-circular-progress ds-circular-progress-legacy"
      style={sx}
      {...rest}
    />
  );
};

export default CircularProgress;
