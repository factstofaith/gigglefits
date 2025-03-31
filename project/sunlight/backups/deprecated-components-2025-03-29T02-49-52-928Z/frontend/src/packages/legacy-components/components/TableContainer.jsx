import React from 'react';
import { TableContainer } from '@design-system/components/display/Table';
import { Tab } from '../../design-system';
// Design system import already exists;
;

/**
 * Legacy wrapper for TableContainer component
 * This provides backward compatibility with Material UI's TableContainer component
 */
const TableContainer = props => {
  return <TableContainer {...props} />;
};


TableContainer.displayName = 'TableContainer';
export default TableContainer;
