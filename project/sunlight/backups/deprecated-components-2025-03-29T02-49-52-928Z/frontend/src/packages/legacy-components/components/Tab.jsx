import React from 'react';

/**
 * Legacy wrapper for Tab component
 * This provides backward compatibility with Material UI's Tab component
 */
const Tab = ({ label, icon, selected, onClick, ...props }) => {
  // Added display name
  Tab.displayName = 'Tab';

  // Added display name
  Tab.displayName = 'Tab';

  // Added display name
  Tab.displayName = 'Tab';

  // Added display name
  Tab.displayName = 'Tab';

  // Added display name
  Tab.displayName = 'Tab';


  // Basic implementation of tab - would need more sophistication in real component
  const style = {
    padding: '12px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    borderBottom: selected ? '2px solid #1976d2' : '2px solid transparent',
    color: selected ? '#1976d2' : 'inherit',
    fontWeight: selected ? '500' : 'normal',
    ...props.style,
  };

  return (
    <div style={style} onClick={onClick} role="tab&quot; aria-selected={selected} {...props}>
      {icon && <span style={{ marginRight: "8px' }}>{icon}</span>}
      {label}
    </div>
  );
};

export default Tab;
