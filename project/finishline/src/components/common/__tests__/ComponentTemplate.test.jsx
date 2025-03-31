/**
 * ComponentTemplate Tests
 * 
 * Tests for the ComponentTemplate component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentTemplate from '../ComponentTemplate';

describe('ComponentTemplate', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders correctly with required props', () => {
      render(<ComponentTemplate propName="Test Component" onChange={() => {}} />);
      
      // Verify the component renders with the correct text
      expect(screen.getByText('Test Component')).toBeInTheDocument();
      expect(screen.getByTestId('component-template')).toHaveClass('component-template');
    });
    
    it('renders with custom className', () => {
      render(
        <ComponentTemplate 
          propName="Test Component" 
          onChange={() => {}} 
          className="custom-class"
        />
      );
      
      // Verify the custom class is applied
      expect(screen.getByTestId('component-template')).toHaveClass('custom-class');
    });

    it('renders with correct variant', () => {
      render(
        <ComponentTemplate 
          propName="Test Component" 
          onChange={() => {}} 
          variant="primary"
        />
      );
      
      // Verify the variant class is applied
      expect(screen.getByTestId('component-template')).toHaveClass('component-template--primary');
    });

    it('renders in disabled state', () => {
      render(
        <ComponentTemplate 
          propName="Test Component" 
          onChange={() => {}} 
          disabled
        />
      );
      
      // Verify the disabled class is applied
      expect(screen.getByTestId('component-template')).toHaveClass('component-template--disabled');
    });
  });

  // Interaction tests
  describe('interactions', () => {
    it('calls onChange when clicked', () => {
      const handleChange = jest.fn();
      
      render(
        <ComponentTemplate 
          propName="Test Component" 
          onChange={handleChange} 
        />
      );
      
      // Click the component
      fireEvent.click(screen.getByTestId('component-template'));
      
      // Verify the callback was called
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('does not call onChange when disabled', () => {
      const handleChange = jest.fn();
      
      render(
        <ComponentTemplate 
          propName="Test Component" 
          onChange={handleChange}
          disabled
        />
      );
      
      // Click the disabled component
      fireEvent.click(screen.getByTestId('component-template'));
      
      // Verify the callback was not called
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  // Ref forwarding tests
  describe('refs', () => {
    it('forwards ref to DOM element', () => {
      const ref = React.createRef();
      
      render(
        <ComponentTemplate 
          propName="Test Component" 
          onChange={() => {}}
          ref={ref}
        />
      );
      
      // Verify the ref was forwarded correctly
      expect(ref.current).not.toBeNull();
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});