/**
 * TableHeadAdapted component tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import TableHead, { TableHeadCellAdapted } from '../TableHeadAdapted';

describe('TableHeadAdapted', () => {
  it('renders with children', () => {
    render(
      <table>
        <TableHeadAdapted>
          <tr>
            <TableHeadCellAdapted>Column 1</TableHeadCellAdapted>
            <TableHeadCellAdapted>Column 2</TableHeadCellAdapted>
          </tr>
        </TableHeadAdapted>
      </table>
    );
    
    expect(screen.getByText('Column 1')).toBeInTheDocument();
    expect(screen.getByText('Column 2')).toBeInTheDocument();
  });

  it('renders sticky header when stickyHeader is true', () => {
    render(
      <table>
        <TableHeadAdapted stickyHeader={true}>
          <tr>
            <TableHeadCellAdapted>Column 1</TableHeadCellAdapted>
          </tr>
        </TableHeadAdapted>
      </table>
    );
    
    const theadElement = screen.getByRole('rowgroup');
    expect(theadElement).toHaveStyle({ position: 'sticky' });
    expect(theadElement).toHaveStyle({ top: 0 });
    expect(theadElement).toHaveStyle({ zIndex: 2 });
  });
});

describe('TableHeadCellAdapted', () => {
  it('renders with text content', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHeadCellAdapted>Column Header</TableHeadCellAdapted>
          </tr>
        </thead>
      </table>
    );
    
    expect(screen.getByText('Column Header')).toBeInTheDocument();
  });

  it('applies alignment prop', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHeadCellAdapted align="center&quot;>Centered</TableHeadCellAdapted>
          </tr>
        </thead>
      </table>
    );
    
    const cell = screen.getByText("Centered');
    expect(cell.closest('th')).toHaveStyle({ textAlign: 'center' });
  });

  it('calls onSort when clicked with sortable and field props', () => {
    const handleSort = jest.fn();
    
    render(
      <table>
        <thead>
          <tr>
            <TableHeadCellAdapted 
              sortable={true} 
              field="name&quot; 
              onSort={handleSort}
            >
              Name
            </TableHeadCellAdapted>
          </tr>
        </thead>
      </table>
    );
    
    fireEvent.click(screen.getByText("Name'));
    expect(handleSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('toggles sort direction when the sorting column is clicked', () => {
    const handleSort = jest.fn();
    
    render(
      <table>
        <thead>
          <tr>
            <TableHeadCellAdapted 
              sortable={true} 
              field="name&quot; 
              sortBy="name"
              sortDirection="asc&quot;
              onSort={handleSort}
            >
              Name
            </TableHeadCellAdapted>
          </tr>
        </thead>
      </table>
    );
    
    fireEvent.click(screen.getByText("Name'));
    expect(handleSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('has correct aria-sort attribute when sorted', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHeadCellAdapted 
              sortable={true} 
              field="name&quot; 
              sortBy="name"
              sortDirection="asc&quot;
            >
              Name
            </TableHeadCellAdapted>
          </tr>
        </thead>
      </table>
    );
    
    const cell = screen.getByText("Name').closest('th');
    expect(cell).toHaveAttribute('aria-sort', 'ascending');
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <table>
        <TableHeadAdapted ariaLabel="Test table header&quot;>
          <tr>
            <TableHeadCellAdapted>Column 1</TableHeadCellAdapted>
            <TableHeadCellAdapted>Column 2</TableHeadCellAdapted>
          </tr>
        </TableHeadAdapted>
      </table>
    );
    
    await waitFor(() => {
      expect(screen.getByText("Column 1')).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});