"""
Transformation Registry

This module provides a registry for data transformations that can be applied
to fields when mapping between source and destination.
"""

from typing import Dict, Any, Callable, Optional, List, Set, Union
import pandas as pd
import re
import numpy as np
from datetime import datetime

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
        """Get a transformation by name"""
        return cls._transformations.get(name)
    
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
        """
        transformation = cls.get_transformation(name)
        if not transformation:
            # Default to direct/identity transformation
            return data
            
        # Apply the transformation function
        return transformation["function"](data, params or {})
    
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
        """Get transformations that support the given data type"""
        return [
            {
                "name": info["name"],
                "description": info["description"],
                "params": info["params"]
            }
            for info in cls._transformations.values()
            if data_type in info["supported_types"]
        ]


# Register built-in transformations

@TransformationRegistry.register(
    name="direct",
    description="Pass the value through unchanged"
)
def direct_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """Identity transformation"""
    return data


@TransformationRegistry.register(
    name="uppercase",
    description="Convert text to UPPERCASE",
    supported_types=["string"]
)
def uppercase_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """Convert to uppercase"""
    return data.astype(str).str.upper()


@TransformationRegistry.register(
    name="lowercase",
    description="Convert text to lowercase",
    supported_types=["string"]
)
def lowercase_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """Convert to lowercase"""
    return data.astype(str).str.lower()


@TransformationRegistry.register(
    name="trim",
    description="Remove whitespace from the beginning and end",
    supported_types=["string"]
)
def trim_transform(data: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """Trim whitespace"""
    return data.astype(str).str.strip()


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
    """Format a date"""
    date_format = params.get("format", "%Y-%m-%d")
    return pd.to_datetime(data).dt.strftime(date_format)


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
    """Concatenate with another field"""
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
    """Format a number"""
    decimals = params.get("decimals", 2)
    prefix = params.get("prefix", "")
    suffix = params.get("suffix", "")
    
    # Format the number to fixed precision
    formatted = data.round(decimals).astype(str)
    
    # Add prefix and suffix
    return prefix + formatted + suffix


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
    """Replace text in strings"""
    find = params.get("find", "")
    replace = params.get("replace", "")
    use_regex = params.get("regex", False)
    
    if not find:
        return data
    
    if use_regex:
        return data.astype(str).str.replace(find, replace, regex=True)
    else:
        return data.astype(str).str.replace(find, replace, regex=False)


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
    """Split string and select a part"""
    delimiter = params.get("delimiter", ",")
    index = params.get("index", 0)
    
    # Split the string and get the specified part
    return data.astype(str).str.split(delimiter).str[index]


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
    """Apply conditional transformation"""
    condition = params.get("condition", "")
    true_value = params.get("true_value", "")
    false_value = params.get("false_value", "")
    
    if not condition:
        return data
    
    # Parse the condition
    match = re.match(r'([<>=!]+)\s*(.+)', condition)
    if not match:
        return data
    
    operator, compare_value = match.groups()
    
    # Convert compare_value to appropriate type
    try:
        if compare_value.isdigit():
            compare_value = int(compare_value)
        elif re.match(r'^-?\d+(\.\d+)?$', compare_value):
            compare_value = float(compare_value)
    except:
        pass
    
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
        return data
    
    # Apply the transformation
    result = pd.Series(index=data.index, dtype=object)
    result[mask] = true_value
    result[~mask] = false_value
    return result


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
    """Mask sensitive information"""
    mask_char = params.get("mask_char", "*")
    show_first = params.get("show_first", 0)
    show_last = params.get("show_last", 0)
    
    def mask_string(s):
        if not isinstance(s, str):
            return s
        s_len = len(s)
        if s_len <= show_first + show_last:
            return s
        
        masked_len = s_len - show_first - show_last
        return s[:show_first] + mask_char * masked_len + s[-show_last:] if show_last > 0 else s[:show_first] + mask_char * masked_len
    
    return data.apply(mask_string)


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
    """Extract text using regex"""
    pattern = params.get("pattern", "")
    group = params.get("group", 1)
    
    if not pattern:
        return data
    
    def extract_group(s):
        if not isinstance(s, str):
            return s
        match = re.search(pattern, s)
        if not match:
            return ""
        try:
            return match.group(group)
        except IndexError:
            return ""
    
    return data.apply(extract_group)


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
    """Perform math operation"""
    operation = params.get("operation", "")
    value = params.get("value", 0)
    
    # Ensure data is numeric
    numeric_data = pd.to_numeric(data, errors='coerce')
    
    if operation == "add":
        return numeric_data + value
    elif operation == "subtract":
        return numeric_data - value
    elif operation == "multiply":
        return numeric_data * value
    elif operation == "divide" and value != 0:
        return numeric_data / value
    else:
        return data


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
    """Look up values in a mapping"""
    mapping = params.get("mapping", {})
    default_value = params.get("default_value", "")
    
    if not mapping:
        return data
    
    def lookup_value(val):
        return mapping.get(str(val), default_value)
    
    return data.apply(lookup_value)


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
    """Extract data from JSON"""
    import json
    path = params.get("path", "")
    default_value = params.get("default_value", "")
    
    if not path:
        return data
    
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
        except:
            return default_value
    
    return data.apply(extract_json_path)


# Additional transformations can be registered here
# or in other modules using the TransformationRegistry.register decorator