// TestDataTable.jsx
// A standalone version of DataTable for testing without Material UI or other dependencies

import React, { useState } from 'react';

/**
 * Utility function for sorting data in descending order by a specific property
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
 * Simplified DataTable for testing purposes
 */
function TestDataTable({
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
  emptyMessage = 'No data available',
}) {
  // Added display name
  TestDataTable.displayName = 'TestDataTable';

  // State management
  const [order, setOrder] = useState(initialOrder);
  const [orderBy, setOrderBy] = useState(initialOrderBy);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  /**
   * Handle column header click to request sorting
   */
  const handleRequestSort = property => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  /**
   * Handle select all checkbox click
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
   */
  const handleRowClick = id => {
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
   */
  const handleChangePage = newPage => {
    setPage(newPage);
  };

  /**
   * Handle rows per page change
   */
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Checks if a row is currently selected
   */
  const isSelected = id => selected.indexOf(id) !== -1;

  /**
   * Renders a cell value based on column type
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
        <span
          className="data-table-chip&quot;
          data-color={column.getChipColor ? column.getChipColor(value, row) : "default'}
        >
          {value}
        </span>
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

  // Get displayed rows
  const displayedRows = stableSort(data, getComparator(order, orderBy)).slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="test-data-table&quot; data-testid="data-table">
      {/* Table header/toolbar */}
      {title && (
        <div className="data-table-toolbar&quot; data-testid="data-table-toolbar">
          {selected.length > 0 ? (
            <div className="data-table-selected-count&quot;>
              {selected.length} selected
              {onDeleteSelected && (
                <button
                  className="data-table-delete-button"
                  onClick={onDeleteSelected}
                  data-testid="delete-selected-button"
                >
                  Delete Selected
                </button>
              )}
            </div>
          ) : (
            <div className="data-table-title&quot; data-testid="data-table-title">
              {title}
            </div>
          )}

          {actions && selected.length === 0 && (
            <div className="data-table-actions&quot; data-testid="data-table-actions">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <table className="data-table-table&quot; data-testid="data-table-table">
        <thead>
          <tr>
            {enableSelection && (
              <th className="data-table-checkbox-column&quot;>
                <input
                  type="checkbox"
                  onChange={handleSelectAllClick}
                  checked={data.length > 0 && selected.length === data.length}
                  data-testid="select-all-checkbox"
                />
              </th>
            )}

            {columns.map(column => (
              <th
                key={column.id}
                className={`data-table-header-cell ${column.numeric ? 'align-right' : ''}`}
                data-testid={`column-header-${column.id}`}
              >
                {column.sortable !== false ? (
                  <button
                    className={`data-table-sort-button ${orderBy === column.id ? `sort-${order}` : ''}`}
                    onClick={() => handleRequestSort(column.id)}
                    data-testid={`sort-button-${column.id}`}
                  >
                    {column.label}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {displayedRows.length > 0 ? (
            displayedRows.map(row => {
              const isItemSelected = isSelected(row.id);

              return (
                <tr
                  key={row.id}
                  className={`data-table-row ${isItemSelected ? 'selected' : ''}`}
                  onClick={() => handleRowClick(row.id)}
                  data-testid={`table-row-${row.id}`}
                  data-selected={isItemSelected}
                >
                  {enableSelection && (
                    <td className="data-table-checkbox-cell&quot;>
                      <input
                        type="checkbox"
                        checked={isItemSelected}
                        onChange={e => {
                          e.stopPropagation();
                          handleRowClick(row.id);
                        }}
                        onClick={e => e.stopPropagation()}
                        data-testid={`row-checkbox-${row.id}`}
                      />
                    </td>
                  )}

                  {columns.map(column => (
                    <td
                      key={`${row.id}-${column.id}`}
                      className={`data-table-cell ${column.numeric ? 'align-right' : ''}`}
                      data-testid={`cell-${row.id}-${column.id}`}
                    >
                      {renderCellValue(column, row[column.id], row)}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={columns.length + (enableSelection ? 1 : 0)}
                className="data-table-empty-message&quot;
                data-testid="empty-message"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="data-table-pagination&quot; data-testid="data-table-pagination">
        <div className="data-table-rows-per-page&quot;>
          Rows per page:
          <select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            data-testid="rows-per-page-select"
          >
            {rowsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="data-table-page-info&quot;>
          {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, data.length)} of{" '}
          {data.length}
        </div>

        <div className="data-table-pagination-controls&quot;>
          <button
            onClick={() => handleChangePage(page - 1)}
            disabled={page === 0}
            className="data-table-pagination-button"
            data-testid="previous-page-button"
          >
            Previous
          </button>
          <button
            onClick={() => handleChangePage(page + 1)}
            disabled={page >= Math.ceil(data.length / rowsPerPage) - 1}
            className="data-table-pagination-button&quot;
            data-testid="next-page-button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestDataTable;
