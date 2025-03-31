/**
 * Tests for useFlowOptimizer hook
 */
import { renderHook, act } from '@testing-library/react-hooks';
import { useFlowOptimizer } from '@hooks/useFlowOptimizer';

// Mock the flowOptimizer utility
jest.mock('../../utils/flowOptimizer', () => ({
  isLargeFlow: jest.fn((nodes, edges) => nodes.length > 50 || edges.length > 75),
  getVirtualizationPlan: jest.fn((nodes, edges) => ({
    nodes: nodes.length > 50 ? nodes.slice(0, Math.ceil(nodes.length / 2)) : nodes,
    edges: edges.length > 75 ? edges.slice(0, Math.ceil(edges.length / 2)) : edges,
    isOptimized: nodes.length > 50 || edges.length > 75,
    hiddenCount: nodes.length > 50 ? Math.floor(nodes.length / 2) : 0
  })),
  calculateFlowPerformanceMetrics: jest.fn(() => ({
    nodeCount: 100,
    edgeCount: 90,
    optimizationRecommended: true,
    recommendedSettings: {
      virtualizedRendering: true,
      nodeSimplification: true
    }
  })),
  batchNodeChanges: jest.fn((changes, nodes) => {
    // Simple mock implementation for test
    return nodes.map(node => {
      const change = changes.find(c => c.id === node.id);
      if (change) {
        return { ...node, ...change };
      }
      return node;
    });
  })
}));

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


  return Array.from({ length: count }, (_, i) => ({
    id: `node-${i}`,
    type: 'testNode',
    position: { x: i * 10, y: i * 10 },
    data: { label: `Node ${i}` }
  }));
};

const generateTestEdges = (count) => {
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


  return Array.from({ length: count - 1 }, (_, i) => ({
    id: `edge-${i}`,
    source: `node-${i}`,
    target: `node-${i + 1}`,
    data: { label: `Edge ${i}` }
  }));
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
  // Mock performance.now and Date.now
  jest.spyOn(performance, 'now').mockImplementation(() => 1000);
  jest.spyOn(Date, 'now').mockImplementation(() => 1000);
});

describe('useFlowOptimizer', () => {
  it('should not optimize small flows', () => {
    const nodes = generateTestNodes(20);
    const edges = generateTestEdges(20);
    const viewport = { x: 0, y: 0, zoom: 1 };
    const dimensions = { width: 1000, height: 800 };
    
    const { result } = renderHook(() => 
      useFlowOptimizer(nodes, edges, viewport, dimensions)
    );
    
    // Small flow should not be optimized
    expect(result.current.isOptimized).toBe(false);
    expect(result.current.nodes).toEqual(nodes);
    expect(result.current.edges).toEqual(edges);
  });
  
  it('should optimize large flows', () => {
    const nodes = generateTestNodes(100);
    const edges = generateTestEdges(100);
    const viewport = { x: 0, y: 0, zoom: 1 };
    const dimensions = { width: 1000, height: 800 };
    
    const { result } = renderHook(() => 
      useFlowOptimizer(nodes, edges, viewport, dimensions)
    );
    
    // Large flow should be optimized
    expect(result.current.isOptimized).toBe(true);
    expect(result.current.nodes.length).toBeLessThan(nodes.length);
    expect(result.current.edges.length).toBeLessThan(edges.length);
  });
  
  it('should return performance metrics', () => {
    const nodes = generateTestNodes(100);
    const edges = generateTestEdges(100);
    const viewport = { x: 0, y: 0, zoom: 1 };
    const dimensions = { width: 1000, height: 800 };
    
    const { result } = renderHook(() => 
      useFlowOptimizer(nodes, edges, viewport, dimensions)
    );
    
    // Should return metrics
    expect(result.current.metrics).not.toBeNull();
    expect(result.current.metrics).toHaveProperty('nodeCount');
    expect(result.current.metrics).toHaveProperty('edgeCount');
  });
  
  it('should toggle optimization state', () => {
    const nodes = generateTestNodes(100);
    const edges = generateTestEdges(100);
    const viewport = { x: 0, y: 0, zoom: 1 };
    const dimensions = { width: 1000, height: 800 };
    
    const { result } = renderHook(() => 
      useFlowOptimizer(nodes, edges, viewport, dimensions)
    );
    
    // Initial state should be optimized
    expect(result.current.isOptimized).toBe(true);
    
    // Toggle optimization
    act(() => {
      result.current.toggleOptimization();
    });
    
    // Should toggle to false
    expect(result.current.isOptimized).toBe(false);
    expect(result.current.nodes).toEqual(nodes);
    
    // Toggle back
    act(() => {
      result.current.toggleOptimization();
    });
    
    // Should toggle to true again
    expect(result.current.isOptimized).toBe(true);
  });
  
  it('should handle batched node changes', () => {
    const nodes = generateTestNodes(20);
    const edges = generateTestEdges(20);
    const viewport = { x: 0, y: 0, zoom: 1 };
    const dimensions = { width: 1000, height: 800 };
    
    const { result } = renderHook(() => 
      useFlowOptimizer(nodes, edges, viewport, dimensions, { 
        optimizationLevels: ['batching'] 
      })
    );
    
    // Try batched changes
    const changes = [
      { id: 'node-1', label: 'Updated Label' },
      { id: 'node-2', label: 'Another Update' }
    ];
    
    const batchedResult = result.current.batchedNodeChange(changes);
    expect(batchedResult).toBeDefined();
  });
  
  it('should respect the enabled option', () => {
    const nodes = generateTestNodes(100);
    const edges = generateTestEdges(100);
    const viewport = { x: 0, y: 0, zoom: 1 };
    const dimensions = { width: 1000, height: 800 };
    
    // Disable optimization explicitly
    const { result } = renderHook(() => 
      useFlowOptimizer(nodes, edges, viewport, dimensions, { 
        enabled: false 
      })
    );
    
    // Even though it's a large flow, optimization should be disabled
    expect(result.current.isOptimized).toBe(false);
    expect(result.current.nodes).toEqual(nodes);
    expect(result.current.edges).toEqual(edges);
  });
  
  it('should throttle updates using updateInterval', () => {
    const nodes = generateTestNodes(100);
    const edges = generateTestEdges(100);
    const viewport = { x: 0, y: 0, zoom: 1 };
    const dimensions = { width: 1000, height: 800 };
    
    // Set a long update interval
    const { result, rerender } = renderHook(() => 
      useFlowOptimizer(nodes, edges, viewport, dimensions, { 
        updateInterval: 1000 // 1 second 
      })
    );
    
    // First render should process
    expect(result.current.isOptimized).toBe(true);
    
    // Mock Date.now to simulate 100ms later (less than updateInterval)
    Date.now.mockImplementation(() => 1100);
    
    // Change nodes and rerender
    const updatedNodes = [...nodes];
    updatedNodes[0] = { ...updatedNodes[0], position: { x: 500, y: 500 } };
    
    rerender(updatedNodes, edges, viewport, dimensions);
    
    // Should still be using the initial optimization
    expect(result.current.nodes).not.toContainEqual(
      expect.objectContaining({ position: { x: 500, y: 500 } })
    );
    
    // Now mock Date.now to be after update interval
    Date.now.mockImplementation(() => 2100);
    
    rerender(updatedNodes, edges, viewport, dimensions);
    
    // Now it should update
    expect(result.current.isOptimized).toBe(true);
  });
});