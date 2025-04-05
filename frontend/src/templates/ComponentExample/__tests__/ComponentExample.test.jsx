import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentExample from '../ComponentExample';

// Mock the custom hook to avoid testing its implementation here
jest.mock('../hooks/useComponentExample', () => ({
  useComponentExample: () => ({
    count: 5,
    incrementCount: jest.fn(),
    decrementCount: jest.fn(),
    resetCount: jest.fn(),
  }),
}));

describe('ComponentExample', () => {
  // Test rendering with required props
  it('renders with required props', () => {
    render(<ComponentExample name="Test Component" />);
    
    // Check for the component name
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    
    // Check for the count from the mocked hook
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
    
    // Ensure the action button is disabled when no onAction is provided
    const actionButton = screen.getByText('Trigger Action');
    expect(actionButton).toBeDisabled();
  });
  
  // Test with all props
  it('renders with all props correctly', () => {
    render(
      <ComponentExample 
        name="Test Component" 
        description="This is a test description"
        isHighlighted={true}
        onAction={jest.fn()}
      />
    );
    
    // Check for the highlighted name
    expect(screen.getByText('Test Component (Highlighted)')).toBeInTheDocument();
    
    // Check for the description
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
    
    // Ensure the action button is enabled when onAction is provided
    const actionButton = screen.getByText('Trigger Action');
    expect(actionButton).not.toBeDisabled();
  });
  
  // Test the action handler
  it('calls onAction when action button is clicked', () => {
    const mockOnAction = jest.fn();
    render(
      <ComponentExample 
        name="Test Component" 
        onAction={mockOnAction}
      />
    );
    
    // Click the action button
    const actionButton = screen.getByText('Trigger Action');
    fireEvent.click(actionButton);
    
    // Check if the action handler was called with the expected parameters
    expect(mockOnAction).toHaveBeenCalledWith({
      name: 'Test Component',
      count: 5
    });
  });
  
  // Test with no description
  it('does not render description when not provided', () => {
    render(<ComponentExample name="Test Component" />);
    
    // The component should not have any paragraph in the header
    const header = screen.getByText('Test Component').closest('.header');
    const paragraphs = header.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });
});

// Test rendering and props validation
describe('ComponentExample rendering', () => {
  it('applies correct styling when highlighted', () => {
    render(<ComponentExample name="Test Component" isHighlighted={true} />);
    
    const component = screen.getByTestId('component-example');
    expect(component).toHaveAttribute('data-highlighted', 'true');
  });
  
  it('applies default styling when not highlighted', () => {
    render(<ComponentExample name="Test Component" />);
    
    const component = screen.getByTestId('component-example');
    expect(component).toHaveAttribute('data-highlighted', 'false');
  });
});