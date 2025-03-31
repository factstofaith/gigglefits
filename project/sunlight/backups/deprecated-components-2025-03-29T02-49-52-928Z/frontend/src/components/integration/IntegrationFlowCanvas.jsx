/**
 * @component IntegrationFlowCanvas
 * @description Enhanced and optimized canvas for building integration flows with industry-standard features.
 * Provides a visual interface for designing data integration pipelines with improved performance,
 * better connection handling, enhanced UX, and role-based feature access.
 *
 * Key features:
 * - Optimized rendering for large and complex flows
 * - Enhanced connection validation and visualization
 * - Improved node configuration experience with contextual panels
 * - Visual field mapping with drag-and-drop interface
 * - Live data preview during design
 * - Role-based access control (admin vs regular user features)
 * - Responsive design for different screen sizes
 * - Keyboard shortcuts for power users
 * - Autosave and version history
 *
 * @param {Object} props - Component properties
 * @param {Array} [props.initialNodes=[]] - Initial nodes to display on the canvas
 * @param {Array} [props.initialEdges=[]] - Initial edges (connections) between nodes
 * @param {Function} props.onSave - Callback when flow is saved
 * @param {Function} props.onRun - Callback when flow test is requested
 * @param {Function} [props.onNodesChange] - Callback when nodes are modified
 * @param {Function} [props.onEdgesChange] - Callback when edges are modified
 * @param {Object} [props.availableComponents={}] - Available component definitions by category
 * @param {boolean} [props.readOnly=false] - Whether the canvas is in read-only mode
 * @param {boolean} [props.isAdmin=false] - Whether the current user has admin privileges
 * @param {Object} [props.userPreferences={}] - User preferences for canvas behavior
 */

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
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
  useOnViewportChange,
} from '../../utils/reactFlowAdapter';
// CSS is now imported automatically via the adapter

// Import design system components through adapter layer
import { Box, Typography, Button, Grid, Stack, useTheme } from '../../design-system';

// Import hooks
import { useFlowOptimizer } from '@hooks/useFlowOptimizer';

// Still using Material UI components that need migration
import useMediaQuery from '@mui/material/useMediaQuery';

// Import icons
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import BugReportIcon from '@mui/icons-material/BugReport';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import StorageIcon from '@mui/icons-material/Storage';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TuneIcon from '@mui/icons-material/Tune';
import DatasetIcon from '@mui/icons-material/Dataset';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ApiIcon from '@mui/icons-material/Api';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import WebhookIcon from '@mui/icons-material/Webhook';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import HistoryIcon from '@mui/icons-material/History';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import FolderIcon from '@mui/icons-material/Folder';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchemaIcon from '@mui/icons-material/Schema';
import CodeIcon from '@mui/icons-material/Code';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SearchIcon from '@mui/icons-material/Search';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PhotoFilterIcon from '@mui/icons-material/PhotoFilter';
import PaletteIcon from '@mui/icons-material/Palette';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LoopIcon from '@mui/icons-material/Loop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Import custom node components and utilities
import { nodeTypes } from './nodes';
import OptimizedBaseNode from './nodes/OptimizedBaseNode';
import OptimizedEdge from './OptimizedEdge';
import EnhancedNodePalette from './EnhancedNodePalette';
import ContextualPropertiesPanel from './ContextualPropertiesPanel';
import ConnectionPropertiesPanel from './ConnectionPropertiesPanel';
import DatasetNodePropertiesPanel from './DatasetNodePropertiesPanel';
import ApplicationNodePropertiesPanel from './ApplicationNodePropertiesPanel';
import VisualFieldMapper from './VisualFieldMapper';
import DataPreviewPanel from './DataPreviewPanel';
import KeyboardShortcutsHelp from '../common/KeyboardShortcutsHelp';
import MiniMapNode from './MiniMapNode';
import TemplateBrowser from './TemplateBrowser';
import TemplateForm from './TemplateForm';
import HistoryPanel from './HistoryPanel';
import ValidationPanel from './ValidationPanel';
import DebugModePanel from './DebugModePanel';
import FlowPerformanceMonitor from './FlowPerformanceMonitor';
import { createFlowValidator } from '@utils/flowValidation';
import { optimizeLayout } from '@utils/layoutOptimizer';
import { useAutoSave } from '@hooks/useAutoSave';
import { useFlowHistory } from '@hooks/useFlowHistory';
import { useFlowValidation } from '@hooks/useFlowValidation';
import { useFlowTemplates } from '@hooks/useFlowTemplates';
import { useLiveDataPreview } from '@hooks/useLiveDataPreview';
import { useResponsiveCanvas } from '@hooks/useResponsiveCanvas';
import { useConnectionValidation } from '@hooks/useConnectionValidation';
import { Alert, Autocomplete, Badge, Chip, CircularProgress, ClickAwayListener, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, Fade, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Popper, Snackbar, SpeedDial, SpeedDialAction, SpeedDialIcon, Tab, Tabs, TextField, Tooltip, Zoom, useMediaQuery as muiUseMediaQuery } from '../../design-system';
// Design system import already exists;
// Removed duplicate import
// Component mapping for different node types
const componentIcons = {
  source: StorageIcon,
  api: ApiIcon,
  file: CloudUploadIcon,
  database: StorageIcon,
  transform: TuneIcon,
  filter: FilterAltIcon,
  map: CompareArrowsIcon,
  join: MergeTypeIcon,
  dataset: DatasetIcon,
  trigger: PlayCircleFilledIcon,
  router: CallSplitIcon,
  action: NotificationsIcon,
  webhook: WebhookIcon,
  condition: CallSplitIcon,
  destination: CloudUploadIcon,
};

// Shortcut key combinations
const KEYBOARD_SHORTCUTS = {
  undo: { key: 'z', ctrlKey: true },
  redo: { key: 'y', ctrlKey: true },
  save: { key: 's', ctrlKey: true },
  run: { key: 'r', ctrlKey: true },
  zoomIn: { key: '=', ctrlKey: true },
  zoomOut: { key: '-', ctrlKey: true },
  fitView: { key: '0', ctrlKey: true },
  delete: { key: 'Delete' },
  copy: { key: 'c', ctrlKey: true },
  paste: { key: 'v', ctrlKey: true },
  selectAll: { key: 'a', ctrlKey: true },
  help: { key: '?' },
  togglePalette: { key: 'p', ctrlKey: true },
  toggleProperties: { key: 'e', ctrlKey: true },
  toggleMinimap: { key: 'm', ctrlKey: true },
  togglePreview: { key: 'd', ctrlKey: true },
};

// Memoized custom edge types
const edgeTypes = {
  default: props => {
    return (
      <div>
        {/* Use custom edge rendering here */}
        Default Edge
      </div>
    );
  },
  optimized: OptimizedEdge
};

// Render performance optimization with custom mini-map renderer
const minimapNodeColor = node => {
  switch (node.type) {
    case 'sourceNode':
    case 'apiNode':
    case 'fileNode':
    case 'databaseNode':
      return '#2E7EED';
    case 'destinationNode':
      return '#27AE60';
    case 'transformNode':
    case 'filterNode':
    case 'mapNode':
    case 'joinNode':
      return '#F2994A';
    case 'datasetNode':
      return '#9B51E0';
    case 'triggerNode':
    case 'scheduleNode':
    case 'webhookNode':
      return '#EB5757';
    case 'routerNode':
    case 'forkNode':
    case 'conditionNode':
    case 'switchNode':
      return '#BB6BD9';
    case 'actionNode':
    case 'notificationNode':
    case 'functionNode':
      return '#F2C94C';
    default:
      return '#888888';
  }
};

// Main component
const IntegrationFlowCanvas = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
  onRun,
  onNodesChange,
  onEdgesChange,
  availableComponents = {},
  readOnly = false,
  isAdmin = false,
  userPreferences = {},
}) => {
  // Added display name
  IntegrationFlowCanvas.displayName = 'IntegrationFlowCanvas';

  // Added display name
  IntegrationFlowCanvas.displayName = 'IntegrationFlowCanvas';

  // Added display name
  IntegrationFlowCanvas.displayName = 'IntegrationFlowCanvas';

  // Added display name
  IntegrationFlowCanvas.displayName = 'IntegrationFlowCanvas';

  // Added display name
  IntegrationFlowCanvas.displayName = 'IntegrationFlowCanvas';


  // Material UI theme 
  const theme = useTheme();
  // Use theme.breakpoints for media queries
  const isMobile = muiUseMediaQuery(theme.breakpoints.down('md'));
  const isTablet = muiUseMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChangeOptimized] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeOptimized] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('palette');
  const [contextMenu, setContextMenu] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState(null);
  const [isAutoLayoutActive, setIsAutoLayoutActive] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // edit, preview, debug, readonly
  const [paletteExpanded, setPaletteExpanded] = useState(true);
  const [propertiesPanelExpanded, setPropertiesPanelExpanded] = useState(true);
  const [miniMapVisible, setMiniMapVisible] = useState(!isMobile);
  const [nodeSelectorOpen, setNodeSelectorOpen] = useState(false);
  const [nodeSelectorPosition, setNodeSelectorPosition] = useState({ x: 0, y: 0 });

  // Advanced hooks
  const { undo, redo, canUndo, canRedo, addHistoryItem } = useFlowHistory(nodes, edges);
  const { saveState, lastSaved, isSaving, setSaveState } = useAutoSave(nodes, edges, onSave);
  const { validateFlow, validationResults } = useFlowValidation();
  const { 
    getTemplates, 
    saveAsTemplate, 
    updateTemplate,
    deleteTemplate,
    duplicateTemplate
  } = useFlowTemplates();
  const { previewData, fetchPreviewData, previewLoading } = useLiveDataPreview();
  const { containerSize, handleResize } = useResponsiveCanvas();
  
  // Flow optimization for large flows
  const { 
    nodes: optimizedNodes, 
    edges: optimizedEdges,
    isOptimized,
    metrics: flowMetrics,
    batchedNodeChange,
    toggleOptimization
  } = useFlowOptimizer(
    nodes, 
    edges, 
    { x: 0, y: 0, zoom }, // Current viewport 
    containerSize,
    { enabled: userPreferences.enableOptimization !== false }  // Respect user preference
  );

  // Extract ReactFlow utilities
  const {
    project,
    getNodes,
    getEdges,
    fitView,
    zoomIn: rfZoomIn,
    zoomOut: rfZoomOut,
  } = useReactFlow();

  // Key press handlers for keyboard shortcuts
  const undoPressed = useKeyPress(KEYBOARD_SHORTCUTS.undo);
  const redoPressed = useKeyPress(KEYBOARD_SHORTCUTS.redo);
  const savePressed = useKeyPress(KEYBOARD_SHORTCUTS.save);
  const runPressed = useKeyPress(KEYBOARD_SHORTCUTS.run);
  const deletePressed = useKeyPress(KEYBOARD_SHORTCUTS.delete);
  const helpPressed = useKeyPress(KEYBOARD_SHORTCUTS.help);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (undoPressed && canUndo && !readOnly) undo();
  }, [undoPressed, canUndo, readOnly, undo]);

  useEffect(() => {
    if (redoPressed && canRedo && !readOnly) redo();
  }, [redoPressed, canRedo, readOnly, redo]);

  useEffect(() => {
    if (savePressed && !readOnly) handleSave();
  }, [savePressed, readOnly]);

  useEffect(() => {
    if (runPressed && !readOnly) handleRun();
  }, [runPressed, readOnly]);

  useEffect(() => {
    if (helpPressed) setShowKeyboardShortcuts(true);
  }, [helpPressed]);

  useEffect(() => {
    if (deletePressed && selectedElement && !readOnly) {
      if (selectedElement.type === 'node') {
        handleDeleteNode(selectedElement.id);
      } else if (selectedElement.type === 'edge') {
        handleDeleteEdge(selectedElement.id);
      }
    }
  }, [deletePressed, selectedElement, readOnly]);

  // Initialize nodes and edges with validation
  useEffect(() => {
    if (initialNodes.length > 0 || initialEdges.length > 0) {
      setNodes(initialNodes);
      setEdges(initialEdges);

      // Validate the initial flow
      setTimeout(() => {
        const results = validateFlow(initialNodes, initialEdges);
        setValidationErrors(results.errors);
      }, 500);
    }
  }, [initialNodes, initialEdges, validateFlow]);

  // Update zoom level when viewport changes
  useOnViewportChange({
    onStart: ({ zoom }) => setZoom(zoom),
    onChange: ({ zoom }) => setZoom(zoom),
    onEnd: ({ zoom }) => setZoom(zoom),
  });

  // Handle node selection
  const onNodeClick = useCallback(
    (event, node) => {
  // Added display name
  onNodeClick.displayName = 'onNodeClick';

      event.stopPropagation();
      setSelectedElement({ type: 'node', data: node, id: node.id });
      
      // If in debug mode, handle differently
      if (viewMode === 'debug') {
        // Just select the node for debug operations
        return;
      }
      
      // Normal mode behavior
      setActiveTab('properties');
      if (!propertiesPanelExpanded) {
        setPropertiesPanelExpanded(true);
      }
    },
    [propertiesPanelExpanded, viewMode]
  );

  // Handle edge selection
  const onEdgeClick = useCallback(
    (event, edge) => {
  // Added display name
  onEdgeClick.displayName = 'onEdgeClick';

      event.stopPropagation();
      setSelectedElement({ type: 'edge', data: edge, id: edge.id });
      setActiveTab('properties');
      if (!propertiesPanelExpanded) {
        setPropertiesPanelExpanded(true);
      }
    },
    [propertiesPanelExpanded]
  );

  // Handle deselection
  const onPaneClick = useCallback(() => {
  // Added display name
  onPaneClick.displayName = 'onPaneClick';

    setSelectedElement(null);
    setContextMenu(null);
  }, []);

  // Handle node drag
  const onNodeDragStart = useCallback((event, node) => {
  // Added display name
  onNodeDragStart.displayName = 'onNodeDragStart';

    // Track node being dragged
  }, []);

  // Handle context menu
  const onContextMenu = useCallback(
    event => {
  // Added display name
  onContextMenu.displayName = 'onContextMenu';

      event.preventDefault();

      if (readOnly) return;

      // Get the position in the canvas coordinates
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        canvasX: position.x,
        canvasY: position.y,
      });
    },
    [project, readOnly]
  );

  // Close context menu
  const handleCloseContextMenu = () => {
  // Added display name
  handleCloseContextMenu.displayName = 'handleCloseContextMenu';

  // Added display name
  handleCloseContextMenu.displayName = 'handleCloseContextMenu';

  // Added display name
  handleCloseContextMenu.displayName = 'handleCloseContextMenu';

  // Added display name
  handleCloseContextMenu.displayName = 'handleCloseContextMenu';

  // Added display name
  handleCloseContextMenu.displayName = 'handleCloseContextMenu';


    setContextMenu(null);
  };

  // Add a new node when quick-add is used
  const handleQuickAddNode = nodeTypeInfo => {
    if (!contextMenu || readOnly) return;

    const newNode = {
      id: `${nodeTypeInfo.type}-${Date.now()}`,
      type: nodeTypeInfo.type + 'Node',
      position: { x: contextMenu.canvasX, y: contextMenu.canvasY },
      data: {
        label: nodeTypeInfo.label,
        nodeType: nodeTypeInfo.type,
        tooltip: nodeTypeInfo.description,
        configData: {}, // Default configuration
        validation: { isValid: true, messages: [] },
        status: 'idle',
      },
    };

    setNodes(nds => [...nds, newNode]);
    handleCloseContextMenu();

    // Track changes for undo/redo
    addHistoryItem({
      nodes: [...getNodes(), newNode],
      edges: getEdges(),
    });

    // Select the newly added node
    setTimeout(() => {
      setSelectedElement({ type: 'node', data: newNode, id: newNode.id });
      setActiveTab('properties');
      setPropertiesPanelExpanded(true);
    }, 100);
  };

  // Update node properties
  const handleUpdateNode = useCallback(
    (nodeId, newData) => {
  // Added display name
  handleUpdateNode.displayName = 'handleUpdateNode';

      if (readOnly) return;

      setNodes(nds =>
        nds.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
                // Preserve node type and other core properties
                nodeType: node.data.nodeType,
              },
            };
          }
          return node;
        })
      );

      // Track changes for undo/redo
      addHistoryItem({
        nodes: getNodes().map(node =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData, nodeType: node.data.nodeType } }
            : node
        ),
        edges: getEdges(),
      });

      // Trigger validation
      setTimeout(() => {
        const results = validateFlow(getNodes(), getEdges());
        setValidationErrors(results.errors);
      }, 100);
    },
    [readOnly, addHistoryItem, getNodes, getEdges, validateFlow]
  );

  // Update edge properties
  const handleUpdateEdge = useCallback(
    (edgeId, newData) => {
  // Added display name
  handleUpdateEdge.displayName = 'handleUpdateEdge';

      if (readOnly) return;

      setEdges(eds =>
        eds.map(edge => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              ...newData,
              // Preserve core properties
              source: edge.source,
              target: edge.target,
            };
          }
          return edge;
        })
      );

      // Track changes for undo/redo
      addHistoryItem({
        nodes: getNodes(),
        edges: getEdges().map(edge =>
          edge.id === edgeId
            ? { ...edge, ...newData, source: edge.source, target: edge.target }
            : edge
        ),
      });
    },
    [readOnly, addHistoryItem, getNodes, getEdges]
  );

  // Delete a node and its connected edges
  const handleDeleteNode = useCallback(
    nodeId => {
  // Added display name
  handleDeleteNode.displayName = 'handleDeleteNode';

      if (readOnly) return;

      // Find all connected edges to this node
      const connectingEdges = getConnectedEdges([{ id: nodeId }], getEdges());
      const connectingEdgeIds = connectingEdges.map(edge => edge.id);

      setNodes(nds => nds.filter(node => node.id !== nodeId));
      setEdges(eds => eds.filter(edge => !connectingEdgeIds.includes(edge.id)));

      // Track changes for undo/redo
      addHistoryItem({
        nodes: getNodes().filter(node => node.id !== nodeId),
        edges: getEdges().filter(edge => !connectingEdgeIds.includes(edge.id)),
      });

      setSelectedElement(null);
    },
    [readOnly, getEdges, addHistoryItem, getNodes]
  );

  // Delete an edge
  const handleDeleteEdge = useCallback(
    edgeId => {
  // Added display name
  handleDeleteEdge.displayName = 'handleDeleteEdge';

      if (readOnly) return;

      setEdges(eds => eds.filter(edge => edge.id !== edgeId));

      // Track changes for undo/redo
      addHistoryItem({
        nodes: getNodes(),
        edges: getEdges().filter(edge => edge.id !== edgeId),
      });

      setSelectedElement(null);
    },
    [readOnly, addHistoryItem, getNodes, getEdges]
  );

  // Handle adding a new edge when connecting nodes
  const onConnect = useCallback(
    params => {
  // Added display name
  onConnect.displayName = 'onConnect';

      if (readOnly) return;

      // Create a new edge with animation
      const newEdge = {
        ...params,
        animated: true,
        data: {
          label: 'Connection',
        },
      };

      setEdges(eds => addEdge(newEdge, eds));

      // Track changes for undo/redo
      addHistoryItem({
        nodes: getNodes(),
        edges: [...getEdges(), newEdge],
      });

      // Validate the new connection
      setTimeout(() => {
        const results = validateFlow(getNodes(), getEdges());
        setValidationErrors(results.errors);
      }, 100);
    },
    [readOnly, addHistoryItem, getNodes, getEdges, validateFlow]
  );

  // Save the flow
  const handleSave = useCallback(() => {
  // Added display name
  handleSave.displayName = 'handleSave';

    if (readOnly) return;

    setLoading(true);

    // Validate before saving
    const results = validateFlow(getNodes(), getEdges());
    setValidationErrors(results.errors);

    if (results.errors.length > 0) {
      setError('Cannot save flow with validation errors');
      setLoading(false);
      return;
    }

    // Attempt to save
    try {
      onSave({ nodes: getNodes(), edges: getEdges() });
      setSuccess('Flow saved successfully');
      setSaveState(Date.now());
    } catch (err) {
      setError('Failed to save flow: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [readOnly, validateFlow, getNodes, getEdges, onSave, setSaveState]);

  // Run/test the flow
  const handleRun = useCallback(() => {
  // Added display name
  handleRun.displayName = 'handleRun';

    if (readOnly) return;

    setLoading(true);

    // Validate before running
    const results = validateFlow(getNodes(), getEdges());
    setValidationErrors(results.errors);

    if (results.errors.length > 0) {
      setError('Cannot run flow with validation errors');
      setLoading(false);
      return;
    }

    // Attempt to run
    try {
      onRun({ nodes: getNodes(), edges: getEdges() });
      setSuccess('Flow test started');
    } catch (err) {
      setError('Failed to run flow: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [readOnly, validateFlow, getNodes, getEdges, onRun]);

  // Auto-arrange the flow
  const handleAutoLayout = useCallback(() => {
  // Added display name
  handleAutoLayout.displayName = 'handleAutoLayout';

    if (readOnly) return;

    setIsAutoLayoutActive(true);

    setTimeout(() => {
      try {
        const optimizedNodes = optimizeLayout(getNodes(), getEdges());
        setNodes(optimizedNodes);

        // Track changes for undo/redo
        addHistoryItem({
          nodes: optimizedNodes,
          edges: getEdges(),
        });

        setSuccess('Flow layout optimized');
        fitView({ padding: 0.2 });
      } catch (err) {
        setError('Failed to optimize layout: ' + err.message);
      } finally {
        setIsAutoLayoutActive(false);
      }
    }, 100);
  }, [readOnly, getNodes, getEdges, addHistoryItem, fitView]);

  // Toggle debug mode
  const handleToggleDebugMode = useCallback(() => {
  // Added display name
  handleToggleDebugMode.displayName = 'handleToggleDebugMode';

    setDebugMode(!debugMode);
    setViewMode(prevMode => (prevMode === 'debug' ? 'edit' : 'debug'));
    
    // Reset selected element when entering debug mode
    if (!debugMode) {
      setSelectedElement(null);
    }
  }, [debugMode]);

  // Handle drawer open/close
  const handleDrawerToggle = useCallback(() => {
  // Added display name
  handleDrawerToggle.displayName = 'handleDrawerToggle';

    setDrawerOpen(!drawerOpen);
  }, [drawerOpen]);

  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

    setActiveTab(newValue);
  }, []);

  // Clear errors and success messages
  const handleClearMessages = useCallback(() => {
  // Added display name
  handleClearMessages.displayName = 'handleClearMessages';

    setError(null);
    setSuccess(null);
  }, []);

  // Add next node
  const handleAddNextNode = useCallback(
    (sourceNodeId, nodeType) => {
  // Added display name
  handleAddNextNode.displayName = 'handleAddNextNode';

      if (readOnly) return;

      // Find the source node
      const sourceNode = getNodes().find(node => node.id === sourceNodeId);
      if (!sourceNode) return;

      // Create a new node positioned to the right of the source node
      const newNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType + 'Node',
        position: {
          x: sourceNode.position.x + 250,
          y: sourceNode.position.y,
        },
        data: {
          label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
          nodeType: nodeType,
          tooltip: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} node`,
          configData: {}, // Default configuration
          validation: { isValid: true, messages: [] },
          status: 'idle',
        },
      };

      // Create a connection between the source node and the new node
      const newEdge = {
        id: `edge-${sourceNodeId}-${newNode.id}`,
        source: sourceNodeId,
        target: newNode.id,
        animated: true,
        data: {
          label: 'Connection',
        },
      };

      setNodes(nds => [...nds, newNode]);
      setEdges(eds => [...eds, newEdge]);

      // Track changes for undo/redo
      addHistoryItem({
        nodes: [...getNodes(), newNode],
        edges: [...getEdges(), newEdge],
      });

      // Select the newly added node
      setTimeout(() => {
        setSelectedElement({ type: 'node', data: newNode, id: newNode.id });
        setActiveTab('properties');
        setPropertiesPanelExpanded(true);
      }, 100);
    },
    [readOnly, getNodes, getEdges, addHistoryItem]
  );

  // Apply a template to the canvas
  const handleApplyTemplate = useCallback(
    template => {
  // Added display name
  handleApplyTemplate.displayName = 'handleApplyTemplate';

      if (readOnly) return;

      // Confirm before replacing the current flow
      if (getNodes().length > 0) {
        if (!window.confirm('This will replace your current flow. Continue?')) {
          return;
        }
      }

      try {
        const { nodes: templateNodes, edges: templateEdges } = template;

        // Apply template to canvas
        setNodes(templateNodes);
        setEdges(templateEdges);

        // Track changes for undo/redo
        addHistoryItem({
          nodes: templateNodes,
          edges: templateEdges,
        });

        setSuccess('Template applied successfully');
        setShowTemplateGallery(false);

        // Fit the view to show the entire template
        setTimeout(() => {
          fitView({ padding: 0.2 });
        }, 100);
      } catch (err) {
        setError('Failed to apply template: ' + err.message);
      }
    },
    [readOnly, getNodes, addHistoryItem, fitView]
  );

  // Export flow as template
  const handleExportTemplate = useCallback(() => {
  // Added display name
  handleExportTemplate.displayName = 'handleExportTemplate';

    if (readOnly || getNodes().length === 0) return;

    try {
      // Generate suggested template name from nodes
      const mainNodes = getNodes().filter(
        n => n.type === 'sourceNode' || n.type === 'destinationNode' || n.type === 'triggerNode'
      );

      let templateName = 'Custom Flow';
      if (mainNodes.length > 0) {
        templateName = `${mainNodes[0]?.data?.label || 'Source'} to ${
          mainNodes[mainNodes.length - 1]?.data?.label || 'Destination'
        }`;
      }

      // Set initial values for the template form
      setTemplateToEdit({
        name: templateName,
        description: `Custom template created by user`,
        category: 'Custom',
        tags: []
      });
      
      // Show template form dialog
      setShowTemplateForm(true);
    } catch (err) {
      setError('Failed to prepare template: ' + err.message);
    }
  }, [readOnly, getNodes, getEdges]);
  
  // Handle saving the template from form submission
  const handleSaveTemplateForm = useCallback((templateData) => {
  // Added display name
  handleSaveTemplateForm.displayName = 'handleSaveTemplateForm';

    try {
      // Save template with form data and current nodes/edges
      saveAsTemplate({
        ...templateData,
        nodes: getNodes(),
        edges: getEdges(),
      });

      setSuccess('Flow exported as template');
      setShowTemplateForm(false);
      setTemplateToEdit(null);
    } catch (err) {
      setError('Failed to save template: ' + err.message);
    }
  }, [getNodes, getEdges, saveAsTemplate]);

  // Visual mapper for field connections
  const handleOpenVisualMapper = useCallback(() => {
  // Added display name
  handleOpenVisualMapper.displayName = 'handleOpenVisualMapper';

    // Logic to open visual mapper
    // This would typically show a dialog or expand a panel
  }, []);

  // Memoize zoom controls to prevent unnecessary re-renders
  const zoomControls = useMemo(
    () => (
      <Stack
        direction="row&quot;
        spacing={1}
        sx={{
          position: "absolute',
          right: isMobile ? 16 : 90,
          bottom: 16,
          zIndex: 100,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          boxShadow: 1,
        }}
      >
        <Tooltip title="Zoom Out (Ctrl+-)&quot;>
          <IconButton size="small" onClick={() => rfZoomOut()} disabled={zoom <= 0.25}>
            <ZoomOutIcon fontSize="small&quot; />
          </IconButton>
        </Tooltip>

        <Typography variant="body2" sx={{ lineHeight: '28px' }}>
          {Math.round(zoom * 100)}%
        </Typography>

        <Tooltip title="Zoom In (Ctrl+=)&quot;>
          <IconButton size="small" onClick={() => rfZoomIn()} disabled={zoom >= 2}>
            <ZoomInIcon fontSize="small&quot; />
          </IconButton>
        </Tooltip>

        <Tooltip title="Fit View (Ctrl+0)">
          <IconButton size="small&quot; onClick={() => fitView({ padding: 0.2 })}>
            <FitScreenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
    [zoom, rfZoomIn, rfZoomOut, fitView, isMobile]
  );

  // Memoize the action buttons to prevent unnecessary re-renders
  const actionButtons = useMemo(
    () => (
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={1}
        sx={{
          position: 'absolute',
          left: isMobile ? 'auto' : 300,
          right: isMobile ? 16 : 'auto',
          top: isMobile ? 'auto' : 16,
          bottom: isMobile ? 70 : 'auto',
          zIndex: 100,
        }}
      >
        {!readOnly && (
          <>
            <Button
              variant="contained&quot;
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading || isSaving}
              size={isMobile ? 'small' : 'medium'}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

            <Button
              variant="contained&quot;
              color="secondary"
              startIcon={<PlayArrowIcon />}
              onClick={handleRun}
              disabled={loading || validationErrors.length > 0}
              size={isMobile ? 'small' : 'medium'}
            >
              Test Flow
            </Button>

            {isAdmin && (
              <Button
                variant="outlined&quot;
                startIcon={<AutoAwesomeIcon />}
                onClick={handleAutoLayout}
                disabled={loading || isAutoLayoutActive || getNodes().length < 2}
                size={isMobile ? "small' : 'medium'}
              >
                {isAutoLayoutActive ? <CircularProgress size={24} /> : 'Auto Layout'}
              </Button>
            )}

            <Tooltip title="Debug Mode&quot;>
              <IconButton
                color={debugMode ? "primary' : 'default'}
                onClick={handleToggleDebugMode}
                sx={{ bgcolor: 'white', boxShadow: 1 }}
                size={isMobile ? 'small' : 'medium'}
              >
                <BugReportIcon />
              </IconButton>
            </Tooltip>

            <Badge
              badgeContent={validationErrors.length}
              color="error&quot;
              overlap="circular"
              invisible={validationErrors.length === 0}
            >
              <Tooltip title={validationErrors.length > 0 ? 'Validation Errors' : 'Flow is Valid'}>
                <IconButton
                  color={validationErrors.length > 0 ? 'error' : 'success'}
                  onClick={() => setActiveTab('validation')}
                  sx={{ bgcolor: 'white', boxShadow: 1 }}
                  size={isMobile ? 'small' : 'medium'}
                >
                  {validationErrors.length > 0 ? <ErrorIcon /> : <CheckCircleIcon />}
                </IconButton>
              </Tooltip>
            </Badge>

            <Tooltip title="Keyboard Shortcuts&quot;>
              <IconButton
                onClick={() => setShowKeyboardShortcuts(true)}
                sx={{ bgcolor: "white', boxShadow: 1 }}
                size={isMobile ? 'small' : 'medium'}
              >
                <KeyboardIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    ),
    [
      readOnly,
      loading,
      isSaving,
      validationErrors.length,
      debugMode,
      isAdmin,
      isAutoLayoutActive,
      getNodes,
      handleSave,
      handleRun,
      handleToggleDebugMode,
      handleAutoLayout,
      isMobile,
    ]
  );

  // Canvas customization settings
  const panelStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.background.paper || '#ffffff',
      borderRadius: theme.shape?.borderRadius || '4px',
      boxShadow: theme.shadows?.[3] || '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    }),
    [theme]
  );

  // Handle node palette drag start
  const onDragStart = useCallback((event, nodeType, definition) => {
  // Added display name
  onDragStart.displayName = 'onDragStart';

    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('node/definition', JSON.stringify(definition));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle node drop
  const onDrop = useCallback(
    event => {
  // Added display name
  onDrop.displayName = 'onDrop';

      event.preventDefault();

      if (readOnly || !reactFlowInstance) return;

      const nodeType = event.dataTransfer.getData('application/reactflow');
      const definition = JSON.parse(event.dataTransfer.getData('node/definition') || '{}');

      // Check if the dropped element is a valid node type
      if (!nodeType) return;

      // Get the position where the node is dropped
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Create a new node
      const newNode = {
        id: `${nodeType}-${Date.now()}`,
        type: nodeType + 'Node',
        position,
        data: {
          label: definition.label || nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
          nodeType,
          tooltip: definition.description || '',
          configData: {}, // Default configuration
          validation: { isValid: true, messages: [] },
          status: 'idle',
        },
      };

      setNodes(nds => [...nds, newNode]);

      // Track changes for undo/redo
      addHistoryItem({
        nodes: [...getNodes(), newNode],
        edges: getEdges(),
      });

      // Select the newly added node
      setTimeout(() => {
        setSelectedElement({ type: 'node', data: newNode, id: newNode.id });
        setActiveTab('properties');
        setPropertiesPanelExpanded(true);
      }, 100);
    },
    [readOnly, reactFlowInstance, addHistoryItem, getNodes, getEdges]
  );

  // Handle drag over
  const onDragOver = useCallback(event => {
  // Added display name
  onDragOver.displayName = 'onDragOver';

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Memoize the panels to prevent unnecessary re-renders
  const renderPanels = useMemo(() => {
  // Added display name
  renderPanels.displayName = 'renderPanels';

    return (
      <>
        {/* Left Panel - Node Palette */}
        <Drawer
          variant={isMobile ? 'temporary' : 'persistent'}
          anchor="left&quot;
          open={paletteExpanded || drawerOpen}
          onClose={() => (isMobile ? setDrawerOpen(false) : setPaletteExpanded(false))}
          sx={{
            width: 280,
            flexShrink: 0,
            "& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              zIndex: theme.zIndex?.drawer || 1200,
            },
          }}
        >
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable&quot;
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Nodes&quot; value="palette" />
              <Tab label="Properties&quot; value="properties" disabled={!selectedElement} />
              <Tab label="Connections&quot; value="connections" disabled={!(selectedElement && selectedElement.type === 'node')} />
              <Tab label="Validation&quot; value="validation" />
              {debugMode && <Tab label="Debug&quot; value="debug" />}
              {isAdmin && <Tab label="Templates&quot; value="templates" />}
            </Tabs>

            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
              {activeTab === 'palette' && (
                <EnhancedNodePalette
                  components={availableComponents}
                  onDragStart={onDragStart}
                  onNodeSelect={handleQuickAddNode}
                  isAdmin={isAdmin}
                />
              )}

              {activeTab === 'properties' && selectedElement && (
                <>
                  {/* Render specialized property panels based on node type */}
                  {selectedElement.type === 'node' && selectedElement.data.type === 'datasetNode' ? (
                    <DatasetNodePropertiesPanel
                      nodeData={selectedElement.data}
                      onUpdateNode={(newData) => handleUpdateNode(selectedElement.id, newData)}
                      integrationId={integrationId}
                      readOnly={readOnly}
                      isAdmin={isAdmin}
                    />
                  ) : selectedElement.type === 'node' && selectedElement.data.type === 'applicationNode' ? (
                    <ApplicationNodePropertiesPanel
                      nodeData={selectedElement.data}
                      onUpdateNode={(newData) => handleUpdateNode(selectedElement.id, newData)}
                      readOnly={readOnly}
                      isAdmin={isAdmin}
                      availableDatasets={availableDatasets || []}
                    />
                  ) : (
                    /* Default to the contextual properties panel for other element types */
                    <ContextualPropertiesPanel
                      element={selectedElement}
                      onNodeUpdate={handleUpdateNode}
                      onEdgeUpdate={handleUpdateEdge}
                      onDeleteNode={handleDeleteNode}
                      onDeleteEdge={handleDeleteEdge}
                      onAddNextNode={handleAddNextNode}
                      onOpenVisualMapper={handleOpenVisualMapper}
                      readOnly={readOnly}
                      isAdmin={isAdmin}
                    />
                  )}
                </>
              )}
              
              {activeTab === 'connections' && selectedElement && selectedElement.type === 'node' && (
                <ConnectionPropertiesPanel
                  nodeData={selectedElement.data}
                  onSaveConnectionConfig={(config) => {
                    handleUpdateNode(selectedElement.id, {
                      inputConnections: config.inputConnections,
                      outputConnections: config.outputConnections
                    });
                  }}
                  nodeType={selectedElement.data.nodeType || 'Node'}
                  readOnly={readOnly}
                  loading={loading}
                  error={error}
                />
              )}

              {activeTab === 'validation' && (
                <ValidationPanel
                  validationErrors={validationErrors}
                  onSelectNode={nodeId => {
                    const node = getNodes().find(n => n.id === nodeId);
                    if (node) {
                      setSelectedElement({ type: 'node', data: node, id: nodeId });
                      setActiveTab('properties');
                    }
                  }}
                />
              )}

              {activeTab === 'debug' && debugMode && (
                <Box>
                  <Typography variant="subtitle1&quot; gutterBottom>
                    Debug Controls
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Click the Debug Mode button in the canvas to activate step-by-step execution.
                  </Typography>
                  <DataPreviewPanel
                    nodes={nodes}
                    edges={edges}
                    previewData={previewData}
                    onFetchPreview={fetchPreviewData}
                    loading={previewLoading}
                  />
                </Box>
              )}

              {activeTab === 'templates' && isAdmin && (
                <TemplateBrowser
                  onApplyTemplate={handleApplyTemplate}
                  onExportTemplate={handleExportTemplate}
                  templates={getTemplates()}
                  onUpdateTemplate={updateTemplate}
                  onDeleteTemplate={deleteTemplate}
                  onDuplicateTemplate={duplicateTemplate}
                />
              )}
            </Box>

            {/* Bottom panel controls */}
            <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
              {!isMobile && (
                <Button
                  fullWidth
                  variant="outlined&quot;
                  startIcon={paletteExpanded ? <CloseIcon /> : <TuneIcon />}
                  onClick={() => setPaletteExpanded(!paletteExpanded)}
                  size="small"
                >
                  {paletteExpanded ? 'Hide Panel' : 'Show Panel'}
                </Button>
              )}
            </Box>
          </Box>
        </Drawer>

        {/* Quick access palette toggle button for mobile */}
        {isMobile && !drawerOpen && (
          <Tooltip title="Open Tools Panel&quot;>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                position: "absolute',
                top: 16,
                left: 16,
                zIndex: 100,
                bgcolor: 'white',
                boxShadow: 3,
              }}
            >
              <TuneIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* History Controls */}
        <Stack
          direction="row&quot;
          spacing={1}
          sx={{
            position: "absolute',
            left: isMobile ? 16 : paletteExpanded ? 300 : 40,
            top: 16,
            zIndex: 100,
            transition: 'left 0.3s ease',
          }}
        >
          <Tooltip title="Undo (Ctrl+Z)&quot;>
            <span>
              <IconButton
                onClick={undo}
                disabled={!canUndo || readOnly}
                sx={{ bgcolor: "white', boxShadow: 1 }}
                size={isMobile ? 'small' : 'medium'}
              >
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Redo (Ctrl+Y)&quot;>
            <span>
              <IconButton
                onClick={redo}
                disabled={!canRedo || readOnly}
                sx={{ bgcolor: "white', boxShadow: 1 }}
                size={isMobile ? 'small' : 'medium'}
              >
                <RedoIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Quick add node menu */}
        <Menu
          open={Boolean(contextMenu)}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition&quot;
          anchorPosition={contextMenu ? { top: contextMenu.y, left: contextMenu.x } : undefined}
        >
          <MenuItem disabled>
            <Typography variant="subtitle2">Add Node</Typography>
          </MenuItem>
          <Divider />

          {/* Create menu items for each node category */}
          {Object.keys(availableComponents).map(category => (
            <React.Fragment key={category}>
              <MenuItem disabled>
                <Typography variant="caption&quot; color="textSecondary">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
              </MenuItem>

              {availableComponents[category].map(component => {
                const Icon = componentIcons[component.type] || StorageIcon;

                return (
                  <MenuItem
                    key={component.type}
                    onClick={() => handleQuickAddNode(component)}
                    dense
                  >
                    <ListItemIcon>
                      <Icon fontSize="small&quot; />
                    </ListItemIcon>
                    <ListItemText primary={component.label} />
                  </MenuItem>
                );
              })}
            </React.Fragment>
          ))}
        </Menu>

        {/* Notifications */}
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={handleClearMessages}
          anchorOrigin={{ vertical: "top', horizontal: 'center' }}
        >
          <Alert severity="error&quot; onClose={handleClearMessages}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={Boolean(success)}
          autoHideDuration={3000}
          onClose={handleClearMessages}
          anchorOrigin={{ vertical: "top', horizontal: 'center' }}
        >
          <Alert severity="success&quot; onClose={handleClearMessages}>
            {success}
          </Alert>
        </Snackbar>

        {/* Auto-save indicator */}
        {lastSaved && (
          <Chip
            label={`Last saved: ${new Date(lastSaved).toLocaleTimeString()}`}
            size="small"
            color="primary&quot;
            variant="outlined"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 100,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
            }}
          />
        )}

        {/* Keyboard shortcuts dialog */}
        <KeyboardShortcutsHelp
          open={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
          shortcuts={[
            { combo: 'Ctrl + Z', description: 'Undo last action' },
            { combo: 'Ctrl + Y', description: 'Redo undone action' },
            { combo: 'Ctrl + S', description: 'Save flow' },
            { combo: 'Ctrl + R', description: 'Run/test flow' },
            { combo: 'Delete', description: 'Delete selected node/edge' },
            { combo: 'Ctrl + +', description: 'Zoom in' },
            { combo: 'Ctrl + -', description: 'Zoom out' },
            { combo: 'Ctrl + 0', description: 'Fit view to screen' },
            { combo: 'Ctrl + P', description: 'Toggle node palette' },
            { combo: 'Ctrl + E', description: 'Toggle properties panel' },
            { combo: 'Ctrl + D', description: 'Toggle debug mode' },
            { combo: '?', description: 'Show keyboard shortcuts' },
            { combo: 'Performance', description: 'Large flows are automatically optimized for performance. You can toggle optimization in the bottom left monitor.' },
          ]}
        />

        {/* Template gallery dialog */}
        <Dialog
          open={showTemplateGallery}
          onClose={() => setShowTemplateGallery(false)}
          fullWidth
          maxWidth="md&quot;
        >
          <DialogTitle>
            Template Gallery
            <IconButton
              onClick={() => setShowTemplateGallery(false)}
              sx={{ position: "absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <TemplateBrowser
              onApplyTemplate={template => {
                handleApplyTemplate(template);
                setShowTemplateGallery(false);
              }}
              onExportTemplate={handleExportTemplate}
              templates={getTemplates()}
              onUpdateTemplate={updateTemplate}
              onDeleteTemplate={deleteTemplate}
              onDuplicateTemplate={duplicateTemplate}
              asDialog
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setShowTemplateGallery(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* Template form dialog */}
        <TemplateForm
          open={showTemplateForm}
          onClose={() => {
            setShowTemplateForm(false);
            setTemplateToEdit(null);
          }}
          onSave={handleSaveTemplateForm}
          initialValues={templateToEdit || {}}
          categories={getTemplates().map(t => t.category).filter((c, i, arr) => arr.indexOf(c) === i)}
          editMode={false}
        />
      </>
    );
  }, [
    paletteExpanded,
    drawerOpen,
    activeTab,
    selectedElement,
    contextMenu,
    error,
    success,
    lastSaved,
    debugMode,
    canUndo,
    canRedo,
    validationErrors,
    showKeyboardShortcuts,
    showTemplateGallery,
    showTemplateForm,
    templateToEdit,
    isMobile,
    readOnly,
    isAdmin,
    theme,
    previewData,
    previewLoading,
    availableComponents,
    handleTabChange,
    onDragStart,
    handleQuickAddNode,
    handleUpdateNode,
    handleUpdateEdge,
    handleDeleteNode,
    handleDeleteEdge,
    handleAddNextNode,
    handleOpenVisualMapper,
    fetchPreviewData,
    getTemplates,
    handleApplyTemplate,
    handleExportTemplate,
    handleSaveTemplateForm,
    handleDrawerToggle,
    handleCloseContextMenu,
    handleClearMessages,
    undo,
    redo,
    getNodes,
  ]);

  // Main component render
  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors?.background?.default || '#f5f5f5',
      }}
      ref={handleResize}
    >
      {/* Action buttons */}
      {actionButtons}

      {/* Canvas */}
      <Box
        style={{
          flexGrow: 1,
          position: 'relative',
          height: containerSize.height,
          width: containerSize.width,
        }}
        ref={reactFlowWrapper}
      >
        <ReactFlowProvider>
          <ReactFlow
            nodes={isOptimized ? optimizedNodes : nodes}
            edges={isOptimized ? optimizedEdges : edges}
            onNodesChange={readOnly ? null : (changes) => {
              // Apply optimized changes if optimization is enabled
              if (isOptimized) {
                const batchedChanges = batchedNodeChange(changes);
                onNodesChangeOptimized(batchedChanges);
              } else {
                onNodesChangeOptimized(changes);
              }
            }}
            onEdgesChange={readOnly ? null : onEdgesChangeOptimized}
            onConnect={readOnly ? null : onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodeDragStart={onNodeDragStart}
            onContextMenu={onContextMenu}
            nodeTypes={{
              ...nodeTypes,
              optimizedNode: OptimizedBaseNode
            }}
            edgeTypes={edgeTypes}
            deleteKeyCode={null} // Disable default delete to use custom handler
            multiSelectionKeyCode={['Meta', 'Shift']}
            selectionOnDrag
            snapToGrid
            snapGrid={[15, 15]}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.25}
            maxZoom={2}
            style={{ background: theme.colors?.background?.default || '#f5f5f5' }}
            connectionLineStyle={{ stroke: '#555', strokeWidth: 2 }}
            connectionLineType="smoothstep&quot;
            defaultMarkerColor="#555"
            zoomOnScroll={!isMobile}
            panOnScroll={isMobile}
            panOnDrag={!isMobile}
            selectionMode="partial&quot;
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable={!readOnly}
            proOptions={{ hideAttribution: true }}
          >
            {/* Canvas background patterns */}
            <Background variant="dots" gap={24} size={1} color={theme.colors?.divider || '#e0e0e0'} />

            {/* Canvas controls */}
            <Controls
              showInteractive={!isMobile}
              position="bottom-right&quot;
              style={{
                marginBottom: 80,
                marginRight: 16,
              }}
            />

            {/* MiniMap */}
            {miniMapVisible && (
              <MiniMap
                nodeStrokeColor={n => minimapNodeColor(n)}
                nodeColor={n => minimapNodeColor(n)}
                nodeBorderRadius={2}
                maskColor="rgba(255, 255, 255, 0.6)"
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  backgroundColor: theme.colors?.background?.paper || '#ffffff',
                  border: `1px solid ${theme.colors?.divider || '#e0e0e0'}`,
                  borderRadius: theme.shape?.borderRadius || '4px',
                  width: isMobile ? 120 : 180,
                  height: isMobile ? 80 : 120,
                }}
              />
            )}

            {/* Zoom controls */}
            {zoomControls}

            {/* Performance monitor */}
            <FlowPerformanceMonitor
              metrics={flowMetrics}
              isOptimized={isOptimized}
              visibleNodeCount={isOptimized ? optimizedNodes.length : nodes.length}
              visibleEdgeCount={isOptimized ? optimizedEdges.length : edges.length}
              totalNodeCount={nodes.length}
              totalEdgeCount={edges.length}
              onToggleOptimization={toggleOptimization}
              loading={loading}
            />

            {/* Custom Panels */}
            {renderPanels}

            {/* Debug Mode Panel */}
            {viewMode === 'debug' && (
              <DebugModePanel
                flowData={{ nodes, edges }}
                onNodeSelected={(nodeId) => {
                  const node = nodes.find(n => n.id === nodeId);
                  if (node) {
                    setSelectedElement({ type: 'node', data: node, id: nodeId });
                  }
                }}
                onDebugExit={handleToggleDebugMode}
                onStepChange={(stepData) => {
                  // Set feedback/status for step execution
                  setSuccess(`Executing step ${stepData.step + 1}: ${stepData.nodeName}`);
                  setTimeout(() => setSuccess(null), 2000);
                }}
                height="100%&quot;
                width={isMobile ? "100%' : '400px'}
                position="right&quot;
              />
            )}
            
            {/* Loading overlay */}
            {loading && (
              <Box
                sx={{
                  position: "absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 1000,
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
    </Box>
  );
};

export default React.memo(IntegrationFlowCanvas);
