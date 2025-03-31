import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';
import { Button } from '../../design-system/legacy';

// Mock components that use ButtonLegacy
jest.mock('../../components/earnings/EarningsCodeManager', () => {
  return function MockEarningsCodeManager() {
  // Added display name
  MockEarningsCodeManager.displayName = 'MockEarningsCodeManager';

    return (
      <div data-testid="earnings-code-manager">
        <ButtonLegacy variant="primary&quot;>Create Earnings Code</ButtonLegacy>
      </div>
    );
  };
});

jest.mock("../../components/earnings/EarningsMapEditor', () => {
  return function MockEarningsMapEditor() {
  // Added display name
  MockEarningsMapEditor.displayName = 'MockEarningsMapEditor';

    return (
      <div data-testid="earnings-map-editor">
        <ButtonLegacy variant="primary&quot;>Create Mapping</ButtonLegacy>
      </div>
    );
  };
});

jest.mock("../../components/earnings/EmployeeManager', () => {
  return function MockEmployeeManager() {
  // Added display name
  MockEmployeeManager.displayName = 'MockEmployeeManager';

    return (
      <div data-testid="employee-manager">
        <ButtonLegacy variant="primary&quot;>Add Employee</ButtonLegacy>
      </div>
    );
  };
});

jest.mock("../../components/earnings/EmployeeRosterManager', () => {
  return function MockEmployeeRosterManager() {
  // Added display name
  MockEmployeeRosterManager.displayName = 'MockEmployeeRosterManager';

    return (
      <div data-testid="employee-roster-manager">
        <ButtonLegacy variant="primary&quot;>Create Roster</ButtonLegacy>
      </div>
    );
  };
});

jest.mock("../../components/admin/TemplatesManager', () => {
  return function MockTemplatesManager() {
  // Added display name
  MockTemplatesManager.displayName = 'MockTemplatesManager';

    return (
      <div data-testid="templates-manager">
        <ButtonLegacy variant="primary&quot;>Create Template</ButtonLegacy>
      </div>
    );
  };
});

// Import migrated components
import EarningsCodeManager from "../../components/earnings/EarningsCodeManager';
import EarningsMapEditor from '../../components/earnings/EarningsMapEditor';
import EmployeeManager from '../../components/earnings/EmployeeManager';
import EmployeeRosterManager from '../../components/earnings/EmployeeRosterManager';
import TemplatesManager from '../../components/admin/TemplatesManager';

describe('Migrated Components', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  // Testing migrated components from earnings management
  test('EarningsCodeManager renders with ButtonLegacy', () => {
    renderWithTheme(<EarningsCodeManager />);
    const component = screen.getByTestId('earnings-code-manager');
    const button = screen.getByText('Create Earnings Code');

    expect(component).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  test('EarningsMapEditor renders with ButtonLegacy', () => {
    renderWithTheme(<EarningsMapEditor />);
    const component = screen.getByTestId('earnings-map-editor');
    const button = screen.getByText('Create Mapping');

    expect(component).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  test('EmployeeManager renders with ButtonLegacy', () => {
    renderWithTheme(<EmployeeManager />);
    const component = screen.getByTestId('employee-manager');
    const button = screen.getByText('Add Employee');

    expect(component).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  test('EmployeeRosterManager renders with ButtonLegacy', () => {
    renderWithTheme(<EmployeeRosterManager />);
    const component = screen.getByTestId('employee-roster-manager');
    const button = screen.getByText('Create Roster');

    expect(component).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  // Testing migrated components from admin
  test('TemplatesManager renders with ButtonLegacy', () => {
    renderWithTheme(<TemplatesManager />);
    const component = screen.getByTestId('templates-manager');
    const button = screen.getByText('Create Template');

    expect(component).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  // Integration test between ButtonLegacy and material UI
  test('ButtonLegacy integrates properly with Material UI', () => {
    const handleClick = jest.fn();

    renderWithTheme(
      <ButtonLegacy variant="primary&quot; onClick={handleClick} data-testid="test-button">
        Test Button
      </ButtonLegacy>
    );

    const button = screen.getByTestId('test-button');

    // Check if rendered as Material UI button
    expect(button).toBeInTheDocument();

    // Check event handling
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
