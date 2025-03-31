"""
Transformation Registry Test Adapter

This module provides a test adapter for the transformation_registry module.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Callable, Union
from unittest.mock import MagicMock, patch

from utils.transformation_registry import TransformationRegistry
from .entity_registry import BaseTestAdapter, EntityAction


class TransformationRegistryTestAdapter(BaseTestAdapter):
    """
    Test adapter for transformation_registry module.
    
    This adapter integrates with the entity registry and provides methods
    for testing the TransformationRegistry.
    """
    
    def __init__(self, registry=None):
        """
        Initialize the TransformationRegistryTestAdapter.
        
        Args:
            registry: Entity registry for test synchronization
        """
        super().__init__(registry)
        
        # Store original transformations to restore later
        self.original_transformations = TransformationRegistry._transformations.copy()
        
        # Track test data
        self.test_data = {}
        self.test_transformations = {}
    
    def create_test_data(self, name: str, data_type: str, values: List[Any] = None) -> pd.Series:
        """
        Create test data as pandas Series.
        
        Args:
            name: Name for the test data
            data_type: Type of data (string, number, datetime, boolean)
            values: Optional list of values (defaults to standard test values)
            
        Returns:
            pd.Series with test data
        """
        # Generate default test values if not provided
        if values is None:
            if data_type == "string":
                values = ["test1", "Test2", " test3 ", "TEST4", "test-5"]
            elif data_type == "number":
                values = [1, 2.5, 0, -1, 100]
            elif data_type == "datetime":
                values = pd.date_range(start="2023-01-01", periods=5).tolist()
            elif data_type == "boolean":
                values = [True, False, True, True, False]
            else:
                values = ["default1", "default2", "default3", "default4", "default5"]
        
        # Create pandas Series
        series = pd.Series(values, name=name)
        
        # Store in test data
        self.test_data[name] = {
            "name": name,
            "data_type": data_type,
            "series": series
        }
        
        # Register in entity registry
        self._register_entity("TestData", name, {
            "name": name,
            "data_type": data_type,
            "values": values
        })
        
        return series
    
    def register_test_transformation(
        self, 
        name: str,
        description: str = None,
        supported_types: List[str] = None,
        params: List[Dict[str, Any]] = None,
        function: Callable = None
    ) -> Dict[str, Any]:
        """
        Register a test transformation.
        
        Args:
            name: Name of the transformation
            description: Description of the transformation
            supported_types: List of supported data types
            params: List of parameter definitions
            function: The transformation function (defaults to identity function)
            
        Returns:
            The registered transformation info
        """
        # Default values
        if description is None:
            description = f"Test transformation: {name}"
        
        if supported_types is None:
            supported_types = ["string", "number", "datetime", "boolean"]
        
        if params is None:
            params = []
        
        if function is None:
            # Default identity function
            function = lambda data, params: data
        
        # Register the transformation
        @TransformationRegistry.register(
            name=name,
            description=description,
            supported_types=supported_types,
            params=params
        )
        def test_transform(data: pd.Series, transform_params: Dict[str, Any]) -> pd.Series:
            return function(data, transform_params)
        
        # Store in test transformations
        transformation = TransformationRegistry.get_transformation(name)
        self.test_transformations[name] = transformation
        
        # Register in entity registry
        self._register_entity("TestTransformation", name, {
            "name": name,
            "description": description,
            "supported_types": supported_types,
            "params": params
        })
        
        return transformation
    
    def apply_transformation(
        self, 
        transformation_name: str, 
        data_name: str = None,
        data: pd.Series = None,
        params: Dict[str, Any] = None
    ) -> pd.Series:
        """
        Apply a transformation to test data.
        
        Args:
            transformation_name: Name of the transformation to apply
            data_name: Name of the test data to transform (if data not provided directly)
            data: Series data to transform (overrides data_name if provided)
            params: Parameters for the transformation
            
        Returns:
            Transformed data as pd.Series
        """
        # Get data from name if not provided directly
        if data is None and data_name is not None:
            if data_name in self.test_data:
                data = self.test_data[data_name]["series"]
            else:
                raise ValueError(f"Test data '{data_name}' not found")
        
        if data is None:
            raise ValueError("Either data or data_name must be provided")
        
        # Apply the transformation
        result = TransformationRegistry.apply_transformation(
            transformation_name,
            data,
            params or {}
        )
        
        return result
    
    def get_transformation(self, name: str) -> Optional[Dict[str, Any]]:
        """
        Get a transformation by name.
        
        Args:
            name: Name of the transformation
            
        Returns:
            Transformation info or None if not found
        """
        return TransformationRegistry.get_transformation(name)
    
    def get_all_transformations(self) -> List[Dict[str, Any]]:
        """
        Get all registered transformations.
        
        Returns:
            List of all transformation infos
        """
        return TransformationRegistry.get_all_transformations()
    
    def get_transformations_for_type(self, data_type: str) -> List[Dict[str, Any]]:
        """
        Get transformations that support the given data type.
        
        Args:
            data_type: Data type to filter by
            
        Returns:
            List of transformation infos that support the data type
        """
        return TransformationRegistry.get_transformations_for_type(data_type)
    
    def generate_test_params(self, transformation_name: str) -> Dict[str, Any]:
        """
        Generate test parameters for a transformation.
        
        Args:
            transformation_name: Name of the transformation
            
        Returns:
            Dict of test parameters based on the transformation's parameter definitions
        """
        transformation = self.get_transformation(transformation_name)
        if not transformation:
            return {}
        
        params = {}
        for param_def in transformation.get("params", []):
            # Get the default value or generate a test value based on type
            if "default" in param_def:
                params[param_def["name"]] = param_def["default"]
            elif param_def.get("type") == "string":
                params[param_def["name"]] = f"test_{param_def['name']}"
            elif param_def.get("type") == "number":
                params[param_def["name"]] = 42
            elif param_def.get("type") == "boolean":
                params[param_def["name"]] = True
            elif param_def.get("type") == "object":
                params[param_def["name"]] = {"key1": "value1", "key2": "value2"}
            else:
                params[param_def["name"]] = "default"
        
        return params
    
    def verify_transformation_behavior(
        self, 
        transformation_name: str,
        test_cases: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Verify a transformation behaves as expected for a set of test cases.
        
        Args:
            transformation_name: Name of the transformation to test
            test_cases: List of test cases, each containing:
                         - input: Input value or Series
                         - params: Parameters for the transformation
                         - expected: Expected output value or validation function
            
        Returns:
            Dict with test results
        """
        results = {
            "transformation": transformation_name,
            "total_tests": len(test_cases),
            "passed": 0,
            "failed": 0,
            "failures": []
        }
        
        for i, test_case in enumerate(test_cases):
            input_data = test_case.get("input")
            params = test_case.get("params", {})
            expected = test_case.get("expected")
            
            # Convert input to Series if it's not already
            if not isinstance(input_data, pd.Series):
                input_data = pd.Series([input_data])
            
            # Apply transformation
            try:
                output = self.apply_transformation(
                    transformation_name,
                    data=input_data,
                    params=params
                )
                
                # Validate output
                if callable(expected):
                    # Use validation function
                    is_valid = expected(output)
                    if is_valid:
                        results["passed"] += 1
                    else:
                        results["failed"] += 1
                        results["failures"].append({
                            "test_case": i,
                            "input": input_data.iloc[0] if len(input_data) == 1 else input_data.tolist(),
                            "params": params,
                            "output": output.iloc[0] if len(output) == 1 else output.tolist(),
                            "expected": "custom validation"
                        })
                else:
                    # Compare with expected value
                    if isinstance(expected, list) or isinstance(expected, pd.Series):
                        # Compare entire series
                        if output.equals(pd.Series(expected)):
                            results["passed"] += 1
                        else:
                            results["failed"] += 1
                            results["failures"].append({
                                "test_case": i,
                                "input": input_data.tolist(),
                                "params": params,
                                "output": output.tolist(),
                                "expected": expected
                            })
                    else:
                        # Compare first value
                        if len(output) > 0 and output.iloc[0] == expected:
                            results["passed"] += 1
                        else:
                            results["failed"] += 1
                            results["failures"].append({
                                "test_case": i,
                                "input": input_data.iloc[0] if len(input_data) == 1 else input_data.tolist(),
                                "params": params,
                                "output": output.iloc[0] if len(output) > 0 else None,
                                "expected": expected
                            })
            except Exception as e:
                results["failed"] += 1
                results["failures"].append({
                    "test_case": i,
                    "input": input_data.iloc[0] if len(input_data) == 1 else input_data.tolist(),
                    "params": params,
                    "error": str(e)
                })
        
        return results
    
    def reset(self):
        """Reset the adapter to its initial state."""
        # Restore original transformations
        TransformationRegistry._transformations = self.original_transformations.copy()
        
        # Clear test data
        self.test_data = {}
        self.test_transformations = {}