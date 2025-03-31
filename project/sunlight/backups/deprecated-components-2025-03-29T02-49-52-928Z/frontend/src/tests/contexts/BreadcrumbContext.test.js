// tests/contexts/BreadcrumbContext.test.js
// -----------------------------------------------------------------------------
// Tests for the BreadcrumbContext provider and hook using dependency injection pattern

import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BreadcrumbProvider, useBreadcrumbs } from '@contexts/BreadcrumbContext';
import { MemoryRouter } from 'react-router-dom';

// Create a breadcrumb service mock
const createMockBreadcrumbService = () => {
  // Added display name
  createMockBreadcrumbService.displayName = 'createMockBreadcrumbService';

  // Added display name
  createMockBreadcrumbService.displayName = 'createMockBreadcrumbService';

  // Added display name
  createMockBreadcrumbService.displayName = 'createMockBreadcrumbService';

  // Added display name
  createMockBreadcrumbService.displayName = 'createMockBreadcrumbService';

  // Added display name
  createMockBreadcrumbService.displayName = 'createMockBreadcrumbService';


  return {
    getDefaultBreadcrumbs: jest.fn((pathname) => {
      const defaults = {
        '/': [{ label: 'Home' }],
        '/integrations': [{ label: 'Home', path: '/' }, { label: 'Integrations' }],
        '/templates': [{ label: 'Home', path: '/' }, { label: 'Templates' }],
        '/earnings': [{ label: 'Home', path: '/' }, { label: 'Earnings' }],
        '/admin': [{ label: 'Home', path: '/' }, { label: 'Admin Dashboard' }],
      };
      return defaults[pathname] || null;
    }),
    getDynamicBreadcrumbs: jest.fn((pathname, options = {}) => {
      // Integration detail page
      if (pathname.match(/^\/integrations\/[\w-]+$/)) {
        const integrationId = pathname.split('/').pop();
        const integration = options.integrations?.[integrationId];
        return [
          { label: 'Home', path: '/' },
          { label: 'Integrations', path: '/integrations' },
          { label: integration?.name || `Integration ${integrationId}` },
        ];
      }
      
      // Admin subpages
      if (pathname.startsWith('/admin/')) {
        const section = pathname.split('/')[2];
        const readableSection = section.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        if (section === 'mfa') {
          return [
            { label: 'Home', path: '/' },
            { label: 'Admin Dashboard', path: '/admin' },
            { label: 'MFA' },
          ];
        }
        
        return [
          { label: 'Home', path: '/' },
          { label: 'Admin Dashboard', path: '/admin' },
          { label: readableSection },
        ];
      }
      
      return null;
    }),
    getFallbackBreadcrumbs: jest.fn(() => [{ label: 'Home', path: '/' }])
  };
};

// Test component to expose breadcrumb context values
const TestComponent = ({ onContextLoad = () => {
  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

  // Added display name
  TestComponent.displayName = 'TestComponent';

} }) => {
  const context = useBreadcrumbs();
  
  // Call the callback with context values after render
  useEffect(() => {
    onContextLoad(context);
  }, [onContextLoad, context]);
  
  const { breadcrumbs, setBreadcrumbs } = context;
  
  return (
    <div>
      <div data-testid="breadcrumbs-count">{breadcrumbs.length}</div>
      <div data-testid="first-breadcrumb-label">
        {breadcrumbs.length > 0 ? breadcrumbs[0].label : 'none'}
      </div>
      <div data-testid="last-breadcrumb-label">
        {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'none'}
      </div>
      <button
        data-testid="set-custom-breadcrumbs"
        onClick={() =>
          setBreadcrumbs([
            { label: 'Home', path: '/' },
            { label: 'Custom', path: '/custom' },
            { label: 'Detail' },
          ])
        }
      >
        Set Custom Breadcrumbs
      </button>
      <button
        data-testid="set-invalid-breadcrumbs"
        onClick={() => setBreadcrumbs('not-an-array')}
      >
        Set Invalid Breadcrumbs
      </button>
    </div>
  );
};

// Create a mock integration service
const createMockIntegrationService = () => {
  // Added display name
  createMockIntegrationService.displayName = 'createMockIntegrationService';

  // Added display name
  createMockIntegrationService.displayName = 'createMockIntegrationService';

  // Added display name
  createMockIntegrationService.displayName = 'createMockIntegrationService';

  // Added display name
  createMockIntegrationService.displayName = 'createMockIntegrationService';

  // Added display name
  createMockIntegrationService.displayName = 'createMockIntegrationService';


  const mockIntegrations = {
    'abc-123': {
      id: 'abc-123',
      name: 'Customer Data Sync',
      type: 'data-sync'
    },
    'def-456': {
      id: 'def-456',
      name: 'Sales Pipeline Integration',
      type: 'webhook'
    }
  };
  
  return {
    getIntegrationById: jest.fn((id) => {
      return Promise.resolve(mockIntegrations[id] || null);
    })
  };
};

// Helper function for simpler test setup with dependency injection
const renderWithBreadcrumbContext = (
  initialPath = '/', 
  breadcrumbService = createMockBreadcrumbService(),
  integrationService = null
) => {
  let contextValues = null;
  
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BreadcrumbProvider 
        breadcrumbService={breadcrumbService}
        integrationService={integrationService}
      >
        <TestComponent
          onContextLoad={(values) => {
            contextValues = values;
          }}
        />
      </BreadcrumbProvider>
    </MemoryRouter>
  );
  
  // Helper to get the latest context values
  const getContextValues = () => contextValues;
  
  return {
    getContextValues,
    breadcrumbService,
    integrationService,
  };
};

describe('BreadcrumbContext using dependency injection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid cluttering the test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock console.warn
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console mocks
    console.error.mockRestore();
    console.warn.mockRestore();
  });
  
  it('should initialize with home breadcrumbs at root path', async () => {
    const { breadcrumbService } = renderWithBreadcrumbContext('/');
    
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('1');
      expect(screen.getByTestId('first-breadcrumb-label')).toHaveTextContent('Home');
    });
    
    expect(breadcrumbService.getDefaultBreadcrumbs).toHaveBeenCalledWith('/');
  });
  
  it('should update breadcrumbs when navigating to standard routes', async () => {
    const { breadcrumbService } = renderWithBreadcrumbContext('/integrations');
    
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('2');
      expect(screen.getByTestId('first-breadcrumb-label')).toHaveTextContent('Home');
      expect(screen.getByTestId('last-breadcrumb-label')).toHaveTextContent('Integrations');
    });
    
    expect(breadcrumbService.getDefaultBreadcrumbs).toHaveBeenCalledWith('/integrations');
  });
  
  it('should generate dynamic breadcrumbs for parameterized routes', async () => {
    const { breadcrumbService } = renderWithBreadcrumbContext('/integrations/abc-123');
    
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('3');
      expect(screen.getByTestId('first-breadcrumb-label')).toHaveTextContent('Home');
      expect(screen.getByTestId('last-breadcrumb-label')).toHaveTextContent('Integration abc-123');
    });
    
    expect(breadcrumbService.getDefaultBreadcrumbs).toHaveBeenCalledWith('/integrations/abc-123');
    expect(breadcrumbService.getDynamicBreadcrumbs).toHaveBeenCalled();
  });
  
  it('should handle MFA section name specially', async () => {
    const { breadcrumbService } = renderWithBreadcrumbContext('/admin/mfa');
    
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('3');
      expect(screen.getByTestId('first-breadcrumb-label')).toHaveTextContent('Home');
      expect(screen.getByTestId('last-breadcrumb-label')).toHaveTextContent('MFA');
    });
    
    expect(breadcrumbService.getDefaultBreadcrumbs).toHaveBeenCalledWith('/admin/mfa');
    expect(breadcrumbService.getDynamicBreadcrumbs).toHaveBeenCalled();
  });
  
  it('should use fallback breadcrumbs when no default or dynamic match', async () => {
    const { breadcrumbService } = renderWithBreadcrumbContext('/unknown-page');
    
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('1');
      expect(screen.getByTestId('first-breadcrumb-label')).toHaveTextContent('Home');
    });
    
    expect(breadcrumbService.getDefaultBreadcrumbs).toHaveBeenCalledWith('/unknown-page');
    expect(breadcrumbService.getDynamicBreadcrumbs).toHaveBeenCalled();
    expect(breadcrumbService.getFallbackBreadcrumbs).toHaveBeenCalled();
  });
  
  it('should allow manual setting of breadcrumbs', async () => {
    renderWithBreadcrumbContext('/');
    
    // Wait for initial breadcrumbs to load
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('1');
    });
    
    // Manually set breadcrumbs
    fireEvent.click(screen.getByTestId('set-custom-breadcrumbs'));
    
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('3');
      expect(screen.getByTestId('first-breadcrumb-label')).toHaveTextContent('Home');
      expect(screen.getByTestId('last-breadcrumb-label')).toHaveTextContent('Detail');
    });
  });
  
  it('should handle errors when setting invalid breadcrumbs', async () => {
    renderWithBreadcrumbContext('/');
    
    // Wait for initial breadcrumbs to load
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('1');
      expect(screen.getByTestId('first-breadcrumb-label')).toHaveTextContent('Home');
    });
    
    // Try to set invalid breadcrumbs
    fireEvent.click(screen.getByTestId('set-invalid-breadcrumbs'));
    
    // Breadcrumbs should remain unchanged
    expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('1');
    expect(screen.getByTestId('first-breadcrumb-label')).toHaveTextContent('Home');
    
    // Console error should have been called
    expect(console.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('setBreadcrumbs expects an array of breadcrumb objects');
  });
  
  it('should fetch integration name using integration service', async () => {
    // Create a mock integration service
    const mockIntegrationService = createMockIntegrationService();
    
    // Create a mock breadcrumb service that verifies integration data
    const mockBreadcrumbService = createMockBreadcrumbService();
    
    const { breadcrumbService } = renderWithBreadcrumbContext(
      '/integrations/abc-123',
      mockBreadcrumbService,
      mockIntegrationService
    );
    
    // Initially it will use the integration ID
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('3');
      expect(screen.getByTestId('last-breadcrumb-label')).toHaveTextContent('Integration abc-123');
    });
    
    // Verify service was called
    expect(mockIntegrationService.getIntegrationById).toHaveBeenCalledWith('abc-123');
    
    // After integration data is loaded, it will update with the real name
    await waitFor(() => {
      expect(breadcrumbService.getDynamicBreadcrumbs).toHaveBeenCalledWith(
        '/integrations/abc-123',
        expect.objectContaining({
          integrations: expect.objectContaining({
            'abc-123': expect.objectContaining({
              name: 'Customer Data Sync'
            })
          })
        })
      );
    });
  });
  
  it('should maintain manually set breadcrumbs until route changes', async () => {
    const { getContextValues } = renderWithBreadcrumbContext('/');
    
    // Wait for initial breadcrumbs to load
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('1');
    });
    
    // Manually set breadcrumbs
    fireEvent.click(screen.getByTestId('set-custom-breadcrumbs'));
    
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('3');
      const contextValues = getContextValues();
      expect(contextValues.isManuallySet).toBe(true);
    });
    
    // Clear manual breadcrumbs flag
    getContextValues().clearManualBreadcrumbs();
    
    await waitFor(() => {
      const contextValues = getContextValues();
      expect(contextValues.isManuallySet).toBe(false);
    });
  });
  
  it('should directly expose context methods through getContextValues helper', async () => {
    const { getContextValues } = renderWithBreadcrumbContext('/');
    
    // Wait for initial breadcrumbs to load
    await waitFor(() => {
      expect(screen.getByTestId('breadcrumbs-count')).toHaveTextContent('1');
    });
    
    // Get current context values
    const contextValues = getContextValues();
    
    // Verify context has expected structure and values
    expect(contextValues.breadcrumbs).toHaveLength(1);
    expect(contextValues.breadcrumbs[0].label).toBe('Home');
    expect(typeof contextValues.setBreadcrumbs).toBe('function');
    expect(typeof contextValues.clearManualBreadcrumbs).toBe('function');
    expect(typeof contextValues.isManuallySet).toBe('boolean');
  });
  
  it('should throw error when hook is used outside provider', () => {
    // Mock console.error to avoid test output noise
    const originalError = console.error;
    console.error = jest.fn();
    
    // Using a custom render function to catch the expected error
    const renderWithoutProvider = () => {
  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';

  // Added display name
  renderWithoutProvider.displayName = 'renderWithoutProvider';


      const TestHookComponent = () => {
  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';

  // Added display name
  TestHookComponent.displayName = 'TestHookComponent';


        useBreadcrumbs();
        return <div>Should not render</div>;
      };
      
      return render(
        <MemoryRouter>
          <TestHookComponent />
        </MemoryRouter>
      );
    };
    
    // Expect the render to throw
    expect(renderWithoutProvider).toThrow('useBreadcrumbs must be used within a BreadcrumbProvider');
    
    // Restore original console.error
    console.error = originalError;
  });
});