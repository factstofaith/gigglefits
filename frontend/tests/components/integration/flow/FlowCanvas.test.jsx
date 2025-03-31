import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import FlowCanvas from '../../../../src/components/integration/flow/FlowCanvas';

// Mock the reactflow library
jest.mock('reactflow', () => {
  const original = jest.requireActual('reactflow');
  return {
    ...original,
    ReactFlow: jest.fn(({ children, onInit, nodes, edges }) => {
      // Simulates onInit being called when ReactFlow mounts
      React.useEffect(() => {
        if (onInit) {
          onInit({
            fitView: jest.fn(),
            getNodes: () => nodes,
            getEdges: () => edges,
            screenToFlowPosition: jest.fn(pos => pos),
          });
        }
      }, []);
      
      return (
        <div data-testid="mock-react-flow">
          <div>{nodes?.length || 0} nodes</div>
          <div>{edges?.length || 0} edges</div>
          {children}
        </div>
      );
    }),
    Background: jest.fn(() => <div data-testid="mock-background" />),
    Controls: jest.fn(() => <div data-testid="mock-controls" />),
    MiniMap: jest.fn(() => <div data-testid="mock-minimap" />),
    ReactFlowProvider: jest.fn(({ children }) => <div data-testid="mock-flow-provider">{children}</div>),
    useReactFlow: () => ({
      screenToFlowPosition: jest.fn(pos => pos),
      getNodes: jest.fn(() => []),
      getEdges: jest.fn(() => []),
      fitView: jest.fn(),
    }),
    // Mock the utility functions
    addEdge: jest.fn((edge, edges) => [...edges, edge]),
    applyNodeChanges: jest.fn((changes, nodes) => {
      const updatedNodes = [...nodes];
      changes.forEach(change => {
        if (change.type === 'remove') {
          const index = updatedNodes.findIndex(node => node.id === change.id);
          if (index !== -1) {
            updatedNodes.splice(index, 1);
          }
        }
        // Handle other change types if needed
      });
      return updatedNodes;
    }),
    applyEdgeChanges: jest.fn((changes, edges) => {
      const updatedEdges = [...edges];
      changes.forEach(change => {
        if (change.type === 'remove') {
          const index = updatedEdges.findIndex(edge => edge.id === change.id);
          if (index !== -1) {
            updatedEdges.splice(index, 1);
          }
        }
        // Handle other change types if needed
      });
      return updatedEdges;
    }),
    isNode: jest.fn(el => el?.type?.includes('Node')),
    isEdge: jest.fn(el => el?.source && el?.target),
  };
});

// Mock the custom nodes and edges
jest.mock('../../../../src/components/integration/flow/nodes/SourceNode', () => {
  return function MockSourceNode() {
    return <div data-testid="mock-source-node" />;
  };
});

jest.mock('../../../../src/components/integration/flow/nodes/DestinationNode', () => {
  return function MockDestinationNode() {
    return <div data-testid="mock-destination-node" />;
  };
});

jest.mock('../../../../src/components/integration/flow/nodes/TransformationNode', () => {
  return function MockTransformationNode() {
    return <div data-testid="mock-transformation-node" />;
  };
});

jest.mock('../../../../src/components/integration/flow/nodes/FilterNode', () => {
  return function MockFilterNode() {
    return <div data-testid="mock-filter-node" />;
  };
});

jest.mock('../../../../src/components/integration/flow/edges/FlowEdge', () => {
  return function MockFlowEdge() {
    return <div data-testid="mock-flow-edge" />;
  };
});

// Mock validation functions
jest.mock('../../../../src/components/integration/flow/validation/connection-validation', () => ({
  validateConnection: jest.fn(() => ({ isValid: true, message: 'Valid connection' })),
  validateFlow: jest.fn(() => ({ 
    isValid: true, 
    hasErrors: false, 
    hasWarnings: false, 
    errors: [], 
    warnings: [],
    nodeValidation: {},
    edgeValidation: {}
  })),
  validateFlowForExecution: jest.fn(() => ({ isValid: true })),
}));

describe('FlowCanvas Component', () => {
  const defaultProps = {
    initialElements: [],
    readOnly: false,
    onChange: jest.fn(),
    onSave: jest.fn(),
    onNodeSelect: jest.fn(),
    onEdgeSelect: jest.fn(),
    onValidate: jest.fn(),
    validationErrors: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with ReactFlow and supporting components', () => {
    render(<FlowCanvas {...defaultProps} />);
    
    // ReactFlow components should be rendered
    expect(screen.getByTestId('mock-flow-provider')).toBeInTheDocument();
    expect(screen.getByTestId('mock-react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('mock-background')).toBeInTheDocument();
    expect(screen.getByTestId('mock-controls')).toBeInTheDocument();
    expect(screen.getByTestId('mock-minimap')).toBeInTheDocument();
    
    // Toolbar should be rendered
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    
    // Default toolbar buttons should be present
    expect(screen.getByTitle('Add Node')).toBeInTheDocument();
    expect(screen.getByTitle('Delete Selected')).toBeInTheDocument();
    expect(screen.getByTitle('Undo')).toBeInTheDocument();
    expect(screen.getByTitle('Redo')).toBeInTheDocument();
    expect(screen.getByTitle('Save Flow')).toBeInTheDocument();
    expect(screen.getByTitle('Validate Flow')).toBeInTheDocument();
  });

  test('renders with initial elements', () => {
    const initialNodes = [
      { id: 'source-1', type: 'sourceNode', position: { x: 100, y: 100 }, data: { label: 'Source 1' } },
      { id: 'dest-1', type: 'destinationNode', position: { x: 300, y: 100 }, data: { label: 'Destination 1' } },
    ];
    
    const initialEdges = [
      { id: 'edge-1', source: 'source-1', target: 'dest-1', type: 'flowEdge' },
    ];
    
    const initialElements = [...initialNodes, ...initialEdges];
    
    render(<FlowCanvas {...defaultProps} initialElements={initialElements} />);
    
    // ReactFlow should show the correct number of nodes and edges
    expect(screen.getByText('2 nodes')).toBeInTheDocument();
    expect(screen.getByText('1 edges')).toBeInTheDocument();
  });

  test('adds node when clicking add node button and selecting from menu', async () => {
    render(<FlowCanvas {...defaultProps} />);
    
    // Click Add Node button to show menu
    const addButton = screen.getByTitle('Add Node');
    fireEvent.click(addButton);
    
    // Menu should show up
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    
    // Click Add Source from menu
    const addSourceOption = screen.getByText('Add Source');
    fireEvent.click(addSourceOption);
    
    // A node should be added
    expect(screen.getByText('1 nodes')).toBeInTheDocument();
    
    // onChange should be called with updated elements
    expect(defaultProps.onChange).toHaveBeenCalled();
    
    // Success notification should be shown
    expect(screen.getByText('Added new source node')).toBeInTheDocument();
  });

  test('handles readonly mode', () => {
    render(<FlowCanvas {...defaultProps} readOnly={true} />);
    
    // Add Node button should be disabled
    const addButton = screen.getByTitle('Add Node');
    expect(addButton).toBeDisabled();
    
    // Delete Selected button should be disabled
    const deleteButton = screen.getByTitle('Delete Selected');
    expect(deleteButton).toBeDisabled();
    
    // Undo button should be disabled
    const undoButton = screen.getByTitle('Undo');
    expect(undoButton).toBeDisabled();
    
    // Redo button should be disabled
    const redoButton = screen.getByTitle('Redo');
    expect(redoButton).toBeDisabled();
    
    // Save Flow button should be disabled
    const saveButton = screen.getByTitle('Save Flow');
    expect(saveButton).toBeDisabled();
    
    // Read Only mode indicator should be shown
    expect(screen.getByTitle('Read Only Mode')).toBeInTheDocument();
  });

  test('calls onSave when save button is clicked', async () => {
    render(<FlowCanvas {...defaultProps} />);
    
    // Click Save Flow button
    const saveButton = screen.getByTitle('Save Flow');
    fireEvent.click(saveButton);
    
    // onSave should be called with current elements
    expect(defaultProps.onSave).toHaveBeenCalled();
    
    // Success notification should be shown
    expect(screen.getByText('Flow saved successfully')).toBeInTheDocument();
  });

  test('calls onValidate when validate button is clicked', async () => {
    render(<FlowCanvas {...defaultProps} />);
    
    // Click Validate Flow button
    const validateButton = screen.getByTitle('Validate Flow');
    fireEvent.click(validateButton);
    
    // onValidate should be called with current elements
    expect(defaultProps.onValidate).toHaveBeenCalled();
    
    // Success notification should be shown
    expect(screen.getByText('Flow validation passed successfully')).toBeInTheDocument();
  });

  // More tests would be added to cover:
  // - Node and edge selection
  // - Node deletion
  // - Edge creation with onConnect
  // - Undo/redo functionality
  // - Flow validation with errors
  // - Context menu functionality
  // - Drag and drop operations
});