"""
Scheduler Tests

This module contains tests for the IntegrationScheduler class in the utils/scheduler.py module.
"""

import pytest
import asyncio
import pytz
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch, AsyncMock

# Import the scheduler class
from utils.scheduler import IntegrationScheduler


class TestScheduler:
    """Tests for the IntegrationScheduler class."""
    
    @pytest.fixture
    def run_integration_mock(self):
        """Create a mock for the run_integration function."""
        mock = AsyncMock()
        mock.return_value = {"status": "success", "records_processed": 10}
        return mock
    
    @pytest.fixture
    def scheduler(self, run_integration_mock):
        """Create a scheduler instance for testing."""
        scheduler = IntegrationScheduler(run_integration_mock)
        yield scheduler
        # Stop the scheduler after each test
        scheduler.stop()
    
    @pytest.mark.asyncio
    async def test_scheduler_initialization(self, scheduler, run_integration_mock):
        """Test that the scheduler initializes correctly."""
        assert scheduler.run_integration_func == run_integration_mock
        assert scheduler.scheduled_tasks == {}
        assert scheduler.is_running is False
    
    def test_start_stop(self, scheduler, monkeypatch):
        """Test starting and stopping the scheduler."""
        # Mock asyncio.create_task to avoid need for event loop
        mock_task = MagicMock()
        monkeypatch.setattr(asyncio, "create_task", mock_task)
        
        # Start the scheduler
        scheduler.start()
        assert scheduler.is_running is True
        assert mock_task.called
        
        # Start again (should do nothing)
        mock_task.reset_mock()
        scheduler.start()
        assert scheduler.is_running is True
        assert not mock_task.called
        
        # Stop the scheduler
        scheduler.stop()
        assert scheduler.is_running is False
    
    @pytest.mark.asyncio
    async def test_schedule_integration(self, scheduler):
        """Test scheduling an integration."""
        # Schedule an integration
        task_id = scheduler.schedule_integration(1, "Daily @ 2am")
        
        # Check that the task was scheduled
        assert task_id == "integration_1"
        assert task_id in scheduler.scheduled_tasks
        assert scheduler.scheduled_tasks[task_id]["integration_id"] == 1
        assert scheduler.scheduled_tasks[task_id]["schedule_str"] == "Daily @ 2am"
        assert scheduler.scheduled_tasks[task_id]["cron_expression"] == "0 2 * * *"
        assert scheduler.scheduled_tasks[task_id]["last_run"] is None
    
    @pytest.mark.asyncio
    async def test_unschedule_integration(self, scheduler):
        """Test unscheduling an integration."""
        # Schedule an integration
        task_id = scheduler.schedule_integration(1, "Daily @ 2am")
        
        # Unschedule the integration
        result = scheduler.unschedule_integration(1)
        assert result is True
        assert task_id not in scheduler.scheduled_tasks
        
        # Try to unschedule a non-existent integration
        result = scheduler.unschedule_integration(999)
        assert result is False
    
    @pytest.mark.asyncio
    async def test_get_scheduled_tasks(self, scheduler):
        """Test getting all scheduled tasks."""
        # Schedule some integrations
        scheduler.schedule_integration(1, "Daily @ 2am")
        scheduler.schedule_integration(2, "Hourly")
        
        # Get all scheduled tasks
        tasks = scheduler.get_scheduled_tasks()
        assert len(tasks) == 2
        assert "integration_1" in tasks
        assert "integration_2" in tasks
    
    @pytest.mark.asyncio
    async def test_get_task_info(self, scheduler):
        """Test getting information about a specific task."""
        # Schedule an integration
        task_id = scheduler.schedule_integration(1, "Daily @ 2am")
        
        # Get task info
        task_info = scheduler.get_task_info(task_id)
        assert task_info["integration_id"] == 1
        assert task_info["schedule_str"] == "Daily @ 2am"
        assert task_info["cron_expression"] == "0 2 * * *"
        assert task_info["last_run"] is None
        
        # Try to get info for a non-existent task
        task_info = scheduler.get_task_info("non_existent_task")
        assert task_info is None
    
    @pytest.mark.asyncio
    async def test_should_run_now(self, scheduler):
        """Test the _should_run_now method."""
        # Schedule an integration
        scheduler.schedule_integration(1, "Every 15 minutes")
        task_info = scheduler.scheduled_tasks["integration_1"]
        
        # Should run when enough time has passed and cron matches
        now = datetime.now(pytz.UTC)
        # Simulate last run more than a minute ago
        task_info["last_run"] = now - timedelta(minutes=16)
        
        # Should run now (assuming clock minute % 15 == 0)
        adjusted_now = datetime(now.year, now.month, now.day, now.hour, 
                               (now.minute // 15) * 15, 0, tzinfo=pytz.UTC)
        assert scheduler._should_run_now(task_info, adjusted_now) is True
        
        # Should not run when last run was too recent
        task_info["last_run"] = now - timedelta(seconds=30)
        assert scheduler._should_run_now(task_info, now) is False
        
        # Should not run when cron expression doesn't match
        task_info["last_run"] = now - timedelta(minutes=16)
        # Minute not divisible by 15
        non_matching_now = datetime(now.year, now.month, now.day, now.hour, 
                                   (now.minute // 15) * 15 + 7, 0, tzinfo=pytz.UTC)
        assert scheduler._should_run_now(task_info, non_matching_now) is False
    
    @pytest.mark.asyncio
    async def test_matches_cron(self, scheduler):
        """Test the _matches_cron method."""
        # Test wildcard
        dt = datetime(2023, 1, 1, 12, 0, 0, tzinfo=pytz.UTC)
        assert scheduler._matches_cron("* * * * *", dt) is True
        
        # Test specific values
        dt = datetime(2023, 1, 1, 12, 30, 0, tzinfo=pytz.UTC)
        assert scheduler._matches_cron("30 12 1 1 *", dt) is True
        assert scheduler._matches_cron("30 13 1 1 *", dt) is False
        
        # Test ranges
        dt = datetime(2023, 1, 1, 12, 30, 0, tzinfo=pytz.UTC)
        assert scheduler._matches_cron("30 10-14 1 1 *", dt) is True
        assert scheduler._matches_cron("30 15-20 1 1 *", dt) is False
        
        # Test lists
        dt = datetime(2023, 1, 1, 12, 30, 0, tzinfo=pytz.UTC)
        assert scheduler._matches_cron("30 12,13,14 1 1 *", dt) is True
        assert scheduler._matches_cron("30 9,10,11 1 1 *", dt) is False
        
        # Test steps
        dt = datetime(2023, 1, 1, 12, 30, 0, tzinfo=pytz.UTC)
        assert scheduler._matches_cron("*/30 * * * *", dt) is True
        assert scheduler._matches_cron("*/15 * * * *", dt) is True
        dt = datetime(2023, 1, 1, 12, 31, 0, tzinfo=pytz.UTC)
        assert scheduler._matches_cron("*/30 * * * *", dt) is False
        
        # Test day of week
        # January 1, 2023 was a Sunday (weekday 6)
        dt = datetime(2023, 1, 1, 12, 0, 0, tzinfo=pytz.UTC)
        assert scheduler._matches_cron("0 12 * * 6", dt) is True
        assert scheduler._matches_cron("0 12 * * 5", dt) is False
    
    @pytest.mark.asyncio
    async def test_schedule_to_cron(self, scheduler):
        """Test the _schedule_to_cron method."""
        # Test common schedules
        assert scheduler._schedule_to_cron("Daily @ 2am") == "0 2 * * *"
        assert scheduler._schedule_to_cron("Hourly") == "0 * * * *"
        assert scheduler._schedule_to_cron("Every 15 minutes") == "*/15 * * * *"
        assert scheduler._schedule_to_cron("Weekly on Fridays") == "0 0 * * 5"
        assert scheduler._schedule_to_cron("Monthly (1st day)") == "0 0 1 * *"
        
        # Test custom cron expression
        assert scheduler._schedule_to_cron("Custom: 15 14 * * 1-5") == "15 14 * * 1-5"
        
        # Test invalid custom cron (should return default)
        assert scheduler._schedule_to_cron("Custom: invalid cron") == "0 0 * * *"
        
        # Test unknown schedule (should return default)
        assert scheduler._schedule_to_cron("Unknown Schedule") == "0 0 * * *"
    
    @pytest.mark.asyncio
    async def test_is_valid_cron(self, scheduler):
        """Test the _is_valid_cron method."""
        # Valid cron expressions
        assert scheduler._is_valid_cron("* * * * *") is True
        assert scheduler._is_valid_cron("0 2 * * *") is True
        assert scheduler._is_valid_cron("*/15 * * * *") is True
        assert scheduler._is_valid_cron("0 0 1 * *") is True
        assert scheduler._is_valid_cron("0 9-17 * * 1-5") is True
        
        # Invalid cron expressions
        assert scheduler._is_valid_cron("") is False
        assert scheduler._is_valid_cron(None) is False
        assert scheduler._is_valid_cron("* * * *") is False  # Not enough parts
        assert scheduler._is_valid_cron("* * * * * *") is False  # Too many parts
        assert scheduler._is_valid_cron("60 * * * *") is False  # Invalid minute
        assert scheduler._is_valid_cron("* 24 * * *") is False  # Invalid hour
        assert scheduler._is_valid_cron("* * 32 * *") is False  # Invalid day
        assert scheduler._is_valid_cron("* * * 13 *") is False  # Invalid month
        assert scheduler._is_valid_cron("* * * * 7") is False  # Invalid weekday
    
    @pytest.mark.asyncio
    async def test_run_task(self, scheduler, run_integration_mock):
        """Test the _run_task method."""
        # Schedule an integration
        task_id = scheduler.schedule_integration(1, "Daily @ 2am")
        task_info = scheduler.scheduled_tasks[task_id]
        
        # Run the task
        await scheduler._run_task(task_id, task_info)
        
        # Check that run_integration_func was called
        run_integration_mock.assert_called_once_with(1)
        
        # Check that last_run was updated
        assert task_info["last_run"] is not None
    
    @pytest.mark.asyncio
    async def test_run_task_error_handling(self, scheduler):
        """Test error handling in the _run_task method."""
        # Create a mock that raises an exception
        error_mock = AsyncMock(side_effect=Exception("Test error"))
        scheduler.run_integration_func = error_mock
        
        # Schedule an integration
        task_id = scheduler.schedule_integration(1, "Daily @ 2am")
        task_info = scheduler.scheduled_tasks[task_id]
        
        # Run the task (should not raise an exception)
        await scheduler._run_task(task_id, task_info)
        
        # Check that run_integration_func was called
        error_mock.assert_called_once_with(1)
        
        # Last run should not be updated on error
        assert task_info["last_run"] is None
    
    @pytest.mark.asyncio
    async def test_scheduler_loop(self, scheduler, monkeypatch):
        """Test the scheduler loop."""
        # Mock _should_run_now and _run_task
        should_run_mock = MagicMock(return_value=True)
        run_task_mock = AsyncMock()
        monkeypatch.setattr(scheduler, "_should_run_now", should_run_mock)
        monkeypatch.setattr(scheduler, "_run_task", run_task_mock)
        
        # Mock asyncio.sleep to avoid waiting
        async def quick_sleep(*args):
            scheduler.is_running = False  # Stop after one iteration
        monkeypatch.setattr(asyncio, "sleep", quick_sleep)
        
        # Schedule an integration
        scheduler.schedule_integration(1, "Daily @ 2am")
        
        # Start the scheduler and run the loop
        scheduler.start()
        await scheduler._scheduler_loop()
        
        # Check that _should_run_now was called
        should_run_mock.assert_called()
        
        # If _should_run_now returns True, _run_task should be called
        run_task_mock.assert_called()


@pytest.fixture
def integration_runner_mock():
    """Create a mock for the IntegrationRunner class."""
    mock = MagicMock()
    mock.run = AsyncMock(return_value={"status": "success", "records_processed": 10})
    return mock


@pytest.mark.asyncio
async def test_integration_with_runner(integration_runner_mock):
    """Test integration between scheduler and integration runner."""
    # Create a scheduler that uses the integration runner
    scheduler = IntegrationScheduler(integration_runner_mock.run)
    
    # Schedule an integration
    task_id = scheduler.schedule_integration(1, "Daily @ 2am")
    
    # Get the task info
    task_info = scheduler.get_task_info(task_id)
    
    # Run the task
    await scheduler._run_task(task_id, task_info)
    
    # Check that the integration runner's run method was called
    integration_runner_mock.run.assert_called_once_with(1)
    
    # Clean up
    scheduler.stop()