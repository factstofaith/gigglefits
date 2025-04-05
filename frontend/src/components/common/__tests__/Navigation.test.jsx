import React from 'react';
import { render, screen } from '@testing-library/react';
import Navigation from './Navigation';
import { ErrorProvider } from "@/error-handling";
describe('Navigation', () => {
  test('renders correctly', () => {
    render(<ErrorProvider><Navigation /></ErrorProvider>);
    // Add assertions based on component content
  });
  test('handles props correctly', () => {
    const testProps = {
      // Add sample props here
    };
    render(<ErrorProvider><Navigation {...testProps} /></ErrorProvider>);
    // Verify props are handled correctly
  });

  // Add more specific tests based on component functionality
});