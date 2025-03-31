// Dynamic import wrapper for ReleasesManager
import React, { Suspense } from 'react';

// Lazy load the component
const ReleasesManager = React.lazy(() => import('./admin/ReleasesManager'));

// Loading placeholder
const ReleasesManagerLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ReleasesManager
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicReleasesManager(props) {
  // Added display name
  DynamicReleasesManager.displayName = 'DynamicReleasesManager';

  return (
    <Suspense fallback={<ReleasesManagerLoading />}>
      <ReleasesManager {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicReleasesManager;

// Export named version for explicit imports
export { DynamicReleasesManager };
