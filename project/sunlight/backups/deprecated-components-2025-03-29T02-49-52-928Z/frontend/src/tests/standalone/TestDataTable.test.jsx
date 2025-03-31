// TestDataTable.test.jsx
// Independent test file for DataTable that doesn't rely on any external dependencies

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import standalone component (not the real one)
import TestDataTable from './TestDataTable';

// Sample test data
const sampleData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    createdAt: '2025-01-15T09:30:00',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    createdAt: '2025-02-20T14:45:00',
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Editor',
    createdAt: '2025-03-10T11:15:00',
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'User',
    createdAt: '2025-04-05T16:30:00',
  },
  {
    id: 5,
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    role: 'Admin',
    createdAt: '2025-05-12T08:20:00',
  },
];

// Sample columns configuration
const columns = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email', sortable: false },
  {
    id: 'role',
    label: 'Role',
    type: 'chip',
    getChipColor: value => (value === 'Admin' ? 'primary' : 'default'),
  },
  { id: 'createdAt', label: 'Created', type: 'date' },
];

// Test suite
describe('DataTable Component', () => {
  // Basic rendering tests
  it('renders a data table with title and data', () => {
    render(<TestDataTable title="Users&quot; data={sampleData} columns={columns} />);

    // Title should be rendered
    expect(screen.getByTestId("data-table-title')).toHaveTextContent('Users');

    // Table should be rendered
    expect(screen.getByTestId('data-table-table')).toBeInTheDocument();

    // Headers should be rendered
    expect(screen.getByTestId('column-header-name')).toHaveTextContent('Name');
    expect(screen.getByTestId('column-header-email')).toHaveTextContent('Email');

    // Rows should be rendered (default is 10 rows per page)
    expect(screen.getByTestId('table-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('table-row-2')).toBeInTheDocument();

    // Pagination should be rendered
    expect(screen.getByTestId('data-table-pagination')).toBeInTheDocument();
  });

  it('renders an empty message when no data is provided', () => {
    render(
      <TestDataTable title="Users&quot; data={[]} columns={columns} emptyMessage="No users found" />
    );

    expect(screen.getByTestId('empty-message')).toHaveTextContent('No users found');
  });

  // Sorting tests
  it('sorts data when column header is clicked', () => {
    render(<TestDataTable title="Users&quot; data={sampleData} columns={columns} />);

    // Initially, the data should be in the original order
    const rows = screen.getAllByTestId(/^table-row-/);
    expect(rows[0]).toHaveAttribute("data-testid', 'table-row-1');
    expect(rows[1]).toHaveAttribute('data-testid', 'table-row-2');

    // Click the Name column to sort
    fireEvent.click(screen.getByTestId('sort-button-name'));

    // Check if the data is sorted alphabetically by name
    const sortedRows = screen.getAllByTestId(/^table-row-/);
    expect(sortedRows[0]).toHaveAttribute('data-testid', 'table-row-4'); // Alice

    // Click again to reverse sort
    fireEvent.click(screen.getByTestId('sort-button-name'));

    // Check if the data is sorted in reverse
    const reverseSortedRows = screen.getAllByTestId(/^table-row-/);
    expect(reverseSortedRows[0]).not.toHaveAttribute('data-testid', 'table-row-4');
  });

  it('does not allow sorting for columns with sortable=false', () => {
    render(<TestDataTable title="Users&quot; data={sampleData} columns={columns} />);

    // The Email column should not have a sort button
    expect(screen.queryByTestId("sort-button-email')).not.toBeInTheDocument();
  });

  // Selection tests
  it('enables row selection when enableSelection is true', () => {
    render(
      <TestDataTable title="Users&quot; data={sampleData} columns={columns} enableSelection={true} />
    );

    // Select all checkbox should be rendered
    expect(screen.getByTestId("select-all-checkbox')).toBeInTheDocument();

    // Row checkboxes should be rendered
    expect(screen.getByTestId('row-checkbox-1')).toBeInTheDocument();
  });

  it('selects a row when checkbox is clicked', () => {
    render(
      <TestDataTable title="Users&quot; data={sampleData} columns={columns} enableSelection={true} />
    );

    // Initially, no rows should be selected
    expect(screen.getByTestId("table-row-1')).toHaveAttribute('data-selected', 'false');

    // Click the checkbox for row 1
    fireEvent.click(screen.getByTestId('row-checkbox-1'));

    // Row 1 should now be selected
    expect(screen.getByTestId('table-row-1')).toHaveAttribute('data-selected', 'true');
  });

  it('selects all rows when select all checkbox is clicked', () => {
    render(
      <TestDataTable title="Users&quot; data={sampleData} columns={columns} enableSelection={true} />
    );

    // Initially, no rows should be selected
    expect(screen.getByTestId("table-row-1')).toHaveAttribute('data-selected', 'false');
    expect(screen.getByTestId('table-row-2')).toHaveAttribute('data-selected', 'false');

    // Click the select all checkbox
    fireEvent.click(screen.getByTestId('select-all-checkbox'));

    // All rows should now be selected
    expect(screen.getByTestId('table-row-1')).toHaveAttribute('data-selected', 'true');
    expect(screen.getByTestId('table-row-2')).toHaveAttribute('data-selected', 'true');
  });

  // Row click tests
  it('calls onRowClick when a row is clicked', () => {
    const handleRowClick = jest.fn();
    render(
      <TestDataTable
        title="Users&quot;
        data={sampleData}
        columns={columns}
        onRowClick={handleRowClick}
      />
    );

    // Click row 1
    fireEvent.click(screen.getByTestId("table-row-1'));

    // onRowClick should be called with the row ID
    expect(handleRowClick).toHaveBeenCalledWith(1);
  });

  // Pagination tests
  it('changes page when pagination controls are clicked', () => {
    // Create more data to enable pagination
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? 'Admin' : 'User',
      createdAt: new Date().toISOString(),
    }));

    render(
      <TestDataTable title="Users&quot; data={manyRows} columns={columns} defaultRowsPerPage={10} />
    );

    // Initially, rows 1-10 should be visible
    expect(screen.getByTestId("table-row-1')).toBeInTheDocument();
    expect(screen.queryByTestId('table-row-11')).not.toBeInTheDocument();

    // Click the next page button
    fireEvent.click(screen.getByTestId('next-page-button'));

    // Now rows 11-20 should be visible
    expect(screen.queryByTestId('table-row-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('table-row-11')).toBeInTheDocument();
  });

  it('changes rows per page when select is changed', () => {
    // Create more data to see the effect
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? 'Admin' : 'User',
      createdAt: new Date().toISOString(),
    }));

    render(
      <TestDataTable title="Users&quot; data={manyRows} columns={columns} defaultRowsPerPage={10} />
    );

    // Change rows per page to 25
    fireEvent.change(screen.getByTestId("rows-per-page-select'), { target: { value: '25' } });

    // Now all 25 rows should be visible
    expect(screen.getByTestId('table-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('table-row-25')).toBeInTheDocument();
  });

  // Cell rendering tests
  it('renders different cell types correctly', () => {
    render(<TestDataTable title="Users&quot; data={sampleData} columns={columns} />);

    // Check role chip rendering
    const adminCell = screen.getByTestId("cell-1-role');
    const userCell = screen.getByTestId('cell-2-role');

    expect(adminCell).toHaveTextContent('Admin');
    expect(userCell).toHaveTextContent('User');

    // Check date formatting
    const dateCell = screen.getByTestId('cell-1-createdAt');
    expect(dateCell).toHaveTextContent(new Date('2025-01-15').toLocaleDateString());
  });

  // Actions tests
  it('shows delete button when rows are selected', () => {
    const handleDelete = jest.fn();
    render(
      <TestDataTable
        title="Users&quot;
        data={sampleData}
        columns={columns}
        enableSelection={true}
        onDeleteSelected={handleDelete}
      />
    );

    // Initially, delete button should not be visible
    expect(screen.queryByTestId("delete-selected-button')).not.toBeInTheDocument();

    // Select a row
    fireEvent.click(screen.getByTestId('row-checkbox-1'));

    // Delete button should now be visible
    expect(screen.getByTestId('delete-selected-button')).toBeInTheDocument();

    // Click the delete button
    fireEvent.click(screen.getByTestId('delete-selected-button'));

    // onDeleteSelected should be called
    expect(handleDelete).toHaveBeenCalled();
  });

  it('renders custom actions in the toolbar', () => {
    render(
      <TestDataTable
        title="Users&quot;
        data={sampleData}
        columns={columns}
        actions={<button data-testid="custom-action">Add User</button>}
      />
    );

    // Custom action should be visible
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });
});
