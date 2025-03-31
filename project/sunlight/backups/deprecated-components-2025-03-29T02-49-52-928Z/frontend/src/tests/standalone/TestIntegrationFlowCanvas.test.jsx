// TestIntegrationFlowCanvas.test.jsx
// Independent test file for IntegrationFlowCanvas that doesn't rely on any external dependencies

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import standalone component (not the real one)
import TestIntegrationFlowCanvas from './TestIntegrationFlowCanvas';

// Sample data for testing
const sampleNodes = [
  {
    id: 'source-1',
    type: 'sourceNode',
    position: { x: 100, y: 100 },
    data: {
      label: 'API Source',
      nodeType: 'source',
      description: 'Connects to sample API',
    },
  },
  {
    id: 'transform-1',
    type: 'transformNode',
    position: { x: 350, y: 100 },
    data: {
      label: 'Data Mapper',
      nodeType: 'transform',
      description: 'Maps data fields',
    },
  },
];

const sampleEdges = [
  {
    id: 'edge-1',
    source: 'source-1',
    target: 'transform-1',
    type: 'smoothstep',
    animated: true,
    label: 'connects to',
  },
];

const sampleAvailableComponents = {
  sources: [
    { type: 'source', label: 'API Source', description: 'Fetch data from an API' },
    { type: 'source', label: 'Database', description: 'Fetch data from a database' },
  ],
  transforms: [
    { type: 'transform', label: 'Data Mapper', description: 'Map and transform data fields' },
    { type: 'transform', label: 'Filter', description: 'Filter data based on conditions' },
  ],
  destinations: [
    { type: 'destination', label: 'Database', description: 'Store data in a database' },
    { type: 'destination', label: 'API', description: 'Send data to an API' },
  ],
};

// Test suite
describe('IntegrationFlowCanvas Component', () => {
  // Basic rendering tests
  it('renders the flow canvas with nodes and edges', () => {
    render(
      <TestIntegrationFlowCanvas
        initialNodes={sampleNodes}
        initialEdges={sampleEdges}
        onSave={() => {}}
        onRun={() => {}}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Canvas should be rendered
    expect(screen.getByTestId('flow-canvas')).toBeInTheDocument();

    // Toolbar should be rendered
    expect(screen.getByTestId('flow-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('run-button')).toBeInTheDocument();
    expect(screen.getByTestId('debug-button')).toBeInTheDocument();

    // Nodes should be rendered
    expect(screen.getByTestId('node-source-1')).toBeInTheDocument();
    expect(screen.getByTestId('node-transform-1')).toBeInTheDocument();

    // Node labels should be correct
    expect(screen.getByTestId('node-label-source-1')).toHaveTextContent('API Source');
    expect(screen.getByTestId('node-label-transform-1')).toHaveTextContent('Data Mapper');

    // Edges container should be rendered
    expect(screen.getByTestId('edges-container')).toBeInTheDocument();
    expect(screen.getByTestId('edge-edge-1')).toBeInTheDocument();
  });

  it('shows the add component button', () => {
    render(
      <TestIntegrationFlowCanvas
        initialNodes={[]}
        initialEdges={[]}
        onSave={() => {}}
        onRun={() => {}}
        availableComponents={sampleAvailableComponents}
      />
    );

    expect(screen.getByTestId('add-component-button')).toBeInTheDocument();
  });

  // Interaction tests
  it('selects a node when clicked', () => {
    render(
      <TestIntegrationFlowCanvas
        initialNodes={sampleNodes}
        initialEdges={sampleEdges}
        onSave={() => {}}
        onRun={() => {}}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Initially, properties panel should not be visible
    expect(screen.queryByTestId('properties-panel')).not.toBeInTheDocument();

    // Click on a node
    fireEvent.click(screen.getByTestId('node-source-1'));

    // Properties panel should now be visible
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();
    expect(screen.getByTestId('node-label-input')).toHaveValue('API Source');
  });

  it('deselects a node when clicking outside', () => {
    render(
      <TestIntegrationFlowCanvas
        initialNodes={sampleNodes}
        initialEdges={sampleEdges}
        onSave={() => {}}
        onRun={() => {}}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Select a node
    fireEvent.click(screen.getByTestId('node-source-1'));
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();

    // Click outside (on canvas)
    fireEvent.click(screen.getByTestId('canvas-area'));

    // Properties panel should be hidden
    expect(screen.queryByTestId('properties-panel')).not.toBeInTheDocument();
  });

  it('opens component dialog when add component button is clicked', () => {
    render(
      <TestIntegrationFlowCanvas
        initialNodes={[]}
        initialEdges={[]}
        onSave={() => {}}
        onRun={() => {}}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Dialog should not be visible initially
    expect(screen.queryByTestId('component-dialog')).not.toBeInTheDocument();

    // Click add component button
    fireEvent.click(screen.getByTestId('add-component-button'));

    // Dialog should now be visible
    expect(screen.getByTestId('component-dialog')).toBeInTheDocument();

    // Categories should be visible
    expect(screen.getByTestId('category-tab-sources')).toBeInTheDocument();
    expect(screen.getByTestId('category-tab-transforms')).toBeInTheDocument();
    expect(screen.getByTestId('category-tab-destinations')).toBeInTheDocument();

    // Component grid should show components from the default category (sources)
    expect(screen.getByTestId('component-grid')).toBeInTheDocument();
    expect(screen.getByTestId('component-source')).toBeInTheDocument();
  });

  it('switches categories in the component dialog', () => {
    render(
      <TestIntegrationFlowCanvas
        initialNodes={[]}
        initialEdges={[]}
        onSave={() => {}}
        onRun={() => {}}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Open component dialog
    fireEvent.click(screen.getByTestId('add-component-button'));

    // Initially, sources should be active
    expect(screen.getByTestId('component-source')).toBeInTheDocument();

    // Click on transforms tab
    fireEvent.click(screen.getByTestId('category-tab-transforms'));

    // Now transform components should be visible
    expect(screen.getByTestId('component-transform')).toBeInTheDocument();
  });

  it('adds a new node when a component is selected', () => {
    const handleNodesChange = jest.fn();

    render(
      <TestIntegrationFlowCanvas
        initialNodes={[]}
        initialEdges={[]}
        onSave={() => {}}
        onRun={() => {}}
        onNodesChange={handleNodesChange}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Open component dialog
    fireEvent.click(screen.getByTestId('add-component-button'));

    // Select a component
    fireEvent.click(screen.getByTestId('select-source'));

    // Dialog should close
    expect(screen.queryByTestId('component-dialog')).not.toBeInTheDocument();

    // A new node should be added
    expect(handleNodesChange).toHaveBeenCalled();
    expect(handleNodesChange.mock.calls[0][0].length).toBe(1);

    // New node should be selected
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();
  });

  it('adds a connected node using "Add Next Step"', () => {
    const handleNodesChange = jest.fn();
    const handleEdgesChange = jest.fn();

    render(
      <TestIntegrationFlowCanvas
        initialNodes={sampleNodes}
        initialEdges={sampleEdges}
        onSave={() => {}}
        onRun={() => {}}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Select a node
    fireEvent.click(screen.getByTestId('node-source-1'));

    // Click Add Next Step in properties panel
    fireEvent.click(screen.getByTestId('add-next-action-button'));

    // Component dialog should open
    expect(screen.getByTestId('component-dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Next Step After API Source')).toBeInTheDocument();

    // Select a component
    fireEvent.click(screen.getByTestId('select-destination'));

    // New node should be added and connected
    expect(handleNodesChange).toHaveBeenCalled();
    expect(handleEdgesChange).toHaveBeenCalled();
  });

  it('toggles debug mode when debug button is clicked', () => {
    render(
      <TestIntegrationFlowCanvas
        initialNodes={sampleNodes}
        initialEdges={sampleEdges}
        onSave={() => {}}
        onRun={() => {}}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Initially, debug mode should be off
    expect(screen.queryByTestId('data-inspector')).not.toBeInTheDocument();

    // Enable debug mode
    fireEvent.click(screen.getByTestId('debug-button'));

    // Click a node to open data inspector
    fireEvent.click(screen.getByTestId('node-source-1'));

    // Data inspector should now be visible
    expect(screen.getByTestId('data-inspector')).toBeInTheDocument();

    // Disable debug mode
    fireEvent.click(screen.getByTestId('debug-button'));

    // Data inspector should be hidden
    expect(screen.queryByTestId('data-inspector')).not.toBeInTheDocument();
  });

  it('updates node properties when edited', () => {
    const handleNodesChange = jest.fn();

    render(
      <TestIntegrationFlowCanvas
        initialNodes={sampleNodes}
        initialEdges={sampleEdges}
        onSave={() => {}}
        onRun={() => {}}
        onNodesChange={handleNodesChange}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Select a node
    fireEvent.click(screen.getByTestId('node-source-1'));

    // Edit its label
    fireEvent.change(screen.getByTestId('node-label-input'), {
      target: { value: 'Updated API Source' },
    });

    // Node should be updated
    expect(handleNodesChange).toHaveBeenCalled();

    // Edit description
    fireEvent.change(screen.getByTestId('node-description-input'), {
      target: { value: 'Updated description' },
    });

    // Node should be updated again
    expect(handleNodesChange).toHaveBeenCalledTimes(2);
  });

  it('deletes a node when delete button is clicked', () => {
    const handleNodesChange = jest.fn();
    const handleEdgesChange = jest.fn();

    render(
      <TestIntegrationFlowCanvas
        initialNodes={sampleNodes}
        initialEdges={sampleEdges}
        onSave={() => {}}
        onRun={() => {}}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Select a node
    fireEvent.click(screen.getByTestId('node-source-1'));

    // Delete it
    fireEvent.click(screen.getByTestId('delete-node-action-button'));

    // Node should be deleted
    expect(handleNodesChange).toHaveBeenCalled();
    expect(handleNodesChange.mock.calls[0][0].length).toBe(1); // Only one node left

    // Connected edge should also be deleted
    expect(handleEdgesChange).toHaveBeenCalled();
    expect(handleEdgesChange.mock.calls[0][0].length).toBe(0); // No edges left
  });

  it('calls onSave when save button is clicked', () => {
    const handleSave = jest.fn();

    render(
      <TestIntegrationFlowCanvas
        initialNodes={sampleNodes}
        initialEdges={sampleEdges}
        onSave={handleSave}
        onRun={() => {}}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Click save button
    fireEvent.click(screen.getByTestId('save-button'));

    // onSave should be called
    expect(handleSave).toHaveBeenCalled();
  });

  it('calls onRun when test button is clicked', () => {
    const handleRun = jest.fn();

    render(
      <TestIntegrationFlowCanvas
        initialNodes={sampleNodes}
        initialEdges={sampleEdges}
        onSave={() => {}}
        onRun={handleRun}
        availableComponents={sampleAvailableComponents}
      />
    );

    // Click test button
    fireEvent.click(screen.getByTestId('run-button'));

    // onRun should be called
    expect(handleRun).toHaveBeenCalled();
  });
});
