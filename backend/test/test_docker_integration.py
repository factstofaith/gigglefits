"""
Docker integration test module for the TAP Integration Platform.

This module provides test cases for verifying Docker containerization works correctly.
It follows the standardized Pytest testing patterns established for the platform.

Author: TAP Integration Platform Team
"""

import os
import sys
import pytest
import subprocess
import tempfile
import socket
import time
import json
from pathlib import Path
from unittest.mock import patch, MagicMock

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.absolute()))


# Fixtures for Docker testing
@pytest.fixture
def check_docker_availability():
    """Check if Docker is available for testing."""
    try:
        result = subprocess.run(
            ["docker", "--version"],
            check=False,
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False


@pytest.fixture
def check_docker_compose_availability():
    """Check if Docker Compose is available for testing."""
    try:
        result = subprocess.run(
            ["docker-compose", "--version"],
            check=False,
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False


@pytest.fixture
def docker_test_file():
    """Create a simple Dockerfile for testing."""
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.dockerfile', delete=False) as temp_file:
        temp_file.write("""
FROM python:3.12-slim

WORKDIR /app

RUN echo "TAP Integration Platform Docker Test" > test_file.txt

CMD ["cat", "test_file.txt"]
""")
        temp_file.flush()
        
        yield temp_file.name
        
        # Clean up
        os.unlink(temp_file.name)


@pytest.fixture
def docker_compose_test_file():
    """Create a simple docker-compose.yml file for testing."""
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.yml', delete=False) as temp_file:
        temp_file.write("""
version: '3.8'

services:
  app:
    image: python:3.12-slim
    command: python -c "import sys; print('TAP Integration Platform Docker Compose Test')"
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=tap_test
""")
        temp_file.flush()
        
        yield temp_file.name
        
        # Clean up
        os.unlink(temp_file.name)


@pytest.mark.unit
class TestDockerfileValidation:
    """Tests for Dockerfile validation."""
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_availability"), reason="Docker not available")
    def test_dockerfile_syntax(self, docker_test_file):
        """Test Dockerfile syntax is valid."""
        # Run docker build with --no-cache to validate syntax
        result = subprocess.run(
            ["docker", "build", "--no-cache", "--progress=plain", "-f", docker_test_file, "-t", "tap-test:syntax", "."],
            check=False,
            capture_output=True,
            text=True
        )
        
        # Check if build succeeded
        assert result.returncode == 0, f"Dockerfile syntax validation failed: {result.stderr}"
    
    def test_dockerfile_structure(self):
        """Test Dockerfile structure follows best practices."""
        # Check real project Dockerfiles
        dockerfile_path = Path(__file__).parent.parent / "Dockerfile"
        dockerfile_dev_path = Path(__file__).parent.parent / "Dockerfile.dev"
        
        # Check if Dockerfile exists
        assert dockerfile_path.exists() or dockerfile_dev_path.exists(), "No Dockerfile found in project"
        
        # Choose existing Dockerfile
        dockerfile = dockerfile_path if dockerfile_path.exists() else dockerfile_dev_path
        
        with open(dockerfile, 'r') as f:
            content = f.read()
        
        # Check for best practices
        assert "FROM" in content, "Dockerfile must have FROM instruction"
        assert "WORKDIR" in content, "Dockerfile should specify WORKDIR"
        assert "COPY" in content or "ADD" in content, "Dockerfile should copy files"
        assert "RUN" in content, "Dockerfile should contain RUN commands"
        assert "CMD" in content or "ENTRYPOINT" in content, "Dockerfile should define CMD or ENTRYPOINT"


@pytest.mark.integration
class TestDockerBuild:
    """Tests for Docker build process."""
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_availability"), reason="Docker not available")
    def test_docker_build(self, docker_test_file):
        """Test Docker build process works."""
        image_name = "tap-test:build"
        
        # Build the test image
        build_result = subprocess.run(
            ["docker", "build", "-f", docker_test_file, "-t", image_name, "."],
            check=False,
            capture_output=True,
            text=True
        )
        
        # Check if build succeeded
        assert build_result.returncode == 0, f"Docker build failed: {build_result.stderr}"
        
        # Run the container to verify it works
        run_result = subprocess.run(
            ["docker", "run", "--rm", image_name],
            check=False,
            capture_output=True,
            text=True
        )
        
        # Check if container ran successfully
        assert run_result.returncode == 0, f"Docker container failed to run: {run_result.stderr}"
        assert "TAP Integration Platform Docker Test" in run_result.stdout
        
        # Clean up
        subprocess.run(["docker", "rmi", image_name], check=False)
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_availability"), reason="Docker not available")
    def test_project_dockerfile(self):
        """Test the project's Dockerfile builds successfully."""
        # Find project Dockerfile
        dockerfile_path = Path(__file__).parent.parent / "Dockerfile"
        dockerfile_dev_path = Path(__file__).parent.parent / "Dockerfile.dev"
        
        # Check if Dockerfile exists
        if not dockerfile_path.exists() and not dockerfile_dev_path.exists():
            pytest.skip("No Dockerfile found in project")
        
        # Choose existing Dockerfile
        dockerfile = dockerfile_path if dockerfile_path.exists() else dockerfile_dev_path
        
        # Set image name
        image_name = "tap-backend:test"
        
        # Build the image
        build_result = subprocess.run(
            ["docker", "build", "-f", str(dockerfile), "-t", image_name, str(dockerfile.parent)],
            check=False,
            capture_output=True,
            text=True
        )
        
        # Check if build succeeded
        assert build_result.returncode == 0, f"Project Dockerfile build failed: {build_result.stderr}"
        
        # Clean up
        subprocess.run(["docker", "rmi", image_name], check=False)


@pytest.mark.integration
class TestDockerCompose:
    """Tests for Docker Compose functionality."""
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_compose_availability"), reason="Docker Compose not available")
    def test_docker_compose_config(self, docker_compose_test_file):
        """Test Docker Compose configuration is valid."""
        # Validate docker-compose config
        result = subprocess.run(
            ["docker-compose", "-f", docker_compose_test_file, "config"],
            check=False,
            capture_output=True,
            text=True
        )
        
        # Check if validation succeeded
        assert result.returncode == 0, f"Docker Compose config validation failed: {result.stderr}"
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_compose_availability"), reason="Docker Compose not available")
    def test_project_docker_compose(self):
        """Test the project's docker-compose.yml is valid."""
        # Find project docker-compose.yml
        compose_path = Path(__file__).parent.parent.parent / "docker-compose.yml"
        
        # Check if docker-compose.yml exists
        if not compose_path.exists():
            compose_path = Path(__file__).parent.parent.parent / "docker-compose.dev.yml"
            if not compose_path.exists():
                pytest.skip("No docker-compose.yml found in project")
        
        # Validate docker-compose config
        result = subprocess.run(
            ["docker-compose", "-f", str(compose_path), "config"],
            check=False,
            capture_output=True,
            text=True
        )
        
        # Check if validation succeeded
        assert result.returncode == 0, f"Project docker-compose.yml validation failed: {result.stderr}"
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_compose_availability"), reason="Docker Compose not available")
    def test_docker_compose_up(self, docker_compose_test_file):
        """Test Docker Compose up works correctly."""
        # Run docker-compose up in detached mode
        up_result = subprocess.run(
            ["docker-compose", "-f", docker_compose_test_file, "up", "-d"],
            check=False,
            capture_output=True,
            text=True
        )
        
        try:
            # Check if docker-compose up succeeded
            assert up_result.returncode == 0, f"Docker Compose up failed: {up_result.stderr}"
            
            # Wait a moment for containers to start
            time.sleep(2)
            
            # Check if containers are running
            ps_result = subprocess.run(
                ["docker-compose", "-f", docker_compose_test_file, "ps", "-q"],
                check=False,
                capture_output=True,
                text=True
            )
            
            # There should be container IDs in the output
            assert ps_result.stdout.strip(), "No containers running after docker-compose up"
            
            # Check logs for app service
            logs_result = subprocess.run(
                ["docker-compose", "-f", docker_compose_test_file, "logs", "app"],
                check=False,
                capture_output=True,
                text=True
            )
            
            # Check if expected output is in logs
            assert "TAP Integration Platform Docker Compose Test" in logs_result.stdout
            
        finally:
            # Clean up - bring down the containers
            subprocess.run(
                ["docker-compose", "-f", docker_compose_test_file, "down"],
                check=False
            )


@pytest.mark.system
class TestDockerNetworking:
    """Tests for Docker networking functionality."""
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_availability"), reason="Docker not available")
    def test_container_port_mapping(self):
        """Test container port mapping works correctly."""
        container_name = "tap-port-test"
        host_port = 8080
        container_port = 80
        
        try:
            # Run a simple web server container
            run_result = subprocess.run(
                [
                    "docker", "run", "-d", "--name", container_name,
                    "-p", f"{host_port}:{container_port}",
                    "nginx:alpine"
                ],
                check=False,
                capture_output=True,
                text=True
            )
            
            # Check if container started
            assert run_result.returncode == 0, f"Failed to start container: {run_result.stderr}"
            
            # Wait a moment for container to start
            time.sleep(2)
            
            # Test connection to mapped port
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            result = s.connect_ex(('localhost', host_port))
            s.close()
            
            # Port should be open
            assert result == 0, f"Port {host_port} is not open"
            
        finally:
            # Clean up
            subprocess.run(["docker", "rm", "-f", container_name], check=False)
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_compose_availability"), reason="Docker Compose not available")
    def test_docker_compose_networking(self, docker_compose_test_file):
        """Test Docker Compose networking between containers."""
        # Create a custom docker-compose file with ping test
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.yml', delete=False) as temp_file:
            temp_file.write("""
version: '3.8'

services:
  app1:
    image: alpine:latest
    command: sh -c "ping -c 3 app2 && echo 'Network test successful'"
  app2:
    image: alpine:latest
    command: sleep 10
""")
            temp_file.flush()
            
            try:
                # Run docker-compose up
                up_result = subprocess.run(
                    ["docker-compose", "-f", temp_file.name, "up", "-d"],
                    check=False,
                    capture_output=True,
                    text=True
                )
                
                # Check if docker-compose up succeeded
                assert up_result.returncode == 0, f"Docker Compose up failed: {up_result.stderr}"
                
                # Wait for containers to communicate
                time.sleep(5)
                
                # Check logs for app1
                logs_result = subprocess.run(
                    ["docker-compose", "-f", temp_file.name, "logs", "app1"],
                    check=False,
                    capture_output=True,
                    text=True
                )
                
                # Check if ping was successful
                assert "bytes from app2" in logs_result.stdout, "Container network communication failed"
                assert "Network test successful" in logs_result.stdout, "Network test did not complete"
                
            finally:
                # Clean up
                subprocess.run(
                    ["docker-compose", "-f", temp_file.name, "down"],
                    check=False
                )
                os.unlink(temp_file.name)


@pytest.mark.edge
class TestDockerEdgeCases:
    """Tests for Docker edge cases."""
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_availability"), reason="Docker not available")
    def test_container_restart_policy(self):
        """Test container restart policy works correctly."""
        container_name = "tap-restart-test"
        
        try:
            # Run a container with restart policy
            run_result = subprocess.run(
                [
                    "docker", "run", "-d", "--name", container_name,
                    "--restart", "on-failure",
                    "alpine:latest", "sh", "-c", "exit 1"  # Command that fails
                ],
                check=False,
                capture_output=True,
                text=True
            )
            
            # Check if container started
            assert run_result.returncode == 0, f"Failed to start container: {run_result.stderr}"
            
            # Wait a moment for container to restart
            time.sleep(3)
            
            # Check container status
            inspect_result = subprocess.run(
                ["docker", "inspect", "--format='{{.RestartCount}}'", container_name],
                check=False,
                capture_output=True,
                text=True
            )
            
            # Container should have restarted at least once
            restart_count = int(inspect_result.stdout.strip().replace("'", ""))
            assert restart_count > 0, "Container did not restart despite failure"
            
        finally:
            # Clean up
            subprocess.run(["docker", "rm", "-f", container_name], check=False)
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_availability"), reason="Docker not available")
    def test_container_environment_variables(self):
        """Test container environment variables are set correctly."""
        container_name = "tap-env-test"
        
        try:
            # Run a container with environment variables
            run_result = subprocess.run(
                [
                    "docker", "run", "-d", "--name", container_name,
                    "-e", "TEST_VAR1=value1",
                    "-e", "TEST_VAR2=value2",
                    "alpine:latest", "sleep", "10"
                ],
                check=False,
                capture_output=True,
                text=True
            )
            
            # Check if container started
            assert run_result.returncode == 0, f"Failed to start container: {run_result.stderr}"
            
            # Check environment variables
            env_result = subprocess.run(
                ["docker", "exec", container_name, "sh", "-c", "env | grep TEST_VAR"],
                check=False,
                capture_output=True,
                text=True
            )
            
            # Check if variables are set
            assert "TEST_VAR1=value1" in env_result.stdout
            assert "TEST_VAR2=value2" in env_result.stdout
            
        finally:
            # Clean up
            subprocess.run(["docker", "rm", "-f", container_name], check=False)
    
    @pytest.mark.skipif(not pytest.mark.dependency("check_docker_availability"), reason="Docker not available")
    def test_container_volume_mounting(self):
        """Test container volume mounting works correctly."""
        container_name = "tap-volume-test"
        
        # Create a temporary file to mount
        with tempfile.NamedTemporaryFile(mode='w+', delete=False) as temp_file:
            temp_file.write("TAP Integration Platform Volume Test")
            temp_file.flush()
            
            try:
                # Run container with volume mount
                run_result = subprocess.run(
                    [
                        "docker", "run", "-d", "--name", container_name,
                        "-v", f"{temp_file.name}:/app/test_file.txt",
                        "alpine:latest", "sleep", "10"
                    ],
                    check=False,
                    capture_output=True,
                    text=True
                )
                
                # Check if container started
                assert run_result.returncode == 0, f"Failed to start container: {run_result.stderr}"
                
                # Check if file is accessible in container
                cat_result = subprocess.run(
                    ["docker", "exec", container_name, "cat", "/app/test_file.txt"],
                    check=False,
                    capture_output=True,
                    text=True
                )
                
                # Check file content
                assert "TAP Integration Platform Volume Test" in cat_result.stdout
                
            finally:
                # Clean up
                subprocess.run(["docker", "rm", "-f", container_name], check=False)
                os.unlink(temp_file.name)