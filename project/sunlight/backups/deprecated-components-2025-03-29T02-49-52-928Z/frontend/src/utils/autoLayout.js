/**
 * autoLayout.js
 * 
 * Utility for automatically organizing nodes in a flow diagram.
 * Provides automatic layout capabilities for complex integration flows
 * based on node relationships and flow direction.
 */

/**
 * Calculate a good layout for a set of nodes and edges in a flow
 * 
 * @param {Array} nodes - The flow nodes to arrange
 * @param {Array} edges - The edges connecting the nodes
 * @param {Object} options - Layout options
 * @returns {Array} The nodes with updated positions
 */
export const calculateAutoLayout = (nodes, edges, options = {}) => {
  // Added display name
  calculateAutoLayout.displayName = 'calculateAutoLayout';

  // Added display name
  calculateAutoLayout.displayName = 'calculateAutoLayout';

  // Added display name
  calculateAutoLayout.displayName = 'calculateAutoLayout';

  // Added display name
  calculateAutoLayout.displayName = 'calculateAutoLayout';

  // Added display name
  calculateAutoLayout.displayName = 'calculateAutoLayout';


  // Default options
  const defaultOptions = {
    direction: 'LR', // 'LR' (left to right) or 'TB' (top to bottom)
    nodeWidth: 200,
    nodeHeight: 150,
    horizontalSpacing: 200,
    verticalSpacing: 150,
    marginLeft: 50,
    marginTop: 50,
    alignmentTolerance: 50 // How much vertical position can vary within a column
  };
  
  const config = { ...defaultOptions, ...options };
  
  // If no nodes or edges, return original nodes
  if (!nodes || nodes.length === 0) {
    return nodes;
  }
  
  // Make a copy of the nodes to modify
  const newNodes = [...nodes];
  
  // First, organize nodes into levels based on their connections
  const levels = calculateNodeLevels(newNodes, edges);
  
  // Now position nodes based on their levels
  positionNodesByLevel(newNodes, levels, config);
  
  // Detect and fix node overlaps
  resolveNodeOverlaps(newNodes, config);
  
  return newNodes;
};

/**
 * Calculate the level (column) each node should be in based on connections
 * 
 * @param {Array} nodes - The flow nodes
 * @param {Array} edges - The edges connecting the nodes
 * @returns {Object} Map of node IDs to their calculated levels
 */
const calculateNodeLevels = (nodes, edges) => {
  // Added display name
  calculateNodeLevels.displayName = 'calculateNodeLevels';

  // Added display name
  calculateNodeLevels.displayName = 'calculateNodeLevels';

  // Added display name
  calculateNodeLevels.displayName = 'calculateNodeLevels';

  // Added display name
  calculateNodeLevels.displayName = 'calculateNodeLevels';

  // Added display name
  calculateNodeLevels.displayName = 'calculateNodeLevels';


  // Create a map of node IDs to outgoing and incoming edge counts
  const nodeDegrees = new Map();
  const outgoingEdges = new Map();
  const incomingEdges = new Map();
  
  // Initialize maps for all nodes
  nodes.forEach(node => {
    nodeDegrees.set(node.id, { in: 0, out: 0 });
    outgoingEdges.set(node.id, []);
    incomingEdges.set(node.id, []);
  });
  
  // Count edges for each node
  edges.forEach(edge => {
    const sourceDegree = nodeDegrees.get(edge.source);
    const targetDegree = nodeDegrees.get(edge.target);
    
    if (sourceDegree) {
      sourceDegree.out += 1;
      outgoingEdges.get(edge.source).push(edge.target);
    }
    
    if (targetDegree) {
      targetDegree.in += 1;
      incomingEdges.get(edge.target).push(edge.source);
    }
  });
  
  // Identify source nodes (no incoming edges)
  const sourceNodes = [];
  nodeDegrees.forEach((degree, nodeId) => {
    if (degree.in === 0) {
      sourceNodes.push(nodeId);
    }
  });
  
  // If no source nodes, find nodes with fewest incoming edges
  if (sourceNodes.length === 0) {
    let minInDegree = Infinity;
    
    nodeDegrees.forEach((degree, nodeId) => {
      if (degree.in < minInDegree) {
        minInDegree = degree.in;
      }
    });
    
    nodeDegrees.forEach((degree, nodeId) => {
      if (degree.in === minInDegree) {
        sourceNodes.push(nodeId);
      }
    });
  }
  
  // Assign levels to nodes using breadth-first traversal
  const levels = new Map();
  const visited = new Set();
  
  // Start with source nodes at level 0
  sourceNodes.forEach(nodeId => {
    levels.set(nodeId, 0);
    visited.add(nodeId);
  });
  
  // Process nodes level by level
  let currentLevel = 0;
  let nodesAtCurrentLevel = sourceNodes;
  
  while (nodesAtCurrentLevel.length > 0) {
    const nextLevelNodes = [];
    
    // Process each node at the current level
    nodesAtCurrentLevel.forEach(nodeId => {
      // Get outgoing edges and add target nodes to the next level
      outgoingEdges.get(nodeId).forEach(targetId => {
        if (!visited.has(targetId)) {
          levels.set(targetId, currentLevel + 1);
          visited.add(targetId);
          nextLevelNodes.push(targetId);
        }
        // If already visited, make sure it's at a higher level
        else if (levels.get(targetId) <= currentLevel) {
          levels.set(targetId, currentLevel + 1);
        }
      });
    });
    
    currentLevel++;
    nodesAtCurrentLevel = nextLevelNodes;
  }
  
  // Handle any unvisited nodes (no connections)
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      // Place disconnected nodes based on their type
      const nodeType = node.type || '';
      
      if (nodeType.includes('source') || nodeType.includes('trigger')) {
        levels.set(node.id, 0);
      } else if (nodeType.includes('destination')) {
        // Find the highest level and put destinations at the end
        const maxLevel = Math.max(...Array.from(levels.values()), 0);
        levels.set(node.id, maxLevel + 1);
      } else {
        // Other disconnected nodes go in the middle
        const maxLevel = Math.max(...Array.from(levels.values()), 0);
        levels.set(node.id, Math.floor(maxLevel / 2));
      }
    }
  });
  
  return levels;
};

/**
 * Position nodes based on their calculated levels
 * 
 * @param {Array} nodes - The flow nodes to position
 * @param {Map} levels - Map of node IDs to their levels
 * @param {Object} config - Layout configuration
 */
const positionNodesByLevel = (nodes, levels, config) => {
  // Added display name
  positionNodesByLevel.displayName = 'positionNodesByLevel';

  // Added display name
  positionNodesByLevel.displayName = 'positionNodesByLevel';

  // Added display name
  positionNodesByLevel.displayName = 'positionNodesByLevel';

  // Added display name
  positionNodesByLevel.displayName = 'positionNodesByLevel';

  // Added display name
  positionNodesByLevel.displayName = 'positionNodesByLevel';


  // Group nodes by level
  const nodesByLevel = new Map();
  
  levels.forEach((level, nodeId) => {
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    
    const levelNodes = nodesByLevel.get(level);
    const node = nodes.find(n => n.id === nodeId);
    
    if (node) {
      levelNodes.push(node);
    }
  });
  
  // Determine the maximum number of nodes in a level
  let maxNodesInAnyLevel = 0;
  nodesByLevel.forEach(levelNodes => {
    maxNodesInAnyLevel = Math.max(maxNodesInAnyLevel, levelNodes.length);
  });
  
  // Calculate total layout height
  const totalHeight = maxNodesInAnyLevel * (config.nodeHeight + config.verticalSpacing);
  
  // Position nodes in each level
  nodesByLevel.forEach((levelNodes, level) => {
    // Sort nodes in this level by their current vertical position
    levelNodes.sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));
    
    // Calculate starting X position for this level
    const levelX = config.marginLeft + level * (config.nodeWidth + config.horizontalSpacing);
    
    // Calculate spacing between nodes
    const levelHeight = levelNodes.length * config.nodeHeight + (levelNodes.length - 1) * config.verticalSpacing;
    const startY = config.marginTop + (totalHeight - levelHeight) / 2;
    
    // Position each node in the level
    levelNodes.forEach((node, index) => {
      node.position = {
        x: levelX,
        y: startY + index * (config.nodeHeight + config.verticalSpacing)
      };
    });
  });
};

/**
 * Detect and resolve node overlaps
 * 
 * @param {Array} nodes - The positioned nodes
 * @param {Object} config - Layout configuration
 */
const resolveNodeOverlaps = (nodes, config) => {
  // Added display name
  resolveNodeOverlaps.displayName = 'resolveNodeOverlaps';

  // Added display name
  resolveNodeOverlaps.displayName = 'resolveNodeOverlaps';

  // Added display name
  resolveNodeOverlaps.displayName = 'resolveNodeOverlaps';

  // Added display name
  resolveNodeOverlaps.displayName = 'resolveNodeOverlaps';

  // Added display name
  resolveNodeOverlaps.displayName = 'resolveNodeOverlaps';


  let overlap = true;
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops
  
  while (overlap && iterations < maxIterations) {
    overlap = false;
    iterations++;
    
    // Check each pair of nodes for overlap
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        
        // Skip if nodes are not at the same x-coordinate (not in the same column)
        if (Math.abs(nodeA.position.x - nodeB.position.x) > config.nodeWidth) {
          continue;
        }
        
        // Check vertical overlap
        const verticalDistance = Math.abs(nodeA.position.y - nodeB.position.y);
        
        if (verticalDistance < config.nodeHeight) {
          overlap = true;
          
          // Determine which node to move
          if (nodeA.position.y < nodeB.position.y) {
            // Move nodeA up and nodeB down
            nodeA.position.y -= (config.nodeHeight - verticalDistance) / 2;
            nodeB.position.y += (config.nodeHeight - verticalDistance) / 2;
          } else {
            // Move nodeB up and nodeA down
            nodeB.position.y -= (config.nodeHeight - verticalDistance) / 2;
            nodeA.position.y += (config.nodeHeight - verticalDistance) / 2;
          }
        }
      }
    }
  }
};

/**
 * Apply automatic layout to a flow diagram
 * 
 * @param {Array} nodes - The flow nodes to arrange
 * @param {Array} edges - The edges connecting the nodes
 * @param {string} direction - 'LR' for left-to-right, 'TB' for top-to-bottom
 * @returns {Array} The nodes with updated positions
 */
export const applyAutoLayout = (nodes, edges, direction = 'LR') => {
  // Added display name
  applyAutoLayout.displayName = 'applyAutoLayout';

  // Added display name
  applyAutoLayout.displayName = 'applyAutoLayout';

  // Added display name
  applyAutoLayout.displayName = 'applyAutoLayout';

  // Added display name
  applyAutoLayout.displayName = 'applyAutoLayout';

  // Added display name
  applyAutoLayout.displayName = 'applyAutoLayout';


  // Create layout options based on direction
  const options = {
    direction,
    // Adjust node size and spacing based on direction
    nodeWidth: direction === 'LR' ? 200 : 250,
    nodeHeight: direction === 'LR' ? 150 : 120,
    horizontalSpacing: direction === 'LR' ? 300 : 150,
    verticalSpacing: direction === 'LR' ? 200 : 250
  };
  
  return calculateAutoLayout(nodes, edges, options);
};

/**
 * Align selected nodes horizontally or vertically
 * 
 * @param {Array} nodes - All flow nodes
 * @param {Array} selectedNodeIds - IDs of nodes to align
 * @param {string} alignment - 'horizontal' or 'vertical'
 * @returns {Array} The nodes with updated positions
 */
export const alignNodes = (nodes, selectedNodeIds, alignment) => {
  // Added display name
  alignNodes.displayName = 'alignNodes';

  // Added display name
  alignNodes.displayName = 'alignNodes';

  // Added display name
  alignNodes.displayName = 'alignNodes';

  // Added display name
  alignNodes.displayName = 'alignNodes';

  // Added display name
  alignNodes.displayName = 'alignNodes';


  if (!selectedNodeIds || selectedNodeIds.length < 2) {
    return nodes;
  }
  
  // Make a copy of the nodes to modify
  const newNodes = [...nodes];
  
  // Get the selected nodes
  const selectedNodes = newNodes.filter(node => selectedNodeIds.includes(node.id));
  
  if (alignment === 'horizontal') {
    // Calculate average Y position
    const avgY = selectedNodes.reduce((sum, node) => sum + node.position.y, 0) / selectedNodes.length;
    
    // Align all selected nodes to this Y position
    selectedNodes.forEach(node => {
      node.position.y = avgY;
    });
  } else if (alignment === 'vertical') {
    // Calculate average X position
    const avgX = selectedNodes.reduce((sum, node) => sum + node.position.x, 0) / selectedNodes.length;
    
    // Align all selected nodes to this X position
    selectedNodes.forEach(node => {
      node.position.x = avgX;
    });
  }
  
  return newNodes;
};

/**
 * Distribute selected nodes evenly in horizontal or vertical direction
 * 
 * @param {Array} nodes - All flow nodes
 * @param {Array} selectedNodeIds - IDs of nodes to distribute
 * @param {string} direction - 'horizontal' or 'vertical'
 * @returns {Array} The nodes with updated positions
 */
export const distributeNodes = (nodes, selectedNodeIds, direction) => {
  // Added display name
  distributeNodes.displayName = 'distributeNodes';

  // Added display name
  distributeNodes.displayName = 'distributeNodes';

  // Added display name
  distributeNodes.displayName = 'distributeNodes';

  // Added display name
  distributeNodes.displayName = 'distributeNodes';

  // Added display name
  distributeNodes.displayName = 'distributeNodes';


  if (!selectedNodeIds || selectedNodeIds.length < 3) {
    return nodes;
  }
  
  // Make a copy of the nodes to modify
  const newNodes = [...nodes];
  
  // Get the selected nodes
  const selectedNodes = newNodes.filter(node => selectedNodeIds.includes(node.id));
  
  if (direction === 'horizontal') {
    // Sort nodes by X position
    selectedNodes.sort((a, b) => a.position.x - b.position.x);
    
    // Get leftmost and rightmost positions
    const startX = selectedNodes[0].position.x;
    const endX = selectedNodes[selectedNodes.length - 1].position.x;
    
    // Calculate even spacing
    const spacing = (endX - startX) / (selectedNodes.length - 1);
    
    // Distribute nodes evenly between start and end
    for (let i = 1; i < selectedNodes.length - 1; i++) {
      selectedNodes[i].position.x = startX + i * spacing;
    }
  } else if (direction === 'vertical') {
    // Sort nodes by Y position
    selectedNodes.sort((a, b) => a.position.y - b.position.y);
    
    // Get topmost and bottommost positions
    const startY = selectedNodes[0].position.y;
    const endY = selectedNodes[selectedNodes.length - 1].position.y;
    
    // Calculate even spacing
    const spacing = (endY - startY) / (selectedNodes.length - 1);
    
    // Distribute nodes evenly between start and end
    for (let i = 1; i < selectedNodes.length - 1; i++) {
      selectedNodes[i].position.y = startY + i * spacing;
    }
  }
  
  return newNodes;
};

/**
 * Centralize the view of nodes
 * 
 * @param {Array} nodes - The flow nodes
 * @param {Object} containerDimensions - {width, height} of the container
 * @returns {Object} The center point and zoom level
 */
export const calculateViewCenter = (nodes, containerDimensions) => {
  // Added display name
  calculateViewCenter.displayName = 'calculateViewCenter';

  // Added display name
  calculateViewCenter.displayName = 'calculateViewCenter';

  // Added display name
  calculateViewCenter.displayName = 'calculateViewCenter';

  // Added display name
  calculateViewCenter.displayName = 'calculateViewCenter';

  // Added display name
  calculateViewCenter.displayName = 'calculateViewCenter';


  if (!nodes || nodes.length === 0) {
    return { x: 0, y: 0, zoom: 1 };
  }
  
  // Calculate the bounding box of all nodes
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  nodes.forEach(node => {
    const x = node.position.x;
    const y = node.position.y;
    const width = 200; // Approximate node width
    const height = 150; // Approximate node height
    
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });
  
  // Calculate center of the bounding box
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  
  // Calculate required zoom level to fit all nodes
  const graphWidth = maxX - minX + 100; // Add padding
  const graphHeight = maxY - minY + 100; // Add padding
  
  const zoomX = containerDimensions.width / graphWidth;
  const zoomY = containerDimensions.height / graphHeight;
  
  // Use the smaller zoom level to ensure everything fits
  const zoom = Math.min(zoomX, zoomY, 1); // Cap at 1 to prevent excessive zoom
  
  return { x: centerX, y: centerY, zoom };
};

export default {
  applyAutoLayout,
  alignNodes,
  distributeNodes,
  calculateViewCenter
};