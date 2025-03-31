/**
 * ConnectionConfiguration.test.js
 * 
 * Integration tests for the enhanced connection configuration system in the flow canvas.
 * Tests various node types, connection type validation, and property panel interactions.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactFlowProvider } from '@utils/reactFlowAdapter';
import { ThemeProvider } from '@design-system/foundations/theme';

// Components to test
import IntegrationFlowCanvas from '@components/integration/IntegrationFlowCanvas';
import ConnectionPropertiesPanel from '@components/integration/ConnectionPropertiesPanel';
import { CONNECTION_TYPES } from '@components/integration/nodes/BaseNode';
import { validateConnection } from '@utils/connectionValidator';

// Mock theme for design system
const mockTheme = {
  colors: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    success: { main: '#4caf50' },
    background: { paper: '#ffffff', default: '#f5f5f5' },
    text: { primary: '#000000', secondary: '#666666' },
    divider: '#e0e0e0',
  },
  shape: {
    borderRadius: 4,
  },
  shadows: ['none', '0px 2px 1px -1px rgba(0,0,0,0.2)'],
  zIndex: {
    drawer: 1200,
  },
};

// Mocks
jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  useNodesState: jest.fn(() => [[], jest.fn(), jest.fn()]),
  useEdgesState: jest.fn(() => [[], jest.fn(), jest.fn()]),
  useReactFlow: jest.fn(() => ({
    project: jest.fn(coords => coords),
    getNodes: jest.fn(() => []),
    getEdges: jest.fn(() => []),
    fitView: jest.fn(),
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
  })),
}));

// Test data
const mockNodeData = {
  id: 'test-node-1',
  type: 'routerNode',
  position: { x: 100, y: 100 },
  data: {
    label: 'Test Router',
    routerType: 'fork',
    inputConnections: [
      {
        id: "input-main",
        label: "Main Input",
        connectionType: CONNECTION_TYPES.DATA
      }
    ],
    outputConnections: [
      {
        id: "output-0",
        label: "Path 1",
        connectionType: CONNECTION_TYPES.DATA
      },
      {
        id: "output-1",
        label: "Path 2",
        connectionType: CONNECTION_TYPES.DATA
      }
    ],
    connections: {
      inputs: {},
      outputs: {}
    }
  }
};

// Render wrapper with providers
const renderWithProviders = (ui) => {
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

describe('Connection Configuration', () => {
  describe('ConnectionPropertiesPanel Component', () => {
    test('renders connection properties panel with input and output connections', () => {
      const handleSaveConnectionConfig = jest.fn();
      
      renderWithProviders(
        <ConnectionPropertiesPanel 
          nodeData={mockNodeData.data}
          onSaveConnectionConfig={handleSaveConnectionConfig}
          nodeType="Router"
        />
      );
      
      // Check if panel renders correctly
      expect(screen.getByText('Router Connection Configuration')).toBeInTheDocument();
      expect(screen.getByText('Input Connections')).toBeInTheDocument();
      expect(screen.getByText('Output Connections')).toBeInTheDocument();
      
      // Check if connections are displayed
      expect(screen.getByText('Main Input')).toBeInTheDocument();
      expect(screen.getByText('Path 1')).toBeInTheDocument();
      expect(screen.getByText('Path 2')).toBeInTheDocument();
    });
    
    test('allows adding new connections', async () => {
      const handleSaveConnectionConfig = jest.fn();
      
      renderWithProviders(
        <ConnectionPropertiesPanel 
          nodeData={mockNodeData.data}
          onSaveConnectionConfig={handleSaveConnectionConfig}
          nodeType="Router"
        />
      );
      
      // Click Add Input button
      fireEvent.click(screen.getByText('Add Input'));
      
      // Dialog should open
      expect(screen.getByText('Add Input Connection')).toBeInTheDocument();
      
      // Fill the form
      fireEvent.change(screen.getByLabelText('Connection ID'), {
        target: { value: 'input-custom' }
      });
      
      fireEvent.change(screen.getByLabelText('Connection Label'), {
        target: { value: 'Custom Input' }
      });
      
      // Save the connection
      fireEvent.click(screen.getByText('Save Connection'));
      
      // Save configuration
      fireEvent.click(screen.getByText('Save Configuration'));
      
      // Check if save handler was called
      expect(handleSaveConnectionConfig).toHaveBeenCalled();
      
      // Check if config includes the new connection
      const savedConfig = handleSaveConnectionConfig.mock.calls[0][0];
      const hasNewConnection = savedConfig.inputConnections.some(
        conn => conn.id === 'input-custom' && conn.label === 'Custom Input'
      );
      
      expect(hasNewConnection).toBe(true);
    });
    
    test('allows editing existing connections', async () => {
      const handleSaveConnectionConfig = jest.fn();
      
      renderWithProviders(
        <ConnectionPropertiesPanel 
          nodeData={mockNodeData.data}
          onSaveConnectionConfig={handleSaveConnectionConfig}
          nodeType="Router"
        />
      );
      
      // Find and click Edit button for Path 1
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[1]); // Output Edit button
      
      // Dialog should open
      expect(screen.getByText('Edit Output Connection')).toBeInTheDocument();
      
      // Change the label
      fireEvent.change(screen.getByLabelText('Connection Label'), {
        target: { value: 'Modified Path' }
      });
      
      // Save the connection
      fireEvent.click(screen.getByText('Save Connection'));
      
      // Save configuration
      fireEvent.click(screen.getByText('Save Configuration'));
      
      // Check if save handler was called
      expect(handleSaveConnectionConfig).toHaveBeenCalled();
      
      // Check if config includes the modified connection
      const savedConfig = handleSaveConnectionConfig.mock.calls[0][0];
      const hasModifiedConnection = savedConfig.outputConnections.some(
        conn => conn.id === 'output-0' && conn.label === 'Modified Path'
      );
      
      expect(hasModifiedConnection).toBe(true);
    });
    
    test('allows deleting connections', async () => {
      const handleSaveConnectionConfig = jest.fn();
      
      renderWithProviders(
        <ConnectionPropertiesPanel 
          nodeData={mockNodeData.data}
          onSaveConnectionConfig={handleSaveConnectionConfig}
          nodeType="Router"
        />
      );
      
      // Find and click Delete button for Path 2
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[2]); // Second output Delete button
      
      // Save configuration
      fireEvent.click(screen.getByText('Save Configuration'));
      
      // Check if save handler was called
      expect(handleSaveConnectionConfig).toHaveBeenCalled();
      
      // Check if deleted connection is removed
      const savedConfig = handleSaveConnectionConfig.mock.calls[0][0];
      const hasDeletedConnection = savedConfig.outputConnections.some(
        conn => conn.id === 'output-1'
      );
      
      expect(hasDeletedConnection).toBe(false);
    });
    
    test('displays connection type information correctly', () => {
      renderWithProviders(
        <ConnectionPropertiesPanel 
          nodeData={mockNodeData.data}
          onSaveConnectionConfig={jest.fn()}
          nodeType="Router"
        />
      );
      
      // Check if connection type legend is displayed
      expect(screen.getByText('Connection Types')).toBeInTheDocument();
      
      // Check if all connection types are shown in the legend
      expect(screen.getByText('Data')).toBeInTheDocument();
      expect(screen.getByText('Control')).toBeInTheDocument();
      expect(screen.getByText('Event')).toBeInTheDocument();
      expect(screen.getByText('Reference')).toBeInTheDocument();
    });
  });

  describe('Connection Validation', () => {
    test('validates matching connection types', () => {
      // Test the validateConnection function with matching types
      const result = validateConnection({
        source: 'output-0',
        target: 'input-0',
        sourceNode: {
          data: {
            outputConnections: [
              { id: 'output-0', connectionType: CONNECTION_TYPES.DATA }
            ]
          }
        },
        targetNode: {
          data: {
            inputConnections: [
              { id: 'input-0', connectionType: CONNECTION_TYPES.DATA }
            ]
          }
        }
      });
      
      expect(result.isValid).toBe(true);
    });
    
    test('rejects mismatched connection types', () => {
      // Test with mismatched connection types
      const result = validateConnection({
        source: 'output-0',
        target: 'input-0',
        sourceNode: {
          data: {
            outputConnections: [
              { id: 'output-0', connectionType: CONNECTION_TYPES.DATA }
            ]
          }
        },
        targetNode: {
          data: {
            inputConnections: [
              { id: 'input-0', connectionType: CONNECTION_TYPES.CONTROL }
            ]
          }
        }
      });
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Connection type mismatch');
    });
    
    test('enforces node-specific connection rules', () => {
      // Test router-specific validation rules
      const result = validateConnection({
        source: 'output-custom',
        target: 'input-0',
        sourceNode: {
          type: 'routerNode',
          data: {
            routerType: 'merge',
            outputConnections: [
              { id: 'output-main', connectionType: CONNECTION_TYPES.DATA },
              { id: 'output-custom', connectionType: CONNECTION_TYPES.DATA }
            ]
          }
        },
        targetNode: {
          data: {
            inputConnections: [
              { id: 'input-0', connectionType: CONNECTION_TYPES.DATA }
            ]
          }
        }
      });
      
      // Should fail because merge router can only connect from its main output
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Merge router can only connect from its main output');
    });
  });

  describe('Node Type-Specific Connection Behaviors', () => {
    // Test Router Node connections
    test('Router node fork type supports multiple outputs', () => {
      const routerForkNode = {
        ...mockNodeData,
        data: {
          ...mockNodeData.data,
          routerType: 'fork',
          paths: [
            { label: 'Path 1' },
            { label: 'Path 2' },
            { label: 'Path 3' }
          ]
        }
      };
      
      renderWithProviders(
        <ConnectionPropertiesPanel 
          nodeData={routerForkNode.data}
          onSaveConnectionConfig={jest.fn()}
          nodeType="Router"
        />
      );
      
      // Add a new output path
      fireEvent.click(screen.getByText('Add Output'));
      
      // Fill out the form
      fireEvent.change(screen.getByLabelText('Connection ID'), {
        target: { value: 'output-3' }
      });
      fireEvent.change(screen.getByLabelText('Connection Label'), {
        target: { value: 'Path 4' }
      });
      
      // Save the connection
      fireEvent.click(screen.getByText('Save Connection'));
      
      // Verify new path added
      expect(screen.getByText('Path 4')).toBeInTheDocument();
    });
    
    // Test Transform Node connections
    test('Transform node join type requires specific inputs', () => {
      const transformJoinNode = {
        id: 'transform-node',
        type: 'transformNode',
        data: {
          label: 'Join Transform',
          transformType: 'join',
          inputConnections: [
            {
              id: "input-primary",
              label: "Primary",
              connectionType: CONNECTION_TYPES.DATA
            },
            {
              id: "input-secondary",
              label: "Secondary",
              connectionType: CONNECTION_TYPES.DATA
            }
          ],
          outputConnections: [
            {
              id: "output-main",
              label: "Result",
              connectionType: CONNECTION_TYPES.DATA
            }
          ],
          connections: {
            inputs: {},
            outputs: {}
          }
        }
      };
      
      renderWithProviders(
        <ConnectionPropertiesPanel 
          nodeData={transformJoinNode.data}
          onSaveConnectionConfig={jest.fn()}
          nodeType="Transform"
        />
      );
      
      // Check if specific inputs are displayed
      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Result')).toBeInTheDocument();
    });
    
    // Test Dataset Node connections
    test('Dataset node connections have specific type requirements', () => {
      // Specifically test the validation of dataset connections
      const result = validateConnection({
        source: 'output-main',
        target: 'input-0',
        sourceNode: {
          type: 'datasetNode',
          data: {
            outputConnections: [
              { id: 'output-main', connectionType: CONNECTION_TYPES.DATA }
            ]
          }
        },
        targetNode: {
          type: 'routerNode', // Not an application or transform
          data: {
            inputConnections: [
              { id: 'input-0', connectionType: CONNECTION_TYPES.DATA }
            ]
          }
        }
      });
      
      // Should fail because datasets can only connect to applications or transforms
      expect(result.isValid).toBe(false);
    });
  });
});