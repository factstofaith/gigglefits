"""
Adapter Factory

This module provides a standardized factory for creating adapters dynamically
based on the integration configuration from the UI. It follows the Factory Method
pattern to enable dynamic creation of adapter instances without tightly coupling
code to specific adapter implementations.
"""

from typing import Dict, Any, Optional, Type, Union, List, Callable
import logging
import importlib
import inspect
from .api_adapter import APIAdapter

# Import utility for error handling
from utils.error_handling.exceptions import ConfigurationError, ValidationError

# Setup logging
logger = logging.getLogger(__name__)


class AdapterRegistry:
    """Registry for adapter types and their implementation classes"""
    
    def __init__(self):
        """Initialize an empty adapter registry"""
        self._adapters: Dict[str, Type[APIAdapter]] = {}
        self._metadata: Dict[str, Dict[str, Any]] = {}
        
    def register(self, adapter_type: str, adapter_class: Type[APIAdapter], **metadata) -> None:
        """
        Register an adapter type with its implementation class
        
        Args:
            adapter_type: The type identifier for the adapter
            adapter_class: The class that implements the adapter
            **metadata: Additional metadata about the adapter (capabilities, etc.)
        """
        if adapter_type in self._adapters:
            logger.warning(f"Overwriting existing adapter registration for '{adapter_type}'")
            
        self._adapters[adapter_type] = adapter_class
        self._metadata[adapter_type] = metadata
        
        # Extract description from class docstring if not provided
        if 'description' not in metadata:
            self._metadata[adapter_type]['description'] = adapter_class.__doc__ or f"{adapter_type} adapter"
            
        logger.debug(f"Registered adapter '{adapter_type}': {adapter_class.__name__}")
        
    def unregister(self, adapter_type: str) -> bool:
        """
        Remove an adapter type from the registry
        
        Args:
            adapter_type: The type identifier to remove
            
        Returns:
            True if the adapter was removed, False if it wasn't registered
        """
        if adapter_type in self._adapters:
            del self._adapters[adapter_type]
            del self._metadata[adapter_type]
            logger.debug(f"Unregistered adapter '{adapter_type}'")
            return True
        return False
        
    def get_class(self, adapter_type: str) -> Optional[Type[APIAdapter]]:
        """
        Get the implementation class for an adapter type
        
        Args:
            adapter_type: The type identifier for the adapter
            
        Returns:
            The implementation class or None if not registered
        """
        return self._adapters.get(adapter_type)
        
    def get_metadata(self, adapter_type: str) -> Dict[str, Any]:
        """
        Get metadata for an adapter type
        
        Args:
            adapter_type: The type identifier for the adapter
            
        Returns:
            Metadata dictionary or empty dict if not registered
        """
        return self._metadata.get(adapter_type, {})
        
    def get_all_types(self) -> List[str]:
        """
        Get all registered adapter types
        
        Returns:
            List of registered adapter type identifiers
        """
        return list(self._adapters.keys())
        
    def get_all_adapters(self) -> Dict[str, Dict[str, Any]]:
        """
        Get all registered adapters with their metadata
        
        Returns:
            Dictionary mapping adapter types to their metadata
        """
        result = {}
        for adapter_type in self._adapters:
            adapter_class = self._adapters[adapter_type]
            metadata = self._metadata[adapter_type].copy()
            metadata['class'] = adapter_class.__name__
            metadata['module'] = adapter_class.__module__
            result[adapter_type] = metadata
        return result


class AdapterFactory:
    """
    Factory for creating adapters dynamically
    
    This class provides a factory for creating adapter instances based on
    registered adapter types and configuration. It supports runtime discovery
    and registration of adapter implementations.
    """
    
    # Global registry instance
    _registry = AdapterRegistry()
    
    # Validation functions for adapter configs
    _validators: Dict[str, Callable[[Dict[str, Any]], None]] = {}
    
    @classmethod
    def register_adapter(cls, adapter_type: str, adapter_class: Type[APIAdapter], **metadata) -> None:
        """
        Register an adapter type with its implementation class
        
        Args:
            adapter_type: The type identifier for the adapter
            adapter_class: The class that implements the adapter
            **metadata: Additional metadata about the adapter (capabilities, etc.)
        """
        cls._registry.register(adapter_type, adapter_class, **metadata)
    
    @classmethod
    def register_validator(cls, adapter_type: str, validator_func: Callable[[Dict[str, Any]], None]) -> None:
        """
        Register a validation function for an adapter type's configuration
        
        Args:
            adapter_type: The type identifier for the adapter
            validator_func: Function that validates the configuration dictionary
                           and raises ValidationError for invalid configs
        """
        cls._validators[adapter_type] = validator_func
        logger.debug(f"Registered validator for adapter type '{adapter_type}'")
    
    @classmethod
    def create_adapter(cls, adapter_type: str, config: Dict[str, Any]) -> APIAdapter:
        """
        Create an adapter instance based on the type and configuration
        
        Args:
            adapter_type: The type of adapter to create
            config: Configuration for the adapter
            
        Returns:
            An adapter instance
            
        Raises:
            ConfigurationError: If the adapter type is not registered
            ValidationError: If the configuration is invalid
        """
        adapter_class = cls._registry.get_class(adapter_type)
        if not adapter_class:
            available_types = ", ".join(cls._registry.get_all_types())
            raise ConfigurationError(
                message=f"Unknown adapter type '{adapter_type}'. Available types: {available_types}",
                error_code="UNKNOWN_ADAPTER_TYPE"
            )
            
        # Validate configuration if a validator is registered
        if adapter_type in cls._validators:
            try:
                cls._validators[adapter_type](config)
            except ValidationError as e:
                # Re-raise validation errors
                raise
            except Exception as e:
                # Wrap other errors in ValidationError
                raise ValidationError(
                    message=f"Invalid configuration for adapter '{adapter_type}': {str(e)}",
                    detail={"adapter_type": adapter_type, "error": str(e)},
                    original_error=e
                )
        
        # Create the adapter instance
        try:
            return adapter_class(**config)
        except TypeError as e:
            # Handle missing required arguments
            raise ConfigurationError(
                message=f"Missing required configuration for adapter '{adapter_type}': {str(e)}",
                detail={"adapter_type": adapter_type, "error": str(e)},
                original_error=e
            )
        except Exception as e:
            # Handle other instantiation errors
            raise ConfigurationError(
                message=f"Failed to create adapter '{adapter_type}': {str(e)}",
                detail={"adapter_type": adapter_type, "error": str(e)},
                original_error=e
            )
    
    @classmethod
    def get_adapter_info(cls, adapter_type: str) -> Dict[str, Any]:
        """
        Get information about an adapter type
        
        Args:
            adapter_type: The type identifier for the adapter
            
        Returns:
            Dictionary with adapter metadata
            
        Raises:
            ConfigurationError: If the adapter type is not registered
        """
        if not cls._registry.get_class(adapter_type):
            available_types = ", ".join(cls._registry.get_all_types())
            raise ConfigurationError(
                message=f"Unknown adapter type '{adapter_type}'. Available types: {available_types}",
                error_code="UNKNOWN_ADAPTER_TYPE"
            )
            
        return cls._registry.get_metadata(adapter_type)
    
    @classmethod
    def get_available_adapters(cls) -> Dict[str, Dict[str, Any]]:
        """
        Get all available adapter types with their metadata
        
        Returns:
            Dictionary mapping adapter types to their metadata
        """
        return cls._registry.get_all_adapters()
    
    @classmethod
    def discover_adapters(cls, package_name: str = "adapters") -> List[str]:
        """
        Discover and register adapter classes from a package
        
        This method scans a package for classes that:
        1. Inherit from APIAdapter
        2. Have a class attribute 'adapter_type' or name ending with 'Adapter'
        
        Args:
            package_name: The name of the package to scan
            
        Returns:
            List of discovered adapter types
        """
        discovered = []
        
        try:
            # Import the package
            package = importlib.import_module(package_name)
            
            # Get all modules in the package
            modules = []
            if hasattr(package, "__path__"):
                import pkgutil
                for _, name, _ in pkgutil.iter_modules(package.__path__, package.__name__ + "."):
                    try:
                        modules.append(importlib.import_module(name))
                    except ImportError as e:
                        logger.warning(f"Could not import module {name}: {e}")
            
            # Add the package itself
            modules.append(package)
            
            # Find adapter classes in each module
            for module in modules:
                for name, obj in inspect.getmembers(module):
                    # Check if it's a class and inherits from APIAdapter
                    if (inspect.isclass(obj) and 
                        issubclass(obj, APIAdapter) and 
                        obj is not APIAdapter):
                        
                        # Get adapter type from class attribute or name
                        if hasattr(obj, "adapter_type"):
                            adapter_type = obj.adapter_type
                        elif name.endswith("Adapter"):
                            # Convert CamelCase to snake_case
                            import re
                            adapter_type = re.sub(r'(?<!^)(?=[A-Z])', '_', name[:-7]).lower()
                        else:
                            continue  # Skip classes without a type
                        
                        # Register the adapter
                        metadata = {}
                        if hasattr(obj, "capabilities"):
                            metadata["capabilities"] = obj.capabilities
                        
                        cls.register_adapter(adapter_type, obj, **metadata)
                        discovered.append(adapter_type)
        
        except ImportError as e:
            logger.warning(f"Could not import package {package_name}: {e}")
            
        return discovered


# Register the base API adapter
AdapterFactory.register_adapter("generic_api", APIAdapter)

# Import and register specialized adapters
def _register_standard_adapters():
    """Register all standard adapters that are available"""
    
    # Try to import and register specialized adapters
    try:
        from .oauth_adapter import OAuthAdapter
        AdapterFactory.register_adapter("oauth_api", OAuthAdapter, 
                                       oauth=True, 
                                       protocol="oauth2")
    except ImportError:
        logger.debug("OAuthAdapter not available")
        
    try:
        from .salesforce_adapter import SalesforceAdapter
        AdapterFactory.register_adapter("salesforce", SalesforceAdapter, 
                                       crm=True, 
                                       vendor="Salesforce")
    except ImportError:
        logger.debug("SalesforceAdapter not available")
        
    try:
        from .blob_storage_adapter import BlobStorageAdapter
        AdapterFactory.register_adapter("blob_storage", BlobStorageAdapter, 
                                       storage=True)
    except ImportError:
        logger.debug("BlobStorageAdapter not available")
        
    try:
        from .s3_connector import S3Connector
        AdapterFactory.register_adapter("s3", S3Connector, 
                                       storage=True, 
                                       vendor="AWS")
    except ImportError:
        logger.debug("S3Connector not available")
        
    try:
        from .azure_blob_connector import AzureBlobConnector
        AdapterFactory.register_adapter("azure_blob", AzureBlobConnector, 
                                       storage=True, 
                                       vendor="Microsoft")
    except ImportError:
        logger.debug("AzureBlobConnector not available")
        
    try:
        from .sharepoint_connector import SharePointConnector
        AdapterFactory.register_adapter("sharepoint", SharePointConnector, 
                                       storage=True, 
                                       document_management=True, 
                                       vendor="Microsoft")
    except ImportError:
        logger.debug("SharePointConnector not available")
        
# Register standard adapters
_register_standard_adapters()

# Discover any additional adapters in the adapters package
AdapterFactory.discover_adapters()


# Example of how to dynamically create and use adapters:
"""
# Generic API example
api_config = {
    "base_url": "https://api.example.com/v1",
    "api_key": "abcd1234"
}
adapter = AdapterFactory.create_adapter("generic_api", api_config)
data = adapter.get("users")

# OAuth API example
oauth_config = {
    "base_url": "https://api.oauth-service.com/v1",
    "client_id": "client_id_value",
    "client_secret": "client_secret_value",
    "token_url": "https://api.oauth-service.com/oauth2/token",
    "scope": "read write"
}
oauth_adapter = AdapterFactory.create_adapter("oauth_api", oauth_config)
oauth_adapter.authenticate()
data = oauth_adapter.get("resources")

# Salesforce example
sf_config = {
    "instance_url": "https://myorg.my.salesforce.com",
    "client_id": "salesforce_client_id",
    "client_secret": "salesforce_client_secret"
}
sf_adapter = AdapterFactory.create_adapter("salesforce", sf_config)
sf_adapter.authenticate()
accounts = sf_adapter.query("SELECT Id, Name FROM Account LIMIT 10")

# Azure Blob Storage example
blob_config = {
    "connection_string": "DefaultEndpointsProtocol=https;AccountName=mystorageaccount;AccountKey=mykey;EndpointSuffix=core.windows.net",
    "container_name": "mycontainer"
}
blob_adapter = AdapterFactory.create_adapter("azure_blob", blob_config)
blobs = blob_adapter.list_blobs()
df = blob_adapter.read_csv_blob("data.csv")
fields = blob_adapter.discover_fields()
"""