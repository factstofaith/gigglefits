/**
 * @component Paper
 * @description A wrapper component that provides backward compatibility with Material UI's Paper API.
 * This uses the Card component from the design system which serves a similar purpose.
 *
 * This component serves as a bridge during the migration from Material UI to our custom design system,
 * allowing gradual adoption of the new design system without breaking existing code.
 */

import React from 'react';
import { Card } from '@design-system/components/layout';

const Paper = ({
  elevation = 1,
  variant = 'elevation',
  square = false,
  children,
  sx,
  className,
  ...rest
}) => {
  // Added display name
  Paper.displayName = 'Paper';

  // Added display name
  Paper.displayName = 'Paper';

  // Added display name
  Paper.displayName = 'Paper';

  // Added display name
  Paper.displayName = 'Paper';

  // Added display name
  Paper.displayName = 'Paper';


  // Map Material UI Paper props to design system Card props
  // In our design system, Card is the equivalent of Paper

  // Convert elevation to appropriate shadow
  const shadowMap = {
    0: 'none',
    1: 'sm',
    2: 'md',
    3: 'md',
    4: 'lg',
    5: 'lg',
    6: 'xl',
    7: 'xl',
    8: 'xl',
    9: 'xl',
    10: 'xl',
    11: 'xl',
    12: 'xl',
    13: 'xl',
    14: 'xl',
    15: 'xl',
    16: 'xl',
    17: 'xl',
    18: 'xl',
    19: 'xl',
    20: 'xl',
    21: 'xl',
    22: 'xl',
    23: 'xl',
    24: 'xl',
  };

  const shadow = shadowMap[elevation] || 'md';

  return (
    <Card
      variant={variant === 'outlined' ? 'outlined' : 'elevated'}
      shadow={variant === 'outlined' ? 'none' : shadow}
      borderRadius={square ? '0' : undefined}
      className={`ds-paper ds-paper-legacy ${className || ''}`}
      style={sx}
      {...rest}
    >
      {children}
    </Card>
  );
};

export default Paper;
