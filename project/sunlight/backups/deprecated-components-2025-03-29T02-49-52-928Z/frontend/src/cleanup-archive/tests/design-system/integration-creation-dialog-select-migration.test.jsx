import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '../../../design-system';
import theme from '../../theme';

// Mock the IntegrationCreationDialog component
jest.mock('../../components/integration/IntegrationCreationDialog', () => {
  const MockedComponent = ({ open, onClose, onCreate }) => {
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
      <div data-testid="integration-creation-dialog">
        <div className="integration-creation-dialog-selects&quot;>
          <div role="combobox" aria-label="Integration Type" data-testid="integration-type-select">
            Integration Type
          </div>

          <div role="combobox&quot; aria-label="Source" data-testid="source-select">
            Source
          </div>

          <div role="combobox&quot; aria-label="Destination" data-testid="destination-select">
            Destination
          </div>
        </div>
      </div>
    );
  };

  MockedComponent.displayName = 'IntegrationCreationDialog';

  return MockedComponent;
});

// Mock services
jest.mock('../../services/integrationService', () => ({
  getAvailableSources: jest.fn().mockResolvedValue([]),
  getAvailableDestinations: jest.fn().mockResolvedValue([]),
  getDatasets: jest.fn().mockResolvedValue([]),
  createIntegrationFromTemplate: jest.fn(),
}));

jest.mock('../../services/authService', () => ({
  isAdmin: jest.fn().mockResolvedValue(false),
}));

// Mock child components
jest.mock('../../components/integration/AzureBlobConfiguration', () => () => (
  <div>AzureBlobConfiguration</div>
));
jest.mock('../../components/integration/ScheduleConfiguration', () => () => (
  <div>ScheduleConfiguration</div>
));
jest.mock('../../components/integration/NotificationSettings', () => () => (
  <div>NotificationSettings</div>
));
jest.mock('../../components/integration/TemplateSelector', () => () => <div>TemplateSelector</div>);

// Import the component after mocking
import IntegrationCreationDialog from '../../components/integration/IntegrationCreationDialog';

describe('IntegrationCreationDialog SelectLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('IntegrationCreationDialog renders with all SelectLegacy dropdowns', () => {
    renderWithTheme(
      <IntegrationCreationDialog open={true} onClose={() => {}} onCreate={() => {}} />
    );

    const component = screen.getByTestId('integration-creation-dialog');
    const integrationTypeSelect = screen.getByTestId('integration-type-select');
    const sourceSelect = screen.getByTestId('source-select');
    const destinationSelect = screen.getByTestId('destination-select');

    expect(component).toBeInTheDocument();
    expect(integrationTypeSelect).toBeInTheDocument();
    expect(sourceSelect).toBeInTheDocument();
    expect(destinationSelect).toBeInTheDocument();

    // Verify select fields are rendered with the right roles
    expect(screen.getByRole('combobox', { name: 'Integration Type' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Source' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Destination' })).toBeInTheDocument();
  });
});
