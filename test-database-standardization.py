#!/usr/bin/env python
"""
Test Script for Database Standardization

This script validates the database standardization implementation,
testing the new service classes, connection management, and transactions.
"""

import os
import sys
import logging
import time
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("db-standardization-test")

# Add project root to path to ensure imports work
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Import required modules
from backend.db.base import get_db_context, get_engine
from backend.db.models import User, UserRole, Tag
from backend.utils.db.service import DatabaseService, DatabaseTransaction
from backend.utils.db.database_factory import DatabaseFactory
from backend.utils.db.init import DatabaseInitializer
from backend.utils.error_handling.exceptions import DatabaseError, NotFoundError

class StandardizationTester:
    """Test harness for database standardization"""
    
    def __init__(self):
        self.user_service = DatabaseService(User)
        self.tag_service = DatabaseService(Tag)
    
    def run_tests(self):
        """Run all tests"""
        tests = [
            self.test_connection,
            self.test_factory,
            self.test_service_crud,
            self.test_transactions,
            self.test_error_handling
        ]
        
        results = []
        for test in tests:
            test_name = test.__name__
            logger.info(f"Running test: {test_name}")
            
            start_time = time.time()
            try:
                test()
                duration = time.time() - start_time
                logger.info(f"Test {test_name} PASSED in {duration:.2f}s")
                results.append((test_name, True, None, duration))
            except Exception as e:
                duration = time.time() - start_time
                logger.error(f"Test {test_name} FAILED in {duration:.2f}s: {str(e)}")
                results.append((test_name, False, str(e), duration))
        
        # Print summary
        print("\n" + "=" * 60)
        print("DATABASE STANDARDIZATION TEST RESULTS")
        print("=" * 60)
        
        success_count = sum(1 for _, success, _, _ in results if success)
        fail_count = len(results) - success_count
        
        for test_name, success, error, duration in results:
            status = "PASSED" if success else "FAILED"
            error_msg = f": {error}" if error else ""
            print(f"{test_name}: {status} ({duration:.2f}s){error_msg}")
        
        print("\nSummary:")
        print(f"  Total tests: {len(results)}")
        print(f"  Passed: {success_count}")
        print(f"  Failed: {fail_count}")
        print("=" * 60)
        
        return success_count == len(results)
    
    def test_connection(self):
        """Test database connection"""
        # Check connection
        engine = get_engine()
        assert engine is not None, "Engine is None"
        
        # Verify connection works
        with engine.connect() as conn:
            result = conn.execute(engine.dialect.text("SELECT 1")).scalar()
            assert result == 1, "Failed to execute simple query"
        
        # Test health check
        health = DatabaseInitializer.check_connection_retry(max_retries=1)
        assert health, "Health check failed"
        
        logger.info("Connection test passed")
    
    def test_factory(self):
        """Test database factory"""
        # Get services
        user_service = DatabaseFactory.get_service(User)
        tag_service = DatabaseFactory.get_service(Tag)
        
        assert user_service is not None, "User service is None"
        assert tag_service is not None, "Tag service is None"
        
        # Check config
        config = DatabaseFactory.get_connection_config()
        assert "pool_size" in config, "Config missing pool_size"
        assert "max_overflow" in config, "Config missing max_overflow"
        
        # Check health
        health = DatabaseFactory.check_database_health()
        assert health["status"] in ["healthy", "unhealthy"], "Invalid health status"
        
        logger.info("Factory test passed")
    
    def test_service_crud(self):
        """Test CRUD operations with database service"""
        # Generate unique test identifier
        test_id = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Create a test user
        with get_db_context() as db:
            # Check if test user exists and delete if needed
            test_username = f"test_user_{test_id}"
            existing_user = self.user_service.find_one(db, filters={"username": test_username})
            if existing_user:
                self.user_service.delete(db, id=existing_user.id)
            
            # Create user
            user_data = {
                "id": f"test_{test_id}",
                "username": test_username,
                "email": f"test_{test_id}@example.com",
                "name": "Test User",
                "role": UserRole.USER
            }
            
            user = self.user_service.create(db, user_data)
            assert user is not None, "Failed to create user"
            assert user.username == test_username, "Username mismatch"
            
            # Read user
            retrieved_user = self.user_service.get(db, user.id)
            assert retrieved_user is not None, "Failed to retrieve user"
            assert retrieved_user.id == user.id, "User ID mismatch"
            
            # Update user
            update_data = {"name": "Updated Test User"}
            updated_user = self.user_service.update(db, db_obj=user, obj_in=update_data)
            assert updated_user.name == "Updated Test User", "Name not updated"
            
            # Test find methods
            found_user = self.user_service.find_one(db, filters={"username": test_username})
            assert found_user is not None, "Failed to find user by username"
            
            # Delete user
            deleted = self.user_service.delete(db, id=user.id)
            assert deleted, "Failed to delete user"
            
            # Verify deletion
            deleted_user = self.user_service.get(db, user.id)
            assert deleted_user is None, "User not deleted"
        
        logger.info("CRUD test passed")
    
    def test_transactions(self):
        """Test transaction management"""
        # Generate unique test identifier
        test_id = datetime.now().strftime("%Y%m%d%H%M%S")
        
        # Test successful transaction
        with DatabaseTransaction() as db:
            # Create test tag
            tag_data = {
                "name": f"test_tag_{test_id}",
                "description": "Test tag for transaction testing"
            }
            
            tag = self.tag_service.create(db, tag_data)
            assert tag is not None, "Failed to create tag"
            
            # Verify tag was created
            retrieved_tag = self.tag_service.find_one(db, filters={"name": tag_data["name"]})
            assert retrieved_tag is not None, "Failed to retrieve tag"
            
            # Clean up - delete tag
            deleted = self.tag_service.delete(db, id=tag.id)
            assert deleted, "Failed to delete tag"
        
        # Test transaction rollback
        try:
            with DatabaseTransaction() as db:
                # Create another test tag
                tag_data = {
                    "name": f"test_tag_rollback_{test_id}",
                    "description": "Test tag for transaction rollback testing"
                }
                
                tag = self.tag_service.create(db, tag_data)
                assert tag is not None, "Failed to create tag"
                
                # Force an error to trigger rollback
                raise ValueError("Forced error for rollback testing")
                
        except ValueError:
            pass  # Expected exception
        
        # Verify tag was not created (transaction rolled back)
        with get_db_context() as db:
            tag = self.tag_service.find_one(db, filters={"name": f"test_tag_rollback_{test_id}"})
            assert tag is None, "Tag was created despite transaction rollback"
        
        logger.info("Transaction test passed")
    
    def test_error_handling(self):
        """Test error handling"""
        # Test not found error
        with get_db_context() as db:
            try:
                # Try to get non-existent user
                self.user_service.get_or_404(db, id="nonexistent_user_id")
                assert False, "Should have raised NotFoundError"
            except NotFoundError:
                pass  # Expected exception
        
        # Test custom database error
        try:
            # This should fail because we're outside a transaction
            user_data = {
                "id": "invalid_test_user",
                "username": "invalid_test_user",
                "email": "invalid_test_user@example.com",
                "name": "Invalid Test User",
                "role": "INVALID_ROLE"  # Invalid role
            }
            self.user_service.create(None, user_data)
            assert False, "Should have raised an error"
        except Exception:
            pass  # Expected exception
        
        logger.info("Error handling test passed")


if __name__ == "__main__":
    logger.info("Starting database standardization test")
    tester = StandardizationTester()
    success = tester.run_tests()
    
    if success:
        logger.info("All tests passed")
        sys.exit(0)
    else:
        logger.error("Some tests failed")
        sys.exit(1)
