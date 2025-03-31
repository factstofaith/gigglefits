/**
 * @component DataTable
 * @description Modern, feature-rich data table component with sorting, selection, pagination,
 * and customizable rendering. Supports various column types, custom rendering, and
 * built-in functionality for common table operations.
 *
 * @example
 * // Basic usage
 * const columns = [
 *   { id: 'name', label: 'Name' },
 *   { id: 'email', label: 'Email' },
 *   { id: 'role', label: 'Role', type: 'chip' },
 *   { id: 'createdAt', label: 'Created', type: 'date' }
 * ];
 *
 * <DataTable
 *   title="Users&quot;
 *   data={users}
 *   columns={columns}
 *   onRowClick={handleRowClick}
 * />
 *
 * @example
 * // With selection and actions
 * <DataTable
 *   title="Projects"
 *   data={projects}
 *   columns={columns}
 *   enableSelection
 *   onSelectionChange={handleSelectionChange}
 *   onDeleteSelected={handleDeleteSelected}
 *   actions={[
 *     <Button startIcon={<AddIcon />}>New Project</Button>
 *   ]}
 * />
 */

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  Divider, 
  Chip, 
  Tooltip, 
  IconButton, 
  Toolbar, 
  Checkbox, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  alpha
} from '../../design-system';

import {
// Design system import already exists;
// Design system import already exists;
  DeleteOutline,
  FilterListOutlined,
  MoreVertOutlined,
  ArrowDropDown
} from '@mui/icons-material';

/**
 * Utility function for sorting data in descending order by a specific property
 *
 * @param {Object} a - First item to compare
 * @param {Object} b - Second item to compare
 * @param {string} orderBy - Property to sort by
 * @returns {number} Comparison result (-1, 0, or 1)
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
 * Returns comparator function for sorting based on sort direction and property
 *
 * @param {string} order - Sort direction ('asc' or 'desc')
 * @param {string} orderBy - Property to sort by
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
 * Performs stable sort on an array using the provided comparator
 * Maintains original order for items that compare as equal
 *
 * @param {Array} array - Array to sort
 * @param {Function} comparator - Comparison function
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
 * Enhanced table header component with sorting and selection capabilities
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions
 * @param {string} props.order - Current sort order ('asc' or 'desc')
 * @param {string} props.orderBy - Column ID currently being sorted by
 * @param {Function} props.onRequestSort - Callback when sort is requested
 * @param {number} props.numSelected - Number of selected rows
 * @param {number} props.rowCount - Total number of rows
 * @param {Function} props.onSelectAllClick - Callback when select all checkbox is clicked
 * @param {boolean} props.enableSelection - Whether row selection is enabled
 * @returns {React.ReactElement} Rendered table header
 */
function EnhancedTableHead({
  columns,
  order,
  orderBy,
  onRequestSort,
  numSelected,
  rowCount,
  onSelectAllClick,
  enableSelection,
}) {
  // Added display name
  EnhancedTableHead.displayName = 'EnhancedTableHead';

  const createSortHandler = property => event => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow></TableRow>
        {enableSelection && (
          <TableCell padding="checkbox&quot;></TableCell>
            <Checkbox
              indeterminate={numSelected ></Checkbox> 0 && numSelected < rowCount}
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
            }}
            width={column.width}
          ></TableCell>
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

/**
 * Toolbar component for the data table with title, selection actions, filters, and custom actions
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Table title
 * @param {number} props.numSelected - Number of selected rows
 * @param {Function} props.onDeleteSelected - Callback when delete selected action is clicked
 * @param {React.ReactNode} props.actions - Custom action buttons to display in the toolbar
 * @param {React.ReactNode} props.filters - Filter controls to display in the toolbar
 * @returns {React.ReactElement} Rendered toolbar
 */
function EnhancedTableToolbar({ title, numSelected, onDeleteSelected, actions, filters }) {
  // Added display name
  EnhancedTableToolbar.displayName = 'EnhancedTableToolbar';

  const theme = useTheme();

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: theme =>
            alpha(theme.palette.primary.main, theme.palette.mode === 'light' ? 0.08 : 0.2),
        }),
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit&quot; variant="subtitle1" component="div&quot;></Typography>
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 auto', fontWeight: 'bold' }}
          variant="h6&quot;
          id="tableTitle"
          component="div&quot;
        ></Typography>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}></Box>
              {filters}
            </Box>
          )}

          {actions && <Box sx={{ display: 'flex', gap: 1 }}>{actions}</Box>}
        </>
      )}
    </Toolbar>
  );
}

/**
 * Main DataTable component with sorting, filtering, pagination, and selection features
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.title] - Table title displayed in the toolbar
 * @param {Array} [props.data=[]] - Array of data objects to display in the table
 * @param {Array} [props.columns=[]] - Array of column definitions
 * @param {string} [props.initialOrderBy=''] - Initial column ID to sort by
 * @param {string} [props.initialOrder='asc'] - Initial sort order ('asc' or 'desc')
 * @param {boolean} [props.enableSelection=false] - Whether row selection is enabled
 * @param {Array<number>} [props.rowsPerPageOptions=[5, 10, 25]] - Options for rows per page dropdown
 * @param {number} [props.defaultRowsPerPage=10] - Default number of rows per page
 * @param {Function} [props.onRowClick] - Callback when a row is clicked, receives row ID
 * @param {Function} [props.onSelectionChange] - Callback when selection changes, receives array of selected IDs
 * @param {Function} [props.onDeleteSelected] - Callback when delete selected action is clicked
 * @param {React.ReactNode} [props.actions] - Custom action buttons to display in the toolbar
 * @param {React.ReactNode} [props.filters] - Filter controls to display in the toolbar
 * @param {string} [props.emptyMessage="No data available"] - Message to display when table is empty
 * @param {Object} [props.sx={}] - MUI system styles to apply to the component
 * @returns {React.ReactElement} Rendered data table
 */
function DataTable({
  title,
  data = [],
  columns = [],
  initialOrderBy = '',
  initialOrder = 'asc',
  enableSelection = false,
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  onRowClick,
  onSelectionChange,
  onDeleteSelected,
  actions,
  filters,
  emptyMessage = 'No data available',
  sx = {},
}) {
  // Added display name
  DataTable.displayName = 'DataTable';

  // State management
  const [order, setOrder] = useState(initialOrder);
  const [orderBy, setOrderBy] = useState(initialOrderBy);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const theme = useTheme();

  /**
   * Handle column header click to request sorting
   *
   * @param {React.MouseEvent} event - The click event
   * @param {string} property - The column ID to sort by
   */
  const handleRequestSort = (event, property) => {
  // Added display name
  handleRequestSort.displayName = 'handleRequestSort';

  // Added display name
  handleRequestSort.displayName = 'handleRequestSort';

  // Added display name
  handleRequestSort.displayName = 'handleRequestSort';

  // Added display name
  handleRequestSort.displayName = 'handleRequestSort';

  // Added display name
  handleRequestSort.displayName = 'handleRequestSort';


    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * Handle select all checkbox click to select or deselect all rows
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event
   */
  const handleSelectAllClick = event => {
    if (event.target.checked) {
      const newSelected = data.map(n => n.id);
      setSelected(newSelected);
      if (onSelectionChange) onSelectionChange(newSelected);
      return;
    }
    setSelected([]);
    if (onSelectionChange) onSelectionChange([]);
  };

  /**
   * Handle row click for selection or row action
   * If selection is enabled, toggles row selection state
   * Otherwise, calls onRowClick callback with the row ID
   *
   * @param {React.MouseEvent} event - The click event
   * @param {string|number} id - The ID of the clicked row
   */
  const handleRowClick = (event, id) => {
  // Added display name
  handleRowClick.displayName = 'handleRowClick';

  // Added display name
  handleRowClick.displayName = 'handleRowClick';

  // Added display name
  handleRowClick.displayName = 'handleRowClick';

  // Added display name
  handleRowClick.displayName = 'handleRowClick';

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
  };

  /**
   * Handle pagination page change
   *
   * @param {React.MouseEvent} event - The change event
   * @param {number} newPage - The new page number
   */
  const handleChangePage = (event, newPage) => {
  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';

  // Added display name
  handleChangePage.displayName = 'handleChangePage';


    setPage(newPage);
  };

  /**
   * Handle rows per page change from dropdown
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event
   */
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Checks if a row is currently selected
   *
   * @param {string|number} id - The row ID to check
   * @returns {boolean} True if the row is selected
   */
  const isSelected = id => selected.indexOf(id) !== -1;

  /**
   * Calculate number of empty rows to display to maintain consistent height
   * Avoids layout jumps when reaching the last page with fewer items
   */
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  /**
   * Renders a cell value based on column type and configuration
   * Supports custom rendering, formatting, and special types like chips, dates, etc.
   *
   * @param {Object} column - The column definition
   * @param {*} value - The cell value
   * @param {Object} row - The complete row data
   * @returns {React.ReactNode} Rendered cell content
   */
  const renderCellValue = (column, value, row) => {
  // Added display name
  renderCellValue.displayName = 'renderCellValue';

  // Added display name
  renderCellValue.displayName = 'renderCellValue';

  // Added display name
  renderCellValue.displayName = 'renderCellValue';

  // Added display name
  renderCellValue.displayName = 'renderCellValue';

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
          size="small&quot;
          color={column.getChipColor ? column.getChipColor(value, row) : "default'}
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
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: 2,
        border: `1px solid ${theme.colors?.divider || theme.palette.divider}`,
        overflow: 'hidden',
        ...sx,
      }}
    ></Paper>
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
        <Table aria-labelledby="tableTitle" size="medium&quot;>
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
          <TableBody>
            {data.length > 0 ? (
              stableSort(data, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={event =></TableRow> handleRowClick(event, row.id)}
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
                        <TableCell padding="checkbox&quot;></TableCell>
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                            onClick={event =></Checkbox> event.stopPropagation()}
                            onChange={event => handleRowClick(event, row.id)}
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
                            maxWidth: column.maxWidth || 'none',
                            ...(column.bold && { fontWeight: 'bold' }),
                          }}
                        ></TableCell>
                          {renderCellValue(column, row[column.id], row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
            ) : (
              <TableRow></TableRow>
                <TableCell
                  colSpan={columns.length + (enableSelection ? 1 : 0)}
                  align="center&quot;
                  sx={{ py: 8, color: "text.secondary' }}
                ></TableCell>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}></TableRow>
                <TableCell colSpan={columns.length + (enableSelection ? 1 : 0)} />
              </TableRow>
            )}
          </TableBody>
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
    </Paper>
  );
}

export default DataTable;
