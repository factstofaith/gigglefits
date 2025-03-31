/**
 * @component Switch
 * @description Toggle switch component
 * Provides a visual toggle for boolean input
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';
import { alpha } from '../../foundations/tokens/colors';
import Box from '../layout/Box';
import Typography from '../core/Typography';

/**
 * Switch Component
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.id] - Switch element ID
 * @param {string} [props.name] - Switch name attribute
 * @param {string} [props.label] - Switch label text
 * @param {string} [props.helperText] - Helper text displayed below the switch
 * @param {string} [props.errorText] - Error text displayed instead of helper text when error is true
 * @param {boolean} [props.error=false] - Whether the switch has an error
 * @param {boolean} [props.disabled=false] - Whether the switch is disabled
 * @param {boolean} [props.required=false] - Whether the switch is required
 * @param {boolean} [props.checked] - Whether the switch is checked (controlled)
 * @param {boolean} [props.defaultChecked] - Default checked state (uncontrolled)
 * @param {string} [props.color='primary'] - Switch color
 * @param {string} [props.size='medium'] - Switch size (small, medium, large)
 * @param {Function} [props.onChange] - Change handler
 * @param {string} [props.className] - Additional CSS class
 * @param {Object} [props.style] - Additional inline styles
 * @returns {React.ReactElement} Switch component
 */
const Switch = forwardRef(
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
      checked,
      defaultChecked,
      color = 'primary',
      size = 'medium',
      onChange,
      className = '',
      style = {},
      ...rest
    },
    ref
  ) => {
    // Get theme context
    const { theme } = useTheme();

    // Generate a unique ID if none provided
    const switchId = id || `tap-switch-${Math.random().toString(36).substr(2, 9)}`;
    const helperTextId = `${switchId}-helper-text`;

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
          return theme.colors.primary;
        case 'secondary':
          return theme.colors.secondary;
        case 'success':
          return theme.colors.status.success;
        case 'error':
          return theme.colors.status.error;
        case 'warning':
          return theme.colors.status.warning;
        case 'info':
          return theme.colors.status.info;
        default:
          return theme.colors.primary;
      }
    };

    // Determine switch dimensions
    const getSwitchDimensions = () => {
  // Added display name
  getSwitchDimensions.displayName = 'getSwitchDimensions';

  // Added display name
  getSwitchDimensions.displayName = 'getSwitchDimensions';

  // Added display name
  getSwitchDimensions.displayName = 'getSwitchDimensions';

  // Added display name
  getSwitchDimensions.displayName = 'getSwitchDimensions';

  // Added display name
  getSwitchDimensions.displayName = 'getSwitchDimensions';


      switch (size) {
        case 'small':
          return { width: '32px', height: '16px' };
        case 'medium':
          return { width: '40px', height: '20px' };
        case 'large':
          return { width: '48px', height: '24px' };
        default:
          return { width: '40px', height: '20px' };
      }
    };

    // Determine thumb dimensions and position
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
          return {
            size: '12px',
            offset: '2px',
            checkedOffset: '18px',
          };
        case 'medium':
          return {
            size: '16px',
            offset: '2px',
            checkedOffset: '22px',
          };
        case 'large':
          return {
            size: '20px',
            offset: '2px',
            checkedOffset: '26px',
          };
        default:
          return {
            size: '16px',
            offset: '2px',
            checkedOffset: '22px',
          };
      }
    };

    // Determine label size
    const getLabelVariant = () => {
  // Added display name
  getLabelVariant.displayName = 'getLabelVariant';

  // Added display name
  getLabelVariant.displayName = 'getLabelVariant';

  // Added display name
  getLabelVariant.displayName = 'getLabelVariant';

  // Added display name
  getLabelVariant.displayName = 'getLabelVariant';

  // Added display name
  getLabelVariant.displayName = 'getLabelVariant';


      switch (size) {
        case 'small':
          return 'caption';
        case 'medium':
          return 'body2';
        case 'large':
          return 'body1';
        default:
          return 'body2';
      }
    };

    // Determine container styles
    const containerStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
    };

    // Switch dimensions
    const { width, height } = getSwitchDimensions();

    // Thumb dimensions
    const { size: thumbSize, offset: thumbOffset, checkedOffset } = getThumbDimensions();

    // Determine switch track styles
    const trackStyles = {
      width,
      height,
      borderRadius: '500px',
      backgroundColor: checked
        ? disabled
          ? alpha(getColorValue(), 0.5)
          : getColorValue()
        : disabled
          ? theme.colors.action.disabledBackground
          : theme.colors.action.disabled,
      position: 'relative',
      transition: theme.transitions.switch,
      border: error ? `1px solid ${theme.colors.status.error}` : 'none',
      boxSizing: 'border-box',
      '&:hover': !disabled && {
        backgroundColor: checked ? alpha(getColorValue(), 0.8) : theme.colors.text.secondary,
      },
      '&:focus-visible': {
        outline: 'none',
        boxShadow: `0 0 0 3px ${alpha(getColorValue(), 0.2)}`,
      },
    };

    // Determine switch thumb styles
    const thumbStyles = {
      width: thumbSize,
      height: thumbSize,
      borderRadius: '50%',
      backgroundColor: theme.colors.background.paper,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
      position: 'absolute',
      top: thumbOffset,
      left: checked ? checkedOffset : thumbOffset,
      transition: theme.transitions.switch,
    };

    // Helper text color
    const getHelperTextColor = () => {
  // Added display name
  getHelperTextColor.displayName = 'getHelperTextColor';

  // Added display name
  getHelperTextColor.displayName = 'getHelperTextColor';

  // Added display name
  getHelperTextColor.displayName = 'getHelperTextColor';

  // Added display name
  getHelperTextColor.displayName = 'getHelperTextColor';

  // Added display name
  getHelperTextColor.displayName = 'getHelperTextColor';


      if (error) return theme.colors.status.error;
      if (disabled) return theme.colors.text.disabled;
      return theme.colors.text.secondary;
    };

    // Convert styles object to CSS in JS string
    const getStyleString = styles => {
      let styleString = '';

      Object.entries(styles).forEach(([property, value]) => {
        if (typeof value === 'object' && value !== null) {
          return; // Skip nested objects like &:hover
        }

        // Convert camelCase to kebab-case
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
        styleString += `${cssProperty}: ${value}; `;
      });

      return styleString;
    };

    return (
      <Box className={`tap-switch-wrapper ${className}`} style={style}>
        <label htmlFor={switchId} className="tap-switch-container&quot; style={containerStyles}>
          <div className="tap-switch-track" style={trackStyles}>
            <div className="tap-switch-thumb&quot; style={thumbStyles} />

            <input
              ref={ref}
              id={switchId}
              type="checkbox"
              role="switch&quot;
              name={name}
              checked={checked}
              defaultChecked={defaultChecked}
              disabled={disabled}
              required={required}
              onChange={onChange}
              aria-invalid={error}
              aria-describedby={helperText || errorText ? helperTextId : undefined}
              style={{
                opacity: 0,
                position: "absolute',
                width: '100%',
                height: '100%',
                cursor: disabled ? 'not-allowed' : 'pointer',
                margin: 0,
                zIndex: 1,
              }}
              {...rest}
            />
          </div>

          {label && (
            <Typography
              component="span&quot;
              variant={getLabelVariant()}
              color={disabled ? "disabled' : 'textPrimary'}
              style={{
                marginLeft: '8px',
                userSelect: 'none',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {label}
              {required && <span style={{ color: theme.colors.status.error }}> *</span>}
            </Typography>
          )}
        </label>

        {(helperText || errorText) && (
          <Typography
            id={helperTextId}
            variant="caption&quot;
            color={getHelperTextColor()}
            style={{
              marginTop: "4px',
              marginLeft: width,
              paddingLeft: '8px',
              display: 'block',
            }}
          >
            {error ? errorText : helperText}
          </Typography>
        )}

        {/* Styles for pseudo-states */}
        <style jsx>{`
          .tap-switch-track:hover {
            ${!disabled && trackStyles['&:hover'] ? getStyleString(trackStyles['&:hover']) : ''}
          }

          input:focus-visible + .tap-switch-thumb {
            ${trackStyles['&:focus-visible'] ? getStyleString(trackStyles['&:focus-visible']) : ''}
          }
        `}</style>
      </Box>
    );
  }
);

Switch.displayName = 'Switch';

Switch.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.node,
  helperText: PropTypes.string,
  errorText: PropTypes.string,
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onChange: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Switch;
