// ResourceLoader.jsx
// -----------------------------------------------------------------------------
// A generic loader component that handles loading, error, and empty states consistently
// Optimized with React.memo and extracted memoized subcomponents

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Box } from '../../design-system';
import { Typography, Button } from '../../design-system';
import { CircularProgress, Skeleton } from '../../design-system';
import { useTheme } from '@design-system/foundations/theme';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Box from '@mui/material/Box';
// Memoized skeleton loader component
const SkeletonLoader = memo(({ height, width, variant, animation, children }) => {
  if (children) {
    return children;
  }

  return <Skeleton variant={variant} height={height} width={width} animation={animation} />;
});

SkeletonLoader.propTypes = {
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  variant: PropTypes.oneOf(['text', 'rectangular', 'circular']),
  animation: PropTypes.oneOf(['pulse', 'wave', 'none']),
  children: PropTypes.node,
};

SkeletonLoader.defaultProps = {
  height: 100,
  width: '100%',
  variant: 'rectangular',
  animation: 'pulse',
  children: null,
};

// Memoized error display component
const ErrorDisplay = memo(({ error, onRetry }) => {
  const { theme } = useTheme();
  
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme?.spacing?.lg || '24px',
        textAlign: 'center',
      }}
    >
      <ErrorOutlineIcon 
        style={{ 
          fontSize: 48, 
          marginBottom: theme?.spacing?.md || '16px',
          color: theme?.colors?.error?.main || '#f44336' 
        }} 
      />
      <Typography 
        variant="h6" 
        style={{ 
          color: theme?.colors?.error?.main || '#f44336',
          marginBottom: theme?.spacing?.xs || '8px' 
        }}
      >
        Error Loading Data
      </Typography>
      <Typography 
        variant="body2" 
        style={{ 
          color: theme?.colors?.text?.secondary || '#757575',
          marginBottom: theme?.spacing?.md || '16px' 
        }}
      >
        {error || 'There was an error loading the requested data.'}
      </Typography>
      {onRetry && (
        <Button variant="outlined" size="small" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
});

ErrorDisplay.propTypes = {
  error: PropTypes.string,
  onRetry: PropTypes.func,
};

ErrorDisplay.defaultProps = {
  error: null,
  onRetry: null,
};

// Memoized empty state component
const EmptyState = memo(({ message, icon, actionComponent }) => {
  const { theme } = useTheme();
  
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme?.spacing?.lg || '24px',
        textAlign: 'center',
      }}
    >
      {icon || (
        <InfoOutlinedIcon 
          style={{ 
            fontSize: 48, 
            marginBottom: theme?.spacing?.md || '16px', 
            opacity: 0.6,
            color: theme?.colors?.action?.active || '#757575' 
          }} 
        />
      )}
      <Typography 
        variant="h6" 
        style={{ 
          color: theme?.colors?.text?.secondary || '#757575',
          marginBottom: theme?.spacing?.xs || '8px'
        }}
      >
        {message || 'No Items Found'}
      </Typography>
      {actionComponent}
    </Box>
  );
});

EmptyState.propTypes = {
  message: PropTypes.string,
  icon: PropTypes.node,
  actionComponent: PropTypes.node,
};

EmptyState.defaultProps = {
  message: null,
  icon: null,
  actionComponent: null,
};

// Custom comparison function for ResourceLoader
// Only re-render if relevant props have changed
const areEqual = (prevProps, nextProps) => {
  // Added display name
  areEqual.displayName = 'areEqual';

  // Added display name
  areEqual.displayName = 'areEqual';

  // Added display name
  areEqual.displayName = 'areEqual';


  // Fast path for reference equality
  if (prevProps === nextProps) {
    return true;
  }

  // Compare loading state
  if (prevProps.isLoading !== nextProps.isLoading) {
    return false;
  }

  // Compare error state
  if (prevProps.error !== nextProps.error || prevProps.onRetry !== nextProps.onRetry) {
    return false;
  }

  // Compare empty state
  if (
    prevProps.isEmpty !== nextProps.isEmpty ||
    prevProps.emptyMessage !== nextProps.emptyMessage ||
    prevProps.emptyIcon !== nextProps.emptyIcon ||
    prevProps.emptyActionComponent !== nextProps.emptyActionComponent
  ) {
    return false;
  }

  // Compare render props
  if (
    prevProps.renderLoading !== nextProps.renderLoading ||
    prevProps.renderError !== nextProps.renderError ||
    prevProps.renderEmpty !== nextProps.renderEmpty ||
    prevProps.children !== nextProps.children
  ) {
    return false;
  }

  // Compare skeleton props
  if (
    prevProps.skeletonHeight !== nextProps.skeletonHeight ||
    prevProps.skeletonWidth !== nextProps.skeletonWidth ||
    prevProps.skeletonVariant !== nextProps.skeletonVariant ||
    prevProps.skeletonAnimation !== nextProps.skeletonAnimation
  ) {
    return false;
  }

  // No relevant props changed
  return true;
};

/**
 * ResourceLoader - A component for handling resource loading, error, and empty states
 * Optimized with React.memo and custom comparison for maximum performance
 */
const ResourceLoader = ({
  isLoading,
  error,
  isEmpty,
  onRetry,
  emptyMessage,
  emptyIcon,
  emptyActionComponent,
  renderLoading,
  renderError,
  renderEmpty,
  skeletonHeight,
  skeletonWidth,
  skeletonVariant,
  skeletonAnimation,
  loadingComponent,
  children,
}) => {
  // Added display name
  ResourceLoader.displayName = 'ResourceLoader';

  // Added display name
  ResourceLoader.displayName = 'ResourceLoader';

  // Added display name
  ResourceLoader.displayName = 'ResourceLoader';


  // Show loading state
  if (isLoading) {
    if (renderLoading) {
      return renderLoading();
    }

    if (loadingComponent) {
      return loadingComponent;
    }

    return (
      <SkeletonLoader
        height={skeletonHeight}
        width={skeletonWidth}
        variant={skeletonVariant}
        animation={skeletonAnimation}
      />
    );
  }

  // Show error state
  if (error) {
    if (renderError) {
      return renderError(error, onRetry);
    }

    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  // Show empty state
  if (isEmpty) {
    if (renderEmpty) {
      return renderEmpty();
    }

    return (
      <EmptyState message={emptyMessage} icon={emptyIcon} actionComponent={emptyActionComponent} />
    );
  }

  // Show content
  return children;
};

ResourceLoader.propTypes = {
  /** Whether the resource is currently loading */
  isLoading: PropTypes.bool,

  /** Error message to display if there was an error loading the resource */
  error: PropTypes.string,

  /** Whether the resource is empty (no items) */
  isEmpty: PropTypes.bool,

  /** Callback to retry loading the resource if there was an error */
  onRetry: PropTypes.func,

  /** Message to display when the resource is empty */
  emptyMessage: PropTypes.string,

  /** Icon to display when the resource is empty */
  emptyIcon: PropTypes.node,

  /** Action component to display when the resource is empty */
  emptyActionComponent: PropTypes.node,

  /** Custom render function for loading state */
  renderLoading: PropTypes.func,

  /** Custom render function for error state */
  renderError: PropTypes.func,

  /** Custom render function for empty state */
  renderEmpty: PropTypes.func,

  /** Height of the skeleton loader */
  skeletonHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /** Width of the skeleton loader */
  skeletonWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /** Variant of the skeleton loader */
  skeletonVariant: PropTypes.oneOf(['text', 'rectangular', 'circular']),

  /** Animation type for the skeleton loader */
  skeletonAnimation: PropTypes.oneOf(['pulse', 'wave', 'none']),

  /** Custom loading component */
  loadingComponent: PropTypes.node,

  /** Content to render when the resource is loaded successfully */
  children: PropTypes.node,
};

ResourceLoader.defaultProps = {
  isLoading: false,
  error: null,
  isEmpty: false,
  onRetry: null,
  emptyMessage: 'No items found',
  emptyIcon: null,
  emptyActionComponent: null,
  renderLoading: null,
  renderError: null,
  renderEmpty: null,
  skeletonHeight: 100,
  skeletonWidth: '100%',
  skeletonVariant: 'rectangular',
  skeletonAnimation: 'pulse',
  loadingComponent: null,
  children: null,
};

// Add displayName for improved debugging in React DevTools
ResourceLoader.displayName = 'ResourceLoader';
SkeletonLoader.displayName = 'SkeletonLoader';
ErrorDisplay.displayName = 'ErrorDisplay';
EmptyState.displayName = 'EmptyState';

// Export the memoized component with custom comparison
export default memo(ResourceLoader, areEqual);

// Export subcomponents for reuse
export { SkeletonLoader, ErrorDisplay, EmptyState };
