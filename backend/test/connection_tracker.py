# connection_tracker.py
#
# A comprehensive utility for tracking database connections in pytest tests.
# This module monitors connection usage, detects leaks, and ensures proper cleanup.
#
# Usage:
#   1. Add to conftest.py:
#      from connection_tracker import ConnectionTracker
#      connection_tracker = ConnectionTracker()
#
#   2. Register with pytest:
#      def pytest_configure(config):
#          config.pluginmanager.register(connection_tracker)

import time
import datetime
import threading
import logging
import weakref
import gc
import atexit
import os
import sys
import pytest
import traceback
import json
from contextlib import contextmanager
from typing import Dict, List, Set, Optional, Any, Tuple, Union

# Configure logging
logger = logging.getLogger("connection_tracker")
logger.setLevel(logging.INFO)

# Create handlers
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Output directory for logs and reports
output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../test_reports")
os.makedirs(output_dir, exist_ok=True)

# Create file handler
log_file = os.path.join(output_dir, f"connection_tracker_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
file_handler = logging.FileHandler(log_file)
file_handler.setLevel(logging.DEBUG)

# Create formatters
console_formatter = logging.Formatter("[%(name)s] %(levelname)s: %(message)s")
file_formatter = logging.Formatter("[%(asctime)s] [%(name)s] %(levelname)s: %(message)s")

# Add formatters to handlers
console_handler.setFormatter(console_formatter)
file_handler.setFormatter(file_formatter)

# Add handlers to logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)

class ConnectionTracker:
    """
    A pytest plugin that tracks database connections throughout test execution.
    It monitors connection opening/closing, detects leaks, and ensures proper cleanup.
    """
    
    def __init__(self):
        self.active_connections: Dict[int, Dict[str, Any]] = {}
        self.connection_history: List[Dict[str, Any]] = []
        self.test_connections: Dict[str, Set[int]] = {}
        self.test_start_times: Dict[str, float] = {}
        self.test_connection_counts: Dict[str, Dict[str, int]] = {}
        self.lock = threading.RLock()
        self.setup_hooks()
        self._enabled = True
        self.report_path = os.path.join(output_dir, f"connection_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        atexit.register(self.cleanup)
        
        # Statistics
        self.total_connections = 0
        self.max_concurrent_connections = 0
        self.leaked_connections = 0
        
    def setup_hooks(self):
        """Set up hooks to track SQLAlchemy connections"""
        try:
            from sqlalchemy import event
            from sqlalchemy.engine import Engine
            
            # Try to import the db engine from the project
            try:
                # Option 1: Import from the backend db module
                from backend.db.base import engine
                self._register_engine_hooks(engine)
                logger.info("Registered connection tracking with backend.db.base engine")
            except ImportError:
                # Option 2: Look for engines in the environment
                logger.warning("Could not import engine from backend.db.base, attempting to discover engines")
                
                # Search for engines in loaded modules
                engines = []
                for module_name, module in sys.modules.items():
                    if hasattr(module, 'engine') and hasattr(module.engine, 'connect'):
                        engines.append(module.engine)
                
                if engines:
                    for i, engine in enumerate(engines):
                        self._register_engine_hooks(engine)
                        logger.info(f"Discovered and registered engine #{i+1} from {engine.__module__}")
                else:
                    # Option 3: Register hooks for all Engine instances
                    @event.listens_for(Engine, "connect")
                    def connect(dbapi_connection, connection_record):
                        self._on_connect(dbapi_connection, connection_record)
                    
                    @event.listens_for(Engine, "checkout")
                    def checkout(dbapi_connection, connection_record, connection_proxy):
                        self._on_checkout(dbapi_connection, connection_record, connection_proxy)
                    
                    @event.listens_for(Engine, "checkin")
                    def checkin(dbapi_connection, connection_record):
                        self._on_checkin(dbapi_connection, connection_record)
                    
                    logger.info("Registered global connection tracking with all SQLAlchemy engines")
                
        except ImportError:
            logger.warning("SQLAlchemy not found, connection tracking will be limited")
    
    def _register_engine_hooks(self, engine):
        """Register event hooks for a specific SQLAlchemy engine"""
        from sqlalchemy import event
        
        event.listen(engine, "connect", self._on_connect)
        event.listen(engine, "checkout", self._on_checkout)
        event.listen(engine, "checkin", self._on_checkin)
    
    def _on_connect(self, dbapi_connection, connection_record):
        """Called when a new connection is created"""
        if not self._enabled:
            return
        
        with self.lock:
            conn_id = id(dbapi_connection)
            stack = traceback.extract_stack()
            
            # Filter out SQLAlchemy internals from the stack
            filtered_stack = [frame for frame in stack if 'sqlalchemy' not in frame.filename]
            
            # Get the current test if running in pytest
            current_test = self._get_current_test()
            
            self.active_connections[conn_id] = {
                'id': conn_id,
                'created_at': time.time(),
                'created_by': current_test or 'unknown',
                'stack': [f"{frame.filename}:{frame.lineno}" for frame in filtered_stack[-5:]], 
                'checkin_count': 0,
                'checkout_count': 0,
                'last_checkout': None,
            }
            
            self.total_connections += 1
            
            if len(self.active_connections) > self.max_concurrent_connections:
                self.max_concurrent_connections = len(self.active_connections)
            
            logger.debug(f"Connection {conn_id} created by {current_test or 'unknown'}")
            
            # Track connections used by the current test
            if current_test:
                if current_test not in self.test_connections:
                    self.test_connections[current_test] = set()
                self.test_connections[current_test].add(conn_id)
    
    def _on_checkout(self, dbapi_connection, connection_record, connection_proxy):
        """Called when a connection is checked out from the pool"""
        if not self._enabled:
            return
            
        with self.lock:
            conn_id = id(dbapi_connection)
            current_test = self._get_current_test()
            
            # If this is a new connection we haven't seen before
            if conn_id not in self.active_connections:
                stack = traceback.extract_stack()
                filtered_stack = [frame for frame in stack if 'sqlalchemy' not in frame.filename]
                
                self.active_connections[conn_id] = {
                    'id': conn_id,
                    'created_at': time.time(),
                    'created_by': current_test or 'unknown',
                    'stack': [f"{frame.filename}:{frame.lineno}" for frame in filtered_stack[-5:]], 
                    'checkin_count': 0,
                    'checkout_count': 0,
                    'last_checkout': None,
                }
                
                self.total_connections += 1
                
                if len(self.active_connections) > self.max_concurrent_connections:
                    self.max_concurrent_connections = len(self.active_connections)
            
            # Update connection tracking
            self.active_connections[conn_id]['checkout_count'] += 1
            self.active_connections[conn_id]['last_checkout'] = time.time()
            self.active_connections[conn_id]['last_checkout_by'] = current_test or 'unknown'
            
            logger.debug(f"Connection {conn_id} checked out by {current_test or 'unknown'}")
            
            # Track connections used by the current test
            if current_test:
                if current_test not in self.test_connections:
                    self.test_connections[current_test] = set()
                self.test_connections[current_test].add(conn_id)
    
    def _on_checkin(self, dbapi_connection, connection_record):
        """Called when a connection is checked back into the pool"""
        if not self._enabled:
            return
            
        with self.lock:
            conn_id = id(dbapi_connection)
            
            if conn_id in self.active_connections:
                self.active_connections[conn_id]['checkin_count'] += 1
                self.active_connections[conn_id]['last_checkin'] = time.time()
                self.active_connections[conn_id]['last_checkin_by'] = self._get_current_test() or 'unknown'
                
                logger.debug(f"Connection {conn_id} checked in")
    
    def enable(self):
        """Enable connection tracking"""
        self._enabled = True
        
    def disable(self):
        """Disable connection tracking"""
        self._enabled = False
    
    def _get_current_test(self) -> Optional[str]:
        """Get the name of the currently running test"""
        try:
            # Node ID includes the full test path: path/to/test.py::TestClass::test_method
            return os.environ.get("PYTEST_CURRENT_TEST", "").split(" ")[0]
        except (KeyError, IndexError):
            return None
    
    def cleanup(self):
        """Cleanup before program exit"""
        with self.lock:
            # Check for leaked connections
            if self.active_connections:
                self.leaked_connections = len(self.active_connections)
                logger.warning(f"Found {self.leaked_connections} leaked connections at exit")
                
                for conn_id, conn_info in self.active_connections.items():
                    created_time = datetime.datetime.fromtimestamp(conn_info['created_at']).strftime('%H:%M:%S')
                    logger.warning(f"Leaked connection {conn_id} created at {created_time} by {conn_info['created_by']}")
                    
                    if 'stack' in conn_info:
                        logger.warning(f"Stack: {' -> '.join(conn_info['stack'])}")
            
            # Create a summary report
            self._generate_report()
    
    def _generate_report(self):
        """Generate a detailed report of connection usage"""
        report = {
            'summary': {
                'total_connections': self.total_connections,
                'max_concurrent': self.max_concurrent_connections,
                'leaked_connections': self.leaked_connections,
                'total_tests': len(self.test_connection_counts),
            },
            'tests': self.test_connection_counts,
            'connections': [
                {
                    'id': conn_id,
                    'created_by': info['created_by'],
                    'checkout_count': info['checkout_count'],
                    'checkin_count': info['checkin_count'],
                    'leaked': info['checkin_count'] < info['checkout_count'],
                    'stack': info.get('stack', []),
                }
                for conn_id, info in self.active_connections.items()
            ],
            'recommendations': self._generate_recommendations(),
        }
        
        try:
            with open(self.report_path, 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info(f"Connection report saved to {self.report_path}")
        except Exception as e:
            logger.error(f"Failed to save connection report: {e}")
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on connection usage patterns"""
        recommendations = []
        
        # Check for excessive connections
        if self.max_concurrent_connections > 10:
            recommendations.append(
                "Consider reducing the maximum connection pool size to prevent resource exhaustion."
            )
        
        # Check for leaked connections
        if self.leaked_connections > 0:
            recommendations.append(
                "Fix connection leaks by ensuring all connections are properly closed or returned to the pool."
            )
        
        # Check for tests using too many connections
        for test, counts in self.test_connection_counts.items():
            if counts.get('total', 0) > 5:
                recommendations.append(
                    f"Test '{test}' uses {counts.get('total', 0)} connections. Consider reusing connections within the test."
                )
        
        # General recommendations
        recommendations.append(
            "Add explicit connection cleanup in tearDown methods or fixture finalizers."
        )
        
        recommendations.append(
            "Use a session scope to ensure connections are properly returned to the pool."
        )
        
        recommendations.append(
            "Consider using a connection context manager pattern to ensure proper cleanup."
        )
        
        return recommendations
    
    # Pytest hooks
    
    def pytest_configure(self, config):
        """Pytest configure hook"""
        logger.info("ConnectionTracker plugin configured")
    
    def pytest_unconfigure(self, config):
        """Pytest unconfigure hook"""
        logger.info("ConnectionTracker plugin unconfigured")
        self.cleanup()
    
    def pytest_runtest_setup(self, item):
        """Called before test setup"""
        with self.lock:
            test_id = item.nodeid
            self.test_start_times[test_id] = time.time()
            
            # Set current test in environment for tracking
            os.environ["PYTEST_CURRENT_TEST"] = f"{test_id} (setup)"
    
    def pytest_runtest_teardown(self, item):
        """Called after test teardown"""
        with self.lock:
            test_id = item.nodeid
            
            # Update environment variable
            os.environ["PYTEST_CURRENT_TEST"] = f"{test_id} (teardown)"
            
            # Check for unclosed connections
            if test_id in self.test_connections:
                test_conn_ids = self.test_connections[test_id]
                open_connections = set()
                
                for conn_id in test_conn_ids:
                    if conn_id in self.active_connections:
                        conn_info = self.active_connections[conn_id]
                        if conn_info['checkout_count'] > conn_info['checkin_count']:
                            open_connections.add(conn_id)
                
                if open_connections:
                    logger.warning(f"Test '{test_id}' has {len(open_connections)} unclosed connections")
                    
                    # Force connection cleanup
                    self._force_connection_cleanup()
                
                # Record connection statistics for this test
                duration = time.time() - self.test_start_times.get(test_id, time.time())
                conn_per_second = len(test_conn_ids) / duration if duration > 0 else 0
                
                self.test_connection_counts[test_id] = {
                    'total': len(test_conn_ids),
                    'duration': round(duration, 2),
                    'connections_per_second': round(conn_per_second, 2),
                    'unclosed': len(open_connections),
                }
    
    def _force_connection_cleanup(self):
        """Attempt to force connection cleanup through garbage collection"""
        # Run garbage collection to close abandoned connections
        gc.collect()
        
        # Check if SQLAlchemy is available to force pool cleanup
        try:
            from sqlalchemy.orm import close_all_sessions
            close_all_sessions()
            logger.info("Forced SQLAlchemy session cleanup")
        except ImportError:
            logger.debug("SQLAlchemy close_all_sessions not available")
    
    def pytest_runtest_logreport(self, report):
        """Process test results"""
        if report.when == "teardown":
            test_id = report.nodeid
            
            # Clean up environment variable
            if "PYTEST_CURRENT_TEST" in os.environ:
                del os.environ["PYTEST_CURRENT_TEST"]
            
            # Final check for this test's connections
            if test_id in self.test_connections:
                test_conn_ids = self.test_connections[test_id]
                leaked = 0
                
                for conn_id in test_conn_ids:
                    if conn_id in self.active_connections:
                        conn_info = self.active_connections[conn_id]
                        if conn_info['checkout_count'] > conn_info['checkin_count']:
                            leaked += 1
                
                if leaked > 0:
                    logger.warning(f"Test '{test_id}' completed with {leaked} leaked connections")
    
    def pytest_sessionfinish(self, session):
        """Called after all tests are completed"""
        logger.info("Test session complete, generating connection report")
        self._generate_report()
    
    @contextmanager
    def monitor_connections(self, test_name=None):
        """Context manager for monitoring connections in a specific block of code"""
        original_test = os.environ.get("PYTEST_CURRENT_TEST", "")
        connections_before = set(self.active_connections.keys())
        
        try:
            if test_name:
                os.environ["PYTEST_CURRENT_TEST"] = test_name
            
            yield
            
        finally:
            # Check for new connections that weren't closed
            connections_after = set(self.active_connections.keys())
            new_connections = connections_after - connections_before
            
            if new_connections:
                logger.warning(f"Block '{test_name or 'unknown'}' created {len(new_connections)} connections that may not be closed")
                
                for conn_id in new_connections:
                    if conn_id in self.active_connections:
                        conn_info = self.active_connections[conn_id]
                        if conn_info['checkout_count'] > conn_info['checkin_count']:
                            logger.warning(f"Connection {conn_id} may be leaked: checkouts={conn_info['checkout_count']}, checkins={conn_info['checkin_count']}")
            
            # Restore original test name
            if original_test:
                os.environ["PYTEST_CURRENT_TEST"] = original_test
            else:
                os.environ.pop("PYTEST_CURRENT_TEST", None)

class OptimizedSession:
    """
    A session class that automatically manages database connections with the ConnectionTracker.
    
    Usage:
        # In conftest.py
        @pytest.fixture
        def db_session():
            session = OptimizedSession()
            yield session
            session.close()
    """
    
    def __init__(self, engine=None, session_factory=None):
        # Try to import engine and session factory if not provided
        if engine is None or session_factory is None:
            try:
                # Option 1: Import from backend.db.base module
                try:
                    from backend.db.base import engine, SessionLocal
                    self.engine = engine
                    self.session_factory = SessionLocal
                except ImportError:
                    # Option 2: Look in other common locations
                    try:
                        from backend.db.session import engine, SessionLocal
                        self.engine = engine
                        self.session_factory = SessionLocal
                    except ImportError:
                        raise ImportError("Could not import engine and SessionLocal from known locations")
            except ImportError as e:
                logger.warning(f"Failed to import database components: {e}")
                raise
        else:
            self.engine = engine
            self.session_factory = session_factory
        
        # Create a session with timeout setting
        self.session = self.session_factory()
        
        # Set statement timeout to prevent long-running queries
        try:
            self.session.execute("SET statement_timeout = '10s'")
        except Exception as e:
            logger.warning(f"Failed to set statement timeout: {e}")
        
        # Track this session with a unique name
        self.session_id = id(self.session)
        logger.debug(f"Created OptimizedSession {self.session_id}")
    
    def close(self):
        """Explicitly close the session"""
        if hasattr(self, 'session') and self.session:
            try:
                self.session.close()
                logger.debug(f"Closed OptimizedSession {self.session_id}")
            except Exception as e:
                logger.warning(f"Error closing session {self.session_id}: {e}")
            
            self.session = None
    
    def __del__(self):
        """Ensure session is closed when the object is garbage collected"""
        self.close()
    
    def __enter__(self):
        """Support for context manager pattern"""
        return self.session
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Ensure connection is closed after context block"""
        self.close()
        
        # Don't suppress exceptions
        return False
    
    # Delegate all other methods to the underlying session
    def __getattr__(self, name):
        if hasattr(self, 'session') and self.session and hasattr(self.session, name):
            return getattr(self.session, name)
        raise AttributeError(f"'OptimizedSession' object has no attribute '{name}'")


# Create pytest fixture for the OptimizedSession
@pytest.fixture
def optimized_db_session():
    """
    Pytest fixture that provides an optimized database session with proper connection tracking
    and automatic cleanup.
    
    Usage:
        def test_something(optimized_db_session):
            result = optimized_db_session.query(User).all()
            assert len(result) > 0
    """
    session = OptimizedSession()
    try:
        yield session
    finally:
        session.close()
        
        # Force engine pool disposal to reclaim connections
        try:
            session.engine.dispose()
        except:
            pass


# Helper function to register the ConnectionTracker with pytest
def setup_connection_tracker():
    """
    Helper function to set up connection tracking in conftest.py
    
    Usage:
        # In conftest.py
        from connection_tracker import setup_connection_tracker
        
        # Set up connection tracking
        connection_tracker = setup_connection_tracker()
        
        def pytest_configure(config):
            config.pluginmanager.register(connection_tracker)
    """
    tracker = ConnectionTracker()
    return tracker


# If this script is run directly, print usage information
if __name__ == "__main__":
    print("ConnectionTracker - Database Connection Monitoring for Pytest")
    print("\nThis module should be imported into your conftest.py file, not run directly.")
    print("\nUsage instructions:")
    print("  1. Copy this file to your test directory or a location in your Python path")
    print("  2. In your conftest.py file, add:")
    print("     from connection_tracker import setup_connection_tracker")
    print("     connection_tracker = setup_connection_tracker()")
    print("     def pytest_configure(config):")
    print("         config.pluginmanager.register(connection_tracker)")
    print("  3. Use the optimized_db_session fixture in your tests:")
    print("     def test_something(optimized_db_session):")
    print("         result = optimized_db_session.query(User).all()")
    print("         assert len(result) > 0")
    print("\nRun with --help for more options.")