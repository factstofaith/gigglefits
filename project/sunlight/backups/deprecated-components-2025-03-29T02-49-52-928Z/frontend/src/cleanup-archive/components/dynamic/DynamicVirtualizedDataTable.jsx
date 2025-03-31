// Dynamic import wrapper for VirtualizedDataTable
import React, { Suspense } from 'react';

// Lazy load the component
const VirtualizedDataTable = React.lazy(() => import('./common/VirtualizedDataTable'));

// Loading placeholder
const VirtualizedDataTableLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for VirtualizedDataTable
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicVirtualizedDataTable(props) {
  // Added display name
  DynamicVirtualizedDataTable.displayName = 'DynamicVirtualizedDataTable';

  return (
    <Suspense fallback={<VirtualizedDataTableLoading />}>
      <VirtualizedDataTable {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicVirtualizedDataTable;

// Export named version for explicit imports
export { DynamicVirtualizedDataTable };
