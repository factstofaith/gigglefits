/**
 * @component Typography
 * @description A wrapper around the design system Typography component that maintains
 * backward compatibility with Material UI's Typography API.
 *
 * This component serves as a bridge during the migration from Material UI to our custom design system,
 * allowing gradual adoption of the new design system without breaking existing code.
 */

import React from 'react';
import { Typography } from '@design-system/components/core';

const Typography = ({
  variant = 'body1',
  component,
  color = 'textPrimary',
  align = 'inherit',
  gutterBottom = false,
  noWrap = false,
  paragraph = false,
  fontWeight,
  children,
  sx,
  className,
  ...rest
}) => {
  // Added display name
  Typography.displayName = 'Typography';

  // Added display name
  Typography.displayName = 'Typography';

  // Added display name
  Typography.displayName = 'Typography';

  // Added display name
  Typography.displayName = 'Typography';

  // Added display name
  Typography.displayName = 'Typography';


  // Map Material UI color props to design system color values
  const colorMap = {
    textPrimary: 'text.primary',
    textSecondary: 'text.secondary',
    primary: 'primary.main',
    secondary: 'secondary.main',
    error: 'error.main',
    warning: 'warning.main',
    info: 'info.main',
    success: 'success.main',
  };

  const mappedColor = colorMap[color] || color;

  // Create style object from sx prop
  const style = {
    fontWeight,
    ...sx,
  };

  return (
    <Typography
      variant={variant}
      component={component}
      color={mappedColor}
      align={align}
      gutterBottom={gutterBottom}
      noWrap={noWrap}
      paragraph={paragraph}
      className={`ds-typography ds-typography-legacy ${className || ''}`}
      style={style}
      {...rest}
    >
      {children}
    </Typography>
  );
};

export default Typography;
