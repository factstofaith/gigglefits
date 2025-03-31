import React from 'react';
import { render, screen } from '@testing-library/react';
import IntegrationCreationDialog from '../../components/integration/IntegrationCreationDialog';

// Mock the required services and components
jest.mock('../../services/integrationService', () => ({
  getAvailableSources: jest.fn().mockResolvedValue(['Mock Source']),
  getAvailableDestinations: jest.fn().mockResolvedValue(['Mock Destination']),
  getDatasets: jest.fn().mockResolvedValue([{ id: '1', name: 'Test Dataset' }]),
  createIntegrationFromTemplate: jest
    .fn()
    .mockResolvedValue({ id: '1', name: 'Created Integration' }),
}));

jest.mock('../../services/authService', () => ({
  isAdmin: jest.fn().mockResolvedValue(true),
}));

// Mock the imported components
jest.mock('../../components/integration/AzureBlobConfiguration', () => {
  return function MockAzureBlobConfiguration() {
  // Added display name
  MockAzureBlobConfiguration.displayName = 'MockAzureBlobConfiguration';

    return <div data-testid="azure-blob-configuration">Azure Blob Configuration</div>;
  };
});

jest.mock('../../components/integration/ScheduleConfiguration', () => {
  return function MockScheduleConfiguration() {
  // Added display name
  MockScheduleConfiguration.displayName = 'MockScheduleConfiguration';

    return <div data-testid="schedule-configuration">Schedule Configuration</div>;
  };
});

jest.mock('../../components/integration/NotificationSettings', () => {
  return function MockNotificationSettings() {
  // Added display name
  MockNotificationSettings.displayName = 'MockNotificationSettings';

    return <div data-testid="notification-settings">Notification Settings</div>;
  };
});

jest.mock('../../components/integration/TemplateSelector', () => {
  return function MockTemplateSelector() {
  // Added display name
  MockTemplateSelector.displayName = 'MockTemplateSelector';

    return <div data-testid="template-selector">Template Selector</div>;
  };
});

describe('IntegrationCreationDialog Migration', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onCreate: jest.fn(),
  };

  test('uses legacy design system components instead of Material UI', () => {
    render(<IntegrationCreationDialog {...defaultProps} />);

    // Check for legacy components
    expect(document.querySelector('.ds-button-legacy')).toBeInTheDocument(); // ButtonLegacy
    expect(document.querySelector('.ds-dialog-legacy')).toBeInTheDocument(); // DialogLegacy
    expect(document.querySelector('.ds-select-legacy')).toBeInTheDocument(); // SelectLegacy

    // Check for typography components
    expect(document.querySelector('.ds-typography')).toBeInTheDocument();

    // Check for Box components
    expect(document.querySelector('.ds-box')).toBeInTheDocument();

    // Check for TextField components
    expect(document.querySelector('.ds-text-field')).toBeInTheDocument();

    // Check for Chip components (when datasets are selected)
    // Note: This might not be visible initially without user interaction

    // Verify dialog header and content structure
    expect(document.querySelector('.ds-dialog-title')).toBeInTheDocument();
    expect(document.querySelector('.ds-dialog-content')).toBeInTheDocument();
    expect(document.querySelector('.ds-dialog-actions')).toBeInTheDocument();
  });

  test('does not use Material UI components directly', () => {
    render(<IntegrationCreationDialog {...defaultProps} />);

    // Material UI components should not be present
    expect(document.querySelector('.MuiDialog-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiDialogTitle-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiDialogContent-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiDialogActions-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiButton-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiSelect-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiPaper-root')).not.toBeInTheDocument();

    // Material UI specific classes should not be present in child components
    expect(document.querySelector('.MuiFormControl-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiInputLabel-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiMenuItem-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiFormHelperText-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiCircularProgress-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiDivider-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiStepper-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiStep-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiStepLabel-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiStepContent-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiChip-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiAutocomplete-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiToggleButtonGroup-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiToggleButton-root')).not.toBeInTheDocument();
    expect(document.querySelector('.MuiBadge-root')).not.toBeInTheDocument();
  });
});
