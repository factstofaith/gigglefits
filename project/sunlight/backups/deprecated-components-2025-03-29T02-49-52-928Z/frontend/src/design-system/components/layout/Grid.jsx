import React from 'react';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';

/**
 * Grid component for responsive layouts
 * Use Grid.Container as a container and Grid.Item as child items
 */
export const Grid = {}; // Placeholder for main export

/**
 * Grid Container component
 */
const GridContainer = React.forwardRef(
  (
    {
      children,
      spacing = 'md',
      rowSpacing,
      columnSpacing,
      justifyContent = 'flex-start',
      alignItems = 'flex-start',
      style = {},
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { spacing: spacingValues } = theme;

    // Determine spacing values
    const getSpacingValue = value => {
      if (value === undefined) return undefined;
      if (typeof value === 'number') return `${value}px`;
      return spacingValues[value] || value;
    };

    const rowGap = getSpacingValue(rowSpacing !== undefined ? rowSpacing : spacing);
    const columnGap = getSpacingValue(columnSpacing !== undefined ? columnSpacing : spacing);

    // Container styles
    const containerStyles = {
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: rowGap && columnGap ? `${rowGap} ${columnGap}` : undefined,
      rowGap,
      columnGap,
      justifyContent,
      alignItems,
      ...style,
    };

    return (
      <div ref={ref} style={containerStyles} {...props}>
        {children}
      </div>
    );
  }
);

/**
 * Grid Item component
 */
const GridItem = React.forwardRef(
  (
    {
      children,
      xs = 12, // Full width by default (like 12/12 cols)
      sm,
      md,
      lg,
      xl,
      style = {},
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { breakpoints } = theme;

    // Helper to create grid column styles
    const getGridColumn = value => {
      if (value === undefined) return undefined;
      if (value === 'auto') return 'auto';
      if (value === true) return 'auto';
      if (value === false) return 'none';
      return `span ${value}`;
    };

    // Generate responsive styles
    const generateResponsiveStyles = () => {
  // Added display name
  generateResponsiveStyles.displayName = 'generateResponsiveStyles';

  // Added display name
  generateResponsiveStyles.displayName = 'generateResponsiveStyles';

  // Added display name
  generateResponsiveStyles.displayName = 'generateResponsiveStyles';

  // Added display name
  generateResponsiveStyles.displayName = 'generateResponsiveStyles';

  // Added display name
  generateResponsiveStyles.displayName = 'generateResponsiveStyles';


      // Base style for xs (smallest breakpoint)
      const gridColumnValue = getGridColumn(xs);
      const baseStyles = {
        gridColumn: gridColumnValue,
      };

      // Add media queries for other breakpoints
      const mediaQueries = {};

      if (sm !== undefined) {
        mediaQueries[breakpoints.up('sm')] = {
          gridColumn: getGridColumn(sm),
        };
      }

      if (md !== undefined) {
        mediaQueries[breakpoints.up('md')] = {
          gridColumn: getGridColumn(md),
        };
      }

      if (lg !== undefined) {
        mediaQueries[breakpoints.up('lg')] = {
          gridColumn: getGridColumn(lg),
        };
      }

      if (xl !== undefined) {
        mediaQueries[breakpoints.up('xl')] = {
          gridColumn: getGridColumn(xl),
        };
      }

      return { ...baseStyles, ...mediaQueries };
    };

    // Combine responsive grid styles with custom styles
    const gridItemStyles = {
      ...generateResponsiveStyles(),
      ...style,
    };

    return (
      <div ref={ref} style={gridItemStyles} {...props}>
        {children}
      </div>
    );
  }
);

// Assign components to the main Grid export
Grid.Container = GridContainer;
Grid.Item = GridItem;

// Add display names
GridContainer.displayName = 'Grid.Container';
GridItem.displayName = 'Grid.Item';

export default Grid;
