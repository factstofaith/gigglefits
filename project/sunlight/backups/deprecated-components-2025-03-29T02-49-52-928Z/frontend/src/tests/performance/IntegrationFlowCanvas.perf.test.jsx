/**
 * Performance test for IntegrationFlowCanvas component
 * 
 * This test measures render times and interaction performance for the
 * IntegrationFlowCanvas component under different load conditions.
 */

import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { setupUserEvent } from '../utils/user-event-setup';
import IntegrationFlowCanvas from '@components/integration/IntegrationFlowCanvas';

// Mock the design system components
jest.mock('../../design-system/components/layout/Box', () => ({
  Box: ({ children, style, ...props }) => (
    <div data-testid="mock-box" style={style} {...props}>
      {children}
    </div>
  ),
}));

jest.mock('../../design-system/components/layout/Grid', () => ({
  Grid: ({ children, ...props }) => (
    <div data-testid="mock-grid" {...props}>
      {children}
    </div>
  ),
}));

jest.mock('../../design-system/components/core/Typography', () => ({
  Typography: ({ children, variant, style, ...props }) => (
    <span data-testid={`mock-typography-${variant}`} style={style} {...props}>
      {children}
    </span>
  ),
}));

jest.mock('../../design-system/components/core/Button', () => ({
  Button: ({ children, onClick, startIcon, ...props }) => (
    <button data-testid="mock-button" onClick={onClick} {...props}>
      {startIcon && <span>{startIcon}</span>}
      {children}
    </button>
  ),
}));

jest.mock('../../design-system/foundations/theme', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
        divider: '#e0e0e0',
        text: {
          primary: '#000000',
          secondary: '#666666',
        },
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#dc004e',
        },
        error: {
          main: '#f44336',
        },
        warning: {
          main: '#ff9800',
        },
        info: {
          main: '#2196f3',
        },
        success: {
          main: '#4caf50',
        },
      },
      shadows: {
        1: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
        3: '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
      },
      shape: {
        borderRadius: 4,
      },
      zIndex: {
        drawer: 1200,
      },
    },
  }),
}));

// React Flow needs more extensive mocking
jest.mock('reactflow', () => {
  const ReactFlowMock = ({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onInit,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    children,
  }) => (
    <div data-testid="mock-react-flow">
      {children}
      <div data-testid="mock-nodes">
        {nodes.map(node => (
          <div
            key={node.id}
            data-testid={`node-${node.id}`}
            onClick={e => onNodeClick && onNodeClick(e, node)}
          >
            {node.data.label}
          </div>
        ))}
      </div>
      <div data-testid="mock-edges">
        {edges.map(edge => (
          <div
            key={edge.id}
            data-testid={`edge-${edge.id}`}
            onClick={e => onEdgeClick && onEdgeClick(e, edge)}
          >
            {edge.source} → {edge.target}
          </div>
        ))}
      </div>
    </div>
  );

  return {
    ReactFlowProvider: ({ children }) => <div>{children}</div>,
    Background: () => <div data-testid="mock-background" />,
    Controls: () => <div data-testid="mock-controls" />,
    MiniMap: () => <div data-testid="mock-minimap" />,
    Panel: ({ children }) => <div data-testid="mock-panel">{children}</div>,
    useNodesState: initialNodes => {
      const [nodes, setNodes] = React.useState(initialNodes);
      const onNodesChange = changes => {
        // Simple implementation for testing
        setNodes(prevNodes => {
          // Apply basic node changes
          return prevNodes.map(node => {
            const change = changes.find(c => c.id === node.id);
            if (change) {
              return { ...node, ...change.data };
            }
            return node;
          });
        });
      };
      return [nodes, setNodes, onNodesChange];
    },
    useEdgesState: initialEdges => {
      const [edges, setEdges] = React.useState(initialEdges);
      const onEdgesChange = changes => {
        setEdges(prevEdges => {
          return prevEdges.map(edge => {
            const change = changes.find(c => c.id === edge.id);
            if (change) {
              return { ...edge, ...change.data };
            }
            return edge;
          });
        });
      };
      return [edges, setEdges, onEdgesChange];
    },
    addEdge: (edge, edges) => [...edges, edge],
    getConnectedEdges: (nodes, edges) => {
      const nodeIds = nodes.map(n => n.id);
      return edges.filter(
        e => nodeIds.includes(e.source) || nodeIds.includes(e.target)
      );
    },
    useReactFlow: () => ({
      project: coords => coords,
      getNodes: () => [],
      getEdges: () => [],
      fitView: () => {},
      zoomIn: () => {},
      zoomOut: () => {},
    }),
    useKeyPress: () => false,
    useOnViewportChange: () => {},
    ReactFlow: ReactFlowMock,
  };
});

// Mock Material-UI components
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useTheme: () => ({
      breakpoints: {
        down: () => false,
        between: () => false,
      },
    }),
    useMediaQuery: () => false,
    Menu: ({ children, open, onClose }) => (
      open ? <div data-testid="mock-menu">{children}</div> : null
    ),
    MenuItem: ({ children, onClick, disabled }) => (
      <div data-testid="mock-menu-item" onClick={disabled ? undefined : onClick}>{children}</div>
    ),
    IconButton: ({ children, onClick, ...props }) => (
      <button data-testid="mock-icon-button" onClick={onClick} {...props}>{children}</button>
    ),
    ListItemIcon: ({ children }) => <span data-testid="mock-list-item-icon">{children}</span>,
    ListItemText: ({ primary }) => <span data-testid="mock-list-item-text">{primary}</span>,
    Divider: () => <hr data-testid="mock-divider" />,
    Dialog: ({ children, open }) => (
      open ? <div data-testid="mock-dialog">{children}</div> : null
    ),
    DialogTitle: ({ children }) => <div data-testid="mock-dialog-title">{children}</div>,
    DialogContent: ({ children }) => <div data-testid="mock-dialog-content">{children}</div>,
    DialogActions: ({ children }) => <div data-testid="mock-dialog-actions">{children}</div>,
    Tabs: ({ children, value, onChange }) => (
      <div data-testid="mock-tabs" value={value} onChange={onChange}>{children}</div>
    ),
    Tab: ({ label, value }) => <div data-testid={`mock-tab-${value}`}>{label}</div>,
    Drawer: ({ children, open }) => (
      open ? <div data-testid="mock-drawer">{children}</div> : null
    ),
    Stack: ({ children, direction }) => (
      <div data-testid={`mock-stack-${direction}`}>{children}</div>
    ),
    Chip: ({ label }) => <div data-testid="mock-chip">{label}</div>,
    Tooltip: ({ children, title }) => (
      <div data-testid="mock-tooltip" title={title}>{children}</div>
    ),
    Badge: ({ children, badgeContent }) => (
      <div data-testid="mock-badge" data-badge-content={badgeContent}>{children}</div>
    ),
    Snackbar: ({ children, open }) => (
      open ? <div data-testid="mock-snackbar">{children}</div> : null
    ),
    Alert: ({ children, severity, onClose }) => (
      <div data-testid={`mock-alert-${severity}`} onClick={onClose}>{children}</div>
    ),
    CircularProgress: () => <div data-testid="mock-circular-progress" />,
  };
});

// Mock MUI icons
jest.mock('@mui/icons-material', () => {
  const mockIcon = iconName => () => <span data-testid={`mock-icon-${iconName}`} />;
  
  return {
    PlayArrow: mockIcon('play-arrow'),
    Save: mockIcon('save'),
    BugReport: mockIcon('bug-report'),
    Add: mockIcon('add'),
    Close: mockIcon('close'),
    Storage: mockIcon('storage'),
    CloudUpload: mockIcon('cloud-upload'),
    Tune: mockIcon('tune'),
    Dataset: mockIcon('dataset'),
    PlayCircleFilled: mockIcon('play-circle-filled'),
    CallSplit: mockIcon('call-split'),
    Notifications: mockIcon('notifications'),
    Api: mockIcon('api'),
    FilterAlt: mockIcon('filter-alt'),
    CompareArrows: mockIcon('compare-arrows'),
    MergeType: mockIcon('merge-type'),
    Webhook: mockIcon('webhook'),
    HelpOutline: mockIcon('help-outline'),
    Settings: mockIcon('settings'),
    Undo: mockIcon('undo'),
    Redo: mockIcon('redo'),
    ZoomIn: mockIcon('zoom-in'),
    ZoomOut: mockIcon('zoom-out'),
    FitScreen: mockIcon('fit-screen'),
    History: mockIcon('history'),
    Keyboard: mockIcon('keyboard'),
    Folder: mockIcon('folder'),
    MoreHoriz: mockIcon('more-horiz'),
    Warning: mockIcon('warning'),
    Error: mockIcon('error'),
    CheckCircle: mockIcon('check-circle'),
    Schema: mockIcon('schema'),
    Code: mockIcon('code'),
    ViewList: mockIcon('view-list'),
    ViewModule: mockIcon('view-module'),
    Search: mockIcon('search'),
    FormatPaint: mockIcon('format-paint'),
    BackupTable: mockIcon('backup-table'),
    PhotoFilter: mockIcon('photo-filter'),
    Palette: mockIcon('palette'),
    Favorite: mockIcon('favorite'),
    AutoAwesome: mockIcon('auto-awesome'),
    Loop: mockIcon('loop'),
    AccessTime: mockIcon('access-time'),
  };
});

// Mock the custom components
jest.mock('../../components/integration/nodes', () => ({
  nodeTypes: {
    sourceNode: ({ data }) => <div data-testid="mock-source-node">{data.label}</div>,
    transformNode: ({ data }) => <div data-testid="mock-transform-node">{data.label}</div>,
    destinationNode: ({ data }) => <div data-testid="mock-destination-node">{data.label}</div>,
  },
}));

jest.mock('../../components/integration/EnhancedNodePalette', () => {
  return function MockEnhancedNodePalette({ components, onDragStart, onNodeSelect }) {
  // Added display name
  MockEnhancedNodePalette.displayName = 'MockEnhancedNodePalette';

    return (
      <div data-testid="mock-node-palette">
        {Object.keys(components).map(category => (
          <div key={category} data-testid={`category-${category}`}>
            {components[category].map(component => (
              <div
                key={component.type}
                data-testid={`component-${component.type}`}
                onClick={() => onNodeSelect(component)}
                draggable
                onDragStart={e => onDragStart(e, component.type, component)}
              >
                {component.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('../../components/integration/ContextualPropertiesPanel', () => {
  return function MockContextualPropertiesPanel({ element, onNodeUpdate, onEdgeUpdate, onDeleteNode, onDeleteEdge }) {
  // Added display name
  MockContextualPropertiesPanel.displayName = 'MockContextualPropertiesPanel';

    return (
      <div data-testid="mock-properties-panel">
        <div data-testid="element-type">{element.type}</div>
        <div data-testid="element-id">{element.id}</div>
        <button
          data-testid="update-button"
          onClick={() => {
            if (element.type === 'node') {
              onNodeUpdate(element.id, { label: 'Updated Label' });
            } else {
              onEdgeUpdate(element.id, { label: 'Updated Edge' });
            }
          }}
        >
          Update
        </button>
        <button
          data-testid="delete-button"
          onClick={() => {
            if (element.type === 'node') {
              onDeleteNode(element.id);
            } else {
              onDeleteEdge(element.id);
            }
          }}
        >
          Delete
        </button>
      </div>
    );
  };
});

// Mock validation tools
jest.mock('../../utils/flowValidation', () => ({
  createFlowValidator: () => ({
    validateFlow: () => ({ isValid: true, errors: [] }),
  }),
}));

// Mock layout optimization
jest.mock('../../utils/layoutOptimizer', () => ({
  optimizeLayout: nodes => nodes,
}));

// Custom hooks
jest.mock('../../hooks/useAutoSave', () => ({
  useAutoSave: () => ({
    saveState: null,
    lastSaved: null,
    isSaving: false,
    setSaveState: jest.fn(),
  }),
}));

jest.mock('../../hooks/useFlowHistory', () => ({
  useFlowHistory: () => ({
    undo: jest.fn(),
    redo: jest.fn(),
    canUndo: true,
    canRedo: false,
    addHistoryItem: jest.fn(),
  }),
}));

jest.mock('../../hooks/useFlowValidation', () => ({
  useFlowValidation: () => ({
    validateFlow: () => ({ errors: [] }),
    validationResults: { errors: [] },
  }),
}));

jest.mock('../../hooks/useFlowTemplates', () => ({
  useFlowTemplates: () => ({
    getTemplates: () => [],
    saveAsTemplate: jest.fn(),
    applyTemplate: jest.fn(),
  }),
}));

jest.mock('../../hooks/useLiveDataPreview', () => ({
  useLiveDataPreview: () => ({
    previewData: {},
    fetchPreviewData: jest.fn(),
    previewLoading: false,
  }),
}));

jest.mock('../../hooks/useResponsiveCanvas', () => ({
  useResponsiveCanvas: () => ({
    containerSize: { width: 1000, height: 800 },
    handleResize: jest.fn(),
  }),
}));

// Mock remaining components
jest.mock('../../components/integration/ValidationPanel', () => {
  return function MockValidationPanel({ validationErrors, onSelectNode }) {
  // Added display name
  MockValidationPanel.displayName = 'MockValidationPanel';

    return (
      <div data-testid="mock-validation-panel">
        {validationErrors.length === 0 ? (
          <div data-testid="no-errors">No validation errors</div>
        ) : (
          <ul>
            {validationErrors.map((error, index) => (
              <li
                key={index}
                data-testid={`error-${index}`}
                onClick={() => onSelectNode && onSelectNode(error.nodeId)}
              >
                {error.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
});

jest.mock('../../components/common/KeyboardShortcutsHelp', () => {
  return function MockKeyboardShortcutsHelp({ open, onClose }) {
  // Added display name
  MockKeyboardShortcutsHelp.displayName = 'MockKeyboardShortcutsHelp';

    return open ? (
      <div data-testid="mock-keyboard-shortcuts">
        <button data-testid="close-keyboard-shortcuts" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null;
  };
});

// Test data
const generateNodes = (count) => {
  // Added display name
  generateNodes.displayName = 'generateNodes';

  // Added display name
  generateNodes.displayName = 'generateNodes';

  // Added display name
  generateNodes.displayName = 'generateNodes';

  // Added display name
  generateNodes.displayName = 'generateNodes';

  // Added display name
  generateNodes.displayName = 'generateNodes';


  const nodes = [];
  for (let i = 0; i < count; i++) {
    const nodeType = i === 0 ? 'source' : i === count - 1 ? 'destination' : 'transform';
    nodes.push({
      id: `node-${i}`,
      type: `${nodeType}Node`,
      position: { x: i * 200, y: 100 },
      data: {
        label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} ${i}`,
        nodeType,
        tooltip: `${nodeType} node`,
        configData: {},
        validation: { isValid: true, messages: [] },
        status: 'idle',
      },
    });
  }
  return nodes;
};

const generateEdges = (nodeCount) => {
  // Added display name
  generateEdges.displayName = 'generateEdges';

  // Added display name
  generateEdges.displayName = 'generateEdges';

  // Added display name
  generateEdges.displayName = 'generateEdges';

  // Added display name
  generateEdges.displayName = 'generateEdges';

  // Added display name
  generateEdges.displayName = 'generateEdges';


  const edges = [];
  for (let i = 0; i < nodeCount - 1; i++) {
    edges.push({
      id: `edge-${i}-${i + 1}`,
      source: `node-${i}`,
      target: `node-${i + 1}`,
      type: 'default',
      animated: true,
      data: {
        label: `Connection ${i} to ${i + 1}`,
      },
    });
  }
  return edges;
};

const availableComponents = {
  sources: [
    { type: 'source', label: 'Source', description: 'Source node' },
    { type: 'api', label: 'API', description: 'API source' },
    { type: 'file', label: 'File', description: 'File source' },
  ],
  transforms: [
    { type: 'transform', label: 'Transform', description: 'Transform node' },
    { type: 'filter', label: 'Filter', description: 'Filter node' },
    { type: 'map', label: 'Map', description: 'Map node' },
  ],
  destinations: [
    { type: 'destination', label: 'Destination', description: 'Destination node' },
    { type: 'database', label: 'Database', description: 'Database destination' },
  ],
};

const defaultProps = {
  initialNodes: [],
  initialEdges: [],
  onSave: jest.fn(),
  onRun: jest.fn(),
  onNodesChange: jest.fn(),
  onEdgesChange: jest.fn(),
  availableComponents,
  readOnly: false,
  isAdmin: true,
  userPreferences: {},
};

// Helper to measure render time
const measureRenderTime = (callback) => {
  // Added display name
  measureRenderTime.displayName = 'measureRenderTime';

  // Added display name
  measureRenderTime.displayName = 'measureRenderTime';

  // Added display name
  measureRenderTime.displayName = 'measureRenderTime';

  // Added display name
  measureRenderTime.displayName = 'measureRenderTime';

  // Added display name
  measureRenderTime.displayName = 'measureRenderTime';


  const start = performance.now();
  callback();
  return performance.now() - start;
};

// Performance tests for the IntegrationFlowCanvas component
describe('IntegrationFlowCanvas Performance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // Test initial render performance with different numbers of nodes
  it('measures render time with varying numbers of nodes', () => {
    const renderTimesMs = [];
    const nodeCounts = [5, 10, 25];

    for (const count of nodeCounts) {
      const nodes = generateNodes(count);
      const edges = generateEdges(count);
      
      const renderTime = measureRenderTime(() => {
        render(
          <IntegrationFlowCanvas
            {...defaultProps}
            initialNodes={nodes}
            initialEdges={edges}
          />
        );
      });
      
      renderTimesMs.push({ count, time: renderTime });
      
      // Cleanup for next iteration
      document.body.innerHTML = '';
    }

    // Log results for analysis
    console.table(renderTimesMs.map(item => ({
      'Node Count': item.count,
      'Render Time (ms)': item.time.toFixed(2),
    })));

    // Assert that render times scale reasonably with node count
    for (let i = 1; i < renderTimesMs.length; i++) {
      const ratio = renderTimesMs[i].time / renderTimesMs[0].time;
      const nodeRatio = renderTimesMs[i].count / renderTimesMs[0].count;
      
      // Render time should increase less than O(n²)
      expect(ratio).toBeLessThan(nodeRatio * nodeRatio);
      
      // Just a warning if it's not roughly linear (might be acceptable)
      if (ratio > nodeRatio * 1.5) {
        console.warn(`Render time scaling is worse than expected: ${ratio.toFixed(2)}x for ${nodeRatio}x more nodes`);
      }
    }
  });

  // Test interaction performance
  it('measures node selection and property update performance', async () => {
    const nodes = generateNodes(10);
    const edges = generateEdges(10);
    const user = setupUserEvent();

    render(
      <IntegrationFlowCanvas
        {...defaultProps}
        initialNodes={nodes}
        initialEdges={edges}
      />
    );

    // Ensure all content is loaded
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Measure node selection performance
    const nodeElements = screen.getAllByTestId(/^node-node-/);
    const selectionTime = measureRenderTime(() => {
      // Click on first node
      nodeElements[0].click();
    });

    // Wait for selection to be processed
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Verify selection was processed
    expect(screen.getByTestId('element-type')).toHaveTextContent('node');

    // Measure property update performance
    const updateButton = screen.getByTestId('update-button');
    const updateTime = measureRenderTime(() => {
      updateButton.click();
    });

    // Wait for update to be processed
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Log results

    // Performance assertions
    expect(selectionTime).toBeLessThan(100); // Node selection should be fast
    expect(updateTime).toBeLessThan(100); // Property updates should be fast
  });

  // Test drag and drop performance
  it('measures drag and drop performance', () => {
    render(
      <IntegrationFlowCanvas
        {...defaultProps}
      />
    );

    // Ensure all content is loaded
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Find node palette
    const paletteVisible = screen.queryByTestId('mock-node-palette');
    if (!paletteVisible) {
      // Handle tabs
      const paletteTab = screen.getByTestId('mock-tab-palette');
      paletteTab.click();
    }

    // Find a draggable component
    const sourceComponent = screen.getAllByTestId(/^component-/)[0];
    
    // Mock dataTransfer for drag events
    const dataTransfer = {
      setData: jest.fn(),
      getData: jest.fn(key => key === 'application/reactflow' ? 'source' : '{}'),
      effectAllowed: '',
    };

    // Measure drag start performance
    const dragStartTime = measureRenderTime(() => {
      // Simulate drag start
      const dragStartEvent = new Event('dragstart', { bubbles: true });
      dragStartEvent.dataTransfer = dataTransfer;
      sourceComponent.dispatchEvent(dragStartEvent);
    });

    // Measure drop performance
    const dropTime = measureRenderTime(() => {
      // Simulate drop
      const dropEvent = new Event('drop', { bubbles: true });
      dropEvent.dataTransfer = dataTransfer;
      dropEvent.clientX = 500;
      dropEvent.clientY = 300;
      
      const canvas = screen.getByTestId('mock-react-flow');
      canvas.dispatchEvent(dropEvent);
    });

    // Log results

    // Performance assertions
    expect(dragStartTime).toBeLessThan(50); // Drag start should be very fast
    expect(dropTime).toBeLessThan(100); // Drop should be reasonably fast
  });

  // Test canvas operations performance
  it('measures canvas operations performance', () => {
    const nodes = generateNodes(20);
    const edges = generateEdges(20);

    render(
      <IntegrationFlowCanvas
        {...defaultProps}
        initialNodes={nodes}
        initialEdges={edges}
      />
    );

    // Ensure all content is loaded
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Measure auto-layout performance
    const autoLayoutButton = screen.getByText('Auto Layout');
    const autoLayoutTime = measureRenderTime(() => {
      autoLayoutButton.click();
    });

    // Wait for layout to process
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Measure save performance
    const saveButton = screen.getByText('Save');
    const saveTime = measureRenderTime(() => {
      saveButton.click();
    });

    // Wait for save to process
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Log results

    // Performance assertions
    expect(autoLayoutTime).toBeLessThan(150); // Auto layout should be reasonably fast
    expect(saveTime).toBeLessThan(100); // Save should be fast
  });

  // Test memory usage with large flows
  it('checks memory usage with a large flow', () => {
    // Monitor heap usage before
    const heapBefore = process.memoryUsage().heapUsed;
    
    // Create a large flow
    const nodes = generateNodes(50);
    const edges = generateEdges(50);

    render(
      <IntegrationFlowCanvas
        {...defaultProps}
        initialNodes={nodes}
        initialEdges={edges}
      />
    );

    // Ensure all content is loaded
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Monitor heap usage after
    const heapAfter = process.memoryUsage().heapUsed;
    const heapUsageMB = (heapAfter - heapBefore) / (1024 * 1024);

    // Log memory usage

    // Memory usage assertion - should be reasonable
    // Note: This is a rough guideline and depends on the environment
    expect(heapUsageMB).toBeLessThan(50); // Should use less than 50MB of additional heap
  });
});