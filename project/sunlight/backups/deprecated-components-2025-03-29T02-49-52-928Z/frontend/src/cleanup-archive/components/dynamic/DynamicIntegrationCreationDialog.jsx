// Dynamic import wrapper for IntegrationCreationDialog
import React, { Suspense } from 'react';

// Lazy load the component
const IntegrationCreationDialog = React.lazy(() => import('./integration/IntegrationCreationDialog'));

// Loading placeholder
const IntegrationCreationDialogLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for IntegrationCreationDialog
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicIntegrationCreationDialog(props) {
  // Added display name
  DynamicIntegrationCreationDialog.displayName = 'DynamicIntegrationCreationDialog';

  return (
    <Suspense fallback={<IntegrationCreationDialogLoading />}>
      <IntegrationCreationDialog {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicIntegrationCreationDialog;

// Export named version for explicit imports
export { DynamicIntegrationCreationDialog };
