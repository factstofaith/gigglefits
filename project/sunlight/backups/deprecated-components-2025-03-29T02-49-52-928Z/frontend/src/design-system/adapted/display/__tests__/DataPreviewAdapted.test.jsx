/**
 * DataPreviewAdapted component tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import DataPreview from '../DataPreviewAdapted';

// Mock the react-window
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount }) => {
    const items = [];
    for (let i = 0; i < Math.min(itemCount, 5); i++) {
      items.push(children({ index: i, style: {} }));
    }
    return <div data-testid="virtualized-list">{items}</div>;
  }
}));

// Mock the react-json-view
jest.mock('react-json-view', () => ({
  __esModule: true,
  default: ({ src }) => <div data-testid="json-view">{JSON.stringify(src).substring(0, 100)}...</div>
}));

describe('DataPreviewAdapted', () => {
  const mockData = [
    { id: 1, name: 'Item 1', status: true, date: '2023-01-01' },
    { id: 2, name: 'Item 2', status: false, date: '2023-01-02' },
    { id: 3, name: 'Item 3', status: true, date: '2023-01-03' },
    { id: 4, name: 'Item 4', status: false, date: '2023-01-04' },
    { id: 5, name: 'Item 5', status: true, date: '2023-01-05' },
  ];

  const mockSchema = {
    fields: [
      { name: 'id', type: 'number', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'status', type: 'boolean' },
      { name: 'date', type: 'date', format: 'date' },
    ]
  };

  const mockOnRefresh = jest.fn();

  it('renders loading state correctly', () => {
    render(
      <DataPreviewAdapted
        isLoading={true}
        onRefresh={mockOnRefresh}
      />
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    const errorMessage = 'Failed to load data';
    render(
      <DataPreviewAdapted
        error={errorMessage}
        onRefresh={mockOnRefresh}
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    render(
      <DataPreviewAdapted
        data={null}
        onRefresh={mockOnRefresh}
      />
    );
    
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });

  it('renders data table view correctly', () => {
    render(
      <DataPreviewAdapted
        data={mockData}
        schema={mockSchema}
        onRefresh={mockOnRefresh}
      />
    );
    
    // Check that table headers are rendered
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('status')).toBeInTheDocument();
    expect(screen.getByText('date')).toBeInTheDocument();
    
    // Check that virtualized list is rendered
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
    
    // Check data stats
    expect(screen.getByText('Showing 5 of 5 records')).toBeInTheDocument();
    expect(screen.getByText('4 fields')).toBeInTheDocument();
  });

  it('switches to JSON view when tab is clicked', () => {
    render(
      <DataPreviewAdapted
        data={mockData}
        schema={mockSchema}
        onRefresh={mockOnRefresh}
      />
    );
    
    // Click JSON view tab
    fireEvent.click(screen.getByText('JSON View'));
    
    // Check that JSON view is rendered
    expect(screen.getByTestId('json-view')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(
      <DataPreviewAdapted
        data={mockData}
        schema={mockSchema}
        onRefresh={mockOnRefresh}
      />
    );
    
    // Click refresh button
    fireEvent.click(screen.getByText('Refresh'));
    
    // Check that onRefresh was called
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it('adds filter when add filter button is clicked', async () => {
    render(
      <DataPreviewAdapted
        data={mockData}
        schema={mockSchema}
        onRefresh={mockOnRefresh}
      />
    );
    
    // Select a field to filter
    fireEvent.mouseDown(screen.getByLabelText('Field'));
    fireEvent.click(screen.getByText('name (string)'));
    
    // Enter filter value
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: 'Item 1' } });
    
    // Click add filter button
    fireEvent.click(screen.getByText('Add Filter'));
    
    // Check that filter chip is displayed
    expect(screen.getByText('name: Item 1')).toBeInTheDocument();
  });

  it('removes filter when delete icon is clicked', async () => {
    render(
      <DataPreviewAdapted
        data={mockData}
        schema={mockSchema}
        onRefresh={mockOnRefresh}
      />
    );
    
    // Add a filter
    fireEvent.mouseDown(screen.getByLabelText('Field'));
    fireEvent.click(screen.getByText('name (string)'));
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: 'Item 1' } });
    fireEvent.click(screen.getByText('Add Filter'));
    
    // Check that filter chip is displayed
    const filterChip = screen.getByText('name: Item 1');
    expect(filterChip).toBeInTheDocument();
    
    // Click delete icon on filter chip
    const deleteButton = filterChip.parentElement.querySelector('svg');
    fireEvent.click(deleteButton);
    
    // Check that filter chip is no longer displayed
    expect(screen.queryByText('name: Item 1')).not.toBeInTheDocument();
    expect(screen.getByText('No filters applied')).toBeInTheDocument();
  });

  it('shows validation errors when schema validation fails', () => {
    const dataWithErrors = [
      ...mockData,
      { id: 'not-a-number', name: null } // Invalid data
    ];
    
    render(
      <DataPreviewAdapted
        data={dataWithErrors}
        schema={mockSchema}
        onRefresh={mockOnRefresh}
        showValidation={true}
      />
    );
    
    // Check that validation errors are displayed
    expect(screen.getByText(/validation errors/i)).toBeInTheDocument();
  });

  it('creates download link when download button is clicked', () => {
    // Mock document.createElement
    const originalCreateElement = document.createElement.bind(document);
    const mockElement = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') {
        return mockElement;
      }
      return originalCreateElement(tag);
    });
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock document.body.appendChild and removeChild
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    
    render(
      <DataPreviewAdapted
        data={mockData}
        schema={mockSchema}
        onRefresh={mockOnRefresh}
        showDownload={true}
      />
    );
    
    // Click download button
    fireEvent.click(screen.getByText('Download'));
    
    // Verify mocked functions were called correctly
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(mockElement.click).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    
    // Restore original document.createElement
    document.createElement = originalCreateElement;
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <DataPreviewAdapted
        data={mockData}
        schema={mockSchema}
        onRefresh={mockOnRefresh}
        ariaLabel="Data preview for test data&quot;
      />
    );

    // Wait for any immediate effects or state updates to complete
    await waitFor(() => {
      expect(screen.getByText("id')).toBeInTheDocument();
    });

    // Run accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});