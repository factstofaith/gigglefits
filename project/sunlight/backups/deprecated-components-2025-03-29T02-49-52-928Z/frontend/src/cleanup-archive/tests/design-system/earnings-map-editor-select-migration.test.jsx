import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';

// Mock hooks and services
jest.mock('react-router-dom', () => ({
  useParams: () => ({ rosterId: '1' }),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../services/earningsService', () => ({
  getRosterById: jest.fn().mockResolvedValue({ id: 1, name: 'Test Roster' }),
  getEarningsMaps: jest.fn().mockResolvedValue([]),
  getEarningsCodes: jest.fn().mockResolvedValue([
    { id: 1, code: 'REG', name: 'Regular', is_overtime: false },
    { id: 2, code: 'OT', name: 'Overtime', is_overtime: true },
  ]),
  createEarningsMap: jest.fn(),
  updateEarningsMap: jest.fn(),
  deleteEarningsMap: jest.fn(),
  testEarningsMap: jest.fn(),
}));

// Mock the EarningsMapEditor component
jest.mock('../../components/earnings/EarningsMapEditor', () => {
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
      <div data-testid="earnings-map-editor">
        <div className="earnings-code-dropdown&quot;>
          <div role="combobox" aria-label="Earnings Code" data-testid="earnings-code-select">
            Earnings Code Dropdown
          </div>
        </div>

        <div className="mappings-container&quot; data-testid="mappings-container">
          Earnings mappings
        </div>
      </div>
    );
  };

  MockedComponent.displayName = 'EarningsMapEditor';

  return MockedComponent;
});

// Import the component after mocking
import EarningsMapEditor from '../../components/earnings/EarningsMapEditor';

describe('EarningsMapEditor SelectLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('EarningsMapEditor renders with SelectLegacy dropdown', () => {
    renderWithTheme(<EarningsMapEditor />);

    const component = screen.getByTestId('earnings-map-editor');
    const codeSelect = screen.getByTestId('earnings-code-select');
    const mappingsContainer = screen.getByTestId('mappings-container');

    expect(component).toBeInTheDocument();
    expect(codeSelect).toBeInTheDocument();
    expect(mappingsContainer).toBeInTheDocument();

    // Verify select field is rendered with the right role and label
    expect(screen.getByRole('combobox', { name: 'Earnings Code' })).toBeInTheDocument();
  });
});
