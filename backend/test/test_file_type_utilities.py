"""
File Type Utilities Tests

This module contains tests for the file_type_utilities module.
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


class TestFileTypeUtilities:
    """Tests for the file_type_utilities module."""
    
    @pytest.fixture
    def test_files(self):
        """Create test files for the tests."""
        files = {}
        temp_files = []
        
        # Create a text file
        text_data = "This is a test text file."
        files["text"] = {
            "data": text_data.encode("utf-8"),
            "mime": "text/plain",
            "ext": ".txt"
        }
        
        # Create a CSV file
        csv_data = "id,name,value\n1,test1,100\n2,test2,200\n"
        files["csv"] = {
            "data": csv_data.encode("utf-8"),
            "mime": "text/csv",
            "ext": ".csv"
        }
        
        # Create a JSON file
        json_data = {"id": 1, "name": "test", "values": [1, 2, 3]}
        files["json"] = {
            "data": json.dumps(json_data).encode("utf-8"),
            "mime": "application/json",
            "ext": ".json"
        }
        
        # Create an XML file
        xml_data = '<?xml version="1.0" encoding="UTF-8"?><root><item id="1"><name>test1</name><value>100</value></item></root>'
        files["xml"] = {
            "data": xml_data.encode("utf-8"),
            "mime": "application/xml",
            "ext": ".xml"
        }
        
        # Create a YAML file
        yaml_data = {"id": 1, "name": "test", "values": [1, 2, 3]}
        files["yaml"] = {
            "data": yaml.dump(yaml_data).encode("utf-8"),
            "mime": "application/yaml",
            "ext": ".yaml"
        }
        
        # Create an image file
        img = Image.new('RGB', (100, 100), color='red')
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        files["image"] = {
            "data": img_buffer.getvalue(),
            "mime": "image/png",
            "ext": ".png"
        }
        
        # Create an Excel file
        df = pd.DataFrame({
            'id': [1, 2, 3],
            'name': ['test1', 'test2', 'test3'],
            'value': [100, 200, 300]
        })
        excel_buffer = io.BytesIO()
        df.to_excel(excel_buffer, index=False)
        files["excel"] = {
            "data": excel_buffer.getvalue(),
            "mime": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "ext": ".xlsx"
        }
        
        # Create a binary file
        files["binary"] = {
            "data": b'\x00\x01\x02\x03\x04',
            "mime": "application/octet-stream",
            "ext": ".bin"
        }
        
        # Create temporary files on disk for tests that need file paths
        for file_type, file_info in files.items():
            temp_fd, temp_path = tempfile.mkstemp(suffix=file_info["ext"])
            os.close(temp_fd)
            with open(temp_path, 'wb') as f:
                f.write(file_info["data"])
            files[file_type]["path"] = temp_path
            temp_files.append(temp_path)
        
        yield files
        
        # Clean up temporary files
        for temp_path in temp_files:
            try:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            except:
                pass
    
    def test_detect_mime_type_by_file_path(self, test_files):
        """Test detecting MIME type by file path."""
        for file_type, file_info in test_files.items():
            detected_mime = detect_mime_type(file_path=file_info["path"])
            assert detected_mime == file_info["mime"] or detected_mime.startswith(file_info["mime"].split('/')[0])
    
    def test_detect_mime_type_by_file_data(self, test_files):
        """Test detecting MIME type by file data."""
        for file_type, file_info in test_files.items():
            detected_mime = detect_mime_type(file_data=file_info["data"])
            assert detected_mime == file_info["mime"] or detected_mime.startswith(file_info["mime"].split('/')[0])
    
    def test_detect_mime_type_by_file_name(self, test_files):
        """Test detecting MIME type by file name."""
        for file_type, file_info in test_files.items():
            file_name = f"test{file_info['ext']}"
            detected_mime = detect_mime_type(file_name=file_name)
            assert detected_mime == file_info["mime"] or detected_mime.startswith(file_info["mime"].split('/')[0])
    
    def test_detect_mime_type_with_magic(self, test_files):
        """Test detecting MIME type with python-magic."""
        # Mock python-magic for the test
        mock_magic = MagicMock()
        mock_magic.from_file.return_value = "application/test"
        mock_magic.from_buffer.return_value = "application/test"
        
        with patch.dict('sys.modules', {'magic': mock_magic}):
            with patch('utils.file_type_utilities.MAGIC_AVAILABLE', True):
                # Test file path
                detect_mime_type(file_path="test.txt")
                mock_magic.from_file.assert_called_once_with("test.txt", mime=True)
                
                # Test file data
                detect_mime_type(file_data=b"test data")
                mock_magic.from_buffer.assert_called_once_with(b"test data", mime=True)
    
    def test_detect_mime_type_invalid_args(self):
        """Test detecting MIME type with invalid arguments."""
        with pytest.raises(ValueError):
            detect_mime_type()
    
    def test_get_file_extension(self):
        """Test getting file extension from MIME type."""
        extensions = {
            "text/plain": ".txt",
            "text/csv": ".csv",
            "application/json": ".json",
            "application/xml": ".xml",
            "application/yaml": ".yaml",
            "image/png": ".png",
            "image/jpeg": ".jpg",
            "application/pdf": ".pdf",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx"
        }
        
        for mime_type, expected_ext in extensions.items():
            assert get_file_extension(mime_type) == expected_ext
    
    def test_convert_to_standard_format_csv_to_json(self, test_files):
        """Test converting CSV to JSON."""
        csv_data = test_files["csv"]["data"]
        csv_mime = test_files["csv"]["mime"]
        
        converted_data, new_mime = convert_to_standard_format(csv_data, csv_mime, "json")
        
        assert new_mime == "application/json"
        
        # Verify the converted data is valid JSON
        json_obj = json.loads(converted_data)
        assert isinstance(json_obj, list)
        assert len(json_obj) == 2  # Two rows from the CSV
        assert json_obj[0]["id"] == "1"
        assert json_obj[0]["name"] == "test1"
        assert json_obj[0]["value"] == "100"
    
    def test_convert_to_standard_format_json_to_csv(self, test_files):
        """Test converting JSON to CSV."""
        json_data = test_files["json"]["data"]
        json_mime = test_files["json"]["mime"]
        
        converted_data, new_mime = convert_to_standard_format(json_data, json_mime, "csv")
        
        assert new_mime == "text/csv"
        
        # Verify the converted data is valid CSV
        csv_content = converted_data.decode("utf-8")
        assert "id,name,values" in csv_content
        assert "1,test,[1, 2, 3]" in csv_content or "1,test,\"[1, 2, 3]\"" in csv_content
    
    def test_convert_to_standard_format_unsupported(self, test_files):
        """Test converting to an unsupported format."""
        with pytest.raises(ValueError):
            convert_to_standard_format(
                test_files["text"]["data"],
                test_files["text"]["mime"],
                "unsupported_format"
            )
    
    def test_extract_metadata_image(self, test_files):
        """Test extracting metadata from an image file."""
        image_data = test_files["image"]["data"]
        image_mime = test_files["image"]["mime"]
        
        metadata = extract_metadata(image_data, image_mime)
        
        assert "format" in metadata
        assert metadata["format"] == "PNG"
        assert "width" in metadata
        assert metadata["width"] == 100
        assert "height" in metadata
        assert metadata["height"] == 100
        assert "mode" in metadata
        assert metadata["mode"] == "RGB"
    
    def test_extract_metadata_csv(self, test_files):
        """Test extracting metadata from a CSV file."""
        csv_data = test_files["csv"]["data"]
        csv_mime = test_files["csv"]["mime"]
        
        metadata = extract_metadata(csv_data, csv_mime)
        
        assert "delimiter" in metadata
        assert metadata["delimiter"] == ","
        assert "row_count" in metadata
        assert metadata["row_count"] == 3  # Header + 2 data rows
        assert "column_count" in metadata
        assert metadata["column_count"] == 3  # id, name, value
    
    def test_extract_metadata_json(self, test_files):
        """Test extracting metadata from a JSON file."""
        json_data = test_files["json"]["data"]
        json_mime = test_files["json"]["mime"]
        
        metadata = extract_metadata(json_data, json_mime)
        
        assert "top_level_type" in metadata
        assert metadata["top_level_type"] == "object"
        assert "keys" in metadata
        assert set(metadata["keys"]) == {"id", "name", "values"}
    
    def test_validate_file_format_valid(self, test_files):
        """Test validating valid file formats."""
        for file_type, file_info in test_files.items():
            assert validate_file_format(file_info["data"], file_info["mime"]) is True
    
    def test_validate_file_format_invalid(self, test_files):
        """Test validating invalid file formats."""
        # Test with incorrect MIME type
        assert validate_file_format(test_files["json"]["data"], "application/xml") is False
        
        # Test with corrupted data
        corrupted_json = b'{"id": 1, "name": "test", "values": [1, 2,'  # Truncated JSON
        assert validate_file_format(corrupted_json, "application/json") is False
        
        corrupted_csv = b'id,name,value\n1,test1,100\n2,test2"incorrect"'  # Malformed CSV
        assert validate_file_format(corrupted_csv, "text/csv") is False
    
    def test_load_dataframe_csv(self, test_files):
        """Test loading a CSV file into a DataFrame."""
        csv_data = test_files["csv"]["data"]
        csv_mime = test_files["csv"]["mime"]
        
        df = load_dataframe(csv_data, csv_mime)
        
        assert isinstance(df, pd.DataFrame)
        assert len(df) == 2  # Two data rows
        assert list(df.columns) == ["id", "name", "value"]
        assert df.loc[0, "id"] == 1
        assert df.loc[0, "name"] == "test1"
        assert df.loc[0, "value"] == 100
    
    def test_load_dataframe_json(self, test_files):
        """Test loading a JSON file into a DataFrame."""
        json_data = test_files["json"]["data"]
        json_mime = test_files["json"]["mime"]
        
        df = load_dataframe(json_data, json_mime)
        
        assert isinstance(df, pd.DataFrame)
        # The exact structure will depend on how pandas reads the JSON
        assert "id" in df.columns or 0 in df.index
        assert "name" in df.columns or 1 in df.index
    
    def test_load_dataframe_unsupported(self, test_files):
        """Test loading an unsupported file format into a DataFrame."""
        with pytest.raises(ValueError):
            load_dataframe(test_files["binary"]["data"], test_files["binary"]["mime"])
    
    def test_load_dataframe_error(self, test_files):
        """Test error handling when loading a DataFrame."""
        corrupted_csv = b'id,name,value\n1,test1,100\n2,test2"incorrect"'  # Malformed CSV
        
        with pytest.raises(FileTypeError):
            load_dataframe(corrupted_csv, "text/csv")
    
    def test_generate_unique_filename_with_original(self):
        """Test generating a unique filename with an original filename."""
        filename = generate_unique_filename("test.txt")
        
        assert len(filename) > 8  # UUID hexadecimal length is 32 chars
        assert filename.endswith(".txt")
    
    def test_generate_unique_filename_with_mime_type(self):
        """Test generating a unique filename with a MIME type."""
        filename = generate_unique_filename(mime_type="application/json")
        
        assert len(filename) > 8
        assert filename.endswith(".json")
    
    def test_generate_unique_filename_default(self):
        """Test generating a unique filename with no parameters."""
        filename = generate_unique_filename()
        
        assert len(filename) > 8
        assert filename.endswith(".bin")  # Default extension