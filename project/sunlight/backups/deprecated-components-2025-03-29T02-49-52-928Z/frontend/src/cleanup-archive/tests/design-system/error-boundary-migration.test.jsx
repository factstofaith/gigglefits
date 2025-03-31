/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { ThemeProvider } from '../../design-system/foundations/theme/ThemeProvider';

// Create a component that throws an error
const ThrowError = ({ shouldThrow }) => {
  // Added display name
  ThrowError.displayName = 'ThrowError';

  // Added display name
  ThrowError.displayName = 'ThrowError';

  // Added display name
  ThrowError.displayName = 'ThrowError';

  // Added display name
  ThrowError.displayName = 'ThrowError';

  // Added display name
  ThrowError.displayName = 'ThrowError';


  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Working component</div>;
};

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary Migration Tests', () => {
  const renderWithTheme = ui => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  test('renders error UI with ButtonLegacy components when error occurs', () => {
    // Mock resetErrorBoundary function
    jest
      .spyOn(React, 'useRef')
      .mockImplementation(() => ({ current: document.createElement('button') }));

    const { rerender } = renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    // Verify normal rendering
    expect(screen.getByText('Working component')).toBeInTheDocument();

    // Force an error
    rerender(
      <ThemeProvider>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      </ThemeProvider>
    );

    // Check for error UI with ButtonLegacy components
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Buttons should be rendered using ButtonLegacy (using classes added by design system)
    const refreshButton = screen.getByText('Refresh');
    const homeButton = screen.getByText('Go to Home');

    expect(refreshButton).toBeInTheDocument();
    expect(homeButton).toBeInTheDocument();

    // CardLegacy should be used (verify container exists)
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('shows error details in development mode', () => {
    // Store original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;
    // Set to development mode
    process.env.NODE_ENV = 'development';

    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Check for error details section
    expect(screen.getByText('Error Details')).toBeInTheDocument();

    // Restore NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('refresh button calls resetErrorBoundary', () => {
    const setState = jest.fn();
    const useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy.mockImplementation(init => [init, setState]);

    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Find and click refresh button
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Should attempt to reset the error state
    expect(setState).toHaveBeenCalled();

    // Clean up
    useStateSpy.mockRestore();
  });
});
