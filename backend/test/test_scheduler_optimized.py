"""
Optimized Scheduler Tests

This module contains optimized tests for the IntegrationScheduler class,
using the entity registry and adapter pattern.
"""

import pytest
import asyncio
import pytz
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch, AsyncMock

# Import scheduler class
from utils.scheduler import IntegrationScheduler

# Import test components
from test_adapters import SchedulerTestAdapter


class TestSchedulerOptimized:
    """
    Optimized tests for the IntegrationScheduler class using the adapter pattern.
    
    These tests demonstrate how to use the SchedulerTestAdapter for more maintainable
    and standardized scheduler tests.
    """
    
    @pytest.fixture(autouse=True)
    def setup(self, entity_registry, scheduler_adapter, integration_adapter):
        """Set up test environment before each test."""
        self.scheduler_adapter = scheduler_adapter
        self.integration_adapter = integration_adapter
        self.scheduler = scheduler_adapter.scheduler
        
        # Create mock integration for testing
        self.test_integration = self.integration_adapter.create_integration({
            "name": "Test Integration",
            "type": "API-based",
            "source": "Test Source",
            "destination": "Test Destination",
            "status": "active"
        })
        
        yield
        
        # Clean up
        self.scheduler_adapter.stop_scheduler()
    
    def test_initialize_scheduler(self):
        """Test that the scheduler initializes correctly."""
        assert hasattr(self.scheduler, 'run_integration_func')
        assert self.scheduler.scheduled_tasks == {}
        assert self.scheduler.is_running is False
    
    def test_start_stop_scheduler(self, monkeypatch):
        """Test starting and stopping the scheduler."""
        # Mock asyncio.create_task to avoid need for event loop
        mock_task = MagicMock()
        monkeypatch.setattr(asyncio, "create_task", mock_task)
        
        # Start the scheduler
        self.scheduler_adapter.start_scheduler()
        assert self.scheduler.is_running is True
        assert mock_task.called
        
        # Stop the scheduler
        self.scheduler_adapter.stop_scheduler()
        assert self.scheduler.is_running is False
    
    def test_schedule_integration(self):
        """Test scheduling an integration."""
        # Schedule an integration
        integration_id = self.test_integration["id"]
        task_id = self.scheduler_adapter.schedule_integration(integration_id, "Daily @ 2am")
        
        # Verify task was scheduled
        assert task_id == f"integration_{integration_id}"
        
        # Get task info
        task_info = self.scheduler_adapter.get_task_info(task_id)
        assert task_info is not None
        assert task_info["integration_id"] == integration_id
        assert task_info["schedule_str"] == "Daily @ 2am"
        assert task_info["cron_expression"] == "0 2 * * *"
    
    def test_unschedule_integration(self):
        """Test unscheduling an integration."""
        # Schedule an integration
        integration_id = self.test_integration["id"]
        task_id = self.scheduler_adapter.schedule_integration(integration_id, "Daily @ 2am")
        
        # Verify task exists
        assert self.scheduler_adapter.get_task_info(task_id) is not None
        
        # Unschedule integration
        result = self.scheduler_adapter.unschedule_integration(integration_id)
        assert result is True
        
        # Verify task was removed
        assert self.scheduler_adapter.get_task_info(task_id) is None
        
        # Try to unschedule non-existent integration
        result = self.scheduler_adapter.unschedule_integration(999)
        assert result is False
    
    def test_get_scheduled_tasks(self):
        """Test getting all scheduled tasks."""
        # Schedule multiple integrations
        self.scheduler_adapter.schedule_integration(self.test_integration["id"], "Daily @ 2am")
        
        # Create another test integration
        integration2 = self.integration_adapter.create_integration({
            "name": "Test Integration 2",
            "type": "File-based",
            "source": "Test Source 2",
            "destination": "Test Destination 2",
            "status": "active"
        })
        self.scheduler_adapter.schedule_integration(integration2["id"], "Hourly")
        
        # Get all scheduled tasks
        tasks = self.scheduler_adapter.get_scheduled_tasks()
        
        # Verify we have two tasks
        assert len(tasks) == 2
        assert f"integration_{self.test_integration['id']}" in tasks
        assert f"integration_{integration2['id']}" in tasks
        
        # Verify task details
        assert tasks[f"integration_{self.test_integration['id']}"]["schedule_str"] == "Daily @ 2am"
        assert tasks[f"integration_{integration2['id']}"]["schedule_str"] == "Hourly"
    
    def test_cron_expression_matching(self):
        """Test matching cron expressions with datetimes."""
        # Create test datetime
        dt = datetime(2023, 1, 1, 12, 30, 0, tzinfo=pytz.UTC)
        
        # Test various cron patterns
        assert self.scheduler_adapter.matches_cron("30 12 * * *", dt) is True
        assert self.scheduler_adapter.matches_cron("15 12 * * *", dt) is False
        assert self.scheduler_adapter.matches_cron("30 10-14 * * *", dt) is True
        assert self.scheduler_adapter.matches_cron("*/30 * * * *", dt) is True
        assert self.scheduler_adapter.matches_cron("*/15 * * * *", dt) is True
    
    def test_schedule_conversion(self):
        """Test conversion of schedule strings to cron expressions."""
        # Schedule with a common pattern
        task_id = self.scheduler_adapter.schedule_integration(
            self.test_integration["id"], "Hourly")
        task_info = self.scheduler_adapter.get_task_info(task_id)
        
        # Verify conversion
        assert task_info["cron_expression"] == "0 * * * *"
        
        # Schedule with a custom cron expression
        task_id2 = self.scheduler_adapter.schedule_integration(
            self.test_integration["id"], "Custom: 15 */2 * * 1-5")
        task_info2 = self.scheduler_adapter.get_task_info(task_id2)
        
        # Verify custom expression is used as-is
        assert task_info2["cron_expression"] == "15 */2 * * 1-5"
    
    def test_should_run_now_evaluation(self):
        """Test evaluation of whether a task should run now."""
        # Schedule a task to run every 15 minutes
        task_id = self.scheduler_adapter.schedule_integration(
            self.test_integration["id"], "Every 15 minutes")
        
        # Set up last run time (16 minutes ago)
        now = datetime.now(pytz.UTC)
        task_info = self.scheduler.get_task_info(task_id)
        task_info["last_run"] = now - timedelta(minutes=16)
        
        # Create a time exactly on a 15-minute mark
        test_time = datetime(now.year, now.month, now.day, now.hour, 
                            (now.minute // 15) * 15, 0, tzinfo=pytz.UTC)
        
        # Should run at this time
        assert self.scheduler._should_run_now(task_info, test_time) is True
        
        # Should not run when last run was too recent
        task_info["last_run"] = now - timedelta(seconds=30)
        assert self.scheduler._should_run_now(task_info, test_time) is False
    
    @pytest.mark.asyncio
    async def test_integration_with_registry(self):
        """Test integration with the entity registry."""
        # Schedule an integration
        integration_id = self.test_integration["id"]
        task_id = self.scheduler_adapter.schedule_integration(integration_id, "Hourly")
        
        # Verify task is in registry
        registry_task = self.scheduler_adapter._get_entity("ScheduledTask", task_id)
        assert registry_task is not None
        assert registry_task["integration_id"] == integration_id
        assert registry_task["schedule_str"] == "Hourly"
        
        # Delete integration from registry
        self.integration_adapter.delete_integration(integration_id)
        
        # Verify task is no longer in scheduler (handled via registry event)
        assert self.scheduler_adapter.get_task_info(task_id) is None
    
    @pytest.mark.asyncio
    async def test_run_task(self):
        """Test running a task manually."""
        # Schedule an integration
        integration_id = self.test_integration["id"]
        task_id = self.scheduler_adapter.schedule_integration(integration_id, "Daily @ 2am")
        
        # Run the task
        result = await self.scheduler_adapter.run_task(task_id)
        
        # Verify result
        assert result["status"] == "success"
        assert result["task_id"] == task_id
        
        # Verify last run time was updated
        task_info = self.scheduler_adapter.get_task_info(task_id)
        assert task_info["last_run"] is not None
        
        # Verify registry was updated
        registry_task = self.scheduler_adapter._get_entity("ScheduledTask", task_id)
        assert registry_task["last_run"] is not None
    
    @pytest.mark.asyncio
    async def test_scheduler_loop_execution(self):
        """Test execution of the scheduler loop."""
        # Schedule integrations that should run immediately
        integration_id = self.test_integration["id"]
        
        # Create a custom cron that will always match current time
        now = datetime.now(pytz.UTC)
        cron_expr = f"{now.minute} {now.hour} * * *"
        
        # Schedule via custom cron
        task_id = self.scheduler_adapter.schedule_integration(
            integration_id, f"Custom: {cron_expr}")
        
        # Set last run to >1 minute ago so it will run
        task_info = self.scheduler.get_task_info(task_id)
        task_info["last_run"] = now - timedelta(minutes=2)
        
        # Mock the _should_run_now to always return True for this test
        with patch.object(self.scheduler, '_should_run_now', return_value=True):
            # Run a single loop iteration
            executed_tasks = await self.scheduler_adapter.test_scheduler_loop()
            
            # Verify our task was executed
            assert len(executed_tasks) == 1
            assert executed_tasks[0]["task_id"] == task_id
            assert executed_tasks[0]["integration_id"] == integration_id
    
    @pytest.mark.asyncio
    async def test_multiple_task_scheduling(self):
        """Test scheduling and running multiple tasks."""
        # Create and schedule multiple integrations
        integration1 = self.test_integration
        
        integration2 = self.integration_adapter.create_integration({
            "name": "Test Integration 2",
            "type": "File-based",
            "source": "S3",
            "destination": "Azure Blob",
            "status": "active"
        })
        
        integration3 = self.integration_adapter.create_integration({
            "name": "Test Integration 3",
            "type": "API-based",
            "source": "REST API",
            "destination": "Salesforce",
            "status": "active"
        })
        
        # Schedule all integrations
        task_id1 = self.scheduler_adapter.schedule_integration(integration1["id"], "Daily @ 2am")
        task_id2 = self.scheduler_adapter.schedule_integration(integration2["id"], "Hourly")
        task_id3 = self.scheduler_adapter.schedule_integration(integration3["id"], "Every 15 minutes")
        
        # Verify all tasks are scheduled
        tasks = self.scheduler_adapter.get_scheduled_tasks()
        assert len(tasks) == 3
        
        # Force all tasks to run
        with patch.object(self.scheduler, '_should_run_now', return_value=True):
            executed_tasks = await self.scheduler_adapter.test_scheduler_loop()
            
            # Verify all tasks were executed
            assert len(executed_tasks) == 3
            task_ids = [task["task_id"] for task in executed_tasks]
            assert task_id1 in task_ids
            assert task_id2 in task_ids
            assert task_id3 in task_ids