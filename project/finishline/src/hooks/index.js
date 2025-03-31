/**
 * Custom React hooks
 * Reusable logic extracted into hooks
 */

export { default as useLocalStorage } from './useLocalStorage';
export { default as useAsync } from './useAsync';
export { default as useForm } from './useForm';
export { 
  default as useMediaQuery,
  useBreakpoint,
  useActiveBreakpoint,
  breakpoints as mediaBreakpoints
} from './useMediaQuery';

// Database Optimization Hooks - Phase 4
export { default as useDatabasePerformance } from './useDatabasePerformance';