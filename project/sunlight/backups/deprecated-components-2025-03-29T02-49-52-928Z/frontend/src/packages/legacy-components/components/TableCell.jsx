import React from 'react';
import { TableCell } from '@design-system/components/display/Table';
import { Tab } from '../../design-system';
// Design system import already exists;
;

/**
 * Legacy wrapper for TableCell component
 * This provides backward compatibility with Material UI's TableCell component
 */
const TableCell = props => {
  return <TableCell {...props} />;
};


TableCell.displayName = 'TableCell';
export default TableCell;
