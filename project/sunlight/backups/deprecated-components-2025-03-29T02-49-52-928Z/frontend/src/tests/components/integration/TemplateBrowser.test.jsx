import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateBrowser from '@components/integration/TemplateBrowser';

// Mock theme provider
import { ThemeProvider } from '@design-system/foundations/theme/ThemeProvider';

const renderWithTheme = (ui) => {
  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';

  // Added display name
  renderWithTheme.displayName = 'renderWithTheme';


  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('TemplateBrowser Component', () => {
  // Sample templates for testing
  const sampleTemplates = [
    {
      id: 'template-1',
      name: 'Basic Data Transfer',
      description: 'Simple source to destination flow',
      category: 'Basic',
      nodes: [{ id: 'node-1' }, { id: 'node-2' }],
      edges: [{ id: 'edge-1' }],
      tags: ['simple', 'transfer'],
      created: '2023-03-15T10:00:00Z',
      modified: '2023-03-15T10:00:00Z',
      isRemote: false
    },
    {
      id: 'template-2',
      name: 'Advanced ETL Pipeline',
      description: 'Complex ETL with transformations',
      category: 'Advanced',
      nodes: [{ id: 'node-1' }, { id: 'node-2' }, { id: 'node-3' }],
      edges: [{ id: 'edge-1' }, { id: 'edge-2' }],
      tags: ['etl', 'transform', 'complex'],
      created: '2023-02-10T10:00:00Z',
      modified: '2023-02-15T10:00:00Z',
      isRemote: true
    },
    {
      id: 'template-3',
      name: 'Custom Webhook Handler',
      description: 'Process incoming webhooks',
      category: 'Custom',
      nodes: [{ id: 'node-1' }, { id: 'node-2' }],
      edges: [{ id: 'edge-1' }],
      tags: ['webhook', 'automation'],
      created: '2023-01-05T10:00:00Z',
      modified: '2023-01-05T10:00:00Z',
      isRemote: false
    }
  ];

  const mockApplyTemplate = jest.fn();
  const mockExportTemplate = jest.fn();

  // Reset mocks before each test
  beforeEach(() => {
    mockApplyTemplate.mockReset();
    mockExportTemplate.mockReset();
  });

  test('renders template browser with correct templates', () => {
    renderWithTheme(
      <TemplateBrowser 
        templates={sampleTemplates} 
        onApplyTemplate={mockApplyTemplate} 
        onExportTemplate={mockExportTemplate} 
      />
    );

    // Check if all templates are rendered
    expect(screen.getByText('Basic Data Transfer')).toBeInTheDocument();
    expect(screen.getByText('Advanced ETL Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Custom Webhook Handler')).toBeInTheDocument();
    
    // Check category chips
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
    
    // Check Remote chip
    expect(screen.getByText('Remote')).toBeInTheDocument();
  });

  test('allows filtering templates by category', () => {
    renderWithTheme(
      <TemplateBrowser 
        templates={sampleTemplates} 
        onApplyTemplate={mockApplyTemplate} 
        onExportTemplate={mockExportTemplate} 
      />
    );

    // Click on 'Basic' category tab
    fireEvent.click(screen.getByRole('tab', { name: /basic/i }));
    
    // Should show Basic template
    expect(screen.getByText('Basic Data Transfer')).toBeInTheDocument();
    
    // Should not show other templates
    expect(screen.queryByText('Advanced ETL Pipeline')).not.toBeInTheDocument();
    expect(screen.queryByText('Custom Webhook Handler')).not.toBeInTheDocument();
  });

  test('allows searching templates', () => {
    renderWithTheme(
      <TemplateBrowser 
        templates={sampleTemplates} 
        onApplyTemplate={mockApplyTemplate} 
        onExportTemplate={mockExportTemplate} 
      />
    );

    // Search for "webhook"
    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'webhook' } });
    
    // Should show webhook template
    expect(screen.getByText('Custom Webhook Handler')).toBeInTheDocument();
    
    // Should not show other templates
    expect(screen.queryByText('Basic Data Transfer')).not.toBeInTheDocument();
    expect(screen.queryByText('Advanced ETL Pipeline')).not.toBeInTheDocument();
  });

  test('calls onApplyTemplate when a template is applied', () => {
    renderWithTheme(
      <TemplateBrowser 
        templates={sampleTemplates} 
        onApplyTemplate={mockApplyTemplate} 
        onExportTemplate={mockExportTemplate} 
      />
    );

    // Find Apply Template button for first template
    const applyButtons = screen.getAllByRole('button', { name: /apply template/i });
    fireEvent.click(applyButtons[0]);
    
    // Check if onApplyTemplate was called with the correct template
    expect(mockApplyTemplate).toHaveBeenCalledWith(sampleTemplates[0]);
  });

  test('calls onExportTemplate when Save Current Flow is clicked', () => {
    renderWithTheme(
      <TemplateBrowser 
        templates={sampleTemplates} 
        onApplyTemplate={mockApplyTemplate} 
        onExportTemplate={mockExportTemplate} 
      />
    );

    // Click Save Current Flow button
    fireEvent.click(screen.getByRole('button', { name: /save current flow/i }));
    
    // Check if onExportTemplate was called
    expect(mockExportTemplate).toHaveBeenCalled();
  });

  test('shows context menu with options when template menu is clicked', async () => {
    renderWithTheme(
      <TemplateBrowser 
        templates={sampleTemplates} 
        onApplyTemplate={mockApplyTemplate} 
        onExportTemplate={mockExportTemplate} 
      />
    );

    // Find more options button for first template
    const moreOptionsButtons = screen.getAllByLabelText('template options');
    fireEvent.click(moreOptionsButtons[0]);
    
    // Context menu should show options
    await waitFor(() => {
      expect(screen.getByText('Edit Template')).toBeInTheDocument();
      expect(screen.getByText('Duplicate Template')).toBeInTheDocument();
      expect(screen.getByText('Delete Template')).toBeInTheDocument();
    });
  });

  test('opens edit dialog when Edit Template is clicked', async () => {
    renderWithTheme(
      <TemplateBrowser 
        templates={sampleTemplates} 
        onApplyTemplate={mockApplyTemplate} 
        onExportTemplate={mockExportTemplate} 
      />
    );

    // Open context menu
    const moreOptionsButtons = screen.getAllByLabelText('template options');
    fireEvent.click(moreOptionsButtons[0]);
    
    // Click Edit Template
    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit Template'));
    });
    
    // Edit dialog should be open
    expect(screen.getByText('Edit Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Template Name')).toHaveValue('Basic Data Transfer');
  });

  test('shows no templates message when no templates match filter', () => {
    renderWithTheme(
      <TemplateBrowser 
        templates={sampleTemplates} 
        onApplyTemplate={mockApplyTemplate} 
        onExportTemplate={mockExportTemplate} 
      />
    );

    // Search for something that doesn't exist
    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    // Should show no templates message
    expect(screen.getByText('No templates match your search')).toBeInTheDocument();
  });

  test('renders in dialog mode correctly', () => {
    renderWithTheme(
      <TemplateBrowser 
        templates={sampleTemplates} 
        onApplyTemplate={mockApplyTemplate} 
        onExportTemplate={mockExportTemplate} 
        asDialog={true}
      />
    );

    // Core functionality should still be present
    expect(screen.getByText('Basic Data Transfer')).toBeInTheDocument();
    expect(screen.getByText('Advanced ETL Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Custom Webhook Handler')).toBeInTheDocument();
  });
});