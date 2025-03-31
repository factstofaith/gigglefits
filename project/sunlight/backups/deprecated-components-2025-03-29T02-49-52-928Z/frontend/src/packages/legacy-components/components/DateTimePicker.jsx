import React from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';

/**
 * Legacy wrapper for DateTimePicker from @mui/x-date-pickers
 *
 * This component provides compatibility with the legacy API
 * while using the new design system under the hood.
 */
const DateTimePicker = props => {
  // For now, we're just passing through to the original component
  // In the future, this could be replaced with a custom implementation
  return <DateTimePicker {...props} />;
};


DateTimePicker.displayName = 'DateTimePicker';
export default DateTimePicker;
