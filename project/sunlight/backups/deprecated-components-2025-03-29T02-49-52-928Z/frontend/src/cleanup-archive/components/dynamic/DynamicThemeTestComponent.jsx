// Dynamic import wrapper for ThemeTestComponent
import React, { Suspense } from 'react';

// Lazy load the component
const ThemeTestComponent = React.lazy(() => import('./testing/ThemeTestComponent'));

// Loading placeholder
const ThemeTestComponentLoading = () => (
  <div className="component-loading-placeholder&quot;>
    <div className="loading-spinner"></div>
  </div>
);

/**
 * Dynamic import wrapper for ThemeTestComponent
 * This wrapper lazily loads the component for better code splitting
 */
function DynamicThemeTestComponent(props) {
  // Added display name
  DynamicThemeTestComponent.displayName = 'DynamicThemeTestComponent';

  return (
    <Suspense fallback={<ThemeTestComponentLoading />}>
      <ThemeTestComponent {...props} />
    </Suspense>
  );
}

// Export dynamic version as default
export default DynamicThemeTestComponent;

// Export named version for explicit imports
export { DynamicThemeTestComponent };
