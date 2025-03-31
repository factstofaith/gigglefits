/**
 * Integration Generators
 * 
 * This module provides functions for generating test data for integration flows,
 * including nodes, edges, and integration configurations. It extends the 
 * existing testDataGenerator functionality with more standardized patterns.
 */

import { generateIntegration } from './entityGenerators';

/**
 * Node types available in the system
 */
export const NODE_TYPES = {
  SOURCE: 'source',
  TRANSFORM: 'transform',
  DESTINATION: 'destination',
  ROUTER: 'router',
  DATASET: 'dataset',
  TRIGGER: 'trigger',
  ACTION: 'action'
};

/**
 * Flow complexity levels
 */
export const COMPLEXITY = {
  SIMPLE: 'simple',
  MEDIUM: 'medium',
  COMPLEX: 'complex'
};

/**
 * Generate a flow node
 * @param {Object} options Node options
 * @returns {Object} Node object
 */
export const generateNode = (options = {}) => {
  // Added display name
  generateNode.displayName = 'generateNode';

  // Added display name
  generateNode.displayName = 'generateNode';

  // Added display name
  generateNode.displayName = 'generateNode';

  // Added display name
  generateNode.displayName = 'generateNode';

  const {
    id = `node-${Math.random().toString(36).substr(2, 5)}`,
    type = NODE_TYPES.TRANSFORM,
    position = { x: 0, y: 0 },
    withValidationErrors = false,
    withCustomData = true,
    label = null
  } = options;
  
  const nodeTypeWithSuffix = Object.values(NODE_TYPES).includes(type)
    ? `${type}Node`
    : type;
  
  const hasValidationError = withValidationErrors && Math.random() > 0.7;
  
  return {
    id,
    type: nodeTypeWithSuffix,
    position,
    data: {
      label: label || `${type.charAt(0).toUpperCase() + type.slice(1)} ${id.split('-')[1] || ''}`,
      nodeType: type,
      tooltip: `${type} node`,
      configData: getConfigDataForType(type, withCustomData),
      validation: {
        isValid: !hasValidationError,
        messages: hasValidationError ? ['Validation error for testing'] : []
      },
      status: options.status || 'idle'
    }
  };
};

/**
 * Generate an edge between nodes
 * @param {Object} options Edge options
 * @returns {Object} Edge object
 */
export const generateEdge = (options = {}) => {
  // Added display name
  generateEdge.displayName = 'generateEdge';

  // Added display name
  generateEdge.displayName = 'generateEdge';

  // Added display name
  generateEdge.displayName = 'generateEdge';

  // Added display name
  generateEdge.displayName = 'generateEdge';

  const {
    id = `edge-${Math.random().toString(36).substr(2, 5)}`,
    source,
    target,
    withLabels = true,
    animated = true,
    withCustomData = true,
    label = null,
    sourceHandle = null,
    targetHandle = null
  } = options;
  
  if (!source || !target) {
    throw new Error('Edge must have source and target node IDs');
  }
  
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    animated,
    data: {
      label: label || (withLabels ? `Connection ${source} to ${target}` : ''),
      ...(withCustomData ? {
        configData: {
          type: options.type || 'data',
          description: options.description || 'Test connection',
          transformations: options.transformations || []
        }
      } : {})
    }
  };
};

/**
 * Get configuration data for a node type
 * @param {string} type Node type
 * @param {boolean} withCustomData Whether to include custom data
 * @param {Object} customConfig Custom configuration to merge
 * @returns {Object} Configuration data
 */
export const getConfigDataForType = (type, withCustomData = false, customConfig = {}) => {
  // Added display name
  getConfigDataForType.displayName = 'getConfigDataForType';

  // Added display name
  getConfigDataForType.displayName = 'getConfigDataForType';

  // Added display name
  getConfigDataForType.displayName = 'getConfigDataForType';

  // Added display name
  getConfigDataForType.displayName = 'getConfigDataForType';

  if (!withCustomData) {
    return customConfig;
  }
  
  let baseConfig = {};
  
  switch (type) {
    case NODE_TYPES.SOURCE:
      baseConfig = {
        connectionType: customConfig.connectionType || Math.random() > 0.5 ? 'api' : 'file',
        sourceName: customConfig.sourceName || `Source ${Math.floor(Math.random() * 100)}`,
        schema: customConfig.schema || {
          fields: [
            { name: 'id', type: 'string', required: true },
            { name: 'name', type: 'string', required: true },
            { name: 'active', type: 'boolean', required: false }
          ]
        }
      };
      break;
      
    case NODE_TYPES.TRANSFORM:
      baseConfig = {
        transformType: customConfig.transformType || ['map', 'filter', 'join', 'aggregate'][Math.floor(Math.random() * 4)],
        mappings: customConfig.mappings || [
          { source: 'id', target: 'userId' },
          { source: 'name', target: 'fullName' }
        ],
        condition: customConfig.condition || 'active === true'
      };
      break;
      
    case NODE_TYPES.DESTINATION:
      baseConfig = {
        connectionType: customConfig.connectionType || Math.random() > 0.5 ? 'api' : 'database',
        destinationName: customConfig.destinationName || `Destination ${Math.floor(Math.random() * 100)}`,
        writeMode: customConfig.writeMode || Math.random() > 0.5 ? 'insert' : 'update'
      };
      break;
      
    case NODE_TYPES.ROUTER:
      baseConfig = {
        routerType: customConfig.routerType || Math.random() > 0.5 ? 'condition' : 'fork',
        conditions: customConfig.conditions || ['true', 'false'],
        defaultPath: customConfig.defaultPath !== undefined ? customConfig.defaultPath : 1
      };
      break;
      
    case NODE_TYPES.DATASET:
      baseConfig = {
        datasetId: customConfig.datasetId || `dataset-${Math.floor(Math.random() * 100)}`,
        datasetName: customConfig.datasetName || `Test Dataset ${Math.floor(Math.random() * 100)}`,
        fields: customConfig.fields || [
          { name: 'field1', type: 'string' },
          { name: 'field2', type: 'number' }
        ]
      };
      break;
      
    case NODE_TYPES.TRIGGER:
      baseConfig = {
        triggerType: customConfig.triggerType || 'schedule',
        schedule: customConfig.schedule || '0 0 * * *',
        enabled: customConfig.enabled !== undefined ? customConfig.enabled : true
      };
      break;
      
    case NODE_TYPES.ACTION:
      baseConfig = {
        actionType: customConfig.actionType || 'notification',
        channels: customConfig.channels || ['email', 'slack'],
        message: customConfig.message || 'Test notification'
      };
      break;
      
    default:
      baseConfig = {};
  }
  
  return { ...baseConfig, ...customConfig };
};

/**
 * Generate a simple linear flow with basic components
 * @param {Object} options Flow options
 * @returns {Object} Object with nodes and edges
 */
export const generateSimpleFlow = (options = {}) => {
  // Added display name
  generateSimpleFlow.displayName = 'generateSimpleFlow';

  // Added display name
  generateSimpleFlow.displayName = 'generateSimpleFlow';

  // Added display name
  generateSimpleFlow.displayName = 'generateSimpleFlow';

  // Added display name
  generateSimpleFlow.displayName = 'generateSimpleFlow';

  const {
    nodeCount = 3,
    withValidationErrors = false,
    withCustomData = true
  } = options;
  
  if (nodeCount < 2) {
    throw new Error('Flow must have at least 2 nodes (source and destination)');
  }
  
  const nodes = [];
  const edges = [];
  
  // Create source node
  nodes.push(generateNode({
    id: 'node-1',
    type: NODE_TYPES.SOURCE,
    position: { x: 50, y: 100 },
    withValidationErrors,
    withCustomData
  }));
  
  // Create middle transform nodes if needed
  for (let i = 2; i < nodeCount; i++) {
    nodes.push(generateNode({
      id: `node-${i}`,
      type: NODE_TYPES.TRANSFORM,
      position: { x: 50 + (i - 1) * 200, y: 100 },
      withValidationErrors,
      withCustomData
    }));
  }
  
  // Create destination node
  nodes.push(generateNode({
    id: `node-${nodeCount}`,
    type: NODE_TYPES.DESTINATION,
    position: { x: 50 + (nodeCount - 1) * 200, y: 100 },
    withValidationErrors,
    withCustomData
  }));
  
  // Create edges connecting all nodes in sequence
  for (let i = 1; i < nodeCount; i++) {
    edges.push(generateEdge({
      id: `edge-${i}-${i+1}`,
      source: `node-${i}`,
      target: `node-${i+1}`,
      withLabels: true,
      animated: true,
      withCustomData
    }));
  }
  
  return { nodes, edges };
};

/**
 * Generate a branching flow with a router node
 * @param {Object} options Flow options
 * @returns {Object} Object with nodes and edges
 */
export const generateBranchingFlow = (options = {}) => {
  // Added display name
  generateBranchingFlow.displayName = 'generateBranchingFlow';

  // Added display name
  generateBranchingFlow.displayName = 'generateBranchingFlow';

  // Added display name
  generateBranchingFlow.displayName = 'generateBranchingFlow';

  // Added display name
  generateBranchingFlow.displayName = 'generateBranchingFlow';

  const {
    withValidationErrors = false,
    withCustomData = true,
    branchCount = 2
  } = options;
  
  const nodes = [];
  const edges = [];
  
  // Create source node
  nodes.push(generateNode({
    id: 'node-source',
    type: NODE_TYPES.SOURCE,
    position: { x: 50, y: 100 },
    withValidationErrors,
    withCustomData
  }));
  
  // Create transform node
  nodes.push(generateNode({
    id: 'node-transform',
    type: NODE_TYPES.TRANSFORM,
    position: { x: 250, y: 100 },
    withValidationErrors,
    withCustomData
  }));
  
  // Create router node
  nodes.push(generateNode({
    id: 'node-router',
    type: NODE_TYPES.ROUTER,
    position: { x: 450, y: 100 },
    withValidationErrors,
    withCustomData
  }));
  
  // Create branch destination nodes
  for (let i = 0; i < branchCount; i++) {
    nodes.push(generateNode({
      id: `node-dest-${i+1}`,
      type: NODE_TYPES.DESTINATION,
      position: { x: 650, y: 50 + i * 150 },
      withValidationErrors,
      withCustomData
    }));
  }
  
  // Create edges
  edges.push(
    generateEdge({
      id: 'edge-source-transform',
      source: 'node-source',
      target: 'node-transform',
      withCustomData
    }),
    generateEdge({
      id: 'edge-transform-router',
      source: 'node-transform',
      target: 'node-router',
      withCustomData
    })
  );
  
  // Create router to destination edges
  for (let i = 0; i < branchCount; i++) {
    edges.push(generateEdge({
      id: `edge-router-dest-${i+1}`,
      source: 'node-router',
      target: `node-dest-${i+1}`,
      label: `Path ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
      withCustomData
    }));
  }
  
  return { nodes, edges };
};

/**
 * Generate a complex flow with multiple node types and connections
 * @param {Object} options Flow options
 * @returns {Object} Object with nodes and edges
 */
export const generateComplexFlow = (options = {}) => {
  // Added display name
  generateComplexFlow.displayName = 'generateComplexFlow';

  // Added display name
  generateComplexFlow.displayName = 'generateComplexFlow';

  // Added display name
  generateComplexFlow.displayName = 'generateComplexFlow';

  // Added display name
  generateComplexFlow.displayName = 'generateComplexFlow';

  const {
    withValidationErrors = false,
    withCustomData = true
  } = options;
  
  // Create a flow with all node types and complex connections
  const nodes = [
    generateNode({
      id: 'node-trigger',
      type: NODE_TYPES.TRIGGER,
      position: { x: 50, y: 200 },
      withValidationErrors,
      withCustomData
    }),
    generateNode({
      id: 'node-source-1',
      type: NODE_TYPES.SOURCE,
      position: { x: 250, y: 100 },
      withValidationErrors,
      withCustomData
    }),
    generateNode({
      id: 'node-source-2',
      type: NODE_TYPES.SOURCE,
      position: { x: 250, y: 300 },
      withValidationErrors,
      withCustomData
    }),
    generateNode({
      id: 'node-transform-1',
      type: NODE_TYPES.TRANSFORM,
      position: { x: 450, y: 100 },
      withValidationErrors,
      withCustomData
    }),
    generateNode({
      id: 'node-transform-2',
      type: NODE_TYPES.TRANSFORM,
      position: { x: 450, y: 300 },
      withValidationErrors,
      withCustomData
    }),
    generateNode({
      id: 'node-router',
      type: NODE_TYPES.ROUTER,
      position: { x: 650, y: 200 },
      withValidationErrors,
      withCustomData
    }),
    generateNode({
      id: 'node-dataset',
      type: NODE_TYPES.DATASET,
      position: { x: 850, y: 50 },
      withValidationErrors,
      withCustomData
    }),
    generateNode({
      id: 'node-action',
      type: NODE_TYPES.ACTION,
      position: { x: 850, y: 200 },
      withValidationErrors,
      withCustomData
    }),
    generateNode({
      id: 'node-destination',
      type: NODE_TYPES.DESTINATION,
      position: { x: 850, y: 350 },
      withValidationErrors,
      withCustomData
    })
  ];
  
  const edges = [
    generateEdge({
      id: 'edge-trigger-source1',
      source: 'node-trigger',
      target: 'node-source-1',
      withCustomData
    }),
    generateEdge({
      id: 'edge-trigger-source2',
      source: 'node-trigger',
      target: 'node-source-2',
      withCustomData
    }),
    generateEdge({
      id: 'edge-source1-transform1',
      source: 'node-source-1',
      target: 'node-transform-1',
      withCustomData
    }),
    generateEdge({
      id: 'edge-source2-transform2',
      source: 'node-source-2',
      target: 'node-transform-2',
      withCustomData
    }),
    generateEdge({
      id: 'edge-transform1-router',
      source: 'node-transform-1',
      target: 'node-router',
      withCustomData
    }),
    generateEdge({
      id: 'edge-transform2-router',
      source: 'node-transform-2',
      target: 'node-router',
      withCustomData
    }),
    generateEdge({
      id: 'edge-router-dataset',
      source: 'node-router',
      target: 'node-dataset',
      label: 'Route A',
      withCustomData
    }),
    generateEdge({
      id: 'edge-router-action',
      source: 'node-router',
      target: 'node-action',
      label: 'Route B',
      withCustomData
    }),
    generateEdge({
      id: 'edge-router-destination',
      source: 'node-router',
      target: 'node-destination',
      label: 'Route C',
      withCustomData
    })
  ];
  
  return { nodes, edges };
};

/**
 * Generate a complete integration with flow data
 * @param {Object} options Integration options
 * @returns {Object} Integration object with flow data
 */
export const generateIntegrationWithFlow = (options = {}) => {
  // Added display name
  generateIntegrationWithFlow.displayName = 'generateIntegrationWithFlow';

  // Added display name
  generateIntegrationWithFlow.displayName = 'generateIntegrationWithFlow';

  // Added display name
  generateIntegrationWithFlow.displayName = 'generateIntegrationWithFlow';

  // Added display name
  generateIntegrationWithFlow.displayName = 'generateIntegrationWithFlow';

  const {
    flowType = COMPLEXITY.SIMPLE,
    withValidationErrors = false,
    withCustomData = true,
    integrationOverrides = {}
  } = options;
  
  let flow;
  
  // Generate the flow based on type
  switch (flowType) {
    case COMPLEXITY.COMPLEX:
      flow = generateComplexFlow({ withValidationErrors, withCustomData });
      break;
    case COMPLEXITY.MEDIUM:
      flow = generateBranchingFlow({ withValidationErrors, withCustomData });
      break;
    case COMPLEXITY.SIMPLE:
    default:
      flow = generateSimpleFlow({ withValidationErrors, withCustomData });
  }
  
  // Create the integration object
  const integration = generateIntegration({
    ...integrationOverrides
  });
  
  // Return the complete integration with flow
  return {
    ...integration,
    flow: {
      nodes: flow.nodes,
      edges: flow.edges
    }
  };
};

/**
 * Generate a list of integrations with flows
 * @param {number} count Number of integrations to generate
 * @param {Object} options Options for integration generation
 * @returns {Array} Array of integration objects with flows
 */
export const generateIntegrationWithFlowList = (count = 3, options = {}) => {
  // Added display name
  generateIntegrationWithFlowList.displayName = 'generateIntegrationWithFlowList';

  // Added display name
  generateIntegrationWithFlowList.displayName = 'generateIntegrationWithFlowList';

  // Added display name
  generateIntegrationWithFlowList.displayName = 'generateIntegrationWithFlowList';

  // Added display name
  generateIntegrationWithFlowList.displayName = 'generateIntegrationWithFlowList';

  const integrations = [];
  
  for (let i = 0; i < count; i++) {
    // Alternate complexity for variety
    const flowType = i % 3 === 0 
      ? COMPLEXITY.SIMPLE 
      : i % 3 === 1 
        ? COMPLEXITY.MEDIUM 
        : COMPLEXITY.COMPLEX;
        
    integrations.push(generateIntegrationWithFlow({
      flowType,
      integrationOverrides: {
        id: `integration-${i + 1}`,
        name: `Test Integration ${i + 1}`,
        ...options.integrationOverrides
      },
      ...options
    }));
  }
  
  return integrations;
};