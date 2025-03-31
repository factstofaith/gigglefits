import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IntegrationFlowCanvas from '../../components/integration/IntegrationFlowCanvas';

// Mock ReactFlow
jest.mock('reactflow', () => ({
  ReactFlowProvider: ({ children }) => <div>{children}</div>,
  Background: () => <div>Background</div>,
  Controls: () => <div>Controls</div>,
  MiniMap: () => <div>MiniMap</div>,
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  Panel: ({ children }) => <div>{children}</div>,
  addEdge: jest.fn(),
  getConnectedEdges: jest.fn().mockReturnValue([]),
}));

// Mock the node types
jest.mock('../../components/integration/nodes', () => ({
  nodeTypes: {},
}));

// Mock NodePropertiesPanel
jest.mock('../../components/integration/NodePropertiesPanel', () => () => (
  <div>NodePropertiesPanel</div>
));

describe('IntegrationFlowCanvas Migration', () => {
  const defaultProps = {
    initialNodes: [],
    initialEdges: [],
    onSave: jest.fn(),
    onRun: jest.fn(),
    availableComponents: {
      sources: [{ type: 'source', label: 'API Source', description: 'Fetch data from an API' }],
      transforms: [
        { type: 'transform', label: 'Data Mapper', description: 'Map and transform data fields' },
      ],
      destinations: [
        { type: 'destination', label: 'Database', description: 'Store data in a database' },
      ],
    },
  };

  it('renders with legacy design system components', () => {
    render(<IntegrationFlowCanvas {...defaultProps} />);

    // Check if the Save button is rendered with legacy component
    const saveButton = screen.getByText('Save');
    expect(saveButton.closest('.ButtonLegacy-root')).toBeInTheDocument();

    // Check if the Test button is rendered with legacy component
    const testButton = screen.getByText('Test');
    expect(testButton.closest('.ButtonLegacy-root')).toBeInTheDocument();

    // Check if the Debug button is rendered with legacy component
    const debugButton = screen.getByText('Debug');
    expect(debugButton.closest('.ButtonLegacy-root')).toBeInTheDocument();

    // Check if the Add Component button is rendered with legacy component
    const addComponentButton = screen.getByText('Add Component');
    expect(addComponentButton.closest('.ButtonLegacy-root')).toBeInTheDocument();
  });

  it('renders quick add info panel with legacy components', () => {
    render(<IntegrationFlowCanvas {...defaultProps} />);

    // Click the help button to open quick add info panel
    const helpButton = screen.getByRole('button', { name: /how to add components/i });
    fireEvent.click(helpButton);

    // Check if the info panel is rendered with legacy Paper
    const gotItButton = screen.getByText('Got it');
    expect(gotItButton.closest('.ButtonLegacy-root')).toBeInTheDocument();

    const infoPanel = screen.getByText('Adding Components');
    expect(infoPanel.closest('.CardLegacy-root')).toBeInTheDocument();
  });
});
