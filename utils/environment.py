"""
Environment management utilities for TAP Integration Platform.

This module provides functionality to manage the environment,
including reset, cleanup, and logging.
"""

import os
import sys
import logging
import subprocess
import shutil
from pathlib import Path
import datetime
from typing import Dict, List, Optional, Tuple, Any

logger = logging.getLogger("environment")

# Get project root directory
def get_project_root() -> Path:
    """Get the project root directory."""
    return Path(__file__).resolve().parent.parent

# Command execution
def run_command(command: List[str], cwd=None, env=None, check=True) -> subprocess.CompletedProcess:
    """Run a command and return the result."""
    logger.debug(f"Running command: {command}")
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            env=env,
            check=check,
            shell=False,
            capture_output=True,
            text=True
        )
        logger.debug(f"Command output: {result.stdout}")
        if result.stderr:
            logger.debug(f"Command error: {result.stderr}")
        return result
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed: {e}")
        logger.error(f"Command output: {e.stdout}")
        logger.error(f"Command error: {e.stderr}")
        raise

# Get current environment from .env file
def get_current_environment() -> str:
    """Get the current environment from .env file."""
    env_file = get_project_root() / ".env"
    if not env_file.exists():
        return "development"  # Default if .env doesn't exist
    
    try:
        with open(env_file, "r") as f:
            for line in f:
                if line.startswith("APP_ENVIRONMENT="):
                    return line.strip().split("=")[1]
    except:
        pass
    
    return "development"  # Default if APP_ENVIRONMENT not found

# Reset environment
def reset_environment(hard=False) -> bool:
    """Reset the environment."""
    logger.info(f"Resetting environment (hard={hard})...")
    
    root_dir = get_project_root()
    current_env = get_current_environment()
    
    # Stop Docker Compose services
    try:
        compose_files = ["docker-compose.improved.yml"]
        env_compose_file = f"docker-compose.{current_env}.yml"
        if (root_dir / env_compose_file).exists():
            compose_files.append(env_compose_file)
        
        cmd = ["docker-compose"]
        for f in compose_files:
            cmd.extend(["-f", f])
        
        if hard:
            cmd.extend(["down", "--volumes", "--remove-orphans"])
            logger.info("Stopping services and removing volumes...")
        else:
            cmd.extend(["down"])
            logger.info("Stopping services...")
        
        run_command(cmd, cwd=root_dir)
        logger.info("Services stopped successfully")
    except Exception as e:
        logger.error(f"Failed to stop services: {e}")
        return False
    
    # Backup .env file if doing hard reset
    if hard and (root_dir / ".env").exists():
        try:
            backup_dir = root_dir / "backups"
            backup_dir.mkdir(exist_ok=True)
            
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = backup_dir / f".env.backup_{timestamp}"
            
            shutil.copy2(root_dir / ".env", backup_file)
            logger.info(f"Backed up .env to {backup_file}")
            
            # Remove .env file
            (root_dir / ".env").unlink()
            logger.info("Removed .env file")
        except Exception as e:
            logger.error(f"Failed to backup and remove .env file: {e}")
    
    # Remove temporary files if doing hard reset
    if hard:
        temp_dirs = [
            root_dir / "backend" / "__pycache__",
            root_dir / "frontend" / "node_modules" / ".cache",
        ]
        
        for temp_dir in temp_dirs:
            if temp_dir.exists():
                try:
                    if temp_dir.is_dir():
                        shutil.rmtree(temp_dir)
                    else:
                        temp_dir.unlink()
                    logger.info(f"Removed: {temp_dir}")
                except Exception as e:
                    logger.error(f"Failed to remove {temp_dir}: {e}")
    
    logger.info("Environment reset successfully")
    return True

# Cleanup environment
def cleanup_environment(all_resources=False) -> bool:
    """Clean up the environment."""
    logger.info(f"Cleaning up environment (all={all_resources})...")
    
    root_dir = get_project_root()
    
    # Stop Docker Compose services
    try:
        run_command(
            ["docker-compose", "-f", "docker-compose.improved.yml", "down"],
            cwd=root_dir
        )
        logger.info("Services stopped successfully")
    except Exception as e:
        logger.error(f"Failed to stop services: {e}")
        return False
    
    # Prune Docker resources
    if all_resources:
        try:
            logger.info("Pruning Docker containers...")
            run_command(["docker", "container", "prune", "-f"], check=False)
            
            logger.info("Pruning Docker networks...")
            run_command(["docker", "network", "prune", "-f"], check=False)
            
            if all_resources:
                logger.info("Pruning Docker volumes...")
                run_command(["docker", "volume", "prune", "-f"], check=False)
                
                logger.info("Pruning Docker system...")
                run_command(["docker", "system", "prune", "-f"], check=False)
            
            logger.info("Docker resources cleaned up successfully")
        except Exception as e:
            logger.error(f"Failed to prune Docker resources: {e}")
            return False
    
    # Clean temporary files
    temp_dirs = [
        # Python cache files
        root_dir / "backend" / "__pycache__",
        root_dir / "utils" / "__pycache__",
        
        # Frontend temp files
        root_dir / "frontend" / "node_modules" / ".cache",
        
        # Log files (optional)
        root_dir / "logs",
        
        # Other temp files
        root_dir / "tmp",
    ]
    
    for temp_dir in temp_dirs:
        if temp_dir.exists():
            try:
                if temp_dir.is_dir():
                    shutil.rmtree(temp_dir)
                else:
                    temp_dir.unlink()
                logger.info(f"Removed: {temp_dir}")
            except Exception as e:
                logger.error(f"Failed to remove {temp_dir}: {e}")
    
    # Remove Python bytecode files
    try:
        for pyc_file in root_dir.glob("**/*.pyc"):
            pyc_file.unlink()
            logger.debug(f"Removed: {pyc_file}")
        
        for pycache_dir in root_dir.glob("**/__pycache__"):
            shutil.rmtree(pycache_dir)
            logger.debug(f"Removed: {pycache_dir}")
        
        logger.info("Removed Python bytecode files")
    except Exception as e:
        logger.error(f"Failed to remove Python bytecode files: {e}")
    
    logger.info("Environment cleanup successful")
    return True

# Setup logging
def setup_logging(level=logging.INFO, log_file=None):
    """Set up logging for the application."""
    handlers = [logging.StreamHandler()]
    
    if log_file:
        log_dir = Path(log_file).parent
        log_dir.mkdir(exist_ok=True)
        handlers.append(logging.FileHandler(log_file))
    
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=handlers
    )

# Create error report
def create_error_report(error, context=None) -> str:
    """Create a detailed error report."""
    root_dir = get_project_root()
    report_dir = root_dir / "logs" / "error_reports"
    report_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = report_dir / f"error_report_{timestamp}.txt"
    
    with open(report_file, "w") as f:
        # Write timestamp
        f.write(f"Error Report: {datetime.datetime.now().isoformat()}\n")
        f.write("=" * 80 + "\n\n")
        
        # Write error information
        f.write("Error Information:\n")
        f.write("-" * 80 + "\n")
        f.write(f"Type: {type(error).__name__}\n")
        f.write(f"Message: {str(error)}\n\n")
        
        # Write context if provided
        if context:
            f.write("Context:\n")
            f.write("-" * 80 + "\n")
            for key, value in context.items():
                f.write(f"{key}: {value}\n")
            f.write("\n")
        
        # Write environment information
        f.write("Environment Information:\n")
        f.write("-" * 80 + "\n")
        f.write(f"Platform: {sys.platform}\n")
        f.write(f"Python Version: {sys.version}\n")
        f.write(f"Working Directory: {os.getcwd()}\n")
        
        # Write environment variables (filtered)
        f.write("\nEnvironment Variables:\n")
        for key, value in os.environ.items():
            # Skip sensitive variables
            if any(sensitive in key.lower() for sensitive in ["secret", "password", "token", "key"]):
                value = "********"
            # Skip long values
            if len(value) > 100:
                value = value[:97] + "..."
            f.write(f"{key}={value}\n")
    
    return str(report_file)

if __name__ == "__main__":
    # Setup logging
    setup_logging()
    
    # Parse arguments
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "reset":
            hard = len(sys.argv) > 2 and sys.argv[2] == "--hard"
            success = reset_environment(hard)
            print(f"Environment reset {'successfully' if success else 'failed'}")
            sys.exit(0 if success else 1)
        elif command == "cleanup":
            all_resources = len(sys.argv) > 2 and sys.argv[2] == "--all"
            success = cleanup_environment(all_resources)
            print(f"Environment cleanup {'successful' if success else 'failed'}")
            sys.exit(0 if success else 1)
        else:
            print(f"Unknown command: {command}")
            print("Available commands: reset, cleanup")
            sys.exit(1)
    else:
        print("Usage: python environment.py [reset|cleanup] [--hard|--all]")
        sys.exit(1)