/**
 * useDatabasePerformance Hook
 * 
 * Custom hook for working with database performance metrics and optimization features
 * Part of the Database Optimization (Phase 4) implementation
 */
import { useCallback, useState, useEffect } from 'react';
import { useDatabaseMonitoring } from '../contexts/DatabaseMonitoringContext';

const useDatabasePerformance = (options = {}) => {
  const { 
    metrics, 
    status, 
    lastUpdated, 
    refreshMetrics,
    getComponentMetrics
  } = useDatabaseMonitoring();
  
  const [componentFilter, setComponentFilter] = useState(options.component || null);
  const [alertsOnly, setAlertsOnly] = useState(options.alertsOnly || false);
  const [timeRange, setTimeRange] = useState(options.timeRange || '1h');
  
  // Filter metrics based on current settings
  const filteredMetrics = useCallback(() => {
    if (componentFilter) {
      return getComponentMetrics(componentFilter);
    }
    
    if (alertsOnly) {
      const alerts = {};
      
      // Connection pool alerts
      if (metrics.connectionPool?.utilization > 80) {
        alerts.connectionPool = {
          ...metrics.connectionPool,
          alert: 'High connection pool utilization'
        };
      }
      
      // Query performance alerts
      if (metrics.queryPerformance?.slowQueries?.length > 0) {
        alerts.queryPerformance = {
          ...metrics.queryPerformance,
          alert: `${metrics.queryPerformance.slowQueries.length} slow queries detected`
        };
      }
      
      // Index usage alerts
      if (metrics.indexUsage?.missingIndexes?.length > 0) {
        alerts.indexUsage = {
          ...metrics.indexUsage,
          alert: `${metrics.indexUsage.missingIndexes.length} missing indexes detected`
        };
      }
      
      // Health alerts
      if (metrics.health?.status !== 'healthy') {
        alerts.health = {
          ...metrics.health,
          alert: `Database health: ${metrics.health.status}`
        };
      }
      
      return alerts;
    }
    
    return metrics;
  }, [metrics, componentFilter, alertsOnly, getComponentMetrics]);
  
  // Get performance score (0-100)
  const getPerformanceScore = useCallback(() => {
    if (!metrics) return 0;
    
    // Calculate weighted score based on various metrics
    let score = 100;
    
    // Connection pool metrics (30% weight)
    if (metrics.connectionPool) {
      const poolUtilization = metrics.connectionPool.utilization || 0;
      // Higher utilization reduces score
      if (poolUtilization > 50) {
        score -= ((poolUtilization - 50) / 50) * 15;
      }
      
      // Waiting queries reduce score
      const waitingQueries = metrics.connectionPool.waitingQueries || 0;
      if (waitingQueries > 0) {
        score -= Math.min(15, waitingQueries * 3);
      }
    }
    
    // Query performance metrics (40% weight)
    if (metrics.queryPerformance) {
      // Slow queries reduce score
      const slowQueryCount = metrics.queryPerformance.slowQueries?.length || 0;
      if (slowQueryCount > 0) {
        score -= Math.min(20, slowQueryCount * 4);
      }
      
      // Low cache hit rate reduces score
      const cacheHitRate = metrics.queryPerformance.cacheHitRate || 0;
      if (cacheHitRate < 80) {
        score -= ((80 - cacheHitRate) / 80) * 20;
      }
    }
    
    // Index usage metrics (20% weight)
    if (metrics.indexUsage) {
      // Missing indexes reduce score
      const missingIndexCount = metrics.indexUsage.missingIndexes?.length || 0;
      if (missingIndexCount > 0) {
        score -= Math.min(10, missingIndexCount * 2);
      }
      
      // Unused indexes reduce score
      const unusedIndexCount = metrics.indexUsage.unusedIndexes?.length || 0;
      if (unusedIndexCount > 0) {
        score -= Math.min(10, unusedIndexCount);
      }
    }
    
    // Health status (10% weight)
    if (metrics.health && metrics.health.status !== 'healthy') {
      score -= 10;
    }
    
    return Math.max(0, Math.round(score));
  }, [metrics]);
  
  // Get optimization recommendations
  const getRecommendations = useCallback(() => {
    const recommendations = [];
    
    // Connection pool recommendations
    if (metrics.connectionPool?.utilization > 80) {
      recommendations.push({
        component: 'connectionPool',
        priority: 'high',
        message: 'Increase connection pool size to handle current load',
        action: 'increasePoolSize'
      });
    } else if (metrics.connectionPool?.utilization < 20 && 
              metrics.connectionPool?.maxConnections > 10) {
      recommendations.push({
        component: 'connectionPool',
        priority: 'medium',
        message: 'Decrease connection pool size to optimize resource usage',
        action: 'decreasePoolSize'
      });
    }
    
    // Query performance recommendations
    if (metrics.queryPerformance?.slowQueries?.length > 0) {
      recommendations.push({
        component: 'queryPerformance',
        priority: 'high',
        message: `Optimize ${metrics.queryPerformance.slowQueries.length} slow queries`,
        action: 'optimizeSlowQueries',
        details: metrics.queryPerformance.slowQueries
      });
    }
    
    if (metrics.queryPerformance?.cacheHitRate < 50) {
      recommendations.push({
        component: 'queryPerformance',
        priority: 'medium',
        message: 'Implement query caching to improve performance',
        action: 'implementCaching'
      });
    }
    
    // Index recommendations
    if (metrics.indexUsage?.missingIndexes?.length > 0) {
      recommendations.push({
        component: 'indexUsage',
        priority: 'high',
        message: `Add ${metrics.indexUsage.missingIndexes.length} recommended indexes`,
        action: 'addMissingIndexes',
        details: metrics.indexUsage.missingIndexes
      });
    }
    
    if (metrics.indexUsage?.unusedIndexes?.length > 0) {
      recommendations.push({
        component: 'indexUsage',
        priority: 'low',
        message: `Remove ${metrics.indexUsage.unusedIndexes.length} unused indexes`,
        action: 'removeUnusedIndexes',
        details: metrics.indexUsage.unusedIndexes
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityMap = { high: 0, medium: 1, low: 2 };
      return priorityMap[a.priority] - priorityMap[b.priority];
    });
  }, [metrics]);
  
  // Monitor changes in metrics and refresh based on timeRange
  useEffect(() => {
    // Initial refresh
    refreshMetrics();
    
    // Set up refresh interval based on timeRange
    let interval;
    switch (timeRange) {
      case '5m':
        interval = setInterval(refreshMetrics, 5 * 60 * 1000);
        break;
      case '1h':
        interval = setInterval(refreshMetrics, 60 * 60 * 1000);
        break;
      case '1d':
        interval = setInterval(refreshMetrics, 24 * 60 * 60 * 1000);
        break;
      default:
        interval = setInterval(refreshMetrics, 60 * 1000);
    }
    
    return () => {
      clearInterval(interval);
    };
  }, [timeRange, refreshMetrics]);
  
  return {
    metrics: filteredMetrics(),
    status,
    lastUpdated,
    refreshMetrics,
    componentFilter,
    setComponentFilter,
    alertsOnly,
    setAlertsOnly,
    timeRange,
    setTimeRange,
    performanceScore: getPerformanceScore(),
    recommendations: getRecommendations()
  };
};

export default useDatabasePerformance;