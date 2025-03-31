/**
 * Table Tests
 * 
 * Tests for the Table component.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Table from '../Table';

// Sample data for testing
const sampleColumns = [
  { header: 'ID', accessor: 'id' },
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { 
    header: 'Status', 
    accessor: 'active',
    format: (value) => value ? 'Active' : 'Inactive',
    align: 'center'
  },
];

const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', active: true },
];

describe('Table', () => {
  // Basic rendering tests
  describe('rendering', () => {
    it('renders with columns and data', () => {
      render(<Table columns={sampleColumns} data={sampleData} />);
      
      expect(screen.getByTestId('tap-table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getAllByRole('row')).toHaveLength(4); // Header + 3 data rows
      
      // Check headers
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      
      // Check data
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('renders empty state when data is empty', () => {
      render(<Table columns={sampleColumns} data={[]} emptyState="No users found" />);
      
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('renders loading state', () => {
      render(<Table columns={sampleColumns} data={sampleData} loading loadingText="Loading users..." />);
      
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    it('renders with different size', () => {
      render(<Table columns={sampleColumns} data={sampleData} size="small" />);
      
      expect(screen.getByTestId('tap-table').classList.contains('tap-table--small')).toBe(true);
    });

    it('renders with striped rows', () => {
      render(<Table columns={sampleColumns} data={sampleData} striped />);
      
      expect(screen.getByTestId('tap-table').classList.contains('tap-table--striped')).toBe(true);
    });

    it('renders with borders', () => {
      render(<Table columns={sampleColumns} data={sampleData} bordered />);
      
      expect(screen.getByTestId('tap-table').classList.contains('tap-table--bordered')).toBe(true);
    });

    it('renders with hover effect by default', () => {
      render(<Table columns={sampleColumns} data={sampleData} />);
      
      expect(screen.getByTestId('tap-table').classList.contains('tap-table--hoverable')).toBe(true);
    });

    it('renders without hover effect when hoverable is false', () => {
      render(<Table columns={sampleColumns} data={sampleData} hoverable={false} />);
      
      expect(screen.getByTestId('tap-table').classList.contains('tap-table--hoverable')).toBe(false);
    });

    it('renders with custom className', () => {
      render(<Table columns={sampleColumns} data={sampleData} className="custom-table" />);
      
      expect(screen.getByTestId('tap-table-wrapper').classList.contains('custom-table')).toBe(true);
    });
  });

  // Column variants and formatters
  describe('column options', () => {
    it('applies formatter function to cell values', () => {
      render(<Table columns={sampleColumns} data={sampleData} />);
      
      // Check that the formatter converted the boolean to a string
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('supports function accessors', () => {
      const columnsWithFunctionAccessor = [
        ...sampleColumns.slice(0, 3),
        {
          header: 'Full Info',
          accessor: (row) => `${row.name} (${row.email})`,
        },
      ];
      
      render(<Table columns={columnsWithFunctionAccessor} data={sampleData} />);
      
      expect(screen.getByText('John Doe (john@example.com)')).toBeInTheDocument();
    });

    it('supports column alignment', () => {
      render(<Table columns={sampleColumns} data={sampleData} />);
      
      // Status column has center alignment
      const statusHeaders = screen.getAllByTestId(/tap-table-header-\d+/);
      expect(statusHeaders[3].style.textAlign).toBe('center');
      
      const statusCells = screen.getAllByText(/Active|Inactive/);
      statusCells.forEach(cell => {
        expect(cell.parentElement.style.textAlign).toBe('center');
      });
    });
  });

  // Interaction tests
  describe('interactions', () => {
    it('calls onRowClick when a row is clicked', () => {
      const handleRowClick = jest.fn();
      render(<Table columns={sampleColumns} data={sampleData} onRowClick={handleRowClick} />);
      
      // Click the first data row
      fireEvent.click(screen.getByTestId('tap-table-row-0'));
      expect(handleRowClick).toHaveBeenCalledWith(sampleData[0], 0);
    });

    it('applies hover style when mouse enters a row', () => {
      render(<Table columns={sampleColumns} data={sampleData} />);
      
      const row = screen.getByTestId('tap-table-row-0');
      fireEvent.mouseEnter(row);
      expect(row.style.backgroundColor).toBe('rgb(245, 245, 245)');
      
      fireEvent.mouseLeave(row);
      expect(row.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('does not apply hover style when hoverable is false', () => {
      render(<Table columns={sampleColumns} data={sampleData} hoverable={false} />);
      
      const row = screen.getByTestId('tap-table-row-0');
      fireEvent.mouseEnter(row);
      expect(row.style.backgroundColor).not.toBe('rgb(245, 245, 245)');
    });
  });

  // Ref forwarding
  describe('refs', () => {
    it('forwards ref to DOM table element', () => {
      const ref = React.createRef();
      render(<Table columns={sampleColumns} data={sampleData} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLTableElement);
      expect(ref.current).toBe(screen.getByTestId('tap-table'));
    });
  });
});