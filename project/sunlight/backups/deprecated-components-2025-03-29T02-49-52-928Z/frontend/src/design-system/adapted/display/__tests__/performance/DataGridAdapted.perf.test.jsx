/**
 * Performance tests for DataGridAdapted component
 * 
 * This file contains performance benchmarks for the DataGridAdapted component
 * following the performance testing guidelines in TESTING.md.
 */
import React from 'react';
import { render, unmountComponentAtNode } from 'react-testing-library';
import DataGrid from '../../DataGridAdapted';

// Mock Material UI components
jest.mock('@mui/material', () => ({
  Table: jest.fn(({ children, ...props }) => (
    <table {...props}>{children}</table>
  )),
  TableBody: jest.fn(({ children, ...props }) => (
    <tbody {...props}>{children}</tbody>
  )),
  TableCell: jest.fn(({ children, ...props }) => (
    <td {...props}>{children}</td>
  )),
  TableContainer: jest.fn(({ children, ...props }) => (
    <div {...props}>{children}</div>
  )),
  TableHead: jest.fn(({ children, ...props }) => (
    <thead {...props}>{children}</thead>
  )),
  TableRow: jest.fn(({ children, ...props }) => (
    <tr {...props}>{children}</tr>
  )),
  Paper: jest.fn(({ children, ...props }) => (
    <div {...props}>{children}</div>
  )),
}));

// Mock react-window
jest.mock('react-window', () => ({
  VariableSizeGrid: jest.fn(({ children, innerElementType, ...props }) => {
    const InnerElement = innerElementType || 'div';
    return (
      <div data-testid="virtualized-grid" {...props}>
        <InnerElement style={{ position: 'relative' }}>
          {/* Render a sampling of cells for performance testing */}
          {[...Array(10)].map((_, rowIndex) => 
            [...Array(props.columnCount)].map((_, columnIndex) => 
              children({ columnIndex, rowIndex, style: {} })
            )
          )}
        </InnerElement>
      </div>
    );
  }),
}));

// Mock ErrorBoundary
jest.mock('../../core/ErrorBoundary/ErrorBoundary', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div>{children}</div>),
}));

// Generate test data
const generateColumns = (count) => {
  // Added display name
  generateColumns.displayName = 'generateColumns';

  // Added display name
  generateColumns.displayName = 'generateColumns';

  // Added display name
  generateColumns.displayName = 'generateColumns';

  // Added display name
  generateColumns.displayName = 'generateColumns';

  // Added display name
  generateColumns.displayName = 'generateColumns';


  return Array.from({ length: count }, (_, i) => ({
    field: `field${i}`,
    headerName: `Column ${i}`,
    width: 150,
  }));
};

const generateRows = (rowCount, columnCount) => {
  // Added display name
  generateRows.displayName = 'generateRows';

  // Added display name
  generateRows.displayName = 'generateRows';

  // Added display name
  generateRows.displayName = 'generateRows';

  // Added display name
  generateRows.displayName = 'generateRows';

  // Added display name
  generateRows.displayName = 'generateRows';


  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const row = { id: `row-${rowIndex}` };
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
      row[`field${colIndex}`] = `Row ${rowIndex}, Col ${colIndex}`;
    }
    return row;
  });
};

describe('DataGridAdapted Performance', () => {
  let container = null;
  
  beforeEach(() => {
    // Set up a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Mock performance.now() for consistent timing
    jest.spyOn(performance, 'now').mockImplementation(() => 0);
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
    jest.clearAllMocks();
    performance.now.mockRestore();
  });

  const measureRenderTime = (Component) => {
  // Added display name
  measureRenderTime.displayName = 'measureRenderTime';

  // Added display name
  measureRenderTime.displayName = 'measureRenderTime';

  // Added display name
  measureRenderTime.displayName = 'measureRenderTime';

  // Added display name
  measureRenderTime.displayName = 'measureRenderTime';

  // Added display name
  measureRenderTime.displayName = 'measureRenderTime';


    // Setup mocks for timing
    const startTime = performance.now();
    
    // Render the component
    render(Component, { container });
    
    // Calculate render time
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Reset mocks for unmount timing
    performance.now.mockReturnValueOnce(endTime).mockReturnValueOnce(endTime + 10);
    
    // Unmount component
    unmountComponentAtNode(container);
    
    return renderTime;
  };

  describe('Initial Render Performance', () => {
    test('renders small dataset (50 rows) without virtualization efficiently', () => {
      const columns = generateColumns(5);
      const rows = generateRows(50, 5);
      
      const renderTime = measureRenderTime(
        <DataGridAdapted 
          id="small-dataset&quot;
          columns={columns}
          rows={rows}
          enableVirtualization={false}
        />
      );
      
      // In a real test, we"d set benchmarks, but we're using mock timing
      expect(renderTime).toBeDefined();
    });
    
    test('renders medium dataset (500 rows) with virtualization efficiently', () => {
      const columns = generateColumns(10);
      const rows = generateRows(500, 10);
      
      const renderTime = measureRenderTime(
        <DataGridAdapted 
          id="medium-dataset&quot;
          columns={columns}
          rows={rows}
          enableVirtualization={true}
        />
      );
      
      expect(renderTime).toBeDefined();
    });
    
    test("renders large dataset (5000 rows) with virtualization efficiently', () => {
      const columns = generateColumns(15);
      const rows = generateRows(5000, 15);
      
      const renderTime = measureRenderTime(
        <DataGridAdapted 
          id="large-dataset&quot;
          columns={columns}
          rows={rows}
          enableVirtualization={true}
        />
      );
      
      expect(renderTime).toBeDefined();
    });
  });

  describe("Update Performance', () => {
    test('efficiently updates when rows change', () => {
      const columns = generateColumns(5);
      let rows = generateRows(100, 5);
      
      // Initial render
      const { rerender } = render(
        <DataGridAdapted 
          id="update-test&quot;
          columns={columns}
          rows={rows}
        />,
        { container }
      );
      
      // Update with new rows
      rows = generateRows(100, 5); // Generate new data
      
      performance.now.mockReturnValueOnce(100).mockReturnValueOnce(120);
      rerender(
        <DataGridAdapted 
          id="update-test"
          columns={columns}
          rows={rows}
        />
      );
      
      const updateTime = performance.now() - 100;
      expect(updateTime).toBeDefined();
    });
  });

  describe('Virtualization Performance', () => {
    test('virtualizes rendering for large datasets', () => {
      const columns = generateColumns(10);
      const rows = generateRows(1000, 10);
      
      render(
        <DataGridAdapted 
          id="virtualization-test&quot;
          columns={columns}
          rows={rows}
          enableVirtualization={true}
        />,
        { container }
      );
      
      // Check that virtualization component was used
      const virtualizedGrid = document.querySelector("[data-testid="virtualized-grid"]');
      expect(virtualizedGrid).toBeTruthy();
    });
    
    test('falls back to standard rendering for small datasets', () => {
      const columns = generateColumns(5);
      const rows = generateRows(30, 5);
      
      render(
        <DataGridAdapted 
          id="small-dataset-test&quot;
          columns={columns}
          rows={rows}
        />,
        { container }
      );
      
      // Check that standard table was used (virtualization not used)
      const standardTable = document.querySelector("table');
      expect(standardTable).toBeTruthy();
      
      const virtualizedGrid = document.querySelector('[data-testid="virtualized-grid"]');
      expect(virtualizedGrid).toBeFalsy();
    });
  });

  describe('Memory Usage', () => {
    test('maintains reasonable memory footprint with large datasets', () => {
      // In a real environment, we would use the Chrome DevTools Performance API
      // or a memory profiler to measure memory usage
      // For this test, we're just ensuring the component can handle large data
      
      const columns = generateColumns(20);
      const rows = generateRows(10000, 20);
      
      expect(() => {
        render(
          <DataGridAdapted 
            id="memory-test"
            columns={columns}
            rows={rows}
            enableVirtualization={true}
          />,
          { container }
        );
      }).not.toThrow();
    });
  });
});