import { ErrorBoundary, useErrorHandler, withErrorBoundary } from "@/error-handling"; /**
                                                                                      * Flow Canvas Component
                                                                                      *
                                                                                      * A drag-and-drop canvas for building integration flows using React Flow.
                                                                                      * This component provides the foundation for the flow-based integration
                                                                                      * interface, allowing users to add, connect, and configure nodes visually.
                                                                                      *
                                                                                      * @component
                                                                                      */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, { Background, Controls, MiniMap, addEdge, applyEdgeChanges, applyNodeChanges, isNode, isEdge, ReactFlowProvider, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Paper, Toolbar, IconButton, Tooltip, Divider, Button, Menu, MenuItem, Typography, Snackbar, Alert } from '@mui/material';
import { ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon, Add as AddIcon, Delete as DeleteIcon, SaveAlt as SaveIcon, Undo as UndoIcon, Redo as RedoIcon, FitScreen as FitScreenIcon, Lock as LockIcon, LockOpen as LockOpenIcon, Create as CreateIcon, PlayArrow as PlayIcon, Settings as SettingsIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

// Node types will be imported and registered here
import SourceNode from './nodes/SourceNode';
import DestinationNode from './nodes/DestinationNode';
import TransformationNode from './nodes/TransformationNode';
import FilterNode from './nodes/FilterNode';

// Custom edge
import FlowEdge from './edges/FlowEdge';

// Import validation utilities
import { validateConnection, validateFlow, validateFlowForExecution } from './validation/connection-validation';

// Default flow styling
const defaultFlowStyle = {
  background: '#f7f7f7'
};

// Register custom node types
const nodeTypes = {
  sourceNode: SourceNode,
  destinationNode: DestinationNode,
  transformationNode: TransformationNode,
  filterNode: FilterNode
};

// Register custom edge types
const edgeTypes = {
  flowEdge: FlowEdge
};

// Default node configuration
const DEFAULT_NODE = {
  sourceNode: {
    type: 'sourceNode',
    data: {
      label: 'Source',
      sourceType: 'default',
      config: {}
    }
  },
  destinationNode: {
    type: 'destinationNode',
    data: {
      label: 'Destination',
      destinationType: 'default',
      config: {}
    }
  },
  transformationNode: {
    type: 'transformationNode',
    data: {
      label: 'Transform',
      transformationType: 'default',
      config: {}
    }
  },
  filterNode: {
    type: 'filterNode',
    data: {
      label: 'Filter',
      filterType: 'default',
      config: {}
    }
  }
};

/**
 * Flow Canvas component
 *
 * @param {Object} props - Component props
 * @param {Array} props.initialElements - Initial flow elements (nodes and edges)
 * @param {boolean} props.readOnly - Whether the canvas is read-only
 * @param {Function} props.onChange - Callback when flow elements change
 * @param {Function} props.onSave - Callback when flow is saved
 * @param {Function} props.onNodeSelect - Callback when a node is selected
 * @param {Function} props.onEdgeSelect - Callback when an edge is selected
 * @param {Function} props.onValidate - Callback to validate the flow
 * @param {Object} props.validationErrors - Validation errors for elements
 * @returns {JSX.Element} The FlowCanvas component
 */
const FlowCanvasContent = ({
  initialElements = [],
  readOnly = false,
  onChange,
  onSave,
  onNodeSelect,
  onEdgeSelect,
  onValidate,
  validationErrors = {}
}) => {
  // Separate state for nodes and edges
  const [nodes, setNodes] = useState(initialElements.filter(el => isNode(el)));
  const [edges, setEdges] = useState(initialElements.filter(el => isEdge(el)));

  // State for selected elements
  const [selectedElements, setSelectedElements] = useState([]);

  // History for undo/redo
  const [historyIndex, setHistoryIndex] = useState(0);
  const [history, setHistory] = useState([{
    nodes: initialElements.filter(el => isNode(el)),
    edges: initialElements.filter(el => isEdge(el)),
    timestamp: new Date().toISOString(),
    action: 'Initial state'
  }]);

  // State for node menu
  const [nodeMenuAnchorEl, setNodeMenuAnchorEl] = useState(null);
  const [nodeMenuPosition, setNodeMenuPosition] = useState({
    x: 0,
    y: 0
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Reference to the flow wrapper for calculating drop positions
  const reactFlowWrapper = useRef(null);

  // Get reactFlow instance helpers
  const reactFlowInstance = useReactFlow();

  // Combine nodes and edges for backward compatibility
  const elements = [...nodes, ...edges];

  // Update history when nodes or edges change
  useEffect(() => {
    if (onChange) {
      onChange([...nodes, ...edges]);
    }
  }, [nodes, edges, onChange]);

  /**
   * Add a new state to the history with a descriptive action name
   * @param {Array} currentNodes - The current nodes state
   * @param {Array} currentEdges - The current edges state
   * @param {string} actionName - Description of the action
   */
  const addToHistory = useCallback((currentNodes, currentEdges, actionName) => {
    // Create a history record with metadata
    const historyRecord = {
      nodes: [...currentNodes],
      edges: [...currentEdges],
      timestamp: new Date().toISOString(),
      action: actionName || 'Unknown action'
    };

    // Update history by removing any future history entries (if we're not at the end)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(historyRecord);

    // Limit history size to prevent memory issues (keep last 50 states)
    const trimmedHistory = newHistory.length > 50 ? newHistory.slice(newHistory.length - 50) : newHistory;
    setHistory(trimmedHistory);
    setHistoryIndex(trimmedHistory.length - 1);

    // For debugging
    console.log(`History: ${actionName} (${trimmedHistory.length} states)`);
  }, [history, historyIndex]);

  /**
   * Add a new element to the flow and update history
   * @param {Object} newElement - The new element to add
   */
  const addElement = useCallback(newElement => {
    if (isNode(newElement)) {
      setNodes(nds => {
        const newNodes = [...nds, newElement];
        // Add to history
        addToHistory(newNodes, edges, `Added ${newElement.type}`);
        return newNodes;
      });
    } else if (isEdge(newElement)) {
      setEdges(edgs => {
        const newEdges = [...edgs, newElement];
        // Add to history
        addToHistory(nodes, newEdges, `Added connection`);
        return newEdges;
      });
    }
  }, [addToHistory, nodes, edges]);

  /**
   * Handle undo operation
   */
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const historyRecord = history[newIndex];
      if (historyRecord && historyRecord.nodes && historyRecord.edges) {
        setHistoryIndex(newIndex);
        setNodes(historyRecord.nodes);
        setEdges(historyRecord.edges);
        setNotification({
          open: true,
          message: `Undo: ${historyRecord.action}`,
          severity: 'info'
        });
      } else {
        console.error('History record is invalid', historyRecord);
      }
    }
  }, [history, historyIndex]);

  /**
   * Handle redo operation
   */
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const historyRecord = history[newIndex];
      if (historyRecord && historyRecord.nodes && historyRecord.edges) {
        setHistoryIndex(newIndex);
        setNodes(historyRecord.nodes);
        setEdges(historyRecord.edges);
        setNotification({
          open: true,
          message: `Redo: ${historyRecord.action}`,
          severity: 'info'
        });
      } else {
        console.error('History record is invalid', historyRecord);
      }
    }
  }, [history, historyIndex]);

  /**
   * Handle flow element selection
   * @param {Object} event - The selection event
   */
  const onElementsSelect = useCallback(event => {
    setSelectedElements(event);

    // Call appropriate callbacks based on element type
    if (event.length === 1) {
      const selected = event[0];
      if (isNode(selected) && onNodeSelect) {
        onNodeSelect(selected);
      } else if (isEdge(selected) && onEdgeSelect) {
        onEdgeSelect(selected);
      }
    }
  }, [onNodeSelect, onEdgeSelect]);

  /**
   * Handle element removal (nodes or edges)
   */
  const onElementsRemove = useCallback(elementsToRemove => {
    // Separate nodes and edges to remove
    const nodesToRemove = elementsToRemove.filter(el => isNode(el));
    const edgesToRemove = elementsToRemove.filter(el => isEdge(el));

    // Generate meaningful action name for history
    const actionName = elementsToRemove.length === 1 ? `Removed ${isNode(elementsToRemove[0]) ? 'node' : 'edge'} ${elementsToRemove[0].id}` : `Removed ${elementsToRemove.length} elements`;

    // Create changes object for each node to remove
    if (nodesToRemove.length > 0) {
      const nodeChanges = nodesToRemove.map(node => ({
        id: node.id,
        type: 'remove'
      }));
      setNodes(nds => {
        const updatedNodes = applyNodeChanges(nodeChanges, nds);

        // If we're also removing edges, we'll add to history after that
        if (edgesToRemove.length === 0) {
          addToHistory(updatedNodes, edges, actionName);
        }
        return updatedNodes;
      });
    }

    // Create changes object for each edge to remove
    if (edgesToRemove.length > 0) {
      const edgeChanges = edgesToRemove.map(edge => ({
        id: edge.id,
        type: 'remove'
      }));
      setEdges(edgs => {
        const updatedEdges = applyEdgeChanges(edgeChanges, edgs);

        // Add to history after both nodes and edges are removed
        if (nodesToRemove.length > 0) {
          // We need to use the latest nodes state
          const updatedNodes = nodes.filter(node => !nodesToRemove.some(nodeToRemove => nodeToRemove.id === node.id));
          addToHistory(updatedNodes, updatedEdges, actionName);
        } else {
          addToHistory(nodes, updatedEdges, actionName);
        }
        return updatedEdges;
      });
    }
  }, [nodes, edges, addToHistory]);

  /**
   * Handle connection (edge) creation
   * @param {Object} params - Connection parameters
   */
  const onConnect = useCallback(params => {
    // Get source and target nodes to validate connection
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);
    if (!sourceNode || !targetNode) {
      setNotification({
        open: true,
        message: 'Cannot create connection: Source or target node not found',
        severity: 'error'
      });
      return;
    }

    // Create connection object for validation
    const newConnection = {
      ...params,
      id: `edge-${params.source}-${params.target}-${Date.now()}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle
    };

    // Validate the connection
    const validation = validateConnection(newConnection, nodes, edges);

    // Create a custom edge with a unique ID and validation result
    const connection = {
      ...params,
      id: `edge-${params.source}-${params.target}-${Date.now()}`,
      type: 'flowEdge',
      animated: true,
      data: {
        label: 'Connection',
        validation: validation,
        connectionType: 'DATA',
        // Default to data connection type
        onDelete: edgeId => {
          const edgeToRemove = edges.find(el => el.id === edgeId);
          if (edgeToRemove) {
            onElementsRemove([edgeToRemove]);
          }
        },
        onLabelEdit: edgeId => {
          // Implementation will be added for label editing
          console.log('Edit label for', edgeId);
        },
        onConnectionTypeChange: (edgeId, connectionType) => {
          // Implementation for changing connection type
          setEdges(edgs => {
            const newEdges = edgs.map(edge => {
              if (edge.id === edgeId) {
                return {
                  ...edge,
                  animated: connectionType === 'DATA',
                  data: {
                    ...edge.data,
                    connectionType
                  }
                };
              }
              return edge;
            });

            // Add to history
            addToHistory(nodes, newEdges, `Changed connection type to ${connectionType}`);
            return newEdges;
          });
        },
        onPriorityChange: (edgeId, priority) => {
          // Implementation for changing priority
          setEdges(edgs => {
            const newEdges = edgs.map(edge => {
              if (edge.id === edgeId) {
                return {
                  ...edge,
                  data: {
                    ...edge.data,
                    priority
                  }
                };
              }
              return edge;
            });

            // Add to history
            addToHistory(nodes, newEdges, `Changed connection priority to ${priority}`);
            return newEdges;
          });
        },
        onTest: edgeId => {
          // Implementation for testing connection
          setNotification({
            open: true,
            message: 'Testing connection...',
            severity: 'info'
          });
        },
        onAddBreakpoint: edgeId => {
          // Implementation for adding breakpoint
          setEdges(edgs => {
            const newEdges = edgs.map(edge => {
              if (edge.id === edgeId) {
                const hasBreakpoint = !!edge.data?.breakpoint;
                return {
                  ...edge,
                  data: {
                    ...edge.data,
                    breakpoint: !hasBreakpoint // Toggle breakpoint
                  }
                };
              }
              return edge;
            });

            // Add to history
            addToHistory(nodes, newEdges, `Toggled breakpoint on connection ${edgeId}`);
            return newEdges;
          });
        },
        onValidate: params => {
          // Implementation for validating connection
          return validateConnection(params, nodes, edges);
        }
      }
    };

    // Set notification based on validation
    if (!validation.isValid) {
      setNotification({
        open: true,
        message: validation.message,
        severity: validation.hasError ? 'error' : 'warning'
      });

      // If it's a warning, allow the connection; if it's an error, prevent it
      if (validation.hasError) {
        return;
      }
    }

    // Add the new edge
    setEdges(edgs => {
      const newEdges = addEdge(connection, edgs);

      // Get source and target node labels for the history
      const sourceLabel = sourceNode?.data?.label || params.source;
      const targetLabel = targetNode?.data?.label || params.target;

      // Add to history
      addToHistory(nodes, newEdges, `Connected ${sourceLabel} to ${targetLabel}`);
      return newEdges;
    });
  }, [nodes, edges, addToHistory, onElementsRemove]);

  /**
   * Handle node dragging
   * @param {Event} event - The drag event
   */
  const onDragOver = useCallback(event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  /**
   * Handle node dropping onto the canvas
   * @param {Event} event - The drop event
   */
  const onDrop = useCallback(event => {
    event.preventDefault();

    // Get the drop position in the canvas coordinates
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const nodeType = event.dataTransfer.getData('application/reactflow/type');

    // Check if we have this node type
    if (typeof nodeType === 'undefined' || !nodeType || !DEFAULT_NODE[nodeType]) {
      return;
    }

    // Calculate the position where the node was dropped
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    });

    // Get node template based on the type
    const newNode = {
      ...DEFAULT_NODE[nodeType],
      position,
      id: `${nodeType}-${Date.now()}`
    };

    // Add the new node
    addElement(newNode);

    // Show notification
    setNotification({
      open: true,
      message: `Added new ${nodeType.replace('Node', '')} node`,
      severity: 'success'
    });
  }, [reactFlowInstance, addElement]);

  /**
   * Handle saving the flow
   */
  const handleSave = useCallback(() => {
    if (onSave) {
      // Combine nodes and edges for backward compatibility
      onSave([...nodes, ...edges]);

      // Show notification
      setNotification({
        open: true,
        message: 'Flow saved successfully',
        severity: 'success'
      });
    }
  }, [nodes, edges, onSave]);

  /**
   * Handle validating the flow
   */
  const handleValidate = useCallback(() => {
    // Run flow validation
    const validationResult = validateFlow(nodes, edges);

    // Update notifications with validation results
    if (validationResult.isValid) {
      setNotification({
        open: true,
        message: 'Flow validation passed successfully',
        severity: 'success'
      });
    } else {
      // Get the first error or warning message to display
      const message = validationResult.hasErrors ? validationResult.errors[0] : validationResult.hasWarnings ? validationResult.warnings[0] : 'Flow validation failed';
      setNotification({
        open: true,
        message,
        severity: validationResult.hasErrors ? 'error' : 'warning'
      });
    }

    // Update node styles with validation results
    setNodes(nds => {
      return nds.map(node => {
        // Apply validation results to nodes
        if (validationResult.nodeValidation[node.id]) {
          return {
            ...node,
            data: {
              ...node.data,
              validation: validationResult.nodeValidation[node.id]
            }
          };
        }
        return node;
      });
    });

    // Update edge styles with validation results
    setEdges(edgs => {
      return edgs.map(edge => {
        // Apply validation results to edges
        if (validationResult.edgeValidation[edge.id]) {
          return {
            ...edge,
            data: {
              ...edge.data,
              validation: validationResult.edgeValidation[edge.id]
            }
          };
        }
        return edge;
      });
    });

    // If there's an external validation handler, call it with the result
    if (onValidate) {
      onValidate([...nodes, ...edges], validationResult);
    }
    return validationResult.isValid;
  }, [nodes, edges, onValidate]);

  /**
   * Delete selected elements
   */
  const handleDelete = useCallback(() => {
    if (selectedElements.length > 0) {
      onElementsRemove(selectedElements);
      setSelectedElements([]);

      // Show notification
      setNotification({
        open: true,
        message: `Deleted ${selectedElements.length} element(s)`,
        severity: 'info'
      });
    }
  }, [selectedElements, onElementsRemove]);

  /**
   * Show node menu at canvas position
   * @param {Event} event - The context menu event
   */
  const handleContextMenu = useCallback(event => {
    event.preventDefault();

    // Calculate position relative to canvas
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    });
    setNodeMenuPosition(position);
    setNodeMenuAnchorEl(event.currentTarget);
  }, [reactFlowInstance]);

  /**
   * Close node menu
   */
  const handleCloseNodeMenu = useCallback(() => {
    setNodeMenuAnchorEl(null);
  }, []);

  /**
   * Add a new node from the context menu
   * @param {string} nodeType - Type of node to add
   */
  const handleAddNode = useCallback(nodeType => {
    // Check if we have this node type
    if (!DEFAULT_NODE[nodeType]) {
      return;
    }

    // Create a new node at the menu position
    const newNode = {
      ...DEFAULT_NODE[nodeType],
      position: nodeMenuPosition,
      id: `${nodeType}-${Date.now()}`
    };

    // Add the new node
    addElement(newNode);

    // Close menu
    handleCloseNodeMenu();

    // Show notification
    setNotification({
      open: true,
      message: `Added new ${nodeType.replace('Node', '')} node`,
      severity: 'success'
    });
  }, [nodeMenuPosition, addElement, handleCloseNodeMenu]);

  /**
   * Close notification
   */
  const handleCloseNotification = useCallback(() => {
    setNotification({
      ...notification,
      open: false
    });
  }, [notification]);
  return <Box sx={{
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column'
  }}>
      {/* Flow Canvas Toolbar */}
      <Paper elevation={1} sx={{
      width: '100%'
    }}>
        <Toolbar variant="dense">
          <Tooltip title="Add Node">
            <IconButton onClick={e => setNodeMenuAnchorEl(e.currentTarget)} disabled={readOnly}>

              <AddIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Delete Selected">
            <span>
              <IconButton onClick={handleDelete} disabled={readOnly || selectedElements.length === 0}>

                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{
          mx: 1
        }} />
          
          <Tooltip title="Undo">
            <span>
              <IconButton onClick={handleUndo} disabled={readOnly || historyIndex === 0}>

                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Redo">
            <span>
              <IconButton onClick={handleRedo} disabled={readOnly || historyIndex === history.length - 1}>

                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{
          mx: 1
        }} />
          
          <Tooltip title="Save Flow">
            <span>
              <IconButton onClick={handleSave} disabled={readOnly} color="primary">

                <SaveIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Validate Flow">
            <IconButton onClick={handleValidate} color="secondary">

              <PlayIcon />
            </IconButton>
          </Tooltip>
          
          <Box sx={{
          flexGrow: 1
        }} />
          
          <Tooltip title={readOnly ? "Read Only Mode" : "Edit Mode"}>
            <IconButton color={readOnly ? "error" : "success"}>
              {readOnly ? <LockIcon /> : <LockOpenIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Flow Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </Paper>
      
      {/* Flow Canvas */}
      <Box ref={reactFlowWrapper} sx={{
      flexGrow: 1,
      width: '100%',
      height: 'calc(100% - 48px)',
      '& .react-flow__node': {
        cursor: readOnly ? 'default' : 'move'
      }
    }}>

        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodesChange={changes => {
        setNodes(nds => {
          const updatedNodes = applyNodeChanges(changes, nds);
          return updatedNodes;
        });
      }} onEdgesChange={changes => {
        setEdges(edgs => {
          const updatedEdges = applyEdgeChanges(changes, edgs);
          return updatedEdges;
        });
      }} onConnect={onConnect} onSelectionChange={onElementsSelect} deleteKeyCode={46} // Delete key
      onInit={instance => {
        // Center the graph after loading
        instance.fitView({
          padding: 0.2
        });
      }} onDragOver={onDragOver} onDrop={onDrop} onContextMenu={handleContextMenu} snapToGrid={true} snapGrid={[15, 15]} defaultZoom={1} minZoom={0.1} maxZoom={1.5} style={defaultFlowStyle} selectionOnDrag={false} multiSelectionKeyCode="Control" selectionMode={1} elementsSelectable={!readOnly} nodesDraggable={!readOnly} nodesConnectable={!readOnly}>

          <Background variant="dots" gap={12} size={1} />

          <Controls showInteractive={false} />

          <MiniMap nodeColor={node => {
          // Color nodes based on their type
          if (node.type === 'sourceNode') return '#00c853';
          if (node.type === 'destinationNode') return '#2196f3';
          if (node.type === 'transformationNode') return '#ff9800';
          if (node.type === 'filterNode') return '#9c27b0';
          return '#999';
        }} />

        </ReactFlow>
      </Box>
      
      {/* Node Menu */}
      <Menu anchorEl={nodeMenuAnchorEl} open={Boolean(nodeMenuAnchorEl)} onClose={handleCloseNodeMenu}>

        <MenuItem onClick={() => handleAddNode('sourceNode')}>Add Source</MenuItem>
        <MenuItem onClick={() => handleAddNode('destinationNode')}>Add Destination</MenuItem>
        <MenuItem onClick={() => handleAddNode('transformationNode')}>Add Transformation</MenuItem>
        <MenuItem onClick={() => handleAddNode('filterNode')}>Add Filter</MenuItem>
      </Menu>
      
      {/* Notification */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={handleCloseNotification} anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left'
    }}>

        <Alert onClose={handleCloseNotification} severity={notification.severity} variant="filled">

          {notification.message}
        </Alert>
      </Snackbar>
    </Box>;
};
FlowCanvasContent.propTypes = {
  initialElements: PropTypes.array,
  readOnly: PropTypes.bool,
  onChange: PropTypes.func,
  onSave: PropTypes.func,
  onNodeSelect: PropTypes.func,
  onEdgeSelect: PropTypes.func,
  onValidate: PropTypes.func,
  validationErrors: PropTypes.object
};

/**
 * Flow Canvas wrapper with ReactFlowProvider
 */
const FlowCanvas = props => {
  const [formError, setFormError] = useState(null);
  return <ReactFlowProvider>
      <FlowCanvasContent {...props} />
    </ReactFlowProvider>;
};
export default FlowCanvas;