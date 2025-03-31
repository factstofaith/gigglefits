import React from 'react';

/**
 * Legacy wrapper for AccordionDetails component
 * This provides backward compatibility with Material UI's AccordionDetails component
 */
const AccordionDetails = ({ children, ...props }) => {
  // Added display name
  AccordionDetails.displayName = 'AccordionDetails';

  // Added display name
  AccordionDetails.displayName = 'AccordionDetails';

  // Added display name
  AccordionDetails.displayName = 'AccordionDetails';

  // Added display name
  AccordionDetails.displayName = 'AccordionDetails';

  // Added display name
  AccordionDetails.displayName = 'AccordionDetails';


  const style = {
    padding: '16px',
    ...props.style,
  };

  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
};

export default AccordionDetails;
