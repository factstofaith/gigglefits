import React from 'react';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';

/**
 * Box component for basic layout needs
 */
export const Box = React.forwardRef(
  (
    {
      children,
      component = 'div',
      p,
      px,
      py,
      pt,
      pr,
      pb,
      pl, // padding props
      m,
      mx,
      my,
      mt,
      mr,
      mb,
      ml, // margin props
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight, // dimension props
      display,
      flexDirection,
      flexWrap,
      flexGrow,
      flexShrink, // flex props
      justifyContent,
      alignItems,
      alignContent,
      alignSelf, // flex alignment
      bgcolor,
      color, // color props
      border,
      borderTop,
      borderRight,
      borderBottom,
      borderLeft,
      borderColor,
      borderRadius, // border props
      position,
      top,
      right,
      bottom,
      left,
      zIndex, // position props
      boxShadow, // effects
      overflow,
      overflowX,
      overflowY, // overflow
      style = {},
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { spacing, colors } = theme;

    // Helper to resolve spacing value from theme
    const getSpacing = value => {
      if (value === undefined) return undefined;
      if (typeof value === 'number') return `${value}px`;
      return spacing[value] || value;
    };

    // Helper to resolve color value from theme
    const getColor = value => {
      if (!value) return undefined;

      if (value.includes('.')) {
        const [category, shade] = value.split('.');
        return colors[category]?.[shade] || value;
      }

      return colors[value] || value;
    };

    // Combine all styles
    const combinedStyles = {
      // Padding
      padding: getSpacing(p),
      paddingTop: getSpacing(pt) || getSpacing(py),
      paddingRight: getSpacing(pr) || getSpacing(px),
      paddingBottom: getSpacing(pb) || getSpacing(py),
      paddingLeft: getSpacing(pl) || getSpacing(px),

      // Margin
      margin: getSpacing(m),
      marginTop: getSpacing(mt) || getSpacing(my),
      marginRight: getSpacing(mr) || getSpacing(mx),
      marginBottom: getSpacing(mb) || getSpacing(my),
      marginLeft: getSpacing(ml) || getSpacing(mx),

      // Dimensions
      width,
      height,
      minWidth,
      minHeight,
      maxWidth,
      maxHeight,

      // Flex
      display,
      flexDirection,
      flexWrap,
      flexGrow,
      flexShrink,
      justifyContent,
      alignItems,
      alignContent,
      alignSelf,

      // Colors
      backgroundColor: getColor(bgcolor),
      color: getColor(color),

      // Border
      border,
      borderTop,
      borderRight,
      borderBottom,
      borderLeft,
      borderColor: getColor(borderColor),
      borderRadius,

      // Position
      position,
      top,
      right,
      bottom,
      left,
      zIndex,

      // Effects
      boxShadow,

      // Overflow
      overflow,
      overflowX,
      overflowY,

      ...style,
    };

    // Filter out undefined values
    const filteredStyles = Object.fromEntries(
      Object.entries(combinedStyles).filter(([_, value]) => value !== undefined)
    );

    const Component = component;

    return (
      <Component ref={ref} style={filteredStyles} {...props}>
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';

export default Box;
