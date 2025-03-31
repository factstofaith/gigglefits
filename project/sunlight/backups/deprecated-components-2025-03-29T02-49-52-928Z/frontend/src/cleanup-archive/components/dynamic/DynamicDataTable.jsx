// Dynamic import wrapper for DataTable
import React, { Suspense } from 'react';

// Lazy load the component
const DataTable = React.lazy(() => import('./common/DataTable'));

// Loading placeholder
const DataTableLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for DataTable
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicDataTable(props) {
  // Added display name
  DynamicDataTable.displayName = 'DynamicDataTable';

  return (
    <Suspense fallback={<DataTableLoading />}>
      <DataTable {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicDataTable;

// Export named version for explicit imports
export { DynamicDataTable };
