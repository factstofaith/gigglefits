/**
 * Performance Budget Hook
 * 
 * A custom hook for monitoring and reacting to performance budget violations.
 * Part of the zero technical debt performance implementation.
 * 
 * @module hooks/performance/usePerformanceBudget
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPerformanceMetrics, onBudgetViolation, checkAllBudgets, setPerformanceBudget, getPerformanceBudget } from "@/utils/performance";

/**
 * Custom hook for monitoring performance budget violations
 * 
 * @param {Object} options - Configuration options
 * @param {Object} [options.customBudgets] - Custom performance budgets to set
 * @param {number} [options.interval=10000] - Monitoring interval in milliseconds
 * @param {boolean} [options.enableMonitoring=true] - Whether monitoring is enabled
 * @param {boolean} [options.logToConsole=false] - Whether to log violations to console
 * @param {Function} [options.onViolation] - Callback for budget violations
 * @returns {Object} Object containing budget state and controls
 */
function usePerformanceBudget({
  customBudgets,
  interval = 10000,
  enableMonitoring = true,
  logToConsole = false,
  onViolation = null
} = {}) {
  // Store violation data
  const [violations, setViolations] = useState({
    components: [],
    interactions: [],
    resources: [],
    navigation: [],
    bundleSizes: []
  });

  // Store monitoring state
  const [isMonitoring, setIsMonitoring] = useState(enableMonitoring);

  // Store references for cleanup and state
  const timerRef = useRef(null);
  const budgetViolationHandlerRef = useRef(null);

  // Set custom budget if provided
  useEffect(() => {
    if (customBudgets) {
      setPerformanceBudget(customBudgets);
    }
  }, [customBudgets]);

  /**
   * Check performance budgets
   */
  const checkBudgets = useCallback(() => {
    const currentViolations = checkAllBudgets({
      logToConsole
    });
    setViolations(currentViolations);
    return currentViolations;
  }, [logToConsole]);

  /**
   * Handle budget violations
   */
  const handleViolation = useCallback((violation) => {
    if (onViolation) {
      onViolation(violation);
    }
  }, [onViolation]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    // Clear any existing timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Set up new timer
    timerRef.current = setInterval(() => {
      checkBudgets();
    }, interval);

    // Set up violation handler if not already set
    if (!budgetViolationHandlerRef.current) {
      budgetViolationHandlerRef.current = onBudgetViolation(handleViolation);
    }

    // Update state
    setIsMonitoring(true);

    // Perform initial check
    checkBudgets();
  }, [interval, checkBudgets, handleViolation]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    // Clear interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Remove violation handler
    if (budgetViolationHandlerRef.current) {
      budgetViolationHandlerRef.current();
      budgetViolationHandlerRef.current = null;
    }

    // Update state
    setIsMonitoring(false);
  }, []);

  /**
   * Calculate overall status based on violations
   */
  const calculateStatus = useCallback(() => {
    const totalViolations = Object.values(violations).reduce((sum, categoryViolations) => sum + categoryViolations.length, 0);
    if (totalViolations === 0) {
      return 'success';
    } else if (totalViolations < 5) {
      return 'warning';
    } else {
      return 'error';
    }
  }, [violations]);

  // Start/stop monitoring based on enableMonitoring
  useEffect(() => {
    if (enableMonitoring && !isMonitoring) {
      startMonitoring();
    } else if (!enableMonitoring && isMonitoring) {
      stopMonitoring();
    }
  }, [enableMonitoring, isMonitoring, startMonitoring, stopMonitoring]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (budgetViolationHandlerRef.current) {
        budgetViolationHandlerRef.current();
      }
    };
  }, []);

  /**
   * Update custom budget
   */
  const updateBudget = useCallback((newBudget) => {
    setPerformanceBudget(newBudget);
    // Recheck with new budget
    checkBudgets();
  }, [checkBudgets]);

  /**
   * Get component violation count
   */
  const getComponentViolationCount = useCallback((componentName) => {
    return violations.components.filter((v) => v.name === componentName).length;
  }, [violations.components]);

  /**
   * Get interaction violation count
   */
  const getInteractionViolationCount = useCallback((interactionName) => {
    return violations.interactions.filter((v) => v.name === interactionName).length;
  }, [violations.interactions]);

  /**
   * Get critical violations
   */
  const getCriticalViolations = useCallback(() => {
    const critical = [];

    // Check component violations
    violations.components.forEach((violation) => {
      if (violation.overagePercent > 100) {
        critical.push({
          ...violation,
          category: 'components'
        });
      }
    });

    // Check interaction violations
    violations.interactions.forEach((violation) => {
      if (violation.overagePercent > 100) {
        critical.push({
          ...violation,
          category: 'interactions'
        });
      }
    });

    // Check navigation violations for high impact
    violations.navigation.forEach((violation) => {
      if (violation.overagePercent > 50) {
        critical.push({
          ...violation,
          category: 'navigation'
        });
      }
    });

    // Check bundle size violations
    violations.bundleSizes.forEach((violation) => {
      if (violation.overagePercent > 20) {
        critical.push({
          ...violation,
          category: 'bundleSizes'
        });
      }
    });
    return critical;
  }, [violations]);
  return {
    violations,
    budgets: getPerformanceBudget(),
    status: calculateStatus(),
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkBudgets,
    updateBudget,
    getComponentViolationCount,
    getInteractionViolationCount,
    getCriticalViolations
  };
}
export default usePerformanceBudget;