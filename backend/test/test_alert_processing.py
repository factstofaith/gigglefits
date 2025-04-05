"""
Tests for alert processing functionality in the monitoring service.
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import patch, AsyncMock, MagicMock

from backend.modules.admin.monitoring_service import (
    get_alerts,
    get_alert_by_id,
    create_alert,
    update_alert,
    delete_alert,
    get_alert_history,
    acknowledge_alert,
    resolve_alert,
    mute_alert,
    unmute_alert,
    process_alerts,
    evaluate_alert_condition
)

from backend.modules.admin.models import (
    AlertCreate,
    AlertUpdate,
    Alert,
    AlertSeverity,
    AlertStatus,
    AlertConditionOperator,
    AlertNotificationChannel,
    AlertCondition,
    AlertNotificationConfig,
    AlertHistoryEntry,
    AlertHistoryAction
)

# Sample alert data
SAMPLE_ALERTS = [
    {
        "id": "alert-id-1",
        "name": "High CPU Usage",
        "description": "Alert on high CPU usage",
        "resource_id": "resource-id-1",
        "resource_name": "test-app",
        "resource_type": "Microsoft.Web/sites",
        "severity": AlertSeverity.HIGH,
        "status": AlertStatus.ACTIVE,
        "is_muted": False,
        "conditions": [
            {
                "metric": "cpu",
                "operator": AlertConditionOperator.GREATER_THAN,
                "threshold": 80.0,
                "evaluation_period": 5
            }
        ],
        "notification_channels": [
            {
                "type": AlertNotificationChannel.EMAIL,
                "recipients": ["admin@example.com"],
                "settings": {"include_details": True}
            }
        ],
        "last_updated": datetime.now(timezone.utc) - timedelta(hours=1),
        "last_triggered": datetime.now(timezone.utc) - timedelta(minutes=30),
        "created_at": datetime.now(timezone.utc) - timedelta(days=1),
        "created_by": "test-user"
    },
    {
        "id": "alert-id-2",
        "name": "Database Connection Limit",
        "description": "Alert on high database connections",
        "resource_id": "resource-id-2",
        "resource_name": "test-db",
        "resource_type": "Microsoft.DBforPostgreSQL/servers",
        "severity": AlertSeverity.MEDIUM,
        "status": AlertStatus.RESOLVED,
        "is_muted": False,
        "conditions": [
            {
                "metric": "connections",
                "operator": AlertConditionOperator.GREATER_THAN,
                "threshold": 100.0,
                "evaluation_period": 5
            }
        ],
        "notification_channels": [
            {
                "type": AlertNotificationChannel.WEBHOOK,
                "recipients": [],
                "settings": {"url": "https://example.com/webhook"}
            }
        ],
        "last_updated": datetime.now(timezone.utc) - timedelta(hours=2),
        "last_triggered": datetime.now(timezone.utc) - timedelta(hours=3),
        "created_at": datetime.now(timezone.utc) - timedelta(days=2),
        "created_by": "test-user"
    }
]

# Sample alert history data
SAMPLE_HISTORY = [
    {
        "id": "history-id-1",
        "alert_id": "alert-id-1",
        "action": AlertHistoryAction.TRIGGERED,
        "status": AlertStatus.ACTIVE,
        "message": "CPU usage exceeded threshold: 85%",
        "value": 85.0,
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=30),
        "user_id": None
    },
    {
        "id": "history-id-2",
        "alert_id": "alert-id-1",
        "action": AlertHistoryAction.ACKNOWLEDGED,
        "status": AlertStatus.ACKNOWLEDGED,
        "message": "Alert acknowledged by admin",
        "value": None,
        "timestamp": datetime.now(timezone.utc) - timedelta(minutes=15),
        "user_id": "admin-user"
    },
    {
        "id": "history-id-3",
        "alert_id": "alert-id-2",
        "action": AlertHistoryAction.TRIGGERED,
        "status": AlertStatus.ACTIVE,
        "message": "Database connections exceeded threshold: 120",
        "value": 120.0,
        "timestamp": datetime.now(timezone.utc) - timedelta(hours=3),
        "user_id": None
    },
    {
        "id": "history-id-4",
        "alert_id": "alert-id-2",
        "action": AlertHistoryAction.RESOLVED,
        "status": AlertStatus.RESOLVED,
        "message": "Alert automatically resolved",
        "value": 50.0,
        "timestamp": datetime.now(timezone.utc) - timedelta(hours=2),
        "user_id": None
    }
]

# Mock for database
class MockDatabase:
    def __init__(self):
        self.executed_queries = []
        self.query_values = []
    
    async def fetch_all(self, query, values=None):
        if "alert_history" in query and values and values.get("alert_id") == "alert-id-1":
            return [h for h in SAMPLE_HISTORY if h["alert_id"] == "alert-id-1"]
        elif "alert_history" in query:
            return SAMPLE_HISTORY
        elif "alerts" in query and values and values.get("status") == AlertStatus.ACTIVE:
            return [a for a in SAMPLE_ALERTS if a["status"] == AlertStatus.ACTIVE]
        elif "alerts" in query and values and values.get("resource_id"):
            return [a for a in SAMPLE_ALERTS if a["resource_id"] == values["resource_id"]]
        return SAMPLE_ALERTS
    
    async def fetch_one(self, query, values=None):
        if "alerts" in query and values and values.get("id"):
            for alert in SAMPLE_ALERTS:
                if alert["id"] == values["id"]:
                    return alert
        return None
    
    async def execute(self, query, values=None):
        self.executed_queries.append(query)
        self.query_values.append(values)
        return "mock-id"


@pytest.mark.asyncio
async def test_get_alerts():
    """Test retrieving all alerts"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get all alerts
        alerts = await get_alerts()
        
        # Verify the result
        assert isinstance(alerts, list)
        assert len(alerts) == 2
        assert all(isinstance(a, Alert) for a in alerts)
        assert alerts[0].name == "High CPU Usage"
        assert alerts[1].name == "Database Connection Limit"


@pytest.mark.asyncio
async def test_get_alerts_by_status():
    """Test retrieving alerts by status"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get active alerts
        alerts = await get_alerts(status=AlertStatus.ACTIVE)
        
        # Verify the result
        assert isinstance(alerts, list)
        assert len(alerts) == 1
        assert alerts[0].name == "High CPU Usage"
        assert alerts[0].status == AlertStatus.ACTIVE


@pytest.mark.asyncio
async def test_get_alerts_by_resource():
    """Test retrieving alerts by resource"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get alerts for test-app
        alerts = await get_alerts(resource_id="resource-id-1")
        
        # Verify the result
        assert isinstance(alerts, list)
        assert len(alerts) == 1
        assert alerts[0].name == "High CPU Usage"
        assert alerts[0].resource_id == "resource-id-1"


@pytest.mark.asyncio
async def test_get_alert_by_id():
    """Test retrieving a specific alert by ID"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get alert by ID
        alert = await get_alert_by_id("alert-id-1")
        
        # Verify the result
        assert isinstance(alert, Alert)
        assert alert.id == "alert-id-1"
        assert alert.name == "High CPU Usage"
        assert alert.severity == AlertSeverity.HIGH
        assert len(alert.conditions) == 1
        assert alert.conditions[0].metric == "cpu"
        assert alert.conditions[0].threshold == 80.0
        
        # Test non-existent alert
        alert = await get_alert_by_id("non-existent-id")
        
        # Verify the result
        assert alert is None


@pytest.mark.asyncio
async def test_create_alert():
    """Test creating a new alert"""
    # Mock the database
    mock_db = MockDatabase()
    with patch("backend.modules.admin.monitoring_service.database", mock_db):
        # Create alert data
        alert_data = AlertCreate(
            name="New Test Alert",
            description="A test alert",
            resource_id="resource-id-3",
            resource_name="test-storage",
            resource_type="Microsoft.Storage/storageAccounts",
            severity=AlertSeverity.LOW,
            conditions=[
                AlertCondition(
                    metric="capacity",
                    operator=AlertConditionOperator.GREATER_THAN,
                    threshold=90.0,
                    evaluation_period=5
                )
            ],
            notification_channels=[
                AlertNotificationConfig(
                    type=AlertNotificationChannel.EMAIL,
                    recipients=["admin@example.com"],
                    settings={"include_details": True}
                )
            ]
        )
        
        # Create the alert
        alert = await create_alert(alert_data, "test-user")
        
        # Verify the result
        assert isinstance(alert, Alert)
        assert alert.name == "New Test Alert"
        assert alert.status == AlertStatus.ENABLED  # Default status
        
        # Verify database was called with INSERT
        assert len(mock_db.executed_queries) >= 1
        assert any("INSERT INTO" in query for query in mock_db.executed_queries)


@pytest.mark.asyncio
async def test_update_alert():
    """Test updating an existing alert"""
    # Mock the database
    mock_db = MockDatabase()
    with patch("backend.modules.admin.monitoring_service.database", mock_db):
        # Create update data
        update_data = AlertUpdate(
            name="Updated Alert Name",
            description="Updated description",
            severity=AlertSeverity.CRITICAL
        )
        
        # Update the alert
        updated = await update_alert("alert-id-1", update_data, "admin-user")
        
        # Verify the result
        assert updated is True
        
        # Verify database was called with UPDATE
        assert len(mock_db.executed_queries) >= 1
        assert any("UPDATE" in query for query in mock_db.executed_queries)


@pytest.mark.asyncio
async def test_delete_alert():
    """Test deleting an alert"""
    # Mock the database
    mock_db = MockDatabase()
    with patch("backend.modules.admin.monitoring_service.database", mock_db):
        # Delete the alert
        deleted = await delete_alert("alert-id-1")
        
        # Verify the result
        assert deleted is True
        
        # Verify database was called with DELETE
        assert len(mock_db.executed_queries) >= 1
        assert any("DELETE FROM" in query for query in mock_db.executed_queries)


@pytest.mark.asyncio
async def test_get_alert_history():
    """Test retrieving alert history"""
    # Mock the database
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()):
        # Get history for all alerts
        history = await get_alert_history()
        
        # Verify the result
        assert isinstance(history, list)
        assert len(history) == 4
        assert all(isinstance(h, AlertHistoryEntry) for h in history)
        
        # Get history for specific alert
        history = await get_alert_history(alert_id="alert-id-1")
        
        # Verify the result
        assert isinstance(history, list)
        assert len(history) == 2
        assert all(h.alert_id == "alert-id-1" for h in history)


@pytest.mark.asyncio
async def test_acknowledge_alert():
    """Test acknowledging an alert"""
    # Mock the database
    mock_db = MockDatabase()
    with patch("backend.modules.admin.monitoring_service.database", mock_db):
        # Acknowledge the alert
        acknowledged = await acknowledge_alert("alert-id-1", "admin-user", "Acknowledged by admin")
        
        # Verify the result
        assert acknowledged is True
        
        # Verify database was called with UPDATE and INSERT
        assert len(mock_db.executed_queries) >= 2
        assert any("UPDATE alerts SET status" in query for query in mock_db.executed_queries)
        assert any("INSERT INTO alert_history" in query for query in mock_db.executed_queries)


@pytest.mark.asyncio
async def test_resolve_alert():
    """Test resolving an alert"""
    # Mock the database
    mock_db = MockDatabase()
    with patch("backend.modules.admin.monitoring_service.database", mock_db):
        # Resolve the alert
        resolved = await resolve_alert("alert-id-1", "admin-user", "Resolved by admin")
        
        # Verify the result
        assert resolved is True
        
        # Verify database was called with UPDATE and INSERT
        assert len(mock_db.executed_queries) >= 2
        assert any("UPDATE alerts SET status" in query for query in mock_db.executed_queries)
        assert any("INSERT INTO alert_history" in query for query in mock_db.executed_queries)


@pytest.mark.asyncio
async def test_mute_alert():
    """Test muting an alert"""
    # Mock the database
    mock_db = MockDatabase()
    with patch("backend.modules.admin.monitoring_service.database", mock_db):
        # Mute the alert
        muted = await mute_alert("alert-id-1", "admin-user", "Muted for maintenance")
        
        # Verify the result
        assert muted is True
        
        # Verify database was called with UPDATE and INSERT
        assert len(mock_db.executed_queries) >= 2
        assert any("UPDATE alerts SET is_muted" in query for query in mock_db.executed_queries)
        assert any("INSERT INTO alert_history" in query for query in mock_db.executed_queries)


@pytest.mark.asyncio
async def test_unmute_alert():
    """Test unmuting an alert"""
    # Mock the database
    mock_db = MockDatabase()
    with patch("backend.modules.admin.monitoring_service.database", mock_db):
        # Unmute the alert
        unmuted = await unmute_alert("alert-id-1", "admin-user", "Maintenance complete")
        
        # Verify the result
        assert unmuted is True
        
        # Verify database was called with UPDATE and INSERT
        assert len(mock_db.executed_queries) >= 2
        assert any("UPDATE alerts SET is_muted" in query for query in mock_db.executed_queries)
        assert any("INSERT INTO alert_history" in query for query in mock_db.executed_queries)


@pytest.mark.asyncio
async def test_process_alerts():
    """Test the alert processing functionality"""
    # Mock the database and other services
    with patch("backend.modules.admin.monitoring_service.database", MockDatabase()), \
         patch("backend.modules.admin.monitoring_service.evaluate_alert_conditions") as mock_evaluate, \
         patch("backend.modules.admin.monitoring_service.send_alert_notifications") as mock_notify:
        
        # Mock evaluation results
        mock_evaluate.return_value = [
            {"alert": SAMPLE_ALERTS[0], "triggered": True, "value": 85.0, "message": "CPU usage exceeded threshold: 85%"},
            {"alert": SAMPLE_ALERTS[1], "triggered": False, "value": 50.0, "message": "Current value: 50"}
        ]
        
        # Process alerts
        result = await process_alerts()
        
        # Verify the result
        assert isinstance(result, dict)
        assert "processed" in result
        assert "triggered" in result
        assert result["processed"] == 2
        assert result["triggered"] == 1
        
        # Verify evaluation and notification were called
        mock_evaluate.assert_called_once()
        mock_notify.assert_called_once()
        assert len(mock_notify.call_args[0][0]) == 1  # Only one triggered alert


@pytest.mark.asyncio
async def test_evaluate_alert_condition():
    """Test alert condition evaluation"""
    # Test greater than condition (triggered)
    condition = AlertCondition(
        metric="cpu",
        operator=AlertConditionOperator.GREATER_THAN,
        threshold=80.0,
        evaluation_period=5
    )
    result = evaluate_alert_condition(condition, 85.0)
    assert result is True
    
    # Test greater than condition (not triggered)
    result = evaluate_alert_condition(condition, 75.0)
    assert result is False
    
    # Test less than condition (triggered)
    condition = AlertCondition(
        metric="memory",
        operator=AlertConditionOperator.LESS_THAN,
        threshold=20.0,
        evaluation_period=5
    )
    result = evaluate_alert_condition(condition, 15.0)
    assert result is True
    
    # Test less than condition (not triggered)
    result = evaluate_alert_condition(condition, 25.0)
    assert result is False
    
    # Test equals condition (triggered)
    condition = AlertCondition(
        metric="status",
        operator=AlertConditionOperator.EQUALS,
        threshold=404.0,
        evaluation_period=5
    )
    result = evaluate_alert_condition(condition, 404.0)
    assert result is True
    
    # Test equals condition (not triggered)
    result = evaluate_alert_condition(condition, 200.0)
    assert result is False
    
    # Test not equals condition (triggered)
    condition = AlertCondition(
        metric="status",
        operator=AlertConditionOperator.NOT_EQUALS,
        threshold=200.0,
        evaluation_period=5
    )
    result = evaluate_alert_condition(condition, 404.0)
    assert result is True
    
    # Test not equals condition (not triggered)
    result = evaluate_alert_condition(condition, 200.0)
    assert result is False