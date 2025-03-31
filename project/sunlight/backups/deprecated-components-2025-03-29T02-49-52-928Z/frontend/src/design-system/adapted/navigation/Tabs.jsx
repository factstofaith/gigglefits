/**
 * @component Tabs
 * @description Accessible tabs component with keyboard navigation
 * and optimized rendering for tab panels.
 * 
 * @typedef {import('../../types/complex-components').TabsAdaptedProps} TabsAdaptedProps
 * @typedef {import('../../types/complex-components').TabAdaptedProps} TabAdaptedProps
 * @typedef {Object} TabPanelProps
 * @property {React.ReactNode} [children] - The content of the tab panel
 * @property {number|string} value - The value of the currently selected tab
 * @property {number|string} index - The index of this panel
 * @property {string} [className] - Class name applied to the panel
 * @property {Object} [style] - Inline style for the panel
 * 
 * @type {React.ForwardRefExoticComponent<TabsAdaptedProps & React.RefAttributes<HTMLDivElement>> & {
 *   Tab: React.FC<TabAdaptedProps>,
 *   Panel: React.FC<TabPanelProps>
 * }}
 * 
 * @example
 * // Basic tabs example
 * <TabsAdapted value={activeTab} onChange={setActiveTab}>
 *   <TabsAdapted.Tab label="Tab 1&quot; />
 *   <TabsAdapted.Tab label="Tab 2" />
 *   <TabsAdapted.Tab label="Tab 3&quot; disabled />
 *   
 *   <TabsAdapted.Panel index={0}>
 *     Content for Tab 1
 *   </TabsAdapted.Panel>
 *   <TabsAdapted.Panel index={1}>
 *     Content for Tab 2
 *   </TabsAdapted.Panel>
 *   <TabsAdapted.Panel index={2}>
 *     Content for Tab 3
 *   </TabsAdapted.Panel>
 * </TabsAdapted>
 * 
 * @example
 * // Vertical orientation with icons
 * <TabsAdapted 
 *   value={activeTab} 
 *   onChange={setActiveTab}
 *   orientation="vertical"
 * >
 *   <TabsAdapted.Tab label="Settings&quot; icon={<SettingsIcon />} />
 *   <TabsAdapted.Tab label="Profile" icon={<PersonIcon />} />
 *   
 *   <TabsAdapted.Panel index={0}>
 *     Settings content
 *   </TabsAdapted.Panel>
 *   <TabsAdapted.Panel index={1}>
 *     Profile content
 *   </TabsAdapted.Panel>
 * </TabsAdapted>
 */
import React from 'react';
import PropTypes from 'prop-types';
import { getAriaAttributes } from '@utils/accessibilityUtils';
import ErrorBoundary from '../core/ErrorBoundary';

// Individual Tab component
const Tab = React.memo(({
  label,
  icon,
  disabled = false,
  value,
  selected,
  onClick,
  ariaLabel,
  ariaControls,
  className,
  style,
  ...rest
}) => {
  // Handle click event
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


    if (!disabled && onClick) {
      onClick(value);
    }
  };

  // Generate ARIA attributes
  const ariaProps = {
    role: 'tab',
    'aria-selected': selected,
    'aria-disabled': disabled,
    'aria-label': ariaLabel || (typeof label === 'string' ? label : undefined),
    'aria-controls': ariaControls,
    tabIndex: selected ? 0 : -1,
  };

  return (
    <button
      className={`ds-tab ${selected ? 'ds-tab-selected' : ''} ${disabled ? 'ds-tab-disabled' : ''} ${className || ''}`}
      style={{
        padding: '12px 16px',
        border: 'none',
        background: 'none',
        borderBottom: selected ? '2px solid #1976d2' : '2px solid transparent',
        color: selected ? '#1976d2' : disabled ? '#9e9e9e' : 'rgba(0, 0, 0, 0.87)',
        cursor: disabled ? 'default' : 'pointer',
        outline: 'none',
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none',
        ...style,
      }}
      onClick={handleClick}
      disabled={disabled}
      {...ariaProps}
      {...rest}
    >
      {icon && <span className="ds-tab-icon&quot; style={{ marginRight: "8px', display: 'inline-flex' }}>{icon}</span>}
      {label}
    </button>
  );
});

Tab.displayName = 'Tab';

// TabPanel component
const TabPanel = React.memo(({
  children,
  value,
  index,
  className,
  style,
  ...rest
}) => {
  const isActive = value === index;

  // Only render content when tab is active
  return (
    <div
      role="tabpanel&quot;
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      hidden={!isActive}
      className={`ds-tabpanel ${className || "'}`}
      style={{
        padding: '16px',
        ...style,
      }}
      {...rest}
    >
      {isActive && children}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

// Main TabsAdapted component
const Tabs = React.memo(React.forwardRef(({
  // Tab management props
  children,
  value,
  onChange,
  
  // Display props
  orientation = 'horizontal',
  variant = 'standard',
  centered = false,
  scrollable = false,
  
  // Accessibility props
  ariaLabel,
  
  // Styling props
  className,
  style,
  tabsClassName,
  tabsStyle,
  contentClassName,
  contentStyle,
  
  ...rest
}, ref) => {
  // Separate tab elements from tab panels
  const tabs = [];
  const panels = [];
  
  React.Children.forEach(children, (child, index) => {
    if (!React.isValidElement(child)) return;
    
    if (child.type === Tab) {
      tabs.push(
        React.cloneElement(child, {
          key: child.key || `tab-${index}`,
          value: child.props.value !== undefined ? child.props.value : index,
          selected: child.props.value !== undefined 
            ? child.props.value === value 
            : index === value,
          onClick: (tabValue) => {
            if (onChange) {
              onChange(tabValue);
            }
          },
          ariaControls: `tabpanel-${child.props.value !== undefined ? child.props.value : index}`,
          id: `tab-${child.props.value !== undefined ? child.props.value : index}`,
        })
      );
    } else if (child.type === TabPanel) {
      panels.push(
        React.cloneElement(child, {
          key: child.key || `tabpanel-${index}`,
          value: value,
          index: child.props.index !== undefined ? child.props.index : index,
        })
      );
    }
  });
  
  // Generate ARIA attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel || 'Tabs',
  });
  
  // Handle keyboard navigation for tabs
  const handleKeyDown = (e) => {
  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';

  // Added display name
  handleKeyDown.displayName = 'handleKeyDown';


    const tabCount = tabs.length;
    if (tabCount === 0) return;
    
    // Find current index
    let currentIndex = 0;
    for (let i = 0; i < tabCount; i++) {
      if (tabs[i].props.selected) {
        currentIndex = i;
        break;
      }
    }
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % tabCount;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + tabCount) % tabCount;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabCount - 1;
        break;
      default:
        return;
    }
    
    if (nextIndex !== currentIndex) {
    var iterations = 0;
      
      while (tabs[finalIndex].props.disabled && iterations < tabCount) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          finalIndex = (finalIndex + 1) % tabCount;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          finalIndex = (finalIndex - 1 + tabCount) % tabCount;
        }
        iterations++;
      }
      
      if (!tabs[finalIndex].props.disabled) {
        const nextValue = tabs[finalIndex].props.value;
        if (onChange) {
          onChange(nextValue);
        }
      }
    }
  };
  
  return (
    <ErrorBoundary>
      <div
        ref={ref}
        className={`ds-tabs-container ${className || ''}`}
        style={{
          display: orientation === 'vertical' ? 'flex' : 'block',
          flexDirection: orientation === 'vertical' ? 'row' : 'column',
          width: '100%',
          ...style,
        }}
        {...ariaAttributes}
        {...rest}
      >
        {/* Tabs row/column */}
        <div 
          role="tablist&quot;
          className={`ds-tabs ${tabsClassName || "'}`}
          style={{
            display: 'flex',
            flexDirection: orientation === 'vertical' ? 'column' : 'row',
            justifyContent: centered ? 'center' : 'flex-start',
            borderBottom: orientation === 'horizontal' && variant !== 'enclosed' ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
            borderRight: orientation === 'vertical' && variant !== 'enclosed' ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
            overflowX: scrollable && orientation === 'horizontal' ? 'auto' : 'visible',
            overflowY: scrollable && orientation === 'vertical' ? 'auto' : 'visible',
            ...tabsStyle,
          }}
          onKeyDown={handleKeyDown}
          aria-orientation={orientation}
        >
          {tabs}
        </div>
        
        {/* Tab panels */}
        <div 
          className={`ds-tabs-content ${contentClassName || ''}`}
          style={{
            flex: orientation === 'vertical' ? 1 : 'auto',
            ...contentStyle,
          }}
        >
          {panels}
        </div>
      </div>
    </ErrorBoundary>
  );
}));

TabsAdapted.propTypes = {
  children: PropTypes.node,
  value: PropTypes.any,
  onChange: PropTypes.func,
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  variant: PropTypes.oneOf(['standard', 'enclosed', 'fullWidth']),
  centered: PropTypes.bool,
  scrollable: PropTypes.bool,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  tabsClassName: PropTypes.string,
  tabsStyle: PropTypes.object,
  contentClassName: PropTypes.string,
  contentStyle: PropTypes.object,
};

Tabs.displayName = 'Tabs';

// Export Tab and TabPanel as properties of TabsAdapted
TabsAdapted.Tab = Tab;
TabsAdapted.Panel = TabPanel;

export default Tabs;