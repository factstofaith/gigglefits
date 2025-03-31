// Dynamic import wrapper for RunLogViewer
import React, { Suspense } from 'react';

// Lazy load the component
const RunLogViewer = React.lazy(() => import('./integration/RunLogViewer'));

// Loading placeholder
const RunLogViewerLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for RunLogViewer
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicRunLogViewer(props) {
  // Added display name
  DynamicRunLogViewer.displayName = 'DynamicRunLogViewer';

  return (
    <Suspense fallback={<RunLogViewerLoading />}>
      <RunLogViewer {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicRunLogViewer;

// Export named version for explicit imports
export { DynamicRunLogViewer };
