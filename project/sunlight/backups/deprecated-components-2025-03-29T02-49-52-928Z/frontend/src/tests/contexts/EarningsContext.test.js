// tests/contexts/EarningsContext.test.js
// -----------------------------------------------------------------------------
// Tests for the EarningsContext provider and hook using dependency injection pattern

import React, { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EarningsProvider, useEarnings } from '@contexts/EarningsContext';

// Sample mock data
const mockRosters = [
  {
    id: 1,
    name: 'HR Roster',
    source_system: 'Workday',
    destination_system: 'ADP',
    employee_count: 150,
    last_sync: '2025-01-01T12:00:00Z',
  },
  {
    id: 2,
    name: 'Finance Roster',
    source_system: 'Oracle',
    destination_system: 'SAP',
    employee_count: 75,
    last_sync: '2025-01-02T09:30:00Z',
  },
];

const mockRosterDetails = {
  id: 1,
  name: 'HR Roster',
  source_system: 'Workday',
  destination_system: 'ADP',
  description: 'HR department employee roster',
  employee_count: 150,
  last_sync: '2025-01-01T12:00:00Z',
  created_at: '2024-12-01T10:00:00Z',
  configuration: {
    sync_frequency: 'daily',
    sync_time: '01:00:00',
    fields_mapped: true,
  },
};

const mockEmployees = [
  {
    id: 1,
    roster_id: 1,
    employee_id: 'E001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
    status: 'active',
  },
  {
    id: 2,
    roster_id: 1,
    employee_id: 'E002',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@example.com',
    department: 'Marketing',
    status: 'active',
  },
];

const mockEarningsCodes = [
  {
    id: 1,
    code: 'REG',
    description: 'Regular Pay',
    destination_system: 'ADP',
    category: 'regular',
    active: true,
  },
  {
    id: 2,
    code: 'OT',
    description: 'Overtime',
    destination_system: 'ADP',
    category: 'overtime',
    active: true,
  },
  {
    id: 3,
    code: 'BON',
    description: 'Bonus',
    destination_system: 'SAP',
    category: 'bonus',
    active: true,
  },
];

// Create mock API service
const createMockApiService = () => {
  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';

  // Added display name
  createMockApiService.displayName = 'createMockApiService';


  return {
    getRosters: jest.fn().mockResolvedValue(mockRosters),
    getRosterById: jest.fn().mockResolvedValue(mockRosterDetails),
    createRoster: jest.fn().mockResolvedValue({
      id: 3,
      name: 'New Roster',
      source_system: 'Workday',
      destination_system: 'ADP',
      employee_count: 0,
    }),
    updateRoster: jest.fn().mockResolvedValue({
      ...mockRosterDetails,
      name: 'Updated Roster',
      description: 'Updated description',
    }),
    deleteRoster: jest.fn().mockResolvedValue(true),
    syncRoster: jest.fn().mockResolvedValue({ success: true }),
    getEarningsCodes: jest.fn().mockResolvedValue(mockEarningsCodes),
    createEarningsCode: jest.fn().mockResolvedValue({
      id: 4,
      code: 'NEW',
      description: 'New Code',
      destination_system: 'ADP',
      category: 'regular',
      active: true,
    }),
    updateEarningsCode: jest.fn().mockResolvedValue({
      ...mockEarningsCodes[0],
      description: 'Updated Regular Pay',
    }),
    deleteEarningsCode: jest.fn().mockResolvedValue(true),
    getEmployees: jest.fn().mockResolvedValue(mockEmployees),
    getEarningsMapById: jest.fn().mockResolvedValue({}),
  };
};

// Test component with optional callback to expose context values
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
  const context = useEarnings();
  
  // Call the callback with context values after render
  useEffect(() => {
    onContextLoad(context);
  }, [onContextLoad, context]);

  const {
    rosters,
    selectedRosterId,
    selectedRoster,
    earningsCodes,
    filterSystem,
    employees,
    loading,
    errors,

    fetchRosters,
    fetchRosterById,
    createRoster,
    updateRoster,
    deleteRoster,
    syncRoster,

    fetchEarningsCodes,
    createEarningsCode,
    updateEarningsCode,
    deleteEarningsCode,
    setFilterSystem,

    fetchEmployees,
    setSelectedRosterId,
  } = context;

  return (
    <div>
      {/* State display */}
      <div data-testid="rosters-count">{rosters.length}</div>
      <div data-testid="selected-roster-id">{selectedRosterId || 'none'}</div>
      <div data-testid="selected-roster-name">
        {selectedRoster ? selectedRoster.name : 'No roster selected'}
      </div>
      <div data-testid="earnings-codes-count">{earningsCodes.length}</div>
      <div data-testid="filter-system">{filterSystem || 'none'}</div>
      <div data-testid="employees-count">{employees.length}</div>

      {/* Loading states */}
      <div data-testid="loading-rosters">{loading.rosters ? 'true' : 'false'}</div>
      <div data-testid="loading-roster">{loading.roster ? 'true' : 'false'}</div>
      <div data-testid="loading-earnings-codes">{loading.earningsCodes ? 'true' : 'false'}</div>
      <div data-testid="loading-employees">{loading.employees ? 'true' : 'false'}</div>
      <div data-testid="loading-creating">{loading.creating ? 'true' : 'false'}</div>
      <div data-testid="loading-updating">{loading.updating ? 'true' : 'false'}</div>
      <div data-testid="loading-deleting">{loading.deleting ? 'true' : 'false'}</div>
      <div data-testid="loading-syncing">{loading.syncing ? 'true' : 'false'}</div>

      {/* Error states */}
      <div data-testid="error-rosters">{errors.rosters || 'no-error'}</div>
      <div data-testid="error-roster">{errors.roster || 'no-error'}</div>
      <div data-testid="error-earnings-codes">{errors.earningsCodes || 'no-error'}</div>
      <div data-testid="error-employees">{errors.employees || 'no-error'}</div>
      <div data-testid="error-create">{errors.create || 'no-error'}</div>
      <div data-testid="error-update">{errors.update || 'no-error'}</div>
      <div data-testid="error-delete">{errors.delete || 'no-error'}</div>
      <div data-testid="error-sync">{errors.sync || 'no-error'}</div>

      {/* Action buttons */}
      <button data-testid="fetch-rosters" onClick={fetchRosters}>
        Fetch Rosters
      </button>

      <button data-testid="fetch-roster-by-id" onClick={() => fetchRosterById(1)}>
        Fetch Roster Details
      </button>

      <button data-testid="set-selected-roster-id" onClick={() => setSelectedRosterId(1)}>
        Set Selected Roster ID
      </button>

      <button data-testid="fetch-earnings-codes" onClick={() => fetchEarningsCodes()}>
        Fetch Earnings Codes
      </button>

      <button data-testid="fetch-filtered-earnings-codes" onClick={() => fetchEarningsCodes('ADP')}>
        Fetch ADP Earnings Codes
      </button>

      <button data-testid="fetch-employees" onClick={() => fetchEmployees(1)}>
        Fetch Employees
      </button>

      <button
        data-testid="create-roster"
        onClick={() =>
          createRoster({
            name: 'New Roster',
            source_system: 'Workday',
            destination_system: 'ADP',
          })
        }
      >
        Create Roster
      </button>

      <button
        data-testid="update-roster"
        onClick={() =>
          updateRoster(1, {
            name: 'Updated Roster',
            description: 'Updated description',
          })
        }
      >
        Update Roster
      </button>

      <button data-testid="delete-roster" onClick={() => deleteRoster(1)}>
        Delete Roster
      </button>

      <button data-testid="sync-roster" onClick={() => syncRoster(1)}>
        Sync Roster
      </button>

      <button
        data-testid="create-earnings-code"
        onClick={() =>
          createEarningsCode({
            code: 'NEW',
            description: 'New Code',
            destination_system: 'ADP',
          })
        }
      >
        Create Earnings Code
      </button>

      <button
        data-testid="update-earnings-code"
        onClick={() =>
          updateEarningsCode(1, {
            description: 'Updated Regular Pay',
          })
        }
      >
        Update Earnings Code
      </button>

      <button data-testid="delete-earnings-code" onClick={() => deleteEarningsCode(1)}>
        Delete Earnings Code
      </button>

      <button data-testid="set-filter-system" onClick={() => setFilterSystem('ADP')}>
        Set Filter System
      </button>
    </div>
  );
};

// Helper function for simpler test setup with dependency injection
const renderWithEarningsContext = (apiService = createMockApiService()) => {
  let contextValues = null;

  render(
    <EarningsProvider apiService={apiService}>
      <TestComponent
        onContextLoad={(values) => {
          contextValues = values;
        }}
      />
    </EarningsProvider>
  );

  // Helper to get the latest context values
  const getContextValues = () => contextValues;

  return {
    getContextValues,
    apiService,
  };
};

describe('EarningsContext using dependency injection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid cluttering the test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  it('should initialize with default values', () => {
    renderWithEarningsContext();

    // Check initial state
    expect(screen.getByTestId('rosters-count')).toHaveTextContent('0');
    expect(screen.getByTestId('selected-roster-id')).toHaveTextContent('none');
    expect(screen.getByTestId('selected-roster-name')).toHaveTextContent('No roster selected');
    expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('0');
    expect(screen.getByTestId('filter-system')).toHaveTextContent('none');
    expect(screen.getByTestId('employees-count')).toHaveTextContent('0');

    // Loading states should be false
    expect(screen.getByTestId('loading-rosters')).toHaveTextContent('false');
    expect(screen.getByTestId('loading-roster')).toHaveTextContent('false');
    expect(screen.getByTestId('loading-earnings-codes')).toHaveTextContent('false');
    expect(screen.getByTestId('loading-employees')).toHaveTextContent('false');

    // Error states should be empty
    expect(screen.getByTestId('error-rosters')).toHaveTextContent('no-error');
    expect(screen.getByTestId('error-roster')).toHaveTextContent('no-error');
    expect(screen.getByTestId('error-earnings-codes')).toHaveTextContent('no-error');
    expect(screen.getByTestId('error-employees')).toHaveTextContent('no-error');
  });

  it('should fetch rosters successfully', async () => {
    const { apiService } = renderWithEarningsContext();

    // Initial data fetch should happen automatically
    await waitFor(() => {
      expect(screen.getByTestId('rosters-count')).toHaveTextContent('2');
      expect(screen.getByTestId('loading-rosters')).toHaveTextContent('false');
    });

    // Ensure service was called
    expect(apiService.getRosters).toHaveBeenCalledTimes(1);
  });

  it('should fetch earnings codes successfully', async () => {
    const { apiService } = renderWithEarningsContext();

    // Initial data fetch should happen automatically
    await waitFor(() => {
      expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('3');
      expect(screen.getByTestId('loading-earnings-codes')).toHaveTextContent('false');
    });

    // Ensure service was called
    expect(apiService.getEarningsCodes).toHaveBeenCalledTimes(1);
  });

  it('should fetch earnings codes with filter', async () => {
    const { apiService } = renderWithEarningsContext();

    // Filter to only ADP codes
    fireEvent.click(screen.getByTestId('fetch-filtered-earnings-codes'));

    await waitFor(() => {
      expect(screen.getByTestId('loading-earnings-codes')).toHaveTextContent('false');
      expect(screen.getByTestId('filter-system')).toHaveTextContent('ADP');
    });

    // Ensure service was called with filter
    expect(apiService.getEarningsCodes).toHaveBeenCalledWith({ destination_system: 'ADP' });
  });

  it('should set the selected roster ID and fetch related data', async () => {
    const { apiService } = renderWithEarningsContext();

    // Set selected roster ID
    fireEvent.click(screen.getByTestId('set-selected-roster-id'));

    // Loading states should be true initially
    expect(screen.getByTestId('loading-roster')).toHaveTextContent('true');
    expect(screen.getByTestId('loading-employees')).toHaveTextContent('true');

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('selected-roster-id')).toHaveTextContent('1');
      expect(screen.getByTestId('selected-roster-name')).toHaveTextContent('HR Roster');
      expect(screen.getByTestId('employees-count')).toHaveTextContent('2');
      expect(screen.getByTestId('loading-roster')).toHaveTextContent('false');
      expect(screen.getByTestId('loading-employees')).toHaveTextContent('false');
    });

    // Ensure services were called with correct IDs
    expect(apiService.getRosterById).toHaveBeenCalledWith(1);
    expect(apiService.getEmployees).toHaveBeenCalledWith(1);
  });

  it('should create a roster successfully', async () => {
    const { apiService } = renderWithEarningsContext();

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('rosters-count')).toHaveTextContent('2');
    });

    // Create new roster
    fireEvent.click(screen.getByTestId('create-roster'));

    // Loading state should be true initially
    expect(screen.getByTestId('loading-creating')).toHaveTextContent('true');

    // Wait for creation to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-creating')).toHaveTextContent('false');
      expect(screen.getByTestId('rosters-count')).toHaveTextContent('3');
    });

    // Verify service call
    expect(apiService.createRoster).toHaveBeenCalledWith({
      name: 'New Roster',
      source_system: 'Workday',
      destination_system: 'ADP',
    });
  });

  it('should update a roster successfully', async () => {
    const { apiService } = renderWithEarningsContext();

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('rosters-count')).toHaveTextContent('2');
    });

    // First set the selected roster
    fireEvent.click(screen.getByTestId('set-selected-roster-id'));

    await waitFor(() => {
      expect(screen.getByTestId('selected-roster-name')).toHaveTextContent('HR Roster');
    });

    // Update the roster
    fireEvent.click(screen.getByTestId('update-roster'));

    // Loading state should be true initially
    expect(screen.getByTestId('loading-updating')).toHaveTextContent('true');

    // Wait for update to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-updating')).toHaveTextContent('false');
      // Selected roster should reflect the update
      expect(screen.getByTestId('selected-roster-name')).toHaveTextContent('Updated Roster');
    });

    // Verify service call
    expect(apiService.updateRoster).toHaveBeenCalledWith(1, {
      name: 'Updated Roster',
      description: 'Updated description',
    });
  });

  it('should delete a roster successfully', async () => {
    const { apiService } = renderWithEarningsContext();

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('rosters-count')).toHaveTextContent('2');
    });

    // First set the selected roster
    fireEvent.click(screen.getByTestId('set-selected-roster-id'));

    await waitFor(() => {
      expect(screen.getByTestId('selected-roster-id')).toHaveTextContent('1');
    });

    // Delete the roster
    fireEvent.click(screen.getByTestId('delete-roster'));

    // Loading state should be true initially
    expect(screen.getByTestId('loading-deleting')).toHaveTextContent('true');

    // Wait for deletion to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-deleting')).toHaveTextContent('false');
      // The roster count should be reduced by 1
      expect(screen.getByTestId('rosters-count')).toHaveTextContent('1');
      // Selected roster should be cleared
      expect(screen.getByTestId('selected-roster-id')).toHaveTextContent('none');
      expect(screen.getByTestId('selected-roster-name')).toHaveTextContent('No roster selected');
    });

    // Verify service call
    expect(apiService.deleteRoster).toHaveBeenCalledWith(1);
  });

  it('should sync a roster successfully', async () => {
    const { apiService } = renderWithEarningsContext();

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('rosters-count')).toHaveTextContent('2');
    });

    // Sync the roster
    fireEvent.click(screen.getByTestId('sync-roster'));

    // Loading state should be true initially
    expect(screen.getByTestId('loading-syncing')).toHaveTextContent('true');

    // Wait for sync to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-syncing')).toHaveTextContent('false');
    });

    // Verify service calls
    expect(apiService.syncRoster).toHaveBeenCalledWith({
      roster_id: 1,
      destination_system: '',
    });

    // Rosters should be refreshed after sync
    expect(apiService.getRosters).toHaveBeenCalledTimes(2);
  });

  it('should create an earnings code successfully', async () => {
    const { apiService } = renderWithEarningsContext();

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('3');
    });

    // Create a new earnings code
    fireEvent.click(screen.getByTestId('create-earnings-code'));

    // Loading state should be true initially
    expect(screen.getByTestId('loading-creating')).toHaveTextContent('true');

    // Wait for creation to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-creating')).toHaveTextContent('false');
      expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('4');
    });

    // Verify service call
    expect(apiService.createEarningsCode).toHaveBeenCalledWith({
      code: 'NEW',
      description: 'New Code',
      destination_system: 'ADP',
    });
  });

  it('should update an earnings code successfully', async () => {
    const { apiService } = renderWithEarningsContext();

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('3');
    });

    // Update an earnings code
    fireEvent.click(screen.getByTestId('update-earnings-code'));

    // Loading state should be true initially
    expect(screen.getByTestId('loading-updating')).toHaveTextContent('true');

    // Wait for update to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-updating')).toHaveTextContent('false');
      // Count should still be 3
      expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('3');
    });

    // Verify service call
    expect(apiService.updateEarningsCode).toHaveBeenCalledWith(1, {
      description: 'Updated Regular Pay',
    });
  });

  it('should delete an earnings code successfully', async () => {
    const { apiService } = renderWithEarningsContext();

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('3');
    });

    // Delete an earnings code
    fireEvent.click(screen.getByTestId('delete-earnings-code'));

    // Loading state should be true initially
    expect(screen.getByTestId('loading-deleting')).toHaveTextContent('true');

    // Wait for deletion to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-deleting')).toHaveTextContent('false');
      // Count should now be 2
      expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('2');
    });

    // Verify service call
    expect(apiService.deleteEarningsCode).toHaveBeenCalledWith(1);
  });

  it('should handle errors when fetching rosters', async () => {
    const mockApiService = createMockApiService();
    // Mock an error response
    mockApiService.getRosters.mockRejectedValue(new Error('Network error'));

    renderWithEarningsContext(mockApiService);

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('error-rosters')).not.toHaveTextContent('no-error');
      expect(screen.getByTestId('loading-rosters')).toHaveTextContent('false');
      expect(screen.getByTestId('rosters-count')).toHaveTextContent('0');
    });

    // Verify console error was called
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle errors when fetching earnings codes', async () => {
    const mockApiService = createMockApiService();
    // Mock an error response
    mockApiService.getEarningsCodes.mockRejectedValue(new Error('Network error'));

    renderWithEarningsContext(mockApiService);

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('error-earnings-codes')).not.toHaveTextContent('no-error');
      expect(screen.getByTestId('loading-earnings-codes')).toHaveTextContent('false');
      expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('0');
    });

    // Verify console error was called
    expect(console.error).toHaveBeenCalled();
  });

  it('should directly expose context methods through getContextValues helper', async () => {
    const mockApiService = createMockApiService();
    const { getContextValues } = renderWithEarningsContext(mockApiService);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('rosters-count')).toHaveTextContent('2');
      expect(screen.getByTestId('earnings-codes-count')).toHaveTextContent('3');
    });

    // Get current context values
    const contextValues = getContextValues();

    // Verify context has expected structure and values
    expect(contextValues.rosters).toHaveLength(2);
    expect(contextValues.earningsCodes).toHaveLength(3);
    expect(contextValues.selectedRosterId).toBeNull();
    expect(contextValues.employees).toHaveLength(0);
    expect(typeof contextValues.fetchRosters).toBe('function');
    expect(typeof contextValues.createRoster).toBe('function');
    expect(typeof contextValues.fetchEarningsCodes).toBe('function');
    expect(typeof contextValues.getDestinationSystems).toBe('function');
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


        useEarnings();
        return <div>Should not render</div>;
      };
      
      return render(<TestHookComponent />);
    };
    
    // Expect the render to throw
    expect(renderWithoutProvider).toThrow('useEarnings must be used within an EarningsProvider');
    
    // Restore original console.error
    console.error = originalError;
  });
});