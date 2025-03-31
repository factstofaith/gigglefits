/**
 * Schema Inference Tests
 * 
 * Tests for the schema inference utility functions
 */

import { 
  inferSchema, 
  DATA_TYPES, 
  CONFIDENCE_THRESHOLD,
  convertToSchemaDefinition,
  getSchemaDescription
} from '../schemaInference';

// Sample data for testing
const customerData = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', age: 32, isActive: true },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', age: 28, isActive: true },
  { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', age: 45, isActive: false }
];

const mixedTypeData = [
  { id: 1, value: 'text' },
  { id: 2, value: 123 },
  { id: 3, value: true }
];

const dateData = [
  { id: 1, created: '2023-05-10', updated: '2023-05-10T10:30:00Z' },
  { id: 2, created: '2023-06-15', updated: '2023-06-15T14:45:30Z' }
];

describe('Schema Inference', () => {
  describe('inferSchema', () => {
    test('should correctly infer schema from basic data', () => {
      const schema = inferSchema(customerData);
      
      expect(schema.fields).toBeDefined();
      expect(schema.fields.length).toBe(5);
      
      // Check field types
      const idField = schema.fields.find(f => f.name === 'id');
      const firstNameField = schema.fields.find(f => f.name === 'firstName');
      const isActiveField = schema.fields.find(f => f.name === 'isActive');
      
      expect(idField.type).toBe(DATA_TYPES.INTEGER);
      expect(firstNameField.type).toBe(DATA_TYPES.STRING);
      expect(isActiveField.type).toBe(DATA_TYPES.BOOLEAN);
    });

    test('should detect special types when enabled', () => {
      const schema = inferSchema(customerData, { detectSpecialTypes: true });
      
      const emailField = schema.fields.find(f => f.name === 'email');
      expect(emailField.type).toBe(DATA_TYPES.EMAIL);
    });

    test('should not detect special types when disabled', () => {
      const schema = inferSchema(customerData, { detectSpecialTypes: false });
      
      const emailField = schema.fields.find(f => f.name === 'email');
      expect(emailField.type).toBe(DATA_TYPES.STRING);
    });

    test('should identify primary key candidates', () => {
      const schema = inferSchema(customerData);
      
      const idField = schema.fields.find(f => f.name === 'id');
      expect(idField.isPrimaryKeyCandidate).toBe(true);
    });

    test('should calculate appropriate confidence levels', () => {
      const schema = inferSchema(mixedTypeData);
      
      const valueField = schema.fields.find(f => f.name === 'value');
      // Should have lower confidence due to mixed types
      expect(valueField.confidence).toBeLessThan(CONFIDENCE_THRESHOLD.HIGH);
      // Should include alternative types
      expect(valueField.alternativeTypes.length).toBeGreaterThan(0);
    });

    test('should detect date and datetime types', () => {
      const schema = inferSchema(dateData, { detectSpecialTypes: true });
      
      const createdField = schema.fields.find(f => f.name === 'created');
      const updatedField = schema.fields.find(f => f.name === 'updated');
      
      expect(createdField.type).toBe(DATA_TYPES.DATE);
      expect(updatedField.type).toBe(DATA_TYPES.DATETIME);
    });

    test('should handle empty data', () => {
      const schema = inferSchema([]);
      expect(schema.fields).toEqual([]);
    });

    test('should include statistics when enabled', () => {
      const schema = inferSchema(customerData, { includeStatistics: true });
      
      const ageField = schema.fields.find(f => f.name === 'age');
      expect(ageField.statistics).toBeDefined();
      expect(ageField.statistics.min).toBe(28);
      expect(ageField.statistics.max).toBe(45);
    });

    test('should not include statistics when disabled', () => {
      const schema = inferSchema(customerData, { includeStatistics: false });
      
      const ageField = schema.fields.find(f => f.name === 'age');
      expect(ageField.statistics).toBeUndefined();
    });
  });

  describe('convertToSchemaDefinition', () => {
    test('should convert inferred schema to JSON Schema format', () => {
      const inferredSchema = inferSchema(customerData);
      const jsonSchema = convertToSchemaDefinition(inferredSchema);
      
      expect(jsonSchema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(jsonSchema.type).toBe('object');
      expect(jsonSchema.properties).toBeDefined();
      
      // Check property types
      expect(jsonSchema.properties.id.type).toBe('integer');
      expect(jsonSchema.properties.firstName.type).toBe('string');
      expect(jsonSchema.properties.isActive.type).toBe('boolean');
    });

    test('should handle empty schema', () => {
      const jsonSchema = convertToSchemaDefinition({ fields: [] });
      expect(jsonSchema.properties).toEqual({});
    });

    test('should include required fields', () => {
      const inferredSchema = {
        fields: [
          { name: 'id', type: DATA_TYPES.INTEGER, required: true },
          { name: 'name', type: DATA_TYPES.STRING, required: false }
        ]
      };
      
      const jsonSchema = convertToSchemaDefinition(inferredSchema);
      expect(jsonSchema.required).toContain('id');
      expect(jsonSchema.required).not.toContain('name');
    });
  });

  describe('getSchemaDescription', () => {
    test('should generate human-readable description of schema', () => {
      const inferredSchema = inferSchema(customerData);
      const description = getSchemaDescription(inferredSchema);
      
      expect(description).toContain('Schema inferred');
      expect(description).toContain('id');
      expect(description).toContain('firstName');
    });

    test('should handle empty schema', () => {
      const description = getSchemaDescription({ fields: [] });
      expect(description).toContain('No schema available');
    });
  });
});