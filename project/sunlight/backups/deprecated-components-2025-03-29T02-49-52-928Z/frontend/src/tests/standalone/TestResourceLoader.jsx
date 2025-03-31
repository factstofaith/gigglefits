// TestResourceLoader.jsx
// A standalone version of ResourceLoader for testing without MSW dependencies

import React from 'react';

// Simplified skeleton component for loading state
const Skeleton = ({ height, width, children }) => {
  // Added display name
  Skeleton.displayName = 'Skeleton';

  // Added display name
  Skeleton.displayName = 'Skeleton';

  // Added display name
  Skeleton.displayName = 'Skeleton';

  // Added display name
  Skeleton.displayName = 'Skeleton';

  // Added display name
  Skeleton.displayName = 'Skeleton';


  if (children) {
    return children;
  }

  return (
    <div
      data-testid="skeleton"
      style={{
        height: height || 100,
        width: width || '100%',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
      }}
    />
  );
};

// Error display component
const ErrorDisplay = ({ error, onRetry }) => {
  // Added display name
  ErrorDisplay.displayName = 'ErrorDisplay';

  // Added display name
  ErrorDisplay.displayName = 'ErrorDisplay';

  // Added display name
  ErrorDisplay.displayName = 'ErrorDisplay';

  // Added display name
  ErrorDisplay.displayName = 'ErrorDisplay';

  // Added display name
  ErrorDisplay.displayName = 'ErrorDisplay';


  const errorMsg = error || 'There was an error loading the requested data.';

  return (
    <div data-testid="error-display" className="error-display&quot;>
      <h4>Error Loading Data</h4>
      <p>{errorMsg}</p>
      {onRetry && <button onClick={onRetry}>Try Again</button>}
    </div>
  );
};

// Empty state component
const EmptyState = ({ message, actionComponent }) => {
  // Added display name
  EmptyState.displayName = "EmptyState';

  // Added display name
  EmptyState.displayName = 'EmptyState';

  // Added display name
  EmptyState.displayName = 'EmptyState';

  // Added display name
  EmptyState.displayName = 'EmptyState';

  // Added display name
  EmptyState.displayName = 'EmptyState';


  return (
    <div data-testid="empty-state" className="empty-state&quot;>
      <p>{message || "No Items Found'}</p>
      {actionComponent}
    </div>
  );
};

// Main ResourceLoader component
const ResourceLoader = ({
  children,
  isLoading,
  loadingComponent,
  renderLoading,
  error,
  renderError,
  onRetry,
  isEmpty,
  emptyMessage,
  emptyActionComponent,
  renderEmpty,
}) => {
  // Added display name
  ResourceLoader.displayName = 'ResourceLoader';

  // Added display name
  ResourceLoader.displayName = 'ResourceLoader';

  // Added display name
  ResourceLoader.displayName = 'ResourceLoader';

  // Added display name
  ResourceLoader.displayName = 'ResourceLoader';

  // Added display name
  ResourceLoader.displayName = 'ResourceLoader';


  // Priority 1: Loading state
  if (isLoading) {
    if (renderLoading) {
      return renderLoading();
    }

    if (loadingComponent) {
      return loadingComponent;
    }

    return <Skeleton />;
  }

  // Priority 2: Error state
  if (error) {
    if (renderError) {
      return renderError(error, onRetry);
    }

    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  // Priority 3: Empty state
  if (isEmpty) {
    if (renderEmpty) {
      return renderEmpty();
    }

    return <EmptyState message={emptyMessage} actionComponent={emptyActionComponent} />;
  }

  // Default: Content
  return children;
};

export { ResourceLoader, Skeleton, ErrorDisplay, EmptyState };
export default ResourceLoader;
