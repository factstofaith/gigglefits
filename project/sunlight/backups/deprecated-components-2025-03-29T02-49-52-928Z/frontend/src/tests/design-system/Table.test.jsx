import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import { checkA11y } from '../utils/a11y-utils';
import { MockThemeProvider } from '../components/common/MockThemeProvider';
import Table, { TableHead, TableBody, TableRow, TableCell, TableContainer } from '@design-system/components/display/Table';

/**
 * Table component test suite
 */
describe('Table Component', () => {
  // Test basic rendering
  it('renders table correctly', () => {
    render(
      <MockThemeProvider>
        <Table data-testid="table">
          <TableHead>
            <TableRow>
              <TableCell>Header 1</TableCell>
              <TableCell>Header 2</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
              <TableCell>Cell 2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Cell 3</TableCell>
              <TableCell>Cell 4</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Header 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 3')).toBeInTheDocument();
    expect(screen.getByText('Cell 4')).toBeInTheDocument();
  });

  // Test TableHead
  it('renders TableHead with proper styles', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableHead data-testid="table-head">
            <TableRow>
              <TableCell>Header 1</TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </MockThemeProvider>
    );
    
    const tableHead = screen.getByTestId('table-head');
    expect(tableHead).toBeInTheDocument();
    expect(tableHead.tagName).toBe('THEAD');
    expect(tableHead.style.display).toBe('table-header-group');
    expect(tableHead.style.borderBottom).toBeTruthy();
    expect(tableHead.style.fontWeight).toBeTruthy();
  });

  // Test TableBody
  it('renders TableBody correctly', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableBody data-testid="table-body">
            <TableRow>
              <TableCell>Cell 1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const tableBody = screen.getByTestId('table-body');
    expect(tableBody).toBeInTheDocument();
    expect(tableBody.tagName).toBe('TBODY');
    expect(tableBody.style.display).toBe('table-row-group');
  });

  // Test TableRow
  it('renders TableRow correctly', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableBody>
            <TableRow data-testid="table-row">
              <TableCell>Cell 1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const tableRow = screen.getByTestId('table-row');
    expect(tableRow).toBeInTheDocument();
    expect(tableRow.tagName).toBe('TR');
    expect(tableRow.style.display).toBe('table-row');
  });

  // Test TableCell
  it('renders TableCell correctly', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell data-testid="table-cell">Cell 1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const tableCell = screen.getByTestId('table-cell');
    expect(tableCell).toBeInTheDocument();
    expect(tableCell.tagName).toBe('TD');
    expect(tableCell.style.display).toBe('table-cell');
    expect(tableCell.style.borderBottom).toBeTruthy();
  });

  // Test TableContainer
  it('renders TableContainer correctly', () => {
    render(
      <MockThemeProvider>
        <TableContainer data-testid="table-container">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Cell 1</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </MockThemeProvider>
    );
    
    const tableContainer = screen.getByTestId('table-container');
    expect(tableContainer).toBeInTheDocument();
    expect(tableContainer.style.width).toBe('100%');
    expect(tableContainer.style.overflowX).toBe('auto');
  });

  // Test TableContainer with maxHeight
  it('supports maxHeight in TableContainer', () => {
    render(
      <MockThemeProvider>
        <TableContainer maxHeight={200} data-testid="table-container">
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Cell 1</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </MockThemeProvider>
    );
    
    const tableContainer = screen.getByTestId('table-container');
    expect(tableContainer.style.maxHeight).toBe('200px');
    expect(tableContainer.style.overflowY).toBe('auto');
  });

  // Test cell variants (head vs body)
  it('renders different cell variants correctly', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell variant="head&quot; data-testid="head-cell">Header</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell variant="body&quot; data-testid="body-cell">Body</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const headCell = screen.getByTestId('head-cell');
    const bodyCell = screen.getByTestId('body-cell');
    
    // Head cell should be a th element
    expect(headCell.tagName).toBe('TH');
    expect(headCell).toHaveAttribute('scope', 'col');
    
    // Body cell should be a td element
    expect(bodyCell.tagName).toBe('TD');
    expect(bodyCell).not.toHaveAttribute('scope');
    
    // Font weight should be different
    expect(headCell.style.fontWeight).not.toBe(bodyCell.style.fontWeight);
  });

  // Test cell alignment
  it('supports different cell alignments', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell align="left&quot; data-testid="left-cell">Left</TableCell>
              <TableCell align="center&quot; data-testid="center-cell">Center</TableCell>
              <TableCell align="right&quot; data-testid="right-cell">Right</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('left-cell').style.textAlign).toBe('left');
    expect(screen.getByTestId('center-cell').style.textAlign).toBe('center');
    expect(screen.getByTestId('right-cell').style.textAlign).toBe('right');
  });

  // Test cell padding options
  it('supports different cell padding options', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell padding="normal&quot; data-testid="normal-cell">Normal</TableCell>
              <TableCell padding="dense&quot; data-testid="dense-cell">Dense</TableCell>
              <TableCell padding="none&quot; data-testid="none-cell">None</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const normalCell = screen.getByTestId('normal-cell');
    const denseCell = screen.getByTestId('dense-cell');
    const noneCell = screen.getByTestId('none-cell');
    
    // Each cell should have different padding
    expect(normalCell.style.padding).not.toBe(denseCell.style.padding);
    expect(denseCell.style.padding).not.toBe(noneCell.style.padding);
    expect(noneCell.style.padding).toBe('0 0');
  });

  // Test cell with colSpan
  it('supports colSpan in cells', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} data-testid="spanning-cell">Spanning Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('spanning-cell')).toHaveAttribute('colspan', '2');
  });

  // Test cell width properties
  it('supports width properties in cells', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell width={100} data-testid="width-cell">Width Cell</TableCell>
              <TableCell minWidth={50} data-testid="min-width-cell">Min Width Cell</TableCell>
              <TableCell maxWidth={200} data-testid="max-width-cell">Max Width Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    expect(screen.getByTestId('width-cell').style.width).toBe('100px');
    expect(screen.getByTestId('min-width-cell').style.minWidth).toBe('50px');
    expect(screen.getByTestId('max-width-cell').style.maxWidth).toBe('200px');
  });

  // Test table sizes
  it('renders different table sizes', () => {
    const { rerender } = render(
      <MockThemeProvider>
        <Table size="medium&quot; data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    // Default/medium size
    let table = screen.getByTestId('table');
    const mediumStyling = table.style.cssText;
    
    // Small size
    rerender(
      <MockThemeProvider>
        <Table size="small&quot; data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    table = screen.getByTestId('table');
    const smallStyling = table.style.cssText;
    
    // Should have different styles
    expect(mediumStyling).not.toBe(smallStyling);
  });

  // Test sticky header
  it('applies sticky header properly', () => {
    render(
      <MockThemeProvider>
        <Table stickyHeader data-testid="table">
          <TableHead>
            <TableRow>
              <TableCell data-testid="header-cell">Header</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const table = screen.getByTestId('table');
    const headerCell = screen.getByTestId('header-cell');
    
    // Table should have special sticky styling applied
    expect(table.style.cssText).toContain('sticky');
    expect(headerCell.style.position).toBe('sticky');
    expect(headerCell.style.top).toBe('0px');
    expect(headerCell.style.zIndex).toBe('2');
  });

  // Test striped rows
  it('renders striped rows correctly', () => {
    render(
      <MockThemeProvider>
        <Table striped data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell>Row 1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Row 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const table = screen.getByTestId('table');
    
    // Table should have stripe styling
    expect(table.style.cssText).toContain('nth-of-type');
  });

  // Test borderless table
  it('renders borderless table correctly', () => {
    render(
      <MockThemeProvider>
        <Table borderless data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const table = screen.getByTestId('table');
    const cell = screen.getByTestId('cell');
    
    // Table should have borderless styling
    expect(table.style.cssText).toContain('none');
    expect(cell.style.borderBottom).toBe('none');
  });

  // Test compact table
  it('renders compact table correctly', () => {
    render(
      <MockThemeProvider>
        <Table compact data-testid="table">
          <TableBody>
            <TableRow>
              <TableCell data-testid="cell">Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const table = screen.getByTestId('table');
    
    // Table should have compact styling
    expect(table.style.cssText).toContain('padding');
  });

  // Test selected row
  it('highlights selected row', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableBody>
            <TableRow data-testid="regular-row">
              <TableCell>Regular Row</TableCell>
            </TableRow>
            <TableRow selected data-testid="selected-row">
              <TableCell>Selected Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const regularRow = screen.getByTestId('regular-row');
    const selectedRow = screen.getByTestId('selected-row');
    
    // Selected row should have background color
    expect(selectedRow.style.backgroundColor).not.toBe(regularRow.style.backgroundColor);
    expect(selectedRow.style.backgroundColor).toBe(mockTheme.colors.action.selected);
  });

  // Test row with hover effect
  it('applies hover effect to rows', () => {
    render(
      <MockThemeProvider>
        <Table>
          <TableBody>
            <TableRow hover data-testid="hover-row">
              <TableCell>Hover Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const hoverRow = screen.getByTestId('hover-row');
    
    // Hover row should have hover styling
    expect(hoverRow.style.cssText).toContain('hover');
  });

  // Test row click handler
  it('handles row clicks', async () => {
    const user = setupUserEvent();
    const handleRowClick = jest.fn();
    
    render(
      <MockThemeProvider>
        <Table>
          <TableBody>
            <TableRow onClick={handleRowClick} data-testid="clickable-row">
              <TableCell>Clickable Row</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const clickableRow = screen.getByTestId('clickable-row');
    
    // Row should be clickable (have cursor pointer)
    expect(clickableRow.style.cursor).toBe('pointer');
    
    // Click should trigger handler
    await user.click(clickableRow);
    expect(handleRowClick).toHaveBeenCalledTimes(1);
  });

  // Test ref forwarding
  it('forwards refs correctly', () => {
    const tableRef = React.createRef();
    const headRef = React.createRef();
    const bodyRef = React.createRef();
    const rowRef = React.createRef();
    const cellRef = React.createRef();
    const containerRef = React.createRef();
    
    render(
      <MockThemeProvider>
        <TableContainer ref={containerRef} data-testid="container">
          <Table ref={tableRef} data-testid="table">
            <TableHead ref={headRef} data-testid="head">
              <TableRow>
                <TableCell>Header</TableCell>
              </TableRow>
            </TableHead>
            <TableBody ref={bodyRef} data-testid="body">
              <TableRow ref={rowRef} data-testid="row">
                <TableCell ref={cellRef} data-testid="cell">Cell</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </MockThemeProvider>
    );
    
    expect(tableRef.current).toBe(screen.getByTestId('table'));
    expect(headRef.current).toBe(screen.getByTestId('head'));
    expect(bodyRef.current).toBe(screen.getByTestId('body'));
    expect(rowRef.current).toBe(screen.getByTestId('row'));
    expect(cellRef.current).toBe(screen.getByTestId('cell'));
    expect(containerRef.current).toBe(screen.getByTestId('container'));
  });

  // Test accessibility
  it('has no accessibility violations', async () => {
    const { container } = render(
      <MockThemeProvider>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Header 1</TableCell>
              <TableCell>Header 2</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Cell 1</TableCell>
              <TableCell>Cell 2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Cell 3</TableCell>
              <TableCell>Cell 4</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </MockThemeProvider>
    );
    
    const results = await checkA11y(container);
    expect(results).toHaveNoViolations();
  });
});

// Mock theme for style testing
const mockTheme = {
  colors: {
    action: {
      selected: 'rgba(0, 0, 0, 0.08)'
    }
  }
};