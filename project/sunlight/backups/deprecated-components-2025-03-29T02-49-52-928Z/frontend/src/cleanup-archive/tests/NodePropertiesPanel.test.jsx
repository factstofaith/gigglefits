import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
// This component has been replaced by ContextualPropertiesPanel
// Moving this test to the archive directory because the component has been removed
import { ThemeProvider } from '@design-system/foundations/theme';

// Mock the theme provider to avoid context errors
jest.mock('../../../design-system/foundations/theme', () => ({
  useTheme: () => ({ theme: { palette: { divider: '#ccc', text: { secondary: '#666' } } } }),
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>
}));

// Skipping these tests as NodePropertiesPanel has been replaced by ContextualPropertiesPanel
describe.skip('NodePropertiesPanel', () => {
  const mockNodeElement = {
    type: 'node',
    data: {
      id: 'node-1',
      type: 'sourceNode',
      data: {
        label: 'API Source',
        description: 'Fetches data from external API',
        system: 'REST API',
        connectionUrl: 'https://api.example.com',
        status: 'Connected'
      }
    }
  };

  const mockEdgeElement = {
    type: 'edge',
    data: {
      id: 'edge-1',
      label: 'Connection',
      animated: true,
      style: {
        stroke: '#555',
        strokeWidth: 2
      }
    }
  };

  const mockProps = {
    onNodeUpdate: jest.fn(),
    onEdgeUpdate: jest.fn(),
    onDeleteNode: jest.fn(),
    onAddNextNode: jest.fn(),
    onClose: jest.fn()
  };

  test('renders empty state when no element is selected', () => {
    render(
      <ThemeProvider initialMode="light&quot;>
        <NodePropertiesPanel {...mockProps} element={null} />
      </ThemeProvider>
    );
    
    expect(screen.getByText(/Select a node or edge to edit its properties/i)).toBeInTheDocument();
  });

  test("renders node properties when a node is selected', () => {
    render(
      <ThemeProvider initialMode="light&quot;>
        <NodePropertiesPanel {...mockProps} element={mockNodeElement} />
      </ThemeProvider>
    );
    
    expect(screen.getByText(/Source Properties/i)).toBeInTheDocument();
    expect(screen.getByText(/Label/i)).toBeInTheDocument();
    expect(screen.getByText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/System Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Connection URL/i)).toBeInTheDocument();
    
    // Verify form fields are populated with node data
    const labelInput = screen.getByDisplayValue("API Source');
    expect(labelInput).toBeInTheDocument();
    
    const descriptionInput = screen.getByDisplayValue('Fetches data from external API');
    expect(descriptionInput).toBeInTheDocument();
  });

  test('renders edge properties when an edge is selected', () => {
    render(
      <ThemeProvider initialMode="light&quot;>
        <NodePropertiesPanel {...mockProps} element={mockEdgeElement} />
      </ThemeProvider>
    );
    
    expect(screen.getByText(/Connection Properties/i)).toBeInTheDocument();
    expect(screen.getByText(/Connection Type/i)).toBeInTheDocument();
    expect(screen.getByText(/Animated/i)).toBeInTheDocument();
    expect(screen.getByText(/Styling/i)).toBeInTheDocument();
    expect(screen.getByText(/Stroke Width/i)).toBeInTheDocument();
    expect(screen.getByText(/Stroke Color/i)).toBeInTheDocument();
    
    // Verify switch is in correct state
    const animatedSwitch = screen.getByRole("checkbox', { name: /Animated/i });
    expect(animatedSwitch).toBeChecked();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <ThemeProvider initialMode="light&quot;>
        <NodePropertiesPanel {...mockProps} element={mockNodeElement} />
      </ThemeProvider>
    );
    
    const closeButton = screen.getByLabelText(/Close panel/i);
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test("calls onDeleteNode when delete button is clicked', () => {
    render(
      <ThemeProvider initialMode="light&quot;>
        <NodePropertiesPanel {...mockProps} element={mockNodeElement} />
      </ThemeProvider>
    );
    
    const deleteButton = screen.getByText(/Delete/i);
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDeleteNode).toHaveBeenCalledWith("node-1');
  });

  test('calls onAddNextNode when Add Next Step button is clicked', () => {
    render(
      <ThemeProvider initialMode="light&quot;>
        <NodePropertiesPanel {...mockProps} element={mockNodeElement} />
      </ThemeProvider>
    );
    
    const addButton = screen.getByText(/Add Next Step/i);
    fireEvent.click(addButton);
    
    expect(mockProps.onAddNextNode).toHaveBeenCalledWith(mockNodeElement.data);
  });

  test("calls handleSave when Apply button is clicked', () => {
    render(
      <ThemeProvider initialMode="light&quot;>
        <NodePropertiesPanel {...mockProps} element={mockNodeElement} />
      </ThemeProvider>
    );
    
    const applyButton = screen.getByText("Apply');
    fireEvent.click(applyButton);
    
    expect(mockProps.onNodeUpdate).toHaveBeenCalledWith('node-1', expect.any(Object));
  });

  test('switches between tabs correctly', () => {
    render(
      <ThemeProvider initialMode="light&quot;>
        <NodePropertiesPanel {...mockProps} element={mockNodeElement} />
      </ThemeProvider>
    );
    
    // Initially on Properties tab
    expect(screen.getByText(/Label/i)).toBeInTheDocument();
    
    // Click on Advanced tab
    const advancedTab = screen.getByText("Advanced');
    fireEvent.click(advancedTab);
    
    // Should show advanced properties
    expect(screen.getByText('Advanced Properties')).toBeInTheDocument();
    expect(screen.getByText('Enable Logging')).toBeInTheDocument();
    expect(screen.getByText('Pass-through on Failure')).toBeInTheDocument();
    expect(screen.getByText('Custom ID')).toBeInTheDocument();
  });
});