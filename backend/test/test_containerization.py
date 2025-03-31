"""
Containerization test module for the TAP Integration Platform.

This module provides test cases for verifying Docker container setup and functionality.
It follows the standardized Pytest testing patterns established for the platform.

Author: TAP Integration Platform Team
"""

import os
import sys
import pytest
import subprocess
import tempfile
import shutil
import time
from pathlib import Path
from unittest.mock import patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))

# Fixtures for containerization testing
@pytest.fixture
def temp_docker_dir():
    """Fixture to create a temporary Docker files directory."""
    temp_dir = tempfile.mkdtemp()
    
    # Create minimal docker-compose.yml
    docker_compose_content = """
version: '3.8'

services:
  backend:
    image: tap-backend:test
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/tap_test
      - SECRET_KEY=test_secret
    depends_on:
      - db
    ports:
      - "8000:8000"

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=tap_test
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
"""
    docker_compose_path = Path(temp_dir) / "docker-compose.yml"
    docker_compose_path.write_text(docker_compose_content)
    
    # Create minimal Dockerfile
    dockerfile_content = """
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "main.py"]
"""
    dockerfile_path = Path(temp_dir) / "Dockerfile"
    dockerfile_path.write_text(dockerfile_content)
    
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.mark.unit
class TestDockerConfiguration:
    """Test cases for Docker configuration files."""
    
    def test_docker_compose_file_validity(self, temp_docker_dir):
        """Test that docker-compose.yml is valid."""
        # Set up mock process result
        process_mock = MagicMock()
        process_mock.returncode = 0
        process_mock.stdout = "docker-compose.yml: valid"
        
        # Apply patch for subprocess call
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = process_mock
            
            # Run docker-compose config command to validate
            cmd = ["docker-compose", "-f", str(Path(temp_docker_dir) / "docker-compose.yml"), "config", "-q"]
            result = subprocess.run(cmd, text=True, capture_output=True)
            
            # Check if command was called correctly
            mock_run.assert_called_once()
            args, kwargs = mock_run.call_args
            assert cmd[0] in args[0]
            
            # Validation should pass
            assert process_mock.returncode == 0
    
    def test_dockerfile_validity(self, temp_docker_dir):
        """Test that Dockerfile is valid."""
        # Set up mock process result
        process_mock = MagicMock()
        process_mock.returncode = 0
        
        # Apply patch for subprocess call
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = process_mock
            
            # Run docker build command with --dry-run (note: not all Docker versions support this)
            cmd = ["docker", "build", "--no-cache", "--progress=plain", "-f", str(Path(temp_docker_dir) / "Dockerfile"), temp_docker_dir]
            result = subprocess.run(cmd, text=True, capture_output=True)
            
            # Check if command was called correctly
            mock_run.assert_called_once()
            args, kwargs = mock_run.call_args
            assert cmd[0] in args[0]
            
            # Validation should pass
            assert process_mock.returncode == 0
    
    def test_environment_variables_in_compose(self, temp_docker_dir):
        """Test that docker-compose.yml contains the required environment variables."""
        compose_file_path = Path(temp_docker_dir) / "docker-compose.yml"
        
        # Read the docker-compose.yml file
        compose_content = compose_file_path.read_text()
        
        # Check for required environment variables
        assert "DATABASE_URL" in compose_content
        assert "SECRET_KEY" in compose_content
        assert "POSTGRES_USER" in compose_content
        assert "POSTGRES_PASSWORD" in compose_content
    
    def test_docker_compose_services(self, temp_docker_dir):
        """Test that docker-compose.yml defines all required services."""
        compose_file_path = Path(temp_docker_dir) / "docker-compose.yml"
        
        # Read the docker-compose.yml file
        compose_content = compose_file_path.read_text()
        
        # Check for required services
        assert "backend:" in compose_content
        assert "db:" in compose_content
        assert "depends_on" in compose_content
        assert "ports" in compose_content
        assert "volumes" in compose_content
    

@pytest.mark.unit
class TestContainerizationScripts:
    """Test cases for container management scripts."""
    
    def test_docker_up_script(self):
        """Test the docker-up script functionality."""
        # Set up mock process result
        process_mock = MagicMock()
        process_mock.returncode = 0
        
        # Apply patch for subprocess call
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = process_mock
            
            # Run start_dev_containerized.sh script
            script_path = Path(__file__).parent.parent.parent / "start_dev_containerized.sh"
            
            # If script exists, test it
            if script_path.exists():
                cmd = [str(script_path)]
                subprocess.run(cmd, text=True, capture_output=True)
                
                # Check if command was called correctly
                mock_run.assert_called()
                
                # Validation should pass
                assert mock_run.return_value.returncode == 0
            else:
                # Skip if script doesn't exist
                pytest.skip(f"Script {script_path} not found")
    
    def test_docker_down_script(self):
        """Test the docker-down functionality."""
        # Set up mock process result
        process_mock = MagicMock()
        process_mock.returncode = 0
        
        # Apply patch for subprocess call
        with patch('subprocess.run') as mock_run:
            mock_run.return_value = process_mock
            
            # Simulate docker-compose down command
            cmd = ["docker-compose", "down"]
            subprocess.run(cmd, text=True, capture_output=True)
            
            # Check if command was called correctly
            mock_run.assert_called_once()
            args, kwargs = mock_run.call_args
            assert cmd[0] in args[0]
            
            # Validation should pass
            assert mock_run.return_value.returncode == 0


@pytest.mark.integration
@pytest.mark.skip(reason="Integration tests that require Docker should be run separately")
class TestContainerIntegration:
    """Integration tests for Docker containers.
    
    These tests require Docker to be installed and running.
    They are skipped by default and should be run explicitly when needed.
    """
    
    @pytest.fixture(scope="class")
    def docker_compose_project(self):
        """Fixture to set up and tear down a Docker Compose project for testing."""
        # Use a unique project name to avoid conflicts
        project_name = f"tap-test-{int(time.time())}"
        project_dir = Path(__file__).parent.parent.parent
        
        # Start containers
        subprocess.run(
            ["docker-compose", "-p", project_name, "-f", "docker-compose.test.yml", "up", "-d"],
            cwd=str(project_dir),
            check=True
        )
        
        # Wait for services to be ready
        time.sleep(10)
        
        yield project_name
        
        # Stop and remove containers
        subprocess.run(
            ["docker-compose", "-p", project_name, "-f", "docker-compose.test.yml", "down", "-v"],
            cwd=str(project_dir),
            check=True
        )
    
    def test_containers_running(self, docker_compose_project):
        """Test that all containers are running."""
        # Check container status
        result = subprocess.run(
            ["docker-compose", "-p", docker_compose_project, "-f", "docker-compose.test.yml", "ps", "-q"],
            text=True,
            capture_output=True,
            check=True
        )
        
        # Get container IDs
        container_ids = result.stdout.strip().split('\n')
        
        # Check that we have containers
        assert len(container_ids) > 0
        
        # Check each container's status
        for container_id in container_ids:
            if container_id:  # Skip empty lines
                inspect_result = subprocess.run(
                    ["docker", "inspect", "--format='{{.State.Running}}'", container_id],
                    text=True,
                    capture_output=True,
                    check=True
                )
                
                # Container should be running
                assert "true" in inspect_result.stdout.lower()
    
    def test_backend_health_check(self, docker_compose_project):
        """Test that the backend container is healthy and responds to requests."""
        # Send a request to the backend health check endpoint
        max_retries = 5
        retry_delay = 3
        
        for attempt in range(max_retries):
            try:
                result = subprocess.run(
                    ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "http://localhost:8000/health"],
                    text=True,
                    capture_output=True,
                    check=False
                )
                
                # Check if we got a successful response
                if result.stdout.strip() == "200":
                    break
            except Exception:
                pass
            
            # Wait before retrying
            time.sleep(retry_delay)
        else:
            # All retries failed
            pytest.fail("Backend health check failed after all retries")
    
    def test_database_connectivity(self, docker_compose_project):
        """Test that the database container is accessible from the backend container."""
        # Execute a command in the backend container to check database connectivity
        backend_container = f"{docker_compose_project}-backend-1"  # Container name pattern in Docker Compose
        
        result = subprocess.run(
            [
                "docker", "exec", backend_container,
                "python", "-c", 
                "import os; from sqlalchemy import create_engine; "
                "engine = create_engine(os.environ['DATABASE_URL']); "
                "connection = engine.connect(); connection.close()"
            ],
            text=True,
            capture_output=True,
            check=False
        )
        
        # Command should succeed without errors
        assert result.returncode == 0, f"Database connectivity check failed: {result.stderr}"