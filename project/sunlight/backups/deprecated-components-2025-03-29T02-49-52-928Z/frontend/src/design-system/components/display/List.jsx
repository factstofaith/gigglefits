import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';

/**
 * ListItem component for displaying a single item within a list
 */
export const ListItem = forwardRef(
  (
    {
      children,
      onClick,
      selected = false,
      disabled = false,
      divider = false,
      dense = false,
      button = false,
      primary,
      secondary,
      startIcon,
      endIcon,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Determine button-like behavior
    const isClickable = button || onClick;

    // Base styles for list item
    const baseStyles = {
      display: 'flex',
      position: 'relative',
      boxSizing: 'border-box',
      alignItems: 'center',
      padding: dense
        ? `${theme.spacing.xs} ${theme.spacing.sm}`
        : `${theme.spacing.sm} ${theme.spacing.md}`,
      borderBottom: divider ? `1px solid ${theme.palette.divider}` : 'none',
      backgroundColor: selected ? theme.palette.action.selected : 'transparent',
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'default' : isClickable ? 'pointer' : 'inherit',
      textDecoration: 'none',
      color: theme.palette.text.primary,
      transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      width: '100%',
    };

    // Interactive state styles
    const hoverStyles =
      isClickable && !disabled
        ? {
            backgroundColor: theme.palette.action.hover,
          }
        : {};

    const focusStyles =
      isClickable && !disabled
        ? {
            backgroundColor: theme.palette.action.focus,
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '-2px',
          }
        : {};

    // Handling click events
    const handleClick = event => {
      if (disabled) return;
      if (onClick) onClick(event);
    };

    // Handle keyboard events for button-like behavior
    const handleKeyDown = event => {
      if (disabled) return;
      if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        handleClick(event);
      }
    };

    // Text content styles
    const textStyles = {
      flex: '1 1 auto',
      minWidth: 0,
    };

    // For primary/secondary text pattern
    const primaryTextStyles = {
      display: 'block',
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: theme.typography.body1.fontSize,
      lineHeight: theme.typography.body1.lineHeight,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    };

    const secondaryTextStyles = {
      display: 'block',
      fontSize: theme.typography.body2.fontSize,
      lineHeight: theme.typography.body2.lineHeight,
      color: theme.palette.text.secondary,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    };

    // Determine the tag to render based on props
    const Component = button ? 'button' : onClick ? 'div' : 'li';

    // Determine the content based on whether primary/secondary are provided
    const renderContent = () => {
  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';

  // Added display name
  renderContent.displayName = 'renderContent';


      // Primary/secondary content pattern
      if (primary !== undefined) {
        return (
          <>
            {startIcon && (
              <div style={{ marginRight: theme.spacing.sm, display: 'inline-flex' }}>
                {startIcon}
              </div>
            )}

            <div style={textStyles}>
              <div style={primaryTextStyles}>{primary}</div>
              {secondary && <div style={secondaryTextStyles}>{secondary}</div>}
            </div>

            {endIcon && (
              <div style={{ marginLeft: theme.spacing.sm, display: 'inline-flex' }}>{endIcon}</div>
            )}
          </>
        );
      }

      // Standard children pattern
      return children;
    };

    return (
      <Component
        ref={ref}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={isClickable ? 'button' : undefined}
        tabIndex={disabled ? undefined : isClickable ? 0 : undefined}
        aria-disabled={disabled}
        style={{
          ...baseStyles,
          ...props.style,
          ':hover': hoverStyles,
          ':focus-visible': focusStyles,
        }}
        {...props}
      >
        {renderContent()}
      </Component>
    );
  }
);

ListItem.propTypes = {
  /**
   * The content of the component
   */
  children: PropTypes.node,

  /**
   * Primary text for the list item
   */
  primary: PropTypes.node,

  /**
   * Secondary text for the list item
   */
  secondary: PropTypes.node,

  /**
   * Icon to display before the text
   */
  startIcon: PropTypes.node,

  /**
   * Icon to display after the text
   */
  endIcon: PropTypes.node,

  /**
   * If true, the list item will be a button (using button tag)
   */
  button: PropTypes.bool,

  /**
   * If true, compact paddings will be used
   */
  dense: PropTypes.bool,

  /**
   * If true, a 1px border will be shown at the bottom of the list item
   */
  divider: PropTypes.bool,

  /**
   * If true, list item will be set to selected state
   */
  selected: PropTypes.bool,

  /**
   * If true, list item will be disabled
   */
  disabled: PropTypes.bool,

  /**
   * Callback fired when the list item is clicked
   */
  onClick: PropTypes.func,
};

ListItem.displayName = 'ListItem';

/**
 * ListItemText component for easy creation of primary and secondary text in a list item
 */
export const ListItemText = forwardRef(({ primary, secondary, ...props }, ref) => {
  const { theme } = useTheme();

  const textStyles = {
    flex: '1 1 auto',
    minWidth: 0,
  };

  const primaryTextStyles = {
    display: 'block',
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: theme.typography.body1.lineHeight,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const secondaryTextStyles = {
    display: 'block',
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    color: theme.palette.text.secondary,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  return (
    <div ref={ref} style={{ ...textStyles, ...props.style }} {...props}>
      <div style={primaryTextStyles}>{primary}</div>
      {secondary && <div style={secondaryTextStyles}>{secondary}</div>}
    </div>
  );
});

ListItemText.propTypes = {
  /**
   * The primary text
   */
  primary: PropTypes.node,

  /**
   * The secondary text
   */
  secondary: PropTypes.node,
};

ListItemText.displayName = 'ListItemText';

/**
 * ListItemIcon component for adding icons to list items
 */
export const ListItemIcon = forwardRef(({ children, ...props }, ref) => {
  const { theme } = useTheme();

  const iconStyles = {
    minWidth: '36px',
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    color: theme.palette.action.active,
  };

  return (
    <div ref={ref} style={{ ...iconStyles, ...props.style }} {...props}>
      {children}
    </div>
  );
});

ListItemIcon.propTypes = {
  /**
   * The icon element
   */
  children: PropTypes.node,
};

ListItemIcon.displayName = 'ListItemIcon';

/**
 * List component for displaying a list of items
 */
const List = forwardRef(
  ({ children, dense = false, disablePadding = false, subheader, ...props }, ref) => {
    const { theme } = useTheme();

    const listStyles = {
      margin: 0,
      padding: disablePadding ? 0 : `${theme.spacing.xs} 0`,
      position: 'relative',
      listStyle: 'none',
      backgroundColor: 'transparent',
      width: '100%',
    };

    return (
      <ul ref={ref} style={{ ...listStyles, ...props.style }} {...props}>
        {subheader && (
          <div
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.md}`,
              fontWeight: theme.typography.fontWeightMedium,
              fontSize: theme.typography.subtitle2.fontSize,
              lineHeight: theme.typography.subtitle2.lineHeight,
              color: theme.palette.text.secondary,
            }}
          >
            {subheader}
          </div>
        )}
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) {
            return child;
          }

          // Pass dense prop to ListItem children if dense is true
          if (child.type.displayName === 'ListItem') {
            return React.cloneElement(child, {
              dense: child.props.dense !== undefined ? child.props.dense : dense,
            });
          }

          return child;
        })}
      </ul>
    );
  }
);

List.propTypes = {
  /**
   * The content of the component, normally ListItem components
   */
  children: PropTypes.node,

  /**
   * If true, compact paddings will be used on list items
   */
  dense: PropTypes.bool,

  /**
   * If true, vertical padding will be removed from the list
   */
  disablePadding: PropTypes.bool,

  /**
   * The subheader of the list
   */
  subheader: PropTypes.node,
};

List.displayName = 'List';

// Attach related components to List
List.Item = ListItem;
List.ItemText = ListItemText;
List.ItemIcon = ListItemIcon;

export default List;
