import React, { useState } from 'react';

/**
 * Legacy wrapper for Tooltip component
 * This provides backward compatibility with Material UI's Tooltip component
 */
const Tooltip = ({ title, children, placement = 'bottom', ...props }) => {
  // Added display name
  Tooltip.displayName = 'Tooltip';

  // Added display name
  Tooltip.displayName = 'Tooltip';

  // Added display name
  Tooltip.displayName = 'Tooltip';

  // Added display name
  Tooltip.displayName = 'Tooltip';

  // Added display name
  Tooltip.displayName = 'Tooltip';


  const [showTooltip, setShowTooltip] = useState(false);

  // Basic tooltip implementation
  const tooltipStyle = {
    position: 'relative',
    display: 'inline-flex',
    ...props.style,
  };

  const contentStyle = {
    position: 'absolute',
    backgroundColor: 'rgba(97, 97, 97, 0.9)',
    color: '#fff',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.75rem',
    maxWidth: '300px',
    zIndex: 1500,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    ...(placement === 'top' && {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(-4px)',
    }),
    ...(placement === 'bottom' && {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%) translateY(4px)',
    }),
    ...(placement === 'left' && {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(-4px)',
    }),
    ...(placement === 'right' && {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%) translateX(4px)',
    }),
    opacity: showTooltip ? 1 : 0,
    transition: 'opacity 0.2s',
  };

  return (
    <div
      style={tooltipStyle}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      {children}
      {title && <div style={contentStyle}>{title}</div>}
    </div>
  );
};

export default Tooltip;
