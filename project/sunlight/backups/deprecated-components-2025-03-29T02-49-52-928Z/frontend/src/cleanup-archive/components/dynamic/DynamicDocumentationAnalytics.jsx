// Dynamic import wrapper for DocumentationAnalytics
import React, { Suspense } from 'react';

// Lazy load the component
const DocumentationAnalytics = React.lazy(() => import('./admin/DocumentationAnalytics'));

// Loading placeholder
const DocumentationAnalyticsLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for DocumentationAnalytics
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicDocumentationAnalytics(props) {
  // Added display name
  DynamicDocumentationAnalytics.displayName = 'DynamicDocumentationAnalytics';

  return (
    <Suspense fallback={<DocumentationAnalyticsLoading />}>
      <DocumentationAnalytics {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicDocumentationAnalytics;

// Export named version for explicit imports
export { DynamicDocumentationAnalytics };
