// Dynamic import wrapper for ApplicationsManager
import React, { Suspense } from 'react';

// Lazy load the component
const ApplicationsManager = React.lazy(() => import('./admin/ApplicationsManager'));

// Loading placeholder
const ApplicationsManagerLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ApplicationsManager
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicApplicationsManager(props) {
  // Added display name
  DynamicApplicationsManager.displayName = 'DynamicApplicationsManager';

  return (
    <Suspense fallback={<ApplicationsManagerLoading />}>
      <ApplicationsManager {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicApplicationsManager;

// Export named version for explicit imports
export { DynamicApplicationsManager };
