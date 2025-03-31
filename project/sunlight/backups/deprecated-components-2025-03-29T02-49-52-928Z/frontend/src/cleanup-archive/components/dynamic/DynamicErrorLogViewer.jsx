// Dynamic import wrapper for ErrorLogViewer
import React, { Suspense } from 'react';

// Lazy load the component
const ErrorLogViewer = React.lazy(() => import('./admin/ErrorLogViewer'));

// Loading placeholder
const ErrorLogViewerLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ErrorLogViewer
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicErrorLogViewer(props) {
  // Added display name
  DynamicErrorLogViewer.displayName = 'DynamicErrorLogViewer';

  return (
    <Suspense fallback={<ErrorLogViewerLoading />}>
      <ErrorLogViewer {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicErrorLogViewer;

// Export named version for explicit imports
export { DynamicErrorLogViewer };
