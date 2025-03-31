"""
Error Handling Test Framework

This module provides a framework for testing error handling in services.
"""

from typing import Dict, List, Optional, Any, Union, Callable, Type
from unittest.mock import MagicMock, patch
import inspect
import logging
import random
import time

from .entity_registry import BaseTestAdapter
from .service_test_framework import BaseServiceTest, ServiceTestAdapter


class ErrorType:
    """Common error types for testing."""
    
    DATABASE = "database"
    VALIDATION = "validation"
    AUTHORIZATION = "authorization"
    DEPENDENCY = "dependency"
    NETWORK = "network"
    TIMEOUT = "timeout"
    RESOURCE_NOT_FOUND = "resource_not_found"
    RESOURCE_CONFLICT = "resource_conflict"
    
    
class ErrorPattern:
    """Error pattern types for error simulation."""
    
    ALWAYS = "always"              # Always fail
    RANDOM = "random"              # Randomly fail with a given probability
    INTERMITTENT = "intermittent"  # Fail a specified number of times then succeed
    CONDITIONAL = "conditional"    # Fail when a specified condition is met
    FAIL_ONCE = "fail_once"        # Fail exactly once then succeed
    DATA_SPECIFIC = "data_specific"  # Fail for specific data values
    PERSISTENT = "persistent"      # Continuously fail until explicitly reset


class ErrorInjector:
    """Utility for injecting errors into service methods."""
    
    @staticmethod
    def database_error(db_session, method_name="query"):
        """
        Inject a database error.
        
        Args:
            db_session: The database session mock
            method_name: The method name to mock with an error
        """
        from sqlalchemy.exc import SQLAlchemyError
        
        method = getattr(db_session, method_name)
        method.side_effect = SQLAlchemyError("Database error")
        
        return {
            "type": ErrorType.DATABASE,
            "method": method_name,
            "message": "Database error"
        }
    
    @staticmethod
    def database_commit_error(db_session):
        """
        Inject a database commit error.
        
        Args:
            db_session: The database session mock
        """
        from sqlalchemy.exc import SQLAlchemyError
        
        db_session.commit.side_effect = SQLAlchemyError("Commit failed")
        
        return {
            "type": ErrorType.DATABASE,
            "method": "commit",
            "message": "Commit failed"
        }
    
    @staticmethod
    def validation_error(parameter_name="id", message="Invalid parameter"):
        """
        Inject a validation error.
        
        Args:
            parameter_name: The name of the parameter causing the error
            message: The error message
        """
        from pydantic import ValidationError
        
        def validation_raiser(*args, **kwargs):
            from pydantic.error_wrappers import ErrorWrapper
            
            errors = [
                ErrorWrapper(
                    exc=ValueError(message),
                    loc=(parameter_name,)
                )
            ]
            raise ValidationError(errors=errors, model=None)
        
        return {
            "type": ErrorType.VALIDATION,
            "parameter": parameter_name,
            "message": message,
            "raiser": validation_raiser
        }
    
    @staticmethod
    def not_found_error(entity_type="resource", entity_id=1):
        """
        Inject a resource not found error.
        
        Args:
            entity_type: The type of entity that wasn't found
            entity_id: The ID of the entity that wasn't found
        """
        return {
            "type": ErrorType.RESOURCE_NOT_FOUND,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "message": f"{entity_type} with ID {entity_id} not found"
        }
    
    @staticmethod
    def conflict_error(entity_type="resource", field="name", value="duplicate"):
        """
        Inject a resource conflict error.
        
        Args:
            entity_type: The type of entity with the conflict
            field: The field with the conflict
            value: The conflicting value
        """
        from sqlalchemy.exc import IntegrityError
        
        return {
            "type": ErrorType.RESOURCE_CONFLICT,
            "entity_type": entity_type,
            "field": field,
            "value": value,
            "message": f"{entity_type} with {field}={value} already exists",
            "exception": IntegrityError(None, None, f"Duplicate entry '{value}' for key '{field}'")
        }
    
    @staticmethod
    def dependency_error(dependency_name="service", method="get"):
        """
        Inject a dependency error.
        
        Args:
            dependency_name: The name of the dependency that failed
            method: The method that failed
        """
        return {
            "type": ErrorType.DEPENDENCY,
            "dependency": dependency_name,
            "method": method,
            "message": f"Dependency {dependency_name}.{method} failed"
        }
    
    @staticmethod
    def network_error(url="https://example.com", method="GET"):
        """
        Inject a network error.
        
        Args:
            url: The URL that failed
            method: The HTTP method that failed
        """
        import requests
        
        return {
            "type": ErrorType.NETWORK,
            "url": url,
            "method": method,
            "message": f"Network error for {method} {url}",
            "exception": requests.RequestException(f"Network error for {method} {url}")
        }
    
    @staticmethod
    def timeout_error(operation="request", timeout=30):
        """
        Inject a timeout error.
        
        Args:
            operation: The operation that timed out
            timeout: The timeout in seconds
        """
        import requests
        
        return {
            "type": ErrorType.TIMEOUT,
            "operation": operation,
            "timeout": timeout,
            "message": f"{operation} timed out after {timeout} seconds",
            "exception": requests.Timeout(f"{operation} timed out after {timeout} seconds")
        }


class ErrorHandlingTestAdapter(BaseTestAdapter):
    """Test adapter for error handling tests."""
    
    def __init__(self, registry=None):
        """Initialize the adapter with an entity registry."""
        super().__init__(registry)
        self.errors = {}
        self.error_injector = ErrorInjector()
        self.logger = logging.getLogger("error_handling_test_adapter")
    
    def reset(self):
        """Reset the adapter state."""
        self.errors = {}
    
    def inject_error(self, error_type, **kwargs):
        """
        Inject an error for testing.
        
        Args:
            error_type: The type of error to inject
            **kwargs: Additional parameters for the error
        
        Returns:
            The injected error details
        """
        method = getattr(self.error_injector, f"{error_type}_error")
        error = method(**kwargs)
        
        self.errors[error_type] = error
        return error
    
    def get_injected_error(self, error_type):
        """
        Get a previously injected error.
        
        Args:
            error_type: The type of error to get
        
        Returns:
            The injected error details or None if not found
        """
        return self.errors.get(error_type)
    
    def clear_injected_errors(self):
        """Clear all injected errors."""
        self.errors = {}
    
    def _create_error_context(self, error_type, **context):
        """
        Create an error context for tracking.
        
        Args:
            error_type: The type of error
            **context: Additional context information
        
        Returns:
            The error context dictionary
        """
        error_context = {
            "type": error_type,
            "timestamp": None,  # A real implementation would set this
            **context
        }
        
        # Register the error context with the registry
        self._register_entity("ErrorContext", f"{error_type}_{id(error_context)}", error_context)
        
        return error_context


class ErrorSimulator:
    """
    Error simulator for controlled error injection in test scenarios.

    This class provides a way to simulate various error patterns during testing,
    allowing for comprehensive error handling and recovery validation.
    """

    def __init__(self, registry=None):
        """Initialize the error simulator with an entity registry."""
        self.registry = registry
        self.configured_errors = {}
        self.error_counters = {}
        self.logger = logging.getLogger("error_simulator")

    def reset(self):
        """Reset all configured errors and counters."""
        self.configured_errors = {}
        self.error_counters = {}

    def configure_error(self, error_config):
        """
        Configure an error for simulation.

        Args:
            error_config: Dictionary containing error configuration:
                - operation: The operation to inject errors into
                - error_pattern: The pattern of error occurrence (always, random, etc.)
                - error_message: The error message to use
                - Additional parameters based on the error pattern

        Returns:
            A unique identifier for the configured error
        """
        error_id = f"{error_config['operation']}_{id(error_config)}"
        
        # Initialize counters for this error
        if "failure_count" in error_config and error_config["error_pattern"] in [
            ErrorPattern.INTERMITTENT, ErrorPattern.FAIL_ONCE
        ]:
            self.error_counters[error_id] = 0
        
        # Default properties if not specified
        if "error_level" not in error_config:
            error_config["error_level"] = "error"
        
        if error_config["error_pattern"] == ErrorPattern.FAIL_ONCE:
            error_config["failure_count"] = 1
        
        self.configured_errors[error_id] = error_config
        
        # Register with entity registry if available
        if self.registry:
            self.registry.register_entity("ConfiguredError", error_id, error_config)
        
        return error_id

    def should_trigger_error(self, operation, **context):
        """
        Determine if an error should be triggered for a given operation.

        Args:
            operation: The operation being performed
            context: Additional context about the operation

        Returns:
            Tuple of (should_error, error_config) where:
                - should_error: Boolean indicating if an error should be triggered
                - error_config: The error configuration to use if should_error is True
        """
        # Find all configured errors for this operation
        matching_errors = []
        for error_id, config in self.configured_errors.items():
            if config["operation"] == operation:
                # Check additional context matches if specified
                matches_context = True
                for key, value in context.items():
                    if key in config and config[key] != value:
                        matches_context = False
                        break
                
                if matches_context:
                    matching_errors.append((error_id, config))
        
        if not matching_errors:
            return False, None
        
        # Process each matching error configuration
        for error_id, config in matching_errors:
            pattern = config["error_pattern"]
            
            if pattern == ErrorPattern.ALWAYS:
                return True, config
            
            elif pattern == ErrorPattern.RANDOM:
                probability = config.get("probability", 0.5)
                if random.random() < probability:
                    return True, config
            
            elif pattern == ErrorPattern.INTERMITTENT:
                failure_count = config.get("failure_count", 1)
                current_count = self.error_counters.get(error_id, 0)
                
                if current_count < failure_count:
                    self.error_counters[error_id] = current_count + 1
                    return True, config
            
            elif pattern == ErrorPattern.FAIL_ONCE:
                if self.error_counters.get(error_id, 0) == 0:
                    self.error_counters[error_id] = 1
                    return True, config
            
            elif pattern == ErrorPattern.CONDITIONAL:
                condition = config.get("error_condition")
                # Simple evaluation of condition string against context
                try:
                    condition_result = eval(condition, {"__builtins__": {}}, context)
                    if condition_result:
                        return True, config
                except:
                    self.logger.exception(f"Error evaluating condition: {condition}")
            
            elif pattern == ErrorPattern.DATA_SPECIFIC:
                condition = config.get("error_condition")
                row = context.get("row", {})
                
                try:
                    # Create a safe evaluation context with row data
                    eval_context = {"__builtins__": {}, "row": row}
                    condition_result = eval(condition, eval_context, {})
                    if condition_result:
                        return True, config
                except:
                    self.logger.exception(f"Error evaluating data condition: {condition}")
            
            elif pattern == ErrorPattern.PERSISTENT:
                return True, config
        
        return False, None

    def trigger_error(self, operation, **context):
        """
        Trigger an error for the given operation if configured.

        Args:
            operation: The operation being performed
            context: Additional context about the operation

        Returns:
            Tuple of (triggered, error_details) where:
                - triggered: Boolean indicating if an error was triggered
                - error_details: Details about the triggered error, or None
        """
        should_error, config = self.should_trigger_error(operation, **context)
        
        if should_error:
            error_details = {
                "operation": operation,
                "message": config["error_message"],
                "level": config.get("error_level", "error"),
                "context": context,
                "timestamp": time.time()
            }
            
            if self.registry:
                self.registry.register_entity(
                    "TriggeredError", 
                    f"{operation}_{id(error_details)}", 
                    error_details
                )
            
            return True, error_details
        
        return False, None

    def get_error_stats(self):
        """
        Get statistics about configured and triggered errors.

        Returns:
            Dictionary of error statistics
        """
        return {
            "configured_errors": len(self.configured_errors),
            "error_counters": self.error_counters.copy()
        }


class ErrorRecoveryTest:
    """
    Framework for testing error recovery scenarios.
    
    This class provides utilities for testing recovery flows after
    simulated errors occur.
    """
    
    def __init__(self, error_simulator, registry=None):
        """
        Initialize the error recovery test.
        
        Args:
            error_simulator: The error simulator to use
            registry: Optional entity registry for tracking
        """
        self.error_simulator = error_simulator
        self.registry = registry
        self.recovery_steps = []
        self.current_step = 0
        self.logger = logging.getLogger("error_recovery_test")
    
    def define_recovery_flow(self, steps):
        """
        Define a sequence of recovery steps to test.
        
        Args:
            steps: List of dictionaries describing recovery steps
                - operation: The operation to perform
                - expected_outcome: The expected outcome of the step
                - recovery_action: The recovery action to perform if the step fails
        
        Returns:
            The configured recovery flow ID
        """
        flow_id = f"recovery_flow_{id(steps)}"
        self.recovery_steps = steps
        self.current_step = 0
        
        if self.registry:
            self.registry.register_entity("RecoveryFlow", flow_id, steps)
        
        return flow_id
    
    def execute_step(self, step_index=None, context=None):
        """
        Execute a specific recovery step or the current step.
        
        Args:
            step_index: The index of the step to execute, or None for current
            context: Additional context for the step execution
        
        Returns:
            Dictionary with the step execution results
        """
        if step_index is not None:
            self.current_step = step_index
        
        if self.current_step >= len(self.recovery_steps):
            return {
                "status": "completed",
                "message": "All recovery steps completed"
            }
        
        step = self.recovery_steps[self.current_step]
        context = context or {}
        
        # Execute the step
        result = {
            "step_index": self.current_step,
            "operation": step["operation"],
            "expected_outcome": step["expected_outcome"],
            "context": context,
            "start_time": time.time()
        }
        
        # Check if an error should be triggered
        should_error, error_config = self.error_simulator.should_trigger_error(
            step["operation"], **context
        )
        
        if should_error:
            # Apply recovery action if specified
            if "recovery_action" in step:
                result["error"] = error_config["error_message"]
                result["recovery_action"] = step["recovery_action"]
                result["recovery_attempted"] = True
                # Recovery logic would be implemented here in a real scenario
            else:
                result["error"] = error_config["error_message"]
                result["status"] = "failed"
                result["end_time"] = time.time()
                return result
        
        # Step succeeded or was recovered
        result["status"] = "success"
        result["end_time"] = time.time()
        self.current_step += 1
        
        if self.registry:
            self.registry.register_entity(
                "RecoveryStepResult", 
                f"step_{self.current_step-1}_{id(result)}", 
                result
            )
        
        return result
    
    def execute_all_steps(self, context=None):
        """
        Execute all remaining recovery steps.
        
        Args:
            context: Additional context for the step executions
        
        Returns:
            List of dictionaries with the step execution results
        """
        results = []
        
        while self.current_step < len(self.recovery_steps):
            step_result = self.execute_step(context=context)
            results.append(step_result)
            
            if step_result["status"] == "failed":
                break
        
        return results
    
    def verify_recovery_success(self, results):
        """
        Verify that a recovery flow was successful.
        
        Args:
            results: List of step execution results
        
        Returns:
            Boolean indicating if recovery was successful
        """
        # Check all steps completed
        if len(results) != len(self.recovery_steps):
            return False
        
        # Check all steps succeeded
        for result in results:
            if result["status"] != "success":
                return False
        
        return True


class ErrorHandlingServiceTest(BaseServiceTest):
    """
    Extended service test class with error handling capabilities.
    
    This class adds methods for injecting and verifying error handling in services.
    """
    
    def inject_db_error(self, method_name="query"):
        """
        Inject a database error.
        
        Args:
            method_name: The method name to mock with an error
        
        Returns:
            The error details
        """
        return ErrorInjector.database_error(self.db_session, method_name)
    
    def inject_db_commit_error(self):
        """
        Inject a database commit error.
        
        Returns:
            The error details
        """
        return ErrorInjector.database_commit_error(self.db_session)
    
    def inject_not_found_error(self, query_result=None):
        """
        Inject a not found error by mocking the query result.
        
        Args:
            query_result: The result to return from the query (None for not found)
        
        Returns:
            The error details
        """
        query_mock = MagicMock()
        filter_mock = MagicMock()
        filter_mock.first.return_value = query_result
        query_mock.filter.return_value = filter_mock
        self.db_session.query.return_value = query_mock
        
        return ErrorInjector.not_found_error()
    
    def inject_integrity_error(self, entity_type="resource", field="name", value="duplicate"):
        """
        Inject an integrity error for duplicate entries.
        
        Args:
            entity_type: The type of entity with the conflict
            field: The field with the conflict
            value: The conflicting value
        
        Returns:
            The error details
        """
        error = ErrorInjector.conflict_error(entity_type, field, value)
        self.db_session.add.side_effect = error["exception"]
        return error
    
    def assert_handles_error(self, callable_obj, error_type, expected_result=None, *args, **kwargs):
        """
        Assert that a callable properly handles an error.
        
        Args:
            callable_obj: The callable to test
            error_type: The type of error to check
            expected_result: The expected result when the error occurs
            *args: Arguments to pass to the callable
            **kwargs: Keyword arguments to pass to the callable
        
        Returns:
            The result of the callable
        """
        # Call the function
        result = callable_obj(*args, **kwargs)
        
        # Check the result
        if expected_result is not None:
            assert result == expected_result, f"Expected {expected_result}, got {result}"
        
        return result
    
    def assert_handles_not_found(self, callable_obj, expected_result=None, *args, **kwargs):
        """
        Assert that a callable properly handles a not found error.
        
        Args:
            callable_obj: The callable to test
            expected_result: The expected result when the resource is not found
            *args: Arguments to pass to the callable
            **kwargs: Keyword arguments to pass to the callable
        
        Returns:
            The result of the callable
        """
        # Inject a not found error
        self.inject_not_found_error()
        
        # Call the function
        return self.assert_handles_error(callable_obj, ErrorType.RESOURCE_NOT_FOUND, expected_result, *args, **kwargs)
    
    def assert_handles_db_error(self, callable_obj, expected_result=None, *args, **kwargs):
        """
        Assert that a callable properly handles a database error.
        
        Args:
            callable_obj: The callable to test
            expected_result: The expected result when a database error occurs
            *args: Arguments to pass to the callable
            **kwargs: Keyword arguments to pass to the callable
        
        Returns:
            The result of the callable
        """
        # Inject a database error
        self.inject_db_error()
        
        # Call the function
        return self.assert_handles_error(callable_obj, ErrorType.DATABASE, expected_result, *args, **kwargs)
    
    def assert_handles_db_commit_error(self, callable_obj, expected_result=None, *args, **kwargs):
        """
        Assert that a callable properly handles a database commit error.
        
        Args:
            callable_obj: The callable to test
            expected_result: The expected result when a commit error occurs
            *args: Arguments to pass to the callable
            **kwargs: Keyword arguments to pass to the callable
        
        Returns:
            The result of the callable
        """
        # Inject a database commit error
        self.inject_db_commit_error()
        
        # Call the function
        return self.assert_handles_error(callable_obj, ErrorType.DATABASE, expected_result, *args, **kwargs)
    
    def assert_handles_integrity_error(self, callable_obj, expected_result=None, entity_type="resource", field="name", value="duplicate", *args, **kwargs):
        """
        Assert that a callable properly handles an integrity error.
        
        Args:
            callable_obj: The callable to test
            expected_result: The expected result when an integrity error occurs
            entity_type: The type of entity with the conflict
            field: The field with the conflict
            value: The conflicting value
            *args: Arguments to pass to the callable
            **kwargs: Keyword arguments to pass to the callable
        
        Returns:
            The result of the callable
        """
        # Inject an integrity error
        self.inject_integrity_error(entity_type, field, value)
        
        # Call the function
        return self.assert_handles_error(callable_obj, ErrorType.RESOURCE_CONFLICT, expected_result, *args, **kwargs)