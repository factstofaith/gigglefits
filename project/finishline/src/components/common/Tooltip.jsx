/**
 * Tooltip
 * 
 * A standardized tooltip component for displaying informational text on hover.
 * 
 * @module components/common/Tooltip
 */

import React, { forwardRef, useState, useRef, useEffect, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

/**
 * Standardized tooltip component
 * 
 * @param {Object} props - Component props
 * @param {node} props.children - The element that triggers the tooltip
 * @param {string|node} props.title - Tooltip content
 * @param {string} [props.placement='top'] - Tooltip placement
 * @param {number} [props.enterDelay=100] - Delay before showing tooltip (ms)
 * @param {number} [props.leaveDelay=0] - Delay before hiding tooltip (ms)
 * @param {string} [props.color='default'] - Tooltip color
 * @param {string} [props.size='medium'] - Tooltip size
 * @param {boolean} [props.arrow=true] - Whether to show an arrow
 * @param {boolean} [props.interactive=false] - Whether tooltip is interactive
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The tooltip component
 */
const Tooltip = forwardRef(({
  children,
  title,
  placement = 'top',
  enterDelay = 100,
  leaveDelay = 0,
  color = 'default',
  size = 'medium',
  arrow = true,
  interactive = false,
  className = '',
  ...rest
}, ref) => {
  // State for tooltip visibility
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  // Refs for DOM elements
  const childRef = useRef(null);
  const tooltipRef = useRef(null);
  const enterTimeout = useRef(null);
  const leaveTimeout = useRef(null);
  
  // Portal element
  const tooltipContainer = document.getElementById('tooltip-root') || document.body;
  
  // Color styles
  const colorMap = {
    default: { background: '#616161', color: '#ffffff' },
    primary: { background: '#1976d2', color: '#ffffff' },
    secondary: { background: '#9c27b0', color: '#ffffff' },
    success: { background: '#4caf50', color: '#ffffff' },
    warning: { background: '#ff9800', color: '#ffffff' },
    error: { background: '#f44336', color: '#ffffff' },
    info: { background: '#2196f3', color: '#ffffff' },
  };
  
  // Size styles
  const sizeMap = {
    small: { fontSize: '0.75rem', padding: '4px 8px' },
    medium: { fontSize: '0.875rem', padding: '6px 12px' },
    large: { fontSize: '1rem', padding: '8px 16px' },
  };
  
  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (enterTimeout.current) clearTimeout(enterTimeout.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    };
  }, []);
  
  // Update tooltip position when visible or window resizes
  useEffect(() => {
    if (isVisible) {
      updateTooltipPosition();
      window.addEventListener('resize', updateTooltipPosition);
      window.addEventListener('scroll', updateTooltipPosition);
      
      return () => {
        window.removeEventListener('resize', updateTooltipPosition);
        window.removeEventListener('scroll', updateTooltipPosition);
      };
    }
  }, [isVisible]);
  
  // Handle hover/focus events
  const handleMouseEnter = (e) => {
    if (enterTimeout.current) clearTimeout(enterTimeout.current);
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    
    enterTimeout.current = setTimeout(() => {
      setIsVisible(true);
    }, enterDelay);
    
    // Call child's onMouseEnter if it exists
    if (children.props.onMouseEnter) {
      children.props.onMouseEnter(e);
    }
  };
  
  const handleMouseLeave = (e) => {
    if (enterTimeout.current) clearTimeout(enterTimeout.current);
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    
    leaveTimeout.current = setTimeout(() => {
      setIsVisible(false);
    }, leaveDelay);
    
    // Call child's onMouseLeave if it exists
    if (children.props.onMouseLeave) {
      children.props.onMouseLeave(e);
    }
  };
  
  const handleFocus = (e) => {
    handleMouseEnter(e);
    
    // Call child's onFocus if it exists
    if (children.props.onFocus) {
      children.props.onFocus(e);
    }
  };
  
  const handleBlur = (e) => {
    handleMouseLeave(e);
    
    // Call child's onBlur if it exists
    if (children.props.onBlur) {
      children.props.onBlur(e);
    }
  };
  
  // Handle tooltip events if interactive
  const handleTooltipMouseEnter = () => {
    if (interactive) {
      if (enterTimeout.current) clearTimeout(enterTimeout.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    }
  };
  
  const handleTooltipMouseLeave = () => {
    if (interactive) {
      handleMouseLeave({});
    }
  };
  
  // Update tooltip position based on target element and placement
  const updateTooltipPosition = () => {
    if (!childRef.current || !tooltipRef.current) return;
    
    const targetRect = childRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Calculate position based on placement
    let top = 0;
    let left = 0;
    
    const gap = 8; // Gap between target and tooltip
    
    switch (placement) {
      case 'top':
        top = targetRect.top + scrollTop - tooltipRect.height - gap;
        left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = targetRect.bottom + scrollTop + gap;
        left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = targetRect.top + scrollTop + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left + scrollLeft - tooltipRect.width - gap;
        break;
      case 'right':
        top = targetRect.top + scrollTop + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + scrollLeft + gap;
        break;
    }
    
    // Keep tooltip within viewport
    const padding = 8;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    
    if (left < padding) {
      left = padding;
    } else if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }
    
    if (top < padding) {
      top = padding;
    } else if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }
    
    setTooltipPosition({ top, left });
  };
  
  // Get arrow position based on placement
  const getArrowStyle = () => {
    const baseStyle = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };
    
    const colorStyle = colorMap[color] || colorMap.default;
    
    switch (placement) {
      case 'top':
        return {
          ...baseStyle,
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '8px 8px 0 8px',
          borderColor: `${colorStyle.background} transparent transparent transparent`,
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 8px 8px 8px',
          borderColor: `transparent transparent ${colorStyle.background} transparent`,
        };
      case 'left':
        return {
          ...baseStyle,
          right: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '8px 0 8px 8px',
          borderColor: `transparent transparent transparent ${colorStyle.background}`,
        };
      case 'right':
        return {
          ...baseStyle,
          left: -8,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '8px 8px 8px 0',
          borderColor: `transparent ${colorStyle.background} transparent transparent`,
        };
      default:
        return baseStyle;
    }
  };
  
  // Don't render if no title
  if (!title) {
    return children;
  }
  
  // Clone child element to add tooltip trigger props
  const childElement = cloneElement(children, {
    ref: (node) => {
      childRef.current = node;
      
      // Handle forwarded ref from child
      const { ref: childRefProp } = children;
      if (childRefProp) {
        if (typeof childRefProp === 'function') {
          childRefProp(node);
        } else if (childRefProp.hasOwnProperty('current')) {
          childRefProp.current = node;
        }
      }
    },
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    'aria-describedby': isVisible ? 'tooltip' : undefined,
  });
  
  // Tooltip styles
  const tooltipStyle = {
    position: 'absolute',
    zIndex: 1500,
    top: tooltipPosition.top,
    left: tooltipPosition.left,
    maxWidth: 300,
    wordWrap: 'break-word',
    borderRadius: 4,
    transition: 'opacity 0.3s',
    opacity: isVisible ? 1 : 0,
    pointerEvents: interactive ? 'auto' : 'none',
    ...colorMap[color],
    ...sizeMap[size],
  };
  
  return (
    <>
      {childElement}
      
      {createPortal(
        <div
          ref={(node) => {
            tooltipRef.current = node;
            
            // Forward ref to tooltip element
            if (ref) {
              if (typeof ref === 'function') {
                ref(node);
              } else {
                ref.current = node;
              }
            }
          }}
          role="tooltip"
          id="tooltip"
          style={tooltipStyle}
          className={`tap-tooltip tap-tooltip--${placement} tap-tooltip--${color} tap-tooltip--${size} ${arrow ? 'tap-tooltip--arrow' : ''} ${interactive ? 'tap-tooltip--interactive' : ''} ${className}`}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          data-testid="tap-tooltip"
          {...rest}
        >
          {title}
          {arrow && <span style={getArrowStyle()} className="tap-tooltip__arrow" />}
        </div>,
        tooltipContainer
      )}
    </>
  );
});

// Display name for debugging
Tooltip.displayName = 'Tooltip';

// Prop types
Tooltip.propTypes = {
  /** The element that triggers the tooltip */
  children: PropTypes.element.isRequired,
  
  /** Tooltip content */
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  
  /** Tooltip placement */
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  
  /** Delay before showing tooltip (ms) */
  enterDelay: PropTypes.number,
  
  /** Delay before hiding tooltip (ms) */
  leaveDelay: PropTypes.number,
  
  /** Tooltip color */
  color: PropTypes.oneOf(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'info']),
  
  /** Tooltip size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /** Whether to show an arrow */
  arrow: PropTypes.bool,
  
  /** Whether tooltip is interactive */
  interactive: PropTypes.bool,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

export default Tooltip;