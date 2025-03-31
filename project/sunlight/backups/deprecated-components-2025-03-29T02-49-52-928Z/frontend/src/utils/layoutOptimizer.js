/**
 * @module layoutOptimizer
 * @description Utilities for optimizing the layout of integration flow nodes to improve readability
 * and organization. Includes algorithms for automatic arrangement based on node relationships.
 */

/**
 * Optimizes the layout of a flow by arranging nodes in a more organized manner
 * @param {Array} nodes - Flow nodes
 * @param {Array} edges - Flow edges
 * @param {Object} options - Layout options
 * @returns {Array} Optimized nodes with new positions
 */
export const optimizeLayout = (nodes, edges, options = {}) => {
  // Added display name
  optimizeLayout.displayName = 'optimizeLayout';

  // Added display name
  optimizeLayout.displayName = 'optimizeLayout';

  // Added display name
  optimizeLayout.displayName = 'optimizeLayout';

  // Added display name
  optimizeLayout.displayName = 'optimizeLayout';

  // Added display name
  optimizeLayout.displayName = 'optimizeLayout';


  // Default options
  const defaultOptions = {
    direction: 'horizontal', // horizontal or vertical
    nodeWidth: 180,
    nodeHeight: 100,
    horizontalSpacing: 250,
    verticalSpacing: 150,
    paddingLeft: 50,
    paddingTop: 50,
    smartAlignment: true, // align nodes that are on the same level
    avoidOverlap: true, // prevent nodes from overlapping
    autoMirror: true, // mirror the layout if it makes more sense
  };

  const layoutOptions = { ...defaultOptions, ...options };

  // Create a copy of nodes to avoid modifying the original
  const optimizedNodes = JSON.parse(JSON.stringify(nodes));

  // If there are no nodes, return empty array
  if (optimizedNodes.length === 0) {
    return [];
  }

  // If there's only one node, center it
  if (optimizedNodes.length === 1) {
    optimizedNodes[0].position = { x: layoutOptions.paddingLeft, y: layoutOptions.paddingTop };
    return optimizedNodes;
  }

  // Build node and edge data structures for layout algorithm
  const nodeMap = {};
  optimizedNodes.forEach(node => {
    nodeMap[node.id] = {
      id: node.id,
      type: node.type,
      incomingEdges: [],
      outgoingEdges: [],
      level: null,
      column: null,
      position: node.position,
    };
  });

  // Map edges to nodes
  edges.forEach(edge => {
    if (nodeMap[edge.source]) {
      nodeMap[edge.source].outgoingEdges.push(edge.target);
    }
    if (nodeMap[edge.target]) {
      nodeMap[edge.target].incomingEdges.push(edge.source);
    }
  });

  // Identify root nodes (nodes with no incoming edges)
  const rootNodes = Object.values(nodeMap).filter(node => node.incomingEdges.length === 0);

  // If there are no root nodes, find nodes with the fewest incoming edges
  if (rootNodes.length === 0) {
    // Find minimum number of incoming edges
    const minIncoming = Math.min(...Object.values(nodeMap).map(node => node.incomingEdges.length));

    // Use nodes with minimum incoming edges as roots
    for (const node of Object.values(nodeMap)) {
      if (node.incomingEdges.length === minIncoming) {
        rootNodes.push(node);
      }
    }
  }

  // Assign levels to nodes using BFS
  const queue = [...rootNodes.map(node => ({ node, level: 0 }))];
  const visited = new Set();

  while (queue.length > 0) {
    const { node, level } = queue.shift();

    if (visited.has(node.id)) {
      // Node has already been visited, update level if new level is higher
      if (level > node.level) {
        node.level = level;
      }
      continue;
    }

    visited.add(node.id);
    node.level = level;

    // Add outgoing nodes to queue
    for (const targetId of node.outgoingEdges) {
      if (nodeMap[targetId]) {
        queue.push({ node: nodeMap[targetId], level: level + 1 });
      }
    }
  }

  // Find nodes not visited in BFS (disconnected nodes)
  const disconnectedNodes = Object.values(nodeMap).filter(node => !visited.has(node.id));
  disconnectedNodes.forEach(node => {
    node.level = 0; // Assign level 0 to disconnected nodes
  });

  // Determine the maximum level
  const maxLevel = Math.max(...Object.values(nodeMap).map(node => node.level));

  // Calculate the number of nodes at each level
  const nodesPerLevel = Array(maxLevel + 1).fill(0);
  Object.values(nodeMap).forEach(node => {
    nodesPerLevel[node.level]++;
  });

  // Assign columns to nodes at each level
  const assignedColumnsPerLevel = Array(maxLevel + 1).fill(0);

  for (let level = 0; level <= maxLevel; level++) {
    // Get nodes at this level
    const nodesAtLevel = Object.values(nodeMap).filter(node => node.level === level);

    // Sort nodes based on their connections to previous level
    nodesAtLevel.sort((a, b) => {
      // Get the average column of incoming nodes for each node
      const aIncomingCols = a.incomingEdges
        .map(nodeId => (nodeMap[nodeId]?.column !== null ? nodeMap[nodeId].column : 0))
        .filter(col => col !== null);

      const bIncomingCols = b.incomingEdges
        .map(nodeId => (nodeMap[nodeId]?.column !== null ? nodeMap[nodeId].column : 0))
        .filter(col => col !== null);

      const aAvgCol =
        aIncomingCols.length > 0
          ? aIncomingCols.reduce((sum, col) => sum + col, 0) / aIncomingCols.length
          : -1;

      const bAvgCol =
        bIncomingCols.length > 0
          ? bIncomingCols.reduce((sum, col) => sum + col, 0) / bIncomingCols.length
          : -1;

      // Sort by average column of incoming nodes
      if (aAvgCol !== -1 && bAvgCol !== -1) {
        return aAvgCol - bAvgCol;
      }

      // If one node has incoming nodes and the other doesn't, prioritize the one with incoming
      if (aAvgCol !== -1) return -1;
      if (bAvgCol !== -1) return 1;

      // Sort by number of outgoing edges as a fallback
      return b.outgoingEdges.length - a.outgoingEdges.length;
    });

    // Assign columns to nodes at this level
    nodesAtLevel.forEach((node, idx) => {
      node.column = idx;
      assignedColumnsPerLevel[level]++;
    });
  }

  // Calculate canvas dimensions
  const width =
    Math.max(...assignedColumnsPerLevel) * layoutOptions.horizontalSpacing +
    layoutOptions.nodeWidth +
    layoutOptions.paddingLeft * 2;
  const height =
    (maxLevel + 1) * layoutOptions.verticalSpacing +
    layoutOptions.nodeHeight +
    layoutOptions.paddingTop * 2;

  // Position nodes based on level and column
  Object.values(nodeMap).forEach(node => {
  // Added display name
  height.displayName = 'height';

    let x, y;

    if (layoutOptions.direction === 'horizontal') {
      // In horizontal layout, levels go from left to right
      x = layoutOptions.paddingLeft + node.level * layoutOptions.horizontalSpacing;

      // Center nodes within their level
      const nodesInLevel = assignedColumnsPerLevel[node.level];
      const totalLevelHeight = (nodesInLevel - 1) * layoutOptions.verticalSpacing;
      const startY =
        layoutOptions.paddingTop + (height - layoutOptions.paddingTop * 2 - totalLevelHeight) / 2;

      y = startY + node.column * layoutOptions.verticalSpacing;

      // Apply smart alignment if enabled
      if (layoutOptions.smartAlignment && node.incomingEdges.length === 1) {
        // Try to align with the incoming node
        const incomingNode = nodeMap[node.incomingEdges[0]];
        if (incomingNode && incomingNode.level === node.level - 1) {
          y = incomingNode.position.y;
        }
      }
    } else {
      // In vertical layout, levels go from top to bottom
      y = layoutOptions.paddingTop + node.level * layoutOptions.verticalSpacing;

      // Center nodes within their level
      const nodesInLevel = assignedColumnsPerLevel[node.level];
      const totalLevelWidth = (nodesInLevel - 1) * layoutOptions.horizontalSpacing;
      const startX =
        layoutOptions.paddingLeft + (width - layoutOptions.paddingLeft * 2 - totalLevelWidth) / 2;

      x = startX + node.column * layoutOptions.horizontalSpacing;

      // Apply smart alignment if enabled
      if (layoutOptions.smartAlignment && node.incomingEdges.length === 1) {
        // Try to align with the incoming node
        const incomingNode = nodeMap[node.incomingEdges[0]];
        if (incomingNode && incomingNode.level === node.level - 1) {
          x = incomingNode.position.x;
        }
      }
    }

    node.position = { x, y };
  });

  // Avoid overlap if enabled
  if (layoutOptions.avoidOverlap) {
    const resolveOverlaps = () => {
  // Added display name
  resolveOverlaps.displayName = 'resolveOverlaps';

  // Added display name
  resolveOverlaps.displayName = 'resolveOverlaps';

  // Added display name
  resolveOverlaps.displayName = 'resolveOverlaps';

  // Added display name
  resolveOverlaps.displayName = 'resolveOverlaps';

  // Added display name
  resolveOverlaps.displayName = 'resolveOverlaps';


      let overlapsResolved = false;

      for (let i = 0; i < Object.values(nodeMap).length; i++) {
        const nodeA = Object.values(nodeMap)[i];

        for (let j = i + 1; j < Object.values(nodeMap).length; j++) {
          const nodeB = Object.values(nodeMap)[j];

          // Skip if nodes are on different levels
          if (nodeA.level !== nodeB.level) continue;

          const xOverlap = Math.abs(nodeA.position.x - nodeB.position.x) < layoutOptions.nodeWidth;
          const yOverlap = Math.abs(nodeA.position.y - nodeB.position.y) < layoutOptions.nodeHeight;

          if (xOverlap && yOverlap) {
            // Resolve the overlap
            overlapsResolved = true;

            // Move the node with fewer connections
            const nodeToMove =
              nodeA.incomingEdges.length + nodeA.outgoingEdges.length <=
              nodeB.incomingEdges.length + nodeB.outgoingEdges.length
                ? nodeA
                : nodeB;

            if (layoutOptions.direction === 'horizontal') {
              // In horizontal layout, adjust Y position
              nodeToMove.position.y += layoutOptions.verticalSpacing / 2;
            } else {
              // In vertical layout, adjust X position
              nodeToMove.position.x += layoutOptions.horizontalSpacing / 2;
            }
          }
        }
      }

      return overlapsResolved;
    };

    // Iteratively resolve overlaps until no more can be resolved
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (resolveOverlaps() && iterations < maxIterations) {
      iterations++;
    }
  }

  // Update node positions in the optimized nodes array
  optimizedNodes.forEach(node => {
    if (nodeMap[node.id]) {
      node.position = { ...nodeMap[node.id].position };
    }
  });

  return optimizedNodes;
};

/**
 * Arranges nodes in a hierarchical layout
 * @param {Array} nodes - Flow nodes
 * @param {Array} edges - Flow edges
 * @param {Object} options - Layout options
 * @returns {Array} Nodes with updated positions
 */
export const arrangeHierarchical = (nodes, edges, options = {}) => {
  // Added display name
  arrangeHierarchical.displayName = 'arrangeHierarchical';

  // Added display name
  arrangeHierarchical.displayName = 'arrangeHierarchical';

  // Added display name
  arrangeHierarchical.displayName = 'arrangeHierarchical';

  // Added display name
  arrangeHierarchical.displayName = 'arrangeHierarchical';

  // Added display name
  arrangeHierarchical.displayName = 'arrangeHierarchical';


  return optimizeLayout(nodes, edges, {
    direction: 'vertical',
    ...options,
  });
};

/**
 * Arranges nodes in a horizontal flow layout
 * @param {Array} nodes - Flow nodes
 * @param {Array} edges - Flow edges
 * @param {Object} options - Layout options
 * @returns {Array} Nodes with updated positions
 */
export const arrangeHorizontalFlow = (nodes, edges, options = {}) => {
  // Added display name
  arrangeHorizontalFlow.displayName = 'arrangeHorizontalFlow';

  // Added display name
  arrangeHorizontalFlow.displayName = 'arrangeHorizontalFlow';

  // Added display name
  arrangeHorizontalFlow.displayName = 'arrangeHorizontalFlow';

  // Added display name
  arrangeHorizontalFlow.displayName = 'arrangeHorizontalFlow';

  // Added display name
  arrangeHorizontalFlow.displayName = 'arrangeHorizontalFlow';


  return optimizeLayout(nodes, edges, {
    direction: 'horizontal',
    ...options,
  });
};

/**
 * Arranges nodes in a circular layout
 * @param {Array} nodes - Flow nodes
 * @param {Array} edges - Flow edges
 * @param {Object} options - Layout options
 * @returns {Array} Nodes with updated positions
 */
export const arrangeCircular = (nodes, edges, options = {}) => {
  // Added display name
  arrangeCircular.displayName = 'arrangeCircular';

  // Added display name
  arrangeCircular.displayName = 'arrangeCircular';

  // Added display name
  arrangeCircular.displayName = 'arrangeCircular';

  // Added display name
  arrangeCircular.displayName = 'arrangeCircular';

  // Added display name
  arrangeCircular.displayName = 'arrangeCircular';


  // Default options
  const defaultOptions = {
    radius: 300,
    startAngle: 0,
    centerX: 400,
    centerY: 300,
  };

  const layoutOptions = { ...defaultOptions, ...options };

  // Create a copy of nodes to avoid modifying the original
  const optimizedNodes = JSON.parse(JSON.stringify(nodes));

  // If there are no nodes, return empty array
  if (optimizedNodes.length === 0) {
    return [];
  }

  // If there's only one node, center it
  if (optimizedNodes.length === 1) {
    optimizedNodes[0].position = {
      x: layoutOptions.centerX,
      y: layoutOptions.centerY,
    };
    return optimizedNodes;
  }

  // Position nodes in a circle
  const angleStep = (2 * Math.PI) / optimizedNodes.length;

  optimizedNodes.forEach((node, index) => {
  // Added display name
  angleStep.displayName = 'angleStep';

    const angle = layoutOptions.startAngle + index * angleStep;

    node.position = {
      x: layoutOptions.centerX + layoutOptions.radius * Math.cos(angle),
      y: layoutOptions.centerY + layoutOptions.radius * Math.sin(angle),
    };
  });

  return optimizedNodes;
};

export default {
  optimizeLayout,
  arrangeHierarchical,
  arrangeHorizontalFlow,
  arrangeCircular,
};
