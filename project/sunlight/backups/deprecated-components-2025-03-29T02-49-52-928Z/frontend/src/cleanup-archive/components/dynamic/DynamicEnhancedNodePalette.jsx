// Dynamic import wrapper for EnhancedNodePalette
import React, { Suspense } from 'react';

// Lazy load the component
const EnhancedNodePalette = React.lazy(() => import('./integration/EnhancedNodePalette'));

// Loading placeholder
const EnhancedNodePaletteLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for EnhancedNodePalette
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicEnhancedNodePalette(props) {
  // Added display name
  DynamicEnhancedNodePalette.displayName = 'DynamicEnhancedNodePalette';

  return (
    <Suspense fallback={<EnhancedNodePaletteLoading />}>
      <EnhancedNodePalette {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicEnhancedNodePalette;

// Export named version for explicit imports
export { DynamicEnhancedNodePalette };
