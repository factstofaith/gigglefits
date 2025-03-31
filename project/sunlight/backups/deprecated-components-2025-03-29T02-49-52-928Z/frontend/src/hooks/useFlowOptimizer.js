/**
 * useFlowOptimizer.js
 * -----------------------------------------------------------------------------
 * Custom React hook for optimizing flow canvas rendering performance.
 * Implements advanced techniques like node virtualization, adaptive detail
 * levels, and edge bundling to ensure smooth performance with complex flows.
 * 
 * @module hooks/useFlowOptimizer
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import flowOptimizer from '@utils/flowOptimizer';

/**
 * Custom hook for optimizing flow canvas rendering performance
 * 
 * This hook provides runtime optimization for ReactFlow components,
 * especially for large and complex flows. It implements multiple
 * performance optimization techniques:
 * 
 * - Viewport-based node virtualization (only render visible nodes)
 * - Adaptive detail levels based on zoom (simplify distant nodes)
 * - Edge bundling for visual clarity (group parallel edges)
 * - Viewport culling (skip rendering offscreen elements)
 * - Performance metrics tracking (monitor render times and FPS)
 * 
 * @function
 * @param {Object} options - Configuration options
 * @param {Array} options.nodes - Flow nodes array from ReactFlow
 * @param {Array} options.edges - Flow edges array from ReactFlow
 * @param {Object} options.viewport - Current viewport state
 * @param {number} options.viewport.x - Viewport X position
 * @param {number} options.viewport.y - Viewport Y position
 * @param {number} options.viewport.zoom - Current zoom level
 * @param {number} options.viewport.width - Viewport width
 * @param {number} options.viewport.height - Viewport height
 * @param {boolean} [options.viewport.isDragging] - Whether user is dragging the canvas
 * @param {boolean} [options.viewport.isZooming] - Whether user is zooming the canvas
 * @param {Object} [options.optimizationConfig] - Custom optimization settings
 * @param {number} [options.updateInterval=100] - Milliseconds between optimized updates
 * @param {boolean} [options.enabled=true] - Whether optimization is enabled
 * @returns {Object} Optimized flow data and utility functions
 * @property {Array} nodes - Optimized nodes (or original nodes if optimization disabled)
 * @property {Array} edges - Optimized edges (or original edges if optimization disabled)
 * @property {Object} renderStats - Statistics about current rendering
 * @property {Object} performanceMetrics - Performance measurements
 * @property {Object} recommendations - Optimization recommendations
 * @property {boolean} isOptimizationEnabled - Whether optimization is currently active
 * @property {Object} optimizationConfig - Current optimization configuration
 */
function useFlowOptimizer({
  nodes,
  edges,
  viewport,
  optimizationConfig,
  updateInterval = 100,
  enabled = true
}) {
  // Added display name
  useFlowOptimizer.displayName = 'useFlowOptimizer';

  // Initialize state with original nodes and edges
  const [optimizedNodes, setOptimizedNodes] = useState(nodes || []);
  const [optimizedEdges, setOptimizedEdges] = useState(edges || []);
  
  /**
   * Rendering statistics to track optimization effectiveness
   * @type {Object}
   */
  const [renderStats, setRenderStats] = useState({
    nodeCount: 0,          // Total number of nodes
    visibleNodeCount: 0,    // Number of nodes currently in viewport
    edgeCount: 0,          // Total number of edges
    visibleEdgeCount: 0,    // Number of edges currently in viewport
    bundledEdgeCount: 0,    // Number of edges that have been bundled
    lastUpdateTime: 0,      // Timestamp of last update
    fps: 0                  // Current frames per second
  });
  
  // Keep track of original nodes and edges for reference
  const originalNodesRef = useRef(nodes || []);
  const originalEdgesRef = useRef(edges || []);
  
  /**
   * Performance metrics for monitoring optimization effectiveness
   * @type {Object}
   */
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,        // Time taken to render optimized flow (ms)
    updateTime: 0,        // Time between updates (ms)
    fps: 0,               // Frames per second
    memoryUsage: 0        // Estimated memory usage (bytes)
  });
  
  // Refs for tracking update timing
  const lastUpdateTimeRef = useRef(0);
  const fpsCounterRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  
  /**
   * Use default optimization configuration if not provided
   * @type {Object}
   */
  const config = useMemo(() => 
    optimizationConfig || flowOptimizer.DEFAULT_OPTIMIZATION_CONFIG,
    [optimizationConfig]
  );
  
  /**
   * Determine if optimization is needed based on flow size
   * Small flows don't need optimization and can render at full detail
   * @type {boolean}
   */
  const needsOptimization = useMemo(() => {
  // Added display name
  needsOptimization.displayName = 'needsOptimization';

    if (!enabled) return false;
    
    const nodeCount = nodes?.length || 0;
    return nodeCount > flowOptimizer.THRESHOLDS.SMALL_FLOW;
  }, [nodes, enabled]);
  
  // Update external data refs when they change
  useEffect(() => {
    originalNodesRef.current = nodes || [];
  }, [nodes]);
  
  useEffect(() => {
    originalEdgesRef.current = edges || [];
  }, [edges]);
  
  /**
   * Core optimization function that processes nodes and edges
   * for improved rendering performance
   * 
   * @function
   */
  const optimizeFlow = useCallback(() => {
  // Added display name
  optimizeFlow.displayName = 'optimizeFlow';

    if (!needsOptimization || !viewport) return;
    
    const startTime = performance.now();
    
    // Calculate FPS
    fpsCounterRef.current++;
    const now = Date.now();
    if (now - lastFpsUpdateRef.current >= 1000) {
      const fps = Math.round((fpsCounterRef.current * 1000) / (now - lastFpsUpdateRef.current));
      setPerformanceMetrics(prev => ({ ...prev, fps }));
      fpsCounterRef.current = 0;
      lastFpsUpdateRef.current = now;
    }
    
    // Get optimized rendering data
    const { nodes: processedNodes, edges: processedEdges, stats } = 
      flowOptimizer.optimizeRenderingData(
        originalNodesRef.current, 
        originalEdgesRef.current, 
        viewport, 
        config
      );
    
    // Update state with optimized data
    setOptimizedNodes(processedNodes);
    setOptimizedEdges(processedEdges);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Update performance metrics
    setPerformanceMetrics(prev => ({
      ...prev,
      renderTime,
      updateTime: now - lastUpdateTimeRef.current
    }));
    
    lastUpdateTimeRef.current = now;
    
    // Update render stats
    setRenderStats({
      ...stats,
      lastUpdateTime: now,
      fps: performanceMetrics.fps
    });
  }, [needsOptimization, viewport, config, performanceMetrics.fps]);
  
  // Run optimization when dependencies change
  useEffect(() => {
    if (!needsOptimization || !viewport) {
      // If no optimization needed, just use the original nodes and edges
      setOptimizedNodes(nodes || []);
      setOptimizedEdges(edges || []);
      return;
    }
    
    // Skip too frequent updates
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < updateInterval) {
      return;
    }
    
    optimizeFlow();
  }, [nodes, edges, viewport, needsOptimization, optimizeFlow, updateInterval]);
  
  // Run optimization at regular intervals while viewport is changing
  useEffect(() => {
    if (!needsOptimization || !viewport) {
      return undefined;
    }
    
    // Only set interval if viewport is actively changing
    if (viewport.isDragging || viewport.isZooming) {
      const intervalId = setInterval(optimizeFlow, updateInterval);
      return () => clearInterval(intervalId);
    }
    
    return undefined;
  }, [needsOptimization, viewport, optimizeFlow, updateInterval]);
  
  /**
   * Generate optimization recommendations based on flow complexity
   * and current performance metrics
   * 
   * @type {Object}
   * @property {Object} config - Recommended optimization configuration
   * @property {Array} recommendations - List of specific optimization recommendations
   */
  const recommendations = useMemo(() => {
  // Added display name
  recommendations.displayName = 'recommendations';

    if (!nodes || !edges || !viewport) {
      return { 
        config: flowOptimizer.DEFAULT_OPTIMIZATION_CONFIG,
        recommendations: []
      };
    }
    
    return flowOptimizer.generateOptimizationRecommendations({
      nodes,
      edges,
      viewport,
      performanceMetrics
    });
  }, [nodes, edges, viewport, performanceMetrics]);
  
  // Return optimized data and utility functions
  return {
    /**
     * Optimized nodes array (or original if optimization disabled)
     * @type {Array}
     */
    nodes: needsOptimization ? optimizedNodes : nodes,
    
    /**
     * Optimized edges array (or original if optimization disabled)
     * @type {Array}
     */
    edges: needsOptimization ? optimizedEdges : edges,
    
    /**
     * Statistics about current rendering state
     * @type {Object}
     */
    renderStats,
    
    /**
     * Performance measurements
     * @type {Object}
     */
    performanceMetrics,
    
    /**
     * Optimization recommendations based on current flow
     * @type {Object}
     */
    recommendations,
    
    /**
     * Whether optimization is currently active
     * @type {boolean}
     */
    isOptimizationEnabled: needsOptimization,
    
    /**
     * Current optimization configuration
     * @type {Object}
     */
    optimizationConfig: config,
    
    /**
     * Function to batch node changes for optimized rendering
     * @function
     */
    batchedNodeChange: flowOptimizer.batchNodeChanges,
    
    /**
     * Function to toggle optimization on/off
     * @function
     */
    toggleOptimization: () => {
      // This is a placeholder - in a real implementation you would
      // add functionality to toggle the optimization state
    }
  };
}

export default useFlowOptimizer;