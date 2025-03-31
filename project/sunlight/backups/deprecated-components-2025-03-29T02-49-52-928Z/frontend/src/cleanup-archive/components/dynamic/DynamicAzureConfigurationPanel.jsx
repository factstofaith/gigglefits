// Dynamic import wrapper for AzureConfigurationPanel
import React, { Suspense } from 'react';

// Lazy load the component
const AzureConfigurationPanel = React.lazy(() => import('./admin/AzureConfigurationPanel'));

// Loading placeholder
const AzureConfigurationPanelLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for AzureConfigurationPanel
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicAzureConfigurationPanel(props) {
  // Added display name
  DynamicAzureConfigurationPanel.displayName = 'DynamicAzureConfigurationPanel';

  return (
    <Suspense fallback={<AzureConfigurationPanelLoading />}>
      <AzureConfigurationPanel {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicAzureConfigurationPanel;

// Export named version for explicit imports
export { DynamicAzureConfigurationPanel };
