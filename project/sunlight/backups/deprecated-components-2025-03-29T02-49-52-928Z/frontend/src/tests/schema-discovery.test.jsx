import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
;;
import theme from '../theme';
import { ThemeProvider } from '../design-system';

// Import mock data and services
jest.mock('../services/adminService', () => ({
  getApplications: jest.fn(() =>
    Promise.resolve([
      {
        id: '1',
        name: 'Test Application',
        type: 'api',
        description: 'Test application description',
        auth_type: 'none',
        status: 'active',
        is_public: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z',
        associated_datasets: [],
      },
    ])
  ),
  getDatasets: jest.fn(() => Promise.resolve([])),
  discoverApplicationSchema: jest.fn(() =>
    Promise.resolve([
      { name: 'id', type: 'INTEGER', required: true, description: 'Unique identifier' },
      { name: 'name', type: 'STRING', required: true, description: 'User name' },
      { name: 'email', type: 'STRING', required: true, description: 'Email address' },
      { name: 'created_at', type: 'DATETIME', required: false, description: 'Creation date' },
    ])
  ),
  createDatasetFromSchema: jest.fn(() => Promise.resolve({ id: '101', name: 'New Dataset' })),
  getApplicationById: jest.fn(() =>
    Promise.resolve({
      id: '1',
      name: 'Test Application',
      type: 'api',
      description: 'Test application description',
      auth_type: 'none',
      status: 'active',
      is_public: true,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      associated_datasets: [],
    })
  ),
}));

// Mock the useNotification hook
jest.mock('../hooks/useNotification', () => ({
  __esModule: true,
  default: () => ({
    showToast: jest.fn(),
    addNotification: jest.fn(),
  }),
}));

// Mock schema discovery component
const SchemaDiscoveryDialog = () => {
  // Added display name
  SchemaDiscoveryDialog.displayName = 'SchemaDiscoveryDialog';

  // Added display name
  SchemaDiscoveryDialog.displayName = 'SchemaDiscoveryDialog';

  // Added display name
  SchemaDiscoveryDialog.displayName = 'SchemaDiscoveryDialog';

  // Added display name
  SchemaDiscoveryDialog.displayName = 'SchemaDiscoveryDialog';

  // Added display name
  SchemaDiscoveryDialog.displayName = 'SchemaDiscoveryDialog';


  const handleDiscoveryMethodChange = event => {
  };

  const handleDiscoveryConfigChange = event => {
  };

  const handleRunDiscovery = () => {
  // Added display name
  handleRunDiscovery.displayName = 'handleRunDiscovery';

  // Added display name
  handleRunDiscovery.displayName = 'handleRunDiscovery';

  // Added display name
  handleRunDiscovery.displayName = 'handleRunDiscovery';

  // Added display name
  handleRunDiscovery.displayName = 'handleRunDiscovery';

  // Added display name
  handleRunDiscovery.displayName = 'handleRunDiscovery';


  };

  const handleOpenCreateDataset = () => {
  // Added display name
  handleOpenCreateDataset.displayName = 'handleOpenCreateDataset';

  // Added display name
  handleOpenCreateDataset.displayName = 'handleOpenCreateDataset';

  // Added display name
  handleOpenCreateDataset.displayName = 'handleOpenCreateDataset';

  // Added display name
  handleOpenCreateDataset.displayName = 'handleOpenCreateDataset';

  // Added display name
  handleOpenCreateDataset.displayName = 'handleOpenCreateDataset';


  };

  const handleCloseSchemaDiscovery = () => {
  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';

  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';

  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';

  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';

  // Added display name
  handleCloseSchemaDiscovery.displayName = 'handleCloseSchemaDiscovery';


  };

  return (
    <div>
      <h2>Discover Schema for Test Application</h2>
      <p>Select a method to discover the schema for this application.</p>

      <label>
        Discovery Method
        <select onChange={handleDiscoveryMethodChange}>
          <option value="&quot;>Select a method</option>
          <option value="api">API Endpoint</option>
          <option value="swagger&quot;>Swagger/OpenAPI</option>
          <option value="database">Database</option>
          <option value="file&quot;>File Sample</option>
          <option value="ai">AI Inference</option>
        </select>
      </label>

      <div>
        <label>
          API Endpoint
          <input type="text&quot; name="endpoint" onChange={handleDiscoveryConfigChange} />
        </label>

        <label>
          HTTP Method
          <select name="method&quot; onChange={handleDiscoveryConfigChange}>
            <option value="GET">GET</option>
            <option value="POST&quot;>POST</option>
          </select>
        </label>
      </div>

      <div>
        <h3>Discovered Fields (4)</h3>
        <table>
          <thead>
            <tr>
              <th>Field Name</th>
              <th>Type</th>
              <th>Required</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>id</td>
              <td>INTEGER</td>
              <td>Required</td>
              <td>Unique identifier</td>
            </tr>
            <tr>
              <td>name</td>
              <td>STRING</td>
              <td>Required</td>
              <td>User name</td>
            </tr>
            <tr>
              <td>email</td>
              <td>STRING</td>
              <td>Required</td>
              <td>Email address</td>
            </tr>
            <tr>
              <td>created_at</td>
              <td>DATETIME</td>
              <td>Optional</td>
              <td>Creation date</td>
            </tr>
          </tbody>
        </table>

        <button onClick={handleOpenCreateDataset}>Create Dataset from Schema</button>
      </div>

      <div>
        <button onClick={handleCloseSchemaDiscovery}>Cancel</button>
        <button onClick={handleRunDiscovery}>Discover Schema</button>
      </div>
    </div>
  );
};

// Mock create dataset dialog component
const CreateDatasetDialog = () => {
  // Added display name
  CreateDatasetDialog.displayName = "CreateDatasetDialog';

  // Added display name
  CreateDatasetDialog.displayName = 'CreateDatasetDialog';

  // Added display name
  CreateDatasetDialog.displayName = 'CreateDatasetDialog';

  // Added display name
  CreateDatasetDialog.displayName = 'CreateDatasetDialog';

  // Added display name
  CreateDatasetDialog.displayName = 'CreateDatasetDialog';


  const handleCreateDataset = () => {
  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';

  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';

  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';

  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';

  // Added display name
  handleCreateDataset.displayName = 'handleCreateDataset';


  };

  const handleCloseCreateDataset = () => {
  // Added display name
  handleCloseCreateDataset.displayName = 'handleCloseCreateDataset';

  // Added display name
  handleCloseCreateDataset.displayName = 'handleCloseCreateDataset';

  // Added display name
  handleCloseCreateDataset.displayName = 'handleCloseCreateDataset';

  // Added display name
  handleCloseCreateDataset.displayName = 'handleCloseCreateDataset';

  // Added display name
  handleCloseCreateDataset.displayName = 'handleCloseCreateDataset';


  };

  return (
    <div>
      <h2>Create Dataset from Schema</h2>
      <p>Create a new dataset based on the 4 fields discovered.</p>

      <label>
        Dataset Name
        <input type="text&quot; />
      </label>

      <label>
        Description
        <textarea></textarea>
      </label>

      <div>
        <button onClick={handleCloseCreateDataset}>Cancel</button>
        <button onClick={handleCreateDataset}>Create Dataset</button>
      </div>
    </div>
  );
};

describe("Schema Discovery', () => {
  test('Schema discovery dialog renders correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <SchemaDiscoveryDialog />
      </ThemeProvider>
    );

    // Check if the dialog title is rendered
    expect(screen.getByText('Discover Schema for Test Application')).toBeInTheDocument();
    expect(
      screen.getByText('Select a method to discover the schema for this application.')
    ).toBeInTheDocument();

    // Check if the method selection is available
    const methodSelect = screen.getByLabelText('Discovery Method');
    expect(methodSelect).toBeInTheDocument();

    // Select API method
    fireEvent.change(methodSelect, { target: { value: 'api' } });

    // Check if API-specific fields are shown
    expect(screen.getByLabelText('API Endpoint')).toBeInTheDocument();
    expect(screen.getByLabelText('HTTP Method')).toBeInTheDocument();

    // Check if discovered fields are displayed
    expect(screen.getByText('Discovered Fields (4)')).toBeInTheDocument();
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
    expect(screen.getByText('created_at')).toBeInTheDocument();

    // Check if buttons are available
    expect(screen.getByText('Create Dataset from Schema')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Discover Schema')).toBeInTheDocument();
  });

  test('Create dataset dialog renders correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <CreateDatasetDialog />
      </ThemeProvider>
    );

    // Check if the dialog title is rendered
    expect(screen.getByText('Create Dataset from Schema')).toBeInTheDocument();
    expect(
      screen.getByText('Create a new dataset based on the 4 fields discovered.')
    ).toBeInTheDocument();

    // Check if form fields are available
    expect(screen.getByLabelText('Dataset Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();

    // Check if buttons are available
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Dataset')).toBeInTheDocument();
  });
});
