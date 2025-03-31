#!/usr/bin/env python3
"""
Setup Alembic for TAP Integration Platform

This script initializes Alembic and creates the initial migration representing
the current database schema.
"""

import os
import sys
import argparse
import subprocess
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("setup_alembic")

def run_command(cmd, cwd=None):
    """Run a command and log its output"""
    logger.info(f"Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            check=True,
            capture_output=True,
            text=True
        )
        logger.info(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        return False

def verify_alembic_installed():
    """Verify that Alembic is installed"""
    try:
        import alembic
        logger.info(f"Alembic version {alembic.__version__} found")
        return True
    except ImportError:
        logger.error("Alembic not installed")
        logger.info("Installing Alembic...")
        return run_command([sys.executable, "-m", "pip", "install", "alembic"])

def create_initial_migration(project_dir):
    """Create the initial migration"""
    alembic_dir = os.path.join(project_dir, "db", "alembic")
    versions_dir = os.path.join(alembic_dir, "versions")
    
    # Create versions directory if it doesn't exist
    os.makedirs(versions_dir, exist_ok=True)
    
    # Create initial migration
    logger.info("Creating initial migration...")
    if not run_command(
        [sys.executable, "-m", "alembic", "revision", "-m", "initial_schema"],
        cwd=project_dir
    ):
        return False
    
    logger.info("Initial migration created. Now update the migration file with the current schema.")
    logger.info("Look for the file in the alembic/versions directory.")
    return True

def update_alembic_config(project_dir):
    """Update alembic.ini with project-specific configuration"""
    alembic_ini = os.path.join(project_dir, "alembic.ini")
    
    # Check if alembic.ini exists
    if not os.path.exists(alembic_ini):
        logger.error(f"alembic.ini not found at {alembic_ini}")
        return False
    
    # Update alembic.ini
    with open(alembic_ini, "r") as f:
        content = f.read()
    
    # Update script_location
    content = content.replace(
        "script_location = alembic",
        "script_location = db/alembic"
    )
    
    # Write updated file
    with open(alembic_ini, "w") as f:
        f.write(content)
    
    logger.info("Updated alembic.ini with project-specific configuration")
    return True

def update_env_py(project_dir):
    """Update env.py with project-specific imports and configuration"""
    env_py = os.path.join(project_dir, "db", "alembic", "env.py")
    
    # Check if env.py exists
    if not os.path.exists(env_py):
        logger.error(f"env.py not found at {env_py}")
        return False
    
    # Create backup of original file
    backup_file = env_py + ".bak"
    with open(env_py, "r") as f_in, open(backup_file, "w") as f_out:
        f_out.write(f_in.read())
    
    # Read env.py
    with open(env_py, "r") as f:
        lines = f.readlines()
    
    # Update imports and configuration
    new_lines = []
    for line in lines:
        if line.strip() == "from alembic import context":
            # Add additional imports
            new_lines.append("import os\n")
            new_lines.append("import sys\n")
            new_lines.append("from pathlib import Path\n")
            new_lines.append("\n")
            new_lines.append("# Add parent directory to path for imports\n")
            new_lines.append("sys.path.append(str(Path(__file__).resolve().parent.parent.parent))\n")
            new_lines.append("\n")
            new_lines.append("# Import TAP models and configuration\n")
            new_lines.append("from db.base import Base\n")
            new_lines.append("from core.config_factory import ConfigFactory, EnvironmentType\n")
            new_lines.append("\n")
            new_lines.append(line)
        elif line.strip().startswith("target_metadata = None"):
            # Set target metadata to Base.metadata
            new_lines.append("target_metadata = Base.metadata\n")
        elif line.strip() == "# this is the Alembic Config object, which provides":
            # Add environment configuration
            new_lines.append(line)
            new_lines.append("\n")
            new_lines.append("# Get database URL from environment\n")
            new_lines.append("environment = os.getenv('APP_ENVIRONMENT', 'development')\n")
            new_lines.append("try:\n")
            new_lines.append("    env_type = EnvironmentType[environment.upper()]\n")
            new_lines.append("    app_config = ConfigFactory.create_config(env_type)\n")
            new_lines.append("    database_url = app_config.DATABASE_URL\n")
            new_lines.append("    if database_url:\n")
            new_lines.append("        config.set_main_option('sqlalchemy.url', database_url)\n")
            new_lines.append("except (KeyError, ImportError):\n")
            new_lines.append("    # Fallback to config file if ConfigFactory is not available\n")
            new_lines.append("    database_url = os.getenv('DATABASE_URL')\n")
            new_lines.append("    if database_url:\n")
            new_lines.append("        config.set_main_option('sqlalchemy.url', database_url)\n")
            new_lines.append("\n")
        else:
            new_lines.append(line)
    
    # Write updated file
    with open(env_py, "w") as f:
        f.writelines(new_lines)
    
    logger.info("Updated env.py with project-specific imports and configuration")
    return True

def main():
    parser = argparse.ArgumentParser(description="Set up Alembic for database migrations")
    parser.add_argument("--project-dir", default=None, help="Project directory")
    args = parser.parse_args()
    
    project_dir = args.project_dir
    if project_dir is None:
        project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    logger.info(f"Setting up Alembic for project at: {project_dir}")
    
    # Verify Alembic is installed
    if not verify_alembic_installed():
        logger.error("Failed to install Alembic")
        return 1
    
    # Check if alembic.ini already exists
    alembic_ini = os.path.join(project_dir, "alembic.ini")
    alembic_env = os.path.join(project_dir, "db", "alembic", "env.py")
    
    if not os.path.exists(alembic_ini) or not os.path.exists(alembic_env):
        # Initialize Alembic
        logger.info("Initializing Alembic...")
        if not run_command(
            [sys.executable, "-m", "alembic", "init", "db/alembic"],
            cwd=project_dir
        ):
            logger.error("Failed to initialize Alembic")
            return 1
    else:
        logger.info("Alembic is already initialized")
    
    # Update alembic.ini
    if not update_alembic_config(project_dir):
        logger.error("Failed to update alembic.ini")
        return 1
    
    # Update env.py
    if not update_env_py(project_dir):
        logger.error("Failed to update env.py")
        return 1
    
    # Create initial migration
    if not create_initial_migration(project_dir):
        logger.error("Failed to create initial migration")
        return 1
    
    logger.info("Alembic setup completed successfully!")
    logger.info("Next steps:")
    logger.info("1. Update the migration file in db/alembic/versions/ with the current schema")
    logger.info("2. Run migrations with: alembic upgrade head")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())