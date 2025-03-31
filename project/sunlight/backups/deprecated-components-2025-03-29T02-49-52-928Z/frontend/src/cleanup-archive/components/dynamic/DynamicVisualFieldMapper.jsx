// Dynamic import wrapper for VisualFieldMapper
import React, { Suspense } from 'react';

// Lazy load the component
const VisualFieldMapper = React.lazy(() => import('./integration/VisualFieldMapper'));

// Loading placeholder
const VisualFieldMapperLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for VisualFieldMapper
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicVisualFieldMapper(props) {
  // Added display name
  DynamicVisualFieldMapper.displayName = 'DynamicVisualFieldMapper';

  return (
    <Suspense fallback={<VisualFieldMapperLoading />}>
      <VisualFieldMapper {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicVisualFieldMapper;

// Export named version for explicit imports
export { DynamicVisualFieldMapper };
