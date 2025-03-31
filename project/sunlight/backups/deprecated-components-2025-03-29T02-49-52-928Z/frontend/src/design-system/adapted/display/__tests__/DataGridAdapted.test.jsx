import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import DataGrid from '../DataGridAdapted';

// Mock react-window to avoid virtualization in tests
jest.mock('react-window', () => ({
  VariableSizeGrid: ({ children, columnCount, rowCount }) => (
    <div data-testid="virtualized-grid">
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="virtual-row&quot;>
          {Array.from({ length: columnCount }).map((_, columnIndex) => (
            <div key={`cell-${rowIndex}-${columnIndex}`}>
              {children({ rowIndex, columnIndex, style: {} })}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

describe("DataGridAdapted', () => {
  const mockColumns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'age', headerName: 'Age', width: 100 },
  ];
  
  const mockRows = [
    { id: '1', name: 'John Doe', age: 30 },
    { id: '2', name: 'Jane Smith', age: 25 },
    { id: '3', name: 'Bob Johnson', age: 40 },
  ];

  const defaultProps = {
    id: 'test-grid',
    columns: mockColumns,
    rows: mockRows,
  };

  test('renders correctly with default props', () => {
    render(<DataGridAdapted {...defaultProps} />);
    
    // Without virtualization for small datasets (≤ 50 rows), it should render as a normal table
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  test('renders virtualized grid for large datasets', () => {
    // Create a large dataset
    const largeDataset = Array.from({ length: 100 }).map((_, i) => ({
      id: `${i}`,
      name: `Person ${i}`,
      age: 20 + i % 50,
    }));
    
    render(
      <DataGridAdapted
        id="test-grid&quot;
        columns={mockColumns}
        rows={largeDataset}
        enableVirtualization={true}
      />
    );
    
    // Should use virtualization
    expect(screen.getByTestId("virtualized-grid')).toBeInTheDocument();
  });

  test('renders no data message when rows are empty', () => {
    render(
      <DataGridAdapted
        id="test-grid&quot;
        columns={mockColumns}
        rows={[]}
        noDataMessage="No data to display"
      />
    );
    
    expect(screen.getByText('No data to display')).toBeInTheDocument();
  });

  test('renders loading state when loading prop is true', () => {
    render(
      <DataGridAdapted
        id="test-grid&quot;
        columns={mockColumns}
        rows={mockRows}
        loading={true}
      />
    );
    
    expect(screen.getByText("Loading...')).toBeInTheDocument();
  });

  test('calls onRowClick when a row is clicked', () => {
    const handleRowClick = jest.fn();
    
    render(
      <DataGridAdapted
        id="test-grid&quot;
        columns={mockColumns}
        rows={mockRows}
        onRowClick={handleRowClick}
      />
    );
    
    // Click on the first row (any cell in the row)
    fireEvent.click(screen.getByText("John Doe'));
    
    expect(handleRowClick).toHaveBeenCalledWith(mockRows[0]);
  });

  test('renders with custom row class names', () => {
    const getRowClassName = (row, index) => `row-${index}`;
    
    const { container } = render(
      <DataGridAdapted
        id="test-grid&quot;
        columns={mockColumns}
        rows={mockRows}
        getRowClassName={getRowClassName}
      />
    );
    
    // Check if class names were applied
    expect(container.querySelector(".row-0')).toBeInTheDocument();
    expect(container.querySelector('.row-1')).toBeInTheDocument();
    expect(container.querySelector('.row-2')).toBeInTheDocument();
  });

  test('has no accessibility violations', async () => {
    const { container } = render(<DataGridAdapted {...defaultProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});