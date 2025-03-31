"""
Mock models for testing

This module defines mock database models to support testing without
requiring actual database tables.
"""
from datetime import datetime

class MockUser:
    """Mock User model for testing"""
    def __init__(self, id, email, name, role, client_company=None, hashed_password=None):
        self.id = id
        self.email = email
        self.name = name
        self.role = role
        self.client_company = client_company
        self.hashed_password = hashed_password
        self.mfa_enabled = False
        self.mfa_secret = None
        self.recovery_codes = []
        self.created_at = datetime.now()
        self.last_login = None
        self.account_status = "ACTIVE"
        self.auth_provider = "LOCAL"

class MockInvitation:
    """Mock Invitation model for testing"""
    def __init__(self, id, email, role, token, status, created_by, created_at=None, expires_at=None):
        self.id = id
        self.email = email
        self.role = role
        self.token = token
        self.status = status
        self.created_by = created_by
        self.created_at = created_at or datetime.now()
        self.expires_at = expires_at
        self.accepted_at = None
        self.accepted_by = None
        self.custom_message = None

class Integration:
    """Mock Integration model"""
    id = None
    name = None
    type = None
    description = None
    status = None
    owner_id = None
    tenant_id = None
    created_at = None
    updated_at = None

class IntegrationFlow:
    """Mock IntegrationFlow model"""
    id = None
    integration_id = None
    nodes = None
    edges = None
    created_at = None
    updated_at = None
    created_by = None

class FlowNode:
    """Mock FlowNode model"""
    id = None
    flow_id = None
    node_id = None
    type = None
    position_x = None
    position_y = None
    data = None
    created_at = None
    updated_at = None

class FlowEdge:
    """Mock FlowEdge model"""
    id = None
    flow_id = None
    edge_id = None
    source = None
    target = None
    created_at = None
    updated_at = None

class FlowExecution:
    """Mock FlowExecution model"""
    id = None
    integration_id = None
    status = None
    start_time = None
    end_time = None
    success = None
    logs = None
    results = None
    triggered_by = None
    created_at = None