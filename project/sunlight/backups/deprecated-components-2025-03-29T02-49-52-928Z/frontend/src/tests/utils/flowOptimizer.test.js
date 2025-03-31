/**
 * Flow Optimizer Tests
 */
import {
  isLargeFlow,
  getOptimizedRenderingPlan,
  getOptimizedEdges,
  getVisibleNodes,
  getVisibleEdges,
  batchNodeChanges,
  createVirtualizedNodes,
  getVirtualizationPlan,
  calculateFlowPerformanceMetrics
} from '../../utils/flowOptimizer';

// Test data generator
const generateTestNodes = (count) => {
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


  const nodes = [];
  for (let i = 0; i < count; i++) {
    const x = (i % 10) * 200;
    const y = Math.floor(i / 10) * 150;
    
    nodes.push({
      id: `node-${i}`,
      type: i === 0 ? 'sourceNode' : i === count - 1 ? 'destinationNode' : 'transformNode',
      position: { x, y },
      data: {
        label: `Node ${i}`,
        nodeType: i === 0 ? 'source' : i === count - 1 ? 'destination' : 'transform',
        validation: { isValid: i % 10 !== 0 } // Every 10th node has validation error
      }
    });
  }
  return nodes;
};

const generateTestEdges = (nodeCount) => {
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


  const edges = [];
  for (let i = 0; i < nodeCount - 1; i++) {
    if (i % 5 !== 4) { // Create a mix of connected and disconnected nodes
      edges.push({
        id: `edge-${i}-${i+1}`,
        source: `node-${i}`,
        target: `node-${i+1}`,
        data: { label: `Edge ${i} to ${i+1}` }
      });
    }
  }
  return edges;
};

describe('Flow Optimizer', () => {
  describe('isLargeFlow', () => {
    it('should detect large flows based on node count', () => {
      const nodes = generateTestNodes(60);
      const edges = generateTestEdges(10);
      
      expect(isLargeFlow(nodes, edges)).toBe(true);
    });
    
    it('should detect large flows based on edge count', () => {
      const nodes = generateTestNodes(10);
      const edges = generateTestEdges(100);
      
      expect(isLargeFlow(nodes, edges)).toBe(true);
    });
    
    it('should not mark smaller flows as large', () => {
      const nodes = generateTestNodes(30);
      const edges = generateTestEdges(30);
      
      expect(isLargeFlow(nodes, edges)).toBe(false);
    });
    
    it('should use custom thresholds if provided', () => {
      const nodes = generateTestNodes(30);
      const edges = generateTestEdges(30);
      
      expect(isLargeFlow(nodes, edges, { nodes: 20, edges: 40 })).toBe(true);
    });
  });
  
  describe('getOptimizedRenderingPlan', () => {
    it('should not optimize small flows', () => {
      const nodes = generateTestNodes(20);
      const viewport = { x: 0, y: 0, zoom: 1 };
      const dimensions = { width: 1000, height: 800 };
      
      const result = getOptimizedRenderingPlan(nodes, viewport, dimensions);
      
      expect(result.optimize).toBe(false);
      expect(result.detailedNodes.length).toBe(20);
      expect(result.simplifiedNodes.length).toBe(0);
      expect(result.hiddenNodes.length).toBe(0);
    });
    
    it('should optimize large flows', () => {
      const nodes = generateTestNodes(100);
      const viewport = { x: 0, y: 0, zoom: 1 };
      const dimensions = { width: 1000, height: 800 };
      
      const result = getOptimizedRenderingPlan(nodes, viewport, dimensions, 30);
      
      expect(result.optimize).toBe(true);
      expect(result.detailedNodes.length + result.simplifiedNodes.length + result.hiddenNodes.length).toBe(100);
    });
    
    it('should prioritize nodes in visible area', () => {
      const nodes = generateTestNodes(100);
      // Set viewport to focus on the first 20 nodes
      const viewport = { x: 0, y: 0, zoom: 1 };
      const dimensions = { width: 1000, height: 800 };
      
      const result = getOptimizedRenderingPlan(nodes, viewport, dimensions, 30);
      
      // Check that visible nodes are in detailed or simplified buckets
      const visibleNodeIds = nodes
        .filter(node => 
          node.position.x >= -100 && 
          node.position.x <= 1100 && 
          node.position.y >= -100 && 
          node.position.y <= 900
        )
        .map(node => node.id);
        
      const nonHiddenNodes = [...result.detailedNodes, ...result.simplifiedNodes];
      
      // All visible nodes should be in non-hidden buckets
      visibleNodeIds.forEach(id => {
        expect(nonHiddenNodes).toContain(id);
      });
    });
    
    it('should always show source, destination, and invalid nodes in detail', () => {
      const nodes = generateTestNodes(100);
      const viewport = { x: 0, y: 0, zoom: 1 };
      const dimensions = { width: 1000, height: 800 };
      
      const result = getOptimizedRenderingPlan(nodes, viewport, dimensions, 30);
      
      // Check source, destination, and validation error nodes
      const sourceNode = nodes.find(n => n.data.nodeType === 'source');
      const destinationNode = nodes.find(n => n.data.nodeType === 'destination');
      const invalidNodes = nodes.filter(n => n.data.validation?.isValid === false).map(n => n.id);
      
      // Important nodes should be detailed
      expect(result.detailedNodes).toContain(sourceNode.id);
      expect(result.detailedNodes).toContain(destinationNode.id);
      
      // Invalid nodes should be detailed if in visible area
      invalidNodes.forEach(id => {
        // Find node position
        const node = nodes.find(n => n.id === id);
        const isVisible = 
          node.position.x >= -100 && 
          node.position.x <= 1100 && 
          node.position.y >= -100 && 
          node.position.y <= 900;
          
        if (isVisible) {
          expect(result.detailedNodes).toContain(id);
        }
      });
    });
  });
  
  describe('getOptimizedEdges', () => {
    it('should categorize edges based on connected nodes', () => {
      const nodes = generateTestNodes(50);
      const edges = generateTestEdges(50);
      const viewport = { x: 0, y: 0, zoom: 1 };
      const dimensions = { width: 1000, height: 800 };
      
      const renderPlan = getOptimizedRenderingPlan(nodes, viewport, dimensions, 30);
      const edgePlan = getOptimizedEdges(edges, renderPlan);
      
      // Check that edges are categorized
      expect(edgePlan.detailedEdges.length + edgePlan.simplifiedEdges.length + edgePlan.hiddenEdges.length)
        .toBe(edges.length);
        
      // Verify edge categorization logic
      edges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        const sourceHidden = renderPlan.hiddenNodes.includes(sourceNode.id);
        const targetHidden = renderPlan.hiddenNodes.includes(targetNode.id);
        
        if (sourceHidden && targetHidden) {
          expect(edgePlan.hiddenEdges).toContain(edge.id);
        }
      });
    });
  });
  
  describe('getVisibleNodes', () => {
    it('should filter nodes based on render plan', () => {
      const nodes = generateTestNodes(100);
      const viewport = { x: 0, y: 0, zoom: 1 };
      const dimensions = { width: 1000, height: 800 };
      
      const renderPlan = getOptimizedRenderingPlan(nodes, viewport, dimensions, 30);
      const visibleNodes = getVisibleNodes(nodes, renderPlan);
      
      // Check correct number of nodes
      expect(visibleNodes.length).toBe(renderPlan.detailedNodes.length + renderPlan.simplifiedNodes.length);
      
      // Check simplified nodes have correct flag
      renderPlan.simplifiedNodes.forEach(id => {
        const node = visibleNodes.find(n => n.id === id);
        expect(node.data.isSimplified).toBe(true);
      });
    });
  });
  
  describe('getVisibleEdges', () => {
    it('should filter edges based on edge plan', () => {
      const nodes = generateTestNodes(50);
      const edges = generateTestEdges(50);
      const viewport = { x: 0, y: 0, zoom: 1 };
      const dimensions = { width: 1000, height: 800 };
      
      const renderPlan = getOptimizedRenderingPlan(nodes, viewport, dimensions, 30);
      const edgePlan = getOptimizedEdges(edges, renderPlan);
      const visibleEdges = getVisibleEdges(edges, edgePlan);
      
      // Check correct number of edges
      expect(visibleEdges.length).toBe(edgePlan.detailedEdges.length + edgePlan.simplifiedEdges.length);
      
      // Check simplified edges have correct flag
      edgePlan.simplifiedEdges.forEach(id => {
        const edge = visibleEdges.find(e => e.id === id);
        expect(edge.data.isSimplified).toBe(true);
      });
    });
  });
  
  describe('batchNodeChanges', () => {
    it('should consolidate multiple changes to the same node', () => {
      const nodes = generateTestNodes(5);
      
      const changes = [
        { id: 'node-1', type: 'position', position: { x: 100, y: 100 } },
        { id: 'node-1', type: 'select', selected: true },
        { id: 'node-2', type: 'data', data: { label: 'New Label' } }
      ];
      
      const updatedNodes = batchNodeChanges(changes, nodes);
      
      // Node 1 should have updated position and selected state
      const node1 = updatedNodes.find(n => n.id === 'node-1');
      expect(node1.position).toEqual({ x: 100, y: 100 });
      expect(node1.selected).toBe(true);
      
      // Node 2 should have updated label
      const node2 = updatedNodes.find(n => n.id === 'node-2');
      expect(node2.data.label).toBe('New Label');
    });
  });
  
  describe('createVirtualizedNodes', () => {
    it('should create lightweight versions of nodes', () => {
      const nodes = generateTestNodes(10);
      const virtualizedNodes = createVirtualizedNodes(nodes);
      
      // Check virtualized nodes have minimal data
      expect(virtualizedNodes.length).toBe(10);
      virtualizedNodes.forEach((node, i) => {
        expect(node.id).toBe(`node-${i}`);
        expect(node.data.isVirtualized).toBe(true);
        expect(node.data.label).toBe(`Node ${i}`);
        
        // Check that complex data is simplified
        expect(Object.keys(node.data)).toHaveLength(4); // Only essential properties
      });
    });
  });
  
  describe('getVirtualizationPlan', () => {
    it('should create a complete rendering plan', () => {
      const nodes = generateTestNodes(100);
      const edges = generateTestEdges(100);
      const viewport = { x: 0, y: 0, zoom: 1 };
      const dimensions = { width: 1000, height: 800 };
      
      const plan = getVirtualizationPlan(nodes, edges, viewport, dimensions);
      
      // Check plan structure
      expect(plan).toHaveProperty('nodes');
      expect(plan).toHaveProperty('edges');
      expect(plan).toHaveProperty('isOptimized');
      expect(plan).toHaveProperty('hiddenCount');
      
      // Should be optimized for large flow
      expect(plan.isOptimized).toBe(true);
      expect(plan.nodes.length).toBeLessThan(nodes.length);
      expect(plan.edges.length).toBeLessThan(edges.length);
    });
    
    it('should not optimize small flows', () => {
      const nodes = generateTestNodes(20);
      const edges = generateTestEdges(20);
      const viewport = { x: 0, y: 0, zoom: 1 };
      const dimensions = { width: 1000, height: 800 };
      
      const plan = getVirtualizationPlan(nodes, edges, viewport, dimensions);
      
      // Small flow should not be optimized
      expect(plan.nodes.length).toBe(nodes.length);
      expect(plan.edges.length).toBe(edges.length);
    });
  });
  
  describe('calculateFlowPerformanceMetrics', () => {
    it('should calculate performance metrics for flows', () => {
      const nodes = generateTestNodes(70);
      const edges = generateTestEdges(70);
      
      const metrics = calculateFlowPerformanceMetrics(nodes, edges);
      
      // Check metrics structure
      expect(metrics).toHaveProperty('nodeCount', 70);
      expect(metrics).toHaveProperty('edgeCount');
      expect(metrics).toHaveProperty('nodeTypes');
      expect(metrics).toHaveProperty('avgConnectionsPerNode');
      expect(metrics).toHaveProperty('mostConnectedNodes');
      expect(metrics).toHaveProperty('optimizationRecommended');
      expect(metrics).toHaveProperty('recommendedSettings');
      
      // Large flow should recommend optimization
      expect(metrics.optimizationRecommended).toBe(true);
      expect(metrics.recommendedSettings).toHaveProperty('nodeSimplification');
    });
    
    it('should provide appropriate settings based on flow size', () => {
      // Test small flow
      const smallNodes = generateTestNodes(10);
      const smallEdges = generateTestEdges(10);
      const smallMetrics = calculateFlowPerformanceMetrics(smallNodes, smallEdges);
      
      // Small flow should have lightweight settings
      expect(smallMetrics.optimizationRecommended).toBe(false);
      expect(smallMetrics.recommendedSettings.virtualizedRendering).toBe(false);
      
      // Test large flow
      const largeNodes = generateTestNodes(200);
      const largeEdges = generateTestEdges(200);
      const largeMetrics = calculateFlowPerformanceMetrics(largeNodes, largeEdges);
      
      // Large flow should have more aggressive settings
      expect(largeMetrics.optimizationRecommended).toBe(true);
      expect(largeMetrics.recommendedSettings.virtualizedRendering).toBe(true);
      expect(largeMetrics.recommendedSettings.nodeSimplification).toBe(true);
    });
  });
});