// EarningsContext.jsx
// -----------------------------------------------------------------------------
// Context provider for earnings-related state management

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import earningsService, {
  getRosters,
  getRosterById,
  createRoster,
  updateRoster,
  deleteRoster,
  syncRoster,
  getEarningsCodes,
  createEarningsCode,
  updateEarningsCode,
  deleteEarningsCode,
  getEmployees,
  getEarningsMapById,
} from '../services/earningsService';

// Create the context
const EarningsContext = createContext();

// Default service implementations
const defaultEarningsService = {
  getRosters,
  getRosterById,
  createRoster,
  updateRoster,
  deleteRoster,
  syncRoster,
  getEarningsCodes,
  createEarningsCode,
  updateEarningsCode,
  deleteEarningsCode,
  getEmployees,
  getEarningsMapById,
};

// Custom hook for using the earnings context
export const useEarnings = () => {
  // Added display name
  useEarnings.displayName = 'useEarnings';

  // Added display name
  useEarnings.displayName = 'useEarnings';

  // Added display name
  useEarnings.displayName = 'useEarnings';

  // Added display name
  useEarnings.displayName = 'useEarnings';

  // Added display name
  useEarnings.displayName = 'useEarnings';


  const context = useContext(EarningsContext);
  if (!context) {
    throw new Error('useEarnings must be used within an EarningsProvider');
  }
  return context;
};

// Provider component with dependency injection
export const EarningsProvider = ({ 
  children,
  apiService = defaultEarningsService 
}) => {
  // Added display name
  EarningsProvider.displayName = 'EarningsProvider';

  // Added display name
  EarningsProvider.displayName = 'EarningsProvider';

  // Added display name
  EarningsProvider.displayName = 'EarningsProvider';

  // Added display name
  EarningsProvider.displayName = 'EarningsProvider';

  // Added display name
  EarningsProvider.displayName = 'EarningsProvider';


  // State for rosters
  const [rosters, setRosters] = useState([]);
  const [selectedRosterId, setSelectedRosterId] = useState(null);
  const [selectedRoster, setSelectedRoster] = useState(null);

  // State for earnings codes
  const [earningsCodes, setEarningsCodes] = useState([]);
  const [filterSystem, setFilterSystem] = useState('');

  // State for employees
  const [employees, setEmployees] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    rosters: false,
    roster: false,
    earningsCodes: false,
    employees: false,
    creating: false,
    updating: false,
    deleting: false,
    syncing: false,
  });

  // Error states
  const [errors, setErrors] = useState({
    rosters: null,
    roster: null,
    earningsCodes: null,
    employees: null,
    create: null,
    update: null,
    delete: null,
    sync: null,
  });

  // Fetch all rosters
  const fetchRosters = useCallback(async () => {
  // Added display name
  fetchRosters.displayName = 'fetchRosters';

    try {
      setLoading(prev => ({ ...prev, rosters: true }));
      setErrors(prev => ({ ...prev, rosters: null }));

      const data = await apiService.getRosters();
      setRosters(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching rosters:', error);
      setErrors(prev => ({ ...prev, rosters: 'Failed to load employee rosters' }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, rosters: false }));
    }
  }, [apiService]);

  // Fetch a specific roster by ID
  const fetchRosterById = useCallback(async rosterId => {
  // Added display name
  fetchRosterById.displayName = 'fetchRosterById';

    if (!rosterId) return null;

    try {
      setLoading(prev => ({ ...prev, roster: true }));
      setErrors(prev => ({ ...prev, roster: null }));

      const data = await apiService.getRosterById(rosterId);
      setSelectedRoster(data);
      return data;
    } catch (error) {
      console.error(`Error fetching roster with ID ${rosterId}:`, error);
      setErrors(prev => ({ ...prev, roster: 'Failed to load roster details' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, roster: false }));
    }
  }, [apiService]);

  // Create a new roster
  const createNewRoster = useCallback(async rosterData => {
  // Added display name
  createNewRoster.displayName = 'createNewRoster';

    try {
      setLoading(prev => ({ ...prev, creating: true }));
      setErrors(prev => ({ ...prev, create: null }));

      const newRoster = await apiService.createRoster(rosterData);
      setRosters(prev => [...(prev || []), newRoster]);
      return newRoster;
    } catch (error) {
      console.error('Error creating roster:', error);
      setErrors(prev => ({ ...prev, create: 'Failed to create roster' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  }, [apiService]);

  // Update an existing roster
  const updateExistingRoster = useCallback(
    async (rosterId, rosterData) => {
  // Added display name
  updateExistingRoster.displayName = 'updateExistingRoster';

      try {
        setLoading(prev => ({ ...prev, updating: true }));
        setErrors(prev => ({ ...prev, update: null }));

        const updatedRoster = await apiService.updateRoster(rosterId, rosterData);
        setRosters(prev => prev.map(r => (r.id === rosterId ? updatedRoster : r)));

        if (selectedRosterId === rosterId) {
          setSelectedRoster(updatedRoster);
        }

        return updatedRoster;
      } catch (error) {
        console.error(`Error updating roster with ID ${rosterId}:`, error);
        setErrors(prev => ({ ...prev, update: 'Failed to update roster' }));
        return null;
      } finally {
        setLoading(prev => ({ ...prev, updating: false }));
      }
    },
    [selectedRosterId, apiService]
  );

  // Delete a roster
  const deleteExistingRoster = useCallback(
    async rosterId => {
  // Added display name
  deleteExistingRoster.displayName = 'deleteExistingRoster';

      try {
        setLoading(prev => ({ ...prev, deleting: true }));
        setErrors(prev => ({ ...prev, delete: null }));

        await apiService.deleteRoster(rosterId);
        setRosters(prev => prev.filter(r => r.id !== rosterId));

        if (selectedRosterId === rosterId) {
          setSelectedRosterId(null);
          setSelectedRoster(null);
        }

        return true;
      } catch (error) {
        console.error(`Error deleting roster with ID ${rosterId}:`, error);
        setErrors(prev => ({ ...prev, delete: 'Failed to delete roster' }));
        return false;
      } finally {
        setLoading(prev => ({ ...prev, deleting: false }));
      }
    },
    [selectedRosterId, apiService]
  );

  // Sync a roster
  const syncExistingRoster = useCallback(
    async rosterId => {
  // Added display name
  syncExistingRoster.displayName = 'syncExistingRoster';

      const roster = rosters.find(r => r.id === rosterId);
      if (!roster) return false;

      try {
        setLoading(prev => ({ ...prev, syncing: true }));
        setErrors(prev => ({ ...prev, sync: null }));

        const syncRequest = {
          roster_id: rosterId,
          destination_system: roster.destination_system || '',
        };

        await apiService.syncRoster(syncRequest);

        // Refresh rosters to get updated sync time
        await fetchRosters();

        return true;
      } catch (error) {
        console.error(`Error syncing roster with ID ${rosterId}:`, error);
        setErrors(prev => ({ ...prev, sync: 'Failed to sync roster' }));
        return false;
      } finally {
        setLoading(prev => ({ ...prev, syncing: false }));
      }
    },
    [rosters, fetchRosters, apiService]
  );

  // Fetch earnings codes, optionally filtered by destination system
  const fetchEarningsCodes = useCallback(async (systemFilter = '') => {
    try {
      setLoading(prev => ({ ...prev, earningsCodes: true }));
      setErrors(prev => ({ ...prev, earningsCodes: null }));

      let params = {};
      if (systemFilter) {
        params = { destination_system: systemFilter };
        setFilterSystem(systemFilter);
      } else {
        setFilterSystem('');
      }

      const data = await apiService.getEarningsCodes(params);
      setEarningsCodes(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching earnings codes:', error);
      setErrors(prev => ({ ...prev, earningsCodes: 'Failed to load earnings codes' }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, earningsCodes: false }));
    }
  }, [apiService]);

  // Create a new earnings code
  const createNewEarningsCode = useCallback(async codeData => {
  // Added display name
  createNewEarningsCode.displayName = 'createNewEarningsCode';

    try {
      setLoading(prev => ({ ...prev, creating: true }));
      setErrors(prev => ({ ...prev, create: null }));

      const newCode = await apiService.createEarningsCode(codeData);
      setEarningsCodes(prev => [...(prev || []), newCode]);
      return newCode;
    } catch (error) {
      console.error('Error creating earnings code:', error);
      setErrors(prev => ({ ...prev, create: 'Failed to create earnings code' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  }, [apiService]);

  // Update an existing earnings code
  const updateExistingEarningsCode = useCallback(async (codeId, codeData) => {
  // Added display name
  updateExistingEarningsCode.displayName = 'updateExistingEarningsCode';

    try {
      setLoading(prev => ({ ...prev, updating: true }));
      setErrors(prev => ({ ...prev, update: null }));

      const updatedCode = await apiService.updateEarningsCode(codeId, codeData);
      setEarningsCodes(prev => prev.map(c => (c.id === codeId ? updatedCode : c)));
      return updatedCode;
    } catch (error) {
      console.error(`Error updating earnings code with ID ${codeId}:`, error);
      setErrors(prev => ({ ...prev, update: 'Failed to update earnings code' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, updating: false }));
    }
  }, [apiService]);

  // Delete an earnings code
  const deleteExistingEarningsCode = useCallback(async codeId => {
  // Added display name
  deleteExistingEarningsCode.displayName = 'deleteExistingEarningsCode';

    try {
      setLoading(prev => ({ ...prev, deleting: true }));
      setErrors(prev => ({ ...prev, delete: null }));

      await apiService.deleteEarningsCode(codeId);
      setEarningsCodes(prev => prev.filter(c => c.id !== codeId));
      return true;
    } catch (error) {
      console.error(`Error deleting earnings code with ID ${codeId}:`, error);
      setErrors(prev => ({ ...prev, delete: 'Failed to delete earnings code' }));
      return false;
    } finally {
      setLoading(prev => ({ ...prev, deleting: false }));
    }
  }, [apiService]);

  // Fetch employees for a specific roster
  const fetchEmployees = useCallback(async rosterId => {
  // Added display name
  fetchEmployees.displayName = 'fetchEmployees';

    if (!rosterId) return [];

    try {
      setLoading(prev => ({ ...prev, employees: true }));
      setErrors(prev => ({ ...prev, employees: null }));

      const data = await apiService.getEmployees(rosterId);
      setEmployees(data || []);
      return data;
    } catch (error) {
      console.error(`Error fetching employees for roster ID ${rosterId}:`, error);
      setErrors(prev => ({ ...prev, employees: 'Failed to load employees' }));
      return [];
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  }, [apiService]);

  // Get available destination systems from earnings codes
  const getDestinationSystems = useCallback(() => {
  // Added display name
  getDestinationSystems.displayName = 'getDestinationSystems';

    const systems = new Set();
    earningsCodes.forEach(code => {
      if (code.destination_system) {
        systems.add(code.destination_system);
      }
    });
    return Array.from(systems);
  }, [earningsCodes]);

  // Update selected roster when selectedRosterId changes
  useEffect(() => {
    if (selectedRosterId) {
      fetchRosterById(selectedRosterId);
      fetchEmployees(selectedRosterId);
    } else {
      setSelectedRoster(null);
      setEmployees([]);
    }
  }, [selectedRosterId, fetchRosterById, fetchEmployees]);

  // Initial data fetch
  useEffect(() => {
    fetchRosters();
    fetchEarningsCodes();
  }, [fetchRosters, fetchEarningsCodes]);

  // The context value
  const value = {
    // State
    rosters,
    selectedRosterId,
    selectedRoster,
    earningsCodes,
    filterSystem,
    employees,
    loading,
    errors,

    // Roster methods
    fetchRosters,
    fetchRosterById,
    createRoster: createNewRoster,
    updateRoster: updateExistingRoster,
    deleteRoster: deleteExistingRoster,
    syncRoster: syncExistingRoster,
    setSelectedRosterId,

    // Earnings code methods
    fetchEarningsCodes,
    createEarningsCode: createNewEarningsCode,
    updateEarningsCode: updateExistingEarningsCode,
    deleteEarningsCode: deleteExistingEarningsCode,
    setFilterSystem,
    getDestinationSystems,

    // Employee methods
    fetchEmployees,

    // Helper methods
    isLoading: Object.values(loading).some(Boolean),
    hasError: Object.values(errors).some(error => error !== null),
  };

  return <EarningsContext.Provider value={value}>{children}</EarningsContext.Provider>;
};

export default EarningsContext;