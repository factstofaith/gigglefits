/**
 * Connection Validation Service
 * 
 * This service provides validation for connections between nodes in the flow canvas.
 * It handles type compatibility, data format validation, and connection constraints.
 */

// Node type definitions
const NODE_TYPES = {
  sourceNode: {
    outputs: ['data'],
    maxOutputConnections: null, // unlimited
    description: 'Source node providing data',
  },
  destinationNode: {
    inputs: ['data'],
    maxInputConnections: 10,
    description: 'Destination node receiving data',
  },
  transformationNode: {
    inputs: ['data'],
    outputs: ['data'],
    maxInputConnections: 5,
    maxOutputConnections: 10,
    description: 'Transformation node processing data',
  },
  filterNode: {
    inputs: ['data'],
    outputs: ['data', 'filtered'],
    maxInputConnections: 5,
    maxOutputConnections: 10,
    description: 'Filter node routing data based on conditions',
  }
};

// Data type compatibility matrix
// This defines which data types can be connected to which
const DATA_TYPE_COMPATIBILITY = {
  'string': ['string', 'any'],
  'number': ['number', 'any'],
  'boolean': ['boolean', 'any'],
  'date': ['date', 'string', 'any'],
  'object': ['object', 'any'],
  'array': ['array', 'any'],
  'any': ['string', 'number', 'boolean', 'date', 'object', 'array', 'any'],
};

/**
 * Checks if a node of sourceType can connect to a node of targetType
 * 
 * @param {string} sourceType - The type of the source node
 * @param {string} targetType - The type of the target node
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateNodeTypeConnection = (sourceType, targetType) => {
  // Check if node types exist in our definitions
  if (!NODE_TYPES[sourceType]) {
    return {
      isValid: false,
      hasError: true,
      message: `Invalid source node type: ${sourceType}`,
    };
  }
  
  if (!NODE_TYPES[targetType]) {
    return {
      isValid: false,
      hasError: true,
      message: `Invalid target node type: ${targetType}`,
    };
  }
  
  // Check if source node has outputs
  if (!NODE_TYPES[sourceType].outputs || NODE_TYPES[sourceType].outputs.length === 0) {
    return {
      isValid: false,
      hasError: true,
      message: `Source node type ${sourceType} has no outputs`,
    };
  }
  
  // Check if target node has inputs
  if (!NODE_TYPES[targetType].inputs || NODE_TYPES[targetType].inputs.length === 0) {
    return {
      isValid: false,
      hasError: true,
      message: `Target node type ${targetType} has no inputs`,
    };
  }
  
  // For now, let's assume all defined connections are valid if both have I/O
  return {
    isValid: true,
    message: `Connection from ${sourceType} to ${targetType} is valid`,
  };
};

/**
 * Validates a connection between nodes based on handles and data types
 * 
 * @param {Object} source - The source node
 * @param {Object} target - The target node
 * @param {string} sourceHandle - The source handle ID
 * @param {string} targetHandle - The target handle ID
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateHandleConnection = (source, target, sourceHandle, targetHandle) => {
  // Get the data types from handles
  const sourceDataType = source?.data?.outputs?.[sourceHandle]?.type || 'any';
  const targetDataType = target?.data?.inputs?.[targetHandle]?.type || 'any';
  
  // Check if data types are compatible
  const compatibleTypes = DATA_TYPE_COMPATIBILITY[sourceDataType] || [];
  if (!compatibleTypes.includes(targetDataType)) {
    return {
      isValid: false,
      hasError: true,
      message: `Incompatible data types: ${sourceDataType} cannot connect to ${targetDataType}`,
    };
  }
  
  return {
    isValid: true,
    message: `Data types ${sourceDataType} and ${targetDataType} are compatible`,
  };
};

/**
 * Validates connection count constraints
 * 
 * @param {Object} node - The node to check
 * @param {Array} connections - All existing connections
 * @param {string} connectionType - Either 'input' or 'output'
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateConnectionCount = (node, connections, connectionType) => {
  const nodeType = node.type;
  const nodeTypeInfo = NODE_TYPES[nodeType];
  
  if (!nodeTypeInfo) {
    return {
      isValid: true, // Skip constraint validation for unknown node types
      message: 'Unknown node type, skipping constraint validation',
    };
  }
  
  // Count existing connections for this node
  const connectionCount = connections.filter(conn => {
    if (connectionType === 'input') {
      return conn.target === node.id;
    } else {
      return conn.source === node.id;
    }
  }).length;
  
  // Check against max connection constraints
  const maxConnections = connectionType === 'input' 
    ? nodeTypeInfo.maxInputConnections 
    : nodeTypeInfo.maxOutputConnections;
  
  if (maxConnections !== null && connectionCount >= maxConnections) {
    return {
      isValid: false,
      hasWarning: true,
      message: `Maximum ${connectionType} connections (${maxConnections}) reached for ${nodeType}`,
    };
  }
  
  return {
    isValid: true,
    message: `${connectionType} connection count is valid (${connectionCount}/${maxConnections || '∞'})`,
  };
};

/**
 * Detect cycles in the flow graph
 * 
 * @param {Array} nodes - All nodes in the flow
 * @param {Array} edges - All edges in the flow
 * @returns {Object} Validation result with isValid flag and message
 */
export const detectCycles = (nodes, edges) => {
  // Create an adjacency list representation of the graph
  const graph = {};
  nodes.forEach(node => {
    graph[node.id] = [];
  });
  
  edges.forEach(edge => {
    if (edge.source && edge.target) {
      graph[edge.source].push(edge.target);
    }
  });
  
  // DFS to detect cycles
  const visited = {};
  const recStack = {};
  
  function dfsUtil(nodeId, visited, recStack) {
    if (!visited[nodeId]) {
      visited[nodeId] = true;
      recStack[nodeId] = true;
      
      const neighbors = graph[nodeId] || [];
      for (const neighbor of neighbors) {
        if (!visited[neighbor] && dfsUtil(neighbor, visited, recStack)) {
          return true;
        } else if (recStack[neighbor]) {
          return true;
        }
      }
    }
    
    recStack[nodeId] = false;
    return false;
  }
  
  // Check each node as a starting point
  for (const nodeId in graph) {
    if (!visited[nodeId]) {
      if (dfsUtil(nodeId, visited, recStack)) {
        return {
          isValid: false,
          hasError: true,
          message: 'Cycle detected in flow. This may cause infinite loops.',
        };
      }
    }
  }
  
  return {
    isValid: true,
    message: 'No cycles detected in flow.',
  };
};

/**
 * Validates a connection as a whole
 * 
 * @param {Object} connection - The connection to validate
 * @param {Array} nodes - All nodes in the flow
 * @param {Array} edges - All edges in the flow
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateConnection = (connection, nodes, edges) => {
  // Find source and target nodes
  const sourceNode = nodes.find(node => node.id === connection.source);
  const targetNode = nodes.find(node => node.id === connection.target);
  
  if (!sourceNode || !targetNode) {
    return {
      isValid: false,
      hasError: true,
      message: 'Source or target node not found',
    };
  }
  
  // Validate node type compatibility
  const nodeTypeValidation = validateNodeTypeConnection(
    sourceNode.type,
    targetNode.type
  );
  
  if (!nodeTypeValidation.isValid) {
    return nodeTypeValidation;
  }
  
  // Validate handle data type compatibility
  const handleValidation = validateHandleConnection(
    sourceNode,
    targetNode,
    connection.sourceHandle,
    connection.targetHandle
  );
  
  if (!handleValidation.isValid) {
    return handleValidation;
  }
  
  // Validate source output connection count
  const sourceOutputValidation = validateConnectionCount(
    sourceNode,
    edges,
    'output'
  );
  
  if (!sourceOutputValidation.isValid) {
    return sourceOutputValidation;
  }
  
  // Validate target input connection count
  const targetInputValidation = validateConnectionCount(
    targetNode,
    edges,
    'input'
  );
  
  if (!targetInputValidation.isValid) {
    return targetInputValidation;
  }
  
  // Check for cycles when adding this connection
  const allEdges = [...edges, connection].filter(e => 
    // Filter out the existing version of this connection if we're updating
    !(e.id !== connection.id && e.source === connection.source && e.target === connection.target)
  );
  
  const cycleValidation = detectCycles(nodes, allEdges);
  if (!cycleValidation.isValid) {
    return cycleValidation;
  }
  
  // All validations passed
  return {
    isValid: true,
    message: 'Connection is valid',
  };
};

/**
 * Validates a full flow
 * 
 * @param {Array} nodes - All nodes in the flow
 * @param {Array} edges - All edges in the flow
 * @returns {Object} Validation results with isValid flag, error list, and node/edge specific validation
 */
export const validateFlow = (nodes, edges) => {
  const result = {
    isValid: true,
    hasErrors: false,
    hasWarnings: false,
    errors: [],
    warnings: [],
    nodeValidation: {},
    edgeValidation: {},
  };
  
  // Check if there's at least one source node
  const sourceNodes = nodes.filter(node => node.type === 'sourceNode');
  if (sourceNodes.length === 0) {
    result.isValid = false;
    result.hasErrors = true;
    result.errors.push('Flow must have at least one source node');
  }
  
  // Check if there's at least one destination node
  const destinationNodes = nodes.filter(node => node.type === 'destinationNode');
  if (destinationNodes.length === 0) {
    result.isValid = false;
    result.hasErrors = true;
    result.errors.push('Flow must have at least one destination node');
  }
  
  // Check if each source node is connected
  sourceNodes.forEach(node => {
    const hasOutgoingConnections = edges.some(edge => edge.source === node.id);
    if (!hasOutgoingConnections) {
      result.hasWarnings = true;
      result.warnings.push(`Source node ${node.data?.label || node.id} is not connected to any destination`);
      result.nodeValidation[node.id] = {
        isValid: true,
        hasWarning: true,
        message: 'Source node not connected',
      };
    }
  });
  
  // Check if each destination node is connected
  destinationNodes.forEach(node => {
    const hasIncomingConnections = edges.some(edge => edge.target === node.id);
    if (!hasIncomingConnections) {
      result.hasWarnings = true;
      result.warnings.push(`Destination node ${node.data?.label || node.id} has no incoming connections`);
      result.nodeValidation[node.id] = {
        isValid: true,
        hasWarning: true,
        message: 'Destination node not connected',
      };
    }
  });
  
  // Validate all connections
  edges.forEach(edge => {
    const edgeValidation = validateConnection(edge, nodes, edges);
    result.edgeValidation[edge.id] = edgeValidation;
    
    if (!edgeValidation.isValid) {
      if (edgeValidation.hasError) {
        result.isValid = false;
        result.hasErrors = true;
        result.errors.push(`Invalid connection: ${edgeValidation.message}`);
      } else if (edgeValidation.hasWarning) {
        result.hasWarnings = true;
        result.warnings.push(`Warning for connection: ${edgeValidation.message}`);
      }
    }
  });
  
  // Detect unreachable nodes
  const reachableNodes = new Set();
  
  // Start with source nodes
  sourceNodes.forEach(node => {
    reachableNodes.add(node.id);
  });
  
  // Follow the connections
  let newNodesAdded = true;
  while (newNodesAdded) {
    newNodesAdded = false;
    edges.forEach(edge => {
      if (reachableNodes.has(edge.source) && !reachableNodes.has(edge.target)) {
        reachableNodes.add(edge.target);
        newNodesAdded = true;
      }
    });
  }
  
  // Check for unreachable nodes
  nodes.forEach(node => {
    if (!reachableNodes.has(node.id) && node.type !== 'sourceNode') {
      result.hasWarnings = true;
      result.warnings.push(`Node ${node.data?.label || node.id} is unreachable from any source`);
      result.nodeValidation[node.id] = {
        isValid: true,
        hasWarning: true,
        message: 'Node is unreachable',
      };
    }
  });
  
  return result;
};

/**
 * Deep validation for a flow before execution
 * 
 * @param {Array} nodes - All nodes in the flow
 * @param {Array} edges - All edges in the flow
 * @returns {Promise<Object>} Validation results with detailed checks
 */
export const validateFlowForExecution = async (nodes, edges) => {
  // Start with basic validation
  const baseValidation = validateFlow(nodes, edges);
  
  // If the basic validation failed with errors, no need to continue
  if (!baseValidation.isValid) {
    return baseValidation;
  }
  
  // Perform deep validation for each node
  const result = {
    ...baseValidation,
    nodeConfig: {},
  };
  
  // Check node configuration completeness
  await Promise.all(nodes.map(async (node) => {
    // Skip if node has no validate function
    if (!node.data?.validate) {
      return;
    }
    
    try {
      const nodeValidation = await node.data.validate();
      result.nodeConfig[node.id] = nodeValidation;
      
      if (!nodeValidation.isValid) {
        if (nodeValidation.hasError) {
          result.isValid = false;
          result.hasErrors = true;
          result.errors.push(`Node ${node.data?.label || node.id}: ${nodeValidation.message}`);
        } else if (nodeValidation.hasWarning) {
          result.hasWarnings = true;
          result.warnings.push(`Node ${node.data?.label || node.id}: ${nodeValidation.message}`);
        }
      }
    } catch (error) {
      result.isValid = false;
      result.hasErrors = true;
      result.errors.push(`Error validating node ${node.data?.label || node.id}: ${error.message}`);
    }
  }));
  
  return result;
};

export default {
  validateNodeTypeConnection,
  validateHandleConnection,
  validateConnectionCount,
  detectCycles,
  validateConnection,
  validateFlow,
  validateFlowForExecution,
};