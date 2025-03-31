/**
 * TableBodyAdapted component tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import TableBody, { TableBodyRowAdapted, TableBodyCellAdapted } from '../TableBodyAdapted';

// Mock react-window
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemData }) => {
    const items = [];
    for (let i = 0; i < Math.min(itemCount, 3); i++) {
      items.push(children({ index: i, style: {} }));
    }
    return <div data-testid="virtualized-list">{items}</div>;
  }
}));

describe('TableBodyAdapted', () => {
  it('renders with children', () => {
    render(
      <table>
        <TableBodyAdapted>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
        </TableBodyAdapted>
      </table>
    );
    
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
  });

  it('renders with striped rows', () => {
    render(
      <table>
        <TableBodyAdapted striped={true}>
          <TableBodyRowAdapted>
            <TableBodyCellAdapted>Row 1</TableBodyCellAdapted>
          </TableBodyRowAdapted>
          <TableBodyRowAdapted>
            <TableBodyCellAdapted>Row 2</TableBodyCellAdapted>
          </TableBodyRowAdapted>
        </TableBodyAdapted>
      </table>
    );
    
    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.getByText('Row 2')).toBeInTheDocument();
  });

  it('renders with virtualization when virtualized prop is true', () => {
    const testData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
      { id: 4, name: 'Item 4' },
      { id: 5, name: 'Item 5' },
    ];
    
    const renderRow = ({ data }) => (
      <tr>
        <td>{data.name}</td>
      </tr>
    );
    
    render(
      <table>
        <TableBodyAdapted
          virtualized={true}
          data={testData}
          renderRow={renderRow}
          rowHeight={50}
          maxHeight={300}
        />
      </table>
    );
    
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
    // Due to mocking, only the first 3 items are rendered
  });
});

describe('TableBodyRowAdapted', () => {
  it('renders with children', () => {
    render(
      <table>
        <tbody>
          <TableBodyRowAdapted>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </TableBodyRowAdapted>
        </tbody>
      </table>
    );
    
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
  });

  it('applies selected styling when selected prop is true', () => {
    render(
      <table>
        <tbody>
          <TableBodyRowAdapted selected={true}>
            <td>Selected Row</td>
          </TableBodyRowAdapted>
        </tbody>
      </table>
    );
    
    const row = screen.getByText('Selected Row').closest('tr');
    expect(row).toHaveStyle({ backgroundColor: 'var(--action-selected, rgba(0, 0, 0, 0.08))' });
    expect(row).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    
    render(
      <table>
        <tbody>
          <TableBodyRowAdapted onClick={handleClick}>
            <td>Clickable Row</td>
          </TableBodyRowAdapted>
        </tbody>
      </table>
    );
    
    fireEvent.click(screen.getByText('Clickable Row'));
    expect(handleClick).toHaveBeenCalled();
  });
});

describe('TableBodyCellAdapted', () => {
  it('renders with text content', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableBodyCellAdapted>Cell Content</TableBodyCellAdapted>
          </tr>
        </tbody>
      </table>
    );
    
    expect(screen.getByText('Cell Content')).toBeInTheDocument();
  });

  it('applies alignment prop', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableBodyCellAdapted align="right&quot;>Right Aligned</TableBodyCellAdapted>
          </tr>
        </tbody>
      </table>
    );
    
    const cell = screen.getByText("Right Aligned');
    expect(cell.closest('td')).toHaveStyle({ textAlign: 'right' });
  });

  it('applies different padding based on padding prop', () => {
    const { rerender } = render(
      <table>
        <tbody>
          <tr>
            <TableBodyCellAdapted padding="normal&quot;>Normal Padding</TableBodyCellAdapted>
          </tr>
        </tbody>
      </table>
    );
    
    let cell = screen.getByText("Normal Padding').closest('td');
    expect(cell).toHaveStyle({ padding: '16px' });
    
    rerender(
      <table>
        <tbody>
          <tr>
            <TableBodyCellAdapted padding="dense&quot;>Dense Padding</TableBodyCellAdapted>
          </tr>
        </tbody>
      </table>
    );
    
    cell = screen.getByText("Dense Padding').closest('td');
    expect(cell).toHaveStyle({ padding: '6px 16px' });
    
    rerender(
      <table>
        <tbody>
          <tr>
            <TableBodyCellAdapted padding="none&quot;>No Padding</TableBodyCellAdapted>
          </tr>
        </tbody>
      </table>
    );
    
    cell = screen.getByText("No Padding').closest('td');
    expect(cell).toHaveStyle({ padding: '0' });
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <table>
        <TableBodyAdapted ariaLabel="Test table body&quot;>
          <TableBodyRowAdapted>
            <TableBodyCellAdapted>Cell 1</TableBodyCellAdapted>
            <TableBodyCellAdapted>Cell 2</TableBodyCellAdapted>
          </TableBodyRowAdapted>
        </TableBodyAdapted>
      </table>
    );
    
    await waitFor(() => {
      expect(screen.getByText("Cell 1')).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});