"""
Module for injecting mock services into the application.

This module provides functions to inject mock services into the application
during testing to replace external dependencies.

Author: TAP Integration Platform Team
Date: March 28, 2025
"""

import sys
import importlib
import logging
from unittest.mock import patch
from typing import Dict, Any, Optional, Callable

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mock_injector")

# Import mock services
from mock_services import (
    office365_oauth,
    gmail_oauth,
    email_service,
    s3_storage,
    azure_blob_storage
)

# Import test adapters
from test.test_adapters.auth.auth_adapter import AuthAdapter
from test.test_adapters.auth.mfa_adapter import MFAAdapter
from test.test_adapters.auth.invitation_adapter import InvitationAdapter


def inject_mock_oauth_providers():
    """
    Inject mock OAuth providers into the auth_module.
    
    This function replaces the real OAuth provider classes with mock implementations
    for testing.
    """
    try:
        # Import the auth_module
        from adapters import auth_module
        
        # Store original classes for restoration
        original_office365 = getattr(auth_module, "Office365OAuth", None)
        original_gmail = getattr(auth_module, "GmailOAuth", None)
        
        # Create mock classes that inherit but override key methods
        class MockedOffice365OAuth(auth_module.Office365OAuth):
            def exchange_code_for_token(self, code, redirect_uri, state=None):
                return office365_oauth.exchange_code_for_token(code, redirect_uri, state)
            
            def get_user_info(self, access_token):
                return office365_oauth.get_user_info(access_token)
            
            def get_auth_url(self, redirect_uri, state, scope=None):
                scope = scope or ["User.Read", "email", "profile"]
                return office365_oauth.generate_auth_url(redirect_uri, state, scope)
        
        class MockedGmailOAuth(auth_module.GmailOAuth):
            def exchange_code_for_token(self, code, redirect_uri, state=None):
                return gmail_oauth.exchange_code_for_token(code, redirect_uri, state)
            
            def get_user_info(self, access_token):
                return gmail_oauth.get_user_info(access_token)
            
            def get_auth_url(self, redirect_uri, state, scope=None):
                scope = scope or ["email", "profile"]
                return gmail_oauth.generate_auth_url(redirect_uri, state, scope)
        
        # Replace with mock implementations
        setattr(auth_module, "Office365OAuth", MockedOffice365OAuth)
        setattr(auth_module, "GmailOAuth", MockedGmailOAuth)
        
        logger.info("Injected mock OAuth providers")
        
        # Return a function to restore original implementations
        def restore():
            if original_office365:
                setattr(auth_module, "Office365OAuth", original_office365)
            if original_gmail:
                setattr(auth_module, "GmailOAuth", original_gmail)
            logger.info("Restored original OAuth providers")
        
        return restore
    
    except (ImportError, AttributeError) as e:
        logger.error(f"Failed to inject mock OAuth providers: {e}")
        return lambda: None  # Return a no-op restore function


def inject_mock_email_service():
    """
    Inject mock email service into the application.
    
    This function replaces the real email service with a mock implementation
    for testing.
    """
    try:
        # We need to find where the email service is defined
        # This might be in utils, modules, or a dedicated service
        # Let's check common locations
        for module_path in ["utils.email_service", "services.email_service", "modules.users.email_service"]:
            try:
                module = importlib.import_module(module_path)
                # Look for a send_email function
                original_send_email = getattr(module, "send_email", None)
                
                if original_send_email:
                    # Replace with mock implementation
                    def mock_send_email(to, subject, body, html_body=None, from_email=None, from_name=None):
                        return email_service.send_email(
                            to, subject, body, html_body, from_email, from_name
                        )
                    
                    setattr(module, "send_email", mock_send_email)
                    logger.info(f"Injected mock email service into {module_path}")
                    
                    # Return a function to restore original implementation
                    def restore():
                        setattr(module, "send_email", original_send_email)
                        logger.info(f"Restored original email service in {module_path}")
                    
                    return restore
            
            except ImportError:
                continue
        
        logger.warning("Could not find email service to mock")
        return lambda: None  # Return a no-op restore function
    
    except Exception as e:
        logger.error(f"Failed to inject mock email service: {e}")
        return lambda: None  # Return a no-op restore function


def inject_mock_storage_services():
    """
    Inject mock storage services into the application.
    
    This function replaces the real storage services with mock implementations
    for testing.
    """
    restore_functions = []
    
    # Mock S3 connector
    try:
        from adapters import s3_connector
        
        # Store original methods
        original_methods = {}
        
        # List of methods to mock
        methods_to_mock = [
            "upload_file",
            "download_file",
            "delete_file",
            "list_files"
        ]
        
        for method_name in methods_to_mock:
            if hasattr(s3_connector, method_name):
                original_method = getattr(s3_connector, method_name)
                original_methods[method_name] = original_method
                
                # Create mock method
                def create_mock_method(name):
                    def mock_method(*args, **kwargs):
                        # Call the corresponding method on our mock service
                        return getattr(s3_storage, name)(*args[1:], **kwargs)
                    return mock_method
                
                # Replace with mock implementation
                setattr(s3_connector, method_name, create_mock_method(method_name))
        
        logger.info("Injected mock S3 storage service")
        
        # Create restore function
        def restore_s3():
            for method_name, original_method in original_methods.items():
                setattr(s3_connector, method_name, original_method)
            logger.info("Restored original S3 storage service")
        
        restore_functions.append(restore_s3)
    
    except ImportError:
        logger.info("S3 connector not found, skipping mock injection")
    
    # Mock Azure Blob connector
    try:
        from adapters import azure_blob_connector
        
        # Store original methods
        original_methods = {}
        
        # List of methods to mock
        methods_to_mock = [
            "upload_file",
            "download_file",
            "delete_file",
            "list_files"
        ]
        
        for method_name in methods_to_mock:
            if hasattr(azure_blob_connector, method_name):
                original_method = getattr(azure_blob_connector, method_name)
                original_methods[method_name] = original_method
                
                # Create mock method
                def create_mock_method(name):
                    def mock_method(*args, **kwargs):
                        # Call the corresponding method on our mock service
                        return getattr(azure_blob_storage, name)(*args[1:], **kwargs)
                    return mock_method
                
                # Replace with mock implementation
                setattr(azure_blob_connector, method_name, create_mock_method(method_name))
        
        logger.info("Injected mock Azure Blob storage service")
        
        # Create restore function
        def restore_azure():
            for method_name, original_method in original_methods.items():
                setattr(azure_blob_connector, method_name, original_method)
            logger.info("Restored original Azure Blob storage service")
        
        restore_functions.append(restore_azure)
    
    except ImportError:
        logger.info("Azure Blob connector not found, skipping mock injection")
    
    # Return a combined restore function
    def restore_all():
        for restore_func in restore_functions:
            restore_func()
    
    return restore_all


def inject_test_adapters():
    """
    Register test adapters into the application.
    
    This function sets up test adapters for auth, MFA and invitation systems.
    """
    # Initialize adapters with default test data
    auth_adapter = AuthAdapter()
    mfa_adapter = MFAAdapter()
    invitation_adapter = InvitationAdapter()
    
    # Register the adapters in some global registry so they can be accessed
    # This is a simple implementation - in a real app you might have a more sophisticated
    # dependency injection system
    sys.modules['test.adapters_registry'] = type('AdaptersRegistry', (), {
        'auth_adapter': auth_adapter,
        'mfa_adapter': mfa_adapter,
        'invitation_adapter': invitation_adapter
    })
    
    logger.info("Registered test adapters")
    
    # Return a function to clean up
    def restore():
        if 'test.adapters_registry' in sys.modules:
            del sys.modules['test.adapters_registry']
        logger.info("Removed test adapters registry")
    
    return restore


def inject_all_mocks():
    """
    Inject all mock services into the application.

    This function replaces all external services with mock implementations
    for testing.
    """
    restore_functions = []
    
    # Inject OAuth providers
    restore_oauth = inject_mock_oauth_providers()
    restore_functions.append(restore_oauth)
    
    # Inject email service
    restore_email = inject_mock_email_service()
    restore_functions.append(restore_email)
    
    # Inject storage services
    restore_storage = inject_mock_storage_services()
    restore_functions.append(restore_storage)
    
    # Register test adapters
    restore_adapters = inject_test_adapters()
    restore_functions.append(restore_adapters)
    
    logger.info("Injected all mock services")
    
    # Return a combined restore function
    def restore_all():
        for restore_func in restore_functions:
            restore_func()
        logger.info("Restored all original services")
    
    return restore_all


# Create a test fixture for pytest
def pytest_mock_services_fixture(monkeypatch):
    """Pytest fixture for injecting mock services."""
    restore = inject_all_mocks()
    yield {
        "office365_oauth": office365_oauth,
        "gmail_oauth": gmail_oauth,
        "email_service": email_service,
        "s3_storage": s3_storage,
        "azure_blob_storage": azure_blob_storage
    }
    restore()