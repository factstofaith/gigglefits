#!/usr/bin/env python
"""
Test runner for the TAP Integration Platform.

This script sets up the test environment and runs the test suites.
It can be used to run all tests or specific test modules.

Usage:
    python run_tests.py                   # Run all tests
    python run_tests.py -k invitation     # Run tests containing 'invitation' in the name
    python run_tests.py test_invitation_workflow.py  # Run specific test file

Author: TAP Integration Platform Team
Updated: March 27, 2025
"""

import os
import sys
import pytest
import argparse
import logging
from datetime import datetime

# Configure logging
log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
logging.basicConfig(level=logging.INFO, format=log_format)
logger = logging.getLogger('test_runner')

# Path configuration
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.insert(0, backend_dir)  # Add backend dir to path


def setup_test_environment():
    """Set up the test environment variables"""
    logger.info("Setting up test environment")
    
    # Set environment variables for testing
    os.environ['TEST_MODE'] = 'true'
    os.environ['TEST_DATABASE_URL'] = 'sqlite:///test_db.sqlite'
    os.environ['JWT_SECRET_KEY'] = 'test_secret_key_for_jwt_tokens'
    os.environ['TEST_ADMIN_EMAIL'] = 'admin@test.com'
    os.environ['TEST_ADMIN_PASSWORD'] = 'admin123'
    os.environ['TEST_USER_EMAIL'] = 'user@test.com'
    os.environ['TEST_USER_PASSWORD'] = 'user123'
    os.environ['TEST_MFA_SECRET'] = 'ABCDEFGHIJKLMNOP'
    os.environ['MOCK_EMAIL_SERVER'] = 'true'
    os.environ['TEST_OAUTH_MOCK'] = 'true'
    
    # OAuth test configuration
    os.environ['TEST_OFFICE365_CLIENT_ID'] = 'mock_office365_client_id'
    os.environ['TEST_OFFICE365_CLIENT_SECRET'] = 'mock_office365_client_secret'
    os.environ['TEST_GMAIL_CLIENT_ID'] = 'mock_gmail_client_id'
    os.environ['TEST_GMAIL_CLIENT_SECRET'] = 'mock_gmail_client_secret'
    os.environ['TEST_OAUTH_REDIRECT_URI'] = 'http://localhost:8000/api/invitations/oauth/{provider}/callback'


def run_tests(args):
    """Run the tests with the given arguments"""
    logger.info(f"Running tests with args: {args}")
    
    # Create test arguments list
    test_args = []
    
    # Add test directory
    test_args.append(current_dir)
    
    # Add specific test file or pattern if provided
    if args.test_file:
        test_args.append(os.path.join(current_dir, args.test_file))
    
    # Add verbosity
    if args.verbose:
        test_args.append('-v')
    
    # Add keyword filter
    if args.keyword:
        test_args.extend(['-k', args.keyword])
    
    # Add xvs option if specified
    if args.xvs:
        test_args.append('-xvs')
    
    # Add coverage if requested
    if args.coverage:
        test_args.extend(['--cov=.', '--cov-report=html', '--cov-report=term'])
    
    # Generate test report if requested
    if args.report:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_path = os.path.join(backend_dir, f'test_report_{timestamp}.html')
        test_args.extend(['--html', report_path])
    
    # Run the tests
    logger.info(f"Running pytest with args: {test_args}")
    return_code = pytest.main(test_args)
    
    return return_code


def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Run backend tests')
    parser.add_argument('test_file', nargs='?', help='Specific test file to run')
    parser.add_argument('-k', '--keyword', help='Only run tests matching the given keyword expression')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    parser.add_argument('-c', '--coverage', action='store_true', help='Generate coverage report')
    parser.add_argument('-r', '--report', action='store_true', help='Generate HTML test report')
    parser.add_argument('-x', '--xvs', action='store_true', help='Exit on first failure')
    parser.add_argument('-l', '--legacy', action='store_true', help='Run legacy unittest tests (tenant, controller)')
    
    return parser.parse_args()


def run_legacy_tests():
    """Run legacy tests and return the success status"""
    # Import the legacy test modules
    from test_tenant_service import TestTenantService
    from test_tenant_controller import TestTenantController
    from test_release_service import TestReleaseService
    
    logger.info("Running legacy unittest tests")
    
    # Create a test suite
    import unittest
    test_suite = unittest.TestSuite()
    
    # Add all test cases
    test_suite.addTest(unittest.makeSuite(TestTenantService))
    test_suite.addTest(unittest.makeSuite(TestTenantController))
    test_suite.addTest(unittest.makeSuite(TestReleaseService))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Return success status (0 for success, 1 for failure)
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    # Parse command line arguments
    args = parse_arguments()
    
    # Setup test environment
    setup_test_environment()
    
    # Inject mock services if not using legacy tests
    if not args.legacy:
        try:
            from mock_injector import inject_all_mocks
            logger.info("Injecting mock services for tests...")
            restore_mocks = inject_all_mocks()
        except ImportError:
            logger.warning("Failed to import mock_injector, mock services will not be available")
            restore_mocks = lambda: None
    
    try:
        # Run either legacy unittest tests or pytest tests
        if args.legacy:
            exit_code = run_legacy_tests()
        else:
            exit_code = run_tests(args)
    finally:
        # Restore any mocked services
        if not args.legacy:
            try:
                logger.info("Restoring original services...")
                restore_mocks()
            except Exception as e:
                logger.error(f"Error restoring original services: {e}")
    
    # List of all available tests with remarks
    print("\nAvailable test modules:")
    print("----------------------")
    print("1. test_api_authorization.py - API authorization tests")
    print("2. test_invitation_workflow.py - Invitation workflow tests")
    print("3. test_mfa_integration.py - MFA integration tests (REQUIRES DB)")
    print("4. test_mfa_integration_simplified_v2.py - Simplified MFA tests with mock adapters")
    print("5. test_oauth_integration.py - OAuth integration tests (REQUIRES DB)")
    print("6. test_oauth_integration_simplified.py - Simplified OAuth tests with mock adapters")
    print("7. test_onboarding_mfa.py - Onboarding MFA tests (REQUIRES DB)")
    print("8. test_onboarding_mfa_simplified.py - Simplified Onboarding MFA tests with mock adapters")
    
    # Exit with the test result
    sys.exit(exit_code)