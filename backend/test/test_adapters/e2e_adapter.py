"""
End-to-End Test Adapter

This module provides a test adapter for E2E workflow tests, combining multiple
adapter capabilities for comprehensive end-to-end testing.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from .entity_registry import BaseTestAdapter, EntityAction
from .auth import AuthAdapter, MFAAdapter, InvitationAdapter, RBACAdapter, TimezoneTestUtilities
from .admin_adapter import AdminTestAdapter
from .integration_adapter import IntegrationTestAdapter
from .transformation_registry_adapter import TransformationRegistryTestAdapter
from .scheduler_adapter import SchedulerTestAdapter
from .file_type_utilities_adapter import FileTypeUtilitiesAdapter


class E2EAdapter(BaseTestAdapter):
    """
    Test adapter for end-to-end workflow testing.
    
    This adapter integrates with multiple component adapters to enable
    testing of complete business workflows across the system.
    """
    
    def __init__(self, registry=None):
        """
        Initialize the E2E adapter with component adapters.
        
        Args:
            registry: Entity registry for test synchronization
        """
        super().__init__(registry)
        
        # Initialize component adapters with shared registry
        self.auth_adapter = AuthAdapter(registry=registry)
        self.mfa_adapter = MFAAdapter(registry=registry)
        self.invitation_adapter = InvitationAdapter(registry=registry)
        self.rbac_adapter = RBACAdapter(registry=registry)
        self.admin_adapter = AdminTestAdapter(registry=registry)
        self.integration_adapter = IntegrationTestAdapter(registry=registry)
        self.transformation_registry_adapter = TransformationRegistryTestAdapter(registry=registry)
        self.scheduler_adapter = SchedulerTestAdapter(registry=registry)
        self.file_type_utilities_adapter = FileTypeUtilitiesAdapter(registry=registry)
        
        # Track workflow execution for each test scenario
        self.workflow_state = {}
        self.workflow_history = []
    
    def start_workflow(self, workflow_id: str, description: str) -> Dict[str, Any]:
        """
        Start a new workflow test scenario.
        
        Args:
            workflow_id: Unique identifier for the workflow
            description: Description of the workflow
            
        Returns:
            Workflow state dictionary
        """
        # Create initial workflow state
        workflow = {
            "id": workflow_id,
            "description": description,
            "start_time": TimezoneTestUtilities.utc_now(),
            "steps": [],
            "entities": {},
            "state": "started",
            "current_step": 0
        }
        
        # Store workflow state
        self.workflow_state[workflow_id] = workflow
        
        # Register workflow as an entity
        self._register_entity("Workflow", workflow_id, workflow)
        
        return workflow
    
    def add_workflow_step(self, workflow_id: str, step_name: str, 
                         description: str) -> Dict[str, Any]:
        """
        Add a step to a workflow.
        
        Args:
            workflow_id: ID of the workflow
            step_name: Name of the step
            description: Description of the step
            
        Returns:
            Step information dictionary
        """
        workflow = self.workflow_state.get(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        # Create step info
        step = {
            "id": len(workflow["steps"]),
            "name": step_name,
            "description": description,
            "start_time": None,
            "end_time": None,
            "status": "pending",
            "result": None,
            "entities": {}
        }
        
        # Add step to workflow
        workflow["steps"].append(step)
        
        # Update workflow entity
        self._update_entity("Workflow", workflow_id, workflow)
        
        return step
    
    def start_step(self, workflow_id: str, step_id: int) -> Dict[str, Any]:
        """
        Mark a workflow step as started.
        
        Args:
            workflow_id: ID of the workflow
            step_id: ID of the step
            
        Returns:
            Updated step information
        """
        workflow = self.workflow_state.get(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        if step_id >= len(workflow["steps"]):
            raise ValueError(f"Step {step_id} not found in workflow {workflow_id}")
        
        # Update step status
        step = workflow["steps"][step_id]
        step["status"] = "in_progress"
        step["start_time"] = TimezoneTestUtilities.utc_now()
        workflow["current_step"] = step_id
        
        # Update workflow entity
        self._update_entity("Workflow", workflow_id, workflow)
        
        return step
    
    def complete_step(self, workflow_id: str, step_id: int, 
                     status: str, result: Any = None) -> Dict[str, Any]:
        """
        Mark a workflow step as completed.
        
        Args:
            workflow_id: ID of the workflow
            step_id: ID of the step
            status: Status of the step (success, failure, skipped)
            result: Result data from the step
            
        Returns:
            Updated step information
        """
        workflow = self.workflow_state.get(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        if step_id >= len(workflow["steps"]):
            raise ValueError(f"Step {step_id} not found in workflow {workflow_id}")
        
        # Update step status
        step = workflow["steps"][step_id]
        step["status"] = status
        step["end_time"] = TimezoneTestUtilities.utc_now()
        step["result"] = result
        
        # Add to workflow history
        self.workflow_history.append({
            "workflow_id": workflow_id,
            "step_id": step_id,
            "step_name": step["name"],
            "status": status,
            "timestamp": step["end_time"]
        })
        
        # Update workflow entity
        self._update_entity("Workflow", workflow_id, workflow)
        
        return step
    
    def complete_workflow(self, workflow_id: str, status: str) -> Dict[str, Any]:
        """
        Mark a workflow as completed.
        
        Args:
            workflow_id: ID of the workflow
            status: Status of the workflow (completed, failed, abandoned)
            
        Returns:
            Updated workflow information
        """
        workflow = self.workflow_state.get(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        # Update workflow status
        workflow["state"] = status
        workflow["end_time"] = TimezoneTestUtilities.utc_now()
        
        # Update workflow entity
        self._update_entity("Workflow", workflow_id, workflow)
        
        return workflow
    
    def associate_entity(self, workflow_id: str, step_id: int,
                        entity_type: str, entity_id: str) -> None:
        """
        Associate an entity with a workflow step.
        
        Args:
            workflow_id: ID of the workflow
            step_id: ID of the step
            entity_type: Type of the entity
            entity_id: ID of the entity
        """
        workflow = self.workflow_state.get(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        if step_id >= len(workflow["steps"]):
            raise ValueError(f"Step {step_id} not found in workflow {workflow_id}")
        
        # Get entity from registry
        entity = self.registry.get_entity(entity_type, entity_id)
        if not entity:
            raise ValueError(f"Entity {entity_type}/{entity_id} not found in registry")
        
        # Add to step entities
        step = workflow["steps"][step_id]
        if entity_type not in step["entities"]:
            step["entities"][entity_type] = {}
        step["entities"][entity_type][entity_id] = entity
        
        # Add to workflow entities
        if entity_type not in workflow["entities"]:
            workflow["entities"][entity_type] = {}
        workflow["entities"][entity_type][entity_id] = entity
        
        # Update workflow entity
        self._update_entity("Workflow", workflow_id, workflow)
    
    def get_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a workflow by ID.
        
        Args:
            workflow_id: ID of the workflow
            
        Returns:
            Workflow information or None if not found
        """
        return self.workflow_state.get(workflow_id)
    
    def get_workflow_status(self, workflow_id: str) -> str:
        """
        Get the status of a workflow.
        
        Args:
            workflow_id: ID of the workflow
            
        Returns:
            Status of the workflow
        """
        workflow = self.workflow_state.get(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        return workflow["state"]
    
    def get_step_status(self, workflow_id: str, step_id: int) -> str:
        """
        Get the status of a workflow step.
        
        Args:
            workflow_id: ID of the workflow
            step_id: ID of the step
            
        Returns:
            Status of the step
        """
        workflow = self.workflow_state.get(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        if step_id >= len(workflow["steps"]):
            raise ValueError(f"Step {step_id} not found in workflow {workflow_id}")
        
        return workflow["steps"][step_id]["status"]
    
    def get_workflow_history(self, workflow_id: str = None) -> List[Dict[str, Any]]:
        """
        Get the execution history for a workflow or all workflows.
        
        Args:
            workflow_id: Optional ID of the workflow
            
        Returns:
            List of workflow history entries
        """
        if workflow_id:
            return [entry for entry in self.workflow_history 
                   if entry["workflow_id"] == workflow_id]
        return self.workflow_history
    
    def reset(self):
        """Reset the adapter state."""
        # Reset component adapters
        self.auth_adapter.reset()
        self.mfa_adapter.reset()
        self.invitation_adapter.reset()
        self.rbac_adapter.reset()
        self.admin_adapter.reset()
        
        # Reset workflow state
        self.workflow_state = {}
        self.workflow_history = []