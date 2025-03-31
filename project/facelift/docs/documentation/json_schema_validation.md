# JSON Schema Validation for Configuration

This document outlines the design for implementing standardized JSON Schema validation for configuration schemas across the TAP Integration Platform.

## Overview

The JSON Schema validation system provides a consistent approach to defining, validating, and documenting configuration schemas for applications, integrations, nodes, and all other configurable components in the platform. This ensures high-quality configuration data with strong validation, comprehensive documentation, and consistent error messaging.

## Core Architecture

The JSON Schema validation system is built around a central schema registry that manages schemas for all configurable components:

```
┌───────────────────────────────────────────────────────────┐
│                    Schema Registry                         │
├───────────────────────────────────────────────────────────┤
│                    Schema Manager                          │
├─────────────┬──────────────┬───────────────┬──────────────┤
│ Schema      │ Validation   │ Schema        │ Documentation │
│ Repository  │ Engine       │ Versioning    │ Generator     │
└─────────────┴──────────────┴───────────────┴──────────────┘
         ▲              ▲              ▲             ▲
         │              │              │             │
┌────────┴──────────────┴──────────────┴─────────────┴─────┐
│                   Platform Components                     │
├─────────────┬──────────────┬───────────────┬─────────────┤
│ Node        │ Application  │ Integration   │ Data        │
│ Types       │ Definitions  │ Configurations│ Connections │
└─────────────┴──────────────┴───────────────┴─────────────┘
```

## Schema Management

### Defining Schemas

Schemas are defined using JSON Schema (draft-07+) with enhanced metadata for improved documentation and user experience. Each schema includes:

1. Core validation rules
2. Human-readable descriptions
3. Examples and defaults
4. UI rendering hints
5. Dependency rules
6. Conditional validation

### Schema Versioning

All schemas are versioned with:

1. Semantic version numbers (MAJOR.MINOR.PATCH)
2. Compatibility information
3. Schema evolution history
4. Migration paths for version transitions

### Schema Registration

Schemas are registered with:

1. Unique identifier
2. Namespace
3. Component association
4. Access control rules
5. Metadata for discovery

## Data Models

### SchemaDefinition

```python
from enum import Enum
from typing import Dict, List, Optional, Any, Set, Union
from datetime import datetime
from pydantic import BaseModel, Field, validator

class SchemaType(str, Enum):
    """Types of schema definitions"""
    NODE_CONFIG = "node_config"
    APPLICATION_CONFIG = "application_config"
    INTEGRATION_CONFIG = "integration_config"
    CONNECTION_CONFIG = "connection_config"
    DATA_MODEL = "data_model"
    USER_PREFERENCE = "user_preference"
    SYSTEM_CONFIG = "system_config"

class CompatibilityLevel(str, Enum):
    """Compatibility levels for schema versions"""
    BACKWARD = "backward"        # New schema can read old data
    FORWARD = "forward"          # Old schema can read new data
    FULL = "full"                # Both backward and forward
    NONE = "none"                # No compatibility guarantees

class SchemaDefinition(BaseModel):
    """Definition of a JSON Schema with metadata"""
    id: str = Field(
        ..., 
        description="Unique identifier for the schema",
        example="schema_f83c724a-8b34-4f35-b531-58434fa6a569"
    )
    name: str = Field(
        ..., 
        description="Human-readable name",
        example="HTTP API Source Configuration"
    )
    namespace: str = Field(
        ..., 
        description="Namespace for organizing schemas",
        example="nodes.sources.http_api"
    )
    component_id: str = Field(
        ..., 
        description="ID of the component this schema belongs to",
        example="http_api_source"
    )
    schema_type: SchemaType = Field(
        ..., 
        description="Type of schema",
        example=SchemaType.NODE_CONFIG
    )
    version: str = Field(
        ..., 
        description="Semantic version of the schema",
        example="1.0.0"
    )
    compatibility: CompatibilityLevel = Field(
        CompatibilityLevel.BACKWARD, 
        description="Compatibility level with previous versions",
        example=CompatibilityLevel.BACKWARD
    )
    schema: Dict[str, Any] = Field(
        ..., 
        description="JSON Schema definition",
        example={
            "type": "object",
            "required": ["url", "method"],
            "properties": {
                "url": {
                    "type": "string",
                    "format": "uri",
                    "description": "API endpoint URL"
                },
                "method": {
                    "type": "string",
                    "enum": ["GET", "POST", "PUT", "DELETE"],
                    "default": "GET",
                    "description": "HTTP method to use"
                }
            }
        }
    )
    ui_schema: Optional[Dict[str, Any]] = Field(
        None, 
        description="UI rendering hints for form generation",
        example={
            "url": {
                "ui:placeholder": "https://api.example.com/data",
                "ui:autofocus": True
            },
            "method": {
                "ui:widget": "radio"
            }
        }
    )
    examples: List[Dict[str, Any]] = Field(
        default_factory=list, 
        description="Example valid configurations",
        example=[
            {
                "url": "https://api.example.com/data",
                "method": "GET"
            }
        ]
    )
    created_at: datetime = Field(
        ..., 
        description="When the schema was created",
        example="2025-03-15T10:30:00Z"
    )
    updated_at: datetime = Field(
        ..., 
        description="When the schema was last updated",
        example="2025-03-30T14:45:00Z"
    )
    created_by: Optional[str] = Field(
        None, 
        description="ID of the user who created this schema",
        example="user-uuid-12345"
    )
    
    @validator('schema')
    def validate_schema_format(cls, v):
        """Validate that the schema is a valid JSON Schema"""
        # Basic JSON Schema validation would happen here
        # In a real implementation, this would use a JSON Schema validator
        required_fields = ['type']
        for field in required_fields:
            if field not in v:
                raise ValueError(f"Schema must include '{field}' field")
        return v

class SchemaValidationResult(BaseModel):
    """Result of validating data against a schema"""
    valid: bool = Field(
        ..., 
        description="Whether the data is valid",
        example=True
    )
    errors: List[Dict[str, Any]] = Field(
        default_factory=list, 
        description="Validation errors if invalid",
        example=[
            {
                "path": "/url",
                "message": "Required property 'url' is missing",
                "schema_path": "#/required/0"
            }
        ]
    )
    schema_id: str = Field(
        ..., 
        description="ID of the schema used for validation",
        example="schema_f83c724a-8b34-4f35-b531-58434fa6a569"
    )
    schema_version: str = Field(
        ..., 
        description="Version of the schema used for validation",
        example="1.0.0"
    )
```

### SchemaDiff

```python
class ChangeType(str, Enum):
    """Types of schema changes"""
    ADDED = "added"
    REMOVED = "removed"
    MODIFIED = "modified"
    
class BreakingChangeLevel(str, Enum):
    """Severity levels for breaking changes"""
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class SchemaChangeEntry(BaseModel):
    """Entry for a change between schema versions"""
    path: str = Field(
        ..., 
        description="JSON path to the changed element",
        example="/properties/url/format"
    )
    change_type: ChangeType = Field(
        ..., 
        description="Type of change",
        example=ChangeType.ADDED
    )
    old_value: Optional[Any] = Field(
        None, 
        description="Previous value (if modified)",
        example=None
    )
    new_value: Optional[Any] = Field(
        None, 
        description="New value (if added or modified)",
        example="uri"
    )
    breaking: bool = Field(
        False, 
        description="Whether this is a breaking change",
        example=False
    )
    breaking_level: BreakingChangeLevel = Field(
        BreakingChangeLevel.NONE, 
        description="Severity level of breaking change",
        example=BreakingChangeLevel.NONE
    )
    description: Optional[str] = Field(
        None, 
        description="Human-readable description of the change",
        example="Added URI format validation for URL field"
    )

class SchemaDiff(BaseModel):
    """Comparison between schema versions"""
    schema_id: str = Field(
        ..., 
        description="Schema identifier",
        example="schema_f83c724a-8b34-4f35-b531-58434fa6a569"
    )
    from_version: str = Field(
        ..., 
        description="Base version for comparison",
        example="1.0.0"
    )
    to_version: str = Field(
        ..., 
        description="Target version for comparison",
        example="1.1.0"
    )
    changes: List[SchemaChangeEntry] = Field(
        ..., 
        description="List of changes between versions",
        example=[
            {
                "path": "/properties/url/format",
                "change_type": "added",
                "new_value": "uri",
                "breaking": False,
                "breaking_level": "none",
                "description": "Added URI format validation for URL field"
            }
        ]
    )
    has_breaking_changes: bool = Field(
        ..., 
        description="Whether there are breaking changes",
        example=False
    )
    compatibility_assessment: CompatibilityLevel = Field(
        ..., 
        description="Assessed compatibility level",
        example=CompatibilityLevel.BACKWARD
    )
    summary: str = Field(
        ..., 
        description="Human-readable summary of changes",
        example="Added format validation for URL field"
    )
```

## API Endpoints

### 1. Schema Registry Management

#### GET /api/admin/schemas

Retrieves all registered schemas with optional filtering.

##### Query Parameters
- `namespace`: Filter by namespace
- `schema_type`: Filter by schema type
- `component_id`: Filter by component ID
- `search`: Text search in name and description

##### Response (200 OK)
```json
{
  "items": [
    {
      "id": "schema_f83c724a-8b34-4f35-b531-58434fa6a569",
      "name": "HTTP API Source Configuration",
      "namespace": "nodes.sources.http_api",
      "component_id": "http_api_source",
      "schema_type": "node_config",
      "version": "1.0.0",
      "compatibility": "backward",
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

#### GET /api/admin/schemas/{schema_id}

Retrieves a specific schema by ID.

##### Query Parameters
- `version`: Specific version to retrieve (defaults to latest)

##### Response (200 OK)
```json
{
  "id": "schema_f83c724a-8b34-4f35-b531-58434fa6a569",
  "name": "HTTP API Source Configuration",
  "namespace": "nodes.sources.http_api",
  "component_id": "http_api_source",
  "schema_type": "node_config",
  "version": "1.0.0",
  "compatibility": "backward",
  "schema": {
    "type": "object",
    "required": ["url", "method"],
    "properties": {
      "url": {
        "type": "string",
        "format": "uri",
        "description": "API endpoint URL"
      },
      "method": {
        "type": "string",
        "enum": ["GET", "POST", "PUT", "DELETE"],
        "default": "GET",
        "description": "HTTP method to use"
      }
    }
  },
  "ui_schema": {
    "url": {
      "ui:placeholder": "https://api.example.com/data",
      "ui:autofocus": true
    },
    "method": {
      "ui:widget": "radio"
    }
  },
  "examples": [
    {
      "url": "https://api.example.com/data",
      "method": "GET"
    }
  ],
  "created_at": "2025-03-15T10:30:00Z",
  "updated_at": "2025-03-30T14:45:00Z",
  "created_by": "user-uuid-12345"
}
```

#### POST /api/admin/schemas

Registers a new schema.

##### Request Body
```json
{
  "name": "JSON Transform Configuration",
  "namespace": "nodes.transformations.json_transform",
  "component_id": "json_transform",
  "schema_type": "node_config",
  "version": "1.0.0",
  "compatibility": "backward",
  "schema": {
    "type": "object",
    "required": ["transformations"],
    "properties": {
      "transformations": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["path", "value"],
          "properties": {
            "path": {
              "type": "string",
              "description": "JSONPath expression to target"
            },
            "value": {
              "type": "string",
              "description": "Value or expression to set"
            }
          }
        },
        "description": "List of transformation operations"
      }
    }
  },
  "ui_schema": {
    "transformations": {
      "ui:options": {
        "orderable": true,
        "addable": true,
        "removable": true
      }
    }
  },
  "examples": [
    {
      "transformations": [
        {
          "path": "$.name",
          "value": "New Name"
        }
      ]
    }
  ]
}
```

##### Response (201 Created)
```json
{
  "id": "schema_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
  "name": "JSON Transform Configuration",
  "namespace": "nodes.transformations.json_transform",
  "component_id": "json_transform",
  "schema_type": "node_config",
  "version": "1.0.0",
  "created_at": "2025-03-30T18:00:00Z",
  "created_by": "admin-user-uuid-67890"
}
```

#### PUT /api/admin/schemas/{schema_id}/versions

Creates a new version of an existing schema.

##### Request Body
```json
{
  "version": "1.1.0",
  "compatibility": "backward",
  "schema": {
    "type": "object",
    "required": ["transformations"],
    "properties": {
      "transformations": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["path", "value"],
          "properties": {
            "path": {
              "type": "string",
              "description": "JSONPath expression to target"
            },
            "value": {
              "type": "string",
              "description": "Value or expression to set"
            },
            "condition": {
              "type": "string",
              "description": "Condition for applying transformation"
            }
          }
        },
        "description": "List of transformation operations"
      }
    }
  },
  "ui_schema": {
    "transformations": {
      "ui:options": {
        "orderable": true,
        "addable": true,
        "removable": true
      }
    }
  },
  "change_description": "Added optional condition field for conditional transformations"
}
```

##### Response (201 Created)
```json
{
  "id": "schema_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
  "name": "JSON Transform Configuration",
  "version": "1.1.0",
  "compatibility": "backward",
  "compatibility_verified": true,
  "breaking_changes": false,
  "created_at": "2025-03-30T18:15:00Z",
  "created_by": "admin-user-uuid-67890",
  "change_summary": "Added optional condition field for conditional transformations"
}
```

#### DELETE /api/admin/schemas/{schema_id}/versions/{version}

Deletes a specific version of a schema.

##### Response (204 No Content)

### 2. Schema Validation

#### POST /api/schemas/validate

Validates data against a schema.

##### Request Body
```json
{
  "schema_id": "schema_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
  "version": "1.1.0",
  "data": {
    "transformations": [
      {
        "path": "$.name",
        "value": "New Name",
        "condition": "$.enabled === true"
      }
    ]
  }
}
```

##### Response (200 OK)
```json
{
  "valid": true,
  "schema_id": "schema_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
  "schema_version": "1.1.0"
}
```

##### Response (400 Bad Request - Invalid Data)
```json
{
  "valid": false,
  "schema_id": "schema_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
  "schema_version": "1.1.0",
  "errors": [
    {
      "path": "/transformations/0",
      "message": "Required property 'path' is missing",
      "schema_path": "#/properties/transformations/items/required/0"
    }
  ]
}
```

### 3. Schema Analysis

#### GET /api/admin/schemas/{schema_id}/versions/diff

Compares two versions of a schema.

##### Query Parameters
- `from_version`: Base version for comparison
- `to_version`: Target version for comparison

##### Response (200 OK)
```json
{
  "schema_id": "schema_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
  "from_version": "1.0.0",
  "to_version": "1.1.0",
  "changes": [
    {
      "path": "/properties/transformations/items/properties/condition",
      "change_type": "added",
      "new_value": {
        "type": "string",
        "description": "Condition for applying transformation"
      },
      "breaking": false,
      "breaking_level": "none",
      "description": "Added optional condition field for conditional transformations"
    }
  ],
  "has_breaking_changes": false,
  "compatibility_assessment": "backward",
  "summary": "Added optional condition field for conditional transformations"
}
```

#### GET /api/admin/schemas/{schema_id}/compatibility

Checks compatibility between schema versions.

##### Query Parameters
- `from_version`: Base version for comparison
- `to_version`: Target version for comparison

##### Response (200 OK)
```json
{
  "schema_id": "schema_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
  "from_version": "1.0.0",
  "to_version": "1.1.0",
  "compatibility": "backward",
  "is_compatible": true,
  "breaking_changes": [],
  "compatibility_details": {
    "can_read_old_data": true,
    "can_write_old_data": true,
    "can_read_new_data": false,
    "can_write_new_data": false
  },
  "migration_required": false
}
```

### 4. Schema Documentation

#### GET /api/admin/schemas/{schema_id}/documentation

Generates documentation for a schema.

##### Query Parameters
- `version`: Schema version to document
- `format`: Output format (html, markdown, json)

##### Response (200 OK)
```json
{
  "schema_id": "schema_a68d9b4c-3e7c-4f38-b76d-fd1a912b0f92",
  "version": "1.1.0",
  "name": "JSON Transform Configuration",
  "namespace": "nodes.transformations.json_transform",
  "documentation": {
    "title": "JSON Transform Configuration",
    "description": "Configuration schema for JSON transformation node",
    "properties": [
      {
        "name": "transformations",
        "type": "array",
        "required": true,
        "description": "List of transformation operations",
        "children": [
          {
            "name": "path",
            "type": "string",
            "required": true,
            "description": "JSONPath expression to target"
          },
          {
            "name": "value",
            "type": "string",
            "required": true,
            "description": "Value or expression to set"
          },
          {
            "name": "condition",
            "type": "string",
            "required": false,
            "description": "Condition for applying transformation"
          }
        ]
      }
    ],
    "examples": [
      {
        "transformations": [
          {
            "path": "$.name",
            "value": "New Name"
          }
        ]
      }
    ]
  },
  "format": "json"
}
```

## Database Schema

### 1. schemas
Table for schema definitions:
- `id`: Primary key
- `name`: Schema name
- `namespace`: Namespace
- `component_id`: ID of the component
- `schema_type`: Type of schema
- `created_at`: Creation timestamp
- `created_by`: User ID who created the schema

### 2. schema_versions
Table for schema versions:
- `id`: Primary key
- `schema_id`: Foreign key to schemas table
- `version`: Semantic version string
- `compatibility`: Compatibility level
- `schema`: Schema definition (JSONB)
- `ui_schema`: UI schema (JSONB, nullable)
- `created_at`: Creation timestamp
- `created_by`: User ID who created the version
- `change_description`: Description of changes from previous version

### 3. schema_examples
Table for schema examples:
- `id`: Primary key
- `schema_id`: Foreign key to schemas table
- `schema_version`: Version string
- `example_data`: Example data (JSONB)
- `description`: Example description (nullable)

### 4. schema_usage
Table for tracking schema usage:
- `id`: Primary key
- `schema_id`: Foreign key to schemas table
- `schema_version`: Version string
- `component_instance_id`: ID of component instance using the schema
- `first_used_at`: First usage timestamp
- `last_used_at`: Last usage timestamp

## Schema Validation Process

The schema validation process involves:

1. **Registration**: All components register their configuration schemas
2. **Validation**: Configuration data is validated against schemas
3. **Evolution**: Schemas evolve with version tracking and compatibility checking
4. **Documentation**: Schemas generate documentation automatically

### Configuration Validation Flow

```
┌─────────────────┐       ┌─────────────────┐        ┌─────────────────┐
│                 │       │                 │        │                 │
│ Component       │──────▶│ Schema Registry │◀──────▶│ Configuration   │
│ Registration    │       │ Lookup          │        │ Validation      │
│                 │       │                 │        │                 │
└─────────────────┘       └─────────────────┘        └─────────────────┘
                                   │                         │
                                   ▼                         ▼
                          ┌─────────────────┐        ┌─────────────────┐
                          │                 │        │                 │
                          │ Schema          │        │ Error           │
                          │ Versioning      │        │ Handling        │
                          │                 │        │                 │
                          └─────────────────┘        └─────────────────┘
```

## Configuration UI Integration

The JSON Schema validation system integrates with the UI through:

1. **Form Generation**: Schemas generate forms automatically
2. **Validation Feedback**: Real-time validation with error messages
3. **Documentation**: Inline help and tooltips
4. **Defaults and Examples**: Smart defaults and examples for users

### Form Generation Example

```javascript
// Frontend code that uses schema to generate configuration form
function SchemaForm({ schemaId, version, onSubmit }) {
  const [schema, setSchema] = useState(null);
  const [uiSchema, setUiSchema] = useState(null);
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    // Fetch schema from API
    api.getSchema(schemaId, version).then(response => {
      setSchema(response.schema);
      setUiSchema(response.ui_schema);
    });
  }, [schemaId, version]);
  
  const handleSubmit = async (data) => {
    // Validate against schema on server
    const validationResult = await api.validateAgainstSchema(schemaId, version, data);
    
    if (validationResult.valid) {
      onSubmit(data);
    } else {
      // Display validation errors
      console.error(validationResult.errors);
    }
  };
  
  if (!schema) return <Loading />;
  
  return (
    <JsonSchemaForm
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      onChange={setFormData}
      onSubmit={handleSubmit}
    />
  );
}
```

## Schema Evolution Strategy

The schema evolution strategy involves:

1. **Versioning**: Every schema has explicit versions
2. **Compatibility Checking**: Automated checks for backward/forward compatibility
3. **Migration Paths**: Clear paths for data migration between incompatible versions
4. **Tracking Changes**: Documenting all schema changes

### Compatibility Rules

The system enforces these compatibility rules:

1. **Backward Compatibility**:
   - Can add optional fields
   - Cannot remove required fields
   - Cannot change field types
   - Cannot make optional fields required

2. **Forward Compatibility**:
   - Cannot add required fields
   - Can remove optional fields
   - Cannot change field types
   - Cannot restrict field validation more than before

## Benefits of This Approach

1. **Consistent Validation**
   - Uniform validation across all components
   - Strong schema-based contracts
   - Comprehensive error reporting

2. **Self-Documenting Configurations**
   - Schemas generate documentation
   - Clear type information
   - Examples and usage guidance

3. **Streamlined UI Generation**
   - Forms built directly from schemas
   - Validation tied to schema
   - Consistent user experience

4. **Robust Schema Evolution**
   - Explicit versioning
   - Compatibility checking
   - Change management

5. **Standardized Integration**
   - Common language for component configuration
   - Pluggable architecture for new components
   - Consistent developer experience

This JSON Schema validation system provides a robust foundation for all configuration in the TAP Integration Platform, ensuring consistency, reliability, and a superior user experience when configuring complex components.