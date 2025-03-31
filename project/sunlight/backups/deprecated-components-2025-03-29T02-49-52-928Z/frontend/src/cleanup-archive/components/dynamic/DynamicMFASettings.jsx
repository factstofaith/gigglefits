// Dynamic import wrapper for MFASettings
import React, { Suspense } from 'react';

// Lazy load the component
const MFASettings = React.lazy(() => import('./admin/MFASettings'));

// Loading placeholder
const MFASettingsLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for MFASettings
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicMFASettings(props) {
  // Added display name
  DynamicMFASettings.displayName = 'DynamicMFASettings';

  return (
    <Suspense fallback={<MFASettingsLoading />}>
      <MFASettings {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicMFASettings;

// Export named version for explicit imports
export { DynamicMFASettings };
