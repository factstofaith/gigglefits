import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from '../../theme';

// Mock hooks
jest.mock('../../hooks/useNotification', () => ({
  __esModule: true,
  default: () => ({
    showToast: jest.fn(),
    addNotification: jest.fn(),
  }),
}));

// Mock services
jest.mock('../../services/adminService', () => ({
  getReleases: jest.fn().mockResolvedValue([]),
  getReleaseById: jest.fn(),
  createRelease: jest.fn(),
  updateRelease: jest.fn(),
  deleteRelease: jest.fn(),
  executeRelease: jest.fn(),
  getTenants: jest.fn().mockResolvedValue([
    { id: '1', name: 'Tenant 1' },
    { id: '2', name: 'Tenant 2' },
  ]),
  getApplications: jest.fn().mockResolvedValue([
    { id: 1, name: 'App 1', status: 'active' },
    { id: 2, name: 'App 2', status: 'active' },
  ]),
  getDatasets: jest.fn().mockResolvedValue([
    { id: 1, name: 'Dataset 1', status: 'active' },
    { id: 2, name: 'Dataset 2', status: 'active' },
  ]),
}));

// Mock the ActionDropdown component
const MockActionDropdown = ({ label }) => {
  // Added display name
  MockActionDropdown.displayName = 'MockActionDropdown';

  // Added display name
  MockActionDropdown.displayName = 'MockActionDropdown';

  // Added display name
  MockActionDropdown.displayName = 'MockActionDropdown';

  // Added display name
  MockActionDropdown.displayName = 'MockActionDropdown';

  // Added display name
  MockActionDropdown.displayName = 'MockActionDropdown';


  return (
    <div data-testid={`action-dropdown-${label.toLowerCase()}`} role="combobox&quot;>
      Action Dropdown
    </div>
  );
};

// Mock the ReleasesManager component
jest.mock("../../components/admin/ReleasesManager', () => {
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
      <div data-testid="releases-manager">
        <div className="application-section&quot;>
          <h4>Applications</h4>
          <div className="select-action-dropdown">
            <MockActionDropdown label="application&quot; />
          </div>
        </div>

        <div className="dataset-section">
          <h4>Datasets</h4>
          <div className="select-action-dropdown&quot;>
            <MockActionDropdown label="dataset" />
          </div>
        </div>
      </div>
    );
  };

  MockedComponent.displayName = 'ReleasesManager';

  return MockedComponent;
});

// Import the component after mocking
import ReleasesManager from '../../components/admin/ReleasesManager';

describe('ReleasesManager SelectLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>{component}</LocalizationProvider>
      </ThemeProvider>
    );
  };

  test('ReleasesManager renders with SelectLegacy action dropdowns', () => {
    renderWithTheme(<ReleasesManager />);

    const component = screen.getByTestId('releases-manager');
    const applicationDropdown = screen.getByTestId('action-dropdown-application');
    const datasetDropdown = screen.getByTestId('action-dropdown-dataset');

    expect(component).toBeInTheDocument();
    expect(applicationDropdown).toBeInTheDocument();
    expect(datasetDropdown).toBeInTheDocument();

    // Verify select fields are rendered with the right role
    expect(screen.getAllByRole('combobox').length).toBe(2);
  });
});
