import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Accessibility-Enhanced Table Component
                                                                                      * 
                                                                                      * A table component with enhanced accessibility features.
                                                                                      * Part of the zero technical debt accessibility implementation.
                                                                                      * 
                                                                                      * @module components/common/A11yTable
                                                                                      */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, TableSortLabel } from '@mui/material';
import { useA11yAnnouncement } from "@/hooks/a11y";

/**
 * Enhanced Table with built-in accessibility features
 * 
 * @param {Object} props - Component props
 * @param {string} [props.a11yLabel] - Accessible label for the table
 * @param {string} [props.a11yCaption] - Table caption for screen readers
 * @param {string} [props.a11ySummary] - Summary of the table structure for screen readers
 * @param {Object} [props.a11yColumnHeaders] - Additional descriptions for column headers
 * @param {boolean} [props.a11yAnnounceSort=true] - Whether to announce sort changes to screen readers
 * @param {Array<Object>} props.data - Data to display in the table
 * @param {Array<Object>} props.columns - Column definitions
 * @param {string} [props.sortBy] - Current sort field
 * @param {string} [props.sortDirection='asc'] - Current sort direction
 * @param {Function} [props.onSort] - Function to call when sort changes
 * @param {boolean} [props.stickyHeader=false] - Whether to use sticky headers
 * @param {React.ReactNode} [props.headerContent] - Additional header content
 * @param {React.ReactNode} [props.footerContent] - Additional footer content
 * @param {string} [props.className] - Additional class name
 * @param {Object} [props.style] - Additional styles
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The enhanced table
 */
const A11yTable = forwardRef(({
  // A11y props
  a11yLabel,
  a11yCaption,
  a11ySummary,
  a11yColumnHeaders = {},
  a11yAnnounceSort = true,
  // Standard table props
  data = [],
  columns = [],
  sortBy,
  sortDirection = 'asc',
  onSort,
  stickyHeader = false,
  headerContent,
  footerContent,
  className = '',
  style = {},
  ...rest
}, ref) => {
  const {
    announcePolite
  } = useA11yAnnouncement();

  // Handle column sort
  const handleSort = columnId => {
    if (!onSort) return;

    // Determine new sort direction
    let newDirection = 'asc';
    if (sortBy === columnId && sortDirection === 'asc') {
      newDirection = 'desc';
    }

    // Call onSort handler
    onSort(columnId, newDirection);

    // Announce sort change to screen readers
    if (a11yAnnounceSort) {
      const column = columns.find(col => col.id === columnId);
      const columnName = column ? column.label : columnId;
      const directionText = newDirection === 'asc' ? 'ascending' : 'descending';
      announcePolite(`Table sorted by ${columnName} in ${directionText} order.`);
    }
  };

  // Create a unique ID for the table
  const tableId = React.useId();
  const captionId = `${tableId}-caption`;
  const summaryId = `${tableId}-summary`;
  return <TableContainer component={Paper} className={`a11y-table-container ${className}`} style={style} {...rest}>

      {a11yCaption && <caption id={captionId} className="a11y-table-caption">
          {a11yCaption}
        </caption>}

      
      {a11ySummary && <div id={summaryId} className="a11y-table-summary sr-only">
          {a11ySummary}
        </div>}

      
      {headerContent}
      
      <Table ref={ref} stickyHeader={stickyHeader} aria-label={a11yLabel} aria-describedby={a11ySummary ? summaryId : undefined}>

        <TableHead>
          <TableRow>
            {columns.map(column => {
            const isSorted = sortBy === column.id;
            const sortDir = isSorted ? sortDirection : 'asc';
            return <TableCell key={column.id} align={column.align || 'left'} sortDirection={isSorted ? sortDir : false} aria-sort={isSorted ? sortDir === 'asc' ? 'ascending' : 'descending' : undefined}>

                  {column.sortable !== false && onSort ? <TableSortLabel active={isSorted} direction={sortDir} onClick={() => handleSort(column.id)} aria-label={a11yColumnHeaders[column.id] || `Sort by ${column.label}`}>

                      {column.label}
                    </TableSortLabel> : column.label}

                </TableCell>;
          })}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? data.map((row, rowIndex) => <TableRow key={row.id || rowIndex} hover>

                {columns.map(column => <TableCell key={`${rowIndex}-${column.id}`} align={column.align || 'left'}>

                    {column.render ? column.render(row) : row[column.id]}
                  </TableCell>)}

              </TableRow>) : <TableRow>
              <TableCell colSpan={columns.length} align="center">
                No data available
              </TableCell>
            </TableRow>}

        </TableBody>
      </Table>
      
      {footerContent}
    </TableContainer>;
});
A11yTable.displayName = 'A11yTable';
A11yTable.propTypes = {
  // A11y props
  a11yLabel: PropTypes.string,
  a11yCaption: PropTypes.string,
  a11ySummary: PropTypes.string,
  a11yColumnHeaders: PropTypes.object,
  a11yAnnounceSort: PropTypes.bool,
  // Standard table props
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    align: PropTypes.oneOf(['left', 'right', 'center']),
    sortable: PropTypes.bool,
    render: PropTypes.func
  })).isRequired,
  sortBy: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  onSort: PropTypes.func,
  stickyHeader: PropTypes.bool,
  headerContent: PropTypes.node,
  footerContent: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object
};
export default withErrorBoundary(A11yTable, {
  boundary: 'A11yTable'
});