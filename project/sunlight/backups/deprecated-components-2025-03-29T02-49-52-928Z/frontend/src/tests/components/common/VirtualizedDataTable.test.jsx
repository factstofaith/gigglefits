// tests/components/common/VirtualizedDataTable.test.jsx

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import VirtualizedDataTable from '@components/common/VirtualizedDataTable';

// Mock react-window and react-virtualized-auto-sizer
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemData }) => {
    const items = [];
    for (let i = 0; i < Math.min(itemCount, 10); i++) {
      items.push(children({ index: i, style: {}, data: itemData }));
    }
    return <div data-testid="virtualized-list">{items}</div>;
  },
}));

jest.mock(
  'react-virtualized-auto-sizer',
  () =>
    ({ children }) =>
      children({ width: 1000, height: 500 })
);

// Sample data for testing
const mockData = Array.from({ length: 100 }, (_, index) => ({
  id: `id-${index}`,
  name: `Item ${index}`,
  status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'inactive' : 'pending',
  date: new Date(2025, 0, index + 1).toISOString(),
  count: index * 10,
}));

const mockColumns = [
  { id: 'name', label: 'Name', width: '30%' },
  {
    id: 'status',
    label: 'Status',
    type: 'chip',
    getChipColor: value =>
      value === 'active' ? 'success' : value === 'inactive' ? 'error' : 'warning',
  },
  { id: 'date', label: 'Date', type: 'date' },
  { id: 'count', label: 'Count', numeric: true },
];

describe('VirtualizedDataTable', () => {
  it('renders with data in non-virtualized mode', () => {
    render(
      <VirtualizedDataTable
        title="Test Table&quot;
        data={mockData.slice(0, 5)}
        columns={mockColumns}
        virtualizationDisabled={true}
      />
    );

    // Check title
    expect(screen.getByText("Test Table')).toBeInTheDocument();

    // Check some data rows
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 4')).toBeInTheDocument();

    // Check column headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
  });

  it('renders with data in virtualized mode', () => {
    render(
      <VirtualizedDataTable
        title="Virtualized Table&quot;
        data={mockData}
        columns={mockColumns}
        virtualizationDisabled={false}
      />
    );

    // Check that the virtualized list is rendered
    const virtualizedList = screen.getByTestId("virtualized-list');
    expect(virtualizedList).toBeInTheDocument();

    // Check for some data in the virtualized rows
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    // Since our mock only renders first 10 items
    expect(screen.getByText('Item 9')).toBeInTheDocument();
    expect(screen.queryByText('Item 50')).not.toBeInTheDocument();
  });

  it('displays empty message when no data', () => {
    render(
      <VirtualizedDataTable
        title="Empty Table&quot;
        data={[]}
        columns={mockColumns}
        emptyMessage="No items found"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('handles row selection', () => {
    const handleSelectionChange = jest.fn();

    render(
      <VirtualizedDataTable
        data={mockData.slice(0, 5)}
        columns={mockColumns}
        enableSelection={true}
        onSelectionChange={handleSelectionChange}
        virtualizationDisabled={true}
      />
    );

    // Find first row checkbox and click it
    const checkboxes = screen.getAllByRole('checkbox');
    // First checkbox is the "select all" in the header
    const firstRowCheckbox = checkboxes[1];

    fireEvent.click(firstRowCheckbox);

    expect(handleSelectionChange).toHaveBeenCalledWith(['id-0']);
  });

  it('handles sorting', () => {
    render(
      <VirtualizedDataTable
        data={mockData.slice(0, 5)}
        columns={mockColumns}
        virtualizationDisabled={true}
      />
    );

    // Find the count column header and click to sort
    const countColumnHeader = screen.getByText('Count');
    fireEvent.click(countColumnHeader);

    // Get all cells in the first column
    const rows = screen.getAllByRole('row');

    // First row is header, then we have data rows
    // In ascending order, "Item 0" should be first with count 0
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText('Item 0')).toBeInTheDocument();

    // Click again to sort in descending order
    fireEvent.click(countColumnHeader);

    // Now "Item 4" should be first with count 40
    const newRows = screen.getAllByRole('row');
    const newFirstDataRow = newRows[1];
    expect(within(newFirstDataRow).getByText('Item 4')).toBeInTheDocument();
  });

  it('handles pagination', () => {
    render(
      <VirtualizedDataTable
        data={mockData}
        columns={mockColumns}
        defaultRowsPerPage={10}
        virtualizationDisabled={true}
      />
    );

    // Check the pagination text shows correct total
    expect(screen.getByText('1–10 of 100')).toBeInTheDocument();

    // Find the next page button
    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    // Pagination should now show next page
    expect(screen.getByText('11–20 of 100')).toBeInTheDocument();
  });

  it('renders custom cell renderers', () => {
    const customColumns = [
      ...mockColumns,
      {
        id: 'custom',
        label: 'Custom',
        render: (value, row) => <span data-testid="custom-cell">Custom {row.name}</span>,
      },
    ];

    const dataWithCustom = mockData.slice(0, 5).map(item => ({
      ...item,
      custom: 'value',
    }));

    render(
      <VirtualizedDataTable
        data={dataWithCustom}
        columns={customColumns}
        virtualizationDisabled={true}
      />
    );

    expect(screen.getByTestId('custom-cell')).toBeInTheDocument();
    expect(screen.getByText('Custom Item 0')).toBeInTheDocument();
  });
});
