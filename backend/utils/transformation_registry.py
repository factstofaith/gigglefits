"""
Transformation Registry

This module provides a registry for data transformations that can be applied
to fields when mapping between source and destination.

The registry uses a decorator-based approach to register transformation functions,
allowing for easy extension with custom transformations.

Features:
- Decorator-based registration system
- Type-safe parameter validation
- Support for various data types (string, number, datetime, etc.)
- Pandas integration for vectorized operations
- Built-in transformations for common operations
"""

from __future__ import annotations

from typing import Dict, Any, Callable, Optional, List, Set, Union, Tuple
from dataclasses import dataclass, field, asdict
import logging
import pandas as pd
import re
import numpy as np
from datetime import datetime


# Set up logging
logger = logging.getLogger(__name__)


@dataclass
class TransformationParameter:
    """Data class for transformation parameter definition"""
    name: str
    type: str
    description: str
    required: bool = False
    default: Any = None

    def validate(self, value: Any) -> Any:
        """Validate parameter value against its type"""
        if value is None:
            if self.required:
                raise ValueError(f"Parameter '{self.name}' is required")
            return self.default
        
        # Type validation
        if self.type == 'string' and not isinstance(value, str):
            value = str(value)
        elif self.type == 'number' and not isinstance(value, (int, float)):
            try:
                value = float(value)
            except (ValueError, TypeError):
                raise ValueError(f"Parameter '{self.name}' must be a number")
        elif self.type == 'boolean' and not isinstance(value, bool):
            if isinstance(value, str):
                value = value.lower() in ('true', 'yes', 'y', '1')
            else:
                value = bool(value)
        
        return value


class TransformationRegistry:
    """Registry for field transformations"""
    
    _transformations: Dict[str, Dict[str, Any]] = {}
    
    @classmethod
    def register(cls, name: str, description: str, supported_types: List[str] = None, params: List[Dict[str, Any]] = None):
        """
        Decorator to register a transformation function
        
        Args:
            name: Name of the transformation
            description: Description of what the transformation does
            supported_types: List of data types this transformation supports
            params: List of parameters the transformation accepts
        """
        def decorator(func: Callable):
            cls._transformations[name] = {
                "name": name,
                "description": description,
                "function": func,
                "supported_types": supported_types or ["string", "number", "datetime", "boolean", "array", "object"],
                "params": params or []
            }
            return func
        return decorator
    
    @classmethod
    def get_transformation(cls, name: str) -> Optional[Dict[str, Any]]:
        """
        Get a transformation by name
        
        Args:
            name: Name of the transformation to retrieve
            
        Returns:
            Optional[Dict[str, Any]]: The transformation dictionary or None if not found
        """
        return cls._transformations.get(name)
    
    @classmethod
    def validate_params(cls, name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate parameters for a transformation
        
        Args:
            name: Name of the transformation
            params: Parameters to validate
            
        Returns:
            Dict[str, Any]: Validated and normalized parameters
            
        Raises:
            ValueError: If required parameters are missing or invalid
        """
        transformation = cls.get_transformation(name)
        if not transformation:
            return params or {}
            
        validated = {}
        param_definitions = transformation.get('params', [])
        
        # Convert old-style param dicts to TransformationParameter objects
        param_objects = []
        for param_def in param_definitions:
            if isinstance(param_def, TransformationParameter):
                param_objects.append(param_def)
            else:
                # Convert dict to TransformationParameter
                param_objects.append(TransformationParameter(
                    name=param_def.get('name', ''),
                    type=param_def.get('type', 'string'),
                    description=param_def.get('description', ''),
                    required=param_def.get('required', False),
                    default=param_def.get('default', None)
                ))
        
        # Validate each parameter
        for param in param_objects:
            value = params.get(param.name) if params else None
            try:
                validated[param.name] = param.validate(value)
            except ValueError as e:
                logger.warning(f"Parameter validation error in transformation '{name}': {str(e)}")
                raise
                
        # Copy any additional parameters not defined in the schema
        if params:
            for key, value in params.items():
                if key not in validated:
                    validated[key] = value
                    
        return validated
    
    @classmethod
    def apply_transformation(
        cls, 
        name: str, 
        data: pd.Series, 
        params: Dict[str, Any] = None
    ) -> pd.Series:
        """
        Apply a transformation to a pandas Series
        
        Args:
            name: Name of the transformation
            data: Series to transform
            params: Parameters for the transformation
            
        Returns:
            Transformed Series
            
        Raises:
            ValueError: If transformation parameters are invalid
            Exception: If transformation function fails
        """
        try:
            transformation = cls.get_transformation(name)
            if not transformation:
                # Default to direct/identity transformation
                logger.debug(f"Transformation '{name}' not found, using identity transformation")
                return data
                
            # Validate and normalize parameters
            validated_params = cls.validate_params(name, params or {})
                
            # Apply the transformation function with exception handling
            logger.debug(f"Applying transformation '{name}' with parameters: {validated_params}")
            result = transformation["function"](data, validated_params)
            return result
            
        except ValueError as e:
            # Re-raise parameter validation errors
            logger.error(f"Parameter validation error in transformation '{name}': {str(e)}")
            raise
        except Exception as e:
            # Log and re-raise other errors
            logger.error(f"Error applying transformation '{name}': {str(e)}")
            raise
    
    @classmethod
    def get_all_transformations(cls) -> List[Dict[str, Any]]:
        """Get all registered transformations"""
        return [
            {
                "name": info["name"],
                "description": info["description"],
                "supported_types": info["supported_types"],
                "params": info["params"]
            }
            for info in cls._transformations.values()
        ]

    @classmethod
    def get_transformations_for_type(cls, data_type: str) -> List[Dict[str, Any]]:
        """
        Get transformations that support the given data type
        
        Args:
            data_type: Data type to filter transformations by
            
        Returns:
            List[Dict[str, Any]]: List of transformations supporting the data type
        """
        return [
            {
                "name": info["name"],
                "description": info["description"],
                "params": info["params"]
            }
            for info in cls._transformations.values()
            if data_type in info["supported_types"]
        ]
        
    @classmethod
    def serialize_transformation_config(cls, name: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Serialize a transformation configuration for storage or transmission
        
        Args:
            name: Name of the transformation
            params: Parameters for the transformation
            
        Returns:
            Dict[str, Any]: Serialized transformation configuration
        """
        transformation = cls.get_transformation(name)
        if not transformation:
            raise ValueError(f"Unknown transformation: {name}")
            
        # Validate parameters
        validated_params = cls.validate_params(name, params or {})
        
        # Create serializable config
        return {
            "name": name,
            "params": validated_params,
            "description": transformation["description"],
            "supported_types": transformation["supported_types"]
        }
        
    @classmethod
    def deserialize_transformation_config(cls, config: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """
        Deserialize a transformation configuration
        
        Args:
            config: Serialized transformation configuration
            
        Returns:
            Tuple[str, Dict[str, Any]]: Transformation name and validated parameters
            
        Raises:
            ValueError: If the configuration is invalid
        """
        name = config.get("name")
        if not name:
            raise ValueError("Missing transformation name in configuration")
            
        params = config.get("params", {})
        
        # Validate the configuration
        if not cls.get_transformation(name):
            raise ValueError(f"Unknown transformation: {name}")
            
        # Validate parameters
        validated_params = cls.validate_params(name, params)
        
        return name, validated_params


# Register built-in transformations

@TransformationRegistry.register(
    name="direct",
    description="Pass the value through unchanged"
)
def direct_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Identity transformation - passes values through unchanged
    
    Args:
        data: Series containing any values
        params: Not used for this transformation
        
    Returns:
        pd.Series: The original series, unchanged
    """
    return data


@TransformationRegistry.register(
    name="uppercase",
    description="Convert text to UPPERCASE",
    supported_types=["string"]
)
def uppercase_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Convert text values to uppercase
    
    Args:
        data: Series containing string values
        params: Not used for this transformation
        
    Returns:
        pd.Series: Uppercase string values
    """
    try:
        # Convert all values to string and then uppercase
        return data.astype(str).str.upper()
    except Exception as e:
        logger.error(f"Error in uppercase_transform: {str(e)}")
        raise ValueError(f"Failed to convert text to uppercase: {str(e)}")


@TransformationRegistry.register(
    name="lowercase",
    description="Convert text to lowercase",
    supported_types=["string"]
)
def lowercase_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Convert text values to lowercase
    
    Args:
        data: Series containing string values
        params: Not used for this transformation
        
    Returns:
        pd.Series: Lowercase string values
    """
    try:
        # Convert all values to string and then lowercase
        return data.astype(str).str.lower()
    except Exception as e:
        logger.error(f"Error in lowercase_transform: {str(e)}")
        raise ValueError(f"Failed to convert text to lowercase: {str(e)}")


@TransformationRegistry.register(
    name="trim",
    description="Remove whitespace from the beginning and end",
    supported_types=["string"]
)
def trim_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Trim whitespace from beginning and end of string values
    
    Args:
        data: Series containing string values
        params: Not used for this transformation
        
    Returns:
        pd.Series: Trimmed string values
    """
    try:
        # Convert all values to string and then trim
        return data.astype(str).str.strip()
    except Exception as e:
        logger.error(f"Error in trim_transform: {str(e)}")
        raise ValueError(f"Failed to trim whitespace: {str(e)}")


@TransformationRegistry.register(
    name="format_date",
    description="Format a date using the specified pattern",
    supported_types=["datetime", "string"],
    params=[
        {
            "name": "format",
            "type": "string",
            "description": "Date format string (e.g., '%Y-%m-%d')",
            "default": "%Y-%m-%d"
        }
    ]
)
def format_date_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Format a date according to the specified pattern
    
    Args:
        data: Series containing date values (can be strings or datetime objects)
        params: Parameters for the transformation including 'format'
        
    Returns:
        pd.Series: Formatted date strings
        
    Raises:
        ValueError: If dates cannot be parsed
    """
    try:
        date_format = params.get("format", "%Y-%m-%d")
        
        # Convert to datetime first
        datetime_series = pd.to_datetime(data, errors='coerce')
        
        # Check if we have NaT values from conversion errors
        if datetime_series.isna().any():
            na_count = datetime_series.isna().sum()
            logger.warning(f"Found {na_count} values that could not be converted to dates")
        
        # Format the dates
        return datetime_series.dt.strftime(date_format)
    
    except Exception as e:
        logger.error(f"Error in format_date_transform: {str(e)}")
        raise ValueError(f"Failed to format dates: {str(e)}")


@TransformationRegistry.register(
    name="concat",
    description="Concatenate with another field",
    supported_types=["string", "number"],
    params=[
        {
            "name": "concat_field",
            "type": "string",
            "description": "Name of the field to concatenate with",
            "required": True
        },
        {
            "name": "separator",
            "type": "string",
            "description": "Separator to use between values",
            "default": " "
        }
    ]
)
def concat_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Concatenate values with another field (handled specially in _transform_data)
    
    Args:
        data: Series containing values to concatenate
        params: Parameters including:
            - concat_field: Name of the field to concatenate with
            - separator: Separator string to use between values
            
    Returns:
        pd.Series: The original series (actual concatenation happens elsewhere)
    
    Note:
        This transformation requires access to the full DataFrame,
        which happens in the calling code, not in this function.
    """
    # This transformation requires the original DataFrame, handled specially in _transform_data
    return data


@TransformationRegistry.register(
    name="number_format",
    description="Format a number with specified precision",
    supported_types=["number"],
    params=[
        {
            "name": "decimals",
            "type": "number",
            "description": "Number of decimal places",
            "default": 2
        },
        {
            "name": "prefix",
            "type": "string",
            "description": "Prefix to add (e.g., '$')",
            "default": ""
        },
        {
            "name": "suffix",
            "type": "string",
            "description": "Suffix to add (e.g., '%')",
            "default": ""
        }
    ]
)
def number_format_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Format numbers with specified precision and optional prefix/suffix
    
    Args:
        data: Series containing numeric values
        params: Parameters for the transformation including:
            - decimals: Number of decimal places
            - prefix: String to add before the number (e.g., '$')
            - suffix: String to add after the number (e.g., '%')
        
    Returns:
        pd.Series: Formatted number strings
        
    Raises:
        ValueError: If values cannot be converted to numbers
    """
    try:
        # Extract parameters with defaults
        decimals = params.get("decimals", 2)
        prefix = params.get("prefix", "")
        suffix = params.get("suffix", "")
        
        # Convert to numeric, coercing errors to NaN
        numeric_data = pd.to_numeric(data, errors='coerce')
        
        # Check if we have NaN values from conversion errors
        if numeric_data.isna().any():
            na_count = numeric_data.isna().sum()
            logger.warning(f"Found {na_count} values that could not be converted to numbers")
        
        # Format the number to fixed precision
        formatted = numeric_data.round(decimals).astype(str)
        
        # Add prefix and suffix
        return prefix + formatted + suffix
        
    except Exception as e:
        logger.error(f"Error in number_format_transform: {str(e)}")
        raise ValueError(f"Failed to format numbers: {str(e)}")


@TransformationRegistry.register(
    name="replace",
    description="Replace text in a string",
    supported_types=["string"],
    params=[
        {
            "name": "find",
            "type": "string",
            "description": "Text to find",
            "required": True
        },
        {
            "name": "replace",
            "type": "string",
            "description": "Text to replace with",
            "required": True
        },
        {
            "name": "regex",
            "type": "boolean",
            "description": "Use regular expression matching",
            "default": False
        }
    ]
)
def replace_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Replace text in string values
    
    Args:
        data: Series containing string values
        params: Parameters for the transformation including:
            - find: Text or pattern to find
            - replace: Text to replace with
            - regex: Whether to use regex pattern matching
            
    Returns:
        pd.Series: Strings with replacements applied
        
    Raises:
        ValueError: If regex pattern is invalid
    """
    try:
        # Extract parameters
        find = params.get("find", "")
        replace = params.get("replace", "")
        use_regex = params.get("regex", False)
        
        # Validate parameters
        if not find:
            logger.warning("Empty 'find' parameter in replace_transform, returning original data")
            return data
        
        # Convert to strings
        string_data = data.astype(str)
        
        # Apply replacement
        if use_regex:
            try:
                return string_data.str.replace(find, replace, regex=True)
            except re.error as e:
                logger.error(f"Invalid regex pattern in replace_transform: {str(e)}")
                raise ValueError(f"Invalid regular expression pattern: {str(e)}")
        else:
            return string_data.str.replace(find, replace, regex=False)
            
    except Exception as e:
        if not isinstance(e, ValueError):
            logger.error(f"Error in replace_transform: {str(e)}")
            raise ValueError(f"Failed to replace text: {str(e)}")
        raise


@TransformationRegistry.register(
    name="split",
    description="Split a string and select part by index",
    supported_types=["string"],
    params=[
        {
            "name": "delimiter",
            "type": "string",
            "description": "Character to split on",
            "default": ","
        },
        {
            "name": "index",
            "type": "number",
            "description": "Index of the part to select (0-based)",
            "default": 0
        }
    ]
)
def split_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Split string values and select a part by index
    
    Args:
        data: Series containing string values
        params: Parameters for the transformation including:
            - delimiter: Character to split on
            - index: Zero-based index of the part to select
            
    Returns:
        pd.Series: Selected parts of the split strings
        
    Raises:
        ValueError: If index is out of bounds for most values
    """
    try:
        # Extract parameters
        delimiter = params.get("delimiter", ",")
        index = params.get("index", 0)
        
        # Convert to strings
        string_data = data.astype(str)
        
        # Split and select part
        result = string_data.str.split(delimiter).str[index]
        
        # Check for many None values which could indicate index out of bounds
        if result.isna().sum() > len(data) * 0.5:  # More than 50% NaN
            logger.warning(f"Index {index} is out of bounds for many strings when splitting with '{delimiter}'")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in split_transform: {str(e)}")
        raise ValueError(f"Failed to split text: {str(e)}")


@TransformationRegistry.register(
    name="conditional",
    description="Apply different transformations based on a condition",
    supported_types=["string", "number", "datetime", "boolean"],
    params=[
        {
            "name": "condition",
            "type": "string",
            "description": "Comparison operator and value (e.g., '> 100')",
            "required": True
        },
        {
            "name": "true_value",
            "type": "string",
            "description": "Value to use if condition is true",
            "required": True
        },
        {
            "name": "false_value",
            "type": "string",
            "description": "Value to use if condition is false",
            "required": True
        }
    ]
)
def conditional_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Apply conditional transformation based on value comparison
    
    Args:
        data: Series containing values to test
        params: Parameters for the transformation including:
            - condition: Comparison operator and value (e.g., '> 100')
            - true_value: Value to use if condition is true
            - false_value: Value to use if condition is false
            
    Returns:
        pd.Series: Series with values based on the condition
        
    Raises:
        ValueError: If condition syntax is invalid
    """
    try:
        # Extract parameters
        condition = params.get("condition", "")
        true_value = params.get("true_value", "")
        false_value = params.get("false_value", "")
        
        # Validate parameters
        if not condition:
            logger.warning("Empty condition in conditional_transform, returning original data")
            return data
        
        # Parse the condition
        match = re.match(r'([<>=!]+)\s*(.+)', condition)
        if not match:
            logger.error(f"Invalid condition syntax: {condition}")
            raise ValueError(f"Invalid condition syntax: {condition}")
        
        operator, compare_value = match.groups()
        
        # Convert compare_value to appropriate type
        try:
            if compare_value.isdigit():
                compare_value = int(compare_value)
            elif re.match(r'^-?\d+(\.\d+)?$', compare_value):
                compare_value = float(compare_value)
        except Exception as e:
            logger.debug(f"Could not convert comparison value to numeric: {str(e)}")
        
        # Apply the condition
        if operator == '==':
            mask = data == compare_value
        elif operator == '!=':
            mask = data != compare_value
        elif operator == '>':
            mask = data > compare_value
        elif operator == '>=':
            mask = data >= compare_value
        elif operator == '<':
            mask = data < compare_value
        elif operator == '<=':
            mask = data <= compare_value
        else:
            logger.error(f"Unsupported operator in condition: {operator}")
            raise ValueError(f"Unsupported operator: {operator}")
        
        # Apply the transformation
        result = pd.Series(index=data.index, dtype=object)
        result[mask] = true_value
        result[~mask] = false_value
        return result
        
    except Exception as e:
        if not isinstance(e, ValueError):
            logger.error(f"Error in conditional_transform: {str(e)}")
            raise ValueError(f"Failed to apply conditional transformation: {str(e)}")
        raise


@TransformationRegistry.register(
    name="mask",
    description="Mask sensitive information (e.g., for PII)",
    supported_types=["string"],
    params=[
        {
            "name": "mask_char",
            "type": "string",
            "description": "Character to use for masking",
            "default": "*"
        },
        {
            "name": "show_first",
            "type": "number",
            "description": "Number of characters to show at the beginning",
            "default": 0
        },
        {
            "name": "show_last",
            "type": "number",
            "description": "Number of characters to show at the end",
            "default": 0
        }
    ]
)
def mask_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Mask sensitive information in strings
    
    Args:
        data: Series containing string values
        params: Parameters for the transformation including:
            - mask_char: Character to use for masking (e.g., '*')
            - show_first: Number of characters to show at the beginning
            - show_last: Number of characters to show at the end
            
    Returns:
        pd.Series: Masked string values
        
    Raises:
        ValueError: If masking parameters are invalid
    """
    try:
        # Extract parameters
        mask_char = params.get("mask_char", "*")
        show_first = params.get("show_first", 0)
        show_last = params.get("show_last", 0)
        
        # Validate parameters
        if len(mask_char) != 1:
            logger.warning(f"Mask character should be a single character, got '{mask_char}'")
            mask_char = mask_char[0] if mask_char else "*"
        
        if show_first < 0:
            logger.warning(f"Invalid show_first parameter: {show_first}, using 0")
            show_first = 0
            
        if show_last < 0:
            logger.warning(f"Invalid show_last parameter: {show_last}, using 0")
            show_last = 0
        
        # Define masking function
        def mask_string(s):
            if not isinstance(s, str):
                return str(s)
                
            s_len = len(s)
            if s_len <= show_first + show_last:
                return s
            
            masked_len = s_len - show_first - show_last
            if show_last > 0:
                return s[:show_first] + mask_char * masked_len + s[-show_last:]
            else:
                return s[:show_first] + mask_char * masked_len
        
        # Apply masking
        return data.apply(mask_string)
        
    except Exception as e:
        logger.error(f"Error in mask_transform: {str(e)}")
        raise ValueError(f"Failed to mask data: {str(e)}")


@TransformationRegistry.register(
    name="extract_regex",
    description="Extract text using a regular expression",
    supported_types=["string"],
    params=[
        {
            "name": "pattern",
            "type": "string",
            "description": "Regular expression pattern with at least one capturing group",
            "required": True
        },
        {
            "name": "group",
            "type": "number",
            "description": "Capturing group to extract (0 for full match, 1 for first group, etc.)",
            "default": 1
        }
    ]
)
def extract_regex_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Extract text from strings using regular expressions
    
    Args:
        data: Series containing string values
        params: Parameters for the transformation including:
            - pattern: Regular expression pattern with capturing groups
            - group: Index of the capturing group to extract (0 for full match)
            
    Returns:
        pd.Series: Extracted string values
        
    Raises:
        ValueError: If regex pattern is invalid
    """
    try:
        # Extract parameters
        pattern = params.get("pattern", "")
        group = params.get("group", 1)
        
        # Validate parameters
        if not pattern:
            logger.warning("Empty pattern in extract_regex_transform, returning empty strings")
            return pd.Series("", index=data.index)
        
        # Pre-compile the regex to check for errors
        try:
            regex = re.compile(pattern)
        except re.error as e:
            logger.error(f"Invalid regex pattern in extract_regex_transform: {str(e)}")
            raise ValueError(f"Invalid regular expression pattern: {str(e)}")
        
        # Define extraction function
        def extract_group(s):
            if not isinstance(s, str):
                return ""
                
            match = regex.search(str(s))
            if not match:
                return ""
                
            try:
                return match.group(group)
            except IndexError:
                logger.warning(f"Group {group} not found in regex match for '{s}'")
                return ""
        
        # Apply extraction
        return data.apply(extract_group)
        
    except Exception as e:
        if not isinstance(e, ValueError):
            logger.error(f"Error in extract_regex_transform: {str(e)}")
            raise ValueError(f"Failed to extract text using regex: {str(e)}")
        raise


@TransformationRegistry.register(
    name="math_operation",
    description="Perform a mathematical operation",
    supported_types=["number"],
    params=[
        {
            "name": "operation",
            "type": "string",
            "description": "Operation to perform (add, subtract, multiply, divide)",
            "required": True,
            "enum": ["add", "subtract", "multiply", "divide"]
        },
        {
            "name": "value",
            "type": "number",
            "description": "Value to use in the operation",
            "required": True
        }
    ]
)
def math_operation_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Perform mathematical operations on numeric values
    
    Args:
        data: Series containing numeric values
        params: Parameters for the transformation including:
            - operation: Type of operation (add, subtract, multiply, divide)
            - value: Numeric value to use in the operation
            
    Returns:
        pd.Series: Result of the mathematical operation
        
    Raises:
        ValueError: If operation is invalid or division by zero
    """
    try:
        # Extract parameters
        operation = params.get("operation", "")
        value = params.get("value", 0)
        
        # Validate parameters
        if not operation:
            logger.warning("Missing operation in math_operation_transform, returning original data")
            return data
            
        if operation not in ["add", "subtract", "multiply", "divide"]:
            logger.error(f"Invalid operation: {operation}")
            raise ValueError(f"Invalid operation: {operation}")
            
        if operation == "divide" and value == 0:
            logger.error("Division by zero in math_operation_transform")
            raise ValueError("Division by zero is not allowed")
        
        # Ensure data is numeric
        numeric_data = pd.to_numeric(data, errors='coerce')
        
        # Check if we have NaN values from conversion errors
        if numeric_data.isna().any():
            na_count = numeric_data.isna().sum()
            logger.warning(f"Found {na_count} values that could not be converted to numbers")
        
        # Apply the operation
        if operation == "add":
            return numeric_data + value
        elif operation == "subtract":
            return numeric_data - value
        elif operation == "multiply":
            return numeric_data * value
        elif operation == "divide":
            return numeric_data / value
        
    except Exception as e:
        if not isinstance(e, ValueError):
            logger.error(f"Error in math_operation_transform: {str(e)}")
            raise ValueError(f"Failed to perform mathematical operation: {str(e)}")
        raise


@TransformationRegistry.register(
    name="lookup",
    description="Look up a value in a mapping table",
    supported_types=["string", "number"],
    params=[
        {
            "name": "mapping",
            "type": "object",
            "description": "Key-value mapping for lookups",
            "required": True
        },
        {
            "name": "default_value",
            "type": "string",
            "description": "Default value if not found in mapping",
            "default": ""
        }
    ]
)
def lookup_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Look up values in a key-value mapping
    
    Args:
        data: Series containing keys to look up
        params: Parameters for the transformation including:
            - mapping: Dictionary of key-value pairs for lookups
            - default_value: Value to use if key not found in mapping
            
    Returns:
        pd.Series: Looked-up values
        
    Raises:
        ValueError: If mapping is invalid
    """
    try:
        # Extract parameters
        mapping = params.get("mapping", {})
        default_value = params.get("default_value", "")
        
        # Validate parameters
        if not mapping:
            logger.warning("Empty mapping in lookup_transform, returning default value")
            return pd.Series(default_value, index=data.index)
            
        if not isinstance(mapping, dict):
            logger.error(f"Mapping must be a dictionary, got {type(mapping).__name__}")
            raise ValueError("Mapping must be a dictionary")
        
        # Convert all mapping keys to strings for consistent lookups
        string_mapping = {str(k): v for k, v in mapping.items()}
        
        # Define lookup function
        def lookup_value(val):
            return string_mapping.get(str(val), default_value)
        
        # Apply lookup
        return data.apply(lookup_value)
        
    except Exception as e:
        if not isinstance(e, ValueError):
            logger.error(f"Error in lookup_transform: {str(e)}")
            raise ValueError(f"Failed to perform lookup: {str(e)}")
        raise


@TransformationRegistry.register(
    name="parse_json",
    description="Extract a field from a JSON string",
    supported_types=["string"],
    params=[
        {
            "name": "path",
            "type": "string",
            "description": "JSON path (e.g., 'user.name', 'items[0].id')",
            "required": True
        },
        {
            "name": "default_value",
            "type": "string",
            "description": "Default value if path not found",
            "default": ""
        }
    ]
)
def parse_json_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """
    Extract fields from JSON strings
    
    Args:
        data: Series containing JSON strings
        params: Parameters for the transformation including:
            - path: Path to the field to extract (e.g., 'user.name', 'items[0].id')
            - default_value: Value to use if path not found
            
    Returns:
        pd.Series: Extracted values
        
    Raises:
        ValueError: If path is invalid
    """
    try:
        import json
        
        # Extract parameters
        path = params.get("path", "")
        default_value = params.get("default_value", "")
        
        # Validate parameters
        if not path:
            logger.warning("Empty path in parse_json_transform, returning default value")
            return pd.Series(default_value, index=data.index)
        
        # Define JSON parsing function
        def extract_json_path(json_str):
            if not isinstance(json_str, str):
                return default_value
            
            try:
                # Parse JSON
                obj = json.loads(json_str)
                
                # Navigate path
                parts = path.replace('[', '.').replace(']', '').split('.')
                for part in parts:
                    if not part:
                        continue
                        
                    if isinstance(obj, dict) and part in obj:
                        obj = obj[part]
                    elif isinstance(obj, list) and part.isdigit() and int(part) < len(obj):
                        obj = obj[int(part)]
                    else:
                        return default_value
                        
                return str(obj) if obj is not None else default_value
                
            except json.JSONDecodeError as e:
                logger.debug(f"Invalid JSON string: {str(e)}")
                return default_value
            except Exception as e:
                logger.debug(f"Error extracting JSON path: {str(e)}")
                return default_value
        
        # Apply JSON extraction
        return data.apply(extract_json_path)
        
    except Exception as e:
        logger.error(f"Error in parse_json_transform: {str(e)}")
        raise ValueError(f"Failed to parse JSON: {str(e)}")


# Additional transformations can be registered here
# or in other modules using the TransformationRegistry.register decorator