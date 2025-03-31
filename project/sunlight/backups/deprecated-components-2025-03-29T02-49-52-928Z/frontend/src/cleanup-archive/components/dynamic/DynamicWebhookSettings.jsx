// Dynamic import wrapper for WebhookSettings
import React, { Suspense } from 'react';

// Lazy load the component
const WebhookSettings = React.lazy(() => import('./integration/WebhookSettings'));

// Loading placeholder
const WebhookSettingsLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for WebhookSettings
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicWebhookSettings(props) {
  // Added display name
  DynamicWebhookSettings.displayName = 'DynamicWebhookSettings';

  return (
    <Suspense fallback={<WebhookSettingsLoading />}>
      <WebhookSettings {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicWebhookSettings;

// Export named version for explicit imports
export { DynamicWebhookSettings };
