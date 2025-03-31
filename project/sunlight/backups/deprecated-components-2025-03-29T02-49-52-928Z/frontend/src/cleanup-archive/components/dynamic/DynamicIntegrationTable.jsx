// Dynamic import wrapper for IntegrationTable
import React, { Suspense } from 'react';

// Lazy load the component
const IntegrationTable = React.lazy(() => import('./integration/IntegrationTable'));

// Loading placeholder
const IntegrationTableLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for IntegrationTable
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicIntegrationTable(props) {
  // Added display name
  DynamicIntegrationTable.displayName = 'DynamicIntegrationTable';

  return (
    <Suspense fallback={<IntegrationTableLoading />}>
      <IntegrationTable {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicIntegrationTable;

// Export named version for explicit imports
export { DynamicIntegrationTable };
