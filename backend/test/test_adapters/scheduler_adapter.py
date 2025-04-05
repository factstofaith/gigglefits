"""
Scheduler Test Adapter

This module provides a test adapter for the IntegrationScheduler class.
"""

import asyncio
import pytz
from datetime import datetime
from typing import Dict, Any, Optional, List, Callable, Awaitable

from utils.scheduler import IntegrationScheduler
from .entity_registry import BaseTestAdapter, EntityAction


class SchedulerTestAdapter(BaseTestAdapter):
    """
    Test adapter for IntegrationScheduler.
    
    This adapter integrates with the entity registry and provides methods for
    testing the IntegrationScheduler.
    """
    
    def __init__(self, registry=None, integration_runner=None):
        """
        Initialize the scheduler test adapter.
        
        Args:
            registry: The entity registry to use
            integration_runner: Mock integration runner for testing
        """
        super().__init__(registry)
        
        # Create mock run_integration function
        if integration_runner:
            self.run_integration_func = integration_runner.run
        else:
            self.run_integration_func = self._mock_run_integration
        
        # Create scheduler instance
        self.scheduler = IntegrationScheduler(self.run_integration_func)
        
        # Track scheduled tasks for entity registry
        self._scheduled_tasks = {}
        
        # Register event listener for integration changes
        self.registry.register_listener("Integration", self._handle_integration_change)
    
    async def _mock_run_integration(self, integration_id: int) -> Dict[str, Any]:
        """
        Mock implementation of run_integration function.
        
        Args:
            integration_id: ID of the integration to run
            
        Returns:
            Dict with run results
        """
        return {
            "status": "success",
            "integration_id": integration_id,
            "records_processed": 10,
            "execution_time": 1.5
        }
    
    def start_scheduler(self) -> None:
        """Start the scheduler."""
        self.scheduler.start()
    
    def stop_scheduler(self) -> None:
        """Stop the scheduler."""
        self.scheduler.stop()
    
    def schedule_integration(self, integration_id: int, schedule_str: str) -> str:
        """
        Schedule an integration with the scheduler.
        
        Args:
            integration_id: ID of the integration to schedule
            schedule_str: Schedule string (e.g., "Daily @ 2am")
            
        Returns:
            Task ID for the scheduled integration
        """
        # Get integration from registry
        integration = self.registry.get_entity("Integration", str(integration_id))
        
        if not integration:
            # Create a minimal integration record in registry for testing
            integration = {
                "id": integration_id,
                "name": f"Test Integration {integration_id}",
                "type": "API-based",
                "status": "active"
            }
            self._register_entity("Integration", str(integration_id), integration)
        
        # Schedule the integration
        task_id = self.scheduler.schedule_integration(integration_id, schedule_str)
        
        # Store in entity registry
        task_info = self.scheduler.get_task_info(task_id)
        schedule_entity = {
            "task_id": task_id,
            "integration_id": integration_id,
            "schedule_str": schedule_str,
            "cron_expression": task_info["cron_expression"],
            "last_run": None
        }
        self._register_entity("ScheduledTask", task_id, schedule_entity)
        
        return task_id
    
    def unschedule_integration(self, integration_id: int) -> bool:
        """
        Unschedule an integration.
        
        Args:
            integration_id: ID of the integration to unschedule
            
        Returns:
            True if successfully unscheduled, False otherwise
        """
        # Unschedule the integration
        result = self.scheduler.unschedule_integration(integration_id)
        
        if result:
            # Remove from entity registry
            task_id = f"integration_{integration_id}"
            self._delete_entity("ScheduledTask", task_id)
        
        return result
    
    def get_scheduled_tasks(self) -> Dict[str, Dict[str, Any]]:
        """
        Get all scheduled tasks.
        
        Returns:
            Dictionary of all scheduled tasks
        """
        return self.scheduler.get_scheduled_tasks()
    
    def get_task_info(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a specific task.
        
        Args:
            task_id: ID of the task
            
        Returns:
            Task information or None if not found
        """
        return self.scheduler.get_task_info(task_id)
    
    def create_test_schedule(self, minute: str = "*", hour: str = "*", 
                           day: str = "*", month: str = "*", weekday: str = "*") -> str:
        """
        Create a test cron expression.
        
        Args:
            minute: Minute part of the cron expression
            hour: Hour part of the cron expression
            day: Day part of the cron expression
            month: Month part of the cron expression
            weekday: Weekday part of the cron expression
            
        Returns:
            Cron expression
        """
        return f"{minute} {hour} {day} {month} {weekday}"
    
    def should_run_now(self, task_id: str, now: datetime = None) -> bool:
        """
        Check if a task should run now.
        
        Args:
            task_id: ID of the task
            now: Current time (defaults to current timezone time)
            
        Returns:
            True if the task should run now, False otherwise
        """
        task_info = self.scheduler.get_task_info(task_id)
        if not task_info:
            return False
        
        if now is None:
            now = datetime.now(pytz.UTC)
        
        return self.scheduler._should_run_now(task_info, now)
    
    def matches_cron(self, cron_expression: str, dt: datetime) -> bool:
        """
        Check if a datetime matches a cron expression.
        
        Args:
            cron_expression: Cron expression to check against
            dt: Datetime to check
            
        Returns:
            True if the datetime matches the cron expression, False otherwise
        """
        return self.scheduler._matches_cron(cron_expression, dt)
    
    def reset(self) -> None:
        """Reset the adapter to its initial state."""
        # Stop the scheduler if it's running
        self.scheduler.stop()
        
        # Clear all scheduled tasks
        self.scheduler.scheduled_tasks = {}
        
        # Reset entity-related state
        self._scheduled_tasks = {}
    
    def _handle_integration_change(self, entity_type: str, entity_id: str, 
                                  entity: Any, action: str) -> None:
        """
        Handle changes to integrations in the entity registry.
        
        Args:
            entity_type: Type of entity that changed
            entity_id: ID of the entity
            entity: The entity object
            action: Action that occurred (create, update, delete)
        """
        # If an integration is deleted, unschedule it
        if action == EntityAction.DELETE:
            integration_id = int(entity_id)
            self.unschedule_integration(integration_id)
    
    async def run_task(self, task_id: str) -> Dict[str, Any]:
        """
        Run a scheduled task manually.
        
        Args:
            task_id: ID of the task to run
            
        Returns:
            Task execution results
        """
        task_info = self.scheduler.get_task_info(task_id)
        if not task_info:
            return {"status": "error", "message": "Task not found"}
        
        # Run the task
        await self.scheduler._run_task(task_id, task_info)
        
        # Get updated task info
        updated_info = self.scheduler.get_task_info(task_id)
        
        # Update entity in registry
        self._update_entity("ScheduledTask", task_id, {
            "task_id": task_id,
            "integration_id": updated_info["integration_id"],
            "schedule_str": updated_info["schedule_str"],
            "cron_expression": updated_info["cron_expression"],
            "last_run": updated_info["last_run"]
        })
        
        return {"status": "success", "task_id": task_id, "last_run": updated_info["last_run"]}
    
    async def test_scheduler_loop(self, iterations: int = 1) -> List[Dict[str, Any]]:
        """
        Run the scheduler loop for testing.
        
        Args:
            iterations: Number of loop iterations to run
            
        Returns:
            List of executed tasks
        """
        # Store original _run_task method
        original_run_task = self.scheduler._run_task
        
        # Executed tasks
        executed_tasks = []
        
        # Replace _run_task with our instrumented version
        async def instrumented_run_task(task_id, task_info):
            result = await original_run_task(task_id, task_info)
            executed_tasks.append({
                "task_id": task_id,
                "integration_id": task_info["integration_id"],
                "executed_at": datetime.now(pytz.UTC)
            })
            return result
        
        # Replace sleep to avoid waiting
        async def quick_sleep(seconds):
            # Don't actually sleep
            pass
        
        # Patch methods
        self.scheduler._run_task = instrumented_run_task
        original_sleep = asyncio.sleep
        asyncio.sleep = quick_sleep
        
        try:
            # Start the scheduler
            self.scheduler.start()
            
            # Run the loop for specified iterations
            for _ in range(iterations):
                await self.scheduler._scheduler_loop()
                
            return executed_tasks
        finally:
            # Restore original methods
            self.scheduler._run_task = original_run_task
            asyncio.sleep = original_sleep
            
            # Stop the scheduler
            self.scheduler.stop()