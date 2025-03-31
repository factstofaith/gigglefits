"""
Environment validation module for TAP Integration Platform.

This module provides functionality to validate the environment
configuration and state for the TAP Integration Platform.
"""

import os
import sys
import logging
import subprocess
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any, Callable

logger = logging.getLogger("validation")

# Define validation registry
VALIDATIONS = [
    {
        "name": "docker_running",
        "description": "Check if Docker daemon is running",
        "check": lambda: check_docker_running(),
        "required": True,
        "fix": "Start Docker Desktop or Docker daemon"
    },
    {
        "name": "docker_compose_file",
        "description": "Check if Docker Compose file exists",
        "check": lambda: check_file_exists("docker-compose.improved.yml"),
        "required": True,
        "fix": "Restore docker-compose.improved.yml from version control"
    },
    {
        "name": "env_file",
        "description": "Check if .env file exists",
        "check": lambda: check_file_exists(".env"),
        "required": True,
        "fix": "Run setup.py setup to create the .env file"
    },
    {
        "name": "backend_directory",
        "description": "Check if backend directory exists",
        "check": lambda: check_directory_exists("backend"),
        "required": True,
        "fix": "Restore backend directory from version control"
    },
    {
        "name": "frontend_directory",
        "description": "Check if frontend directory exists",
        "check": lambda: check_directory_exists("frontend"),
        "required": True,
        "fix": "Restore frontend directory from version control"
    },
    {
        "name": "environment_variables",
        "description": "Check environment variables",
        "check": lambda: check_environment_variables(),
        "required": True,
        "fix": "Ensure all required environment variables are set in .env file"
    },
    {
        "name": "config_templates",
        "description": "Check if configuration templates exist",
        "check": lambda: check_directory_exists("config-templates"),
        "required": True,
        "fix": "Restore config-templates directory from version control"
    }
]

def get_project_root() -> Path:
    """Get the project root directory."""
    return Path(__file__).resolve().parent.parent

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

def check_docker_running() -> bool:
    """Check if Docker daemon is running."""
    code, stdout, stderr = run_command(["docker", "info"])
    return code == 0

def check_file_exists(filename: str) -> bool:
    """Check if a file exists in the project root."""
    root = get_project_root()
    file_path = root / filename
    return file_path.exists() and file_path.is_file()

def check_directory_exists(dirname: str) -> bool:
    """Check if a directory exists in the project root."""
    root = get_project_root()
    dir_path = root / dirname
    return dir_path.exists() and dir_path.is_dir()

def check_environment_variables() -> bool:
    """Check environment variables."""
    # Load .env file
    env_file = get_project_root() / ".env"
    if not env_file.exists():
        return False
    
    # Check required variables
    required_vars = [
        "APP_ENVIRONMENT",
        "DATABASE_URL",
        "SECRET_KEY"
    ]
    
    with open(env_file, "r") as f:
        env_content = f.read()
    
    for var in required_vars:
        if f"{var}=" not in env_content:
            return False
    
    return True

def run_validation(validation: Dict[str, Any]) -> Dict[str, Any]:
    """Run a single validation check and return the result."""
    name = validation["name"]
    description = validation["description"]
    check = validation["check"]
    required = validation["required"]
    fix = validation.get("fix", "")
    
    logger.info(f"Running validation: {name}")
    
    # Prepare result
    result = {
        "name": name,
        "description": description,
        "success": False,
        "required": required,
        "fix": fix,
        "message": ""
    }
    
    # Run check
    try:
        success = check()
        result["success"] = success
        if not success:
            result["message"] = f"Validation {name} failed"
    except Exception as e:
        result["success"] = False
        result["message"] = f"Validation error: {e}"
    
    return result

def validate_environment() -> Tuple[bool, List[Dict[str, Any]]]:
    """Validate the environment and return overall status and details."""
    logger.info("Validating environment...")
    
    results = []
    all_ok = True
    
    for validation in VALIDATIONS:
        result = run_validation(validation)
        results.append(result)
        
        # Check if validation failed and is required
        if not result["success"] and result["required"]:
            all_ok = False
    
    return all_ok, results

def print_validation_report(results: List[Dict[str, Any]]) -> None:
    """Print a human-readable validation report."""
    print("\nEnvironment Validation Report:")
    print("==============================")
    
    for result in results:
        name = result["name"]
        status = "✅" if result["success"] else "❌"
        required = "(Required)" if result["required"] else "(Optional)"
        
        print(f"{status} {name} {required}")
        print(f"  - {result['description']}")
        
        if not result["success"]:
            if result["fix"]:
                print(f"  - Fix: {result['fix']}")
            
            if result["message"]:
                print(f"  - {result['message']}")
        
        print()

if __name__ == "__main__":
    # Configure logging for standalone usage
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Validate environment
    all_ok, results = validate_environment()
    
    # Print report
    print_validation_report(results)
    
    # Exit with appropriate code
    sys.exit(0 if all_ok else 1)