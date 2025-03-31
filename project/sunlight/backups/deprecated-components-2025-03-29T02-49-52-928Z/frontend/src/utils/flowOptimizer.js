/**
 * Flow Canvas Rendering Optimizer
 * 
 * This utility provides optimization strategies for rendering large and complex flows
 * in the IntegrationFlowCanvas component. It implements techniques such as:
 * 
 * - Viewport-based node virtualization
 * - Edge bundling for visual clarity
 * - Adaptive detail levels based on zoom
 * - Batched state updates
 * - Viewport culling
 * - Efficient element memoization
 */

/**
 * Constants for optimization settings
 */
export const OPTIMIZATION_SETTINGS = {
  NODE_VIRTUALIZATION: 'nodeVirtualization',
  EDGE_BUNDLING: 'edgeBundling',
  DETAILED_LEVEL: 'detailedLevel',
  VIEWPORT_CULLING: 'viewportCulling',
  BATCHED_UPDATES: 'batchedUpdates',
  MEMOIZATION: 'memoization'
};

/**
 * Default optimization configuration with recommended settings
 */
export const DEFAULT_OPTIMIZATION_CONFIG = {
  [OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION]: true,
  [OPTIMIZATION_SETTINGS.EDGE_BUNDLING]: false,
  [OPTIMIZATION_SETTINGS.DETAILED_LEVEL]: true,
  [OPTIMIZATION_SETTINGS.VIEWPORT_CULLING]: true,
  [OPTIMIZATION_SETTINGS.BATCHED_UPDATES]: true,
  [OPTIMIZATION_SETTINGS.MEMOIZATION]: true
};

/**
 * Threshold constants for optimization decisions
 */
export const THRESHOLDS = {
  SMALL_FLOW: 50,      // Nodes count below which minimal optimization is needed
  MEDIUM_FLOW: 100,    // Nodes count where standard optimization should be applied
  LARGE_FLOW: 300,     // Nodes count where aggressive optimization is recommended
  VERY_LARGE_FLOW: 500 // Nodes count where all optimizations should be enabled
};

/**
 * Determines whether a node is within the current viewport
 * 
 * @param {Object} node - The node to check
 * @param {Object} viewport - The current viewport {x, y, zoom, width, height}
 * @param {number} padding - Additional padding around viewport (in pixels)
 * @returns {boolean} - True if the node is visible in the viewport
 */
export const isNodeInViewport = (node, viewport, padding = 100) => {
  // Added display name
  isNodeInViewport.displayName = 'isNodeInViewport';

  // Added display name
  isNodeInViewport.displayName = 'isNodeInViewport';

  // Added display name
  isNodeInViewport.displayName = 'isNodeInViewport';

  // Added display name
  isNodeInViewport.displayName = 'isNodeInViewport';

  // Added display name
  isNodeInViewport.displayName = 'isNodeInViewport';


  if (!node || !viewport) return false;

  // Transform node position from flow coordinates to screen coordinates
  const nodeLeft = (node.position.x * viewport.zoom) + viewport.x;
  const nodeTop = (node.position.y * viewport.zoom) + viewport.y;
  const nodeRight = nodeLeft + ((node.width || 200) * viewport.zoom);
  const nodeBottom = nodeTop + ((node.height || 100) * viewport.zoom);

  // Define viewport boundaries with padding
  const vpLeft = -padding;
  const vpTop = -padding;
  const vpRight = viewport.width + padding;
  const vpBottom = viewport.height + padding;

  // Check if node is within expanded viewport boundaries
  return !(nodeRight < vpLeft || nodeLeft > vpRight || nodeBottom < vpTop || nodeTop > vpBottom);
};

/**
 * Calculates the visible nodes based on the current viewport
 * 
 * @param {Array} nodes - All nodes in the flow
 * @param {Object} viewport - The current viewport {x, y, zoom, width, height}
 * @param {number} padding - Additional padding around viewport (in pixels)
 * @returns {Array} - Array of node IDs that are visible in the viewport
 */
export const getVisibleNodeIds = (nodes, viewport, padding = 100) => {
  // Added display name
  getVisibleNodeIds.displayName = 'getVisibleNodeIds';

  // Added display name
  getVisibleNodeIds.displayName = 'getVisibleNodeIds';

  // Added display name
  getVisibleNodeIds.displayName = 'getVisibleNodeIds';

  // Added display name
  getVisibleNodeIds.displayName = 'getVisibleNodeIds';

  // Added display name
  getVisibleNodeIds.displayName = 'getVisibleNodeIds';


  if (!nodes || !viewport) return [];
  
  return nodes
    .filter(node => isNodeInViewport(node, viewport, padding))
    .map(node => node.id);
};

/**
 * Determines the appropriate detail level for a node based on zoom level and viewport position
 * 
 * @param {Object} node - The node to check
 * @param {Object} viewport - The current viewport {x, y, zoom, width, height}
 * @param {Array} visibleNodeIds - Array of node IDs that are currently visible
 * @returns {string} - Detail level: 'full', 'reduced', or 'minimal'
 */
export const getNodeDetailLevel = (node, viewport, visibleNodeIds) => {
  // Added display name
  getNodeDetailLevel.displayName = 'getNodeDetailLevel';

  // Added display name
  getNodeDetailLevel.displayName = 'getNodeDetailLevel';

  // Added display name
  getNodeDetailLevel.displayName = 'getNodeDetailLevel';

  // Added display name
  getNodeDetailLevel.displayName = 'getNodeDetailLevel';

  // Added display name
  getNodeDetailLevel.displayName = 'getNodeDetailLevel';


  if (!node || !viewport) return 'minimal';
  
  // If node is not in the visible set, use minimal detail
  if (!visibleNodeIds.includes(node.id)) {
    return 'minimal';
  }
  
  // Base detail level on zoom
  if (viewport.zoom < 0.5) {
    return 'reduced';
  } else if (viewport.zoom < 0.25) {
    return 'minimal';
  }
  
  return 'full';
};

/**
 * Group edges by their source and target to prepare for bundling
 * 
 * @param {Array} edges - All edges in the flow
 * @returns {Object} - Grouped edges by source-target pairs
 */
export const groupEdgesForBundling = (edges) => {
  // Added display name
  groupEdgesForBundling.displayName = 'groupEdgesForBundling';

  // Added display name
  groupEdgesForBundling.displayName = 'groupEdgesForBundling';

  // Added display name
  groupEdgesForBundling.displayName = 'groupEdgesForBundling';

  // Added display name
  groupEdgesForBundling.displayName = 'groupEdgesForBundling';

  // Added display name
  groupEdgesForBundling.displayName = 'groupEdgesForBundling';


  if (!edges) return {};
  
  const edgeGroups = {};
  
  edges.forEach(edge => {
    const key = `${edge.source}-${edge.target}`;
    if (!edgeGroups[key]) {
      edgeGroups[key] = [];
    }
    edgeGroups[key].push(edge);
  });
  
  return edgeGroups;
};

/**
 * Bundle edges between the same source and target nodes
 * 
 * @param {Array} edges - All edges in the flow
 * @returns {Array} - Bundled edges with additional bundling properties
 */
export const bundleEdges = (edges) => {
  // Added display name
  bundleEdges.displayName = 'bundleEdges';

  // Added display name
  bundleEdges.displayName = 'bundleEdges';

  // Added display name
  bundleEdges.displayName = 'bundleEdges';

  // Added display name
  bundleEdges.displayName = 'bundleEdges';

  // Added display name
  bundleEdges.displayName = 'bundleEdges';


  if (!edges) return [];
  
  const edgeGroups = groupEdgesForBundling(edges);
  const bundledEdges = [];
  
  Object.values(edgeGroups).forEach(group => {
    if (group.length === 1) {
      // Single edge, no bundling needed
      bundledEdges.push({ ...group[0], bundled: false, bundleSize: 1 });
    } else {
      // Multiple edges between same source/target
      group.forEach((edge, index) => {
        bundledEdges.push({
          ...edge,
          bundled: true,
          bundleSize: group.length,
          bundleIndex: index,
          // Add slight curve offset based on index in bundle
          bundleOffset: (index - (group.length - 1) / 2) * 20
        });
      });
    }
  });
  
  return bundledEdges;
};

/**
 * Calculate which edges should be rendered based on their connected nodes' visibility
 * 
 * @param {Array} edges - All edges in the flow
 * @param {Array} visibleNodeIds - IDs of nodes currently visible in the viewport
 * @returns {Array} - Filtered edges that should be rendered
 */
export const getVisibleEdges = (edges, visibleNodeIds) => {
  // Added display name
  getVisibleEdges.displayName = 'getVisibleEdges';

  // Added display name
  getVisibleEdges.displayName = 'getVisibleEdges';

  // Added display name
  getVisibleEdges.displayName = 'getVisibleEdges';

  // Added display name
  getVisibleEdges.displayName = 'getVisibleEdges';

  // Added display name
  getVisibleEdges.displayName = 'getVisibleEdges';


  if (!edges || !visibleNodeIds) return [];
  
  return edges.filter(edge => {
    // Show edge if either source or target node is visible
    return visibleNodeIds.includes(edge.source) || visibleNodeIds.includes(edge.target);
  });
};

/**
 * Determine the detail level for edge rendering based on zoom and bundling
 * 
 * @param {Object} edge - The edge to check
 * @param {number} zoom - Current viewport zoom level
 * @returns {string} - Detail level: 'full', 'simplified', or 'minimal'
 */
export const getEdgeDetailLevel = (edge, zoom) => {
  // Added display name
  getEdgeDetailLevel.displayName = 'getEdgeDetailLevel';

  // Added display name
  getEdgeDetailLevel.displayName = 'getEdgeDetailLevel';

  // Added display name
  getEdgeDetailLevel.displayName = 'getEdgeDetailLevel';

  // Added display name
  getEdgeDetailLevel.displayName = 'getEdgeDetailLevel';

  // Added display name
  getEdgeDetailLevel.displayName = 'getEdgeDetailLevel';


  if (!edge) return 'minimal';
  
  // If zoom is very low, use minimal detail for all edges
  if (zoom < 0.25) {
    return 'minimal';
  }
  
  // If zoom is medium, use simplified style
  if (zoom < 0.6) {
    return 'simplified';
  }
  
  return 'full';
};

/**
 * Batches multiple state updates to reduce render cycles
 * 
 * @param {Function} updateFn - State update function (e.g., setNodes)
 * @param {Array} items - Items to be updated
 * @param {number} batchSize - Number of items to update in each batch
 * @param {Function} transformFn - Optional function to transform items before update
 */
export const batchUpdate = (updateFn, items, batchSize = 10, transformFn = item => item) => {
  // Added display name
  batchUpdate.displayName = 'batchUpdate';

  // Added display name
  batchUpdate.displayName = 'batchUpdate';

  // Added display name
  batchUpdate.displayName = 'batchUpdate';

  // Added display name
  batchUpdate.displayName = 'batchUpdate';

  // Added display name
  batchUpdate.displayName = 'batchUpdate';


  if (!updateFn || !items) return;
  
  // Process updates in batches
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize).map(transformFn);
    
    // Use setTimeout to allow React to process other updates
    setTimeout(() => {
      updateFn(prev => {
        // If previous state is a function, call it first
        const currentState = typeof prev === 'function' ? prev() : prev;
        
        // For arrays, replace the items in the current batch
        if (Array.isArray(currentState)) {
          return currentState.map(item => {
            const batchItem = batch.find(b => b.id === item.id);
            return batchItem || item;
          });
        }
        
        // For objects, merge with current state
        return { ...currentState, ...Object.fromEntries(batch.map(item => [item.id, item])) };
      });
    }, 0);
  }
};

/**
 * Gets recommended optimization settings based on flow size and complexity
 * 
 * @param {Object} flowStats - Flow statistics {nodeCount, edgeCount, complexity}
 * @returns {Object} - Recommended optimization settings
 */
export const getRecommendedOptimizations = (flowStats) => {
  // Added display name
  getRecommendedOptimizations.displayName = 'getRecommendedOptimizations';

  // Added display name
  getRecommendedOptimizations.displayName = 'getRecommendedOptimizations';

  // Added display name
  getRecommendedOptimizations.displayName = 'getRecommendedOptimizations';

  // Added display name
  getRecommendedOptimizations.displayName = 'getRecommendedOptimizations';

  // Added display name
  getRecommendedOptimizations.displayName = 'getRecommendedOptimizations';


  const { nodeCount = 0, edgeCount = 0 } = flowStats || {};
  
  // Base configuration - minimal optimization for small flows
  const config = { ...DEFAULT_OPTIMIZATION_CONFIG };
  
  if (nodeCount < THRESHOLDS.SMALL_FLOW) {
    // Small flow - minimal optimization
    config[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] = false;
    config[OPTIMIZATION_SETTINGS.EDGE_BUNDLING] = false;
    config[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING] = false;
    return config;
  }
  
  if (nodeCount < THRESHOLDS.MEDIUM_FLOW) {
    // Medium flow - standard optimization
    config[OPTIMIZATION_SETTINGS.EDGE_BUNDLING] = edgeCount > 100;
    return config;
  }
  
  if (nodeCount < THRESHOLDS.LARGE_FLOW) {
    // Large flow - full optimization
    config[OPTIMIZATION_SETTINGS.EDGE_BUNDLING] = true;
    return config;
  }
  
  // Very large flow - aggressive optimization
  return {
    [OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION]: true,
    [OPTIMIZATION_SETTINGS.EDGE_BUNDLING]: true,
    [OPTIMIZATION_SETTINGS.DETAILED_LEVEL]: true,
    [OPTIMIZATION_SETTINGS.VIEWPORT_CULLING]: true,
    [OPTIMIZATION_SETTINGS.BATCHED_UPDATES]: true,
    [OPTIMIZATION_SETTINGS.MEMOIZATION]: true
  };
};

/**
 * Creates an optimized rendering plan for the current flow state
 * 
 * @param {Object} flowState - Current flow state {nodes, edges, viewport, optimizationConfig}
 * @returns {Object} - Optimized rendering plan with processed nodes and edges
 */
export const createRenderingPlan = (flowState) => {
  // Added display name
  createRenderingPlan.displayName = 'createRenderingPlan';

  // Added display name
  createRenderingPlan.displayName = 'createRenderingPlan';

  // Added display name
  createRenderingPlan.displayName = 'createRenderingPlan';

  // Added display name
  createRenderingPlan.displayName = 'createRenderingPlan';

  // Added display name
  createRenderingPlan.displayName = 'createRenderingPlan';


  const { nodes, edges, viewport, optimizationConfig = DEFAULT_OPTIMIZATION_CONFIG } = flowState || {};
  
  if (!nodes || !edges || !viewport) {
    return { nodes, edges, visibleNodeIds: [], stats: { nodeCount: 0, edgeCount: 0 } };
  }
  
  // Calculate statistics
  const stats = {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    visibleNodeCount: 0,
    visibleEdgeCount: 0,
    bundledEdgeCount: 0
  };
  
  // Determine visible nodes based on viewport
  const visibleNodeIds = optimizationConfig[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING] 
    ? getVisibleNodeIds(nodes, viewport)
    : nodes.map(node => node.id);
  
  stats.visibleNodeCount = visibleNodeIds.length;
  
  // Process nodes with detail levels
  const processedNodes = nodes.map(node => {
    const isVisible = visibleNodeIds.includes(node.id);
    const detailLevel = optimizationConfig[OPTIMIZATION_SETTINGS.DETAILED_LEVEL]
      ? getNodeDetailLevel(node, viewport, visibleNodeIds)
      : 'full';
    
    return {
      ...node,
      isVisible,
      detailLevel,
      // Add rendering optimizations
      data: {
        ...node.data,
        renderOptimized: optimizationConfig[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] && !isVisible
      }
    };
  });
  
  // Process edges
  let processedEdges = optimizationConfig[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING]
    ? getVisibleEdges(edges, visibleNodeIds)
    : edges;
  
  stats.visibleEdgeCount = processedEdges.length;
  
  // Apply edge bundling if enabled
  if (optimizationConfig[OPTIMIZATION_SETTINGS.EDGE_BUNDLING]) {
    processedEdges = bundleEdges(processedEdges);
    stats.bundledEdgeCount = processedEdges.filter(edge => edge.bundled).length;
  }
  
  // Apply detail levels to edges
  processedEdges = processedEdges.map(edge => {
    const detailLevel = optimizationConfig[OPTIMIZATION_SETTINGS.DETAILED_LEVEL]
      ? getEdgeDetailLevel(edge, viewport.zoom)
      : 'full';
    
    return {
      ...edge,
      detailLevel
    };
  });
  
  return {
    nodes: processedNodes,
    edges: processedEdges,
    visibleNodeIds,
    stats
  };
};

/**
 * Helper to determine if a node needs re-rendering based on changes
 * 
 * @param {Object} prevNode - Previous node state
 * @param {Object} nextNode - New node state
 * @returns {boolean} - True if the node should be re-rendered
 */
export const shouldNodeUpdate = (prevNode, nextNode) => {
  // Added display name
  shouldNodeUpdate.displayName = 'shouldNodeUpdate';

  // Added display name
  shouldNodeUpdate.displayName = 'shouldNodeUpdate';

  // Added display name
  shouldNodeUpdate.displayName = 'shouldNodeUpdate';

  // Added display name
  shouldNodeUpdate.displayName = 'shouldNodeUpdate';

  // Added display name
  shouldNodeUpdate.displayName = 'shouldNodeUpdate';


  if (!prevNode || !nextNode) return true;
  
  // Position changes
  if (prevNode.position.x !== nextNode.position.x || 
      prevNode.position.y !== nextNode.position.y) {
    return true;
  }
  
  // Optimization state changes
  if (prevNode.isVisible !== nextNode.isVisible ||
      prevNode.detailLevel !== nextNode.detailLevel) {
    return true;
  }
  
  // Selection state changes
  if (prevNode.selected !== nextNode.selected) {
    return true;
  }
  
  // Data changes - shallow comparison of first level properties
  if (prevNode.data && nextNode.data) {
    const dataKeys = [...new Set([...Object.keys(prevNode.data), ...Object.keys(nextNode.data)])];
    for (const key of dataKeys) {
      if (prevNode.data[key] !== nextNode.data[key]) {
        return true;
      }
    }
  } else if (prevNode.data !== nextNode.data) {
    return true;
  }
  
  return false;
};

/**
 * Helper to determine if an edge needs re-rendering based on changes
 * 
 * @param {Object} prevEdge - Previous edge state
 * @param {Object} nextEdge - New edge state
 * @returns {boolean} - True if the edge should be re-rendered
 */
export const shouldEdgeUpdate = (prevEdge, nextEdge) => {
  // Added display name
  shouldEdgeUpdate.displayName = 'shouldEdgeUpdate';

  // Added display name
  shouldEdgeUpdate.displayName = 'shouldEdgeUpdate';

  // Added display name
  shouldEdgeUpdate.displayName = 'shouldEdgeUpdate';

  // Added display name
  shouldEdgeUpdate.displayName = 'shouldEdgeUpdate';

  // Added display name
  shouldEdgeUpdate.displayName = 'shouldEdgeUpdate';


  if (!prevEdge || !nextEdge) return true;
  
  // Bundling changes
  if (prevEdge.bundled !== nextEdge.bundled ||
      prevEdge.bundleSize !== nextEdge.bundleSize ||
      prevEdge.bundleIndex !== nextEdge.bundleIndex ||
      prevEdge.bundleOffset !== nextEdge.bundleOffset) {
    return true;
  }
  
  // Detail level changes
  if (prevEdge.detailLevel !== nextEdge.detailLevel) {
    return true;
  }
  
  // Selection state changes
  if (prevEdge.selected !== nextEdge.selected) {
    return true;
  }
  
  // Style changes
  if (JSON.stringify(prevEdge.style) !== JSON.stringify(nextEdge.style)) {
    return true;
  }
  
  return false;
};

/**
 * Creates a simplified node representation for minimized rendering
 * 
 * @param {Object} node - Original node
 * @returns {Object} - Simplified node representation
 */
export const createSimplifiedNode = (node) => {
  // Added display name
  createSimplifiedNode.displayName = 'createSimplifiedNode';

  // Added display name
  createSimplifiedNode.displayName = 'createSimplifiedNode';

  // Added display name
  createSimplifiedNode.displayName = 'createSimplifiedNode';

  // Added display name
  createSimplifiedNode.displayName = 'createSimplifiedNode';

  // Added display name
  createSimplifiedNode.displayName = 'createSimplifiedNode';


  if (!node) return null;
  
  // Extract only necessary properties for minimal rendering
  return {
    id: node.id,
    type: 'simplified',
    position: node.position,
    data: {
      label: node.data?.label || node.id,
      type: node.type,
      originalWidth: node.width,
      originalHeight: node.height
    },
    width: 50,
    height: 30
  };
};

/**
 * Optimize rendering by preprocessing and reducing data
 * Particularly useful for large flows with hundreds of nodes
 *
 * @param {Array} nodes - Original nodes
 * @param {Array} edges - Original edges
 * @param {Object} viewport - Current viewport
 * @param {Object} optimizationConfig - Optimization configuration
 * @returns {Object} - Optimized data for rendering {nodes, edges, stats}
 */
export const optimizeRenderingData = (nodes, edges, viewport, optimizationConfig = DEFAULT_OPTIMIZATION_CONFIG) => {
  // Added display name
  optimizeRenderingData.displayName = 'optimizeRenderingData';

  // Added display name
  optimizeRenderingData.displayName = 'optimizeRenderingData';

  // Added display name
  optimizeRenderingData.displayName = 'optimizeRenderingData';

  // Added display name
  optimizeRenderingData.displayName = 'optimizeRenderingData';

  // Added display name
  optimizeRenderingData.displayName = 'optimizeRenderingData';


  // Create rendering plan
  const plan = createRenderingPlan({
    nodes, 
    edges, 
    viewport,
    optimizationConfig
  });
  
  // Final transformation for optimized rendering
  return {
    nodes: plan.nodes.map(node => {
      // Apply node virtualization for nodes outside viewport
      if (node.data?.renderOptimized) {
        return createSimplifiedNode(node);
      }
      return node;
    }),
    edges: plan.edges,
    stats: plan.stats,
    visibleNodeIds: plan.visibleNodeIds
  };
};

/**
 * Calculate flow density metrics to identify congested areas
 * 
 * @param {Array} nodes - Flow nodes
 * @param {Object} viewport - Current viewport
 * @returns {Object} - Density metrics for the flow
 */
export const calculateFlowDensity = (nodes, viewport) => {
  // Added display name
  calculateFlowDensity.displayName = 'calculateFlowDensity';

  // Added display name
  calculateFlowDensity.displayName = 'calculateFlowDensity';

  // Added display name
  calculateFlowDensity.displayName = 'calculateFlowDensity';

  // Added display name
  calculateFlowDensity.displayName = 'calculateFlowDensity';

  // Added display name
  calculateFlowDensity.displayName = 'calculateFlowDensity';


  if (!nodes || nodes.length === 0 || !viewport) {
    return { average: 0, hotspots: [] };
  }
  
  // Grid-based density calculation
  const gridSize = 200; // Size of each grid cell in pixels
  const grid = {};
  
  // Calculate node densities per grid cell
  nodes.forEach(node => {
    const gridX = Math.floor(node.position.x / gridSize);
    const gridY = Math.floor(node.position.y / gridSize);
    const key = `${gridX},${gridY}`;
    
    if (!grid[key]) {
      grid[key] = {
        x: gridX * gridSize,
        y: gridY * gridSize,
        count: 0,
        nodes: []
      };
    }
    
    grid[key].count++;
    grid[key].nodes.push(node.id);
  });
  
  // Calculate overall average and identify hotspots
  const cells = Object.values(grid);
  const totalCells = cells.length;
  const totalNodes = nodes.length;
  const averageDensity = totalNodes / totalCells;
  
  // Identify hotspots (grid cells with significantly above-average density)
  const hotspots = cells
    .filter(cell => cell.count > averageDensity * 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 hotspots
  
  return {
    average: averageDensity,
    hotspots,
    gridSize
  };
};

/**
 * Generate recommendations for optimization settings based on flow analysis
 * 
 * @param {Object} flowState - Current flow state
 * @returns {Object} - Optimization recommendations
 */
export const generateOptimizationRecommendations = (flowState) => {
  // Added display name
  generateOptimizationRecommendations.displayName = 'generateOptimizationRecommendations';

  // Added display name
  generateOptimizationRecommendations.displayName = 'generateOptimizationRecommendations';

  // Added display name
  generateOptimizationRecommendations.displayName = 'generateOptimizationRecommendations';

  // Added display name
  generateOptimizationRecommendations.displayName = 'generateOptimizationRecommendations';

  // Added display name
  generateOptimizationRecommendations.displayName = 'generateOptimizationRecommendations';


  const { nodes, edges, viewport, performanceMetrics } = flowState || {};
  
  if (!nodes || !edges) {
    return { 
      config: DEFAULT_OPTIMIZATION_CONFIG,
      explanation: "Using default optimization settings."
    };
  }
  
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const recommendations = [];
  let config = { ...DEFAULT_OPTIMIZATION_CONFIG };
  
  // Analyze flow size
  if (nodeCount >= THRESHOLDS.VERY_LARGE_FLOW) {
    recommendations.push("This is a very large flow - all optimizations are strongly recommended");
    // All optimizations enabled by default
  } else if (nodeCount >= THRESHOLDS.LARGE_FLOW) {
    recommendations.push("This is a large flow - comprehensive optimization is recommended");
    config = getRecommendedOptimizations({ nodeCount, edgeCount });
  } else if (nodeCount >= THRESHOLDS.MEDIUM_FLOW) {
    recommendations.push("This is a medium-sized flow - moderate optimization is recommended");
    config = getRecommendedOptimizations({ nodeCount, edgeCount });
    // Disable edge bundling unless there are many edges
    config[OPTIMIZATION_SETTINGS.EDGE_BUNDLING] = edgeCount > 150;
  } else {
    recommendations.push("This is a small flow - minimal optimization is sufficient");
    config = getRecommendedOptimizations({ nodeCount, edgeCount });
  }
  
  // Analyze density if we have viewport information
  if (viewport) {
    const density = calculateFlowDensity(nodes, viewport);
    if (density.hotspots.length > 0) {
      recommendations.push(`Detected ${density.hotspots.length} congested areas in the flow - viewport culling recommended`);
      config[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING] = true;
    }
  }
  
  // Analyze performance metrics if available
  if (performanceMetrics) {
    const { renderTime, fps } = performanceMetrics;
    
    if (renderTime && renderTime > 200) {
      recommendations.push("Slow rendering detected - node virtualization and batched updates recommended");
      config[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] = true;
      config[OPTIMIZATION_SETTINGS.BATCHED_UPDATES] = true;
    }
    
    if (fps && fps < 30) {
      recommendations.push("Low frame rate detected - all rendering optimizations recommended");
      config[OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION] = true;
      config[OPTIMIZATION_SETTINGS.VIEWPORT_CULLING] = true;
      config[OPTIMIZATION_SETTINGS.BATCHED_UPDATES] = true;
      config[OPTIMIZATION_SETTINGS.DETAILED_LEVEL] = true;
    }
  }
  
  return {
    config,
    recommendations,
    flowStats: {
      nodeCount,
      edgeCount
    }
  };
};

export default {
  isNodeInViewport,
  getVisibleNodeIds,
  getNodeDetailLevel,
  bundleEdges,
  getVisibleEdges,
  getEdgeDetailLevel,
  batchUpdate,
  getRecommendedOptimizations,
  createRenderingPlan,
  shouldNodeUpdate,
  shouldEdgeUpdate,
  createSimplifiedNode,
  optimizeRenderingData,
  calculateFlowDensity,
  generateOptimizationRecommendations,
  OPTIMIZATION_SETTINGS,
  DEFAULT_OPTIMIZATION_CONFIG,
  THRESHOLDS
};