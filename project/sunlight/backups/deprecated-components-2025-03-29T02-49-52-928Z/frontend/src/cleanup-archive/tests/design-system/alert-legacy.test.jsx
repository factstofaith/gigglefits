/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Alert } from '../../design-system/legacy';
import { ThemeProvider } from '../../design-system/foundations/theme/ThemeProvider';

describe('AlertLegacy', () => {
  const renderWithTheme = ui => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  test('renders with proper severity', () => {
    renderWithTheme(
      <AlertLegacy severity="error&quot; data-testid="alert">
        Error message
      </AlertLegacy>
    );

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveTextContent('Error message');
    expect(alert).toHaveClass('tap-alert-error');
  });

  test('renders with different severity variants', () => {
    const { rerender } = renderWithTheme(
      <AlertLegacy severity="warning&quot; data-testid="alert">
        Warning message
      </AlertLegacy>
    );

    let alert = screen.getByTestId('alert');
    expect(alert).toHaveTextContent('Warning message');
    expect(alert).toHaveClass('tap-alert-warning');

    rerender(
      <ThemeProvider>
        <AlertLegacy severity="info&quot; data-testid="alert">
          Info message
        </AlertLegacy>
      </ThemeProvider>
    );

    alert = screen.getByTestId('alert');
    expect(alert).toHaveTextContent('Info message');
    expect(alert).toHaveClass('tap-alert-info');

    rerender(
      <ThemeProvider>
        <AlertLegacy severity="success&quot; data-testid="alert">
          Success message
        </AlertLegacy>
      </ThemeProvider>
    );

    alert = screen.getByTestId('alert');
    expect(alert).toHaveTextContent('Success message');
    expect(alert).toHaveClass('tap-alert-success');
  });

  test('renders with different variants', () => {
    const { rerender } = renderWithTheme(
      <AlertLegacy severity="info&quot; variant="filled" data-testid="alert">
        Filled variant
      </AlertLegacy>
    );

    let alert = screen.getByTestId('alert');
    expect(alert).toHaveTextContent('Filled variant');
    expect(alert).toHaveClass('tap-alert-filled');

    rerender(
      <ThemeProvider>
        <AlertLegacy severity="info&quot; variant="outlined" data-testid="alert">
          Outlined variant
        </AlertLegacy>
      </ThemeProvider>
    );

    alert = screen.getByTestId('alert');
    expect(alert).toHaveTextContent('Outlined variant');
    expect(alert).toHaveClass('tap-alert-outlined');
  });

  test('renders with icon', () => {
    const { rerender } = renderWithTheme(
      <AlertLegacy severity="info&quot; icon={true} data-testid="alert">
        With icon
      </AlertLegacy>
    );

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveTextContent('With icon');

    // Check if icon container exists
    const iconContainer = alert.querySelector('.tap-alert-icon');
    expect(iconContainer).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <AlertLegacy severity="info&quot; icon={false} data-testid="alert">
          Without icon
        </AlertLegacy>
      </ThemeProvider>
    );

    // Should not find an icon container when icon is false
    expect(alert.querySelector('.tap-alert-icon')).not.toBeInTheDocument();
  });

  test('supports custom action', () => {
    renderWithTheme(
      <AlertLegacy severity="info&quot; action={<button>Action</button>} data-testid="alert">
        With action
      </AlertLegacy>
    );

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveTextContent('With action');
    expect(alert).toHaveTextContent('Action');

    // Check if action container exists
    const actionContainer = alert.querySelector('.tap-alert-action');
    expect(actionContainer).toBeInTheDocument();
  });
});
