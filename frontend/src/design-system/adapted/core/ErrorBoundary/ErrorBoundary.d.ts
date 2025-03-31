import React from 'react';
import { ErrorBoundaryProps, ErrorBoundaryState } from '../../../types/core';

/**
 * ErrorBoundary component
 * 
 * A React error boundary component that catches errors in its children
 * and displays a fallback UI instead of crashing the entire application.
 */
declare class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error };
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
}

export default ErrorBoundary;