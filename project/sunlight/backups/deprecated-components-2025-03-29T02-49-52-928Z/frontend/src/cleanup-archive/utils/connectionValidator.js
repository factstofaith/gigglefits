/**
 * Connection Validator Utility
 * 
 * Provides utilities for validating connections between nodes in the integration flow.
 * Supports validation of connection types, connection counts, and complex rules.
 */

import { CONNECTION_TYPES } from '../components/integration/nodes/BaseNode';

/**
 * Validates a connection between two nodes based on their connection types
 * 
 * @param {Object} params - Connection parameters
 * @param {Object} params.source - Source node handle information
 * @param {Object} params.target - Target node handle information
 * @param {Object} params.sourceNode - Source node data
 * @param {Object} params.targetNode - Target node data
 * @returns {Object} Validation result with isValid and message
 */
export const validateConnection = (params) => {
  // Added display name
  validateConnection.displayName = 'validateConnection';

  // Added display name
  validateConnection.displayName = 'validateConnection';

  // Added display name
  validateConnection.displayName = 'validateConnection';

  // Added display name
  validateConnection.displayName = 'validateConnection';

  // Added display name
  validateConnection.displayName = 'validateConnection';


  const { source, target, sourceNode, targetNode } = params;
  
  // Default to valid if no specific validation rules apply
  let isValid = true;
  let message = '';
  
  // Extract connection types from the connection params
  const sourceConnType = getConnectionType(source, sourceNode, 'source');
  const targetConnType = getConnectionType(target, targetNode, 'target');
  
  // Basic validation: connection types must match
  if (sourceConnType && targetConnType && sourceConnType.id !== targetConnType.id) {
    isValid = false;
    message = `Connection type mismatch: ${sourceConnType.name} cannot connect to ${targetConnType.name}`;
    return { isValid, message };
  }
  
  // Validate node-specific rules
  const sourceTypeRules = validateNodeTypeRules('source', sourceNode, source);
  const targetTypeRules = validateNodeTypeRules('target', targetNode, target);
  
  // If either validation fails, return the error
  if (!sourceTypeRules.isValid) {
    return sourceTypeRules;
  }
  
  if (!targetTypeRules.isValid) {
    return targetTypeRules;
  }
  
  // Validate connection count limits
  const sourceCountRules = validateConnectionCount('source', sourceNode, source);
  const targetCountRules = validateConnectionCount('target', targetNode, target);
  
  if (!sourceCountRules.isValid) {
    return sourceCountRules;
  }
  
  if (!targetCountRules.isValid) {
    return targetCountRules;
  }
  
  // If we reach here, connection is valid
  return { isValid: true, message: '' };
};

/**
 * Gets the connection type from the handle and node data
 * 
 * @param {string} handleId - The handle ID
 * @param {Object} nodeData - Node data
 * @param {string} handleType - 'source' or 'target'
 * @returns {Object|null} Connection type object or null
 */
const getConnectionType = (handleId, nodeData, handleType) => {
  // Added display name
  getConnectionType.displayName = 'getConnectionType';

  // Added display name
  getConnectionType.displayName = 'getConnectionType';

  // Added display name
  getConnectionType.displayName = 'getConnectionType';

  // Added display name
  getConnectionType.displayName = 'getConnectionType';

  // Added display name
  getConnectionType.displayName = 'getConnectionType';


  if (!nodeData || !nodeData.data) return null;
  
  const connectionsKey = handleType === 'source' ? 'outputConnections' : 'inputConnections';
  const connections = nodeData.data[connectionsKey];
  
  // If node uses the new connection system
  if (Array.isArray(connections)) {
    const connection = connections.find(conn => conn.id === handleId);
    
    if (connection) {
      // Return connection type object or default to DATA type
      return connection.connectionType || CONNECTION_TYPES.DATA;
    }
  }
  
  // Default to DATA type for legacy nodes
  return CONNECTION_TYPES.DATA;
};

/**
 * Validates node-specific connection rules based on node type
 * 
 * @param {string} side - 'source' or 'target'
 * @param {Object} nodeData - Node data
 * @param {string} handleId - The handle ID
 * @returns {Object} Validation result
 */
const validateNodeTypeRules = (side, nodeData, handleId) => {
  // Added display name
  validateNodeTypeRules.displayName = 'validateNodeTypeRules';

  // Added display name
  validateNodeTypeRules.displayName = 'validateNodeTypeRules';

  // Added display name
  validateNodeTypeRules.displayName = 'validateNodeTypeRules';

  // Added display name
  validateNodeTypeRules.displayName = 'validateNodeTypeRules';

  // Added display name
  validateNodeTypeRules.displayName = 'validateNodeTypeRules';


  if (!nodeData || !nodeData.data) {
    return { isValid: false, message: 'Invalid node data' };
  }
  
  const nodeType = nodeData.type;
  
  // Router node specific validation
  if (nodeType === 'router') {
    const routerType = nodeData.data.routerType;
    
    // Merge router can only have output from its output-main handle
    if (routerType === 'merge' && side === 'source' && handleId !== 'output-main') {
      return { 
        isValid: false, 
        message: 'Merge router can only connect from its main output' 
      };
    }
    
    // Fork router output validation
    if (routerType === 'fork' && side === 'target') {
      // Fork router cannot have inputs to its output handles
      if (handleId.startsWith('output')) {
        return { 
          isValid: false, 
          message: 'Cannot connect to an output handle of a fork router' 
        };
      }
    }
  }
  
  // Transform node specific validation
  if (nodeType === 'transform') {
    const transformType = nodeData.data.transformType;
    
    // Join transform requires specific inputs
    if (transformType === 'join' && side === 'target') {
      // Ensure join transforms have inputs to proper handles
      if (!handleId.startsWith('input')) {
        return { 
          isValid: false, 
          message: 'Join transforms can only receive connections at input handles' 
        };
      }
    }
  }
  
  // Dataset node can only connect to application nodes or transform nodes
  if (nodeType === 'dataset' && side === 'source') {
    const targetType = nodeData.type;
    if (targetType !== 'application' && targetType !== 'transform') {
      return { 
        isValid: false, 
        message: 'Datasets can only connect to applications or transforms' 
      };
    }
  }
  
  // All other node types are valid
  return { isValid: true, message: '' };
};

/**
 * Validates connection count limits for a handle
 * 
 * @param {string} side - 'source' or 'target'
 * @param {Object} nodeData - Node data
 * @param {string} handleId - The handle ID
 * @returns {Object} Validation result
 */
const validateConnectionCount = (side, nodeData, handleId) => {
  // Added display name
  validateConnectionCount.displayName = 'validateConnectionCount';

  // Added display name
  validateConnectionCount.displayName = 'validateConnectionCount';

  // Added display name
  validateConnectionCount.displayName = 'validateConnectionCount';

  // Added display name
  validateConnectionCount.displayName = 'validateConnectionCount';

  // Added display name
  validateConnectionCount.displayName = 'validateConnectionCount';


  if (!nodeData || !nodeData.data) {
    return { isValid: false, message: 'Invalid node data' };
  }
  
  // Get the current connections
  const connections = nodeData.data.connections || { inputs: {}, outputs: {} };
  const connectionType = side === 'source' ? 'outputs' : 'inputs';
  const handleConnections = connections[connectionType][handleId] || [];
  
  // Check node-specific connection count limits
  const nodeType = nodeData.type;
  
  // Default limits
  let maxConnections = side === 'source' ? Infinity : 1; // By default, inputs can have only 1 connection
  
  // Specific node type limits
  if (nodeType === 'router') {
    const routerType = nodeData.data.routerType;
    
    if (routerType === 'condition') {
      // Condition router output limits
      if (side === 'source') {
        if (handleId === 'output-true' || handleId === 'output-false') {
          maxConnections = Infinity; // Can connect to multiple nodes
        }
      }
      // Condition router input limits
      else if (side === 'target') {
        if (handleId === 'input-main') {
          maxConnections = 1; // Can only have one input
        }
      }
    }
    else if (routerType === 'merge') {
      // Merge router can have multiple inputs
      if (side === 'target') {
        maxConnections = Infinity;
      }
    }
  }
  else if (nodeType === 'transform') {
    const transformType = nodeData.data.transformType;
    
    if (transformType === 'join') {
      // Join transforms can have specific inputs
      if (side === 'target') {
        // Primary and secondary inputs can only have one connection each
        if (handleId === 'input-primary' || handleId === 'input-secondary') {
          maxConnections = 1;
        }
      }
    }
  }
  
  // Check if adding another connection would exceed the limit
  if (handleConnections.length >= maxConnections) {
    return { 
      isValid: false, 
      message: `This ${side} handle already has the maximum number of connections (${maxConnections})` 
    };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validates the entire flow by checking all connections
 * 
 * @param {Array} nodes - The flow nodes
 * @param {Array} edges - The flow edges
 * @returns {Array} Array of validation errors
 */
export const validateFlow = (nodes, edges) => {
  // Added display name
  validateFlow.displayName = 'validateFlow';

  // Added display name
  validateFlow.displayName = 'validateFlow';

  // Added display name
  validateFlow.displayName = 'validateFlow';

  // Added display name
  validateFlow.displayName = 'validateFlow';

  // Added display name
  validateFlow.displayName = 'validateFlow';


  const validationErrors = [];
  
  // Create a map of nodes by ID for quick lookup
  const nodeMap = nodes.reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});
  
  // Validate each edge
  edges.forEach(edge => {
    const sourceNode = nodeMap[edge.source];
    const targetNode = nodeMap[edge.target];
    
    if (!sourceNode || !targetNode) {
      validationErrors.push({
        id: `edge-${edge.id}-invalid-nodes`,
        severity: 'error',
        message: 'Connection references non-existent nodes',
        details: `Edge ${edge.id} has invalid source or target node references.`,
        edgeId: edge.id
      });
      return;
    }
    
    // Validate the connection
    const result = validateConnection({
      source: edge.sourceHandle,
      target: edge.targetHandle,
      sourceNode,
      targetNode
    });
    
    if (!result.isValid) {
      validationErrors.push({
        id: `edge-${edge.id}-validation`,
        severity: 'error',
        message: 'Invalid connection',
        details: result.message,
        edgeId: edge.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target
      });
    }
  });
  
  // Validate node-specific requirements
  nodes.forEach(node => {
    const nodeErrors = validateNodeRequirements(node, edges, nodeMap);
    validationErrors.push(...nodeErrors);
  });
  
  return validationErrors;
};

/**
 * Validates node-specific requirements
 * 
 * @param {Object} node - The node to validate
 * @param {Array} edges - All edges in the flow
 * @param {Object} nodeMap - Map of all nodes by ID
 * @returns {Array} Array of validation errors
 */
const validateNodeRequirements = (node, edges, nodeMap) => {
  // Added display name
  validateNodeRequirements.displayName = 'validateNodeRequirements';

  // Added display name
  validateNodeRequirements.displayName = 'validateNodeRequirements';

  // Added display name
  validateNodeRequirements.displayName = 'validateNodeRequirements';

  // Added display name
  validateNodeRequirements.displayName = 'validateNodeRequirements';

  // Added display name
  validateNodeRequirements.displayName = 'validateNodeRequirements';


  const errors = [];
  const nodeType = node.type;
  
  // For each node type, check specific requirements
  if (nodeType === 'source') {
    // Source nodes must have at least one output connection
    const hasOutputs = edges.some(edge => edge.source === node.id);
    if (!hasOutputs) {
      errors.push({
        id: `node-${node.id}-no-outputs`,
        severity: 'error',
        message: 'Source node has no output connections',
        details: 'Source nodes must be connected to at least one downstream node.',
        nodeId: node.id,
        nodeType: 'source'
      });
    }
  }
  else if (nodeType === 'destination') {
    // Destination nodes must have at least one input connection
    const hasInputs = edges.some(edge => edge.target === node.id);
    if (!hasInputs) {
      errors.push({
        id: `node-${node.id}-no-inputs`,
        severity: 'error',
        message: 'Destination node has no input connections',
        details: 'Destination nodes must be connected to at least one upstream node.',
        nodeId: node.id,
        nodeType: 'destination'
      });
    }
  }
  else if (nodeType === 'transform') {
    // Transform nodes must have at least one input and one output connection
    const hasInputs = edges.some(edge => edge.target === node.id);
    const hasOutputs = edges.some(edge => edge.source === node.id);
    
    if (!hasInputs) {
      errors.push({
        id: `node-${node.id}-no-inputs`,
        severity: 'error',
        message: 'Transform node has no input connections',
        details: 'Transform nodes must be connected to at least one upstream node.',
        nodeId: node.id,
        nodeType: 'transform'
      });
    }
    
    if (!hasOutputs) {
      errors.push({
        id: `node-${node.id}-no-outputs`,
        severity: 'warning', // Warning because it might be work in progress
        message: 'Transform node has no output connections',
        details: 'Transform nodes should be connected to at least one downstream node.',
        nodeId: node.id,
        nodeType: 'transform'
      });
    }
    
    // Join transform must have both primary and secondary inputs connected
    if (node.data.transformType === 'join') {
      // Check specific handles
      const hasPrimary = edges.some(
        edge => edge.target === node.id && edge.targetHandle === 'input-primary'
      );
      const hasSecondary = edges.some(
        edge => edge.target === node.id && edge.targetHandle === 'input-secondary'
      );
      
      if (!hasPrimary) {
        errors.push({
          id: `node-${node.id}-no-primary-input`,
          severity: 'error',
          message: 'Join transform missing primary input',
          details: 'Join transforms require both primary and secondary inputs to be connected.',
          nodeId: node.id,
          nodeType: 'transform'
        });
      }
      
      if (!hasSecondary) {
        errors.push({
          id: `node-${node.id}-no-secondary-input`,
          severity: 'error',
          message: 'Join transform missing secondary input',
          details: 'Join transforms require both primary and secondary inputs to be connected.',
          nodeId: node.id,
          nodeType: 'transform'
        });
      }
    }
  }
  else if (nodeType === 'router') {
    // All router types should have at least one input
    const hasInputs = edges.some(edge => edge.target === node.id);
    if (!hasInputs) {
      errors.push({
        id: `node-${node.id}-no-inputs`,
        severity: 'error',
        message: 'Router node has no input connections',
        details: 'Router nodes must be connected to at least one upstream node.',
        nodeId: node.id,
        nodeType: 'router'
      });
    }
    
    // Router-type specific validations
    const routerType = node.data.routerType;
    
    if (routerType === 'condition') {
      // Both true and false outputs should be connected
      const hasTrueOutput = edges.some(
        edge => edge.source === node.id && edge.sourceHandle === 'output-true'
      );
      const hasFalseOutput = edges.some(
        edge => edge.source === node.id && edge.sourceHandle === 'output-false'
      );
      
      if (!hasTrueOutput) {
        errors.push({
          id: `node-${node.id}-no-true-output`,
          severity: 'warning',
          message: 'Condition router missing true path',
          details: 'Condition routers should have both true and false paths connected.',
          nodeId: node.id,
          nodeType: 'router'
        });
      }
      
      if (!hasFalseOutput) {
        errors.push({
          id: `node-${node.id}-no-false-output`,
          severity: 'warning',
          message: 'Condition router missing false path',
          details: 'Condition routers should have both true and false paths connected.',
          nodeId: node.id,
          nodeType: 'router'
        });
      }
      
      // Condition expression should be defined
      if (!node.data.condition) {
        errors.push({
          id: `node-${node.id}-no-condition`,
          severity: 'error',
          message: 'Condition router has no condition expression',
          details: 'Condition routers must have a condition expression defined.',
          nodeId: node.id,
          nodeType: 'router'
        });
      }
    }
    else if (routerType === 'switch') {
      // Switch field should be defined
      if (!node.data.switchField) {
        errors.push({
          id: `node-${node.id}-no-switch-field`,
          severity: 'error',
          message: 'Switch router has no switch field defined',
          details: 'Switch routers must have a field to switch on defined.',
          nodeId: node.id,
          nodeType: 'router'
        });
      }
      
      // Should have at least one case defined and connected
      if (!node.data.cases || node.data.cases.length === 0) {
        errors.push({
          id: `node-${node.id}-no-cases`,
          severity: 'error',
          message: 'Switch router has no cases defined',
          details: 'Switch routers must have at least one case defined.',
          nodeId: node.id,
          nodeType: 'router'
        });
      } else {
        // Check if any case outputs are connected
        const hasAnyCaseOutput = node.data.cases.some((_, index) => {
          return edges.some(
            edge => edge.source === node.id && edge.sourceHandle === `output-${index}`
          );
        });
        
        if (!hasAnyCaseOutput) {
          errors.push({
            id: `node-${node.id}-no-case-outputs`,
            severity: 'warning',
            message: 'Switch router has no connected case outputs',
            details: 'Switch routers should have at least one case output connected.',
            nodeId: node.id,
            nodeType: 'router'
          });
        }
      }
    }
    else if (routerType === 'merge') {
      // Merge router should have at least one output connection
      const hasOutputs = edges.some(edge => edge.source === node.id);
      if (!hasOutputs) {
        errors.push({
          id: `node-${node.id}-no-outputs`,
          severity: 'error',
          message: 'Merge router has no output connections',
          details: 'Merge routers must have at least one output connection.',
          nodeId: node.id,
          nodeType: 'router'
        });
      }
      
      // Merge routers should have at least two input connections
      const inputCount = edges.filter(edge => edge.target === node.id).length;
      if (inputCount < 2) {
        errors.push({
          id: `node-${node.id}-insufficient-inputs`,
          severity: 'warning',
          message: 'Merge router has less than two inputs',
          details: 'Merge routers should have at least two input connections to merge data from.',
          nodeId: node.id,
          nodeType: 'router'
        });
      }
    }
  }
  
  return errors;
};

export default {
  validateConnection,
  validateFlow
};