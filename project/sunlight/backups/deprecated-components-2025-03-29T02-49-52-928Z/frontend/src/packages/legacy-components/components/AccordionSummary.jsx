import React from 'react';

/**
 * Legacy wrapper for AccordionSummary component
 * This provides backward compatibility with Material UI's AccordionSummary component
 */
const AccordionSummary = ({ children, expanded, expandIcon, onChange, ...props }) => {
  // Added display name
  AccordionSummary.displayName = 'AccordionSummary';

  // Added display name
  AccordionSummary.displayName = 'AccordionSummary';

  // Added display name
  AccordionSummary.displayName = 'AccordionSummary';

  // Added display name
  AccordionSummary.displayName = 'AccordionSummary';

  // Added display name
  AccordionSummary.displayName = 'AccordionSummary';


  const handleClick = e => {
    if (onChange) {
      onChange(e, !expanded);
    }
  };

  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    cursor: 'pointer',
    backgroundColor: expanded ? 'rgba(0, 0, 0, 0.03)' : 'transparent',
    borderBottom: expanded ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
    ...props.style,
  };

  const iconStyle = {
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <div style={style} onClick={handleClick} {...props}>
      <div style={{ flex: 1 }}>{children}</div>
      {expandIcon && <div style={iconStyle}>{expandIcon}</div>}
    </div>
  );
};

export default AccordionSummary;
