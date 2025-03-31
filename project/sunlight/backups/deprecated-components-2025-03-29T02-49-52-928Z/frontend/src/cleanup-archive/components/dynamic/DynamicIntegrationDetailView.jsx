// Dynamic import wrapper for IntegrationDetailView
import React, { Suspense } from 'react';

// Lazy load the component
const IntegrationDetailView = React.lazy(() => import('./integration/IntegrationDetailView'));

// Loading placeholder
const IntegrationDetailViewLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for IntegrationDetailView
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicIntegrationDetailView(props) {
  // Added display name
  DynamicIntegrationDetailView.displayName = 'DynamicIntegrationDetailView';

  return (
    <Suspense fallback={<IntegrationDetailViewLoading />}>
      <IntegrationDetailView {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicIntegrationDetailView;

// Export named version for explicit imports
export { DynamicIntegrationDetailView };
