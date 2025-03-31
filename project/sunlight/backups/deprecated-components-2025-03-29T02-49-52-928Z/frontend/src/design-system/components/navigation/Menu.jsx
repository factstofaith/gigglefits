import React, { forwardRef, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';
import { createPortal } from 'react-dom';

/**
 * MenuItem component represents a single selectable option in a menu
 */
export const MenuItem = forwardRef(
  (
    {
      children,
      onClick,
      disabled = false,
      selected = false,
      icon,
      divider = false,
      dense = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Base styles for menu item
    const baseStyles = {
      padding: dense
        ? `${theme.spacing.xs} ${theme.spacing.sm}`
        : `${theme.spacing.sm} ${theme.spacing.md}`,
      minHeight: dense ? '32px' : '48px',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: theme.typography.body1.fontSize,
      fontFamily: theme.typography.fontFamily,
      color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
      backgroundColor: 'transparent',
      border: 0,
      borderBottom: divider ? `1px solid ${theme.palette.divider}` : 'none',
      opacity: disabled ? 0.6 : 1,
      textAlign: 'left',
      borderRadius: 0,
      textDecoration: 'none',
      outline: 'none',
      userSelect: 'none',
      transition: 'background-color 0.15s ease',
    };

    // Additional styles based on state
    const hoverStyles = disabled
      ? {}
      : {
          backgroundColor: theme.palette.action.hover,
        };

    const selectedStyles = selected
      ? {
          backgroundColor: theme.palette.action.selected,
          fontWeight: theme.typography.fontWeightMedium,
        }
      : {};

    const focusStyles = {
      backgroundColor: theme.palette.action.focus,
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '-2px',
    };

    const handleClick = event => {
      if (disabled) return;

      if (onClick) {
        onClick(event);
      }
    };

    const handleKeyDown = event => {
      if (disabled) return;

      // Trigger click on Enter or Space
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (onClick) {
          onClick(event);
        }
      }
    };

    return (
      <div
        ref={ref}
        role="menuitem&quot;
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{
          ...baseStyles,
          ...selectedStyles,
          ":hover': hoverStyles,
          ':focus-visible': focusStyles,
        }}
        {...props}
      >
        {icon && (
          <span
            style={{ marginRight: theme.spacing.sm, display: 'inline-flex', alignItems: 'center' }}
          >
            {icon}
          </span>
        )}
        {children}
      </div>
    );
  }
);

MenuItem.propTypes = {
  /**
   * Content of the menu item
   */
  children: PropTypes.node,

  /**
   * Callback fired when menu item is clicked
   */
  onClick: PropTypes.func,

  /**
   * If true, the menu item will be disabled
   */
  disabled: PropTypes.bool,

  /**
   * If true, the menu item will be marked as selected
   */
  selected: PropTypes.bool,

  /**
   * Icon element to display before the menu item text
   */
  icon: PropTypes.node,

  /**
   * If true, the menu item will have a divider below it
   */
  divider: PropTypes.bool,

  /**
   * If true, compact padding will be applied
   */
  dense: PropTypes.bool,
};

MenuItem.displayName = 'MenuItem';

/**
 * MenuDivider component for visually separating groups of menu items
 */
export const MenuDivider = forwardRef((props, ref) => {
  const { theme } = useTheme();

  return (
    <div
      ref={ref}
      role="separator&quot;
      aria-orientation="horizontal"
      style={{
        height: '1px',
        margin: `${theme.spacing.xs} 0`,
        backgroundColor: theme.palette.divider,
        ...props.style,
      }}
      {...props}
    />
  );
});

MenuDivider.displayName = 'MenuDivider';

/**
 * Menu component displays a list of choices on a temporary surface
 */
const Menu = forwardRef(
  (
    {
      open = false,
      onClose,
      anchorEl,
      children,
      placement = 'bottom-start',
      autoFocus = true,
      elevation = 2,
      maxHeight = 300,
      minWidth,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const menuRef = useRef(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Function to calculate menu position based on anchorEl and placement
    const calculatePosition = () => {
  // Added display name
  calculatePosition.displayName = 'calculatePosition';

  // Added display name
  calculatePosition.displayName = 'calculatePosition';

  // Added display name
  calculatePosition.displayName = 'calculatePosition';

  // Added display name
  calculatePosition.displayName = 'calculatePosition';

  // Added display name
  calculatePosition.displayName = 'calculatePosition';


      if (!anchorEl || !open) return;

      const anchorRect = anchorEl.getBoundingClientRect();
      const menuWidth = minWidth || anchorRect.width;

      let top, left;

      // Calculate vertical position
      if (placement.startsWith('bottom')) {
        top = anchorRect.bottom + window.scrollY;
      } else if (placement.startsWith('top')) {
        top = anchorRect.top - (menuRef.current?.offsetHeight || 0) + window.scrollY;
      } else if (placement.startsWith('center')) {
        top =
          anchorRect.top +
          anchorRect.height / 2 -
          (menuRef.current?.offsetHeight || 0) / 2 +
          window.scrollY;
      }

      // Calculate horizontal position
      if (placement.endsWith('start')) {
        left = anchorRect.left + window.scrollX;
      } else if (placement.endsWith('end')) {
        left = anchorRect.right - menuWidth + window.scrollX;
      } else if (placement.endsWith('center')) {
        left = anchorRect.left + anchorRect.width / 2 - menuWidth / 2 + window.scrollX;
      }

      setPosition({ top, left });
    };

    // Update position when menu opens or anchor element changes
    useEffect(() => {
      calculatePosition();

      // Add window resize listener
      window.addEventListener('resize', calculatePosition);
      return () => {
        window.removeEventListener('resize', calculatePosition);
      };
    }, [anchorEl, open]);

    // Handle focus management
    useEffect(() => {
      if (open && autoFocus && menuRef.current) {
        // Find first non-disabled menuitem
        const firstMenuItem = menuRef.current.querySelector(
          '[role="menuitem"]:not([aria-disabled="true"])'
        );
        if (firstMenuItem) {
          firstMenuItem.focus();
        }
      }
    }, [open, autoFocus]);

    // Handle click outside to close menu
    useEffect(() => {
      if (!open) return;

      const handleClickOutside = event => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target) &&
          anchorEl &&
          !anchorEl.contains(event.target)
        ) {
          if (onClose) {
            onClose(event, 'clickaway');
          }
        }
      };

      const handleEscapeKey = event => {
        if (event.key === 'Escape') {
          if (onClose) {
            onClose(event, 'escapeKeyDown');
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }, [open, onClose, anchorEl]);

    // Handle keyboard navigation
    useEffect(() => {
      if (!open || !menuRef.current) return;

      const handleKeyDown = event => {
        // Get all focusable menu items
        const menuItems = Array.from(
          menuRef.current.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')
        );

        if (menuItems.length === 0) return;

        const currentIndex = menuItems.indexOf(document.activeElement);

        let nextIndex;

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % menuItems.length;
            menuItems[nextIndex].focus();
            break;

          case 'ArrowUp':
            event.preventDefault();
            nextIndex =
              currentIndex < 0
                ? menuItems.length - 1
                : (currentIndex - 1 + menuItems.length) % menuItems.length;
            menuItems[nextIndex].focus();
            break;

          case 'Home':
            event.preventDefault();
            menuItems[0].focus();
            break;

          case 'End':
            event.preventDefault();
            menuItems[menuItems.length - 1].focus();
            break;

          default:
            break;
        }
      };

      menuRef.current.addEventListener('keydown', handleKeyDown);

      return () => {
        if (menuRef.current) {
          menuRef.current.removeEventListener('keydown', handleKeyDown);
        }
      };
    }, [open]);

    if (!open) {
      return null;
    }

    // Menu styles
    const menuStyles = {
      position: 'absolute',
      top: `${position.top}px`,
      left: `${position.left}px`,
      minWidth: minWidth || (anchorEl ? anchorEl.offsetWidth : 120),
      maxHeight: `${maxHeight}px`,
      overflowY: 'auto',
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[elevation],
      padding: `${theme.spacing.xs} 0`,
      zIndex: theme.zIndex.modal,
      margin: 0,
      ...props.style,
    };

    // Return using React Portal to avoid stacking context issues
    return createPortal(
      <div
        ref={node => {
          // Merge the refs
          menuRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role="menu&quot;
        aria-orientation="vertical"
        tabIndex={-1}
        style={menuStyles}
        {...props}
      >
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) {
            return child;
          }

          // Add onClick to close menu if it's a MenuItem
          if (child.type.displayName === 'MenuItem' && !child.props.disabled) {
            return React.cloneElement(child, {
              onClick: event => {
                // Call the original onClick if it exists
                if (child.props.onClick) {
                  child.props.onClick(event);
                }

                // Close the menu
                if (onClose && !event.defaultPrevented) {
                  onClose(event, 'itemClick');
                }
              },
            });
          }

          return child;
        })}
      </div>,
      document.body
    );
  }
);

Menu.propTypes = {
  /**
   * If true, the menu is visible
   */
  open: PropTypes.bool,

  /**
   * Callback fired when the menu is closed
   */
  onClose: PropTypes.func,

  /**
   * Element the menu should be anchored to
   */
  anchorEl: PropTypes.object,

  /**
   * Menu contents, usually `MenuItem`s
   */
  children: PropTypes.node,

  /**
   * Placement of the menu relative to the anchor element
   */
  placement: PropTypes.oneOf([
    'bottom-start',
    'bottom-center',
    'bottom-end',
    'top-start',
    'top-center',
    'top-end',
    'center-start',
    'center-center',
    'center-end',
  ]),

  /**
   * If true, focus will automatically move to the first menu item
   */
  autoFocus: PropTypes.bool,

  /**
   * Elevation of the menu's shadow
   */
  elevation: PropTypes.number,

  /**
   * Maximum height of the menu before scrolling
   */
  maxHeight: PropTypes.number,

  /**
   * Minimum width of the menu
   */
  minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Menu.displayName = 'Menu';

// Export MenuItem and MenuDivider as properties of Menu
Menu.Item = MenuItem;
Menu.Divider = MenuDivider;

export default Menu;
