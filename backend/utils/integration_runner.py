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

# Import adapter factory and transformation registry
from adapters.adapter_factory import AdapterFactory
from utils.transformation_registry import TransformationRegistry
from utils.helpers import debug_log, performance_log, trace_data_changes, error_context

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
        
    @performance_log
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
            error_msg = f"Integration {integration_id} not found"
            logger.error(error_msg)
            return {"status": "error", "message": error_msg}
        
        # Get field mappings
        mappings = self.field_mapping_service.get_field_mappings(integration_id)
        
        # Create history record
        history_id = self.integration_service.create_history_record(
            integration_id, "running"
        )
        
        run_context = {
            "integration_id": integration_id,
            "integration_name": integration.name,
            "integration_type": integration.type,
            "source": integration.source,
            "destination": integration.destination,
            "history_id": history_id
        }
        
        try:
            # Create source adapter
            logger.debug(f"Creating source adapter for integration {integration_id}", extra=run_context)
            source_adapter = self._create_adapter_for_integration(
                integration.type, 
                integration.source, 
                integration.source_config
            )
            
            # Create destination adapter
            logger.debug(f"Creating destination adapter for integration {integration_id}", extra=run_context)
            dest_adapter = self._create_adapter_for_integration(
                integration.type,
                integration.destination,
                integration.destination_config
            )
            
            if not source_adapter or not dest_adapter:
                error_msg = f"Could not create adapters for integration {integration_id}"
                logger.error(error_msg, extra=run_context)
                raise ValueError(error_msg)
            
            # Extract data from source
            data = await self._extract_data(source_adapter, integration)
            
            # Log data extraction metrics
            if isinstance(data, pd.DataFrame):
                record_count = len(data)
                column_count = len(data.columns)
                logger.info(f"Extracted {record_count} records with {column_count} columns", extra=run_context)
                
                # Check for nulls/empty values
                null_counts = data.isna().sum()
                if null_counts.sum() > 0:
                    logger.warning(f"Extracted data contains null values: {null_counts.to_dict()}", extra=run_context)
            elif isinstance(data, list):
                record_count = len(data)
                logger.info(f"Extracted {record_count} records", extra=run_context)
            else:
                logger.info(f"Extracted data of type {type(data)}", extra=run_context)
            
            if data is None or (isinstance(data, pd.DataFrame) and data.empty):
                error_msg = "No data extracted from source"
                logger.error(error_msg, extra=run_context)
                raise ValueError(error_msg)
            
            # Transform data using mappings
            transformed_data = self._transform_data(data, mappings)
            
            # Log transformation metrics
            if isinstance(transformed_data, pd.DataFrame):
                transform_record_count = len(transformed_data)
                transform_column_count = len(transformed_data.columns)
                logger.info(f"Transformed to {transform_record_count} records with {transform_column_count} columns", 
                           extra=run_context)
                
                # Check for data quality issues after transformation
                null_counts = transformed_data.isna().sum()
                if null_counts.sum() > 0:
                    logger.warning(f"Transformed data contains null values: {null_counts.to_dict()}", 
                                 extra=run_context)
            
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
            
            logger.info(f"Integration run {history_id} completed successfully", extra=run_context)
            return {
                "status": "success",
                "records_processed": record_count,
                "history_id": history_id
            }
            
        except Exception as e:
            logger.error(f"Error running integration {integration_id}: {str(e)}", 
                       extra=error_context(**run_context))
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
    
    @debug_log
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
    
    @performance_log
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
        extract_context = {
            "integration_id": integration.id,
            "integration_name": integration.name,
            "source": integration.source,
            "adapter_type": type(source_adapter).__name__
        }
        
        start_time = datetime.utcnow()
        
        # Handle different adapter types differently
        try:
            if hasattr(source_adapter, "read_csv_blob"):
                # For blob storage with CSV files
                file_path = integration.source_config.get("file_pattern", "data.csv")
                logger.debug(f"Reading CSV blob from {file_path}", extra=extract_context)
                data = source_adapter.read_csv_blob(file_path)
                
            elif hasattr(source_adapter, "get"):
                # For API adapters
                endpoint = integration.source_config.get("endpoint", "")
                params = integration.source_config.get("params", {})
                logger.debug(f"Calling API endpoint {endpoint} with params {params}", extra=extract_context)
                data = source_adapter.get(endpoint, params)
                
            elif hasattr(source_adapter, "query") and "salesforce" in integration.source.lower():
                # For Salesforce adapter
                query = integration.source_config.get("query", "SELECT Id, Name FROM Account LIMIT 10")
                logger.debug(f"Executing Salesforce query: {query}", extra=extract_context)
                data = source_adapter.query(query)
                
            else:
                # Fallback for unknown adapter types
                error_msg = f"Unsupported source adapter type for {integration.source}"
                logger.error(error_msg, extra=extract_context)
                raise ValueError(error_msg)
            
            # Log extraction stats
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            # Describe the data that was extracted
            if isinstance(data, pd.DataFrame):
                logger.info(f"Extracted {len(data)} rows and {len(data.columns)} columns in {duration:.2f}s", 
                           extra=extract_context)
                # Sample data logging (first few rows)
                if not data.empty:
                    sample = data.head(2).to_dict(orient="records")
                    logger.debug(f"Data sample: {sample}", extra=extract_context)
            elif isinstance(data, list):
                logger.info(f"Extracted {len(data)} records in {duration:.2f}s", extra=extract_context)
                # Sample data logging
                if data:
                    sample = data[:2] if len(data) > 1 else data
                    logger.debug(f"Data sample: {sample}", extra=extract_context)
            elif isinstance(data, dict):
                logger.info(f"Extracted data dictionary with {len(data)} keys in {duration:.2f}s", 
                           extra=extract_context)
                # Log keys of dictionary
                logger.debug(f"Data keys: {list(data.keys())}", extra=extract_context)
            
            return data
            
        except Exception as e:
            logger.error(f"Error extracting data: {str(e)}", 
                       extra=error_context(**extract_context))
            logger.error(traceback.format_exc())
            raise
    
    @performance_log
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
        transform_context = {
            "mapping_count": len(mappings),
            "input_type": type(data).__name__
        }
        
        # Convert to DataFrame if not already
        try:
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
                error_msg = f"Unsupported data type: {type(data)}"
                logger.error(error_msg, extra=transform_context)
                raise ValueError(error_msg)
            
            # Update context with column information
            transform_context["input_columns"] = list(df.columns)
            transform_context["input_rows"] = len(df)
            
            # Log data shape before transformation
            logger.debug(f"Input data shape: {df.shape}", extra=transform_context)
            
            # Create output DataFrame
            result = pd.DataFrame()
            
            # Track transformation success/failure
            successful_transforms = 0
            failed_transforms = 0
            missing_fields = []
            
            # Apply each field mapping
            for mapping in mappings:
                source_field = mapping.source_field
                dest_field = mapping.destination_field
                transformation = mapping.transformation
                
                # Prepare context for this specific mapping
                mapping_context = {
                    **transform_context,
                    "source_field": source_field,
                    "dest_field": dest_field,
                    "transformation": transformation
                }
                
                logger.debug(f"Applying {transformation} transformation from {source_field} to {dest_field}", 
                           extra=mapping_context)
                
                if source_field not in df.columns:
                    logger.warning(f"Source field {source_field} not found in data", extra=mapping_context)
                    missing_fields.append(source_field)
                    
                    # If field is required, raise error
                    if mapping.required:
                        error_msg = f"Required source field {source_field} not found in data"
                        logger.error(error_msg, extra=mapping_context)
                        raise ValueError(error_msg)
                        
                    continue
                
                # Get transformation parameters if available
                transform_params = {}
                if hasattr(mapping, 'transform_params'):
                    transform_params = mapping.transform_params
                
                # Special handling for concat transformation which needs the full dataframe
                if transformation == "concat":
                    concat_field = transform_params.get("concat_field")
                    separator = transform_params.get("separator", " ")
                    
                    if concat_field and concat_field in df.columns:
                        result[dest_field] = df[source_field].astype(str) + separator + df[concat_field].astype(str)
                        successful_transforms += 1
                    else:
                        result[dest_field] = df[source_field]
                        successful_transforms += 1
                else:
                    # Use the transformation registry to apply transformation
                    try:
                        # Store original values for comparison
                        original_values = df[source_field].copy() if logger.isEnabledFor(logging.DEBUG) else None
                        
                        # Apply the transformation
                        result[dest_field] = TransformationRegistry.apply_transformation(
                            transformation,
                            df[source_field],
                            transform_params
                        )
                        
                        # Log data changes if debug is enabled
                        if logger.isEnabledFor(logging.DEBUG) and original_values is not None:
                            # Sample the changes
                            sample_idx = min(5, len(original_values) - 1) if len(original_values) > 0 else 0
                            if sample_idx > 0:
                                before = original_values.iloc[sample_idx]
                                after = result[dest_field].iloc[sample_idx]
                                logger.debug(f"Sample transformation {source_field}->{dest_field}: "
                                           f"'{before}' -> '{after}'", extra=mapping_context)
                        
                        successful_transforms += 1
                    except Exception as e:
                        logger.error(f"Error applying transformation {transformation}: {str(e)}", 
                                   extra=error_context(**mapping_context))
                        
                        # Fallback to direct mapping
                        result[dest_field] = df[source_field]
                        failed_transforms += 1
            
            # Log transformation results
            logger.info(f"Transformation complete - {successful_transforms} successful, "
                      f"{failed_transforms} failed, {len(missing_fields)} missing fields")
            
            if missing_fields:
                logger.warning(f"Missing fields: {', '.join(missing_fields)}")
            
            # Log data shape after transformation
            logger.debug(f"Output data shape: {result.shape}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error in transformation phase: {str(e)}", 
                       extra=error_context(**transform_context))
            logger.error(traceback.format_exc())
            raise
    
    @performance_log
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
        load_context = {
            "integration_id": integration.id,
            "integration_name": integration.name,
            "destination": integration.destination,
            "adapter_type": type(dest_adapter).__name__,
            "record_count": len(data)
        }
        
        # Handle different adapter types differently
        try:
            if hasattr(dest_adapter, "write_csv_blob"):
                # For blob storage with CSV files
                file_path = integration.destination_config.get("file_path", 
                                                          f"output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
                logger.debug(f"Writing CSV blob to {file_path}", extra=load_context)
                
                success = dest_adapter.write_csv_blob(
                    data, 
                    file_path,
                    include_header=True
                )
                logger.info(f"Wrote {len(data)} records to {file_path}", extra=load_context)
                return {"success": success, "file_path": file_path}
                
            elif hasattr(dest_adapter, "post"):
                # For API adapters
                endpoint = integration.destination_config.get("endpoint", "")
                logger.debug(f"Posting to API endpoint {endpoint}", extra=load_context)
                
                # Convert DataFrame to records
                records = data.to_dict(orient="records")
                
                # Determine if we should post in batch or individually
                if integration.destination_config.get("batch_mode", True):
                    logger.info(f"Batch posting {len(records)} records to {endpoint}", extra=load_context)
                    result = dest_adapter.post(endpoint, records)
                    return result
                else:
                    logger.info(f"Individual posting {len(records)} records to {endpoint}", extra=load_context)
                    results = []
                    for i, record in enumerate(records):
                        try:
                            result = dest_adapter.post(endpoint, record)
                            results.append(result)
                            
                            # Log progress for large datasets
                            if (i + 1) % 10 == 0:
                                logger.debug(f"Posted {i + 1}/{len(records)} records", extra=load_context)
                        except Exception as e:
                            logger.error(f"Error posting record {i}: {str(e)}", 
                                       extra=error_context(**load_context, record_index=i))
                            results.append({"success": False, "error": str(e)})
                    
                    # Summarize results
                    success_count = sum(1 for r in results if r.get("success", False))
                    logger.info(f"Posted {success_count}/{len(records)} records successfully", extra=load_context)
                    
                    return {"success": True, "results": results}
                    
            elif hasattr(dest_adapter, "create_record") and "salesforce" in integration.destination.lower():
                # For Salesforce adapter
                object_name = integration.destination_config.get("object_name", "Account")
                logger.debug(f"Creating records in Salesforce {object_name}", extra=load_context)
                
                # Convert DataFrame to records
                records = data.to_dict(orient="records")
                
                results = []
                for i, record in enumerate(records):
                    try:
                        result = dest_adapter.create_record(object_name, record)
                        results.append(result)
                        
                        # Log progress for large datasets
                        if (i + 1) % 10 == 0:
                            logger.debug(f"Created {i + 1}/{len(records)} Salesforce records", extra=load_context)
                    except Exception as e:
                        logger.error(f"Error creating Salesforce record {i}: {str(e)}", 
                                   extra=error_context(**load_context, record_index=i))
                        results.append({"success": False, "error": str(e)})
                
                # Summarize results
                success_count = sum(1 for r in results if r.get("success", False))
                logger.info(f"Created {success_count}/{len(records)} Salesforce records successfully", 
                          extra=load_context)
                
                return {"success": True, "results": results}
                    
            # Fallback for unknown adapter types
            error_msg = f"Unsupported destination adapter type for {integration.destination}"
            logger.error(error_msg, extra=load_context)
            raise ValueError(error_msg)
            
        except Exception as e:
            logger.error(f"Error in load phase: {str(e)}", 
                       extra=error_context(**load_context))
            logger.error(traceback.format_exc())
            raise