// Dynamic import wrapper for FilePreviewComponent
import React, { Suspense } from 'react';

// Lazy load the component
const FilePreviewComponent = React.lazy(() => import('./integration/FilePreviewComponent'));

// Loading placeholder
const FilePreviewComponentLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for FilePreviewComponent
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicFilePreviewComponent(props) {
  // Added display name
  DynamicFilePreviewComponent.displayName = 'DynamicFilePreviewComponent';

  return (
    <Suspense fallback={<FilePreviewComponentLoading />}>
      <FilePreviewComponent {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicFilePreviewComponent;

// Export named version for explicit imports
export { DynamicFilePreviewComponent };
