import React from 'react';

/**
 * Legacy wrapper for Tabs component
 * This provides backward compatibility with Material UI's Tabs component
 */
const Tabs = ({ value, onChange, children, ...props }) => {
  // Added display name
  Tabs.displayName = 'Tabs';

  // Added display name
  Tabs.displayName = 'Tabs';

  // Added display name
  Tabs.displayName = 'Tabs';

  // Added display name
  Tabs.displayName = 'Tabs';

  // Added display name
  Tabs.displayName = 'Tabs';


  // Basic implementation of tabs - would need more sophistication in real component
  const style = {
    display: 'flex',
    borderBottom: '1px solid #ddd',
    ...props.style,
  };

  // Clone children with additional props
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    return React.cloneElement(child, {
      selected: value === index,
      onClick: e => {
        if (onChange) onChange(e, index);
        if (child.props.onClick) child.props.onClick(e);
      },
    });
  });

  return (
    <div style={style} {...props}>
      {enhancedChildren}
    </div>
  );
};

export default Tabs;
