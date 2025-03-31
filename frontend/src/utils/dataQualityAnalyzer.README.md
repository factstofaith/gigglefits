# Data Quality Analyzer

This utility provides comprehensive data quality assessment capabilities for analyzing datasets against schemas or inferred patterns. It identifies data issues, calculates quality metrics across multiple dimensions, and provides actionable insights to improve data quality.

## Core Features

- **Multi-dimensional Quality Assessment**: Evaluates data across completeness, accuracy, consistency, validity, uniqueness, integrity, and conformity dimensions
- **Issue Detection**: Identifies various types of data issues including missing values, type mismatches, range violations, uniqueness violations, and more
- **Quality Scoring**: Calculates quality scores for each field and overall dataset with detailed statistics
- **Outlier Detection**: Identifies statistical outliers and anomalies in numeric data
- **Recommendations**: Provides actionable recommendations to improve data quality
- **Visual Indicators**: Includes components for visualizing quality metrics with intuitive grading system

## Usage

### Basic Usage

```jsx
import { analyzeDataQuality } from './utils/dataQualityAnalyzer';

// Sample data and schema
const data = [
  { id: 1, name: 'John', email: 'john@example.com', age: 25 },
  { id: 2, name: 'Jane', email: 'jane@example.com', age: 30 }
];

const schema = {
  fields: [
    { name: 'id', type: 'integer', required: true, isPrimaryKeyCandidate: true },
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'age', type: 'integer', required: false }
  ]
};

// Analyze data quality
const qualityResults = analyzeDataQuality(data, schema);

console.log('Overall quality score:', qualityResults.overallQuality);
console.log('Dimensions:', qualityResults.dimensions);
console.log('Field metrics:', qualityResults.fieldMetrics);
console.log('Issues:', qualityResults.issues);
```

### Configuration Options

The `analyzeDataQuality` function accepts several options to customize the analysis:

```jsx
const qualityResults = analyzeDataQuality(data, schema, {
  includeStatistics: true,       // Whether to include detailed statistics
  detectOutliers: true,          // Whether to detect statistical outliers
  validateReferences: false,     // Whether to validate referential integrity
  customRules: {                 // Custom validation rules
    ageRange: {
      validate: (record) => ({
        valid: record.age >= 18 && record.age <= 65,
        message: 'Age must be between 18 and 65'
      }),
      severity: 'medium',
      dimension: 'validity'
    }
  },
  sampleSize: 1000               // Number of records to sample (default: all)
});
```

### Quality Result Format

The analysis results include:

```js
{
  // Overall quality score (0-1)
  overallQuality: 0.92,
  
  // Scores by quality dimension
  dimensions: {
    completeness: 0.98,
    validity: 0.95,
    consistency: 0.96,
    uniqueness: 1.0,
    integrity: 1.0,
    conformity: 0.92,
    reliability: 0.94
  },
  
  // Detailed metrics for each field
  fieldMetrics: {
    id: {
      totalCount: 100,
      nullCount: 0,
      validCount: 100,
      invalidCount: 0,
      uniqueCount: 100,
      typeMatchCount: 100,
      completeness: 1.0,
      validity: 1.0,
      typeConsistency: 1.0,
      qualityScore: 1.0,
      // Additional field-specific statistics
    },
    // Other fields...
  },
  
  // Issue summary or list
  issues: [
    {
      type: 'pattern_violation',
      message: 'Field "email" in record 5 has invalid email format',
      field: 'email',
      recordIndex: 5,
      severity: 'medium',
      dimension: 'conformity'
    },
    // Other issues...
  ],
  
  // Record and schema information
  recordCount: 100,
  sampledRecordCount: 100,
  schemaFields: 4,
  analyzedAt: '2025-04-01T12:34:56.789Z'
}
```

### Generating a Human-Readable Report

To generate a human-readable report from the quality results:

```jsx
import { analyzeDataQuality, generateQualityReport } from './utils/dataQualityAnalyzer';

const qualityResults = analyzeDataQuality(data, schema);
const report = generateQualityReport(qualityResults);

console.log(report);
```

### Getting a Quality Grade

To get a letter grade (A-F) from a quality score:

```jsx
import { getQualityGrade } from './utils/dataQualityAnalyzer';

const grade = getQualityGrade(0.92); // Returns 'A-'
```

## Data Quality Dimensions

The analyzer evaluates data quality across multiple dimensions:

1. **Completeness**: Measures whether all required data is present
2. **Validity**: Measures whether values conform to defined rules and types
3. **Consistency**: Measures data consistency across records
4. **Uniqueness**: Measures uniqueness of values where expected (e.g., primary keys)
5. **Integrity**: Measures referential integrity between data entities
6. **Conformity**: Measures adherence to data standards and formats
7. **Reliability**: Overall quality score considering all dimensions

## Issue Types

The analyzer can detect the following types of issues:

- **Missing Required**: Required field is missing
- **Type Mismatch**: Field has wrong data type
- **Pattern Violation**: Field doesn't match expected pattern (e.g., email format)
- **Range Violation**: Numeric value outside allowed range
- **Uniqueness Violation**: Duplicate values in a unique field
- **Format Violation**: Doesn't conform to expected format
- **Consistency Issue**: Inconsistent values across records
- **Outlier**: Statistical outlier based on distribution
- **Empty Value**: Empty string where value is expected
- **Unexpected Null**: Null value where not allowed
- **Distribution Anomaly**: Unexpected distribution pattern
- **Reference Violation**: Invalid reference to another entity
- **Custom Rule Violation**: Violation of a custom validation rule

## Components

The quality analysis system includes two key components:

1. **DataQualityIndicator**: A visual component that displays quality metrics, issues, and recommendations
2. **Quality Analysis Utility**: Core functions for analyzing data quality

## Integration with DataPreview

The data quality analysis is fully integrated with the DataPreview component, providing a seamless user experience:

```jsx
<DataPreview
  data={data}
  schema={schema}
  showQualityIndicators={true}
  onQualityAnalyzed={(quality) => {
    console.log('Quality analysis results:', quality);
    // Use the quality results for feedback, reporting, etc.
  }}
/>
```

## Best Practices

1. **Schema First**: For best results, provide a schema (inferred or explicit) with type information
2. **Custom Rules**: Add custom validation rules for domain-specific requirements
3. **Sampling**: For very large datasets, use sampling to balance performance and accuracy
4. **Continuous Monitoring**: Re-analyze data quality periodically as your data evolves
5. **Actionable Feedback**: Focus on the recommendations to systematically improve data quality

## Error Handling

The quality analyzer includes robust error handling:

- Schema validation errors are caught and reported
- Missing or invalid data is handled gracefully
- Performance optimization for large datasets through sampling
- Custom rules execute in a try/catch to prevent analysis failure

## Future Enhancements

Planned enhancements for the data quality system:

1. Machine learning-based anomaly detection for complex patterns
2. Time-series quality tracking to detect data quality drift
3. Enhanced visualization with quality trend analysis
4. Domain-specific rule templates for common data types
5. Integration with data lineage tracking for impact analysis