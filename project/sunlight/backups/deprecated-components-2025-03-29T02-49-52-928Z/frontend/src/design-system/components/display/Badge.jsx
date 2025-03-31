import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';

/**
 * Badge component generates a small badge to the top-right of its child
 */
const Badge = forwardRef(
  (
    {
      children,
      content,
      color = 'primary',
      variant = 'standard',
      max = 99,
      showZero = false,
      dot = false,
      overlap = 'rectangular',
      horizontal = 'right',
      vertical = 'top',
      invisible = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Don't render the badge if it's empty or zero (unless showZero is true)
    const shouldDisplay = () => {
  // Added display name
  shouldDisplay.displayName = 'shouldDisplay';

  // Added display name
  shouldDisplay.displayName = 'shouldDisplay';

  // Added display name
  shouldDisplay.displayName = 'shouldDisplay';

  // Added display name
  shouldDisplay.displayName = 'shouldDisplay';

  // Added display name
  shouldDisplay.displayName = 'shouldDisplay';


      if (invisible) return false;
      if (typeof content === 'number') {
        return content > 0 || showZero;
      }
      return content !== undefined && content !== null && content !== '';
    };

    // Format the content (e.g., if it's a number greater than max)
    const formattedContent = () => {
  // Added display name
  formattedContent.displayName = 'formattedContent';

  // Added display name
  formattedContent.displayName = 'formattedContent';

  // Added display name
  formattedContent.displayName = 'formattedContent';

  // Added display name
  formattedContent.displayName = 'formattedContent';

  // Added display name
  formattedContent.displayName = 'formattedContent';


      if (dot) return '';
      if (typeof content === 'number' && content > max) {
        return `${max}+`;
      }
      return content;
    };

    // Calculate position styles based on positioning properties
    const getPositionStyles = () => {
  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';

  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';

  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';

  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';

  // Added display name
  getPositionStyles.displayName = 'getPositionStyles';


      const positions = {
        horizontal: {
          right: { right: '-12px' },
          left: { left: '-12px' },
        },
        vertical: {
          top: { top: '-8px' },
          bottom: { bottom: '-8px' },
        },
        overlap: {
          rectangular: {},
          circular: {},
        },
      };

      // Adjustments for circular overlap
      if (overlap === 'circular') {
        if (horizontal === 'right') {
          positions.horizontal.right.right = '14%';
        } else {
          positions.horizontal.left.left = '14%';
        }

        if (vertical === 'top') {
          positions.vertical.top.top = '14%';
        } else {
          positions.vertical.bottom.bottom = '14%';
        }
      }

      return {
        ...positions.horizontal[horizontal],
        ...positions.vertical[vertical],
      };
    };

    // Calculate color styles based on variant
    const getColorStyles = () => {
  // Added display name
  getColorStyles.displayName = 'getColorStyles';

  // Added display name
  getColorStyles.displayName = 'getColorStyles';

  // Added display name
  getColorStyles.displayName = 'getColorStyles';

  // Added display name
  getColorStyles.displayName = 'getColorStyles';

  // Added display name
  getColorStyles.displayName = 'getColorStyles';


      const selectedColor = theme.palette[color] || theme.palette.primary;

      const colorStyles = {
        standard: {
          backgroundColor: selectedColor.main,
          color: selectedColor.contrastText,
        },
        dot: {
          backgroundColor: selectedColor.main,
        },
        outlined: {
          backgroundColor: theme.palette.background.paper,
          color: selectedColor.main,
          border: `1px solid ${selectedColor.main}`,
        },
      };

      return dot ? colorStyles.dot : colorStyles[variant] || colorStyles.standard;
    };

    // Base badge styles
    const badgeStyle = shouldDisplay()
      ? {
          position: 'absolute',
          display: 'flex',
          flexFlow: 'row wrap',
          justifyContent: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.fontWeightMedium,
          fontSize: theme.typography.caption.fontSize,
          minWidth: dot ? '8px' : '20px',
          lineHeight: 1,
          padding: dot ? 0 : '0 6px',
          height: dot ? '8px' : '20px',
          borderRadius: '10px',
          zIndex: 1,
          transition: 'transform 225ms cubic-bezier(0.4, 0, 0.2, 1)',
          ...getPositionStyles(),
          ...getColorStyles(),
          ...props.style,
        }
      : {};

    // Container styles
    const containerStyle = {
      position: 'relative',
      display: 'inline-flex',
      verticalAlign: 'middle',
      flexShrink: 0,
    };

    return (
      <span ref={ref} style={containerStyle} {...props}>
        {children}
        {shouldDisplay() && <span style={badgeStyle}>{formattedContent()}</span>}
      </span>
    );
  }
);

Badge.propTypes = {
  /**
   * The content to display inside the badge
   */
  content: PropTypes.node,

  /**
   * The badge will be added relative to this node
   */
  children: PropTypes.node,

  /**
   * The color of the badge
   */
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),

  /**
   * The variant of the badge
   */
  variant: PropTypes.oneOf(['standard', 'outlined']),

  /**
   * Max value to show when content is a number
   */
  max: PropTypes.number,

  /**
   * Show badge even if content is 0
   */
  showZero: PropTypes.bool,

  /**
   * Show badge as a dot, ignoring the content
   */
  dot: PropTypes.bool,

  /**
   * Type of badge overlap
   */
  overlap: PropTypes.oneOf(['rectangular', 'circular']),

  /**
   * Horizontal position
   */
  horizontal: PropTypes.oneOf(['left', 'right']),

  /**
   * Vertical position
   */
  vertical: PropTypes.oneOf(['top', 'bottom']),

  /**
   * Hide the badge
   */
  invisible: PropTypes.bool,
};

Badge.displayName = 'Badge';

export default Badge;
