// Dynamic import wrapper for UserManagement
import React, { Suspense } from 'react';

// Lazy load the component
const UserManagement = React.lazy(() => import('./admin/UserManagement'));

// Loading placeholder
const UserManagementLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for UserManagement
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicUserManagement(props) {
  // Added display name
  DynamicUserManagement.displayName = 'DynamicUserManagement';

  return (
    <Suspense fallback={<UserManagementLoading />}>
      <UserManagement {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicUserManagement;

// Export named version for explicit imports
export { DynamicUserManagement };
