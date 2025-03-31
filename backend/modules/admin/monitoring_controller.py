"""
Admin Monitoring Controller

This module defines the API endpoints for the admin monitoring functionality,
specifically the Azure monitoring features.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Body, Path, Response
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from ...core.auth import get_current_active_user
from ...db.models import User
from ..users.models import UserRole
from . import service as admin_service
from .models import (
    AzureConfigCreate,
    AzureConfigUpdate,
    AzureConfig,
    AzureConnectionTest,
    AzureResource,
    AzureResourceHealth,
    AzureMetric,
    AzureDiscoveryResult,
    ErrorLog,
    ErrorLogResponse,
    ErrorLogDetail,
    AlertSeverity,
    AlertStatus,
    AlertConditionOperator,
    AlertNotificationChannel,
    AlertCondition,
    AlertNotificationConfig,
    AlertCreate,
    AlertUpdate,
    Alert,
    AlertHistoryAction,
    AlertHistoryEntry,
    AlertListResponse,
    AlertHistoryResponse
)

# Create router
router = APIRouter(prefix="/monitoring", tags=["monitoring"])

# Helper function to check if user is admin
def is_admin_user(user: User) -> bool:
    """Check if the user has admin role"""
    return user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]

# Azure configuration endpoints

@router.get("/azure-config", response_model=AzureConfig)
async def get_azure_config(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get the Azure configuration for monitoring.
    
    This endpoint returns the current Azure configuration used for monitoring,
    including connection details and authentication settings.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    config = await admin_service.get_azure_config()
    if not config:
        raise HTTPException(status_code=404, detail="Azure configuration not found")
    
    return config

@router.post("/azure-config", response_model=AzureConfig)
async def save_azure_config(
    config: AzureConfigCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Save Azure configuration for monitoring.
    
    This endpoint saves the Azure configuration used for monitoring,
    including connection details and authentication settings.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        saved_config = await admin_service.save_azure_config(config, current_user.id)
        return saved_config
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/azure-config", response_model=AzureConfig)
async def update_azure_config(
    config: AzureConfigUpdate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Update Azure configuration for monitoring.
    
    This endpoint updates the Azure configuration used for monitoring,
    allowing partial updates to connection details and authentication settings.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        updated_config = await admin_service.update_azure_config(config, current_user.id)
        if not updated_config:
            raise HTTPException(status_code=404, detail="Azure configuration not found")
        return updated_config
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/azure-config", response_model=Dict[str, bool])
async def delete_azure_config(
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete Azure configuration for monitoring.
    
    This endpoint deletes the Azure configuration used for monitoring.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await admin_service.delete_azure_config()
    return {"success": result}

@router.post("/azure-config/test", response_model=AzureConnectionTest)
async def test_azure_connection(
    config: Optional[AzureConfigCreate] = None,
    current_user: User = Depends(get_current_active_user),
):
    """
    Test Azure connection using the provided configuration.
    
    This endpoint tests the connection to Azure using either the provided
    configuration or the stored configuration if none is provided.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        result = await admin_service.test_azure_connection(config)
        return result
    except Exception as e:
        return AzureConnectionTest(
            success=False,
            message="Failed to connect to Azure",
            details={"error": str(e)},
            timestamp=datetime.utcnow()
        )

@router.get("/azure-config/status", response_model=Dict[str, bool])
async def check_azure_connection_status(
    current_user: User = Depends(get_current_active_user),
):
    """
    Check Azure connection status.
    
    This endpoint checks if the Azure connection is properly configured
    and currently active.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    is_connected = await admin_service.check_azure_connection()
    return {"connected": is_connected}

# Azure resources endpoints

@router.get("/azure/resources", response_model=List[AzureResource])
async def get_azure_resources(
    resource_group: Optional[str] = Query(None, description="Filter by resource group"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get Azure resources.
    
    This endpoint returns a list of Azure resources, optionally filtered
    by resource group.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        resources = await admin_service.get_azure_resources(resource_group)
        return resources
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/azure/resources/{resource_id}", response_model=AzureResource)
async def get_azure_resource(
    resource_id: str = Path(..., description="Azure resource ID"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific Azure resource.
    
    This endpoint returns details for a specific Azure resource.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        resource = await admin_service.get_azure_resource(resource_id)
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found")
        return resource
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/azure/resource-groups", response_model=List[str])
async def get_azure_resource_groups(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get Azure resource groups.
    
    This endpoint returns a list of resource groups in the configured
    Azure subscription.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        resource_groups = await admin_service.get_azure_resource_groups()
        return resource_groups
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/azure/resource-types", response_model=List[str])
async def get_azure_resource_types(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get Azure resource types.
    
    This endpoint returns a list of resource types available in the
    configured Azure subscription.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        resource_types = await admin_service.get_azure_resource_types()
        return resource_types
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/azure/discover", response_model=AzureDiscoveryResult)
async def discover_azure_resources(
    current_user: User = Depends(get_current_active_user),
):
    """
    Discover Azure resources.
    
    This endpoint triggers a discovery process to find and catalog
    Azure resources in the configured subscription and resource group.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        result = await admin_service.discover_azure_resources()
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/azure/health/{resource_id}", response_model=AzureResourceHealth)
async def get_azure_resource_health(
    resource_id: str = Path(..., description="Azure resource ID"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get health status for an Azure resource.
    
    This endpoint returns the health status for a specific Azure resource.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        health = await admin_service.get_azure_resource_health(resource_id)
        if not health:
            raise HTTPException(status_code=404, detail="Resource health not found")
        return health
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Metrics endpoints

@router.get("/metrics", response_model=Dict[str, Any])
async def get_resource_metrics(
    resource_id: str = Query(..., description="Resource identifier (appService, database, storage, keyVault)"),
    metrics: str = Query(..., description="Comma-separated list of metric names"),
    timeframe: str = Query("24h", description="Timeframe for metrics (1h, 6h, 24h, 7d, 30d)"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get metrics for a specific Azure resource.
    
    This endpoint returns metrics data for a specific Azure resource and timeframe.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        # Parse timeframe into datetime objects
        now = datetime.utcnow()
        if timeframe == "1h":
            start_time = now - timedelta(hours=1)
        elif timeframe == "6h":
            start_time = now - timedelta(hours=6)
        elif timeframe == "24h":
            start_time = now - timedelta(days=1)
        elif timeframe == "7d":
            start_time = now - timedelta(days=7)
        elif timeframe == "30d":
            start_time = now - timedelta(days=30)
        else:
            raise HTTPException(status_code=400, detail="Invalid timeframe")
        
        # Parse metrics list
        metric_list = metrics.split(",")
        
        # Get metrics data
        metrics_data = await admin_service.get_resource_metrics(
            resource_id, metric_list, start_time, now
        )
        
        return metrics_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/resource-health", response_model=Dict[str, AzureResourceHealth])
async def get_resource_health(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get health status for all monitored resources.
    
    This endpoint returns the health status for all monitored Azure resources.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        health_data = await admin_service.get_all_resource_health()
        return health_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/storage-analytics", response_model=Dict[str, Any])
async def get_storage_analytics(
    timeframe: str = Query("7d", description="Timeframe for analytics (1h, 6h, 24h, 7d, 30d)"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get analytics data for documentation storage.
    
    This endpoint returns usage analytics for the documentation storage.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        # Parse timeframe into datetime objects
        now = datetime.utcnow()
        if timeframe == "1h":
            start_time = now - timedelta(hours=1)
        elif timeframe == "6h":
            start_time = now - timedelta(hours=6)
        elif timeframe == "24h":
            start_time = now - timedelta(days=1)
        elif timeframe == "7d":
            start_time = now - timedelta(days=7)
        elif timeframe == "30d":
            start_time = now - timedelta(days=30)
        else:
            raise HTTPException(status_code=400, detail="Invalid timeframe")
        
        # Get storage analytics
        analytics_data = await admin_service.get_storage_analytics(start_time, now)
        
        return analytics_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Error log endpoints

@router.get("/error-logs", response_model=ErrorLogResponse)
async def get_error_logs(
    skip: int = Query(0, description="Number of logs to skip"),
    limit: int = Query(10, description="Number of logs to return"),
    severity: Optional[str] = Query(None, description="Filter by log severity"),
    component: Optional[str] = Query(None, description="Filter by component"),
    start_date: Optional[datetime] = Query(None, description="Start date for logs"),
    end_date: Optional[datetime] = Query(None, description="End date for logs"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get application error logs with pagination and optional filtering.
    
    This endpoint returns application error logs with pagination support and
    optional filtering by severity, component, and date range.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        logs_response = await admin_service.get_error_logs(
            skip=skip,
            limit=limit,
            severity=severity,
            component=component,
            start_date=start_date,
            end_date=end_date
        )
        
        return logs_response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/error-logs/search", response_model=ErrorLogResponse)
async def search_error_logs(
    query: str = Query(..., description="Search query string"),
    skip: int = Query(0, description="Number of logs to skip"),
    limit: int = Query(10, description="Number of logs to return"),
    severity: Optional[str] = Query(None, description="Filter by log severity"),
    component: Optional[str] = Query(None, description="Filter by component"),
    start_date: Optional[datetime] = Query(None, description="Start date for logs"),
    end_date: Optional[datetime] = Query(None, description="End date for logs"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Search application error logs with full-text search.
    
    This endpoint searches application error logs using full-text search
    and supports pagination and filtering.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        logs_response = await admin_service.search_error_logs(
            query=query,
            skip=skip,
            limit=limit,
            severity=severity,
            component=component,
            start_date=start_date,
            end_date=end_date
        )
        
        return logs_response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/error-logs/{log_id}", response_model=ErrorLogDetail)
async def get_error_log_detail(
    log_id: str = Path(..., description="Error log ID"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get detailed information about a specific error log.
    
    This endpoint returns detailed information about a specific error log,
    including stack trace and context.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        log_detail = await admin_service.get_error_log_detail(log_id)
        if not log_detail:
            raise HTTPException(status_code=404, detail="Error log not found")
        
        return log_detail
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/error-logs/severity-levels", response_model=List[str])
async def get_error_log_severity_levels(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get available severity levels for error logs.
    
    This endpoint returns a list of available severity levels used in error logs.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        severity_levels = await admin_service.get_error_log_severity_levels()
        return severity_levels
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/error-logs/components", response_model=List[str])
async def get_error_log_components(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get available component names for error logs.
    
    This endpoint returns a list of available component names used in error logs.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        components = await admin_service.get_error_log_components()
        return components
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/error-logs/export", response_model=None)
async def export_error_logs(
    format: str = Query("csv", description="Export format (csv or json)"),
    severity: Optional[str] = Query(None, description="Filter by log severity"),
    component: Optional[str] = Query(None, description="Filter by component"),
    start_date: Optional[datetime] = Query(None, description="Start date for logs"),
    end_date: Optional[datetime] = Query(None, description="End date for logs"),
    search: Optional[str] = Query(None, description="Search term"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Export error logs to CSV or JSON.
    
    This endpoint exports error logs to CSV or JSON format, with optional filtering.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if format not in ["csv", "json"]:
        raise HTTPException(status_code=400, detail="Format must be 'csv' or 'json'")
    
    try:
        export_data = await admin_service.export_error_logs(
            format=format,
            severity=severity,
            component=component,
            start_date=start_date,
            end_date=end_date,
            search=search
        )
        
        # Set proper content type and filename headers
        filename = f"error_logs_export_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        if format == "csv":
            return Response(
                content=export_data,
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}.csv"
                }
            )
        else:  # json
            return Response(
                content=export_data,
                media_type="application/json",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}.json"
                }
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Alert Configuration Endpoints

@router.get("/alerts", response_model=AlertListResponse)
async def get_alerts(
    skip: int = Query(0, description="Number of alerts to skip"),
    limit: int = Query(10, description="Number of alerts to return"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    severity: Optional[str] = Query(None, description="Filter by alert severity"),
    status: Optional[str] = Query(None, description="Filter by alert status"),
    enabled: Optional[bool] = Query(None, description="Filter by enabled status"),
    resource_id: Optional[str] = Query(None, description="Filter by specific resource ID"),
    tag: Optional[str] = Query(None, description="Filter by tag (format: key=value)"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get alert configurations with pagination and optional filtering.
    
    This endpoint returns alert configurations with pagination support and
    optional filtering by resource type, severity, status, and more.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        # Parse tag filter
        tag_key = None
        tag_value = None
        if tag:
            tag_parts = tag.split('=', 1)
            if len(tag_parts) == 2:
                tag_key, tag_value = tag_parts
            else:
                tag_key = tag_parts[0]
        
        alerts_response = await admin_service.get_alerts(
            skip=skip,
            limit=limit,
            resource_type=resource_type,
            severity=severity,
            status=status,
            enabled=enabled,
            resource_id=resource_id,
            tag_key=tag_key,
            tag_value=tag_value
        )
        
        return alerts_response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/alerts", response_model=Alert)
async def create_alert(
    alert: AlertCreate,
    current_user: User = Depends(get_current_active_user),
):
    """
    Create a new alert configuration.
    
    This endpoint creates a new alert configuration that will monitor
    specified metrics and trigger notifications based on conditions.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        created_alert = await admin_service.create_alert(alert, current_user.id)
        return created_alert
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/alerts/{alert_id}", response_model=Alert)
async def get_alert(
    alert_id: str = Path(..., description="Alert ID"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get a specific alert configuration.
    
    This endpoint returns details for a specific alert configuration.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        alert = await admin_service.get_alert(alert_id)
        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return alert
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/alerts/{alert_id}", response_model=Alert)
async def update_alert(
    alert_update: AlertUpdate,
    alert_id: str = Path(..., description="Alert ID"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Update an alert configuration.
    
    This endpoint updates an existing alert configuration.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        updated_alert = await admin_service.update_alert(alert_id, alert_update, current_user.id)
        if not updated_alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return updated_alert
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/alerts/{alert_id}", response_model=Dict[str, bool])
async def delete_alert(
    alert_id: str = Path(..., description="Alert ID"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Delete an alert configuration.
    
    This endpoint deletes an alert configuration.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        result = await admin_service.delete_alert(alert_id)
        return {"success": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/alerts/{alert_id}/acknowledge", response_model=Alert)
async def acknowledge_alert(
    alert_id: str = Path(..., description="Alert ID"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Acknowledge an active alert.
    
    This endpoint acknowledges an active alert, changing its status to ACKNOWLEDGED.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        updated_alert = await admin_service.update_alert_status(
            alert_id, 
            AlertStatus.ACKNOWLEDGED, 
            current_user.id,
            AlertHistoryAction.ACKNOWLEDGED
        )
        if not updated_alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return updated_alert
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/alerts/{alert_id}/resolve", response_model=Alert)
async def resolve_alert(
    alert_id: str = Path(..., description="Alert ID"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Resolve an active or acknowledged alert.
    
    This endpoint resolves an alert, changing its status to RESOLVED.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        updated_alert = await admin_service.update_alert_status(
            alert_id, 
            AlertStatus.RESOLVED, 
            current_user.id,
            AlertHistoryAction.RESOLVED
        )
        if not updated_alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return updated_alert
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/alerts/{alert_id}/mute", response_model=Alert)
async def mute_alert(
    alert_id: str = Path(..., description="Alert ID"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Mute an alert to stop notifications.
    
    This endpoint mutes an alert, changing its status to MUTED
    and preventing further notifications.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        updated_alert = await admin_service.update_alert_status(
            alert_id, 
            AlertStatus.MUTED, 
            current_user.id,
            AlertHistoryAction.MUTED
        )
        if not updated_alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return updated_alert
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/alerts/{alert_id}/unmute", response_model=Alert)
async def unmute_alert(
    alert_id: str = Path(..., description="Alert ID"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Unmute an alert to resume notifications.
    
    This endpoint unmutes an alert, changing its status to ACTIVE
    and resuming notifications.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        updated_alert = await admin_service.update_alert_status(
            alert_id, 
            AlertStatus.ACTIVE, 
            current_user.id,
            AlertHistoryAction.UNMUTED
        )
        if not updated_alert:
            raise HTTPException(status_code=404, detail="Alert not found")
        return updated_alert
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/alerts/{alert_id}/history", response_model=AlertHistoryResponse)
async def get_alert_history(
    alert_id: str = Path(..., description="Alert ID"),
    skip: int = Query(0, description="Number of entries to skip"),
    limit: int = Query(20, description="Number of entries to return"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get history for a specific alert.
    
    This endpoint returns the history of actions and status changes
    for a specific alert.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        history_response = await admin_service.get_alert_history(
            alert_id=alert_id,
            skip=skip,
            limit=limit
        )
        
        if not history_response:
            raise HTTPException(status_code=404, detail="Alert not found or no history available")
        
        return history_response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/alert-metrics", response_model=Dict[str, Any])
async def get_available_metrics(
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get available metrics for alert conditions.
    
    This endpoint returns a list of available metrics that can be used
    in alert conditions, optionally filtered by resource type.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        metrics = await admin_service.get_available_metrics(resource_type)
        return {"metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/alert-statistics", response_model=Dict[str, Any])
async def get_alert_statistics(
    start_date: Optional[datetime] = Query(None, description="Start date for statistics"),
    end_date: Optional[datetime] = Query(None, description="End date for statistics"),
    current_user: User = Depends(get_current_active_user),
):
    """
    Get statistics about alerts.
    
    This endpoint returns statistics about alerts, including count by status,
    severity, resource type, and a time series of alert occurrences.
    """
    if not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        statistics = await admin_service.get_alert_statistics(start_date, end_date)
        return statistics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))