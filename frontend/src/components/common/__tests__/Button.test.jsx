import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';
import { ErrorProvider } from "@/error-handling";
describe('Button', () => {
  test('renders correctly', () => {
    render(<ErrorProvider><Button /></ErrorProvider>);
    // Add assertions based on component content
  });
  test('handles props correctly', () => {
    const testProps = {
      // Add sample props here
    };
    render(<ErrorProvider><Button {...testProps} /></ErrorProvider>);
    // Verify props are handled correctly
  });

  // Add more specific tests based on component functionality
});