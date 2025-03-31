// Dynamic import wrapper for UserProfile
import React, { Suspense } from 'react';

// Lazy load the component
const UserProfile = React.lazy(() => import('./profile/UserProfile'));

// Loading placeholder
const UserProfileLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for UserProfile
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicUserProfile(props) {
  // Added display name
  DynamicUserProfile.displayName = 'DynamicUserProfile';

  return (
    <Suspense fallback={<UserProfileLoading />}>
      <UserProfile {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicUserProfile;

// Export named version for explicit imports
export { DynamicUserProfile };
