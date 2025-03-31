// Dynamic import wrapper for TemplateBrowser
import React, { Suspense } from 'react';

// Lazy load the component
const TemplateBrowser = React.lazy(() => import('./integration/TemplateBrowser'));

// Loading placeholder
const TemplateBrowserLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for TemplateBrowser
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicTemplateBrowser(props) {
  // Added display name
  DynamicTemplateBrowser.displayName = 'DynamicTemplateBrowser';

  return (
    <Suspense fallback={<TemplateBrowserLoading />}>
      <TemplateBrowser {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicTemplateBrowser;

// Export named version for explicit imports
export { DynamicTemplateBrowser };
