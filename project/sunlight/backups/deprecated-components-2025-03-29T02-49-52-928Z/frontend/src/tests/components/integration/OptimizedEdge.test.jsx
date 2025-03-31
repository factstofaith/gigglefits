import React from 'react';
import { render, screen } from '@testing-library/react';
import OptimizedEdge from '@components/integration/OptimizedEdge';

// Mock the useTheme hook from design system adapter
jest.mock('../../../design-system/adapter', () => ({
  useTheme: () => ({
    palette: {
      divider: '#e0e0e0',
      error: { main: '#f44336', light: '#ffcdd2' },
      warning: { main: '#ff9800', light: '#ffe0b2' },
      success: { main: '#4caf50', light: '#c8e6c9' },
      info: { main: '#2196f3', light: '#bbdefb' },
      text: { primary: '#000000' },
      getContrastText: () => '#ffffff',
      background: { paper: '#ffffff' }
    },
    typography: {
      fontFamily: 'Roboto, sans-serif'
    }
  })
}));

// Mock reactflow module - only getSmoothStepPath and EdgeText are used
jest.mock('reactflow', () => ({
  getSmoothStepPath: jest.fn(() => ['M 10,10 C 20,20 30,30 40,40']),
  EdgeText: ({ x, y, label, labelStyle, labelBgStyle, labelBgPadding }) => (
    <g transform={`translate(${x}, ${y})`}>
      <text data-testid="edge-text" style={labelStyle}>{label}</text>
    </g>
  )
}));

describe('OptimizedEdge', () => {
  const defaultProps = {
    id: 'edge-1',
    sourceX: 100,
    sourceY: 100,
    targetX: 300,
    targetY: 300,
    sourcePosition: 'right',
    targetPosition: 'left',
    markerEnd: 'url(#marker1)'
  };

  it('renders a basic edge without label', () => {
    // Arrange
    render(<OptimizedEdge {...defaultProps} />);
    
    // Assert
    const edge = screen.getByTestId('flow-edge-edge-1');
    expect(edge).toBeInTheDocument();
    expect(edge.tagName).toBe('path');
    expect(screen.queryByTestId('edge-text')).not.toBeInTheDocument();
  });

  it('renders an edge with label when provided', () => {
    // Arrange
    const props = {
      ...defaultProps,
      data: {
        label: 'Test Connection'
      }
    };
    
    // Act
    render(<OptimizedEdge {...props} />);
    
    // Assert
    const edge = screen.getByTestId('flow-edge-edge-1');
    expect(edge).toBeInTheDocument();
    expect(screen.getByText('Test Connection')).toBeInTheDocument();
  });

  it('applies dashed style for simplified edges', () => {
    // Arrange
    const props = {
      ...defaultProps,
      data: {
        isSimplified: true
      }
    };
    
    // Act
    render(<OptimizedEdge {...props} />);
    
    // Assert
    const edge = screen.getByTestId('flow-edge-edge-1');
    expect(edge).toHaveStyle('stroke-dasharray: 5,5');
  });

  it('hides label for simplified edges', () => {
    // Arrange
    const props = {
      ...defaultProps,
      data: {
        label: 'Hidden Label',
        isSimplified: true
      }
    };
    
    // Act
    render(<OptimizedEdge {...props} />);
    
    // Assert
    expect(screen.queryByText('Hidden Label')).not.toBeInTheDocument();
  });

  it('applies error style for error type edges', () => {
    // Arrange
    const props = {
      ...defaultProps,
      data: {
        label: 'Error Connection',
        type: 'error'
      }
    };
    
    // Act
    render(<OptimizedEdge {...props} />);
    
    // Assert
    const edge = screen.getByTestId('flow-edge-edge-1');
    expect(edge).toHaveStyle('stroke: #f44336');
  });

  it('applies success style for success type edges', () => {
    // Arrange
    const props = {
      ...defaultProps,
      data: {
        label: 'Success Connection',
        type: 'success'
      }
    };
    
    // Act
    render(<OptimizedEdge {...props} />);
    
    // Assert
    const edge = screen.getByTestId('flow-edge-edge-1');
    expect(edge).toHaveStyle('stroke: #4caf50');
  });

  it('applies warning style for warning type edges', () => {
    // Arrange
    const props = {
      ...defaultProps,
      data: {
        label: 'Warning Connection',
        type: 'warning'
      }
    };
    
    // Act
    render(<OptimizedEdge {...props} />);
    
    // Assert
    const edge = screen.getByTestId('flow-edge-edge-1');
    expect(edge).toHaveStyle('stroke: #ff9800');
  });

  it('merges custom style properties', () => {
    // Arrange
    const props = {
      ...defaultProps,
      style: {
        strokeWidth: 3,
        cursor: 'pointer'
      }
    };
    
    // Act
    render(<OptimizedEdge {...props} />);
    
    // Assert
    const edge = screen.getByTestId('flow-edge-edge-1');
    expect(edge).toHaveStyle('stroke-width: 3');
    expect(edge).toHaveStyle('cursor: pointer');
  });
});