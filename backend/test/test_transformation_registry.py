"""
Transformation Registry Tests

This module contains tests for the transformation_registry module.
"""

import pytest
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from unittest.mock import MagicMock

from utils.transformation_registry import TransformationRegistry


class TestTransformationRegistry:
    """Tests for the TransformationRegistry class."""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Set up test environment."""
        # Store original transformations to restore later
        self.original_transformations = TransformationRegistry._transformations.copy()
        yield
        # Restore original transformations after each test
        TransformationRegistry._transformations = self.original_transformations.copy()
    
    def test_register_transformation(self):
        """Test registering a new transformation."""
        # Register a test transformation
        @TransformationRegistry.register(
            name="test_transform",
            description="Test transformation",
            supported_types=["string"],
            params=[{"name": "test_param", "type": "string"}]
        )
        def test_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
            return data
        
        # Verify transformation was registered
        transform = TransformationRegistry.get_transformation("test_transform")
        assert transform is not None
        assert transform["name"] == "test_transform"
        assert transform["description"] == "Test transformation"
        assert transform["supported_types"] == ["string"]
        assert len(transform["params"]) == 1
        assert transform["params"][0]["name"] == "test_param"
    
    def test_get_transformation(self):
        """Test getting a transformation by name."""
        # Get a built-in transformation
        transform = TransformationRegistry.get_transformation("uppercase")
        assert transform is not None
        assert transform["name"] == "uppercase"
        assert transform["description"] == "Convert text to UPPERCASE"
        assert "string" in transform["supported_types"]
        
        # Get a non-existent transformation
        transform = TransformationRegistry.get_transformation("non_existent")
        assert transform is None
    
    def test_get_all_transformations(self):
        """Test getting all registered transformations."""
        transformations = TransformationRegistry.get_all_transformations()
        assert len(transformations) > 0
        
        # Verify some built-in transformations are included
        names = [t["name"] for t in transformations]
        assert "direct" in names
        assert "uppercase" in names
        assert "lowercase" in names
    
    def test_get_transformations_for_type(self):
        """Test getting transformations for a specific data type."""
        # Get string transformations
        string_transforms = TransformationRegistry.get_transformations_for_type("string")
        assert len(string_transforms) > 0
        
        # All string transformations should support "string" type
        for transform in string_transforms:
            t = TransformationRegistry.get_transformation(transform["name"])
            assert "string" in t["supported_types"]
        
        # Get number transformations
        number_transforms = TransformationRegistry.get_transformations_for_type("number")
        assert len(number_transforms) > 0
        
        # All number transformations should support "number" type
        for transform in number_transforms:
            t = TransformationRegistry.get_transformation(transform["name"])
            assert "number" in t["supported_types"]
    
    def test_apply_transformation_direct(self):
        """Test applying direct transformation."""
        data = pd.Series(["test1", "test2", "test3"])
        result = TransformationRegistry.apply_transformation("direct", data)
        
        # Direct transformation should return the data unchanged
        assert result.equals(data)
    
    def test_apply_transformation_uppercase(self):
        """Test applying uppercase transformation."""
        data = pd.Series(["test1", "Test2", "TEST3"])
        result = TransformationRegistry.apply_transformation("uppercase", data)
        
        # Uppercase transformation should convert all text to uppercase
        assert result[0] == "TEST1"
        assert result[1] == "TEST2"
        assert result[2] == "TEST3"
    
    def test_apply_transformation_lowercase(self):
        """Test applying lowercase transformation."""
        data = pd.Series(["test1", "Test2", "TEST3"])
        result = TransformationRegistry.apply_transformation("lowercase", data)
        
        # Lowercase transformation should convert all text to lowercase
        assert result[0] == "test1"
        assert result[1] == "test2"
        assert result[2] == "test3"
    
    def test_apply_transformation_trim(self):
        """Test applying trim transformation."""
        data = pd.Series([" test1 ", "  Test2", "TEST3  "])
        result = TransformationRegistry.apply_transformation("trim", data)
        
        # Trim transformation should remove whitespace from the beginning and end
        assert result[0] == "test1"
        assert result[1] == "Test2"
        assert result[2] == "TEST3"
    
    def test_apply_transformation_format_date(self):
        """Test applying format_date transformation."""
        dates = pd.Series(["2023-01-01", "2023-02-15", "2023-12-31"])
        result = TransformationRegistry.apply_transformation(
            "format_date", 
            dates,
            {"format": "%m/%d/%Y"}
        )
        
        # Format date transformation should format the dates according to the specified format
        assert result[0] == "01/01/2023"
        assert result[1] == "02/15/2023"
        assert result[2] == "12/31/2023"
    
    def test_apply_transformation_replace(self):
        """Test applying replace transformation."""
        data = pd.Series(["test1", "test2", "test3"])
        result = TransformationRegistry.apply_transformation(
            "replace",
            data,
            {"find": "test", "replace": "replaced"}
        )
        
        # Replace transformation should replace the specified text
        assert result[0] == "replaced1"
        assert result[1] == "replaced2"
        assert result[2] == "replaced3"
    
    def test_apply_transformation_split(self):
        """Test applying split transformation."""
        data = pd.Series(["a,b,c", "d,e,f", "g,h,i"])
        result = TransformationRegistry.apply_transformation(
            "split",
            data,
            {"delimiter": ",", "index": 1}
        )
        
        # Split transformation should split the text and select the specified part
        assert result[0] == "b"
        assert result[1] == "e"
        assert result[2] == "h"
    
    def test_apply_transformation_number_format(self):
        """Test applying number_format transformation."""
        data = pd.Series([1.2345, 2.5, 3.7])
        result = TransformationRegistry.apply_transformation(
            "number_format",
            data,
            {"decimals": 1, "prefix": "$", "suffix": "%"}
        )
        
        # Number format transformation should format numbers with the specified options
        assert result[0] == "$1.2%"
        assert result[1] == "$2.5%"
        assert result[2] == "$3.7%"
    
    def test_apply_transformation_conditional(self):
        """Test applying conditional transformation."""
        data = pd.Series([5, 10, 15, 20, 25])
        result = TransformationRegistry.apply_transformation(
            "conditional",
            data,
            {"condition": "> 15", "true_value": "High", "false_value": "Low"}
        )
        
        # Conditional transformation should apply the condition
        assert result[0] == "Low"  # 5 <= 15
        assert result[1] == "Low"  # 10 <= 15
        assert result[2] == "Low"  # 15 <= 15
        assert result[3] == "High"  # 20 > 15
        assert result[4] == "High"  # 25 > 15
    
    def test_apply_transformation_mask(self):
        """Test applying mask transformation."""
        data = pd.Series(["1234567890", "ABC123", "secret"])
        result = TransformationRegistry.apply_transformation(
            "mask",
            data,
            {"mask_char": "*", "show_first": 2, "show_last": 2}
        )
        
        # Mask transformation should mask the specified portion of the text
        assert result[0] == "12******90"
        assert result[1] == "AB**23"
        assert result[2] == "se**et"  # Only 2 asterisks because length is only 6
    
    def test_apply_transformation_extract_regex(self):
        """Test applying extract_regex transformation."""
        data = pd.Series(["ABC-123", "DEF-456", "GHI-789"])
        result = TransformationRegistry.apply_transformation(
            "extract_regex",
            data,
            {"pattern": r"([A-Z]+)-(\d+)", "group": 2}
        )
        
        # Extract regex transformation should extract the specified group
        assert result[0] == "123"
        assert result[1] == "456"
        assert result[2] == "789"
    
    def test_apply_transformation_math_operation(self):
        """Test applying math_operation transformation."""
        data = pd.Series([1, 2, 3, 4, 5])
        
        # Test add operation
        add_result = TransformationRegistry.apply_transformation(
            "math_operation",
            data,
            {"operation": "add", "value": 10}
        )
        assert add_result[0] == 11
        assert add_result[4] == 15
        
        # Test multiply operation
        multiply_result = TransformationRegistry.apply_transformation(
            "math_operation",
            data,
            {"operation": "multiply", "value": 2}
        )
        assert multiply_result[0] == 2
        assert multiply_result[4] == 10
    
    def test_apply_transformation_lookup(self):
        """Test applying lookup transformation."""
        data = pd.Series(["A", "B", "C", "D", "E"])
        result = TransformationRegistry.apply_transformation(
            "lookup",
            data,
            {
                "mapping": {
                    "A": "Alpha",
                    "B": "Bravo",
                    "C": "Charlie",
                    "D": "Delta"
                },
                "default_value": "Unknown"
            }
        )
        
        # Lookup transformation should map values according to the mapping
        assert result[0] == "Alpha"
        assert result[1] == "Bravo"
        assert result[2] == "Charlie"
        assert result[3] == "Delta"
        assert result[4] == "Unknown"  # Not in mapping, use default
    
    def test_apply_transformation_parse_json(self):
        """Test applying parse_json transformation."""
        data = pd.Series([
            '{"user": {"name": "John", "age": 30}}',
            '{"user": {"name": "Jane", "age": 25}}',
            '{}'  # Empty object
        ])
        result = TransformationRegistry.apply_transformation(
            "parse_json",
            data,
            {"path": "user.name", "default_value": "Unknown"}
        )
        
        # Parse JSON transformation should extract the specified path
        assert result[0] == "John"
        assert result[1] == "Jane"
        assert result[2] == "Unknown"  # Path not found, use default
    
    def test_apply_transformation_nonexistent(self):
        """Test applying a non-existent transformation."""
        data = pd.Series(["test1", "test2", "test3"])
        result = TransformationRegistry.apply_transformation("non_existent", data)
        
        # Non-existent transformation should return the data unchanged (direct transformation)
        assert result.equals(data)
    
    def test_custom_transformation(self):
        """Test creating and applying a custom transformation."""
        # Define a custom transformation function
        def double_values(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
            return data * 2
        
        # Register the custom transformation
        @TransformationRegistry.register(
            name="double",
            description="Double numeric values",
            supported_types=["number"]
        )
        def double_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
            return double_values(data, params)
        
        # Apply the transformation
        data = pd.Series([1, 2, 3, 4, 5])
        result = TransformationRegistry.apply_transformation("double", data)
        
        # Verify the result
        assert result[0] == 2
        assert result[1] == 4
        assert result[2] == 6
        assert result[3] == 8
        assert result[4] == 10