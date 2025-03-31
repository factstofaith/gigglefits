import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';
import { Select } from '../../design-system/legacy';

describe('SelectLegacy Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  // Simple array of strings as options
  const simpleOptions = ['Option 1', 'Option 2', 'Option 3'];

  // Complex array of objects as options
  const complexOptions = [
    { value: 'value1', label: 'Label 1' },
    { value: 'value2', label: 'Label 2' },
    { value: 'value3', label: 'Label 3' },
  ];

  test('renders with string options correctly', () => {
    const handleChange = jest.fn();
    renderWithTheme(
      <SelectLegacy
        options={simpleOptions}
        value={simpleOptions[0]}
        onChange={handleChange}
        placeholder="Select an option&quot;
        label="Test Select"
        data-testid="test-select"
      />
    );

    const selectElement = screen.getByTestId('test-select');
    expect(selectElement).toBeInTheDocument();
  });

  test('renders with object options correctly', () => {
    const handleChange = jest.fn();
    renderWithTheme(
      <SelectLegacy
        options={complexOptions}
        value={complexOptions[0].value}
        onChange={handleChange}
        placeholder="Select an option&quot;
        label="Test Select"
        data-testid="test-select"
      />
    );

    const selectElement = screen.getByTestId('test-select');
    expect(selectElement).toBeInTheDocument();
  });

  test('handles disabled state correctly', () => {
    renderWithTheme(
      <SelectLegacy
        options={simpleOptions}
        value={simpleOptions[0]}
        onChange={() => {}}
        disabled={true}
        label="Disabled Select&quot;
        data-testid="disabled-select"
      />
    );

    const selectElement = screen.getByTestId('disabled-select');
    expect(selectElement).toBeDisabled();
  });

  test('applies custom styles correctly', () => {
    const customStyle = { maxWidth: '300px', margin: '10px' };
    renderWithTheme(
      <SelectLegacy
        options={simpleOptions}
        value={simpleOptions[0]}
        onChange={() => {}}
        style={customStyle}
        label="Styled Select&quot;
        data-testid="styled-select"
      />
    );

    const selectElement = screen.getByTestId('styled-select');
    expect(selectElement).toBeInTheDocument();
    // This is a basic check - we'd need more specific assertions depending on how styles are applied
  });

  test('handles empty options gracefully', () => {
    renderWithTheme(
      <SelectLegacy
        options={[]}
        value="&quot;
        onChange={() => {}}
        placeholder="No options available"
        label="Empty Select&quot;
        data-testid="empty-select"
      />
    );

    const selectElement = screen.getByTestId('empty-select');
    expect(selectElement).toBeInTheDocument();
  });
});
