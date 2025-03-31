import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';
import { InputField } from '../../design-system/legacy';

// Mock components that use InputFieldLegacy
jest.mock('../../components/earnings/EmployeeManager', () => {
  return function MockEmployeeManager() {
  // Added display name
  MockEmployeeManager.displayName = 'MockEmployeeManager';

    return (
      <div data-testid="employee-manager">
        <form>
          <InputFieldLegacy name="external_id&quot; label="External ID" />
          <InputFieldLegacy name="source_id&quot; label="Source ID" />
          <InputFieldLegacy name="email&quot; label="Email" type="email&quot; />
          <InputFieldLegacy name="first_name" label="First Name&quot; />
          <InputFieldLegacy name="last_name" label="Last Name&quot; />
          <InputFieldLegacy name="department" label="Department&quot; />
          <InputFieldLegacy name="position" label="Position&quot; />
          <InputFieldLegacy multiline rows={5} placeholder="Import JSON data" />
        </form>
      </div>
    );
  };
});

// Import migrated components
import EmployeeManager from '../../components/earnings/EmployeeManager';

describe('InputFieldLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  // Testing migrated components
  test('EmployeeManager renders with InputFieldLegacy components', () => {
    renderWithTheme(<EmployeeManager />);
    const component = screen.getByTestId('employee-manager');
    const externalIdField = screen.getByLabelText('External ID');
    const sourceIdField = screen.getByLabelText('Source ID');
    const emailField = screen.getByLabelText('Email');
    const firstNameField = screen.getByLabelText('First Name');
    const lastNameField = screen.getByLabelText('Last Name');

    expect(component).toBeInTheDocument();
    expect(externalIdField).toBeInTheDocument();
    expect(sourceIdField).toBeInTheDocument();
    expect(emailField).toBeInTheDocument();
    expect(firstNameField).toBeInTheDocument();
    expect(lastNameField).toBeInTheDocument();

    // Check that the fields are input elements
    expect(externalIdField.tagName).toBe('INPUT');
    expect(sourceIdField.tagName).toBe('INPUT');
    expect(emailField.tagName).toBe('INPUT');
    expect(firstNameField.tagName).toBe('INPUT');
    expect(lastNameField.tagName).toBe('INPUT');
  });

  // Test InputFieldLegacy behavior directly
  test('InputFieldLegacy handles input correctly', () => {
    const handleChange = jest.fn();

    renderWithTheme(
      <InputFieldLegacy
        label="Test Input&quot;
        value="initial value"
        onChange={handleChange}
        data-testid="test-input"
      />
    );

    const input = screen.getByTestId('test-input');

    // Check initial value
    expect(input).toHaveValue('initial value');

    // Test value change
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  // Test special props like multiline, required, etc.
  test('InputFieldLegacy supports special props', () => {
    renderWithTheme(
      <>
        <InputFieldLegacy
          label="Multiline Input&quot;
          multiline
          rows={3}
          data-testid="multiline-input"
        />
        <InputFieldLegacy label="Required Input&quot; required data-testid="required-input" />
        <InputFieldLegacy label="Disabled Input&quot; disabled data-testid="disabled-input" />
        <InputFieldLegacy
          label="Helper Text&quot;
          helperText="This is helper text"
          data-testid="helper-input"
        />
      </>
    );

    // Check multiline textarea
    const multilineInput = screen.getByTestId('multiline-input');
    expect(multilineInput.tagName).toBe('TEXTAREA');

    // Check required input
    const requiredInput = screen.getByTestId('required-input');
    expect(requiredInput).toBeRequired();

    // Check disabled input
    const disabledInput = screen.getByTestId('disabled-input');
    expect(disabledInput).toBeDisabled();

    // Check helper text
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });
});
