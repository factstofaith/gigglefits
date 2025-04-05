#!/usr/bin/env python
"""
Verify Health Endpoints Script

This script tests the health check endpoints of the TAP Integration Platform backend
to ensure they are working properly. It makes requests to both the simple `/health`
endpoint for container health checks and the comprehensive `/api/health` endpoint
for system monitoring.

Usage:
    python verify_health_endpoints.py [--host HOST] [--port PORT]

Arguments:
    --host HOST   The host to connect to (default: localhost)
    --port PORT   The port to connect to (default: 8000)
"""

import argparse
import json
import sys
import requests
from requests.exceptions import RequestException
import time


def check_endpoint(url, endpoint_name):
    """Check a health endpoint and print the result."""
    try:
        print(f"Checking {endpoint_name} endpoint: {url}")
        start_time = time.time()
        response = requests.get(url, timeout=5)
        elapsed_time = time.time() - start_time
        
        print(f"✓ Response time: {elapsed_time*1000:.2f}ms")
        print(f"✓ Status code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                status = data.get("status", "unknown")
                print(f"✓ Health status: {status}")
                
                # Pretty print JSON response
                print("\nResponse details:")
                print(json.dumps(data, indent=2))
                
                return True, data
            except ValueError:
                print("✗ Error: Invalid JSON response")
                return False, None
        else:
            print(f"✗ Error: Unexpected status code {response.status_code}")
            return False, None
    except RequestException as e:
        print(f"✗ Error: Could not connect to endpoint: {e}")
        return False, None


def main():
    """Main function to verify health endpoints."""
    parser = argparse.ArgumentParser(description="Verify health endpoints of the TAP Integration Platform backend")
    parser.add_argument("--host", default="localhost", help="Host to connect to (default: localhost)")
    parser.add_argument("--port", default="8000", help="Port to connect to (default: 8000)")
    args = parser.parse_args()
    
    base_url = f"http://{args.host}:{args.port}"
    
    print(f"Verifying health endpoints on {base_url}\n")
    
    # Check simple health endpoint
    simple_success, _ = check_endpoint(f"{base_url}/health", "Simple health")
    
    print("\n" + "-" * 50 + "\n")
    
    # Check comprehensive health endpoint
    comprehensive_success, health_data = check_endpoint(f"{base_url}/api/health", "Comprehensive health")
    
    print("\n" + "-" * 50 + "\n")
    
    # Summary
    print("Health Check Summary:")
    print(f"✓ Simple health endpoint: {'Available' if simple_success else 'Not available'}")
    print(f"✓ Comprehensive health endpoint: {'Available' if comprehensive_success else 'Not available'}")
    
    if comprehensive_success and health_data:
        status = health_data.get("status", "unknown")
        if status == "ok":
            print(f"✓ System health: Good")
        elif status == "degraded":
            print(f"⚠ System health: Degraded - Check the response for details")
        else:
            print(f"✗ System health: {status.capitalize()}")
        
        # Check individual components
        if "checks" in health_data:
            checks = health_data["checks"]
            for component, check in checks.items():
                status = check.get("status", "unknown")
                status_symbol = "✓" if status == "ok" else "⚠" if status == "warning" else "✗"
                print(f"{status_symbol} {component.capitalize()}: {status.capitalize()}")
    
    # Return exit code based on health status
    if simple_success and comprehensive_success:
        if health_data and health_data.get("status") == "ok":
            print("\nAll health checks passed!")
            return 0
        elif health_data and health_data.get("status") == "degraded":
            print("\nSystem is running but in a degraded state")
            return 1
        else:
            print("\nSystem health is not optimal")
            return 2
    else:
        print("\nHealth check verification failed")
        return 3


if __name__ == "__main__":
    sys.exit(main())