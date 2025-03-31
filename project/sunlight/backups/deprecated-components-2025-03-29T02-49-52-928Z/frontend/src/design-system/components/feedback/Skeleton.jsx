import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';

/**
 * Skeleton component for displaying loading placeholders for content
 */
const Skeleton = forwardRef(
  (
    {
      variant = 'text',
      width = '100%',
      height,
      animation = 'pulse',
      borderRadius,
      'aria-label': ariaLabel = 'Loading',
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    // Calculate default height based on variant
    const getDefaultHeight = () => {
  // Added display name
  getDefaultHeight.displayName = 'getDefaultHeight';

  // Added display name
  getDefaultHeight.displayName = 'getDefaultHeight';

  // Added display name
  getDefaultHeight.displayName = 'getDefaultHeight';

  // Added display name
  getDefaultHeight.displayName = 'getDefaultHeight';

  // Added display name
  getDefaultHeight.displayName = 'getDefaultHeight';


      switch (variant) {
        case 'text':
          return theme.typography.body1.fontSize * 1.2;
        case 'circular':
          return 40;
        case 'rectangular':
        case 'rounded':
          return 100;
        default:
          return 16;
      }
    };

    // Determine border radius based on variant and provided prop
    const getBorderRadius = () => {
  // Added display name
  getBorderRadius.displayName = 'getBorderRadius';

  // Added display name
  getBorderRadius.displayName = 'getBorderRadius';

  // Added display name
  getBorderRadius.displayName = 'getBorderRadius';

  // Added display name
  getBorderRadius.displayName = 'getBorderRadius';

  // Added display name
  getBorderRadius.displayName = 'getBorderRadius';


      if (borderRadius !== undefined) return borderRadius;

      switch (variant) {
        case 'text':
          return theme.shape.borderRadius / 2;
        case 'circular':
          return '50%';
        case 'rounded':
          return theme.shape.borderRadius;
        case 'rectangular':
        default:
          return 0;
      }
    };

    // Animation keyframes
    const animations = {
      pulse: {
        '@keyframes skeleton-pulse': {
          '0%': { opacity: 0.6 },
          '50%': { opacity: 0.8 },
          '100%': { opacity: 0.6 },
        },
        animation: 'skeleton-pulse 1.5s ease-in-out 0.5s infinite',
      },
      wave: {
        '@keyframes skeleton-wave': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent, ${theme.palette.action.hover}, transparent)`,
          animation: 'skeleton-wave 1.6s linear 0.5s infinite',
        },
      },
      none: {},
    };

    // Component styles
    const componentHeight = height || getDefaultHeight();
    const componentStyle = {
      display: 'block',
      width,
      height: componentHeight,
      backgroundColor: theme.palette.action.hover,
      borderRadius: getBorderRadius(),
      ...animations[animation],
      ...props.style,
    };

    return (
      <span
        ref={ref}
        aria-label={ariaLabel}
        aria-busy="true"
        aria-live="polite"
        role="status&quot;
        style={componentStyle}
        {...props}
      />
    );
  }
);

Skeleton.propTypes = {
  /**
   * The shape of the skeleton. "text' represents a text line, 'rectangular' is a rectangle,
   * 'rounded' is a rectangle with border radius, and 'circular' is a circle.
   */
  variant: PropTypes.oneOf(['text', 'rectangular', 'rounded', 'circular']),

  /**
   * Width of the skeleton. Accepts any CSS value.
   */
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /**
   * Height of the skeleton. Accepts any CSS value.
   */
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /**
   * The animation effect. 'pulse' fades in and out, 'wave' gives a wave effect,
   * 'none' disables animation.
   */
  animation: PropTypes.oneOf(['pulse', 'wave', 'none']),

  /**
   * Border radius of the skeleton. Overrides the default based on variant.
   */
  borderRadius: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /**
   * Accessible label for screen readers.
   */
  'aria-label': PropTypes.string,
};

Skeleton.displayName = 'Skeleton';

export default Skeleton;
