import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that will throw an error
const ErrorThrowingComponent = () => {
  // Added display name
  ErrorThrowingComponent.displayName = 'ErrorThrowingComponent';

  // Added display name
  ErrorThrowingComponent.displayName = 'ErrorThrowingComponent';

  // Added display name
  ErrorThrowingComponent.displayName = 'ErrorThrowingComponent';

  // Added display name
  ErrorThrowingComponent.displayName = 'ErrorThrowingComponent';

  // Added display name
  ErrorThrowingComponent.displayName = 'ErrorThrowingComponent';


  throw new Error('Test error');
  return <div>This will not render</div>;
};

// Suppress React's error console during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Test Child</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  test('renders fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Error occurred</div>}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  test('renders default fallback when no custom fallback is provided', () => {
    render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Default fallback should contain text indicating an error
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  test('calls onError prop when an error occurs', () => {
    const handleError = jest.fn();
    
    render(
      <ErrorBoundary onError={handleError}>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Error handler should be called with the error and info
    expect(handleError).toHaveBeenCalled();
    expect(handleError.mock.calls[0][0] instanceof Error).toBe(true);
    expect(handleError.mock.calls[0][0].message).toBe('Test error');
  });

  test('resets error state when receiving new children', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorThrowingComponent />
      </ErrorBoundary>
    );
    
    // Error UI should be shown
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    
    // Rerender with new children (non-error component)
    rerender(
      <ErrorBoundary>
        <div data-testid="new-child">New Child</div>
      </ErrorBoundary>
    );
    
    // Error UI should be gone, new children should be rendered
    expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('new-child')).toBeInTheDocument();
  });
});