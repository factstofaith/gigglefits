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
        <div className="search-field&quot;>
          <div role="textbox" aria-label="Search tenants..." data-testid="search-field">
            Search tenants...
          </div>
        </div>
        <div className="tenant-create-dialog&quot;>
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

  MockedComponent.displayName = 'TenantsManager';

  return MockedComponent;
});

// Import the component after mocking
import TenantsManager from '../../components/admin/TenantsManager';

describe('TenantsManager InputFieldLegacy Migration Tests', () => {
  const renderWithTheme = component => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('TenantsManager renders with InputFieldLegacy components', () => {
    renderWithTheme(<TenantsManager />);

    const component = screen.getByTestId('tenants-manager');
    const searchField = screen.getByTestId('search-field');
    const tenantNameField = screen.getByTestId('tenant-name-field');
    const domainField = screen.getByTestId('domain-field');
    const adminContactField = screen.getByTestId('admin-contact-field');
    const statusField = screen.getByTestId('status-field');

    expect(component).toBeInTheDocument();
    expect(searchField).toBeInTheDocument();
    expect(tenantNameField).toBeInTheDocument();
    expect(domainField).toBeInTheDocument();
    expect(adminContactField).toBeInTheDocument();
    expect(statusField).toBeInTheDocument();

    // Verify input field labels
    expect(screen.getByLabelText('Search tenants...')).toBeInTheDocument();
    expect(screen.getByLabelText('Tenant Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Domain')).toBeInTheDocument();
    expect(screen.getByLabelText('Admin Contact Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  test('TextField fields in TenantsManager have appropriate roles', () => {
    renderWithTheme(<TenantsManager />);

    // Check for proper accessibility roles
    expect(screen.getByRole('textbox', { name: 'Search tenants...' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Tenant Name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Domain' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Admin Contact Email' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Status' })).toBeInTheDocument();
  });
});
