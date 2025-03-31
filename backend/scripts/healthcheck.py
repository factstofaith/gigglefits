#!/usr/bin/env python
"""
Health check endpoint for the TAP Integration Platform backend.

This script adds a /api/health endpoint that returns 200 OK if the service
is running properly and has database connectivity.
"""

import logging
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text

# Configure logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def add_health_endpoint(app: FastAPI, get_db):
    """Add a health check endpoint to the FastAPI application."""
    
    @app.get("/api/health", tags=["Health"])
    def health_check(db: Session = Depends(get_db)):
        """Health check endpoint that verifies database connectivity."""
        try:
            # Check database connectivity
            result = db.execute(text("SELECT 1")).scalar()
            if result != 1:
                logger.error("Database health check failed: unexpected result")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database health check failed"
                )
                
            return {"status": "ok", "message": "Service is healthy"}
        except SQLAlchemyError as e:
            logger.error(f"Database health check failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database health check failed"
            )
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Health check failed"
            )