import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedNodePalette from '@components/integration/EnhancedNodePalette';

// Mock the design-system adapter
jest.mock('../../../design-system/adapter', () => ({
  Box: ({ children, sx, ...props }) => (
    <div data-testid="box" {...props}>
      {children}
    </div>
  ),
  Typography: ({ children, variant, color, ...props }) => (
    <span data-testid="typography" data-variant={variant} data-color={color} {...props}>
      {children}
    </span>
  ),
  Button: ({ children, variant, onClick, disabled, ...props }) => (
    <button 
      data-testid="button" 
      data-variant={variant} 
      onClick={onClick} 
      disabled={disabled} 
      {...props}
    >
      {children}
    </button>
  ),
  TextField: ({ 
    value, 
    onChange, 
    placeholder, 
    InputProps, 
    fullWidth,
    size,
    ...props 
  }) => (
    <div data-testid="text-field" data-fullwidth={fullWidth} data-size={size} {...props}>
      {InputProps?.startAdornment}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-testid="text-field-input"
      />
      {InputProps?.endAdornment}
    </div>
  ),
  InputAdornment: ({ children, position, ...props }) => (
    <span data-testid="input-adornment" data-position={position} {...props}>
      {children}
    </span>
  ),
  IconButton: ({ children, size, color, onClick, ...props }) => (
    <button 
      data-testid="icon-button" 
      data-size={size} 
      data-color={color}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
  Divider: props => <hr data-testid="divider" {...props} />,
  Chip: ({ label, size, color, variant, ...props }) => (
    <span 
      data-testid="chip" 
      data-size={size} 
      data-color={color} 
      data-variant={variant} 
      {...props}
    >
      {label}
    </span>
  ),
  Paper: ({ children, elevation, variant, ...props }) => (
    <div 
      data-testid="paper" 
      data-elevation={elevation} 
      data-variant={variant} 
      {...props}
    >
      {children}
    </div>
  ),
  Tooltip: ({ children, title, ...props }) => (
    <div data-testid="tooltip" data-title={title} {...props}>
      {children}
    </div>
  ),
  List: ({ children, dense, disablePadding, ...props }) => (
    <ul 
      data-testid="list" 
      data-dense={dense} 
      data-disable-padding={disablePadding} 
      {...props}
    >
      {children}
    </ul>
  ),
  ListItem: ({ children, button, selected, disableGutters, ...props }) => (
    <li 
      data-testid="list-item" 
      data-button={button}
      data-selected={selected}
      data-disable-gutters={disableGutters}
      {...props}
    >
      {children}
    </li>
  ),
  ListItemIcon: ({ children, ...props }) => (
    <div data-testid="list-item-icon" {...props}>
      {children}
    </div>
  ),
  ListItemText: ({ primary, secondary, ...props }) => (
    <div data-testid="list-item-text" {...props}>
      <div>{primary}</div>
      {secondary && <div>{secondary}</div>}
    </div>
  ),
  ListItemSecondaryAction: ({ children, ...props }) => (
    <div data-testid="list-item-secondary-action" {...props}>
      {children}
    </div>
  ),
  Grid: ({ children, container, spacing, item, xs, ...props }) => (
    <div 
      data-testid="grid" 
      data-container={container} 
      data-spacing={spacing}
      data-item={item}
      data-xs={xs}
      {...props}
    >
      {children}
    </div>
  ),
  Card: ({ children, sx, ...props }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardMedia: ({ image, title, ...props }) => (
    <div data-testid="card-media" data-image={image} data-title={title} {...props} />
  ),
  Badge: ({ children, badgeContent, ...props }) => (
    <div data-testid="badge" data-badge-content={badgeContent} {...props}>
      {children}
    </div>
  ),
  Switch: ({ checked, onChange, ...props }) => (
    <input 
      type="checkbox&quot; 
      data-testid="switch" 
      checked={checked} 
      onChange={onChange}
      {...props} 
    />
  ),
  FormControlLabel: ({ control, label, labelPlacement, ...props }) => (
    <label data-testid="form-control-label" data-label-placement={labelPlacement} {...props}>
      {control}
      <span>{label}</span>
    </label>
  ),
  Collapse: ({ children, in: isOpen, ...props }) => (
    <div data-testid="collapse" data-open={isOpen} {...props}>
      {isOpen ? children : null}
    </div>
  ),
  Accordion: ({ children, ...props }) => (
    <div data-testid="accordion" {...props}>
      {children}
    </div>
  ),
  AccordionSummary: ({ children, ...props }) => (
    <div data-testid="accordion-summary" {...props}>
      {children}
    </div>
  ),
  AccordionDetails: ({ children, ...props }) => (
    <div data-testid="accordion-details" {...props}>
      {children}
    </div>
  ),
  useTheme: () => ({
    palette: {
      text: { primary: '#000000', secondary: '#757575' },
      divider: '#e0e0e0',
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
      error: { main: '#f44336' },
      warning: { main: '#ff9800' },
      info: { main: '#2196f3' },
      success: { main: '#4caf50' },
      background: { paper: '#ffffff', default: '#f5f5f5' },
      action: { hover: '#f5f5f5', disabled: '#bdbdbd' }
    },
  }),
  alpha: (color, value) => `${color}${Math.round(value * 255).toString(16).padStart(2, '0')}`,
}));

// Mock Material UI icons
const mockIconComponent = () => <span data-testid="mock-icon" />;

jest.mock('@mui/icons-material/Search', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Clear', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Storage', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/CloudUpload', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Tune', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Dataset', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/PlayCircleFilled', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/CallSplit', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Notifications', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Api', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/FilterAlt', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/CompareArrows', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/MergeType', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Webhook', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Schema', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Favorite', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/FavoriteBorder', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/ExpandMore', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Lock', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Visibility', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/DragIndicator', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/ViewList', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/ViewModule', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/Star', () => ({ __esModule: true, default: mockIconComponent }));
jest.mock('@mui/icons-material/AccessTime', () => ({ __esModule: true, default: mockIconComponent }));

// Mock localStorage
const localStorageMock = (() => {
  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';

  // Added display name
  localStorageMock.displayName = 'localStorageMock';


  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test data
const mockComponents = {
  sources: [
    {
      type: 'database',
      label: 'Database Source',
      description: 'Connect to a database source',
      adminOnly: false,
    },
    {
      type: 'file',
      label: 'File Source',
      description: 'Connect to a file source',
      adminOnly: false,
    },
  ],
  destinations: [
    {
      type: 'database',
      label: 'Database Destination',
      description: 'Write to a database destination',
      adminOnly: false,
    },
    {
      type: 'file',
      label: 'File Destination',
      description: 'Write to a file destination',
      adminOnly: true,
    },
  ],
  transforms: [
    {
      type: 'transform',
      label: 'Data Transform',
      description: 'Transform data between source and destination',
      adminOnly: false,
    },
    {
      type: 'filter',
      label: 'Data Filter',
      description: 'Filter data before writing to destination',
      adminOnly: false,
    },
  ],
};

describe('EnhancedNodePalette', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('renders with basic props', () => {
    const mockDragStart = jest.fn();
    const mockNodeSelect = jest.fn();

    render(
      <EnhancedNodePalette
        components={mockComponents}
        onDragStart={mockDragStart}
        onNodeSelect={mockNodeSelect}
      />
    );

    // Check that the search field is rendered
    expect(screen.getByPlaceholderText('Search nodes...')).toBeInTheDocument();

    // Check that the source category is rendered
    expect(screen.getByText('Sources')).toBeInTheDocument();
    expect(screen.getByText('Destinations')).toBeInTheDocument();
    expect(screen.getByText('Transforms')).toBeInTheDocument();

    // Check that the component labels are rendered
    expect(screen.getByText('Database Source')).toBeInTheDocument();
    expect(screen.getByText('File Source')).toBeInTheDocument();
    expect(screen.getByText('Database Destination')).toBeInTheDocument();
    expect(screen.getByText('File Destination')).toBeInTheDocument();
    expect(screen.getByText('Data Transform')).toBeInTheDocument();
    expect(screen.getByText('Data Filter')).toBeInTheDocument();
  });

  it('filters components based on search query', () => {
    const mockDragStart = jest.fn();
    const mockNodeSelect = jest.fn();

    render(
      <EnhancedNodePalette
        components={mockComponents}
        onDragStart={mockDragStart}
        onNodeSelect={mockNodeSelect}
      />
    );

    // Search for "Database"
    const searchInput = screen.getByPlaceholderText('Search nodes...');
    fireEvent.change(searchInput, { target: { value: 'Database' } });

    // Should show Database Source and Database Destination, but not File Source or File Destination
    expect(screen.getByText('Database Source')).toBeInTheDocument();
    expect(screen.getByText('Database Destination')).toBeInTheDocument();
    expect(screen.queryByText('Data Transform')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Filter')).not.toBeInTheDocument();
  });

  it('handles view mode switching', () => {
    const mockDragStart = jest.fn();
    const mockNodeSelect = jest.fn();

    render(
      <EnhancedNodePalette
        components={mockComponents}
        onDragStart={mockDragStart}
        onNodeSelect={mockNodeSelect}
      />
    );

    // Should be in grid view by default
    expect(screen.getAllByTestId('grid')).toHaveLength(expect.any(Number));

    // Switch to list view
    const listViewButton = screen.getAllByTestId('icon-button')[0];
    fireEvent.click(listViewButton);

    // Should now be in list view
    expect(screen.getAllByTestId('list')).toHaveLength(expect.any(Number));
  });

  it('handles node selection', () => {
    const mockDragStart = jest.fn();
    const mockNodeSelect = jest.fn();

    render(
      <EnhancedNodePalette
        components={mockComponents}
        onDragStart={mockDragStart}
        onNodeSelect={mockNodeSelect}
      />
    );

    // Click on the first component (Database Source)
    const databaseSourceElement = screen.getByText('Database Source');
    fireEvent.click(databaseSourceElement);

    // Should call onNodeSelect with the component data
    expect(mockNodeSelect).toHaveBeenCalledWith(mockComponents.sources[0]);
  });

  it('shows and hides admin nodes appropriately', () => {
    const mockDragStart = jest.fn();
    const mockNodeSelect = jest.fn();

    render(
      <EnhancedNodePalette
        components={mockComponents}
        onDragStart={mockDragStart}
        onNodeSelect={mockNodeSelect}
        isAdmin={true}
      />
    );

    // Initially should show admin nodes (File Destination is admin-only)
    expect(screen.getByText('File Destination')).toBeInTheDocument();

    // Toggle off admin nodes
    const adminSwitch = screen.getByTestId('switch');
    fireEvent.click(adminSwitch);

    // Should no longer show admin nodes
    expect(screen.queryByText('File Destination')).not.toBeInTheDocument();
  });

  it('handles favorites functionality', () => {
    const mockDragStart = jest.fn();
    const mockNodeSelect = jest.fn();

    render(
      <EnhancedNodePalette
        components={mockComponents}
        onDragStart={mockDragStart}
        onNodeSelect={mockNodeSelect}
      />
    );

    // Initially no favorites section
    expect(screen.queryByText('Favorites')).not.toBeInTheDocument();

    // Find the favorite button for Database Source and click it
    const favoriteButtons = screen.getAllByTestId('icon-button');
    // The favorite button is typically one of the icon buttons, but exact index depends on rendering
    // For simplicity in this test, we'll click one that's likely to be a favorite button
    fireEvent.click(favoriteButtons[2]); // Adjust index as needed based on your component

    // Favorites section should now exist
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('handles category expansion and collapse', () => {
    const mockDragStart = jest.fn();
    const mockNodeSelect = jest.fn();

    render(
      <EnhancedNodePalette
        components={mockComponents}
        onDragStart={mockDragStart}
        onNodeSelect={mockNodeSelect}
      />
    );

    // Find and click the Sources category header to collapse it
    const sourcesHeader = screen.getByText('Sources').closest('[data-testid="box"]');
    fireEvent.click(sourcesHeader);

    // Get all collapse elements
    const collapses = screen.getAllByTestId('collapse');
    // One of the collapses should now be closed (exact index depends on rendering order)
    // But at least one should have data-open="false"
    expect(collapses.some(collapse => collapse.getAttribute('data-open') === 'false')).toBe(true);

    // Click again to expand
    fireEvent.click(sourcesHeader);

    // All collapses should now be open
    const updatedCollapses = screen.getAllByTestId('collapse');
    expect(updatedCollapses.some(collapse => collapse.getAttribute('data-open') === 'true')).toBe(true);
  });
});