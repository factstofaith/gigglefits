/**
 * @component Slider
 * @description Slider input component for selecting a value from a range
 */

import React, { forwardRef, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';
import Box from '@design-system/components/layout/Box';
import Typography from '@design-system/components/core/Typography';

/**
 * Slider Component
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.id] - Slider element ID
 * @param {string} [props.name] - Slider name attribute
 * @param {string} [props.label] - Slider label text
 * @param {string} [props.helperText] - Helper text displayed below the slider
 * @param {string} [props.errorText] - Error text displayed instead of helper text when error is true
 * @param {boolean} [props.error=false] - Whether the slider has an error
 * @param {boolean} [props.disabled=false] - Whether the slider is disabled
 * @param {boolean} [props.required=false] - Whether the slider is required
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=100] - Maximum value
 * @param {number} [props.step=1] - Step increment
 * @param {number} [props.value] - Current value (controlled)
 * @param {number} [props.defaultValue] - Default value (uncontrolled)
 * @param {Array<number>} [props.marks] - Array of values where marks should appear
 * @param {boolean} [props.showValue=false] - Whether to show the current value
 * @param {string} [props.valueLabelFormat] - Format for the value label (e.g., "${value}%")
 * @param {boolean} [props.showMinMaxLabels=false] - Whether to show min and max labels
 * @param {string} [props.color='primary'] - Slider color
 * @param {string} [props.size='medium'] - Slider size (small, medium, large)
 * @param {Function} [props.onChange] - Change handler
 * @param {Function} [props.onChangeCommitted] - Handler called when interaction is complete
 * @param {string} [props.className] - Additional CSS class
 * @param {Object} [props.style] - Additional inline styles
 * @returns {React.ReactElement} Slider component
 */
const Slider = forwardRef(
  (
    {
      id,
      name,
      label,
      helperText,
      errorText,
      error = false,
      disabled = false,
      required = false,
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue = 0,
      marks = [],
      showValue = false,
      valueLabelFormat = '{value}',
      showMinMaxLabels = false,
      color = 'primary',
      size = 'medium',
      onChange,
      onChangeCommitted,
      className = '',
      style = {},
      ...rest
    },
    ref
  ) => {
    // Get theme context
    const { theme } = useTheme();

    // Generate a unique ID if none provided
    const sliderId = id || `tap-slider-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = `${sliderId}-helper-text`;

    // Local state for uncontrolled component
    const isControlled = value !== undefined;
    const [localValue, setLocalValue] = useState(defaultValue);
    const currentValue = isControlled ? value : localValue;

    // Get normalized value (percentage)
    const getNormalizedValue = val => {
      return ((val - min) / (max - min)) * 100;
    };

    // Slider track ref
    const trackRef = useRef(null);
    const thumbRef = useRef(null);
    const isDragging = useRef(false);

    // Get color value from theme
    const getColorValue = () => {
  // Added display name
  getColorValue.displayName = 'getColorValue';

  // Added display name
  getColorValue.displayName = 'getColorValue';

  // Added display name
  getColorValue.displayName = 'getColorValue';

  // Added display name
  getColorValue.displayName = 'getColorValue';

  // Added display name
  getColorValue.displayName = 'getColorValue';


      switch (color) {
        case 'primary':
          return theme.colors.primary.main;
        case 'secondary':
          return theme.colors.secondary.main;
        case 'success':
          return theme.colors.success.main;
        case 'error':
          return theme.colors.error.main;
        case 'warning':
          return theme.colors.warning.main;
        case 'info':
          return theme.colors.info.main;
        default:
          return theme.colors.primary.main;
      }
    };

    // Get slider track height based on size
    const getTrackHeight = () => {
  // Added display name
  getTrackHeight.displayName = 'getTrackHeight';

  // Added display name
  getTrackHeight.displayName = 'getTrackHeight';

  // Added display name
  getTrackHeight.displayName = 'getTrackHeight';

  // Added display name
  getTrackHeight.displayName = 'getTrackHeight';

  // Added display name
  getTrackHeight.displayName = 'getTrackHeight';


      switch (size) {
        case 'small':
          return '4px';
        case 'medium':
          return '6px';
        case 'large':
          return '8px';
        default:
          return '6px';
      }
    };

    // Get thumb dimensions based on size
    const getThumbDimensions = () => {
  // Added display name
  getThumbDimensions.displayName = 'getThumbDimensions';

  // Added display name
  getThumbDimensions.displayName = 'getThumbDimensions';

  // Added display name
  getThumbDimensions.displayName = 'getThumbDimensions';

  // Added display name
  getThumbDimensions.displayName = 'getThumbDimensions';

  // Added display name
  getThumbDimensions.displayName = 'getThumbDimensions';


      switch (size) {
        case 'small':
          return '16px';
        case 'medium':
          return '20px';
        case 'large':
          return '24px';
        default:
          return '20px';
      }
    };

    // Format value label
    const formatValueLabel = val => {
      return valueLabelFormat.replace('{value}', val);
    };

    // Handle mouse/touch events for slider
    const handleSliderChange = clientX => {
      if (disabled) return;

      if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        const trackWidth = rect.width;
        const offset = clientX - rect.left;

        let percent = offset / trackWidth;
        percent = Math.min(1, Math.max(0, percent));

        const rawValue = min + percent * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        const boundedValue = Math.min(max, Math.max(min, steppedValue));

        if (!isControlled) {
          setLocalValue(boundedValue);
        }

        if (onChange) {
          onChange({ target: { name, value: boundedValue } });
        }
      }
    };

    // Mouse event handlers
    const handleMouseDown = e => {
      if (disabled) return;

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      isDragging.current = true;
      handleSliderChange(e.clientX);
    };

    const handleMouseMove = e => {
      if (isDragging.current) {
        handleSliderChange(e.clientX);
      }
    };

    const handleMouseUp = () => {
  // Added display name
  handleMouseUp.displayName = 'handleMouseUp';

  // Added display name
  handleMouseUp.displayName = 'handleMouseUp';

  // Added display name
  handleMouseUp.displayName = 'handleMouseUp';

  // Added display name
  handleMouseUp.displayName = 'handleMouseUp';

  // Added display name
  handleMouseUp.displayName = 'handleMouseUp';


      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      if (isDragging.current && onChangeCommitted) {
        onChangeCommitted({ target: { name, value: isControlled ? value : localValue } });
      }

      isDragging.current = false;
    };

    // Touch event handlers
    const handleTouchStart = e => {
      if (disabled) return;

      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      isDragging.current = true;
      handleSliderChange(e.touches[0].clientX);

      // Prevent scrolling while dragging the slider
      e.preventDefault();
    };

    const handleTouchMove = e => {
      if (isDragging.current) {
        handleSliderChange(e.touches[0].clientX);
        e.preventDefault(); // Prevent scrolling
      }
    };

    const handleTouchEnd = () => {
  // Added display name
  handleTouchEnd.displayName = 'handleTouchEnd';

  // Added display name
  handleTouchEnd.displayName = 'handleTouchEnd';

  // Added display name
  handleTouchEnd.displayName = 'handleTouchEnd';

  // Added display name
  handleTouchEnd.displayName = 'handleTouchEnd';

  // Added display name
  handleTouchEnd.displayName = 'handleTouchEnd';


      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

      if (isDragging.current && onChangeCommitted) {
        onChangeCommitted({ target: { name, value: isControlled ? value : localValue } });
      }

      isDragging.current = false;
    };

    // Handle direct track click
    const handleTrackClick = e => {
      if (disabled) return;
      handleSliderChange(e.clientX);

      if (onChangeCommitted) {
        onChangeCommitted({ target: { name, value: isControlled ? value : localValue } });
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = e => {
      if (disabled) return;

      let newValue = currentValue;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newValue = Math.min(max, currentValue + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue = Math.max(min, currentValue - step);
          break;
        case 'Home':
          newValue = min;
          break;
        case 'End':
          newValue = max;
          break;
        case 'PageUp':
          newValue = Math.min(max, currentValue + (max - min) / 10);
          break;
        case 'PageDown':
          newValue = Math.max(min, currentValue - (max - min) / 10);
          break;
        default:
          return;
      }

      // Step adjustment
      newValue = Math.round(newValue / step) * step;

      if (newValue !== currentValue) {
        if (!isControlled) {
          setLocalValue(newValue);
        }

        if (onChange) {
          onChange({ target: { name, value: newValue } });
        }

        if (onChangeCommitted) {
          onChangeCommitted({ target: { name, value: newValue } });
        }

        e.preventDefault();
      }
    };

    // Clean up event listeners
    useEffect(() => {
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }, []);

    // Normalized percentage value (0-100)
    const normalizedValue = getNormalizedValue(currentValue);

    // Container styles
    const containerStyles = {
      display: 'inline-flex',
      flexDirection: 'column',
      width: '100%',
      ...style,
    };

    // Slider track styles
    const trackStyles = {
      position: 'relative',
      height: getTrackHeight(),
      width: '100%',
      borderRadius: theme.borderRadius.pill,
      backgroundColor: disabled
        ? theme.colors.action.disabledBackground
        : error
          ? theme.colors.error.light
          : theme.colors.action.hover,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };

    // Slider track fill styles
    const trackFillStyles = {
      position: 'absolute',
      height: '100%',
      width: `${normalizedValue}%`,
      borderRadius: theme.borderRadius.pill,
      backgroundColor: disabled
        ? theme.colors.action.disabled
        : error
          ? theme.colors.error.main
          : getColorValue(),
      transition: isDragging.current ? 'none' : theme.transitions.standard,
    };

    // Slider thumb styles
    const thumbSize = getThumbDimensions();
    const thumbStyles = {
      position: 'absolute',
      top: '50%',
      left: `${normalizedValue}%`,
      width: thumbSize,
      height: thumbSize,
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      backgroundColor: theme.colors.common.white,
      border: `2px solid ${
        disabled ? theme.colors.action.disabled : error ? theme.colors.error.main : getColorValue()
      }`,
      boxShadow: theme.shadows.sm,
      cursor: disabled ? 'not-allowed' : 'grab',
      transition: isDragging.current ? 'none' : theme.transitions.standard,
      outline: 'none',
      '&:focus-visible': {
        boxShadow: `0 0 0 2px ${theme.colors.background.paper}, 0 0 0 4px ${getColorValue()}`,
      },
      '&:active': {
        cursor: 'grabbing',
      },
    };

    // Label styles
    const labelStyles = {
      marginBottom: theme.spacing.xs,
      color: disabled
        ? theme.colors.text.disabled
        : error
          ? theme.colors.error.main
          : theme.colors.text.primary,
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.medium,
    };

    // Value label styles
    const valueLabelStyles = {
      marginLeft: theme.spacing.sm,
      color: disabled ? theme.colors.text.disabled : theme.colors.text.secondary,
      fontSize: theme.typography.fontSizes.sm,
    };

    // Helper text styles
    const helperTextStyles = {
      marginTop: theme.spacing.xs,
      color: error
        ? theme.colors.error.main
        : disabled
          ? theme.colors.text.disabled
          : theme.colors.text.secondary,
      fontSize: theme.typography.fontSizes.xs,
    };

    // Min/max label styles
    const minMaxLabelStyles = {
      color: disabled ? theme.colors.text.disabled : theme.colors.text.secondary,
      fontSize: theme.typography.fontSizes.xs,
    };

    // Helper to render marks
    const renderMarks = () => {
  // Added display name
  renderMarks.displayName = 'renderMarks';

  // Added display name
  renderMarks.displayName = 'renderMarks';

  // Added display name
  renderMarks.displayName = 'renderMarks';

  // Added display name
  renderMarks.displayName = 'renderMarks';

  // Added display name
  renderMarks.displayName = 'renderMarks';


      return marks.map(markValue => {
        // Skip marks outside the range
        if (markValue < min || markValue > max) return null;

        const markPosition = getNormalizedValue(markValue);

        // Mark styles
        const markStyles = {
          position: 'absolute',
          top: '50%',
          left: `${markPosition}%`,
          width: '8px',
          height: '8px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          backgroundColor: disabled
            ? theme.colors.action.disabled
            : markValue <= currentValue
              ? getColorValue()
              : theme.colors.action.hover,
          border: `1px solid ${theme.colors.background.paper}`,
          pointerEvents: 'none',
        };

        return (
          <div key={markValue} className="tap-slider-mark&quot; style={markStyles} aria-hidden="true" />
        );
      });
    };

    return (
      <Box className={`tap-slider-wrapper ${className}`} style={containerStyles}>
        {/* Label and value */}
        {(label || showValue) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {label && (
              <label htmlFor={sliderId} style={labelStyles}>
                {label}
                {required && (
                  <span style={{ color: theme.colors.error.main, marginLeft: '4px' }}>*</span>
                )}
              </label>
            )}

            {showValue && (
              <span className="tap-slider-value&quot; style={valueLabelStyles}>
                {formatValueLabel(currentValue)}
              </span>
            )}
          </div>
        )}

        {/* Slider track */}
        <div
          className="tap-slider-container"
          style={{
            position: 'relative',
            padding: `${parseInt(getThumbDimensions()) / 2}px 0`,
            marginTop: label ? theme.spacing.xs : 0,
            marginBottom: showMinMaxLabels ? theme.spacing.xs : 0,
          }}
        >
          <div
            ref={trackRef}
            className="tap-slider-track&quot;
            style={trackStyles}
            onClick={handleTrackClick}
            aria-hidden="true"
          >
            <div className="tap-slider-track-fill&quot; style={trackFillStyles} />

            {/* Render marks if provided */}
            {marks.length > 0 && renderMarks()}

            {/* Thumb */}
            <div
              ref={thumbRef}
              className="tap-slider-thumb"
              style={thumbStyles}
              tabIndex={disabled ? -1 : 0}
              role="slider&quot;
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={currentValue}
              aria-orientation="horizontal"
              aria-labelledby={label ? sliderId : undefined}
              aria-describedby={helperText || errorText ? helperTextId : undefined}
              aria-disabled={disabled}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Hidden input for form submission */}
          <input
            ref={ref}
            type="hidden&quot;
            id={sliderId}
            name={name}
            value={currentValue}
            disabled={disabled}
            required={required}
            aria-hidden="true"
            {...rest}
          />
        </div>

        {/* Min/Max labels */}
        {showMinMaxLabels && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={minMaxLabelStyles}>{min}</span>
            <span style={minMaxLabelStyles}>{max}</span>
          </div>
        )}

        {/* Helper text / error text */}
        {(helperText || errorText) && (
          <Typography id={helperTextId} variant="caption&quot; style={helperTextStyles}>
            {error ? errorText : helperText}
          </Typography>
        )}
      </Box>
    );
  }
);

Slider.displayName = "Slider';

Slider.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.node,
  helperText: PropTypes.string,
  errorText: PropTypes.string,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  value: PropTypes.number,
  defaultValue: PropTypes.number,
  marks: PropTypes.arrayOf(PropTypes.number),
  showValue: PropTypes.bool,
  valueLabelFormat: PropTypes.string,
  showMinMaxLabels: PropTypes.bool,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onChange: PropTypes.func,
  onChangeCommitted: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Slider;
