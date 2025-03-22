"""
Base API adapter for integrating with external API services.
"""

from typing import Dict, Any, Optional, List
import requests


class APIAdapter:
    """Base class for API integrations"""
    
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        """Initialize the adapter with the base URL and optional API key"""
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        
        # Set up headers if API key is provided
        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})
    
    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make a GET request to the API"""
        response = self.session.get(f"{self.base_url}/{endpoint}", params=params)
        response.raise_for_status()
        return response.json()
    
    def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a POST request to the API"""
        response = self.session.post(f"{self.base_url}/{endpoint}", json=data)
        response.raise_for_status()
        return response.json()
    
    def put(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a PUT request to the API"""
        response = self.session.put(f"{self.base_url}/{endpoint}", json=data)
        response.raise_for_status()
        return response.json()
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        """Make a DELETE request to the API"""
        response = self.session.delete(f"{self.base_url}/{endpoint}")
        response.raise_for_status()
        return response.json()
    
    def discover_fields(self) -> List[Dict[str, str]]:
        """
        Discover available fields from the API
        
        In a real implementation, this would:
        1. Inspect the API schema if available (OpenAPI/Swagger)
        2. Make a sample request to analyze the response structure
        3. Query metadata endpoints if available
        
        For now, it returns mock data
        """
        try:
            # Try to get field information - would typically look for schema or metadata
            # For example: schema = self.get("schema") or self.get("metadata")
            
            # For this demonstration, return mock fields
            return [
                {"name": "id", "type": "string", "description": "Unique identifier"},
                {"name": "name", "type": "string", "description": "Name of the resource"},
                {"name": "description", "type": "string", "description": "Description of the resource"},
                {"name": "created_at", "type": "datetime", "description": "Creation timestamp"},
                {"name": "updated_at", "type": "datetime", "description": "Last update timestamp"},
                {"name": "status", "type": "string", "description": "Current status"},
                {"name": "owner", "type": "string", "description": "Owner of the resource"},
                {"name": "tags", "type": "array", "description": "Associated tags"},
                {"name": "price", "type": "number", "description": "Price value if applicable"},
                {"name": "category", "type": "string", "description": "Resource category"}
            ]
        except Exception as e:
            # Log the error but don't fail - return basic fields
            print(f"Error discovering fields: {e}")
            return [
                {"name": "id", "type": "string", "description": "Unique identifier"},
                {"name": "name", "type": "string", "description": "Name field"},
                {"name": "created_at", "type": "datetime", "description": "Created timestamp"}
            ]
    
    def close(self):
        """Close the session"""
        self.session.close()