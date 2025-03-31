import React, { forwardRef, useState, useRef, useEffect, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../foundations/theme';

/**
 * TabPanel component to contain the content for each tab
 */
export const TabPanel = forwardRef(({ children, value, index, ...props }, ref) => {
  const isActive = value === index;

  return (
    <div
      ref={ref}
      role="tabpanel&quot;
      hidden={!isActive}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{
        padding: "16px 0',
      }}
      {...props}
    >
      {isActive && children}
    </div>
  );
});

TabPanel.propTypes = {
  /**
   * The content of the tab panel
   */
  children: PropTypes.node,

  /**
   * The currently selected tab value
   */
  value: PropTypes.any.isRequired,

  /**
   * The index of this tab panel
   */
  index: PropTypes.any.isRequired,
};

TabPanel.displayName = 'TabPanel';

/**
 * Tab component to represent an individual tab
 */
export const Tab = forwardRef(
  ({ label, icon, value, disabled = false, selected = false, onChange, ...props }, ref) => {
    const { theme } = useTheme();

    const getBaseStyles = () => ({
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      minWidth: '90px',
      minHeight: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      border: 'none',
      borderBottom: `2px solid transparent`,
      borderRadius: 0,
      backgroundColor: 'transparent',
      color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      outline: 'none',
      position: 'relative',
      transition: 'all 0.2s ease',
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.button.fontSize,
      fontWeight: theme.typography.button.fontWeight,
      letterSpacing: theme.typography.button.letterSpacing,
      userSelect: 'none',
      whiteSpace: 'nowrap',
      textTransform: 'none',
    });

    const hoverStyles = !disabled
      ? {
          color: theme.palette.primary.main,
          backgroundColor: theme.palette.action.hover,
        }
      : {};

    const selectedStyles = selected
      ? {
          color: theme.palette.primary.main,
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          fontWeight: 600,
        }
      : {};

    const focusVisible = {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '-2px',
    };

    const handleClick = () => {
  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';

  // Added display name
  handleClick.displayName = 'handleClick';


      if (!disabled && onChange) {
        onChange(value);
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!disabled && onChange) {
          onChange(value);
        }
      }
    };

    return (
      <button
        ref={ref}
        role="tab&quot;
        aria-selected={selected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{
          ...getBaseStyles(),
          ...selectedStyles,
          ":hover': hoverStyles,
          ':focus-visible': focusVisible,
        }}
        {...props}
      >
        {icon && <span style={{ marginRight: label ? theme.spacing.xs : 0 }}>{icon}</span>}
        {label}
      </button>
    );
  }
);

Tab.propTypes = {
  /**
   * The text content of the tab
   */
  label: PropTypes.node,

  /**
   * Optional icon to display before the label
   */
  icon: PropTypes.node,

  /**
   * The value of the tab, used for selection
   */
  value: PropTypes.any,

  /**
   * Whether the tab is disabled
   */
  disabled: PropTypes.bool,

  /**
   * Whether the tab is currently selected
   */
  selected: PropTypes.bool,

  /**
   * Callback when the tab is selected
   */
  onChange: PropTypes.func,
};

Tab.displayName = 'Tab';

/**
 * Tabs component for switching between different views
 */
const Tabs = forwardRef(
  (
    {
      children,
      value,
      defaultValue,
      onChange,
      variant = 'standard',
      orientation = 'horizontal',
      centered = false,
      scrollable = false,
      'aria-label': ariaLabel = 'Tabs',
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [internalValue, setInternalValue] = useState(
      defaultValue !== undefined ? defaultValue : 0
    );
    const tabsRef = useRef(null);
    const scrollRef = useRef(null);

    // Use the controlled value if provided, otherwise use internal state
    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = newValue => {
      if (value === undefined) {
        setInternalValue(newValue);
      }

      if (onChange) {
        onChange(newValue);
      }
    };

    // Extract children that are Tab components and clone them with additional props
    const tabs = Children.map(children, (child, index) => {
      if (!React.isValidElement(child) || child.type.displayName !== 'Tab') {
        return null;
      }

      const tabValue = child.props.value !== undefined ? child.props.value : index;
      const selected = currentValue === tabValue;

      return cloneElement(child, {
        value: tabValue,
        selected,
        onChange: handleChange,
      });
    }).filter(Boolean); // Filter out null children

    // Horizontal scrolling for scrollable tabs
    const scrollLeft = () => {
  // Added display name
  scrollLeft.displayName = 'scrollLeft';

  // Added display name
  scrollLeft.displayName = 'scrollLeft';

  // Added display name
  scrollLeft.displayName = 'scrollLeft';

  // Added display name
  scrollLeft.displayName = 'scrollLeft';

  // Added display name
  scrollLeft.displayName = 'scrollLeft';


      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: -200,
          behavior: 'smooth',
        });
      }
    };

    const scrollRight = () => {
  // Added display name
  scrollRight.displayName = 'scrollRight';

  // Added display name
  scrollRight.displayName = 'scrollRight';

  // Added display name
  scrollRight.displayName = 'scrollRight';

  // Added display name
  scrollRight.displayName = 'scrollRight';

  // Added display name
  scrollRight.displayName = 'scrollRight';


      if (scrollRef.current) {
        scrollRef.current.scrollBy({
          left: 200,
          behavior: 'smooth',
        });
      }
    };

    // Add horizontal keyboard navigation for tabs
    useEffect(() => {
      const tabsElement = tabsRef.current;

      if (!tabsElement) return;

      const handleKeyNavigation = event => {
        if (orientation !== 'horizontal') return;

        // Only handle if we're focused on a tab
        const focusedElement = document.activeElement;
        if (!focusedElement || focusedElement.getAttribute('role') !== 'tab') return;

        const tabElements = Array.from(
          tabsElement.querySelectorAll('[role="tab"]:not([aria-disabled="true"])')
        );
        const currentIndex = tabElements.indexOf(focusedElement);

        if (currentIndex === -1) return;

        let nextIndex;

        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            nextIndex = (currentIndex - 1 + tabElements.length) % tabElements.length;
            tabElements[nextIndex].focus();
            break;
          case 'ArrowRight':
            event.preventDefault();
            nextIndex = (currentIndex + 1) % tabElements.length;
            tabElements[nextIndex].focus();
            break;
          case 'Home':
            event.preventDefault();
            tabElements[0].focus();
            break;
          case 'End':
            event.preventDefault();
            tabElements[tabElements.length - 1].focus();
            break;
          default:
            break;
        }
      };

      tabsElement.addEventListener('keydown', handleKeyNavigation);

      return () => {
        tabsElement.removeEventListener('keydown', handleKeyNavigation);
      };
    }, [orientation]);

    // Determine styles based on variant and orientation
    const getContainerStyles = () => {
  // Added display name
  getContainerStyles.displayName = 'getContainerStyles';

  // Added display name
  getContainerStyles.displayName = 'getContainerStyles';

  // Added display name
  getContainerStyles.displayName = 'getContainerStyles';

  // Added display name
  getContainerStyles.displayName = 'getContainerStyles';

  // Added display name
  getContainerStyles.displayName = 'getContainerStyles';


      const styles = {
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        position: 'relative',
        width: '100%',
      };

      if (variant === 'standard') {
        styles.borderBottom =
          orientation === 'horizontal' ? `1px solid ${theme.palette.divider}` : 'none';
        styles.borderRight =
          orientation === 'vertical' ? `1px solid ${theme.palette.divider}` : 'none';
      } else if (variant === 'contained') {
        styles.backgroundColor = theme.palette.background.paper;
        styles.borderRadius = theme.shape.borderRadius;
        styles.boxShadow = theme.shadows[1];
        styles.padding = theme.spacing.xs;
      }

      if (centered && orientation === 'horizontal') {
        styles.justifyContent = 'center';
      }

      if (scrollable && orientation === 'horizontal') {
        styles.overflowX = 'auto';
        styles.scrollbarWidth = 'none'; // Firefox
        styles.msOverflowStyle = 'none'; // IE/Edge
        styles['::-webkit-scrollbar'] = { display: 'none' }; // Chrome, Safari, Opera
      }

      return styles;
    };

    const renderScrollButtons = () => {
  // Added display name
  renderScrollButtons.displayName = 'renderScrollButtons';

  // Added display name
  renderScrollButtons.displayName = 'renderScrollButtons';

  // Added display name
  renderScrollButtons.displayName = 'renderScrollButtons';

  // Added display name
  renderScrollButtons.displayName = 'renderScrollButtons';

  // Added display name
  renderScrollButtons.displayName = 'renderScrollButtons';


      if (!scrollable || orientation === 'vertical') return null;

      const buttonStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        backgroundColor: theme.palette.background.paper,
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: theme.shadows[2],
        color: theme.palette.text.primary,
        fontSize: '18px',
      };

      return (
        <>
          <button
            type="button&quot;
            onClick={scrollLeft}
            style={{
              ...buttonStyle,
              left: "-18px',
            }}
            aria-label="Scroll tabs left"
          >
            &#8249;
          </button>
          <button
            type="button&quot;
            onClick={scrollRight}
            style={{
              ...buttonStyle,
              right: "-18px',
            }}
            aria-label="Scroll tabs right"
          >
            &#8250;
          </button>
        </>
      );
    };

    return (
      <div ref={ref} style={{ position: 'relative' }} {...props}>
        {scrollable && renderScrollButtons()}
        <div
          ref={node => {
            tabsRef.current = node;
            if (scrollable) scrollRef.current = node;
          }}
          role="tablist&quot;
          aria-label={ariaLabel}
          aria-orientation={orientation}
          style={getContainerStyles()}
        >
          {tabs}
        </div>
      </div>
    );
  }
);

Tabs.propTypes = {
  /**
   * The content of the tabs, normally `Tab` components
   */
  children: PropTypes.node,

  /**
   * The currently selected tab value (controlled)
   */
  value: PropTypes.any,

  /**
   * The default selected tab value (uncontrolled)
   */
  defaultValue: PropTypes.any,

  /**
   * Callback when a tab is selected
   */
  onChange: PropTypes.func,

  /**
   * The visual style of the tabs
   */
  variant: PropTypes.oneOf(["standard', 'contained']),

  /**
   * The orientation of the tabs
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),

  /**
   * Whether the tabs should be centered
   */
  centered: PropTypes.bool,

  /**
   * Whether the tabs should be scrollable
   */
  scrollable: PropTypes.bool,

  /**
   * Accessible label for the tabs
   */
  'aria-label': PropTypes.string,
};

Tabs.displayName = 'Tabs';

// Export the TabPanel and Tab as properties of Tabs
Tabs.Panel = TabPanel;
Tabs.Tab = Tab;

export default Tabs;
