"""
Admin Monitoring Service

This module provides the service layer for admin monitoring functionality,
handling Azure API integration and resource monitoring.
"""

import os
import json
import logging
import uuid
import random
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import aiohttp
import asyncio
from fastapi import HTTPException
from pydantic import SecretStr

from ...db.base import database
from ...core.config import settings
from .models import (
    AzureConfigCreate, 
    AzureConfigUpdate, 
    AzureConfig,
    AzureConnectionTest,
    AzureResource,
    AzureResourceHealth,
    AzureDiscoveryResult,
    AzureAuthMethod,
    ErrorLog,
    ErrorLogDetail,
    ErrorLogResponse,
    LogSeverity,
    AlertSeverity,
    AlertStatus,
    AlertConditionOperator,
    AlertNotificationChannel,
    AlertCondition,
    AlertNotificationConfig,
    AlertBase,
    AlertCreate,
    AlertUpdate,
    Alert,
    AlertHistoryAction,
    AlertHistoryEntry,
    AlertListResponse,
    AlertHistoryResponse
)

# Set up logging
logger = logging.getLogger(__name__)

# Table names
AZURE_CONFIG_TABLE = "azure_config"
AZURE_RESOURCES_TABLE = "azure_resources"
AZURE_HEALTH_TABLE = "azure_resource_health"
ERROR_LOGS_TABLE = "error_logs"

# Constants
AZURE_AUTH_URL = "https://login.microsoftonline.com"
AZURE_RESOURCE_URL = "https://management.azure.com"
AZURE_GRAPH_URL = "https://graph.microsoft.com"

async def get_azure_config() -> Optional[AzureConfig]:
    """
    Get Azure configuration from the database.
    
    Returns:
        AzureConfig: Azure configuration if found, None otherwise
    """
    query = f"SELECT * FROM {AZURE_CONFIG_TABLE} LIMIT 1"
    
    try:
        result = await database.fetch_one(query)
        if result:
            # Convert to model
            return AzureConfig(**dict(result))
        return None
    except Exception as e:
        logger.error(f"Error getting Azure configuration: {e}")
        return None

async def save_azure_config(config: AzureConfigCreate, user_id: str) -> AzureConfig:
    """
    Save Azure configuration to the database.
    
    Args:
        config: Azure configuration to save
        user_id: ID of the user saving the configuration
        
    Returns:
        AzureConfig: Saved Azure configuration
    """
    # First check if configuration already exists
    existing_config = await get_azure_config()
    
    # Convert model to dict
    config_dict = config.dict(exclude_unset=True)
    
    # Handle sensitive fields
    if config.client_secret and isinstance(config.client_secret, SecretStr):
        config_dict["client_secret"] = config.client_secret.get_secret_value()
    
    # Set timestamps
    now = datetime.now(timezone.utc)
    
    if existing_config:
        # Update existing configuration
        query = f"""
        UPDATE {AZURE_CONFIG_TABLE} SET
            tenant_id = :tenant_id,
            subscription_id = :subscription_id,
            resource_group = :resource_group,
            auth_method = :auth_method,
            refresh_interval = :refresh_interval,
            updated_at = :updated_at
        """
        
        values = {
            "tenant_id": config.tenant_id,
            "subscription_id": config.subscription_id,
            "resource_group": config.resource_group,
            "auth_method": config.auth_method,
            "refresh_interval": config.refresh_interval,
            "updated_at": now
        }
        
        # Add client_id and client_secret if provided
        if config.auth_method == AzureAuthMethod.SERVICE_PRINCIPAL:
            if config.client_id:
                query += ", client_id = :client_id"
                values["client_id"] = config.client_id
            
            if "client_secret" in config_dict:
                query += ", client_secret = :client_secret"
                values["client_secret"] = config_dict["client_secret"]
        
        query += " WHERE id = :id"
        values["id"] = existing_config.id
        
        await database.execute(query, values)
        
        # Test connection and update status
        conn_test = await test_azure_connection(config)
        if conn_test.success:
            await database.execute(
                f"UPDATE {AZURE_CONFIG_TABLE} SET is_connected = TRUE, last_connected_at = :now WHERE id = :id",
                {"now": now, "id": existing_config.id}
            )
        
        # Return updated config
        return await get_azure_config()
    else:
        # Create new configuration
        query = f"""
        INSERT INTO {AZURE_CONFIG_TABLE} (
            tenant_id, subscription_id, resource_group, auth_method,
            client_id, client_secret, refresh_interval,
            is_connected, created_at, updated_at
        ) VALUES (
            :tenant_id, :subscription_id, :resource_group, :auth_method,
            :client_id, :client_secret, :refresh_interval,
            FALSE, :created_at, :updated_at
        ) RETURNING id
        """
        
        values = {
            "tenant_id": config.tenant_id,
            "subscription_id": config.subscription_id,
            "resource_group": config.resource_group,
            "auth_method": config.auth_method,
            "client_id": config.client_id if config.auth_method == AzureAuthMethod.SERVICE_PRINCIPAL else None,
            "client_secret": config_dict.get("client_secret") if config.auth_method == AzureAuthMethod.SERVICE_PRINCIPAL else None,
            "refresh_interval": config.refresh_interval,
            "created_at": now,
            "updated_at": now
        }
        
        config_id = await database.execute(query, values)
        
        # Test connection and update status
        conn_test = await test_azure_connection(config)
        if conn_test.success:
            await database.execute(
                f"UPDATE {AZURE_CONFIG_TABLE} SET is_connected = TRUE, last_connected_at = :now WHERE id = :id",
                {"now": now, "id": config_id}
            )
        
        # Return new config
        return await get_azure_config()

async def update_azure_config(config: AzureConfigUpdate, user_id: str) -> Optional[AzureConfig]:
    """
    Update Azure configuration in the database.
    
    Args:
        config: Azure configuration updates
        user_id: ID of the user updating the configuration
        
    Returns:
        AzureConfig: Updated Azure configuration if successful, None otherwise
    """
    # First check if configuration exists
    existing_config = await get_azure_config()
    if not existing_config:
        return None
    
    # Convert model to dict, excluding unset fields
    config_dict = config.dict(exclude_unset=True, exclude_none=True)
    if not config_dict:
        # No fields to update
        return existing_config
    
    # Handle sensitive fields
    if config.client_secret and isinstance(config.client_secret, SecretStr):
        config_dict["client_secret"] = config.client_secret.get_secret_value()
    
    # Set updated_at timestamp
    now = datetime.now(timezone.utc)
    config_dict["updated_at"] = now
    
    # Build update query
    query_parts = []
    for key in config_dict:
        if key != "updated_at":  # We'll add this separately
            query_parts.append(f"{key} = :{key}")
    
    if not query_parts:
        # No fields to update
        return existing_config
    
    query = f"UPDATE {AZURE_CONFIG_TABLE} SET " + ", ".join(query_parts) + ", updated_at = :updated_at WHERE id = :id"
    config_dict["id"] = existing_config.id
    
    await database.execute(query, config_dict)
    
    # If auth-related fields were updated, test the connection
    auth_fields = {"tenant_id", "subscription_id", "auth_method", "client_id", "client_secret"}
    if any(field in config_dict for field in auth_fields):
        # Get updated config
        updated_config = await get_azure_config()
        if updated_config:
            # Create config for testing
            test_config = AzureConfigCreate(
                tenant_id=updated_config.tenant_id,
                subscription_id=updated_config.subscription_id,
                resource_group=updated_config.resource_group,
                auth_method=updated_config.auth_method,
                client_id=updated_config.client_id,
                client_secret=SecretStr("dummy_value"),  # Will be ignored in test_azure_connection if not changed
                refresh_interval=updated_config.refresh_interval
            )
            conn_test = await test_azure_connection(test_config)
            if conn_test.success:
                await database.execute(
                    f"UPDATE {AZURE_CONFIG_TABLE} SET is_connected = TRUE, last_connected_at = :now WHERE id = :id",
                    {"now": now, "id": existing_config.id}
                )
            else:
                await database.execute(
                    f"UPDATE {AZURE_CONFIG_TABLE} SET is_connected = FALSE WHERE id = :id",
                    {"id": existing_config.id}
                )
    
    # Return updated config
    return await get_azure_config()

async def delete_azure_config() -> bool:
    """
    Delete Azure configuration from the database.
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        await database.execute(f"DELETE FROM {AZURE_CONFIG_TABLE}")
        return True
    except Exception as e:
        logger.error(f"Error deleting Azure configuration: {e}")
        return False

async def test_azure_connection(config: Optional[AzureConfigCreate] = None) -> AzureConnectionTest:
    """
    Test Azure connection using the provided or stored configuration.
    
    Args:
        config: Azure configuration to test, or None to use stored configuration
        
    Returns:
        AzureConnectionTest: Connection test result
    """
    try:
        # If no config provided, use stored config
        if not config:
            stored_config = await get_azure_config()
            if not stored_config:
                return AzureConnectionTest(
                    success=False,
                    message="No Azure configuration found",
                    timestamp=datetime.now(timezone.utc)
                )
            
            # Use stored config
            config = AzureConfigCreate(
                tenant_id=stored_config.tenant_id,
                subscription_id=stored_config.subscription_id,
                resource_group=stored_config.resource_group,
                auth_method=stored_config.auth_method,
                client_id=stored_config.client_id,
                client_secret=None,  # Will use stored secret
                refresh_interval=stored_config.refresh_interval
            )
        
        # Get access token
        if config.auth_method == AzureAuthMethod.SERVICE_PRINCIPAL:
            # First, check if we need to fetch the client secret from the database
            if config.client_secret is None:
                # No client secret provided, try to get from database
                stored_config = await get_azure_config()
                if not stored_config:
                    return AzureConnectionTest(
                        success=False,
                        message="No Azure configuration found",
                        timestamp=datetime.now(timezone.utc)
                    )
                
                # Test service principal authentication with stored config
                token_response = await get_service_principal_token(
                    tenant_id=config.tenant_id,
                    client_id=config.client_id or stored_config.client_id,
                    client_secret=None  # This will trigger using the stored secret
                )
            else:
                # Test with provided credentials
                token_response = await get_service_principal_token(
                    tenant_id=config.tenant_id,
                    client_id=config.client_id,
                    client_secret=config.client_secret.get_secret_value() if config.client_secret else None
                )
        else:
            # Use managed identity (not implemented in this example)
            return AzureConnectionTest(
                success=False,
                message="Managed Identity authentication not implemented",
                timestamp=datetime.now(timezone.utc)
            )
        
        if "error" in token_response:
            return AzureConnectionTest(
                success=False,
                message=f"Authentication failed: {token_response.get('error_description', 'Unknown error')}",
                details=token_response,
                timestamp=datetime.now(timezone.utc)
            )
        
        # If we got here, authentication was successful
        # Test subscription access
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token_response['access_token']}",
                "Content-Type": "application/json"
            }
            
            # Try to get subscription details
            sub_url = f"{AZURE_RESOURCE_URL}/subscriptions/{config.subscription_id}?api-version=2020-01-01"
            async with session.get(sub_url, headers=headers) as response:
                if response.status != 200:
                    sub_error = await response.text()
                    return AzureConnectionTest(
                        success=False,
                        message=f"Failed to access subscription: HTTP {response.status}",
                        details={"error": sub_error},
                        timestamp=datetime.now(timezone.utc)
                    )
                
                sub_data = await response.json()
            
            # Try to access the resource group if specified
            if config.resource_group:
                rg_url = f"{AZURE_RESOURCE_URL}/subscriptions/{config.subscription_id}/resourceGroups/{config.resource_group}?api-version=2020-01-01"
                async with session.get(rg_url, headers=headers) as response:
                    if response.status != 200:
                        rg_error = await response.text()
                        return AzureConnectionTest(
                            success=False,
                            message=f"Failed to access resource group: HTTP {response.status}",
                            details={"error": rg_error},
                            timestamp=datetime.now(timezone.utc)
                        )
                    
                    rg_data = await response.json()
        
        # All tests passed
        return AzureConnectionTest(
            success=True,
            message="Successfully connected to Azure",
            details={
                "subscription": {
                    "id": sub_data.get("id"),
                    "name": sub_data.get("displayName"),
                    "state": sub_data.get("state")
                },
                "resource_group": {
                    "name": config.resource_group,
                    "location": rg_data.get("location") if config.resource_group else None
                } if config.resource_group else None
            },
            timestamp=datetime.now(timezone.utc)
        )
    except Exception as e:
        logger.error(f"Error testing Azure connection: {e}")
        return AzureConnectionTest(
            success=False,
            message=f"Error testing connection: {str(e)}",
            timestamp=datetime.now(timezone.utc)
        )

async def check_azure_connection() -> bool:
    """
    Check if Azure connection is properly configured and active.
    
    Returns:
        bool: True if connected, False otherwise
    """
    try:
        config = await get_azure_config()
        if not config:
            return False
        
        # If connection was never tested, or it was previously disconnected
        if not config.is_connected or not config.last_connected_at:
            # Test connection
            conn_test = await test_azure_connection()
            if conn_test.success:
                # Update connection status
                now = datetime.now(timezone.utc)
                await database.execute(
                    f"UPDATE {AZURE_CONFIG_TABLE} SET is_connected = TRUE, last_connected_at = :now WHERE id = :id",
                    {"now": now, "id": config.id}
                )
                return True
            return False
        
        # If last connection was too long ago, test again
        now = datetime.now(timezone.utc)
        if (now - config.last_connected_at).total_seconds() > 3600:  # 1 hour
            # Test connection
            conn_test = await test_azure_connection()
            if conn_test.success:
                # Update connection status
                await database.execute(
                    f"UPDATE {AZURE_CONFIG_TABLE} SET is_connected = TRUE, last_connected_at = :now WHERE id = :id",
                    {"now": now, "id": config.id}
                )
                return True
            
            # Update connection status
            await database.execute(
                f"UPDATE {AZURE_CONFIG_TABLE} SET is_connected = FALSE WHERE id = :id",
                {"id": config.id}
            )
            return False
        
        # Otherwise, use stored connection status
        return config.is_connected
    except Exception as e:
        logger.error(f"Error checking Azure connection: {e}")
        return False

async def get_service_principal_token(
    tenant_id: str,
    client_id: Optional[str] = None,
    client_secret: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get an Azure access token using service principal authentication.
    
    Args:
        tenant_id: Azure tenant ID
        client_id: Client ID (app registration)
        client_secret: Client secret, or None to use stored secret
        
    Returns:
        dict: Token response
    """
    try:
        # If client_id or client_secret not provided, try to get from database
        if not client_id or not client_secret:
            stored_config = await get_azure_config()
            if not stored_config:
                return {
                    "error": "configuration_not_found",
                    "error_description": "No Azure configuration found in the database"
                }
            
            if not client_id:
                client_id = stored_config.client_id
            
            if not client_secret:
                # Get client secret from database (simulated for this example)
                client_secret = "SIMULATED_SECRET"  # In a real implementation, this would be retrieved and decrypted
        
        # Prepare token request
        token_url = f"{AZURE_AUTH_URL}/{tenant_id}/oauth2/token"
        data = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
            "resource": AZURE_RESOURCE_URL
        }
        
        # Request token
        async with aiohttp.ClientSession() as session:
            async with session.post(token_url, data=data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    try:
                        error_json = json.loads(error_text)
                        return error_json
                    except:
                        return {
                            "error": "token_request_failed",
                            "error_description": f"Failed to get token: HTTP {response.status}",
                            "http_response": error_text
                        }
                
                return await response.json()
    except Exception as e:
        logger.error(f"Error getting service principal token: {e}")
        return {
            "error": "token_request_failed",
            "error_description": f"Exception occurred: {str(e)}"
        }

async def get_azure_resources(resource_group: Optional[str] = None) -> List[AzureResource]:
    """
    Get Azure resources from the API.
    
    Args:
        resource_group: Optional resource group to filter by
        
    Returns:
        List[AzureResource]: List of Azure resources
    """
    try:
        # Check if Azure is connected
        is_connected = await check_azure_connection()
        if not is_connected:
            raise HTTPException(status_code=400, detail="Azure is not connected")
        
        # Get configuration
        config = await get_azure_config()
        if not config:
            raise HTTPException(status_code=404, detail="Azure configuration not found")
        
        # Use resource group from config if not provided
        if not resource_group:
            resource_group = config.resource_group
        
        # Get access token
        if config.auth_method == AzureAuthMethod.SERVICE_PRINCIPAL:
            token_response = await get_service_principal_token(
                tenant_id=config.tenant_id,
                client_id=config.client_id
            )
        else:
            # Managed identity not implemented
            raise HTTPException(status_code=400, detail="Managed Identity authentication not implemented")
        
        if "error" in token_response:
            raise HTTPException(
                status_code=401, 
                detail=f"Authentication failed: {token_response.get('error_description', 'Unknown error')}"
            )
        
        # Query Azure API for resources
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token_response['access_token']}",
                "Content-Type": "application/json"
            }
            
            # Get resources in the subscription or resource group
            if resource_group:
                resources_url = f"{AZURE_RESOURCE_URL}/subscriptions/{config.subscription_id}/resourceGroups/{resource_group}/resources?api-version=2020-06-01"
            else:
                resources_url = f"{AZURE_RESOURCE_URL}/subscriptions/{config.subscription_id}/resources?api-version=2020-06-01"
            
            async with session.get(resources_url, headers=headers) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise HTTPException(
                        status_code=response.status, 
                        detail=f"Failed to get Azure resources: {error_text}"
                    )
                
                resources_data = await response.json()
            
            # Transform API response to AzureResource model
            resources = []
            for item in resources_data.get("value", []):
                resources.append(AzureResource(
                    id=item.get("id", ""),
                    name=item.get("name", ""),
                    type=item.get("type", ""),
                    location=item.get("location", ""),
                    properties=item.get("properties", {}),
                    tags=item.get("tags", {})
                ))
            
            return resources
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Azure resources: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting Azure resources: {str(e)}")

async def get_azure_resource(resource_id: str) -> Optional[AzureResource]:
    """
    Get a specific Azure resource.
    
    Args:
        resource_id: Azure resource ID
        
    Returns:
        AzureResource: Resource details if found, None otherwise
    """
    try:
        # Check if Azure is connected
        is_connected = await check_azure_connection()
        if not is_connected:
            raise HTTPException(status_code=400, detail="Azure is not connected")
        
        # Get configuration
        config = await get_azure_config()
        if not config:
            raise HTTPException(status_code=404, detail="Azure configuration not found")
        
        # Get access token
        if config.auth_method == AzureAuthMethod.SERVICE_PRINCIPAL:
            token_response = await get_service_principal_token(
                tenant_id=config.tenant_id,
                client_id=config.client_id
            )
        else:
            # Managed identity not implemented
            raise HTTPException(status_code=400, detail="Managed Identity authentication not implemented")
        
        if "error" in token_response:
            raise HTTPException(
                status_code=401, 
                detail=f"Authentication failed: {token_response.get('error_description', 'Unknown error')}"
            )
        
        # Query Azure API for the resource
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token_response['access_token']}",
                "Content-Type": "application/json"
            }
            
            # Get resource details
            resource_url = f"{AZURE_RESOURCE_URL}{resource_id}?api-version=2020-06-01"
            async with session.get(resource_url, headers=headers) as response:
                if response.status == 404:
                    return None
                elif response.status != 200:
                    error_text = await response.text()
                    raise HTTPException(
                        status_code=response.status, 
                        detail=f"Failed to get Azure resource: {error_text}"
                    )
                
                resource_data = await response.json()
            
            # Transform API response to AzureResource model
            return AzureResource(
                id=resource_data.get("id", ""),
                name=resource_data.get("name", ""),
                type=resource_data.get("type", ""),
                location=resource_data.get("location", ""),
                properties=resource_data.get("properties", {}),
                tags=resource_data.get("tags", {})
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Azure resource: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting Azure resource: {str(e)}")

async def get_azure_resource_groups() -> List[str]:
    """
    Get Azure resource groups.
    
    Returns:
        List[str]: List of resource group names
    """
    try:
        # Check if Azure is connected
        is_connected = await check_azure_connection()
        if not is_connected:
            raise HTTPException(status_code=400, detail="Azure is not connected")
        
        # Get configuration
        config = await get_azure_config()
        if not config:
            raise HTTPException(status_code=404, detail="Azure configuration not found")
        
        # Get access token
        if config.auth_method == AzureAuthMethod.SERVICE_PRINCIPAL:
            token_response = await get_service_principal_token(
                tenant_id=config.tenant_id,
                client_id=config.client_id
            )
        else:
            # Managed identity not implemented
            raise HTTPException(status_code=400, detail="Managed Identity authentication not implemented")
        
        if "error" in token_response:
            raise HTTPException(
                status_code=401, 
                detail=f"Authentication failed: {token_response.get('error_description', 'Unknown error')}"
            )
        
        # Query Azure API for resource groups
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token_response['access_token']}",
                "Content-Type": "application/json"
            }
            
            # Get resource groups
            url = f"{AZURE_RESOURCE_URL}/subscriptions/{config.subscription_id}/resourcegroups?api-version=2020-06-01"
            async with session.get(url, headers=headers) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise HTTPException(
                        status_code=response.status, 
                        detail=f"Failed to get Azure resource groups: {error_text}"
                    )
                
                data = await response.json()
            
            # Extract resource group names
            return [rg.get("name") for rg in data.get("value", [])]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Azure resource groups: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting Azure resource groups: {str(e)}")

async def get_azure_resource_types() -> List[str]:
    """
    Get Azure resource types available in the subscription.
    
    Returns:
        List[str]: List of resource types
    """
    try:
        # Check if Azure is connected
        is_connected = await check_azure_connection()
        if not is_connected:
            raise HTTPException(status_code=400, detail="Azure is not connected")
        
        # Get configuration
        config = await get_azure_config()
        if not config:
            raise HTTPException(status_code=404, detail="Azure configuration not found")
        
        # Get access token
        if config.auth_method == AzureAuthMethod.SERVICE_PRINCIPAL:
            token_response = await get_service_principal_token(
                tenant_id=config.tenant_id,
                client_id=config.client_id
            )
        else:
            # Managed identity not implemented
            raise HTTPException(status_code=400, detail="Managed Identity authentication not implemented")
        
        if "error" in token_response:
            raise HTTPException(
                status_code=401, 
                detail=f"Authentication failed: {token_response.get('error_description', 'Unknown error')}"
            )
        
        # Query Azure API for provider information
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token_response['access_token']}",
                "Content-Type": "application/json"
            }
            
            # Get providers
            url = f"{AZURE_RESOURCE_URL}/subscriptions/{config.subscription_id}/providers?api-version=2020-06-01"
            async with session.get(url, headers=headers) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise HTTPException(
                        status_code=response.status, 
                        detail=f"Failed to get Azure providers: {error_text}"
                    )
                
                data = await response.json()
            
            # Extract resource types
            resource_types = []
            for provider in data.get("value", []):
                namespace = provider.get("namespace", "")
                for rt in provider.get("resourceTypes", []):
                    resource_types.append(f"{namespace}/{rt.get('resourceType', '')}")
            
            return sorted(resource_types)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Azure resource types: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting Azure resource types: {str(e)}")

async def discover_azure_resources() -> AzureDiscoveryResult:
    """
    Discover Azure resources.
    
    This function triggers a discovery process to find and catalog
    Azure resources in the configured subscription and resource group.
    
    Returns:
        AzureDiscoveryResult: Discovery results
    """
    try:
        # Check if Azure is connected
        is_connected = await check_azure_connection()
        if not is_connected:
            raise HTTPException(status_code=400, detail="Azure is not connected")
        
        # Get configuration
        config = await get_azure_config()
        if not config:
            raise HTTPException(status_code=404, detail="Azure configuration not found")
        
        # Get resources using existing function
        resources = await get_azure_resources(config.resource_group)
        
        # Extract resource types
        resource_types = set()
        for resource in resources:
            resource_types.add(resource.type)
        
        # Store resources in the database (simplified for this example)
        # In a real implementation, you would store these in a database table
        
        # Create discovery result
        return AzureDiscoveryResult(
            subscription_id=config.subscription_id,
            resource_group=config.resource_group,
            resource_count=len(resources),
            discovered_types=sorted(list(resource_types)),
            timestamp=datetime.now(timezone.utc)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error discovering Azure resources: {e}")
        raise HTTPException(status_code=500, detail=f"Error discovering Azure resources: {str(e)}")

async def get_azure_resource_health(resource_id: str) -> Optional[AzureResourceHealth]:
    """
    Get health status for an Azure resource.
    
    Args:
        resource_id: Azure resource ID
        
    Returns:
        AzureResourceHealth: Resource health if found, None otherwise
    """
    try:
        # Check if Azure is connected
        is_connected = await check_azure_connection()
        if not is_connected:
            raise HTTPException(status_code=400, detail="Azure is not connected")
        
        # Get configuration
        config = await get_azure_config()
        if not config:
            raise HTTPException(status_code=404, detail="Azure configuration not found")
        
        # Get access token
        if config.auth_method == AzureAuthMethod.SERVICE_PRINCIPAL:
            token_response = await get_service_principal_token(
                tenant_id=config.tenant_id,
                client_id=config.client_id
            )
        else:
            # Managed identity not implemented
            raise HTTPException(status_code=400, detail="Managed Identity authentication not implemented")
        
        if "error" in token_response:
            raise HTTPException(
                status_code=401, 
                detail=f"Authentication failed: {token_response.get('error_description', 'Unknown error')}"
            )
        
        # Query Azure API for resource health
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token_response['access_token']}",
                "Content-Type": "application/json"
            }
            
            # Get resource health
            health_url = f"{AZURE_RESOURCE_URL}{resource_id}/providers/Microsoft.ResourceHealth/availabilityStatuses/current?api-version=2020-05-01"
            async with session.get(health_url, headers=headers) as response:
                if response.status == 404:
                    # Resource health not available for this resource
                    return AzureResourceHealth(
                        resource_id=resource_id,
                        status="Unknown",
                        details="Health data not available for this resource type",
                        last_checked=datetime.now(timezone.utc)
                    )
                elif response.status != 200:
                    error_text = await response.text()
                    logger.warning(f"Failed to get resource health: HTTP {response.status}: {error_text}")
                    # Return a generic health status
                    return AzureResourceHealth(
                        resource_id=resource_id,
                        status="Unknown",
                        details=f"Error fetching health data: HTTP {response.status}",
                        reason=error_text[:100] + ("..." if len(error_text) > 100 else ""),
                        last_checked=datetime.now(timezone.utc)
                    )
                
                health_data = await response.json()
            
            # Transform API response to AzureResourceHealth model
            properties = health_data.get("properties", {})
            return AzureResourceHealth(
                resource_id=resource_id,
                status=properties.get("availabilityState", "Unknown"),
                details=properties.get("summary", ""),
                reason=properties.get("reasonType", ""),
                last_checked=datetime.now(timezone.utc)
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Azure resource health: {e}")
        # Return a generic health status
        return AzureResourceHealth(
            resource_id=resource_id,
            status="Unknown",
            details=f"Error fetching health data: {str(e)}",
            last_checked=datetime.now(timezone.utc)
        )

async def get_all_resource_health() -> Dict[str, AzureResourceHealth]:
    """
    Get health status for all monitored resources.
    
    Returns:
        Dict[str, AzureResourceHealth]: Dictionary of resource IDs to health status
    """
    try:
        # Get all resources
        resources = await get_azure_resources()
        
        # Get health for each resource
        health_tasks = []
        for resource in resources:
            health_tasks.append(get_azure_resource_health(resource.id))
        
        # Run health checks in parallel
        health_results = await asyncio.gather(*health_tasks)
        
        # Create dictionary of resource ID to health
        health_dict = {}
        for resource, health in zip(resources, health_results):
            if health:
                health_dict[resource.id] = health
        
        return health_dict
    except Exception as e:
        logger.error(f"Error getting all resource health: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting all resource health: {str(e)}")

async def get_resource_metrics(
    resource_id: str,
    metric_names: List[str],
    start_time: datetime,
    end_time: datetime
) -> Dict[str, Any]:
    """
    Get metrics for a specific Azure resource.
    
    Args:
        resource_id: Resource identifier (appService, database, storage, keyVault)
        metric_names: List of metric names to retrieve
        start_time: Start time for metrics
        end_time: End time for metrics
        
    Returns:
        Dict[str, Any]: Metrics data
    """
    try:
        # Get configuration
        config = await get_azure_config()
        if not config:
            raise HTTPException(status_code=404, detail="Azure configuration not found")
        
        # Map resource_id to actual Azure resource ID
        azure_resource_id = None
        resource_type = None
        
        # For this example, we'll use a simple mapping
        # In a real implementation, you would query the database or Azure API
        if resource_id == "appService":
            resource_type = "Microsoft.Web/sites"
        elif resource_id == "database":
            resource_type = "Microsoft.DBforPostgreSQL/flexibleServers"
        elif resource_id == "storage":
            resource_type = "Microsoft.Storage/storageAccounts"
        elif resource_id == "keyVault":
            resource_type = "Microsoft.KeyVault/vaults"
        else:
            # Assume it's a full Azure resource ID
            azure_resource_id = resource_id
        
        # If we don't have a specific resource ID, query for resources of the given type
        if not azure_resource_id and resource_type:
            resources = await get_azure_resources(config.resource_group)
            matching_resources = [r for r in resources if r.type == resource_type]
            if not matching_resources:
                raise HTTPException(status_code=404, detail=f"No resources of type {resource_type} found")
            
            # Use the first matching resource
            azure_resource_id = matching_resources[0].id
        
        if not azure_resource_id:
            raise HTTPException(status_code=400, detail="Invalid resource ID")
        
        # Get access token
        if config.auth_method == AzureAuthMethod.SERVICE_PRINCIPAL:
            token_response = await get_service_principal_token(
                tenant_id=config.tenant_id,
                client_id=config.client_id
            )
        else:
            # Managed identity not implemented
            raise HTTPException(status_code=400, detail="Managed Identity authentication not implemented")
        
        if "error" in token_response:
            raise HTTPException(
                status_code=401, 
                detail=f"Authentication failed: {token_response.get('error_description', 'Unknown error')}"
            )
        
        # Query Azure Monitor API for metrics
        async with aiohttp.ClientSession() as session:
            headers = {
                "Authorization": f"Bearer {token_response['access_token']}",
                "Content-Type": "application/json"
            }
            
            # Format time strings for API
            start_str = start_time.strftime("%Y-%m-%dT%H:%M:%SZ")
            end_str = end_time.strftime("%Y-%m-%dT%H:%M:%SZ")
            
            # Get metrics
            metrics_url = (
                f"{AZURE_RESOURCE_URL}{azure_resource_id}/providers/Microsoft.Insights/metrics"
                f"?api-version=2018-01-01&metricnames={','.join(metric_names)}"
                f"&timespan={start_str}/{end_str}&aggregation=Average,Maximum,Minimum"
            )
            
            async with session.get(metrics_url, headers=headers) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise HTTPException(
                        status_code=response.status, 
                        detail=f"Failed to get Azure metrics: {error_text}"
                    )
                
                metrics_data = await response.json()
            
            # Transform API response to a simpler format
            transformed_metrics = {
                "resource_id": azure_resource_id,
                "start_time": start_str,
                "end_time": end_str,
                "metrics": {}
            }
            
            for metric in metrics_data.get("value", []):
                metric_name = metric.get("name", {}).get("value", "unknown")
                transformed_metrics["metrics"][metric_name] = []
                
                for time_series in metric.get("timeseries", []):
                    for data_point in time_series.get("data", []):
                        if any(v is not None for k, v in data_point.items() if k != "timeStamp"):
                            transformed_metrics["metrics"][metric_name].append({
                                "timestamp": data_point.get("timeStamp"),
                                "average": data_point.get("average"),
                                "minimum": data_point.get("minimum"),
                                "maximum": data_point.get("maximum"),
                                "total": data_point.get("total")
                            })
            
            return transformed_metrics
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Azure metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting Azure metrics: {str(e)}")

async def get_storage_analytics(start_time: datetime, end_time: datetime) -> Dict[str, Any]:
    """
    Get analytics data for documentation storage.
    
    Args:
        start_time: Start time for analytics
        end_time: End time for analytics
        
    Returns:
        Dict[str, Any]: Storage analytics data
    """
    try:
        # This is a placeholder implementation
        # In a real implementation, you would query Azure Storage Analytics
        
        # Get metrics for storage account
        config = await get_azure_config()
        if not config:
            raise HTTPException(status_code=404, detail="Azure configuration not found")
        
        # Find storage account resource
        resources = await get_azure_resources(config.resource_group)
        storage_resources = [r for r in resources if r.type == "Microsoft.Storage/storageAccounts"]
        
        if not storage_resources:
            # Return mock data
            return {
                "page_views": {
                    "total": 1250,
                    "unique_visitors": 385,
                    "time_series": [
                        {"date": (start_time + timedelta(days=i)).strftime("%Y-%m-%d"), "views": 50 + i * 10}
                        for i in range((end_time - start_time).days + 1)
                    ]
                },
                "popular_documents": [
                    {"name": "Getting Started Guide", "views": 450, "percentage": 36},
                    {"name": "API Reference", "views": 250, "percentage": 20},
                    {"name": "Integration Tutorial", "views": 185, "percentage": 15},
                    {"name": "User Management Guide", "views": 125, "percentage": 10},
                    {"name": "Troubleshooting Guide", "views": 65, "percentage": 5}
                ],
                "search_terms": [
                    {"term": "api", "count": 120},
                    {"term": "integration", "count": 95},
                    {"term": "error", "count": 85},
                    {"term": "authorization", "count": 70},
                    {"term": "webhook", "count": 65},
                    {"term": "configuration", "count": 60},
                    {"term": "setup", "count": 55},
                    {"term": "dashboard", "count": 50}
                ],
                "storage_metrics": {
                    "total_size_mb": 256,
                    "document_count": 45,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                }
            }
        
        # For a real implementation, get actual storage metrics
        storage_id = storage_resources[0].id
        metrics = await get_resource_metrics(
            storage_id,
            ["Transactions", "SuccessE2ELatency", "Egress", "Ingress"],
            start_time,
            end_time
        )
        
        # Format response (simplified for this example)
        return {
            "page_views": {
                "total": 1250,
                "unique_visitors": 385,
                "time_series": [
                    {"date": (start_time + timedelta(days=i)).strftime("%Y-%m-%d"), "views": 50 + i * 10}
                    for i in range((end_time - start_time).days + 1)
                ]
            },
            "popular_documents": [
                {"name": "Getting Started Guide", "views": 450, "percentage": 36},
                {"name": "API Reference", "views": 250, "percentage": 20},
                {"name": "Integration Tutorial", "views": 185, "percentage": 15},
                {"name": "User Management Guide", "views": 125, "percentage": 10},
                {"name": "Troubleshooting Guide", "views": 65, "percentage": 5}
            ],
            "search_terms": [
                {"term": "api", "count": 120},
                {"term": "integration", "count": 95},
                {"term": "error", "count": 85},
                {"term": "authorization", "count": 70},
                {"term": "webhook", "count": 65},
                {"term": "configuration", "count": 60},
                {"term": "setup", "count": 55},
                {"term": "dashboard", "count": 50}
            ],
            "storage_metrics": metrics
        }
    except Exception as e:
        logger.error(f"Error getting storage analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting storage analytics: {str(e)}")

# --------------------- Error Log Functions ---------------------

async def get_error_logs(
    skip: int = 0,
    limit: int = 10,
    severity: Optional[str] = None,
    component: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> ErrorLogResponse:
    """
    Get application error logs with pagination and optional filtering.
    
    Args:
        skip: Number of logs to skip
        limit: Number of logs to return
        severity: Optional severity filter
        component: Optional component filter
        start_date: Optional start date filter
        end_date: Optional end date filter
        
    Returns:
        ErrorLogResponse: Response with logs and pagination info
    """
    try:
        # Build query
        query = f"SELECT * FROM {ERROR_LOGS_TABLE}"
        count_query = f"SELECT COUNT(*) as count FROM {ERROR_LOGS_TABLE}"
        
        # Add filters if provided
        where_clauses = []
        params = {}
        
        if severity:
            where_clauses.append("severity = :severity")
            params["severity"] = severity
        
        if component:
            where_clauses.append("component = :component")
            params["component"] = component
        
        if start_date:
            where_clauses.append("timestamp >= :start_date")
            params["start_date"] = start_date
        
        if end_date:
            where_clauses.append("timestamp <= :end_date")
            params["end_date"] = end_date
        
        # Combine where clauses
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
            count_query += " WHERE " + " AND ".join(where_clauses)
        
        # Add pagination
        query += " ORDER BY timestamp DESC LIMIT :limit OFFSET :skip"
        params["limit"] = limit
        params["skip"] = skip
        
        # Execute queries
        logs = []
        
        # In a real implementation, this would fetch from the database
        # For this example, we'll generate mock data
        
        # Get total count
        total = 120  # Mock total count
        if severity:
            # Reduce count for filtered results
            total = int(total * 0.7)
        if component:
            # Reduce count further for filtered results
            total = int(total * 0.8)
        if start_date or end_date:
            # Reduce count further for filtered results
            total = int(total * 0.9)
        
        # Generate mock log data
        components = ["frontend", "backend", "database", "api", "authentication", "storage"]
        messages = [
            "Application startup failed",
            "Failed to connect to database",
            "Authentication error for user",
            "API request timed out",
            "Invalid configuration value",
            "Memory limit exceeded",
            "File not found",
            "Permission denied",
            "Rate limit exceeded",
            "Invalid input data",
            "Database query failed",
            "Network connection lost",
            "Internal server error",
            "Integration test failed",
            "Failed to load module"
        ]
        severities = list(LogSeverity.__members__.values())
        
        # Apply filters to mock data
        filtered_components = [component] if component else components
        filtered_severities = [severity] if severity else severities
        
        # Generate logs
        for i in range(min(limit, total - skip)):
            log_id = f"log-{skip + i + 1}"
            log_component = filtered_components[i % len(filtered_components)]
            log_severity = filtered_severities[i % len(filtered_severities)]
            log_message = messages[i % len(messages)] + f" (Log #{skip + i + 1})"
            
            # Generate timestamp (most recent first)
            hours_ago = skip + i
            log_timestamp = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
            
            # Skip if outside date range
            if start_date and log_timestamp < start_date:
                continue
            if end_date and log_timestamp > end_date:
                continue
            
            # Create log entry
            logs.append(ErrorLog(
                id=log_id,
                severity=log_severity,
                component=log_component,
                message=log_message,
                timestamp=log_timestamp
            ))
        
        # Calculate pagination info
        page = skip // limit if limit > 0 else 0
        total_pages = (total + limit - 1) // limit if limit > 0 else 1
        next_page = page + 1 if page + 1 < total_pages else None
        prev_page = page - 1 if page > 0 else None
        
        # Create response
        return ErrorLogResponse(
            logs=logs,
            total=total,
            page=page,
            page_size=limit,
            next_page=next_page,
            prev_page=prev_page
        )
    except Exception as e:
        logger.error(f"Error getting error logs: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting error logs: {str(e)}")

async def search_error_logs(
    query: str,
    skip: int = 0,
    limit: int = 10,
    severity: Optional[str] = None,
    component: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> ErrorLogResponse:
    """
    Search application error logs with full-text search.
    
    Args:
        query: Search query string
        skip: Number of logs to skip
        limit: Number of logs to return
        severity: Optional severity filter
        component: Optional component filter
        start_date: Optional start date filter
        end_date: Optional end date filter
        
    Returns:
        ErrorLogResponse: Response with logs and pagination info
    """
    try:
        # In a real implementation, this would use full-text search in the database
        # For this example, we'll generate mock data that matches the query
        
        # Get base logs (unfiltered)
        base_response = await get_error_logs(0, 100, severity, component, start_date, end_date)
        
        # Filter logs by search query
        query_lower = query.lower()
        filtered_logs = [
            log for log in base_response.logs
            if query_lower in log.message.lower() or 
               query_lower in log.component.lower() or
               query_lower in log.id.lower()
        ]
        
        # Apply pagination
        total_filtered = len(filtered_logs)
        paginated_logs = filtered_logs[skip:skip + limit]
        
        # Calculate pagination info
        page = skip // limit if limit > 0 else 0
        total_pages = (total_filtered + limit - 1) // limit if limit > 0 else 1
        next_page = page + 1 if page + 1 < total_pages else None
        prev_page = page - 1 if page > 0 else None
        
        # Create response
        return ErrorLogResponse(
            logs=paginated_logs,
            total=total_filtered,
            page=page,
            page_size=limit,
            next_page=next_page,
            prev_page=prev_page
        )
    except Exception as e:
        logger.error(f"Error searching error logs: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching error logs: {str(e)}")

async def get_error_log_detail(log_id: str) -> Optional[ErrorLogDetail]:
    """
    Get detailed information about a specific error log.
    
    Args:
        log_id: Error log ID
        
    Returns:
        ErrorLogDetail: Detailed log information if found, None otherwise
    """
    try:
        # In a real implementation, this would fetch from the database
        # For this example, we'll generate mock data
        
        # Get all logs and find the matching one
        all_logs_response = await get_error_logs(0, 1000)
        matching_logs = [log for log in all_logs_response.logs if log.id == log_id]
        
        if not matching_logs:
            return None
        
        # Get the base log
        base_log = matching_logs[0]
        
        # Generate stack trace and context based on severity
        stack_trace = None
        context = None
        additional_data = None
        user_id = None
        tenant_id = None
        request_id = None
        request_method = None
        request_path = None
        ip_address = None
        user_agent = None
        session_id = None
        
        if base_log.severity in [LogSeverity.CRITICAL, LogSeverity.ERROR]:
            # Generate mock stack trace for errors
            stack_trace = f"""Traceback (most recent call last):
  File "/home/ai-dev/Desktop/tap-integration-platform/backend/modules/admin/controller.py", line 120, in some_function
    result = await process_request(request_data)
  File "/home/ai-dev/Desktop/tap-integration-platform/backend/modules/admin/service.py", line 95, in process_request
    validated_data = validate_input(data)
  File "/home/ai-dev/Desktop/tap-integration-platform/backend/utils/validators.py", line 45, in validate_input
    raise ValueError("Invalid input data: missing required field")
ValueError: Invalid input data: missing required field"""
            
            # Generate mock context
            context = {
                "request_id": f"req-{log_id[4:]}",
                "user_id": "user-12345",
                "tenant_id": "tenant-456",
                "environment": "production"
            }
            
            # Additional data
            additional_data = {
                "input_data": {"key1": "value1", "key2": None},
                "validation_errors": ["missing required field", "invalid format"],
                "attempted_fixes": ["automatic retry", "fallback to default"]
            }
            
            # User and request info
            user_id = "user-12345"
            tenant_id = "tenant-456"
            request_id = f"req-{log_id[4:]}"
            request_method = "POST"
            request_path = "/api/admin/some-endpoint"
            ip_address = "192.168.1.100"
            user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            session_id = f"session-{log_id[4:]}"
        
        elif base_log.severity == LogSeverity.WARNING:
            # Generate mock context for warnings
            context = {
                "request_id": f"req-{log_id[4:]}",
                "component": base_log.component,
                "warning_type": "performance",
                "threshold": 500,
                "actual_value": 750
            }
            
            # User info
            user_id = "user-12345"
            tenant_id = "tenant-456"
            request_id = f"req-{log_id[4:]}"
        
        # Create detailed log
        return ErrorLogDetail(
            id=base_log.id,
            severity=base_log.severity,
            component=base_log.component,
            message=base_log.message,
            timestamp=base_log.timestamp,
            stack_trace=stack_trace,
            context=context,
            additional_data=additional_data,
            user_id=user_id,
            tenant_id=tenant_id,
            request_id=request_id,
            request_method=request_method,
            request_path=request_path,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id
        )
    except Exception as e:
        logger.error(f"Error getting error log detail: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting error log detail: {str(e)}")

async def get_error_log_severity_levels() -> List[str]:
    """
    Get available severity levels for error logs.
    
    Returns:
        List[str]: List of severity levels
    """
    try:
        # In a real implementation, this would query distinct values from the database
        # For this example, we'll return all defined severity levels
        return list(LogSeverity.__members__.values())
    except Exception as e:
        logger.error(f"Error getting error log severity levels: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting error log severity levels: {str(e)}")

async def get_error_log_components() -> List[str]:
    """
    Get available component names for error logs.
    
    Returns:
        List[str]: List of component names
    """
    try:
        # In a real implementation, this would query distinct values from the database
        # For this example, we'll return a fixed list of components
        return ["frontend", "backend", "database", "api", "authentication", "storage"]
    except Exception as e:
        logger.error(f"Error getting error log components: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting error log components: {str(e)}")

async def export_error_logs(
    format: str = "csv",
    severity: Optional[str] = None,
    component: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None
) -> str:
    """
    Export error logs to CSV or JSON format.
    
    Args:
        format: Export format (csv or json)
        severity: Optional severity filter
        component: Optional component filter
        start_date: Optional start date filter
        end_date: Optional end date filter
        search: Optional search term
        
    Returns:
        str: Exported data as CSV or JSON string
    """
    try:
        # Get logs with filtering
        if search:
            logs_response = await search_error_logs(
                query=search,
                skip=0,
                limit=1000,  # Export more logs
                severity=severity,
                component=component,
                start_date=start_date,
                end_date=end_date
            )
        else:
            logs_response = await get_error_logs(
                skip=0,
                limit=1000,  # Export more logs
                severity=severity,
                component=component,
                start_date=start_date,
                end_date=end_date
            )
        
        logs = logs_response.logs
        
        if format == "csv":
            # Create CSV content
            header = "id,severity,component,message,timestamp\n"
            rows = []
            
            for log in logs:
                # Escape message field if it contains commas or quotes
                message = log.message
                if "," in message or "\"" in message:
                    message = f"\"{message.replace('\"', '\"\"')}\""
                
                rows.append(f"{log.id},{log.severity},{log.component},{message},{log.timestamp.isoformat()}")
            
            return header + "\n".join(rows)
        
        elif format == "json":
            # Create JSON content
            log_dicts = []
            for log in logs:
                log_dicts.append({
                    "id": log.id,
                    "severity": log.severity,
                    "component": log.component,
                    "message": log.message,
                    "timestamp": log.timestamp.isoformat()
                })
            
            return json.dumps(log_dicts, indent=2)
        
        else:
            raise HTTPException(status_code=400, detail="Format must be 'csv' or 'json'")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting error logs: {e}")
        raise HTTPException(status_code=500, detail=f"Error exporting error logs: {str(e)}")


# --------------------- Alert Configuration Functions ---------------------

# Table names
ALERTS_TABLE = "alerts"
ALERT_HISTORY_TABLE = "alert_history"

async def get_alerts(
    skip: int = 0,
    limit: int = 10,
    resource_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    enabled: Optional[bool] = None,
    resource_id: Optional[str] = None,
    tag_key: Optional[str] = None,
    tag_value: Optional[str] = None
) -> AlertListResponse:
    """
    Get alert configurations with pagination and optional filtering.
    
    Args:
        skip: Number of alerts to skip
        limit: Number of alerts to return
        resource_type: Optional resource type filter
        severity: Optional severity filter
        status: Optional status filter
        enabled: Optional enabled status filter
        resource_id: Optional resource ID filter
        tag_key: Optional tag key filter
        tag_value: Optional tag value filter (only used if tag_key is provided)
        
    Returns:
        AlertListResponse: Response with alerts and pagination info
    """
    try:
        # In a real implementation, this would fetch from the database
        # For this example, we'll generate mock data
        
        # Generate mock alert data
        resource_types = ["appService", "database", "storage", "keyVault", "network"]
        alert_names = [
            "High CPU Usage",
            "Memory Pressure",
            "Low Storage Space",
            "High Response Time",
            "Failed Authentication Attempts",
            "Database Connection Timeout",
            "SSL Certificate Expiry",
            "API Error Rate",
            "Network Latency",
            "Disk IO Bottleneck"
        ]
        severities = list(AlertSeverity.__members__.values())
        statuses = list(AlertStatus.__members__.values())
        
        # Apply filters to mock data generator parameters
        filtered_resource_types = [resource_type] if resource_type else resource_types
        filtered_severities = [severity] if severity else severities
        filtered_statuses = [status] if status else statuses
        
        # Generate alerts
        mock_alerts = []
        total = 35  # Total count of alerts in the "database"
        
        # Adjust total for filters
        if resource_type:
            total = int(total * 0.8)
        if severity:
            total = int(total * 0.7)
        if status:
            total = int(total * 0.6)
        if enabled is not None:
            total = int(total * 0.5)
        if resource_id:
            total = int(total * 0.3)
        if tag_key:
            total = int(total * 0.4)
            if tag_value:
                total = int(total * 0.5)
        
        # Generate alerts with proper filters
        for i in range(min(limit, total - skip)):
            alert_id = f"alert-{skip + i + 1}"
            
            # Basic alert properties
            alert_resource_type = filtered_resource_types[i % len(filtered_resource_types)]
            alert_severity = filtered_severities[i % len(filtered_severities)]
            alert_status = filtered_statuses[i % len(filtered_statuses)]
            alert_name = f"{alert_names[i % len(alert_names)]} ({alert_resource_type})"
            alert_enabled = True if enabled is None else enabled
            
            # Resource-specific settings
            specific_resource_id = None
            if resource_id:
                specific_resource_id = resource_id
            elif i % 3 == 0:  # Make some alerts target specific resources
                specific_resource_id = f"/{alert_resource_type}/resource-{i}"
            
            # Tags
            mock_tags = {
                "environment": "production" if i % 2 == 0 else "staging",
                "priority": "high" if i % 3 == 0 else "normal",
                "owner": f"team-{(i % 4) + 1}"
            }
            
            # Skip if tag doesn't match
            if tag_key and tag_key not in mock_tags:
                continue
            if tag_key and tag_value and mock_tags.get(tag_key) != tag_value:
                continue
            
            # Create condition
            condition = AlertCondition(
                metric_id=f"{alert_resource_type}_metric_{i % 3 + 1}",
                metric_name=f"{alert_resource_type.capitalize()} {['CPU', 'Memory', 'Response Time'][i % 3]}",
                resource_type=alert_resource_type,
                operator=list(AlertConditionOperator.__members__.values())[i % 6],
                threshold_value=float(75 + (i * 5) % 20),
                evaluation_periods=2,
                evaluation_period_minutes=5
            )
            
            # Create notification config
            notification_config = [
                AlertNotificationConfig(
                    channel=AlertNotificationChannel.EMAIL,
                    recipients=["admin@example.com", f"alerts+{alert_resource_type}@example.com"],
                    include_details=True,
                    cooldown_minutes=15
                )
            ]
            
            # Add webhook or teams notification for some alerts
            if i % 3 == 0:
                notification_config.append(
                    AlertNotificationConfig(
                        channel=AlertNotificationChannel.WEBHOOK,
                        recipients=["https://hooks.example.com/alerts"],
                        include_details=True,
                        cooldown_minutes=30
                    )
                )
            elif i % 4 == 0:
                notification_config.append(
                    AlertNotificationConfig(
                        channel=AlertNotificationChannel.TEAMS,
                        recipients=["https://teams.example.com/webhook"],
                        include_details=True,
                        cooldown_minutes=30
                    )
                )
            
            # Timestamps
            created_at = datetime.now(timezone.utc) - timedelta(days=30 - i)
            updated_at = created_at + timedelta(days=5)
            last_triggered_at = None
            resolved_at = None
            resolved_by = None
            
            if alert_status == AlertStatus.ACKNOWLEDGED:
                last_triggered_at = updated_at + timedelta(hours=10)
            elif alert_status == AlertStatus.RESOLVED:
                last_triggered_at = updated_at + timedelta(hours=12)
                resolved_at = last_triggered_at + timedelta(hours=2)
                resolved_by = "user-resolver-123"
            
            # Create the mock alert
            mock_alerts.append(Alert(
                id=alert_id,
                name=alert_name,
                description=f"Monitors {alert_resource_type} for {condition.metric_name} exceeding threshold",
                resource_id=specific_resource_id,
                resource_type=alert_resource_type,
                condition=condition,
                severity=alert_severity,
                enabled=alert_enabled,
                notification_config=notification_config,
                auto_resolve=i % 5 == 0,
                tags=mock_tags,
                status=alert_status,
                created_at=created_at,
                updated_at=updated_at,
                created_by="user-creator-456",
                last_triggered_at=last_triggered_at,
                resolved_at=resolved_at,
                resolved_by=resolved_by
            ))
        
        # Calculate pagination info
        page = skip // limit if limit > 0 else 0
        total_pages = (total + limit - 1) // limit if limit > 0 else 1
        next_page = page + 1 if page + 1 < total_pages else None
        prev_page = page - 1 if page > 0 else None
        
        # Create response
        return AlertListResponse(
            alerts=mock_alerts,
            total=total,
            page=page,
            page_size=limit,
            next_page=next_page,
            prev_page=prev_page
        )
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting alerts: {str(e)}")

async def create_alert(alert: AlertCreate, user_id: str) -> Alert:
    """
    Create a new alert configuration.
    
    Args:
        alert: Alert configuration to create
        user_id: ID of the user creating the alert
        
    Returns:
        Alert: Created alert
    """
    try:
        # In a real implementation, this would store data in the database
        # For this example, we'll create a mock Alert object
        
        # Generate alert ID
        alert_id = f"alert-{uuid.uuid4().hex[:8]}"
        
        # Current time
        now = datetime.now(timezone.utc)
        
        # Create alert object
        created_alert = Alert(
            id=alert_id,
            name=alert.name,
            description=alert.description,
            resource_id=alert.resource_id,
            resource_type=alert.resource_type,
            condition=alert.condition,
            severity=alert.severity,
            enabled=alert.enabled,
            notification_config=alert.notification_config,
            auto_resolve=alert.auto_resolve,
            tags=alert.tags,
            status=AlertStatus.ACTIVE,
            created_at=now,
            updated_at=now,
            created_by=user_id,
            last_triggered_at=None,
            resolved_at=None,
            resolved_by=None
        )
        
        # In a real implementation, add alert history entry
        # await add_alert_history_entry(
        #     alert_id=alert_id,
        #     action=AlertHistoryAction.CREATED,
        #     user_id=user_id,
        #     details={"alert": alert.dict()}
        # )
        
        return created_alert
    except Exception as e:
        logger.error(f"Error creating alert: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating alert: {str(e)}")

async def get_alert(alert_id: str) -> Optional[Alert]:
    """
    Get a specific alert configuration.
    
    Args:
        alert_id: Alert ID
        
    Returns:
        Alert: Alert if found, None otherwise
    """
    try:
        # In a real implementation, this would fetch from the database
        # For this example, we'll generate a mock alert based on the ID
        
        # Check if alert ID follows expected format
        if not alert_id.startswith("alert-"):
            return None
        
        # Parse alert index from ID
        try:
            alert_index = int(alert_id.split("-")[1])
        except (IndexError, ValueError):
            # If ID doesn't have expected format, return None
            return None
        
        # Fetch all alerts and find by ID
        all_alerts_response = await get_alerts(limit=100)
        matching_alerts = [alert for alert in all_alerts_response.alerts if alert.id == alert_id]
        
        if matching_alerts:
            return matching_alerts[0]
        
        # If no exact match found, generate a new mock alert for this ID
        # This simulates fetching a record by ID from the database
        
        # Pick pseudo-random alert details based on alert ID
        seed = sum(ord(c) for c in alert_id)
        resource_types = ["appService", "database", "storage", "keyVault", "network"]
        alert_names = [
            "High CPU Usage",
            "Memory Pressure",
            "Low Storage Space",
            "High Response Time",
            "Failed Authentication Attempts"
        ]
        
        resource_type = resource_types[seed % len(resource_types)]
        metric_id = f"{resource_type}_metric_{(seed % 3) + 1}"
        metric_name = f"{resource_type.capitalize()} {['CPU', 'Memory', 'Response Time'][seed % 3]}"
        
        # Create condition
        condition = AlertCondition(
            metric_id=metric_id,
            metric_name=metric_name,
            resource_type=resource_type,
            operator=list(AlertConditionOperator.__members__.values())[seed % 6],
            threshold_value=float(75 + (seed * 5) % 20),
            evaluation_periods=2,
            evaluation_period_minutes=5
        )
        
        # Create notification config
        notification_config = [
            AlertNotificationConfig(
                channel=AlertNotificationChannel.EMAIL,
                recipients=["admin@example.com", f"alerts+{resource_type}@example.com"],
                include_details=True,
                cooldown_minutes=15
            )
        ]
        
        # Timestamps (ensure they're consistent for the same ID)
        created_at = datetime.now(timezone.utc) - timedelta(days=30 - (seed % 30))
        updated_at = created_at + timedelta(days=5)
        
        # Create mock alert
        return Alert(
            id=alert_id,
            name=f"{alert_names[seed % len(alert_names)]} ({resource_type})",
            description=f"Monitors {resource_type} for {metric_name} exceeding threshold",
            resource_id=f"/{resource_type}/resource-{seed}" if seed % 3 == 0 else None,
            resource_type=resource_type,
            condition=condition,
            severity=list(AlertSeverity.__members__.values())[seed % len(AlertSeverity.__members__)],
            enabled=True,
            notification_config=notification_config,
            auto_resolve=seed % 5 == 0,
            tags={
                "environment": "production" if seed % 2 == 0 else "staging",
                "priority": "high" if seed % 3 == 0 else "normal",
                "owner": f"team-{(seed % 4) + 1}"
            },
            status=list(AlertStatus.__members__.values())[seed % len(AlertStatus.__members__)],
            created_at=created_at,
            updated_at=updated_at,
            created_by="user-creator-456",
            last_triggered_at=updated_at + timedelta(hours=10) if seed % 3 != 0 else None,
            resolved_at=updated_at + timedelta(hours=14) if seed % 3 == 0 else None,
            resolved_by="user-resolver-123" if seed % 3 == 0 else None
        )
    except Exception as e:
        logger.error(f"Error getting alert: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting alert: {str(e)}")

async def update_alert(alert_id: str, alert_update: AlertUpdate, user_id: str) -> Optional[Alert]:
    """
    Update an alert configuration.
    
    Args:
        alert_id: Alert ID
        alert_update: Alert configuration updates
        user_id: ID of the user updating the alert
        
    Returns:
        Alert: Updated alert if successful, None otherwise
    """
    try:
        # Get existing alert
        existing_alert = await get_alert(alert_id)
        if not existing_alert:
            return None
        
        # In a real implementation, update the database
        # For this example, we'll create a new Alert object with updated values
        
        # Convert model to dict and update fields
        update_dict = alert_update.dict(exclude_unset=True, exclude_none=True)
        
        # Convert existing alert to dict
        existing_dict = {
            "id": existing_alert.id,
            "name": existing_alert.name,
            "description": existing_alert.description,
            "resource_id": existing_alert.resource_id,
            "resource_type": existing_alert.resource_type,
            "condition": existing_alert.condition,
            "severity": existing_alert.severity,
            "enabled": existing_alert.enabled,
            "notification_config": existing_alert.notification_config,
            "auto_resolve": existing_alert.auto_resolve,
            "tags": existing_alert.tags,
            "status": existing_alert.status,
            "created_at": existing_alert.created_at,
            "updated_at": datetime.now(timezone.utc),  # Update the timestamp
            "created_by": existing_alert.created_by,
            "last_triggered_at": existing_alert.last_triggered_at,
            "resolved_at": existing_alert.resolved_at,
            "resolved_by": existing_alert.resolved_by
        }
        
        # Update fields from the update dict
        existing_dict.update(update_dict)
        
        # Create updated alert
        updated_alert = Alert(**existing_dict)
        
        # In a real implementation, add alert history entry
        # await add_alert_history_entry(
        #     alert_id=alert_id,
        #     action=AlertHistoryAction.UPDATED,
        #     user_id=user_id,
        #     details={"changes": update_dict}
        # )
        
        return updated_alert
    except Exception as e:
        logger.error(f"Error updating alert: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating alert: {str(e)}")

async def delete_alert(alert_id: str) -> bool:
    """
    Delete an alert configuration.
    
    Args:
        alert_id: Alert ID
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Get existing alert
        existing_alert = await get_alert(alert_id)
        if not existing_alert:
            return False
        
        # In a real implementation, delete from the database
        # For this example, we'll just return success
        
        return True
    except Exception as e:
        logger.error(f"Error deleting alert: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting alert: {str(e)}")

async def update_alert_status(
    alert_id: str, 
    status: AlertStatus, 
    user_id: str,
    action: AlertHistoryAction
) -> Optional[Alert]:
    """
    Update the status of an alert.
    
    Args:
        alert_id: Alert ID
        status: New status
        user_id: ID of the user updating the status
        action: The action that triggered this status change
        
    Returns:
        Alert: Updated alert if successful, None otherwise
    """
    try:
        # Get existing alert
        existing_alert = await get_alert(alert_id)
        if not existing_alert:
            return None
        
        # In a real implementation, update the database
        # For this example, we'll create a new Alert object with updated status
        
        now = datetime.now(timezone.utc)
        resolved_at = existing_alert.resolved_at
        resolved_by = existing_alert.resolved_by
        
        # Update resolved timestamp and user if resolving
        if status == AlertStatus.RESOLVED and existing_alert.status != AlertStatus.RESOLVED:
            resolved_at = now
            resolved_by = user_id
        
        # Create updated alert
        updated_alert = Alert(
            id=existing_alert.id,
            name=existing_alert.name,
            description=existing_alert.description,
            resource_id=existing_alert.resource_id,
            resource_type=existing_alert.resource_type,
            condition=existing_alert.condition,
            severity=existing_alert.severity,
            enabled=existing_alert.enabled,
            notification_config=existing_alert.notification_config,
            auto_resolve=existing_alert.auto_resolve,
            tags=existing_alert.tags,
            status=status,
            created_at=existing_alert.created_at,
            updated_at=now,
            created_by=existing_alert.created_by,
            last_triggered_at=existing_alert.last_triggered_at,
            resolved_at=resolved_at,
            resolved_by=resolved_by
        )
        
        # In a real implementation, add alert history entry
        # await add_alert_history_entry(
        #     alert_id=alert_id,
        #     action=action,
        #     user_id=user_id,
        #     details={"status": status}
        # )
        
        return updated_alert
    except Exception as e:
        logger.error(f"Error updating alert status: {e}")
        raise HTTPException(status_code=500, detail=f"Error updating alert status: {str(e)}")

async def get_alert_history(
    alert_id: str,
    skip: int = 0,
    limit: int = 20
) -> Optional[AlertHistoryResponse]:
    """
    Get history for a specific alert.
    
    Args:
        alert_id: Alert ID
        skip: Number of entries to skip
        limit: Number of entries to return
        
    Returns:
        AlertHistoryResponse: Response with history entries and pagination info
    """
    try:
        # Check if alert exists
        existing_alert = await get_alert(alert_id)
        if not existing_alert:
            return None
        
        # In a real implementation, this would fetch from the database
        # For this example, we'll generate mock history entries
        
        # Generate mock history entries
        history = []
        total = 25  # Total history entries
        
        # Create mock history entries
        for i in range(min(limit, total - skip)):
            entry_id = f"history-{alert_id}-{i}"
            
            # Determine action based on position
            if i == 0:
                action = AlertHistoryAction.CREATED
                timestamp = existing_alert.created_at
                user_id = existing_alert.created_by
                details = {"alert": {
                    "name": existing_alert.name,
                    "severity": existing_alert.severity,
                    "resource_type": existing_alert.resource_type
                }}
            elif i == total - 1 and existing_alert.status == AlertStatus.RESOLVED:
                action = AlertHistoryAction.RESOLVED
                timestamp = existing_alert.resolved_at or datetime.now(timezone.utc)
                user_id = existing_alert.resolved_by or "user-resolver-123"
                details = {"resolution_note": "Issue has been fixed by restarting the service"}
            else:
                # Generate other actions
                actions = [
                    AlertHistoryAction.UPDATED,
                    AlertHistoryAction.TRIGGERED,
                    AlertHistoryAction.ACKNOWLEDGED,
                    AlertHistoryAction.MUTED,
                    AlertHistoryAction.UNMUTED
                ]
                action = actions[i % len(actions)]
                timestamp = existing_alert.created_at + timedelta(hours=i * 6)
                user_id = "user-456" if action == AlertHistoryAction.UPDATED else "system"
                
                if action == AlertHistoryAction.UPDATED:
                    details = {"changes": {"enabled": True, "severity": existing_alert.severity}}
                elif action == AlertHistoryAction.TRIGGERED:
                    details = {
                        "metric_value": existing_alert.condition.threshold_value + 15.5,
                        "threshold": existing_alert.condition.threshold_value
                    }
                elif action == AlertHistoryAction.ACKNOWLEDGED:
                    details = {"note": "Investigating the issue"}
                else:
                    details = None
            
            # Create history entry
            history.append(AlertHistoryEntry(
                id=entry_id,
                alert_id=alert_id,
                action=action,
                timestamp=timestamp,
                user_id=user_id,
                details=details
            ))
        
        # Sort history by timestamp descending
        history.sort(key=lambda x: x.timestamp, reverse=True)
        
        # Calculate pagination info
        page = skip // limit if limit > 0 else 0
        total_pages = (total + limit - 1) // limit if limit > 0 else 1
        next_page = page + 1 if page + 1 < total_pages else None
        prev_page = page - 1 if page > 0 else None
        
        # Create response
        return AlertHistoryResponse(
            history=history,
            total=total,
            alert_id=alert_id,
            page=page,
            page_size=limit,
            next_page=next_page,
            prev_page=prev_page
        )
    except Exception as e:
        logger.error(f"Error getting alert history: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting alert history: {str(e)}")

async def get_available_metrics(resource_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Get available metrics for alert conditions.
    
    Args:
        resource_type: Optional resource type filter
        
    Returns:
        List[Dict[str, Any]]: List of available metrics
    """
    try:
        # In a real implementation, this would fetch from Azure Monitor API
        # For this example, we'll generate mock metrics
        
        # Define mock metrics
        all_metrics = {
            "appService": [
                {
                    "id": "appService_metric_1",
                    "name": "CPU Percentage",
                    "description": "Percentage of CPU usage",
                    "unit": "Percent",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                },
                {
                    "id": "appService_metric_2",
                    "name": "Memory Percentage",
                    "description": "Percentage of memory usage",
                    "unit": "Percent",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                },
                {
                    "id": "appService_metric_3",
                    "name": "Response Time",
                    "description": "Average response time for requests",
                    "unit": "Milliseconds",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                },
                {
                    "id": "appService_metric_4",
                    "name": "Failed Requests",
                    "description": "Count of failed requests",
                    "unit": "Count",
                    "aggregations": ["Total", "Average"]
                }
            ],
            "database": [
                {
                    "id": "database_metric_1",
                    "name": "CPU Percentage",
                    "description": "Percentage of CPU usage",
                    "unit": "Percent",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                },
                {
                    "id": "database_metric_2",
                    "name": "Memory Percentage",
                    "description": "Percentage of memory usage",
                    "unit": "Percent",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                },
                {
                    "id": "database_metric_3",
                    "name": "Storage Percentage",
                    "description": "Percentage of storage usage",
                    "unit": "Percent",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                },
                {
                    "id": "database_metric_4",
                    "name": "Active Connections",
                    "description": "Number of active database connections",
                    "unit": "Count",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                },
                {
                    "id": "database_metric_5",
                    "name": "DTU Percentage",
                    "description": "Percentage of Database Transaction Units usage",
                    "unit": "Percent",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                }
            ],
            "storage": [
                {
                    "id": "storage_metric_1",
                    "name": "Availability",
                    "description": "Percentage of availability for storage account",
                    "unit": "Percent",
                    "aggregations": ["Average"]
                },
                {
                    "id": "storage_metric_2",
                    "name": "Total Requests",
                    "description": "Total number of requests to the storage account",
                    "unit": "Count",
                    "aggregations": ["Total"]
                },
                {
                    "id": "storage_metric_3",
                    "name": "Average Response Time",
                    "description": "Average response time for requests to the storage account",
                    "unit": "Milliseconds",
                    "aggregations": ["Average"]
                },
                {
                    "id": "storage_metric_4",
                    "name": "Used Capacity",
                    "description": "Amount of storage used by the storage account",
                    "unit": "Bytes",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                }
            ],
            "keyVault": [
                {
                    "id": "keyVault_metric_1",
                    "name": "Availability",
                    "description": "Percentage of availability for Key Vault",
                    "unit": "Percent",
                    "aggregations": ["Average"]
                },
                {
                    "id": "keyVault_metric_2",
                    "name": "Total Requests",
                    "description": "Total number of requests to the Key Vault",
                    "unit": "Count",
                    "aggregations": ["Total"]
                },
                {
                    "id": "keyVault_metric_3",
                    "name": "Failed Requests",
                    "description": "Count of failed requests",
                    "unit": "Count",
                    "aggregations": ["Total"]
                }
            ],
            "network": [
                {
                    "id": "network_metric_1",
                    "name": "Throughput",
                    "description": "Network throughput in bytes per second",
                    "unit": "BytesPerSecond",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                },
                {
                    "id": "network_metric_2",
                    "name": "Packet Loss",
                    "description": "Percentage of packet loss",
                    "unit": "Percent",
                    "aggregations": ["Average"]
                },
                {
                    "id": "network_metric_3",
                    "name": "Latency",
                    "description": "Network latency in milliseconds",
                    "unit": "Milliseconds",
                    "aggregations": ["Average", "Maximum", "Minimum"]
                }
            ]
        }
        
        # If resource type is specified, return metrics for that type
        if resource_type and resource_type in all_metrics:
            return all_metrics[resource_type]
        
        # Otherwise, return all metrics
        result = []
        for rt, metrics in all_metrics.items():
            for metric in metrics:
                metric_copy = metric.copy()
                metric_copy["resource_type"] = rt
                result.append(metric_copy)
        
        return result
    except Exception as e:
        logger.error(f"Error getting available metrics: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting available metrics: {str(e)}")

async def get_alert_statistics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Get statistics about alerts.
    
    Args:
        start_date: Optional start date for statistics
        end_date: Optional end date for statistics
        
    Returns:
        Dict[str, Any]: Statistics about alerts
    """
    try:
        # Set default date range if not provided
        if not end_date:
            end_date = datetime.now(timezone.utc)
        if not start_date:
            start_date = end_date - timedelta(days=30)
        
        # Get all alerts
        alerts_response = await get_alerts(limit=100)
        alerts = alerts_response.alerts
        
        # Count alerts by status
        status_counts = {}
        for status in AlertStatus.__members__.values():
            status_counts[status] = len([a for a in alerts if a.status == status])
        
        # Count alerts by severity
        severity_counts = {}
        for severity in AlertSeverity.__members__.values():
            severity_counts[severity] = len([a for a in alerts if a.severity == severity])
        
        # Count alerts by resource type
        resource_type_counts = {}
        for alert in alerts:
            rt = alert.resource_type
            resource_type_counts[rt] = resource_type_counts.get(rt, 0) + 1
        
        # Count enabled vs disabled
        enabled_count = len([a for a in alerts if a.enabled])
        disabled_count = len([a for a in alerts if not a.enabled])
        
        # Generate time series data (triggered alerts per day)
        # In a real implementation, this would query from a time series database
        
        # Mock data for triggered alerts
        days = (end_date - start_date).days + 1
        time_series = []
        
        # Seed for consistent random data
        seed = int(start_date.timestamp())
        random.seed(seed)
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            # Generate random count but weighted toward the end
            weight = i / max(days - 1, 1)  # Avoid division by zero
            count = int(random.randint(0, 5) + weight * 8)
            
            time_series.append({
                "date": date.strftime("%Y-%m-%d"),
                "count": count
            })
        
        # Compile statistics
        return {
            "total_alerts": len(alerts),
            "active_alerts": status_counts.get(AlertStatus.ACTIVE, 0),
            "triggered_alerts_count": sum(item["count"] for item in time_series),
            "by_status": status_counts,
            "by_severity": severity_counts,
            "by_resource_type": resource_type_counts,
            "enabled_count": enabled_count,
            "disabled_count": disabled_count,
            "time_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "time_series": time_series
        }
    except Exception as e:
        logger.error(f"Error getting alert statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting alert statistics: {str(e)}")