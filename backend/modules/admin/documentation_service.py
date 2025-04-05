"""
Documentation Analytics Service

This module provides methods for tracking and analyzing documentation usage.
"""

import logging
import json
from typing import List, Optional, Dict, Any, Union
from datetime import datetime, timedelta, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, JSON, Table, Float, Sequence, UniqueConstraint, ForeignKeyConstraint, event
from sqlalchemy.orm import relationship, backref, validates
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
from datetime import datetime, timezone
import enum
import uuid

from db.base import Base
from utils.encryption.crypto import EncryptedString, EncryptedJSON
from utils.helpers import generate_uid
from utils.error_handling.exceptions import ValidationError
class DocumentationService:
    """Service for documentation analytics"""
    
    def __init__(self, db: Session = None):
        """Initialize with database session"""
        self.db = db
    
    def record_document_view(self, document_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Record a document view for analytics
        
        Args:
            document_id: ID of the document being viewed
            user_id: ID of the user viewing the document (optional)
            
        Returns:
            Status of the operation
        """
        try:
            # Create a new document view record
            view = DocumentView(
                document_id=document_id,
                user_id=user_id,
                timestamp=datetime.now(timezone.utc),
                feedback=None
            )
            
            self.db.add(view)
            self.db.commit()
            
            logger.info(f"Recorded view for document {document_id} by user {user_id or 'anonymous'}")
            
            return {"status": "success", "id": view.id}
        
        except SQLAlchemyError as e:
            logger.error(f"Error recording document view: {str(e)}")
            self.db.rollback()
            return {"status": "error", "message": "Failed to record document view"}
    
    def record_document_views_batch(self, events: List[Dict[str, Any]], user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Record multiple document views in batch
        
        Args:
            events: List of document view events
            user_id: ID of the user viewing the documents (optional)
            
        Returns:
            Status of the operation
        """
        try:
            if not events:
                return {"status": "success", "count": 0}
            
            # Create document view records for each event
            views = []
            for event in events:
                # Extract data from the event
                doc_id = event.get('documentId')
                if not doc_id:
                    logger.warning(f"Skipping event without documentId: {event}")
                    continue
                
                # Use event timestamp if provided, otherwise current time
                timestamp_str = event.get('timestamp')
                if timestamp_str:
                    try:
                        timestamp = datetime.fromisoformat(timestamp_str)
                    except (ValueError, TypeError):
                        timestamp = datetime.now(timezone.utc)
                else:
                    timestamp = datetime.now(timezone.utc)
                
                # Create the view record
                view = DocumentView(
                    document_id=doc_id,
                    user_id=user_id,
                    timestamp=timestamp,
                    feedback=event.get('feedback'),
                    metadata=json.dumps(event) if 'metadata' in event else None
                )
                
                views.append(view)
            
            # Add all views to the database
            if views:
                self.db.add_all(views)
                self.db.commit()
            
            logger.info(f"Recorded {len(views)} document views in batch")
            
            return {"status": "success", "count": len(views)}
        
        except SQLAlchemyError as e:
            logger.error(f"Error recording document views batch: {str(e)}")
            self.db.rollback()
            return {"status": "error", "message": "Failed to record document views"}
    
    def get_documentation_stats(self, time_period: str = "week") -> Dict[str, Any]:
        """
        Get documentation usage statistics
        
        Args:
            time_period: Time period for stats (day, week, month, year, all)
            
        Returns:
            Documentation usage statistics
        """
        try:
            # Determine the date range based on time_period
            now = datetime.now(timezone.utc)
            if time_period == "day":
                start_date = now - timedelta(days=1)
            elif time_period == "week":
                start_date = now - timedelta(weeks=1)
            elif time_period == "month":
                start_date = now - timedelta(days=30)
            elif time_period == "year":
                start_date = now - timedelta(days=365)
            else:  # "all"
                start_date = datetime(1970, 1, 1, tzinfo=timezone.utc)
            
            # Get total views in the time period
            total_views = self.db.query(func.count(DocumentView.id)).filter(
                DocumentView.timestamp >= start_date
            ).scalar() or 0
            
            # Get unique documents viewed
            unique_docs = self.db.query(func.count(func.distinct(DocumentView.document_id))).filter(
                DocumentView.timestamp >= start_date
            ).scalar() or 0
            
            # Get unique users
            unique_users = self.db.query(func.count(func.distinct(DocumentView.user_id))).filter(
                and_(
                    DocumentView.timestamp >= start_date,
                    DocumentView.user_id.isnot(None)
                )
            ).scalar() or 0
            
            # Get anonymous views
            anonymous_views = self.db.query(func.count(DocumentView.id)).filter(
                and_(
                    DocumentView.timestamp >= start_date,
                    DocumentView.user_id.is_(None)
                )
            ).scalar() or 0
            
            # Get top documents
            top_docs_query = self.db.query(
                DocumentView.document_id,
                func.count(DocumentView.id).label('view_count')
            ).filter(
                DocumentView.timestamp >= start_date
            ).group_by(
                DocumentView.document_id
            ).order_by(
                text('view_count DESC')
            ).limit(10)
            
            top_docs = [
                {"document_id": row.document_id, "views": row.view_count}
                for row in top_docs_query
            ]
            
            # Get positive feedback count
            positive_feedback = self.db.query(func.count(DocumentView.id)).filter(
                and_(
                    DocumentView.timestamp >= start_date,
                    DocumentView.feedback == 'helpful'
                )
            ).scalar() or 0
            
            # Get negative feedback count
            negative_feedback = self.db.query(func.count(DocumentView.id)).filter(
                and_(
                    DocumentView.timestamp >= start_date,
                    DocumentView.feedback == 'not-helpful'
                )
            ).scalar() or 0
            
            # Return compiled statistics
            return {
                "time_period": time_period,
                "start_date": start_date.isoformat(),
                "end_date": now.isoformat(),
                "total_views": total_views,
                "unique_documents": unique_docs,
                "unique_users": unique_users,
                "anonymous_views": anonymous_views,
                "top_documents": top_docs,
                "feedback": {
                    "positive": positive_feedback,
                    "negative": negative_feedback
                }
            }
            
        except SQLAlchemyError as e:
            logger.error(f"Error retrieving documentation stats: {str(e)}")
            return {
                "status": "error",
                "message": "Failed to retrieve documentation statistics"
            }