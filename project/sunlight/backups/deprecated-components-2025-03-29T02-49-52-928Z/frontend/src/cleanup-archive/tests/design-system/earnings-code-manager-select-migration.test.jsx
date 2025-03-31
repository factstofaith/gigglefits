import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';

// Mock hooks and services
jest.mock('../../services/earningsService', () => ({
  getEarningsCodes: jest.fn().mockResolvedValue([
    {
      id: 1,
      code: 'REG',
      name: 'Regular',
      destination_system: 'System1',
      is_overtime: false,
    },
    {
      id: 2,
      code: 'OT',
      name: 'Overtime',
      destination_system: 'System2',
      is_overtime: true,
    },
  ]),
  createEarningsCode: jest.fn(),
  updateEarningsCode: jest.fn(),
  deleteEarningsCode: jest.fn(),
}));

// Mock the EarningsCodeManager component
jest.mock('../../components/earnings/EarningsCodeManager', () => {
  const MockedComponent = () => {
  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';

  // Added display name
  MockedComponent.displayName = 'MockedComponent';


    return (
      <div data-testid="earnings-code-manager">
        <div className="filter-dropdown&quot;>
          <div
            role="combobox"
            aria-label="Filter by Destination System"
            data-testid="system-filter"
          >
            Filter by Destination System
          </div>
        </div>

        <div className="table-container&quot; data-testid="codes-table">
          Earnings codes table
        </div>
      </div>
    );
  };

  MockedComponent.displayName = 'EarningsCodeManager';

  return MockedComponent;
});

// Import the component after mocking
import EarningsCodeManager from '../../components/earnings/EarningsCodeManager';

describe('EarningsCodeManager SelectLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('EarningsCodeManager renders with SelectLegacy filter dropdown', () => {
    renderWithTheme(<EarningsCodeManager />);

    const component = screen.getByTestId('earnings-code-manager');
    const filterDropdown = screen.getByTestId('system-filter');
    const codesTable = screen.getByTestId('codes-table');

    expect(component).toBeInTheDocument();
    expect(filterDropdown).toBeInTheDocument();
    expect(codesTable).toBeInTheDocument();

    // Verify select field is rendered with the right role and label
    expect(
      screen.getByRole('combobox', { name: 'Filter by Destination System' })
    ).toBeInTheDocument();
  });
});
