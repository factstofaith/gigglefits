import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';
import { MuiLinearProgress } from '@design-system';
import LinearProgress from '@mui/material/LinearProgress';
;

/**
 * LinearProgress component for displaying loading progress in a horizontal bar format
 */
const CustomLinearProgress = forwardRef(
  (
    {
      variant = 'indeterminate',
      color = 'primary',
      value = 0,
      min = 0,
      max = 100,
      height = 4,
      label = null,
      showPercentage = false,
      'aria-label': ariaLabel = 'Loading',
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    // Calculate the normalized value for determinate variant
    const normalizedValue = Math.min(Math.max(value, min), max);
    const percentComplete = ((normalizedValue - min) * 100) / (max - min);

    // Determine color based on theme
    const colorValue = theme.palette[color]?.main || theme.palette.primary.main;
    const backgroundColor = theme.palette[color]?.light || theme.palette.primary.light;

    // Animation styles for indeterminate variant
    const indeterminateAnimation = {
      '@keyframes indeterminate1': {
        '0%': { left: '-35%', right: '100%' },
        '60%': { left: '100%', right: '-90%' },
        '100%': { left: '100%', right: '-90%' },
      },
      '@keyframes indeterminate2': {
        '0%': { left: '-200%', right: '100%' },
        '60%': { left: '107%', right: '-8%' },
        '100%': { left: '107%', right: '-8%' },
      },
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      animation: 'indeterminate1 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite',
      animationDelay: '0.15s',
    };

    // Common styles
    const containerStyle = {
      position: 'relative',
      width: '100%',
      height: `${height}px`,
      backgroundColor: theme.mode === 'dark' ? theme.palette.background.paper : backgroundColor,
      borderRadius: height / 2,
      overflow: 'hidden',
    };

    // Styles for progress bar based on variant
    const progressBarStyle =
      variant === 'determinate'
        ? {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${percentComplete}%`,
            backgroundColor: colorValue,
            borderRadius: height / 2,
            transition: 'width 0.3s ease',
          }
        : {
            ...indeterminateAnimation,
            width: '75%',
            backgroundColor: colorValue,
          };

    // For the second bar in indeterminate mode
    const secondBarStyle = {
      ...indeterminateAnimation,
      animation: 'indeterminate2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite',
      animationDelay: '1.15s',
    };

    // Determine aria attributes based on variant
    const ariaValueMin = variant === 'determinate' ? min : undefined;
    const ariaValueMax = variant === 'determinate' ? max : undefined;
    const ariaValueNow = variant === 'determinate' ? value : undefined;
    const ariaValueText = variant === 'determinate' ? `${Math.round(percentComplete)}%` : undefined;

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          ...props.style,
        }}
        {...props}
      >
        {/* Label can be displayed above the progress bar */}
        {label && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: theme.spacing(0.5),
              color: theme.palette.text.primary,
            }}
          >
            <span>{label}</span>
            {showPercentage && variant === 'determinate' && (
              <span>{Math.round(percentComplete)}%</span>
            )}
          </div>
        )}

        <div
          ref={ref}
          role="progressbar&quot;
          aria-label={ariaLabel}
          aria-valuemin={ariaValueMin}
          aria-valuemax={ariaValueMax}
          aria-valuenow={ariaValueNow}
          aria-valuetext={ariaValueText}
          style={containerStyle}
        >
          <div style={progressBarStyle} />
          {variant === "indeterminate' && (
            <div style={{ ...progressBarStyle, ...secondBarStyle }} />
          )}
        </div>
      </div>
    );
  }
);

CustomLinearProgress.propTypes = {
  /**
   * The variant to use. 'indeterminate' for loading states, 'determinate' for controlled progress.
   */
  variant: PropTypes.oneOf(['determinate', 'indeterminate']),

  /**
   * The color of the component. Uses theme palette colors.
   */
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'warning', 'info', 'success']),

  /**
   * The value of the progress indicator for determinate variant. Value between min and max.
   */
  value: PropTypes.number,

  /**
   * The minimum value for determinate variant.
   */
  min: PropTypes.number,

  /**
   * The maximum value for determinate variant.
   */
  max: PropTypes.number,

  /**
   * The height of the progress bar in pixels.
   */
  height: PropTypes.number,

  /**
   * Text label to display above the progress bar.
   */
  label: PropTypes.node,

  /**
   * Whether to show percentage complete value (for determinate variant).
   */
  showPercentage: PropTypes.bool,

  /**
   * Accessible label for the progress indicator.
   */
  'aria-label': PropTypes.string,
};

CustomLinearProgress.displayName = 'LinearProgress';

export default CustomLinearProgress;
