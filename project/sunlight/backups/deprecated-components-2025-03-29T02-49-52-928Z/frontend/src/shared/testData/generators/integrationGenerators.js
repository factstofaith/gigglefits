/**
 * Integration Flow Generators for Test Data
 * 
 * This module provides functions for generating integration flow test data
 * including nodes, edges, and complete flows of varying complexity.
 * 
 * These generators are environment-agnostic and can be used in both
 * Jest and Cypress test environments.
 * 
 * @version 1.0.0
 */

import { generateId, generateIntegration } from './entityGenerators';

/**
 * Generate a node for an integration flow
 * @param {Object} options Node options
 * @returns {Object} Flow node
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

  const { type = 'source', id = generateId(), position = { x: 100, y: 100 } } = options;
  
  return {
    id,
    type,
    position,
    data: {
      ...options.data,
      label: options.label || `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      nodeType: type
    }
  };
};

/**
 * Generate an edge connecting nodes in an integration flow
 * @param {Object} options Edge options
 * @returns {Object} Flow edge
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

  const { source = 'sourceNode', target = 'targetNode', id = generateId() } = options;
  
  return {
    id,
    source,
    target,
    type: options.type || 'default',
    animated: options.animated || false,
    style: options.style || { stroke: '#555' },
    ...options
  };
};

/**
 * Generate a simple integration flow with source, transform, and destination
 * @param {Object} options Flow options
 * @returns {Object} Simple flow with nodes and edges
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

  const sourceNode = generateNode({ type: 'source', id: 'source1', position: { x: 100, y: 100 } });
  const transformNode = generateNode({ type: 'transform', id: 'transform1', position: { x: 300, y: 100 } });
  const destinationNode = generateNode({ type: 'destination', id: 'destination1', position: { x: 500, y: 100 } });
  
  const edge1 = generateEdge({ source: 'source1', target: 'transform1', id: 'edge1' });
  const edge2 = generateEdge({ source: 'transform1', target: 'destination1', id: 'edge2' });
  
  return {
    nodes: [sourceNode, transformNode, destinationNode],
    edges: [edge1, edge2],
    ...options
  };
};

/**
 * Generate a branching integration flow with multiple paths
 * @param {Object} options Flow options
 * @returns {Object} Branching flow with nodes and edges
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

  const sourceNode = generateNode({ type: 'source', id: 'source1', position: { x: 100, y: 100 } });
  const routerNode = generateNode({ type: 'router', id: 'router1', position: { x: 300, y: 100 } });
  const transformNode1 = generateNode({ type: 'transform', id: 'transform1', position: { x: 500, y: 0 } });
  const transformNode2 = generateNode({ type: 'transform', id: 'transform2', position: { x: 500, y: 200 } });
  const destinationNode1 = generateNode({ type: 'destination', id: 'destination1', position: { x: 700, y: 0 } });
  const destinationNode2 = generateNode({ type: 'destination', id: 'destination2', position: { x: 700, y: 200 } });
  
  const edge1 = generateEdge({ source: 'source1', target: 'router1', id: 'edge1' });
  const edge2 = generateEdge({ source: 'router1', target: 'transform1', id: 'edge2', label: 'Condition 1' });
  const edge3 = generateEdge({ source: 'router1', target: 'transform2', id: 'edge3', label: 'Condition 2' });
  const edge4 = generateEdge({ source: 'transform1', target: 'destination1', id: 'edge4' });
  const edge5 = generateEdge({ source: 'transform2', target: 'destination2', id: 'edge5' });
  
  return {
    nodes: [sourceNode, routerNode, transformNode1, transformNode2, destinationNode1, destinationNode2],
    edges: [edge1, edge2, edge3, edge4, edge5],
    ...options
  };
};

/**
 * Generate a complex integration flow with multiple branches and feedback loops
 * @param {Object} options Flow options
 * @returns {Object} Complex flow with nodes and edges
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

  // Starting nodes
  const sourceNode = generateNode({ type: 'source', id: 'source1', position: { x: 0, y: 200 } });
  const triggerNode = generateNode({ type: 'trigger', id: 'trigger1', position: { x: 0, y: 400 } });
  
  // Processing nodes
  const routerNode = generateNode({ type: 'router', id: 'router1', position: { x: 200, y: 200 } });
  const transformNode1 = generateNode({ type: 'transform', id: 'transform1', position: { x: 400, y: 100 } });
  const transformNode2 = generateNode({ type: 'transform', id: 'transform2', position: { x: 400, y: 300 } });
  const actionNode = generateNode({ type: 'action', id: 'action1', position: { x: 400, y: 500 } });
  
  // Additional processing
  const transformNode3 = generateNode({ type: 'transform', id: 'transform3', position: { x: 600, y: 100 } });
  const datasetNode = generateNode({ type: 'dataset', id: 'dataset1', position: { x: 600, y: 300 } });
  
  // Destination nodes
  const destinationNode1 = generateNode({ type: 'destination', id: 'destination1', position: { x: 800, y: 100 } });
  const destinationNode2 = generateNode({ type: 'destination', id: 'destination2', position: { x: 800, y: 300 } });
  
  // Main flow path
  const edge1 = generateEdge({ source: 'source1', target: 'router1', id: 'edge1' });
  const edge2 = generateEdge({ source: 'trigger1', target: 'action1', id: 'edge2' });
  
  // Router paths
  const edge3 = generateEdge({ source: 'router1', target: 'transform1', id: 'edge3', label: 'Condition 1' });
  const edge4 = generateEdge({ source: 'router1', target: 'transform2', id: 'edge4', label: 'Condition 2' });
  
  // Transform paths
  const edge5 = generateEdge({ source: 'transform1', target: 'transform3', id: 'edge5' });
  const edge6 = generateEdge({ source: 'transform2', target: 'dataset1', id: 'edge6' });
  
  // Final paths
  const edge7 = generateEdge({ source: 'transform3', target: 'destination1', id: 'edge7' });
  const edge8 = generateEdge({ source: 'dataset1', target: 'destination2', id: 'edge8' });
  const edge9 = generateEdge({ source: 'action1', target: 'transform2', id: 'edge9', animated: true });
  
  return {
    nodes: [
      sourceNode, triggerNode, routerNode, 
      transformNode1, transformNode2, actionNode,
      transformNode3, datasetNode,
      destinationNode1, destinationNode2
    ],
    edges: [
      edge1, edge2, edge3, edge4, edge5,
      edge6, edge7, edge8, edge9
    ],
    ...options
  };
};

/**
 * Generate an integration with a flow
 * @param {Object} options Integration options
 * @returns {Object} Integration with flow
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

  const flowType = options.flowType || 'simple';
  
  let flow;
  if (flowType === 'branching') {
    flow = generateBranchingFlow(options.flow);
  } else if (flowType === 'complex') {
    flow = generateComplexFlow(options.flow);
  } else {
    flow = generateSimpleFlow(options.flow);
  }
  
  const integration = generateIntegration(options.integration);
  
  return {
    ...integration,
    flow
  };
};

/**
 * Generate a list of integrations with flows
 * @param {number} count Number of integrations to generate
 * @param {Object} options Integration options
 * @returns {Array} Array of integrations with flows
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

  const flowTypes = ['simple', 'branching', 'complex'];
  const integrations = [];
  
  for (let i = 0; i < count; i++) {
    integrations.push(generateIntegrationWithFlow({
      flowType: flowTypes[i % flowTypes.length],
      integration: {
        id: `integration-${i + 1}`,
        name: `Test Integration ${i + 1}`,
        ...options.integration
      },
      flow: options.flow
    }));
  }
  
  return integrations;
};