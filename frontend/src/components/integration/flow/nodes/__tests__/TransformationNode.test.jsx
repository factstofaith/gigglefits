import React from 'react';
import { render, screen } from '@testing-library/react';
import TransformationNode from './TransformationNode';
import { ErrorProvider } from "@/error-handling";
describe('TransformationNode', () => {
  test('renders correctly', () => {
    render(<ErrorProvider><TransformationNode /></ErrorProvider>);
    // Add assertions based on component content
  });
  test('handles props correctly', () => {
    const testProps = {
      // Add sample props here
    };
    render(<ErrorProvider><TransformationNode {...testProps} /></ErrorProvider>);
    // Verify props are handled correctly
  });

  // Add more specific tests based on component functionality
});