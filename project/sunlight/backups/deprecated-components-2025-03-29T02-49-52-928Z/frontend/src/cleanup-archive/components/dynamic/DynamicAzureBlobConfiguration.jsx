// Dynamic import wrapper for AzureBlobConfiguration
import React, { Suspense } from 'react';

// Lazy load the component
const AzureBlobConfiguration = React.lazy(() => import('./integration/AzureBlobConfiguration'));

// Loading placeholder
const AzureBlobConfigurationLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for AzureBlobConfiguration
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicAzureBlobConfiguration(props) {
  // Added display name
  DynamicAzureBlobConfiguration.displayName = 'DynamicAzureBlobConfiguration';

  return (
    <Suspense fallback={<AzureBlobConfigurationLoading />}>
      <AzureBlobConfiguration {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicAzureBlobConfiguration;

// Export named version for explicit imports
export { DynamicAzureBlobConfiguration };
