"""
Tests for database validation functionality
"""

import unittest
import sys
import os
from unittest.mock import patch, MagicMock, call

# Add the parent directory to sys.path to make imports work correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class TestDatabaseValidation(unittest.TestCase):
    """Test cases for database validation at startup"""
    
    @patch('db.base.inspect')
    @patch('db.run_migrations.run_migrations')
    def test_initialize_db_validates_tables(self, mock_run_migrations, mock_inspect):
        """Test that initialize_db validates required tables"""
        from db.base import initialize_db
        
        # Setup mocks
        mock_inspector = MagicMock()
        mock_inspect.return_value = mock_inspector
        
        # Set up mock inspector to return tables
        mock_inspector.get_table_names.return_value = [
            'tenants', 
            'tenant_application_associations', 
            'tenant_dataset_associations',
            'applications',
            'datasets',
            'integrations',
            'webhook_logs'
        ]
        
        # Mock foreign keys
        mock_inspector.get_foreign_keys.return_value = [
            {'constrained_columns': ['tenant_id']},
            {'constrained_columns': ['application_id']}
        ]
        
        # Call the function
        initialize_db()
        
        # Check that run_migrations was called
        mock_run_migrations.assert_called_once()
        
        # Check that the inspector was called to get table names
        mock_inspector.get_table_names.assert_called_once()
        
        # Check that foreign keys were checked for tenant association tables
        mock_inspector.get_foreign_keys.assert_any_call('tenant_application_associations')
        mock_inspector.get_foreign_keys.assert_any_call('tenant_dataset_associations')
    
    @patch('db.base.inspect')
    @patch('db.run_migrations.run_migrations')
    @patch('db.base.logger')
    def test_initialize_db_warns_on_missing_tables(self, mock_logger, mock_run_migrations, mock_inspect):
        """Test that initialize_db warns when required tables are missing"""
        from db.base import initialize_db
        
        # Setup mocks
        mock_inspector = MagicMock()
        mock_inspect.return_value = mock_inspector
        
        # Set up mock inspector to return incomplete tables
        mock_inspector.get_table_names.return_value = [
            'applications',
            'datasets',
            'integrations'
        ]
        
        # Call the function
        initialize_db()
        
        # Check that a warning was logged
        mock_logger.warning.assert_any_call("Missing required tables: tenants, tenant_application_associations, tenant_dataset_associations, webhook_logs")
        mock_logger.warning.assert_any_call("Some application features may not work correctly")

if __name__ == "__main__":
    unittest.main()