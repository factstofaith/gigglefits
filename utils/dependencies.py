"""
Dependency checking module for TAP Integration Platform.

This module provides functionality to check, validate, and install
dependencies required for the TAP Integration Platform.
"""

import os
import sys
import platform
import logging
import subprocess
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any, Callable

logger = logging.getLogger("dependencies")

# Define dependency registry
DEPENDENCIES = [
    {
        "name": "docker",
        "required": True,
        "version_command": ["docker", "--version"],
        "version_pattern": r"Docker version ([0-9]+\.[0-9]+\.[0-9]+)",
        "min_version": "19.0.0",
        "install": {
            "windows": "https://docs.docker.com/desktop/windows/install/",
            "macos": "https://docs.docker.com/desktop/mac/install/",
            "linux": "https://docs.docker.com/engine/install/"
        },
        "validation": lambda: check_docker_running()
    },
    {
        "name": "docker-compose",
        "required": True,
        "version_command": ["docker-compose", "--version"],
        "version_pattern": r"docker-compose version ([0-9]+\.[0-9]+\.[0-9]+)",
        "min_version": "1.27.0",
        "install": {
            "windows": "Included with Docker Desktop",
            "macos": "Included with Docker Desktop",
            "linux": "https://docs.docker.com/compose/install/"
        }
    },
    {
        "name": "python",
        "required": True,
        "version_command": ["python", "--version"],
        "version_pattern": r"Python ([0-9]+\.[0-9]+\.[0-9]+)",
        "min_version": "3.8.0",
        "install": {
            "windows": "https://www.python.org/downloads/windows/",
            "macos": "https://www.python.org/downloads/macos/",
            "linux": "https://www.python.org/downloads/source/"
        },
        "validation": lambda: check_python_packages(["pydantic", "fastapi", "sqlalchemy"])
    },
    {
        "name": "node",
        "required": True,
        "version_command": ["node", "--version"],
        "version_pattern": r"v([0-9]+\.[0-9]+\.[0-9]+)",
        "min_version": "14.0.0",
        "install": {
            "windows": "https://nodejs.org/en/download/",
            "macos": "https://nodejs.org/en/download/",
            "linux": "https://nodejs.org/en/download/"
        }
    },
    {
        "name": "npm",
        "required": True,
        "version_command": ["npm", "--version"],
        "version_pattern": r"([0-9]+\.[0-9]+\.[0-9]+)",
        "min_version": "6.0.0",
        "install": {
            "all": "Included with Node.js"
        },
        "validation": lambda: check_npm_packages(["react", "react-dom"])
    }
]

def get_platform() -> str:
    """Get the current platform name."""
    system = platform.system().lower()
    if system == "darwin":
        return "macos"
    elif system == "windows":
        return "windows"
    else:
        return "linux"

def run_command(command: List[str]) -> Tuple[int, str, str]:
    """Run a command and return exit code, stdout, and stderr."""
    try:
        proc = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = proc.communicate()
        return proc.returncode, stdout, stderr
    except FileNotFoundError:
        return 127, "", f"Command not found: {command[0]}"

def parse_version(version_str: str, pattern: str) -> Optional[str]:
    """Parse version number from a string using a regex pattern."""
    match = re.search(pattern, version_str)
    if match:
        return match.group(1)
    return None

def compare_versions(version1: str, version2: str) -> int:
    """Compare two version strings. Returns -1, 0, or 1."""
    v1_parts = list(map(int, version1.split(".")))
    v2_parts = list(map(int, version2.split(".")))
    
    # Pad shorter version with zeros
    v1_len, v2_len = len(v1_parts), len(v2_parts)
    if v1_len < v2_len:
        v1_parts.extend([0] * (v2_len - v1_len))
    elif v2_len < v1_len:
        v2_parts.extend([0] * (v1_len - v2_len))
    
    # Compare parts
    for i in range(max(v1_len, v2_len)):
        if v1_parts[i] < v2_parts[i]:
            return -1
        elif v1_parts[i] > v2_parts[i]:
            return 1
    
    return 0

def check_docker_running() -> bool:
    """Check if Docker daemon is running."""
    code, stdout, stderr = run_command(["docker", "info"])
    return code == 0

def check_python_packages(packages: List[str]) -> bool:
    """Check if Python packages are installed."""
    for package in packages:
        try:
            __import__(package)
        except ImportError:
            return False
    return True

def check_npm_packages(packages: List[str]) -> bool:
    """Check if NPM packages are installed."""
    # We can't reliably check global npm packages
    # Instead, check if package.json includes the packages
    try:
        import json
        with open("package.json", "r") as f:
            package_json = json.load(f)
        
        deps = package_json.get("dependencies", {})
        dev_deps = package_json.get("devDependencies", {})
        
        for package in packages:
            if package not in deps and package not in dev_deps:
                return False
        
        return True
    except (FileNotFoundError, json.JSONDecodeError):
        return False

def check_dependency(dep: Dict[str, Any]) -> Dict[str, Any]:
    """Check a single dependency and return status information."""
    name = dep["name"]
    required = dep["required"]
    version_command = dep["version_command"]
    version_pattern = dep.get("version_pattern")
    min_version = dep.get("min_version")
    validation = dep.get("validation")
    
    logger.info(f"Checking dependency: {name}")
    
    # Run version command
    code, stdout, stderr = run_command(version_command)
    
    # Prepare result
    result = {
        "name": name,
        "installed": code == 0,
        "required": required,
        "version": None,
        "min_version": min_version,
        "version_ok": None,
        "validated": None,
        "message": "",
        "install_instructions": ""
    }
    
    # Check if installed
    if not result["installed"]:
        result["message"] = f"{name} is not installed"
        platform_name = get_platform()
        install_info = dep.get("install", {})
        
        # Get platform-specific installation instructions
        if platform_name in install_info:
            result["install_instructions"] = install_info[platform_name]
        elif "all" in install_info:
            result["install_instructions"] = install_info["all"]
        
        return result
    
    # Parse version if pattern provided
    if version_pattern and (stdout or stderr):
        output = stdout or stderr
        version = parse_version(output, version_pattern)
        if version:
            result["version"] = version
            
            # Compare versions if min_version provided
            if min_version:
                try:
                    result["version_ok"] = compare_versions(version, min_version) >= 0
                    if not result["version_ok"]:
                        result["message"] = f"{name} version {version} is lower than required {min_version}"
                except:
                    # If version comparison fails, assume it's okay to avoid blocking the user
                    result["version_ok"] = True
    
    # Run validation if provided
    if validation and callable(validation):
        try:
            validated = validation()
            result["validated"] = validated
            if not validated:
                result["message"] = f"{name} validation failed"
        except Exception as e:
            result["validated"] = False
            result["message"] = f"{name} validation error: {e}"
    
    return result

def check_all_dependencies() -> Tuple[bool, List[Dict[str, Any]]]:
    """Check all dependencies and return overall status and details."""
    logger.info("Checking all dependencies...")
    
    results = []
    all_ok = True
    
    for dep in DEPENDENCIES:
        result = check_dependency(dep)
        results.append(result)
        
        # Check if dependency check failed
        if not result["installed"] and result["required"]:
            all_ok = False
        elif result["version_ok"] is False and result["required"]:
            all_ok = False
        elif result["validated"] is False and result["required"]:
            all_ok = False
    
    return all_ok, results

def print_dependency_report(results: List[Dict[str, Any]]) -> None:
    """Print a human-readable dependency report."""
    print("\nDependency Report:")
    print("==================")
    
    for result in results:
        name = result["name"]
        status = "✅" if all([
            result["installed"],
            result.get("version_ok") is not False,
            result.get("validated") is not False
        ]) else "❌"
        
        print(f"{status} {name}")
        
        if not result["installed"]:
            print(f"  - Not installed")
            if result["install_instructions"]:
                print(f"  - Install instructions: {result['install_instructions']}")
        else:
            if result["version"]:
                version_status = ""
                if result["version_ok"] is False:
                    version_status = f" (minimum required: {result['min_version']})"
                print(f"  - Version: {result['version']}{version_status}")
            
            if result["validated"] is False:
                print(f"  - Validation failed")
        
        if result["message"]:
            print(f"  - {result['message']}")
        
        print()

if __name__ == "__main__":
    # Configure logging for standalone usage
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Check dependencies
    all_ok, results = check_all_dependencies()
    
    # Print report
    print_dependency_report(results)
    
    # Exit with appropriate code
    sys.exit(0 if all_ok else 1)