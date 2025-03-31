// Dynamic import wrapper for Navigation
import React, { Suspense } from 'react';

// Lazy load the component
const Navigation = React.lazy(() => import('./common/Navigation'));

// Loading placeholder
const NavigationLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for Navigation
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicNavigation(props) {
  // Added display name
  DynamicNavigation.displayName = 'DynamicNavigation';

  return (
    <Suspense fallback={<NavigationLoading />}>
      <Navigation {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicNavigation;

// Export named version for explicit imports
export { DynamicNavigation };
