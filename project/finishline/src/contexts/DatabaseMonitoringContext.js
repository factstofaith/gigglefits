/**
 * Database Monitoring Context
 * 
 * Provides real-time database performance metrics and status information
 * for the Database Optimization (Phase 4) implementation.
 */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

export const DatabaseMonitoringContext = createContext();

export const DatabaseMonitoringProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({
    connectionPool: {
      utilization: 0,
      activeConnections: 0,
      idleConnections: 0,
      maxConnections: 0,
      waitingQueries: 0,
    },
    queryPerformance: {
      averageQueryTime: 0,
      slowQueries: [],
      cacheHitRate: 0,
      queryCount: 0,
    },
    indexUsage: {
      unusedIndexes: [],
      missingIndexes: [],
    },
    health: {
      status: 'unknown',
      lastIssue: null,
      responseTime: 0,
    }
  });
  
  const [status, setStatus] = useState('healthy');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to refresh database metrics
  const refreshMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would call an API endpoint
      // Mock implementation for development
      const response = await fetch('/api/admin/database/metrics');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch database metrics: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMetrics(data);
      setStatus(data.health?.status || 'unknown');
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch database metrics', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Get metrics for a specific database component
  const getComponentMetrics = useCallback((component) => {
    switch (component) {
      case 'connectionPool':
        return metrics.connectionPool || {};
      case 'queryPerformance':
        return metrics.queryPerformance || {};
      case 'indexUsage':
        return metrics.indexUsage || {};
      case 'health':
        return metrics.health || {};
      default:
        return {};
    }
  }, [metrics]);
  
  // Check if any alerts are active
  const hasAlerts = useCallback(() => {
    return (
      (metrics.connectionPool?.utilization > 80) ||
      (metrics.queryPerformance?.slowQueries?.length > 0) ||
      (metrics.indexUsage?.missingIndexes?.length > 0) ||
      (metrics.health?.status !== 'healthy')
    );
  }, [metrics]);
  
  // Initial metrics load
  useEffect(() => {
    refreshMetrics();
    
    // Set up periodic refresh
    const interval = setInterval(refreshMetrics, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [refreshMetrics]);
  
  return (
    <DatabaseMonitoringContext.Provider 
      value={{ 
        metrics,
        status,
        lastUpdated,
        isLoading,
        error,
        refreshMetrics,
        getComponentMetrics,
        hasAlerts
      }}
    >
      {children}
    </DatabaseMonitoringContext.Provider>
  );
};

export const useDatabaseMonitoring = () => useContext(DatabaseMonitoringContext);

export default DatabaseMonitoringContext;