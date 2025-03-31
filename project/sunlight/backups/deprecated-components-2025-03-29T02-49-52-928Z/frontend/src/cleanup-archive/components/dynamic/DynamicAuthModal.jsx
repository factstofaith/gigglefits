// Dynamic import wrapper for AuthModal
import React, { Suspense } from 'react';

// Lazy load the component
const AuthModal = React.lazy(() => import('./common/AuthModal'));

// Loading placeholder
const AuthModalLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for AuthModal
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicAuthModal(props) {
  // Added display name
  DynamicAuthModal.displayName = 'DynamicAuthModal';

  return (
    <Suspense fallback={<AuthModalLoading />}>
      <AuthModal {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicAuthModal;

// Export named version for explicit imports
export { DynamicAuthModal };
