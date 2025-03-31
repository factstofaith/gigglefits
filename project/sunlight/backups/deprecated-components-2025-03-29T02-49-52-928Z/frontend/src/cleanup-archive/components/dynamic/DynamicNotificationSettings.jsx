// Dynamic import wrapper for NotificationSettings
import React, { Suspense } from 'react';

// Lazy load the component
const NotificationSettings = React.lazy(() => import('./integration/NotificationSettings'));

// Loading placeholder
const NotificationSettingsLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for NotificationSettings
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicNotificationSettings(props) {
  // Added display name
  DynamicNotificationSettings.displayName = 'DynamicNotificationSettings';

  return (
    <Suspense fallback={<NotificationSettingsLoading />}>
      <NotificationSettings {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicNotificationSettings;

// Export named version for explicit imports
export { DynamicNotificationSettings };
