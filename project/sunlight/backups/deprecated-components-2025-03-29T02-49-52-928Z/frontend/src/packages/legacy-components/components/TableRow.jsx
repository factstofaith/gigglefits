import React from 'react';
import { TableRow } from '@design-system/components/display/Table';
import { Tab } from '../../design-system';
// Design system import already exists;
;

/**
 * Legacy wrapper for TableRow component
 * This provides backward compatibility with Material UI's TableRow component
 */
const TableRow = props => {
  return <TableRow {...props} />;
};


TableRow.displayName = 'TableRow';
export default TableRow;
