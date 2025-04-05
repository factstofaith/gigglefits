"""
Resource tracking and management for proper cleanup.

This module provides utilities for tracking and properly cleaning up resources,
particularly important in Docker container environments where resource leaks
can cause container instability.
"""

import os
import sys
import time
import logging
import threading
import weakref
import atexit
from enum import Enum
from typing import Dict, Set, List, Any, Optional, Callable, TypeVar, Generic, Union
from contextlib import contextmanager

# Setup logging
logger = logging.getLogger(__name__)

# Resource types
class ResourceType(Enum):
    """Types of resources that can be tracked."""
    DATABASE_CONNECTION = "database_connection"
    FILE_HANDLE = "file_handle"
    NETWORK_CONNECTION = "network_connection"
    MEMORY_BUFFER = "memory_buffer"
    THREAD = "thread"
    PROCESS = "process"
    LOCK = "lock"
    SEMAPHORE = "semaphore"
    TEMPFILE = "tempfile"
    SOCKET = "socket"
    OTHER = "other"

# Type for resource cleanup function
T = TypeVar('T')
CleanupFunc = Callable[[T], None]

class Resource(Generic[T], object):
    """
    Represents a tracked resource with metadata.
    
    This class tracks a resource along with its metadata and cleanup function.
    """
    
    def __init__(
        self,
        resource: T,
        resource_type: ResourceType,
        description: str,
        cleanup_func: CleanupFunc,
        owner: Optional[str] = None,
        created_at: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Initialize a tracked resource.
        
        Args:
            resource: The actual resource object
            resource_type: Type of resource
            description: Description of the resource
            cleanup_func: Function to call to clean up the resource
            owner: Owner/creator of the resource (e.g., module name)
            created_at: Timestamp when resource was created
            metadata: Additional metadata for the resource
        """
        self.resource = resource
        self.resource_type = resource_type
        self.description = description
        self.cleanup_func = cleanup_func
        self.owner = owner
        self.created_at = created_at or time.time()
        self.metadata = metadata or {}
        self.cleaned_up = False
        
    def cleanup(self) -> bool:
        """
        Clean up the resource.
        
        Returns:
            True if cleanup succeeded, False otherwise
        """
        if self.cleaned_up:
            return True
        
        try:
            self.cleanup_func(self.resource)
            self.cleaned_up = True
            return True
        except Exception as e:
            logger.error(f"Error cleaning up resource {self.description}: {e}")
            return False
            
    def get_age(self) -> float:
        """
        Get the age of the resource in seconds.
        
        Returns:
            Age in seconds
        """
        return time.time() - self.created_at
    
    def __repr__(self) -> str:
        """String representation of the resource."""
        return f"<Resource: {self.resource_type.value}, {self.description}, owner={self.owner}, " \
               f"age={self.get_age():.2f}s, cleaned_up={self.cleaned_up}>"


class ResourceTracker:
    """
    Tracks resources to ensure proper cleanup.
    
    This class maintains a registry of resources and ensures they are
    properly cleaned up, even during abnormal program termination.
    """
    
    def __init__(self, auto_register_exit_handler: bool = True):
        """
        Initialize the resource tracker.
        
        Args:
            auto_register_exit_handler: Whether to register an exit handler
        """
        self._resources: Dict[int, Resource] = {}
        self._lock = threading.RLock()
        
        # Register exit handler to clean up resources on program exit
        if auto_register_exit_handler:
            atexit.register(self.cleanup_all_resources)
            logger.debug("Registered exit handler for resource cleanup")
    
    def register_resource(
        self,
        resource: Any,
        resource_type: ResourceType,
        description: str,
        cleanup_func: Callable[[Any], None],
        owner: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Register a resource for tracking.
        
        Args:
            resource: The resource to track
            resource_type: Type of resource
            description: Description of the resource
            cleanup_func: Function to call to clean up the resource
            owner: Owner/creator of the resource
            metadata: Additional metadata for the resource
            
        Returns:
            Resource ID for later reference
        """
        # Get owner from caller if not provided
        if owner is None:
            import inspect
            frame = inspect.currentframe()
            if frame:
                try:
                    frame = frame.f_back
                    if frame:
                        module = inspect.getmodule(frame)
                        if module:
                            owner = module.__name__
                except Exception:
                    pass
        
        # Create resource object
        tracked_resource = Resource(
            resource=resource,
            resource_type=resource_type,
            description=description,
            cleanup_func=cleanup_func,
            owner=owner,
            metadata=metadata
        )
        
        # Generate resource ID
        resource_id = id(resource)
        
        # Store in registry
        with self._lock:
            self._resources[resource_id] = tracked_resource
            
        logger.debug(f"Registered resource: {description} ({resource_type.value})")
        return resource_id
    
    def deregister_resource(self, resource_id: int, cleanup: bool = True) -> bool:
        """
        Deregister a resource, optionally cleaning it up.
        
        Args:
            resource_id: Resource ID to deregister
            cleanup: Whether to clean up the resource
            
        Returns:
            True if deregistered successfully, False otherwise
        """
        with self._lock:
            if resource_id not in self._resources:
                logger.warning(f"Attempted to deregister unknown resource ID: {resource_id}")
                return False
            
            resource = self._resources[resource_id]
            
            # Clean up if requested
            if cleanup and not resource.cleaned_up:
                resource.cleanup()
            
            # Remove from registry
            del self._resources[resource_id]
            
        logger.debug(f"Deregistered resource: {resource.description}")
        return True
    
    def cleanup_resource(self, resource_id: int) -> bool:
        """
        Clean up a specific resource.
        
        Args:
            resource_id: Resource ID to clean up
            
        Returns:
            True if cleanup succeeded, False otherwise
        """
        with self._lock:
            if resource_id not in self._resources:
                logger.warning(f"Attempted to clean up unknown resource ID: {resource_id}")
                return False
            
            resource = self._resources[resource_id]
            success = resource.cleanup()
            
        logger.debug(f"Cleaned up resource: {resource.description}")
        return success
    
    def cleanup_resources_by_type(self, resource_type: ResourceType) -> Dict[int, bool]:
        """
        Clean up all resources of a specific type.
        
        Args:
            resource_type: Type of resources to clean up
            
        Returns:
            Dictionary of resource IDs to cleanup success
        """
        results = {}
        
        with self._lock:
            for resource_id, resource in list(self._resources.items()):
                if resource.resource_type == resource_type:
                    results[resource_id] = resource.cleanup()
        
        logger.debug(f"Cleaned up {len(results)} resources of type {resource_type.value}")
        return results
    
    def cleanup_resources_by_owner(self, owner: str) -> Dict[int, bool]:
        """
        Clean up all resources owned by a specific owner.
        
        Args:
            owner: Owner of resources to clean up
            
        Returns:
            Dictionary of resource IDs to cleanup success
        """
        results = {}
        
        with self._lock:
            for resource_id, resource in list(self._resources.items()):
                if resource.owner == owner:
                    results[resource_id] = resource.cleanup()
        
        logger.debug(f"Cleaned up {len(results)} resources owned by {owner}")
        return results
    
    def cleanup_all_resources(self) -> Dict[int, bool]:
        """
        Clean up all tracked resources.
        
        Returns:
            Dictionary of resource IDs to cleanup success
        """
        results = {}
        
        with self._lock:
            # Sort by resource type to clean up in a sensible order
            resources_by_type = {}
            for resource_id, resource in self._resources.items():
                resources_by_type.setdefault(resource.resource_type, []).append((resource_id, resource))
            
            # Clean up resources in order of resource type priority
            cleanup_order = [
                ResourceType.MEMORY_BUFFER,  # Clean up memory first
                ResourceType.FILE_HANDLE,    # Then file handles
                ResourceType.TEMPFILE,       # Then temp files
                ResourceType.SOCKET,         # Then sockets
                ResourceType.NETWORK_CONNECTION,  # Then network connections
                ResourceType.DATABASE_CONNECTION,  # Then database connections
                ResourceType.LOCK,           # Then locks
                ResourceType.SEMAPHORE,      # Then semaphores
                ResourceType.THREAD,         # Then threads
                ResourceType.PROCESS,        # Then processes
                ResourceType.OTHER           # Then other resources
            ]
            
            # Clean up in the specified order
            for resource_type in cleanup_order:
                if resource_type in resources_by_type:
                    for resource_id, resource in resources_by_type[resource_type]:
                        results[resource_id] = resource.cleanup()
            
            # Clean up any remaining resource types not in the priority list
            for resource_type, resources in resources_by_type.items():
                if resource_type not in cleanup_order:
                    for resource_id, resource in resources:
                        results[resource_id] = resource.cleanup()
        
        success_count = sum(1 for success in results.values() if success)
        logger.info(f"Cleaned up {success_count}/{len(results)} resources")
        return results
    
    def get_resource(self, resource_id: int) -> Optional[Resource]:
        """
        Get a resource by ID.
        
        Args:
            resource_id: Resource ID
            
        Returns:
            Resource if found, None otherwise
        """
        with self._lock:
            return self._resources.get(resource_id)
    
    def get_resources_by_type(self, resource_type: ResourceType) -> List[Resource]:
        """
        Get all resources of a specific type.
        
        Args:
            resource_type: Type of resources to get
            
        Returns:
            List of resources
        """
        with self._lock:
            return [r for r in self._resources.values() if r.resource_type == resource_type]
    
    def get_resources_by_owner(self, owner: str) -> List[Resource]:
        """
        Get all resources owned by a specific owner.
        
        Args:
            owner: Owner of resources to get
            
        Returns:
            List of resources
        """
        with self._lock:
            return [r for r in self._resources.values() if r.owner == owner]
    
    def get_resource_counts(self) -> Dict[ResourceType, int]:
        """
        Get counts of resources by type.
        
        Returns:
            Dictionary of resource types to counts
        """
        counts = {resource_type: 0 for resource_type in ResourceType}
        
        with self._lock:
            for resource in self._resources.values():
                counts[resource.resource_type] += 1
        
        return counts
    
    def get_resource_stats(self) -> Dict[str, Any]:
        """
        Get statistics about tracked resources.
        
        Returns:
            Dictionary of resource statistics
        """
        with self._lock:
            total_resources = len(self._resources)
            cleaned_up = sum(1 for r in self._resources.values() if r.cleaned_up)
            oldest_age = max([r.get_age() for r in self._resources.values()]) if self._resources else 0
            newest_age = min([r.get_age() for r in self._resources.values()]) if self._resources else 0
            
            # Get counts by type
            counts_by_type = {r_type.value: 0 for r_type in ResourceType}
            for resource in self._resources.values():
                counts_by_type[resource.resource_type.value] += 1
            
            # Get counts by owner
            counts_by_owner = {}
            for resource in self._resources.values():
                if resource.owner:
                    counts_by_owner[resource.owner] = counts_by_owner.get(resource.owner, 0) + 1
        
        return {
            "total_resources": total_resources,
            "cleaned_up": cleaned_up,
            "oldest_age_seconds": oldest_age,
            "newest_age_seconds": newest_age,
            "counts_by_type": counts_by_type,
            "counts_by_owner": counts_by_owner
        }
    
    @contextmanager
    def track_resource(
        self,
        resource: Any,
        resource_type: ResourceType,
        description: str,
        cleanup_func: Callable[[Any], None],
        owner: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Any:
        """
        Context manager to track a resource during a block.
        
        Args:
            resource: The resource to track
            resource_type: Type of resource
            description: Description of the resource
            cleanup_func: Function to call to clean up the resource
            owner: Owner/creator of the resource
            metadata: Additional metadata for the resource
            
        Yields:
            The resource
        """
        resource_id = self.register_resource(
            resource=resource,
            resource_type=resource_type,
            description=description,
            cleanup_func=cleanup_func,
            owner=owner,
            metadata=metadata
        )
        
        try:
            yield resource
        finally:
            self.deregister_resource(resource_id, cleanup=True)


# Create a singleton instance of the resource tracker
_resource_tracker = ResourceTracker()

# Expose singleton methods as module functions
register_resource = _resource_tracker.register_resource
deregister_resource = _resource_tracker.deregister_resource
cleanup_resource = _resource_tracker.cleanup_resource
cleanup_resources_by_type = _resource_tracker.cleanup_resources_by_type
cleanup_resources_by_owner = _resource_tracker.cleanup_resources_by_owner
cleanup_all_resources = _resource_tracker.cleanup_all_resources
get_resource = _resource_tracker.get_resource
get_resources_by_type = _resource_tracker.get_resources_by_type
get_resources_by_owner = _resource_tracker.get_resources_by_owner
get_resource_counts = _resource_tracker.get_resource_counts
get_resource_stats = _resource_tracker.get_resource_stats
track_resource = _resource_tracker.track_resource

# Helper functions for common resource types
@contextmanager
def track_file(
    file_obj: Any,
    description: str,
    owner: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Any:
    """
    Track a file object.
    
    Args:
        file_obj: File object to track
        description: Description of the file
        owner: Owner/creator of the file
        metadata: Additional metadata for the file
        
    Yields:
        The file object
    """
    with track_resource(
        resource=file_obj,
        resource_type=ResourceType.FILE_HANDLE,
        description=description,
        cleanup_func=lambda f: f.close(),
        owner=owner,
        metadata=metadata
    ) as f:
        yield f

@contextmanager
def track_connection(
    conn: Any,
    description: str,
    owner: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Any:
    """
    Track a database connection.
    
    Args:
        conn: Connection object to track
        description: Description of the connection
        owner: Owner/creator of the connection
        metadata: Additional metadata for the connection
        
    Yields:
        The connection object
    """
    with track_resource(
        resource=conn,
        resource_type=ResourceType.DATABASE_CONNECTION,
        description=description,
        cleanup_func=lambda c: c.close(),
        owner=owner,
        metadata=metadata
    ) as c:
        yield c

@contextmanager
def track_thread(
    thread: threading.Thread,
    description: str,
    owner: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    join_timeout: float = 5.0
) -> threading.Thread:
    """
    Track a thread.
    
    Args:
        thread: Thread to track
        description: Description of the thread
        owner: Owner/creator of the thread
        metadata: Additional metadata for the thread
        join_timeout: Timeout for joining the thread on cleanup
        
    Yields:
        The thread
    """
    def cleanup_thread(t: threading.Thread) -> None:
        if t.is_alive():
            try:
                t.join(timeout=join_timeout)
            except Exception as e:
                logger.warning(f"Error joining thread {t.name}: {e}")
    
    with track_resource(
        resource=thread,
        resource_type=ResourceType.THREAD,
        description=description,
        cleanup_func=cleanup_thread,
        owner=owner,
        metadata=metadata
    ) as t:
        yield t

# Register shutdown handler with signal_handlers module if available
try:
    from utils.signal_handlers import register_shutdown_handler
    register_shutdown_handler("resource_tracker", cleanup_all_resources)
    logger.info("Registered resource tracker shutdown handler")
except ImportError:
    logger.warning("Could not register resource tracker shutdown handler: signal_handlers module not found")
except Exception as e:
    logger.error(f"Error registering resource tracker shutdown handler: {e}")