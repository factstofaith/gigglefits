import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IntegrationTable from '../../components/integration/IntegrationTable';

// Mock IntegrationTableRow
jest.mock('../../components/integration/IntegrationTableRow', () => {
  return function MockIntegrationTableRow(props) {
  // Added display name
  MockIntegrationTableRow.displayName = 'MockIntegrationTableRow';

    return (
      <tr data-testid={`integration-row-${props.integration.id}`}>{props.integration.name}</tr>
    );
  };
});

describe('IntegrationTable Migration', () => {
  const testIntegrations = [
    {
      id: 'test-1',
      name: 'Test Integration 1',
      type: 'API-based',
      source: 'REST API',
      destination: 'SQL Database',
      schedule: { type: 'daily' },
      health: 'healthy',
      status: 'active',
      lastRun: '2023-03-22T14:30:00Z',
    },
    {
      id: 'test-2',
      name: 'Test Integration 2',
      type: 'File-based',
      source: 'Azure Blob',
      destination: 'REST API',
      schedule: { type: 'weekly' },
      health: 'warning',
      status: 'active',
      lastRun: '2023-03-21T10:15:00Z',
    },
  ];

  const defaultProps = {
    integrations: testIntegrations,
    onFieldMapping: jest.fn(),
    onModify: jest.fn(),
    onViewRunLog: jest.fn(),
  };

  it('renders with legacy design system components', () => {
    render(<IntegrationTable {...defaultProps} />);

    // Check if the search field uses InputFieldLegacy
    const searchField = screen.getByPlaceholderText('Search integrations...');
    expect(searchField.closest('.InputFieldLegacy-root')).toBeInTheDocument();

    // Check if the chips use ChipLegacy
    const allChip = screen.getByText(/All/);
    expect(allChip.closest('.ChipLegacy-root')).toBeInTheDocument();

    // Check if icon buttons use IconButtonLegacy
    const refreshButton = screen.getByTitle('Refresh');
    expect(refreshButton.closest('.IconButtonLegacy-root')).toBeInTheDocument();

    // Check if Paper uses CardLegacy
    const tableContainer = screen.getByRole('table').closest('.CardLegacy-root');
    expect(tableContainer).toBeInTheDocument();
  });

  it('filters integrations based on search term', () => {
    render(<IntegrationTable {...defaultProps} />);

    // Check that both rows are initially rendered
    expect(screen.getByTestId('integration-row-test-1')).toBeInTheDocument();
    expect(screen.getByTestId('integration-row-test-2')).toBeInTheDocument();

    // Enter search term
    const searchField = screen.getByPlaceholderText('Search integrations...');
    fireEvent.change(searchField, { target: { value: 'Azure' } });

    // Should only show the second integration
    expect(screen.queryByTestId('integration-row-test-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('integration-row-test-2')).toBeInTheDocument();
  });

  it('filters integrations by status', () => {
    render(<IntegrationTable {...defaultProps} />);

    // Click on Warnings chip
    const warningsChip = screen.getByText(/Warnings/);
    fireEvent.click(warningsChip);

    // Should only show the second integration with warning status
    expect(screen.queryByTestId('integration-row-test-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('integration-row-test-2')).toBeInTheDocument();
  });
});
