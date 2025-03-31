/**
 * @component Box
 * @description A wrapper around the design system Box component that maintains
 * backward compatibility with Material UI's Box API.
 *
 * This component serves as a bridge during the migration from Material UI to our custom design system,
 * allowing gradual adoption of the new design system without breaking existing code.
 */

import React from 'react';
import { Box as DSBox } from '@design-system/components/layout';
import { MuiBox } from '../../design-system';
;

const Box = ({ component = 'div', children, sx, className, ...rest }) => {
  // Added display name
  Box.displayName = 'Box';

  // Added display name
  Box.displayName = 'Box';

  // Added display name
  Box.displayName = 'Box';

  // Added display name
  Box.displayName = 'Box';

  // Added display name
  Box.displayName = 'Box';


  return (
    <DSBox as={component} className={`ds-box ds-box-legacy ${className || ''}`} style={sx} {...rest}>
      {children}
    </DSBox>
  );
};

export default Box;
