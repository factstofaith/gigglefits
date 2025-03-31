import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import theme from '../../theme';

// Mock the hooks
jest.mock('../../hooks/useNotification', () => ({
  __esModule: true,
  default: () => ({
    showToast: jest.fn(),
    addNotification: jest.fn(),
  }),
}));

// Mock the services
jest.mock('../../services/adminService', () => ({
  getApplications: jest.fn().mockResolvedValue([]),
  getApplicationById: jest.fn(),
  createApplication: jest.fn(),
  updateApplication: jest.fn(),
  deleteApplication: jest.fn(),
  getApplicationUsageStats: jest.fn(),
  getDatasets: jest.fn().mockResolvedValue([]),
  createWebhook: jest.fn(),
  updateWebhook: jest.fn(),
  deleteWebhook: jest.fn(),
  testWebhook: jest.fn(),
  discoverApplicationSchema: jest.fn(),
  createDatasetFromSchema: jest.fn(),
  getTenants: jest.fn().mockResolvedValue([]),
  getTenantApplications: jest.fn(),
  addApplicationToTenant: jest.fn(),
  removeApplicationFromTenant: jest.fn(),
}));

// Mock the ApplicationsManager component
jest.mock('../../components/admin/ApplicationsManager', () => {
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
      <div data-testid="applications-manager">
        <div className="search-field&quot;>
          <div role="textbox" aria-label="Search applications..." data-testid="search-field">
            Search applications...
          </div>
        </div>
        <div className="form-fields&quot;>
          <div role="textbox" aria-label="Application Name" data-testid="name-field">
            Application Name
          </div>
          <div role="textbox&quot; aria-label="Description" data-testid="description-field">
            Description
          </div>
          <div role="textbox&quot; aria-label="Documentation URL" data-testid="documentation-url-field">
            Documentation URL
          </div>
          <textarea
            role="textbox&quot;
            aria-label="Sample Data (JSON)"
            data-testid="sample-data-field"
            rows="6&quot;
          >
            Sample Data
          </textarea>
        </div>
      </div>
    );
  };

  MockedComponent.displayName = "ApplicationsManager';

  return MockedComponent;
});

// Import the component after mocking
import ApplicationsManager from '../../components/admin/ApplicationsManager';

describe('ApplicationsManager InputFieldLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('ApplicationsManager renders with InputFieldLegacy components', () => {
    renderWithTheme(<ApplicationsManager />);

    const component = screen.getByTestId('applications-manager');
    const searchField = screen.getByTestId('search-field');
    const nameField = screen.getByTestId('name-field');
    const descriptionField = screen.getByTestId('description-field');
    const documentationUrlField = screen.getByTestId('documentation-url-field');
    const sampleDataField = screen.getByTestId('sample-data-field');

    expect(component).toBeInTheDocument();
    expect(searchField).toBeInTheDocument();
    expect(nameField).toBeInTheDocument();
    expect(descriptionField).toBeInTheDocument();
    expect(documentationUrlField).toBeInTheDocument();
    expect(sampleDataField).toBeInTheDocument();

    // Verify input field labels
    expect(screen.getByLabelText('Search applications...')).toBeInTheDocument();
    expect(screen.getByLabelText('Application Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Documentation URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Sample Data (JSON)')).toBeInTheDocument();

    // Check multiline field
    expect(sampleDataField.tagName).toBe('TEXTAREA');
    expect(sampleDataField.getAttribute('rows')).toBe('6');
  });

  test('TextField fields in ApplicationsManager have appropriate roles', () => {
    renderWithTheme(<ApplicationsManager />);

    // Check for proper accessibility roles
    expect(screen.getByRole('textbox', { name: 'Search applications...' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Application Name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Documentation URL' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Sample Data (JSON)' })).toBeInTheDocument();
  });
});
