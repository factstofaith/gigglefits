// Dynamic import wrapper for TenantsManager
import React, { Suspense } from 'react';

// Lazy load the component
const TenantsManager = React.lazy(() => import('./admin/TenantsManager'));

// Loading placeholder
const TenantsManagerLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for TenantsManager
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicTenantsManager(props) {
  // Added display name
  DynamicTenantsManager.displayName = 'DynamicTenantsManager';

  return (
    <Suspense fallback={<TenantsManagerLoading />}>
      <TenantsManager {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicTenantsManager;

// Export named version for explicit imports
export { DynamicTenantsManager };
