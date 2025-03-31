/**
 * @component Table
 * @description An adapter wrapper for Material UI Table components with virtualization
 * support for efficient rendering of large datasets.
 * @typedef {import('../../types/complex-components').TableAdaptedProps} TableAdaptedProps
 * @type {React.ForwardRefExoticComponent<TableAdaptedProps & React.RefAttributes<HTMLTableElement>>}
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FixedSizeList } from 'react-window';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@design-system/components/display';
import { getAriaAttributes } from '@utils/accessibilityUtils';
import { Tab } from '../../design-system';
// Design system import already exists;
;

// Row virtualization component
const VirtualizedTableBody = React.memo(({
  data,
  rowHeight,
  renderRow,
  maxHeight = 400,
}) => {
  const itemCount = data.length;
  
  return (
    <FixedSizeList
      height={Math.min(rowHeight * itemCount, maxHeight)}
      width="100%&quot;
      itemCount={itemCount}
      itemSize={rowHeight}
      itemData={data}
    >
      {({ index, style }) => (
        <div style={style}>
          {renderRow(data[index], index)}
        </div>
      )}
    </FixedSizeList>
  );
});

VirtualizedTableBody.propTypes = {
  data: PropTypes.array.isRequired,
  rowHeight: PropTypes.number.isRequired,
  renderRow: PropTypes.func.isRequired,
  maxHeight: PropTypes.number,
};

VirtualizedTableBody.displayName = "VirtualizedTableBody';

/**
 * TableAdapted - Adapter wrapper for Material UI Table with virtualization
 *
 * @param {Object} props - Component props
 * @returns {React.ReactElement} Rendered Table component
 */
const Table = React.memo(({
  data = [],
  columns = [],
  virtualized = false,
  rowHeight = 53,
  maxHeight = 400,
  stickyHeader = false,
  ariaLabel,
  ariaDescribedBy,
  className,
  onRowClick,
  rowClassName,
  cellClassName,
  headerClassName,
  size = 'medium',
  ...rest
}) => {
  // Get accessibility attributes
  const ariaAttributes = getAriaAttributes({
    label: ariaLabel || 'Data table',
    describedBy: ariaDescribedBy,
  });

  // Render a standard row
  const renderRow = (row, rowIndex) => (
    <TableRow 
      key={`row-${rowIndex}`}
      onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
      className={typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName}
      hover={!!onRowClick}
    >
      {columns.map((column, colIndex) => (
        <TableCell 
          key={`cell-${rowIndex}-${colIndex}`}
          align={column.align || 'left'}
          className={typeof cellClassName === 'function' ? cellClassName(row, column, rowIndex, colIndex) : cellClassName}
        >
          {column.render ? column.render(row, rowIndex) : row[column.field]}
        </TableCell>
      ))}
    </TableRow>
  );

  return (
    <TableContainer className={`ds-table-container ds-table-adapted ${className || ''}`} {...ariaAttributes}>
      <Table stickyHeader={stickyHeader} size={size} {...rest}>
        <TableHead>
          <TableRow className={headerClassName}>
            {columns.map((column, index) => (
              <TableCell 
                key={`header-${index}`}
                align={column.align || 'left'}
                style={{ minWidth: column.minWidth, width: column.width }}
              >
                {column.headerName || column.field}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        
        {!virtualized ? (
          <TableBody>
            {data.map((row, index) => renderRow(row, index))}
          </TableBody>
        ) : (
          <VirtualizedTableBody
            data={data}
            rowHeight={rowHeight}
            renderRow={renderRow}
            maxHeight={maxHeight}
          />
        )}
      </Table>
    </TableContainer>
  );
});

TableAdapted.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      headerName: PropTypes.string,
      width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      align: PropTypes.oneOf(['left', 'center', 'right']),
      render: PropTypes.func,
    })
  ),
  virtualized: PropTypes.bool,
  rowHeight: PropTypes.number,
  maxHeight: PropTypes.number,
  stickyHeader: PropTypes.bool,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  className: PropTypes.string,
  onRowClick: PropTypes.func,
  rowClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  cellClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  headerClassName: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium']),
};

Table.displayName = 'Table';

export default Table;