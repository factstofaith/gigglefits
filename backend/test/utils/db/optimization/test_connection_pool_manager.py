"""
Tests for the ConnectionPoolManager class.
"""

import unittest
import time
import threading
from unittest import mock
import pytest
import sqlalchemy
from sqlalchemy.exc import OperationalError, DisconnectionError
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from utils.db.optimization import ConnectionPoolManager, ConnectionMetricsCollector

# Create a test model
Base = declarative_base()

class TestModel(Base):
    """Test model for database operations."""
    __tablename__ = 'test_model'
    id = Column(Integer, primary_key=True)
    name = Column(String)

# Use in-memory SQLite for testing
TEST_DB_URL = "sqlite:///:memory:"

class TestConnectionMetricsCollector(unittest.TestCase):
    """Test suite for ConnectionMetricsCollector."""
    
    def setUp(self):
        """Set up test environment."""
        self.metrics = ConnectionMetricsCollector(history_window=5)
    
    def test_record_checkout(self):
        """Test recording a connection checkout."""
        self.metrics.record_checkout('test_tenant', 0.1, 2)
        
        # Check metrics were recorded
        self.assertEqual(self.metrics.connections_in_use['test_tenant'], 1)
        self.assertEqual(self.metrics.total_checkouts['test_tenant'], 1)
        self.assertEqual(self.metrics.peak_connections['test_tenant'], 1)
        
        # Check wait time was recorded
        self.assertEqual(len(self.metrics.wait_times['test_tenant']), 1)
        
        # Record another checkout and verify peak increases
        self.metrics.record_checkout('test_tenant', 0.2, 1)
        self.assertEqual(self.metrics.connections_in_use['test_tenant'], 2)
        self.assertEqual(self.metrics.peak_connections['test_tenant'], 2)
    
    def test_record_checkin(self):
        """Test recording a connection check-in."""
        # First checkout a connection
        self.metrics.record_checkout('test_tenant', 0.1, 2)
        
        # Then check it in
        self.metrics.record_checkin('test_tenant', 1.5)
        
        # Check metrics were recorded
        self.assertEqual(self.metrics.connections_in_use['test_tenant'], 0)
        self.assertEqual(self.metrics.total_checkins['test_tenant'], 1)
        
        # Check checkout time was recorded
        self.assertEqual(len(self.metrics.checkout_times['test_tenant']), 1)
    
    def test_record_query(self):
        """Test recording a query execution."""
        self.metrics.record_query('test_tenant', 0.05)
        self.metrics.record_query('test_tenant', 0.10)
        
        # Check metrics were recorded
        self.assertEqual(self.metrics.query_counts['test_tenant'], 2)
        self.assertEqual(len(self.metrics.query_durations['test_tenant']), 2)
        
        # Check tenant metrics
        self.assertEqual(self.metrics.tenant_request_counts['test_tenant'], 2)
        self.assertAlmostEqual(self.metrics.tenant_avg_query_times['test_tenant'], 0.075)
    
    def test_record_error(self):
        """Test recording a connection error."""
        self.metrics.record_error('test_tenant')
        
        # Check metric was recorded
        self.assertEqual(self.metrics.connection_errors['test_tenant'], 1)
    
    def test_record_timeout(self):
        """Test recording a connection timeout."""
        self.metrics.record_timeout('test_tenant')
        
        # Check metric was recorded
        self.assertEqual(self.metrics.connection_timeouts['test_tenant'], 1)
    
    def test_get_metrics(self):
        """Test getting metrics."""
        # Add some metrics
        self.metrics.record_checkout('test_tenant', 0.1, 2)
        self.metrics.record_checkin('test_tenant', 1.5)
        self.metrics.record_query('test_tenant', 0.05)
        self.metrics.record_error('test_tenant')
        
        # Get metrics for specific tenant
        tenant_metrics = self.metrics.get_metrics('test_tenant')
        
        # Check tenant metrics
        self.assertEqual(tenant_metrics['connections_in_use'], 0)
        self.assertEqual(tenant_metrics['peak_connections'], 1)
        self.assertEqual(tenant_metrics['total_checkouts'], 1)
        self.assertEqual(tenant_metrics['total_checkins'], 1)
        self.assertEqual(tenant_metrics['connection_errors'], 1)
        self.assertEqual(tenant_metrics['query_count'], 1)
        
        # Get all metrics
        all_metrics = self.metrics.get_metrics()
        
        # Check global metrics
        self.assertEqual(all_metrics['global']['total_tenants'], 1)
        self.assertEqual(all_metrics['global']['total_connections_in_use'], 0)
        self.assertEqual(all_metrics['global']['total_peak_connections'], 1)
        self.assertEqual(all_metrics['global']['total_checkouts'], 1)
        self.assertEqual(all_metrics['global']['total_checkins'], 1)
        self.assertEqual(all_metrics['global']['total_errors'], 1)
        self.assertEqual(all_metrics['global']['total_queries'], 1)
        
        # Check tenant is included
        self.assertIn('test_tenant', all_metrics['tenants'])
    
    def test_get_pool_sizing_recommendation(self):
        """Test getting pool sizing recommendation."""
        # Add metrics for recommendation calculation
        for _ in range(10):
            self.metrics.record_checkout('test_tenant', 0.3, 2)
            self.metrics.record_checkin('test_tenant', 2.0)
            self.metrics.record_query('test_tenant', 0.1)
        
        # Get recommendation
        recommendation = self.metrics.get_pool_sizing_recommendation('test_tenant')
        
        # Check recommendation has expected fields
        self.assertIn('current_peak_connections', recommendation)
        self.assertIn('recommended_pool_size', recommendation)
        self.assertIn('recommended_max_overflow', recommendation)
        self.assertIn('recommendation_factors', recommendation)
        self.assertIn('metrics_used', recommendation)
        
        # Check recommendation is reasonable
        self.assertGreaterEqual(recommendation['recommended_pool_size'], 5)
        self.assertGreaterEqual(recommendation['recommended_max_overflow'], 5)
    
    def test_percentile_calculation(self):
        """Test percentile calculation."""
        data = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0]
        
        # 50th percentile should be 5.0
        self.assertEqual(self.metrics._percentile(data, 50), 5.0)
        
        # 90th percentile should be 9.0
        self.assertEqual(self.metrics._percentile(data, 90), 9.0)
        
        # Empty data should return 0
        self.assertEqual(self.metrics._percentile([], 90), 0.0)
    
    def test_clear_metrics(self):
        """Test clearing metrics."""
        # Add some metrics
        self.metrics.record_checkout('test_tenant', 0.1, 2)
        self.metrics.record_checkin('test_tenant', 1.5)
        self.metrics.record_query('test_tenant', 0.05)
        self.metrics.record_error('test_tenant')
        
        # Clear metrics
        self.metrics.clear_metrics()
        
        # Check metrics were cleared
        all_metrics = self.metrics.get_metrics()
        self.assertEqual(all_metrics['global']['total_tenants'], 0)
        self.assertEqual(all_metrics['global']['total_connections_in_use'], 0)
        self.assertEqual(all_metrics['global']['total_peak_connections'], 0)
        self.assertEqual(all_metrics['global']['total_checkouts'], 0)
        self.assertEqual(all_metrics['global']['total_checkins'], 0)
        self.assertEqual(all_metrics['global']['total_errors'], 0)
        self.assertEqual(all_metrics['global']['total_queries'], 0)


@pytest.mark.usefixtures("mock_settings")
class TestConnectionPoolManager:
    """Test suite for ConnectionPoolManager."""
    
    @pytest.fixture
    def mock_settings(self, monkeypatch):
        """Mock settings for testing."""
        mock_settings = mock.MagicMock()
        mock_settings.DATABASE_URL = TEST_DB_URL
        mock_settings.DB_POOL_SIZE = 5
        mock_settings.DB_MAX_OVERFLOW = 10
        mock_settings.DB_POOL_TIMEOUT = 30
        mock_settings.DB_SSL_REQUIRED = False
        mock_settings.DB_USE_CONNECTION_POOLING = True
        mock_settings.ENABLE_SQL_LOGGING = False
        
        monkeypatch.setattr('utils.db.optimization.connection_pool_manager.settings', mock_settings)
    
    @pytest.fixture
    def pool_manager(self):
        """Create a pool manager for testing."""
        manager = ConnectionPoolManager(
            db_url=TEST_DB_URL,
            min_pool_size=2,
            max_pool_size=5,
            max_overflow=3,
            pool_timeout=1,
            pool_recycle=300,
            enable_tenant_isolation=True,
            enable_auto_scaling=False,  # Disable for deterministic testing
            metrics_window=5
        )
        yield manager
        manager.dispose()
    
    def test_create_engine(self, pool_manager):
        """Test creating an engine."""
        engine = pool_manager.get_engine('test_tenant')
        
        # Check engine was created
        assert engine is not None
        assert 'test_tenant' in pool_manager.engines
        assert 'test_tenant' in pool_manager.session_factories
        assert 'test_tenant' in pool_manager.active_tenants
    
    def test_get_session_maker(self, pool_manager):
        """Test getting a session maker."""
        session_maker = pool_manager.get_session_maker('test_tenant')
        
        # Check session maker was created
        assert session_maker is not None
        assert callable(session_maker)
        
        # Create a session and check it works
        session = session_maker()
        assert session is not None
        
        # Clean up
        session.close()
    
    def test_session_scope(self, pool_manager):
        """Test session scope context manager."""
        # Create test table
        engine = pool_manager.get_engine('test_tenant')
        Base.metadata.create_all(engine)
        
        # Use session scope to add a record
        with pool_manager.session_scope('test_tenant') as session:
            test_model = TestModel(name='test')
            session.add(test_model)
        
        # Check record was added
        with pool_manager.session_scope('test_tenant') as session:
            result = session.query(TestModel).filter_by(name='test').first()
            assert result is not None
            assert result.name == 'test'
    
    def test_session_scope_rollback(self, pool_manager):
        """Test session scope rolls back on error."""
        # Create test table
        engine = pool_manager.get_engine('test_tenant')
        Base.metadata.create_all(engine)
        
        # Use session scope with an error
        try:
            with pool_manager.session_scope('test_tenant') as session:
                test_model = TestModel(name='test_rollback')
                session.add(test_model)
                raise ValueError("Test error")
        except ValueError:
            pass
        
        # Check record was not added
        with pool_manager.session_scope('test_tenant') as session:
            result = session.query(TestModel).filter_by(name='test_rollback').first()
            assert result is None
    
    def test_health_check(self, pool_manager):
        """Test health check."""
        # Create engine and check health
        engine = pool_manager.get_engine('test_tenant')
        health = pool_manager.health_check('test_tenant')
        
        # Check health is good
        assert health['status'] == 'healthy'
        assert 'pool_status' in health
        assert 'metrics' in health
    
    def test_health_check_no_engine(self, pool_manager):
        """Test health check for nonexistent tenant."""
        health = pool_manager.health_check('nonexistent')
        
        # Check health indicates no engine
        assert health['status'] == 'unknown'
        assert 'No engine found' in health['message']
    
    def test_get_metrics(self, pool_manager):
        """Test getting metrics."""
        # Create engine and generate some activity
        engine = pool_manager.get_engine('test_tenant')
        Base.metadata.create_all(engine)
        
        with pool_manager.session_scope('test_tenant') as session:
            test_model = TestModel(name='test')
            session.add(test_model)
        
        # Get metrics
        metrics = pool_manager.get_metrics('test_tenant')
        
        # Check metrics exist
        assert metrics is not None
        assert 'connections_in_use' in metrics
        assert 'peak_connections' in metrics
        assert 'total_checkouts' in metrics
        
        # Get all metrics
        all_metrics = pool_manager.get_metrics()
        
        # Check global metrics
        assert 'global' in all_metrics
        assert 'tenants' in all_metrics
        assert 'test_tenant' in all_metrics['tenants']
    
    def test_reset_metrics(self, pool_manager):
        """Test resetting metrics."""
        # Create engine and generate some activity
        engine = pool_manager.get_engine('test_tenant')
        Base.metadata.create_all(engine)
        
        with pool_manager.session_scope('test_tenant') as session:
            test_model = TestModel(name='test')
            session.add(test_model)
        
        # Reset metrics
        pool_manager.reset_metrics()
        
        # Check metrics were reset
        metrics = pool_manager.get_metrics('test_tenant')
        assert metrics['total_checkouts'] == 0
        assert metrics['total_checkins'] == 0
    
    def test_tenant_isolation(self, pool_manager):
        """Test tenant isolation."""
        # Create engines for two tenants
        engine1 = pool_manager.get_engine('tenant1')
        engine2 = pool_manager.get_engine('tenant2')
        
        # Check they are different engines
        assert engine1 is not engine2
        
        # Create test tables
        Base.metadata.create_all(engine1)
        Base.metadata.create_all(engine2)
        
        # Add a record for tenant1
        with pool_manager.session_scope('tenant1') as session:
            test_model = TestModel(name='tenant1_record')
            session.add(test_model)
        
        # Add a record for tenant2
        with pool_manager.session_scope('tenant2') as session:
            test_model = TestModel(name='tenant2_record')
            session.add(test_model)
        
        # Check tenant1 can see its record but not tenant2's
        with pool_manager.session_scope('tenant1') as session:
            result1 = session.query(TestModel).filter_by(name='tenant1_record').first()
            result2 = session.query(TestModel).filter_by(name='tenant2_record').first()
            assert result1 is not None
            assert result1.name == 'tenant1_record'
            assert result2 is None
        
        # Check tenant2 can see its record but not tenant1's
        with pool_manager.session_scope('tenant2') as session:
            result1 = session.query(TestModel).filter_by(name='tenant1_record').first()
            result2 = session.query(TestModel).filter_by(name='tenant2_record').first()
            assert result1 is None
            assert result2 is not None
            assert result2.name == 'tenant2_record'
    
    def test_disable_tenant_isolation(self):
        """Test disabling tenant isolation."""
        # Create pool manager with tenant isolation disabled
        manager = ConnectionPoolManager(
            db_url=TEST_DB_URL,
            min_pool_size=2,
            max_pool_size=5,
            max_overflow=3,
            pool_timeout=1,
            pool_recycle=300,
            enable_tenant_isolation=False,
            enable_auto_scaling=False
        )
        
        try:
            # Get engines for two tenants
            engine1 = manager.get_engine('tenant1')
            engine2 = manager.get_engine('tenant2')
            
            # Check they are the same engine
            assert engine1 is engine2
            
            # Check only default tenant exists
            assert 'default' in manager.engines
            assert 'tenant1' not in manager.engines
            assert 'tenant2' not in manager.engines
        finally:
            manager.dispose()
    
    def test_dispose(self, pool_manager):
        """Test disposing engines."""
        # Create engines for two tenants
        engine1 = pool_manager.get_engine('tenant1')
        engine2 = pool_manager.get_engine('tenant2')
        
        # Dispose tenant1 engine
        pool_manager.dispose('tenant1')
        
        # Check tenant1 engine is gone
        assert 'tenant1' not in pool_manager.engines
        assert 'tenant1' not in pool_manager.session_factories
        assert 'tenant1' not in pool_manager.active_tenants
        
        # Check tenant2 engine still exists
        assert 'tenant2' in pool_manager.engines
        
        # Dispose all engines
        pool_manager.dispose()
        
        # Check all engines are gone
        assert len(pool_manager.engines) == 0
        assert len(pool_manager.session_factories) == 0
        assert len(pool_manager.active_tenants) == 0


if __name__ == '__main__':
    unittest.main()