// Dynamic import wrapper for DocumentationMetrics
import React, { Suspense } from 'react';

// Lazy load the component
const DocumentationMetrics = React.lazy(() => import('./admin/MetricsCharts/DocumentationMetrics'));

// Loading placeholder
const DocumentationMetricsLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for DocumentationMetrics
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicDocumentationMetrics(props) {
  // Added display name
  DynamicDocumentationMetrics.displayName = 'DynamicDocumentationMetrics';

  return (
    <Suspense fallback={<DocumentationMetricsLoading />}>
      <DocumentationMetrics {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicDocumentationMetrics;

// Export named version for explicit imports
export { DynamicDocumentationMetrics };
