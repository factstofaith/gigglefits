"""
Integration Scheduler

This module provides a scheduling service for running integrations
at specified intervals using cron-like expressions.
"""

import asyncio
import logging
from datetime import datetime, timedelta
import pytz
from typing import Dict, Any, Optional, List, Callable, Awaitable
import re

logger = logging.getLogger(__name__)

class IntegrationScheduler:
    """Service to schedule and run integrations at specified times"""
    
    def __init__(self, run_integration_func: Callable[[int], Awaitable[Dict[str, Any]]]):
        """
        Initialize the scheduler
        
        Args:
            run_integration_func: Function to run an integration, takes integration_id 
                                and returns a coroutine that resolves to a dict with results
        """
        self.run_integration_func = run_integration_func
        self.scheduled_tasks = {}  # task_id -> task_info
        self.is_running = False
        
    def start(self):
        """Start the scheduler"""
        if self.is_running:
            return
            
        self.is_running = True
        asyncio.create_task(self._scheduler_loop())
        logger.info("Integration scheduler started")
        
    def stop(self):
        """Stop the scheduler"""
        self.is_running = False
        logger.info("Integration scheduler stopped")
        
    async def _scheduler_loop(self):
        """Main scheduler loop - checks for tasks to run every minute"""
        while self.is_running:
            now = datetime.now(pytz.timezone)
            
            # Check each scheduled task
            for task_id, task_info in list(self.scheduled_tasks.items()):
                if self._should_run_now(task_info, now):
                    # Launch task in background
                    asyncio.create_task(self._run_task(task_id, task_info))
                    
            # Sleep for 60 seconds
            await asyncio.sleep(60)
            
    def _should_run_now(self, task_info: Dict[str, Any], now: datetime) -> bool:
        """
        Check if a task should run based on its schedule
        
        Args:
            task_info: Task information including schedule
            now: Current time
            
        Returns:
            bool: True if the task should run now
        """
        if not task_info.get('cron_expression'):
            return False
            
        # Get the last run time or use a default
        last_run = task_info.get('last_run') or (now - timedelta(days=1))
        
        # Check if enough time has passed since last run
        if now - last_run < timedelta(minutes=1):
            return False
        
        # Parse cron expression
        return self._matches_cron(task_info['cron_expression'], now)
        
    def _matches_cron(self, cron_expression: str, dt: datetime) -> bool:
        """
        Check if a datetime matches a cron expression
        
        Args:
            cron_expression: Cron expression (minute hour day-of-month month day-of-week)
            dt: Datetime to check
            
        Returns:
            bool: True if the datetime matches the cron expression
        """
        # Simple cron format: minute hour day-of-month month day-of-week
        parts = cron_expression.split()
        if len(parts) != 5:
            logger.error(f"Invalid cron expression: {cron_expression}")
            return False
            
        minute, hour, day, month, weekday = parts
        
        # Helper to check a value against a cron pattern
        def match_pattern(value, pattern):
            if pattern == '*':
                return True
                
            # Handle lists (e.g., "1,3,5")
            if ',' in pattern:
                return str(value) in pattern.split(',')
                
            # Handle ranges (e.g., "1-5")
            if '-' in pattern:
                start, end = map(int, pattern.split('-'))
                return start <= value <= end
                
            # Handle steps (e.g., "*/15")
            if '/' in pattern:
                base, step = pattern.split('/')
                if base == '*':
                    return value % int(step) == 0
                    
            # Direct match
            return value == int(pattern)
            
        # Check each component
        return (
            match_pattern(dt.minute, minute) and
            match_pattern(dt.hour, hour) and
            match_pattern(dt.day, day) and
            match_pattern(dt.month, month) and
            match_pattern(dt.weekday(), weekday)
        )
        
    async def _run_task(self, task_id: str, task_info: Dict[str, Any]):
        """
        Execute an integration task
        
        Args:
            task_id: Task identifier
            task_info: Task information including integration_id
        """
        integration_id = task_info['integration_id']
        
        try:
            logger.info(f"Running scheduled integration {integration_id}")
            result = await self.run_integration_func(integration_id)
            
            # Update last run time
            self.scheduled_tasks[task_id]['last_run'] = datetime.now(pytz.UTC)
            
            logger.info(f"Scheduled integration {integration_id} completed with result: {result}")
        except Exception as e:
            logger.error(f"Error running scheduled integration {integration_id}: {e}")
            
    def schedule_integration(self, integration_id: int, schedule_str: str) -> str:
        """
        Schedule an integration to run on the given schedule
        
        Args:
            integration_id: Integration ID to schedule
            schedule_str: User-friendly schedule string
            
        Returns:
            str: Task ID for the scheduled integration
        """
        # Convert user-friendly schedule to cron expression
        cron_expression = self._schedule_to_cron(schedule_str)
        
        task_id = f"integration_{integration_id}"
        self.scheduled_tasks[task_id] = {
            'integration_id': integration_id,
            'cron_expression': cron_expression,
            'schedule_str': schedule_str,
            'last_run': None
        }
        
        logger.info(f"Scheduled integration {integration_id} with schedule: {schedule_str} ({cron_expression})")
        return task_id
        
    def _schedule_to_cron(self, schedule_str: str) -> str:
        """
        Convert user-friendly schedule to cron expression
        
        Args:
            schedule_str: User-friendly schedule string
            
        Returns:
            str: Cron expression
        """
        # Handle custom cron expressions
        if schedule_str.startswith('Custom:'):
            cron = schedule_str.replace('Custom:', '').strip()
            if self._is_valid_cron(cron):
                return cron
            else:
                logger.warning(f"Invalid custom cron expression: {cron}")
                return '0 0 * * *'  # Default to midnight daily
        
        # Common schedule patterns
        schedule_map = {
            'On demand': None,  # No automatic scheduling
            'Daily @ 2am': '0 2 * * *',
            'Daily @ 6am': '0 6 * * *',
            'Hourly': '0 * * * *',
            'Every 15 minutes': '*/15 * * * *',
            'Weekly on Fridays': '0 0 * * 5',
            'Monthly (1st day)': '0 0 1 * *',
            'Every weekday at 9am': '0 9 * * 1-5',
            'Every Saturday at noon': '0 12 * * 6'
        }
        
        return schedule_map.get(schedule_str, '0 0 * * *')  # Default to midnight daily
    
    def _is_valid_cron(self, cron: str) -> bool:
        """
        Validate a cron expression
        
        Args:
            cron: Cron expression to validate
            
        Returns:
            bool: True if valid
        """
        if not cron or not isinstance(cron, str):
            return False
            
        parts = cron.split()
        if len(parts) != 5:
            return False
            
        # Check each part for valid format
        patterns = [
            r'^(\*|[0-9]|[0-5][0-9]|(\*|[0-9]|[0-5][0-9])\/([0-9]|[0-5][0-9])|([0-9]|[0-5][0-9])-([0-9]|[0-5][0-9]))$',  # minute
            r'^(\*|[0-9]|1[0-9]|2[0-3]|(\*|[0-9]|1[0-9]|2[0-3])\/([0-9]|1[0-9]|2[0-3])|([0-9]|1[0-9]|2[0-3])-([0-9]|1[0-9]|2[0-3]))$',  # hour
            r'^(\*|[1-9]|[12][0-9]|3[01]|(\*|[1-9]|[12][0-9]|3[01])\/([1-9]|[12][0-9]|3[01])|([1-9]|[12][0-9]|3[01])-([1-9]|[12][0-9]|3[01]))$',  # day
            r'^(\*|[1-9]|1[0-2]|(\*|[1-9]|1[0-2])\/([1-9]|1[0-2])|([1-9]|1[0-2])-([1-9]|1[0-2]))$',  # month
            r'^(\*|[0-6]|(\*|[0-6])\/[0-6]|[0-6]-[0-6])$'  # weekday
        ]
        
        # Check each part against its pattern
        for i, part in enumerate(parts):
            if not re.match(patterns[i], part):
                return False
                
        return True
        
    def unschedule_integration(self, integration_id: int) -> bool:
        """
        Remove a scheduled integration
        
        Args:
            integration_id: Integration ID to unschedule
            
        Returns:
            bool: True if found and removed, False otherwise
        """
        task_id = f"integration_{integration_id}"
        if task_id in self.scheduled_tasks:
            del self.scheduled_tasks[task_id]
            logger.info(f"Unscheduled integration {integration_id}")
            return True
        return False
    
    def get_scheduled_tasks(self) -> Dict[str, Dict[str, Any]]:
        """
        Get all scheduled tasks
        
        Returns:
            Dict[str, Dict[str, Any]]: Copy of the scheduled tasks dictionary
        """
        # Return a deep copy to avoid modification
        return {
            task_id: {
                'integration_id': task_info['integration_id'],
                'schedule_str': task_info['schedule_str'],
                'cron_expression': task_info['cron_expression'],
                'last_run': task_info.get('last_run')
            }
            for task_id, task_info in self.scheduled_tasks.items()
        }
    
    def get_task_info(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a specific task
        
        Args:
            task_id: Task ID
            
        Returns:
            Optional[Dict[str, Any]]: Task information or None if not found
        """
        return self.scheduled_tasks.get(task_id)