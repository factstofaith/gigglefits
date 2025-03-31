import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FlowPerformanceMonitor from '@components/integration/FlowPerformanceMonitor';
import { OPTIMIZATION_SETTINGS } from '@utils/flowOptimizer';
import { LinearProgress } from '../../design-system';
// Design system import already exists;
;

// Mock theme
jest.mock('../../../design-system/adapter', () => ({
  Box: ({ children, sx, ...props }) => <div data-testid="box" {...props}>{children}</div>,
  Card: ({ children, sx, ...props }) => <div data-testid="card" {...props}>{children}</div>,
  Typography: ({ children, variant, sx, ...props }) => (
    <span data-variant={variant} data-testid="typography" {...props}>{children}</span>
  ),
  Chip: ({ label, color, size, ...props }) => (
    <span data-testid="chip" data-color={color} data-size={size} {...props}>{label}</span>
  ),
  IconButton: ({ children, size, ...props }) => (
    <button data-testid="icon-button" data-size={size} {...props}>{children}</button>
  ),
  Collapse: ({ children, in: isOpen, ...props }) => (
    <div data-testid="collapse" data-open={isOpen} {...props}>{isOpen ? children : null}</div>
  ),
  Divider: ({ sx, ...props }) => <hr data-testid="divider" {...props} />,
  Switch: ({ checked, ...props }) => (
    <input type="checkbox&quot; data-testid="switch" checked={checked} {...props} />
  ),
  FormControlLabel: ({ control, label, ...props }) => (
    <label data-testid="form-control-label" {...props}>
      {control}
      {label}
    </label>
  ),
  Tooltip: ({ title, children, ...props }) => (
    <div data-testid="tooltip" data-title={title} {...props}>{children}</div>
  ),
  LinearProgress: ({ variant, value, sx, ...props }) => (
    <div data-testid="linear-progress" data-value={value} data-variant={variant} {...props}></div>
  ),
  useTheme: () => ({
    palette: {
      primary: { main: '#1976d2' },
      text: { secondary: '#757575' },
      divider: '#e0e0e0',
      background: { paper: '#ffffff' }
    }
  })
}));

// Mock data
const mockRenderStats = {
  nodeCount: 120,
  visibleNodeCount: 50,
  edgeCount: 80,
  visibleEdgeCount: 30,
  bundledEdgeCount: 5,
  lastUpdateTime: Date.now()
};

const mockPerformanceMetrics = {
  renderTime: 25.5,
  updateTime: 10.2,
  fps: 45,
  memoryUsage: 15 * 1024 * 1024 // 15 MB
};

const mockRecommendations = {
  recommendations: [
    'Enable node virtualization for better performance',
    'Consider using edge bundling to reduce visual complexity'
  ]
};

const mockOptimizationConfig = {
  [OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION]: true,
  [OPTIMIZATION_SETTINGS.EDGE_BUNDLING]: false,
  [OPTIMIZATION_SETTINGS.DETAILED_LEVEL]: true
};

describe('FlowPerformanceMonitor', () => {
  it('renders with minimal props', () => {
    render(<FlowPerformanceMonitor />);
    
    // Should show the header
    expect(screen.getByText('Flow Performance')).toBeInTheDocument();
    
    // Should be collapsed by default
    expect(screen.getByTestId('collapse')).toHaveAttribute('data-open', 'false');
  });

  it('renders with expanded state when isExpanded prop is true', () => {
    render(<FlowPerformanceMonitor isExpanded={true} />);
    
    // Should be expanded
    expect(screen.getByTestId('collapse')).toHaveAttribute('data-open', 'true');
    
    // Should show metrics tab by default
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
  });

  it('displays performance metrics correctly', () => {
    render(
      <FlowPerformanceMonitor 
        performanceMetrics={mockPerformanceMetrics}
        renderStats={mockRenderStats}
        isExpanded={true}
      />
    );
    
    // FPS should be displayed
    expect(screen.getByText('45 FPS')).toBeInTheDocument();
    
    // Render time should be displayed
    expect(screen.getByText('25.5 ms render')).toBeInTheDocument();
    
    // Memory usage should be displayed
    expect(screen.getByText('15 MB')).toBeInTheDocument();
    
    // Node visibility should be displayed
    expect(screen.getByText('Nodes: 50 / 120 visible')).toBeInTheDocument();
  });

  it('displays recommendations when provided', () => {
    render(
      <FlowPerformanceMonitor 
        recommendations={mockRecommendations}
        isExpanded={true}
      />
    );
    
    // Should show recommendations section
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
    
    // Should show actual recommendations
    expect(screen.getByText('• Enable node virtualization for better performance')).toBeInTheDocument();
    expect(screen.getByText('• Consider using edge bundling to reduce visual complexity')).toBeInTheDocument();
  });

  it('switches between tabs when clicked', () => {
    render(<FlowPerformanceMonitor isExpanded={true} />);
    
    // Should start with metrics tab
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    
    // Click on settings tab
    fireEvent.click(screen.getByText('Settings'));
    
    // Should now show settings tab
    expect(screen.getByText('Optimization Settings')).toBeInTheDocument();
    expect(screen.queryByText('Performance Metrics')).not.toBeInTheDocument();
    
    // Click back to metrics tab
    fireEvent.click(screen.getByText('Metrics'));
    
    // Should now show metrics tab again
    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
    expect(screen.queryByText('Optimization Settings')).not.toBeInTheDocument();
  });

  it('toggles expanded state when clicking the expand button', () => {
    render(<FlowPerformanceMonitor />);
    
    // Should be collapsed initially
    expect(screen.getByTestId('collapse')).toHaveAttribute('data-open', 'false');
    
    // Click expand button
    fireEvent.click(screen.getByTestId('icon-button'));
    
    // Should now be expanded
    expect(screen.getByTestId('collapse')).toHaveAttribute('data-open', 'true');
    
    // Click collapse button
    fireEvent.click(screen.getByTestId('icon-button'));
    
    // Should be collapsed again
    expect(screen.getByTestId('collapse')).toHaveAttribute('data-open', 'false');
  });

  it('calls onOptimizationConfigChange when toggling optimization settings', () => {
    const handleConfigChange = jest.fn();
    
    render(
      <FlowPerformanceMonitor 
        optimizationConfig={mockOptimizationConfig}
        onOptimizationConfigChange={handleConfigChange}
        isExpanded={true}
      />
    );
    
    // Go to settings tab
    fireEvent.click(screen.getByText('Settings'));
    
    // Get all switches
    const switches = screen.getAllByTestId('switch');
    
    // Find the Node Virtualization switch (should be checked based on our mock config)
    const nodeVirtualizationSwitch = switches.find(switchElem => 
      switchElem.closest('label').textContent.includes('Node Virtualization')
    );
    
    // Toggle the switch
    fireEvent.click(nodeVirtualizationSwitch);
    
    // Check if the handler was called with expected arguments
    expect(handleConfigChange).toHaveBeenCalledWith({
      ...mockOptimizationConfig,
      [OPTIMIZATION_SETTINGS.NODE_VIRTUALIZATION]: false // Toggled from true to false
    });
  });

  it('shows appropriate optimization effectiveness based on flow size', () => {
    render(
      <FlowPerformanceMonitor 
        renderStats={{ ...mockRenderStats, nodeCount: 350 }} // Large flow
        optimizationConfig={mockOptimizationConfig}
        isExpanded={true}
      />
    );
    
    // Go to settings tab
    fireEvent.click(screen.getByText('Settings'));
    
    // Check for High effectiveness chip for node virtualization (which should be high for large flows)
    const chips = screen.getAllByTestId('chip');
    const highEffectivenessChips = chips.filter(chip => 
      chip.textContent === 'High' && 
      chip.getAttribute('data-color') === 'success'
    );
    
    // There should be at least one high effectiveness chip
    expect(highEffectivenessChips.length).toBeGreaterThan(0);
  });
});