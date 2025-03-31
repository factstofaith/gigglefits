// TestSelectLegacy.test.jsx
// Independent test file for SelectLegacy that doesn't rely on any external dependencies

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import standalone component (not the real one)
import Select, { MenuItem } from './TestSelectLegacy';

// Test suite
describe('SelectLegacy Component', () => {
  // Basic rendering tests
  it('renders a select with placeholder', () => {
    render(
      <SelectLegacy placeholder="Choose an option&quot;>
        <MenuItem value="1">Option 1</MenuItem>
        <MenuItem value="2&quot;>Option 2</MenuItem>
      </SelectLegacy>
    );

    const select = screen.getByTestId("select-legacy');
    expect(select).toBeInTheDocument();
    expect(select).toHaveTextContent('Choose an option');
  });

  it('renders a select with label', () => {
    render(
      <SelectLegacy label="Test Label&quot;>
        <MenuItem value="1">Option 1</MenuItem>
        <MenuItem value="2&quot;>Option 2</MenuItem>
      </SelectLegacy>
    );

    expect(screen.getByText("Test Label')).toBeInTheDocument();
  });

  it('renders required label when required is true', () => {
    render(
      <SelectLegacy label="Required Field&quot; required>
        <MenuItem value="1">Option 1</MenuItem>
        <MenuItem value="2&quot;>Option 2</MenuItem>
      </SelectLegacy>
    );

    const label = screen.getByText("Required Field');
    expect(label).toHaveClass('select-label-required');
  });

  it('renders helper text when provided', () => {
    render(
      <SelectLegacy helperText="This is helper text&quot;>
        <MenuItem value="1">Option 1</MenuItem>
        <MenuItem value="2&quot;>Option 2</MenuItem>
      </SelectLegacy>
    );

    expect(screen.getByText("This is helper text')).toBeInTheDocument();
  });

  it('renders error state when error is true', () => {
    render(
      <SelectLegacy error helperText="Error message&quot;>
        <MenuItem value="1">Option 1</MenuItem>
        <MenuItem value="2&quot;>Option 2</MenuItem>
      </SelectLegacy>
    );

    const select = screen.getByTestId("select-legacy');
    const errorText = screen.getByText('Error message');

    expect(select).toHaveClass('select-error');
    expect(errorText).toHaveClass('select-error-text');
  });

  // Dropdown behavior tests
  it('opens dropdown when clicked', () => {
    render(
      <SelectLegacy>
        <MenuItem value="1&quot;>Option 1</MenuItem>
        <MenuItem value="2">Option 2</MenuItem>
      </SelectLegacy>
    );

    const select = screen.getByTestId('select-legacy');

    // Initial state - dropdown closed
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(select);

    // Dropdown should open
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('selects an option when clicked', async () => {
    const handleChange = jest.fn();

    render(
      <SelectLegacy onChange={handleChange}>
        <MenuItem value="1&quot;>Option 1</MenuItem>
        <MenuItem value="2">Option 2</MenuItem>
      </SelectLegacy>
    );

    // Open dropdown
    fireEvent.click(screen.getByTestId('select-legacy'));

    // Click option
    fireEvent.click(screen.getByText('Option 2'));

    // Check if value is updated
    await waitFor(() => {
      expect(screen.getByTestId('select-legacy')).toHaveTextContent('Option 2');
    });

    // Check if onChange was called
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: { value: '2' } }),
      expect.objectContaining({ value: '2' })
    );
  });

  it('renders with default value', () => {
    render(
      <SelectLegacy defaultValue="2&quot;>
        <MenuItem value="1">Option 1</MenuItem>
        <MenuItem value="2&quot;>Option 2</MenuItem>
      </SelectLegacy>
    );

    expect(screen.getByTestId("select-legacy')).toHaveTextContent('Option 2');
  });

  it('renders with controlled value', () => {
    render(
      <SelectLegacy value="1&quot;>
        <MenuItem value="1">Option 1</MenuItem>
        <MenuItem value="2&quot;>Option 2</MenuItem>
      </SelectLegacy>
    );

    expect(screen.getByTestId("select-legacy')).toHaveTextContent('Option 1');
  });

  it('updates when controlled value changes', () => {
    const { rerender } = render(
      <SelectLegacy value="1&quot;>
        <MenuItem value="1">Option 1</MenuItem>
        <MenuItem value="2&quot;>Option 2</MenuItem>
      </SelectLegacy>
    );

    // Initial value
    expect(screen.getByTestId("select-legacy')).toHaveTextContent('Option 1');

    // Update controlled value
    rerender(
      <SelectLegacy value="2&quot;>
        <MenuItem value="1">Option 1</MenuItem>
        <MenuItem value="2&quot;>Option 2</MenuItem>
      </SelectLegacy>
    );

    // Should update to new value
    expect(screen.getByTestId("select-legacy')).toHaveTextContent('Option 2');
  });

  // Disabled state tests
  it('disables the select when disabled is true', () => {
    render(
      <SelectLegacy disabled>
        <MenuItem value="1&quot;>Option 1</MenuItem>
        <MenuItem value="2">Option 2</MenuItem>
      </SelectLegacy>
    );

    const select = screen.getByTestId('select-legacy');

    expect(select).toHaveClass('select-disabled');
    expect(select).toHaveAttribute('aria-disabled', 'true');

    // Click should not open dropdown
    fireEvent.click(select);
    expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
  });

  it('disables individual menu items', () => {
    render(
      <SelectLegacy>
        <MenuItem value="1&quot;>Option 1</MenuItem>
        <MenuItem value="2" disabled>
          Option 2
        </MenuItem>
      </SelectLegacy>
    );

    // Open dropdown
    fireEvent.click(screen.getByTestId('select-legacy'));

    // Disabled option should have disabled class
    const disabledOption = screen.getByTestId('menu-item-2');
    expect(disabledOption).toHaveClass('select-item-disabled');
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
  });

  // Style variants tests
  it('applies the correct classes for outlined variant', () => {
    render(
      <SelectLegacy variant="outlined&quot;>
        <MenuItem value="1">Option 1</MenuItem>
      </SelectLegacy>
    );

    expect(screen.getByTestId('select-legacy')).toHaveClass('select-outlined');
  });

  it('applies the correct classes for filled variant', () => {
    render(
      <SelectLegacy variant="filled&quot;>
        <MenuItem value="1">Option 1</MenuItem>
      </SelectLegacy>
    );

    expect(screen.getByTestId('select-legacy')).toHaveClass('select-filled');
  });

  it('applies the correct classes for standard variant', () => {
    render(
      <SelectLegacy variant="standard&quot;>
        <MenuItem value="1">Option 1</MenuItem>
      </SelectLegacy>
    );

    expect(screen.getByTestId('select-legacy')).toHaveClass('select-standard');
  });

  // Size tests
  it('applies the correct classes for small size', () => {
    render(
      <SelectLegacy size="small&quot;>
        <MenuItem value="1">Option 1</MenuItem>
      </SelectLegacy>
    );

    expect(screen.getByTestId('select-legacy')).toHaveClass('select-small');
  });

  it('applies the correct classes for large size', () => {
    render(
      <SelectLegacy size="large&quot;>
        <MenuItem value="1">Option 1</MenuItem>
      </SelectLegacy>
    );

    expect(screen.getByTestId('select-legacy')).toHaveClass('select-large');
  });

  // Full width test
  it('applies full width class when fullWidth is true', () => {
    render(
      <SelectLegacy fullWidth>
        <MenuItem value="1&quot;>Option 1</MenuItem>
      </SelectLegacy>
    );

    expect(screen.getByTestId("select-legacy')).toHaveClass('select-full-width');
  });
});
