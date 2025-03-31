"""
Service Test Framework

This module provides a framework for testing services with mock repositories.
"""

from typing import Dict, List, Any, Optional, Callable, Type
from unittest.mock import MagicMock
import inspect

from .entity_registry import BaseTestAdapter


class BaseServiceTest:
    """Base class for service tests that provides common testing functionality."""
    
    def __init__(self, service_class, repository_adapters=None):
        """
        Initialize the service test with a service class and repository adapters.
        
        Args:
            service_class: The service class to test
            repository_adapters: Dictionary of adapter name to adapter instance
        """
        self.service_class = service_class
        self.repository_adapters = repository_adapters or {}
        self.db_session = MagicMock()
        self.service_instance = None
        self._setup_service()
    
    def _setup_service(self):
        """Set up the service instance with mocked dependencies."""
        # Check if service class has an __init__ method with parameters
        sig = inspect.signature(self.service_class.__init__)
        # Skip services that don't need instantiation (all static methods)
        if len(sig.parameters) == 1:  # Only self parameter
            self.service_instance = self.service_class
            return
            
        # For normal services that need instantiation
        params = {}
        
        # Provide the DB session as the first parameter
        params[list(sig.parameters.keys())[1]] = self.db_session
        
        # Create mocks for additional dependencies
        for name in list(sig.parameters.keys())[2:]:
            # Check if we have an adapter for this parameter
            if name in self.repository_adapters:
                params[name] = self.repository_adapters[name]
            else:
                # Otherwise, create a mock
                params[name] = MagicMock()
        
        # Create the service instance
        self.service_instance = self.service_class(**params)
    
    def reset(self):
        """Reset the service test state."""
        # Reset all adapters
        for adapter in self.repository_adapters.values():
            if hasattr(adapter, 'reset'):
                adapter.reset()
        
        # Reset the DB session mock
        self.db_session.reset_mock()
        
        # Re-setup the service
        self._setup_service()
    
    def mock_db_query(self, model_class, result=None, multiple=False):
        """
        Set up a mock DB query for a model class.
        
        Args:
            model_class: The model class to mock
            result: The result to return
            multiple: Whether to return multiple results
        """
        query_mock = MagicMock()
        
        if multiple:
            query_mock.all.return_value = result or []
        else:
            query_mock.first.return_value = result
            query_mock.one.return_value = result
            query_mock.one_or_none.return_value = result
            query_mock.get.return_value = result
        
        filter_mock = MagicMock()
        filter_mock.first.return_value = result
        filter_mock.all.return_value = result or []
        
        query_mock.filter.return_value = filter_mock
        query_mock.filter_by.return_value = filter_mock
        
        # Set up the return_value for query(model_class)
        self.db_session.query.side_effect = lambda cls: query_mock if cls == model_class else MagicMock()
        
        return query_mock
    
    def assert_db_called_with(self, method_name, *args, **kwargs):
        """
        Assert that a DB session method was called with specific arguments.
        
        Args:
            method_name: The name of the method to check
            *args: Positional arguments the method should be called with
            **kwargs: Keyword arguments the method should be called with
        """
        method = getattr(self.db_session, method_name)
        method.assert_called_with(*args, **kwargs)
    
    def assert_db_call_count(self, method_name, count):
        """
        Assert the number of times a DB session method was called.
        
        Args:
            method_name: The name of the method to check
            count: The expected call count
        """
        method = getattr(self.db_session, method_name)
        assert method.call_count == count, f"Expected {method_name} to be called {count} times, but was called {method.call_count} times"


class ServiceTestAdapter(BaseTestAdapter):
    """
    Adapter for testing services that use the entity registry.
    
    This adapter provides methods to create mock entities and validate service behavior.
    """
    
    def __init__(self, registry=None, service_class=None):
        """
        Initialize the service test adapter.
        
        Args:
            registry: The entity registry to use
            service_class: The service class to test
        """
        super().__init__(registry)
        self.service_class = service_class
        self.model_registry = {}
        self.service_test = None
        
        if service_class:
            self.setup_service_test()
    
    def setup_service_test(self, additional_adapters=None):
        """
        Set up the service test with the service class.
        
        Args:
            additional_adapters: Dictionary of additional adapters to use
        """
        if not self.service_class:
            raise ValueError("Service class not set")
        
        adapters = {"service_adapter": self}
        if additional_adapters:
            adapters.update(additional_adapters)
        
        self.service_test = BaseServiceTest(self.service_class, adapters)
        return self.service_test
    
    def register_model(self, model_class, entity_type):
        """
        Register a model class with an entity type.
        
        Args:
            model_class: The model class to register
            entity_type: The entity type to associate with the model
        """
        self.model_registry[model_class] = entity_type
        self.model_registry[entity_type] = model_class
    
    def create_entity(self, entity_type, **kwargs):
        """
        Create an entity of the specified type.
        
        Args:
            entity_type: The type of entity to create
            **kwargs: Entity attributes
            
        Returns:
            The created entity
        """
        entity_id = kwargs.get('id', str(len(self.registry.get_entities_by_type(entity_type)) + 1))
        entity = {
            'id': entity_id,
            **kwargs
        }
        
        # Register the entity with the registry
        self._register_entity(entity_type, str(entity_id), entity)
        
        return entity
    
    def mock_service_call(self, method_name, result=None, exception=None):
        """
        Mock a service method call.
        
        Args:
            method_name: The name of the method to mock
            result: The result to return
            exception: The exception to raise
        """
        if not self.service_test:
            raise ValueError("Service test not set up")
        
        method = getattr(self.service_test.service_instance, method_name)
        
        if exception:
            method.side_effect = exception
        else:
            method.return_value = result
            
        return method
    
    def assert_service_called_with(self, method_name, *args, **kwargs):
        """
        Assert that a service method was called with specific arguments.
        
        Args:
            method_name: The name of the method to check
            *args: Positional arguments the method should be called with
            **kwargs: Keyword arguments the method should be called with
        """
        if not self.service_test:
            raise ValueError("Service test not set up")
            
        method = getattr(self.service_test.service_instance, method_name)
        method.assert_called_with(*args, **kwargs)