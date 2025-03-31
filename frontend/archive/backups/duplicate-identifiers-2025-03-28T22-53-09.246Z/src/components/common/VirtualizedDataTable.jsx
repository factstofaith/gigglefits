/**
 * @component VirtualizedDataTable
 * @description A high-performance data table component with virtualization for efficiently
 * handling large datasets. Uses react-window for virtualized rendering to improve performance
 * and reduce memory usage when displaying thousands of rows.
 *
 * Features:
 * - Virtualized rendering for large datasets
 * - Column sorting with stable sort
 * - Row selection with checkboxes
 * - Pagination
 * - Custom cell rendering
 * - Toolbar with actions and filters
 * - Support for different data types (text, chip, boolean, date, datetime)
 *
 * @example
 * // Basic usage
 * const columns = [;
 *   { id: 'name', label: 'Name', width: 200 },
 *   { id: 'status', label: 'Status', type: 'chip', getChipColor: (value) => value === 'active' ? 'success' : 'default' },
 *   { id: 'date', label: 'Date', type: 'date' }
 * ];
 *
 * <VirtualizedDataTable
 *   title="Users"
 *   data={users}
 *   columns={columns}
 *   onRowClick={handleRowClick}
 * />
 *
 * @example
 * // With selection, custom actions and filters
 * <VirtualizedDataTable
 *   title="Products"
 *   data={products}
 *   columns={productColumns}
 *   enableSelection={true}
 *   onSelectionChange={handleSelectionChange}
 *   onDeleteSelected={handleDeleteSelected}
 *   actions={
 *     <Button startIcon={<AddIcon />} variant="contained">Add Product</Button>
 *   }
 *   filters={
 *     <FormControl size="small">
 *       <Select value={categoryFilter} onChange={handleCategoryFilterChange}>
 *         <MenuItem value="all">All Categories</MenuItem>
 *         <MenuItem value="electronics">Electronics</MenuItem>
 *         <MenuItem value="books">Books</MenuItem>
 *       </Select>
 *     </FormControl>
 *   }
 * />
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Box, Card } from '../../design-system'
import { Typography } from '../../design-system'
import { Table } from '../../design-system'
import { Chip } from '../../design-system'
import { useTheme } from '@design-system/foundations/theme';
import {
  DeleteOutline,
  FilterListOutlined,
  MoreVertOutlined,
  ArrowDropDown,
} from '@mui/icons-material';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import PropTypes from 'prop-types';

// Still using some Material UI components for complex virtualization functionality
import { import Tab from '@mui/material/Tab';
TableBody } from '@mui/material';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import Checkbox from '@mui/material/Checkbox';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import  from '@mui/material/';;
import Box from '@mui/material/Box';

/**
 * @function descendingComparator
 * @description Compares two values for descending sort order.
 * Handles null/undefined values by placing them at the end.
 *
 * @param {Object} a - First object to compare
 * @param {Object} b - Second object to compare
 * @param {string} orderBy - Property key to compare
 * @returns {number} -1, 0, or 1 for sorting
 */
function descendingComparator(a, b, orderBy) {
  // Added display name
  descendingComparator.displayName = 'descendingComparator';

  if (b[orderBy] === null || b[orderBy] === undefined) return -1;
  if (a[orderBy] === null || a[orderBy] === undefined) return 1;

  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

/**
 * @function getComparator
 * @description Returns a comparator function for sorting based on specified order.
 *
 * @param {string} order - Sort order ('asc' or 'desc')
 * @param {string} orderBy - Property key to sort by
 * @returns {Function} Comparator function
 */
function getComparator(order, orderBy) {
  // Added display name
  getComparator.displayName = 'getComparator';

  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * @function stableSort
 * @description Performs a stable sort on an array using the provided comparator.
 * Preserves the original order of equal elements.
 *
 * @param {Array} array - Array to sort
 * @param {Function} comparator - Comparator function
 * @returns {Array} Sorted array
 */
function stableSort(array, comparator) {
  // Added display name
  stableSort.displayName = 'stableSort';

  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

/**
 * @component EnhancedTableHead
 * @description Memoized table header component that displays column labels and handles sorting.
 * Includes a select-all checkbox when selection is enabled.
 *
 * @param {Object} props - The component props
 * @param {Array} props.columns - Array of column configuration objects
 * @param {string} props.order - Sort order ('asc' or 'desc')
 * @param {string} props.orderBy - Column ID being sorted
 * @param {Function} props.onRequestSort - Callback when sort is requested
 * @param {number} props.numSelected - Number of selected rows
 * @param {number} props.rowCount - Total number of rows
 * @param {Function} props.onSelectAllClick - Callback when select-all checkbox is clicked
 * @param {boolean} props.enableSelection - Whether row selection is enabled
 * @returns {JSX.Element} The table header component
 */
const EnhancedTableHead = memo(;
  ({
    columns,
    order,
    orderBy,
    onRequestSort,
    numSelected,
    rowCount,
    onSelectAllClick,
    enableSelection,
  }) => {
    /**
     * @function createSortHandler
     * @description Creates a sort handler for a specific column property
     *
     * @param {string} property - The column ID to sort by
     * @returns {Function} Handler function for the sort event
     */
    const createSortHandler = property => event => {
      onRequestSort(event, property);
    };

    return (
      <TableHead>
        <TableRow>
          {enableSelection && (
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                color="primary"
              />
            </TableCell>
          )}
          {columns.map(column => (
            <TableCell
              key={column.id}
              align={column.numeric ? 'right' : 'left'}
              padding={column.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === column.id ? order : false}
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                width: column.width || 'auto',
              }}
            >
              {column.sortable !== false ? (
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={orderBy === column.id ? order : 'asc'}
                  onClick={createSortHandler(column.id)}
                  IconComponent={ArrowDropDown}
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                column.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }
);

EnhancedTableHead.propTypes = {
  columns: PropTypes.array.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  numSelected: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  enableSelection: PropTypes.bool.isRequired,
};

/**
 * @component EnhancedTableToolbar
 * @description Memoized toolbar component for the data table that displays the title,
 * selection actions, custom actions, and filters. Shows different UI when rows are selected.
 *
 * @param {Object} props - The component props
 * @param {string} props.title - Title to display in the toolbar
 * @param {number} props.numSelected - Number of selected rows
 * @param {Function} props.onDeleteSelected - Callback when delete button is clicked
 * @param {React.ReactNode} props.actions - Custom action components to display
 * @param {React.ReactNode} props.filters - Filter components to display
 * @returns {JSX.Element} The toolbar component
 */
const EnhancedTableToolbar = memo(({ title, numSelected, onDeleteSelected, actions, filters }) => {
  const { theme } = useTheme();

  return (
    <Toolbar
      style={{
        paddingLeft: '16px',
        paddingRight: '8px',
        backgroundColor: numSelected > 0 
          ? (theme?.colors?.primary?.main ? '${theme.colors.primary.main}14' : '#1976d214')
          : 'transparent',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      {numSelected > 0 ? (
        <Typography 
          variant="subtitle1" 
          style={{ 
            flex: '1 1 100%',
            color: theme?.colors?.text?.primary || '#212121'
          }}
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          variant="h6"
          id="tableTitle"
          style={{ 
            flex: '1 1 auto', 
            fontWeight: 'bold',
            color: theme?.colors?.text?.primary || '#212121'
          }}
        >
          {title}
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={onDeleteSelected}>
            <DeleteOutline />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          {filters && (
            <Box display="flex" alignItems="center" style={{ gap: '8px', flexWrap: 'wrap' }}>
              {filters}
            </Box>
          )}

          {actions && <Box display="flex" style={{ gap: '8px' }}>{actions}</Box>}
        </>
      )}
    </Toolbar>
  );
});

EnhancedTableToolbar.propTypes = {
  title: PropTypes.string,
  numSelected: PropTypes.number.isRequired,
  onDeleteSelected: PropTypes.func,
  actions: PropTypes.node,
  filters: PropTypes.node,
};

/**
 * @component VirtualRow
 * @description Row renderer function for the virtualized list.
 * Displays a single row with cells based on column configuration.
 * Optimized for react-window integration.
 *
 * @param {Object} props - The component props
 * @param {Object} props.data - The shared data between all rows
 * @param {Array} props.data.items - Array of data items to display
 * @param {Array} props.data.columns - Column configuration array
 * @param {Function} props.data.handleRowClick - Handler for row click events
 * @param {Function} props.data.isSelected - Function to check if row is selected
 * @param {Function} props.data.renderCellValue - Function to render cell values
 * @param {boolean} props.data.enableSelection - Whether selection is enabled
 * @param {Function} props.data.onSelectionChange - Handler for selection changes
 * @param {number} props.index - Row index in the virtualized list
 * @param {Object} props.style - Style object from react-window
 * @returns {JSX.Element|null} The row component or null if row data doesn't exist
 */
const VirtualRow = memo(;
  ({
    data: {
      items,
      columns,
      handleRowClick,
      isSelected,
      renderCellValue,
      enableSelection,
      onSelectionChange,
    },
    index,
    style,
  }) => {
    const row = items[index];
    if (!row) return null;

    const isItemSelected = isSelected(row.id);
    const labelId = 'virtualized-table-checkbox-${index}';

    /**
     * @function handleCheckboxClick
     * @description Handles checkbox click without triggering row click.
     * Stops event propagation and toggles selection state.
     *
     * @param {React.MouseEvent} event - The click event
     */
    const handleCheckboxClick = event => {
      event.stopPropagation();
      const selectedIndex = isItemSelected ? -1 : index;
      if (onSelectionChange) {
        onSelectionChange(row.id, selectedIndex);
      }
    };

    return (
      <TableRow
        hover
        onClick={() => handleRowClick(row.id)}
        role="checkbox"
        aria-checked={isItemSelected}
        tabIndex={-1}
        selected={isItemSelected}
        style={{
          ...style,
          display: 'flex',
          boxSizing: 'border-box',
          alignItems: 'center',
        }}
      >
        {enableSelection && (
          <TableCell
            padding="checkbox"
            component="div"
            style={{
              flex: '0 0 auto',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Checkbox
              color="primary"
              checked={isItemSelected}
              inputProps={{
                'aria-labelledby': labelId,
              }}
              onClick={handleCheckboxClick}
            />
          </TableCell>
        )}

        {columns.map(column => (
          <TableCell
            key={column.id}
            align={column.numeric ? 'right' : 'left'}
            padding={column.disablePadding ? 'none' : 'normal'}
            component="div"
            style={{
              flex: column.width ? '0 0 ${column.width}' : '1 1 auto',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              padding: '16px',
              justifyContent: column.numeric ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: column.wrap ? 'normal' : 'nowrap',
                maxWidth: '100%',
                fontWeight: column.bold ? 'bold' : 'normal',
              }}
            >
              {renderCellValue(column, row[column.id], row)}
            </div>
          </TableCell>
        ))}
      </TableRow>
    );
  }
);

VirtualRow.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
};

/**
 * @component EmptyRow
 * @description A component that displays a message when there is no data to show.
 * Spans all columns and shows a configurable empty state message.
 *
 * @param {Object} props - The component props
 * @param {Array} props.columns - Column configuration array
 * @param {boolean} props.enableSelection - Whether selection is enabled
 * @param {string} props.emptyMessage - Message to display when there's no data
 * @returns {JSX.Element} The empty row component
 */
const EmptyRow = memo(({ columns, enableSelection, emptyMessage }) => {
  const { theme } = useTheme();
  
  return (
    <TableRow>
      <TableCell
        colSpan={columns.length + (enableSelection ? 1 : 0)}
        align="center"
        style={{ 
          padding: '64px 16px', 
          color: theme?.colors?.text?.secondary || '#666666' 
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </TableCell>
    </TableRow>
  );
});

EmptyRow.propTypes = {
  columns: PropTypes.array.isRequired,
  enableSelection: PropTypes.bool.isRequired,
  emptyMessage: PropTypes.string.isRequired,
};

// Main VirtualizedDataTable component
function VirtualizedDataTable({
  title,
  data = [],
  columns = [],
  initialOrderBy = ',
  initialOrder = 'asc',
  enableSelection = false,
  rowsPerPageOptions = [10, 25, 50, 100],
  defaultRowsPerPage = 50,
  onRowClick,
  onSelectionChange,
  onDeleteSelected,
  actions,
  filters,
  emptyMessage = 'No data available',
  sx = {},
  virtualizationDisabled = false,
  rowHeight = 53, // Default MUI table row height
  maxHeight = 600, // Max height before scrolling
  overscanCount = 5, // Number of off-screen rows to render
}) {
  // Added display name
  VirtualizedDataTable.displayName = 'VirtualizedDataTable';

  // State management
  const [order, setOrder] = useState(initialOrder);
  const [orderBy, setOrderBy] = useState(initialOrderBy);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const theme = useTheme();

  // Reset page when data changes
  useEffect(() => {
    if (page > 0 && data.length <= page * rowsPerPage) {
      setPage(0);
    }
  }, [data.length, page, rowsPerPage]);

  // Handle sort request
  const handleRequestSort = useCallback(;
    (event, property) => {
  // Added display name
  handleRequestSort.displayName = 'handleRequestSort';

      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    },
    [order, orderBy]
  );

  // Handle select all click
  const handleSelectAllClick = useCallback(;
    event => {
  // Added display name
  handleSelectAllClick.displayName = 'handleSelectAllClick';

      if (event.target.checked) {
        const newSelected = data.map(n => n.id);
        setSelected(newSelected);
        if (onSelectionChange) onSelectionChange(newSelected);
        return;
      }
      setSelected([]);
      if (onSelectionChange) onSelectionChange([]);
    },
    [data, onSelectionChange]
  );

  // Handle row click
  const handleRowClick = useCallback(;
    id => {
  // Added display name
  handleRowClick.displayName = 'handleRowClick';

      if (!enableSelection) {
        if (onRowClick) onRowClick(id);
        return;
      }

      const selectedIndex = selected.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }

      setSelected(newSelected);
      if (onSelectionChange) onSelectionChange(newSelected);
    },
    [enableSelection, onRowClick, selected, onSelectionChange]
  );

  // Handle explicit selection change from checkbox
  const handleSelectionChange = useCallback(;
    (id, selectedIndex) => {
  // Added display name
  handleSelectionChange.displayName = 'handleSelectionChange';

      let newSelected = [...selected];

      if (selectedIndex === -1) {
        // Remove from selection
        newSelected = newSelected.filter(itemId => itemId !== id);
      } else {
        // Add to selection
        newSelected.push(id);
      }

      setSelected(newSelected);
      if (onSelectionChange) onSelectionChange(newSelected);
    },
    [selected, onSelectionChange]
  );

  // Handle page change
  const handleChangePage = useCallback((event, newPage) => {
  // Added display name
  handleChangePage.displayName = 'handleChangePage';

    setPage(newPage);
  }, []);

  // Handle rows per page change
  const handleChangeRowsPerPage = useCallback(event => {
  // Added display name
  handleChangeRowsPerPage.displayName = 'handleChangeRowsPerPage';

    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Check if row is selected
  const isSelected = useCallback(id => selected.indexOf(id) !== -1, [selected]);

  // Sort data
  const sortedData = useMemo(() => {
  // Added display name
  sortedData.displayName = 'sortedData';

    return stableSort(data, getComparator(order, orderBy));
  }, [data, order, orderBy]);

  // Get paginated data
  const paginatedData = useMemo(() => {
  // Added display name
  paginatedData.displayName = 'paginatedData';

    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  // Render a value based on column type
  const renderCellValue = useCallback((column, value, row) => {
  // Added display name
  renderCellValue.displayName = 'renderCellValue';

    // Use render function if provided
    if (column.render) {
      return column.render(value, row);
    }

    // Handle different value types
    if (value === null || value === undefined) {
      return '-';
    }

    if (column.type === 'chip') {
      return (
        <Chip
          label={value}
          size="small"
          color={column.getChipColor ? column.getChipColor(value, row) : 'default'}
          variant="outlined"
        />
      );
    }

    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }

    if (column.type === 'datetime') {
      return new Date(value).toLocaleString();
    }

    return value;
  }, []);

  // Calculate list height
  const listHeight = useMemo(() => {
  // Added display name
  listHeight.displayName = 'listHeight';

    if (virtualizationDisabled) return 'auto';
    const calculatedHeight = Math.min(rowHeight * paginatedData.length, maxHeight);
    return paginatedData.length === 0 ? rowHeight * 3 : calculatedHeight;
  }, [paginatedData.length, rowHeight, maxHeight, virtualizationDisabled]);

  // Table row data for virtualized list
  const rowData = useMemo(;
    () => ({
      items: paginatedData,
      columns,
      handleRowClick,
      isSelected,
      renderCellValue,
      enableSelection,
      onSelectionChange: handleSelectionChange,
    }),
    [
      paginatedData,
      columns,
      handleRowClick,
      isSelected,
      renderCellValue,
      enableSelection,
      handleSelectionChange,
    ]
  );

  return (
    <Card
      style={{
        width: '100%',
        borderRadius: '8px',
        border: '1px solid ${theme?.colors?.divider || '#e0e0e0'}',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* Table toolbar with actions */}
      {(title || actions || filters) && (
        <>
          <EnhancedTableToolbar
            title={title}
            numSelected={selected.length}
            onDeleteSelected={onDeleteSelected}
            actions={actions}
            filters={filters}
          />
          <Divider />
        </>
      )}

      {/* Main table */}
      <TableContainer>
        <Table aria-labelledby="tableTitle" style={{ tableLayout: 'fixed' }}>
          <EnhancedTableHead
            columns={columns}
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={data.length}
            enableSelection={enableSelection}
          />

          {/* Standard or virtualized table body */}
          {virtualizationDisabled ? (
            // Standard table body for small datasets
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = 'table-checkbox-${index}';

                  return (
                    <TableRow
                      hover
                      onClick={() => handleRowClick(row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{
                        cursor: onRowClick || enableSelection ? 'pointer' : 'default',
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      {enableSelection && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                            onClick={event => {
                              event.stopPropagation();
                              handleRowClick(row.id);
                            }}
                          />
                        </TableCell>
                      )}

                      {columns.map(column => (
                        <TableCell
                          key={column.id}
                          align={column.numeric ? 'right' : 'left'}
                          padding={column.disablePadding ? 'none' : 'normal'}
                          sx={{
                            whiteSpace: column.wrap ? 'normal' : 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            ...(column.bold && { fontWeight: 'bold' }),
                          }}
                        >
                          {renderCellValue(column, row[column.id], row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <EmptyRow
                  columns={columns}
                  enableSelection={enableSelection}
                  emptyMessage={emptyMessage}
                />
              )}
            </TableBody>
          ) : (
            // Virtualized table body for large datasets
            <TableBody>
              {paginatedData.length > 0 ? (
                <>
                  <tr>
                    <td colSpan={columns.length + (enableSelection ? 1 : 0)} style={{ padding: 0 }}>
                      <div style={{ height: listHeight, width: '100%' }}>
                        <AutoSizer disableHeight>
                          {({ width }) => (
                            <List
                              height={listHeight}
                              width={width}
                              itemCount={paginatedData.length}
                              itemSize={rowHeight}
                              itemData={rowData}
                              overscanCount={overscanCount}
                            >
                              {VirtualRow}
                            </List>
                          )}
                        </AutoSizer>
                      </div>
                    </td>
                  </tr>
                </>
              ) : (
                <EmptyRow
                  columns={columns}
                  enableSelection={enableSelection}
                  emptyMessage={emptyMessage}
                />
              )}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  );
}

VirtualizedDataTable.propTypes = {
  /** Title displayed in the table toolbar */
  title: PropTypes.string,

  /** Array of data objects to display in the table */
  data: PropTypes.array,

  /** Array of column configuration objects */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      numeric: PropTypes.bool,
      disablePadding: PropTypes.bool,
      sortable: PropTypes.bool,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      wrap: PropTypes.bool,
      bold: PropTypes.bool,
      type: PropTypes.oneOf(['text', 'chip', 'boolean', 'date', 'datetime']),
      render: PropTypes.func,
      getChipColor: PropTypes.func,
    })
  ),

  /** Property to sort by initially */
  initialOrderBy: PropTypes.string,

  /** Initial sort direction */
  initialOrder: PropTypes.oneOf(['asc', 'desc']),

  /** Whether to enable row selection with checkboxes */
  enableSelection: PropTypes.bool,

  /** Options for rows per page dropdown */
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),

  /** Default number of rows per page */
  defaultRowsPerPage: PropTypes.number,

  /** Callback when a row is clicked */
  onRowClick: PropTypes.func,

  /** Callback when selection changes */
  onSelectionChange: PropTypes.func,

  /** Callback when delete button is clicked on selected rows */
  onDeleteSelected: PropTypes.func,

  /** Custom action components to display in toolbar */
  actions: PropTypes.node,

  /** Filter components to display in toolbar */
  filters: PropTypes.node,

  /** Message to display when there's no data */
  emptyMessage: PropTypes.string,

  /** Additional styles for the Paper component */
  sx: PropTypes.object,

  /** Whether to disable virtualization (for small datasets) */
  virtualizationDisabled: PropTypes.bool,

  /** Height of each row in pixels */
  rowHeight: PropTypes.number,

  /** Maximum height of the table before scrolling */
  maxHeight: PropTypes.number,

  /** Number of additional rows to render outside visible area */
  overscanCount: PropTypes.number,
};

export default memo(VirtualizedDataTable);
