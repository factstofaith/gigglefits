/**
 * Data Quality Analyzer Tests
 * 
 * Tests for the data quality analyzer utility functions
 */

import { 
  analyzeDataQuality, 
  QUALITY_DIMENSIONS, 
  ISSUE_TYPES,
  SEVERITY,
  getQualityGrade,
  generateQualityReport
} from '../dataQualityAnalyzer';

// Sample data for testing
const customerData = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', age: 32, isActive: true },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', age: 28, isActive: true },
  { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', age: 45, isActive: false },
  { id: 4, firstName: 'Alice', lastName: 'Williams', email: 'alice.williams@example.com', age: null, isActive: true }
];

const problemData = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', age: 32, isActive: true },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'invalid-email', age: 28, isActive: true },
  { id: 3, firstName: null, lastName: 'Johnson', email: 'bob.johnson@example.com', age: 45, isActive: false },
  { id: 4, firstName: 'Alice', lastName: 'Williams', email: 'alice.williams@example.com', age: 'thirty', isActive: true },
  { id: 1, firstName: 'Duplicate', lastName: 'ID', email: 'duplicate@example.com', age: 50, isActive: true }
];

const customerSchema = {
  fields: [
    { name: 'id', type: 'integer', required: true, isPrimaryKeyCandidate: true },
    { name: 'firstName', type: 'string', required: true },
    { name: 'lastName', type: 'string', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'age', type: 'integer', required: false },
    { name: 'isActive', type: 'boolean', required: true }
  ]
};

describe('Data Quality Analyzer', () => {
  describe('analyzeDataQuality', () => {
    test('should correctly analyze data quality for valid data', () => {
      const results = analyzeDataQuality(customerData, customerSchema);
      
      expect(results.overallQuality).toBeGreaterThan(0.9);
      expect(results.dimensions).toBeDefined();
      expect(results.fieldMetrics).toBeDefined();
      
      // Check completeness dimension
      expect(results.dimensions[QUALITY_DIMENSIONS.COMPLETENESS]).toBeGreaterThan(0.9);
      
      // Check field metrics for required field
      expect(results.fieldMetrics.firstName.completeness).toBe(1);
      
      // Should have no critical issues
      if (Array.isArray(results.issues)) {
        const criticalIssues = results.issues.filter(issue => 
          issue.severity === SEVERITY.CRITICAL);
        expect(criticalIssues.length).toBe(0);
      } else {
        expect(results.issues.bySeverity[SEVERITY.CRITICAL] || 0).toBe(0);
      }
    });

    test('should detect issues in problematic data', () => {
      const results = analyzeDataQuality(problemData, customerSchema);
      
      expect(results.overallQuality).toBeLessThan(0.9);
      
      // Check that issues were detected
      expect(results.issueCount).toBeGreaterThan(0);
      
      // Specifically check for the types of issues we know exist
      if (Array.isArray(results.issues)) {
        // Type mismatch for age field
        const typeIssues = results.issues.filter(issue => 
          issue.type === ISSUE_TYPES.TYPE_MISMATCH);
        expect(typeIssues.length).toBeGreaterThan(0);
        
        // Missing required field (firstName)
        const missingIssues = results.issues.filter(issue => 
          issue.type === ISSUE_TYPES.MISSING_REQUIRED);
        expect(missingIssues.length).toBeGreaterThan(0);
        
        // Email pattern violation
        const patternIssues = results.issues.filter(issue => 
          issue.type === ISSUE_TYPES.PATTERN_VIOLATION);
        expect(patternIssues.length).toBeGreaterThan(0);
      } else {
        // Check summarized issues
        expect(results.issues.byType[ISSUE_TYPES.TYPE_MISMATCH] || 0).toBeGreaterThan(0);
        expect(results.issues.byType[ISSUE_TYPES.MISSING_REQUIRED] || 0).toBeGreaterThan(0);
        expect(results.issues.byType[ISSUE_TYPES.PATTERN_VIOLATION] || 0).toBeGreaterThan(0);
      }
    });
    
    test('should handle empty data or schema correctly', () => {
      const emptyDataResults = analyzeDataQuality([], customerSchema);
      expect(emptyDataResults.overallQuality).toBe(0);
      
      const emptySchemaResults = analyzeDataQuality(customerData, { fields: [] });
      expect(emptySchemaResults.overallQuality).toBe(0);
    });
    
    test('should apply custom validation rules', () => {
      // Custom rule to check if age is between 18 and 65
      const customRules = {
        ageRange: {
          validate: (record) => ({
            valid: !record.age || (record.age >= 18 && record.age <= 65),
            message: 'Age must be between 18 and 65'
          }),
          severity: SEVERITY.MEDIUM,
          dimension: QUALITY_DIMENSIONS.VALIDITY
        }
      };
      
      const results = analyzeDataQuality(customerData, customerSchema, { 
        customRules,
        includeStatistics: true
      });
      
      // All customer ages are valid (between 18-65 or null), so shouldn't find issues
      if (Array.isArray(results.issues)) {
        const customRuleIssues = results.issues.filter(issue => 
          issue.type === ISSUE_TYPES.CUSTOM_RULE_VIOLATION);
        expect(customRuleIssues.length).toBe(0);
      } else {
        expect(results.issues.byType[ISSUE_TYPES.CUSTOM_RULE_VIOLATION] || 0).toBe(0);
      }
      
      // Add a customer with invalid age
      const dataWithInvalidAge = [
        ...customerData,
        { id: 5, firstName: 'Elderly', lastName: 'Person', email: 'elderly@example.com', age: 70, isActive: true }
      ];
      
      const resultsWithInvalidAge = analyzeDataQuality(dataWithInvalidAge, customerSchema, { 
        customRules,
        includeStatistics: true
      });
      
      // Should find a custom rule violation
      if (Array.isArray(resultsWithInvalidAge.issues)) {
        const customRuleIssues = resultsWithInvalidAge.issues.filter(issue => 
          issue.type === ISSUE_TYPES.CUSTOM_RULE_VIOLATION);
        expect(customRuleIssues.length).toBeGreaterThan(0);
      } else {
        expect(resultsWithInvalidAge.issues.byType[ISSUE_TYPES.CUSTOM_RULE_VIOLATION] || 0).toBeGreaterThan(0);
      }
    });
  });
  
  describe('getQualityGrade', () => {
    test('should return correct letter grades for different scores', () => {
      expect(getQualityGrade(1.0)).toBe('A+');
      expect(getQualityGrade(0.95)).toBe('A');
      expect(getQualityGrade(0.91)).toBe('A-');
      expect(getQualityGrade(0.85)).toBe('B');
      expect(getQualityGrade(0.75)).toBe('C');
      expect(getQualityGrade(0.65)).toBe('D');
      expect(getQualityGrade(0.55)).toBe('F');
    });
  });
  
  describe('generateQualityReport', () => {
    test('should generate a human-readable quality report', () => {
      const results = analyzeDataQuality(customerData, customerSchema);
      const report = generateQualityReport(results);
      
      expect(typeof report).toBe('string');
      expect(report).toContain('Data Quality Analysis Report');
      expect(report).toContain('Overall Quality Score');
      
      // Should include quality dimensions
      expect(report).toContain('Quality Dimensions');
      
      // Should include field quality summary
      expect(report).toContain('Field Quality Summary');
      
      // Should include issues summary
      expect(report).toContain('Issue Summary');
    });
    
    test('should handle empty results', () => {
      const report = generateQualityReport(null);
      expect(report).toContain('No quality analysis results available');
    });
  });
});