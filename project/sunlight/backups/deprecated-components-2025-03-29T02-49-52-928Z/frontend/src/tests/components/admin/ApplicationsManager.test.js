// tests/components/admin/ApplicationsManager.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationProvider } from '@contexts/NotificationContext';

// Create an actual mock for the notification hook
const mockShowToast = jest.fn();
const mockAddNotification = jest.fn();

// Mock the hooks module
jest.mock('../../../hooks/useNotification', () => {
  return jest.fn().mockImplementation(() => ({
    showToast: mockShowToast,
    addNotification: mockAddNotification,
  }));
});
import ApplicationsManager from '@components/admin/ApplicationsManager';
import * as adminService from '@services/adminService';

// Mock the admin service
jest.mock('../../../services/adminService');

// Sample applications data
const mockApplications = [
  {
    id: 1,
    name: 'Salesforce',
    type: 'api',
    description: 'Salesforce CRM integration',
    status: 'active',
    is_public: true,
    auth_type: 'oauth2',
    created_at: '2025-01-15T12:00:00.000Z',
  },
  {
    id: 2,
    name: 'Azure Blob Storage',
    type: 'file',
    description: 'Microsoft Azure Blob Storage',
    status: 'active',
    is_public: true,
    auth_type: 'api_key',
    created_at: '2025-01-20T14:30:00.000Z',
  },
];

// Sample usage stats data
const mockUsageStats = {
  application: {
    id: 1,
    name: 'Salesforce',
    description: 'Salesforce CRM integration',
  },
  totalIntegrations: 24,
  activeIntegrations: 18,
  tenantsUsing: 5,
  recentActivity: [
    {
      event: 'Integration Created',
      tenant: 'Acme Corp',
      timestamp: '2025-03-15T10:30:00.000Z',
    },
    {
      event: 'Integration Run',
      tenant: 'TechStart Inc',
      timestamp: '2025-03-14T15:45:00.000Z',
    },
  ],
};

describe('ApplicationsManager', () => {
  beforeEach(() => {
    // Setup the mocks
    adminService.getApplications.mockResolvedValue(mockApplications);
    adminService.getApplicationById.mockImplementation(id =>
      Promise.resolve(mockApplications.find(app => app.id === id))
    );
    adminService.createApplication.mockImplementation(data =>
      Promise.resolve({ ...data, id: 3, created_at: new Date().toISOString() })
    );
    adminService.updateApplication.mockImplementation((id, data) =>
      Promise.resolve({ ...mockApplications.find(app => app.id === id), ...data })
    );
    adminService.deleteApplication.mockResolvedValue(true);
    adminService.getApplicationUsageStats.mockResolvedValue(mockUsageStats);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component with applications', async () => {
    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Should start with loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
    });

    // Should show both applications
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
    expect(screen.getByText('Azure Blob Storage')).toBeInTheDocument();

    // Should have called the service
    expect(adminService.getApplications).toHaveBeenCalled();
  });

  it('should allow filtering applications by name', async () => {
    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
    });

    // Filter for Salesforce
    const searchInput = screen.getByPlaceholderText('Search applications...');
    fireEvent.change(searchInput, { target: { value: 'Salesforce' } });

    // Should show Salesforce but not Azure
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
    expect(screen.queryByText('Azure Blob Storage')).not.toBeInTheDocument();

    // Clear filter
    fireEvent.change(searchInput, { target: { value: '' } });

    // Should show both again
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
    expect(screen.getByText('Azure Blob Storage')).toBeInTheDocument();
  });

  it('should open the create application dialog', async () => {
    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
    });

    // Click the new application button
    fireEvent.click(screen.getByText('New Application'));

    // Dialog should be open
    expect(screen.getByText('Create New Application')).toBeInTheDocument();

    // Form fields should be empty
    expect(screen.getByLabelText('Application Name')).toHaveValue('');
  });

  it('should create a new application', async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
    });

    // Click the new application button
    await user.click(screen.getByText('New Application'));

    // Fill out the form
    await user.type(screen.getByLabelText('Application Name'), 'Test Application');
    await user.type(
      screen.getByLabelText('Description'),
      'This is a test application for unit testing'
    );

    // Submit the form
    await user.click(screen.getByText('Create Application'));

    // Should call the create service
    expect(adminService.createApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Application',
        description: 'This is a test application for unit testing',
      })
    );

    // Should refresh the applications list
    expect(adminService.getApplications).toHaveBeenCalledTimes(2);
  });

  it('should validate the form before submission', async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
    });

    // Click the new application button
    await user.click(screen.getByText('New Application'));

    // Submit without filling anything
    await user.click(screen.getByText('Create Application'));

    // Should show validation errors
    expect(screen.getByText('Application name is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();

    // Service should not be called
    expect(adminService.createApplication).not.toHaveBeenCalled();

    // Fill with invalid data (too short description)
    await user.type(screen.getByLabelText('Application Name'), 'Test');
    await user.type(screen.getByLabelText('Description'), 'Too short');

    // Submit again
    await user.click(screen.getByText('Create Application'));

    // Should show description validation error
    expect(screen.getByText('Description must be at least 10 characters')).toBeInTheDocument();

    // Service should still not be called
    expect(adminService.createApplication).not.toHaveBeenCalled();
  });

  it('should open the edit dialog and update an application', async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
    });

    // Find edit button for Salesforce (first application)
    const editButtons = screen.getAllByTitle('Edit');
    await user.click(editButtons[0]);

    // Dialog should be open with application data
    expect(screen.getByText('Edit Application')).toBeInTheDocument();
    expect(screen.getByLabelText('Application Name')).toHaveValue('Salesforce');

    // Modify application
    await user.clear(screen.getByLabelText('Application Name'));
    await user.type(screen.getByLabelText('Application Name'), 'Updated Salesforce');

    // Submit the form
    await user.click(screen.getByText('Save Changes'));

    // Should call the update service
    expect(adminService.updateApplication).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        name: 'Updated Salesforce',
      })
    );

    // Should refresh the applications list
    expect(adminService.getApplications).toHaveBeenCalledTimes(2);
  });

  it('should show the delete confirmation and delete an application', async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
    });

    // Find delete button for Salesforce (first application)
    const deleteButtons = screen.getAllByTitle('Delete');
    await user.click(deleteButtons[0]);

    // Delete confirmation dialog should be open
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete the application/)).toBeInTheDocument();

    // Click delete
    await user.click(screen.getByText('Delete'));

    // Should call the delete service
    expect(adminService.deleteApplication).toHaveBeenCalledWith(1);

    // Should refresh the applications list
    expect(adminService.getApplications).toHaveBeenCalledTimes(2);
  });

  it('should show application usage statistics', async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
    });

    // Find usage stats button for Salesforce
    const statsButtons = screen.getAllByTitle('Usage Stats');
    await user.click(statsButtons[0]);

    // Should show loading state
    expect(screen.getByText('Application Usage Statistics')).toBeInTheDocument();

    // Wait for stats to load
    await waitFor(() => {
      expect(screen.getByText('24')).toBeInTheDocument(); // Total Integrations
    });

    // Check stats are displayed
    expect(screen.getByText('Total Integrations')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument(); // Total
    expect(screen.getByText('18')).toBeInTheDocument(); // Active
    expect(screen.getByText('5')).toBeInTheDocument(); // Tenants

    // Should have activity table
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Integration Created')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();

    // Should call the stats service
    expect(adminService.getApplicationUsageStats).toHaveBeenCalledWith(1);
  });

  it('should handle duplicate application', async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
    });

    // Find duplicate button for Salesforce
    const duplicateButtons = screen.getAllByTitle('Duplicate');
    await user.click(duplicateButtons[0]);

    // Should open dialog with duplicated data
    expect(screen.getByText('Create New Application')).toBeInTheDocument();
    expect(screen.getByLabelText('Application Name')).toHaveValue('Salesforce (Copy)');

    // Submit the form
    await user.click(screen.getByText('Create Application'));

    // Should call the create service with copied data
    expect(adminService.createApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Salesforce (Copy)',
        type: 'api',
        description: 'Salesforce CRM integration',
        status: 'draft', // Should always be draft for new copies
      })
    );
  });

  it('should handle refresh button click', async () => {
    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Wait for applications to load
    await waitFor(() => {
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
    });

    // Clear previous calls
    adminService.getApplications.mockClear();

    // Click refresh button
    fireEvent.click(screen.getByText('Refresh'));

    // Should call the service again
    expect(adminService.getApplications).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors gracefully', async () => {
    // Force the API to fail
    adminService.getApplications.mockRejectedValueOnce(new Error('API Error'));

    render(
      <NotificationProvider>
        <ApplicationsManager />
      </NotificationProvider>
    );

    // Should show loading first
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // After loading fails, should show empty state
    await waitFor(() => {
      expect(screen.getByText('No applications found')).toBeInTheDocument();
    });
  });
});
