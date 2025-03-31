// Dynamic import wrapper for AlertConfiguration
import React, { Suspense } from 'react';

// Lazy load the component
const AlertConfiguration = React.lazy(() => import('./admin/AlertConfiguration'));

// Loading placeholder
const AlertConfigurationLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for AlertConfiguration
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicAlertConfiguration(props) {
  // Added display name
  DynamicAlertConfiguration.displayName = 'DynamicAlertConfiguration';

  return (
    <Suspense fallback={<AlertConfigurationLoading />}>
      <AlertConfiguration {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicAlertConfiguration;

// Export named version for explicit imports
export { DynamicAlertConfiguration };
