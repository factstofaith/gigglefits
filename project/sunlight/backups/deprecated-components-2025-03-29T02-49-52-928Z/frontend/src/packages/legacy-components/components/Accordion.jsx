import React from 'react';

/**
 * Legacy wrapper for Accordion component
 * This provides backward compatibility with Material UI's Accordion component
 */
const Accordion = ({ children, expanded, onChange, ...props }) => {
  // Added display name
  Accordion.displayName = 'Accordion';

  // Added display name
  Accordion.displayName = 'Accordion';

  // Added display name
  Accordion.displayName = 'Accordion';

  // Added display name
  Accordion.displayName = 'Accordion';

  // Added display name
  Accordion.displayName = 'Accordion';


  const style = {
    borderRadius: '4px',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    boxShadow:
      '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
    margin: '8px 0',
    backgroundColor: '#fff',
    width: '100%',
    overflow: 'hidden',
    ...props.style,
  };

  return (
    <div style={style} {...props}>
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;

        // Pass expanded and onChange to children
        return React.cloneElement(child, {
          expanded: expanded,
          onChange: onChange,
        });
      })}
    </div>
  );
};

export default Accordion;
