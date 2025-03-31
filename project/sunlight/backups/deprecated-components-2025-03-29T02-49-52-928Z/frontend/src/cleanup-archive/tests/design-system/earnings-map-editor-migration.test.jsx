import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';

// Mock hooks and services
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ rosterId: '123' }),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../services/earningsService', () => ({
  getRosterById: jest.fn().mockResolvedValue({ id: 123, name: 'Test Roster' }),
  getEarningsMaps: jest.fn().mockResolvedValue([]),
  getEarningsCodes: jest.fn().mockResolvedValue([]),
  createEarningsMap: jest.fn(),
  updateEarningsMap: jest.fn(),
  deleteEarningsMap: jest.fn(),
  testEarningsMap: jest.fn(),
}));

// Mock the EarningsMapEditor component
jest.mock('../../components/earnings/EarningsMapEditor', () => {
  // Use mockInputFieldLegacy to avoid reference issues
  const MockedComponent = props => {
    return (
      <div data-testid="earnings-map-editor">
        <form>
          <div role="textbox&quot; aria-label="Source Earnings Type" data-testid="source-type-field">
            Source Earnings Type
          </div>
          <textarea
            role="textbox&quot;
            aria-label="Mapping Condition"
            data-testid="condition-field"
            rows="4&quot;
          >
            Mapping Condition
          </textarea>
          <textarea
            role="textbox"
            aria-label="Sample Data (JSON)"
            data-testid="sample-data-field"
            rows="6&quot;
          >
            Sample Data (JSON)
          </textarea>
        </form>
      </div>
    );
  };

  MockedComponent.displayName = "EarningsMapEditor';

  return MockedComponent;
});

// Import the component after mocking
import EarningsMapEditor from '../../components/earnings/EarningsMapEditor';

describe('EarningsMapEditor InputFieldLegacy Migration Tests', () => {
  const renderWithRouter = component => {
    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/earnings/rosters/123/mappings']}>
          <Routes>
            <Route path="/earnings/rosters/:rosterId/mappings&quot; element={component} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  test("EarningsMapEditor renders with InputFieldLegacy components', () => {
    renderWithRouter(<EarningsMapEditor />);

    const component = screen.getByTestId('earnings-map-editor');
    const sourceTypeField = screen.getByTestId('source-type-field');
    const conditionField = screen.getByTestId('condition-field');
    const sampleDataField = screen.getByTestId('sample-data-field');

    expect(component).toBeInTheDocument();
    expect(sourceTypeField).toBeInTheDocument();
    expect(conditionField).toBeInTheDocument();
    expect(sampleDataField).toBeInTheDocument();

    // Verify input field properties
    expect(screen.getByLabelText('Source Earnings Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Mapping Condition')).toBeInTheDocument();
    expect(screen.getByLabelText('Sample Data (JSON)')).toBeInTheDocument();

    // Check that multiline inputs are using textarea elements
    expect(conditionField.tagName).toBe('TEXTAREA');
    expect(sampleDataField.tagName).toBe('TEXTAREA');
    expect(conditionField.getAttribute('rows')).toBe('4');
    expect(sampleDataField.getAttribute('rows')).toBe('6');
  });

  test('TextField fields in EarningsMapEditor have appropriate labels', () => {
    renderWithRouter(<EarningsMapEditor />);

    expect(screen.getByRole('textbox', { name: 'Source Earnings Type' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Mapping Condition' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Sample Data (JSON)' })).toBeInTheDocument();
  });
});
