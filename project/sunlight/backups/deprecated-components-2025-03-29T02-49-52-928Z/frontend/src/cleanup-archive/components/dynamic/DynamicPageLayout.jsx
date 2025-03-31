// Dynamic import wrapper for PageLayout
import React, { Suspense } from 'react';

// Lazy load the component
const PageLayout = React.lazy(() => import('./common/PageLayout'));

// Loading placeholder
const PageLayoutLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for PageLayout
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicPageLayout(props) {
  // Added display name
  DynamicPageLayout.displayName = 'DynamicPageLayout';

  return (
    <Suspense fallback={<PageLayoutLoading />}>
      <PageLayout {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicPageLayout;

// Export named version for explicit imports
export { DynamicPageLayout };
