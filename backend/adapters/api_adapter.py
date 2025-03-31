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
        Discover available fields from the API by:
        1. Inspecting the API schema if available (OpenAPI/Swagger)
        2. Making a sample request to analyze the response structure
        3. Querying metadata endpoints if available
        """
        try:
            # Try to get schema information
            try:
                # First attempt: Try to get schema from a dedicated schema endpoint
                schema = self.get("schema")
                if schema and isinstance(schema, dict) and "properties" in schema:
                    return self._extract_fields_from_schema(schema)
            except Exception as schema_error:
                print(f"Error fetching schema: {schema_error}")
            
            # Second attempt: Try to get metadata from a metadata endpoint
            try:
                metadata = self.get("metadata")
                if metadata and isinstance(metadata, dict) and "fields" in metadata:
                    return metadata["fields"]
            except Exception as metadata_error:
                print(f"Error fetching metadata: {metadata_error}")
            
            # Third attempt: Make a sample request and analyze the response
            try:
                # Try to get a sample record to analyze structure
                sample = self.get("")  # Root endpoint or any endpoint that returns data
                if sample:
                    # If result is a list, use the first item
                    if isinstance(sample, list) and len(sample) > 0:
                        sample = sample[0]
                    
                    # If we have a dictionary, extract fields
                    if isinstance(sample, dict):
                        return self._extract_fields_from_sample(sample)
            except Exception as sample_error:
                print(f"Error fetching sample data: {sample_error}")
            
            # If all attempts fail, return basic fields
            print("Could not determine fields from API, returning basic fields")
            return [
                {"name": "id", "type": "string", "description": "Unique identifier"},
                {"name": "name", "type": "string", "description": "Name field"},
                {"name": "created_at", "type": "datetime", "description": "Created timestamp"}
            ]
        except Exception as e:
            # Log the error but don't fail - return basic fields
            print(f"Error discovering fields: {e}")
            return [
                {"name": "id", "type": "string", "description": "Unique identifier"},
                {"name": "name", "type": "string", "description": "Name field"},
                {"name": "created_at", "type": "datetime", "description": "Created timestamp"}
            ]
    
    def _extract_fields_from_schema(self, schema: Dict) -> List[Dict[str, str]]:
        """Extract field definitions from a JSON Schema object"""
        fields = []
        
        if "properties" in schema:
            properties = schema["properties"]
            required = schema.get("required", [])
            
            for field_name, field_props in properties.items():
                field_type = field_props.get("type", "string")
                
                field = {
                    "name": field_name,
                    "type": field_type,
                    "description": field_props.get("description", f"{field_name} field"),
                    "required": field_name in required
                }
                
                # Add format if present
                if "format" in field_props:
                    field["format"] = field_props["format"]
                
                # Add example if present
                if "example" in field_props:
                    field["example"] = field_props["example"]
                
                fields.append(field)
        
        return fields
    
    def _extract_fields_from_sample(self, sample: Dict) -> List[Dict[str, str]]:
        """Extract field definitions from a sample JSON object"""
        fields = []
        
        for field_name, value in sample.items():
            # Infer type from value
            if value is None:
                field_type = "string"  # Default to string for null values
            elif isinstance(value, bool):
                field_type = "boolean"
            elif isinstance(value, int):
                field_type = "integer"
            elif isinstance(value, float):
                field_type = "number"
            elif isinstance(value, dict):
                field_type = "object"
            elif isinstance(value, list):
                field_type = "array"
            else:
                # Try to detect dates in string format
                if isinstance(value, str):
                    # Simple check for ISO date formats
                    if len(value) >= 10 and (
                        value[4:5] == "-" and value[7:8] == "-" or  # YYYY-MM-DD
                        value[2:3] == "/" and value[5:6] == "/"      # MM/DD/YYYY
                    ):
                        field_type = "date"
                    # Check for datetime format
                    elif len(value) >= 19 and (
                        "T" in value or  # ISO format with T
                        ":" in value and " " in value  # Space separated date time
                    ):
                        field_type = "datetime"
                    else:
                        field_type = "string"
                else:
                    field_type = "string"
            
            field = {
                "name": field_name,
                "type": field_type,
                "description": f"{field_name} field"
            }
            
            # Add example value if it's a simple type
            if field_type in ["string", "integer", "number", "boolean", "date", "datetime"]:
                field["example"] = str(value)
            
            fields.append(field)
        
        return fields
    
    def close(self):
        """Close the session"""
        self.session.close()