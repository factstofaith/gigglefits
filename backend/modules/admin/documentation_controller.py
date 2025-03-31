from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from .service import AdminService
from .models import AdminModel
from core.auth import get_current_active_user, get_current_admin_user
from db.models import User

analytics_router = APIRouter(
    prefix="/api/documentation/analytics",
    tags=["documentation"],
    responses={404: {"description": "Not found"}},
)

@analytics_router.post("/view/{document_id}")
async def record_document_view(
    document_id: str, 
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """
    Record a document view for analytics
    This endpoint can be used anonymously
    """
    admin_service = AdminService()
    user_id = current_user.id if current_user else None
    return admin_service.record_document_view(document_id, user_id)

@analytics_router.post("/view")
async def record_document_view_batch(
    events: Dict[str, Any] = Body(...),
    current_user: Optional[User] = Depends(get_current_active_user)
):
    """
    Record multiple document views in batch
    This endpoint can be used anonymously
    """
    admin_service = AdminService()
    user_id = current_user.id if current_user else None
    return admin_service.record_document_views_batch(events.get("events", []), user_id)

@analytics_router.get("/stats")
async def get_documentation_stats(
    time_period: str = Query("week", enum=["day", "week", "month", "year", "all"]),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get documentation usage statistics
    Only available to admin users
    """
    admin_service = AdminService()
    return admin_service.get_documentation_stats(time_period)