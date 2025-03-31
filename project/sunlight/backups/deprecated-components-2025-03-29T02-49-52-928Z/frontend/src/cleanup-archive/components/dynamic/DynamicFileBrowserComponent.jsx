// Dynamic import wrapper for FileBrowserComponent
import React, { Suspense } from 'react';

// Lazy load the component
const FileBrowserComponent = React.lazy(() => import('./integration/FileBrowserComponent'));

// Loading placeholder
const FileBrowserComponentLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for FileBrowserComponent
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicFileBrowserComponent(props) {
  // Added display name
  DynamicFileBrowserComponent.displayName = 'DynamicFileBrowserComponent';

  return (
    <Suspense fallback={<FileBrowserComponentLoading />}>
      <FileBrowserComponent {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicFileBrowserComponent;

// Export named version for explicit imports
export { DynamicFileBrowserComponent };
