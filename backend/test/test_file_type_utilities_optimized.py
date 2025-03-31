"""
Optimized File Type Utilities Tests

This module contains optimized tests for the file_type_utilities module
using the entity registry and adapter patterns.
"""

import pytest
import os
import io
import json
import yaml
import tempfile
import pandas as pd
from PIL import Image
from unittest.mock import patch, MagicMock

from utils.file_type_utilities import (
    detect_mime_type,
    get_file_extension,
    convert_to_standard_format,
    extract_metadata,
    validate_file_format,
    load_dataframe,
    generate_unique_filename,
    FileTypeError
)

# Import test adapters
from test_adapters import FileTypeUtilitiesTestAdapter


class TestFileTypeUtilitiesOptimized:
    """
    Optimized tests for the file_type_utilities module using the adapter pattern.
    
    These tests demonstrate how to use the FileTypeUtilitiesTestAdapter for more
    maintainable and standardized file type utility tests.
    """
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, file_type_utilities_adapter):
        """Set up test environment before each test."""
        self.adapter = file_type_utilities_adapter
        
        # Create test files of different types
        self.test_files = {
            "text": self.adapter.create_test_file("text"),
            "csv": self.adapter.create_test_file("csv"),
            "json": self.adapter.create_test_file("json"),
            "xml": self.adapter.create_test_file("xml"),
            "yaml": self.adapter.create_test_file("yaml"),
            "image": self.adapter.create_test_file("image"),
            "excel": self.adapter.create_test_file("excel"),
            "binary": self.adapter.create_test_file("binary")
        }
        
        yield
        
        # Clean up
        self.adapter.reset()
    
    def test_detect_mime_type_methods(self):
        """Test the various methods for detecting MIME types."""
        for file_type, file_info in self.test_files.items():
            # Get the file ID
            file_id = next(int(id) for id, info in self.adapter.test_files.items() 
                           if info["file_data"] == file_info["file_data"])
            
            # Test detection by file data
            mime_by_data = self.adapter.detect_mime_type(file_data=file_info["file_data"])
            assert mime_by_data == file_info["mime_type"] or mime_by_data.startswith(file_info["mime_type"].split('/')[0])
            
            # Test detection by file name
            mime_by_name = self.adapter.detect_mime_type(file_name=file_info["file_name"])
            assert mime_by_name == file_info["mime_type"] or mime_by_name.startswith(file_info["mime_type"].split('/')[0])
            
            # Test detection by file ID
            if file_info["temp_path"]:
                mime_by_id = self.adapter.detect_mime_type(file_id=file_id)
                assert mime_by_id == file_info["mime_type"] or mime_by_id.startswith(file_info["mime_type"].split('/')[0])
    
    def test_get_file_extension(self):
        """Test getting file extensions from MIME types."""
        # Test with standard MIME types
        # Test common MIME types
        # Note: We're only checking that we get some extension back,
        # as different systems may map mime types to different extensions
        mime_types_to_test = [
            "text/plain",
            "text/csv",
            "application/json",
            "application/xml",
            "application/yaml",
            "image/png",
            "image/jpeg",
            "application/pdf"
        ]
        
        for mime_type in mime_types_to_test:
            extension = self.adapter.get_file_extension(mime_type)
            assert extension and isinstance(extension, str)
            assert extension.startswith(".")
        
        # Test with MIME types from our test files
        for file_type, file_info in self.test_files.items():
            extension = self.adapter.get_file_extension(file_info["mime_type"])
            assert extension and isinstance(extension, str)
            assert extension.startswith(".")
    
    def test_convert_between_formats(self):
        """Test converting files between different formats."""
        conversions = [
            ("csv", "json"),
            ("json", "csv"),
            ("json", "xml"),
            ("yaml", "json"),
            ("xml", "json")
        ]
        
        for source_type, target_format in conversions:
            # Skip if we don't have a test file for this type
            if source_type not in self.test_files:
                continue
            
            # Get the file ID
            file_id = next(int(id) for id, info in self.adapter.test_files.items() 
                          if info["file_data"] == self.test_files[source_type]["file_data"])
            
            try:
                # Convert the file
                converted_data, new_mime = self.adapter.convert_to_standard_format(file_id, target_format)
                
                # Verify conversion was successful
                assert converted_data is not None
                assert new_mime is not None
                
                # Verify MIME type is correct
                expected_mime_map = {
                    "csv": "text/csv",
                    "json": "application/json",
                    "xml": "application/xml",
                    "yaml": "application/yaml",
                    "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
                assert new_mime == expected_mime_map[target_format]
                
                # Basic validation of the converted data
                if target_format == "json":
                    # Should be valid JSON
                    json.loads(converted_data)
                elif target_format == "csv":
                    # Should contain commas and newlines
                    text = converted_data.decode("utf-8")
                    assert "," in text
                    assert "\n" in text
                elif target_format == "xml":
                    # Should start with XML declaration or root element
                    assert converted_data.startswith(b"<?xml") or b"<root" in converted_data
                elif target_format == "yaml":
                    # Should be valid YAML
                    yaml.safe_load(converted_data)
            except ValueError as e:
                # Some conversions may not be supported
                assert "not supported" in str(e)
    
    def test_extract_metadata(self):
        """Test extracting metadata from various file types."""
        for file_type, file_info in self.test_files.items():
            # Get the file ID
            file_id = next(int(id) for id, info in self.adapter.test_files.items() 
                          if info["file_data"] == file_info["file_data"])
            
            # Extract metadata
            metadata = self.adapter.extract_metadata(file_id)
            
            # Verify metadata is a dictionary
            assert isinstance(metadata, dict)
            
            # Verify specific metadata by file type
            if file_type == "image":
                assert "width" in metadata
                assert "height" in metadata
                assert "format" in metadata
            elif file_type == "csv":
                assert "delimiter" in metadata or "row_count" in metadata
            elif file_type == "json":
                assert "top_level_type" in metadata or "keys" in metadata
            elif file_type == "excel":
                assert "sheet_names" in metadata or "sheet_count" in metadata
    
    def test_validate_file_format(self):
        """Test validating file formats."""
        # Test all valid files
        for file_type, file_info in self.test_files.items():
            # Get the file ID
            file_id = next(int(id) for id, info in self.adapter.test_files.items() 
                          if info["file_data"] == file_info["file_data"])
            
            # Validate format
            result = self.adapter.validate_file_format(file_id)
            assert result is True
            
            # Test with wrong MIME type
            if file_type != "binary":  # Binary is a fallback type
                wrong_mime = "application/octet-stream" if file_info["mime_type"] != "application/octet-stream" else "text/plain"
                result = self.adapter.validate_file_format(file_id, wrong_mime)
                assert result is False
        
        # Test invalid/corrupted files
        for error_type in ["corrupt_json", "corrupt_csv", "corrupt_image", "wrong_mime_type"]:
            corrupt_file = self.adapter.simulate_file_error(error_type)
            file_id = next(int(id) for id, info in self.adapter.test_files.items() 
                          if info["file_data"] == corrupt_file["file_data"])
            
            # Validate format
            result = self.adapter.validate_file_format(file_id)
            assert result is False
    
    def test_load_dataframe(self):
        """Test loading DataFrames from various file types."""
        loadable_types = ["csv", "json", "excel", "xml", "yaml"]
        
        for file_type in loadable_types:
            if file_type not in self.test_files:
                continue
                
            # Get the file ID
            file_id = next(int(id) for id, info in self.adapter.test_files.items() 
                          if info["file_data"] == self.test_files[file_type]["file_data"])
            
            try:
                # Load DataFrame
                df = self.adapter.load_dataframe(file_id)
                
                # Verify it's a DataFrame
                assert isinstance(df, pd.DataFrame)
                
                # Verify it has data
                assert not df.empty
                
                # Basic column check for standard test files
                if file_type == "csv":
                    assert "id" in df.columns
                    assert "name" in df.columns
                    assert "value" in df.columns
            except (ValueError, FileTypeError) as e:
                # Some formats may not be directly loadable as DataFrame
                assert "Unsupported file type" in str(e) or "Failed to load" in str(e)
        
        # Test error with corrupted file
        corrupt_file = self.adapter.simulate_file_error("corrupt_csv")
        file_id = next(int(id) for id, info in self.adapter.test_files.items() 
                      if info["file_data"] == corrupt_file["file_data"])
        
        with pytest.raises(FileTypeError):
            self.adapter.load_dataframe(file_id)
    
    def test_generate_unique_filename(self):
        """Test generating unique filenames."""
        # Test with original filename
        filename1 = self.adapter.generate_unique_filename("test.txt")
        assert filename1.endswith(".txt")
        
        # Test with MIME type
        filename2 = self.adapter.generate_unique_filename(mime_type="application/json")
        assert filename2.endswith(".json")
        
        # Test with both
        filename3 = self.adapter.generate_unique_filename("original.csv", "application/json")
        assert filename3.endswith(".csv")  # Original extension takes precedence
        
        # Test with neither
        filename4 = self.adapter.generate_unique_filename()
        assert filename4.endswith(".bin")  # Default extension
        
        # Verify uniqueness
        assert filename1 != filename2
        assert filename2 != filename3
        assert filename3 != filename4
    
    def test_integration_with_entity_registry(self):
        """Test integration with the entity registry."""
        # Create a test file
        file_info = self.adapter.create_test_file("text", "Test registry integration")
        
        # Get the file ID
        file_id = next(int(id) for id, info in self.adapter.test_files.items() 
                      if info["file_data"] == file_info["file_data"])
        
        # Retrieve the file from the registry
        entity = self.adapter._get_entity("TestFile", str(file_id))
        
        # Verify entity exists and matches
        assert entity is not None
        assert entity["file_data"] == file_info["file_data"]
        assert entity["mime_type"] == file_info["mime_type"]
        
        # Update entity through adapter
        corrupt_file = self.adapter.simulate_file_error("corrupt_json", file_id)
        
        # Verify entity was updated
        updated_entity = self.adapter._get_entity("TestFile", str(file_id))
        assert updated_entity["file_data"] != file_info["file_data"]
        assert updated_entity["file_data"] == corrupt_file["file_data"]
    
    def test_mime_type_detection_edge_cases(self):
        """Test MIME type detection with edge cases."""
        # Test with empty file
        empty_file = self.adapter.create_test_file("text", "")
        mime_type = self.adapter.detect_mime_type(file_data=empty_file["file_data"])
        assert mime_type == "text/plain" or mime_type == "application/octet-stream"
        
        # Test with very small binary file
        small_binary = self.adapter.create_test_file("binary", b"\x00\x01")
        mime_type = self.adapter.detect_mime_type(file_data=small_binary["file_data"])
        assert mime_type == "application/octet-stream"
        
        # Test with file having misleading extension
        misleading_file = self.adapter.create_test_file(
            "json", 
            file_name="text.xml"  # JSON content with XML extension
        )
        
        # Detection by name should say XML
        mime_by_name = self.adapter.detect_mime_type(file_name=misleading_file["file_name"])
        assert mime_by_name == "application/xml"
        
        # Detection by content should say JSON
        mime_by_content = self.adapter.detect_mime_type(file_data=misleading_file["file_data"])
        assert mime_by_content == "application/json"
    
    @patch('utils.file_type_utilities.MAGIC_AVAILABLE', True)
    @patch('utils.file_type_utilities.magic')
    def test_mime_type_detection_with_magic(self, mock_magic):
        """Test MIME type detection with python-magic library."""
        # Set up the mock
        mock_magic.from_file.return_value = "text/plain"
        mock_magic.from_buffer.return_value = "text/plain"
        
        # Test detection by file path
        file_info = self.adapter.create_test_file("text")
        self.adapter.detect_mime_type(file_path=file_info["temp_path"])
        mock_magic.from_file.assert_called_once_with(file_info["temp_path"], mime=True)
        
        # Test detection by file data
        mock_magic.reset_mock()
        self.adapter.detect_mime_type(file_data=file_info["file_data"])
        mock_magic.from_buffer.assert_called_once_with(file_info["file_data"], mime=True)
    
    def test_error_handling(self):
        """Test error handling in various functions."""
        # Test detect_mime_type with no arguments
        with pytest.raises(ValueError):
            self.adapter.detect_mime_type()
        
        # Test convert_to_standard_format with unsupported target
        with pytest.raises(ValueError):
            file_id = next(iter(self.adapter.test_files.keys()))
            self.adapter.convert_to_standard_format(file_id, "unsupported_format")
        
        # Test convert_to_standard_format with unsupported conversion
        with pytest.raises(ValueError):
            # Get binary file ID
            binary_id = next(int(id) for id, info in self.adapter.test_files.items() 
                           if info["file_data"] == self.test_files["binary"]["file_data"])
            
            # Try to convert binary to CSV (should not be supported)
            self.adapter.convert_to_standard_format(binary_id, "csv")
        
        # Test load_dataframe with unsupported type
        with pytest.raises(ValueError):
            # Get binary file ID
            binary_id = next(int(id) for id, info in self.adapter.test_files.items() 
                           if info["file_data"] == self.test_files["binary"]["file_data"])
            
            self.adapter.load_dataframe(binary_id)