# Node Registry API with Capability Discovery

This document outlines the design for a dynamic Node Registry system that enables automatic discovery of transformation and integration capabilities within the TAP Integration Platform.

## Overview

The Node Registry API provides a centralized registry of all available node types in the platform, with rich metadata about capabilities, configuration options, and compatibility. The registry facilitates:

1. **Dynamic Node Discovery** - Automatic detection of available node types
2. **Capability Introspection** - Detailed information about node capabilities
3. **Consistent Configuration** - Standardized schema for node configuration
4. **Intelligent Recommendations** - Context-aware node suggestions
5. **Extensibility** - Plugin system for adding new node types

## Architecture

The Node Registry follows a plugin-based architecture that allows for dynamic registration and discovery of node types:

```
┌───────────────────────────────────────────────────────────┐
│                    Node Registry API                       │
├───────────────────────────────────────────────────────────┤
│                    Registry Manager                        │
├─────────────┬──────────────┬───────────────┬──────────────┤
│ Node Type   │ Capability   │ Schema        │ Dependency   │
│ Registry    │ Discovery    │ Validation    │ Resolution   │
└─────────────┴──────────────┴───────────────┴──────────────┘
         ▲              ▲              ▲             ▲
         │              │              │             │
┌────────┴──────────────┴──────────────┴─────────────┴─────┐
│                   Node Plugin System                      │
├─────────────┬──────────────┬───────────────┬─────────────┤
│ Source      │ Transform    │ Processing    │ Destination │
│ Nodes       │ Nodes        │ Nodes         │ Nodes       │
└─────────────┴──────────────┴───────────────┴─────────────┘
```

## Node Type Classification

Nodes are organized into a hierarchical classification system:

1. **Source Nodes**
   - API Source Nodes
   - File Source Nodes
   - Database Source Nodes
   - Stream Source Nodes

2. **Transform Nodes**
   - Data Type Conversion
   - Content Transformation
   - Structure Transformation
   - Aggregation
   - Filtering

3. **Processing Nodes**
   - Branching
   - Merging
   - Validation
   - Enrichment
   - Custom Logic

4. **Destination Nodes**
   - API Destination
   - File Destination
   - Database Destination
   - Stream Destination

## Metadata Model

### NodeType

```python
from enum import Enum, auto
from typing import Dict, List, Optional, Any, Set, Union
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl

class NodeCategory(str, Enum):
    """Top-level node categories"""
    SOURCE = "source"
    TRANSFORM = "transform"
    PROCESSING = "processing"
    DESTINATION = "destination"

class NodeSubcategory(str, Enum):
    """Node subcategories"""
    # Source subcategories
    API_SOURCE = "api_source"
    FILE_SOURCE = "file_source"
    DATABASE_SOURCE = "database_source"
    STREAM_SOURCE = "stream_source"
    
    # Transform subcategories
    DATA_TYPE_CONVERSION = "data_type_conversion"
    CONTENT_TRANSFORMATION = "content_transformation"
    STRUCTURE_TRANSFORMATION = "structure_transformation"
    AGGREGATION = "aggregation"
    FILTERING = "filtering"
    
    # Processing subcategories
    BRANCHING = "branching"
    MERGING = "merging"
    VALIDATION = "validation"
    ENRICHMENT = "enrichment"
    CUSTOM_LOGIC = "custom_logic"
    
    # Destination subcategories
    API_DESTINATION = "api_destination"
    FILE_DESTINATION = "file_destination"
    DATABASE_DESTINATION = "database_destination"
    STREAM_DESTINATION = "stream_destination"

class DataType(str, Enum):
    """Data types for node inputs and outputs"""
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    DATE = "date"
    DATETIME = "datetime"
    OBJECT = "object"
    ARRAY = "array"
    BINARY = "binary"
    ANY = "any"

class NodeParameterType(str, Enum):
    """Types of node configuration parameters"""
    STRING = "string"
    NUMBER = "number"
    BOOLEAN = "boolean"
    DATE = "date"
    DATETIME = "datetime"
    OBJECT = "object"
    ARRAY = "array"
    ENUM = "enum"
    EXPRESSION = "expression"
    JSON_SCHEMA = "json_schema"
    CODE_BLOCK = "code_block"
    MAPPING = "mapping"
    CONNECTION_CONFIG = "connection_config"

class NodeParameter(BaseModel):
    """Configuration parameter for a node type"""
    name: str = Field(
        ..., 
        description="Parameter name, used as key in configuration",
        example="apiEndpoint"
    )
    display_name: str = Field(
        ..., 
        description="Human-readable name for UI display",
        example="API Endpoint URL"
    )
    description: str = Field(
        ..., 
        description="Detailed description of the parameter",
        example="The full URL of the API endpoint to call"
    )
    type: NodeParameterType = Field(
        ..., 
        description="Parameter data type",
        example=NodeParameterType.STRING
    )
    required: bool = Field(
        False, 
        description="Whether this parameter is required",
        example=True
    )
    default_value: Optional[Any] = Field(
        None, 
        description="Default value for the parameter",
        example="https://api.example.com/v1/data"
    )
    enum_values: Optional[List[Any]] = Field(
        None, 
        description="Possible values for enum type parameters",
        example=["GET", "POST", "PUT", "DELETE"]
    )
    pattern: Optional[str] = Field(
        None, 
        description="Regex pattern for validation",
        example="^https?://.+"
    )
    minimum: Optional[float] = Field(
        None, 
        description="Minimum value for number parameters",
        example=0
    )
    maximum: Optional[float] = Field(
        None, 
        description="Maximum value for number parameters",
        example=100
    )
    advanced: bool = Field(
        False, 
        description="Whether this is an advanced parameter that should be hidden by default",
        example=False
    )
    depends_on: Optional[Dict[str, Any]] = Field(
        None, 
        description="Dependency conditions for showing this parameter",
        example={"authType": "oauth2"}
    )
    placeholder: Optional[str] = Field(
        None, 
        description="Placeholder text for UI input",
        example="Enter API URL..."
    )
    help_text: Optional[str] = Field(
        None, 
        description="Additional help text for the parameter",
        example="The complete URL including protocol (https://) and path"
    )

class Port(BaseModel):
    """Input or output port for a node"""
    id: str = Field(
        ..., 
        description="Unique identifier for the port",
        example="data_input"
    )
    display_name: str = Field(
        ..., 
        description="Human-readable name for UI display",
        example="Data Input"
    )
    description: str = Field(
        ..., 
        description="Detailed description of the port",
        example="Primary data input for transformation"
    )
    data_type: DataType = Field(
        ..., 
        description="Data type accepted by this port",
        example=DataType.OBJECT
    )
    schema: Optional[Dict[str, Any]] = Field(
        None, 
        description="JSON Schema defining the expected data structure",
        example={
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "value": {"type": "number"}
            }
        }
    )
    required: bool = Field(
        True, 
        description="Whether this port is required for node operation",
        example=True
    )
    multiple: bool = Field(
        False, 
        description="Whether this port accepts multiple connections",
        example=False
    )

class NodeCapability(BaseModel):
    """Capability provided by a node type"""
    type: str = Field(
        ..., 
        description="Type of capability",
        example="data_transformation"
    )
    description: str = Field(
        ..., 
        description="Description of the capability",
        example="Transforms data from one format to another"
    )
    properties: Dict[str, Any] = Field(
        default_factory=dict, 
        description="Additional properties specific to this capability",
        example={
            "formats": ["JSON", "XML", "CSV"],
            "bidirectional": True
        }
    )

class NodePermission(str, Enum):
    """Permission levels for nodes"""
    ADMIN = "admin"              # Only admin users can use
    POWER_USER = "power_user"    # Power users and admins can use
    STANDARD_USER = "standard_user"  # All users can use
    RESTRICTED = "restricted"    # Requires specific permission grant

class NodeTypeBase(BaseModel):
    """Base model for node type definitions"""
    type_id: str = Field(
        ..., 
        description="Unique identifier for the node type",
        example="http_api_source"
    )
    version: str = Field(
        ..., 
        description="Semantic version of the node type",
        example="1.0.0"
    )
    display_name: str = Field(
        ..., 
        description="Human-readable name for UI display",
        example="HTTP API Source"
    )
    description: str = Field(
        ..., 
        description="Detailed description of the node type",
        example="Fetches data from a HTTP/HTTPS API endpoint"
    )
    category: NodeCategory = Field(
        ..., 
        description="Top-level category of the node",
        example=NodeCategory.SOURCE
    )
    subcategory: NodeSubcategory = Field(
        ..., 
        description="Subcategory for more specific classification",
        example=NodeSubcategory.API_SOURCE
    )
    icon: str = Field(
        ..., 
        description="Icon identifier for UI display",
        example="api_icon"
    )
    color: Optional[str] = Field(
        None, 
        description="Color code for UI theming",
        example="#4287f5"
    )
    input_ports: List[Port] = Field(
        default_factory=list, 
        description="Input ports for receiving data",
        example=[
            {
                "id": "trigger",
                "display_name": "Trigger",
                "description": "Execution trigger input",
                "data_type": "any",
                "required": False
            }
        ]
    )
    output_ports: List[Port] = Field(
        default_factory=list, 
        description="Output ports for sending data",
        example=[
            {
                "id": "data_output",
                "display_name": "Data Output",
                "description": "API response data",
                "data_type": "object"
            }
        ]
    )
    parameters: List[NodeParameter] = Field(
        default_factory=list, 
        description="Configuration parameters for the node",
        example=[
            {
                "name": "url",
                "display_name": "API URL",
                "description": "The URL to fetch data from",
                "type": "string",
                "required": True
            }
        ]
    )
    capabilities: List[NodeCapability] = Field(
        default_factory=list, 
        description="Capabilities provided by this node type",
        example=[
            {
                "type": "data_fetching",
                "description": "Fetches data from external APIs",
                "properties": {
                    "methods": ["GET", "POST"]
                }
            }
        ]
    )
    tags: List[str] = Field(
        default_factory=list, 
        description="Tags for categorization and search",
        example=["api", "http", "source", "rest"]
    )
    documentation_url: Optional[HttpUrl] = Field(
        None, 
        description="URL to detailed documentation",
        example="https://docs.example.com/nodes/http-api-source"
    )
    minimum_permission: NodePermission = Field(
        NodePermission.STANDARD_USER, 
        description="Minimum permission level required to use this node",
        example=NodePermission.STANDARD_USER
    )
    enabled: bool = Field(
        True, 
        description="Whether this node type is currently enabled",
        example=True
    )
    experimental: bool = Field(
        False, 
        description="Whether this node type is experimental",
        example=False
    )
    deprecated: bool = Field(
        False, 
        description="Whether this node type is deprecated",
        example=False
    )
    deprecation_message: Optional[str] = Field(
        None, 
        description="Message shown when using deprecated nodes",
        example="This node will be removed in version 2.0. Use HTTPSSource instead."
    )

class NodeDependency(BaseModel):
    """Dependency requirements for a node type"""
    node_type_id: str = Field(
        ..., 
        description="ID of the node type that is required",
        example="oauth_authentication"
    )
    version_constraint: str = Field(
        "*", 
        description="Semantic version constraint",
        example=">=1.0.0, <2.0.0"
    )
    required: bool = Field(
        True, 
        description="Whether this dependency is required",
        example=True
    )

class ConnectionDefinition(BaseModel):
    """Definition of the valid connections for a node type"""
    allowed_sources: Optional[List[str]] = Field(
        None, 
        description="Source node types that can connect to this node",
        example=["http_api_source", "file_source"]
    )
    allowed_destinations: Optional[List[str]] = Field(
        None, 
        description="Destination node types this node can connect to",
        example=["json_transform", "data_mapper"]
    )
    forbidden_connections: Optional[List[Dict[str, str]]] = Field(
        None, 
        description="Explicitly forbidden connections",
        example=[
            {"from": "soap_api_source", "to": "binary_transform"}
        ]
    )

class NodeType(NodeTypeBase):
    """Complete node type definition with system fields"""
    id: str = Field(
        ..., 
        description="Unique internal identifier",
        example="node_f83c724a-8b34-4f35-b531-58434fa6a569"
    )
    module_path: str = Field(
        ..., 
        description="Path to the module implementing this node",
        example="nodes.sources.http_api_source"
    )
    dependencies: List[NodeDependency] = Field(
        default_factory=list, 
        description="Dependencies on other node types",
        example=[
            {
                "node_type_id": "oauth_authentication",
                "version_constraint": ">=1.0.0, <2.0.0",
                "required": False
            }
        ]
    )
    connections: ConnectionDefinition = Field(
        default_factory=ConnectionDefinition, 
        description="Valid connection definitions for this node"
    )
    created_at: datetime = Field(
        ..., 
        description="When this node type was registered",
        example="2025-03-15T10:30:00Z"
    )
    updated_at: datetime = Field(
        ..., 
        description="When this node type was last updated",
        example="2025-03-30T14:45:00Z"
    )
    created_by: Optional[str] = Field(
        None, 
        description="ID of the user who created this node type",
        example="user-uuid-12345"
    )
```

## API Endpoints

### 1. Node Type Registry

#### GET /api/admin/nodes/registry

Retrieves all registered node types with filtering options.

##### Query Parameters
- `category` (optional): Filter by top-level category
- `subcategory` (optional): Filter by subcategory
- `tags` (optional): Filter by tags (comma-separated)
- `search` (optional): Text search in name and description
- `permissions` (optional): Filter by minimum permission level
- `include_disabled` (optional, default false): Whether to include disabled nodes
- `include_experimental` (optional, default false): Whether to include experimental nodes
- `include_deprecated` (optional, default false): Whether to include deprecated nodes

##### Response (200 OK)
```json
{
  "items": [
    {
      "id": "node_f83c724a-8b34-4f35-b531-58434fa6a569",
      "type_id": "http_api_source",
      "version": "1.0.0",
      "display_name": "HTTP API Source",
      "description": "Fetches data from a HTTP/HTTPS API endpoint",
      "category": "source",
      "subcategory": "api_source",
      "icon": "api_icon",
      "color": "#4287f5",
      "tags": ["api", "http", "source", "rest"],
      "minimum_permission": "standard_user",
      "enabled": true,
      "experimental": false,
      "deprecated": false,
      "input_ports": [
        {
          "id": "trigger",
          "display_name": "Trigger",
          "description": "Execution trigger input",
          "data_type": "any",
          "required": false,
          "multiple": false
        }
      ],
      "output_ports": [
        {
          "id": "data_output",
          "display_name": "Data Output",
          "description": "API response data",
          "data_type": "object",
          "required": true,
          "multiple": false
        }
      ],
      "capabilities": [
        {
          "type": "data_fetching",
          "description": "Fetches data from external APIs",
          "properties": {
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "supports_pagination": true,
            "supports_authentication": true
          }
        }
      ],
      "created_at": "2025-03-15T10:30:00Z",
      "updated_at": "2025-03-30T14:45:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

#### GET /api/admin/nodes/registry/{node_type_id}

Retrieves detailed information about a specific node type.

##### Response (200 OK)
```json
{
  "id": "node_f83c724a-8b34-4f35-b531-58434fa6a569",
  "type_id": "http_api_source",
  "version": "1.0.0",
  "display_name": "HTTP API Source",
  "description": "Fetches data from a HTTP/HTTPS API endpoint",
  "category": "source",
  "subcategory": "api_source",
  "icon": "api_icon",
  "color": "#4287f5",
  "input_ports": [
    {
      "id": "trigger",
      "display_name": "Trigger",
      "description": "Execution trigger input",
      "data_type": "any",
      "required": false,
      "multiple": false
    }
  ],
  "output_ports": [
    {
      "id": "data_output",
      "display_name": "Data Output",
      "description": "API response data",
      "data_type": "object",
      "required": true,
      "multiple": false,
      "schema": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "type": "object"
            }
          },
          "pagination": {
            "type": "object",
            "properties": {
              "next": { "type": "string" },
              "prev": { "type": "string" }
            }
          }
        }
      }
    }
  ],
  "parameters": [
    {
      "name": "url",
      "display_name": "API URL",
      "description": "The URL to fetch data from",
      "type": "string",
      "required": true,
      "pattern": "^https?://.+",
      "placeholder": "https://api.example.com/data",
      "help_text": "The complete URL including protocol (https://) and path"
    },
    {
      "name": "method",
      "display_name": "HTTP Method",
      "description": "The HTTP method to use for the request",
      "type": "enum",
      "required": true,
      "default_value": "GET",
      "enum_values": ["GET", "POST", "PUT", "DELETE"]
    },
    {
      "name": "headers",
      "display_name": "HTTP Headers",
      "description": "Headers to include in the request",
      "type": "object",
      "required": false,
      "advanced": true
    },
    {
      "name": "auth_type",
      "display_name": "Authentication Type",
      "description": "Authentication method to use",
      "type": "enum",
      "required": false,
      "enum_values": ["None", "Basic", "Bearer", "OAuth2"]
    },
    {
      "name": "username",
      "display_name": "Username",
      "description": "Username for Basic authentication",
      "type": "string",
      "required": false,
      "depends_on": {
        "auth_type": "Basic"
      }
    },
    {
      "name": "password",
      "display_name": "Password",
      "description": "Password for Basic authentication",
      "type": "string",
      "required": false,
      "depends_on": {
        "auth_type": "Basic"
      }
    }
  ],
  "capabilities": [
    {
      "type": "data_fetching",
      "description": "Fetches data from external APIs",
      "properties": {
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "supports_pagination": true,
        "supports_authentication": true
      }
    },
    {
      "type": "error_handling",
      "description": "Handles API errors and retries",
      "properties": {
        "retry_mechanism": true,
        "error_mapping": true
      }
    }
  ],
  "tags": ["api", "http", "source", "rest"],
  "documentation_url": "https://docs.example.com/nodes/http-api-source",
  "minimum_permission": "standard_user",
  "enabled": true,
  "experimental": false,
  "deprecated": false,
  "module_path": "nodes.sources.http_api_source",
  "dependencies": [
    {
      "node_type_id": "oauth_authentication",
      "version_constraint": ">=1.0.0, <2.0.0",
      "required": false
    }
  ],
  "connections": {
    "allowed_destinations": ["json_transform", "xml_transform", "data_mapper", "filter_node"],
    "forbidden_connections": [
      {"from": "http_api_source", "to": "binary_transform"}
    ]
  },
  "created_at": "2025-03-15T10:30:00Z",
  "updated_at": "2025-03-30T14:45:00Z",
  "created_by": "user-uuid-12345"
}
```

#### POST /api/admin/nodes/registry

Registers a new node type in the registry.

##### Request Body
```json
{
  "type_id": "json_transform",
  "version": "1.0.0",
  "display_name": "JSON Transformation",
  "description": "Transforms JSON data using JSONPath expressions",
  "category": "transform",
  "subcategory": "content_transformation",
  "icon": "json_transform_icon",
  "color": "#42f5a7",
  "input_ports": [
    {
      "id": "json_input",
      "display_name": "JSON Input",
      "description": "Input JSON data to transform",
      "data_type": "object",
      "required": true
    }
  ],
  "output_ports": [
    {
      "id": "transformed_output",
      "display_name": "Transformed Output",
      "description": "Transformed JSON data",
      "data_type": "object",
      "required": true
    }
  ],
  "parameters": [
    {
      "name": "transformations",
      "display_name": "Transformations",
      "description": "JSONPath transformations to apply",
      "type": "array",
      "required": true
    }
  ],
  "capabilities": [
    {
      "type": "json_transformation",
      "description": "Transforms JSON using JSONPath expressions",
      "properties": {
        "supports_expressions": true,
        "supports_templates": true
      }
    }
  ],
  "tags": ["json", "transform", "jsonpath"],
  "documentation_url": "https://docs.example.com/nodes/json-transform",
  "minimum_permission": "standard_user",
  "module_path": "nodes.transformations.json_transform",
  "dependencies": [],
  "connections": {
    "allowed_sources": ["http_api_source", "file_source", "database_source"],
    "allowed_destinations": ["data_mapper", "file_destination", "api_destination"]
  }
}
```

##### Response (201 Created)
```json
{
  "id": "node_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
  "type_id": "json_transform",
  "version": "1.0.0",
  "display_name": "JSON Transformation",
  "status": "registered",
  "created_at": "2025-03-30T16:45:00Z",
  "created_by": "user-uuid-12345"
}
```

#### PUT /api/admin/nodes/registry/{node_type_id}

Updates an existing node type.

##### Request Body
Similar to POST, with fields to update

##### Response (200 OK)
```json
{
  "id": "node_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
  "type_id": "json_transform",
  "version": "1.0.1",
  "display_name": "JSON Transformation",
  "status": "updated",
  "updated_at": "2025-03-30T17:00:00Z",
  "updated_by": "user-uuid-12345"
}
```

#### DELETE /api/admin/nodes/registry/{node_type_id}

Removes a node type from the registry.

##### Response (204 No Content)

### 2. Node Capability Discovery

#### GET /api/admin/nodes/capabilities

Retrieves all registered node capabilities with filtering options.

##### Query Parameters
- `type` (optional): Filter by capability type
- `category` (optional): Filter by node category
- `search` (optional): Text search in capability descriptions

##### Response (200 OK)
```json
{
  "capabilities": [
    {
      "type": "data_fetching",
      "description": "Fetches data from external sources",
      "node_types": [
        {
          "id": "node_f83c724a-8b34-4f35-b531-58434fa6a569",
          "type_id": "http_api_source",
          "display_name": "HTTP API Source",
          "category": "source",
          "properties": {
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "supports_pagination": true
          }
        },
        {
          "id": "node_b72e5d8a-6f1c-4a29-9e57-8d32f8c9a4e1",
          "type_id": "file_source",
          "display_name": "File Source",
          "category": "source",
          "properties": {
            "file_types": ["csv", "json", "xml"],
            "supports_compression": true
          }
        }
      ]
    },
    {
      "type": "json_transformation",
      "description": "Transforms JSON data",
      "node_types": [
        {
          "id": "node_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
          "type_id": "json_transform",
          "display_name": "JSON Transformation",
          "category": "transform",
          "properties": {
            "supports_expressions": true,
            "supports_templates": true
          }
        }
      ]
    }
  ],
  "total": 2
}
```

#### GET /api/admin/nodes/compatibility

Checks compatibility between node types for connection.

##### Query Parameters
- `source` (required): Source node type ID
- `destination` (required): Destination node type ID

##### Response (200 OK)
```json
{
  "source": {
    "id": "node_f83c724a-8b34-4f35-b531-58434fa6a569",
    "type_id": "http_api_source",
    "display_name": "HTTP API Source"
  },
  "destination": {
    "id": "node_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
    "type_id": "json_transform",
    "display_name": "JSON Transformation"
  },
  "compatible": true,
  "compatibility_details": {
    "data_type_compatible": true,
    "output_schema_compatible": true,
    "explicitly_allowed": true,
    "explicitly_forbidden": false
  },
  "recommended_configuration": {
    "port_mapping": [
      {
        "source_port": "data_output",
        "destination_port": "json_input"
      }
    ]
  }
}
```

### 3. Recommendations

#### GET /api/admin/nodes/recommendations

Provides recommendations for nodes based on context.

##### Query Parameters
- `context_node` (required): Node type ID to get recommendations for
- `position` (required): Whether to recommend nodes before or after (values: "before", "after")
- `flow_id` (optional): ID of the flow to consider for recommendations
- `limit` (optional, default 5): Maximum number of recommendations to return

##### Response (200 OK)
```json
{
  "context_node": {
    "id": "node_f83c724a-8b34-4f35-b531-58434fa6a569",
    "type_id": "http_api_source",
    "display_name": "HTTP API Source"
  },
  "position": "after",
  "recommendations": [
    {
      "node_type": {
        "id": "node_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
        "type_id": "json_transform",
        "display_name": "JSON Transformation"
      },
      "score": 0.95,
      "reason": "Common pattern: HTTP API Source often outputs JSON that needs transformation",
      "usage_frequency": "very_high"
    },
    {
      "node_type": {
        "id": "node_c5f89e2b-1d3a-4b67-9c8f-e3a6f4d7b28c",
        "type_id": "filter_node",
        "display_name": "Data Filter"
      },
      "score": 0.85,
      "reason": "Filtering API response data is a common requirement",
      "usage_frequency": "high"
    },
    {
      "node_type": {
        "id": "node_d47e1f3a-2b6c-4d59-8a7e-f9b5c8d7e6a5",
        "type_id": "data_mapper",
        "display_name": "Field Mapper"
      },
      "score": 0.8,
      "reason": "Mapping fields is often needed after fetching API data",
      "usage_frequency": "high"
    }
  ]
}
```

## Database Schema

### 1. node_types
Main table for node type definitions:
- `id`: Primary key
- `type_id`: Unique identifier for the node type
- `version`: Semantic version string
- `display_name`: Human-readable name
- `description`: Detailed description
- `category`: Top-level category
- `subcategory`: Subcategory
- `icon`: Icon identifier
- `color`: Color code
- `module_path`: Path to implementation module
- `minimum_permission`: Minimum permission level required
- `enabled`: Whether the node is enabled
- `experimental`: Whether the node is experimental
- `deprecated`: Whether the node is deprecated
- `deprecation_message`: Message for deprecated nodes
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `created_by`: User ID who created the node type

### 2. node_ports
Table for input and output ports:
- `id`: Primary key
- `node_type_id`: Foreign key to node_types
- `port_id`: Port identifier
- `port_type`: "input" or "output"
- `display_name`: Human-readable name
- `description`: Detailed description
- `data_type`: Data type
- `schema`: JSON Schema (JSONB)
- `required`: Whether the port is required
- `multiple`: Whether multiple connections are allowed

### 3. node_parameters
Table for node configuration parameters:
- `id`: Primary key
- `node_type_id`: Foreign key to node_types
- `name`: Parameter name
- `display_name`: Human-readable name
- `description`: Detailed description
- `type`: Parameter type
- `required`: Whether the parameter is required
- `default_value`: Default value (JSONB)
- `enum_values`: Possible values for enums (JSONB array)
- `pattern`: Regex pattern
- `minimum`: Minimum value
- `maximum`: Maximum value
- `advanced`: Whether this is an advanced parameter
- `depends_on`: Dependency conditions (JSONB)
- `placeholder`: Placeholder text
- `help_text`: Additional help text

### 4. node_capabilities
Table for node capabilities:
- `id`: Primary key
- `node_type_id`: Foreign key to node_types
- `type`: Capability type
- `description`: Detailed description
- `properties`: Additional properties (JSONB)

### 5. node_dependencies
Table for node dependencies:
- `id`: Primary key
- `node_type_id`: Foreign key to node_types
- `dependency_node_type_id`: Foreign key to node_types
- `version_constraint`: Semantic version constraint
- `required`: Whether the dependency is required

### 6. node_connections
Table for connection definitions:
- `id`: Primary key
- `node_type_id`: Foreign key to node_types
- `connection_type`: "allowed_source", "allowed_destination", or "forbidden"
- `target_node_type_id`: Foreign key to node_types

### 7. node_tags
Table for node tags:
- `id`: Primary key
- `node_type_id`: Foreign key to node_types
- `tag`: Tag string

## Plugin System

The Node Registry API is built on a plugin system that allows for dynamic discovery and registration of node types:

### Plugin Interface

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List

class NodePlugin(ABC):
    """Base class for node plugins"""
    
    @abstractmethod
    def get_node_type(self) -> Dict[str, Any]:
        """
        Returns the node type definition
        
        Returns:
            Dict containing the complete node type definition
        """
        pass
    
    @abstractmethod
    def get_capabilities(self) -> List[Dict[str, Any]]:
        """
        Returns the capabilities provided by this node
        
        Returns:
            List of capability definitions
        """
        pass
    
    @abstractmethod
    def get_schema(self) -> Dict[str, Any]:
        """
        Returns the configuration schema for this node
        
        Returns:
            JSON Schema definition for the node's configuration
        """
        pass
    
    @abstractmethod
    def execute(self, inputs: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the node logic
        
        Args:
            inputs: Dictionary of input values keyed by port ID
            config: Node configuration
            
        Returns:
            Dictionary of output values keyed by port ID
        """
        pass
```

### Plugin Registration

Plugins are registered automatically on startup:

```python
class PluginRegistry:
    """Registry for node plugins"""
    
    def __init__(self):
        self.plugins = {}
        
    def discover_plugins(self, plugin_directories: List[str]):
        """
        Discovers and registers plugins from specified directories
        
        Args:
            plugin_directories: List of directories to search for plugins
        """
        for directory in plugin_directories:
            self._discover_in_directory(directory)
    
    def _discover_in_directory(self, directory: str):
        """
        Discovers plugins in a specific directory
        
        Args:
            directory: Directory to search
        """
        # Implementation would walk directory, import modules,
        # and register discovered plugins
        pass
    
    def register_plugin(self, plugin: NodePlugin):
        """
        Registers a plugin in the registry
        
        Args:
            plugin: Plugin instance to register
        """
        node_type = plugin.get_node_type()
        self.plugins[node_type["type_id"]] = plugin
        
        # Register node type in database
        self._register_node_type(node_type, plugin)
    
    def _register_node_type(self, node_type: Dict[str, Any], plugin: NodePlugin):
        """
        Registers a node type in the database
        
        Args:
            node_type: Node type definition
            plugin: Plugin instance
        """
        # Implementation would store node type in database,
        # along with ports, parameters, capabilities, etc.
        pass
```

## Benefits of This Approach

1. **Dynamic Discovery**
   - Node types are discovered and registered automatically
   - New capabilities can be added without modifying core code
   - Plugins can be developed independently

2. **Rich Metadata**
   - Comprehensive documentation for each node type
   - Detailed parameter validation and UI hints
   - Clear visualization of node capabilities

3. **Intelligent Recommendations**
   - Context-aware suggestions for node connections
   - Pattern-based recommendations from usage analytics
   - Personalized suggestions based on user history

4. **Strong Validation**
   - Schema-based validation for configuration
   - Compatibility checking for connections
   - Data type validation for inputs and outputs

5. **Extensibility**
   - Open plugin architecture for custom nodes
   - Standardized interface for consistent behavior
   - Versioning support for backward compatibility

6. **Developer Experience**
   - Clear documentation of node capabilities
   - Standardized parameter definitions
   - Consistent validation rules

This Node Registry API provides a robust foundation for the flow canvas, enabling dynamic discovery of capabilities, intelligent recommendations, and a comprehensive plugin system that makes the platform easily extensible.