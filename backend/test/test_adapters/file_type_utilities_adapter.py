"""
File Type Utilities Test Adapter

This module provides a test adapter for file type utilities, supporting the storage
workflow E2E tests in the Integration Platform.
"""

import io
import csv
import json
import yaml
import logging
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Union, BinaryIO
from .entity_registry import BaseTestAdapter

# Set up logging
logger = logging.getLogger("file_type_utilities_adapter")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)


class FileTypeUtilitiesAdapter(BaseTestAdapter):
    """
    Test adapter for file type utilities.
    
    This adapter provides methods to work with file types, detect formats,
    and process file contents.
    """
    
    def __init__(self, registry=None):
        """
        Initialize the file type utilities adapter.
        
        Args:
            registry: Entity registry to use for tracking
        """
        super().__init__(registry)
    
    def detect_mime_type(self, file_content: str = None, file_name: str = None) -> str:
        """
        Detect the MIME type of a file.
        
        Args:
            file_content: File content as string
            file_name: File name with extension
            
        Returns:
            str: Detected MIME type
        """
        # Basic detection based on file name extension
        if file_name:
            if file_name.endswith('.csv'):
                return 'text/csv'
            elif file_name.endswith('.json'):
                return 'application/json'
            elif file_name.endswith(('.xls', '.xlsx')):
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            elif file_name.endswith('.xml'):
                return 'application/xml'
            elif file_name.endswith(('.yaml', '.yml')):
                return 'application/yaml'
            elif file_name.endswith('.txt'):
                return 'text/plain'
            elif file_name.endswith('.html'):
                return 'text/html'
        
        # Content-based detection
        if file_content:
            # Try to detect CSV
            if ',' in file_content and '\n' in file_content:
                lines = file_content.split('\n')
                if len(lines) > 1:
                    comma_counts = [line.count(',') for line in lines[:3] if line.strip()]
                    if len(set(comma_counts)) == 1 and comma_counts[0] > 0:
                        return 'text/csv'
            
            # Try to detect JSON
            if file_content.strip().startswith(('{', '[')):
                try:
                    json.loads(file_content)
                    return 'application/json'
                except:
                    pass
            
            # Try to detect XML
            if file_content.strip().startswith(('<', '<?xml')):
                if '</' in file_content:
                    return 'application/xml'
            
            # Try to detect YAML
            if file_content.strip().startswith(('---', 'apiVersion:', 'kind:')):
                try:
                    yaml.safe_load(file_content)
                    return 'application/yaml'
                except:
                    pass
        
        # Default
        return 'text/plain'
    
    def validate_file_format(self, file_content: str, mime_type: str) -> bool:
        """
        Validate if file content matches the expected MIME type format.
        
        Args:
            file_content: File content as string
            mime_type: Expected MIME type
            
        Returns:
            bool: True if valid, False otherwise
        """
        try:
            if mime_type == 'text/csv':
                try:
                    # Try to parse as CSV
                    dialect = csv.Sniffer().sniff(file_content[:4096])
                    csv.reader(io.StringIO(file_content), dialect)
                    return True
                except:
                    return False
            
            elif mime_type == 'application/json':
                try:
                    json.loads(file_content)
                    return True
                except:
                    return False
            
            elif mime_type == 'application/xml':
                # Simple check for XML structure
                if file_content.strip().startswith(('<', '<?xml')) and '</' in file_content:
                    return True
                return False
            
            elif mime_type == 'application/yaml':
                try:
                    yaml.safe_load(file_content)
                    return True
                except:
                    return False
            
            # For other types, assume valid
            return True
        
        except Exception as e:
            logger.warning(f"Error validating file format: {str(e)}")
            return False
    
    def extract_metadata(self, file_content: str, mime_type: str) -> Dict[str, Any]:
        """
        Extract metadata from file content.
        
        Args:
            file_content: File content as string
            mime_type: MIME type
            
        Returns:
            Dict[str, Any]: Extracted metadata
        """
        metadata = {
            "mime_type": mime_type,
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            # Extract basic metadata
            metadata["size"] = len(file_content)
            metadata["line_count"] = file_content.count('\n') + 1
            
            # Type-specific metadata
            if mime_type == 'text/csv':
                lines = file_content.splitlines()
                metadata["row_count"] = len(lines)
                
                if lines:
                    reader = csv.reader([lines[0]])
                    headers = next(reader)
                    metadata["column_count"] = len(headers)
                    metadata["headers"] = headers
                    
                    # Try to infer column types from first row of actual data
                    if len(lines) > 1:
                        data_reader = csv.reader([lines[1]])
                        first_row = next(data_reader)
                        column_types = []
                        
                        for value in first_row:
                            # Try to detect type
                            try:
                                int(value)
                                column_types.append("integer")
                            except:
                                try:
                                    float(value)
                                    column_types.append("number")
                                except:
                                    column_types.append("string")
                        
                        metadata["column_types"] = column_types
            
            elif mime_type == 'application/json':
                data = json.loads(file_content)
                
                if isinstance(data, dict):
                    metadata["object_type"] = "object"
                    metadata["key_count"] = len(data)
                    metadata["keys"] = list(data.keys())
                elif isinstance(data, list):
                    metadata["object_type"] = "array"
                    metadata["item_count"] = len(data)
                    
                    if data and isinstance(data[0], dict):
                        metadata["first_item_keys"] = list(data[0].keys())
            
            elif mime_type == 'application/yaml':
                data = yaml.safe_load(file_content)
                
                if isinstance(data, dict):
                    metadata["object_type"] = "object"
                    metadata["key_count"] = len(data)
                    metadata["keys"] = list(data.keys())
                elif isinstance(data, list):
                    metadata["object_type"] = "array"
                    metadata["item_count"] = len(data)
            
            return metadata
        
        except Exception as e:
            logger.warning(f"Error extracting metadata: {str(e)}")
            # Return basic metadata if extraction fails
            return metadata
    
    def convert_format(self, file_content: str, source_mime_type: str, target_mime_type: str) -> Dict[str, Any]:
        """
        Convert file from one format to another.
        
        Args:
            file_content: File content as string
            source_mime_type: Source MIME type
            target_mime_type: Target MIME type
            
        Returns:
            Dict[str, Any]: Result with converted content
        """
        try:
            # Return as-is if formats are the same
            if source_mime_type == target_mime_type:
                return {
                    "success": True,
                    "content": file_content,
                    "mime_type": target_mime_type
                }
            
            # Convert from CSV
            if source_mime_type == 'text/csv':
                df = pd.read_csv(io.StringIO(file_content))
                
                if target_mime_type == 'application/json':
                    result = df.to_json(orient='records')
                    return {
                        "success": True,
                        "content": result,
                        "mime_type": target_mime_type
                    }
                
                elif target_mime_type == 'application/yaml':
                    records = df.to_dict(orient='records')
                    result = yaml.dump(records, default_flow_style=False)
                    return {
                        "success": True,
                        "content": result,
                        "mime_type": target_mime_type
                    }
                
                elif target_mime_type == 'application/xml':
                    result = df.to_xml()
                    return {
                        "success": True,
                        "content": result,
                        "mime_type": target_mime_type
                    }
            
            # Convert from JSON
            elif source_mime_type == 'application/json':
                data = json.loads(file_content)
                
                if isinstance(data, list):
                    df = pd.DataFrame(data)
                else:
                    df = pd.DataFrame([data])
                
                if target_mime_type == 'text/csv':
                    result = df.to_csv(index=False)
                    return {
                        "success": True,
                        "content": result,
                        "mime_type": target_mime_type
                    }
                
                elif target_mime_type == 'application/yaml':
                    result = yaml.dump(data, default_flow_style=False)
                    return {
                        "success": True,
                        "content": result,
                        "mime_type": target_mime_type
                    }
                
                elif target_mime_type == 'application/xml':
                    result = df.to_xml()
                    return {
                        "success": True,
                        "content": result,
                        "mime_type": target_mime_type
                    }
            
            # Convert from YAML
            elif source_mime_type == 'application/yaml':
                data = yaml.safe_load(file_content)
                
                if target_mime_type == 'application/json':
                    result = json.dumps(data)
                    return {
                        "success": True,
                        "content": result,
                        "mime_type": target_mime_type
                    }
                
                elif target_mime_type == 'text/csv':
                    if isinstance(data, list):
                        df = pd.DataFrame(data)
                    else:
                        df = pd.DataFrame([data])
                    
                    result = df.to_csv(index=False)
                    return {
                        "success": True,
                        "content": result,
                        "mime_type": target_mime_type
                    }
            
            # Unsupported conversion
            return {
                "success": False,
                "error": f"Conversion from {source_mime_type} to {target_mime_type} is not supported"
            }
        
        except Exception as e:
            logger.error(f"Error converting format: {str(e)}")
            return {
                "success": False,
                "error": f"Format conversion failed: {str(e)}"
            }
    
    def get_file_extension(self, mime_type: str) -> str:
        """
        Get the appropriate file extension for a MIME type.
        
        Args:
            mime_type: MIME type
            
        Returns:
            str: File extension including the dot (e.g., '.txt')
        """
        extension_map = {
            'text/csv': '.csv',
            'application/json': '.json',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
            'application/xml': '.xml',
            'application/yaml': '.yaml',
            'text/plain': '.txt',
            'text/html': '.html'
        }
        
        return extension_map.get(mime_type, '.bin')
    
    def process_with_pandas(self, file_content: str, mime_type: str, operations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process file content with pandas operations.
        
        Args:
            file_content: File content as string
            mime_type: MIME type of the content
            operations: List of operations to perform
            
        Returns:
            Dict[str, Any]: Result with processed content
        """
        try:
            # Load content into DataFrame
            if mime_type == 'text/csv':
                df = pd.read_csv(io.StringIO(file_content))
            elif mime_type == 'application/json':
                df = pd.read_json(io.StringIO(file_content))
            elif mime_type == 'application/yaml':
                data = yaml.safe_load(file_content)
                if isinstance(data, list):
                    df = pd.DataFrame(data)
                else:
                    df = pd.DataFrame([data])
            else:
                return {
                    "success": False,
                    "error": f"Unsupported MIME type for pandas processing: {mime_type}"
                }
            
            # Apply operations
            for operation in operations:
                op_type = operation.get("type")
                
                if op_type == "filter":
                    column = operation.get("column")
                    value = operation.get("value")
                    operator = operation.get("operator", "==")
                    
                    if operator == "==":
                        df = df[df[column] == value]
                    elif operator == "!=":
                        df = df[df[column] != value]
                    elif operator == ">":
                        df = df[df[column] > value]
                    elif operator == ">=":
                        df = df[df[column] >= value]
                    elif operator == "<":
                        df = df[df[column] < value]
                    elif operator == "<=":
                        df = df[df[column] <= value]
                    elif operator == "in":
                        df = df[df[column].isin(value)]
                    elif operator == "not in":
                        df = df[~df[column].isin(value)]
                    elif operator == "contains":
                        df = df[df[column].str.contains(value)]
                
                elif op_type == "rename_column":
                    old_name = operation.get("old_name")
                    new_name = operation.get("new_name")
                    df = df.rename(columns={old_name: new_name})
                
                elif op_type == "add_column":
                    name = operation.get("name")
                    value = operation.get("value")
                    df[name] = value
                
                elif op_type == "drop_column":
                    column = operation.get("column")
                    df = df.drop(columns=[column])
                
                elif op_type == "sort":
                    column = operation.get("column")
                    ascending = operation.get("ascending", True)
                    df = df.sort_values(by=column, ascending=ascending)
                
                elif op_type == "transform":
                    column = operation.get("column")
                    expression = operation.get("expression")
                    
                    if expression == "upper":
                        df[column] = df[column].str.upper()
                    elif expression == "lower":
                        df[column] = df[column].str.lower()
                    elif expression == "title":
                        df[column] = df[column].str.title()
                    elif expression == "round":
                        decimals = operation.get("decimals", 0)
                        df[column] = df[column].round(decimals)
                    elif expression.startswith("*"):
                        factor = float(expression[1:])
                        df[column] = df[column] * factor
                    elif expression.startswith("+"):
                        addend = float(expression[1:])
                        df[column] = df[column] + addend
            
            # Convert back to original format
            if mime_type == 'text/csv':
                result = df.to_csv(index=False)
            elif mime_type == 'application/json':
                result = df.to_json(orient='records')
            elif mime_type == 'application/yaml':
                records = df.to_dict(orient='records')
                result = yaml.dump(records, default_flow_style=False)
            
            return {
                "success": True,
                "content": result,
                "mime_type": mime_type,
                "row_count": len(df),
                "column_count": len(df.columns)
            }
        
        except Exception as e:
            logger.error(f"Error processing with pandas: {str(e)}")
            return {
                "success": False,
                "error": f"Processing failed: {str(e)}"
            }
    
    def reset(self) -> None:
        """Reset the adapter to its initial state."""
        logger.info("File type utilities adapter reset")