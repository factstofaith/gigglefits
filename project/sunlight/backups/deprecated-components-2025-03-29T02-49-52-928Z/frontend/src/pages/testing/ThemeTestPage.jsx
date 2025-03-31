import React from 'react';
import ThemeTestComponent from '@components/testing/ThemeTestComponent';
import { Box, Typography } from '../../design-system';
import { Box } from '../../design-system';
// Design system import already exists;
;
/**
 * Theme Test Page
 * 
 * A page for testing theme compatibility with different components
 */
const ThemeTestPage = () => {
  // Added display name
  ThemeTestPage.displayName = 'ThemeTestPage';

  // Added display name
  ThemeTestPage.displayName = 'ThemeTestPage';

  // Added display name
  ThemeTestPage.displayName = 'ThemeTestPage';

  // Added display name
  ThemeTestPage.displayName = 'ThemeTestPage';

  // Added display name
  ThemeTestPage.displayName = 'ThemeTestPage';


  return (
    <Box p={3}>
      <Typography variant="h4&quot; gutterBottom>
        Theme Compatibility Test Page
      </Typography>
      <Typography variant="body1" paragraph>
        This page demonstrates theme compatibility across different components. 
        You can test light/dark mode switching and verify that all components 
        display correctly with the proper theme colors and styles.
      </Typography>
      <ThemeTestComponent />
    </Box>
  );
};

export default ThemeTestPage;