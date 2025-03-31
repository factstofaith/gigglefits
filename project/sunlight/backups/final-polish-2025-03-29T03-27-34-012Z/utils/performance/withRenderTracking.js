/**
 * withRenderTracking Higher-Order Component
 * 
 * This HOC wraps components to track their render performance.
 * Use it to identify components with unnecessary re-renders.
 */

import React, { useRef, useEffect } from 'react';

// Global render counters and timing data
window.__RENDER_STATS__ = window.__RENDER_STATS__ || {
  components: {},
  enabled: false,
  startTime: Date.now(),
};

// Enable/disable render tracking
export const enableRenderTracking = () => {
  window.__RENDER_STATS__.enabled = true;
  window.__RENDER_STATS__.startTime = Date.now();
  console.log('[RenderTracking] Enabled');
};

export const disableRenderTracking = () => {
  window.__RENDER_STATS__.enabled = false;
  console.log('[RenderTracking] Disabled');
};

// Export render stats to console
export const printRenderStats = () => {
  if (!window.__RENDER_STATS__) {
    console.log('No render statistics available');
    return;
  }
  
  const { components, startTime } = window.__RENDER_STATS__;
  const elapsed = Date.now() - startTime;
  
  // Sort components by render count
  const sortedComponents = Object.entries(components)
    .sort((a, b) => b[1].renderCount - a[1].renderCount);
  
  console.group('React Render Statistics');
  console.log('Time elapsed: ' + elapsed / 1000 + 's');
  console.log('Total components tracked: ' + sortedComponents.length);
  
  console.group('Top 10 Most Frequently Rendered Components');
  sortedComponents.slice(0, 10).forEach(([name, stats]) => {
    console.log(name + ': ' + stats.renderCount + ' renders (' + stats.totalRenderTime + 'ms total, ' + stats.totalRenderTime / stats.renderCount + 'ms avg)');
  });
  console.groupEnd();
  
  console.group('Components with Long Render Times (>5ms avg)');
  sortedComponents
    .filter(([_, stats]) => stats.totalRenderTime / stats.renderCount > 5)
    .slice(0, 10)
    .forEach(([name, stats]) => {
      console.log(name + ': ' + stats.totalRenderTime / stats.renderCount + 'ms avg (' + stats.renderCount + ' renders)');
    });
  console.groupEnd();
  
  // Save data to localStorage for visualization
  try {
    localStorage.setItem('render-stats', JSON.stringify({
      timestamp: Date.now(),
      elapsed,
      components: Object.entries(components).map(([name, stats]) => ({
        name,
        renderCount: stats.renderCount,
        totalRenderTime: stats.totalRenderTime,
        avgRenderTime: stats.totalRenderTime / stats.renderCount,
        props: stats.lastProps ? Object.keys(stats.lastProps) : [],
      })),
    }));
    console.log('Statistics saved to localStorage. Use the visualization tool to view them.');
  } catch (error) {
    console.error('Error saving statistics:', error);
  }
  
  console.groupEnd();
};

// Reset render statistics
export const resetRenderStats = () => {
  window.__RENDER_STATS__ = {
    components: {},
    enabled: window.__RENDER_STATS__?.enabled || false,
    startTime: Date.now(),
  };
  console.log('[RenderTracking] Statistics reset');
};

// Higher-order component to track renders
const withRenderTracking = (WrappedComponent) => {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const WithRenderTracking = React.forwardRef((props, ref) => {
    const renderCount = useRef(0);
    const lastRenderTime = useRef(0);
    
    useEffect(() => {
      // Initialize stats for this component
      if (!window.__RENDER_STATS__.components[displayName]) {
        window.__RENDER_STATS__.components[displayName] = {
          renderCount: 0,
          totalRenderTime: 0,
          lastProps: null,
        };
      }
    }, []);
    
    // Track render start time
    const renderStartTime = performance.now();
    
    // Check if props changed and highlight unnecessary renders
    const stats = window.__RENDER_STATS__.components[displayName];
    if (stats && stats.lastProps) {
      const currentPropsKeys = Object.keys(props);
      const lastPropsKeys = Object.keys(stats.lastProps);
      
      if (currentPropsKeys.length === lastPropsKeys.length) {
        let changed = false;
        const changedProps = [];
        
        for (const key of currentPropsKeys) {
          if (props[key] !== stats.lastProps[key]) {
            changed = true;
            changedProps.push(key);
          }
        }
        
        if (!changed && window.__RENDER_STATS__.enabled) {
          console.warn('[RenderTracking] ' + displayName + ' re-rendered without prop changes. Consider using React.memo().');
        } else if (window.__RENDER_STATS__.enabled && changedProps.length > 0) {
          const nonPrimitiveChanges = changedProps.filter(key => {
            const value = props[key];
            return typeof value === 'object' && value !== null && !React.isValidElement(value);
          });
          
          if (nonPrimitiveChanges.length > 0) {
            console.warn(
              '[RenderTracking] ' + displayName + ' re-rendered because of object/array prop changes: ' + 
              nonPrimitiveChanges.join(', ') + '. Consider using useMemo/useCallback for these props.'
            );
          }
        }
      }
    }
    
    // Update component stats after render
    useEffect(() => {
      renderCount.current += 1;
      const renderEndTime = performance.now();
      const renderTime = renderEndTime - renderStartTime;
      lastRenderTime.current = renderTime;
      
      if (window.__RENDER_STATS__.enabled) {
        window.__RENDER_STATS__.components[displayName] = {
          renderCount: (window.__RENDER_STATS__.components[displayName]?.renderCount || 0) + 1,
          totalRenderTime: (window.__RENDER_STATS__.components[displayName]?.totalRenderTime || 0) + renderTime,
          lastProps: { ...props },
        };
      }
    });
    
    return <WrappedComponent {...props} ref={ref} />;
  });
  
  WithRenderTracking.displayName = 'WithRenderTracking(' + displayName + ')';
  return WithRenderTracking;
};

export default withRenderTracking;
