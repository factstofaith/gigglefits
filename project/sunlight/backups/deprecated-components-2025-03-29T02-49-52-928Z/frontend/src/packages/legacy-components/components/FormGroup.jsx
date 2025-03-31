import React from 'react';

/**
 * Legacy wrapper for FormGroup component
 * This provides backward compatibility with Material UI's FormGroup component
 */
const FormGroup = ({ children, row = false, ...props }) => {
  // Added display name
  FormGroup.displayName = 'FormGroup';

  // Added display name
  FormGroup.displayName = 'FormGroup';

  // Added display name
  FormGroup.displayName = 'FormGroup';

  // Added display name
  FormGroup.displayName = 'FormGroup';

  // Added display name
  FormGroup.displayName = 'FormGroup';


  const style = {
    display: 'flex',
    flexDirection: row ? 'row' : 'column',
    ...props.style,
  };

  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
};

export default FormGroup;
