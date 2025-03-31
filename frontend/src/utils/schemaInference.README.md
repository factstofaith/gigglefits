# Schema Inference Utility

This utility provides comprehensive schema inference capabilities for automatically detecting data types, structure, and constraints from datasets. It analyzes data samples to determine field types with confidence scoring, identifies primary key candidates, and generates detailed statistics about the data.

## Core Features

- **Comprehensive Type Detection**: Automatically identifies basic types (string, number, boolean) and specialized types (email, URL, date, currency, etc.)
- **Confidence Scoring**: Provides confidence levels for each type inference with alternative type suggestions
- **Field Statistics**: Calculates detailed statistics about each field (min/max values, averages, distributions, etc.)
- **Primary Key Detection**: Identifies potential primary key fields based on uniqueness and completeness
- **Schema Export**: Converts inferred schema to standard formats like JSON Schema
- **Customizable Inference**: Configurable sample size, confidence thresholds, and detection options

## Usage

### Basic Usage

```jsx
import { inferSchema } from './utils/schemaInference';

// Sample data
const data = [
  { id: 1, name: 'John', email: 'john@example.com', age: 25 },
  { id: 2, name: 'Jane', email: 'jane@example.com', age: 30 }
];

// Infer schema from data
const schema = inferSchema(data);

console.log(schema);
```

### Configuration Options

The `inferSchema` function accepts several options to customize the inference process:

```jsx
const schema = inferSchema(data, {
  sampleSize: 1000,                        // Number of records to sample
  confidenceThreshold: 0.7,                // Minimum confidence threshold (0-1)
  detectSpecialTypes: true,                // Whether to detect special types
  includeStatistics: true                  // Whether to include field statistics
});
```

### Schema Format

The inferred schema includes the following information for each field:

```js
{
  fields: [
    {
      name: 'id',                           // Field name
      type: 'integer',                      // Detected type
      confidence: 0.95,                     // Confidence level (0-1)
      required: true,                       // Whether the field is required
      nullable: false,                      // Whether the field allows null values
      cardinality: 'high',                  // Cardinality type (high, medium, low)
      isPrimaryKeyCandidate: true,          // Whether the field might be a primary key
      alternativeTypes: [                   // Alternative type possibilities
        { type: 'id', confidence: 0.85 }
      ],
      statistics: {                         // Field statistics (if enabled)
        count: 2,                           // Total number of values
        nonNullCount: 2,                    // Number of non-null values
        nullPercentage: 0,                  // Percentage of null values
        uniqueCount: 2,                     // Number of unique values
        min: 1,                             // Minimum value (numeric fields)
        max: 2,                             // Maximum value (numeric fields)
        avg: 1.5                            // Average value (numeric fields)
        // Additional type-specific statistics
      }
    },
    // Other fields...
  ],
  recordCount: 2,                           // Total number of records
  sampledRecordCount: 2,                    // Number of records sampled
  generatedAt: '2023-05-25T12:34:56.789Z',  // Timestamp of generation
  hasCompleteSchema: true                   // Whether the schema is complete
}
```

### Converting to JSON Schema

To convert the inferred schema to a standard JSON Schema format:

```jsx
import { inferSchema, convertToSchemaDefinition } from './utils/schemaInference';

const inferredSchema = inferSchema(data);
const jsonSchema = convertToSchemaDefinition(inferredSchema, {
  requiredByDefault: false,
  format: 'jsonSchema'
});

console.log(jsonSchema);
```

### Getting a Human-Readable Description

For a human-readable description of the schema:

```jsx
import { inferSchema, getSchemaDescription } from './utils/schemaInference';

const inferredSchema = inferSchema(data);
const description = getSchemaDescription(inferredSchema);

console.log(description);
```

## Components

The schema inference system includes the following components:

1. **SchemaInferenceViewer**: A React component for displaying and editing inferred schema
2. **SchemaInference Utility**: Core functions for schema inference and conversion
3. **DataPreview Integration**: Enhanced DataPreview component with schema inference capabilities

## Supported Data Types

The utility can detect the following data types:

- **Basic Types**: string, number, integer, boolean, array, object, null
- **Date & Time**: date, datetime, time
- **Specialized String Types**: email, url, ip_address, phone_number, postal_code
- **Numeric Types**: currency, percentage
- **Identifiers**: id (specialized identification fields)

## Best Practices

1. **Sample Size**: For large datasets, use a reasonable sample size (1000-5000 records) to balance accuracy and performance
2. **Confidence Thresholds**: Adjust confidence thresholds based on your data quality needs
3. **Validation**: Use the inferred schema as a starting point, but validate and adjust as needed
4. **Schema Maintenance**: Re-infer schema periodically as your data evolves
5. **Type Detection**: Enable specialized type detection for richer schema information

## Integration with DataPreview

The schema inference functionality is fully integrated with the DataPreview component, providing a seamless user experience:

```jsx
<DataPreview
  data={data}
  showSchemaInference={true}
  onSchemaInferred={(schema) => {
    console.log('Inferred schema:', schema);
    // Use the inferred schema for validation, etc.
  }}
/>
```

## Error Handling

The schema inference utility includes robust error handling to manage edge cases:

- Empty datasets return an empty schema
- Mixed-type fields include alternative type suggestions with confidence scores
- Partial field detection is handled gracefully
- Performance optimizations for large datasets with sampling

## Future Enhancements

Planned enhancements for the schema inference system:

1. Machine learning-based type detection for improved accuracy
2. Pattern detection for string fields (regex patterns)
3. Relationship detection between fields (foreign keys)
4. Schema versioning and change tracking
5. Integration with database schema generation tools