"""
Validation tests for tenant functionality
"""

import unittest
import sys
import os

# Add the parent directory to sys.path to make imports work correctly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class TestTenantValidation(unittest.TestCase):
    """Basic validation of tenant implementation"""
    
    def test_tenant_model_imports(self):
        """Test that tenant models can be imported"""
        from db.models import Tenant, TenantApplicationAssociation, TenantDatasetAssociation
        
        # If we get this far, the imports worked
        self.assertTrue(True)
    
    def test_tenant_relationships(self):
        """Test that tenant relationships are properly defined"""
        from db.models import Tenant, Application, Dataset
        
        # Check Application has tenants relationship
        app_relationships = [r for r in Application.__mapper__.relationships.keys()]
        self.assertIn('tenants', app_relationships)
        
        # Check Dataset has tenants relationship
        dataset_relationships = [r for r in Dataset.__mapper__.relationships.keys()]
        self.assertIn('tenants', dataset_relationships)
        
        # Check Tenant has applications relationship
        tenant_relationships = [r for r in Tenant.__mapper__.relationships.keys()]
        self.assertIn('applications', tenant_relationships)
        self.assertIn('datasets', tenant_relationships)
    
if __name__ == "__main__":
    unittest.main()