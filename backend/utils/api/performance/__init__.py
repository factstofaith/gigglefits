"""
API Performance Optimization Components

This package contains a collection of FastAPI middleware components designed
to optimize API performance, reduce latency, and improve resource utilization.

Components:
- BatchRequestProcessor: Handles multiple operations in a single request
- CacheManager: Implements HTTP caching with ETags
- PartialResponseHandler: Supports field filtering and pagination
- QueryOptimizationMiddleware: Optimizes query parameters
- RateLimiter: Implements request throttling with quotas
- ResponseCompression: Compresses HTTP responses
- StreamingResponseHandler: Streams large datasets efficiently
"""

from .batchrequestprocessor import BatchRequestProcessor