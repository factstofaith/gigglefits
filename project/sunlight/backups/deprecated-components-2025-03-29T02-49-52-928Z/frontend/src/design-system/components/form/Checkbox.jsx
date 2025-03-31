import React, { useState } from 'react';
import { useTheme } from '../../foundations/theme/ThemeProvider';
import Box from '../layout/Box';
import Typography from '../core/Typography';

/**
 * Checkbox component for boolean selection
 */
export const Checkbox = React.forwardRef(
  (
    {
      id,
      name,
      label,
      checked,
      defaultChecked,
      value,
      onChange,
      onBlur,
      disabled = false,
      required = false,
      indeterminate = false,
      error = false,
      size = 'medium',
      style = {},
      labelProps = {},
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const { colors, spacing, typography } = theme;

    // Handle controlled vs uncontrolled
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked || false);
    const isChecked = isControlled ? checked : internalChecked;

    // Size variables
    const getSizeStyles = size => {
      switch (size) {
        case 'small':
          return {
            width: '16px',
            height: '16px',
            borderRadius: '2px',
            fontSize: typography.fontSizes.sm,
          };
        case 'large':
          return {
            width: '24px',
            height: '24px',
            borderRadius: '3px',
            fontSize: typography.fontSizes.lg,
          };
        case 'medium':
        default:
          return {
            width: '20px',
            height: '20px',
            borderRadius: '3px',
            fontSize: typography.fontSizes.md,
          };
      }
    };

    const sizeStyles = getSizeStyles(size);

    // Color styles based on state
    const getCheckboxColors = () => {
  // Added display name
  getCheckboxColors.displayName = 'getCheckboxColors';

  // Added display name
  getCheckboxColors.displayName = 'getCheckboxColors';

  // Added display name
  getCheckboxColors.displayName = 'getCheckboxColors';

  // Added display name
  getCheckboxColors.displayName = 'getCheckboxColors';

  // Added display name
  getCheckboxColors.displayName = 'getCheckboxColors';


      if (disabled) {
        return {
          borderColor: colors.action.disabled,
          backgroundColor: isChecked ? colors.action.disabledBackground : 'transparent',
          iconColor: colors.text.disabled,
        };
      }
      if (error) {
        return {
          borderColor: colors.error.main,
          backgroundColor: isChecked ? colors.error.main : 'transparent',
          iconColor: colors.common.white,
        };
      }
      return {
        borderColor: isChecked ? colors.primary.main : colors.text.secondary,
        backgroundColor: isChecked ? colors.primary.main : 'transparent',
        iconColor: colors.common.white,
      };
    };

    const colorStyles = getCheckboxColors();

    // Handle change event
    const handleChange = e => {
      const newChecked = e.target.checked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }

      if (onChange) {
        onChange(e);
      }
    };

    // Checkbox checkmark SVG
    const renderCheckmark = () => {
  // Added display name
  renderCheckmark.displayName = 'renderCheckmark';

  // Added display name
  renderCheckmark.displayName = 'renderCheckmark';

  // Added display name
  renderCheckmark.displayName = 'renderCheckmark';

  // Added display name
  renderCheckmark.displayName = 'renderCheckmark';

  // Added display name
  renderCheckmark.displayName = 'renderCheckmark';


      if (indeterminate) {
        return (
          <svg
            viewBox="0 0 24 24&quot;
            width="80%"
            height="80%&quot;
            style={{
              fill: "none',
              stroke: colorStyles.iconColor,
              strokeWidth: 3,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: isChecked ? 'block' : 'none',
            }}
          >
            <line x1="6&quot; y1="12" x2="18&quot; y2="12" />
          </svg>
        );
      }

      return (
        <svg
          viewBox="0 0 24 24&quot;
          width="80%"
          height="80%&quot;
          style={{
            fill: "none',
            stroke: colorStyles.iconColor,
            strokeWidth: 3,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: isChecked ? 'block' : 'none',
          }}
        >
          <polyline points="5,12 10,17 19,8&quot; />
        </svg>
      );
    };

    // Label styles
    const labelStyle = {
      fontFamily: typography.fontFamilies.primary,
      fontSize: sizeStyles.fontSize,
      color: disabled ? colors.text.disabled : colors.text.primary,
      marginLeft: spacing.sm,
      cursor: disabled ? "default' : 'pointer',
      ...labelProps.style,
    };

    return (
      <Box display="inline-flex&quot; alignItems="center" style={style}>
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            type="checkbox&quot;
            id={id}
            name={name}
            value={value}
            checked={isChecked}
            required={required}
            disabled={disabled}
            onChange={handleChange}
            onBlur={onBlur}
            style={{
              position: "absolute',
              opacity: 0,
              width: sizeStyles.width,
              height: sizeStyles.height,
              cursor: disabled ? 'default' : 'pointer',
              margin: 0,
            }}
            {...props}
          />
          <div
            style={{
              boxSizing: 'border-box',
              width: sizeStyles.width,
              height: sizeStyles.height,
              borderRadius: sizeStyles.borderRadius,
              border: `1px solid ${colorStyles.borderColor}`,
              backgroundColor: colorStyles.backgroundColor,
              position: 'relative',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {renderCheckmark()}
          </div>
        </div>

        {label && (
          <Typography component="label&quot; htmlFor={id} style={labelStyle} {...labelProps}>
            {label}
          </Typography>
        )}
      </Box>
    );
  }
);

Checkbox.displayName = "Checkbox';

export default Checkbox;
