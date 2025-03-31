"""
Mock implementations for testing purposes
"""

# Mock AdapterFactory to avoid import errors
class AdapterFactory:
    @staticmethod
    def get_api_adapter(*args, **kwargs):
        return None
    
    @staticmethod
    def get_blob_storage_adapter(*args, **kwargs):
        return None
    
    @staticmethod
    def get_oauth_adapter(*args, **kwargs):
        return None