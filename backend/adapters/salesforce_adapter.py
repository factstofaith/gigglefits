"""
Salesforce API Adapter

This module provides an adapter for integrating with Salesforce API.
"""

from typing import Dict, Any, Optional, List
import logging

from .oauth_adapter import OAuthAdapter

logger = logging.getLogger(__name__)

class SalesforceAdapter(OAuthAdapter):
    """Adapter specific to Salesforce API"""
    
    def __init__(
        self,
        instance_url: str,
        client_id: str,
        client_secret: str,
        version: str = "v55.0",
        **kwargs
    ):
        """
        Initialize the Salesforce adapter
        
        Args:
            instance_url: Salesforce instance URL (e.g., https://myorg.my.salesforce.com)
            client_id: Connected App client ID
            client_secret: Connected App client secret
            version: API version to use
        """
        # Set up the URLs
        self.instance_url = instance_url.rstrip('/')
        self.version = version
        base_url = f"{self.instance_url}/services/data/{version}"
        token_url = f"{self.instance_url}/services/oauth2/token"
        
        # Initialize OAuth adapter
        super().__init__(
            base_url=base_url,
            client_id=client_id,
            client_secret=client_secret,
            token_url=token_url,
            **kwargs
        )
        
        # Default to client credentials flow
        if not kwargs.get('auth_method'):
            self.auth_method = "client_credentials"
    
    def authenticate(self) -> bool:
        """
        Authenticate with Salesforce using OAuth
        
        Returns:
            bool: True if authentication was successful
        """
        success = super().authenticate()
        
        if success:
            # Salesforce returns the instance URL in the token response
            # We need to update our base URL to use it
            if hasattr(self, 'instance_url_from_token'):
                self.base_url = f"{self.instance_url_from_token}/services/data/{self.version}"
        
        return success
    
    def _update_token_data(self, token_data: Dict[str, Any]) -> None:
        """
        Update token data from Salesforce response
        
        Args:
            token_data: Token response data
        """
        # Salesforce includes the instance URL in the token response
        if 'instance_url' in token_data:
            self.instance_url_from_token = token_data['instance_url']
        
        super()._update_token_data(token_data)
    
    def describe_sobject(self, sobject_name: str) -> Dict[str, Any]:
        """
        Get the metadata for a Salesforce object
        
        Args:
            sobject_name: Name of the Salesforce object (e.g., Account, Contact)
            
        Returns:
            Dict[str, Any]: Object metadata
        """
        return self.get(f"sobjects/{sobject_name}/describe")
    
    def query(self, soql_query: str) -> Dict[str, Any]:
        """
        Execute a SOQL query
        
        Args:
            soql_query: SOQL query string
            
        Returns:
            Dict[str, Any]: Query results
        """
        return self.get("query", params={"q": soql_query})
    
    def create_record(self, sobject_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new record
        
        Args:
            sobject_name: Name of the Salesforce object
            data: Record data
            
        Returns:
            Dict[str, Any]: Creation result
        """
        return self.post(f"sobjects/{sobject_name}", data)
    
    def update_record(self, sobject_name: str, record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing record
        
        Args:
            sobject_name: Name of the Salesforce object
            record_id: ID of the record to update
            data: Record data
            
        Returns:
            Dict[str, Any]: Update result
        """
        return self.patch(f"sobjects/{sobject_name}/{record_id}", data)
    
    def delete_record(self, sobject_name: str, record_id: str) -> Dict[str, Any]:
        """
        Delete a record
        
        Args:
            sobject_name: Name of the Salesforce object
            record_id: ID of the record to delete
            
        Returns:
            Dict[str, Any]: Deletion result
        """
        return self.delete(f"sobjects/{sobject_name}/{record_id}")
    
    def discover_fields(self, sobject_name: str = "Account") -> List[Dict[str, str]]:
        """
        Discover fields from a Salesforce object
        
        Args:
            sobject_name: Name of the Salesforce object
            
        Returns:
            List[Dict[str, str]]: Discovered fields
        """
        try:
            # Get the object metadata
            metadata = self.describe_sobject(sobject_name)
            
            # Extract fields
            return [
                {
                    "name": field["name"],
                    "type": self._map_salesforce_type(field["type"]),
                    "description": field["label"]
                }
                for field in metadata.get("fields", [])
            ]
        except Exception as e:
            logger.error(f"Error discovering fields from Salesforce: {str(e)}")
            return super().discover_fields()
    
    def _map_salesforce_type(self, sf_type: str) -> str:
        """
        Map Salesforce data types to standard types
        
        Args:
            sf_type: Salesforce data type
            
        Returns:
            str: Standard data type
        """
        type_mapping = {
            "string": "string",
            "picklist": "string",
            "multipicklist": "array",
            "combobox": "string",
            "reference": "string",
            "boolean": "boolean",
            "currency": "number",
            "textarea": "string",
            "int": "integer",
            "double": "number",
            "percent": "number",
            "phone": "string",
            "id": "string",
            "date": "date",
            "datetime": "datetime",
            "time": "time",
            "url": "string",
            "email": "string",
            "encryptedstring": "string",
            "datacategorygroupreference": "string",
            "location": "object",
            "address": "object"
        }
        
        return type_mapping.get(sf_type.lower(), "string")
    
    def patch(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make a PATCH request
        
        Args:
            endpoint: API endpoint
            data: Request data
            
        Returns:
            Dict[str, Any]: Response data
        """
        if self.token_expired():
            self.refresh_auth_token()
            
        response = self.session.patch(f"{self.base_url}/{endpoint}", json=data)
        response.raise_for_status()
        
        # Salesforce returns 204 No Content for successful PATCH
        if response.status_code == 204:
            return {"success": True}
            
        return response.json()