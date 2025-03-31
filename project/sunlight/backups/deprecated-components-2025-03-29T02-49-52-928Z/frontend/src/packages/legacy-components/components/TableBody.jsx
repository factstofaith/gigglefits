import React from 'react';
import { TableBody } from '@design-system/components/display/Table';
import { Tab } from '../../design-system';
// Design system import already exists;
;

/**
 * Legacy wrapper for TableBody component
 * This provides backward compatibility with Material UI's TableBody component
 */
const TableBody = props => {
  return <TableBody {...props} />;
};


TableBody.displayName = 'TableBody';
export default TableBody;
