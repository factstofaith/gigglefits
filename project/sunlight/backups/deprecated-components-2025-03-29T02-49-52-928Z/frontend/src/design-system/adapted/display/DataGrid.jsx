/**
 * @component DataGrid
 * @description A high-performance data grid with virtualization for large datasets and accessibility features.
 * @typedef {import('../../types/complex-components').DataGridAdaptedProps<TData>} DataGridAdaptedProps
 * @template TData
 * @type {React.ForwardRefExoticComponent<DataGridAdaptedProps<TData> & React.RefAttributes<HTMLDivElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
;
;
;
;
;
;
;;
import { VariableSizeGrid as Grid } from 'react-window';
import { getAriaAttributes } from '@utils/accessibilityUtils';
import ErrorBoundary from '../core/ErrorBoundary/ErrorBoundary';
import { Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '../../design-system';
// Design system import already exists;
;

// Inner element for the virtualized grid
const innerElementType = React.forwardRef(({ children, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    style={{
      ...rest.style,
      width: '100%',
      display: 'table',
      borderCollapse: 'collapse',
    }}
  >
    {children}
  </div>
));

innerElementType.displayName = 'GridInnerElement';

/**
 * Virtualized data grid component with accessibility features
 */
const DataGrid = React.memo(React.forwardRef((props, ref) => {
  // Destructure props
  const {
    // Required props
    id,
    columns = [],
    rows = [],
    
    // Optional props with defaults
    height = 400,
    width = '100%',
    headerHeight = 48,
    rowHeight = 52,
    enableVirtualization = true,
    stickyHeader = true,
    dense = false,
    noDataMessage = 'No data available',
    onRowClick = null,
    loading = false,
    loadingComponent = null,
    getRowId = (row) => row.id,
    getRowClassName = () => '',
    getCellClassName = () => '',
    renderCell = null,
    
    // Aria props
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    
    // Rest of props
    ...otherProps
  } = props;
  
  // Apply ARIA attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel,
    labelledBy: ariaLabelledBy,
    describedBy: ariaDescribedBy,
  });
  
  // Refs for resizing
  const gridRef = React.useRef(null);
  
  // Handle resize to update grid when container size changes
  React.useEffect(() => {
    if (gridRef.current) {
      gridRef.current.resetAfterIndices({
        columnIndex: 0,
        rowIndex: 0,
        shouldForceUpdate: true,
      });
    }
  }, [width, height, columns, rows]);
  
  // Row click handler
  const handleRowClick = React.useCallback((row) => {
  // Added display name
  handleRowClick.displayName = 'handleRowClick';

    if (onRowClick) {
      onRowClick(row);
    }
  }, [onRowClick]);
  
  // Default cell renderer
  const defaultRenderCell = React.useCallback(({ column, row, rowIndex, columnIndex }) => {
  // Added display name
  defaultRenderCell.displayName = 'defaultRenderCell';

    const value = row[column.field];
    return (
      <TableCell
        className={getCellClassName(column, row, rowIndex, columnIndex)}
        align={column.align || 'left'}
        padding={dense ? 'none' : 'normal'}
      >
        {value !== undefined ? value : ''}
      </TableCell>
    );
  }, [dense, getCellClassName]);
  
  // If no data, show empty state
  if (rows.length === 0) {
    return (
      <TableContainer component={Paper}>
        <Table id={id} aria-label={ariaLabel || 'Data grid'}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.field}
                  align={column.align || 'left'}
                  width={column.width}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                align="center&quot;
                className="ds-data-grid-no-data"
              >
                {noDataMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  
  // If loading, show loading state
  if (loading) {
    return loadingComponent || (
      <TableContainer component={Paper}>
        <Table id={id} aria-label={ariaLabel || 'Data grid'}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.field}
                  align={column.align || 'left'}
                  width={column.width}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                align="center&quot;
                className="ds-data-grid-loading"
              >
                Loading...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  
  // For small datasets or when virtualization is disabled, use standard table
  if (!enableVirtualization || rows.length <= 50) {
    return (
      <ErrorBoundary fallback={<div>Error rendering data grid</div>}>
        <TableContainer component={Paper} style={{ maxHeight: height }}>
          <Table 
            id={id} 
            ref={ref}
            stickyHeader={stickyHeader}
            size={dense ? 'small' : 'medium'}
            className="ds-data-grid ds-data-grid-adapted&quot;
            {...ariaAttributes}
            {...otherProps}
          >
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell 
                    key={column.field}
                    align={column.align || "left'}
                    width={column.width}
                  >
                    {column.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow 
                  key={getRowId(row)}
                  onClick={() => handleRowClick(row)}
                  hover={!!onRowClick}
                  className={getRowClassName(row, rowIndex)}
                >
                  {columns.map((column, columnIndex) => (
                    (renderCell || defaultRenderCell)({
                      column,
                      row,
                      rowIndex,
                      columnIndex
                    })
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ErrorBoundary>
    );
  }
  
  // Cell renderer for virtualized grid
  const cellRenderer = React.useCallback(({ columnIndex, rowIndex, style }) => {
  // Added display name
  cellRenderer.displayName = 'cellRenderer';

    const isHeader = rowIndex === 0;
    const column = columns[columnIndex];
    const row = isHeader ? null : rows[rowIndex - 1];
    
    const cellStyle = {
      ...style,
      boxSizing: 'border-box',
      padding: dense ? '6px 8px' : '16px',
      textAlign: column.align || 'left',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
      overflowX: 'hidden',
      textOverflow: 'ellipsis',
    };
    
    if (isHeader) {
      return (
        <div 
          style={{
            ...cellStyle,
            fontWeight: 'bold',
            backgroundColor: '#fafafa',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
          role="columnheader&quot;
        >
          {column.headerName}
        </div>
      );
    }
    
    const value = row[column.field];
    const className = getCellClassName(column, row, rowIndex - 1, columnIndex);
    
    return (
      <div 
        style={cellStyle}
        className={className}
        role="cell"
        onClick={() => onRowClick && handleRowClick(row)}
      >
        {value !== undefined ? value : ''}
      </div>
    );
  }, [columns, rows, dense, getCellClassName, handleRowClick, onRowClick]);
  
  // Column width calculator
  const getColumnWidth = (index) => {
  // Added display name
  getColumnWidth.displayName = 'getColumnWidth';

  // Added display name
  getColumnWidth.displayName = 'getColumnWidth';

  // Added display name
  getColumnWidth.displayName = 'getColumnWidth';

  // Added display name
  getColumnWidth.displayName = 'getColumnWidth';

  // Added display name
  getColumnWidth.displayName = 'getColumnWidth';


    return columns[index]?.width || 150;
  };
  
  // Memoized row height (all rows same height except header)
  const getRowHeight = React.useCallback((index) => {
  // Added display name
  getRowHeight.displayName = 'getRowHeight';

    return index === 0 ? headerHeight : rowHeight;
  }, [headerHeight, rowHeight]);
  
  // Virtualized implementation with react-window
  return (
    <ErrorBoundary fallback={<div>Error rendering virtualized data grid</div>}>
      <div 
        id={id}
        ref={ref}
        className="ds-data-grid ds-data-grid-adapted ds-data-grid-virtualized&quot;
        role="grid"
        {...ariaAttributes}
      >
        <Paper style={{ height, width, overflow: 'auto' }}>
          <Grid
            ref={gridRef}
            columnCount={columns.length}
            columnWidth={getColumnWidth}
            height={height}
            rowCount={rows.length + 1} // +1 for header
            rowHeight={getRowHeight}
            width={width === '100%' ? 'auto' : width}
            innerElementType={innerElementType}
            overscanRowCount={5}
            overscanColumnCount={2}
          >
            {cellRenderer}
          </Grid>
        </Paper>
      </div>
    </ErrorBoundary>
  );
}));

DataGridAdapted.propTypes = {
  // Required props
  id: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    field: PropTypes.string.isRequired,
    headerName: PropTypes.node.isRequired,
    width: PropTypes.number,
    align: PropTypes.oneOf(['left', 'center', 'right']),
  })).isRequired,
  rows: PropTypes.array.isRequired,
  
  // Optional props
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  headerHeight: PropTypes.number,
  rowHeight: PropTypes.number,
  enableVirtualization: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  dense: PropTypes.bool,
  noDataMessage: PropTypes.node,
  onRowClick: PropTypes.func,
  loading: PropTypes.bool,
  loadingComponent: PropTypes.node,
  getRowId: PropTypes.func,
  getRowClassName: PropTypes.func,
  getCellClassName: PropTypes.func,
  renderCell: PropTypes.func,
  
  // ARIA props
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
};

DataGrid.displayName = 'DataGrid';

export default DataGrid;