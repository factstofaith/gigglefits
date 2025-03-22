"""
Adapter Factory

This module provides a factory for creating adapters dynamically
based on the integration configuration from the UI.
"""

from typing import Dict, Any, Optional, Type, Union
import logging
from .api_adapter import APIAdapter

# Import specialized adapters
try:
    from .oauth_adapter import OAuthAdapter
    from .salesforce_adapter import SalesforceAdapter
    from .blob_storage_adapter import BlobStorageAdapter
except ImportError as e:
    logging.warning(f"Could not import some adapters: {str(e)}")


class AdapterFactory:
    """Factory for creating adapters dynamically"""
    
    # Registry of adapter types
    _adapter_registry: Dict[str, Type[APIAdapter]] = {}
    
    @classmethod
    def register_adapter(cls, adapter_type: str, adapter_class: Type[APIAdapter]):
        """Register an adapter type with its implementation class"""
        cls._adapter_registry[adapter_type] = adapter_class
    
    @classmethod
    def create_adapter(cls, adapter_type: str, config: Dict[str, Any]) -> Optional[APIAdapter]:
        """
        Create an adapter instance based on the type and configuration
        
        Args:
            adapter_type: The type of adapter to create
            config: Configuration for the adapter
            
        Returns:
            An adapter instance or None if the type is not registered
        """
        adapter_class = cls._adapter_registry.get(adapter_type)
        if not adapter_class:
            return None
            
        return adapter_class(**config)
    
    @classmethod
    def get_available_adapters(cls) -> Dict[str, str]:
        """Get a dictionary of available adapter types and their descriptions"""
        return {
            adapter_type: cls._adapter_registry[adapter_type].__doc__ or "" 
            for adapter_type in cls._adapter_registry
        }


# Register the base API adapter
AdapterFactory.register_adapter("generic_api", APIAdapter)

# Register OAuth adapter if available
if 'OAuthAdapter' in locals():
    AdapterFactory.register_adapter("oauth_api", OAuthAdapter)

# Register Salesforce adapter if available
if 'SalesforceAdapter' in locals():
    AdapterFactory.register_adapter("salesforce", SalesforceAdapter)

# Register Azure Blob Storage adapter if available
if 'BlobStorageAdapter' in locals():
    AdapterFactory.register_adapter("azure_blob", BlobStorageAdapter)


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