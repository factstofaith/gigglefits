import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IntegrationDetailView from '../../components/integration/IntegrationDetailView';

// Mock the services
jest.mock('../../services/integrationService', () => ({
  getIntegrationById: jest.fn().mockResolvedValue({
    id: '123',
    name: 'Test Integration',
    type: 'Batch',
    source: 'Azure Blob Container',
    destination: 'SQL Database',
    description: 'Test description',
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    azureBlobConfig: {
      authMethod: 'connectionString',
      containerName: 'test-container',
    },
    schedule: {
      type: 'onDemand',
      cronExpression: '',
      timezone: 'UTC',
    },
    notifications: {
      enabled: true,
      notifyOn: ['error'],
      recipients: [],
      enableSummary: false,
    },
  }),
  getIntegrationDatasets: jest.fn().mockResolvedValue([]),
  updateIntegration: jest.fn(),
  runIntegration: jest.fn(),
  associateDataset: jest.fn(),
  disassociateDataset: jest.fn(),
}));

jest.mock('../../services/authService', () => ({
  isAdmin: jest.fn().mockResolvedValue(true),
}));

// Mock the child components
jest.mock('../../components/integration/AzureBlobConfiguration', () => () => (
  <div>AzureBlobConfiguration</div>
));
jest.mock('../../components/integration/ScheduleConfiguration', () => () => (
  <div>ScheduleConfiguration</div>
));
jest.mock('../../components/integration/RunLogViewer', () => () => <div>RunLogViewer</div>);
jest.mock('../../components/integration/NotificationSettings', () => () => (
  <div>NotificationSettings</div>
));
jest.mock('../../components/integration/WebhookSettings', () => () => <div>WebhookSettings</div>);
jest.mock('../../components/integration/EarningsMappingDetail', () => () => (
  <div>EarningsMappingDetail</div>
));
jest.mock('../../components/integration/SaveAsTemplateButton', () => () => (
  <div>SaveAsTemplateButton</div>
));

describe('IntegrationDetailView Migration', () => {
  it('renders with legacy design system components', async () => {
    render(<IntegrationDetailView integrationId="123&quot; />);

    // Wait for the component to load
    const title = await screen.findByText("Test Integration');

    // Check if legacy Card is rendered
    expect(title.closest('.CardLegacy-root')).toBeInTheDocument();

    // Check if legacy Button is rendered
    const runButton = await screen.findByText('Run Now');
    expect(runButton.closest('.ButtonLegacy-root')).toBeInTheDocument();
  });

  it('renders edit mode with legacy components', async () => {
    render(<IntegrationDetailView integrationId="123&quot; />);

    // Wait for the component to load
    await screen.findByText("Test Integration');

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // Check if legacy TextField is rendered
    const nameField = await screen.findByLabelText('Integration Name');
    expect(nameField.closest('.InputFieldLegacy-root')).toBeInTheDocument();

    // Check if cancel and save buttons are rendered with legacy components
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton.closest('.ButtonLegacy-root')).toBeInTheDocument();

    const saveButton = screen.getByText('Save Changes');
    expect(saveButton.closest('.ButtonLegacy-root')).toBeInTheDocument();
  });

  it('renders datasets tab with legacy card components', async () => {
    render(<IntegrationDetailView integrationId="123&quot; />);

    // Wait for the component to load
    await screen.findByText("Test Integration');

    // Click on the Datasets tab
    const datasetsTab = screen.getByRole('tab', { name: /datasets/i });
    fireEvent.click(datasetsTab);

    // Check if legacy Paper is rendered
    const paper = await screen.findByText('No datasets associated with this integration.');
    expect(paper.closest('.CardLegacy-root')).toBeInTheDocument();

    // Check if legacy Button is rendered in datasets tab
    const associateButton = screen.getByText('Associate Dataset');
    expect(associateButton.closest('.ButtonLegacy-root')).toBeInTheDocument();
  });
});
