"""
Integration Runner Service

This module provides a service for executing integrations, handling the
extraction, transformation, and loading of data between sources and destinations.
"""

import logging
import pandas as pd
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
import asyncio
import traceback

# Import adapter factory
from adapters.adapter_factory import AdapterFactory

logger = logging.getLogger(__name__)

class IntegrationRunner:
    """Service that executes integrations and transfers data"""
    
    def __init__(
        self, 
        integration_service=None, 
        field_mapping_service=None
    ):
        """
        Initialize the runner with services
        
        Args:
            integration_service: Service for working with integrations
            field_mapping_service: Service for working with field mappings
        """
        self.integration_service = integration_service
        self.field_mapping_service = field_mapping_service
        
    async def run(self, integration_id: int) -> Dict[str, Any]:
        """
        Execute an integration run
        
        Args:
            integration_id: ID of the integration to run
            
        Returns:
            Dict[str, Any]: Run results
        """
        logger.info(f"Starting integration run for {integration_id}")
        
        # Get integration details
        integration = self.integration_service.get_integration(integration_id)
        if not integration:
            logger.error(f"Integration {integration_id} not found")
            return {"status": "error", "message": "Integration not found"}
        
        # Get field mappings
        mappings = self.field_mapping_service.get_field_mappings(integration_id)
        
        # Create history record
        history_id = self.integration_service.create_history_record(
            integration_id, "running"
        )
        
        try:
            # Create source adapter
            source_adapter = self._create_adapter_for_integration(
                integration.type, 
                integration.source, 
                integration.source_config
            )
            
            # Create destination adapter
            dest_adapter = self._create_adapter_for_integration(
                integration.type,
                integration.destination,
                integration.destination_config
            )
            
            if not source_adapter or not dest_adapter:
                raise ValueError(f"Could not create adapters for integration {integration_id}")
            
            # Extract data from source
            data = await self._extract_data(source_adapter, integration)
            
            if data is None or (isinstance(data, pd.DataFrame) and data.empty):
                raise ValueError("No data extracted from source")
            
            # Transform data using mappings
            transformed_data = self._transform_data(data, mappings)
            
            # Load data to destination
            result = await self._load_data(dest_adapter, transformed_data, integration)
            
            # Update history record
            record_count = len(data) if isinstance(data, pd.DataFrame) else (
                len(data) if isinstance(data, list) else 1
            )
            
            self.integration_service.update_history_record(
                integration_id,
                history_id,
                status="success",
                records_processed=record_count
            )
            
            return {
                "status": "success",
                "records_processed": record_count,
                "history_id": history_id
            }
            
        except Exception as e:
            logger.error(f"Error running integration {integration_id}: {str(e)}")
            logger.error(traceback.format_exc())
            
            # Update history record with error
            self.integration_service.update_history_record(
                integration_id,
                history_id,
                status="error",
                error=str(e)
            )
            
            return {
                "status": "error",
                "message": str(e),
                "history_id": history_id
            }
    
    def _create_adapter_for_integration(
        self, 
        integration_type: str, 
        source_name: str, 
        config: Dict[str, Any]
    ) -> Any:
        """
        Create an adapter for a source or destination
        
        Args:
            integration_type: Type of integration (API-based, File-based, etc.)
            source_name: Name of the source or destination
            config: Configuration for the adapter
            
        Returns:
            Any: Adapter instance
        """
        if integration_type == "API-based":
            # For API-based integrations, try to find a specific adapter or use generic
            source_key = source_name.lower().replace(" ", "_").replace("(", "").replace(")", "")
            
            # Try to find a specific adapter for this source
            if source_key in AdapterFactory._adapter_registry:
                adapter_type = source_key
            elif "salesforce" in source_key:
                adapter_type = "salesforce"
            else:
                # Fallback to generic API adapter
                adapter_type = "generic_api"
                
            return AdapterFactory.create_adapter(adapter_type, config)
            
        elif integration_type == "File-based":
            # For file-based integrations, determine the storage type
            if "Azure Blob" in source_name:
                return AdapterFactory.create_adapter("azure_blob", config)
            elif "AWS S3" in source_name:
                # If AWS S3 adapter is implemented
                if "aws_s3" in AdapterFactory._adapter_registry:
                    return AdapterFactory.create_adapter("aws_s3", config)
            # Add more file storage types as needed
            
        return None
    
    async def _extract_data(
        self, 
        source_adapter: Any, 
        integration: Any
    ) -> Union[pd.DataFrame, List[Dict[str, Any]], Dict[str, Any]]:
        """
        Extract data from the source
        
        Args:
            source_adapter: Source adapter instance
            integration: Integration details
            
        Returns:
            Union[pd.DataFrame, List[Dict[str, Any]], Dict[str, Any]]: Extracted data
        """
        logger.info(f"Extracting data from {integration.source}")
        
        # Handle different adapter types differently
        if hasattr(source_adapter, "read_csv_blob"):
            # For blob storage with CSV files
            file_path = integration.source_config.get("file_pattern", "data.csv")
            return source_adapter.read_csv_blob(file_path)
            
        elif hasattr(source_adapter, "get"):
            # For API adapters
            endpoint = integration.source_config.get("endpoint", "")
            params = integration.source_config.get("params", {})
            return source_adapter.get(endpoint, params)
            
        elif hasattr(source_adapter, "query") and "salesforce" in integration.source.lower():
            # For Salesforce adapter
            query = integration.source_config.get("query", "SELECT Id, Name FROM Account LIMIT 10")
            return source_adapter.query(query)
            
        # Fallback for unknown adapter types
        raise ValueError(f"Unsupported source adapter type for {integration.source}")
    
    def _transform_data(
        self, 
        data: Union[pd.DataFrame, List[Dict[str, Any]], Dict[str, Any]], 
        mappings: List[Any]
    ) -> pd.DataFrame:
        """
        Transform data using field mappings
        
        Args:
            data: Source data
            mappings: Field mappings
            
        Returns:
            pd.DataFrame: Transformed data
        """
        logger.info(f"Transforming data with {len(mappings)} field mappings")
        
        # Convert to DataFrame if not already
        if isinstance(data, pd.DataFrame):
            df = data
        elif isinstance(data, list):
            df = pd.DataFrame(data)
        elif isinstance(data, dict):
            # Handle nested API responses
            if "items" in data:
                df = pd.DataFrame(data["items"])
            elif "records" in data:
                df = pd.DataFrame(data["records"])
            elif "data" in data:
                df = pd.DataFrame(data["data"])
            else:
                # Single record as dict
                df = pd.DataFrame([data])
        else:
            raise ValueError(f"Unsupported data type: {type(data)}")
        
        # Create output DataFrame
        result = pd.DataFrame()
        
        # Apply each field mapping
        for mapping in mappings:
            source_field = mapping.source_field
            dest_field = mapping.destination_field
            
            if source_field not in df.columns:
                logger.warning(f"Source field {source_field} not found in data")
                
                # If field is required, raise error
                if mapping.required:
                    raise ValueError(f"Required source field {source_field} not found in data")
                    
                continue
                
            # Apply transformation
            if mapping.transformation == "direct":
                result[dest_field] = df[source_field]
            elif mapping.transformation == "uppercase":
                result[dest_field] = df[source_field].astype(str).str.upper()
            elif mapping.transformation == "lowercase":
                result[dest_field] = df[source_field].astype(str).str.lower()
            elif mapping.transformation == "trim":
                result[dest_field] = df[source_field].astype(str).str.strip()
            elif mapping.transformation == "format_date":
                # Convert to datetime and format
                result[dest_field] = pd.to_datetime(df[source_field]).dt.strftime('%Y-%m-%d')
            elif mapping.transformation == "concat":
                # Concatenate with next field if available
                next_field = mapping.transform_params.get("concat_field") if hasattr(mapping, "transform_params") else None
                if next_field and next_field in df.columns:
                    result[dest_field] = df[source_field].astype(str) + " " + df[next_field].astype(str)
                else:
                    result[dest_field] = df[source_field]
            # Add more transformations as needed
            else:
                # Default to direct mapping
                result[dest_field] = df[source_field]
            
        return result
    
    async def _load_data(
        self, 
        dest_adapter: Any, 
        data: pd.DataFrame, 
        integration: Any
    ) -> Dict[str, Any]:
        """
        Load data to the destination
        
        Args:
            dest_adapter: Destination adapter instance
            data: Transformed data to load
            integration: Integration details
            
        Returns:
            Dict[str, Any]: Load results
        """
        logger.info(f"Loading data to {integration.destination}")
        
        # Handle different adapter types differently
        if hasattr(dest_adapter, "write_csv_blob"):
            # For blob storage with CSV files
            file_path = integration.destination_config.get("file_path", f"output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
            success = dest_adapter.write_csv_blob(
                data, 
                file_path,
                include_header=True
            )
            return {"success": success, "file_path": file_path}
            
        elif hasattr(dest_adapter, "post"):
            # For API adapters
            endpoint = integration.destination_config.get("endpoint", "")
            
            # Convert DataFrame to records
            records = data.to_dict(orient="records")
            
            # Determine if we should post in batch or individually
            if integration.destination_config.get("batch_mode", True):
                return dest_adapter.post(endpoint, records)
            else:
                results = []
                for record in records:
                    result = dest_adapter.post(endpoint, record)
                    results.append(result)
                return {"success": True, "results": results}
                
        elif hasattr(dest_adapter, "create_record") and "salesforce" in integration.destination.lower():
            # For Salesforce adapter
            object_name = integration.destination_config.get("object_name", "Account")
            
            # Convert DataFrame to records
            records = data.to_dict(orient="records")
            
            results = []
            for record in records:
                result = dest_adapter.create_record(object_name, record)
                results.append(result)
                
            return {"success": True, "results": results}
                
        # Fallback for unknown adapter types
        raise ValueError(f"Unsupported destination adapter type for {integration.destination}")