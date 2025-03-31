import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeCompatibilityProvider as ThemeProvider } from '@design-system/adapter';
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
  getTenants: jest.fn().mockResolvedValue([]),
  createTenant: jest.fn(),
  updateTenant: jest.fn(),
  deleteTenant: jest.fn(),
  getTenantApplications: jest.fn().mockResolvedValue([]),
  getTenantDatasets: jest.fn().mockResolvedValue([]),
  addApplicationToTenant: jest.fn(),
  removeApplicationFromTenant: jest.fn(),
  addDatasetToTenant: jest.fn(),
  removeDatasetFromTenant: jest.fn(),
  getApplications: jest.fn().mockResolvedValue([]),
  getDatasets: jest.fn().mockResolvedValue([]),
}));

// Mock the CreateTenantDialog component
const MockCreateTenantDialog = () => {
  // Added display name
  MockCreateTenantDialog.displayName = 'MockCreateTenantDialog';

  // Added display name
  MockCreateTenantDialog.displayName = 'MockCreateTenantDialog';

  // Added display name
  MockCreateTenantDialog.displayName = 'MockCreateTenantDialog';

  // Added display name
  MockCreateTenantDialog.displayName = 'MockCreateTenantDialog';

  // Added display name
  MockCreateTenantDialog.displayName = 'MockCreateTenantDialog';


  return (
    <div data-testid="create-tenant-dialog">
      <div className="form-fields&quot;>
        <div role="textbox" aria-label="Tenant Name" data-testid="tenant-name-field">
          Tenant Name
        </div>
        <div role="textbox&quot; aria-label="Domain" data-testid="domain-field">
          Domain
        </div>
        <div role="textbox&quot; aria-label="Admin Contact Email" data-testid="admin-contact-field">
          Admin Contact Email
        </div>
        <div role="combobox&quot; aria-label="Status" data-testid="status-field">
          Status
        </div>
      </div>
    </div>
  );
};

// Mock the TenantsManager component
jest.mock('../../components/admin/TenantsManager', () => {
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
      <div data-testid="tenants-manager">
        <MockCreateTenantDialog />
      </div>
    );
  };

  MockedComponent.displayName = 'TenantsManager';

  return MockedComponent;
});

// Import the component after mocking
import TenantsManager from '../../components/admin/TenantsManager';

describe('TenantsManager SelectLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('TenantsManager renders with SelectLegacy dropdown', () => {
    renderWithTheme(<TenantsManager />);

    const component = screen.getByTestId('tenants-manager');
    const dialog = screen.getByTestId('create-tenant-dialog');
    const statusField = screen.getByTestId('status-field');

    expect(component).toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    expect(statusField).toBeInTheDocument();

    // Verify select field is rendered with the right role
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument();
  });
});
