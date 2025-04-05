import React from 'react';
import { render, screen } from '@testing-library/react';
import PortalModal from './PortalModal';
import { ErrorProvider } from "@/error-handling";
describe('PortalModal', () => {
  test('renders correctly', () => {
    render(<ErrorProvider><PortalModal /></ErrorProvider>);
    // Add assertions based on component content
  });
  test('handles props correctly', () => {
    const testProps = {
      // Add sample props here
    };
    render(<ErrorProvider><PortalModal {...testProps} /></ErrorProvider>);
    // Verify props are handled correctly
  });

  // Add more specific tests based on component functionality
});