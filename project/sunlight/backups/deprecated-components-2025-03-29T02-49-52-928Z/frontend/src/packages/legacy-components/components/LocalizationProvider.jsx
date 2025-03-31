import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';

/**
 * Legacy wrapper for LocalizationProvider from @mui/x-date-pickers
 *
 * This component provides compatibility with the legacy API
 * while using the new design system under the hood.
 */
const LocalizationProvider = props => {
  // For now, we're just passing through to the original component
  // In the future, this could be replaced with a custom implementation
  return <LocalizationProvider {...props} />;
};


LocalizationProvider.displayName = 'LocalizationProvider';
export default LocalizationProvider;
