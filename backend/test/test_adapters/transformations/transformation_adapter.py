"""
Transformation Registry Test Adapter

This module provides a test adapter for the transformation registry, enabling
registration and execution of transformations during integration testing.
"""

import uuid
import logging
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Union, Callable

from ..entity_registry import BaseTestAdapter, EntityAction

# Set up logging
logger = logging.getLogger("transformation_registry_adapter")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)


class TransformationRegistryAdapter(BaseTestAdapter):
    """
    Test adapter for the transformation registry.
    
    This adapter allows registering and executing transformations during testing.
    """
    
    def __init__(self, registry=None):
        """
        Initialize the transformation registry adapter.
        
        Args:
            registry: Entity registry to use for tracking transformations
        """
        super().__init__(registry)
        
        # Initialize in-memory storage for transformations
        self.transformations = {}
        
        # Register entity listener for integration changes
        self.registry.register_listener("Integration", self._handle_integration_change)
    
    def register_test_transformation(self, name: str, description: str,
                                 supported_types: List[str], function: Callable,
                                 params: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Register a test transformation for use in tests.
        
        Args:
            name: Name of the transformation
            description: Description of the transformation
            supported_types: List of data types this transformation supports
            function: The transformation function
            params: Optional list of parameter definitions
            
        Returns:
            Transformation definition
        """
        transformation_id = str(uuid.uuid4())
        
        # Create transformation entry
        transformation = {
            "id": transformation_id,
            "name": name,
            "description": description,
            "supported_types": supported_types,
            "function": function,  # Note: This would normally be a string reference
            "params": params or [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Store in memory
        self.transformations[transformation_id] = transformation
        
        # Register in entity registry
        registry_entry = {
            "id": transformation_id,
            "name": name,
            "description": description,
            "supported_types": supported_types,
            "created_at": transformation["created_at"],
            "updated_at": transformation["updated_at"]
        }
        self._register_entity("Transformation", transformation_id, registry_entry)
        
        logger.info(f"Registered test transformation: {name}")
        return registry_entry
    
    def get_transformations(self) -> List[Dict[str, Any]]:
        """
        Get all registered transformations.
        
        Returns:
            List of transformation definitions (without functions)
        """
        return [
            {
                "id": t_id,
                "name": t["name"],
                "description": t["description"],
                "supported_types": t["supported_types"],
                "params": t["params"],
                "created_at": t["created_at"],
                "updated_at": t["updated_at"]
            }
            for t_id, t in self.transformations.items()
        ]
    
    def get_transformation(self, transformation_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a transformation by ID.
        
        Args:
            transformation_id: ID of the transformation
            
        Returns:
            Transformation definition or None if not found
        """
        if transformation_id not in self.transformations:
            return None
        
        t = self.transformations[transformation_id]
        return {
            "id": transformation_id,
            "name": t["name"],
            "description": t["description"],
            "supported_types": t["supported_types"],
            "params": t["params"],
            "created_at": t["created_at"],
            "updated_at": t["updated_at"]
        }
    
    def transform_data(self, transformation_id: str, data: Any, 
                     params: Dict[str, Any] = None) -> Any:
        """
        Apply a transformation to data.
        
        Args:
            transformation_id: ID of the transformation to apply
            data: Data to transform
            params: Parameters for the transformation
            
        Returns:
            Transformed data
            
        Raises:
            ValueError: If transformation is not found
        """
        if transformation_id not in self.transformations:
            if transformation_id == "direct":
                # Special case for direct mapping (no transformation)
                return data
            
            transformation_by_name = next(
                (t for t in self.transformations.values() if t["name"] == transformation_id),
                None
            )
            
            if not transformation_by_name:
                raise ValueError(f"Transformation not found: {transformation_id}")
            
            transformation = transformation_by_name
        else:
            transformation = self.transformations[transformation_id]
        
        # Convert to pandas Series if it's not already
        if not isinstance(data, pd.Series) and not isinstance(data, pd.DataFrame):
            data = pd.Series([data])
        
        # Apply the transformation
        try:
            result = transformation["function"](data, params or {})
            return result
        except Exception as e:
            logger.error(f"Error applying transformation {transformation_id}: {e}")
            raise ValueError(f"Error applying transformation: {str(e)}")
    
    def transform_batch(self, transformation_id: str, data_batch: List[Any], 
                      params: Dict[str, Any] = None) -> List[Any]:
        """
        Apply a transformation to a batch of data.
        
        Args:
            transformation_id: ID of the transformation to apply
            data_batch: List of data items to transform
            params: Parameters for the transformation
            
        Returns:
            List of transformed data items
        """
        # Convert to pandas DataFrame for efficient batch processing
        df = pd.DataFrame(data_batch)
        
        if transformation_id not in self.transformations:
            if transformation_id == "direct":
                # Special case for direct mapping (no transformation)
                return data_batch
            
            transformation_by_name = next(
                (t for t in self.transformations.values() if t["name"] == transformation_id),
                None
            )
            
            if not transformation_by_name:
                raise ValueError(f"Transformation not found: {transformation_id}")
            
            transformation = transformation_by_name
        else:
            transformation = self.transformations[transformation_id]
        
        # Apply the transformation to each column
        result_df = df.copy()
        for column in df.columns:
            try:
                result_df[column] = transformation["function"](df[column], params or {})
            except Exception as e:
                logger.error(f"Error applying transformation to column {column}: {e}")
                # Continue with other columns if one fails
                pass
        
        # Convert back to list of dictionaries
        return result_df.to_dict('records')
    
    def validate_transformation(self, transformation_id: str, 
                             data_sample: Any, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Validate that a transformation can be applied to a data sample.
        
        Args:
            transformation_id: ID of the transformation to validate
            data_sample: Sample data to validate against
            params: Parameters for the transformation
            
        Returns:
            Validation result (valid: bool, errors: list)
        """
        if transformation_id == "direct":
            # Direct transformations are always valid
            return {"valid": True, "errors": []}
        
        if transformation_id not in self.transformations:
            transformation_by_name = next(
                (t for t in self.transformations.values() if t["name"] == transformation_id),
                None
            )
            
            if not transformation_by_name:
                return {
                    "valid": False,
                    "errors": [f"Transformation not found: {transformation_id}"]
                }
            
            transformation = transformation_by_name
        else:
            transformation = self.transformations[transformation_id]
        
        # Check if data type is supported
        if isinstance(data_sample, pd.Series):
            data_type = str(data_sample.dtype)
        elif isinstance(data_sample, pd.DataFrame):
            data_type = "dataframe"
        else:
            data_type = type(data_sample).__name__
        
        # Map Python types to our supported types
        type_mapping = {
            "int64": "number",
            "float64": "number",
            "object": "string",
            "str": "string",
            "bool": "boolean",
            "datetime64[ns]": "datetime",
            "int": "number",
            "float": "number",
            "bool": "boolean",
            "dict": "object",
            "list": "array"
        }
        
        normalized_type = type_mapping.get(data_type, data_type)
        
        # Check if the normalized type is supported
        if normalized_type not in transformation["supported_types"] and "*" not in transformation["supported_types"]:
            return {
                "valid": False,
                "errors": [f"Data type {normalized_type} not supported by transformation {transformation['name']}"]
            }
        
        # Validate required parameters
        errors = []
        for param_def in transformation["params"] or []:
            param_name = param_def["name"]
            if param_def.get("required", False) and (params is None or param_name not in params):
                errors.append(f"Missing required parameter: {param_name}")
        
        # Try applying the transformation to validate
        try:
            if isinstance(data_sample, (pd.Series, pd.DataFrame)):
                transformation["function"](data_sample, params or {})
            else:
                series = pd.Series([data_sample])
                transformation["function"](series, params or {})
        except Exception as e:
            errors.append(f"Transformation application error: {str(e)}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
    
    def _handle_integration_change(self, entity_type: str, entity_id: str, 
                                 entity: Any, action: str) -> None:
        """
        Handle changes to integrations in the entity registry.
        
        Args:
            entity_type: Type of entity that changed
            entity_id: ID of the entity
            entity: The entity object
            action: Action that occurred (create, update, delete)
        """
        # This might be used to clean up transformations when an integration is deleted
        # For now, we'll just log the event
        if action == EntityAction.DELETE:
            logger.info(f"Integration {entity_id} deleted, checking for associated transformations")
    
    def reset(self) -> None:
        """Reset the adapter to its initial state."""
        self.transformations = {}
        logger.info("Transformation registry adapter reset")