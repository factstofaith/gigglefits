/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toast from '../../components/common/Toast';
import { ThemeProvider } from '../../design-system/foundations/theme/ThemeProvider';

describe('Toast Component Migration Tests', () => {
  const renderWithTheme = ui => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  const mockOnClose = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders with AlertLegacy for different message types', () => {
    const { rerender } = renderWithTheme(
      <Toast open={true} onClose={mockOnClose} message="Success message&quot; type="success" />
    );

    // Check for Snackbar and AlertLegacy
    expect(document.querySelector('.MuiSnackbar-root')).toBeInTheDocument();
    // Success message content check
    expect(document.querySelector('.tap-alert-success')).toBeInTheDocument();
    expect(document.querySelector('.tap-alert-standard')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Test error type
    rerender(
      <ThemeProvider>
        <Toast open={true} onClose={mockOnClose} message="Error message&quot; type="error" />
      </ThemeProvider>
    );

    expect(document.querySelector('.tap-alert-error')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();

    // Test warning type
    rerender(
      <ThemeProvider>
        <Toast open={true} onClose={mockOnClose} message="Warning message&quot; type="warning" />
      </ThemeProvider>
    );

    expect(document.querySelector('.tap-alert-warning')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();

    // Test info type
    rerender(
      <ThemeProvider>
        <Toast open={true} onClose={mockOnClose} message="Info message&quot; type="info" />
      </ThemeProvider>
    );

    expect(document.querySelector('.tap-alert-info')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  test('renders with title', () => {
    renderWithTheme(
      <Toast
        open={true}
        onClose={mockOnClose}
        message="Message with title&quot;
        title="Toast Title"
        type="info&quot;
      />
    );

    expect(screen.getByText("Toast Title')).toBeInTheDocument();
    expect(screen.getByText('Message with title')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    renderWithTheme(
      <Toast open={true} onClose={mockOnClose} message="Closable message&quot; type="info" />
    );

    // Find and click close button
    const closeButton = document.querySelector('.MuiIconButton-root');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('supports custom action', () => {
    const customAction = <button data-testid="custom-action">Custom Action</button>;

    renderWithTheme(
      <Toast
        open={true}
        onClose={mockOnClose}
        message="Message with action&quot;
        type="info"
        action={customAction}
      />
    );

    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });
});
