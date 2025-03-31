// Dynamic import wrapper for DataPreviewComponent
import React, { Suspense } from 'react';

// Lazy load the component
const DataPreviewComponent = React.lazy(() => import('./integration/DataPreviewComponent'));

// Loading placeholder
const DataPreviewComponentLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for DataPreviewComponent
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicDataPreviewComponent(props) {
  // Added display name
  DynamicDataPreviewComponent.displayName = 'DynamicDataPreviewComponent';

  return (
    <Suspense fallback={<DataPreviewComponentLoading />}>
      <DataPreviewComponent {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicDataPreviewComponent;

// Export named version for explicit imports
export { DynamicDataPreviewComponent };
