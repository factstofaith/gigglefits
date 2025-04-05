import React, { forwardRef, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem, ListItemIcon, ListItemText, IconButton, Button, Alert } from '@mui/material';
import { useA11yKeyboard, useA11yAnnouncement } from "@/hooks/a11y";
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling";

/**
 * Accessibility-Enhanced Menu Component
 * 
 * A menu component with enhanced accessibility features.
 * Part of the zero technical debt accessibility implementation.
 * 
 * @module components/common/A11yMenu
 */
import { getMenuAttributes } from "@/utils/a11y/ariaAttributeHelper";

/**
 * Enhanced Menu with built-in accessibility features
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Trigger element for the menu
 * @param {Array<Object>} props.items - Menu items
 * @param {string} [props.a11yLabel] - Accessible label for the menu
 * @param {string} [props.a11yAnnouncement] - Message to announce when menu opens
 * @param {boolean} [props.a11yKeyboardNavigation=true] - Whether to enable enhanced keyboard navigation
 * @param {string} [props.variant='menu'] - Menu variant (menu, dropdown)
 * @param {boolean} [props.disabled=false] - Whether the menu trigger is disabled
 * @param {string} [props.triggerAs='button'] - Trigger element type
 * @param {string} [props.className] - Additional class name
 * @param {Object} [props.style] - Additional styles
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The enhanced menu
 */
const A11yMenu = forwardRef(({
  // A11y props
  a11yLabel,
  a11yAnnouncement,
  a11yKeyboardNavigation = true,
  // Standard menu props
  children,
  items = [],
  variant = 'menu',
  disabled = false,
  triggerAs = 'button',
  className = '',
  style = {},
  ...rest
}, ref) => {
  // Error handling
  const {
    error,
    handleError,
    clearError
  } = useErrorHandler('A11yMenu');
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    announcePolite
  } = useA11yAnnouncement();
  const menuItemsRef = useRef([]);
  const menuId = `a11y-menu-${React.useId()}`;

  // Get keyboard navigation handlers
  const {
    getArrowKeyHandler
  } = useA11yKeyboard();

  // Handle menu open
  const handleOpen = event => {
    setAnchorEl(event.currentTarget);
    if (a11yAnnouncement) {
      announcePolite(a11yAnnouncement);
    } else {
      announcePolite(`Menu opened with ${items.length} items. Use arrow keys to navigate.`);
    }
  };

  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle menu item selection
  const handleMenuItemClick = item => {
    try {
      if (item.onClick) {
        item.onClick();
      }
      if (!item.keepOpen) {
        handleClose();
      }
      if (item.announcement) {
        announcePolite(item.announcement);
      }
    } catch (err) {
      handleError(err, {
        itemId: item.id,
        context: 'menuItemClick',
        itemLabel: item.label
      });
    }
  };

  // Create keyboard navigation handler
  const handleKeyDown = event => {
    if (!a11yKeyboardNavigation) return;
    const isOpen = Boolean(anchorEl);
    if (!isOpen) {
      // When menu is closed, open on arrow down or space
      if (event.key === 'ArrowDown' || event.key === ' ') {
        event.preventDefault();
        handleOpen(event);
      }
      return;
    }

    // Get arrow key navigation handler
    const arrowKeyHandler = getArrowKeyHandler({
      vertical: true,
      elements: menuItemsRef.current,
      wrap: true
    });

    // Process arrow keys
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      arrowKeyHandler(event);
    }
    // Close on escape
    else if (event.key === 'Escape') {
      handleClose();
    }
    // Select item on enter or space
    else if (event.key === 'Enter' || event.key === ' ') {
      const focusedElement = document.activeElement;
      const focusedIndex = menuItemsRef.current.indexOf(focusedElement);
      if (focusedIndex >= 0) {
        event.preventDefault();
        handleMenuItemClick(items[focusedIndex]);
      }
    }
  };

  // Generate the menu trigger element
  const renderTrigger = () => {
    const triggerProps = {
      'aria-haspopup': 'menu',
      'aria-expanded': Boolean(anchorEl),
      'aria-controls': anchorEl ? menuId : undefined,
      onClick: handleOpen,
      disabled
    };
    if (React.isValidElement(children)) {
      return React.cloneElement(children, triggerProps);
    }
    if (triggerAs === 'icon') {
      return <IconButton {...triggerProps} size="medium" aria-label={a11yLabel || 'Menu'} className={`a11y-menu-trigger ${className}`}>

          {children}
        </IconButton>;
    }
    return <Button {...triggerProps} aria-label={a11yLabel || 'Menu'} className={`a11y-menu-trigger ${className}`}>

        {children}
      </Button>;
  };

  // Store refs to menu items for keyboard navigation
  useEffect(() => {
    menuItemsRef.current = [];
  }, [items, anchorEl]);

  // Get ARIA attributes for the menu
  const menuAttributes = getMenuAttributes({
    label: a11yLabel,
    orientation: 'vertical'
  });
  const isOpen = Boolean(anchorEl);

  // Show error state if there is an error
  if (error) {
    return <Alert severity="error" onClose={clearError} sx={{
      width: '100%',
      mb: 2
    }}>
        {error.message || 'An error occurred with the menu'}
      </Alert>;
  }
  return <>
      {renderTrigger()}
      
      <Menu id={menuId} ref={ref} anchorEl={anchorEl} open={isOpen} onClose={handleClose} onKeyDown={handleKeyDown} MenuListProps={{
      'aria-labelledby': a11yLabel ? `${menuId}-label` : undefined,
      ...menuAttributes
    }} {...rest}>

        {items.map((item, index) => {
        if (item.divider) {
          return <li key={`divider-${index}`} role="separator" className="a11y-menu-divider" />;
        }
        return <MenuItem key={item.id || index} onClick={() => handleMenuItemClick(item)} disabled={item.disabled} ref={el => {
          if (el) {
            menuItemsRef.current[index] = el;
          }
        }} aria-label={item.a11yLabel || item.label}>

              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}

              
              <ListItemText primary={item.label} secondary={item.description} />

            </MenuItem>;
      })}
      </Menu>
    </>;
});
A11yMenu.displayName = 'A11yMenu';
A11yMenu.propTypes = {
  // A11y props
  a11yLabel: PropTypes.string,
  a11yAnnouncement: PropTypes.string,
  a11yKeyboardNavigation: PropTypes.bool,
  // Standard menu props
  children: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    description: PropTypes.string,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    keepOpen: PropTypes.bool,
    divider: PropTypes.bool,
    a11yLabel: PropTypes.string,
    announcement: PropTypes.string
  })).isRequired,
  variant: PropTypes.oneOf(['menu', 'dropdown']),
  disabled: PropTypes.bool,
  triggerAs: PropTypes.oneOf(['button', 'icon', 'custom']),
  className: PropTypes.string,
  style: PropTypes.object
};
export default withErrorBoundary(A11yMenu, {
  boundary: 'A11yMenu',
  fallback: ({
    error,
    resetError
  }) => <Alert severity="error" onClose={resetError} sx={{
    width: '100%',
    mb: 2
  }}>
      {error?.message || 'An error occurred with the menu component. Please try again.'}
    </Alert>
});