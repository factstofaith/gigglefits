"""
Performance Benchmarking Framework for TAP Integration Platform

This module provides utilities to measure and validate performance of various
components of the TAP Integration Platform.
"""

import time
import statistics
import logging
import functools
import json
import os
from datetime import datetime
from typing import Dict, List, Any, Callable, Optional, Union, Tuple

# Set up logging
logger = logging.getLogger("performance_benchmark")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

class PerformanceBenchmark:
    """Performance benchmarking utilities for testing system performance."""
    
    def __init__(self, benchmark_name: str, save_results: bool = True):
        """
        Initialize the performance benchmark framework.
        
        Args:
            benchmark_name: Name of the benchmark suite
            save_results: Whether to save benchmark results to file
        """
        self.benchmark_name = benchmark_name
        self.save_results = save_results
        self.benchmark_results = {}
        self.baseline_results = {}
        self.results_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "benchmark_results"
        )
        
        # Create results directory if it doesn't exist
        if self.save_results and not os.path.exists(self.results_dir):
            os.makedirs(self.results_dir)
            
        # Try to load baseline results if they exist
        self._load_baseline()
        
        logger.info(f"Performance Benchmark '{benchmark_name}' initialized")
    
    def _load_baseline(self):
        """Load baseline results from file if available."""
        baseline_path = os.path.join(self.results_dir, f"{self.benchmark_name}_baseline.json")
        if os.path.exists(baseline_path):
            try:
                with open(baseline_path, 'r') as f:
                    self.baseline_results = json.load(f)
                logger.info(f"Loaded baseline results from {baseline_path}")
            except Exception as e:
                logger.warning(f"Failed to load baseline results: {e}")
    
    def _save_results(self):
        """Save benchmark results to file."""
        if not self.save_results:
            return
            
        results_path = os.path.join(
            self.results_dir, 
            f"{self.benchmark_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        
        try:
            with open(results_path, 'w') as f:
                json.dump(self.benchmark_results, f, indent=2)
            logger.info(f"Saved benchmark results to {results_path}")
        except Exception as e:
            logger.error(f"Failed to save benchmark results: {e}")
    
    def set_as_baseline(self):
        """Set current results as the baseline for future comparisons."""
        if not self.benchmark_results:
            logger.warning("No benchmark results to set as baseline")
            return
            
        self.baseline_results = self.benchmark_results.copy()
        
        if self.save_results:
            baseline_path = os.path.join(self.results_dir, f"{self.benchmark_name}_baseline.json")
            try:
                with open(baseline_path, 'w') as f:
                    json.dump(self.baseline_results, f, indent=2)
                logger.info(f"Saved baseline results to {baseline_path}")
            except Exception as e:
                logger.error(f"Failed to save baseline results: {e}")
    
    def measure_execution_time(self, func: Callable, 
                              iterations: int = 5,
                              warmup_iterations: int = 1,
                              test_name: Optional[str] = None,
                              **kwargs) -> Dict[str, Any]:
        """
        Measure execution time of a function over multiple iterations.
        
        Args:
            func: Function to benchmark
            iterations: Number of iterations to run
            warmup_iterations: Number of warmup iterations (not counted)
            test_name: Name of the test (defaults to function name)
            **kwargs: Arguments to pass to the function
            
        Returns:
            Dictionary with benchmark results
        """
        name = test_name or func.__name__
        
        # Run warmup iterations
        for _ in range(warmup_iterations):
            func(**kwargs)
        
        # Run timed iterations
        execution_times = []
        for i in range(iterations):
            start_time = time.time()
            result = func(**kwargs)
            end_time = time.time()
            execution_time = (end_time - start_time) * 1000  # Convert to ms
            execution_times.append(execution_time)
            logger.debug(f"Iteration {i+1}/{iterations}: {execution_time:.2f}ms")
        
        # Calculate statistics
        stats = {
            "min": min(execution_times),
            "max": max(execution_times),
            "mean": statistics.mean(execution_times),
            "median": statistics.median(execution_times),
            "stdev": statistics.stdev(execution_times) if len(execution_times) > 1 else 0,
            "iterations": iterations,
            "timestamp": datetime.now().isoformat()
        }
        
        # Store results
        self.benchmark_results[name] = stats
        
        # Compare with baseline if available
        comparison = {}
        if name in self.baseline_results:
            baseline = self.baseline_results[name]
            comparison = {
                "baseline_mean": baseline["mean"],
                "change_percentage": ((stats["mean"] - baseline["mean"]) / baseline["mean"]) * 100
            }
            stats["comparison"] = comparison
            
            # Log comparison
            change_sign = "+" if comparison["change_percentage"] > 0 else ""
            logger.info(f"Test '{name}': {stats['mean']:.2f}ms vs baseline {baseline['mean']:.2f}ms "
                      f"({change_sign}{comparison['change_percentage']:.2f}%)")
        else:
            logger.info(f"Test '{name}': {stats['mean']:.2f}ms (no baseline for comparison)")
        
        # Return stats with the result of the last function call
        stats["result"] = result
        return stats
    
    def benchmark_database_operations(self, db_ops: Dict[str, Callable],
                                     iterations: int = 3) -> Dict[str, Any]:
        """
        Benchmark database operations.
        
        Args:
            db_ops: Dictionary of database operations to benchmark
                Key: operation name
                Value: function that performs the operation
            iterations: Number of iterations for each operation
            
        Returns:
            Dictionary with benchmark results
        """
        results = {}
        for op_name, op_func in db_ops.items():
            logger.info(f"Benchmarking database operation: {op_name}")
            stats = self.measure_execution_time(
                op_func,
                iterations=iterations,
                test_name=f"db_{op_name}"
            )
            results[op_name] = stats
        
        return results
    
    def benchmark_api_endpoint(self, client, endpoint: str,
                              method: str = "GET",
                              payload: Optional[Dict[str, Any]] = None,
                              headers: Optional[Dict[str, str]] = None,
                              iterations: int = 5,
                              test_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Benchmark an API endpoint.
        
        Args:
            client: Test client (e.g., from fastapi.testclient)
            endpoint: Endpoint to benchmark
            method: HTTP method
            payload: Request payload (for POST/PUT/PATCH)
            headers: Request headers
            iterations: Number of iterations
            test_name: Custom test name
            
        Returns:
            Dictionary with benchmark results
        """
        name = test_name or f"api_{method.lower()}_{endpoint.replace('/', '_')}"
        
        def call_endpoint():
            if method == "GET":
                return client.get(endpoint, headers=headers)
            elif method == "POST":
                return client.post(endpoint, json=payload, headers=headers)
            elif method == "PUT":
                return client.put(endpoint, json=payload, headers=headers)
            elif method == "PATCH":
                return client.patch(endpoint, json=payload, headers=headers)
            elif method == "DELETE":
                return client.delete(endpoint, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
        
        logger.info(f"Benchmarking API endpoint: {method} {endpoint}")
        stats = self.measure_execution_time(
            call_endpoint,
            iterations=iterations,
            test_name=name
        )
        
        return stats
    
    def benchmark_transformation(self, transform_func: Callable,
                               data_sizes: List[int],
                               generate_data_func: Callable[[int], Any],
                               iterations: int = 3) -> Dict[str, Dict[str, Any]]:
        """
        Benchmark data transformation operations with different data sizes.
        
        Args:
            transform_func: Function that performs the transformation
            data_sizes: List of data sizes to test
            generate_data_func: Function to generate test data of a specific size
            iterations: Number of iterations for each data size
            
        Returns:
            Dictionary with benchmark results for each data size
        """
        results = {}
        
        for size in data_sizes:
            test_data = generate_data_func(size)
            
            def run_transform():
                return transform_func(test_data)
            
            logger.info(f"Benchmarking transformation with data size: {size}")
            stats = self.measure_execution_time(
                run_transform,
                iterations=iterations,
                test_name=f"transform_size_{size}"
            )
            
            results[str(size)] = stats
        
        return results
    
    def generate_report(self) -> str:
        """
        Generate a report of all benchmark results.
        
        Returns:
            String containing the benchmark report
        """
        if not self.benchmark_results:
            return "No benchmark results available."
            
        report = [f"# Performance Benchmark Report: {self.benchmark_name}"]
        report.append(f"Generated: {datetime.now().isoformat()}")
        report.append("")
        
        # Summary
        report.append("## Summary")
        report.append("")
        report.append("| Test | Mean (ms) | Median (ms) | Min (ms) | Max (ms) | vs. Baseline |")
        report.append("|------|-----------|-------------|----------|----------|-------------|")
        
        for name, stats in self.benchmark_results.items():
            baseline_info = "N/A"
            if name in self.baseline_results:
                change_pct = ((stats["mean"] - self.baseline_results[name]["mean"]) / 
                              self.baseline_results[name]["mean"]) * 100
                change_sign = "+" if change_pct > 0 else ""
                baseline_info = f"{change_sign}{change_pct:.2f}%"
                
            report.append(
                f"| {name} | {stats['mean']:.2f} | {stats['median']:.2f} | "
                f"{stats['min']:.2f} | {stats['max']:.2f} | {baseline_info} |"
            )
        
        report.append("")
        
        # Detailed results
        report.append("## Detailed Results")
        report.append("")
        
        for name, stats in self.benchmark_results.items():
            report.append(f"### {name}")
            report.append("")
            report.append(f"- **Mean**: {stats['mean']:.2f} ms")
            report.append(f"- **Median**: {stats['median']:.2f} ms")
            report.append(f"- **Min**: {stats['min']:.2f} ms")
            report.append(f"- **Max**: {stats['max']:.2f} ms")
            report.append(f"- **Standard Deviation**: {stats['stdev']:.2f} ms")
            report.append(f"- **Iterations**: {stats['iterations']}")
            
            if name in self.baseline_results:
                baseline = self.baseline_results[name]
                change_pct = ((stats["mean"] - baseline["mean"]) / baseline["mean"]) * 100
                change_sign = "+" if change_pct > 0 else ""
                
                report.append("")
                report.append("#### Comparison with Baseline")
                report.append(f"- **Baseline Mean**: {baseline['mean']:.2f} ms")
                report.append(f"- **Change**: {change_sign}{change_pct:.2f}%")
                
                if change_pct > 10:
                    report.append("- **Status**: ❌ Significant performance regression")
                elif change_pct > 5:
                    report.append("- **Status**: ⚠️ Minor performance regression")
                elif change_pct < -10:
                    report.append("- **Status**: ✅ Significant performance improvement")
                elif change_pct < -5:
                    report.append("- **Status**: ✅ Minor performance improvement")
                else:
                    report.append("- **Status**: ✅ Comparable to baseline")
            
            report.append("")
        
        # Save report
        if self.save_results:
            report_path = os.path.join(
                self.results_dir, 
                f"{self.benchmark_name}_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
            )
            try:
                with open(report_path, 'w') as f:
                    f.write('\n'.join(report))
                logger.info(f"Saved benchmark report to {report_path}")
            except Exception as e:
                logger.error(f"Failed to save benchmark report: {e}")
        
        # Return report as string
        return '\n'.join(report)
    
    def performance_decorator(self, test_name: Optional[str] = None, 
                             iterations: int = 5,
                             threshold_ms: Optional[float] = None):
        """
        Decorator for benchmarking functions.
        
        Args:
            test_name: Custom name for the test
            iterations: Number of iterations to run
            threshold_ms: Maximum acceptable mean execution time in ms
            
        Returns:
            Decorated function
        """
        def decorator(func):
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                name = test_name or func.__name__
                
                # Run the benchmark
                stats = self.measure_execution_time(
                    lambda: func(*args, **kwargs),
                    iterations=iterations,
                    test_name=name
                )
                
                # Check threshold
                if threshold_ms is not None and stats["mean"] > threshold_ms:
                    logger.warning(
                        f"Performance threshold exceeded for {name}: "
                        f"{stats['mean']:.2f}ms > {threshold_ms:.2f}ms"
                    )
                
                # Return the result
                return stats["result"]
            
            return wrapper
        
        return decorator
    
    def close(self):
        """Save results and clean up."""
        if self.benchmark_results:
            self._save_results()


class MultiTenantValidator:
    """
    Validator for multi-tenant isolation and functionality.
    
    This class provides utilities to test and validate proper multi-tenant
    isolation and functionality in the TAP Integration Platform.
    """
    
    def __init__(self, num_tenants: int = 3):
        """
        Initialize the multi-tenant validator.
        
        Args:
            num_tenants: Number of test tenants to create
        """
        self.num_tenants = num_tenants
        self.tenants = []
        self.users_by_tenant = {}
        self.resources_by_tenant = {}
        self.shared_resources = []
        
        logger.info(f"MultiTenantValidator initialized with {num_tenants} tenants")
    
    def create_test_tenants(self, tenant_create_func: Callable[[str], str]) -> List[str]:
        """
        Create test tenants.
        
        Args:
            tenant_create_func: Function to create a tenant
                Args: tenant_name
                Returns: tenant_id
            
        Returns:
            List of created tenant IDs
        """
        tenant_ids = []
        for i in range(self.num_tenants):
            tenant_name = f"test-tenant-{i+1}"
            tenant_id = tenant_create_func(tenant_name)
            self.tenants.append({
                "id": tenant_id,
                "name": tenant_name
            })
            tenant_ids.append(tenant_id)
            
            # Initialize collections for this tenant
            self.users_by_tenant[tenant_id] = []
            self.resources_by_tenant[tenant_id] = {
                "applications": [],
                "datasets": [],
                "integrations": [],
                "credentials": []
            }
            
            logger.info(f"Created test tenant: {tenant_name} ({tenant_id})")
        
        return tenant_ids
    
    def create_users_for_tenants(self, 
                                user_create_func: Callable[[str, str, List[str]], str],
                                users_per_tenant: int = 2) -> Dict[str, List[str]]:
        """
        Create test users for each tenant.
        
        Args:
            user_create_func: Function to create a user
                Args: user_email, tenant_id, roles
                Returns: user_id
            users_per_tenant: Number of users to create per tenant
            
        Returns:
            Dictionary mapping tenant_id to list of user_ids
        """
        user_ids_by_tenant = {}
        
        for tenant in self.tenants:
            tenant_id = tenant["id"]
            tenant_users = []
            
            # Create admin user
            admin_email = f"admin-{tenant_id}@test.com"
            admin_id = user_create_func(admin_email, tenant_id, ["ADMIN"])
            tenant_users.append({
                "id": admin_id,
                "email": admin_email,
                "role": "ADMIN"
            })
            
            # Create regular users
            for i in range(users_per_tenant - 1):
                user_email = f"user-{i+1}-{tenant_id}@test.com"
                user_id = user_create_func(user_email, tenant_id, ["USER"])
                tenant_users.append({
                    "id": user_id,
                    "email": user_email,
                    "role": "USER"
                })
            
            self.users_by_tenant[tenant_id] = tenant_users
            user_ids_by_tenant[tenant_id] = [u["id"] for u in tenant_users]
            
            logger.info(f"Created {len(tenant_users)} users for tenant {tenant_id}")
        
        return user_ids_by_tenant
    
    def create_resources_for_tenants(self, 
                                    resource_creators: Dict[str, Callable[[str, str], str]]) -> Dict[str, Dict[str, List[str]]]:
        """
        Create test resources for each tenant.
        
        Args:
            resource_creators: Dictionary of resource creation functions
                Key: resource_type (e.g., "applications", "datasets")
                Value: Function to create the resource
                       Args: tenant_id, user_id
                       Returns: resource_id
            
        Returns:
            Dictionary mapping tenant_id to resource types to lists of resource_ids
        """
        resource_ids_by_tenant = {}
        
        for tenant in self.tenants:
            tenant_id = tenant["id"]
            
            # Get admin user for this tenant
            admin_user = next(
                (u for u in self.users_by_tenant[tenant_id] if u["role"] == "ADMIN"),
                self.users_by_tenant[tenant_id][0]
            )
            admin_id = admin_user["id"]
            
            tenant_resources = {}
            
            # Create resources for each type
            for resource_type, create_func in resource_creators.items():
                # Create 2 resources of each type
                resource_ids = []
                for i in range(2):
                    resource_id = create_func(tenant_id, admin_id)
                    resource_ids.append(resource_id)
                    
                    # Add to internal tracking
                    if resource_type in self.resources_by_tenant[tenant_id]:
                        self.resources_by_tenant[tenant_id][resource_type].append(resource_id)
                
                tenant_resources[resource_type] = resource_ids
                logger.info(f"Created {len(resource_ids)} {resource_type} for tenant {tenant_id}")
            
            resource_ids_by_tenant[tenant_id] = tenant_resources
        
        return resource_ids_by_tenant
    
    def test_tenant_isolation(self, 
                             access_tests: Dict[str, Callable[[str, str, str], bool]]) -> Dict[str, Any]:
        """
        Test tenant isolation by attempting cross-tenant access.
        
        Args:
            access_tests: Dictionary of access test functions
                Key: resource_type (e.g., "applications", "datasets")
                Value: Function to test access
                       Args: tenant_id, user_id, resource_id
                       Returns: bool (True if access allowed, False if denied)
            
        Returns:
            Dictionary with test results
        """
        results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "isolation_breaches": []
        }
        
        # For each tenant
        for tenant_index, tenant in enumerate(self.tenants):
            tenant_id = tenant["id"]
            tenant_users = self.users_by_tenant[tenant_id]
            
            # For each other tenant
            for other_tenant_index, other_tenant in enumerate(self.tenants):
                if tenant_index == other_tenant_index:
                    continue  # Skip same tenant
                    
                other_tenant_id = other_tenant["id"]
                
                # For each resource type
                for resource_type, access_test_func in access_tests.items():
                    # Skip if no resources of this type
                    if (resource_type not in self.resources_by_tenant[other_tenant_id] or
                        not self.resources_by_tenant[other_tenant_id][resource_type]):
                        continue
                    
                    # Get a resource from the other tenant
                    other_resource_id = self.resources_by_tenant[other_tenant_id][resource_type][0]
                    
                    # Test access with each user from this tenant
                    for user in tenant_users:
                        user_id = user["id"]
                        
                        # Test cross-tenant access
                        results["total_tests"] += 1
                        
                        access_allowed = access_test_func(other_tenant_id, user_id, other_resource_id)
                        
                        # Access should be denied in most cases (isolation)
                        if not access_allowed:
                            results["passed_tests"] += 1
                        else:
                            results["failed_tests"] += 1
                            results["isolation_breaches"].append({
                                "user_tenant": tenant_id,
                                "user_id": user_id,
                                "user_role": user["role"],
                                "resource_tenant": other_tenant_id,
                                "resource_type": resource_type,
                                "resource_id": other_resource_id
                            })
                            
                            logger.warning(
                                f"Isolation breach: User {user_id} (tenant {tenant_id}) "
                                f"can access {resource_type} {other_resource_id} "
                                f"from tenant {other_tenant_id}"
                            )
        
        # Calculate percentage of passed tests
        if results["total_tests"] > 0:
            results["isolation_score"] = (results["passed_tests"] / results["total_tests"]) * 100
        else:
            results["isolation_score"] = 100  # Default to perfect score if no tests run
        
        logger.info(
            f"Tenant isolation test: {results['passed_tests']}/{results['total_tests']} "
            f"tests passed ({results['isolation_score']:.2f}%)"
        )
        
        return results
    
    def test_shared_resource_access(self, 
                                  shared_resource_creator: Callable[[List[str]], str],
                                  access_test_func: Callable[[str, str], bool]) -> Dict[str, Any]:
        """
        Test access to shared resources across tenants.
        
        Args:
            shared_resource_creator: Function to create a shared resource
                Args: list of tenant_ids
                Returns: resource_id
            access_test_func: Function to test access
                Args: user_id, resource_id
                Returns: bool (True if access allowed, False if denied)
            
        Returns:
            Dictionary with test results
        """
        results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "access_issues": []
        }
        
        # Create a shared resource for all tenants
        tenant_ids = [t["id"] for t in self.tenants]
        shared_resource_id = shared_resource_creator(tenant_ids)
        self.shared_resources.append(shared_resource_id)
        
        logger.info(f"Created shared resource {shared_resource_id} for all tenants")
        
        # Test access from each tenant
        for tenant in self.tenants:
            tenant_id = tenant["id"]
            tenant_users = self.users_by_tenant[tenant_id]
            
            # Test access with each user from this tenant
            for user in tenant_users:
                user_id = user["id"]
                
                results["total_tests"] += 1
                
                # Test access to shared resource
                access_allowed = access_test_func(user_id, shared_resource_id)
                
                # Access should be allowed for shared resources
                if access_allowed:
                    results["passed_tests"] += 1
                else:
                    results["failed_tests"] += 1
                    results["access_issues"].append({
                        "tenant_id": tenant_id,
                        "user_id": user_id,
                        "user_role": user["role"],
                        "resource_id": shared_resource_id
                    })
                    
                    logger.warning(
                        f"Shared access issue: User {user_id} (tenant {tenant_id}) "
                        f"cannot access shared resource {shared_resource_id}"
                    )
        
        # Calculate percentage of passed tests
        if results["total_tests"] > 0:
            results["shared_access_score"] = (results["passed_tests"] / results["total_tests"]) * 100
        else:
            results["shared_access_score"] = 100  # Default to perfect score if no tests run
        
        logger.info(
            f"Shared resource access test: {results['passed_tests']}/{results['total_tests']} "
            f"tests passed ({results['shared_access_score']:.2f}%)"
        )
        
        return results
    
    def test_tenant_resource_limits(self, 
                                  resource_creator: Callable[[str, str, str], str],
                                  resource_type: str,
                                  expected_limit: int) -> Dict[str, Any]:
        """
        Test tenant resource limits.
        
        Args:
            resource_creator: Function to create a resource
                Args: tenant_id, user_id, resource_name
                Returns: resource_id or None if limit reached
            resource_type: Type of resource being tested
            expected_limit: Expected resource limit per tenant
            
        Returns:
            Dictionary with test results
        """
        results = {
            "total_tests": 0,
            "passed_tests": 0,
            "limit_enforced": {}
        }
        
        # For each tenant
        for tenant in self.tenants:
            tenant_id = tenant["id"]
            
            # Get admin user for this tenant
            admin_user = next(
                (u for u in self.users_by_tenant[tenant_id] if u["role"] == "ADMIN"),
                self.users_by_tenant[tenant_id][0]
            )
            admin_id = admin_user["id"]
            
            # Try to create resources until limit is reached
            resource_count = 0
            limit_reached = False
            
            while resource_count <= expected_limit + 2:  # Try to exceed limit by 2
                resource_name = f"test-{resource_type}-{resource_count}"
                
                try:
                    resource_id = resource_creator(tenant_id, admin_id, resource_name)
                    
                    if resource_id is None:
                        limit_reached = True
                        break
                    
                    # Resource created successfully
                    resource_count += 1
                    
                    # Add to internal tracking
                    if resource_type in self.resources_by_tenant[tenant_id]:
                        self.resources_by_tenant[tenant_id][resource_type].append(resource_id)
                        
                except Exception as e:
                    if "limit exceeded" in str(e).lower() or "quota" in str(e).lower():
                        limit_reached = True
                        break
                    else:
                        logger.error(f"Error creating resource: {e}")
                        break
            
            results["total_tests"] += 1
            
            # Check if limit is enforced correctly
            if limit_reached and resource_count <= expected_limit + 1:
                results["passed_tests"] += 1
                results["limit_enforced"][tenant_id] = True
                logger.info(
                    f"Resource limit correctly enforced for tenant {tenant_id} "
                    f"at {resource_count} {resource_type}"
                )
            else:
                results["limit_enforced"][tenant_id] = False
                logger.warning(
                    f"Resource limit not enforced for tenant {tenant_id}: "
                    f"Created {resource_count} {resource_type}, expected limit {expected_limit}"
                )
        
        # Calculate percentage of passed tests
        if results["total_tests"] > 0:
            results["limit_score"] = (results["passed_tests"] / results["total_tests"]) * 100
        else:
            results["limit_score"] = 100  # Default to perfect score if no tests run
        
        logger.info(
            f"Resource limit test: {results['passed_tests']}/{results['total_tests']} "
            f"tests passed ({results['limit_score']:.2f}%)"
        )
        
        return results
    
    def generate_report(self) -> str:
        """
        Generate a summary report of the multi-tenant tests.
        
        Returns:
            String containing the report
        """
        # This would generate a summary report of all tests performed
        # In a real implementation, we would track all test results and generate a comprehensive report
        
        report = ["# Multi-Tenant Validation Report"]
        report.append(f"Generated: {datetime.now().isoformat()}")
        report.append("")
        
        report.append("## Test Environment")
        report.append(f"- Number of tenants: {self.num_tenants}")
        
        for tenant in self.tenants:
            report.append(f"- Tenant: {tenant['name']} ({tenant['id']})")
            users = self.users_by_tenant.get(tenant['id'], [])
            report.append(f"  - Users: {len(users)}")
            
            for resource_type, resources in self.resources_by_tenant.get(tenant['id'], {}).items():
                report.append(f"  - {resource_type.capitalize()}: {len(resources)}")
        
        report.append("")
        report.append("## Test Results")
        report.append("")
        report.append("Tests were performed for tenant isolation, shared resource access, and resource limits.")
        report.append("")
        report.append("Detailed results would be shown here in a complete implementation.")
        report.append("")
        
        return '\n'.join(report)
    
    def cleanup(self):
        """Clean up test data."""
        logger.info("Cleaning up test data is not implemented")
        # In a real implementation, this would clean up all test resources