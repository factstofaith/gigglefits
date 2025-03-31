"""
Cross-platform test module for the TAP Integration Platform.

This module provides test cases for verifying the application works across different platforms.
It follows the standardized Pytest testing patterns established for the platform.

Author: TAP Integration Platform Team
"""

import os
import sys
import pytest
import platform
import tempfile
import shutil
import subprocess
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))

# Import environment utility modules
try:
    from utils.environment import setup_environment
except ImportError:
    # Mock implementation for testing
    def setup_environment(*args, **kwargs):
        return True


# Platform detection utilities
def is_windows():
    """Check if running on Windows."""
    return platform.system() == "Windows"


def is_macos():
    """Check if running on macOS."""
    return platform.system() == "Darwin"


def is_linux():
    """Check if running on Linux."""
    return platform.system() == "Linux"


# Fixtures for cross-platform testing
@pytest.fixture
def platform_specific_directory():
    """Create a temporary directory for platform-specific tests."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture
def platform_specific_environment():
    """Setup environment variables for platform-specific tests."""
    original_env = os.environ.copy()
    
    # Set base environment variables
    os.environ["APP_ENVIRONMENT"] = "test"
    os.environ["TEST_MODE"] = "true"
    
    # Set platform-specific variables
    if is_windows():
        os.environ["DATABASE_URL"] = "sqlite:///C:\\temp\\test_platform.db"
        os.environ["CONFIG_DIR"] = "C:\\temp\\config"
    else:
        os.environ["DATABASE_URL"] = "sqlite:///tmp/test_platform.db"
        os.environ["CONFIG_DIR"] = "/tmp/config"
    
    yield os.environ
    
    # Restore original environment
    os.environ.clear()
    os.environ.update(original_env)


@pytest.mark.unit
class TestPlatformUtilities:
    """Tests for platform-specific utilities."""
    
    def test_path_handling(self):
        """Test path handling is platform-independent."""
        # Create a path object
        test_path = Path("dir") / "subdir" / "file.txt"
        
        # Convert to string
        path_str = str(test_path)
        
        # Platform-specific assertions
        if is_windows():
            assert "\\" in path_str
            assert "/" not in path_str
        else:
            assert "/" in path_str
            assert "\\" not in path_str
        
        # Test path joining
        joined_path = os.path.join("dir", "subdir", "file.txt")
        
        # Should match platform expectations
        if is_windows():
            assert "\\" in joined_path
        else:
            assert "/" in joined_path
    
    def test_environment_variable_expansion(self):
        """Test environment variable expansion on different platforms."""
        # Set a test environment variable
        os.environ["TEST_VAR"] = "test_value"
        
        # Test expansion in a path
        if is_windows():
            test_path = "%TEST_VAR%\\subdir"
            expanded = os.path.expandvars(test_path)
            assert expanded == "test_value\\subdir"
        else:
            test_path = "${TEST_VAR}/subdir"
            expanded = os.path.expandvars(test_path)
            assert expanded == "test_value/subdir"
    
    def test_temp_directory_path(self):
        """Test temporary directory path is platform-appropriate."""
        # Get system temp directory
        temp_dir = tempfile.gettempdir()
        
        # Platform-specific assertions
        if is_windows():
            assert "\\Temp" in temp_dir or "\\temp" in temp_dir or "\\TEMP" in temp_dir
        elif is_macos():
            assert "/var/folders" in temp_dir or "/tmp" in temp_dir
        elif is_linux():
            assert "/tmp" in temp_dir
    
    def test_python_executable_path(self):
        """Test Python executable path format is correct for the platform."""
        executable = sys.executable
        
        # Platform-specific assertions
        if is_windows():
            assert executable.endswith(".exe")
            assert "\\" in executable
        else:
            assert not executable.endswith(".exe")
            assert "/" in executable


@pytest.mark.integration
class TestDatabasePaths:
    """Tests for database path handling across platforms."""
    
    def test_sqlite_database_path(self, platform_specific_environment):
        """Test SQLite database paths work correctly on different platforms."""
        from sqlalchemy import create_engine, text
        
        # Get database URL from environment
        db_url = platform_specific_environment["DATABASE_URL"]
        
        # Create a directory for the database if needed
        if is_windows():
            os.makedirs("C:\\temp", exist_ok=True)
        else:
            os.makedirs("/tmp", exist_ok=True)
        
        # Create engine with platform-specific path
        engine = create_engine(db_url)
        
        # Try to connect
        try:
            with engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                row = result.fetchone()
                assert row[0] == 1
        except Exception as e:
            pytest.fail(f"Database connection with platform-specific path failed: {e}")
    
    def test_file_path_normalization(self):
        """Test file path normalization works correctly on different platforms."""
        # Create test paths with different separators
        paths = [
            "dir/subdir/file.txt",
            "dir\\subdir\\file.txt",
            "dir/subdir\\file.txt"
        ]
        
        for path_str in paths:
            # Convert to Path object
            path = Path(path_str)
            
            # Convert back to string - should use platform-specific separator
            normalized = str(path)
            
            # Platform-specific assertions
            if is_windows():
                assert "\\" in normalized
                assert "/" not in normalized
            else:
                assert "/" in normalized
                assert "\\" not in normalized


@pytest.mark.integration
class TestEnvironmentSetup:
    """Tests for environment setup across platforms."""
    
    def test_environment_setup_creates_correct_paths(self, platform_specific_directory, platform_specific_environment):
        """Test environment setup creates correct paths on different platforms."""
        # Mock file operations
        with patch('pathlib.Path.exists') as mock_exists, \
             patch('pathlib.Path.mkdir') as mock_mkdir, \
             patch('pathlib.Path.open', create=True) as mock_open:
            
            # Configure mocks
            mock_exists.return_value = False
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file
            
            # Call setup_environment with platform-specific directory
            result = setup_environment(config_dir=platform_specific_directory, environment="test")
            
            # Setup should succeed
            assert result is True
            
            # Should have tried to create directories
            mock_mkdir.assert_called()
            
            # Check if Path was used correctly (platform-independent)
            path_args = [call.args[0] for call in mock_exists.call_args_list]
            for path_arg in path_args:
                assert isinstance(path_arg, Path)
    
    @pytest.mark.skipif(not is_linux(), reason="Linux-specific test")
    def test_linux_specific_features(self):
        """Test Linux-specific features."""
        # This test only runs on Linux
        
        # Test bash script execution
        bash_path = shutil.which("bash")
        assert bash_path is not None, "Bash not found on Linux system"
        
        # Test simple bash script
        result = subprocess.run(
            [bash_path, "-c", "echo 'Linux test'"],
            capture_output=True, 
            text=True,
            check=False
        )
        assert result.returncode == 0
        assert "Linux test" in result.stdout
    
    @pytest.mark.skipif(not is_windows(), reason="Windows-specific test")
    def test_windows_specific_features(self):
        """Test Windows-specific features."""
        # This test only runs on Windows
        
        # Test cmd script execution
        cmd_path = shutil.which("cmd.exe")
        assert cmd_path is not None, "cmd.exe not found on Windows system"
        
        # Test simple cmd script
        result = subprocess.run(
            [cmd_path, "/c", "echo Windows test"],
            capture_output=True, 
            text=True,
            check=False
        )
        assert result.returncode == 0
        assert "Windows test" in result.stdout
    
    @pytest.mark.skipif(not is_macos(), reason="macOS-specific test")
    def test_macos_specific_features(self):
        """Test macOS-specific features."""
        # This test only runs on macOS
        
        # Test bash script execution on macOS
        bash_path = shutil.which("bash")
        assert bash_path is not None, "Bash not found on macOS system"
        
        # Test simple bash script
        result = subprocess.run(
            [bash_path, "-c", "echo 'macOS test'"],
            capture_output=True, 
            text=True,
            check=False
        )
        assert result.returncode == 0
        assert "macOS test" in result.stdout


@pytest.mark.edge
class TestCrossPlatformEdgeCases:
    """Tests for cross-platform edge cases."""
    
    def test_case_sensitivity(self, platform_specific_directory):
        """Test file path case sensitivity handling."""
        # Create test file paths
        test_file = Path(platform_specific_directory) / "testfile.txt"
        test_file_upper = Path(platform_specific_directory) / "TESTFILE.txt"
        
        # Create the first file
        test_file.touch()
        
        # Check if the second path refers to the same file
        if is_windows() or is_macos():
            # On Windows and macOS, file systems are case-insensitive by default
            assert test_file_upper.exists()
        else:
            # On Linux, file systems are case-sensitive
            assert not test_file_upper.exists()
    
    def test_line_ending_handling(self, platform_specific_directory):
        """Test line ending handling across platforms."""
        # Create test file paths
        test_file = Path(platform_specific_directory) / "line_endings.txt"
        
        # Create file with platform-specific line endings
        with open(test_file, 'w', newline='') as f:
            f.write("Line 1\nLine 2\n")
        
        # Read file in binary mode to check actual line endings
        with open(test_file, 'rb') as f:
            content = f.read()
        
        # Check line endings based on platform
        if is_windows():
            # Windows default is \r\n
            assert b'\r\n' in content
        else:
            # Unix default is \n
            assert b'\r\n' not in content
            assert b'\n' in content
    
    def test_executable_bit_handling(self, platform_specific_directory):
        """Test executable permission bit handling."""
        # Create test file
        test_script = Path(platform_specific_directory) / "test_script.sh"
        
        # Write test script
        with open(test_script, 'w') as f:
            f.write("#!/bin/bash\necho 'Test script'\n")
        
        # Make executable on Unix-like systems
        if not is_windows():
            os.chmod(test_script, 0o755)
            
            # Check if executable
            assert os.access(test_script, os.X_OK)
        else:
            # On Windows, the executable bit doesn't exist in the same way
            # But we can check if the file exists
            assert test_script.exists()