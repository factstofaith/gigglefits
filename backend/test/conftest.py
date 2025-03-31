# optimized_conftest.py
#
# An optimized pytest configuration file that implements advanced testing features:
# - Database connection tracking and leak detection
# - Memory profiling for tests
# - Performance tracking and reporting
# - Resource cleanup and isolation
#
# Usage:
#   1. Copy this file to your test directory as conftest.py
#   2. Run pytest with your normal command
#
# The file automatically loads and configures all necessary components.

import os
import sys
import pytest
import time
import gc
import logging
import warnings
import random
from typing import Dict, List, Set, Optional, Any, Tuple, Union

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Try to import project-specific modules
try:
    # Import connection_tracker from the scripts directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    module_path = os.path.join(script_dir, "connection_tracker.py")
    
    if os.path.exists(module_path):
        sys.path.insert(0, script_dir)
        from connection_tracker import setup_connection_tracker, OptimizedSession, optimized_db_session
        connection_tracker = setup_connection_tracker()
    else:
        # Fall back to local directory
        try:
            from connection_tracker import setup_connection_tracker, OptimizedSession, optimized_db_session
            connection_tracker = setup_connection_tracker()
        except ImportError:
            print("WARNING: connection_tracker.py not found, database connection tracking disabled")
            connection_tracker = None
            optimized_db_session = None
except ImportError as e:
    print(f"WARNING: Failed to import connection_tracker: {e}")
    connection_tracker = None
    optimized_db_session = None

# Configure logging
log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../test_reports")
os.makedirs(log_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(name)s] %(levelname)s: %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(log_dir, "test_run.log")),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("conftest")

# Filter warnings
warnings.filterwarnings("ignore", message=".*Deprecated.*")
warnings.filterwarnings("ignore", message=".*SQLAlchemy 2.0 migration.*")

# Test performance tracker
class PerformanceTracker:
    """Tracks test execution time and memory usage"""
    
    def __init__(self):
        self.test_durations: Dict[str, float] = {}
        self.test_start_times: Dict[str, float] = {}
        self.test_memory: Dict[str, Dict[str, int]] = {}
        self.slowest_tests: List[Tuple[str, float]] = []
        self.highest_memory_tests: List[Tuple[str, int]] = []
    
    def pytest_runtest_setup(self, item):
        """Record test start time"""
        self.test_start_times[item.nodeid] = time.time()
    
    def pytest_runtest_teardown(self, item):
        """Record test duration and memory usage"""
        if item.nodeid in self.test_start_times:
            end_time = time.time()
            duration = end_time - self.test_start_times[item.nodeid]
            self.test_durations[item.nodeid] = duration
            
            # Track memory usage
            try:
                import psutil
                process = psutil.Process(os.getpid())
                memory_info = process.memory_info()
                self.test_memory[item.nodeid] = {
                    'rss': memory_info.rss,
                    'vms': memory_info.vms,
                }
                
                # Update highest memory tests
                self.highest_memory_tests.append((item.nodeid, memory_info.rss))
                self.highest_memory_tests.sort(key=lambda x: x[1], reverse=True)
                self.highest_memory_tests = self.highest_memory_tests[:10]  # Keep top 10
            except (ImportError, AttributeError):
                pass
            
            # Update slowest tests list
            self.slowest_tests.append((item.nodeid, duration))
            self.slowest_tests.sort(key=lambda x: x[1], reverse=True)
            self.slowest_tests = self.slowest_tests[:10]  # Keep top 10
    
    def pytest_terminal_summary(self, terminalreporter):
        """Report performance data at the end of the test run"""
        if not self.test_durations:
            return
        
        terminalreporter.write_sep("=", "Performance Summary")
        
        # Report total stats
        total_tests = len(self.test_durations)
        total_time = sum(self.test_durations.values())
        avg_time = total_time / total_tests if total_tests > 0 else 0
        
        terminalreporter.write_line(f"Total tests: {total_tests}")
        terminalreporter.write_line(f"Total time: {total_time:.2f}s")
        terminalreporter.write_line(f"Average time: {avg_time:.2f}s")
        
        # Report slowest tests
        if self.slowest_tests:
            terminalreporter.write_sep("-", "Slowest Tests")
            for test, duration in self.slowest_tests:
                terminalreporter.write_line(f"{test}: {duration:.2f}s")
        
        # Report memory usage
        if self.highest_memory_tests:
            terminalreporter.write_sep("-", "Highest Memory Usage Tests")
            for test, memory in self.highest_memory_tests:
                terminalreporter.write_line(f"{test}: {memory / (1024 * 1024):.2f} MB")

performance_tracker = PerformanceTracker()

# Memory profiler
try:
    import tracemalloc
    tracemalloc_enabled = True
except ImportError:
    tracemalloc_enabled = False

@pytest.fixture(scope="session", autouse=True)
def setup_tracemalloc():
    """Set up memory profiling with tracemalloc if available"""
    if tracemalloc_enabled:
        tracemalloc.start()
        yield
        snapshot = tracemalloc.take_snapshot()
        top_stats = snapshot.statistics('lineno')
        
        logger.info("Top 10 memory allocations:")
        for stat in top_stats[:10]:
            logger.info("%s memory blocks: %.1f KiB", stat.count, stat.size / 1024)
            for line in stat.traceback.format():
                logger.info("    %s", line)
            
        tracemalloc.stop()
    else:
        yield

# Resource cleanup and isolation
@pytest.fixture(scope="function", autouse=True)
def setup_test_isolation():
    """Ensure test isolation and resource cleanup"""
    # Before test: force garbage collection
    gc.collect()
    
    # Run the test
    yield
    
    # After test: force garbage collection again
    gc.collect()

# Test database fixture
@pytest.fixture
def test_db():
    """
    Provides a test database connection with optimized settings.
    Falls back to a standard session if optimized_db_session is not available.
    """
    if optimized_db_session:
        # Use our optimized session with connection tracking
        yield from optimized_db_session()
    else:
        # Fall back to looking for a standard session fixture
        try:
            from backend.db.base import SessionLocal
            session = SessionLocal()
            # Set timeout for test queries
            try:
                session.execute("SET statement_timeout = '10s'")
            except:
                pass
            
            yield session
            
            session.close()
        except ImportError:
            logger.warning("Could not import SessionLocal, test_db fixture is unavailable")
            yield None

# Test data fixture
@pytest.fixture
def test_data():
    """
    Provides common test data that can be reused across tests.
    This improves performance by avoiding regeneration of test data.
    """
    return {
        'users': [
            {'id': 1, 'name': 'Test User 1', 'email': 'test1@example.com'},
            {'id': 2, 'name': 'Test User 2', 'email': 'test2@example.com'},
            {'id': 3, 'name': 'Test User 3', 'email': 'test3@example.com'},
        ],
        'items': [
            {'id': 1, 'name': 'Item 1', 'description': 'Test item 1'},
            {'id': 2, 'name': 'Item 2', 'description': 'Test item 2'},
            {'id': 3, 'name': 'Item 3', 'description': 'Test item 3'},
        ],
    }

# Setup environment fixture
@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup the test environment with optimized settings"""
    # Set optimized environment variables
    os.environ["PYTHONOPTIMIZE"] = "1"  # Enable optimizations
    os.environ["PYTHONHASHSEED"] = "0"  # Fixed hash seed for reproducibility
    
    yield
    
    # Clean up any temporary files or resources created during tests
    temp_pattern = os.path.join(os.getcwd(), "test_*.tmp")
    for temp_file in os.popen(f"find {os.getcwd()} -name 'test_*.tmp'").read().strip().split("\n"):
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except:
                pass

# Randomized testing fixture
@pytest.fixture
def random_seed():
    """Provides a reproducible random seed for tests that use randomization"""
    seed = int(os.environ.get("PYTEST_RANDOM_SEED", 12345))
    random.seed(seed)
    return seed

# Register plugins
def pytest_configure(config):
    """Register custom plugins and configure pytest"""
    # Register connection tracker if available
    if connection_tracker:
        config.pluginmanager.register(connection_tracker)
    
    # Register performance tracker
    config.pluginmanager.register(performance_tracker)
    
    # Add custom markers
    config.addinivalue_line("markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')")
    config.addinivalue_line("markers", "db: marks tests that need a database connection")
    config.addinivalue_line("markers", "memory_intensive: marks tests that use a lot of memory")
    config.addinivalue_line("markers", "integration: marks integration tests (need external services)")

    # Set up test categorization for parallel execution
    os.environ['PYTEST_CATEGORIZED'] = '1'

def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers based on patterns"""
    for item in items:
        # Mark slow tests based on patterns
        if "test_integration" in item.nodeid or "test_e2e" in item.nodeid:
            item.add_marker(pytest.mark.slow)
            item.add_marker(pytest.mark.integration)
            
        # Mark database tests
        if "test_db" in item.nodeid or "test_database" in item.nodeid or "test_model" in item.nodeid:
            item.add_marker(pytest.mark.db)
            
        # Mark memory intensive tests
        if "test_memory" in item.nodeid or "test_large" in item.nodeid:
            item.add_marker(pytest.mark.memory_intensive)

def pytest_runtest_setup(item):
    """Setup before each test"""
    logger.debug(f"Setting up test: {item.nodeid}")
    
    # Force garbage collection before test
    gc.collect()
    
    # Check if test is memory intensive
    if hasattr(item, 'get_closest_marker') and item.get_closest_marker("memory_intensive"):
        logger.info(f"Running memory intensive test: {item.nodeid}")

def pytest_runtest_teardown(item):
    """Teardown after each test"""
    logger.debug(f"Tearing down test: {item.nodeid}")
    
    # Force garbage collection after test
    gc.collect()

def pytest_terminal_summary(terminalreporter):
    """Add custom summary information at the end of the test run"""
    logger.info("Test run complete. Generating terminal summary.")
    
    # Summary will be added by the performance_tracker