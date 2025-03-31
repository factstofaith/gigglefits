/**
 * @component Grid
 * @description A wrapper around the design system Grid component that maintains
 * backward compatibility with Material UI's Grid API.
 *
 * This component serves as a bridge during the migration from Material UI to our custom design system,
 * allowing gradual adoption of the new design system without breaking existing code.
 */

import React from 'react';
import { Grid } from '@design-system/components/layout';

const Grid = ({
  container = false,
  item = false,
  xs,
  sm,
  md,
  lg,
  xl,
  spacing = 0,
  direction = 'row',
  justifyContent = 'flex-start',
  alignItems = 'stretch',
  wrap = 'wrap',
  children,
  sx,
  className,
  ...rest
}) => {
  // Added display name
  Grid.displayName = 'Grid';

  // Added display name
  Grid.displayName = 'Grid';

  // Added display name
  Grid.displayName = 'Grid';

  // Added display name
  Grid.displayName = 'Grid';

  // Added display name
  Grid.displayName = 'Grid';


  return (
    <Grid
      container={container}
      item={item}
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      spacing={spacing}
      direction={direction}
      justifyContent={justifyContent}
      alignItems={alignItems}
      wrap={wrap}
      className={`ds-grid ds-grid-legacy ${className || ''}`}
      style={sx}
      {...rest}
    >
      {children}
    </Grid>
  );
};

export default Grid;
