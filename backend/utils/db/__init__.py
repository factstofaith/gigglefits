"""
Database Utilities Package for TAP Integration Platform

This package provides standardized database access patterns, service abstractions,
connection management, and utilities for database operations.
"""

# Import core components for convenience
from .optimization import ConnectionPoolManager, ConnectionMetricsCollector
from .service import DatabaseService, DatabaseTransaction
from .database_factory import DatabaseFactory
from .init import DatabaseInitializer

__all__ = [
    'DatabaseService',
    'DatabaseTransaction',
    'DatabaseFactory',
    'DatabaseInitializer',
    'ConnectionPoolManager',
    'ConnectionMetricsCollector'
]