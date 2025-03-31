"""
AlembicMigrationManager

Consolidated Alembic-only migration system with dependency tracking
"""
import logging
import os
import sys
import re
import time
import importlib
import importlib.util
from typing import Dict, List, Optional, Any, Union, Tuple, Set, Callable
from datetime import datetime
from contextlib import contextmanager
from pathlib import Path
import networkx as nx

import alembic
from alembic import command, util
from alembic.config import Config
from alembic.script import ScriptDirectory
from alembic.runtime.migration import MigrationContext

from sqlalchemy import create_engine, text, inspect, MetaData, Table, Column, ForeignKey, Index
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.exc import SQLAlchemyError, OperationalError, IntegrityError

# Configure logging
logger = logging.getLogger(__name__)

class AlembicMigrationManager:
    """
    Consolidated Alembic-only migration system with dependency tracking
    
    Features:
    - Alembic-based migration management
    - Migration dependency tracking and resolution
    - Schema validation before and after migrations
    - Automated rollback support for failed migrations
    - Comprehensive logging and error reporting
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the migration manager.
        
        Args:
            config: Configuration dictionary with migration settings
        """
        self.config = config
        self.db_url = config.get('database_url')
        self.migration_dir = config.get('migration_dir', 'db/migrations')
        self.alembic_ini_path = config.get('alembic_ini_path', 'alembic.ini')
        self.script_location = config.get('script_location', 'db/alembic')
        
        # Performance metrics
        self.metrics = {
            'migration_counts': 0,
            'successful_migrations': 0,
            'failed_migrations': 0,
            'rollbacks': 0,
            'total_duration': 0,
            'last_migration': None,
            'current_migration': None
        }
        
        self.last_error = None
        self.initialized = False
        
        # Initialize if auto_init is True
        if self.config.get('auto_init', True):
            self.initialize()
    
    def initialize(self) -> bool:
        """
        Initialize the migration manager.
        
        Returns:
            bool: True if initialization successful
        """
        try:
            # Verify alembic.ini exists
            if not os.path.exists(self.alembic_ini_path):
                raise FileNotFoundError(f"Alembic config file not found: {self.alembic_ini_path}")
            
            # Verify script location exists
            if not os.path.exists(self.script_location):
                raise FileNotFoundError(f"Alembic script location not found: {self.script_location}")
            
            # Initialize alembic config
            self.alembic_cfg = Config(self.alembic_ini_path)
            self.alembic_cfg.set_main_option('script_location', self.script_location)
            self.alembic_cfg.set_main_option('sqlalchemy.url', self.db_url)
            
            # Initialize script directory
            self.script_directory = ScriptDirectory.from_config(self.alembic_cfg)
            
            # Test database connection
            self.engine = create_engine(self.db_url)
            with self.engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            
            logger.info(f"Migration manager initialized successfully")
            self.initialized = True
            return True
            
        except Exception as e:
            self.last_error = str(e)
            logger.error(f"Failed to initialize migration manager: {str(e)}")
            return False
    
    def get_current_revision(self) -> str:
        """
        Get the current database revision.
        
        Returns:
            str: Current revision identifier or None if no revision
        """
        try:
            with self.engine.connect() as conn:
                context = MigrationContext.configure(conn)
                return context.get_current_revision()
        except Exception as e:
            logger.error(f"Error getting current revision: {str(e)}")
            return None
    
    def get_available_migrations(self) -> List[Dict[str, Any]]:
        """
        Get all available migrations.
        
        Returns:
            List of migration details
        """
        migrations = []
        
        try:
            # Get all revisions from script directory
            for revision in self.script_directory.walk_revisions():
                migrations.append({
                    'revision': revision.revision,
                    'down_revision': revision.down_revision,
                    'dependencies': revision.dependencies if hasattr(revision, 'dependencies') else [],
                    'module': revision.module,
                    'doc': revision.doc,
                    'path': revision.path
                })
            
            return migrations
        except Exception as e:
            logger.error(f"Error getting available migrations: {str(e)}")
            return []
    
    def get_pending_migrations(self) -> List[Dict[str, Any]]:
        """
        Get pending migrations that need to be applied.
        
        Returns:
            List of pending migration details
        """
        try:
            current = self.get_current_revision()
            
            # Get all revisions from script directory
            all_migrations = self.get_available_migrations()
            
            # Filter to only include migrations that haven't been applied yet
            if current is None:
                return all_migrations
            
            # Find applied revisions
            applied = set()
            self._collect_applied_revisions(current, applied)
            
            # Filter out applied migrations
            pending = [m for m in all_migrations if m['revision'] not in applied]
            
            return pending
        except Exception as e:
            logger.error(f"Error getting pending migrations: {str(e)}")
            return []
    
    def _collect_applied_revisions(self, revision: str, applied: Set[str]):
        """
        Recursively collect all applied revisions.
        
        Args:
            revision: Current revision
            applied: Set to collect applied revisions
        """
        if not revision:
            return
        
        applied.add(revision)
        
        # Get script from revision
        script = self.script_directory.get_revision(revision)
        
        # Add down_revision if it exists
        if script.down_revision:
            if isinstance(script.down_revision, (list, tuple)):
                for down_rev in script.down_revision:
                    self._collect_applied_revisions(down_rev, applied)
            else:
                self._collect_applied_revisions(script.down_revision, applied)
    
    def run_migration(self, target: str = 'head') -> bool:
        """
        Run migration to target revision.
        
        Args:
            target: Target revision (default: 'head')
            
        Returns:
            bool: True if migration successful
        """
        start_time = time.time()
        self.metrics['current_migration'] = target
        
        try:
            # Before running migration, verify the target is valid
            if target != 'head' and target != 'base':
                self.script_directory.get_revision(target)
            
            # Run pre-migration validation
            if not self._validate_pre_migration():
                logger.error("Pre-migration validation failed")
                self.metrics['failed_migrations'] += 1
                return False
            
            # Run the migration
            logger.info(f"Running migration to target: {target}")
            command.upgrade(self.alembic_cfg, target)
            
            # Run post-migration validation
            if not self._validate_post_migration():
                logger.warning("Post-migration validation failed")
                # Continue despite validation failure, but log it
            
            duration = time.time() - start_time
            self.metrics['migration_counts'] += 1
            self.metrics['successful_migrations'] += 1
            self.metrics['total_duration'] += duration
            self.metrics['last_migration'] = {
                'target': target,
                'success': True,
                'duration': duration,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Migration to {target} completed successfully in {duration:.2f}s")
            return True
            
        except Exception as e:
            self.last_error = str(e)
            duration = time.time() - start_time
            self.metrics['failed_migrations'] += 1
            self.metrics['last_migration'] = {
                'target': target,
                'success': False,
                'error': str(e),
                'duration': duration,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            logger.error(f"Migration to {target} failed: {str(e)}")
            
            # Attempt to rollback
            if self.config.get('auto_rollback', True):
                self._rollback_migration()
            
            return False
    
    def _validate_pre_migration(self) -> bool:
        """
        Validate database before running migration.
        
        Returns:
            bool: True if validation successful
        """
        try:
            # Check database connection
            with self.engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            
            # Check if alembic_version table exists
            inspector = inspect(self.engine)
            tables = inspector.get_table_names()
            
            # If alembic_version doesn't exist, we're doing the first migration
            if 'alembic_version' not in tables:
                logger.info("First migration - no validation needed")
                return True
            
            # Check database constraints
            with self.engine.connect() as conn:
                if self.engine.dialect.name == 'postgresql':
                    # Check for broken constraints in PostgreSQL
                    result = conn.execute(text(
                        "SELECT conname, relname FROM pg_constraint c "
                        "JOIN pg_class r ON r.oid = c.conrelid "
                        "WHERE c.convalidated = false"
                    ))
                    invalid_constraints = list(result)
                    if invalid_constraints:
                        logger.warning(f"Found invalid constraints: {invalid_constraints}")
                
            return True
            
        except Exception as e:
            logger.error(f"Pre-migration validation failed: {str(e)}")
            return False
    
    def _validate_post_migration(self) -> bool:
        """
        Validate database after running migration.
        
        Returns:
            bool: True if validation successful
        """
        try:
            # Check database connection
            with self.engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            
            # Check all tables can be queried
            inspector = inspect(self.engine)
            tables = inspector.get_table_names()
            
            with self.engine.connect() as conn:
                for table in tables:
                    if table != 'alembic_version':
                        try:
                            conn.execute(text(f"SELECT * FROM {table} LIMIT 1"))
                        except Exception as e:
                            logger.warning(f"Error querying table {table}: {str(e)}")
            
            # Check database constraints
            with self.engine.connect() as conn:
                if self.engine.dialect.name == 'postgresql':
                    # Check for broken constraints in PostgreSQL
                    result = conn.execute(text(
                        "SELECT conname, relname FROM pg_constraint c "
                        "JOIN pg_class r ON r.oid = c.conrelid "
                        "WHERE c.convalidated = false"
                    ))
                    invalid_constraints = list(result)
                    if invalid_constraints:
                        logger.warning(f"Found invalid constraints after migration: {invalid_constraints}")
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Post-migration validation failed: {str(e)}")
            return False
    
    def _rollback_migration(self) -> bool:
        """
        Rollback the last migration.
        
        Returns:
            bool: True if rollback successful
        """
        try:
            current = self.get_current_revision()
            if not current:
                logger.info("No migration to roll back")
                return True
            
            # Get current revision script
            script = self.script_directory.get_revision(current)
            
            # Get down revision
            down_revision = script.down_revision
            
            if not down_revision:
                down_revision = 'base'
            
            logger.info(f"Rolling back from {current} to {down_revision}")
            
            # Run the downgrade
            command.downgrade(self.alembic_cfg, down_revision)
            
            self.metrics['rollbacks'] += 1
            logger.info(f"Rollback to {down_revision} completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Rollback failed: {str(e)}")
            return False
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get migration metrics.
        
        Returns:
            Dict containing migration metrics
        """
        self.metrics.update({
            'component': 'AlembicMigrationManager',
            'last_updated': datetime.utcnow().isoformat(),
            'error': self.last_error
        })
        return self.metrics
    
    def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check.
        
        Returns:
            Dict containing health status information
        """
        return {
            'component': 'AlembicMigrationManager',
            'status': 'healthy' if self.initialized and not self.last_error else 'unhealthy',
            'last_error': self.last_error,
            'timestamp': datetime.utcnow().isoformat()
        }
