"""
Utility functions for rate limiting.

This module provides helper functions for rate limiting operations.
"""

import time
import hashlib
import ipaddress
from typing import Dict, Any, Optional, Union, List, Tuple
from fastapi import Request, Response


def get_remote_address(request: Request) -> str:
    """
    Extract the client IP address from a request.
    
    Handles X-Forwarded-For and similar headers for proxied requests.
    
    Args:
        request: FastAPI request object
        
    Returns:
        Client IP address as string
    """
    # Check for X-Forwarded-For header (used by many proxies)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # The client IP is the first address in the list
        return forwarded_for.split(",")[0].strip()
    
    # Check for X-Real-IP header (used by some proxies)
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    
    # Fall back to the direct client address
    return request.client.host if request.client else "unknown"


def normalize_ip_address(ip: str) -> str:
    """
    Normalize an IP address to a consistent format.
    
    For IPv4, return as-is.
    For IPv6, normalize and mask out the last 64 bits for privacy.
    
    Args:
        ip: IP address string
        
    Returns:
        Normalized IP address string
    """
    try:
        addr = ipaddress.ip_address(ip)
        if isinstance(addr, ipaddress.IPv6Address):
            # For IPv6, normalize and mask out the last 64 bits for privacy
            network = ipaddress.IPv6Network(f"{addr}/64", strict=False)
            return str(network.network_address)
        return str(addr)
    except ValueError:
        # Not a valid IP, return as-is
        return ip


def generate_key(
    request: Request,
    key_func: Optional[callable] = None,
    path: bool = True,
    method: bool = False,
    ip: bool = True
) -> str:
    """
    Generate a rate limit key for a request.
    
    Args:
        request: FastAPI request object
        key_func: Optional custom function to generate the key
        path: Whether to include the request path in the key
        method: Whether to include the HTTP method in the key
        ip: Whether to include the client IP in the key
        
    Returns:
        Rate limit key string
    """
    # If custom key function is provided, use it
    if key_func:
        return key_func(request)
    
    # Otherwise, build a key based on the specified components
    components = []
    
    if ip:
        client_ip = normalize_ip_address(get_remote_address(request))
        components.append(f"ip:{client_ip}")
    
    if path:
        components.append(f"path:{request.url.path}")
    
    if method:
        components.append(f"method:{request.method}")
    
    # Combine components
    key = "|".join(components)
    
    # If key is empty, use a default
    if not key:
        return "default-key"
    
    return key


def hash_key(key: str, max_length: int = 64) -> str:
    """
    Hash a key to limit its length while maintaining uniqueness.
    
    Args:
        key: Original key string
        max_length: Maximum length for the key
        
    Returns:
        Hashed key string
    """
    if len(key) <= max_length:
        return key
    
    # Hash the key using SHA-256
    hashed = hashlib.sha256(key.encode()).hexdigest()
    
    # Include the beginning of the original key for readability
    prefix_len = min(16, max_length // 4)
    prefix = key[:prefix_len]
    
    # Combine prefix with hash, ensuring total length <= max_length
    hash_len = max_length - prefix_len - 1  # -1 for separator
    result = f"{prefix}:{hashed[:hash_len]}"
    
    return result


def add_headers(
    response: Response,
    rate_limit_info: Dict[str, Any],
    include_headers: bool = True,
    prefix: str = "X-RateLimit-"
) -> Response:
    """
    Add rate limit headers to a response.
    
    Args:
        response: FastAPI response object
        rate_limit_info: Dictionary containing rate limit information
        include_headers: Whether to include the rate limit headers
        prefix: Prefix for the rate limit headers
        
    Returns:
        Response with added headers
    """
    if not include_headers:
        return response
    
    # Add standard rate limit headers
    response.headers[f"{prefix}Limit"] = str(rate_limit_info.get("limit", 0))
    response.headers[f"{prefix}Remaining"] = str(rate_limit_info.get("remaining", 0))
    response.headers[f"{prefix}Reset"] = str(rate_limit_info.get("reset", 0))
    
    # Add Retry-After header if limit is exceeded
    retry_after = rate_limit_info.get("retry_after")
    if retry_after is not None:
        response.headers["Retry-After"] = str(retry_after)
    
    return response
    

def calculate_delay(
    rate_limit_info: Dict[str, Any],
    jitter_factor: float = 0.1
) -> float:
    """
    Calculate delay time for a client, with jitter.
    
    Args:
        rate_limit_info: Dictionary containing rate limit information
        jitter_factor: Factor to apply for jitter (0.0 - 1.0)
        
    Returns:
        Delay time in seconds
    """
    from random import random
    
    retry_after = rate_limit_info.get("retry_after")
    if retry_after is None:
        return 0.0
    
    base_delay = float(retry_after)
    
    # Add jitter to prevent thundering herd problem
    if jitter_factor > 0:
        jitter = base_delay * jitter_factor * random()
        return base_delay + jitter
    
    return base_delay


def is_path_exempted(
    path: str,
    exempted_paths: List[str]
) -> bool:
    """
    Check if a path is exempted from rate limiting.
    
    Args:
        path: Request path to check
        exempted_paths: List of path patterns that are exempted
        
    Returns:
        True if path is exempted, False otherwise
    """
    import re
    
    # Normalize path
    path = path.rstrip('/')
    
    # Check exact matches first
    if path in exempted_paths:
        return True
    
    # Check prefix matches (e.g., /api/v1/)
    for exempted in exempted_paths:
        if exempted.endswith('*') and path.startswith(exempted[:-1]):
            return True
    
    # Check regex patterns
    for exempted in exempted_paths:
        if exempted.startswith('^') and re.match(exempted, path):
            return True
    
    return False


def is_ip_exempted(
    ip: str,
    exempted_ips: List[str]
) -> bool:
    """
    Check if an IP address is exempted from rate limiting.
    
    Args:
        ip: IP address to check
        exempted_ips: List of IP addresses or CIDR ranges that are exempted
        
    Returns:
        True if IP is exempted, False otherwise
    """
    try:
        addr = ipaddress.ip_address(ip)
        
        # Check exact IP matches
        if str(addr) in exempted_ips:
            return True
        
        # Check CIDR range matches
        for exempted in exempted_ips:
            if '/' in exempted:  # This is a CIDR range
                try:
                    network = ipaddress.ip_network(exempted)
                    if addr in network:
                        return True
                except ValueError:
                    # Invalid CIDR notation, skip
                    continue
    except ValueError:
        # Invalid IP address, can't be exempted
        return False
    
    return False