/**
 * Data Quality Analyzer
 * 
 * This utility provides comprehensive data quality assessment capabilities,
 * analyzing datasets against schemas or inferred patterns to identify issues,
 * calculate quality metrics, and provide actionable insights.
 */

/**
 * Quality issue types that can be detected during analysis
 * @type {Object}
 */
export const ISSUE_TYPES = {
  MISSING_REQUIRED: 'missing_required',
  TYPE_MISMATCH: 'type_mismatch',
  PATTERN_VIOLATION: 'pattern_violation',
  RANGE_VIOLATION: 'range_violation',
  UNIQUENESS_VIOLATION: 'uniqueness_violation',
  FORMAT_VIOLATION: 'format_violation', 
  CONSISTENCY_ISSUE: 'consistency_issue',
  OUTLIER: 'outlier',
  EMPTY_VALUE: 'empty_value',
  UNEXPECTED_NULL: 'unexpected_null',
  DISTRIBUTION_ANOMALY: 'distribution_anomaly',
  REFERENCE_VIOLATION: 'reference_violation',
  CUSTOM_RULE_VIOLATION: 'custom_rule_violation'
};

/**
 * Issue severity levels
 * @type {Object}
 */
export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high', 
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

/**
 * Quality dimensions measured during analysis
 * @type {Object}
 */
export const QUALITY_DIMENSIONS = {
  COMPLETENESS: 'completeness',     // Are all required values present?
  ACCURACY: 'accuracy',             // Are values accurate?
  CONSISTENCY: 'consistency',       // Are values consistent across records?
  VALIDITY: 'validity',             // Do values conform to defined rules?
  UNIQUENESS: 'uniqueness',         // Are unique values actually unique?
  INTEGRITY: 'integrity',           // Do references point to valid values?
  TIMELINESS: 'timeliness',         // Is data current/timely?
  CONFORMITY: 'conformity',         // Does data follow standards/formats?
  RELIABILITY: 'reliability'        // Overall reliability score
};

/**
 * Analyze data quality against a schema
 * 
 * @param {Array<Object>} data - Dataset to analyze
 * @param {Object} schema - Schema to validate against (can be inferred schema)
 * @param {Object} options - Configuration options
 * @param {boolean} options.includeStatistics - Whether to include detailed statistics
 * @param {boolean} options.detectOutliers - Whether to detect statistical outliers
 * @param {boolean} options.validateReferences - Whether to validate referential integrity
 * @param {Object} options.customRules - Custom validation rules
 * @param {number} options.sampleSize - Number of records to sample (default: all)
 * @returns {Object} Quality assessment results
 */
export const analyzeDataQuality = (data, schema, options = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return createEmptyQualityReport();
  }

  if (!schema || !schema.fields || schema.fields.length === 0) {
    return createEmptyQualityReport();
  }

  const {
    includeStatistics = true,
    detectOutliers = true,
    validateReferences = false,
    customRules = {},
    sampleSize = data.length
  } = options;

  // Sample data if needed
  const sampleData = sampleSize < data.length 
    ? data.slice(0, sampleSize) 
    : data;

  // Track issues found
  const issues = [];
  
  // Track field-level metrics
  const fieldMetrics = {};
  
  // Track overall metrics
  const overallMetrics = {
    [QUALITY_DIMENSIONS.COMPLETENESS]: 1,
    [QUALITY_DIMENSIONS.ACCURACY]: 1,
    [QUALITY_DIMENSIONS.CONSISTENCY]: 1,
    [QUALITY_DIMENSIONS.VALIDITY]: 1,
    [QUALITY_DIMENSIONS.UNIQUENESS]: 1,
    [QUALITY_DIMENSIONS.INTEGRITY]: 1,
    [QUALITY_DIMENSIONS.CONFORMITY]: 1,
    [QUALITY_DIMENSIONS.RELIABILITY]: 1
  };

  // Initialize field metrics
  schema.fields.forEach(field => {
    fieldMetrics[field.name] = {
      totalCount: sampleData.length,
      nullCount: 0,
      validCount: 0,
      invalidCount: 0,
      uniqueValues: new Set(),
      typeMatchCount: 0,
      patterns: {},
      min: null,
      max: null,
      sum: 0,
      mean: 0,
      stdDev: 0,
      validDistribution: {},
      issueTypes: {},
      qualityScore: 1  // Scale of 0-1, start at perfect
    };
  });

  // First pass: collect value distributions and basic stats
  sampleData.forEach((record, recordIndex) => {
    schema.fields.forEach(field => {
      const value = record[field.name];
      const metrics = fieldMetrics[field.name];
      
      // Track null/empty values
      if (value === null || value === undefined) {
        metrics.nullCount++;
      } else {
        // Track unique values
        metrics.uniqueValues.add(JSON.stringify(value));
        
        // Track type-specific metrics
        if (typeof value === 'number') {
          if (metrics.min === null || value < metrics.min) metrics.min = value;
          if (metrics.max === null || value > metrics.max) metrics.max = value;
          metrics.sum += value;
        }
      }
    });
  });

  // Calculate aggregate statistics for each field
  Object.keys(fieldMetrics).forEach(fieldName => {
    const metrics = fieldMetrics[fieldName];
    const nonNullCount = metrics.totalCount - metrics.nullCount;
    
    if (nonNullCount > 0 && metrics.sum !== 0) {
      metrics.mean = metrics.sum / nonNullCount;
    }
  });

  // Second pass: validate against schema and calculate deviations
  sampleData.forEach((record, recordIndex) => {
    schema.fields.forEach(field => {
      const value = record[field.name];
      const metrics = fieldMetrics[field.name];
      
      const issues = validateFieldValue(value, field, recordIndex, metrics);
      issues.forEach(issue => {
        trackIssue(metrics, issue.type);
        if (includeStatistics) {
          addIssue(issue);
        }
      });

      // Track type match counts
      if (issues.length === 0 && value !== null && value !== undefined) {
        metrics.typeMatchCount++;
        metrics.validCount++;
      } else if (value !== null && value !== undefined) {
        metrics.invalidCount++;
      }
      
      // Calculate variance for numeric fields
      if (typeof value === 'number') {
        const deviation = value - metrics.mean;
        metrics.stdDev += deviation * deviation;
      }
    });
    
    // Apply custom validation rules if provided
    if (customRules && Object.keys(customRules).length > 0) {
      applyCustomRules(record, recordIndex, customRules, issues);
    }
    
    // Validate referential integrity if requested
    if (validateReferences) {
      validateRecordReferences(record, recordIndex, issues, data);
    }
  });

  // Finalize statistics
  Object.keys(fieldMetrics).forEach(fieldName => {
    const metrics = fieldMetrics[fieldName];
    const nonNullCount = metrics.totalCount - metrics.nullCount;
    
    // Complete standard deviation calculation
    if (nonNullCount > 1) {
      metrics.stdDev = Math.sqrt(metrics.stdDev / nonNullCount);
    } else {
      metrics.stdDev = 0;
    }
    
    // Calculate uniqueness (cardinality)
    metrics.uniqueness = metrics.uniqueValues.size / Math.max(1, nonNullCount);
    metrics.uniqueCount = metrics.uniqueValues.size;
    
    // Calculate completeness (non-null ratio)
    metrics.completeness = nonNullCount / metrics.totalCount;
    
    // Calculate validity (valid values ratio)
    metrics.validity = metrics.validCount / Math.max(1, metrics.totalCount);
    
    // Calculate type consistency
    metrics.typeConsistency = metrics.typeMatchCount / Math.max(1, nonNullCount);
    
    // Calculate overall field quality score (weighted average of dimensions)
    metrics.qualityScore = calculateFieldQualityScore(metrics, fieldName, schema.fields.find(f => f.name === fieldName));
    
    // Clean up internal tracking
    delete metrics.uniqueValues;
  });

  // Calculate overall quality metrics
  calculateOverallQualityMetrics(fieldMetrics, overallMetrics, schema, issues);

  return {
    overallQuality: calculateOverallQualityScore(overallMetrics),
    dimensions: overallMetrics,
    fieldMetrics,
    issueCount: issues.length,
    issues: includeStatistics ? issues : summarizeIssues(issues),
    recordCount: data.length,
    sampledRecordCount: sampleData.length,
    schemaFields: schema.fields.length,
    analyzedAt: new Date().toISOString()
  };
};

/**
 * Create an empty quality report object
 * @returns {Object} Empty quality report
 */
function createEmptyQualityReport() {
  return {
    overallQuality: 0,
    dimensions: {},
    fieldMetrics: {},
    issueCount: 0,
    issues: [],
    recordCount: 0,
    sampledRecordCount: 0,
    schemaFields: 0,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Validate a field value against its schema definition
 * 
 * @param {any} value - Field value to validate
 * @param {Object} field - Field schema definition
 * @param {number} recordIndex - Index of the record
 * @param {Object} metrics - Field metrics object
 * @returns {Array} Array of issues found
 */
function validateFieldValue(value, field, recordIndex, metrics) {
  const issues = [];
  
  // Check for missing required values
  if (field.required && (value === null || value === undefined)) {
    issues.push({
      type: ISSUE_TYPES.MISSING_REQUIRED,
      message: `Missing required value for field "${field.name}" in record ${recordIndex}`,
      field: field.name,
      recordIndex,
      severity: SEVERITY.HIGH,
      dimension: QUALITY_DIMENSIONS.COMPLETENESS
    });
    return issues;
  }
  
  // Skip further validation if null/undefined (and not required)
  if (value === null || value === undefined) {
    return issues;
  }
  
  // Check type matches
  const actualType = Array.isArray(value) ? 'array' : typeof value;
  const expectedType = field.type;
  
  // Handle special cases
  let typeMatches = false;
  
  if (
    // Numeric types
    (expectedType === 'number' || expectedType === 'integer' || 
     expectedType === 'currency' || expectedType === 'percentage') &&
    (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value))))
  ) {
    typeMatches = true;
    if (expectedType === 'integer' && !Number.isInteger(Number(value))) {
      typeMatches = false;
    }
  }
  // String types
  else if (
    (expectedType === 'string' || expectedType === 'email' || 
     expectedType === 'url' || expectedType === 'date' || 
     expectedType === 'datetime' || expectedType === 'time' ||
     expectedType === 'phone_number' || expectedType === 'postal_code')
  ) {
    typeMatches = typeof value === 'string';
  }
  // Boolean
  else if (expectedType === 'boolean') {
    typeMatches = typeof value === 'boolean' || value === 'true' || value === 'false';
  }
  // Array
  else if (expectedType === 'array') {
    typeMatches = Array.isArray(value);
  }
  // Object
  else if (expectedType === 'object') {
    typeMatches = typeof value === 'object' && !Array.isArray(value) && value !== null;
  }
  // Default comparison
  else {
    typeMatches = actualType === expectedType;
  }
  
  if (!typeMatches) {
    issues.push({
      type: ISSUE_TYPES.TYPE_MISMATCH,
      message: `Field "${field.name}" in record ${recordIndex} has wrong type: expected "${expectedType}", got "${actualType}"`,
      field: field.name,
      recordIndex,
      expectedType,
      actualType,
      severity: SEVERITY.MEDIUM,
      dimension: QUALITY_DIMENSIONS.VALIDITY
    });
  }

  // Check pattern violations for specialized types
  if (typeMatches && typeof value === 'string') {
    // Email format check
    if (expectedType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      issues.push({
        type: ISSUE_TYPES.PATTERN_VIOLATION,
        message: `Field "${field.name}" in record ${recordIndex} has invalid email format: "${value}"`,
        field: field.name,
        recordIndex,
        severity: SEVERITY.MEDIUM,
        dimension: QUALITY_DIMENSIONS.CONFORMITY
      });
    }
    
    // URL format check
    if (expectedType === 'url' && !/^(https?:\/\/)?[\w.-]+(\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=]*$/.test(value)) {
      issues.push({
        type: ISSUE_TYPES.PATTERN_VIOLATION,
        message: `Field "${field.name}" in record ${recordIndex} has invalid URL format: "${value}"`,
        field: field.name,
        recordIndex,
        severity: SEVERITY.MEDIUM,
        dimension: QUALITY_DIMENSIONS.CONFORMITY
      });
    }
    
    // Date format check
    if (expectedType === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      issues.push({
        type: ISSUE_TYPES.PATTERN_VIOLATION,
        message: `Field "${field.name}" in record ${recordIndex} has invalid date format: "${value}"`,
        field: field.name,
        recordIndex,
        severity: SEVERITY.MEDIUM,
        dimension: QUALITY_DIMENSIONS.CONFORMITY
      });
    }
    
    // Phone format check
    if (expectedType === 'phone_number' && !/^(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}$/.test(value)) {
      issues.push({
        type: ISSUE_TYPES.PATTERN_VIOLATION,
        message: `Field "${field.name}" in record ${recordIndex} has invalid phone number format: "${value}"`,
        field: field.name,
        recordIndex,
        severity: SEVERITY.MEDIUM,
        dimension: QUALITY_DIMENSIONS.CONFORMITY
      });
    }
  }
  
  // Check range violations for numeric values
  if (typeMatches && (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value))))) {
    const numValue = Number(value);
    
    // Check min/max if specified in field schema
    if (field.statistics && field.statistics.min !== undefined && numValue < field.statistics.min) {
      issues.push({
        type: ISSUE_TYPES.RANGE_VIOLATION,
        message: `Field "${field.name}" in record ${recordIndex} is below minimum value: ${numValue} < ${field.statistics.min}`,
        field: field.name,
        recordIndex,
        severity: SEVERITY.MEDIUM,
        dimension: QUALITY_DIMENSIONS.VALIDITY
      });
    }
    
    if (field.statistics && field.statistics.max !== undefined && numValue > field.statistics.max) {
      issues.push({
        type: ISSUE_TYPES.RANGE_VIOLATION,
        message: `Field "${field.name}" in record ${recordIndex} is above maximum value: ${numValue} > ${field.statistics.max}`,
        field: field.name,
        recordIndex,
        severity: SEVERITY.MEDIUM,
        dimension: QUALITY_DIMENSIONS.VALIDITY
      });
    }
    
    // Check for outliers if we have distribution stats
    if (metrics.mean !== undefined && metrics.stdDev !== undefined && metrics.stdDev > 0) {
      const zScore = Math.abs((numValue - metrics.mean) / metrics.stdDev);
      // Z-score above 3 is considered an outlier (99.7% of data falls within 3 std devs)
      if (zScore > 3) {
        issues.push({
          type: ISSUE_TYPES.OUTLIER,
          message: `Field "${field.name}" in record ${recordIndex} is a statistical outlier: ${numValue} (z-score: ${zScore.toFixed(2)})`,
          field: field.name,
          recordIndex,
          severity: SEVERITY.LOW,
          dimension: QUALITY_DIMENSIONS.ACCURACY,
          zScore
        });
      }
    }
  }
  
  // Check for empty strings (if not explicitly allowed)
  if (typeof value === 'string' && value.trim() === '' && field.allowEmptyString !== true) {
    issues.push({
      type: ISSUE_TYPES.EMPTY_VALUE,
      message: `Field "${field.name}" in record ${recordIndex} is an empty string`,
      field: field.name,
      recordIndex,
      severity: SEVERITY.LOW,
      dimension: QUALITY_DIMENSIONS.COMPLETENESS
    });
  }
  
  return issues;
}

/**
 * Apply custom validation rules to a record
 * 
 * @param {Object} record - Data record to validate
 * @param {number} recordIndex - Index of the record
 * @param {Object} customRules - Custom validation rules
 * @param {Array} issues - Array to add issues to
 */
function applyCustomRules(record, recordIndex, customRules, issues) {
  Object.entries(customRules).forEach(([ruleName, rule]) => {
    try {
      const result = rule.validate(record);
      if (!result.valid) {
        issues.push({
          type: ISSUE_TYPES.CUSTOM_RULE_VIOLATION,
          message: `Record ${recordIndex} violated custom rule "${ruleName}": ${result.message}`,
          recordIndex,
          ruleName,
          customMessage: result.message,
          severity: rule.severity || SEVERITY.MEDIUM,
          dimension: rule.dimension || QUALITY_DIMENSIONS.VALIDITY
        });
      }
    } catch (error) {
      console.error(`Error applying custom rule ${ruleName}:`, error);
    }
  });
}

/**
 * Validate referential integrity within a record
 * 
 * @param {Object} record - Data record to validate
 * @param {number} recordIndex - Index of the record
 * @param {Array} issues - Array to add issues to
 * @param {Array} data - Complete dataset for reference lookups
 */
function validateRecordReferences(record, recordIndex, issues, data) {
  // This is a simplified reference validation for demonstration
  // In a real implementation, this would check foreign key references
  // based on defined relationships in the schema
  
  // Example: Check if a 'parentId' exists in the collection
  if (record.parentId !== undefined && record.parentId !== null) {
    const parentExists = data.some(item => item.id === record.parentId);
    if (!parentExists) {
      issues.push({
        type: ISSUE_TYPES.REFERENCE_VIOLATION,
        message: `Record ${recordIndex} references non-existent parent ID: ${record.parentId}`,
        recordIndex,
        field: 'parentId',
        referencedValue: record.parentId,
        severity: SEVERITY.HIGH,
        dimension: QUALITY_DIMENSIONS.INTEGRITY
      });
    }
  }
}

/**
 * Track an issue type in field metrics
 * 
 * @param {Object} metrics - Field metrics object
 * @param {string} issueType - Type of issue to track
 */
function trackIssue(metrics, issueType) {
  if (!metrics.issueTypes[issueType]) {
    metrics.issueTypes[issueType] = 0;
  }
  metrics.issueTypes[issueType]++;
}

/**
 * Add an issue to the issues list
 * 
 * @param {Object} issue - Issue object to add
 */
function addIssue(issues, issue) {
  issues.push(issue);
}

/**
 * Calculate a field's quality score
 * 
 * @param {Object} metrics - Field metrics
 * @param {string} fieldName - Field name
 * @param {Object} fieldSchema - Field schema
 * @returns {number} Quality score (0-1)
 */
function calculateFieldQualityScore(metrics, fieldName, fieldSchema) {
  // Weight factors for different quality dimensions
  const weights = {
    completeness: fieldSchema.required ? 0.3 : 0.1,
    validity: 0.3,
    consistency: 0.2,
    outliers: 0.1,
    uniqueness: fieldSchema.isPrimaryKeyCandidate ? 0.3 : 0.1
  };
  
  // Calculate dimension scores
  const completenessScore = metrics.completeness;
  const validityScore = metrics.validity;
  const consistencyScore = metrics.typeConsistency || 1;
  
  // Calculate outlier score
  let outlierScore = 1;
  if (metrics.issueTypes[ISSUE_TYPES.OUTLIER]) {
    const outlierRatio = metrics.issueTypes[ISSUE_TYPES.OUTLIER] / metrics.totalCount;
    outlierScore = 1 - outlierRatio;
  }
  
  // Calculate uniqueness score
  let uniquenessScore = 1;
  if (fieldSchema.isPrimaryKeyCandidate) {
    uniquenessScore = metrics.uniqueCount / metrics.totalCount;
  }
  
  // Calculate weighted score
  const weightSum = weights.completeness + weights.validity + weights.consistency + weights.outliers + weights.uniqueness;
  const weightedScore = (
    weights.completeness * completenessScore +
    weights.validity * validityScore +
    weights.consistency * consistencyScore +
    weights.outliers * outlierScore +
    weights.uniqueness * uniquenessScore
  ) / weightSum;
  
  return Math.max(0, Math.min(1, weightedScore));
}

/**
 * Calculate overall quality metrics across all fields
 * 
 * @param {Object} fieldMetrics - Field metrics
 * @param {Object} overallMetrics - Overall metrics object to update
 * @param {Object} schema - Schema definition
 * @param {Array} issues - List of all issues
 */
function calculateOverallQualityMetrics(fieldMetrics, overallMetrics, schema, issues) {
  // Get required fields
  const requiredFields = schema.fields.filter(f => f.required).map(f => f.name);
  
  // Calculate completeness (required fields present)
  let completenessScore = 1;
  if (requiredFields.length > 0) {
    const requiredFieldsCompleteness = requiredFields.map(fieldName => fieldMetrics[fieldName].completeness);
    completenessScore = requiredFieldsCompleteness.reduce((sum, score) => sum + score, 0) / requiredFields.length;
  }
  
  // Calculate validity (type and format correctness)
  const validityScores = Object.values(fieldMetrics).map(metrics => metrics.validity);
  const validityScore = validityScores.reduce((sum, score) => sum + score, 0) / validityScores.length;
  
  // Calculate consistency (field type consistency)
  const consistencyScores = Object.values(fieldMetrics).map(metrics => metrics.typeConsistency || 1);
  const consistencyScore = consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
  
  // Calculate uniqueness score
  const uniqueFieldCandidates = schema.fields.filter(f => f.isPrimaryKeyCandidate).map(f => f.name);
  let uniquenessScore = 1;
  if (uniqueFieldCandidates.length > 0) {
    const uniquenessScores = uniqueFieldCandidates.map(fieldName => fieldMetrics[fieldName].uniqueness || 1);
    uniquenessScore = uniquenessScores.reduce((sum, score) => sum + score, 0) / uniqueFieldCandidates.length;
  }
  
  // Count reference violations for integrity
  const referenceViolations = issues.filter(issue => issue.type === ISSUE_TYPES.REFERENCE_VIOLATION).length;
  const totalRecords = Object.values(fieldMetrics)[0]?.totalCount || 0;
  const integrityScore = totalRecords > 0 ? Math.max(0, 1 - (referenceViolations / totalRecords)) : 1;
  
  // Calculate conformity (format adherence)
  const patternViolations = issues.filter(issue => issue.type === ISSUE_TYPES.PATTERN_VIOLATION).length;
  const conformityScore = totalRecords > 0 ? Math.max(0, 1 - (patternViolations / totalRecords)) : 1;
  
  // Update overall metrics
  overallMetrics[QUALITY_DIMENSIONS.COMPLETENESS] = completenessScore;
  overallMetrics[QUALITY_DIMENSIONS.VALIDITY] = validityScore;
  overallMetrics[QUALITY_DIMENSIONS.CONSISTENCY] = consistencyScore;
  overallMetrics[QUALITY_DIMENSIONS.UNIQUENESS] = uniquenessScore;
  overallMetrics[QUALITY_DIMENSIONS.INTEGRITY] = integrityScore;
  overallMetrics[QUALITY_DIMENSIONS.CONFORMITY] = conformityScore;
  
  // Calculate overall reliability as weighted average
  overallMetrics[QUALITY_DIMENSIONS.RELIABILITY] = calculateOverallQualityScore(overallMetrics);
}

/**
 * Calculate overall quality score
 * 
 * @param {Object} metrics - Quality metrics by dimension
 * @returns {number} Overall quality score (0-1)
 */
function calculateOverallQualityScore(metrics) {
  // Weighted importance of each dimension
  const weights = {
    [QUALITY_DIMENSIONS.COMPLETENESS]: 0.25,
    [QUALITY_DIMENSIONS.VALIDITY]: 0.25,
    [QUALITY_DIMENSIONS.CONSISTENCY]: 0.15,
    [QUALITY_DIMENSIONS.UNIQUENESS]: 0.10,
    [QUALITY_DIMENSIONS.INTEGRITY]: 0.15,
    [QUALITY_DIMENSIONS.CONFORMITY]: 0.10
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  Object.entries(weights).forEach(([dimension, weight]) => {
    if (metrics[dimension] !== undefined) {
      weightedSum += metrics[dimension] * weight;
      totalWeight += weight;
    }
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Summarize issues by type and severity
 * 
 * @param {Array} issues - List of all issues
 * @returns {Object} Summarized issues
 */
function summarizeIssues(issues) {
  const summary = {
    byType: {},
    bySeverity: {},
    byField: {},
    totalCount: issues.length
  };
  
  issues.forEach(issue => {
    // Count by type
    if (!summary.byType[issue.type]) {
      summary.byType[issue.type] = 0;
    }
    summary.byType[issue.type]++;
    
    // Count by severity
    if (!summary.bySeverity[issue.severity]) {
      summary.bySeverity[issue.severity] = 0;
    }
    summary.bySeverity[issue.severity]++;
    
    // Count by field
    if (issue.field) {
      if (!summary.byField[issue.field]) {
        summary.byField[issue.field] = 0;
      }
      summary.byField[issue.field]++;
    }
  });
  
  return summary;
}

/**
 * Generate a human-readable data quality report
 * 
 * @param {Object} qualityResults - Results from analyzeDataQuality
 * @returns {string} Human-readable report
 */
export const generateQualityReport = (qualityResults) => {
  if (!qualityResults) {
    return 'No quality analysis results available';
  }

  const { 
    overallQuality, 
    dimensions, 
    fieldMetrics, 
    issueCount,
    issues,
    recordCount,
    sampledRecordCount
  } = qualityResults;

  // Format a score as a percentage
  const formatScore = (score) => `${(score * 100).toFixed(1)}%`;

  let report = `# Data Quality Analysis Report\n\n`;
  report += `Analysis Date: ${new Date(qualityResults.analyzedAt).toLocaleString()}\n`;
  report += `Records Analyzed: ${sampledRecordCount} of ${recordCount}\n\n`;
  
  // Overall quality
  report += `## Overall Quality Score: ${formatScore(overallQuality)}\n\n`;
  
  // Quality dimensions
  report += `### Quality Dimensions\n\n`;
  report += `| Dimension | Score |\n|-----------|-------|\n`;
  Object.entries(dimensions).forEach(([dimension, score]) => {
    report += `| ${dimension} | ${formatScore(score)} |\n`;
  });
  
  // Field quality summary
  report += `\n### Field Quality Summary\n\n`;
  report += `| Field | Quality Score | Issues | Completeness | Validity |\n|-------|--------------|--------|--------------|----------|\n`;
  
  Object.entries(fieldMetrics).forEach(([fieldName, metrics]) => {
    const issueCount = Object.values(metrics.issueTypes || {}).reduce((sum, count) => sum + count, 0);
    report += `| ${fieldName} | ${formatScore(metrics.qualityScore)} | ${issueCount} | ${formatScore(metrics.completeness)} | ${formatScore(metrics.validity)} |\n`;
  });
  
  // Issue summary
  report += `\n### Issue Summary\n\n`;
  report += `Total Issues Found: ${issueCount}\n\n`;
  
  if (typeof issues === 'object' && !Array.isArray(issues)) {
    // Summarized issues
    if (issues.byType) {
      report += `#### Issues by Type\n\n`;
      Object.entries(issues.byType).forEach(([type, count]) => {
        report += `- ${type}: ${count}\n`;
      });
    }
    
    if (issues.bySeverity) {
      report += `\n#### Issues by Severity\n\n`;
      Object.entries(issues.bySeverity).forEach(([severity, count]) => {
        report += `- ${severity}: ${count}\n`;
      });
    }
    
    if (issues.byField) {
      report += `\n#### Issues by Field\n\n`;
      Object.entries(issues.byField).forEach(([field, count]) => {
        report += `- ${field}: ${count}\n`;
      });
    }
  } else if (Array.isArray(issues) && issues.length > 0) {
    // Detailed issues (limited to first 10)
    report += `#### Top Issues (First 10)\n\n`;
    issues.slice(0, 10).forEach(issue => {
      report += `- **${issue.severity}**: ${issue.message}\n`;
    });
    
    if (issues.length > 10) {
      report += `\n*...and ${issues.length - 10} more issues*\n`;
    }
  }
  
  // Recommendations
  report += `\n## Recommendations\n\n`;
  
  // Completeness recommendations
  if (dimensions[QUALITY_DIMENSIONS.COMPLETENESS] < 0.95) {
    report += `### Improve Data Completeness\n\n`;
    report += `- Ensure all required fields are populated\n`;
    report += `- Consider adding validation to prevent missing values\n`;
    
    // Identify fields with low completeness
    const lowCompletenessFields = Object.entries(fieldMetrics)
      .filter(([_, metrics]) => metrics.completeness < 0.9)
      .map(([fieldName, _]) => fieldName);
    
    if (lowCompletenessFields.length > 0) {
      report += `- Fields with low completeness: ${lowCompletenessFields.join(', ')}\n`;
    }
  }
  
  // Validity recommendations
  if (dimensions[QUALITY_DIMENSIONS.VALIDITY] < 0.95) {
    report += `\n### Improve Data Validity\n\n`;
    report += `- Ensure values match their expected types\n`;
    report += `- Implement validation for specialized formats (emails, dates, etc.)\n`;
    
    // Identify fields with low validity
    const lowValidityFields = Object.entries(fieldMetrics)
      .filter(([_, metrics]) => metrics.validity < 0.9)
      .map(([fieldName, _]) => fieldName);
    
    if (lowValidityFields.length > 0) {
      report += `- Fields with low validity: ${lowValidityFields.join(', ')}\n`;
    }
  }
  
  // Add other dimension-specific recommendations
  
  return report;
};

/**
 * Get a quality grade (A-F) from a numeric score (0-1)
 * 
 * @param {number} score - Quality score (0-1)
 * @returns {string} Letter grade (A-F)
 */
export const getQualityGrade = (score) => {
  if (score >= 0.97) return 'A+';
  if (score >= 0.93) return 'A';
  if (score >= 0.90) return 'A-';
  if (score >= 0.87) return 'B+';
  if (score >= 0.83) return 'B';
  if (score >= 0.80) return 'B-';
  if (score >= 0.77) return 'C+';
  if (score >= 0.73) return 'C';
  if (score >= 0.70) return 'C-';
  if (score >= 0.67) return 'D+';
  if (score >= 0.63) return 'D';
  if (score >= 0.60) return 'D-';
  return 'F';
};