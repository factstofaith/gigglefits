import { renderHook, act } from '@testing-library/react-hooks';
import { useFlowTemplates } from '@hooks/useFlowTemplates';

// Mock localStorage
const mockLocalStorage = (() => {
  // Added display name
  mockLocalStorage.displayName = 'mockLocalStorage';

  // Added display name
  mockLocalStorage.displayName = 'mockLocalStorage';

  // Added display name
  mockLocalStorage.displayName = 'mockLocalStorage';

  // Added display name
  mockLocalStorage.displayName = 'mockLocalStorage';

  // Added display name
  mockLocalStorage.displayName = 'mockLocalStorage';


  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _getStore: () => store
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock integration service
const mockIntegrationService = {
  getTemplates: jest.fn().mockResolvedValue([]),
  saveTemplate: jest.fn().mockResolvedValue({}),
  updateTemplate: jest.fn().mockResolvedValue({}),
  deleteTemplate: jest.fn().mockResolvedValue({})
};

describe('useFlowTemplates Hook', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  test('initializes with empty templates', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFlowTemplates());
    
    // Should start loading
    expect(result.current.loading).toBe(true);
    
    await waitForNextUpdate();
    
    // Should finish loading with empty templates array
    expect(result.current.loading).toBe(false);
    expect(result.current.templates).toEqual([]);
  });

  test('loads templates from localStorage', async () => {
    const sampleTemplates = [
      { id: 'template-1', name: 'Test 1', category: 'Test' },
      { id: 'template-2', name: 'Test 2', category: 'Test' }
    ];
    
    mockLocalStorage.setItem('flowTemplates', JSON.stringify(sampleTemplates));
    
    const { result, waitForNextUpdate } = renderHook(() => useFlowTemplates());
    
    await waitForNextUpdate();
    
    expect(result.current.templates).toEqual(sampleTemplates);
  });

  test('loads templates from initialTemplates prop', async () => {
    const initialTemplates = [
      { id: 'template-3', name: 'Initial Test', category: 'Initial' }
    ];
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useFlowTemplates(initialTemplates)
    );
    
    await waitForNextUpdate();
    
    expect(result.current.templates).toEqual(initialTemplates);
  });

  test('loads templates from service when provided', async () => {
    const remoteTemplates = [
      { id: 'remote-1', name: 'Remote 1', category: 'Remote', isRemote: true }
    ];
    
    mockIntegrationService.getTemplates.mockResolvedValueOnce(remoteTemplates);
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useFlowTemplates([], mockIntegrationService)
    );
    
    await waitForNextUpdate();
    
    expect(result.current.templates).toEqual(remoteTemplates);
    expect(mockIntegrationService.getTemplates).toHaveBeenCalled();
  });

  test('saves a new template', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFlowTemplates());
    
    await waitForNextUpdate();
    
    const templateData = {
      name: 'New Template',
      description: 'Test description',
      category: 'Test',
      nodes: [{ id: 'node-1' }],
      edges: [{ id: 'edge-1' }],
      tags: ['test']
    };
    
    act(() => {
      result.current.saveAsTemplate(templateData);
    });
    
    // Template should be added to templates array
    expect(result.current.templates.length).toBe(1);
    expect(result.current.templates[0].name).toBe('New Template');
    
    // Should be saved to localStorage
    const savedTemplates = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
    expect(savedTemplates.length).toBe(1);
    expect(savedTemplates[0].name).toBe('New Template');
  });

  test('saves a template to service when provided', async () => {
    const { result, waitForNextUpdate } = renderHook(() => 
      useFlowTemplates([], mockIntegrationService)
    );
    
    await waitForNextUpdate();
    
    const templateData = {
      name: 'Service Template',
      description: 'Test description',
      category: 'Test',
      nodes: [{ id: 'node-1' }],
      edges: [{ id: 'edge-1' }]
    };
    
    act(() => {
      result.current.saveAsTemplate(templateData);
    });
    
    expect(mockIntegrationService.saveTemplate).toHaveBeenCalled();
    expect(mockIntegrationService.saveTemplate.mock.calls[0][0].name).toBe('Service Template');
  });

  test('updates an existing template', async () => {
    const initialTemplates = [
      { 
        id: 'template-1', 
        name: 'Original Name', 
        description: 'Original description', 
        category: 'Original'
      }
    ];
    
    mockLocalStorage.setItem('flowTemplates', JSON.stringify(initialTemplates));
    
    const { result, waitForNextUpdate } = renderHook(() => useFlowTemplates());
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.updateTemplate('template-1', { 
        name: 'Updated Name',
        description: 'Updated description'
      });
    });
    
    // Template should be updated
    expect(result.current.templates[0].name).toBe('Updated Name');
    expect(result.current.templates[0].description).toBe('Updated description');
    
    // Category should remain unchanged
    expect(result.current.templates[0].category).toBe('Original');
    
    // Should be saved to localStorage
    const savedTemplates = JSON.parse(mockLocalStorage.setItem.mock.calls[1][1]);
    expect(savedTemplates[0].name).toBe('Updated Name');
  });

  test('deletes a template', async () => {
    const initialTemplates = [
      { id: 'template-1', name: 'Template 1' },
      { id: 'template-2', name: 'Template 2' }
    ];
    
    mockLocalStorage.setItem('flowTemplates', JSON.stringify(initialTemplates));
    
    const { result, waitForNextUpdate } = renderHook(() => useFlowTemplates());
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.deleteTemplate('template-1');
    });
    
    // Template should be removed
    expect(result.current.templates.length).toBe(1);
    expect(result.current.templates[0].id).toBe('template-2');
    
    // Should be saved to localStorage
    const savedTemplates = JSON.parse(mockLocalStorage.setItem.mock.calls[1][1]);
    expect(savedTemplates.length).toBe(1);
    expect(savedTemplates[0].id).toBe('template-2');
  });

  test('duplicates a template', async () => {
    const initialTemplates = [
      { 
        id: 'template-1', 
        name: 'Original Template', 
        description: 'Test',
        category: 'Test',
        nodes: [{ id: 'node-1' }],
        edges: []
      }
    ];
    
    mockLocalStorage.setItem('flowTemplates', JSON.stringify(initialTemplates));
    
    const { result, waitForNextUpdate } = renderHook(() => useFlowTemplates());
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.duplicateTemplate('template-1');
    });
    
    // Should have two templates now
    expect(result.current.templates.length).toBe(2);
    
    // New template should have similar data but different id
    expect(result.current.templates[1].name).toBe('Original Template (Copy)');
    expect(result.current.templates[1].id).not.toBe('template-1');
    
    // Should be saved to localStorage
    const savedTemplates = JSON.parse(mockLocalStorage.setItem.mock.calls[1][1]);
    expect(savedTemplates.length).toBe(2);
  });

  test('retrieves templates by category', async () => {
    const initialTemplates = [
      { id: 'template-1', name: 'Test 1', category: 'Category A' },
      { id: 'template-2', name: 'Test 2', category: 'Category B' },
      { id: 'template-3', name: 'Test 3', category: 'Category A' }
    ];
    
    mockLocalStorage.setItem('flowTemplates', JSON.stringify(initialTemplates));
    
    const { result, waitForNextUpdate } = renderHook(() => useFlowTemplates());
    
    await waitForNextUpdate();
    
    const categoryATemplates = result.current.getTemplatesByCategory('Category A');
    
    expect(categoryATemplates.length).toBe(2);
    expect(categoryATemplates[0].id).toBe('template-1');
    expect(categoryATemplates[1].id).toBe('template-3');
  });

  test('gets all unique categories', async () => {
    const initialTemplates = [
      { id: 'template-1', name: 'Test 1', category: 'Category A' },
      { id: 'template-2', name: 'Test 2', category: 'Category B' },
      { id: 'template-3', name: 'Test 3', category: 'Category A' },
      { id: 'template-4', name: 'Test 4', category: 'Category C' }
    ];
    
    mockLocalStorage.setItem('flowTemplates', JSON.stringify(initialTemplates));
    
    const { result, waitForNextUpdate } = renderHook(() => useFlowTemplates());
    
    await waitForNextUpdate();
    
    const categories = result.current.getCategories();
    
    expect(categories.length).toBe(3);
    expect(categories).toEqual(['Category A', 'Category B', 'Category C']);
  });

  test('searches templates by name, description, and tags', async () => {
    const initialTemplates = [
      { 
        id: 'template-1', 
        name: 'Data Export', 
        description: 'Exports data to a destination',
        category: 'Export',
        tags: ['data', 'export']
      },
      { 
        id: 'template-2', 
        name: 'Data Import', 
        description: 'Imports data from a source',
        category: 'Import',
        tags: ['data', 'import']
      },
      { 
        id: 'template-3', 
        name: 'Complex Transformation', 
        description: 'Transforms data with multiple steps',
        category: 'Transform',
        tags: ['transform', 'complex']
      }
    ];
    
    mockLocalStorage.setItem('flowTemplates', JSON.stringify(initialTemplates));
    
    const { result, waitForNextUpdate } = renderHook(() => useFlowTemplates());
    
    await waitForNextUpdate();
    
    // Search by name
    let searchResults = result.current.searchTemplates('Export');
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].id).toBe('template-1');
    
    // Search by description
    searchResults = result.current.searchTemplates('multiple');
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].id).toBe('template-3');
    
    // Search by tag
    searchResults = result.current.searchTemplates('import');
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].id).toBe('template-2');
    
    // Search for common keyword
    searchResults = result.current.searchTemplates('data');
    expect(searchResults.length).toBe(2);
  });

  test('clears all templates', async () => {
    const initialTemplates = [
      { id: 'template-1', name: 'Test 1' },
      { id: 'template-2', name: 'Test 2' }
    ];
    
    mockLocalStorage.setItem('flowTemplates', JSON.stringify(initialTemplates));
    
    const { result, waitForNextUpdate } = renderHook(() => useFlowTemplates());
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.clearTemplates();
    });
    
    expect(result.current.templates).toEqual([]);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flowTemplates');
  });
});