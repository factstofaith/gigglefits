// node-properties-panel-select-migration.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NodePropertiesPanel from '../../components/integration/NodePropertiesPanel';
import { Select } from '../../design-system/legacy';

// Mock the legacy components
jest.mock('../../design-system/legacy', () => ({
  SelectLegacy: jest.fn(({ value, onChange, options }) => {
    return (
      <select data-testid="select-legacy-mock" value={value} onChange={onChange}>
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }),
}));

describe('NodePropertiesPanel - Select Migration Tests', () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // A helper function for setting up component renders with different node types
  const setupNodeProperties = nodeType => {
    const mockOnNodeUpdate = jest.fn();
    const mockElement = {
      type: 'node',
      data: {
        id: 'test-node-1',
        type: `${nodeType}Node`,
        data: {
          label: `Test ${nodeType} Node`,
        },
      },
    };

    return {
      ...render(
        <NodePropertiesPanel
          element={mockElement}
          onNodeUpdate={mockOnNodeUpdate}
          onDeleteNode={jest.fn()}
          onAddNextNode={jest.fn()}
          onClose={jest.fn()}
        />
      ),
      mockOnNodeUpdate,
      mockElement,
    };
  };

  it('renders source node specific select options correctly', () => {
    const { getAllByTestId } = setupNodeProperties('source');

    // The source node should have 1 select - Authentication Method
    const selects = getAllByTestId('select-legacy-mock');
    expect(selects).toHaveLength(1);

    // Check the SelectLegacy component was called with the right props
    expect(SelectLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Authentication Method',
        options: [
          { value: 'none', label: 'No Authentication' },
          { value: 'basic', label: 'Basic Auth' },
          { value: 'oauth2', label: 'OAuth 2.0' },
          { value: 'api_key', label: 'API Key' },
        ],
      }),
      expect.anything()
    );
  });

  it('renders destination node specific select options correctly', () => {
    const { getAllByTestId } = setupNodeProperties('destination');

    // The destination node should have 1 select - Write Mode
    const selects = getAllByTestId('select-legacy-mock');
    expect(selects).toHaveLength(1);

    // Check the SelectLegacy component was called with the right props
    expect(SelectLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Write Mode',
        options: [
          { value: 'append', label: 'Append' },
          { value: 'overwrite', label: 'Overwrite' },
          { value: 'upsert', label: 'Upsert' },
        ],
      }),
      expect.anything()
    );
  });

  it('renders transform node specific select options correctly', () => {
    const { getAllByTestId } = setupNodeProperties('transform');

    // The transform node should have 1 select - Transform Type
    const selects = getAllByTestId('select-legacy-mock');
    expect(selects).toHaveLength(1);

    // Check the SelectLegacy component was called with the right props
    expect(SelectLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Transform Type',
        options: expect.arrayContaining([
          { value: 'filter', label: 'Filter' },
          { value: 'map', label: 'Map' },
          { value: 'join', label: 'Join' },
          { value: 'aggregate', label: 'Aggregate' },
          { value: 'sort', label: 'Sort' },
          { value: 'transform', label: 'Custom Transform' },
        ]),
      }),
      expect.anything()
    );
  });

  it('renders dataset node specific select options correctly', () => {
    const { getAllByTestId } = setupNodeProperties('dataset');

    // The dataset node should have 1 select - Dataset Type
    const selects = getAllByTestId('select-legacy-mock');
    expect(selects).toHaveLength(1);

    // Check the SelectLegacy component was called with the right props
    expect(SelectLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Dataset Type',
        options: [
          { value: 'custom', label: 'Custom' },
          { value: 'standard', label: 'Standard' },
          { value: 'master', label: 'Master Data' },
          { value: 'reference', label: 'Reference' },
        ],
      }),
      expect.anything()
    );
  });

  it('renders trigger node specific select options correctly', () => {
    const { getAllByTestId } = setupNodeProperties('trigger');

    // Initially, the trigger node should have 1 select - Trigger Type
    const selects = getAllByTestId('select-legacy-mock');
    expect(selects).toHaveLength(1);

    // Check the SelectLegacy component was called with the right props
    expect(SelectLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Trigger Type',
        options: [
          { value: 'schedule', label: 'Schedule' },
          { value: 'webhook', label: 'Webhook' },
          { value: 'event', label: 'Event' },
        ],
      }),
      expect.anything()
    );
  });

  it('renders router node specific select options correctly', () => {
    const { getAllByTestId } = setupNodeProperties('router');

    // The router node should have 1 select - Router Type
    const selects = getAllByTestId('select-legacy-mock');
    expect(selects).toHaveLength(1);

    // Check the SelectLegacy component was called with the right props
    expect(SelectLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Router Type',
        options: [
          { value: 'fork', label: 'Fork' },
          { value: 'condition', label: 'Condition' },
          { value: 'switch', label: 'Switch' },
          { value: 'merge', label: 'Merge' },
        ],
      }),
      expect.anything()
    );
  });

  it('renders action node specific select options correctly', () => {
    const { getAllByTestId } = setupNodeProperties('action');

    // The action node should have 1 select - Action Type
    const selects = getAllByTestId('select-legacy-mock');
    expect(selects).toHaveLength(1);

    // Check the SelectLegacy component was called with the right props
    expect(SelectLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Action Type',
        options: [
          { value: 'notification', label: 'Notification' },
          { value: 'function', label: 'Function' },
          { value: 'delay', label: 'Delay' },
          { value: 'error', label: 'Error Handler' },
        ],
      }),
      expect.anything()
    );
  });

  it('renders edge specific select options correctly', () => {
    const mockOnEdgeUpdate = jest.fn();
    const mockElement = {
      type: 'edge',
      data: {
        id: 'test-edge-1',
        label: 'Test Edge',
        animated: false,
        style: { stroke: '#555', strokeWidth: 2 },
      },
    };

    const { getAllByTestId } = render(
      <NodePropertiesPanel
        element={mockElement}
        onEdgeUpdate={mockOnEdgeUpdate}
        onDeleteNode={jest.fn()}
        onClose={jest.fn()}
      />
    );

    // The edge should have 1 select - Connection Type
    const selects = getAllByTestId('select-legacy-mock');
    expect(selects).toHaveLength(1);

    // Check the SelectLegacy component was called with the right props
    expect(SelectLegacy).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Connection Type',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'straight', label: 'Straight' },
          { value: 'step', label: 'Step' },
          { value: 'smoothstep', label: 'Smooth Step' },
          { value: 'bezier', label: 'Bezier' },
        ],
      }),
      expect.anything()
    );
  });
});
