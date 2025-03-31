/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from '../../design-system/legacy';
import { ThemeProvider } from '../../design-system/foundations/theme/ThemeProvider';

describe('CardLegacy', () => {
  const renderWithTheme = ui => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  test('renders with default props', () => {
    renderWithTheme(<CardLegacy data-testid="card">Card content</CardLegacy>);

    const card = screen.getByTestId('card');
    expect(card).toHaveTextContent('Card content');
    expect(card).toHaveClass('tap-card');
  });

  test('renders with different variants', () => {
    const { rerender } = renderWithTheme(
      <CardLegacy variant="outlined&quot; data-testid="card">
        Outlined variant
      </CardLegacy>
    );

    let card = screen.getByTestId('card');
    expect(card).toHaveTextContent('Outlined variant');
    expect(card).toHaveClass('tap-card-outlined');

    rerender(
      <ThemeProvider>
        <CardLegacy variant="elevation&quot; data-testid="card">
          Elevation variant
        </CardLegacy>
      </ThemeProvider>
    );

    card = screen.getByTestId('card');
    expect(card).toHaveTextContent('Elevation variant');
    expect(card).toHaveClass('tap-card-elevation');
  });

  test('supports elevation prop', () => {
    renderWithTheme(
      <CardLegacy elevation={4} data-testid="card">
        Card with elevation
      </CardLegacy>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveTextContent('Card with elevation');
    // The shadow class should be added based on elevation mapping
    expect(card).toHaveStyle('box-shadow: var(--tap-shadow-md)');
  });

  test('supports square prop', () => {
    renderWithTheme(
      <CardLegacy square={true} data-testid="card">
        Square card
      </CardLegacy>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveTextContent('Square card');
    expect(card).toHaveStyle('border-radius: 0px');
  });

  test('supports raised prop', () => {
    renderWithTheme(
      <CardLegacy raised={true} data-testid="card">
        Raised card
      </CardLegacy>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveTextContent('Raised card');
    expect(card).toHaveClass('tap-card-elevated');
  });

  test('applies custom className and style', () => {
    renderWithTheme(
      <CardLegacy
        className="custom-class&quot;
        style={{ backgroundColor: "lightblue' }}
        data-testid="card"
      >
        Custom styled card
      </CardLegacy>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveTextContent('Custom styled card');
    expect(card).toHaveClass('custom-class');
    expect(card).toHaveStyle('background-color: lightblue');
  });
});
