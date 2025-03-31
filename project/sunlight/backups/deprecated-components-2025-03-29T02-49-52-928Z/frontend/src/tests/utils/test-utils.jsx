import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '../../design-system';
import theme from '../../theme';
import { MockThemeProvider } from '../components/common/MockThemeProvider';

// Import contexts if needed
// import { NotificationContext } from '@contexts/NotificationContext';
// import { UserContext } from '@contexts/UserContext';

/**
 * Custom render function that wraps the component with necessary providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Additional render options
 * @param {boolean} options.useDesignSystem - Whether to use the design system theme provider
 * @returns {Object} - Object containing all the utilities from RTL
 */
function customRender(ui, options = {}) {
  // Added display name
  customRender.displayName = 'customRender';

  const { useDesignSystem = false, ...restOptions } = options;

  const Wrapper = ({ children }) => {
  // Added display name
  Wrapper.displayName = 'Wrapper';

  // Added display name
  Wrapper.displayName = 'Wrapper';

  // Added display name
  Wrapper.displayName = 'Wrapper';

  // Added display name
  Wrapper.displayName = 'Wrapper';

  // Added display name
  Wrapper.displayName = 'Wrapper';


    // Choose the right theme provider based on component needs
    return (
      <BrowserRouter>
        {useDesignSystem ? (
          <MockThemeProvider>{children}</MockThemeProvider>
        ) : (
          <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
        )}
      </BrowserRouter>
    );
  };

  return render(ui, { wrapper: Wrapper, ...restOptions });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override the render method
export { customRender as render };