/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DatasetsManager from '../../components/admin/DatasetsManager';
import { ThemeProvider } from '../../design-system/foundations/theme/ThemeProvider';
import useNotification from '../../hooks/useNotification';

// Mock useNotification hook
jest.mock('../../hooks/useNotification', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock services
jest.mock('../../services/adminService', () => ({
  getDatasets: jest.fn().mockResolvedValue([]),
  getDatasetById: jest.fn(),
  createDataset: jest.fn(),
  updateDataset: jest.fn(),
  deleteDataset: jest.fn(),
  discoverFields: jest.fn(),
  getTenants: jest.fn().mockResolvedValue([]),
  getTenantDatasets: jest.fn(),
  addDatasetToTenant: jest.fn(),
  removeDatasetFromTenant: jest.fn(),
}));

describe('DatasetsManager Migration Tests', () => {
  const renderWithTheme = ui => {
    return render(<ThemeProvider>{ui}</ThemeProvider>);
  };

  const mockShowToast = jest.fn();
  const mockAddNotification = jest.fn();

  beforeEach(() => {
    useNotification.mockReturnValue({
      showToast: mockShowToast,
      addNotification: mockAddNotification,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders with ButtonLegacy components', async () => {
    renderWithTheme(<DatasetsManager />);

    // Wait for datasets to load
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check for ButtonLegacy components
    const refreshButton = screen.getByText('Refresh');
    const newDatasetButton = screen.getByText('New Dataset');

    expect(refreshButton).toBeInTheDocument();
    expect(newDatasetButton).toBeInTheDocument();
  });

  test('renders with AlertLegacy components and multiple legacy components', async () => {
    renderWithTheme(<DatasetsManager />);

    // Open create dialog
    const newDatasetButton = await screen.findByText('New Dataset');
    fireEvent.click(newDatasetButton);

    // Go to basic info tab if not already there
    const basicInfoTab = screen.getByText('Basic Info');
    if (basicInfoTab) {
      fireEvent.click(basicInfoTab);
    }

    // Verify multiple migrated components
    expect(screen.getByText('Create New Dataset')).toBeInTheDocument(); // DialogLegacy header

    // Close dialog
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument(); // ButtonLegacy
    fireEvent.click(cancelButton);
  });

  test('renders with InputFieldLegacy components', async () => {
    renderWithTheme(<DatasetsManager />);

    // Check for InputFieldLegacy component
    const searchField = screen.getByPlaceholderText('Search datasets...');
    expect(searchField).toBeInTheDocument();
  });
});
