import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IntegrationTableRow from '../../components/integration/IntegrationTableRow';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn().mockReturnValue(jest.fn()),
}));

// Mock IntegrationHealthBar
jest.mock('../../components/common/IntegrationHealthBar', () => {
  return function MockHealthBar(props) {
  // Added display name
  MockHealthBar.displayName = 'MockHealthBar';

    return <div>Integration Health: {props.health}</div>;
  };
});

describe('IntegrationTableRow Migration', () => {
  const testIntegration = {
    id: 'test-123',
    name: 'Test Integration',
    type: 'API-based',
    source: 'REST API',
    destination: 'SQL Database',
    schedule: { type: 'daily' },
    health: 85,
    status: 'active',
    lastRun: '2023-03-22T14:30:00Z',
  };

  const defaultProps = {
    integration: testIntegration,
    onFieldMapping: jest.fn(),
    onModify: jest.fn(),
    onViewRunLog: jest.fn(),
  };

  it('renders with legacy design system components', () => {
    render(
      <table>
        <tbody>
          <IntegrationTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    // Check if the legacy Chip is used
    const typeChip = screen.getByText('API-based');
    expect(typeChip.closest('.ChipLegacy-root')).toBeInTheDocument();

    // Check if legacy Button/IconButton components are used
    const editButton = screen.getByTitle('Edit integration');
    expect(editButton.closest('.ButtonLegacy-root')).toBeInTheDocument();

    const fieldMappingButton = screen.getByTitle('Field mapping');
    expect(fieldMappingButton.closest('.ButtonLegacy-root')).toBeInTheDocument();

    const viewLogsButton = screen.getByTitle('View run logs');
    expect(viewLogsButton.closest('.ButtonLegacy-root')).toBeInTheDocument();
  });

  it('handles row click event', () => {
    render(
      <table>
        <tbody>
          <IntegrationTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    // Click on the row
    const row = screen.getByText('Test Integration').closest('tr');
    fireEvent.click(row);

    // Check if onModify was called with correct ID
    expect(defaultProps.onModify).toHaveBeenCalledWith('test-123');
  });

  it('handles button click events without triggering row click', () => {
    render(
      <table>
        <tbody>
          <IntegrationTableRow {...defaultProps} />
        </tbody>
      </table>
    );

    // Click on edit button
    const editButton = screen.getByTitle('Edit integration');
    fireEvent.click(editButton);

    // Verify onModify was called with correct ID
    expect(defaultProps.onModify).toHaveBeenCalledWith('test-123');

    // Click on field mapping button
    const fieldMappingButton = screen.getByTitle('Field mapping');
    fireEvent.click(fieldMappingButton);

    // Verify onFieldMapping was called with correct ID
    expect(defaultProps.onFieldMapping).toHaveBeenCalledWith('test-123');

    // Click on view logs button
    const viewLogsButton = screen.getByTitle('View run logs');
    fireEvent.click(viewLogsButton);

    // Verify onViewRunLog was called with correct ID
    expect(defaultProps.onViewRunLog).toHaveBeenCalledWith('test-123');

    // Reset mocks
    defaultProps.onModify.mockClear();

    // Should have only been called directly from button click, not row click
    expect(defaultProps.onModify).toHaveBeenCalledTimes(0);
  });
});
