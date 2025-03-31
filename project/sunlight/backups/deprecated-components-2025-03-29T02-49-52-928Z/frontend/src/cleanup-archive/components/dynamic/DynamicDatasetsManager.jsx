// Dynamic import wrapper for DatasetsManager
import React, { Suspense } from 'react';

// Lazy load the component
const DatasetsManager = React.lazy(() => import('./admin/DatasetsManager'));

// Loading placeholder
const DatasetsManagerLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for DatasetsManager
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicDatasetsManager(props) {
  // Added display name
  DynamicDatasetsManager.displayName = 'DynamicDatasetsManager';

  return (
    <Suspense fallback={<DatasetsManagerLoading />}>
      <DatasetsManager {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicDatasetsManager;

// Export named version for explicit imports
export { DynamicDatasetsManager };
