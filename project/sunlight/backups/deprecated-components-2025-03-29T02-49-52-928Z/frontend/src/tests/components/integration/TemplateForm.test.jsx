import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateForm from '@components/integration/TemplateForm';

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

describe('TemplateForm Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  
  const initialValues = {
    name: 'Test Template',
    description: 'This is a test template',
    category: 'Test',
    tags: ['test', 'sample', 'example']
  };
  
  const categories = ['Basic', 'Advanced', 'Custom', 'Test'];
  
  beforeEach(() => {
    mockOnClose.mockReset();
    mockOnSave.mockReset();
  });
  
  test('renders with initial values', () => {
    renderWithTheme(
      <TemplateForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialValues={initialValues}
        categories={categories}
        editMode={false}
      />
    );
    
    // Check if initial values are rendered
    expect(screen.getByLabelText('Template Name')).toHaveValue('Test Template');
    expect(screen.getByLabelText('Description')).toHaveValue('This is a test template');
    
    // Tags should be shown as chips
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('sample')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });
  
  test('can add and remove tags', () => {
    renderWithTheme(
      <TemplateForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialValues={initialValues}
        categories={categories}
        editMode={false}
      />
    );
    
    // Add a new tag
    const tagInput = screen.getByPlaceholderText('Add tag and press Enter');
    fireEvent.change(tagInput, { target: { value: 'newtag' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });
    
    // New tag should be visible
    expect(screen.getByText('newtag')).toBeInTheDocument();
    
    // Remove a tag
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // Remove the first tag
    
    // The removed tag should no longer be visible
    expect(screen.queryByText('test')).not.toBeInTheDocument();
  });
  
  test('validates required fields', () => {
    renderWithTheme(
      <TemplateForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialValues={{ name: '', description: '', category: '', tags: [] }}
        categories={categories}
        editMode={false}
      />
    );
    
    // Try to save with empty required fields
    const saveButton = screen.getByRole('button', { name: /save as template/i });
    fireEvent.click(saveButton);
    
    // Error messages should be displayed
    expect(screen.getByText('Template name is required')).toBeInTheDocument();
    expect(screen.getByText('Category is required')).toBeInTheDocument();
    
    // onSave should not be called
    expect(mockOnSave).not.toHaveBeenCalled();
  });
  
  test('calls onSave with correct data when form is valid', () => {
    renderWithTheme(
      <TemplateForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialValues={initialValues}
        categories={categories}
        editMode={false}
      />
    );
    
    // Click the save button
    const saveButton = screen.getByRole('button', { name: /save as template/i });
    fireEvent.click(saveButton);
    
    // onSave should be called with the form data
    expect(mockOnSave).toHaveBeenCalledWith({
      name: 'Test Template',
      description: 'This is a test template',
      category: 'Test',
      tags: ['test', 'sample', 'example']
    });
  });
  
  test('calls onClose when cancel button is clicked', () => {
    renderWithTheme(
      <TemplateForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialValues={initialValues}
        categories={categories}
        editMode={false}
      />
    );
    
    // Click the cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // onClose should be called
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  test('shows proper title based on edit mode', () => {
    // Test in create mode
    renderWithTheme(
      <TemplateForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialValues={initialValues}
        categories={categories}
        editMode={false}
      />
    );
    
    expect(screen.getByText('Save Flow as Template')).toBeInTheDocument();
    
    // Cleanup and re-render in edit mode
    screen.unmount();
    
    renderWithTheme(
      <TemplateForm
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialValues={initialValues}
        categories={categories}
        editMode={true}
      />
    );
    
    expect(screen.getByText('Edit Template')).toBeInTheDocument();
  });
});