import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DataPreviewPanel from '@components/integration/DataPreviewPanel';
import { LinearProgress } from '../../design-system';
// Design system import already exists;
;

// Mock the design-system adapter
jest.mock('../../../design-system/adapter', () => ({
  Box: ({ children, style, ...props }) => <div data-testid="box" {...props}>{children}</div>,
  Typography: ({ children, variant, color, ...props }) => (
    <span data-testid="typography" data-variant={variant} data-color={color} {...props}>
      {children}
    </span>
  ),
  Button: ({ children, variant, startIcon, disabled, ...props }) => (
    <button data-testid="button" data-variant={variant} disabled={disabled} {...props}>
      {startIcon && <span data-testid="button-icon"></span>}
      {children}
    </button>
  ),
  TextField: ({ value, onChange, placeholder, startAdornment, endAdornment, ...props }) => (
    <div data-testid="text-field" {...props}>
      {startAdornment}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-testid="text-field-input"
      />
      {endAdornment}
    </div>
  ),
  Tabs: ({ children, value, onChange, ...props }) => (
    <div data-testid="tabs" data-value={value} {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { 
          onClick: () => onChange({}, child.props.value),
          'data-selected': child.props.value === value
        })
      )}
    </div>
  ),
  Tab: ({ label, value, ...props }) => (
    <button data-testid="tab" data-value={value} {...props}>
      {label}
    </button>
  ),
  Chip: ({ label, icon, size, color, variant, ...props }) => (
    <span 
      data-testid="chip" 
      data-size={size} 
      data-color={color} 
      data-variant={variant} 
      {...props}
    >
      {icon && <span data-testid="chip-icon"></span>}
      {label}
    </span>
  ),
  Alert: ({ children, severity, ...props }) => (
    <div data-testid="alert" data-severity={severity} {...props}>
      {children}
    </div>
  ),
  CircularProgress: ({ size, ...props }) => (
    <div data-testid="circular-progress" data-size={size} {...props}></div>
  ),
  Table: ({ children, size, stickyHeader, ...props }) => (
    <table data-testid="table" data-size={size} {...props}>
      {children}
    </table>
  ),
  useTheme: () => ({
    palette: {
      text: { primary: '#000000', secondary: '#757575' },
      divider: '#e0e0e0',
      primary: { main: '#1976d2' },
      action: { hover: '#f5f5f5', disabled: '#bdbdbd' },
      success: { main: '#4caf50' },
      error: { main: '#f44336' },
      warning: { main: '#ff9800' }
    }
  })
}));

// Mock the Material UI components
jest.mock('@mui/material', () => ({
  Paper: ({ children, variant, ...props }) => (
    <div data-testid="paper" data-variant={variant} {...props}>
      {children}
    </div>
  ),
  IconButton: ({ children, size, ...props }) => (
    <button data-testid="icon-button" data-size={size} {...props}>
      {children}
    </button>
  ),
  Divider: props => <hr data-testid="divider" {...props} />,
  InputAdornment: ({ children, position, ...props }) => (
    <div data-testid="input-adornment" data-position={position} {...props}>
      {children}
    </div>
  ),
  FormControl: ({ children, fullWidth, size, ...props }) => (
    <div data-testid="form-control" data-fullwidth={fullWidth} data-size={size} {...props}>
      {children}
    </div>
  ),
  Select: ({ children, value, label, onChange, disabled, ...props }) => (
    <select 
      data-testid="select" 
      value={value} 
      onChange={onChange} 
      disabled={disabled} 
      aria-label={label}
      {...props}
    >
      {children}
    </select>
  ),
  MenuItem: ({ children, value, ...props }) => (
    <option data-testid="menu-item" value={value} {...props}>
      {children}
    </option>
  ),
  InputLabel: ({ children, ...props }) => (
    <label data-testid="input-label" {...props}>
      {children}
    </label>
  ),
  Tab: props => <div data-testid="mui-tab" {...props} />,
  TableBody: ({ children, ...props }) => (
    <tbody data-testid="table-body" {...props}>
      {children}
    </tbody>
  ),
  TableCell: ({ children, align, component, colSpan, ...props }) => (
    <td 
      data-testid="table-cell" 
      data-align={align} 
      data-component={component} 
      colSpan={colSpan} 
      {...props}
    >
      {children}
    </td>
  ),
  TableContainer: ({ children, component, ...props }) => (
    <div data-testid="table-container" {...props}>
      {children}
    </div>
  ),
  TableHead: ({ children, ...props }) => (
    <thead data-testid="table-head" {...props}>
      {children}
    </thead>
  ),
  TableRow: ({ children, hover, ...props }) => (
    <tr data-testid="table-row" data-hover={hover} {...props}>
      {children}
    </tr>
  ),
  TablePagination: ({ 
    count, 
    page, 
    rowsPerPage, 
    onPageChange, 
    onRowsPerPageChange,
    ...props 
  }) => (
    <div 
      data-testid="table-pagination" 
      data-count={count} 
      data-page={page} 
      data-rows-per-page={rowsPerPage} 
      {...props}
    >
      <button 
        data-testid="previous-page-button" 
        onClick={() => onPageChange({}, page - 1)}
        disabled={page === 0}
      >
        Previous
      </button>
      <button 
        data-testid="next-page-button" 
        onClick={() => onPageChange({}, page + 1)}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
      >
        Next
      </button>
      <select 
        data-testid="rows-per-page-select" 
        value={rowsPerPage}
        onChange={e => onRowsPerPageChange({ target: { value: Number(e.target.value) } })}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
      </select>
    </div>
  ),
  Tooltip: ({ children, title, ...props }) => (
    <div data-testid="tooltip" data-title={title} {...props}>
      {children}
    </div>
  ),
  Collapse: ({ children, in: isOpen, ...props }) => (
    <div data-testid="collapse" data-open={isOpen} {...props}>
      {isOpen ? children : null}
    </div>
  ),
  Stack: ({ children, direction, spacing, ...props }) => (
    <div 
      data-testid="stack" 
      data-direction={direction} 
      data-spacing={spacing} 
      {...props}
    >
      {children}
    </div>
  ),
  Switch: props => <input type="checkbox&quot; data-testid="switch" {...props} />,
  FormControlLabel: ({ control, label, ...props }) => (
    <label data-testid="form-control-label" {...props}>
      {control}
      {label}
    </label>
  ),
  LinearProgress: props => <div data-testid="linear-progress" {...props} />,
  useTheme: () => ({
    palette: {
      text: { primary: '#000', secondary: '#757575' },
      divider: '#e0e0e0',
      primary: { main: '#1976d2' },
      action: { hover: '#f5f5f5', disabled: '#bdbdbd' },
      success: { main: '#4caf50' },
      error: { main: '#f44336' },
      warning: { main: '#ff9800' }
    }
  })
}));

// Mock data
const mockNodes = [
  {
    id: 'node1',
    type: 'source',
    data: { label: 'Source Node' }
  },
  {
    id: 'node2',
    type: 'transform',
    data: { label: 'Transform Node' }
  },
  {
    id: 'node3',
    type: 'destination',
    data: { label: 'Destination Node' }
  }
];

const mockEdges = [
  { id: 'edge1', source: 'node1', target: 'node2' },
  { id: 'edge2', source: 'node2', target: 'node3' }
];

const mockPreviewData = {
  node1: {
    data: [
      { id: 1, name: 'Alice', age: 28, active: true },
      { id: 2, name: 'Bob', age: 34, active: false },
      { id: 3, name: 'Charlie', age: 42, active: true }
    ]
  },
  node2: {
    data: [
      { id: 1, name: 'Alice', age: 28, active: true, processed: true },
      { id: 2, name: 'Bob', age: 34, active: false, processed: true },
      { id: 3, name: 'Charlie', age: 42, active: true, processed: true }
    ]
  }
};

describe('DataPreviewPanel', () => {
  test('renders with minimal props', () => {
    render(<DataPreviewPanel />);
    
    // Should render tabs
    expect(screen.getByText('Node Preview')).toBeInTheDocument();
    expect(screen.getByText('Flow View')).toBeInTheDocument();
    expect(screen.getByText('Debug')).toBeInTheDocument();
    
    // Should show empty state message when no nodes are provided
    expect(screen.getByText('Select a node to preview its data.')).toBeInTheDocument();
  });

  test('renders with nodes and selects first node by default', () => {
    render(
      <DataPreviewPanel
        nodes={mockNodes}
        edges={mockEdges}
        previewData={{}}
      />
    );
    
    // Should have a select with the nodes
    const select = screen.getByTestId('select');
    expect(select).toBeInTheDocument();
    
    // First node should be selected by default
    expect(select).toHaveValue('node1');
    
    // Should display message for empty preview data
    expect(screen.getByText('No preview data available for this node.')).toBeInTheDocument();
  });

  test('displays preview data for selected node', () => {
    render(
      <DataPreviewPanel
        nodes={mockNodes}
        edges={mockEdges}
        previewData={mockPreviewData}
      />
    );
    
    // Should show record count for the selected node
    expect(screen.getByText('3 records')).toBeInTheDocument();
    
    // Should render the data table
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  test('allows switching between nodes', () => {
    render(
      <DataPreviewPanel
        nodes={mockNodes}
        edges={mockEdges}
        previewData={mockPreviewData}
      />
    );
    
    // First node should be selected initially
    expect(screen.getByText('Source Node')).toBeInTheDocument();
    
    // Change to the second node
    fireEvent.change(screen.getByTestId('select'), { target: { value: 'node2' } });
    
    // Should show info for the second node
    expect(screen.getByText('Transform Node')).toBeInTheDocument();
  });

  test('switches between view modes', () => {
    render(
      <DataPreviewPanel
        nodes={mockNodes}
        edges={mockEdges}
        previewData={mockPreviewData}
      />
    );
    
    // Table view should be active by default
    expect(screen.getByTestId('table')).toBeInTheDocument();
    
    // Switch to JSON view
    const jsonButton = screen.getAllByTestId('box')
      .find(el => el.textContent.includes('JSON View'));
    fireEvent.click(jsonButton);
    
    // Should now show JSON data
    expect(screen.getByText(/"name": "Alice"/)).toBeInTheDocument();
  });

  test('shows statistics when stats button is clicked', () => {
    render(
      <DataPreviewPanel
        nodes={mockNodes}
        edges={mockEdges}
        previewData={mockPreviewData}
      />
    );
    
    // Stats should be hidden initially
    expect(screen.queryByText('Data Statistics')).not.toBeInTheDocument();
    
    // Click stats button
    const statsButton = screen.getAllByTestId('box')
      .find(el => el.textContent.includes('Statistics'));
    fireEvent.click(statsButton);
    
    // Stats should now be visible
    expect(screen.getByText('Data Statistics')).toBeInTheDocument();
  });

  test('handles search filtering', () => {
    render(
      <DataPreviewPanel
        nodes={mockNodes}
        edges={mockEdges}
        previewData={mockPreviewData}
      />
    );
    
    // Initially all 3 records should be displayed
    expect(screen.getByText('3 records')).toBeInTheDocument();
    
    // Search for 'Alice'
    const searchInput = screen.getByTestId('text-field-input');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });
    
    // Now only Alice's record should match
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  test('calls onFetchPreview when refresh button is clicked', () => {
    const mockFetchPreview = jest.fn();
    
    render(
      <DataPreviewPanel
        nodes={mockNodes}
        edges={mockEdges}
        previewData={mockPreviewData}
        onFetchPreview={mockFetchPreview}
      />
    );
    
    // Click refresh button
    const refreshButton = screen.getAllByTestId('box')
      .find(el => el.textContent.includes('Refresh Data'));
    fireEvent.click(refreshButton);
    
    // Should call onFetchPreview with the selected node id
    expect(mockFetchPreview).toHaveBeenCalledWith('node1');
  });

  test('shows loading state when loading prop is true', () => {
    render(
      <DataPreviewPanel
        nodes={mockNodes}
        edges={mockEdges}
        previewData={mockPreviewData}
        loading={true}
      />
    );
    
    // Should display loading indicator
    expect(screen.getByTestId('linear-progress')).toBeInTheDocument();
  });

  test('switches to different tabs', () => {
    render(
      <DataPreviewPanel
        nodes={mockNodes}
        edges={mockEdges}
        previewData={mockPreviewData}
      />
    );
    
    // Should be on node preview tab by default
    expect(screen.getByText('3 records')).toBeInTheDocument();
    
    // Switch to flow view tab
    fireEvent.click(screen.getByText('Flow View'));
    
    // Should show flow view content
    expect(screen.getByText(/Flow data visualization is not implemented/)).toBeInTheDocument();
    
    // Switch to debug tab
    fireEvent.click(screen.getByText('Debug'));
    
    // Should show debug content
    expect(screen.getByText(/Debugging tools are not implemented/)).toBeInTheDocument();
  });
});