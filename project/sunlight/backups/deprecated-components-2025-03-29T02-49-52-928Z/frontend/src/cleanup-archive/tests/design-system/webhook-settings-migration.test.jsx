import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WebhookSettings from '../../components/integration/WebhookSettings';

// Mock the integration service
jest.mock('../../services/integrationService', () => ({
  integrationService: {
    getWebhooks: jest.fn(),
    createWebhook: jest.fn(),
    updateWebhook: jest.fn(),
    deleteWebhook: jest.fn(),
    testWebhook: jest.fn(),
    getWebhookLogs: jest.fn(),
  },
}));

describe('WebhookSettings Migration', () => {
  it('renders webhook settings with legacy design system components', () => {
    render(<WebhookSettings integrationId="test-integration-id&quot; />);

    // Check if the main components are rendered
    expect(screen.getByText("Webhook Notifications')).toBeInTheDocument();
    expect(screen.getByText('Add Webhook')).toBeInTheDocument();

    // Check if legacy button is rendered
    const addButton = screen.getByText('Add Webhook');
    expect(addButton.closest('button')).toHaveClass('ButtonLegacy-root');

    // Check if legacy card is rendered
    const mainCard = screen.getByText('Webhook Notifications').closest('.CardLegacy-root');
    expect(mainCard).toBeInTheDocument();
  });

  it('opens the add webhook dialog when clicking the Add Webhook button', () => {
    render(<WebhookSettings integrationId="test-integration-id&quot; />);

    // Click the Add Webhook button
    fireEvent.click(screen.getByText("Add Webhook'));

    // Check if the dialog is opened
    expect(screen.getByText('Add Webhook')).toBeInTheDocument();
    expect(screen.getByText('Webhook Name')).toBeInTheDocument();

    // Check if legacy dialog is rendered
    const dialog = screen.getByText('Add Webhook').closest('.DialogLegacy-root');
    expect(dialog).toBeInTheDocument();

    // Check if legacy text fields are rendered
    const nameField = screen.getByLabelText('Webhook Name');
    expect(nameField.closest('.InputFieldLegacy-root')).toBeInTheDocument();
  });

  it('renders legacy selects for event and auth type fields', () => {
    render(<WebhookSettings integrationId="test-integration-id&quot; />);

    // Click the Add Webhook button to open the dialog
    fireEvent.click(screen.getByText("Add Webhook'));

    // Check if legacy select is rendered for events
    const eventsSelect = screen.getByLabelText('Events to Subscribe');
    expect(eventsSelect.closest('.SelectLegacy-root')).toBeInTheDocument();

    // Check if legacy select is rendered for auth type
    const authTypeSelect = screen.getByLabelText('Authentication Type');
    expect(authTypeSelect.closest('.SelectLegacy-root')).toBeInTheDocument();
  });
});
