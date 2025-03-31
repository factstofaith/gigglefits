/**
 * Tabs
 * 
 * A standardized tabs component for organizing content into multiple sections.
 * 
 * @module components/common/Tabs
 */

import React, { forwardRef, useState, useEffect, useRef, Children, isValidElement, cloneElement } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized tabs component
 * 
 * @param {Object} props - Component props
 * @param {node} props.children - Tab panels to display
 * @param {number} [props.defaultValue=0] - Default selected tab index (uncontrolled)
 * @param {number} [props.value] - Selected tab index (controlled)
 * @param {Function} [props.onChange] - Callback when tab changes
 * @param {string} [props.orientation='horizontal'] - Tabs orientation
 * @param {string} [props.variant='standard'] - Visual variant
 * @param {boolean} [props.centered=false] - Whether to center the tabs
 * @param {boolean} [props.fullWidth=false] - Whether tabs should take full width
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The tabs component
 */
const Tabs = forwardRef(({
  children,
  defaultValue = 0,
  value: valueProp,
  onChange,
  orientation = 'horizontal',
  variant = 'standard',
  centered = false,
  fullWidth = false,
  className = '',
  ...rest
}, ref) => {
  // Determine if controlled or uncontrolled
  const isControlled = valueProp !== undefined;
  const [selectedTab, setSelectedTab] = useState(defaultValue);
  const value = isControlled ? valueProp : selectedTab;
  
  // Refs for tab elements and indicator
  const tabsRef = useRef(null);
  const tabRefs = useRef([]);
  const indicatorRef = useRef(null);
  
  // Update indicator position when selected tab changes
  useEffect(() => {
    updateIndicator();
  }, [value]);
  
  // Update indicator position when window resizes
  useEffect(() => {
    const handleResize = () => {
      updateIndicator();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Update indicator position
  const updateIndicator = () => {
    if (!tabsRef.current || !indicatorRef.current || tabRefs.current.length === 0) return;
    
    const selectedTabEl = tabRefs.current[value];
    if (!selectedTabEl) return;
    
    if (orientation === 'horizontal') {
      indicatorRef.current.style.left = `${selectedTabEl.offsetLeft}px`;
      indicatorRef.current.style.width = `${selectedTabEl.offsetWidth}px`;
    } else {
      indicatorRef.current.style.top = `${selectedTabEl.offsetTop}px`;
      indicatorRef.current.style.height = `${selectedTabEl.offsetHeight}px`;
    }
  };
  
  // Handle tab selection
  const handleTabSelect = (index) => {
    if (!isControlled) {
      setSelectedTab(index);
    }
    
    if (onChange) {
      onChange(index);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e, index) => {
    let newIndex = index;
    
    const tabCount = Children.count(children);
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        newIndex = (index + 1) % tabCount;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        newIndex = (index - 1 + tabCount) % tabCount;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabCount - 1;
        break;
      default:
        return;
    }
    
    // Prevent default behavior for these keys
    e.preventDefault();
    
    // Move focus to the new tab
    tabRefs.current[newIndex].focus();
    
    // Select the new tab
    handleTabSelect(newIndex);
  };
  
  // Extract tab information from children
  const tabs = [];
  const tabPanels = [];
  
  Children.forEach(children, (child, index) => {
    if (!isValidElement(child)) return;
    
    if (child.type.displayName === 'TabPanel') {
      // Get the label from the TabPanel
      const { label, disabled } = child.props;
      
      // Create a tab
      tabs.push({ label, disabled, index });
      
      // Clone the TabPanel with the selected state
      tabPanels.push(
        cloneElement(child, {
          selected: value === index,
          id: `tap-tab-panel-${index}`,
          'aria-labelledby': `tap-tab-${index}`,
        })
      );
    } else {
      // Non-TabPanel children are just passed through
      tabPanels.push(child);
    }
  });
  
  // Tab list styles
  const tabListStyle = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: centered ? 'center' : 'flex-start',
    borderBottom: orientation === 'horizontal' && variant !== 'contained' ? '1px solid #e0e0e0' : 'none',
    borderRight: orientation === 'vertical' && variant !== 'contained' ? '1px solid #e0e0e0' : 'none',
  };
  
  // Tab styles
  const getTabStyle = (isSelected, isDisabled) => {
    const baseStyle = {
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: isSelected ? 600 : 400,
      color: isDisabled ? '#bdbdbd' : isSelected ? '#1976d2' : '#616161',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.7 : 1,
      border: 'none',
      background: 'none',
      textAlign: 'center',
      transition: 'color 0.2s',
      outline: 'none',
      position: 'relative',
      zIndex: 1,
      whiteSpace: 'nowrap',
      flex: fullWidth ? 1 : 'auto',
    };
    
    // Variant specific styles
    if (variant === 'contained') {
      baseStyle.backgroundColor = isSelected ? '#1976d2' : 'transparent';
      baseStyle.color = isSelected ? 'white' : '#616161';
      baseStyle.borderRadius = orientation === 'horizontal' ? '4px 4px 0 0' : '4px 0 0 4px';
    }
    
    return baseStyle;
  };
  
  // Indicator styles
  const indicatorStyle = {
    position: 'absolute',
    backgroundColor: variant === 'contained' ? 'transparent' : '#1976d2',
    transition: 'all 0.3s',
    ...(orientation === 'horizontal'
      ? {
          bottom: 0,
          height: '2px',
        }
      : {
          right: 0,
          width: '2px',
        }),
  };
  
  return (
    <div 
      className={`tap-tabs tap-tabs--${orientation} tap-tabs--${variant} ${fullWidth ? 'tap-tabs--fullwidth' : ''} ${className}`}
      ref={ref}
      data-testid="tap-tabs"
      {...rest}
    >
      {/* Tab List */}
      <div 
        className="tap-tabs__list"
        style={tabListStyle}
        ref={tabsRef}
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map(({ label, disabled, index }) => (
          <button
            key={index}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            id={`tap-tab-${index}`}
            aria-selected={value === index}
            aria-controls={`tap-tab-panel-${index}`}
            tabIndex={value === index ? 0 : -1}
            onClick={() => !disabled && handleTabSelect(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={getTabStyle(value === index, disabled)}
            className={`tap-tabs__tab ${value === index ? 'tap-tabs__tab--selected' : ''} ${disabled ? 'tap-tabs__tab--disabled' : ''}`}
            disabled={disabled}
            data-testid={`tap-tab-${index}`}
          >
            {label}
          </button>
        ))}
        
        {/* Indicator */}
        {variant !== 'contained' && (
          <span 
            className="tap-tabs__indicator" 
            style={indicatorStyle}
            ref={indicatorRef}
          />
        )}
      </div>
      
      {/* Tab Panels */}
      <div className="tap-tabs__panels">
        {tabPanels}
      </div>
    </div>
  );
});

/**
 * TabPanel component - container for tab content
 * 
 * @param {Object} props - Component props
 * @param {node} props.children - Tab panel content
 * @param {string} props.label - Tab label
 * @param {boolean} [props.disabled=false] - Whether tab is disabled
 * @param {boolean} [props.selected=false] - Whether tab is selected
 * @param {string} [props.className] - Additional CSS class names
 * @returns {JSX.Element} The tab panel component
 */
const TabPanel = ({
  children,
  label,
  disabled = false,
  selected = false,
  className = '',
  ...rest
}) => {
  // Panel styles
  const panelStyle = {
    padding: '16px',
    display: selected ? 'block' : 'none',
  };
  
  return (
    <div
      className={`tap-tab-panel ${selected ? 'tap-tab-panel--selected' : ''} ${className}`}
      style={panelStyle}
      role="tabpanel"
      aria-hidden={!selected}
      data-testid="tap-tab-panel"
      {...rest}
    >
      {children}
    </div>
  );
};

// Display name for debugging
Tabs.displayName = 'Tabs';
TabPanel.displayName = 'TabPanel';

// Prop types
Tabs.propTypes = {
  /** Tab panels to display */
  children: PropTypes.node.isRequired,
  
  /** Default selected tab index (uncontrolled) */
  defaultValue: PropTypes.number,
  
  /** Selected tab index (controlled) */
  value: PropTypes.number,
  
  /** Callback when tab changes */
  onChange: PropTypes.func,
  
  /** Tabs orientation */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  
  /** Visual variant */
  variant: PropTypes.oneOf(['standard', 'contained']),
  
  /** Whether to center the tabs */
  centered: PropTypes.bool,
  
  /** Whether tabs should take full width */
  fullWidth: PropTypes.bool,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

TabPanel.propTypes = {
  /** Tab panel content */
  children: PropTypes.node.isRequired,
  
  /** Tab label */
  label: PropTypes.node.isRequired,
  
  /** Whether tab is disabled */
  disabled: PropTypes.bool,
  
  /** Whether tab is selected */
  selected: PropTypes.bool,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

// Export both components
export { TabPanel };
export default Tabs;