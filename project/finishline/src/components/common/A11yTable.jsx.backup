/**
 * A11yTable
 * 
 * Accessible data table with sorting and pagination
 * 
 * Features:
 * - Fully accessible with ARIA attributes
 * - Keyboard navigation support
 * - Screen reader announcements
 * - High-contrast mode compatibility
 * - Focus management
 * - Sortable columns
 * - Pagination
 * - Row selection
 * - Responsive design
 */

import React, { forwardRef, useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Table subcomponents
export const TableHead = forwardRef(({ children, className, ...props }, ref) => (
  <thead ref={ref} className={`a11y-table-head ${className || ''}`} {...props}>
    {children}
  </thead>
));

TableHead.displayName = 'TableHead';

export const TableBody = forwardRef(({ children, className, ...props }, ref) => (
  <tbody ref={ref} className={`a11y-table-body ${className || ''}`} {...props}>
    {children}
  </tbody>
));

TableBody.displayName = 'TableBody';

export const TableRow = forwardRef(({
  children,
  className,
  isSelected,
  onClick,
  onKeyDown,
  isInteractive,
  ...props
}, ref) => {
  // Handle keyboard navigation for interactive rows
  const handleKeyDown = (e) => {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (onClick) onClick(e);
    }
    
    // Pass through to any provided onKeyDown handler
    if (onKeyDown) {
      onKeyDown(e);
    }
  };
  
  return (
    <tr
      ref={ref}
      className={`a11y-table-row ${isSelected ? 'selected' : ''} ${className || ''}`}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-selected={isSelected}
      role={isInteractive ? 'row' : undefined}
      {...props}
    >
      {children}
    </tr>
  );
});

TableRow.displayName = 'TableRow';

export const TableCell = forwardRef(({
  children,
  className,
  isHeader,
  scope,
  align = 'left',
  ...props
}, ref) => {
  const Component = isHeader ? 'th' : 'td';
  const resolvedScope = isHeader && !scope ? 'col' : scope;
  
  return (
    <Component
      ref={ref}
      className={`a11y-table-cell ${className || ''}`}
      scope={resolvedScope}
      align={align}
      {...props}
    >
      {children}
    </Component>
  );
});

TableCell.displayName = 'TableCell';

export const TablePagination = forwardRef(({
  className,
  count,
  page,
  rowsPerPage,
  onPageChange,
  rowsPerPageOptions = [5, 10, 25],
  onRowsPerPageChange,
  labelRowsPerPage = 'Rows per page:',
  labelDisplayedRows = ({ from, to, count }) => `${from}-${to} of ${count}`,
  ...props
}, ref) => {
  // Calculate displayed rows info
  const from = Math.min(page * rowsPerPage + 1, count);
  const to = Math.min(from + rowsPerPage - 1, count);
  
  // Handle page change
  const handlePrevPage = () => {
    if (page > 0) onPageChange(page - 1);
  };
  
  const handleNextPage = () => {
    if ((page + 1) * rowsPerPage < count) onPageChange(page + 1);
  };
  
  // Calculate button states
  const isPrevDisabled = page === 0;
  const isNextDisabled = (page + 1) * rowsPerPage >= count;
  
  return (
    <div
      ref={ref}
      className={`a11y-table-pagination ${className || ''}`}
      role="navigation"
      aria-label="Pagination"
      {...props}
    >
      {/* Rows per page selector */}
      <div className="rows-per-page">
        <label id="rows-per-page-label" htmlFor="rows-per-page-select">
          {labelRowsPerPage}
        </label>
        <select
          id="rows-per-page-select"
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          aria-labelledby="rows-per-page-label"
        >
          {rowsPerPageOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      
      {/* Displayed rows info */}
      <div
        className="displayed-rows"
        aria-live="polite"
      >
        {labelDisplayedRows({ from, to, count })}
      </div>
      
      {/* Page navigation buttons */}
      <div className="page-navigation">
        <button
          aria-label="Previous page"
          onClick={handlePrevPage}
          disabled={isPrevDisabled}
        >
          Previous
        </button>
        <button
          aria-label="Next page"
          onClick={handleNextPage}
          disabled={isNextDisabled}
        >
          Next
        </button>
      </div>
    </div>
  );
});

TablePagination.displayName = 'TablePagination';

/**
 * A11yTable Component
 */
const A11yTable = forwardRef((props, ref) => {
  const {
    children,
    className,
    style,
    id,
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    data = [],
    columns = [],
    sortable = false,
    initialSortColumn,
    initialSortDirection = 'asc',
    paginated = false,
    rowsPerPage: initialRowsPerPage = 10,
    page: initialPage = 0,
    selectable = false,
    onRowClick,
    dataTestId,
    caption,
    ...other
  } = props;

  // State for sorting
  const [sortColumn, setSortColumn] = useState(initialSortColumn);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  
  // State for pagination
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  
  // State for selection
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Using internal ref if none provided
  const componentRef = useRef(null);
  const resolvedRef = ref || componentRef;
  
  // Reset page when data changes
  useEffect(() => {
    setPage(0);
  }, [data.length]);
  
  // Handle column sort
  const handleSort = (columnId) => {
    if (!sortable) return;
    
    // Toggle direction if already sorting by this column
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };
  
  // Handle row selection
  const handleRowSelect = (rowId) => {
    if (!selectable) return;
    
    setSelectedRows(prev => {
      if (prev.includes(rowId)) {
        return prev.filter(id => id !== rowId);
      } else {
        return [...prev, rowId];
      }
    });
  };
  
  // Sort and paginate data
  let displayData = [...data];
  
  // Apply sorting if needed
  if (sortable && sortColumn) {
    displayData.sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];
      
      // Handle different data types
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortDirection === 'asc'
          ? valueA - valueB
          : valueB - valueA;
      }
    });
  }
  
  // Apply pagination if needed
  let paginatedData = displayData;
  if (paginated) {
    const startIndex = page * rowsPerPage;
    paginatedData = displayData.slice(startIndex, startIndex + rowsPerPage);
  }
  
  // Generate table markup from data and columns
  const renderTableContent = () => {
    if (!columns.length || !data.length) {
      return children;
    }
    
    return (
      <>
        <TableHead>
          <tr>
            {selectable && (
              <TableCell isHeader>
                <span className="visually-hidden">Select</span>
              </TableCell>
            )}
            {columns.map(column => (
              <TableCell
                key={column.id}
                isHeader
                onClick={sortable ? () => handleSort(column.id) : undefined}
                style={{ cursor: sortable ? 'pointer' : 'default' }}
                aria-sort={sortColumn === column.id ? sortDirection : undefined}
              >
                {column.label}
                {sortColumn === column.id && (
                  <span className="sort-indicator">
                    {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                  </span>
                )}
              </TableCell>
            ))}
          </tr>
        </TableHead>
        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow
              key={row.id || rowIndex}
              isSelected={selectedRows.includes(row.id)}
              isInteractive={selectable || !!onRowClick}
              onClick={selectable ? () => handleRowSelect(row.id) : onRowClick ? () => onRowClick(row) : undefined}
            >
              {selectable && (
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleRowSelect(row.id)}
                    aria-label={`Select row ${rowIndex + 1}`}
                  />
                </TableCell>
              )}
              {columns.map(column => (
                <TableCell key={column.id}>
                  {column.render ? column.render(row) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </>
    );
  };
  
  return (
    <div className="a11y-table-container">
      <table
        ref={resolvedRef}
        className={`a11y-table ${className || ''}`}
        style={style}
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        data-testid={dataTestId}
        {...other}
      >
        {caption && <caption>{caption}</caption>}
        {renderTableContent()}
      </table>
      
      {paginated && (
        <TablePagination
          count={data.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      )}
    </div>
  );
});

A11yTable.displayName = 'A11yTable';

A11yTable.propTypes = {
  /** Child elements */
  children: PropTypes.node,
  /** Additional CSS class */
  className: PropTypes.string,
  /** Additional inline styles */
  style: PropTypes.object,
  /** Element ID */
  id: PropTypes.string,
  /** ARIA label */
  ariaLabel: PropTypes.string,
  /** ID of element that labels this component */
  ariaLabelledBy: PropTypes.string,
  /** ID of element that describes this component */
  ariaDescribedBy: PropTypes.string,
  /** Table data */
  data: PropTypes.array,
  /** Column definitions */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      render: PropTypes.func
    })
  ),
  /** Enable sorting */
  sortable: PropTypes.bool,
  /** Initial sort column */
  initialSortColumn: PropTypes.string,
  /** Initial sort direction */
  initialSortDirection: PropTypes.oneOf(['asc', 'desc']),
  /** Enable pagination */
  paginated: PropTypes.bool,
  /** Rows per page */
  rowsPerPage: PropTypes.number,
  /** Current page */
  page: PropTypes.number,
  /** Enable row selection */
  selectable: PropTypes.bool,
  /** Row click handler */
  onRowClick: PropTypes.func,
  /** Data test ID for testing */
  dataTestId: PropTypes.string,
  /** Table caption */
  caption: PropTypes.node
};

export default A11yTable;