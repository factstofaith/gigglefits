"""
Entity Registry for test adapters.

This module provides a central registry for entities used by test adapters,
enabling automatic synchronization between adapters.
"""

from typing import Dict, List, Any, Callable, Optional, Type
import logging

# Set up logging
logger = logging.getLogger("entity_registry")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

# Action types for entity changes
class EntityAction:
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"

class EntityRegistry:
    """
    Central registry for entities used by test adapters.
    
    This registry keeps track of all entities and notifies adapters when entities change.
    """
    
    def __init__(self, debug=False):
        """Initialize the entity registry."""
        # entity_type -> {entity_id -> entity}
        self.entities: Dict[str, Dict[str, Any]] = {}
        
        # adapter_type -> adapter_instance
        self.adapters: Dict[str, Any] = {}
        
        # entity_type -> [callback_functions]
        self.listeners: Dict[str, List[Callable]] = {}
        
        # History of entity changes for debugging
        self.history: List[Dict[str, Any]] = []
        
        # Set debug mode
        self.debug = debug
        
        if self.debug:
            logger.setLevel(logging.DEBUG)
            
        logger.info("Entity Registry initialized")
    
    def register_adapter(self, adapter_type: str, adapter_instance: Any) -> None:
        """
        Register an adapter with the registry.
        
        Args:
            adapter_type: The type of the adapter (e.g., "AuthAdapter")
            adapter_instance: The adapter instance
        """
        self.adapters[adapter_type] = adapter_instance
        logger.debug(f"Registered adapter: {adapter_type}")
    
    def register_entity(self, entity_type: str, entity_id: str, entity: Any) -> None:
        """
        Register an entity with the registry.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
            entity: The entity object
        """
        # Create entity type dictionary if it doesn't exist
        if entity_type not in self.entities:
            self.entities[entity_type] = {}
        
        # Store the entity
        self.entities[entity_type][entity_id] = entity
        
        # Record the change
        self._record_change(entity_type, entity_id, entity, EntityAction.CREATE)
        
        # Notify listeners
        self._notify_listeners(entity_type, entity_id, entity, EntityAction.CREATE)
        
        logger.debug(f"Registered {entity_type} with ID: {entity_id}")
    
    def update_entity(self, entity_type: str, entity_id: str, entity: Any) -> None:
        """
        Update an entity in the registry.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
            entity: The updated entity object
        """
        # Check if entity exists
        if entity_type not in self.entities or entity_id not in self.entities[entity_type]:
            # If entity doesn't exist, register it
            self.register_entity(entity_type, entity_id, entity)
            return
        
        # Update the entity
        self.entities[entity_type][entity_id] = entity
        
        # Record the change
        self._record_change(entity_type, entity_id, entity, EntityAction.UPDATE)
        
        # Notify listeners
        self._notify_listeners(entity_type, entity_id, entity, EntityAction.UPDATE)
        
        logger.debug(f"Updated {entity_type} with ID: {entity_id}")
    
    def delete_entity(self, entity_type: str, entity_id: str) -> None:
        """
        Delete an entity from the registry.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
        """
        # Check if entity exists
        if entity_type not in self.entities or entity_id not in self.entities[entity_type]:
            logger.warning(f"Attempted to delete nonexistent {entity_type} with ID: {entity_id}")
            return
        
        # Get entity before deletion
        entity = self.entities[entity_type][entity_id]
        
        # Delete the entity
        del self.entities[entity_type][entity_id]
        
        # Record the change
        self._record_change(entity_type, entity_id, entity, EntityAction.DELETE)
        
        # Notify listeners
        self._notify_listeners(entity_type, entity_id, entity, EntityAction.DELETE)
        
        logger.debug(f"Deleted {entity_type} with ID: {entity_id}")
    
    def get_entity(self, entity_type: str, entity_id: str) -> Optional[Any]:
        """
        Get an entity from the registry.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
            
        Returns:
            The entity or None if not found
        """
        if entity_type not in self.entities or entity_id not in self.entities[entity_type]:
            return None
        
        return self.entities[entity_type][entity_id]
    
    def get_entities_by_type(self, entity_type: str) -> Dict[str, Any]:
        """
        Get all entities of a given type.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            
        Returns:
            Dictionary of entities with ID as key
        """
        if entity_type not in self.entities:
            return {}
        
        return self.entities[entity_type]
    
    def get_entity_by_attribute(self, entity_type: str, attr_name: str, attr_value: Any) -> Optional[Any]:
        """
        Find an entity by attribute value.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            attr_name: The attribute name to check (e.g., "email")
            attr_value: The attribute value to match
            
        Returns:
            The first matching entity or None if not found
        """
        if entity_type not in self.entities:
            return None
        
        for entity_id, entity in self.entities[entity_type].items():
            # Check both dictionary access and attribute access
            if isinstance(entity, dict) and attr_name in entity and entity[attr_name] == attr_value:
                return entity
            elif hasattr(entity, attr_name) and getattr(entity, attr_name) == attr_value:
                return entity
        
        return None
    
    def register_listener(self, entity_type: str, callback: Callable) -> None:
        """
        Register a listener for entity changes.
        
        Args:
            entity_type: The type of entity to listen for (e.g., "User")
            callback: Function to call when entity changes
        """
        if entity_type not in self.listeners:
            self.listeners[entity_type] = []
        
        self.listeners[entity_type].append(callback)
        logger.debug(f"Registered listener for {entity_type}")
    
    def reset(self) -> None:
        """Reset the registry to its initial state."""
        adapters = self.adapters
        self.entities = {}
        self.listeners = {}
        self.history = []
        
        # Keep the adapters registered
        self.adapters = adapters
        
        logger.info("Entity Registry reset")
    
    def _notify_listeners(self, entity_type: str, entity_id: str, entity: Any, action: str) -> None:
        """
        Notify listeners about entity changes.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
            entity: The entity object
            action: The action performed (create, update, delete)
        """
        if entity_type in self.listeners:
            for callback in self.listeners[entity_type]:
                try:
                    callback(entity_type, entity_id, entity, action)
                except Exception as e:
                    logger.error(f"Error in listener callback: {e}")
    
    def _record_change(self, entity_type: str, entity_id: str, entity: Any, action: str) -> None:
        """
        Record an entity change in the history.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
            entity: The entity object
            action: The action performed (create, update, delete)
        """
        self.history.append({
            "entity_type": entity_type,
            "entity_id": entity_id,
            "action": action,
            "timestamp": None  # Set this to a real timestamp if needed
        })

# Global registry instance
global_registry = EntityRegistry()

# Base adapter class that uses the registry
class BaseTestAdapter:
    """
    Base class for test adapters that use the entity registry.
    
    All test adapters should inherit from this class to enable automatic synchronization.
    """
    
    def __init__(self, registry=None):
        """
        Initialize the adapter with a registry.
        
        Args:
            registry: The entity registry to use (default: global_registry)
        """
        self.registry = registry or global_registry
        self._register_with_registry()
    
    def _register_with_registry(self):
        """Register this adapter with the registry."""
        adapter_type = self.__class__.__name__
        self.registry.register_adapter(adapter_type, self)
    
    def _register_entity(self, entity_type: str, entity_id: str, entity: Any) -> None:
        """
        Register an entity with the registry.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
            entity: The entity object
        """
        self.registry.register_entity(entity_type, entity_id, entity)
    
    def _update_entity(self, entity_type: str, entity_id: str, entity: Any) -> None:
        """
        Update an entity in the registry.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
            entity: The updated entity object
        """
        self.registry.update_entity(entity_type, entity_id, entity)
    
    def _delete_entity(self, entity_type: str, entity_id: str) -> None:
        """
        Delete an entity from the registry.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
        """
        self.registry.delete_entity(entity_type, entity_id)
    
    def _get_entity(self, entity_type: str, entity_id: str) -> Optional[Any]:
        """
        Get an entity from the registry.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
            
        Returns:
            The entity or None if not found
        """
        return self.registry.get_entity(entity_type, entity_id)
    
    def _get_entity_by_attribute(self, entity_type: str, attr_name: str, attr_value: Any) -> Optional[Any]:
        """
        Find an entity by attribute value.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            attr_name: The attribute name to check (e.g., "email")
            attr_value: The attribute value to match
            
        Returns:
            The first matching entity or None if not found
        """
        return self.registry.get_entity_by_attribute(entity_type, attr_name, attr_value)
    
    def _handle_entity_change(self, entity_type: str, entity_id: str, entity: Any, action: str) -> None:
        """
        Handle an entity change event.
        
        This method should be overridden by adapters to handle entity changes.
        
        Args:
            entity_type: The type of the entity (e.g., "User")
            entity_id: The ID of the entity
            entity: The entity object
            action: The action performed (create, update, delete)
        """
        pass  # Override in subclasses