"""
Multi-Tenant Validator Adapter

This module provides a comprehensive adapter for validating multi-tenant
isolation and functionality in the TAP Integration Platform.
"""

import logging
import uuid
import json
import os
from datetime import datetime
from typing import Dict, List, Any, Callable, Optional

# Import framework components
from test_adapters.performance_benchmark_framework import MultiTenantValidator

# Set up logging
logger = logging.getLogger("multi_tenant_validator")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

class MultiTenantValidatorAdapter:
    """
    Adapter for validating multi-tenant functionality in the TAP Integration Platform.
    
    This adapter provides methods to test tenant isolation, shared resource access,
    cross-tenant operations, and tenant resource limits.
    """
    
    def __init__(self, registry=None, auth_adapter=None, admin_adapter=None, 
                integration_adapter=None, credential_manager_adapter=None):
        """
        Initialize the multi-tenant validator adapter.
        
        Args:
            registry: Entity registry for cross-adapter communication
            auth_adapter: AuthAdapter instance
            admin_adapter: AdminAdapter instance
            integration_adapter: IntegrationAdapter instance
            credential_manager_adapter: CredentialManagerAdapter instance
        """
        self.registry = registry
        self.auth_adapter = auth_adapter
        self.admin_adapter = admin_adapter
        self.integration_adapter = integration_adapter
        self.credential_manager_adapter = credential_manager_adapter
        
        self.validator = MultiTenantValidator(num_tenants=3)
        self.test_environments = {}
        self.results_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "validation_results"
        )
        
        # Create results directory if it doesn't exist
        if not os.path.exists(self.results_dir):
            os.makedirs(self.results_dir)
        
        logger.info("MultiTenantValidatorAdapter initialized")
    
    def setup_test_environment(self) -> Dict[str, Any]:
        """
        Set up a test environment with multiple tenants and users.
        
        Returns:
            Dictionary with test environment information
        """
        env_id = f"mti_env_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Create tenants
        logger.info("Creating test tenants...")
        tenant_ids = self.validator.create_test_tenants(
            lambda name: self.admin_adapter.create_tenant({
                "name": name,
                "status": "active",
                "tier": "standard"
            })["id"]
        )
        
        # Create users for each tenant
        logger.info("Creating test users...")
        user_ids = self.validator.create_users_for_tenants(
            lambda email, tenant_id, roles: self.auth_adapter.add_user({
                "id": str(uuid.uuid4()),
                "email": email,
                "name": email.split("@")[0],
                "tenant_id": tenant_id,
                "role": roles[0]
            }).id,
            users_per_tenant=3
        )
        
        # Create resources for each tenant
        logger.info("Creating test resources...")
        resource_ids = self.validator.create_resources_for_tenants({
            "applications": lambda tenant_id, user_id: self.admin_adapter.create_application({
                "name": f"Test App for {tenant_id}",
                "description": "Multi-tenant test application",
                "status": "active"
            }, user_id)["id"],
            
            "datasets": lambda tenant_id, user_id: self.admin_adapter.create_dataset({
                "name": f"Test Dataset for {tenant_id}",
                "description": "Multi-tenant test dataset",
                "status": "active"
            }, user_id)["id"],
            
            "integrations": lambda tenant_id, user_id: self.integration_adapter.create_integration({
                "name": f"Test Integration for {tenant_id}",
                "description": "Multi-tenant test integration",
                "status": "active",
                "tenant_id": tenant_id,
                "owner_id": user_id
            })["id"],
            
            "credentials": lambda tenant_id, user_id: self.credential_manager_adapter.store_credential(
                tenant_id=tenant_id,
                credential_id=f"credential-{tenant_id}-{uuid.uuid4()}",
                credential_type="api_key",
                data={"api_key": f"test-key-{tenant_id}"},
                user_id=user_id
            )
        })
        
        # Store environment information
        self.test_environments[env_id] = {
            "tenant_ids": tenant_ids,
            "user_ids": user_ids,
            "resource_ids": resource_ids,
            "created_at": datetime.now().isoformat()
        }
        
        logger.info(f"Test environment {env_id} created with {len(tenant_ids)} tenants")
        return self.test_environments[env_id]
    
    def test_tenant_isolation(self, env_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Test tenant isolation across resources.
        
        Args:
            env_id: Test environment ID (optional)
            
        Returns:
            Dictionary with test results
        """
        if env_id and env_id not in self.test_environments:
            logger.error(f"Unknown environment ID: {env_id}")
            return {"error": "Unknown environment ID"}
        
        # Use the latest environment if none specified
        if not env_id:
            env_id = sorted(self.test_environments.keys())[-1] if self.test_environments else None
            
        if not env_id:
            logger.error("No test environment available")
            return {"error": "No test environment available"}
        
        logger.info(f"Testing tenant isolation for environment {env_id}...")
        
        # Define access test functions
        access_tests = {
            "applications": lambda tenant_id, user_id, resource_id: self._test_application_access(
                tenant_id, user_id, resource_id
            ),
            
            "datasets": lambda tenant_id, user_id, resource_id: self._test_dataset_access(
                tenant_id, user_id, resource_id
            ),
            
            "integrations": lambda tenant_id, user_id, resource_id: self._test_integration_access(
                tenant_id, user_id, resource_id
            ),
            
            "credentials": lambda tenant_id, user_id, resource_id: self._test_credential_access(
                tenant_id, user_id, resource_id
            )
        }
        
        # Run isolation tests
        results = self.validator.test_tenant_isolation(access_tests)
        
        # Save test results
        self._save_test_results("tenant_isolation", env_id, results)
        
        # Generate isolation report
        if results["isolation_score"] < 100:
            logger.warning(
                f"Tenant isolation score: {results['isolation_score']:.2f}% - "
                f"{results['failed_tests']} isolation breaches detected"
            )
            
            for breach in results.get("isolation_breaches", []):
                logger.warning(
                    f"Isolation breach: User {breach['user_id']} (tenant {breach['user_tenant']}) "
                    f"can access {breach['resource_type']} {breach['resource_id']} "
                    f"from tenant {breach['resource_tenant']}"
                )
        else:
            logger.info(f"Tenant isolation score: 100% - Perfect isolation confirmed")
        
        return results
    
    def test_shared_resource_access(self, env_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Test access to shared resources across tenants.
        
        Args:
            env_id: Test environment ID (optional)
            
        Returns:
            Dictionary with test results
        """
        if env_id and env_id not in self.test_environments:
            logger.error(f"Unknown environment ID: {env_id}")
            return {"error": "Unknown environment ID"}
        
        # Use the latest environment if none specified
        if not env_id:
            env_id = sorted(self.test_environments.keys())[-1] if self.test_environments else None
            
        if not env_id:
            logger.error("No test environment available")
            return {"error": "No test environment available"}
        
        logger.info(f"Testing shared resource access for environment {env_id}...")
        
        # Get tenant IDs from the environment
        tenant_ids = self.test_environments[env_id]["tenant_ids"]
        
        # Define shared resource creator
        def create_shared_resource(tenant_ids):
            # Create a shared dataset accessible by all tenants
            admin_user_id = next(iter(self.validator.users_by_tenant[tenant_ids[0]]))["id"]
            
            dataset = self.admin_adapter.create_dataset({
                "name": "Shared Test Dataset",
                "description": "Multi-tenant shared test dataset",
                "status": "active",
                "is_shared": True,
                "shared_with_tenants": tenant_ids
            }, admin_user_id)
            
            return dataset["id"]
        
        # Define access test function
        def test_access(user_id, resource_id):
            try:
                dataset = self.admin_adapter.get_dataset(resource_id, user_id)
                return dataset is not None
            except Exception:
                return False
        
        # Run shared resource access tests
        results = self.validator.test_shared_resource_access(
            create_shared_resource,
            test_access
        )
        
        # Save test results
        self._save_test_results("shared_resource_access", env_id, results)
        
        # Generate access report
        if results["shared_access_score"] < 100:
            logger.warning(
                f"Shared resource access score: {results['shared_access_score']:.2f}% - "
                f"{results['failed_tests']} access issues detected"
            )
            
            for issue in results.get("access_issues", []):
                logger.warning(
                    f"Shared access issue: User {issue['user_id']} (tenant {issue['tenant_id']}) "
                    f"cannot access shared resource {issue['resource_id']}"
                )
        else:
            logger.info(f"Shared resource access score: 100% - Perfect access confirmed")
        
        return results
    
    def test_resource_limits(self, env_id: Optional[str] = None) -> Dict[str, Dict[str, Any]]:
        """
        Test tenant resource limits.
        
        Args:
            env_id: Test environment ID (optional)
            
        Returns:
            Dictionary with test results for each resource type
        """
        if env_id and env_id not in self.test_environments:
            logger.error(f"Unknown environment ID: {env_id}")
            return {"error": "Unknown environment ID"}
        
        # Use the latest environment if none specified
        if not env_id:
            env_id = sorted(self.test_environments.keys())[-1] if self.test_environments else None
            
        if not env_id:
            logger.error("No test environment available")
            return {"error": "No test environment available"}
        
        logger.info(f"Testing resource limits for environment {env_id}...")
        
        # Define resource limits to test
        resource_limits = {
            "applications": 10,
            "datasets": 20,
            "integrations": 5
        }
        
        # Define resource creator functions
        resource_creators = {
            "applications": lambda tenant_id, user_id, name: self.admin_adapter.create_application({
                "name": name,
                "description": "Resource limit test application",
                "status": "active"
            }, user_id)["id"],
            
            "datasets": lambda tenant_id, user_id, name: self.admin_adapter.create_dataset({
                "name": name,
                "description": "Resource limit test dataset",
                "status": "active"
            }, user_id)["id"],
            
            "integrations": lambda tenant_id, user_id, name: self.integration_adapter.create_integration({
                "name": name,
                "description": "Resource limit test integration",
                "status": "active",
                "tenant_id": tenant_id,
                "owner_id": user_id
            })["id"]
        }
        
        # Run limit tests for each resource type
        results = {}
        for resource_type, limit in resource_limits.items():
            logger.info(f"Testing {resource_type} limit of {limit}...")
            
            results[resource_type] = self.validator.test_tenant_resource_limits(
                resource_creators[resource_type],
                resource_type,
                limit
            )
            
            # Save test results
            self._save_test_results(f"resource_limits_{resource_type}", env_id, results[resource_type])
        
        # Generate combined results
        combined_results = {
            "overall_limit_score": statistics.mean(
                [r["limit_score"] for r in results.values()]
            ) if results else 0,
            "resource_types_tested": len(results),
            "resource_types": list(results.keys()),
            "results_by_type": results
        }
        
        # Save combined results
        self._save_test_results("resource_limits_combined", env_id, combined_results)
        
        return results
    
    def test_cross_tenant_operations(self, env_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Test cross-tenant operations with super admin privileges.
        
        Args:
            env_id: Test environment ID (optional)
            
        Returns:
            Dictionary with test results
        """
        if env_id and env_id not in self.test_environments:
            logger.error(f"Unknown environment ID: {env_id}")
            return {"error": "Unknown environment ID"}
        
        # Use the latest environment if none specified
        if not env_id:
            env_id = sorted(self.test_environments.keys())[-1] if self.test_environments else None
            
        if not env_id:
            logger.error("No test environment available")
            return {"error": "No test environment available"}
        
        logger.info(f"Testing cross-tenant operations for environment {env_id}...")
        
        # Create a super admin user for testing
        super_admin = self.auth_adapter.add_user({
            "id": str(uuid.uuid4()),
            "email": "super_admin@test.com",
            "name": "Super Admin",
            "role": "SUPER_ADMIN",
            "tenant_id": None  # Super admin is not tied to a specific tenant
        })
        
        # Get tenant IDs from the environment
        tenant_ids = self.test_environments[env_id]["tenant_ids"]
        
        # Define test operations
        test_operations = {
            "list_all_tenants": {
                "function": lambda: self.admin_adapter.get_tenants(user_id=super_admin.id),
                "validation": lambda result: len(result) >= len(tenant_ids),
                "expected": True
            },
            "get_tenant_details": {
                "function": lambda: self.admin_adapter.get_tenant(tenant_ids[0], user_id=super_admin.id),
                "validation": lambda result: result["id"] == tenant_ids[0],
                "expected": True
            },
            "create_cross_tenant_association": {
                "function": lambda: self._create_cross_tenant_association(
                    super_admin.id, tenant_ids[0], tenant_ids[1]
                ),
                "validation": lambda result: result["success"] is True,
                "expected": True
            }
        }
        
        # Run tests
        results = {
            "total_tests": len(test_operations),
            "passed_tests": 0,
            "failed_tests": 0,
            "operations": {}
        }
        
        for op_name, op_config in test_operations.items():
            logger.info(f"Testing operation: {op_name}")
            
            try:
                # Run the operation
                op_result = op_config["function"]()
                
                # Validate the result
                validation_result = op_config["validation"](op_result)
                expected_result = op_config["expected"]
                
                if validation_result == expected_result:
                    results["passed_tests"] += 1
                    success = True
                    logger.info(f"Operation {op_name} passed validation")
                else:
                    results["failed_tests"] += 1
                    success = False
                    logger.warning(
                        f"Operation {op_name} failed validation: "
                        f"got {validation_result}, expected {expected_result}"
                    )
                
                results["operations"][op_name] = {
                    "success": success,
                    "validation_result": validation_result,
                    "expected_result": expected_result
                }
            except Exception as e:
                results["failed_tests"] += 1
                logger.error(f"Operation {op_name} raised an exception: {e}")
                
                results["operations"][op_name] = {
                    "success": False,
                    "error": str(e)
                }
        
        # Calculate success percentage
        if results["total_tests"] > 0:
            results["success_percentage"] = (results["passed_tests"] / results["total_tests"]) * 100
        else:
            results["success_percentage"] = 0
        
        # Save test results
        self._save_test_results("cross_tenant_operations", env_id, results)
        
        return results
    
    def _test_application_access(self, tenant_id, user_id, resource_id):
        """Test if a user can access an application from a different tenant."""
        try:
            app = self.admin_adapter.get_application(resource_id, user_id)
            return app is not None
        except Exception:
            return False
    
    def _test_dataset_access(self, tenant_id, user_id, resource_id):
        """Test if a user can access a dataset from a different tenant."""
        try:
            dataset = self.admin_adapter.get_dataset(resource_id, user_id)
            return dataset is not None
        except Exception:
            return False
    
    def _test_integration_access(self, tenant_id, user_id, resource_id):
        """Test if a user can access an integration from a different tenant."""
        try:
            integration = self.integration_adapter.get_integration(resource_id, user_id)
            return integration is not None
        except Exception:
            return False
    
    def _test_credential_access(self, tenant_id, user_id, resource_id):
        """Test if a user can access a credential from a different tenant."""
        try:
            credential = self.credential_manager_adapter.retrieve_credential(
                tenant_id=tenant_id,
                credential_id=resource_id,
                user_id=user_id
            )
            return credential is not None
        except Exception:
            return False
    
    def _create_cross_tenant_association(self, super_admin_id, tenant_id1, tenant_id2):
        """Create a cross-tenant association (for testing super admin capabilities)."""
        try:
            # Create an application
            app = self.admin_adapter.create_application({
                "name": "Cross-Tenant Test App",
                "description": "Test application for cross-tenant operations",
                "status": "active"
            }, super_admin_id)
            
            # Associate with both tenants
            self.admin_adapter.associate_application_with_tenant(
                tenant_id1, app["id"], super_admin_id
            )
            
            self.admin_adapter.associate_application_with_tenant(
                tenant_id2, app["id"], super_admin_id
            )
            
            # Verify associations
            tenant1_apps = self.admin_adapter.get_tenant_applications(tenant_id1)
            tenant2_apps = self.admin_adapter.get_tenant_applications(tenant_id2)
            
            app_in_tenant1 = any(a["id"] == app["id"] for a in tenant1_apps)
            app_in_tenant2 = any(a["id"] == app["id"] for a in tenant2_apps)
            
            return {
                "success": app_in_tenant1 and app_in_tenant2,
                "application_id": app["id"]
            }
        except Exception as e:
            logger.error(f"Error creating cross-tenant association: {e}")
            return {"success": False, "error": str(e)}
    
    def _save_test_results(self, test_type, env_id, results):
        """
        Save test results to file.
        
        Args:
            test_type: Type of test
            env_id: Test environment ID
            results: Test results
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        result_file = os.path.join(
            self.results_dir, 
            f"{test_type}_{env_id}_{timestamp}.json"
        )
        
        try:
            with open(result_file, 'w') as f:
                json.dump(results, f, indent=2)
            logger.info(f"Test results saved to {result_file}")
        except Exception as e:
            logger.error(f"Failed to save test results: {e}")
    
    def generate_multi_tenant_report(self, env_id: Optional[str] = None) -> str:
        """
        Generate a comprehensive multi-tenant validation report.
        
        Args:
            env_id: Test environment ID (optional)
            
        Returns:
            String containing the report
        """
        if env_id and env_id not in self.test_environments:
            logger.error(f"Unknown environment ID: {env_id}")
            return "Error: Unknown environment ID"
        
        # Use the latest environment if none specified
        if not env_id:
            env_id = sorted(self.test_environments.keys())[-1] if self.test_environments else None
            
        if not env_id:
            logger.error("No test environment available")
            return "Error: No test environment available"
        
        logger.info(f"Generating multi-tenant validation report for environment {env_id}...")
        
        # Generate report using validator
        report = self.validator.generate_report()
        
        # Save report to file
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_path = os.path.join(
            self.results_dir, 
            f"multi_tenant_report_{env_id}_{timestamp}.md"
        )
        
        try:
            with open(report_path, 'w') as f:
                f.write(report)
            logger.info(f"Multi-tenant validation report saved to {report_path}")
        except Exception as e:
            logger.error(f"Failed to save multi-tenant validation report: {e}")
        
        return report
    
    def reset(self):
        """Reset the adapter state."""
        self.test_environments = {}
        self.validator = MultiTenantValidator(num_tenants=3)
        logger.info("MultiTenantValidatorAdapter reset")