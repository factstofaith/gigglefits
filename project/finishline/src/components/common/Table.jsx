/**
 * Table
 * 
 * A standardized table component for displaying tabular data.
 * 
 * @module components/common/Table
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized table component
 * 
 * @param {Object} props - Component props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Data to display
 * @param {Function} [props.onRowClick] - Callback when a row is clicked
 * @param {boolean} [props.hoverable=true] - Whether rows have hover effect
 * @param {boolean} [props.striped=false] - Whether rows are striped
 * @param {boolean} [props.bordered=false] - Whether table has borders
 * @param {string} [props.size='medium'] - Table size
 * @param {boolean} [props.loading=false] - Whether table is in loading state
 * @param {string} [props.loadingText='Loading...'] - Text to display while loading
 * @param {node} [props.emptyState] - Content to display when data is empty
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} The table component
 */
const Table = forwardRef(({
  columns = [],
  data = [],
  onRowClick,
  hoverable = true,
  striped = false,
  bordered = false,
  size = 'medium',
  loading = false,
  loadingText = 'Loading...',
  emptyState = 'No data to display',
  className = '',
  ...rest
}, ref) => {
  // Size styles
  const sizeStyles = {
    small: {
      fontSize: '0.875rem',
      padding: '0.5rem',
    },
    medium: {
      fontSize: '1rem',
      padding: '0.75rem',
    },
    large: {
      fontSize: '1.125rem',
      padding: '1rem',
    },
  };
  
  // Cell padding based on size
  const cellPadding = sizeStyles[size]?.padding || sizeStyles.medium.padding;
  
  // Table wrapper styles
  const wrapperStyle = {
    position: 'relative',
    width: '100%',
    overflowX: 'auto',
    borderRadius: '4px',
    boxShadow: bordered ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.08)',
  };
  
  // Loading overlay styles
  const loadingOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    fontSize: '1rem',
    color: '#757575',
  };
  
  // Table styles
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    borderSpacing: 0,
    fontSize: sizeStyles[size]?.fontSize || sizeStyles.medium.fontSize,
  };
  
  // Header cell styles
  const headerCellStyle = {
    padding: cellPadding,
    textAlign: 'left',
    fontWeight: 600,
    color: '#212121',
    backgroundColor: '#f5f5f5',
    position: 'sticky',
    top: 0,
    zIndex: 1,
    borderBottom: '1px solid #e0e0e0',
    ...(bordered && { border: '1px solid #e0e0e0' }),
  };
  
  // Body cell styles
  const bodyCellStyle = {
    padding: cellPadding,
    textAlign: 'left',
    color: '#212121',
    borderBottom: '1px solid #e0e0e0',
    ...(bordered && { border: '1px solid #e0e0e0' }),
  };
  
  // Row styles based on variants
  const getRowStyle = (index) => {
    const baseStyle = {
      backgroundColor: striped && index % 2 === 1 ? '#fafafa' : '#ffffff',
      transition: hoverable ? 'background-color 0.2s' : 'none',
      cursor: onRowClick ? 'pointer' : 'default',
    };
    
    return baseStyle;
  };
  
  // Row hover styles
  const handleRowMouseEnter = (e) => {
    if (hoverable) {
      e.currentTarget.style.backgroundColor = '#f5f5f5';
    }
  };
  
  const handleRowMouseLeave = (e, index) => {
    if (hoverable) {
      e.currentTarget.style.backgroundColor = striped && index % 2 === 1 ? '#fafafa' : '#ffffff';
    }
  };
  
  // Handle row click
  const handleRowClick = (row, index) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };
  
  // Empty state container styles
  const emptyStateStyle = {
    padding: '2rem',
    textAlign: 'center',
    color: '#757575',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
  };
  
  // Generate table content
  const renderTableContent = () => {
    if (loading) {
      return (
        <tr>
          <td 
            colSpan={columns.length}
            style={{
              ...bodyCellStyle,
              textAlign: 'center',
              padding: '2rem',
              backgroundColor: '#ffffff',
              borderBottom: 'none',
            }}
          >
            {loadingText}
          </td>
        </tr>
      );
    }
    
    if (data.length === 0) {
      return (
        <tr>
          <td 
            colSpan={columns.length}
            style={emptyStateStyle}
          >
            {emptyState}
          </td>
        </tr>
      );
    }
    
    return data.map((row, rowIndex) => (
      <tr
        key={rowIndex}
        style={getRowStyle(rowIndex)}
        onClick={() => handleRowClick(row, rowIndex)}
        onMouseEnter={handleRowMouseEnter}
        onMouseLeave={(e) => handleRowMouseLeave(e, rowIndex)}
        className={`tap-table__row ${onRowClick ? 'tap-table__row--clickable' : ''}`}
        data-testid={`tap-table-row-${rowIndex}`}
      >
        {columns.map((column, colIndex) => {
          // Get cell value based on accessor
          let cellValue;
          if (typeof column.accessor === 'function') {
            cellValue = column.accessor(row, rowIndex);
          } else if (typeof column.accessor === 'string') {
            cellValue = row[column.accessor];
          } else {
            cellValue = null;
          }
          
          // Apply cell formatter if provided
          const displayValue = column.format ? column.format(cellValue, row) : cellValue;
          
          return (
            <td
              key={colIndex}
              style={{
                ...bodyCellStyle,
                width: column.width,
                maxWidth: column.maxWidth,
                minWidth: column.minWidth,
                textAlign: column.align || 'left',
              }}
              className={`tap-table__cell ${column.className || ''}`}
              data-testid={`tap-table-cell-${rowIndex}-${colIndex}`}
            >
              {displayValue}
            </td>
          );
        })}
      </tr>
    ));
  };
  
  return (
    <div 
      className={`tap-table-wrapper ${className}`}
      style={wrapperStyle}
      data-testid="tap-table-wrapper"
    >
      {loading && (
        <div style={loadingOverlayStyle} className="tap-table__loading-overlay">
          {loadingText}
        </div>
      )}
      
      <table
        ref={ref}
        style={tableStyle}
        className={`tap-table tap-table--${size} ${striped ? 'tap-table--striped' : ''} ${bordered ? 'tap-table--bordered' : ''} ${hoverable ? 'tap-table--hoverable' : ''}`}
        data-testid="tap-table"
        {...rest}
      >
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                style={{
                  ...headerCellStyle,
                  width: column.width,
                  maxWidth: column.maxWidth,
                  minWidth: column.minWidth,
                  textAlign: column.align || 'left',
                }}
                className={`tap-table__header ${column.className || ''}`}
                scope="col"
                data-testid={`tap-table-header-${index}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderTableContent()}
        </tbody>
      </table>
    </div>
  );
});

// Display name for debugging
Table.displayName = 'Table';

// Prop types
Table.propTypes = {
  /** Column definitions */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      /** Column header text */
      header: PropTypes.node.isRequired,
      /** Data accessor (string key or function) */
      accessor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
      /** Optional formatter function */
      format: PropTypes.func,
      /** Column width (CSS value) */
      width: PropTypes.string,
      /** Column minimum width (CSS value) */
      minWidth: PropTypes.string,
      /** Column maximum width (CSS value) */
      maxWidth: PropTypes.string,
      /** Column text alignment */
      align: PropTypes.oneOf(['left', 'center', 'right']),
      /** Additional CSS class name */
      className: PropTypes.string,
    })
  ).isRequired,
  
  /** Data to display */
  data: PropTypes.array.isRequired,
  
  /** Callback when a row is clicked */
  onRowClick: PropTypes.func,
  
  /** Whether rows have hover effect */
  hoverable: PropTypes.bool,
  
  /** Whether rows are striped */
  striped: PropTypes.bool,
  
  /** Whether table has borders */
  bordered: PropTypes.bool,
  
  /** Table size */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  /** Whether table is in loading state */
  loading: PropTypes.bool,
  
  /** Text to display while loading */
  loadingText: PropTypes.string,
  
  /** Content to display when data is empty */
  emptyState: PropTypes.node,
  
  /** Additional CSS class names */
  className: PropTypes.string,
};

export default Table;