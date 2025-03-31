import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TenantContext } from '../../contexts/TenantContext';
import TenantListRefactored from '../../components/admin/TenantListRefactored';

// Mock the ResourceLoader component
jest.mock('../../components/common/ResourceLoader', () => {
  return ({ children, isLoading, error, isEmpty, emptyMessage }) => {
    if (isLoading) return <div data-testid="loading">Loading...</div>;
    if (error) return <div data-testid="error">Error: {error.message}</div>;
    if (isEmpty) return <div data-testid="empty">{emptyMessage}</div>;
    return <div data-testid="content">{children}</div>;
  };
});

// Mock icon components
jest.mock('@mui/icons-material', () => ({
  Add: () => <span data-testid="add-icon" />,
  Edit: () => <span data-testid="edit-icon" />,
  Delete: () => <span data-testid="delete-icon" />,
  Refresh: () => <span data-testid="refresh-icon" />,
}));

// Mock tenant data
const mockTenants = [
  {
    id: 1,
    name: 'Tenant 1',
    description: 'First test tenant',
    active: true,
    applicationCount: 5,
    datasetCount: 3,
  },
  {
    id: 2,
    name: 'Tenant 2',
    description: 'Second test tenant',
    active: false,
    applicationCount: 2,
    datasetCount: 1,
  },
  {
    id: 3,
    name: 'Tenant 3',
    description: 'Third test tenant',
    active: true,
    applicationCount: 0,
    datasetCount: 0,
  },
];

// Mock tenant context values
const mockTenantContextEmpty = {
  tenants: [],
  selectedTenant: null,
  selectTenant: jest.fn(),
  isLoading: false,
  error: null,
  loadTenants: jest.fn(),
};

const mockTenantContextWithData = {
  tenants: mockTenants,
  selectedTenant: null,
  selectTenant: jest.fn(),
  isLoading: false,
  error: null,
  loadTenants: jest.fn(),
};

const mockTenantContextLoading = {
  ...mockTenantContextEmpty,
  isLoading: true,
};

const mockTenantContextError = {
  ...mockTenantContextEmpty,
  error: new Error('Failed to load tenants'),
};

// Custom render function with tenant context
const renderTenantList = (contextValue = mockTenantContextWithData) => {
  // Added display name
  renderTenantList.displayName = 'renderTenantList';

  // Added display name
  renderTenantList.displayName = 'renderTenantList';

  // Added display name
  renderTenantList.displayName = 'renderTenantList';

  // Added display name
  renderTenantList.displayName = 'renderTenantList';

  // Added display name
  renderTenantList.displayName = 'renderTenantList';


  return render(
    <TenantContext.Provider value={contextValue}>
      <TenantListRefactored />
    </TenantContext.Provider>
  );
};

describe('TenantListRefactored Component Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title and action buttons', () => {
    renderTenantList();

    // Check title
    expect(screen.getByText('Tenants')).toBeInTheDocument();

    // Check buttons
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Add Tenant')).toBeInTheDocument();
  });

  it('renders the loading state correctly', () => {
    renderTenantList(mockTenantContextLoading);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    renderTenantList(mockTenantContextError);
    expect(screen.getByTestId('error')).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    renderTenantList(mockTenantContextEmpty);
    expect(screen.getByTestId('empty')).toBeInTheDocument();
    expect(screen.getByText(/No tenants have been created yet/)).toBeInTheDocument();
  });

  it('renders tenant data when available', () => {
    renderTenantList();

    expect(screen.getByTestId('content')).toBeInTheDocument();

    // Check for tenant data
    expect(screen.getByText('Tenant 1')).toBeInTheDocument();
    expect(screen.getByText('First test tenant')).toBeInTheDocument();
    expect(screen.getByText('Tenant 2')).toBeInTheDocument();
    expect(screen.getByText('Second test tenant')).toBeInTheDocument();
  });

  it('calls refresh function when refresh button is clicked', () => {
    renderTenantList();

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockTenantContextWithData.loadTenants).toHaveBeenCalledWith(true);
  });

  it('calls selectTenant when a tenant row is clicked', () => {
    renderTenantList();

    // Find and click on the first tenant row
    const tenantRow = screen.getByText('Tenant 1').closest('tr');
    fireEvent.click(tenantRow);

    expect(mockTenantContextWithData.selectTenant).toHaveBeenCalledWith(mockTenants[0]);
  });
});
