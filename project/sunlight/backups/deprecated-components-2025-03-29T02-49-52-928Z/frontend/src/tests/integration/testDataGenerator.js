/**
 * Test Data Generator
 * Utilities for generating test data for integration flows
 */

/**
 * Generate test nodes for a flow
 * @param {Object} options Configuration options for node generation
 * @returns {Array} Array of node objects
 */
export const generateTestNodes = (options = {}) => {
  // Added display name
  generateTestNodes.displayName = 'generateTestNodes';

  // Added display name
  generateTestNodes.displayName = 'generateTestNodes';

  // Added display name
  generateTestNodes.displayName = 'generateTestNodes';

  // Added display name
  generateTestNodes.displayName = 'generateTestNodes';

  // Added display name
  generateTestNodes.displayName = 'generateTestNodes';


  const {
    nodeCount = 5,
    complexity = 'simple', // simple, medium, complex
    includeAllTypes = false,
    withValidationErrors = false,
    withCustomData = false,
    customPosition = null
  } = options;

  const baseTypes = ['source', 'transform', 'destination'];
  const advancedTypes = ['router', 'dataset', 'trigger', 'action'];
  const nodeTypes = includeAllTypes ? [...baseTypes, ...advancedTypes] : baseTypes;
  
  const nodes = [];
  
  // Always include a source node first
  nodes.push(createNode({
    id: 'node-0',
    type: 'source',
    position: { x: 50, y: 200 },
    withValidationErrors,
    withCustomData
  }));
  
  // Create middle nodes
  for (let i = 1; i < nodeCount - 1; i++) {
    // Determine type based on complexity
    let nodeType;
    if (complexity === 'simple') {
      nodeType = 'transform';
    } else if (complexity === 'medium') {
      nodeType = i % 2 === 0 ? 'transform' : 'router';
    } else {
      // Complex flow, use a variety of node types
      nodeType = nodeTypes[i % nodeTypes.length];
    }
    
    // For complex flows, create branches with router nodes
    const position = { 
      x: 50 + (i * 200), 
      y: 200 + (complexity === 'complex' && nodeType === 'router' ? (i % 2) * 150 : 0)
    };
    
    nodes.push(createNode({
      id: `node-${i}`,
      type: nodeType,
      position,
      withValidationErrors,
      withCustomData
    }));
  }
  
  // Always include a destination node last
  nodes.push(createNode({
    id: `node-${nodeCount - 1}`,
    type: 'destination',
    position: { x: 50 + ((nodeCount - 1) * 200), y: 200 },
    withValidationErrors,
    withCustomData
  }));
  
  return nodes;
};

/**
 * Generate test edges for a flow
 * @param {Array} nodes The nodes to connect
 * @param {Object} options Configuration options for edge generation
 * @returns {Array} Array of edge objects
 */
export const generateTestEdges = (nodes, options = {}) => {
  // Added display name
  generateTestEdges.displayName = 'generateTestEdges';

  // Added display name
  generateTestEdges.displayName = 'generateTestEdges';

  // Added display name
  generateTestEdges.displayName = 'generateTestEdges';

  // Added display name
  generateTestEdges.displayName = 'generateTestEdges';

  // Added display name
  generateTestEdges.displayName = 'generateTestEdges';


  const {
    complexity = 'simple', // simple, medium, complex
    withLabels = true,
    animated = true,
    withCustomData = false
  } = options;
  
  const edges = [];
  
  if (complexity === 'simple') {
    // Simple linear flow
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push(createEdge({
        id: `edge-${i}-${i+1}`,
        source: nodes[i].id,
        target: nodes[i+1].id,
        withLabels,
        animated,
        withCustomData
      }));
    }
  } else if (complexity === 'medium') {
    // Medium complexity with some splits/joins
    for (let i = 0; i < nodes.length - 1; i++) {
      // Check if this is a router node with multiple outputs
      if (nodes[i].type.includes('router')) {
        // Create two outputs if possible
        if (i + 2 < nodes.length) {
          edges.push(createEdge({
            id: `edge-${i}-${i+1}`,
            source: nodes[i].id,
            target: nodes[i+1].id,
            withLabels,
            animated,
            withCustomData,
            label: 'Path A'
          }));
          
          edges.push(createEdge({
            id: `edge-${i}-${i+2}`,
            source: nodes[i].id,
            target: nodes[i+2].id,
            withLabels,
            animated,
            withCustomData,
            label: 'Path B'
          }));
          
          // Skip the next node since we already connected it
          i++;
        } else {
          // Just add a regular connection if we're near the end
          edges.push(createEdge({
            id: `edge-${i}-${i+1}`,
            source: nodes[i].id,
            target: nodes[i+1].id,
            withLabels,
            animated,
            withCustomData
          }));
        }
      } else {
        // Regular connection
        edges.push(createEdge({
          id: `edge-${i}-${i+1}`,
          source: nodes[i].id,
          target: nodes[i+1].id,
          withLabels,
          animated,
          withCustomData
        }));
      }
    }
  } else {
    // Complex flow with branches and merges
    const connections = [];
    
    // First pass - create main flow
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push([nodes[i].id, nodes[i+1].id]);
    }
    
    // Second pass - create branches
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].type.includes('router')) {
        // Find nodes that could be branch targets
        const possibleTargets = nodes.filter((n, idx) => 
          idx > i + 1 && 
          !n.type.includes('source') &&
          Math.abs(n.position.y - nodes[i].position.y) < 300
        );
        
        if (possibleTargets.length > 0) {
          // Create up to 2 branch connections
          for (let j = 0; j < Math.min(2, possibleTargets.length); j++) {
            connections.push([nodes[i].id, possibleTargets[j].id]);
          }
        }
      }
    }
    
    // Third pass - create merges
    for (let i = 2; i < nodes.length; i++) {
      if (nodes[i].type.includes('transform') && Math.random() > 0.7) {
        // Find nodes that could be merge sources
        const possibleSources = nodes.filter((n, idx) => 
          idx < i - 1 && 
          !n.type.includes('destination') &&
          !connections.some(conn => conn[0] === n.id && conn[1] === nodes[i].id)
        );
        
        if (possibleSources.length > 0) {
          // Create a merge connection
          const source = possibleSources[Math.floor(Math.random() * possibleSources.length)];
          connections.push([source.id, nodes[i].id]);
        }
      }
    }
    
    // Create edges from connections
    connections.forEach(([source, target], idx) => {
      edges.push(createEdge({
        id: `edge-${idx}`,
        source,
        target,
        withLabels,
        animated,
        withCustomData
      }));
    });
  }
  
  return edges;
};

/**
 * Create a test node
 * @param {Object} options Node options
 * @returns {Object} Node object
 */
function createNode(options) {
  // Added display name
  createNode.displayName = 'createNode';

  const {
    id,
    type,
    position,
    withValidationErrors = false,
    withCustomData = false
  } = options;
  
  const nodeTypeWithSuffix = type === 'source' || 
                            type === 'transform' || 
                            type === 'destination' ||
                            type === 'router' ||
                            type === 'dataset' ||
                            type === 'trigger' ||
                            type === 'action'
                              ? `${type}Node`
                              : type;
  
  const hasValidationError = withValidationErrors && Math.random() > 0.7;
  
  return {
    id,
    type: nodeTypeWithSuffix,
    position,
    data: {
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${id.split('-')[1]}`,
      nodeType: type,
      tooltip: `${type} node`,
      configData: getConfigDataForType(type, withCustomData),
      validation: {
        isValid: !hasValidationError,
        messages: hasValidationError ? ['Validation error for testing'] : []
      },
      status: 'idle'
    }
  };
}

/**
 * Create a test edge
 * @param {Object} options Edge options
 * @returns {Object} Edge object
 */
function createEdge(options) {
  // Added display name
  createEdge.displayName = 'createEdge';

  const {
    id,
    source,
    target,
    withLabels = true,
    animated = true,
    withCustomData = false,
    label = null
  } = options;
  
  return {
    id,
    source,
    target,
    animated,
    data: {
      label: label || (withLabels ? `Connection ${source} to ${target}` : ''),
      ...(withCustomData ? {
        configData: {
          type: Math.random() > 0.5 ? 'data' : 'control',
          description: 'Test connection',
          transformations: []
        }
      } : {})
    }
  };
}

/**
 * Get configuration data for a node type
 * @param {string} type Node type
 * @param {boolean} withCustomData Whether to include custom data
 * @returns {Object} Configuration data
 */
function getConfigDataForType(type, withCustomData = false) {
  // Added display name
  getConfigDataForType.displayName = 'getConfigDataForType';

  if (!withCustomData) {
    return {};
  }
  
  switch (type) {
    case 'source':
      return {
        connectionType: Math.random() > 0.5 ? 'api' : 'file',
        sourceName: `Source ${Math.floor(Math.random() * 100)}`,
        schema: {
          fields: [
            { name: 'id', type: 'number' },
            { name: 'name', type: 'string' },
            { name: 'active', type: 'boolean' }
          ]
        }
      };
      
    case 'transform':
      return {
        transformType: ['map', 'filter', 'join', 'aggregate'][Math.floor(Math.random() * 4)],
        mappings: [
          { source: 'id', target: 'userId' },
          { source: 'name', target: 'fullName' }
        ],
        condition: 'active === true'
      };
      
    case 'destination':
      return {
        connectionType: Math.random() > 0.5 ? 'api' : 'database',
        destinationName: `Destination ${Math.floor(Math.random() * 100)}`,
        writeMode: Math.random() > 0.5 ? 'insert' : 'update'
      };
      
    case 'router':
      return {
        routerType: Math.random() > 0.5 ? 'condition' : 'fork',
        conditions: ['true', 'false'],
        defaultPath: 1
      };
      
    case 'dataset':
      return {
        datasetId: `dataset-${Math.floor(Math.random() * 100)}`,
        datasetName: `Test Dataset ${Math.floor(Math.random() * 100)}`,
        fields: [
          { name: 'field1', type: 'string' },
          { name: 'field2', type: 'number' }
        ]
      };
      
    case 'trigger':
      return {
        triggerType: 'schedule',
        schedule: '0 0 * * *',
        enabled: true
      };
      
    case 'action':
      return {
        actionType: 'notification',
        channels: ['email', 'slack'],
        message: 'Test notification'
      };
      
    default:
      return {};
  }
}

/**
 * Generate a complex test flow with all node types
 * @returns {Object} Object with nodes and edges
 */
export const generateComplexTestFlow = () => {
  // Added display name
  generateComplexTestFlow.displayName = 'generateComplexTestFlow';

  // Added display name
  generateComplexTestFlow.displayName = 'generateComplexTestFlow';

  // Added display name
  generateComplexTestFlow.displayName = 'generateComplexTestFlow';

  // Added display name
  generateComplexTestFlow.displayName = 'generateComplexTestFlow';

  // Added display name
  generateComplexTestFlow.displayName = 'generateComplexTestFlow';


  // Create a flow with all node types and complex connections
  const nodes = [
    createNode({
      id: 'trigger-1',
      type: 'trigger',
      position: { x: 50, y: 200 },
      withCustomData: true
    }),
    createNode({
      id: 'source-1',
      type: 'source',
      position: { x: 250, y: 100 },
      withCustomData: true
    }),
    createNode({
      id: 'source-2',
      type: 'source',
      position: { x: 250, y: 300 },
      withCustomData: true
    }),
    createNode({
      id: 'transform-1',
      type: 'transform',
      position: { x: 450, y: 100 },
      withCustomData: true
    }),
    createNode({
      id: 'transform-2',
      type: 'transform',
      position: { x: 450, y: 300 },
      withCustomData: true
    }),
    createNode({
      id: 'router-1',
      type: 'router',
      position: { x: 650, y: 200 },
      withCustomData: true
    }),
    createNode({
      id: 'dataset-1',
      type: 'dataset',
      position: { x: 850, y: 50 },
      withCustomData: true
    }),
    createNode({
      id: 'action-1',
      type: 'action',
      position: { x: 850, y: 200 },
      withCustomData: true
    }),
    createNode({
      id: 'destination-1',
      type: 'destination',
      position: { x: 850, y: 350 },
      withCustomData: true
    })
  ];
  
  const edges = [
    createEdge({
      id: 'edge-trigger-source1',
      source: 'trigger-1',
      target: 'source-1',
      withLabels: true,
      animated: true,
      withCustomData: true
    }),
    createEdge({
      id: 'edge-trigger-source2',
      source: 'trigger-1',
      target: 'source-2',
      withLabels: true,
      animated: true,
      withCustomData: true
    }),
    createEdge({
      id: 'edge-source1-transform1',
      source: 'source-1',
      target: 'transform-1',
      withLabels: true,
      animated: true,
      withCustomData: true
    }),
    createEdge({
      id: 'edge-source2-transform2',
      source: 'source-2',
      target: 'transform-2',
      withLabels: true,
      animated: true,
      withCustomData: true
    }),
    createEdge({
      id: 'edge-transform1-router',
      source: 'transform-1',
      target: 'router-1',
      withLabels: true,
      animated: true,
      withCustomData: true
    }),
    createEdge({
      id: 'edge-transform2-router',
      source: 'transform-2',
      target: 'router-1',
      withLabels: true,
      animated: true,
      withCustomData: true
    }),
    createEdge({
      id: 'edge-router-dataset',
      source: 'router-1',
      target: 'dataset-1',
      withLabels: true,
      animated: true,
      withCustomData: true,
      label: 'Route A'
    }),
    createEdge({
      id: 'edge-router-action',
      source: 'router-1',
      target: 'action-1',
      withLabels: true,
      animated: true,
      withCustomData: true,
      label: 'Route B'
    }),
    createEdge({
      id: 'edge-router-destination',
      source: 'router-1',
      target: 'destination-1',
      withLabels: true,
      animated: true,
      withCustomData: true,
      label: 'Route C'
    })
  ];
  
  return { nodes, edges };
};

/**
 * Generate test schema with random fields
 * @param {number} fieldCount Number of fields to generate
 * @returns {Object} Schema object with fields
 */
export const generateTestSchema = (fieldCount = 10) => {
  // Added display name
  generateTestSchema.displayName = 'generateTestSchema';

  // Added display name
  generateTestSchema.displayName = 'generateTestSchema';

  // Added display name
  generateTestSchema.displayName = 'generateTestSchema';

  // Added display name
  generateTestSchema.displayName = 'generateTestSchema';

  // Added display name
  generateTestSchema.displayName = 'generateTestSchema';


  const fieldTypes = ['string', 'number', 'boolean', 'date', 'object', 'array'];
  const fields = [];
  
  for (let i = 0; i < fieldCount; i++) {
    const fieldType = fieldTypes[Math.floor(Math.random() * fieldTypes.length)];
    
    fields.push({
      name: `field${i+1}`,
      type: fieldType,
      description: `Test field ${i+1}`,
      required: Math.random() > 0.5,
      defaultValue: getDefaultValueForType(fieldType)
    });
  }
  
  return {
    name: 'Test Schema',
    fields
  };
};

/**
 * Get default value for a field type
 * @param {string} type Field type
 * @returns {*} Default value
 */
function getDefaultValueForType(type) {
  // Added display name
  getDefaultValueForType.displayName = 'getDefaultValueForType';

  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'date':
      return new Date().toISOString();
    case 'object':
      return {};
    case 'array':
      return [];
    default:
      return null;
  }
}