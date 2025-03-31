import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApplicationsManager from '@components/admin/ApplicationsManager';
import * as adminService from '@services/adminService';
import mockFactory from '../../utils/mockFactory';

// Mock the adminService
jest.mock('../../../services/adminService');

// Mock the useNotification hook
jest.mock('../../../hooks/useNotification', () => ({
  __esModule: true,
  default: () => ({
    showToast: jest.fn(),
    addNotification: jest.fn(),
  }),
}));

describe('ApplicationsManager', () => {
  // Use mock factory to generate test data
  const mockApplications = mockFactory.createApplicationList(1, {
    id: '1',
    name: 'Test App',
    type: 'api',
    description: 'This is a test application',
    status: 'active',
    auth_type: 'none',
    is_public: true,
    connection_parameters: [],
    documentation_url: 'https://example.com/docs',
    support_url: 'https://example.com/support',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    associated_datasets: ['101', '102'],
    webhooks: [],
  });

  const mockDatasets = mockFactory.createDatasetList(2, {
    status: ['active', 'draft']
  });
  
  // Adjust ids to match the expected test values
  mockDatasets[0].id = '101';
  mockDatasets[0].name = 'Dataset 1';
  mockDatasets[0].description = 'Test dataset 1';
  mockDatasets[0].fields = [
    { name: 'field1', type: 'string', required: true },
    { name: 'field2', type: 'number', required: false },
  ];
  
  mockDatasets[1].id = '102';
  mockDatasets[1].name = 'Dataset 2';
  mockDatasets[1].description = 'Test dataset 2';
  mockDatasets[1].fields = [];

  const mockDiscoveredFields = [
    { name: 'user_id', type: 'INTEGER', required: true, description: 'User identifier' },
    { name: 'username', type: 'STRING', required: true, description: 'Username' },
    { name: 'email', type: 'STRING', required: true, description: 'Email address' },
    { name: 'created_at', type: 'DATETIME', required: false, description: 'Creation timestamp' },
  ];

  beforeEach(() => {
    // Mock service methods
    adminService.getApplications.mockResolvedValue(mockApplications);
    adminService.getDatasets.mockResolvedValue(mockDatasets);
    adminService.discoverApplicationSchema.mockResolvedValue(mockDiscoveredFields);
    adminService.createDatasetFromSchema.mockResolvedValue({
      id: '103',
      name: 'Discovered Dataset',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders applications list', async () => {
    await act(async () => {
      render(<ApplicationsManager />);
    });

    expect(screen.getByText('Test App')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('opens application details dialog', async () => {
    await act(async () => {
      render(<ApplicationsManager />);
    });

    // Click on view details button
    const viewButtons = screen.getAllByTitle('View Details');
    await act(async () => {
      fireEvent.click(viewButtons[0]);
    });

    // Verify details dialog is open
    expect(screen.getByText('Application Details')).toBeInTheDocument();
    expect(screen.getByText('Documentation & Support')).toBeInTheDocument();
  });

  test('opens schema discovery dialog from application details', async () => {
    await act(async () => {
      render(<ApplicationsManager />);
    });

    // Click on view details button
    const viewButtons = screen.getAllByTitle('View Details');
    await act(async () => {
      fireEvent.click(viewButtons[0]);
    });

    // Switch to Datasets tab
    await act(async () => {
      fireEvent.click(screen.getByText('Datasets'));
    });

    // Click discover schema button
    const discoverSchemaButton = screen.getByText('Discover Schema');
    await act(async () => {
      fireEvent.click(discoverSchemaButton);
    });

    // Verify discovery dialog is open
    expect(screen.getByText('Discover Schema for Test App')).toBeInTheDocument();
    expect(
      screen.getByText('Select a method to discover the schema for this application.')
    ).toBeInTheDocument();

    // Select a discovery method
    await act(async () => {
      fireEvent.mouseDown(screen.getByLabelText('Discovery Method'));
    });

    // Select API Endpoint option
    await act(async () => {
      fireEvent.click(screen.getByText('API Endpoint'));
    });

    // Verify method-specific configuration is shown
    expect(screen.getByLabelText('API Endpoint')).toBeInTheDocument();
    expect(screen.getByLabelText('HTTP Method')).toBeInTheDocument();

    // Fill in configuration
    await act(async () => {
      fireEvent.change(screen.getByLabelText('API Endpoint'), {
        target: { value: '/api/users' },
      });
    });

    // Click discover schema button
    const discoverButton = screen.getByText('Discover Schema');
    await act(async () => {
      fireEvent.click(discoverButton);
    });

    // Wait for the discovery to complete
    await waitFor(() => {
      expect(adminService.discoverApplicationSchema).toHaveBeenCalledWith('1', 'api', {
        endpoint: '/api/users',
        method: 'GET',
        field_path: '',
      });
    });

    // Verify discovered fields are displayed
    await waitFor(() => {
      expect(screen.getByText('Discovered Fields (4)')).toBeInTheDocument();
      expect(screen.getByText('user_id')).toBeInTheDocument();
      expect(screen.getByText('username')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('created_at')).toBeInTheDocument();
    });

    // Click create dataset button
    const createDatasetButton = screen.getByText('Create Dataset from Schema');
    await act(async () => {
      fireEvent.click(createDatasetButton);
    });

    // Verify create dataset dialog is open
    expect(screen.getByText('Create Dataset from Schema')).toBeInTheDocument();

    // Fill in dataset name and description
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Dataset Name'), {
        target: { value: 'Users Dataset' },
      });
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'Dataset containing user information' },
      });
    });

    // Click create dataset button
    const confirmCreateButton = screen.getByText('Create Dataset').closest('button');
    await act(async () => {
      fireEvent.click(confirmCreateButton);
    });

    // Verify createDatasetFromSchema was called with correct params
    await waitFor(() => {
      expect(adminService.createDatasetFromSchema).toHaveBeenCalledWith(
        '1',
        'Users Dataset',
        'Dataset containing user information',
        mockDiscoveredFields
      );
    });
  });
});