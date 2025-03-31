import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VisualFieldMapper from '@components/integration/VisualFieldMapper';

// Mock the design-system adapter
jest.mock('../../../design-system/adapter', () => ({
  Box: ({ children, style, as, ...props }) => {
    const Component = as || 'div';
    return (
      <Component data-testid="box" style={style} {...props}>
        {children}
      </Component>
    );
  },
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
    startAdornment, 
    label, 
    ...props 
  }) => (
    <div data-testid="text-field" {...props}>
      {label && <label>{label}</label>}
      {startAdornment}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-testid="text-field-input"
      />
    </div>
  ),
  Tabs: ({ children, ...props }) => (
    <div data-testid="tabs" {...props}>
      {children}
    </div>
  ),
  Tab: ({ label, ...props }) => (
    <div data-testid="tab" {...props}>
      {label}
    </div>
  ),
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
  Alert: ({ children, severity, ...props }) => (
    <div data-testid="alert" data-severity={severity} {...props}>
      {children}
    </div>
  ),
  CircularProgress: ({ size, ...props }) => (
    <div data-testid="circular-progress" data-size={size} {...props} />
  ),
  useTheme: () => ({
    palette: {
      text: { primary: '#000000', secondary: '#757575' },
      divider: '#e0e0e0',
      primary: { main: '#1976d2' },
      action: { hover: '#f5f5f5', disabled: '#bdbdbd' },
      success: { main: '#4caf50' },
      error: { main: '#f44336' },
      warning: { main: '#ff9800' },
      background: { paper: '#ffffff', default: '#f5f5f5' }
    },
    shadows: {
      xs: '0px 1px 2px rgba(0, 0, 0, 0.05)'
    },
    typography: {
      fontWeights: {
        medium: 500
      }
    }
  })
}));

// Mock implementation for specific design system imports
jest.mock('../../../design-system/components/layout/Box', () => {
  return {
    __esModule: true,
    default: jest.requireMock('../../../design-system/adapter').Box
  };
});

jest.mock('../../../design-system/components/core/Typography', () => {
  return {
    __esModule: true,
    default: jest.requireMock('../../../design-system/adapter').Typography
  };
});

jest.mock('../../../design-system/components/core/Button', () => {
  return {
    __esModule: true,
    default: jest.requireMock('../../../design-system/adapter').Button
  };
});

jest.mock('../../../design-system/components/form/TextField', () => {
  return {
    __esModule: true,
    default: jest.requireMock('../../../design-system/adapter').TextField
  };
});

jest.mock('../../../design-system/components/navigation/Tabs', () => {
  const Tabs = jest.requireMock('../../../design-system/adapter').Tabs;
  Tabs.Tab = jest.requireMock('../../../design-system/adapter').Tab;
  return {
    __esModule: true,
    default: Tabs
  };
});

jest.mock('../../../design-system/components/display/Chip', () => {
  return {
    __esModule: true,
    default: jest.requireMock('../../../design-system/adapter').Chip
  };
});

jest.mock('../../../design-system/components/feedback/Alert', () => {
  return {
    __esModule: true,
    default: jest.requireMock('../../../design-system/adapter').Alert
  };
});

jest.mock('../../../design-system/components/feedback/CircularProgress', () => {
  return {
    __esModule: true,
    default: jest.requireMock('../../../design-system/adapter').CircularProgress
  };
});

jest.mock('../../../design-system/foundations/theme', () => ({
  useTheme: jest.requireMock('../../../design-system/adapter').useTheme
}));

// Mock Material UI components
jest.mock('@mui/material', () => ({
  Paper: ({ children, elevation, variant, ...props }) => (
    <div 
      data-testid="mui-paper" 
      data-elevation={elevation} 
      data-variant={variant} 
      {...props}
    >
      {children}
    </div>
  ),
  IconButton: ({ children, size, edge, ...props }) => (
    <button 
      data-testid="mui-icon-button" 
      data-size={size} 
      data-edge={edge} 
      {...props}
    >
      {children}
    </button>
  ),
  Divider: props => <hr data-testid="mui-divider" {...props} />,
  List: ({ children, dense, disablePadding, ...props }) => (
    <ul 
      data-testid="mui-list" 
      data-dense={dense} 
      data-disable-padding={disablePadding} 
      {...props}
    >
      {children}
    </ul>
  ),
  ListItem: ({ children, button, selected, disableGutters, ...props }) => (
    <li 
      data-testid="mui-list-item" 
      data-button={button}
      data-selected={selected}
      data-disable-gutters={disableGutters}
      {...props}
    >
      {children}
    </li>
  ),
  ListItemText: ({ primary, secondary, ...props }) => (
    <div data-testid="mui-list-item-text" {...props}>
      <div>{primary}</div>
      {secondary && <div>{secondary}</div>}
    </div>
  ),
  ListItemIcon: ({ children, ...props }) => (
    <div data-testid="mui-list-item-icon" {...props}>
      {children}
    </div>
  ),
  ListItemSecondaryAction: ({ children, ...props }) => (
    <div data-testid="mui-list-item-secondary-action" {...props}>
      {children}
    </div>
  ),
  Dialog: ({ children, open, ...props }) => (
    open ? (
      <div data-testid="mui-dialog" {...props}>
        {children}
      </div>
    ) : null
  ),
  DialogTitle: ({ children, ...props }) => (
    <div data-testid="mui-dialog-title" {...props}>
      {children}
    </div>
  ),
  DialogContent: ({ children, ...props }) => (
    <div data-testid="mui-dialog-content" {...props}>
      {children}
    </div>
  ),
  DialogActions: ({ children, ...props }) => (
    <div data-testid="mui-dialog-actions" {...props}>
      {children}
    </div>
  ),
  InputAdornment: ({ children, position, ...props }) => (
    <div data-testid="mui-input-adornment" data-position={position} {...props}>
      {children}
    </div>
  ),
  Menu: ({ children, open, ...props }) => (
    open ? (
      <div data-testid="mui-menu" {...props}>
        {children}
      </div>
    ) : null
  ),
  MenuItem: ({ children, value, ...props }) => (
    <div data-testid="mui-menu-item" data-value={value} {...props}>
      {children}
    </div>
  ),
  FormControl: ({ children, fullWidth, margin, ...props }) => (
    <div 
      data-testid="mui-form-control" 
      data-fullwidth={fullWidth}
      data-margin={margin}
      {...props}
    >
      {children}
    </div>
  ),
  InputLabel: ({ children, ...props }) => (
    <label data-testid="mui-input-label" {...props}>
      {children}
    </label>
  ),
  Select: ({ children, value, onChange, label, ...props }) => (
    <select 
      data-testid="mui-select" 
      value={value || ''} 
      onChange={onChange} 
      aria-label={label}
      {...props}
    >
      {children}
    </select>
  ),
  Switch: ({ checked, onChange, ...props }) => (
    <input 
      type="checkbox&quot; 
      data-testid="mui-switch" 
      checked={checked} 
      onChange={onChange}
      {...props} 
    />
  ),
  FormControlLabel: ({ control, label, ...props }) => (
    <label data-testid="mui-form-control-label" {...props}>
      {control}
      <span>{label}</span>
    </label>
  ),
  Badge: ({ children, badgeContent, ...props }) => (
    <div data-testid="mui-badge" data-badge-content={badgeContent} {...props}>
      {children}
    </div>
  ),
  Collapse: ({ children, in: isOpen, ...props }) => (
    <div data-testid="mui-collapse" data-open={isOpen} {...props}>
      {isOpen ? children : null}
    </div>
  ),
  Accordion: ({ children, ...props }) => (
    <div data-testid="mui-accordion" {...props}>
      {children}
    </div>
  ),
  AccordionSummary: ({ children, ...props }) => (
    <div data-testid="mui-accordion-summary" {...props}>
      {children}
    </div>
  ),
  AccordionDetails: ({ children, ...props }) => (
    <div data-testid="mui-accordion-details" {...props}>
      {children}
    </div>
  ),
  Popover: ({ children, open, ...props }) => (
    open ? (
      <div data-testid="mui-popover" {...props}>
        {children}
      </div>
    ) : null
  ),
  useTheme: () => ({
    palette: {
      text: { primary: '#000', secondary: '#757575' },
      divider: '#e0e0e0',
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
      background: { paper: '#ffffff', default: '#f5f5f5' },
      success: { main: '#4caf50', light: '#81c784' },
      error: { main: '#f44336', light: '#e57373' },
      warning: { main: '#ff9800' },
      action: { hover: '#f5f5f5', disabled: '#bdbdbd' },
      grey: { 100: '#f5f5f5', 50: '#fafafa' }
    },
    shadows: [
      'none',
      '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
      '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    ],
    alpha: (color, value) => `${color}${Math.round(value * 255).toString(16).padStart(2, '0')}`
  }),
  alpha: (color, value) => `${color}${Math.round(value * 255).toString(16).padStart(2, '0')}`
}));

// Mock all the Material UI icons
const iconComponents = [
  'SearchIcon', 'ArrowForwardIcon', 'DeleteIcon', 'CloseIcon', 'AddIcon',
  'EditIcon', 'ExpandMoreIcon', 'CheckCircleIcon', 'ErrorIcon', 'WarningIcon',
  'TextFieldsIcon', 'NumbersIcon', 'DateRangeIcon', 'ToggleOnIcon', 'ViewArrayIcon',
  'AccountTreeIcon', 'CodeIcon', 'AutoFixHighIcon', 'FilterListIcon', 'FunctionsIcon',
  'FormatAlignLeftIcon', 'MoreVertIcon', 'CallSplitIcon', 'CallMergeIcon', 'CompareArrowsIcon',
  'EastIcon', 'WestIcon', 'NorthEastIcon', 'NorthWestIcon', 'SouthEastIcon',
  'SouthWestIcon', 'MergeTypeIcon', 'HubIcon', 'AutoAwesomeIcon', 'MoreHorizIcon',
  'InfoIcon', 'LinkIcon', 'ContentCopyIcon', 'PlayArrowIcon', 'AltRouteIcon',
  'FormatQuoteIcon', 'PanToolIcon'
];

// Create mock for each icon
iconComponents.forEach(iconName => {
  jest.mock(`@mui/icons-material/${iconName}`, () => ({
    __esModule: true,
    default: () => <span data-testid={`mui-icon-${iconName}`} />
  }));
});

// Sample test data
const sourceFields = [
  { id: 'src1', name: 'firstName', type: 'string' },
  { id: 'src2', name: 'lastName', type: 'string' },
  { id: 'src3', name: 'age', type: 'number' },
  { id: 'src4', name: 'isActive', type: 'boolean' },
  { id: 'src5', name: 'birthDate', type: 'date', required: true }
];

const destinationFields = [
  { id: 'dst1', name: 'first_name', type: 'string' },
  { id: 'dst2', name: 'last_name', type: 'string' },
  { id: 'dst3', name: 'age', type: 'integer' },
  { id: 'dst4', name: 'active', type: 'boolean' },
  { id: 'dst5', name: 'birth_date', type: 'datetime', required: true }
];

const existingMappings = [
  { 
    id: 'map1', 
    sourceField: sourceFields[0], 
    destField: destinationFields[0],
    transform: { type: 'direct' },
    isCompatible: true
  }
];

describe('VisualFieldMapper', () => {
  it('renders with basic props', () => {
    render(
      <VisualFieldMapper 
        sourceFields={sourceFields}
        destinationFields={destinationFields}
      />
    );
    
    // Check title
    expect(screen.getByText('Field Mapper')).toBeInTheDocument();
    
    // Check source and destination headers
    expect(screen.getByText('Source Fields')).toBeInTheDocument();
    expect(screen.getByText('Destination Fields')).toBeInTheDocument();
    
    // Check search fields
    expect(screen.getAllByTestId('text-field-input')[0]).toHaveAttribute('placeholder', 'Search source fields...');
    expect(screen.getAllByTestId('text-field-input')[1]).toHaveAttribute('placeholder', 'Search destination fields...');
  });

  it('displays existing mappings', () => {
    render(
      <VisualFieldMapper 
        sourceFields={sourceFields}
        destinationFields={destinationFields}
        existingMappings={existingMappings}
      />
    );
    
    // Check mapping count
    expect(screen.getByText('1 mappings •')).toBeInTheDocument();
    
    // Check field names
    expect(screen.getByText('firstName')).toBeInTheDocument();
    expect(screen.getByText('first_name')).toBeInTheDocument();
  });

  it('allows searching fields', () => {
    render(
      <VisualFieldMapper 
        sourceFields={sourceFields}
        destinationFields={destinationFields}
      />
    );
    
    // Search for fields with 'name' in the name
    const sourceSearchInput = screen.getAllByTestId('text-field-input')[0];
    fireEvent.change(sourceSearchInput, { target: { value: 'name' } });
    
    // Should show firstName and lastName but not age
    expect(screen.getByText('firstName')).toBeInTheDocument();
    expect(screen.getByText('lastName')).toBeInTheDocument();
    expect(screen.queryByText('age')).not.toBeInTheDocument();
  });

  it('handles save action', () => {
    const mockSave = jest.fn();
    
    render(
      <VisualFieldMapper 
        sourceFields={sourceFields}
        destinationFields={destinationFields}
        existingMappings={existingMappings}
        onSaveMappings={mockSave}
      />
    );
    
    // Click save button
    fireEvent.click(screen.getByText('Save Mappings'));
    
    // Should call save with the current mappings
    expect(mockSave).toHaveBeenCalledWith(existingMappings);
  });
  
  it('displays warning for unmapped required fields', () => {
    // Create mapping that doesn't include required field
    const partialMappings = [
      { 
        id: 'map1', 
        sourceField: sourceFields[0], 
        destField: destinationFields[0],
        transform: { type: 'direct' },
        isCompatible: true
      }
    ];
    
    render(
      <VisualFieldMapper 
        sourceFields={sourceFields}
        destinationFields={destinationFields}
        existingMappings={partialMappings}
      />
    );
    
    // Should show warning about required fields
    expect(screen.getByText(/required destination.*not mapped/)).toBeInTheDocument();
  });

  it('disables save when read-only mode is enabled', () => {
    render(
      <VisualFieldMapper 
        sourceFields={sourceFields}
        destinationFields={destinationFields}
        readOnly={true}
      />
    );
    
    // Save button should be disabled
    const saveButton = screen.getByText('Save Mappings');
    expect(saveButton).toBeDisabled();
  });
});