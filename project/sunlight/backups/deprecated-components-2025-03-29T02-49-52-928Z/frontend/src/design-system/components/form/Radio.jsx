import React, { useState } from 'react';
import { useTheme } from '@design-system/foundations/theme/ThemeProvider';
import Box from '@design-system/components/layout/Box';
import Typography from '@design-system/components/core/Typography';

/**
 * Radio component for exclusive selection
 */
export const Radio = React.forwardRef(
  (
    {
      id,
      name,
      label,
      value,
      checked,
      defaultChecked,
      onChange,
      onBlur,
      disabled = false,
      required = false,
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
            dotSize: '6px',
            fontSize: typography.fontSizes.sm,
          };
        case 'large':
          return {
            width: '24px',
            height: '24px',
            dotSize: '12px',
            fontSize: typography.fontSizes.lg,
          };
        case 'medium':
        default:
          return {
            width: '20px',
            height: '20px',
            dotSize: '10px',
            fontSize: typography.fontSizes.md,
          };
      }
    };

    const sizeStyles = getSizeStyles(size);

    // Color styles based on state
    const getRadioColors = () => {
  // Added display name
  getRadioColors.displayName = 'getRadioColors';

  // Added display name
  getRadioColors.displayName = 'getRadioColors';

  // Added display name
  getRadioColors.displayName = 'getRadioColors';

  // Added display name
  getRadioColors.displayName = 'getRadioColors';

  // Added display name
  getRadioColors.displayName = 'getRadioColors';


      if (disabled) {
        return {
          borderColor: colors.action.disabled,
          backgroundColor: 'transparent',
          dotColor: colors.text.disabled,
        };
      }
      if (error) {
        return {
          borderColor: colors.error.main,
          backgroundColor: 'transparent',
          dotColor: colors.error.main,
        };
      }
      return {
        borderColor: isChecked ? colors.primary.main : colors.text.secondary,
        backgroundColor: 'transparent',
        dotColor: colors.primary.main,
      };
    };

    const colorStyles = getRadioColors();

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

    // Label styles
    const labelStyle = {
      fontFamily: typography.fontFamilies.primary,
      fontSize: sizeStyles.fontSize,
      color: disabled ? colors.text.disabled : colors.text.primary,
      marginLeft: spacing.sm,
      cursor: disabled ? 'default' : 'pointer',
      ...labelProps.style,
    };

    return (
      <Box display="inline-flex&quot; alignItems="center" style={style}>
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            type="radio&quot;
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
              borderRadius: '50%',
              border: `1px solid ${colorStyles.borderColor}`,
              backgroundColor: colorStyles.backgroundColor,
              position: 'relative',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isChecked && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: sizeStyles.dotSize,
                  height: sizeStyles.dotSize,
                  borderRadius: '50%',
                  backgroundColor: colorStyles.dotColor,
                  transition: 'all 0.2s ease-in-out',
                }}
              />
            )}
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

Radio.displayName = "Radio';

export default Radio;
