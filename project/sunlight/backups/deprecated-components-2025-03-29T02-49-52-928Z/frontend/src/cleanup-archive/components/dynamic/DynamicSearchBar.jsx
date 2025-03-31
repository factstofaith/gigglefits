// Dynamic import wrapper for SearchBar
import React, { Suspense } from 'react';

// Lazy load the component
const SearchBar = React.lazy(() => import('./common/SearchBar'));

// Loading placeholder
const SearchBarLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for SearchBar
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicSearchBar(props) {
  // Added display name
  DynamicSearchBar.displayName = 'DynamicSearchBar';

  return (
    <Suspense fallback={<SearchBarLoading />}>
      <SearchBar {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicSearchBar;

// Export named version for explicit imports
export { DynamicSearchBar };
