import React from 'react';
import Box from './BoxLegacy';

/**
 * Legacy wrapper for TabPanel component
 *
 * This component provides a custom implementation for tab panels
 * that maintains backward compatibility with Material UI's pattern.
 */
const TabPanel = ({ children, value, index, ...other }) => {
  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';


  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <BoxLegacy>{children}</BoxLegacy>}
    </div>
  );
};

export default TabPanel;
