/**
 * EnhancedFlowCanvas.test.js
 * 
 * Integration tests for the enhanced flow canvas visualization and interactions.
 * Tests node rendering, connection handling, and complex interactions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactFlowProvider } from '@utils/reactFlowAdapter';
import { ThemeProvider } from '@design-system/foundations/theme';

// Component to test
import IntegrationFlowCanvas from '@components/integration/IntegrationFlowCanvas';
import { CONNECTION_TYPES } from '@components/integration/nodes/BaseNode';

// Mock theme for design system
const mockTheme = {
  colors: {
    primary: { main: '#1976d2', lighter: '#e3f2fd' },
    secondary: { main: '#dc004e' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    success: { main: '#4caf50' },
    background: { paper: '#ffffff', default: '#f5f5f5', hover: '#f9f9f9', light: '#f5f5f5' },
    text: { primary: '#000000', secondary: '#666666' },
    divider: '#e0e0e0',
  },
  shadows: ['none', '0px 2px 1px -1px rgba(0,0,0,0.2)'],
  shape: { borderRadius: 4 },
  zIndex: { drawer: 1200 },
};

// Mock ReactFlow
const mockProject = jest.fn(coords => coords);
const mockFitView = jest.fn();
const mockZoomIn = jest.fn();
const mockZoomOut = jest.fn();
const mockGetNodes = jest.fn();
const mockGetEdges = jest.fn();
const mockOnNodesChange = jest.fn();
const mockOnEdgesChange = jest.fn();

jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  ReactFlow: ({ children, onNodeClick, onEdgeClick, onPaneClick, onContextMenu }) => (
    <div data-testid="react-flow">
      {children}
      <button data-testid="mock-node" onClick={(e) => onNodeClick(e, { id: 'node-1', data: { label: 'Test Node' } })}>Mock Node</button>
      <button data-testid="mock-edge" onClick={(e) => onEdgeClick(e, { id: 'edge-1', source: 'node-1', target: 'node-2' })}>Mock Edge</button>
      <button data-testid="mock-pane" onClick={onPaneClick}>Mock Pane</button>
      <button data-testid="mock-context-menu" onClick={(e) => onContextMenu({ ...e, clientX: 100, clientY: 100, preventDefault: () => {} })}>Mock Context Menu</button>
    </div>
  ),
  ReactFlowProvider: ({ children }) => <div>{children}</div>,
  Panel: ({ children }) => <div data-testid="react-flow-panel">{children}</div>,
  Background: () => <div data-testid="react-flow-background" />,
  Controls: () => <div data-testid="react-flow-controls" />,
  MiniMap: () => <div data-testid="react-flow-minimap" />,
  useNodesState: () => [
    [{ id: 'node-1', data: { label: 'Test Node' } }], 
    mockOnNodesChange, 
    jest.fn()
  ],
  useEdgesState: () => [
    [{ id: 'edge-1', source: 'node-1', target: 'node-2' }], 
    mockOnEdgesChange, 
    jest.fn()
  ],
  useReactFlow: () => ({
    project: mockProject,
    getNodes: mockGetNodes.mockReturnValue([
      { id: 'node-1', data: { label: 'Test Node' } }
    ]),
    getEdges: mockGetEdges.mockReturnValue([
      { id: 'edge-1', source: 'node-1', target: 'node-2' }
    ]),
    fitView: mockFitView,
    zoomIn: mockZoomIn,
    zoomOut: mockZoomOut,
  }),
  useKeyPress: jest.fn(() => false),
  useOnViewportChange: jest.fn(({ onStart, onChange, onEnd }) => {
    // Call these with dummy data for testing
    onStart({ zoom: 1 });
    onChange({ zoom: 1 });
    onEnd({ zoom: 1 });
  }),
  addEdge: jest.fn(params => [params]),
  getConnectedEdges: jest.fn(() => []),
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
}));

// Mock custom hooks
jest.mock('../../hooks/useAutoSave', () => ({
  __esModule: true,
  default: () => ({
    saveState: jest.fn(),
    lastSaved: new Date().toISOString(),
    isSaving: false,
    setSaveState: jest.fn(),
  })
}));

jest.mock('../../hooks/useFlowHistory', () => ({
  __esModule: true,
  default: () => ({
    undo: jest.fn(),
    redo: jest.fn(),
    canUndo: true,
    canRedo: false,
    addHistoryItem: jest.fn(),
  })
}));

jest.mock('../../hooks/useFlowValidation', () => ({
  __esModule: true,
  default: () => ({
    validateFlow: jest.fn(() => ({ errors: [] })),
    validationResults: { errors: [], warnings: [], info: [] },
  })
}));

jest.mock('../../hooks/useFlowTemplates', () => ({
  __esModule: true,
  default: () => ({
    getTemplates: jest.fn(() => []),
    saveAsTemplate: jest.fn(),
    applyTemplate: jest.fn(),
  })
}));

jest.mock('../../hooks/useLiveDataPreview', () => ({
  __esModule: true,
  default: () => ({
    previewData: null,
    fetchPreviewData: jest.fn(),
    previewLoading: false,
  })
}));

jest.mock('../../hooks/useResponsiveCanvas', () => ({
  __esModule: true,
  default: () => ({
    containerSize: { width: 1000, height: 800 },
    handleResize: jest.fn(),
  })
}));

jest.mock('../../hooks/useConnectionValidation', () => ({
  __esModule: true,
  default: () => ({
    validateConnection: jest.fn(() => ({ isValid: true })),
    validateFlow: jest.fn(() => []),
    validationErrors: [],
    isValidating: false,
  })
}));

// Mock MUI components to avoid test errors
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Menu: ({ children, open }) => open ? <div data-testid="mui-menu">{children}</div> : null,
  MenuItem: ({ children, onClick }) => <div onClick={onClick}>{children}</div>,
  ListItemIcon: ({ children }) => <div>{children}</div>,
  ListItemText: ({ primary }) => <div>{primary}</div>,
  DialogTitle: ({ children }) => <div>{children}</div>,
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogActions: ({ children }) => <div>{children}</div>,
  Divider: () => <hr />,
  IconButton: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  Tooltip: ({ children }) => children,
  Drawer: ({ children, open }) => open ? <div data-testid="mui-drawer">{children}</div> : null,
  Tabs: ({ children, value, onChange }) => (
    <div role="tablist">
      {React.Children.map(children, (child, index) => 
        React.cloneElement(child, { selected: value === index, onClick: () => onChange(null, index) })
      )}
    </div>
  ),
  Tab: ({ label, selected, onClick }) => (
    <button role="tab" aria-selected={selected} onClick={onClick}>
      {label}
    </button>
  ),
}));

// Test data
const availableComponents = {
  sources: [
    { type: 'source', label: 'Data Source', description: 'Generic data source' },
    { type: 'api', label: 'API Source', description: 'REST API data source' },
  ],
  transforms: [
    { type: 'transform', label: 'Transform', description: 'Data transformation' },
    { type: 'filter', label: 'Filter', description: 'Filter data based on conditions' },
  ],
  routers: [
    { type: 'router', label: 'Router', description: 'Route data based on conditions' },
    { type: 'fork', label: 'Fork', description: 'Split data into multiple paths' },
  ],
  destinations: [
    { type: 'destination', label: 'Destination', description: 'Data destination' },
    { type: 'database', label: 'Database', description: 'Database destination' },
  ],
};

// Render wrapper with providers
const renderWithProviders = (ui, { initialNodes = [], initialEdges = [] } = {}) => {
  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';

  // Added display name
  renderWithProviders.displayName = 'renderWithProviders';


  return render(
    <ThemeProvider theme={mockTheme}>
      <ReactFlowProvider>
        {ui}
      </ReactFlowProvider>
    </ThemeProvider>
  );
};

describe('Enhanced Flow Canvas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders flow canvas with controls and panels', () => {
    const handleSave = jest.fn();
    const handleRun = jest.fn();
    
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={handleSave}
        onRun={handleRun}
        availableComponents={availableComponents}
      />
    );
    
    // Main components should be rendered
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-background')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-controls')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow-minimap')).toBeInTheDocument();
    
    // Action buttons should be rendered
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Test Flow')).toBeInTheDocument();
  });
  
  test('handles node selection and shows property panel', () => {
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
      />
    );
    
    // Click on a node
    fireEvent.click(screen.getByTestId('mock-node'));
    
    // Properties tab should become active
    expect(screen.getByRole('tab', { name: 'Properties' })).toHaveAttribute('aria-selected', 'true');
  });
  
  test('handles edge selection and shows property panel', () => {
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
      />
    );
    
    // Click on an edge
    fireEvent.click(screen.getByTestId('mock-edge'));
    
    // Properties tab should become active
    expect(screen.getByRole('tab', { name: 'Properties' })).toHaveAttribute('aria-selected', 'true');
  });
  
  test('handles context menu for adding nodes', () => {
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
      />
    );
    
    // Right-click to open context menu
    fireEvent.click(screen.getByTestId('mock-context-menu'));
    
    // Context menu should be rendered
    expect(screen.getByTestId('mui-menu')).toBeInTheDocument();
  });
  
  test('handles save action', () => {
    const handleSave = jest.fn();
    
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={handleSave}
        onRun={jest.fn()}
        availableComponents={availableComponents}
      />
    );
    
    // Click save button
    fireEvent.click(screen.getByText('Save'));
    
    // Save handler should be called with nodes and edges
    expect(handleSave).toHaveBeenCalledWith(expect.objectContaining({
      nodes: expect.any(Array),
      edges: expect.any(Array)
    }));
  });
  
  test('handles test/run action', () => {
    const handleRun = jest.fn();
    
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={handleRun}
        availableComponents={availableComponents}
      />
    );
    
    // Click test flow button
    fireEvent.click(screen.getByText('Test Flow'));
    
    // Run handler should be called with nodes and edges
    expect(handleRun).toHaveBeenCalledWith(expect.objectContaining({
      nodes: expect.any(Array),
      edges: expect.any(Array)
    }));
  });
  
  test('shows node palette in the sidebar', () => {
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
      />
    );
    
    // Default tab should be node palette
    expect(screen.getByRole('tab', { name: 'Nodes' })).toHaveAttribute('aria-selected', 'true');
    
    // Drawer should be open
    expect(screen.getByTestId('mui-drawer')).toBeInTheDocument();
  });
  
  test('supports read-only mode', () => {
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
        readOnly={true}
      />
    );
    
    // Save and Test Flow buttons should not be displayed in read-only mode
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Flow')).not.toBeInTheDocument();
  });
  
  test('supports admin features', () => {
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
        isAdmin={true}
      />
    );
    
    // Admin should see Auto Layout button
    expect(screen.getByText('Auto Layout')).toBeInTheDocument();
    
    // Admin should see the Templates tab
    expect(screen.getByRole('tab', { name: 'Templates' })).toBeInTheDocument();
  });
  
  test('handles deselection by clicking on pane', () => {
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
      />
    );
    
    // First select a node
    fireEvent.click(screen.getByTestId('mock-node'));
    
    // Properties tab should become active
    expect(screen.getByRole('tab', { name: 'Properties' })).toHaveAttribute('aria-selected', 'true');
    
    // Then click on the pane to deselect
    fireEvent.click(screen.getByTestId('mock-pane'));
    
    // Properties tab should no longer be active
    expect(screen.getByRole('tab', { name: 'Properties' })).toHaveAttribute('disabled', '');
  });
});

// Add more focused tests for specific interactions
describe('Flow Canvas Node Interactions', () => {
  test('supports node drag and drop', () => {
    const onDrop = jest.fn();
    const onDragOver = jest.fn();
    
    // Mock ReactFlow's onDrop and onDragOver
    jest.spyOn(React, 'useCallback').mockImplementation(cb => {
      if (cb.toString().includes('onDrop')) return onDrop;
      if (cb.toString().includes('onDragOver')) return onDragOver;
      return cb;
    });
    
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
      />
    );
    
    // Simulate drag over event
    fireEvent.dragOver(screen.getByTestId('react-flow'));
    expect(onDragOver).toHaveBeenCalled();
    
    // Restore the original implementation
    jest.spyOn(React, 'useCallback').mockRestore();
  });
  
  test('supports keyboard shortcuts for undo/redo', () => {
    // Mock the useKeyPress hook to simulate keyboard shortcuts
    const useKeyPressMock = require('reactflow').useKeyPress;
    
    // Simulate Ctrl+Z press
    useKeyPressMock.mockImplementation(keys => {
      if (Array.isArray(keys) && keys.includes('z')) return true;
      return false;
    });
    
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
      />
    );
    
    // Find undo button and check if it's enabled
    const undoButton = screen.getByLabelText('Undo (Ctrl+Z)');
    expect(undoButton).not.toBeDisabled();
    
    // Click undo button
    fireEvent.click(undoButton);
    
    // Should trigger the undo action
    expect(require('../../hooks/useFlowHistory').default().undo).toHaveBeenCalled();
  });
});

describe('Flow Canvas Validation Integration', () => {
  test('shows validation errors when present', () => {
    // Mock validation to return errors
    const validationMock = require('../../hooks/useFlowValidation').default;
    validationMock.mockImplementation(() => ({
      validateFlow: jest.fn(() => ({ 
        errors: [
          { id: 'error-1', severity: 'error', message: 'Connection type mismatch' }
        ] 
      })),
      validationResults: { 
        errors: [
          { id: 'error-1', severity: 'error', message: 'Connection type mismatch' }
        ], 
        warnings: [], 
        info: [] 
      },
    }));
    
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
      />
    );
    
    // Error badge should show count
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Validation tab should exist
    expect(screen.getByRole('tab', { name: 'Validation' })).toBeInTheDocument();
  });
});

describe('Connection Type System Integration', () => {
  test('renders connection types legend in connection panel', () => {
    // First select a node to show properties panel
    renderWithProviders(
      <IntegrationFlowCanvas
        onSave={jest.fn()}
        onRun={jest.fn()}
        availableComponents={availableComponents}
      />
    );
    
    // Click on a node
    fireEvent.click(screen.getByTestId('mock-node'));
    
    // Switch to Connections tab
    fireEvent.click(screen.getByRole('tab', { name: 'Connections' }));
    
    // Connection type legend should be visible
    expect(screen.getByText('Connection Types')).toBeInTheDocument();
    
    // Should show all connection types
    expect(screen.getByText('Data')).toBeInTheDocument();
    expect(screen.getByText('Control')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();
  });
});