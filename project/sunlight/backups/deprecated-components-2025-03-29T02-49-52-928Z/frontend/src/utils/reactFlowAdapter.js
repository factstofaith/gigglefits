/**
 * React Flow Adapter
 * 
 * This utility provides a compatibility layer for transitioning from 
 * react-flow-renderer v10 to reactflow v11.
 * 
 * It re-exports all components and functions from reactflow v11, so components
 * can import from this adapter instead of directly from either library.
 */

import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  getConnectedEdges,
  useReactFlow,
  useKeyPress,
  useViewport,
  applyNodeChanges,
  applyEdgeChanges,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getMarkerEnd,
  Position,
  Handle,
  NodeToolbar,
  EdgeToolbar,
  useOnSelectionChange,
  useNodeId,
  MarkerType,
} from 'reactflow';

// Import required CSS
import 'reactflow/dist/style.css';

// Export everything
export {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  getConnectedEdges,
  useReactFlow,
  useKeyPress,
  useViewport,
  applyNodeChanges,
  applyEdgeChanges,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  getSmoothStepPath,
  getMarkerEnd,
  Position,
  Handle,
  NodeToolbar,
  EdgeToolbar,
  useOnSelectionChange,
  useNodeId,
  MarkerType,
};

// Export default
export default ReactFlow;

/**
 * API Compatibility Helpers
 */

// Elements to Nodes/Edges conversion
export const getElements = (nodes, edges) => ({ nodes, edges });
export const isNode = (element) => Object.prototype.hasOwnProperty.call(element, 'position');
export const isEdge = (element) => Object.prototype.hasOwnProperty.call(element, 'source') && Object.prototype.hasOwnProperty.call(element, 'target');

// Props compatibility
export const getCompatProps = (props) => {
  // Added display name
  getCompatProps.displayName = 'getCompatProps';

  // Added display name
  getCompatProps.displayName = 'getCompatProps';

  // Added display name
  getCompatProps.displayName = 'getCompatProps';

  // Added display name
  getCompatProps.displayName = 'getCompatProps';

  // Added display name
  getCompatProps.displayName = 'getCompatProps';


  const newProps = { ...props };
  
  // Map v10 props to v11 props
  if ('elementsSelectable' in newProps) {
    newProps.nodesSelectable = newProps.elementsSelectable;
    newProps.edgesSelectable = newProps.elementsSelectable;
    delete newProps.elementsSelectable;
  }
  
  // Other prop mappings if needed
  
  return newProps;
};

// Hook for v10 useOnViewportChange compatibility
export const useOnViewportChange = (callback) => {
  // Added display name
  useOnViewportChange.displayName = 'useOnViewportChange';

  // Added display name
  useOnViewportChange.displayName = 'useOnViewportChange';

  // Added display name
  useOnViewportChange.displayName = 'useOnViewportChange';

  // Added display name
  useOnViewportChange.displayName = 'useOnViewportChange';

  // Added display name
  useOnViewportChange.displayName = 'useOnViewportChange';


  const reactFlowInstance = useReactFlow();
  
  // v11 uses useViewport instead, so we adapt it
  const viewport = useViewport();
  
  React.useEffect(() => {
    if (callback && typeof callback === 'function') {
      callback(viewport);
    }
  }, [viewport, callback]);
  
  return viewport;
};