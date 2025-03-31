"""
Transformation Registry Optimized Tests

This module contains optimized tests for the transformation_registry module
using the adapter pattern.
"""

import pytest
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from unittest.mock import MagicMock, patch

from utils.transformation_registry import TransformationRegistry
from test_adapters import EntityRegistry


class TestTransformationRegistryOptimized:
    """
    Optimized tests for the TransformationRegistry using the adapter pattern.
    
    These tests use the TransformationRegistryTestAdapter to test the
    TransformationRegistry functionality in a standardized way.
    """
    
    def test_registry_integration(self, entity_registry, transformation_registry_adapter):
        """Test integration with entity registry."""
        # Create test data
        string_data = transformation_registry_adapter.create_test_data(
            name="test_strings", 
            data_type="string", 
            values=["test1", "Test2", "TEST3"]
        )
        
        # Register a test transformation
        transformation = transformation_registry_adapter.register_test_transformation(
            name="test_transform",
            description="Test transformation for entity registry integration",
            supported_types=["string"],
            params=[{"name": "prefix", "type": "string", "default": "PREFIX_"}],
            function=lambda data, params: params.get("prefix", "") + data.astype(str)
        )
        
        # Verify transformation was registered in the adapter
        assert "test_transform" in transformation_registry_adapter.test_transformations
        
        # Verify entity was registered in the registry
        entity = entity_registry.get_entity("TestTransformation", "test_transform")
        assert entity is not None
        assert entity["name"] == "test_transform"
        assert entity["description"] == "Test transformation for entity registry integration"
        
        # Apply the transformation and verify result
        result = transformation_registry_adapter.apply_transformation(
            "test_transform", 
            data_name="test_strings",
            params={"prefix": "PREFIX_"}
        )
        
        assert result[0] == "PREFIX_test1"
        assert result[1] == "PREFIX_Test2"
        assert result[2] == "PREFIX_TEST3"
    
    def test_create_test_data(self, transformation_registry_adapter):
        """Test creating test data with the adapter."""
        # Create string test data
        string_data = transformation_registry_adapter.create_test_data(
            name="test_strings", 
            data_type="string"
        )
        assert len(string_data) > 0
        assert string_data.name == "test_strings"
        assert isinstance(string_data[0], str)
        
        # Create number test data
        number_data = transformation_registry_adapter.create_test_data(
            name="test_numbers",

            data_type="number"
        )
        assert len(number_data) > 0
        assert number_data.name == "test_numbers"
        assert isinstance(number_data[0], (int, float))
        
        # Create datetime test data
        datetime_data = transformation_registry_adapter.create_test_data(
            name="test_dates", 
            data_type="datetime"
        )
        assert len(datetime_data) > 0
        assert datetime_data.name == "test_dates"
        
        # Create custom test data
        custom_data = transformation_registry_adapter.create_test_data(
            name="custom_data",
            data_type="string",
            values=["apple", "banana", "cherry"]
        )
        assert len(custom_data) == 3
        assert custom_data[0] == "apple"
        assert custom_data[1] == "banana"
        assert custom_data[2] == "cherry"
    
    def test_register_test_transformation(self, transformation_registry_adapter):
        """Test registering a test transformation with the adapter."""
        # Register a simple transformation
        transformation = transformation_registry_adapter.register_test_transformation(
            name="simple_transform",
            description="A simple test transformation"
        )
        
        # Verify the transformation was registered properly
        assert transformation is not None
        assert transformation["name"] == "simple_transform"
        assert transformation["description"] == "A simple test transformation"
        
        # Register a more complex transformation
        complex_transformation = transformation_registry_adapter.register_test_transformation(
            name="complex_transform",
            description="A more complex test transformation",
            supported_types=["number"],
            params=[
                {"name": "factor", "type": "number", "default": 2},
                {"name": "offset", "type": "number", "default": 0}
            ],
            function=lambda data, params: data * params.get("factor", 2) + params.get("offset", 0)
        )
        
        # Verify the complex transformation
        assert complex_transformation is not None
        assert complex_transformation["name"] == "complex_transform"
        assert complex_transformation["description"] == "A more complex test transformation"
        assert complex_transformation["supported_types"] == ["number"]
        assert len(complex_transformation["params"]) == 2
        
        # Verify the transformations are in the adapter's tracking
        assert "simple_transform" in transformation_registry_adapter.test_transformations
        assert "complex_transform" in transformation_registry_adapter.test_transformations
    
    def test_apply_transformation_with_adapter(self, transformation_registry_adapter):
        """Test applying transformations using the adapter."""
        # Create test data
        string_data = transformation_registry_adapter.create_test_data(
            name="test_strings", 
            data_type="string", 
            values=["test1", "Test2", "TEST3"]
        )
        
        # Test with built-in uppercase transformation
        upper_result = transformation_registry_adapter.apply_transformation(
            "uppercase", 
            data_name="test_strings"
        )
        assert upper_result[0] == "TEST1"
        assert upper_result[1] == "TEST2"
        assert upper_result[2] == "TEST3"
        
        # Test with built-in lowercase transformation
        lower_result = transformation_registry_adapter.apply_transformation(
            "lowercase", 
            data_name="test_strings"
        )
        assert lower_result[0] == "test1"
        assert lower_result[1] == "test2"
        assert lower_result[2] == "test3"
        
        # Register and test a custom transformation
        transformation_registry_adapter.register_test_transformation(
            name="append_text",
            description="Append text to strings",
            supported_types=["string"],
            params=[{"name": "suffix", "type": "string", "default": "_SUFFIX"}],
            function=lambda data, params: data.astype(str) + params.get("suffix", "_SUFFIX")
        )
        
        append_result = transformation_registry_adapter.apply_transformation(
            "append_text", 
            data_name="test_strings",
            params={"suffix": "_CUSTOM"}
        )
        assert append_result[0] == "test1_CUSTOM"
        assert append_result[1] == "Test2_CUSTOM"
        assert append_result[2] == "TEST3_CUSTOM"
    
    def test_custom_parameters_generation(self, transformation_registry_adapter):
        """Test generating test parameters for transformations."""
        # Get parameters for a built-in transformation
        format_date_params = transformation_registry_adapter.generate_test_params("format_date")
        assert "format" in format_date_params
        
        # Register a custom transformation with complex parameters
        transformation_registry_adapter.register_test_transformation(
            name="complex_params",
            description="Transformation with complex parameters",
            params=[
                {"name": "string_param", "type": "string"},
                {"name": "number_param", "type": "number"},
                {"name": "boolean_param", "type": "boolean"},
                {"name": "object_param", "type": "object"},
                {"name": "with_default", "type": "string", "default": "default_value"}
            ]
        )
        
        # Generate test parameters
        params = transformation_registry_adapter.generate_test_params("complex_params")
        
        # Verify all parameter types were handled correctly
        assert "string_param" in params
        assert isinstance(params["string_param"], str)
        
        assert "number_param" in params
        assert isinstance(params["number_param"], int)
        
        assert "boolean_param" in params
        assert isinstance(params["boolean_param"], bool)
        
        assert "object_param" in params
        assert isinstance(params["object_param"], dict)
        
        # Default values should be preserved
        assert params["with_default"] == "default_value"
    
    def test_verification_of_transformation_behavior(self, transformation_registry_adapter):
        """Test verifying transformation behavior with the adapter."""
        # Register a test transformation that doubles values
        transformation_registry_adapter.register_test_transformation(
            name="double",
            description="Double numeric values",
            supported_types=["number"],
            function=lambda data, params: data * 2
        )
        
        # Create test cases for verification
        test_cases = [
            {"input": 5, "expected": 10},
            {"input": 0, "expected": 0},
            {"input": -3, "expected": -6},
            {"input": pd.Series([1, 2, 3]), "expected": [2, 4, 6]},
            {"input": 4, "expected": lambda x: x.iloc[0] > 0}  # Custom validation function
        ]
        
        # Verify the transformation behavior
        results = transformation_registry_adapter.verify_transformation_behavior("double", test_cases)
        
        # Check the verification results
        assert results["transformation"] == "double"
        assert results["total_tests"] == 5
        assert results["passed"] == 5
        assert results["failed"] == 0
        
        # Test with failing test cases
        failing_tests = [
            {"input": 5, "expected": 0},  # Should fail
            {"input": 10, "expected": 20}  # Should pass
        ]
        
        fail_results = transformation_registry_adapter.verify_transformation_behavior("double", failing_tests)
        assert fail_results["total_tests"] == 2
        assert fail_results["passed"] == 1
        assert fail_results["failed"] == 1
    
    def test_builtin_transformations(self, transformation_registry_adapter):
        """Test various built-in transformations through the adapter."""
        # Create test data for different types
        strings = transformation_registry_adapter.create_test_data(
            name="strings",
            data_type="string",
            values=["Text", "MiXeD", " spaced ", "123"]
        )
        
        numbers = transformation_registry_adapter.create_test_data(
            name="numbers",
            data_type="number",
            values=[1.23, 45.67, 0, -12.34]
        )
        
        dates = transformation_registry_adapter.create_test_data(
            name="dates",
            data_type="datetime",
            values=pd.date_range(start="2023-01-01", periods=4).tolist()
        )
        
        # Test trim transformation
        trim_result = transformation_registry_adapter.apply_transformation(
            "trim", data_name="strings"
        )
        assert trim_result[2] == "spaced"
        
        # Test number_format transformation
        format_result = transformation_registry_adapter.apply_transformation(
            "number_format", 
            data_name="numbers",
            params={"decimals": 1, "prefix": "Value: ", "suffix": " units"}
        )
        assert format_result[0] == "Value: 1.2 units"
        assert format_result[1] == "Value: 45.7 units"
        
        # Test format_date transformation
        date_result = transformation_registry_adapter.apply_transformation(
            "format_date", 
            data_name="dates",
            params={"format": "%B %d, %Y"}
        )
        assert "January 01, 2023" in date_result.values
    
    def test_advanced_transformations(self, transformation_registry_adapter):
        """Test more advanced transformations and chaining."""
        # Create test data
        data = transformation_registry_adapter.create_test_data(
            name="advanced_test",
            data_type="string",
            values=["user1,John,Smith", "user2,Jane,Doe", "user3,Bob,Jones"]
        )
        
        # Split to get first column
        split_result = transformation_registry_adapter.apply_transformation(
            "split", 
            data_name="advanced_test",
            params={"delimiter": ",", "index": 0}
        )
        assert split_result[0] == "user1"
        assert split_result[1] == "user2"
        assert split_result[2] == "user3"
        
        # Now chain transformations manually - split and then uppercase
        # First split
        first_names = transformation_registry_adapter.apply_transformation(
            "split", 
            data_name="advanced_test",
            params={"delimiter": ",", "index": 1}
        )
        
        # Then uppercase
        upper_names = transformation_registry_adapter.apply_transformation(
            "uppercase", 
            data=first_names
        )
        
        assert upper_names[0] == "JOHN"
        assert upper_names[1] == "JANE"
        assert upper_names[2] == "BOB"
    
    def test_reset_functionality(self, transformation_registry_adapter):
        """Test the adapter's reset functionality."""
        # Get the count of original transformations
        original_count = len(TransformationRegistry.get_all_transformations())
        
        # Add some test transformations
        for i in range(5):
            transformation_registry_adapter.register_test_transformation(
                name=f"test_transform_{i}",
                description=f"Test transformation {i}"
            )
        
        # Verify the transformations were added
        new_count = len(TransformationRegistry.get_all_transformations())
        assert new_count == original_count + 5
        
        # Reset the adapter
        transformation_registry_adapter.reset()
        
        # Verify the transformations were removed
        reset_count = len(TransformationRegistry.get_all_transformations())
        assert reset_count == original_count
        
        # Verify the test data was cleared
        assert len(transformation_registry_adapter.test_data) == 0
        assert len(transformation_registry_adapter.test_transformations) == 0
    
    def test_integration_with_entity_changes(self, entity_registry, transformation_registry_adapter):
        """Test integration with entity registry change events."""
        # Register a test entity through the registry
        entity_registry.register_entity("TestData", "external_data", {
            "name": "external_data",
            "data_type": "string",
            "values": ["apple", "banana", "cherry"]
        })
        
        # Verify the adapter receives and handles the entity data
        # Since we're not implementing the event handler for entity changes in this test,
        # we'll just verify we can register entities and they appear in the registry
        entity = entity_registry.get_entity("TestData", "external_data")
        assert entity is not None
        assert entity["name"] == "external_data"
        assert entity["data_type"] == "string"
        
        # Register a transformation through the adapter
        transformation_registry_adapter.register_test_transformation(
            name="entity_test_transform",
            description="Test transformation for entity integration"
        )
        
        # Verify it appears in the registry
        entity = entity_registry.get_entity("TestTransformation", "entity_test_transform")
        assert entity is not None
        assert entity["name"] == "entity_test_transform"
        assert entity["description"] == "Test transformation for entity integration"