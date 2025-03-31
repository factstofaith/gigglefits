"""
Test adapters package for mock API endpoints.

This package provides test adapters that mock the behavior of real adapters
without requiring external dependencies.
"""

# Expose the entity registry at the package level
from .entity_registry import EntityRegistry, BaseTestAdapter, global_registry

# Expose the storage testing framework
from .storage_test_framework import MockStorageProvider, BaseStorageAdapter, StorageTestBase

# Expose the admin test adapter
from .admin_adapter import AdminTestAdapter

# Expose the integration test adapter
from .integrations.integration_adapter import IntegrationAdapter

# Expose the earnings test adapter
from .earnings_adapter import EarningsTestAdapter

# Expose the error handling framework
from .error_handling_framework import ErrorHandlingTestAdapter, ErrorHandlingServiceTest, ErrorType, ErrorInjector

# Expose the service test framework
from .service_test_framework import BaseServiceTest, ServiceTestAdapter

# Expose the scheduler test adapter
from .scheduler_adapter import SchedulerTestAdapter

# Expose the integration runner test adapter
from .integration_runner_adapter import IntegrationRunnerTestAdapter

# Expose the file type utilities test adapter
from .file_type_utilities_adapter import FileTypeUtilitiesAdapter

# Expose the transformation registry test adapter
from .transformation_registry_adapter import TransformationRegistryTestAdapter

# Expose the helpers test adapter
from .helpers_adapter import HelpersTestAdapter

# Expose the E2E test adapter
from .e2e_adapter import E2EAdapter