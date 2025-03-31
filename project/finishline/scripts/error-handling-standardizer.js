#!/usr/bin/env node

/**
 * Error Handling Standardizer
 * 
 * Analyzes and standardizes error handling patterns across the codebase,
 * applying consistent error types, recovery mechanisms, and logging.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  targetDirs: ['../src', '../../frontend/src', '../../backend'],
  ignorePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/.git/**'],
  templates: {
    javascript: {
      standardErrorClass: `/**
 * Standard error base class with additional context.
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   * @param {string} options.code - Error code
   * @param {number} options.status - HTTP status code
   * @param {Object} options.context - Additional context
   */
  constructor(message, { code = 'UNKNOWN_ERROR', status = 500, context = {} } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.context = context;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Serialize the error for logging or API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      ...(process.env.NODE_ENV === 'development' ? { stack: this.stack } : {}),
      ...(Object.keys(this.context).length ? { context: this.context } : {})
    };
  }
}

/**
 * Error class for validation errors.
 */
class ValidationError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   * @param {Array} options.errors - Validation errors
   */
  constructor(message, options = {}) {
    super(message, {
      code: 'VALIDATION_ERROR',
      status: 400,
      ...options
    });
    this.errors = options.errors || [];
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors
    };
  }
}

/**
 * Error class for API errors.
 */
class APIError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  constructor(message, options = {}) {
    super(message, {
      code: 'API_ERROR',
      status: 500,
      ...options
    });
  }
}

/**
 * Error class for not found errors.
 */
class NotFoundError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  constructor(message = 'Resource not found', options = {}) {
    super(message, {
      code: 'NOT_FOUND',
      status: 404,
      ...options
    });
  }
}

/**
 * Error class for unauthorized access errors.
 */
class UnauthorizedError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  constructor(message = 'Unauthorized access', options = {}) {
    super(message, {
      code: 'UNAUTHORIZED',
      status: 401,
      ...options
    });
  }
}

/**
 * Error class for forbidden access errors.
 */
class ForbiddenError extends AppError {
  /**
   * @param {string} message - Error message
   * @param {Object} options - Additional options
   */
  constructor(message = 'Forbidden access', options = {}) {
    super(message, {
      code: 'FORBIDDEN',
      status: 403,
      ...options
    });
  }
}

// Export error classes
export {
  AppError,
  ValidationError,
  APIError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
};
`,
      standardErrorHandler: `/**
 * Standard error handler for async operations.
 * 
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Options for error handling
 * @param {Function} options.onError - Custom error handler
 * @param {any} options.fallback - Fallback value on error
 * @returns {Function} - Wrapped function that handles errors
 */
export const withErrorHandling = (fn, { onError, fallback } = {}) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    if (onError) {
      return onError(error, ...args);
    }
    
    // Log the error (could be replaced with a proper logging service)
    console.error('Operation failed:', error);
    
    // Return fallback value if provided
    if (fallback !== undefined) {
      return fallback;
    }
    
    // Rethrow the error
    throw error;
  }
};

/**
 * Standard error logging utility.
 * 
 * @param {Error} error - Error to log
 * @param {Object} context - Additional context
 */
export const logError = (error, context = {}) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    ...context,
    ...(error.toJSON ? error.toJSON() : {})
  };
  
  // Here you would typically send to your logging service
  console.error('Error occurred:', errorData);
  
  // In production, you might send to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: monitoringService.captureError(error, errorData);
  }
};

/**
 * Retry an async operation with exponential backoff.
 * 
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.initialDelay - Initial delay in ms
 * @param {Function} options.shouldRetry - Function to determine if retry should happen
 * @returns {Promise} - Result of the operation
 */
export const retry = async (fn, { maxRetries = 3, initialDelay = 500, shouldRetry = () => true } = {}) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      const delay = initialDelay * Math.pow(2, attempt);
      console.warn(`Attempt failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
`,
      standardErrorBoundary: `import React, { Component } from 'react';
import { logError } from './errorHandler';

/**
 * Error boundary component for React applications.
 * Catches JavaScript errors in child component tree and displays fallback UI.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log the error
    logError(error, { 
      componentStack: errorInfo.componentStack,
      component: this.props.name || 'UnnamedComponent'
    });
    
    this.setState({ errorInfo });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  resetError = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  }
  
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.resetError);
        }
        return this.props.fallback;
      }
      
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error && this.state.error.message}</p>
          <button onClick={this.resetError}>Try Again</button>
          {this.props.children}
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
`
    },
    python: {
      standardErrorClass: `"""
Standard error classes for consistent error handling.

This module provides a set of standardized error classes for the application.
"""

from typing import Dict, Any, Optional, List, Union


class AppError(Exception):
    """Base error class with additional context."""
    
    def __init__(
        self,
        message: str,
        code: str = "UNKNOWN_ERROR",
        status_code: int = 500,
        context: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize the error with a message and additional context.
        
        Args:
            message: Error message
            code: Error code for categorization
            status_code: HTTP status code
            context: Additional context for the error
        """
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.context = context or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the error to a dictionary for serialization.
        
        Returns:
            Dictionary representation of the error
        """
        result = {
            "error": self.__class__.__name__,
            "message": self.message,
            "code": self.code,
            "status_code": self.status_code,
        }
        
        if self.context:
            result["context"] = self.context
            
        return result


class ValidationError(AppError):
    """Error raised when input validation fails."""
    
    def __init__(
        self,
        message: str = "Validation error",
        errors: Optional[List[Dict[str, Any]]] = None,
        **kwargs
    ):
        """
        Initialize the validation error.
        
        Args:
            message: Error message
            errors: List of specific validation errors
            **kwargs: Additional arguments to pass to AppError
        """
        super().__init__(
            message,
            code="VALIDATION_ERROR",
            status_code=400,
            **kwargs
        )
        self.errors = errors or []
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the error to a dictionary with validation errors.
        
        Returns:
            Dictionary representation of the validation error
        """
        result = super().to_dict()
        result["errors"] = self.errors
        return result


class NotFoundError(AppError):
    """Error raised when a resource is not found."""
    
    def __init__(
        self,
        message: str = "Resource not found",
        resource_type: Optional[str] = None,
        resource_id: Optional[Union[str, int]] = None,
        **kwargs
    ):
        """
        Initialize the not found error.
        
        Args:
            message: Error message
            resource_type: Type of resource that was not found
            resource_id: ID of resource that was not found
            **kwargs: Additional arguments to pass to AppError
        """
        context = kwargs.pop("context", {})
        if resource_type:
            context["resource_type"] = resource_type
        if resource_id:
            context["resource_id"] = resource_id
            
        super().__init__(
            message,
            code="NOT_FOUND",
            status_code=404,
            context=context,
            **kwargs
        )


class UnauthorizedError(AppError):
    """Error raised when authentication is required."""
    
    def __init__(
        self,
        message: str = "Authentication required",
        **kwargs
    ):
        """
        Initialize the unauthorized error.
        
        Args:
            message: Error message
            **kwargs: Additional arguments to pass to AppError
        """
        super().__init__(
            message,
            code="UNAUTHORIZED",
            status_code=401,
            **kwargs
        )


class ForbiddenError(AppError):
    """Error raised when a user is not permitted to access a resource."""
    
    def __init__(
        self,
        message: str = "Access forbidden",
        **kwargs
    ):
        """
        Initialize the forbidden error.
        
        Args:
            message: Error message
            **kwargs: Additional arguments to pass to AppError
        """
        super().__init__(
            message,
            code="FORBIDDEN",
            status_code=403,
            **kwargs
        )


class ConflictError(AppError):
    """Error raised when there is a conflict with the current state."""
    
    def __init__(
        self,
        message: str = "Resource conflict",
        **kwargs
    ):
        """
        Initialize the conflict error.
        
        Args:
            message: Error message
            **kwargs: Additional arguments to pass to AppError
        """
        super().__init__(
            message,
            code="CONFLICT",
            status_code=409,
            **kwargs
        )


class ServerError(AppError):
    """Error raised for internal server errors."""
    
    def __init__(
        self,
        message: str = "Internal server error",
        **kwargs
    ):
        """
        Initialize the server error.
        
        Args:
            message: Error message
            **kwargs: Additional arguments to pass to AppError
        """
        super().__init__(
            message,
            code="SERVER_ERROR",
            status_code=500,
            **kwargs
        )
`,
      standardErrorHandler: `"""
Error handling utilities for consistent error management.

This module provides utilities for managing errors consistently across the application.
"""

import logging
import time
import functools
import traceback
from typing import Callable, TypeVar, Any, Dict, Optional, Type, List, Union, cast
from typing_extensions import ParamSpec, Concatenate

from fastapi import Request, Response
from fastapi.responses import JSONResponse

from .errors import AppError, ServerError

# Type variables for callback functions
T = TypeVar('T')
P = ParamSpec('P')


def handle_errors(
    fallback_value: Optional[Any] = None,
    log_error: bool = True,
    reraise: bool = True,
    error_map: Optional[Dict[Type[Exception], Type[AppError]]] = None
) -> Callable[[Callable[P, T]], Callable[P, Union[T, Any]]]:
    """
    Decorator to handle exceptions in a standardized way.
    
    Args:
        fallback_value: Value to return if an exception occurs (default: None)
        log_error: Whether to log the error (default: True)
        reraise: Whether to reraise the error (default: True)
        error_map: Mapping of exception types to AppError types
        
    Returns:
        Decorated function with error handling
    """
    def decorator(func: Callable[P, T]) -> Callable[P, Union[T, Any]]:
        @functools.wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> Union[T, Any]:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if log_error:
                    logging.exception(f"Error in {func.__name__}: {str(e)}")
                
                # Map exception to AppError if in error_map
                if error_map and type(e) in error_map:
                    mapped_error = error_map[type(e)](str(e))
                    if reraise:
                        raise mapped_error from e
                
                # Return fallback value if specified
                if fallback_value is not None:
                    return fallback_value
                
                # Reraise original exception if reraise is True
                if reraise:
                    raise
                
                return None
        return wrapper
    return decorator


async def retry_async(
    func: Callable[P, T],
    max_retries: int = 3,
    initial_delay: float = 0.5,
    backoff_factor: float = 2.0,
    errors: Union[Type[Exception], List[Type[Exception]]] = Exception
) -> T:
    """
    Retry an async function with exponential backoff.
    
    Args:
        func: Async function to retry
        max_retries: Maximum number of retries (default: 3)
        initial_delay: Initial delay in seconds (default: 0.5)
        backoff_factor: Factor to increase delay with each retry (default: 2.0)
        errors: Exception or list of exceptions to catch (default: Exception)
        
    Returns:
        Result of the function
        
    Raises:
        The last exception encountered if all retries fail
    """
    last_exception = None
    delay = initial_delay
    
    for attempt in range(max_retries + 1):
        try:
            return await func()
        except errors as e:
            last_exception = e
            
            if attempt == max_retries:
                break
                
            logging.info(f"Retrying after error: {str(e)} (attempt {attempt + 1}/{max_retries})")
            await asyncio.sleep(delay)
            delay *= backoff_factor
    
    logging.error(f"Failed after {max_retries} retries: {str(last_exception)}")
    raise last_exception


def log_exception(
    e: Exception,
    context: Optional[Dict[str, Any]] = None
) -> None:
    """
    Log an exception with consistent formatting.
    
    Args:
        e: Exception to log
        context: Additional context to include in the log
    """
    context = context or {}
    
    # Get traceback as string
    tb_str = ''.join(traceback.format_exception(
        type(e), e, e.__traceback__
    ))
    
    error_data = {
        "error_type": e.__class__.__name__,
        "error_message": str(e),
        "traceback": tb_str,
        **context
    }
    
    # Add AppError specific fields if available
    if isinstance(e, AppError):
        error_data.update({
            "error_code": e.code,
            "status_code": e.status_code,
            "error_context": e.context
        })
    
    logging.error(f"Exception: {e.__class__.__name__}", extra=error_data)


async def exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for FastAPI applications.
    
    Args:
        request: FastAPI request
        exc: Exception that was raised
        
    Returns:
        JSON response with error details
    """
    # Log the exception
    context = {"path": request.url.path, "method": request.method}
    log_exception(exc, context)
    
    # Convert to AppError if not already
    if not isinstance(exc, AppError):
        error = ServerError(str(exc), context=context)
    else:
        error = exc
    
    # Return standardized error response
    return JSONResponse(
        status_code=error.status_code,
        content=error.to_dict()
    )
`
    }
  },
  reportsDir: '../cleanup-reports',
  backupDir: '../archive/pre-error-handling-backup',
  dryRun: true  // Set to false to actually make changes
};

/**
 * Format date as YYYY-MM-DD_HH-MM-SS
 */
function getFormattedDate() {
  const now = new Date();
  return now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
}

/**
 * Create backup of files that will be modified
 */
function createBackup(filesToModify) {
  console.log('Creating backup of files to be modified...');
  
  const backupPath = path.join(CONFIG.backupDir, getFormattedDate());
  
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
  }
  
  let backupCount = 0;
  
  filesToModify.forEach(filePath => {
    const absPath = path.resolve(__dirname, filePath);
    
    if (fs.existsSync(absPath)) {
      const relativePath = path.relative(path.resolve(__dirname, '..'), absPath);
      const backupFilePath = path.join(backupPath, relativePath);
      
      // Create directory structure if needed
      const backupDir = path.dirname(backupFilePath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Copy file to backup
      fs.copyFileSync(absPath, backupFilePath);
      backupCount++;
    }
  });
  
  console.log(`Created backup of ${backupCount} files at: ${backupPath}`);
  
  return backupPath;
}

/**
 * Find files that should have standard error handling
 */
function findErrorHandlingFiles() {
  console.log('Finding files that should have standard error handling...');
  
  const errorFiles = {
    javascript: {
      errorClasses: [],
      errorHandlers: [],
      componentsWithTryCatch: []
    },
    python: {
      errorClasses: [],
      errorHandlers: [],
      functionsWithTryCatch: []
    }
  };
  
  // Process each target directory
  CONFIG.targetDirs.forEach(targetDir => {
    const basePath = path.resolve(__dirname, targetDir);
    
    if (!fs.existsSync(basePath)) {
      console.warn(`Warning: Target directory does not exist: ${basePath}`);
      return;
    }
    
    // Find JavaScript/TypeScript files
    const jsFiles = glob.sync(`${basePath}/**/*.{js,jsx,ts,tsx}`, {
      ignore: CONFIG.ignorePatterns.map(p => path.join(basePath, p))
    });
    
    // Find Python files
    const pyFiles = glob.sync(`${basePath}/**/*.py`, {
      ignore: CONFIG.ignorePatterns.map(p => path.join(basePath, p))
    });
    
    // Analyze JavaScript/TypeScript files
    jsFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for custom error classes
        if (content.includes('extends Error') || 
            content.includes('class') && content.includes('Error')) {
          errorFiles.javascript.errorClasses.push(file);
        }
        
        // Check for error handling utilities
        if ((content.includes('try') && content.includes('catch')) ||
            content.includes('error handler') ||
            content.includes('handleError')) {
          errorFiles.javascript.errorHandlers.push(file);
        }
        
        // Check for components with try-catch
        if (content.includes('React') && 
            content.includes('try') && content.includes('catch')) {
          errorFiles.javascript.componentsWithTryCatch.push(file);
        }
      } catch (error) {
        console.warn(`Warning: Error reading file ${file}:`, error.message);
      }
    });
    
    // Analyze Python files
    pyFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for custom error classes
        if (content.includes('class') && 
            (content.includes('Exception') || content.includes('Error'))) {
          errorFiles.python.errorClasses.push(file);
        }
        
        // Check for error handling utilities
        if ((content.includes('try:') && content.includes('except')) ||
            content.includes('error handler') ||
            content.includes('handle_error')) {
          errorFiles.python.errorHandlers.push(file);
        }
        
        // Check for functions with try-except
        if (content.includes('def ') && 
            content.includes('try:') && content.includes('except')) {
          errorFiles.python.functionsWithTryCatch.push(file);
        }
      } catch (error) {
        console.warn(`Warning: Error reading file ${file}:`, error.message);
      }
    });
  });
  
  return errorFiles;
}

/**
 * Create standard error classes file
 */
function createStandardErrorClasses(language) {
  console.log(`Creating standard error classes for ${language}...`);
  
  let filePath;
  let content;
  
  if (language === 'javascript') {
    filePath = path.resolve(__dirname, '../src/utils/errors.js');
    content = CONFIG.templates.javascript.standardErrorClass;
  } else if (language === 'python') {
    filePath = path.resolve(__dirname, '../../backend/utils/errors.py');
    content = CONFIG.templates.python.standardErrorClass;
  } else {
    console.warn(`Unsupported language: ${language}`);
    return null;
  }
  
  // Create directory if needed
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write file
  if (!CONFIG.dryRun) {
    fs.writeFileSync(filePath, content);
    console.log(`Created standard error classes at: ${filePath}`);
  } else {
    console.log(`[DRY RUN] Would create standard error classes at: ${filePath}`);
  }
  
  return filePath;
}

/**
 * Create standard error handler file
 */
function createStandardErrorHandler(language) {
  console.log(`Creating standard error handler for ${language}...`);
  
  let filePath;
  let content;
  
  if (language === 'javascript') {
    filePath = path.resolve(__dirname, '../src/utils/errorHandler.js');
    content = CONFIG.templates.javascript.standardErrorHandler;
  } else if (language === 'python') {
    filePath = path.resolve(__dirname, '../../backend/utils/error_handler.py');
    content = CONFIG.templates.python.standardErrorHandler;
  } else {
    console.warn(`Unsupported language: ${language}`);
    return null;
  }
  
  // Create directory if needed
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write file
  if (!CONFIG.dryRun) {
    fs.writeFileSync(filePath, content);
    console.log(`Created standard error handler at: ${filePath}`);
  } else {
    console.log(`[DRY RUN] Would create standard error handler at: ${filePath}`);
  }
  
  return filePath;
}

/**
 * Create standard error boundary file
 */
function createErrorBoundary() {
  console.log('Creating standard error boundary component...');
  
  const filePath = path.resolve(__dirname, '../src/components/common/ErrorBoundary.jsx');
  const content = CONFIG.templates.javascript.standardErrorBoundary;
  
  // Create directory if needed
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write file
  if (!CONFIG.dryRun) {
    fs.writeFileSync(filePath, content);
    console.log(`Created error boundary component at: ${filePath}`);
  } else {
    console.log(`[DRY RUN] Would create error boundary component at: ${filePath}`);
  }
  
  return filePath;
}

/**
 * Generate error handling standardization report
 */
function generateReport(data) {
  console.log('Generating error handling standardization report...');
  
  const {
    timestamp,
    errorFiles,
    createdFiles,
    backupPath
  } = data;
  
  const reportFile = path.join(CONFIG.reportsDir, `error-handling-standardization-${timestamp}.md`);
  
  let report = `# Error Handling Standardization Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  report += `Backup: ${backupPath}\n\n`;
  
  // Summary statistics
  const jsErrorClassesCount = errorFiles.javascript.errorClasses.length;
  const jsErrorHandlersCount = errorFiles.javascript.errorHandlers.length;
  const jsComponentsWithTryCatchCount = errorFiles.javascript.componentsWithTryCatch.length;
  
  const pyErrorClassesCount = errorFiles.python.errorClasses.length;
  const pyErrorHandlersCount = errorFiles.python.errorHandlers.length;
  const pyFunctionsWithTryCatchCount = errorFiles.python.functionsWithTryCatch.length;
  
  report += `## Summary\n\n`;
  report += `### Identified Error Handling Components\n\n`;
  report += `#### JavaScript/TypeScript:\n`;
  report += `- Custom error classes: ${jsErrorClassesCount} files\n`;
  report += `- Error handling utilities: ${jsErrorHandlersCount} files\n`;
  report += `- Components with try-catch: ${jsComponentsWithTryCatchCount} files\n\n`;
  
  report += `#### Python:\n`;
  report += `- Custom error classes: ${pyErrorClassesCount} files\n`;
  report += `- Error handling utilities: ${pyErrorHandlersCount} files\n`;
  report += `- Functions with try-except: ${pyFunctionsWithTryCatchCount} files\n\n`;
  
  report += `### Standardization Actions\n\n`;
  report += `The following standardized error handling components were created:\n\n`;
  
  if (createdFiles.jsErrorClasses) {
    report += `- **JavaScript Error Classes**: \`${path.relative(path.dirname(reportFile), createdFiles.jsErrorClasses)}\`\n`;
  }
  
  if (createdFiles.jsErrorHandler) {
    report += `- **JavaScript Error Handler**: \`${path.relative(path.dirname(reportFile), createdFiles.jsErrorHandler)}\`\n`;
  }
  
  if (createdFiles.jsErrorBoundary) {
    report += `- **React Error Boundary**: \`${path.relative(path.dirname(reportFile), createdFiles.jsErrorBoundary)}\`\n`;
  }
  
  if (createdFiles.pyErrorClasses) {
    report += `- **Python Error Classes**: \`${path.relative(path.dirname(reportFile), createdFiles.pyErrorClasses)}\`\n`;
  }
  
  if (createdFiles.pyErrorHandler) {
    report += `- **Python Error Handler**: \`${path.relative(path.dirname(reportFile), createdFiles.pyErrorHandler)}\`\n`;
  }
  
  report += `\n## Detailed Analysis\n\n`;
  
  // JavaScript error classes
  if (jsErrorClassesCount > 0) {
    report += `### JavaScript Custom Error Classes\n\n`;
    report += `These files contain custom error class implementations that should be standardized:\n\n`;
    errorFiles.javascript.errorClasses.forEach(file => {
      report += `- \`${path.relative(path.dirname(reportFile), file)}\`\n`;
    });
    report += '\n';
  }
  
  // JavaScript error handlers
  if (jsErrorHandlersCount > 0) {
    report += `### JavaScript Error Handling Utilities\n\n`;
    report += `These files contain error handling utilities that should be standardized:\n\n`;
    errorFiles.javascript.errorHandlers.forEach(file => {
      report += `- \`${path.relative(path.dirname(reportFile), file)}\`\n`;
    });
    report += '\n';
  }
  
  // Python error classes
  if (pyErrorClassesCount > 0) {
    report += `### Python Custom Error Classes\n\n`;
    report += `These files contain custom error class implementations that should be standardized:\n\n`;
    errorFiles.python.errorClasses.forEach(file => {
      report += `- \`${path.relative(path.dirname(reportFile), file)}\`\n`;
    });
    report += '\n';
  }
  
  // Python error handlers
  if (pyErrorHandlersCount > 0) {
    report += `### Python Error Handling Utilities\n\n`;
    report += `These files contain error handling utilities that should be standardized:\n\n`;
    errorFiles.python.errorHandlers.forEach(file => {
      report += `- \`${path.relative(path.dirname(reportFile), file)}\`\n`;
    });
    report += '\n';
  }
  
  report += `## Standard Error Handling Pattern\n\n`;
  
  report += `### JavaScript/TypeScript\n\n`;
  report += `1. **Error Classes**: Use the standard error hierarchy:\n`;
  report += `   - \`AppError\`: Base error class with code, status, and context\n`;
  report += `   - \`ValidationError\`: For input validation errors\n`;
  report += `   - \`APIError\`: For API-related errors\n`;
  report += `   - \`NotFoundError\`: For resource not found errors\n`;
  report += `   - \`UnauthorizedError\`: For authentication errors\n`;
  report += `   - \`ForbiddenError\`: For authorization errors\n\n`;
  
  report += `2. **Error Handling**: Use the \`withErrorHandling\` utility:\n`;
  report += `   \`\`\`javascript\n`;
  report += `   const fetchData = withErrorHandling(async () => {\n`;
  report += `     const response = await api.get('/data');\n`;
  report += `     return response.data;\n`;
  report += `   }, {\n`;
  report += `     fallback: [],\n`;
  report += `     onError: (error) => logError(error, { component: 'DataFetcher' })\n`;
  report += `   });\n`;
  report += `   \`\`\`\n\n`;
  
  report += `3. **React Components**: Use the ErrorBoundary component:\n`;
  report += `   \`\`\`jsx\n`;
  report += `   <ErrorBoundary\n`;
  report += `     fallback={<ErrorDisplay />}\n`;
  report += `     onError={(error) => notifyUser(error.message)}\n`;
  report += `   >\n`;
  report += `     <YourComponent />\n`;
  report += `   </ErrorBoundary>\n`;
  report += `   \`\`\`\n\n`;
  
  report += `### Python\n\n`;
  report += `1. **Error Classes**: Use the standard error hierarchy:\n`;
  report += `   - \`AppError\`: Base error class with code, status_code, and context\n`;
  report += `   - \`ValidationError\`: For input validation errors\n`;
  report += `   - \`NotFoundError\`: For resource not found errors\n`;
  report += `   - \`UnauthorizedError\`: For authentication errors\n`;
  report += `   - \`ForbiddenError\`: For authorization errors\n`;
  report += `   - \`ConflictError\`: For resource conflict errors\n`;
  report += `   - \`ServerError\`: For internal server errors\n\n`;
  
  report += `2. **Error Handling**: Use the \`handle_errors\` decorator:\n`;
  report += `   \`\`\`python\n`;
  report += `   @handle_errors(fallback_value=[], log_error=True)\n`;
  report += `   async def fetch_data():\n`;
  report += `       response = await client.get("/data")\n`;
  report += `       return response.json()\n`;
  report += `   \`\`\`\n\n`;
  
  report += `3. **FastAPI Integration**: Use the \`exception_handler\` with FastAPI:\n`;
  report += `   \`\`\`python\n`;
  report += `   from fastapi import FastAPI\n`;
  report += `   from utils.error_handler import exception_handler\n`;
  report += `   from utils.errors import AppError\n`;
  report += `   \n`;
  report += `   app = FastAPI()\n`;
  report += `   app.add_exception_handler(AppError, exception_handler)\n`;
  report += `   app.add_exception_handler(Exception, exception_handler)\n`;
  report += `   \`\`\`\n\n`;
  
  report += `## Next Steps\n\n`;
  report += `1. **Migration Strategy**:\n`;
  report += `   - Replace custom error classes with standard ones\n`;
  report += `   - Update error handling code to use the standard utilities\n`;
  report += `   - Wrap component trees with ErrorBoundary components\n\n`;
  
  report += `2. **Implementation Plan**:\n`;
  report += `   - Start with high-priority modules (API clients, form handlers)\n`;
  report += `   - Update each module group one at a time\n`;
  report += `   - Run comprehensive tests after each update\n\n`;
  
  report += `3. **Documentation Updates**:\n`;
  report += `   - Document the standard error handling pattern\n`;
  report += `   - Add examples for common use cases\n`;
  report += `   - Update coding guidelines to include error handling standards\n`;
  
  fs.writeFileSync(reportFile, report);
  
  console.log(`Error handling standardization report generated: ${reportFile}`);
  
  return reportFile;
}

/**
 * Main execution function
 */
async function main() {
  // Check if running in dry run mode
  if (process.argv.includes('--dry-run')) {
    CONFIG.dryRun = true;
    console.log('Running in DRY RUN mode. No actual changes will be made.');
  } else if (process.argv.includes('--execute')) {
    CONFIG.dryRun = false;
    console.log('Running in EXECUTE mode. Files will be created.');
  }
  
  // Ensure reports directory exists
  if (!fs.existsSync(CONFIG.reportsDir)) {
    fs.mkdirSync(CONFIG.reportsDir, { recursive: true });
  }
  
  // Ensure backup directory exists
  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }
  
  // Get timestamp for file names
  const timestamp = getFormattedDate();
  
  // Find error handling files
  const errorFiles = findErrorHandlingFiles();
  
  // Log findings
  console.log('\nFound files with error handling:');
  console.log('JavaScript/TypeScript:');
  console.log(`- Custom error classes: ${errorFiles.javascript.errorClasses.length} files`);
  console.log(`- Error handling utilities: ${errorFiles.javascript.errorHandlers.length} files`);
  console.log(`- Components with try-catch: ${errorFiles.javascript.componentsWithTryCatch.length} files`);
  
  console.log('\nPython:');
  console.log(`- Custom error classes: ${errorFiles.python.errorClasses.length} files`);
  console.log(`- Error handling utilities: ${errorFiles.python.errorHandlers.length} files`);
  console.log(`- Functions with try-except: ${errorFiles.python.functionsWithTryCatch.length} files`);
  
  // Create backup
  const backupPath = CONFIG.dryRun ? 'No backup created in dry run mode' : createBackup([
    ...errorFiles.javascript.errorClasses,
    ...errorFiles.javascript.errorHandlers,
    ...errorFiles.javascript.componentsWithTryCatch,
    ...errorFiles.python.errorClasses,
    ...errorFiles.python.errorHandlers,
    ...errorFiles.python.functionsWithTryCatch
  ]);
  
  // Create standardized error handling files
  const createdFiles = {
    jsErrorClasses: createStandardErrorClasses('javascript'),
    jsErrorHandler: createStandardErrorHandler('javascript'),
    jsErrorBoundary: createErrorBoundary(),
    pyErrorClasses: createStandardErrorClasses('python'),
    pyErrorHandler: createStandardErrorHandler('python')
  };
  
  // Generate report
  const reportFile = generateReport({
    timestamp,
    errorFiles,
    createdFiles,
    backupPath
  });
  
  // Final output
  console.log('\nError handling standardization complete!');
  console.log(`Report: ${reportFile}`);
  
  if (CONFIG.dryRun) {
    console.log('\nThis was a DRY RUN. No actual changes were made.');
    console.log('To execute changes, run with --execute flag.');
  } else {
    console.log('\nStandardized error handling files have been created.');
    console.log(`A backup was created at: ${backupPath}`);
    
    // Verify build after changes
    console.log('\nVerifying build after creating error handling files...');
    try {
      execSync('node verify-build.js', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error verifying build:', error.message);
    }
  }
}

// Run the script
main().catch(error => {
  console.error('Error executing error handling standardization:', error);
  process.exit(1);
});