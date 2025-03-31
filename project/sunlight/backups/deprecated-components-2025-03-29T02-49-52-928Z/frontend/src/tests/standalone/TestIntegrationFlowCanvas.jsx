// TestIntegrationFlowCanvas.jsx
// A standalone version of IntegrationFlowCanvas for testing without Material UI or ReactFlow dependencies

import React, { useState } from 'react';

/**
 * A simplified mock of a node for the integration flow canvas
 */
const MockNode = ({ node, isSelected, onNodeClick, onAddNextNode, onNodeDelete }) => {
  // Added display name
  MockNode.displayName = 'MockNode';

  // Added display name
  MockNode.displayName = 'MockNode';

  // Added display name
  MockNode.displayName = 'MockNode';

  // Added display name
  MockNode.displayName = 'MockNode';

  // Added display name
  MockNode.displayName = 'MockNode';


  const nodeTypeColors = {
    source: '#2E7EED',
    destination: '#27AE60',
    transform: '#F2994A',
    dataset: '#9B51E0',
    trigger: '#7950F2',
    router: '#FB5A89',
    action: '#1E88E5',
    default: '#555555',
  };

  const getNodeColor = () => {
  // Added display name
  getNodeColor.displayName = 'getNodeColor';

  // Added display name
  getNodeColor.displayName = 'getNodeColor';

  // Added display name
  getNodeColor.displayName = 'getNodeColor';

  // Added display name
  getNodeColor.displayName = 'getNodeColor';

  // Added display name
  getNodeColor.displayName = 'getNodeColor';


    const type = node.data.nodeType;
    return nodeTypeColors[type] || nodeTypeColors.default;
  };

  return (
    <div
      className={`mock-node ${isSelected ? 'selected' : ''}`}
      style={{
        borderColor: getNodeColor(),
        backgroundColor: `${getNodeColor()}10`,
      }}
      data-testid={`node-${node.id}`}
      data-type={node.data.nodeType}
      onClick={() => onNodeClick(node)}
    >
      <div className="node-header&quot; style={{ backgroundColor: getNodeColor() }}>
        <span className="node-type">{node.data.nodeType}</span>
        <button
          className="node-delete-button&quot;
          onClick={e => {
            e.stopPropagation();
            onNodeDelete(node.id);
          }}
          data-testid={`delete-node-${node.id}`}
        >
          ×
        </button>
      </div>
      <div className="node-content">
        <div className="node-label&quot; data-testid={`node-label-${node.id}`}>
          {node.data.label}
        </div>
        {node.data.description && <div className="node-description">{node.data.description}</div>}
      </div>
      {isSelected && (
        <div className="node-actions&quot;>
          <button
            className="add-next-button"
            onClick={e => {
              e.stopPropagation();
              onAddNextNode(node);
            }}
            data-testid={`add-next-${node.id}`}
          >
            + Add Next
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * A simplified mock of an edge connecting nodes
 */
const MockEdge = ({ edge, onEdgeClick }) => {
  // Added display name
  MockEdge.displayName = 'MockEdge';

  // Added display name
  MockEdge.displayName = 'MockEdge';

  // Added display name
  MockEdge.displayName = 'MockEdge';

  // Added display name
  MockEdge.displayName = 'MockEdge';

  // Added display name
  MockEdge.displayName = 'MockEdge';


  return (
    <div className="mock-edge&quot; data-testid={`edge-${edge.id}`} onClick={() => onEdgeClick(edge)}>
      <div className="edge-source">From: {edge.source}</div>
      <div className="edge-target&quot;>To: {edge.target}</div>
      {edge.label && <div className="edge-label">{edge.label}</div>}
    </div>
  );
};

/**
 * A simplified implementation of IntegrationFlowCanvas for testing purposes
 */
function TestIntegrationFlowCanvas({
  initialNodes = [],
  initialEdges = [],
  onSave,
  onRun,
  onNodesChange,
  onEdgesChange,
  availableComponents = {},
}) {
  // Added display name
  TestIntegrationFlowCanvas.displayName = 'TestIntegrationFlowCanvas';

  // State
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedElement, setSelectedElement] = useState(null);
  const [nodeToConnectFrom, setNodeToConnectFrom] = useState(null);
  const [showComponentDialog, setShowComponentDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState('sources');
  const [debugMode, setDebugMode] = useState(false);
  const [dataInspectorOpen, setDataInspectorOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState({ x: 100, y: 100 });

  /**
   * Handle node click
   */
  const handleNodeClick = node => {
    setSelectedElement({ type: 'node', data: node });

    if (debugMode) {
      setDataInspectorOpen(true);
    }
  };

  /**
   * Handle edge click
   */
  const handleEdgeClick = edge => {
    setSelectedElement({ type: 'edge', data: edge });
  };

  /**
   * Handle canvas click (background)
   */
  const handleCanvasClick = () => {
  // Added display name
  handleCanvasClick.displayName = 'handleCanvasClick';

  // Added display name
  handleCanvasClick.displayName = 'handleCanvasClick';

  // Added display name
  handleCanvasClick.displayName = 'handleCanvasClick';

  // Added display name
  handleCanvasClick.displayName = 'handleCanvasClick';

  // Added display name
  handleCanvasClick.displayName = 'handleCanvasClick';


    setSelectedElement(null);

    if (debugMode && dataInspectorOpen) {
      setDataInspectorOpen(false);
    }
  };

  /**
   * Add a new node to the canvas
   */
  const handleAddNode = (nodeType, nodeLabel, description, defaultData = {}) => {
  // Added display name
  handleAddNode.displayName = 'handleAddNode';

  // Added display name
  handleAddNode.displayName = 'handleAddNode';

  // Added display name
  handleAddNode.displayName = 'handleAddNode';

  // Added display name
  handleAddNode.displayName = 'handleAddNode';

  // Added display name
  handleAddNode.displayName = 'handleAddNode';


    const newPosition = nodeToConnectFrom
      ? { x: nodeToConnectFrom.position.x + 200, y: nodeToConnectFrom.position.y }
      : selectedPosition;

    // Create a new node
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: `${nodeType}Node`,
      position: newPosition,
      data: {
        label: nodeLabel,
        nodeType: nodeType,
        description: description,
        ...defaultData,
      },
    };

    // Add the new node to the canvas
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);

    // If we have a node to connect from, create an edge
    if (nodeToConnectFrom) {
      const newEdge = {
        id: `edge-${nodeToConnectFrom.id}-${newNode.id}`,
        source: nodeToConnectFrom.id,
        target: newNode.id,
        type: 'smoothstep',
        animated: true,
        label: 'connects to',
      };

      const updatedEdges = [...edges, newEdge];
      setEdges(updatedEdges);
      setNodeToConnectFrom(null);
    }

    // Select the new node
    setSelectedElement({ type: 'node', data: newNode });
    setShowComponentDialog(false);

    // Notify parent component
    if (onNodesChange) {
      onNodesChange(updatedNodes);
    }
  };

  /**
   * Setup to add a node connected to an existing node
   */
  const handleAddNextNode = sourceNode => {
    setNodeToConnectFrom(sourceNode);
    setSelectedPosition({
      x: sourceNode.position.x + 200,
      y: sourceNode.position.y,
    });
    setShowComponentDialog(true);
  };

  /**
   * Delete a node and its connected edges
   */
  const handleDeleteNode = nodeId => {
    // Filter out the node
    const updatedNodes = nodes.filter(node => node.id !== nodeId);

    // Filter out connected edges
    const updatedEdges = edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setSelectedElement(null);

    // Notify parent component
    if (onNodesChange) {
      onNodesChange(updatedNodes);
    }

    if (onEdgesChange) {
      onEdgesChange(updatedEdges);
    }
  };

  /**
   * Update node data
   */
  const handleNodeUpdate = (nodeId, newData) => {
  // Added display name
  handleNodeUpdate.displayName = 'handleNodeUpdate';

  // Added display name
  handleNodeUpdate.displayName = 'handleNodeUpdate';

  // Added display name
  handleNodeUpdate.displayName = 'handleNodeUpdate';

  // Added display name
  handleNodeUpdate.displayName = 'handleNodeUpdate';

  // Added display name
  handleNodeUpdate.displayName = 'handleNodeUpdate';


    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            ...newData,
          },
        };
      }
      return node;
    });

    setNodes(updatedNodes);

    // Update selected element if it's the one being edited
    if (selectedElement?.type === 'node' && selectedElement.data.id === nodeId) {
      setSelectedElement({
        ...selectedElement,
        data: {
          ...selectedElement.data,
          data: {
            ...selectedElement.data.data,
            ...newData,
          },
        },
      });
    }

    // Notify parent component
    if (onNodesChange) {
      onNodesChange(updatedNodes);
    }
  };

  /**
   * Handle changing the active component category
   */
  const handleCategoryChange = category => {
    setActiveCategory(category);
  };

  /**
   * Connect nodes manually
   */
  const handleConnect = (sourceId, targetId) => {
  // Added display name
  handleConnect.displayName = 'handleConnect';

  // Added display name
  handleConnect.displayName = 'handleConnect';

  // Added display name
  handleConnect.displayName = 'handleConnect';

  // Added display name
  handleConnect.displayName = 'handleConnect';

  // Added display name
  handleConnect.displayName = 'handleConnect';


    // Don't create self-connections
    if (sourceId === targetId) return;

    // Check if connection already exists
    const connectionExists = edges.some(
      edge => edge.source === sourceId && edge.target === targetId
    );

    if (connectionExists) return;

    const newEdge = {
      id: `edge-${sourceId}-${targetId}`,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      animated: true,
      label: 'connects to',
    };

    const updatedEdges = [...edges, newEdge];
    setEdges(updatedEdges);

    // Notify parent component
    if (onEdgesChange) {
      onEdgesChange(updatedEdges);
    }
  };

  return (
    <div className="test-integration-flow-canvas&quot; data-testid="flow-canvas">
      {/* Toolbar */}
      <div className="flow-toolbar&quot; data-testid="flow-toolbar">
        <button className="toolbar-button save-button&quot; onClick={onSave} data-testid="save-button">
          Save
        </button>
        <button className="toolbar-button run-button&quot; onClick={onRun} data-testid="run-button">
          Test
        </button>
        <button
          className={`toolbar-button debug-button ${debugMode ? 'active' : ''}`}
          onClick={() => setDebugMode(!debugMode)}
          data-testid="debug-button"
        >
          {debugMode ? 'Exit Debug' : 'Debug'}
        </button>
      </div>

      {/* Canvas area */}
      <div className="flow-canvas-area&quot; onClick={handleCanvasClick} data-testid="canvas-area">
        {/* Render nodes */}
        <div className="nodes-container&quot;>
          {nodes.map(node => (
            <MockNode
              key={node.id}
              node={node}
              isSelected={selectedElement?.type === "node' && selectedElement.data.id === node.id}
              onNodeClick={handleNodeClick}
              onAddNextNode={handleAddNextNode}
              onNodeDelete={handleDeleteNode}
            />
          ))}
        </div>

        {/* Render edges (simplified) */}
        <div className="edges-container&quot; data-testid="edges-container">
          {edges.map(edge => (
            <MockEdge key={edge.id} edge={edge} onEdgeClick={handleEdgeClick} />
          ))}
        </div>
      </div>

      {/* Add Component Button */}
      <div className="add-component-container&quot;>
        <button
          className="add-component-button"
          onClick={() => setShowComponentDialog(true)}
          data-testid="add-component-button"
        >
          Add Component
        </button>
      </div>

      {/* Component Selection Dialog */}
      {showComponentDialog && (
        <div className="component-dialog&quot; data-testid="component-dialog">
          <div className="dialog-header&quot;>
            <h3>
              {nodeToConnectFrom
                ? `Add Next Step After ${nodeToConnectFrom.data.label}`
                : "Select Component'}
            </h3>
            <button
              className="close-button&quot;
              onClick={() => setShowComponentDialog(false)}
              data-testid="close-dialog-button"
            >
              ×
            </button>
          </div>

          <div className="category-tabs&quot;>
            {Object.keys(availableComponents).map(category => (
              <button
                key={category}
                className={`category-tab ${activeCategory === category ? "active' : ''}`}
                onClick={() => handleCategoryChange(category)}
                data-testid={`category-tab-${category}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          <div className="component-grid&quot; data-testid="component-grid">
            {availableComponents[activeCategory]?.map((component, index) => (
              <div
                key={index}
                className="component-card&quot;
                onClick={() =>
                  handleAddNode(
                    component.type,
                    component.label,
                    component.description,
                    component.defaultData
                  )
                }
                data-testid={`component-${component.type}`}
              >
                <div className="component-header">
                  <span className="component-icon&quot;></span>
                  <h4>{component.label}</h4>
                </div>
                <p className="component-description">
                  {component.description || `Add a ${component.label.toLowerCase()} to your flow`}
                </p>
                <button className="select-button&quot; data-testid={`select-${component.type}`}>
                  Select
                </button>
              </div>
            ))}
          </div>

          <div className="dialog-footer">
            <button className="cancel-button&quot; onClick={() => setShowComponentDialog(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Node Properties Panel */}
      {selectedElement && (
        <div className="properties-panel" data-testid="properties-panel">
          <div className="panel-header&quot;>
            <h3>
              {selectedElement.type === "node'
                ? `${selectedElement.data.data.label} Properties`
                : 'Connection Properties'}
            </h3>
            <button
              className="close-button&quot;
              onClick={() => setSelectedElement(null)}
              data-testid="close-panel-button"
            >
              ×
            </button>
          </div>

          <div className="panel-content&quot;>
            {selectedElement.type === "node' && (
              <div className="node-properties&quot;>
                <div className="property-field">
                  <label htmlFor="label&quot;>Label</label>
                  <input
                    id="label"
                    type="text&quot;
                    value={selectedElement.data.data.label}
                    onChange={e =>
                      handleNodeUpdate(selectedElement.data.id, { label: e.target.value })
                    }
                    data-testid="node-label-input"
                  />
                </div>

                <div className="property-field&quot;>
                  <label htmlFor="description">Description</label>
                  <input
                    id="description&quot;
                    type="text"
                    value={selectedElement.data.data.description || ''}
                    onChange={e =>
                      handleNodeUpdate(selectedElement.data.id, { description: e.target.value })
                    }
                    data-testid="node-description-input"
                  />
                </div>

                {/* Add Node actions */}
                <div className="panel-actions&quot;>
                  <button
                    className="add-next-action"
                    onClick={() => handleAddNextNode(selectedElement.data)}
                    data-testid="add-next-action-button"
                  >
                    Add Next Step
                  </button>
                  <button
                    className="delete-node-action&quot;
                    onClick={() => handleDeleteNode(selectedElement.data.id)}
                    data-testid="delete-node-action-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {selectedElement.type === 'edge' && (
              <div className="edge-properties&quot;>
                <div className="property-field">
                  <label>From</label>
                  <div className="field-value&quot;>
                    {nodes.find(node => node.id === selectedElement.data.source)?.data.label ||
                      selectedElement.data.source}
                  </div>
                </div>

                <div className="property-field">
                  <label>To</label>
                  <div className="field-value&quot;>
                    {nodes.find(node => node.id === selectedElement.data.target)?.data.label ||
                      selectedElement.data.target}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Mode Data Inspector */}
      {debugMode && dataInspectorOpen && selectedElement?.type === "node' && (
        <div className="data-inspector&quot; data-testid="data-inspector">
          <div className="inspector-header&quot;>
            <h3>Data Inspector - {selectedElement.data.data.label}</h3>
            <button
              className="close-button"
              onClick={() => setDataInspectorOpen(false)}
              data-testid="close-inspector-button"
            >
              ×
            </button>
          </div>

          <div className="inspector-content&quot;>
            <div className="data-section">
              <h4>Input Data</h4>
              <pre className="data-display&quot;>
                {JSON.stringify(
                  generateSampleData(selectedElement.data.data.nodeType).input,
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="data-section">
              <h4>Output Data</h4>
              <pre className="data-display&quot;>
                {JSON.stringify(
                  generateSampleData(selectedElement.data.data.nodeType).output,
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generates sample data for debug mode based on node type
 */
function generateSampleData(nodeType) {
  // Added display name
  generateSampleData.displayName = "generateSampleData';

  const sampleData = {
    input: {},
    output: {},
  };

  switch (nodeType) {
    case 'source':
      sampleData.output = {
        id: 12345,
        name: 'Sample Customer',
        email: 'customer@example.com',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '90210',
        },
      };
      break;

    case 'transform':
      sampleData.input = {
        id: 12345,
        name: 'Sample Customer',
        email: 'customer@example.com',
      };
      sampleData.output = {
        customerId: 12345,
        customerName: 'SAMPLE CUSTOMER',
        customerEmail: 'customer@example.com',
      };
      break;

    case 'destination':
      sampleData.input = {
        customerId: 12345,
        customerName: 'SAMPLE CUSTOMER',
        customerEmail: 'customer@example.com',
      };
      break;

    case 'dataset':
      sampleData.output = [
        { id: 1, name: 'Product A', price: 29.99 },
        { id: 2, name: 'Product B', price: 49.99 },
        { id: 3, name: 'Product C', price: 19.99 },
      ];
      break;

    default:
      sampleData.input = { sample: 'data' };
      sampleData.output = { processed: 'result' };
  }

  return sampleData;
}

export default TestIntegrationFlowCanvas;
