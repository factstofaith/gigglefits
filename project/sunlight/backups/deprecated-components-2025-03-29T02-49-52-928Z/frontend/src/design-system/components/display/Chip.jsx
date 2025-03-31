import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';

/**
 * Chip component for displaying compact interactive elements
 */
const Chip = forwardRef(
  (
    {
      label,
      icon,
      deleteIcon,
      onDelete,
      onClick,
      color = 'default',
      variant = 'filled',
      size = 'medium',
      disabled = false,
      avatar = false,
      clickable = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Determine size based on prop
    const sizeMap = {
      small: {
        height: '24px',
        fontSize: theme.typography.caption.fontSize,
        padding: `0 ${theme.spacing.xs}`,
        iconMargin: theme.spacing.xs,
      },
      medium: {
        height: '32px',
        fontSize: theme.typography.body2.fontSize,
        padding: `0 ${theme.spacing.sm}`,
        iconMargin: theme.spacing.sm,
      },
      large: {
        height: '40px',
        fontSize: theme.typography.body1.fontSize,
        padding: `0 ${theme.spacing.md}`,
        iconMargin: theme.spacing.md,
      },
    };

    const selectedSize = sizeMap[size] || sizeMap.medium;

    // Get color based on theme and color prop
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


      const themeColor =
        color === 'default'
          ? { main: theme.palette.action.active, light: theme.palette.action.hover }
          : theme.palette[color] || theme.palette.primary;

      const styles = {
        filled: {
          backgroundColor: disabled ? theme.palette.action.disabledBackground : themeColor.light,
          color: disabled ? theme.palette.text.disabled : themeColor.main,
          border: 'none',
        },
        outlined: {
          backgroundColor: 'transparent',
          color: disabled ? theme.palette.text.disabled : themeColor.main,
          border: `1px solid ${disabled ? theme.palette.action.disabled : themeColor.main}`,
        },
      };

      return styles[variant] || styles.filled;
    };

    // Base styles
    const chipStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: selectedSize.height,
      borderRadius: '16px',
      padding: selectedSize.padding,
      fontSize: selectedSize.fontSize,
      fontFamily: theme.typography.fontFamily,
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      outline: 'none',
      cursor: (clickable || onClick) && !disabled ? 'pointer' : 'default',
      userSelect: 'none',
      opacity: disabled ? 0.6 : 1,
      ...getColorStyles(),
      ...props.style,
    };

    // Hover state for clickable chips
    const hoverStyles =
      (clickable || onClick) && !disabled
        ? {
            backgroundColor:
              variant === 'outlined'
                ? theme.palette.action.hover
                : color === 'default'
                  ? theme.palette.action.selected
                  : theme.palette[color]?.main || theme.palette.primary.main,
            color:
              variant === 'outlined'
                ? theme.palette[color]?.main || theme.palette.primary.main
                : theme.palette.getContrastText(
                    theme.palette[color]?.main || theme.palette.primary.main
                  ),
          }
        : {};

    // Focus visible state
    const focusVisibleStyles =
      (clickable || onClick) && !disabled
        ? {
            outline: `2px solid ${theme.palette[color]?.main || theme.palette.primary.main}`,
            outlineOffset: '2px',
          }
        : {};

    // Click handling
    const handleClick = event => {
      if (disabled) return;
      if (onClick) onClick(event);
    };

    // Delete handling
    const handleDelete = event => {
      event.stopPropagation();
      if (disabled) return;
      if (onDelete) onDelete(event);
    };

    // Keyboard handling
    const handleKeyDown = event => {
      if (disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (onClick) onClick(event);
      } else if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        if (onDelete) onDelete(event);
      }
    };

    // Default delete icon as a close "x" button
    const defaultDeleteIcon = (
      <span
        onClick={handleDelete}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '18px',
          width: '18px',
          borderRadius: '50%',
          marginLeft: selectedSize.iconMargin,
          cursor: disabled ? 'default' : 'pointer',
          color: 'inherit',
          fontSize: selectedSize.fontSize,
          fontWeight: 'bold',
          lineHeight: 1,
        }}
        role="button&quot;
        aria-label="Remove"
        tabIndex={-1}
      >
        ✕
      </span>
    );

    // Avatar style modifier - makes the chip more rounded when there's an avatar
    const avatarStyle = avatar
      ? {
          paddingLeft: 0,
        }
      : {};

    return (
      <div
        ref={ref}
        role={clickable || onClick ? 'button' : undefined}
        tabIndex={disabled || (!clickable && !onClick) ? undefined : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled}
        style={{
          ...chipStyle,
          ...avatarStyle,
          ':hover': hoverStyles,
          ':focus-visible': focusVisibleStyles,
        }}
        {...props}
      >
        {/* Icon */}
        {icon && (
          <span
            style={{
              display: 'inline-flex',
              marginRight: selectedSize.iconMargin,
              marginLeft: avatar ? selectedSize.iconMargin : 0,
            }}
          >
            {icon}
          </span>
        )}

        {/* Label */}
        <span>{label}</span>

        {/* Delete icon */}
        {onDelete && (deleteIcon || defaultDeleteIcon)}
      </div>
    );
  }
);

Chip.propTypes = {
  /**
   * The content of the chip
   */
  label: PropTypes.node,

  /**
   * Icon element to display at the beginning of the chip
   */
  icon: PropTypes.node,

  /**
   * Custom delete icon element. Only shown if onDelete is provided.
   */
  deleteIcon: PropTypes.node,

  /**
   * Callback function when the delete icon is clicked
   */
  onDelete: PropTypes.func,

  /**
   * Callback function when the chip is clicked
   */
  onClick: PropTypes.func,

  /**
   * The color of the chip
   */
  color: PropTypes.oneOf([
    'default',
    'primary',
    'secondary',
    'success',
    'error',
    'warning',
    'info',
  ]),

  /**
   * The variant to use
   */
  variant: PropTypes.oneOf(['filled', 'outlined']),

  /**
   * The size of the chip
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),

  /**
   * If true, the chip will be disabled
   */
  disabled: PropTypes.bool,

  /**
   * If true, the padding will be adjusted for an avatar
   */
  avatar: PropTypes.bool,

  /**
   * If true, the chip will be clickable
   */
  clickable: PropTypes.bool,
};

Chip.displayName = 'Chip';

export default Chip;
