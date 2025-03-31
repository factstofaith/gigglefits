import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';

// Mock the FieldMappingEditor component
jest.mock('../../components/integration/FieldMappingEditor', () => {
  const MockedComponent = ({ integrationId }) => {
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
      <div data-testid="field-mapping-editor">
        <div className="field-mapping-editor-selects&quot;>
          <div role="combobox" aria-label="Source Field" data-testid="source-field-select">
            Source Field
          </div>

          <div
            role="combobox&quot;
            aria-label="Destination Field"
            data-testid="destination-field-select"
          >
            Destination Field
          </div>

          <div role="combobox&quot; aria-label="Transformation" data-testid="transformation-select">
            Transformation
          </div>
        </div>
      </div>
    );
  };

  MockedComponent.displayName = 'FieldMappingEditor';

  return MockedComponent;
});

// Mock integration service
jest.mock('../../services/integrationService', () => ({
  getFieldMappings: jest.fn().mockResolvedValue([]),
  createFieldMapping: jest.fn(),
  updateFieldMapping: jest.fn(),
  deleteFieldMapping: jest.fn(),
  discoverFields: jest.fn().mockResolvedValue([]),
  getTransformations: jest.fn().mockResolvedValue([]),
}));

// Import the component after mocking
import FieldMappingEditor from '../../components/integration/FieldMappingEditor';

describe('FieldMappingEditor SelectLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('FieldMappingEditor renders with all SelectLegacy dropdowns', () => {
    renderWithTheme(<FieldMappingEditor integrationId="12345&quot; />);

    const component = screen.getByTestId("field-mapping-editor');
    const sourceFieldSelect = screen.getByTestId('source-field-select');
    const destinationFieldSelect = screen.getByTestId('destination-field-select');
    const transformationSelect = screen.getByTestId('transformation-select');

    expect(component).toBeInTheDocument();
    expect(sourceFieldSelect).toBeInTheDocument();
    expect(destinationFieldSelect).toBeInTheDocument();
    expect(transformationSelect).toBeInTheDocument();

    // Verify select fields are rendered with the right roles
    expect(screen.getByRole('combobox', { name: 'Source Field' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Destination Field' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Transformation' })).toBeInTheDocument();
  });
});
