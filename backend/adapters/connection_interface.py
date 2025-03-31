"""
Connection Interface for Data Sources

This module defines the base interface for all data source connections,
providing a unified way to interact with different types of data sources.
"""

from typing import Dict, Any, Optional, List, Union
import abc


class ConnectionInterface(abc.ABC):
    """Abstract base class defining the interface for all data source connections"""
    
    @abc.abstractmethod
    def connect(self) -> bool:
        """
        Establish a connection to the data source
        
        Returns:
            bool: True if connection was successful, False otherwise
        """
        pass
        
    @abc.abstractmethod
    def disconnect(self) -> bool:
        """
        Close the connection to the data source
        
        Returns:
            bool: True if disconnection was successful, False otherwise
        """
        pass
        
    @abc.abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """
        Test the connection to the data source
        
        Returns:
            Dict[str, Any]: Connection test results with status and details
        """
        pass
        
    @abc.abstractmethod
    def get_datasets(self) -> List[Dict[str, Any]]:
        """
        Get a list of available datasets from the data source
        
        Returns:
            List[Dict[str, Any]]: List of dataset metadata
        """
        pass
        
    @abc.abstractmethod
    def get_schema(self, dataset_name: str) -> Dict[str, Any]:
        """
        Get the schema for a specific dataset
        
        Args:
            dataset_name: Name or identifier of the dataset
            
        Returns:
            Dict[str, Any]: Schema definition for the dataset
        """
        pass
        
    @abc.abstractmethod
    def query(self, dataset_name: str, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Query data from the data source
        
        Args:
            dataset_name: Name or identifier of the dataset
            query: Query parameters
            
        Returns:
            List[Dict[str, Any]]: Query results
        """
        pass
        
    @abc.abstractmethod
    def discover_fields(self, dataset_name: Optional[str] = None) -> List[Dict[str, str]]:
        """
        Discover available fields from the data source
        
        Args:
            dataset_name: Optional name of the dataset to discover fields from
            
        Returns:
            List[Dict[str, str]]: List of field definitions
        """
        pass


class ConnectionConfig(abc.ABC):
    """Abstract base class for connection configuration"""
    
    @abc.abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert configuration to a dictionary
        
        Returns:
            Dict[str, Any]: Configuration as a dictionary
        """
        pass
        
    @abc.abstractmethod
    def validate(self) -> List[str]:
        """
        Validate the configuration
        
        Returns:
            List[str]: List of validation errors (empty if valid)
        """
        pass
        
    @classmethod
    @abc.abstractmethod
    def from_dict(cls, config_dict: Dict[str, Any]) -> 'ConnectionConfig':
        """
        Create a configuration object from a dictionary
        
        Args:
            config_dict: Dictionary containing configuration
            
        Returns:
            ConnectionConfig: Configuration object
        """
        pass


class ConnectionFactory:
    """Factory for creating data source connections"""
    
    _registry: Dict[str, Any] = {}
    
    @classmethod
    def register_connection(cls, connection_type: str, connection_class, config_class=None):
        """
        Register a connection type with its implementation and configuration classes
        
        Args:
            connection_type: Unique identifier for the connection type
            connection_class: Class that implements the ConnectionInterface
            config_class: Optional configuration class for this connection type
        """
        cls._registry[connection_type] = {
            'connection_class': connection_class,
            'config_class': config_class
        }
    
    @classmethod
    def create_connection(cls, connection_type: str, config: Union[Dict[str, Any], ConnectionConfig]) -> Optional[ConnectionInterface]:
        """
        Create a connection instance based on type and configuration
        
        Args:
            connection_type: The type of connection to create
            config: Configuration for the connection (either a dict or ConnectionConfig object)
            
        Returns:
            ConnectionInterface: A connection instance or None if the type is not registered
        """
        if connection_type not in cls._registry:
            return None
            
        registry_entry = cls._registry[connection_type]
        connection_class = registry_entry['connection_class']
        config_class = registry_entry['config_class']
        
        # Convert dict config to ConnectionConfig if a config class is registered
        if isinstance(config, dict) and config_class:
            config = config_class.from_dict(config)
            
        # Create the connection instance
        if config_class and not isinstance(config, config_class):
            raise TypeError(f"Config must be an instance of {config_class.__name__}")
            
        return connection_class(config)
    
    @classmethod
    def get_available_connections(cls) -> Dict[str, Dict[str, Any]]:
        """
        Get a dictionary of available connection types and their metadata
        
        Returns:
            Dict[str, Dict[str, Any]]: Dictionary of connection types and their metadata
        """
        return {
            conn_type: {
                'description': cls._registry[conn_type]['connection_class'].__doc__ or '',
                'config_required': cls._registry[conn_type]['config_class'] is not None
            }
            for conn_type in cls._registry
        }