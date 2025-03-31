import React from 'react';
import { TableHead } from '@design-system/components/display/Table';
import { Tab } from '../../design-system';
// Design system import already exists;
;

/**
 * Legacy wrapper for TableHead component
 * This provides backward compatibility with Material UI's TableHead component
 */
const TableHead = props => {
  return <TableHead {...props} />;
};


TableHead.displayName = 'TableHead';
export default TableHead;
