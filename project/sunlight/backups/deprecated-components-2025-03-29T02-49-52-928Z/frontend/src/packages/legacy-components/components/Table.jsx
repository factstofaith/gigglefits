import React from 'react';
import Table from '@design-system/components/display/Table';

/**
 * Legacy wrapper for Table component
 * This provides backward compatibility with Material UI's Table component
 */
const Table = props => {
  return <Table {...props} />;
};


Table.displayName = 'Table';
export default Table;
