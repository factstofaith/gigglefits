import React from 'react';

/**
 * Legacy wrapper for TablePagination from @mui/material
 *
 * This component provides backward compatibility with Material UI's TablePagination
 * while using the new design system under the hood.
 */
const TablePagination = props => {
  // For now, we're just passing through to the original component
  // In the future, this will be replaced with a custom implementation
  return <TablePagination {...props} />;
};


TablePagination.displayName = 'TablePagination';
export default TablePagination;
