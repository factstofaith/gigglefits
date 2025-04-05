"""
Integration Services

This module provides services for working with integrations.
It's designed to be flexible and support dynamic creation of integrations
based on UI configuration.
"""

from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timezone
import random
import logging
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON, Table, Float, Sequence, UniqueConstraint, ForeignKeyConstraint, event, desc
from sqlalchemy.orm import relationship, backref, validates, Session
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
import enum
import uuid

from db.base import Base
from utils.encryption.crypto import EncryptedString, EncryptedJSON
from utils.helpers import generate_uid
from utils.error_handling.exceptions import ValidationError

from db.models import (
    Integration as DbIntegration,
    FieldMapping as DbFieldMapping,
    IntegrationRun as DbIntegrationRun,
    Tag as DbTag,
    IntegrationType,
    IntegrationHealth,
    IntegrationRunStatus,
    Dataset as DbDataset,
    DatasetField as DbDatasetField,
    IntegrationEarningsMap as DbIntegrationEarningsMap, 
    EarningsCode as DbEarningsCode,
    integration_datasets
)

from .models import (
    Integration,
    IntegrationCreate,
    IntegrationUpdate,
    FieldMapping,
    FieldMappingCreate,
    FieldMappingUpdate,
    IntegrationRun,
    DatasetField,
    Dataset,
    EarningsCode,
    EarningsMapping,
    EarningsMappingCreate,
    EarningsMappingUpdate,
    EarningsCodeCreate,
    EarningsCodeUpdate
)
class IntegrationService:
    """Service for managing integrations using database"""
    
    def __init__(self, db: Session):
        """Initialize with database session"""
        self.db = db
        
        # Available integration types for dynamic creation
        self.available_sources = {
            "API-based": [
                "Workday (HR)",
                "Kronos (Time)",
                "Paylocity (Payroll)",
                "7Shifts (Time)",
                "BambooHR (HR)",
                "ADP (Payroll)",
                "Custom API"
            ],
            "File-based": [
                "Azure Blob Container",
                "AWS S3 Bucket",
                "Google Cloud Storage",
                "Local File System",
                "SFTP Server"
            ],
            "Database": [
                "MySQL",
                "PostgreSQL",
                "SQL Server",
                "MongoDB",
                "Oracle"
            ]
        }
        
        # Try to import the AdapterFactory to get available adapters
        try:
            from adapters.adapter_factory import AdapterFactory
            self.adapter_factory_available = True
        except ImportError:
            self.adapter_factory_available = False
    
    def get_available_sources(self, integration_type: str) -> List[str]:
        """Get available sources for a specific integration type"""
        # First check if we have hard-coded sources for this type
        sources = self.available_sources.get(integration_type, [])
        
        # If we have the adapter factory, try to get dynamic sources
        if hasattr(self, 'adapter_factory_available') and self.adapter_factory_available:
            try:
                from adapters.adapter_factory import AdapterFactory
                
                # If the type is API-based, add available adapters
                if integration_type == "API-based":
                    adapter_sources = list(AdapterFactory.get_available_adapters().keys())
                    sources = list(set(sources + adapter_sources))
            except Exception as e:
                logger.error(f"Error getting adapters from AdapterFactory: {e}")
        
        return sources
    
    def get_available_destinations(self, integration_type: str) -> List[str]:
        """Get available destinations for a specific integration type"""
        # We'll use the same implementation as get_available_sources for now
        # In a real app, you might have different sources and destinations
        return self.get_available_sources(integration_type)
    
    def _db_to_model(self, db_integration: DbIntegration) -> Integration:
        """Convert DB integration model to Pydantic model"""
        return Integration(
            id=db_integration.id,
            name=db_integration.name,
            type=db_integration.type.value,
            source=db_integration.source,
            destination=db_integration.destination,
            description=db_integration.description,
            tenant_id=db_integration.tenant_id,
            owner_id=db_integration.owner_id,
            health=db_integration.health.value,
            schedule=db_integration.schedule,
            azure_blob_config=db_integration.azure_blob_config,
            created_at=db_integration.created_at,
            updated_at=db_integration.updated_at,
            last_run_at=db_integration.last_run_at,
            tags=[tag.name for tag in db_integration.tags] if db_integration.tags else None
        )
    
    def _db_to_field_mapping(self, db_mapping: DbFieldMapping) -> FieldMapping:
        """Convert DB field mapping model to Pydantic model"""
        return FieldMapping(
            id=db_mapping.id,
            integration_id=db_mapping.integration_id,
            source_field=db_mapping.source_field,
            destination_field=db_mapping.destination_field,
            transformation=db_mapping.transformation,
            transform_params=db_mapping.transform_params if hasattr(db_mapping, 'transform_params') else None,
            required=db_mapping.required,
            description=db_mapping.description,
            created_at=db_mapping.created_at,
            updated_at=db_mapping.updated_at
        )
    
    def get_integrations(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        type_filter: Optional[str] = None,
        health_filter: Optional[str] = None,
        tenant_id: Optional[str] = None
    ) -> List[Integration]:
        """Get all integrations with optional filtering"""
        query = self.db.query(DbIntegration)
        
        # Apply filters
        if type_filter:
            try:
                type_enum = IntegrationType(type_filter)
                query = query.filter(DbIntegration.type == type_enum)
            except ValueError:
                logger.warning(f"Invalid integration type filter: {type_filter}")
        
        if health_filter:
            try:
                health_enum = IntegrationHealth(health_filter)
                query = query.filter(DbIntegration.health == health_enum)
            except ValueError:
                logger.warning(f"Invalid health filter: {health_filter}")
        
        if tenant_id:
            query = query.filter(DbIntegration.tenant_id == tenant_id)
        
        # Order by most recently updated
        query = query.order_by(desc(DbIntegration.updated_at))
        
        # Apply pagination
        db_integrations = query.offset(skip).limit(limit).all()
        
        # Convert to Pydantic models
        return [self._db_to_model(db_integration) for db_integration in db_integrations]
    
    def get_integration(self, integration_id: int) -> Optional[Integration]:
        """Get a specific integration by ID"""
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return None
        
        return self._db_to_model(db_integration)
    
    def create_integration(self, integration: IntegrationCreate, tenant_id: Optional[str] = None) -> Integration:
        """Create a new integration"""
        # Create SQLAlchemy model from Pydantic model
        try:
            type_enum = IntegrationType(integration.type)
        except ValueError:
            logger.error(f"Invalid integration type: {integration.type}")
            type_enum = IntegrationType.API
        
        # Create tags if needed
        tags = []
        if integration.tags:
            for tag_name in integration.tags:
                # Get or create tag
                tag = self.db.query(DbTag).filter(DbTag.name == tag_name).first()
                if not tag:
                    tag = DbTag(name=tag_name)
                    self.db.add(tag)
                tags.append(tag)
        
        db_integration = DbIntegration(
            name=integration.name,
            type=type_enum,
            source=integration.source,
            destination=integration.destination,
            description=integration.description,
            tenant_id=tenant_id or integration.tenant_id,
            owner_id=integration.owner_id,
            health=IntegrationHealth.HEALTHY,
            schedule=integration.schedule.model_dump() if hasattr(integration.schedule, "model_dump") else integration.schedule,
            azure_blob_config=integration.azure_blob_config.model_dump() if integration.azure_blob_config else None,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
            tags=tags
        )
        
        # Add to database
        self.db.add(db_integration)
        self.db.commit()
        self.db.refresh(db_integration)
        
        logger.info(f"Created integration: {integration.name} ({db_integration.id})")
        return self._db_to_model(db_integration)
    
    def update_integration(self, integration_id: int, update: IntegrationUpdate) -> Optional[Integration]:
        """Update an existing integration"""
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return None
        
        # Update fields if provided
        update_dict = update.model_dump(exclude_unset=True)
        
        # Special handling for type field (convert to enum)
        if "type" in update_dict:
            try:
                update_dict["type"] = IntegrationType(update_dict["type"])
            except ValueError:
                logger.error(f"Invalid integration type: {update_dict['type']}")
                del update_dict["type"]
        
        # Special handling for health field (convert to enum)
        if "health" in update_dict:
            try:
                update_dict["health"] = IntegrationHealth(update_dict["health"])
            except ValueError:
                logger.error(f"Invalid integration health: {update_dict['health']}")
                del update_dict["health"]
        
        # Special handling for tags
        if "tags" in update_dict:
            tags = []
            for tag_name in update_dict["tags"]:
                # Get or create tag
                tag = self.db.query(DbTag).filter(DbTag.name == tag_name).first()
                if not tag:
                    tag = DbTag(name=tag_name)
                    self.db.add(tag)
                tags.append(tag)
            db_integration.tags = tags
            del update_dict["tags"]
        
        # Handle schedules and configs that are Pydantic models
        if "schedule" in update_dict and hasattr(update_dict["schedule"], "model_dump"):
            update_dict["schedule"] = update_dict["schedule"].model_dump()
            
        if "azure_blob_config" in update_dict and hasattr(update_dict["azure_blob_config"], "model_dump"):
            update_dict["azure_blob_config"] = update_dict["azure_blob_config"].model_dump()
        
        # Update the fields
        for field, value in update_dict.items():
            setattr(db_integration, field, value)
        
        # Update the updated_at timestamp
        db_integration.updated_at = datetime.now(timezone.utc)
        
        # Commit changes
        self.db.commit()
        self.db.refresh(db_integration)
        
        logger.info(f"Updated integration: {db_integration.name} ({integration_id})")
        return self._db_to_model(db_integration)
    
    def delete_integration(self, integration_id: int) -> bool:
        """Delete an integration"""
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return False
        
        integration_name = db_integration.name
        
        # Delete the integration (cascade will handle related records)
        self.db.delete(db_integration)
        self.db.commit()
        
        logger.info(f"Deleted integration: {integration_name} ({integration_id})")
        return True
    
    def run_integration(self, integration_id: int) -> Optional[Dict[str, Any]]:
        """Run an integration"""
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return None
        
        # Create a new run record
        now = datetime.now(timezone.utc)
        
        db_run = DbIntegrationRun(
            integration_id=integration_id,
            status=IntegrationRunStatus.RUNNING,
            start_time=now
        )
        
        # Add to database
        self.db.add(db_run)
        self.db.commit()
        self.db.refresh(db_run)
        
        # Update the integration's last_run_at
        db_integration.last_run_at = now
        self.db.commit()
        
        logger.info(f"Running integration: {db_integration.name} ({integration_id})")
        
        # Return a status that the integration is running
        return {
            "id": db_run.id,
            "integration_id": integration_id,
            "status": db_run.status.value,
            "start_time": now.isoformat()
        }
    
    def get_integration_history(self, integration_id: int, limit: int = 10, skip: int = 0) -> Optional[List[Dict[str, Any]]]:
        """
        Get execution history for an integration
        
        Args:
            integration_id: ID of the integration
            limit: Maximum number of records to return
            skip: Number of records to skip (for pagination)
            
        Returns:
            List of run history records
        """
        # Check if integration exists
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return None
        
        # Get run history with pagination
        db_runs = (self.db.query(DbIntegrationRun)
                  .filter(DbIntegrationRun.integration_id == integration_id)
                  .order_by(desc(DbIntegrationRun.start_time))
                  .offset(skip)
                  .limit(limit)
                  .all())
        
        # Convert to dicts with camelCase for frontend compatibility
        result = []
        for run in db_runs:
            run_dict = {
                "id": run.id,
                "integrationId": run.integration_id,
                "status": run.status.value,
                "startTime": run.start_time.isoformat() if run.start_time else None,
                "endTime": run.end_time.isoformat() if run.end_time else None,
                "recordsProcessed": run.records_processed,
                "warnings": run.warnings,
                "error": run.error
            }
            result.append(run_dict)
        
        return result
    
    def get_field_mappings(self, integration_id: int) -> Optional[List[FieldMapping]]:
        """Get field mappings for an integration"""
        # Check if integration exists
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return None
        
        # Get field mappings
        db_mappings = (self.db.query(DbFieldMapping)
                      .filter(DbFieldMapping.integration_id == integration_id)
                      .all())
        
        # Convert to Pydantic models
        return [self._db_to_field_mapping(mapping) for mapping in db_mappings]
    
    def create_field_mapping(self, integration_id: int, mapping: FieldMappingCreate) -> Optional[FieldMapping]:
        """Create a new field mapping for an integration"""
        # Check if integration exists
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return None
        
        # Create SQLAlchemy model from Pydantic model
        db_mapping = DbFieldMapping(
            integration_id=integration_id,
            source_field=mapping.source_field,
            destination_field=mapping.destination_field,
            transformation=mapping.transformation or "direct",
            required=mapping.required,
            description=mapping.description,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Add to database
        self.db.add(db_mapping)
        self.db.commit()
        self.db.refresh(db_mapping)
        
        logger.info(f"Created field mapping for integration {integration_id}: {mapping.source_field} -> {mapping.destination_field}")
        return self._db_to_field_mapping(db_mapping)
    
    def update_field_mapping(
        self, 
        integration_id: int, 
        mapping_id: int, 
        update: FieldMappingUpdate
    ) -> Optional[FieldMapping]:
        """Update a field mapping"""
        db_mapping = (self.db.query(DbFieldMapping)
                     .filter(DbFieldMapping.id == mapping_id, 
                             DbFieldMapping.integration_id == integration_id)
                     .first())
        
        if not db_mapping:
            return None
        
        # Update fields if provided
        update_dict = update.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(db_mapping, field, value)
        
        # Update the updated_at timestamp
        db_mapping.updated_at = datetime.now(timezone.utc)
        
        # Commit changes
        self.db.commit()
        self.db.refresh(db_mapping)
        
        logger.info(f"Updated field mapping {mapping_id} for integration {integration_id}")
        return self._db_to_field_mapping(db_mapping)
    
    def delete_field_mapping(self, integration_id: int, mapping_id: int) -> bool:
        """Delete a field mapping"""
        db_mapping = (self.db.query(DbFieldMapping)
                     .filter(DbFieldMapping.id == mapping_id, 
                             DbFieldMapping.integration_id == integration_id)
                     .first())
        
        if not db_mapping:
            return False
        
        # Delete the mapping
        self.db.delete(db_mapping)
        self.db.commit()
        
        logger.info(f"Deleted field mapping {mapping_id} for integration {integration_id}")
        return True
        
    def discover_fields(self, integration_id: int, source_or_dest: str = "source") -> List[Dict[str, str]]:
        """
        Discover available fields from a source or destination
        """
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return []
            
        # Try to use adapter factory if available
        if hasattr(self, 'adapter_factory_available') and self.adapter_factory_available:
            try:
                from adapters.adapter_factory import AdapterFactory
                
                # Determine which adapter to use based on source or destination
                adapter_type = None
                if source_or_dest == "source":
                    adapter_type = db_integration.source
                else:
                    adapter_type = db_integration.destination
                    
                # For registered adapter types
                if adapter_type in AdapterFactory._adapter_registry:
                    # Get integration config from database
                    config = {}
                    if db_integration.azure_blob_config and "Blob" in adapter_type:
                        config = db_integration.azure_blob_config
                    
                    # Create adapter instance
                    adapter = AdapterFactory.create_adapter(adapter_type, config)
                    
                    if adapter:
                        # Use the adapter's discover_fields method to get fields
                        logger.info(f"Created adapter for {adapter_type}, discovering fields")
                        return adapter.discover_fields()
            except Exception as e:
                logger.error(f"Error using adapter for field discovery: {e}")
        
        # Check if integration is associated with datasets
        datasets = self.get_integration_datasets(integration_id)
        if datasets:
            # Combine fields from all associated datasets
            fields = []
            for dataset in datasets:
                for field in dataset.fields:
                    fields.append({
                        "name": field.name,
                        "type": field.data_type,
                        "description": field.description or f"Field '{field.name}' from dataset '{dataset.name}'"
                    })
            if fields:
                return fields
        
        # If no fields could be discovered, return empty list
        logger.warning(f"No fields could be discovered for integration {integration_id}, {source_or_dest}")
        return []
                
    def _db_to_dataset_field(self, db_field: DbDatasetField) -> DatasetField:
        """Convert DB dataset field model to Pydantic model"""
        return DatasetField(
            id=db_field.id,
            dataset_id=db_field.dataset_id,
            name=db_field.name,
            description=db_field.description,
            data_type=db_field.data_type.value,
            is_required=db_field.is_required,
            is_primary_key=db_field.is_primary_key,
            format=db_field.format,
            constraints=db_field.constraints,
            created_at=db_field.created_at,
            updated_at=db_field.updated_at
        )
        
    def _db_to_dataset(self, db_dataset: DbDataset) -> Dataset:
        """Convert DB dataset model to Pydantic model"""
        return Dataset(
            id=db_dataset.id,
            name=db_dataset.name,
            description=db_dataset.description,
            status=db_dataset.status.value,
            schema=db_dataset.schema,
            sample_data=db_dataset.sample_data,
            tenant_id=db_dataset.tenant_id,
            fields=[self._db_to_dataset_field(field) for field in db_dataset.fields],
            created_at=db_dataset.created_at,
            updated_at=db_dataset.updated_at
        )
        
    def get_integration_datasets(self, integration_id: int) -> List[Dataset]:
        """Get datasets associated with an integration"""
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return []
            
        datasets = db_integration.datasets
        return [self._db_to_dataset(dataset) for dataset in datasets]
        
    def associate_dataset(self, integration_id: int, dataset_id: int) -> bool:
        """Associate a dataset with an integration"""
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return False
            
        db_dataset = self.db.query(DbDataset).filter(DbDataset.id == dataset_id).first()
        if not db_dataset:
            return False
            
        # Check if association already exists
        if db_dataset in db_integration.datasets:
            return True
            
        # Add the association
        db_integration.datasets.append(db_dataset)
        self.db.commit()
        
        logger.info(f"Associated dataset {dataset_id} with integration {integration_id}")
        return True
        
    def disassociate_dataset(self, integration_id: int, dataset_id: int) -> bool:
        """Remove dataset association from an integration"""
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return False
            
        db_dataset = self.db.query(DbDataset).filter(DbDataset.id == dataset_id).first()
        if not db_dataset:
            return False
            
        # Check if association exists
        if db_dataset not in db_integration.datasets:
            return False
            
        # Remove the association
        db_integration.datasets.remove(db_dataset)
        self.db.commit()
        
        logger.info(f"Disassociated dataset {dataset_id} from integration {integration_id}")
        return True
        
    def _db_to_earnings_code(self, db_code: DbEarningsCode) -> EarningsCode:
        """Convert DB earnings code model to Pydantic model"""
        return EarningsCode(
            id=db_code.id,
            code=db_code.code,
            name=db_code.name,
            description=db_code.description,
            destination_system=db_code.destination_system,
            is_overtime=db_code.is_overtime,
            attributes=db_code.attributes,
            created_at=db_code.created_at,
            updated_at=db_code.updated_at
        )
        
    def _db_to_earnings_mapping(self, db_mapping: DbIntegrationEarningsMap) -> EarningsMapping:
        """Convert DB earnings mapping model to Pydantic model"""
        earnings_code = self._db_to_earnings_code(db_mapping.earnings_code)
        
        return EarningsMapping(
            id=db_mapping.id,
            integration_id=db_mapping.integration_id,
            source_type=db_mapping.source_type,
            earnings_code_id=db_mapping.earnings_code_id,
            default_map=db_mapping.default_map,
            condition=db_mapping.condition,
            dataset_id=db_mapping.dataset_id,
            created_at=db_mapping.created_at,
            updated_at=db_mapping.updated_at,
            earnings_code=earnings_code
        )
        
    def get_earnings_mappings(self, integration_id: int) -> List[EarningsMapping]:
        """Get earnings mappings for an integration"""
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return []
            
        mappings = db_integration.earnings_maps
        return [self._db_to_earnings_mapping(mapping) for mapping in mappings]
        
    def create_earnings_mapping(self, integration_id: int, mapping: EarningsMappingCreate) -> Optional[EarningsMapping]:
        """Create a new earnings mapping for an integration"""
        # Check if integration exists
        db_integration = self.db.query(DbIntegration).filter(DbIntegration.id == integration_id).first()
        if not db_integration:
            return None
            
        # Check if earnings code exists
        db_earnings_code = self.db.query(DbEarningsCode).filter(DbEarningsCode.id == mapping.earnings_code_id).first()
        if not db_earnings_code:
            return None
            
        # Check if dataset exists (if provided)
        if mapping.dataset_id:
            db_dataset = self.db.query(DbDataset).filter(DbDataset.id == mapping.dataset_id).first()
            if not db_dataset:
                return None
                
        # Create SQLAlchemy model from Pydantic model
        db_mapping = DbIntegrationEarningsMap(
            integration_id=integration_id,
            source_type=mapping.source_type,
            earnings_code_id=mapping.earnings_code_id,
            default_map=mapping.default_map,
            condition=mapping.condition,
            dataset_id=mapping.dataset_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Add to database
        self.db.add(db_mapping)
        self.db.commit()
        self.db.refresh(db_mapping)
        
        logger.info(f"Created earnings mapping for integration {integration_id}: {mapping.source_type} -> {db_earnings_code.code}")
        return self._db_to_earnings_mapping(db_mapping)
        
    def update_earnings_mapping(
        self, 
        integration_id: int, 
        mapping_id: int, 
        update: EarningsMappingUpdate
    ) -> Optional[EarningsMapping]:
        """Update an earnings mapping"""
        db_mapping = (self.db.query(DbIntegrationEarningsMap)
                     .filter(DbIntegrationEarningsMap.id == mapping_id, 
                             DbIntegrationEarningsMap.integration_id == integration_id)
                     .first())
        
        if not db_mapping:
            return None
        
        # Update fields if provided
        update_dict = update.model_dump(exclude_unset=True)
        
        # Check if earnings code exists (if being updated)
        if "earnings_code_id" in update_dict:
            db_earnings_code = self.db.query(DbEarningsCode).filter(DbEarningsCode.id == update_dict["earnings_code_id"]).first()
            if not db_earnings_code:
                return None
                
        # Check if dataset exists (if being updated)
        if "dataset_id" in update_dict and update_dict["dataset_id"]:
            db_dataset = self.db.query(DbDataset).filter(DbDataset.id == update_dict["dataset_id"]).first()
            if not db_dataset:
                return None
        
        # Update the fields
        for field, value in update_dict.items():
            setattr(db_mapping, field, value)
        
        # Update the updated_at timestamp
        db_mapping.updated_at = datetime.now(timezone.utc)
        
        # Commit changes
        self.db.commit()
        self.db.refresh(db_mapping)
        
        logger.info(f"Updated earnings mapping {mapping_id} for integration {integration_id}")
        return self._db_to_earnings_mapping(db_mapping)
        
    def delete_earnings_mapping(self, integration_id: int, mapping_id: int) -> bool:
        """Delete an earnings mapping"""
        db_mapping = (self.db.query(DbIntegrationEarningsMap)
                     .filter(DbIntegrationEarningsMap.id == mapping_id, 
                             DbIntegrationEarningsMap.integration_id == integration_id)
                     .first())
        
        if not db_mapping:
            return False
        
        # Delete the mapping
        self.db.delete(db_mapping)
        self.db.commit()
        
        logger.info(f"Deleted earnings mapping {mapping_id} for integration {integration_id}")
        return True
        
    def get_earnings_codes(self, tenant_id: Optional[str] = None, destination_system: Optional[str] = None) -> List[EarningsCode]:
        """Get all earnings codes, optionally filtered by tenant and destination system"""
        query = self.db.query(DbEarningsCode)
        
        # Apply tenant filter if provided
        if tenant_id:
            # In a real system, earnings codes might have a tenant_id field
            # For demo purposes, we'll skip tenant filtering
            pass
            
        # Apply destination system filter if provided
        if destination_system:
            query = query.filter(DbEarningsCode.destination_system == destination_system)
            
        # Order by code
        query = query.order_by(DbEarningsCode.code)
        
        # Convert to Pydantic models
        return [self._db_to_earnings_code(code) for code in query.all()]
        
    def create_earnings_code(self, code: EarningsCodeCreate, tenant_id: Optional[str] = None) -> EarningsCode:
        """Create a new earnings code"""
        # Create SQLAlchemy model from Pydantic model
        db_code = DbEarningsCode(
            code=code.code,
            name=code.name,
            description=code.description,
            destination_system=code.destination_system,
            is_overtime=code.is_overtime,
            attributes=code.attributes,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Add to database
        self.db.add(db_code)
        self.db.commit()
        self.db.refresh(db_code)
        
        logger.info(f"Created earnings code: {code.code} for {code.destination_system}")
        return self._db_to_earnings_code(db_code)
        
    def update_earnings_code(
        self, 
        code_id: int, 
        update: EarningsCodeUpdate, 
        tenant_id: Optional[str] = None,
        role: Optional[str] = None
    ) -> Optional[EarningsCode]:
        """Update an earnings code"""
        db_code = self.db.query(DbEarningsCode).filter(DbEarningsCode.id == code_id).first()
        if not db_code:
            return None
            
        # In a real system, check tenant access here
        # For demo purposes, we'll allow any tenant with admin role to update
        
        # Update fields if provided
        update_dict = update.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(db_code, field, value)
        
        # Update the updated_at timestamp
        db_code.updated_at = datetime.now(timezone.utc)
        
        # Commit changes
        self.db.commit()
        self.db.refresh(db_code)
        
        logger.info(f"Updated earnings code {code_id}: {db_code.code}")
        return self._db_to_earnings_code(db_code)