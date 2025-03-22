"""
Helper functions for the application.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
import json


def format_datetime(dt: datetime) -> str:
    """Format a datetime object to ISO format"""
    return dt.isoformat()


def parse_datetime(dt_str: str) -> Optional[datetime]:
    """Parse a datetime string from ISO format"""
    try:
        return datetime.fromisoformat(dt_str)
    except (ValueError, TypeError):
        return None


def filter_dict(data: Dict[str, Any], keys: List[str]) -> Dict[str, Any]:
    """Filter a dictionary to include only specified keys"""
    return {k: v for k, v in data.items() if k in keys}


def safe_json(data: Any) -> str:
    """Convert data to JSON with error handling"""
    try:
        return json.dumps(data)
    except (TypeError, ValueError):
        # Convert values that can't be JSON serialized to strings
        if isinstance(data, dict):
            return json.dumps({k: str(v) for k, v in data.items()})
        elif isinstance(data, list):
            return json.dumps([str(item) for item in data])
        else:
            return json.dumps(str(data))