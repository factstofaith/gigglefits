// Dynamic import wrapper for SecuritySettings
import React, { Suspense } from 'react';

// Lazy load the component
const SecuritySettings = React.lazy(() => import('./profile/SecuritySettings'));

// Loading placeholder
const SecuritySettingsLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for SecuritySettings
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicSecuritySettings(props) {
  // Added display name
  DynamicSecuritySettings.displayName = 'DynamicSecuritySettings';

  return (
    <Suspense fallback={<SecuritySettingsLoading />}>
      <SecuritySettings {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicSecuritySettings;

// Export named version for explicit imports
export { DynamicSecuritySettings };
